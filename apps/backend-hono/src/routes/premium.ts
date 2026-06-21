/**
 * Rutas premium: meta-patrones. Protegidas por suscripción activa y vigente.
 */
import { Hono } from "hono";
import type { Database } from "../db/client.js";
import { metaPatterns } from "../db/schema.js";
import { requireActiveSubscription } from "../middlewares/require-active-subscription.js";

export const premiumRoutes = new Hono<{ Variables: { db: Database } }>();

premiumRoutes.use("*", requireActiveSubscription);

// GET /api/v1/premium/meta-patterns — solo suscriptores vigentes.
premiumRoutes.get("/meta-patterns", async (c) => {
  const db = c.get("db");
  const patterns = await db.select().from(metaPatterns);
  return c.json({
    success: true,
    data: { generatedAt: new Date().toISOString(), metaPatterns: patterns },
  });
});
