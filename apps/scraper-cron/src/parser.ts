/**
 * Parser de ingestión compartido (lógica pura, reutilizable).
 *
 * Una sola fuente de verdad para: (a) el job de GitHub Actions, (b) el Worker
 * de respaldo, (c) el importador del histórico (seed). Mapea tanto el JSON
 * crudo extraído (Data/raw) como la respuesta en vivo de la API
 * (/feed/game-stats) al modelo `ParsedDraw`.
 *
 * Hechos verificados sobre la fuente (loteriasdehonduras.com):
 *  - El discriminador FIABLE del juego es `siteGameId`; el campo "horario" del
 *    JSON crudo es poco fiable (a veces dice "11:00 AM" en archivos de 3PM/9PM).
 *  - Los números son TEXTO: "00", comodines "JG"/"2X" y signos del imaginario
 *    popular ("00 Avión"). No son enteros.
 */
import type { GameType } from "@loto/shared-types";

export interface ParsedDraw {
  game: GameType;
  sessionId: string;
  numbers: string[];
  signs: string[];
  drawDate: string; // ISO 8601
}

/**
 * Mapa siteGameId → GameType. IDs confirmados en Data/raw/_summary.json.
 * Es la clave de identidad del juego (familia + horario).
 */
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

/** Resuelve el GameType a partir del siteGameId. */
export function gameFromSiteId(siteGameId: string): GameType | null {
  return SITE_GAME_IDS[siteGameId] ?? null;
}

/**
 * Respaldo: deriva el GameType de "título"+"horario" cuando no hay siteGameId.
 * El título de la API tiene forma "La Diaria 3:00 PM" / "Super Premio Loto".
 */
const FAMILY_ALIASES: Array<{ re: RegExp; base: string }> = [
  { re: /la\s*diaria/i, base: "diaria" },
  { re: /pega\s*3/i, base: "pega3" },
  { re: /premia\s*2/i, base: "premia2" },
  { re: /jug[aá]\s*3/i, base: "juga3" },
];

function scheduleSuffix(text: string): "11am" | "3pm" | "9pm" | null {
  if (/11[:\s]?00\s*am/i.test(text) || /11\s*am/i.test(text)) return "11am";
  if (/3[:\s]?00\s*pm/i.test(text) || /3\s*pm/i.test(text)) return "3pm";
  if (/9[:\s]?00\s*pm/i.test(text) || /9\s*pm/i.test(text)) return "9pm";
  return null;
}

export function gameFromTitle(title: string): GameType | null {
  if (/super\s*premio/i.test(title)) return "super_premio";
  const family = FAMILY_ALIASES.find((f) => f.re.test(title));
  if (!family) return null;
  const suffix = scheduleSuffix(title);
  if (!suffix) return null;
  return `${family.base}_${suffix}` as GameType;
}

// ----- JSON crudo de Data/raw -----

interface RawRecord {
  siteGameId?: string;
  juego?: string;
  horario?: string;
  fecha?: string;
  numeros?: string[];
  signos?: string[];
  sessionId?: string;
}

/**
 * Parsea los registros crudos de Data/raw/*.json. Cada archivo es un array de
 * sesiones. Descarta registros sin juego resoluble, sin sessionId o sin fecha.
 */
export function parseRawRecords(records: RawRecord[]): ParsedDraw[] {
  const out: ParsedDraw[] = [];
  for (const r of records) {
    const game = r.siteGameId ? gameFromSiteId(r.siteGameId) : null;
    if (!game || !r.sessionId || !r.fecha || !r.numeros?.length) continue;
    out.push({
      game,
      sessionId: r.sessionId,
      numbers: r.numeros.map(String),
      signs: (r.signos ?? []).map(String),
      drawDate: new Date(r.fecha).toISOString(),
    });
  }
  return out;
}

// ----- Respuesta en vivo de la API /feed/game-stats -----

interface ApiGameStat {
  _id?: string;
  title?: string;
  game?: {
    _id?: string;
    lastSession?: {
      score?: string[][];
      date?: string;
    };
  };
  last_session_id?: string;
}

interface ApiFeedResponse {
  gameStats?: ApiGameStat[];
}

/**
 * Parsea la respuesta de GET /feed/game-stats hacia ParsedDraw[].
 * `score` es un array de arrays (posiciones); se aplana a una lista de números.
 * Los signos no vienen en este endpoint (se enriquecen aparte si hace falta).
 *
 * NOTA: este endpoint quedó obsoleto (ya no devuelve game.lastSession).
 * Se mantiene por compatibilidad con tests; la vía activa es /site-games.
 */
export function parseFeed(body: ApiFeedResponse | string): ParsedDraw[] {
  const data: ApiFeedResponse =
    typeof body === "string" ? (JSON.parse(body) as ApiFeedResponse) : body;
  const out: ParsedDraw[] = [];
  for (const gs of data.gameStats ?? []) {
    const game =
      (gs._id ? gameFromSiteId(gs._id) : null) ??
      (gs.title ? gameFromTitle(gs.title) : null);
    const session = gs.game?.lastSession;
    const sessionId = gs.last_session_id;
    if (!game || !sessionId || !session?.score?.length || !session.date) {
      continue;
    }
    out.push({
      game,
      sessionId,
      numbers: session.score.flat().map(String),
      signs: [],
      drawDate: new Date(session.date).toISOString(),
    });
  }
  return out;
}

// ----- Respuesta en vivo de la API /site-games/{siteGameId} -----
// Endpoint activo (2026-09): devuelve el juego con sus últimas ~6 sesiones.
// En La Diaria el `score` trae IDs de opciones de `game.score_layout`
// (posiblemente doble-anidado); hay que resolverlos a su texto.

export interface SiteGameSession {
  _id?: string;
  date?: string;
  score?: unknown;
  game_id?: string;
}

/** Recorre `score_layout` (arrays anidados arbitrarios) → Map<id, texto>. */
export function collectLayoutIds(scoreLayout: unknown): Map<string, string> {
  const map = new Map<string, string>();
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const n of node) walk(n);
      return;
    }
    if (node && typeof node === "object") {
      const rec = node as Record<string, unknown>;
      if (Array.isArray(rec.options)) {
        for (const opt of rec.options as Array<Record<string, unknown>>) {
          if (typeof opt.id === "string" && typeof opt.text === "string") {
            map.set(opt.id, opt.text);
          }
        }
      }
      for (const v of Object.values(rec)) walk(v);
    }
  };
  walk(scoreLayout);
  return map;
}

/** Aplana cualquier anidamiento de `score` a una lista de tokens no vacíos. */
export function flattenScore(score: unknown): string[] {
  const out: string[] = [];
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) {
      for (const n of v) walk(n);
      return;
    }
    if (v !== null && v !== undefined) {
      const t = String(v).trim();
      if (t) out.push(t);
    }
  };
  walk(score);
  return out;
}

/**
 * Convierte la respuesta de GET /site-games/{siteGameId} en ParsedDraw[].
 * Mismo criterio que el histórico crudo: numbers = primer token de cada celda
 * resuelta (para La Diaria "44 Mesas" → "44"), signs = texto completo.
 */
export function parseSiteGameSessions(siteGameId: string, doc: unknown): ParsedDraw[] {
  const game = gameFromSiteId(siteGameId);
  if (!game) return [];
  const d = (doc ?? {}) as {
    game?: { sessions?: SiteGameSession[]; score_layout?: unknown };
    sessions?: SiteGameSession[];
  };
  const sessions = d.game?.sessions ?? d.sessions ?? [];
  const layout = collectLayoutIds(d.game?.score_layout);
  const out: ParsedDraw[] = [];

  for (const s of sessions) {
    if (!s?._id || !s?.date) continue;
    const cells = flattenScore(s.score);
    if (cells.length === 0) continue;
    const resolved = cells.map((c) => layout.get(c) ?? c);
    const hasSign = resolved.some((t) => /\s/.test(t));
    const numbers = hasSign ? resolved.map((t) => t.split(/\s+/)[0]!) : resolved;
    const signs = hasSign ? resolved : [];
    out.push({
      game,
      sessionId: s._id,
      numbers,
      signs,
      drawDate: new Date(s.date).toISOString(),
    });
  }
  return out;
}

/**
 * Devuelve el sorteo cuyo marcador de fecha (04:00Z de su día) coincide con
 * `targetMarkerMs`. Si aún no se publicó, ninguno coincide → undefined.
 */
export function findDrawForSlot(draws: ParsedDraw[], targetMarkerMs: number): ParsedDraw | undefined {
  for (const d of draws) {
    if (Date.parse(d.drawDate) === targetMarkerMs) return d;
  }
  return undefined;
}
