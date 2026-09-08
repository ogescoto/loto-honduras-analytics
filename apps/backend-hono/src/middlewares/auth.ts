/**
 * Middlewares de autenticación (JWT) y autorización (RBAC).
 *
 * MÓDULO PROTEGIDO (.aicodeprotect.yml): control de seguridad transversal.
 * Cambios requieren APPROVED. Ver ai-software-governance/04_Backend/Security.md
 *
 * Usa hono/jwt (Web Crypto API), compatible con Cloudflare Workers.
 */
import type { MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";
import type { UserRole } from "@loto/shared-types";

export interface AuthClaims {
  sub: string; // userId
  role: UserRole;
  exp: number;
}

declare module "hono" {
  interface ContextVariableMap {
    auth: AuthClaims;
  }
}

/** Verifica el Bearer token y deja los claims en c.get("auth"). */
export const requireAuth: MiddlewareHandler = async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json(
      { success: false, error: { code: "UNAUTHENTICATED", message: "Falta el token de autenticación." } },
      401,
    );
  }
  const token = header.slice("Bearer ".length);
  const secret = c.env?.JWT_SECRET as string | undefined;
  if (!secret) {
    return c.json(
      { success: false, error: { code: "SERVER_MISCONFIGURED", message: "JWT_SECRET no configurado." } },
      500,
    );
  }

  try {
    const payload = (await verify(token, secret, "HS256")) as unknown as AuthClaims;
    c.set("auth", payload);
    await next();
  } catch {
    return c.json(
      { success: false, error: { code: "INVALID_TOKEN", message: "Token inválido o expirado." } },
      401,
    );
  }
};

/** Exige que el usuario autenticado tenga uno de los roles permitidos. */
export function requireRole(...roles: UserRole[]): MiddlewareHandler {
  return async (c, next) => {
    const auth = c.get("auth");
    if (!auth || !roles.includes(auth.role)) {
      return c.json(
        { success: false, error: { code: "FORBIDDEN", message: "No tienes permiso para esta acción." } },
        403,
      );
    }
    await next();
  };
}
