/**
 * Combinaciones de patrones guardadas por el usuario (constructor personal).
 *
 * Un usuario crea combinaciones (nombre + juego + lista de FeatureCode válidos),
 * las reutiliza para /filter (candidatos) y /hits (historial), las renombra,
 * marca una como predeterminada y las elimina. Requiere autenticación.
 *
 * GET    /api/v1/saved-patterns          — lista las del usuario
 * POST   /api/v1/saved-patterns          — crea una combinación
 * PATCH  /api/v1/saved-patterns/:id      — renombra / cambia features / isDefault
 * DELETE /api/v1/saved-patterns/:id      — elimina
 */
import { Hono } from "hono";
import { and, eq, inArray } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { userSavedPatterns } from "../db/schema.js";
import { ALL_FEATURES } from "../patterns/features-engine.js";
import type { GameType } from "@loto/shared-types";
import type { AuthClaims } from "../middlewares/auth.js";

const VALID_GAMES = new Set<GameType>([
  "diaria_11am", "diaria_3pm", "diaria_9pm",
  "pega3_11am",  "pega3_3pm",  "pega3_9pm",
  "premia2_11am","premia2_3pm","premia2_9pm",
  "juga3_11am",  "juga3_3pm",  "juga3_9pm",
  "super_premio",
]);
const MAX_FEATURES = 7; // mismo límite que /filter y /hits

export const savedPatternsRoutes = new Hono<{
  Variables: { db: Database; auth: AuthClaims };
}>();

// GET /api/v1/saved-patterns
savedPatternsRoutes.get("/", async (c) => {
  const db = c.get("db");
  const { sub: userId } = c.get("auth");
  const rows = await db
    .select()
    .from(userSavedPatterns)
    .where(eq(userSavedPatterns.userId, userId))
    .orderBy(userSavedPatterns.createdAt);
  return c.json({ success: true, data: rows });
});

// POST /api/v1/saved-patterns  { name, game, features[] }
savedPatternsRoutes.post("/", async (c) => {
  const db = c.get("db");
  const { sub: userId } = c.get("auth");
  const body = (await c.req.json().catch(() => null)) as {
    name?: string; game?: string; features?: string[];
  } | null;

  const name = (body?.name ?? "").trim();
  const game = body?.game as GameType | undefined;
  const features = Array.isArray(body?.features) ? body.features : [];

  if (!name || name.length < 2 || name.length > 60)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "name debe tener entre 2 y 60 caracteres." } }, 400);
  if (!game || !VALID_GAMES.has(game))
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Juego inválido." } }, 400);
  if (features.length === 0 || features.length > MAX_FEATURES)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `Se requiere entre 1 y ${MAX_FEATURES} características.` } }, 400);
  const invalid = features.filter((f) => !ALL_FEATURES.includes(f as never));
  if (invalid.length > 0)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `Características inválidas: ${invalid.join(", ")}.` } }, 400);

  const [row] = await db
    .insert(userSavedPatterns)
    .values({ userId, name, game, features, isDefault: false })
    .returning();

  return c.json({ success: true, data: row }, 201);
});

// PATCH /api/v1/saved-patterns/:id  { name?, features?, isDefault? }
savedPatternsRoutes.patch("/:id", async (c) => {
  const db = c.get("db");
  const { sub: userId } = c.get("auth");
  const id = c.req.param("id");
  const body = (await c.req.json().catch(() => null)) as {
    name?: string; features?: string[]; isDefault?: boolean;
  } | null;

  const [target] = await db
    .select()
    .from(userSavedPatterns)
    .where(and(eq(userSavedPatterns.id, id), eq(userSavedPatterns.userId, userId)))
    .limit(1);
  if (!target)
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Combinación no encontrada." } }, 404);

  const patch: Partial<typeof userSavedPatterns.$inferInsert> = {};
  if (body?.name !== undefined) {
    const name = body.name.trim();
    if (name.length < 2 || name.length > 60)
      return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "name debe tener entre 2 y 60 caracteres." } }, 400);
    patch.name = name;
  }
  if (body?.features !== undefined) {
    if (body.features.length === 0 || body.features.length > MAX_FEATURES)
      return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `Se requiere entre 1 y ${MAX_FEATURES} características.` } }, 400);
    const invalid = body.features.filter((f) => !ALL_FEATURES.includes(f as never));
    if (invalid.length > 0)
      return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `Características inválidas: ${invalid.join(", ")}.` } }, 400);
    patch.features = body.features;
  }
  if (body?.isDefault !== undefined) {
    // Al marcar una como predeterminada, quitar el flag a las demás.
    if (body.isDefault) {
      await db.update(userSavedPatterns).set({ isDefault: false }).where(eq(userSavedPatterns.userId, userId));
    }
    patch.isDefault = Boolean(body.isDefault);
  }

  const [row] = await db
    .update(userSavedPatterns)
    .set(patch)
    .where(eq(userSavedPatterns.id, id))
    .returning();

  return c.json({ success: true, data: row });
});

// DELETE /api/v1/saved-patterns/:id
savedPatternsRoutes.delete("/:id", async (c) => {
  const db = c.get("db");
  const { sub: userId } = c.get("auth");
  const id = c.req.param("id");

  const deleted = await db
    .delete(userSavedPatterns)
    .where(and(eq(userSavedPatterns.id, id), eq(userSavedPatterns.userId, userId)))
    .returning({ id: userSavedPatterns.id });

  if (deleted.length === 0)
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Combinación no encontrada." } }, 404);

  return c.json({ success: true, data: { deleted: deleted[0]!.id } });
});