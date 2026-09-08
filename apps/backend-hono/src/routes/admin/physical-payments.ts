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

  // Validación de tipos en tiempo de ejecución — el cast DTO no garantiza tipos
  const clientEmail = typeof body.clientEmail === "string" ? body.clientEmail.trim() : "";
  const paperReceiptNumber = typeof body.paperReceiptNumber === "string" ? body.paperReceiptNumber.trim() : "";
  const validityMonths = Number(body.validityMonths);

  if (!clientEmail || !paperReceiptNumber || !body.validityMonths) {
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "clientEmail, validityMonths y paperReceiptNumber son obligatorios." } },
      400,
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail) || clientEmail.length > 254)
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Formato de clientEmail inválido." } },
      400,
    );

  if (paperReceiptNumber.length > 50)
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "paperReceiptNumber no puede superar 50 caracteres." } },
      400,
    );

  if (!Number.isInteger(validityMonths) || validityMonths <= 0) {
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "validityMonths debe ser un entero mayor que 0." } },
      400,
    );
  }

  if (validityMonths > 12) {
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "validityMonths no puede superar 12." } },
      400,
    );
  }

  const [client] = await db
    .select()
    .from(users)
    .where(eq(users.email, clientEmail))
    .limit(1);

  if (!client) {
    return c.json(
      { success: false, error: { code: "USER_NOT_FOUND", message: "Usuario no registrado." } },
      404,
    );
  }

  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(now.getMonth() + validityMonths);

  await db.insert(subscriptions).values({
    userId: client.id,
    isActive: true,
    paymentMethod: "cash_presencial",
    startDate: now,
    endDate,
    registeredByAdminId: auth.sub, // del JWT verificado
    receiptNumber: paperReceiptNumber,
  });

  return c.json({
    success: true,
    data: {
      message: `Acceso premium activado para ${clientEmail} hasta ${endDate.toISOString()}`,
    },
  });
});
