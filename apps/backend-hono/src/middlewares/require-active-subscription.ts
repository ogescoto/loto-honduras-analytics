/**
 * Middleware: exige una suscripción ACTIVA y VIGENTE (endDate futura).
 * Es el control de acceso al contenido premium (meta-patrones).
 *
 * MÓDULO PROTEGIDO (.aicodeprotect.yml): RBAC de suscripciones. Cambios
 * comprometen el modelo de cobro. Requiere APPROVED.
 */
import type { MiddlewareHandler } from "hono";
import { and, eq, gt } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { subscriptions } from "../db/schema.js";

export const requireActiveSubscription: MiddlewareHandler = async (c, next) => {
  const db = c.get("db") as Database;
  // En producción el userId se extrae del JWT verificado, no del query.
  const userId = c.req.query("userId");
  if (!userId) {
    return c.json(
      { success: false, error: { code: "UNAUTHENTICATED", message: "Falta identificación de usuario." } },
      401,
    );
  }

  const [valid] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.isActive, true),
        gt(subscriptions.endDate, new Date()),
      ),
    )
    .limit(1);

  if (!valid) {
    return c.json(
      { success: false, error: { code: "SUBSCRIPTION_REQUIRED", message: "Su suscripción ha expirado o no existe." } },
      403,
    );
  }

  await next();
};
