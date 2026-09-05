/**
 * Favoritos de usuario — requiere autenticación (cuenta gratuita o superior).
 *
 * GET  /api/v1/favorites          — lista favoritos del usuario autenticado
 * POST /api/v1/favorites          — agregar favorito
 * DELETE /api/v1/favorites/:id    — eliminar favorito
 */
import { Hono } from "hono";
import { and, eq, inArray, count } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { userFavorites } from "../db/schema.js";
import type { GameType } from "@loto/shared-types";
import type { AuthClaims } from "../middlewares/auth.js";

const VALID_GAMES = new Set<string>([
  "diaria_11am","diaria_3pm","diaria_9pm",
  "pega3_11am","pega3_3pm","pega3_9pm",
  "premia2_11am","premia2_3pm","premia2_9pm",
  "juga3_11am","juga3_3pm","juga3_9pm",
  "super_premio",
]);

export const favoritesRoutes = new Hono<{
  Variables: { db: Database; auth: AuthClaims };
}>();

// GET /api/v1/favorites — lista favoritos del usuario ordenados por posición (reorden drag & drop)
favoritesRoutes.get("/", async (c) => {
  const db = c.get("db");
  const { sub: userId } = c.get("auth");
  const rows = await db
    .select()
    .from(userFavorites)
    .where(eq(userFavorites.userId, userId))
    .orderBy(userFavorites.position, userFavorites.createdAt);
  return c.json({ success: true, data: rows });
});

// POST /api/v1/favorites  { game, number, note? }
favoritesRoutes.post("/", async (c) => {
  const db = c.get("db");
  const { sub: userId } = c.get("auth");
  const body = (await c.req.json().catch(() => null)) as {
    game?: string; number?: string; note?: string;
  } | null;

  if (!body?.game || !VALID_GAMES.has(body.game) || !body?.number?.trim())
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "game y number son obligatorios." } },
      400,
    );

  // number: solo 1-2 dígitos (ej. "07", "7") — evita inyecciones de texto arbitrario
  if (!/^\d{1,2}$/.test(body.number.trim()))
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "number debe ser un número de 1 o 2 dígitos (ej. \"07\")." } },
      400,
    );

  if (body.note && body.note.length > 500)
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "La nota no puede superar 500 caracteres." } },
      400,
    );

  // Límite de 100 favoritos por usuario para prevenir abuso
  const countResult = await db
    .select({ total: count() })
    .from(userFavorites)
    .where(eq(userFavorites.userId, userId));

  if ((countResult[0]?.total ?? 0) >= 100)
    return c.json(
      { success: false, error: { code: "LIMIT_EXCEEDED", message: "Límite de 100 favoritos por usuario alcanzado." } },
      400,
    );

  const [row] = await db
    .insert(userFavorites)
    .values({
      userId,
      game: body.game as GameType,
      number: body.number.trim(),
      note: body.note?.trim() ?? null,
    })
    .onConflictDoNothing()
    .returning();

  if (!row)
    return c.json({ success: false, error: { code: "ALREADY_EXISTS", message: "Ya tienes ese número como favorito." } }, 409);

  return c.json({ success: true, data: row }, 201);
});

// PATCH /api/v1/favorites/reorder — reordena favoritos por drag & drop.
favoritesRoutes.patch("/reorder", async (c) => {
  const db = c.get("db");
  const { sub: userId } = c.get("auth");
  const body = (await c.req.json().catch(() => null)) as { ids?: string[] } | null;
  const ids = Array.isArray(body?.ids) ? body.ids : [];

  if (ids.length === 0 || ids.length > 100)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "ids debe ser una lista no vacía (máx. 100)." } }, 400);

  // Verificar que todos pertenecen a este usuario (evita reordenar favoritos ajenos).
  const owned = await db
    .select({ id: userFavorites.id })
    .from(userFavorites)
    .where(and(eq(userFavorites.userId, userId), inArray(userFavorites.id, ids)));

  if (owned.length !== ids.length)
    return c.json({ success: false, error: { code: "FORBIDDEN", message: "Algunos favoritos no pertenecen a tu cuenta." } }, 403);

  // Actualizar posición en orden de la lista recibida.
  await Promise.all(
    ids.map((id, position) =>
      db.update(userFavorites).set({ position }).where(eq(userFavorites.id, id)),
    ),
  );

  return c.json({ success: true, data: { ok: true, count: ids.length } });
});

// DELETE /api/v1/favorites/:id
favoritesRoutes.delete("/:id", async (c) => {
  const db = c.get("db");
  const { sub: userId } = c.get("auth");
  const id = c.req.param("id");

  const deleted = await db
    .delete(userFavorites)
    .where(and(eq(userFavorites.id, id), eq(userFavorites.userId, userId)))
    .returning({ id: userFavorites.id });

  if (deleted.length === 0)
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Favorito no encontrado." } }, 404);

  return c.json({ success: true, data: { deleted: deleted[0]!.id } });
});
