/**
 * Seed de DESARROLLO — datos realistas para revisión manual y demo. Idempotente.
 * Prefijo dev_. Ver ai-software-governance/03_Database/Seeds_Strategy.md
 */
import { faker } from "@faker-js/faker";
import type { Database } from "../client.js";
import {
  users,
  subscriptions,
  lotteryHistory,
  gamePatterns,
  metaPatterns,
} from "../schema.js";

const GAMES = ["diaria", "pega3", "premia2", "super_premio"] as const;

export async function seedDevelopment(db: Database): Promise<void> {
  faker.seed(42); // reproducible aunque sea "realista"

  // Idempotencia: limpiar antes (orden inverso a las FKs).
  await db.delete(metaPatterns);
  await db.delete(gamePatterns);
  await db.delete(lotteryHistory);
  await db.delete(subscriptions);
  await db.delete(users);

  // Usuarios clave con cada rol.
  const [admin] = await db
    .insert(users)
    .values({ email: "admin@loto.dev", name: "Admin Demo", role: "admin" })
    .returning();
  const [clerk] = await db
    .insert(users)
    .values({ email: "clerk@loto.dev", name: "Clerk Demo", role: "clerk" })
    .returning();

  const customers = await db
    .insert(users)
    .values(
      Array.from({ length: 8 }, () => ({
        email: faker.internet.email().toLowerCase(),
        name: faker.person.fullName(),
        role: "customer" as const,
      })),
    )
    .returning();

  // Una suscripción presencial vigente (registrada por admin).
  const now = new Date();
  const inSixMonths = new Date(now);
  inSixMonths.setMonth(now.getMonth() + 6);
  await db.insert(subscriptions).values({
    userId: customers[0]!.id,
    isActive: true,
    paymentMethod: "cash_presencial",
    startDate: now,
    endDate: inSixMonths,
    registeredByAdminId: admin!.id,
    receiptNumber: "REC-DEV-0001",
  });

  void clerk; // disponible para escenarios de cobro presencial.

  // Histórico de sorteos.
  await db.insert(lotteryHistory).values(
    Array.from({ length: 60 }, (_, i) => ({
      game: faker.helpers.arrayElement(GAMES),
      drawNumber: 10_000 + i,
      winningNumbers: [faker.number.int({ min: 0, max: 99 })],
      drawTimestamp: faker.date.recent({ days: 90 }),
    })),
  );

  // Patrones de primer nivel.
  const patterns = await db
    .insert(gamePatterns)
    .values([
      {
        patternType: "frio_caliente",
        game: "diaria",
        targetNumbers: [24, 8, 17],
        metadata: { window: "30d", appearancePct: 0.62 },
      },
      {
        patternType: "numerologia_suenos",
        game: "diaria",
        targetNumbers: [24],
        metadata: { sueno: "fuego", mapping: "tradicional_hn" },
      },
    ])
    .returning();

  // Meta-patrón cruzado (premium).
  await db.insert(metaPatterns).values({
    parentPatternIds: patterns.map((p) => p.id),
    description:
      "Coincidencia psico-estadística: número caliente (24) que coincide con sueño 'fuego'.",
    crossData: { confidenceScore: "94.2%", targetNumbers: [24, 8] },
  });
}
