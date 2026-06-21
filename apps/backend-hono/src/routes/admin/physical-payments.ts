/**
 * Registro de cobros físicos presenciales (uso exclusivo admin/clerk).
 *
 * MÓDULO PROTEGIDO (.aicodeprotect.yml): maneja dinero real y auditoría con
 * recibos correlativos. Sensible a fraude. Cambios requieren APPROVED.
 *
 * Protegido por requireAuth + requireRole("admin","clerk") en index.ts.
 * El administradorId se toma del JWT, NO del body (evita suplantación).
 */
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { Database } from "../../db/client.js";
import { users, subscriptions } from "../../db/schema.js";
import type { RegisterPhysicalPaymentDto } from "@loto/shared-types";

export const adminRoutes = new Hono<{ Variables: { db: Database } }>();

// POST /api/v1/admin/register-physical-payment
adminRoutes.post("/register-physical-payment", async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");
  const body = (await c.req.json()) as RegisterPhysicalPaymentDto;

  if (!body.clientEmail || !body.validityMonths || !body.paperReceiptNumber) {
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "clientEmail, validityMonths y paperReceiptNumber son obligatorios." } },
      400,
    );
  }
  if (Number(body.validityMonths) <= 0) {
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "validityMonths debe ser mayor que 0." } },
      400,
    );
  }

  const [client] = await db
    .select()
    .from(users)
    .where(eq(users.email, body.clientEmail))
    .limit(1);

  if (!client) {
    return c.json(
      { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no registrado." } },
      404,
    );
  }

  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(now.getMonth() + Number(body.validityMonths));

  await db.insert(subscriptions).values({
    userId: client.id,
    isActive: true,
    paymentMethod: "cash_presencial",
    startDate: now,
    endDate,
    registeredByAdminId: auth.sub, // del JWT verificado
    receiptNumber: body.paperReceiptNumber,
  });

  return c.json({
    success: true,
    data: {
      message: `Acceso premium activado para ${body.clientEmail} hasta ${endDate.toISOString()}`,
    },
  });
});
