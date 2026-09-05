/**
 * Rutas de administración de usuarios:
 *   GET   /api/v1/admin/users                     — listado paginado de todos los usuarios
 *   PATCH /api/v1/admin/users/:id/ban             — suspender cuenta
 *   PATCH /api/v1/admin/users/:id/unban           — reactivar cuenta
 *   PATCH /api/v1/admin/users/:id/role            — cambiar rol (customer/admin/clerk)
 *   PATCH /api/v1/admin/users/:id/subscription    — asignar/renovar plan (method + meses)
 */
import { Hono } from "hono";
import { and, eq, gte } from "drizzle-orm";
import type { Database } from "../../db/client.js";
import { users, subscriptions } from "../../db/schema.js";
import type { UserRole } from "@loto/shared-types";

const ROLES: UserRole[] = ["customer", "admin", "clerk"];

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

// PATCH /api/v1/admin/users/:id/role — cambiar rol de usuario.
adminUsersRoutes.patch("/:id/role", async (c) => {
  const db = c.get("db");
  const targetId = c.req.param("id");
  const auth = c.get("auth");

  const body = (await c.req.json().catch(() => null)) as { role?: string } | null;
  const role = body?.role as UserRole | undefined;
  if (!role || !ROLES.includes(role))
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Rol inválido. Valores: customer, admin, clerk." } }, 400);

  const [target] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, targetId)).limit(1);
  if (!target)
    return c.json({ success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado." } }, 404);

  // Evitar que un admin se quite su propio acceso, o que un admin promueva/demote a otro admin.
  if (target.id === auth.sub && role !== "admin")
    return c.json({ success: false, error: { code: "FORBIDDEN", message: "No puedes quitarte el rol de administrador a ti mismo." } }, 403);
  if (target.role === "admin" && auth.sub !== target.id)
    return c.json({ success: false, error: { code: "FORBIDDEN", message: "No puedes modificar el rol de otro administrador." } }, 403);

  await db.update(users).set({ role }).where(eq(users.id, targetId));
  return c.json({ success: true, data: { message: `Rol actualizado a "${role}".` } });
});

// PATCH /api/v1/admin/users/:id/subscription — asignar o renovar plan (trial o cash).
// Crea una suscripción activa con vencimiento a N meses desde hoy.
adminUsersRoutes.patch("/:id/subscription", async (c) => {
  const db = c.get("db");
  const targetId = c.req.param("id");
  const auth = c.get("auth");

  const body = (await c.req.json().catch(() => null)) as { method?: string; validityMonths?: number; planLabel?: string } | null;
  const method = body?.method === "cash_presencial" ? "cash_presencial" : "trial";
  const validityMonths = Number(body?.validityMonths);

  if (!Number.isInteger(validityMonths) || validityMonths <= 0 || validityMonths > 12)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "validityMonths debe ser un entero entre 1 y 12." } }, 400);

  const [target] = await db.select({ id: users.id }).from(users).where(eq(users.id, targetId)).limit(1);
  if (!target)
    return c.json({ success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado." } }, 404);

  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(now.getMonth() + validityMonths);

  await db.insert(subscriptions).values({
    userId: targetId,
    isActive: true,
    paymentMethod: method,
    startDate: now,
    endDate,
    registeredByAdminId: auth.sub,
    receiptNumber: method === "cash_presencial" ? (body?.planLabel ?? null) : null,
  });

  return c.json({
    success: true,
    data: {
      message: `Plan ${method === "trial" ? "Trial" : "pago en efectivo"} asignado ${validityMonths} mes(es) hasta ${endDate.toISOString()}`,
    },
  });
});
