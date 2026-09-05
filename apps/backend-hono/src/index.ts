/**
 * Punto de entrada de la Edge API (Cloudflare Worker + Hono).
 * Compone middlewares y rutas por módulo.
 */
import { Hono } from "hono";
import { createDb, type Database } from "./db/client.js";
import { corsMiddleware } from "./middlewares/cors.js";
import { dbInjection } from "./middlewares/db-injection.js";
import { requireAuth, requireRole } from "./middlewares/auth.js";
import { requireActiveSubscription } from "./middlewares/require-active-subscription.js";
import { requireServiceToken } from "./middlewares/require-service-token.js";
import { authRoutes } from "./routes/auth.js";
import { patternsRoutes } from "./routes/patterns.js";
import { premiumRoutes } from "./routes/premium.js";
import { adminRoutes } from "./routes/admin/physical-payments.js";
import { subscriptionsRoutes } from "./routes/admin/subscriptions.js";
import { adminUsersRoutes } from "./routes/admin/users.js";
import { adminSourcesRoutes } from "./routes/admin/draw-sources.js";
import { adminDrawsRoutes } from "./routes/admin/manual-draws.js";
import { ingestRoutes } from "./routes/ingest.js";
import { ingestEventsRoutes } from "./routes/ingest-events.js";
import { favoritesRoutes } from "./routes/favorites.js";
import { savedPatternsRoutes } from "./routes/saved-patterns.js";
import { historyRoutes } from "./routes/history.js";
import { featuresRoutes } from "./routes/features.js";
import { paymentsRoutes } from "./payments/routes.js";
import { sourcesRoutes } from "./routes/sources.js";
import { adminLogsRoutes } from "./routes/admin/logs.js";

export type Env = {
  NEON_DATABASE_URL: string;
  JWT_SECRET: string;
  STRIPE_API_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  APP_BASE_URL: string;
  INGEST_SERVICE_TOKEN: string;
  BREVO_API_KEY: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  /** Emails (csv) promovidos a rol admin al autenticarse con Google. */
  GOOGLE_ADMIN_EMAILS?: string;
  /** Orígenes adicionales permitidos por CORS (csv). Se suman a la allowlist por defecto. */
  CORS_ALLOWED_ORIGINS?: string;
};

export type Variables = {
  db: Database;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// CORS primero: responde el preflight (OPTIONS) antes de tocar la BD.
app.use("*", corsMiddleware);
app.use("*", dbInjection(createDb));

app.get("/health", (c) => c.json({ success: true, data: { status: "ok" } }));

// Público / freemium.
app.route("/api/v1/auth", authRoutes);
app.route("/api/v1/patterns", patternsRoutes);
app.route("/api/v1/history", historyRoutes);
app.route("/api/v1/features", featuresRoutes);

// Premium: requiere autenticación + suscripción vigente.
app.use("/api/v1/premium/*", requireAuth, requireActiveSubscription);
app.route("/api/v1/premium", premiumRoutes);

// Admin: requiere autenticación + rol admin/clerk.
app.use("/api/v1/admin/*", requireAuth, requireRole("admin", "clerk"));
app.route("/api/v1/admin", adminRoutes);
app.route("/api/v1/admin/subscriptions", subscriptionsRoutes);
app.route("/api/v1/admin/users", adminUsersRoutes);
app.route("/api/v1/admin/sources", adminSourcesRoutes);
app.route("/api/v1/admin/draws", adminDrawsRoutes);
app.route("/api/v1/admin/logs", adminLogsRoutes);

// Favoritos: requiere cuenta gratuita o superior (JWT de usuario).
app.use("/api/v1/favorites/*", requireAuth);
app.route("/api/v1/favorites", favoritesRoutes);

// Combinaciones de patrones guardadas (constructor personal) — requiere cuenta.
app.use("/api/v1/saved-patterns/*", requireAuth);
app.route("/api/v1/saved-patterns", savedPatternsRoutes);

// Ingestión (máquina-a-máquina): token de servicio, no JWT de usuario.
app.use("/api/v1/ingest", requireServiceToken);
app.route("/api/v1/ingest", ingestRoutes);
app.use("/api/v1/ingest/events", requireServiceToken);
app.route("/api/v1/ingest/events", ingestEventsRoutes);
app.use("/api/v1/sources/health", requireServiceToken);
app.route("/api/v1/sources", sourcesRoutes);

// Pagos online (Stripe): checkout requiere auth; webhook es público (firmado).
app.route("/api/v1/payments", paymentsRoutes);

export default app;
