import { Hono } from "hono";
import { and, eq, gt, sql } from "drizzle-orm";
import type { Database } from "../../db/client.js";
import { subscriptions, users } from "../../db/schema.js";

export const subscriptionsRoutes = new Hono<{ Variables: { db: Database } }>();

// GET /api/v1/admin/subscriptions — lista suscripciones activas con datos del usuario.
subscriptionsRoutes.get("/", async (c) => {
  const db = c.get("db");
  const now = new Date();

  const rows = await db
    .select({
      id: subscriptions.id,
      userId: subscriptions.userId,
      email: users.email,
      name: users.name,
      paymentMethod: subscriptions.paymentMethod,
      startDate: subscriptions.startDate,
      endDate: subscriptions.endDate,
      receiptNumber: subscriptions.receiptNumber,
    })
    .from(subscriptions)
    .innerJoin(users, eq(subscriptions.userId, users.id))
    .where(
      and(
        eq(subscriptions.isActive, true),
        gt(subscriptions.endDate, now),
      ),
    )
    .orderBy(subscriptions.endDate);

  return c.json({ success: true, data: rows });
});
