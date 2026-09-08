/**
 * Rutas de pagos online (Stripe).
 *
 * MÓDULO PROTEGIDO (.aicodeprotect.yml): flujos de pago/suscripción, PCI.
 * Cambios requieren APPROVED.
 *
 * - POST /checkout: requiere auth (se aplica aquí mismo). Crea la sesión.
 * - POST /webhook: público pero verificado por firma de Stripe. Activa la
 *   suscripción cuando el pago se completa.
 */
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { users, subscriptions } from "../db/schema.js";
import { requireAuth } from "../middlewares/auth.js";
import { createCheckoutSession, verifyWebhook } from "./stripe-client.js";

type Env = {
  STRIPE_API_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  APP_BASE_URL: string;
};

/** Plan único actual: L. 200.00 = 30 días de Premium (moneda HNL). */
const PLAN_AMOUNT_HNL_CENTS = 20000;     // L. 200.00 (centavos de lempira)
const PLAN_VALIDITY_DAYS = 30;            // 30 días por pago

export const paymentsRoutes = new Hono<{
  Bindings: Env;
  Variables: { db: Database };
}>();

// POST /api/v1/payments/checkout — inicia el checkout de Stripe (plan L. 200 / 30 días).
paymentsRoutes.post("/checkout", requireAuth, async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");

  const [user] = await db.select().from(users).where(eq(users.id, auth.sub)).limit(1);
  if (!user) {
    return c.json(
      { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado." } },
      404,
    );
  }

  const base = c.env.APP_BASE_URL ?? "http://localhost:4321";
  const session = await createCheckoutSession(c.env.STRIPE_API_KEY, {
    customerEmail: user.email,
    validityMonths: 1, // 1 período (30 días), plan fijo
    unitAmountCents: PLAN_AMOUNT_HNL_CENTS,
    successUrl: `${base}/premium?checkout=success`,
    cancelUrl: `${base}/premium?checkout=cancel`,
    clientReferenceId: user.id,
  });

  return c.json({ success: true, data: { checkoutUrl: session.url } });
});

// POST /api/v1/payments/webhook — Stripe confirma el pago.
paymentsRoutes.post("/webhook", async (c) => {
  const db = c.get("db");
  const sig = c.req.header("stripe-signature");
  const raw = await c.req.text();

  if (!sig) {
    return c.json(
      { success: false, error: { code: "BAD_REQUEST", message: "Falta la firma de Stripe." } },
      400,
    );
  }

  let event: {
    type: string;
    data: { object: { client_reference_id?: string; metadata?: { validityMonths?: string } } };
  };
  try {
    event = (await verifyWebhook(raw, sig, c.env.STRIPE_WEBHOOK_SECRET)) as typeof event;
  } catch {
    return c.json(
      { success: false, error: { code: "INVALID_SIGNATURE", message: "Firma del webhook inválida." } },
      400,
    );
  }

  if (event.type === "checkout.session.completed") {
    const obj = event.data.object;
    const userId = obj.client_reference_id;
    if (userId) {
      const now = new Date();
      // Plan único: L. 200.00 = 30 días de Premium.
      const endDate = new Date(now.getTime() + PLAN_VALIDITY_DAYS * 24 * 60 * 60 * 1000);
      await db.insert(subscriptions).values({
        userId,
        isActive: true,
        paymentMethod: "stripe",
        startDate: now,
        endDate,
        registeredByAdminId: null,
        receiptNumber: null,
      });
    }
  }

  return c.json({ success: true, data: { received: true } });
});
