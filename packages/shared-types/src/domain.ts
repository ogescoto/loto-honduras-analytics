/**
 * Tipos de dominio compartidos. Reflejan el modelo de datos (Drizzle schema)
 * sin acoplar las apps a la capa de persistencia.
 */

export type GameType =
  | "diaria_11am"
  | "diaria_3pm"
  | "diaria_9pm"
  | "pega3_11am"
  | "pega3_3pm"
  | "pega3_9pm"
  | "premia2_11am"
  | "premia2_3pm"
  | "premia2_9pm"
  | "juga3_11am"
  | "juga3_3pm"
  | "juga3_9pm"
  | "super_premio";

export type PaymentMethod = "stripe" | "cash_presencial" | "trial";

/**
 * Procedencia de un resultado en lottery_history:
 *  - "official": extraído de una fuente configurada (scraper/ingestión).
 *  - "manual": ingresado a mano por un admin/clerk (provisional).
 */
export type DrawSource = "official" | "manual";

/** Fuente configurada de datos (URL base de una familia de API de lotería). */
export interface DrawSourceRecord {
  id: string;
  name: string;
  baseUrl: string;
  apiFormat: string;
  enabled: boolean;
  isPrimary: boolean;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastError: string | null;
  createdAt: string;
}

export type UserRole = "customer" | "admin" | "clerk";

export type PatternType =
  | "frio_caliente"
  | "numerologia_suenos"
  | "par_impar"
  | "rachas_inversas";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  emailVerified: boolean;
  avatarUrl: string | null;
  hasPassword: boolean;
  hasGoogle: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  isActive: boolean;
  paymentMethod: PaymentMethod;
  startDate: string;
  endDate: string;
  registeredByAdminId: string | null;
  receiptNumber: string | null;
}

export interface LotteryDraw {
  id: string;
  game: GameType;
  sessionId: string;
  numbers: string[];
  signs: string[];
  drawDate: string;
}

export interface GamePattern {
  id: string;
  patternType: PatternType;
  game: GameType;
  targetNumbers: number[];
  metadata: Record<string, unknown>;
  calculatedAt: string;
}

export interface MetaPattern {
  id: string;
  parentPatternIds: string[];
  description: string;
  crossData: Record<string, unknown>;
  updatedAt: string;
}

export interface UserFavorite {
  id: string;
  userId: string;
  game: GameType;
  number: string;
  note: string | null;
  createdAt: string;
}
