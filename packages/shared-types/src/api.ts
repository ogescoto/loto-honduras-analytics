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
