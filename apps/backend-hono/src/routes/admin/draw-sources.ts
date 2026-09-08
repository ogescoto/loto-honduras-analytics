/**
 * Gestión admin de fuentes de datos (múltiples URLs para correlacionar).
 *
 * MÓDULO PROTEGIDO (.aicodeprotect.yml) — aprobado para esta feature.
 * Protegido por requireAuth + requireRole en index.ts (/api/v1/admin/*).
 *
 * Reglas:
 *  - Una y solo una fuente puede estar marcada como primaria.
 *  - El apiFormat soportado hoy es "site-games" (familia de endpoints
 *    /site-games/{siteGameId}). Formato futuro: "feed".
 *  - baseUrl debe ser una URL http(s) válida.
 */
import { Hono } from "hono";
import { eq, asc, and, ne } from "drizzle-orm";
import type { Database } from "../../db/client.js";
import { drawSources } from "../../db/schema.js";
import type { CreateDrawSourceDto, UpdateDrawSourceDto } from "@loto/shared-types";

const ALLOWED_FORMATS = new Set(["site-games"]);

export const adminSourcesRoutes = new Hono<{ Variables: { db: Database } }>();

function rowToDto(r: typeof drawSources.$inferSelect) {
  return {
    id: r.id,
    name: r.name,
    baseUrl: r.baseUrl,
    apiFormat: r.apiFormat,
    enabled: r.enabled,
    isPrimary: r.isPrimary,
    lastSuccessAt: r.lastSuccessAt ? r.lastSuccessAt.toISOString() : null,
    lastErrorAt: r.lastErrorAt ? r.lastErrorAt.toISOString() : null,
    lastError: r.lastError,
    createdAt: r.createdAt.toISOString(),
  };
}

function validHttpUrl(u: string): boolean {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Demueve cualquier otra fuente si `id` pasa a ser primaria. */
async function demoteOthers(db: Database, keepId?: string) {
  const where = keepId ? and(eq(drawSources.isPrimary, true), ne(drawSources.id, keepId)) : eq(drawSources.isPrimary, true);
  await db.update(drawSources).set({ isPrimary: false }).where(where);
}

// GET /api/v1/admin/sources — listado completo
adminSourcesRoutes.get("/", async (c) => {
  const db = c.get("db");
  const rows = await db.select().from(drawSources).orderBy(asc(drawSources.createdAt));
  return c.json({ success: true, data: rows.map(rowToDto) });
});

// POST /api/v1/admin/sources — alta de fuente
adminSourcesRoutes.post("/", async (c) => {
  const db = c.get("db");
  const body = (await c.req.json().catch(() => null)) as CreateDrawSourceDto | null;

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const baseUrl = typeof body?.baseUrl === "string" ? body.baseUrl.trim().replace(/\/+$/, "") : "";
  const apiFormat = typeof body?.apiFormat === "string" && body.apiFormat ? body.apiFormat : "site-games";

  if (!name || name.length > 120)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "name es obligatorio (máx. 120)." } }, 400);
  if (!validHttpUrl(baseUrl))
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "baseUrl debe ser una URL http(s) válida." } }, 400);
  if (!ALLOWED_FORMATS.has(apiFormat))
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `apiFormat inválido (soportado: ${[...ALLOWED_FORMATS].join(", ")}).` } }, 400);

  const isPrimary = body?.isPrimary === true;

  if (isPrimary) await demoteOthers(db);

  const [row] = await db
    .insert(drawSources)
    .values({ name, baseUrl, apiFormat, isPrimary, enabled: true })
    .returning();

  return c.json({ success: true, data: rowToDto(row!) }, 201);
});

// PATCH /api/v1/admin/sources/:id — actualización parcial
adminSourcesRoutes.patch("/:id", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");
  const body = (await c.req.json().catch(() => null)) as UpdateDrawSourceDto | null;

  const [existing] = await db.select().from(drawSources).where(eq(drawSources.id, id)).limit(1);
  if (!existing)
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Fuente no encontrada." } }, 404);

  const patch: Partial<typeof drawSources.$inferInsert> = {};

  if (typeof body?.name === "string") {
    const name = body.name.trim();
    if (!name || name.length > 120)
      return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "name inválido." } }, 400);
    patch.name = name;
  }
  if (typeof body?.baseUrl === "string") {
    const baseUrl = body.baseUrl.trim().replace(/\/+$/, "");
    if (!validHttpUrl(baseUrl))
      return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "baseUrl debe ser una URL http(s) válida." } }, 400);
    patch.baseUrl = baseUrl;
  }
  if (typeof body?.apiFormat === "string") {
    if (!ALLOWED_FORMATS.has(body.apiFormat))
      return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `apiFormat inválido (soportado: ${[...ALLOWED_FORMATS].join(", ")}).` } }, 400);
    patch.apiFormat = body.apiFormat;
  }
  if (typeof body?.enabled === "boolean") patch.enabled = body.enabled;
  if (typeof body?.isPrimary === "boolean") patch.isPrimary = body.isPrimary;

  if (patch.isPrimary === true) await demoteOthers(db, id);

  const [updated] = await db.update(drawSources).set(patch).where(eq(drawSources.id, id)).returning();
  return c.json({ success: true, data: rowToDto(updated!) });
});

// DELETE /api/v1/admin/sources/:id
adminSourcesRoutes.delete("/:id", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");
  const [existing] = await db.select().from(drawSources).where(eq(drawSources.id, id)).limit(1);
  if (!existing)
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Fuente no encontrada." } }, 404);

  await db.delete(drawSources).where(eq(drawSources.id, id));
  return c.json({ success: true, data: { message: "Fuente eliminada." } });
});
