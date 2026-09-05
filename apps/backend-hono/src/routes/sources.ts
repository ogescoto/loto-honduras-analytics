/**
 * Fuentes de datos públicas.
 *
 * GET  /api/v1/sources          — lista fuentes habilitadas (para el scraper).
 * POST /api/v1/sources/health   — reporte de salud de una fuente (service token;
 *                                 el worker de ingestión lo usa para actualizar
 *                                 last_success_at / last_error).
 *
 * El GET no expone estados internos de error; son de uso admin (/admin/sources).
 */
import { Hono } from "hono";
import { eq, asc } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { drawSources } from "../db/schema.js";

export const sourcesRoutes = new Hono<{ Variables: { db: Database } }>();

sourcesRoutes.get("/", async (c) => {
  const db = c.get("db");
  const rows = await db
    .select({
      id: drawSources.id,
      name: drawSources.name,
      baseUrl: drawSources.baseUrl,
      apiFormat: drawSources.apiFormat,
      isPrimary: drawSources.isPrimary,
    })
    .from(drawSources)
    .where(eq(drawSources.enabled, true))
    .orderBy(asc(drawSources.createdAt));
  return c.json({ success: true, data: rows });
});

// POST /api/v1/sources/health — protegido con requireServiceToken en index.ts.
sourcesRoutes.post("/health", async (c) => {
  const db = c.get("db");
  const body = (await c.req.json().catch(() => null)) as
    | { sourceId?: string; ok?: boolean; error?: string }
    | null;

  const sourceId = typeof body?.sourceId === "string" ? body.sourceId : "";
  if (!sourceId)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "sourceId requerido." } }, 400);

  const [row] = await db.select({ id: drawSources.id }).from(drawSources).where(eq(drawSources.id, sourceId)).limit(1);
  if (!row)
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Fuente no encontrada." } }, 404);

  const now = new Date();
  const ok = body?.ok === true;
  await db
    .update(drawSources)
    .set(ok
      ? { lastSuccessAt: now, lastErrorAt: null, lastError: null }
      : { lastErrorAt: now, lastError: typeof body?.error === "string" ? body.error.slice(0, 300) : "error desconocido" })
    .where(eq(drawSources.id, sourceId));

  return c.json({ success: true, data: { message: ok ? "ok" : "error registrado" } });
});
