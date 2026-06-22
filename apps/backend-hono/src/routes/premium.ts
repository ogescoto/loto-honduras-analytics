/**
 * Rutas premium: meta-patrones.
 * El control de acceso (requireAuth + requireActiveSubscription) se aplica
 * en index.ts sobre el prefijo /api/v1/premium/*.
 */
import { Hono } from "hono";
import type { Database } from "../db/client.js";
import { metaPatterns } from "../db/schema.js";

export const premiumRoutes = new Hono<{ Variables: { db: Database } }>();

// GET /api/v1/premium/meta-patterns — solo suscriptores vigentes.
premiumRoutes.get("/meta-patterns", async (c) => {
  const db = c.get("db");
  const patterns = await db.select().from(metaPatterns);
  return c.json({
    success: true,
    data: { generatedAt: new Date().toISOString(), metaPatterns: patterns },
  });
});
