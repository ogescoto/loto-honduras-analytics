/**
 * Rutas de autenticación:
 *   POST /login           — email + contraseña (o solo email si no tiene contraseña aún)
 *   POST /register        — auto-registro con email + contraseña + nombre
 *   POST /forgot-password — envía email de reset via Brevo
 *   POST /reset-password  — valida token y actualiza contraseña
 *   GET  /google          — inicia flujo OAuth 2.0 con Google
 *   GET  /google/callback — intercambia code por perfil y emite JWT
 *   GET  /me              — devuelve el usuario autenticado
 */
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { eq, and, gt } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { users, passwordResetTokens, subscriptions } from "../db/schema.js";
import type { UserRole } from "@loto/shared-types";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { sendBrevoEmail, buildPasswordResetEmail, buildWelcomeEmail } from "../lib/brevo.js";

type Env = {
  JWT_SECRET: string;
  BREVO_API_KEY: string;
  APP_BASE_URL: string;
  APP_FRONTEND_URL?: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  /** Emails (separados por coma) que se promueven a rol admin al autenticarse con Google. */
  GOOGLE_ADMIN_EMAILS?: string;
};

export const authRoutes = new Hono<{
  Bindings: Env;
  Variables: { db: Database };
}>();

const TOKEN_TTL = 60 * 60 * 8; // 8 horas
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;
const MAX_PASSWORD = 128;
const MAX_NAME = 100;

async function issueToken(
  userId: string,
  role: string,
  secret: string,
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL;
  return sign({ sub: userId, role: role as UserRole, exp }, secret, "HS256");
}

/** Genera un token criptográficamente seguro y su hash SHA-256 para almacenar. */
async function generateResetToken(): Promise<{ raw: string; hash: string }> {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  const raw = Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hash = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { raw, hash };
}

/**
 * Base del frontend para redirecciones post-auth. En dev el backend corre en
 * :8787 y el frontend en :4321; en prod/staging el frontend es APP_FRONTEND_URL
 * (fallback: quitar el subdominio "api" del backend).
 */
function frontendBase(appBase: string): string {
  if (/:8787/.test(appBase)) return appBase.replace(":8787", ":4321");
  if (/^https:\/\/api-/.test(appBase)) return appBase.replace(/^https:\/\/api-/, "https://");
  if (/^https:\/\/api\./.test(appBase)) return appBase.replace(/^https:\/\/api\./, "https://");
  return appBase;
}

/** Convierte GOOGLE_ADMIN_EMAILS (csv, minúsculas) en un Set para comparación O(1). */
function parseAdminEmails(raw?: string): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0),
  );
}

/** Escala a rol admin (idempotente) si el email figura en GOOGLE_ADMIN_EMAILS. */
async function promoteAdminIfListed(
  db: Database,
  user: typeof users.$inferSelect,
  adminEmails: Set<string>,
): Promise<typeof users.$inferSelect> {
  if (adminEmails.size === 0 || !user.email) return user;
  if (!adminEmails.has(user.email.toLowerCase()) || user.role === "admin") return user;
  const [updated] = await db
    .update(users)
    .set({ role: "admin", emailVerified: true })
    .where(eq(users.id, user.id))
    .returning();
  return updated ?? user;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/register
// ─────────────────────────────────────────────────────────────────────────────
authRoutes.post("/register", async (c) => {
  const db = c.get("db");
  const secret = c.env.JWT_SECRET;
  if (!secret)
    return c.json({ success: false, error: { code: "SERVER_MISCONFIGURED", message: "JWT_SECRET no configurado." } }, 500);

  const body = (await c.req.json().catch(() => null)) as {
    email?: string; password?: string; name?: string;
  } | null;

  if (!body?.email || !body?.password)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "email y password son obligatorios." } }, 400);

  if (body.email.length > MAX_EMAIL || !EMAIL_RE.test(body.email))
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Formato de email inválido." } }, 400);

  if (body.password.length < 8)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "La contraseña debe tener al menos 8 caracteres." } }, 400);

  if (body.password.length > MAX_PASSWORD)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `La contraseña no puede superar ${MAX_PASSWORD} caracteres.` } }, 400);

  if (body.name && body.name.length > MAX_NAME)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `El nombre no puede superar ${MAX_NAME} caracteres.` } }, 400);

  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, body.email)).limit(1);
  if (existing)
    return c.json({ success: false, error: { code: "EMAIL_IN_USE", message: "Ya existe una cuenta con ese email." } }, 409);

  const passwordHash = await hashPassword(body.password);
  const [user] = await db
    .insert(users)
    .values({
      email: body.email,
      name: body.name ?? null,
      passwordHash,
      emailVerified: false,
      role: "customer",
    })
    .returning();

  // Trial gratuito de 90 días — se crea automáticamente al registrar
  const trialEnd = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  await db.insert(subscriptions).values({
    userId: user!.id,
    isActive: true,
    paymentMethod: "trial",
    startDate: new Date(),
    endDate: trialEnd,
  });

  // Enviar email de bienvenida (no bloquea la respuesta)
  if (c.env.BREVO_API_KEY) {
    c.executionCtx?.waitUntil(
      sendBrevoEmail({
        apiKey: c.env.BREVO_API_KEY,
        to: { email: user!.email, name: user!.name ?? undefined },
        subject: "¡Bienvenido a Loto Honduras Analytics!",
        htmlContent: buildWelcomeEmail(user!.name),
      }).catch(() => {}),
    );
  }

  const token = await issueToken(user!.id, user!.role, secret);
  return c.json({
    success: true,
    data: { token, user: { id: user!.id, email: user!.email, role: user!.role } },
  }, 201);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login
// ─────────────────────────────────────────────────────────────────────────────
authRoutes.post("/login", async (c) => {
  const db = c.get("db");
  const secret = c.env.JWT_SECRET;
  if (!secret)
    return c.json({ success: false, error: { code: "SERVER_MISCONFIGURED", message: "JWT_SECRET no configurado." } }, 500);

  const body = (await c.req.json().catch(() => null)) as {
    email?: string; password?: string;
  } | null;

  if (!body?.email)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "El email es obligatorio." } }, 400);

  if (body.email.length > MAX_EMAIL || !EMAIL_RE.test(body.email))
    return c.json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Credenciales inválidas." } }, 401);

  if (body.password && body.password.length > MAX_PASSWORD)
    return c.json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Credenciales inválidas." } }, 401);

  const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
  if (!user)
    return c.json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Credenciales inválidas." } }, 401);

  if (user.banned)
    return c.json({ success: false, error: { code: "ACCOUNT_BANNED", message: "Esta cuenta ha sido suspendida. Contáctanos para más información." } }, 403);

  // Si el usuario tiene contraseña, la verificamos. Si no (solo Google), se omite.
  if (user.passwordHash) {
    if (!body.password)
      return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Se requiere contraseña." } }, 400);
    const ok = await verifyPassword(body.password, user.passwordHash);
    if (!ok)
      return c.json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Credenciales inválidas." } }, 401);
  }

  const token = await issueToken(user.id, user.role, secret);
  return c.json({
    success: true,
    data: {
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name, avatarUrl: user.avatarUrl },
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
authRoutes.post("/forgot-password", async (c) => {
  const db = c.get("db");
  const body = (await c.req.json().catch(() => null)) as { email?: string } | null;

  if (!body?.email)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "El email es obligatorio." } }, 400);

  if (body.email.length > MAX_EMAIL || !EMAIL_RE.test(body.email))
    return c.json({ success: true, data: { message: "Si el email existe, recibirás un enlace en breve." } });

  // Responder siempre OK para no revelar si el email existe (anti-enumeración).
  const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
  if (!user)
    return c.json({ success: true, data: { message: "Si el email existe, recibirás un enlace en breve." } });

  const { raw, hash } = await generateResetToken();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

  // Eliminar tokens previos del mismo usuario para evitar acumulación
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash: hash,
    expiresAt,
  });

  const appBase = c.env.APP_BASE_URL ?? "http://localhost:4321";
  const frontBase = c.env.APP_FRONTEND_URL ?? frontendBase(appBase);
  const resetUrl = `${frontBase}/reset-password?token=${raw}`;

  if (c.env.BREVO_API_KEY) {
    await sendBrevoEmail({
      apiKey: c.env.BREVO_API_KEY,
      to: { email: user.email, name: user.name ?? undefined },
      subject: "Restablecer contraseña — Loto Honduras Analytics",
      htmlContent: buildPasswordResetEmail(resetUrl, user.name),
    });
  }

  return c.json({ success: true, data: { message: "Si el email existe, recibirás un enlace en breve." } });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/reset-password
// ─────────────────────────────────────────────────────────────────────────────
authRoutes.post("/reset-password", async (c) => {
  const db = c.get("db");
  const body = (await c.req.json().catch(() => null)) as {
    token?: string; password?: string;
  } | null;

  if (!body?.token || !body?.password)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "token y password son obligatorios." } }, 400);

  if (body.password.length < 8)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "La contraseña debe tener al menos 8 caracteres." } }, 400);

  if (body.password.length > MAX_PASSWORD)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `La contraseña no puede superar ${MAX_PASSWORD} caracteres.` } }, 400);

  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body.token));
  const tokenHash = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");

  const now = new Date();
  const [record] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, now),
      ),
    )
    .limit(1);

  if (!record)
    return c.json({ success: false, error: { code: "INVALID_TOKEN", message: "Enlace inválido o expirado." } }, 400);

  const passwordHash = await hashPassword(body.password);
  await Promise.all([
    db.update(users).set({ passwordHash }).where(eq(users.id, record.userId)),
    db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, record.id)),
  ]);

  return c.json({ success: true, data: { message: "Contraseña actualizada correctamente." } });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/google  — inicia OAuth 2.0
// ─────────────────────────────────────────────────────────────────────────────
authRoutes.get("/google", (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID;
  const appBase = c.env.APP_BASE_URL ?? "http://localhost:8787";
  if (!clientId)
    return c.json({ success: false, error: { code: "SERVER_MISCONFIGURED", message: "Google OAuth no configurado." } }, 500);

  const redirectUri = `${appBase}/api/v1/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/google/callback  — intercambia code por perfil
// ─────────────────────────────────────────────────────────────────────────────
authRoutes.get("/google/callback", async (c) => {
  const db = c.get("db");
  const secret = c.env.JWT_SECRET;
  const clientId = c.env.GOOGLE_CLIENT_ID;
  const clientSecret = c.env.GOOGLE_CLIENT_SECRET;
  const appBase = c.env.APP_BASE_URL ?? "http://localhost:8787";
  const frontBase = c.env.APP_FRONTEND_URL ?? frontendBase(appBase);

  const code = c.req.query("code");
  const error = c.req.query("error");

  if (error || !code)
    return c.redirect(`${frontBase}/login?error=google_denied`);

  try {
    // 1. Intercambiar code por tokens
    const redirectUri = `${appBase}/api/v1/auth/google/callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokens = (await tokenRes.json()) as { access_token?: string; error?: string };
    if (!tokens.access_token) throw new Error("No access_token de Google");

    // 2. Obtener perfil
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = (await profileRes.json()) as {
      sub: string; email: string; name?: string; picture?: string; email_verified?: boolean;
    };

    if (!profile.email) throw new Error("Google no devolvió email");

    // 3. Buscar usuario por googleId o email; crear si no existe
    let [user] = await db.select().from(users).where(eq(users.googleId, profile.sub)).limit(1);
    if (!user) {
      const [byEmail] = await db.select().from(users).where(eq(users.email, profile.email)).limit(1);
      if (byEmail) {
        // Enlazar cuenta existente con Google
        [user] = await db
          .update(users)
          .set({ googleId: profile.sub, avatarUrl: profile.picture ?? null, emailVerified: true })
          .where(eq(users.id, byEmail.id))
          .returning();
      } else {
        // Crear cuenta nueva vía Google
        [user] = await db
          .insert(users)
          .values({
            email: profile.email,
            name: profile.name ?? null,
            googleId: profile.sub,
            avatarUrl: profile.picture ?? null,
            emailVerified: profile.email_verified ?? true,
            role: "customer",
          })
          .returning();
      }
    }

    if (!user) throw new Error("No se pudo crear o encontrar el usuario");

    if (user.banned)
      return c.redirect(`${frontBase}/login?error=account_banned`);

    // Superusuario: si el email está en GOOGLE_ADMIN_EMAILS, promover a admin.
    const adminEmails = parseAdminEmails(c.env.GOOGLE_ADMIN_EMAILS);
    const authed = await promoteAdminIfListed(db, user, adminEmails);

    // Si es usuario nuevo (sin suscripción previa), crear trial de 90 días
    const [existingSub] = await db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.userId, authed.id))
      .limit(1);
    if (!existingSub) {
      const trialEnd = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      await db.insert(subscriptions).values({
        userId: authed.id,
        isActive: true,
        paymentMethod: "trial",
        startDate: new Date(),
        endDate: trialEnd,
      });
    }

    const jwtToken = await issueToken(authed.id, authed.role, secret);

    // 4. Redirigir al frontend con el token en query param (lo lee la página y lo guarda en cookie)
    return c.redirect(`${frontBase}/auth/callback?token=${jwtToken}`);
  } catch (err) {
    console.error("Google OAuth error:", err);
    return c.redirect(`${frontBase}/login?error=google_failed`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/auth/me  — usuario autenticado (requiere Bearer JWT)
// ─────────────────────────────────────────────────────────────────────────────
authRoutes.get("/me", async (c) => {
  const db = c.get("db");
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer "))
    return c.json({ success: false, error: { code: "UNAUTHENTICATED", message: "Falta el token." } }, 401);

  const token = header.slice("Bearer ".length);
  const secret = c.env.JWT_SECRET;
  if (!secret)
    return c.json({ success: false, error: { code: "SERVER_MISCONFIGURED", message: "JWT_SECRET no configurado." } }, 500);

  try {
    const { verify } = await import("hono/jwt");
    const payload = (await verify(token, secret, "HS256")) as { sub: string };
    const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!user)
      return c.json({ success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado." } }, 404);

    return c.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        avatarUrl: user.avatarUrl,
        hasPassword: !!user.passwordHash,
        hasGoogle: !!user.googleId,
      },
    });
  } catch {
    return c.json({ success: false, error: { code: "INVALID_TOKEN", message: "Token inválido o expirado." } }, 401);
  }
});
