/**
 * Punto de entrada de la Edge API (Cloudflare Worker + Hono).
 * Compone middlewares y rutas por módulo.
 */
import { Hono } from "hono";
import { createDb, type Database } from "./db/client.js";
import { dbInjection } from "./middlewares/db-injection.js";
import { patternsRoutes } from "./routes/patterns.js";
import { premiumRoutes } from "./routes/premium.js";
import { adminRoutes } from "./routes/admin/physical-payments.js";

export type Env = {
  NEON_DATABASE_URL: string;
  JWT_SECRET: string;
};

export type Variables = {
  db: Database;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use("*", dbInjection(createDb));

app.get("/health", (c) => c.json({ success: true, data: { status: "ok" } }));

app.route("/api/v1/patterns", patternsRoutes);
app.route("/api/v1/premium", premiumRoutes);
app.route("/api/v1/admin", adminRoutes);

export default app;
