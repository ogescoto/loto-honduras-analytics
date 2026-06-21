/**
 * Seed de TEST — fixtures deterministas y reproducibles. Prefijo test_.
 * Datos fijos, aislados por caso de uso. Ver ai-software-governance/03_Database/Seeds_Strategy.md
 */
import type { Database } from "../client.js";
import { users, subscriptions, lotteryHistory } from "../schema.js";

export const testUsers = {
  customerActive: {
    email: "test.active@loto.test",
    name: "Test Active",
    role: "customer" as const,
  },
  customerExpired: {
    email: "test.expired@loto.test",
    name: "Test Expired",
    role: "customer" as const,
  },
  admin: { email: "test.admin@loto.test", name: "Test Admin", role: "admin" as const },
};

export async function seedTest(db: Database): Promise<void> {
  await db.delete(subscriptions);
  await db.delete(lotteryHistory);
  await db.delete(users);

  const inserted = await db
    .insert(users)
    .values([testUsers.customerActive, testUsers.customerExpired, testUsers.admin])
    .returning();

  const active = inserted.find((u) => u.email === testUsers.customerActive.email)!;
  const expired = inserted.find((u) => u.email === testUsers.customerExpired.email)!;
  const admin = inserted.find((u) => u.email === testUsers.admin.email)!;

  // Suscripción vigente (determinista).
  await db.insert(subscriptions).values({
    userId: active.id,
    isActive: true,
    paymentMethod: "stripe",
    startDate: new Date("2026-01-01T00:00:00Z"),
    endDate: new Date("2030-01-01T00:00:00Z"),
    registeredByAdminId: null,
    receiptNumber: null,
  });

  // Suscripción expirada (para probar denegación de acceso premium).
  await db.insert(subscriptions).values({
    userId: expired.id,
    isActive: true,
    paymentMethod: "cash_presencial",
    startDate: new Date("2025-01-01T00:00:00Z"),
    endDate: new Date("2025-02-01T00:00:00Z"),
    registeredByAdminId: admin.id,
    receiptNumber: "REC-TEST-0001",
  });

  await db.insert(lotteryHistory).values({
    game: "diaria",
    drawNumber: 99_001,
    winningNumbers: [24],
    drawTimestamp: new Date("2026-06-01T21:00:00Z"),
  });
}
