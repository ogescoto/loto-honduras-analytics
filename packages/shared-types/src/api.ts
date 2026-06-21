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
