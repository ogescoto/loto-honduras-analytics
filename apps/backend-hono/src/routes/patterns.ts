import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { gamePatterns } from "../db/schema.js";
import type { GameType } from "@loto/shared-types";

const VALID_GAMES = new Set<GameType>([
  "diaria_11am", "diaria_3pm", "diaria_9pm",
  "pega3_11am",  "pega3_3pm",  "pega3_9pm",
  "premia2_11am","premia2_3pm","premia2_9pm",
  "juga3_11am",  "juga3_3pm",  "juga3_9pm",
  "super_premio",
]);

export const patternsRoutes = new Hono<{ Variables: { db: Database } }>();

// GET /api/v1/patterns[?game=<GameType>] — lista patrones de nivel 1.
patternsRoutes.get("/", async (c) => {
  const gameParam = c.req.query("game");

  if (gameParam !== undefined && !VALID_GAMES.has(gameParam as GameType)) {
    return c.json(
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: `Juego inválido: "${gameParam}".` },
      },
      400,
    );
  }

  const db = c.get("db");
  const patterns = gameParam
    ? await db.select().from(gamePatterns).where(eq(gamePatterns.game, gameParam as GameType))
    : await db.select().from(gamePatterns);

  return c.json({ success: true, data: patterns });
});
