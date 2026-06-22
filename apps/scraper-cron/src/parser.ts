/**
 * Extractor semántico de sorteos de Loto Honduras.
 *
 * Soporta dos formatos de entrada (el sitio real determinará cuál se usa):
 *  1. JSON con un array de sorteos (preferido si la fuente expone API/JSON).
 *  2. HTML: extrae bloques de sorteo por regex como fallback.
 *
 * Mapea el nombre del juego de la fuente a nuestro enum GameType.
 */
import type { GameType } from "@loto/shared-types";

export interface ParsedDraw {
  game: GameType;
  drawNumber: number;
  winningNumbers: number[];
  drawTimestamp: string; // ISO 8601
}

const GAME_ALIASES: Record<string, GameType> = {
  diaria: "diaria",
  "la diaria": "diaria",
  pega3: "pega3",
  "pega 3": "pega3",
  premia2: "premia2",
  "premia 2": "premia2",
  "super premio": "super_premio",
  super_premio: "super_premio",
};

export function normalizeGame(raw: string): GameType | null {
  return GAME_ALIASES[raw.trim().toLowerCase()] ?? null;
}

interface RawJsonDraw {
  game?: string;
  juego?: string;
  drawNumber?: number;
  numeroSorteo?: number;
  winningNumbers?: number[];
  numeros?: number[];
  drawTimestamp?: string;
  fecha?: string;
}

/** Intenta parsear como JSON; si no es JSON válido, cae a HTML. */
export function parseDraws(raw: string): ParsedDraw[] {
  const trimmed = raw.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      return parseJson(trimmed);
    } catch {
      // cae al parser HTML
    }
  }
  return parseHtml(trimmed);
}

function parseJson(json: string): ParsedDraw[] {
  const data = JSON.parse(json) as RawJsonDraw[] | { draws?: RawJsonDraw[] };
  const list = Array.isArray(data) ? data : (data.draws ?? []);
  const out: ParsedDraw[] = [];
  for (const d of list) {
    const game = normalizeGame(d.game ?? d.juego ?? "");
    const drawNumber = d.drawNumber ?? d.numeroSorteo;
    const winningNumbers = d.winningNumbers ?? d.numeros;
    const ts = d.drawTimestamp ?? d.fecha;
    if (game && drawNumber != null && winningNumbers?.length && ts) {
      out.push({
        game,
        drawNumber: Number(drawNumber),
        winningNumbers: winningNumbers.map(Number),
        drawTimestamp: new Date(ts).toISOString(),
      });
    }
  }
  return out;
}

/**
 * Fallback HTML. Espera bloques con atributos data-* (formato a ajustar
 * cuando se conozca el markup real del sitio):
 *   <div data-game="diaria" data-draw="10234" data-date="2026-06-20T21:00:00Z"
 *        data-numbers="24"></div>
 */
function parseHtml(html: string): ParsedDraw[] {
  const out: ParsedDraw[] = [];
  const blockRe =
    /data-game="([^"]+)"[^>]*data-draw="(\d+)"[^>]*data-date="([^"]+)"[^>]*data-numbers="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(html)) !== null) {
    const game = normalizeGame(m[1]!);
    if (!game) continue;
    out.push({
      game,
      drawNumber: Number(m[2]),
      drawTimestamp: new Date(m[3]!).toISOString(),
      winningNumbers: m[4]!.split(/[,\s]+/).filter(Boolean).map(Number),
    });
  }
  return out;
}
