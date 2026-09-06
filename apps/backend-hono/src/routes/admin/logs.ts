/**
 * Logs de ingestión — solo lectura para el panel admin.
 *
 * GET /api/v1/admin/logs?level=&game=&limit=&offset= — eventos de ingestion_events
 * ordenados desc por fecha. level: info | warn | error.
 */
import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import type { Database } from "../../db/client.js";
import { ingestionEvents, drawSources } from "../../db/schema.js";
import type { GameType } from "@loto/shared-types";

const VALID_GAME_SET = new Set<string>([
  "diaria_11am", "diaria_3pm", "diaria_9pm",
  "pega3_11am", "pega3_3pm", "pega3_9pm",
  "premia2_11am", "premia2_3pm", "premia2_9pm",
  "juga3_11am", "juga3_3pm", "juga3_9pm",
  "super_premio",
]);
const VALID_LEVELS = new Set(["info", "warn", "error"]);

export const adminLogsRoutes = new Hono<{ Variables: { db: Database } }>();

adminLogsRoutes.get("/", async (c) => {
  const db = c.get("db");
  const qLevel = c.req.query("level");
  const qGame = c.req.query("game");
  const parsedLimit = Number.parseInt(c.req.query("limit") ?? "100", 10);
  const parsedOffset = Number.parseInt(c.req.query("offset") ?? "0", 10);

  const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 500) : 100;
  const offset = Number.isFinite(parsedOffset) ? Math.max(parsedOffset, 0) : 0;

  const where = and(
    qLevel && VALID_LEVELS.has(qLevel) ? eq(ingestionEvents.level, qLevel) : undefined,
    qGame && VALID_GAME_SET.has(qGame) ? eq(ingestionEvents.game, qGame as GameType) : undefined,
  );

  const rows = await db
    .select({
      id: ingestionEvents.id,
      level: ingestionEvents.level,
      message: ingestionEvents.message,
      game: ingestionEvents.game,
      meta: ingestionEvents.meta,
      createdAt: ingestionEvents.createdAt,
      sourceId: ingestionEvents.sourceId,
      sourceName: drawSources.name,
    })
    .from(ingestionEvents)
    .leftJoin(drawSources, eq(ingestionEvents.sourceId, drawSources.id))
    .where(where)
    .orderBy(desc(ingestionEvents.createdAt), desc(ingestionEvents.id))
    .limit(limit)
    .offset(offset);

  return c.json({ success: true, data: rows });
});