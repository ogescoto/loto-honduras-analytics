/**
 * Rutas de autenticación: emite JWT para usuarios existentes.
 *
 * Nota de seguridad: este login es por email (MVP). La verificación de
 * contraseña/OTP es una mejora futura; el contrato del JWT ya queda fijo.
 */
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { eq } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { users } from "../db/schema.js";
import type { UserRole } from "@loto/shared-types";

type Env = { JWT_SECRET: string };

export const authRoutes = new Hono<{
  Bindings: Env;
  Variables: { db: Database };
}>();

const TOKEN_TTL_SECONDS = 60 * 60; // 1 hora

// POST /api/v1/auth/login  { email }
authRoutes.post("/login", async (c) => {
  const db = c.get("db");
  const secret = c.env.JWT_SECRET;
  if (!secret) {
    return c.json(
      { success: false, error: { code: "SERVER_MISCONFIGURED", message: "JWT_SECRET no configurado." } },
      500,
    );
  }

  const { email } = (await c.req.json()) as { email?: string };
  if (!email) {
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "El email es obligatorio." } },
      400,
    );
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return c.json(
      { success: false, error: { code: "INVALID_CREDENTIALS", message: "Credenciales inválidas." } },
      401,
    );
  }

  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const token = await sign({ sub: user.id, role: user.role as UserRole, exp }, secret, "HS256");

  return c.json({
    success: true,
    data: { token, user: { id: user.id, email: user.email, role: user.role } },
  });
});
