/**
 * Middleware: exige una suscripción ACTIVA y VIGENTE (endDate futura).
 * Es el control de acceso al contenido premium (meta-patrones).
 *
 * MÓDULO PROTEGIDO (.aicodeprotect.yml): RBAC de suscripciones. Cambios
 * comprometen el modelo de cobro. Requiere APPROVED.
 *
 * Debe ejecutarse DESPUÉS de requireAuth: toma el userId de los claims del JWT.
 */
import type { MiddlewareHandler } from "hono";
import { and, eq, gt } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { subscriptions } from "../db/schema.js";

export const requireActiveSubscription: MiddlewareHandler = async (c, next) => {
  const db = c.get("db") as Database;
  const auth = c.get("auth");
  if (!auth?.sub) {
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
        eq(subscriptions.userId, auth.sub),
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
