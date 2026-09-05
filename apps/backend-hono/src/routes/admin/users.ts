/**
 * Rutas de administración de usuarios:
 *   GET   /api/v1/admin/users          — listado paginado de todos los usuarios
 *   PATCH /api/v1/admin/users/:id/ban  — suspender cuenta
 *   PATCH /api/v1/admin/users/:id/unban — reactivar cuenta
 */
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { Database } from "../../db/client.js";
import { users, subscriptions } from "../../db/schema.js";

export const adminUsersRoutes = new Hono<{ Variables: { db: Database } }>();

// GET /api/v1/admin/users — lista todos los usuarios con estado de suscripción
adminUsersRoutes.get("/", async (c) => {
  const db = c.get("db");
  const now = new Date();

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      banned: users.banned,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);

  // Para cada usuario, buscar suscripción activa vigente
  const userIds = rows.map((u) => u.id);
  const activeSubs = userIds.length > 0
    ? await db
        .select({
          userId: subscriptions.userId,
          paymentMethod: subscriptions.paymentMethod,
          endDate: subscriptions.endDate,
        })
        .from(subscriptions)
        .where(eq(subscriptions.isActive, true))
    : [];

  const subMap = new Map(
    activeSubs
      .filter((s) => s.endDate > now)
      .map((s) => [s.userId, s]),
  );

  const data = rows.map((u) => ({
    ...u,
    subscription: subMap.get(u.id) ?? null,
  }));

  return c.json({ success: true, data });
});

// PATCH /api/v1/admin/users/:id/ban — suspender cuenta de usuario
adminUsersRoutes.patch("/:id/ban", async (c) => {
  const db = c.get("db");
  const targetId = c.req.param("id");

  const [target] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, targetId)).limit(1);
  if (!target)
    return c.json({ success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado." } }, 404);

  if (target.role === "admin")
    return c.json({ success: false, error: { code: "FORBIDDEN", message: "No se puede banear a otro administrador." } }, 403);

  await db.update(users).set({ banned: true }).where(eq(users.id, targetId));
  return c.json({ success: true, data: { message: "Cuenta suspendida." } });
});

// PATCH /api/v1/admin/users/:id/unban — reactivar cuenta de usuario
adminUsersRoutes.patch("/:id/unban", async (c) => {
  const db = c.get("db");
  const targetId = c.req.param("id");

  const [target] = await db.select({ id: users.id }).from(users).where(eq(users.id, targetId)).limit(1);
  if (!target)
    return c.json({ success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado." } }, 404);

  await db.update(users).set({ banned: false }).where(eq(users.id, targetId));
  return c.json({ success: true, data: { message: "Cuenta reactivada." } });
});
