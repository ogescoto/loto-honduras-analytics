/**
 * Ruta de ingestión de sorteos (máquina-a-máquina).
 *
 * La ejecuta el job de GitHub Actions (vía principal con proxy WebShare) y el
 * Worker de respaldo. Persiste de forma idempotente: si el sessionId ya existe,
 * no duplica. Protegida con requireServiceToken (token de servicio, no JWT).
 *
 * Tras cada ingestión exitosa, encola el recálculo de patrones de los juegos
 * afectados vía ctx.waitUntil (no bloquea la respuesta al caller).
 */
import { Hono } from "hono";
import { and, eq, gte, lt } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { lotteryHistory } from "../db/schema.js";
import type { GameType } from "@loto/shared-types";
import { computePatternsForGame } from "../patterns/compute.js";
import { computeAndPersistFeatures } from "./features.js";

const VALID_GAMES = new Set<GameType>([
  "diaria_11am",
  "diaria_3pm",
  "diaria_9pm",
  "pega3_11am",
  "pega3_3pm",
  "pega3_9pm",
  "premia2_11am",
  "premia2_3pm",
  "premia2_9pm",
  "juga3_11am",
  "juga3_3pm",
  "juga3_9pm",
  "super_premio",
]);

interface IncomingDraw {
  game?: string;
  sessionId?: string;
  numbers?: string[];
  signs?: string[];
  drawDate?: string;
  /** verified=false indica que solo una fuente (no primaria) lo reportó. */
  verified?: boolean;
  /** id (uuid) de la draw_sources que reportó el sorteo. */
  sourceUrlId?: string;
}

/** Valida y normaliza un sorteo entrante; null si es inválido. */
function sanitize(d: IncomingDraw): typeof lotteryHistory.$inferInsert | null {
  if (
    !d.game ||
    !VALID_GAMES.has(d.game as GameType) ||
    !d.sessionId ||
    !Array.isArray(d.numbers) ||
    d.numbers.length === 0 ||
    !d.drawDate
  ) {
    return null;
  }
  const date = new Date(d.drawDate);
  if (Number.isNaN(date.getTime())) return null;
  const sourceUrlId = typeof d.sourceUrlId === "string" && d.sourceUrlId.length > 0 ? d.sourceUrlId : undefined;
  return {
    game: d.game as GameType,
    sessionId: d.sessionId,
    numbers: d.numbers.map(String),
    signs: Array.isArray(d.signs) ? d.signs.map(String) : [],
    drawDate: date,
    source: "official",
    verified: d.verified !== false,
    ...(sourceUrlId ? { sourceUrlId } : {}),
  };
}

/**
 * El oficial reemplaza al manual: borra cualquier fila manual del mismo
 * juego y día civil (UTC) antes de insertar el resultado oficial.
 */
async function deleteManualOverride(
  db: Database,
  row: typeof lotteryHistory.$inferInsert,
): Promise<void> {
  const d = row.drawDate as Date;
  const dayStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
  const dayEnd = new Date(dayStart.getTime() + 86_400_000);
  await db
    .delete(lotteryHistory)
    .where(and(
      eq(lotteryHistory.game, row.game),
      eq(lotteryHistory.source, "manual"),
      gte(lotteryHistory.drawDate, dayStart),
      lt(lotteryHistory.drawDate, dayEnd),
    ));
}

export const ingestRoutes = new Hono<{ Variables: { db: Database } }>();

// POST /api/v1/ingest — recibe { draws: [...] } y hace upsert idempotente.
ingestRoutes.post("/", async (c) => {
  const body = (await c.req.json().catch(() => null)) as
    | { draws?: IncomingDraw[] }
    | null;

  if (!body || !Array.isArray(body.draws)) {
    return c.json(
      {
        success: false,
        error: { code: "BAD_REQUEST", message: "Se espera { draws: [...] }." },
      },
      400,
    );
  }

  const rows = body.draws
    .map(sanitize)
    .filter((r): r is typeof lotteryHistory.$inferInsert => r !== null);

  if (rows.length === 0) {
    return c.json({ success: true, data: { received: body.draws.length, valid: 0, inserted: 0 } });
  }

  const db = c.get("db");

  // El oficial reemplaza manuales provisionales del mismo juego+día.
  const seen = new Set<string>();
  for (const row of rows) {
    const key = `${row.game}:${(row.drawDate as Date).getTime()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    await deleteManualOverride(db, row);
  }

  const inserted = await db
    .insert(lotteryHistory)
    .values(rows)
    .onConflictDoNothing({ target: lotteryHistory.sessionId })
    .returning({ id: lotteryHistory.id });

  // Recalcular patrones y estados de características en background (solo en Workers runtime).
  if (inserted.length > 0) {
    const affectedGames = [...new Set(rows.map((r) => r.game as GameType))];
    try {
      const ctx = c.executionCtx;
      for (const game of affectedGames) {
        ctx.waitUntil(computePatternsForGame(db, game, []));
        ctx.waitUntil(computeAndPersistFeatures(db, game));
      }
    } catch {
      // En entorno de test/Node no hay ExecutionContext — el cómputo se omite gracefully.
    }
  }

  return c.json({
    success: true,
    data: { received: body.draws.length, valid: rows.length, inserted: inserted.length },
  });
});
