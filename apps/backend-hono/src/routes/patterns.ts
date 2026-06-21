/**
 * Rutas de patrones de primer nivel (acceso público / freemium).
 */
import { Hono } from "hono";
import type { Database } from "../db/client.js";
import { gamePatterns } from "../db/schema.js";

export const patternsRoutes = new Hono<{ Variables: { db: Database } }>();

// GET /api/v1/patterns — lista patrones de nivel 1.
patternsRoutes.get("/", async (c) => {
  const db = c.get("db");
  const patterns = await db.select().from(gamePatterns);
  return c.json({ success: true, data: patterns });
});
