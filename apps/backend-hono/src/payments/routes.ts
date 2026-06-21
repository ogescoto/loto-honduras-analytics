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
import type { CreateCheckoutDto } from "@loto/shared-types";

type Env = {
  STRIPE_API_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  APP_BASE_URL: string;
};

const PRICE_PER_MONTH_CENTS = 500; // USD 5.00 / mes

export const paymentsRoutes = new Hono<{
  Bindings: Env;
  Variables: { db: Database };
}>();

// POST /api/v1/payments/checkout — inicia el checkout de Stripe.
paymentsRoutes.post("/checkout", requireAuth, async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");
  const { validityMonths } = (await c.req.json()) as CreateCheckoutDto;

  if (!validityMonths || Number(validityMonths) <= 0) {
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "validityMonths debe ser mayor que 0." } },
      400,
    );
  }

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
    validityMonths: Number(validityMonths),
    unitAmountCents: PRICE_PER_MONTH_CENTS,
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
    const months = Number(obj.metadata?.validityMonths ?? 1);
    if (userId) {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(now.getMonth() + months);
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
