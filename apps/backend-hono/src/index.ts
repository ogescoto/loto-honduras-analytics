/**
 * Punto de entrada de la Edge API (Cloudflare Worker + Hono).
 * Compone middlewares y rutas por módulo.
 */
import { Hono } from "hono";
import { createDb, type Database } from "./db/client.js";
import { dbInjection } from "./middlewares/db-injection.js";
import { requireAuth, requireRole } from "./middlewares/auth.js";
import { requireActiveSubscription } from "./middlewares/require-active-subscription.js";
import { authRoutes } from "./routes/auth.js";
import { patternsRoutes } from "./routes/patterns.js";
import { premiumRoutes } from "./routes/premium.js";
import { adminRoutes } from "./routes/admin/physical-payments.js";
import { paymentsRoutes } from "./payments/routes.js";

export type Env = {
  NEON_DATABASE_URL: string;
  JWT_SECRET: string;
  STRIPE_API_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  APP_BASE_URL: string;
};

export type Variables = {
  db: Database;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use("*", dbInjection(createDb));

app.get("/health", (c) => c.json({ success: true, data: { status: "ok" } }));

// Público / freemium.
app.route("/api/v1/auth", authRoutes);
app.route("/api/v1/patterns", patternsRoutes);

// Premium: requiere autenticación + suscripción vigente.
app.use("/api/v1/premium/*", requireAuth, requireActiveSubscription);
app.route("/api/v1/premium", premiumRoutes);

// Admin: requiere autenticación + rol admin/clerk.
app.use("/api/v1/admin/*", requireAuth, requireRole("admin", "clerk"));
app.route("/api/v1/admin", adminRoutes);

// Pagos online (Stripe): checkout requiere auth; webhook es público (firmado).
app.route("/api/v1/payments", paymentsRoutes);

export default app;
