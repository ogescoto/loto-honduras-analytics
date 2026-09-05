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
import { loadHistoricalDraws } from "./import-raw.js";
import { computePatternsForGame } from "../../patterns/compute.js";
import type { GameType } from "@loto/shared-types";

const ALL_GAMES: GameType[] = [
  "diaria_11am", "diaria_3pm", "diaria_9pm",
  "pega3_11am", "pega3_3pm", "pega3_9pm",
  "premia2_11am", "premia2_3pm", "premia2_9pm",
  "juga3_11am", "juga3_3pm", "juga3_9pm",
  "super_premio",
];

/** Inserta en lotes para no exceder el límite de parámetros del driver. */
const INSERT_BATCH = 500;

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

  // Histórico de sorteos REAL (Data/raw/*.json), mapeado por siteGameId.
  const draws = loadHistoricalDraws();
  for (let i = 0; i < draws.length; i += INSERT_BATCH) {
    await db.insert(lotteryHistory).values(draws.slice(i, i + INSERT_BATCH));
  }
  console.log(`  · ${draws.length} sorteos históricos cargados.`);

  // Calcular patrones reales para los 13 juegos con el motor estadístico.
  let totalPatterns = 0;
  let totalMeta = 0;
  for (const game of ALL_GAMES) {
    const result = await computePatternsForGame(db, game, []);
    totalPatterns += result.patternsCreated;
    totalMeta += result.metaPatternsCreated;
    console.log(`  · ${game}: ${result.patternsCreated} patrones, ${result.metaPatternsCreated} meta-patrones`);
  }
  console.log(`  · Total: ${totalPatterns} patrones + ${totalMeta} meta-patrones`);
}
