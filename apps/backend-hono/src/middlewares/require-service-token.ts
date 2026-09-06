/**
 * Middleware de autenticación máquina-a-máquina para la ingestión.
 *
 * MÓDULO PROTEGIDO (.aicodeprotect.yml): control de seguridad transversal.
 * Cambios requieren APPROVED.
 *
 * Distinto del JWT de usuario (requireAuth): la ingestión la ejecuta un job
 * de GitHub Actions, que presenta un token de servicio compartido en el header
 * `X-Ingest-Token`. La comparación es de tiempo constante para evitar fugas por
 * temporización.
 */
import type { MiddlewareHandler } from "hono";

/** Comparación de tiempo constante (no corta al primer byte distinto). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export const requireServiceToken: MiddlewareHandler = async (c, next) => {
  const presented = c.req.header("X-Ingest-Token");
  const expected = c.env?.INGEST_SERVICE_TOKEN as string | undefined;

  if (!expected) {
    return c.json(
      {
        success: false,
        error: {
          code: "SERVER_MISCONFIGURED",
          message: "INGEST_SERVICE_TOKEN no configurado.",
        },
      },
      500,
    );
  }

  if (!presented || !timingSafeEqual(presented, expected)) {
    return c.json(
      {
        success: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Token de servicio ausente o inválido.",
        },
      },
      401,
    );
  }

  await next();
};
