/**
 * Middleware: inyecta la conexión a BD en el contexto del request (edge).
 *
 * MÓDULO PROTEGIDO (.aicodeprotect.yml): los middlewares concentran auth,
 * RBAC y wiring transversal. Cambios requieren APPROVED.
 */
import type { MiddlewareHandler } from "hono";
import type { Database } from "../db/client.js";

export function dbInjection(
  factory: (url: string) => Database,
): MiddlewareHandler {
  return async (c, next) => {
    const url = c.env?.NEON_DATABASE_URL as string | undefined;
    c.set("db", factory(url ?? ""));
    await next();
  };
}
