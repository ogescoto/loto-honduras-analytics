/**
 * Esquema Drizzle — fuente del modelo de datos de Loto Honduras Analytics.
 *
 * MÓDULO PROTEGIDO (.aicodeprotect.yml): los cambios requieren migración
 * expand/contract revisada + APPROVED. Ver ai-software-governance/03_Database/Migrations.md
 */
import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";

export const paymentMethodEnum = pgEnum("payment_method", [
  "stripe",
  "cash_presencial",
]);

export const gameTypeEnum = pgEnum("game_type", [
  "diaria",
  "pega3",
  "premia2",
  "super_premio",
]);

// 1. Usuarios globales
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name"),
  role: text("role").default("customer").notNull(), // customer | admin | clerk
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Suscripciones híbridas (tiempo limitado)
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date").notNull(),
  registeredByAdminId: uuid("registered_by_admin_id").references(
    () => users.id,
  ),
  receiptNumber: text("receipt_number"),
});

// 3. Histórico crudo de sorteos (objetivo del scraping)
export const lotteryHistory = pgTable("lottery_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  game: gameTypeEnum("game").notNull(),
  drawNumber: integer("draw_number").unique().notNull(),
  winningNumbers: integer("winning_numbers").array().notNull(),
  drawTimestamp: timestamp("draw_timestamp").notNull(),
  insertedAt: timestamp("inserted_at").defaultNow().notNull(),
});

// 4. Patrones de primer nivel
export const gamePatterns = pgTable("game_patterns", {
  id: uuid("id").defaultRandom().primaryKey(),
  patternType: text("pattern_type").notNull(),
  game: gameTypeEnum("game").notNull(),
  targetNumbers: integer("target_numbers").array().notNull(),
  metadata: jsonb("metadata").notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

// 5. Meta-patrones (patrones sobre patrones) — contenido premium
export const metaPatterns = pgTable("meta_patterns", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentPatternIds: uuid("parent_pattern_ids").array().notNull(),
  description: text("description").notNull(),
  crossData: jsonb("cross_data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
