/**
 * Tipos de dominio compartidos. Reflejan el modelo de datos (Drizzle schema)
 * sin acoplar las apps a la capa de persistencia.
 */

export type GameType = "diaria" | "pega3" | "premia2" | "super_premio";

export type PaymentMethod = "stripe" | "cash_presencial";

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
  drawNumber: number;
  winningNumbers: number[];
  drawTimestamp: string;
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
