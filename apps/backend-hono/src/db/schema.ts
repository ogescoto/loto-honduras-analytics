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
  index,
  unique,
} from "drizzle-orm/pg-core";

export const paymentMethodEnum = pgEnum("payment_method", [
  "stripe",
  "cash_presencial",
  "trial",
]);

// 13 juegos reales: 4 familias × 3 horarios + Super Premio.
export const gameTypeEnum = pgEnum("game_type", [
  "diaria_11am",
  "diaria_3pm",
  "diaria_9pm",
  "pega3_11am",
  "pega3_3pm",
  "pega3_9pm",
  "premia2_11am",
  "premia2_3pm",
  "premia2_9pm",
  "juga3_11am",
  "juga3_3pm",
  "juga3_9pm",
  "super_premio",
]);

// Procedencia de cada resultado: extraído de fuente (oficial) o ingresado a mano.
export const sourceTypeEnum = pgEnum("source_type", ["official", "manual"]);

// 1. Usuarios globales
export const users = pgTable("users", {
  id:            uuid("id").defaultRandom().primaryKey(),
  email:         text("email").unique().notNull(),
  name:          text("name"),
  role:          text("role").default("customer").notNull(),
  banned:        boolean("banned").default(false).notNull(),
  // Credenciales opcionales — un usuario puede tener una, ambas o ninguna.
  passwordHash:  text("password_hash"),
  googleId:      text("google_id").unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  avatarUrl:     text("avatar_url"),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
});

// 2. Suscripciones híbridas (tiempo limitado)
export const subscriptions = pgTable("subscriptions", {
  id:                   uuid("id").defaultRandom().primaryKey(),
  userId:               uuid("user_id").references(() => users.id).notNull(),
  isActive:             boolean("is_active").default(true).notNull(),
  paymentMethod:        paymentMethodEnum("payment_method").notNull(),
  startDate:            timestamp("start_date").defaultNow().notNull(),
  endDate:              timestamp("end_date").notNull(),
  registeredByAdminId:  uuid("registered_by_admin_id").references(() => users.id),
  receiptNumber:        text("receipt_number"),
});

// 3. Tokens de recuperación de contraseña (TTL + marcado de uso)
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id:        uuid("id").defaultRandom().primaryKey(),
  userId:    uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  tokenHash: text("token_hash").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used:      boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3b. Fuentes de datos configuradas (URLs de familias de API de lotería).
// El admin gestiona varias fuentes para correlacionar resultados y subir la
// confianza de la data. Una y solo una puede estar marcada como primaria.
export const drawSources = pgTable("draw_sources", {
  id:            uuid("id").defaultRandom().primaryKey(),
  name:          text("name").notNull(),
  baseUrl:       text("base_url").notNull(),
  apiFormat:     text("api_format").default("site-games").notNull(),
  enabled:       boolean("enabled").default(true).notNull(),
  isPrimary:     boolean("is_primary").default(false).notNull(),
  lastSuccessAt: timestamp("last_success_at"),
  lastErrorAt:   timestamp("last_error_at"),
  lastError:     text("last_error"),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
});

// 4. Favoritos de usuario (juego + número marcado) — reordenables por el usuario.
export const userFavorites = pgTable(
  "user_favorites",
  {
    id:        uuid("id").defaultRandom().primaryKey(),
    userId:    uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    game:      gameTypeEnum("game").notNull(),
    number:    text("number").notNull(),
    note:      text("note"),
    position:  integer("position").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.game, t.number)],
);

// 4b. Combinaciones de patrones guardadas por el usuario (constructor personal).
// `features` son los FeatureCode del motor interactivo; `game` el juego objetivo.
// UNIQUE(userId, name) evita duplicados de nombre por cuenta.
export const userSavedPatterns = pgTable(
  "user_saved_patterns",
  {
    id:        uuid("id").defaultRandom().primaryKey(),
    userId:    uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    name:      text("name").notNull(),
    game:      gameTypeEnum("game").notNull(),
    features:  text("features").array().notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.name)],
);

// 5. Histórico crudo de sorteos (objetivo de la ingestión)
export const lotteryHistory = pgTable("lottery_history", {
  id:               uuid("id").defaultRandom().primaryKey(),
  game:             gameTypeEnum("game").notNull(),
  sessionId:        text("session_id").unique().notNull(),
  numbers:          text("numbers").array().notNull(),
  signs:            text("signs").array().notNull().default([]),
  drawDate:         timestamp("draw_date").notNull(),
  insertedAt:       timestamp("inserted_at").defaultNow().notNull(),
  // Trazabilidad y verificación de la data.
  source:           sourceTypeEnum("source").default("official").notNull(),
  verified:         boolean("verified").default(true).notNull(),
  sourceUrlId:      uuid("source_url_id").references(() => drawSources.id, { onDelete: "set null" }),
  enteredByAdminId: uuid("entered_by_admin_id").references(() => users.id, { onDelete: "set null" }),
  note:             text("note"),
});

// 6. Patrones de primer nivel
export const gamePatterns = pgTable("game_patterns", {
  id:            uuid("id").defaultRandom().primaryKey(),
  patternType:   text("pattern_type").notNull(),
  game:          gameTypeEnum("game").notNull(),
  targetNumbers: integer("target_numbers").array().notNull(),
  metadata:      jsonb("metadata").notNull(),
  calculatedAt:  timestamp("calculated_at").defaultNow().notNull(),
});

// 7. Meta-patrones (patrones sobre patrones) — contenido premium
export const metaPatterns = pgTable("meta_patterns", {
  id:               uuid("id").defaultRandom().primaryKey(),
  parentPatternIds: uuid("parent_pattern_ids").array().notNull(),
  description:      text("description").notNull(),
  crossData:        jsonb("cross_data").notNull(),
  updatedAt:        timestamp("updated_at").defaultNow().notNull(),
});

// 8. Estado latente de los 100 números por juego
// Se recalcula tras cada sorteo. Una fila por número (00-99) por juego.
// features: objeto JSON con el valor de cada una de las 15 características.
export const numberStates = pgTable(
  "number_states",
  {
    id:           uuid("id").defaultRandom().primaryKey(),
    game:         gameTypeEnum("game").notNull(),
    number:       integer("number").notNull(),           // 0-99
    features:     jsonb("features").notNull(),           // Record<FeatureCode, boolean|number>
    updatedAt:    timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.game, t.number)],
);

// 9. Historial de cumplimiento — qué características tenía el número ganador justo antes de caer
// Solo se guarda el ganador, no los 100 números. Permite calcular tasas de acierto por característica.
export const featureCompliance = pgTable("feature_compliance", {
  id:               uuid("id").defaultRandom().primaryKey(),
  game:             gameTypeEnum("game").notNull(),
  sessionId:        text("session_id").notNull(),        // FK lógica a lottery_history.session_id
  winnerNumber:     integer("winner_number").notNull(),  // número que cayó (0-99)
  activeFeatures:   text("feature_codes").array().notNull(), // características que tenía activas
  recordedAt:       timestamp("recorded_at").defaultNow().notNull(),
});

// 10. Eventos de ingestión — historial de logs del scraper para el panel admin.
// Cada chequeo de fuente (éxito/error) y cada resumen de ejecución del cron
// generan una fila. level: info | warn | error.
export const ingestionEvents = pgTable(
  "ingestion_events",
  {
    id:        uuid("id").defaultRandom().primaryKey(),
    level:     text("level").default("info").notNull(),  // info | warn | error
    sourceId:  uuid("source_id").references(() => drawSources.id, { onDelete: "set null" }),
    game:      gameTypeEnum("game"),
    message:   text("message").notNull(),
    meta:      jsonb("meta"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("ingestion_events_created_at_idx").on(t.createdAt)],
);
