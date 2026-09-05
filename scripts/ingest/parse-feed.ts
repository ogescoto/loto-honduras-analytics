/**
 * Parseo de la respuesta de la API /sessions?siteGameId=X&limit=3
 *
 * El endpoint devuelve un array de objetos { game_id, sessions: [...] }.
 * Cada session tiene: _id, date, score (string[][]), createdAt.
 *
 * Nota: el endpoint /feed/game-stats fue descartado porque devuelve datos
 * vacíos (sin last_session_id ni score) en el entorno real.
 */

export type GameType =
  | "diaria_11am" | "diaria_3pm" | "diaria_9pm"
  | "pega3_11am"  | "pega3_3pm"  | "pega3_9pm"
  | "premia2_11am"| "premia2_3pm"| "premia2_9pm"
  | "juga3_11am"  | "juga3_3pm"  | "juga3_9pm"
  | "super_premio";

/**
 * Mapa siteGameId → GameType.
 * siteGameId = el ID que el frontend de loteriasdehonduras usa para identificar
 * cada combinación juego+jornada. Es el ID que va en ?siteGameId=.
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

/**
 * Mapa game_id (ID interno de la API, distinto de siteGameId) → siteGameId.
 * La respuesta de /sessions usa game_id; necesitamos cruzarlo con siteGameId
 * para identificar el GameType.
 */
const INTERNAL_TO_SITE: Record<string, string> = {
  "693ae5bbd7b13e9daed23b2e": "693ae5bbd7b13e9daed23b31", // diaria_11am
  "693ae5bbd7b13e9daed23b04": "693ae5bbd7b13e9daed23b07", // diaria_3pm
  "693ae5bbd7b13e9daed23b1c": "693ae5bbd7b13e9daed23b1f", // diaria_9pm
  "693ae5bbd7b13e9daed23b34": "693ae5bbd7b13e9daed23b37", // pega3_11am
  "693ae5bbd7b13e9daed23b0a": "693ae5bbd7b13e9daed23b0d", // pega3_3pm
  "693ae5bbd7b13e9daed23b10": "693ae5bbd7b13e9daed23b13", // pega3_9pm
  "693ae5bbd7b13e9daed23b3a": "693ae5bbd7b13e9daed23b3d", // premia2_11am
  "693ae5bbd7b13e9daed23b22": "693ae5bbd7b13e9daed23b25", // premia2_3pm
  "693ae5bbd7b13e9daed23b28": "693ae5bbd7b13e9daed23b2b", // premia2_9pm
  "693ae5bbd7b13e9daed23b49": "693ae5bbd7b13e9daed23b4c", // juga3_11am
  "693ae5bbd7b13e9daed23b4f": "693ae5bbd7b13e9daed23b52", // juga3_3pm
  "693ae5bbd7b13e9daed23b55": "693ae5bbd7b13e9daed23b58", // juga3_9pm
  "693ae5bbd7b13e9daed23b16": "693ae5bbd7b13e9daed23b19", // super_premio
};

export interface ParsedDraw {
  game: GameType;
  sessionId: string;
  numbers: string[];
  signs: string[];
  drawDate: string;
}

interface ApiSession {
  _id: string;
  game_id: string;
  date: string;
  score: string[][];
  createdAt: string;
}

interface ApiGameEntry {
  game_id: string;
  sessions: ApiSession[];
}

/**
 * Parsea la respuesta del endpoint /sessions (array de { game_id, sessions }).
 * Descarta sorteos con scores alfanuméricos (La Diaria — requieren resolución JS).
 * Descarta sesiones sin score o sin fecha.
 */
export function parseSessions(body: string | ApiGameEntry[]): ParsedDraw[] {
  const data: ApiGameEntry[] = typeof body === "string" ? JSON.parse(body) : body;
  const out: ParsedDraw[] = [];

  for (const entry of data) {
    const siteGameId = INTERNAL_TO_SITE[entry.game_id];
    const game = siteGameId ? SITE_GAME_IDS[siteGameId] : undefined;
    if (!game) continue;

    for (const session of entry.sessions ?? []) {
      if (!session._id || !session.date || !session.score?.length) continue;

      const numbers = session.score.flat().filter((s) => s && s.trim() !== "");
      if (numbers.length === 0) continue;

      // Descartar alfanuméricos (IDs de La Diaria no resueltos)
      const isAlpha = numbers.some((n) => /[a-zA-Z_-]/.test(n));
      if (isAlpha) continue;

      out.push({
        game,
        sessionId: session._id,
        numbers,
        signs: [],
        drawDate: new Date(session.date).toISOString(),
      });
    }
  }

  return out;
}

/** @deprecated Usar parseSessions. Mantenido para compatibilidad con tests existentes. */
export function parseFeed(body: string | { gameStats?: unknown[] }): ParsedDraw[] {
  // Si recibe el formato viejo de game-stats, intentar parsear como sessions
  if (typeof body === "object" && "gameStats" in body) {
    // Formato antiguo: intentar extraer datos del formato game-stats para tests unitarios
    const gameStats = (body as { gameStats?: Array<{ _id?: string; game?: { lastSession?: { score?: string[][]; date?: string } }; last_session_id?: string }> }).gameStats ?? [];
    const out: ParsedDraw[] = [];
    for (const gs of gameStats) {
      const game = gs._id ? SITE_GAME_IDS[gs._id] : undefined;
      const session = gs.game?.lastSession;
      const sessionId = gs.last_session_id;
      if (!game || !sessionId || !session?.score?.length || !session.date) continue;
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
  return parseSessions(body as string | ApiGameEntry[]);
}
