/**
 * Genera iconos PNG mínimos para la PWA usando solo APIs nativas de Node.
 * Color de fondo: teal-700 (#0f766e), letra "L" blanca centrada.
 * Ejecutar: node scripts/gen-icons.mjs
 */
import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { createDeflate } from "node:zlib";
import { promisify } from "node:util";
import { pipeline } from "node:stream";

const pipelineAsync = promisify(pipeline);

/** CRC-32 para chunks PNG */
function crc32(buf) {
  const table = crc32.table ??= (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c;
    }
    return t;
  })();
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function uint32BE(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n);
  return b;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, "ascii");
  const len = uint32BE(data.length);
  const crc = uint32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([len, typeBytes, data, crc]);
}

async function deflateRaw(data) {
  const { deflateRaw } = await import("node:zlib");
  return new Promise((res, rej) =>
    deflateRaw(data, { level: 6 }, (e, b) => (e ? rej(e) : res(b)))
  );
}

async function generatePNG(size) {
  // Color de fondo: #0f766e (teal-700)
  const BG = [0x0f, 0x76, 0x6e];
  // Dibuja un cuadrado simple con las letras "L" en blanco simplificado
  // RGBA por pixel
  const pixels = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // Fondo teal
      pixels[i]     = BG[0];
      pixels[i + 1] = BG[1];
      pixels[i + 2] = BG[2];
      pixels[i + 3] = 255;

      // Dibujar "L" blanca centrada (escala relativa al tamaño)
      const s = size / 192; // escala
      const cx = size / 2;
      const cy = size / 2;
      const strokeW = Math.max(1, Math.round(20 * s));
      const armLen  = Math.round(70 * s);
      const legLen  = Math.round(55 * s);

      // Trazo vertical de la L
      const vx0 = Math.round(cx - strokeW / 2);
      const vx1 = Math.round(cx - strokeW / 2) + strokeW;
      const vy0 = Math.round(cy - armLen);
      const vy1 = Math.round(cy + legLen / 2);

      // Trazo horizontal de la L
      const hx0 = vx0;
      const hx1 = Math.round(cx + legLen);
      const hy0 = Math.round(cy + legLen / 2) - strokeW;
      const hy1 = Math.round(cy + legLen / 2);

      const inV = x >= vx0 && x < vx1 && y >= vy0 && y < vy1;
      const inH = x >= hx0 && x < hx1 && y >= hy0 && y < hy1;

      if (inV || inH) {
        pixels[i]     = 255;
        pixels[i + 1] = 255;
        pixels[i + 2] = 255;
        pixels[i + 3] = 255;
      }
    }
  }

  // PNG: signature + IHDR + IDAT + IEND
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.concat([
    uint32BE(size), uint32BE(size),
    Buffer.from([8, 2, 0, 0, 0]), // bit depth 8, color type RGB=2
  ]);

  // Image data: filter byte 0 (None) + RGB per row (no alpha in IHDR type 2)
  const rows = [];
  for (let y = 0; y < size; y++) {
    rows.push(0); // filter type None
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      rows.push(pixels[i], pixels[i + 1], pixels[i + 2]);
    }
  }

  const rawData = Buffer.from(rows);
  const compressed = await deflateRaw(rawData);

  // Wrap in zlib framing (deflate → zlib: add 2-byte header + adler32 checksum)
  const cmf = 0x78; // deflate, window 32k
  const flg = 0x9c & 0xff; // check bits so (cmf*256+flg) % 31 == 0
  // Compute adler32
  let s1 = 1, s2 = 0;
  for (const b of rawData) { s1 = (s1 + b) % 65521; s2 = (s2 + s1) % 65521; }
  const adler = Buffer.alloc(4);
  adler.writeUInt32BE((s2 << 16) | s1);
  const zlib = Buffer.concat([Buffer.from([cmf, flg]), compressed, adler]);

  const idat = zlib;
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", iend),
  ]);
}

const outDir = new URL("../apps/frontend-astro/public/icons/", import.meta.url).pathname
  .replace(/^\/([A-Za-z]:)/, "$1"); // fix Windows path

mkdirSync(outDir, { recursive: true });

for (const size of [192, 512]) {
  const png = await generatePNG(size);
  writeFileSync(`${outDir}icon-${size}.png`, png);
  console.log(`✓ icon-${size}.png (${png.length} bytes)`);
}

console.log("Iconos generados en public/icons/");
