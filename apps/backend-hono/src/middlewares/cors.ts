/**
 * Middleware CORS para la Edge API.
 *
 * MÓDULO PROTEGIDO (.aicodeprotect.yml): los middlewares concentran auth,
 * RBAC y wiring transversal. Cambios requieren APPROVED.
 *
 * El frontend (Cloudflare Pages) llama a la API directamente desde el navegador
 * (CSR), por lo que la API debe responder el preflight con el header
 * Access-Control-Allow-Origin correcto.
 *
 * Allowlist por defecto (orígenes propios + túnel de desarrollo documentado) y
 * orígenes adicionales configurables vía la variable CORS_ALLOWED_ORIGINS (csv).
 * Los orígenes de desarrollo localhost:<puerto> siempre se permiten.
 */
import { cors } from "hono/cors";
import type { MiddlewareHandler } from "hono";

const BASE_ALLOWED_ORIGINS = [
  "https://pronosticos-hn.oged-solutions.com",
  "https://staging.pronosticos-hn.pages.dev",
  "https://chariot-drowsily-lure.ngrok-free.dev",
];

const LOCALHOST_RE = /^https?:\/\/localhost:\d+$/;

export function isAllowedOrigin(origin: string, extraCsv?: string): boolean {
  if (origin === "null") return false;
  if (BASE_ALLOWED_ORIGINS.includes(origin)) return true;
  if (LOCALHOST_RE.test(origin)) return true;
  if (!extraCsv) return false;
  return extraCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .includes(origin);
}

const options: Parameters<typeof cors>[0] = {
  origin: (origin, c) => {
    const env = c.env as { CORS_ALLOWED_ORIGINS?: string } | undefined;
    return isAllowedOrigin(origin, env?.CORS_ALLOWED_ORIGINS) ? origin : null;
  },
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "X-Ingest-Token"],
  exposeHeaders: ["Content-Type"],
  maxAge: 86400,
};

export const corsMiddleware: MiddlewareHandler = cors(options);