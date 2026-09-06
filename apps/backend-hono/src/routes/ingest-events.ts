/**
 * Registro de eventos de ingestión (máquina-a-máquina).
 *
 * POST /api/v1/ingest/events — el scraper reporta eventos estructurados
 * (chequeo de fuentes, errores, resúmenes de ejecución) que alimentan la
 * pantalla de logs del admin. Protegida con requireServiceToken.
 */
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { ingestionEvents, drawSources } from "../db/schema.js";
import type { GameType } from "@loto/shared-types";

const VALID_GAMES: readonly GameType[] = [
  "diaria_11am", "diaria_3pm", "diaria_9pm",
  "pega3_11am", "pega3_3pm", "pega3_9pm",
  "premia2_11am", "premia2_3pm", "premia2_9pm",
  "juga3_11am", "juga3_3pm", "juga3_9pm",
  "super_premio",
];
const VALID_GAME_SET = new Set<string>(VALID_GAMES);
const VALID_LEVELS = new Set(["info", "warn", "error"]);

export const ingestEventsRoutes = new Hono<{ Variables: { db: Database } }>();

ingestEventsRoutes.post("/", async (c) => {
  const db = c.get("db");
  const body = (await c.req.json().catch(() => null)) as
    | { level?: string; sourceId?: string; game?: string; message?: string; meta?: unknown }
    | null;

  const level = typeof body?.level === "string" && VALID_LEVELS.has(body.level) ? body.level : "info";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "message requerido." } }, 400);

  const sourceId = typeof body?.sourceId === "string" && body.sourceId ? body.sourceId : null;
  if (sourceId) {
    const [row] = await db
      .select({ id: drawSources.id })
      .from(drawSources)
      .where(eq(drawSources.id, sourceId))
      .limit(1);
    if (!row)
      return c.json({ success: false, error: { code: "NOT_FOUND", message: "Fuente no encontrada." } }, 404);
  }

  const game = typeof body?.game === "string" && VALID_GAME_SET.has(body.game) ? (body.game as GameType) : null;
  const meta = body?.meta && typeof body.meta === "object" ? (body.meta as Record<string, unknown>) : null;

  const [created] = await db
    .insert(ingestionEvents)
    .values({
      level,
      message: message.slice(0, 500),
      sourceId: sourceId ?? null,
      game,
      meta,
    })
    .returning({ id: ingestionEvents.id, createdAt: ingestionEvents.createdAt });

  return c.json({ success: true, data: created });
});