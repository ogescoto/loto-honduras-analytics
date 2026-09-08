/**
 * Importador del histórico real extraído (Data/raw/*.json) → lottery_history.
 *
 * Lógica pura de lectura/parseo (sin acoplar a la BD). El discriminador del
 * juego es `siteGameId` (fiable); el "horario" del JSON crudo no lo es.
 * Reutiliza el mismo mapa de IDs que el parser de ingestión (apps/scraper-cron).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { GameType } from "@loto/shared-types";

/** Mapa siteGameId → GameType (confirmado en Data/raw/_summary.json). */
export const SITE_GAME_IDS: Record<string, GameType> = {
  "693ae5bbd7b13e9daed23b31": "diaria_11am",
  "693ae5bbd7b13e9daed23b07": "diaria_3pm",
  "693ae5bbd7b13e9daed23b1f": "diaria_9pm",
  "693ae5bbd7b13e9daed23b37": "pega3_11am",
  "693ae5bbd7b13e9daed23b0d": "pega3_3pm",
  "693ae5bbd7b13e9daed23b13": "pega3_9pm",
  "693ae5bbd7b13e9daed23b3d": "premia2_11am",
  "693ae5bbd7b13e9daed23b25": "premia2_3pm",
  "693ae5bbd7b13e9daed23b2b": "premia2_9pm",
  "693ae5bbd7b13e9daed23b4c": "juga3_11am",
  "693ae5bbd7b13e9daed23b52": "juga3_3pm",
  "693ae5bbd7b13e9daed23b58": "juga3_9pm",
  "693ae5bbd7b13e9daed23b19": "super_premio",
};

export interface RawDraw {
  game: GameType;
  sessionId: string;
  numbers: string[];
  signs: string[];
  drawDate: Date;
}

interface RawRecord {
  siteGameId?: string;
  fecha?: string;
  numeros?: string[];
  signos?: string[];
  sessionId?: string;
}

/** Directorio de datos crudos. Configurable por env; default a la raíz del repo. */
export function rawDataDir(): string {
  // El seed corre desde apps/backend-hono → la raíz del repo está dos niveles arriba.
  return process.env.RAW_DATA_DIR ?? join(process.cwd(), "..", "..", "Data", "raw");
}

/** Parsea un array de registros crudos a RawDraw[], descartando inválidos. */
export function parseRawRecords(records: RawRecord[]): RawDraw[] {
  const out: RawDraw[] = [];
  for (const r of records) {
    const game = r.siteGameId ? SITE_GAME_IDS[r.siteGameId] : undefined;
    if (!game || !r.sessionId || !r.fecha || !r.numeros?.length) continue;
    out.push({
      game,
      sessionId: r.sessionId,
      numbers: r.numeros.map(String),
      signs: (r.signos ?? []).map(String),
      drawDate: new Date(r.fecha),
    });
  }
  return out;
}

/**
 * Lee todos los Data/raw/*.json (excepto _summary.json) y devuelve los sorteos
 * parseados. Deduplica por sessionId (por si un sorteo aparece en >1 archivo).
 */
export function loadHistoricalDraws(dir: string = rawDataDir()): RawDraw[] {
  const files = readdirSync(dir).filter(
    (f) => f.endsWith(".json") && f !== "_summary.json",
  );
  const bySession = new Map<string, RawDraw>();
  for (const file of files) {
    const raw = readFileSync(join(dir, file), "utf8");
    const records = JSON.parse(raw) as RawRecord[];
    for (const draw of parseRawRecords(records)) {
      bySession.set(draw.sessionId, draw);
    }
  }
  return [...bySession.values()];
}
