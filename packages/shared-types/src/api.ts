/**
 * Contratos de la API REST (request/response DTOs).
 * Convención de respuesta: ver ai-software-governance/04_Backend/API_Design.md
 */

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** POST /api/v1/admin/register-physical-payment */
export interface RegisterPhysicalPaymentDto {
  clientEmail: string;
  validityMonths: number;
  paperReceiptNumber: string;
}

/** Respuesta de meta-patrones premium (GET /api/v1/premium/meta-patterns) */
export interface MetaPatternResult {
  id: string;
  description: string;
  targetNumbers: number[];
  confidenceScore: string;
}

/** POST /api/v1/auth/login */
export interface LoginDto {
  email: string;
}

export interface LoginResult {
  token: string;
  user: { id: string; email: string; role: import("./domain.js").UserRole };
}

/** POST /api/v1/payments/checkout — inicia checkout de suscripción online (Stripe). */
export interface CreateCheckoutDto {
  /** Meses de suscripción a comprar. */
  validityMonths: number;
}

export interface CreateCheckoutResult {
  /** URL de Stripe Checkout a la que redirigir al cliente. */
  checkoutUrl: string;
}

// ─── Fuentes de datos y resultados (admin + verificación cruzada) ───────────

/** Fuente de datos visible para el scraper (solo habilitadas) y para el admin. */
export interface DrawSourceDto {
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

/** POST /api/v1/admin/sources — alta de fuente. */
export interface CreateDrawSourceDto {
  name: string;
  baseUrl: string;
  apiFormat?: string;
  isPrimary?: boolean;
}

/** PATCH /api/v1/admin/sources/:id — actualización parcial. */
export interface UpdateDrawSourceDto {
  name?: string;
  baseUrl?: string;
  apiFormat?: string;
  enabled?: boolean;
  isPrimary?: boolean;
}

/** POST /api/v1/admin/draws/manual — alta/actualización de resultado manual. */
export interface ManualDrawDto {
  game: import("./domain.js").GameType;
  /** Fecha ISO del sorteo (fecha local normalizada; ej: 2026-09-04T04:00:00.000Z). */
  drawDate: string;
  numbers: string[];
  signs?: string[];
  note?: string;
}

/** Fila de sorteo con trazabilidad (listado admin). */
export interface AdminDrawRow {
  id: string;
  game: import("./domain.js").GameType;
  sessionId: string;
  numbers: string[];
  signs: string[];
  drawDate: string;
  source: import("./domain.js").DrawSource;
  verified: boolean;
  sourceName: string | null;
  note: string | null;
  enteredBy: string | null;
}
