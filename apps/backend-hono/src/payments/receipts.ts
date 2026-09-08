/**
 * Recibos de pago compartidos por el usuario (plan pagado).
 *
 * El usuario, al pagar por un canal no-Stripe (efectivo/banca), sube la
 * referencia de su recibo; el sistema guarda el comprobante y NOTIFICA al
 * correo de soporte (soporte@oged-solutions.com). El admin revisa y confirma
 * ("dar de alta") → crea la suscripción premium (30 días).
 *
 * POST  /api/v1/payments/receipt              — usuario envía recibo (auth)
 * GET   /api/v1/admin/receipts                — admin lista recibos
 * PATCH /api/v1/admin/receipts/:id/confirm    — admin confirma y da de alta
 */
import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { paymentReceipts, subscriptions, users } from "../db/schema.js";
import { sendBrevoEmail, buildReceiptNotifEmail } from "../lib/brevo.js";
import type { AuthClaims } from "../middlewares/auth.js";

/** Correo de soporte al que llegan los recibos compartidos. */
export const SUPPORT_EMAIL = "soporte@oged-solutions.com";

type Env = { BREVO_API_KEY?: string };
const RECEIPT_DAYS = 30; // suscripción al confirmar

export const receiptRoutes = new Hono<{
  Bindings: Env;
  Variables: { db: Database; auth: AuthClaims };
}>();
export const adminReceiptsRoutes = new Hono<{ Variables: { db: Database } }>();

// POST /api/v1/payments/receipt — el usuario comparte su recibo.
receiptRoutes.post("/", async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");
  const body = (await c.req.json().catch(() => null)) as {
    method?: string; amount?: number; reference?: string; note?: string;
  } | null;

  const method = ["cash", "bank", "transfer"].includes(body?.method ?? "") ? body!.method! : "cash";
  const reference = (body?.reference ?? "").trim();
  const note = (body?.note ?? "").trim();
  const amount = Number(body?.amount);

  if (!reference || reference.length > 200)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "reference es obligatorio (máx. 200)." } }, 400);
  if (note.length > 500)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "note máx. 500." } }, 400);

  const [user] = await db.select().from(users).where(eq(users.id, auth.sub)).limit(1);
  if (!user) return c.json({ success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no encontrado." } }, 404);

  const inserted = await db
    .insert(paymentReceipts)
    .values({
      userId: user.id,
      email: user.email,
      name: user.name,
      method,
      amount: Number.isFinite(amount) && amount > 0 ? Math.round(amount) : null,
      reference,
      note: note || null,
      status: "pending",
    })
    .returning();
  const row = inserted[0];
  if (!row) return c.json({ success: false, error: { code: "INTERNAL", message: "No se pudo guardar el recibo." } }, 500);

  // Notificar a soporte (best-effort, no bloquea).
  if (c.env.BREVO_API_KEY) {
    c.executionCtx?.waitUntil(
      sendBrevoEmail({
        apiKey: c.env.BREVO_API_KEY!,
        to: { email: SUPPORT_EMAIL, name: "Soporte Loto HN" },
        subject: `Recibo de pago de ${user.name ?? user.email}`,
        htmlContent: buildReceiptNotifEmail({
          userName: user.name ?? user.email,
          userEmail: user.email,
          method,
          amount: row.amount,
          reference,
          note,
        }),
      }).catch(() => {}),
    );
  }

  return c.json({ success: true, data: { id: row.id, status: row.status } }, 201);
});

// GET /api/v1/admin/receipts — listado para el admin.
adminReceiptsRoutes.get("/", async (c) => {
  const db = c.get("db");
  const rows = await db
    .select({
      id: paymentReceipts.id,
      userId: paymentReceipts.userId,
      email: paymentReceipts.email,
      name: paymentReceipts.name,
      method: paymentReceipts.method,
      amount: paymentReceipts.amount,
      reference: paymentReceipts.reference,
      note: paymentReceipts.note,
      status: paymentReceipts.status,
      createdAt: paymentReceipts.createdAt,
    })
    .from(paymentReceipts)
    .orderBy(desc(paymentReceipts.createdAt));
  return c.json({ success: true, data: rows });
});

// PATCH /api/v1/admin/receipts/:id/confirm — confirma el recibo y crea plan (30 días).
adminReceiptsRoutes.patch("/:id/confirm", async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");
  const id = c.req.param("id");

  const [receipt] = await db.select().from(paymentReceipts).where(eq(paymentReceipts.id, id)).limit(1);
  if (!receipt) return c.json({ success: false, error: { code: "NOT_FOUND", message: "Recibo no encontrado." } }, 404);
  if (receipt.status === "confirmed") return c.json({ success: false, error: { code: "ALREADY", message: "El recibo ya fue confirmado." } }, 400);

  const now = new Date();
  const endDate = new Date(now.getTime() + RECEIPT_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(subscriptions).values({
    userId: receipt.userId,
    isActive: true,
    paymentMethod: "cash_presencial",
    startDate: now,
    endDate,
    registeredByAdminId: auth.sub,
    receiptNumber: receipt.reference ?? null,
  });

  await db.update(paymentReceipts).set({ status: "confirmed" }).where(eq(paymentReceipts.id, id));
  return c.json({ success: true, data: { message: `Plan activado 30 días para ${receipt.email}.` } });
});

// PATCH /api/v1/admin/receipts/:id/reject — rechaza el recibo.
adminReceiptsRoutes.patch("/:id/reject", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");
  const [receipt] = await db.select({ id: paymentReceipts.id }).from(paymentReceipts).where(eq(paymentReceipts.id, id)).limit(1);
  if (!receipt) return c.json({ success: false, error: { code: "NOT_FOUND", message: "Recibo no encontrado." } }, 404);
  await db.update(paymentReceipts).set({ status: "rejected" }).where(eq(paymentReceipts.id, id));
  return c.json({ success: true, data: { ok: true } });
});