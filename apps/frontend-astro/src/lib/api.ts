/**
 * Cliente del backend Edge API. La URL base se configura por entorno
 * (PUBLIC_API_BASE_URL); por defecto, el wrangler dev local.
 */
import type { ApiResponse } from "@loto/shared-types";

const API_BASE =
  import.meta.env.PUBLIC_API_BASE_URL ?? "http://localhost:8787";

export async function apiGet<T>(
  path: string,
  token?: string,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: "No se pudo contactar la API." },
    };
  }
}
