import type { ApiResponse } from "@loto/shared-types";

const API_BASE =
  import.meta.env.PUBLIC_API_BASE_URL ?? "http://localhost:8787";

/** Fetch client-side (CSR): usa PUBLIC_API_BASE_URL de build time. */
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

/**
 * Fetch server-side (SSR en Cloudflare Pages): lee API_BASE_URL del runtime env.
 * Usar en frontmatter de páginas .astro (nunca en <script> client).
 */
export async function apiGetSSR<T>(
  path: string,
  locals: App.Locals,
  token?: string,
): Promise<ApiResponse<T>> {
  const base =
    (locals.runtime?.env as Record<string, string> | undefined)
      ?.API_BASE_URL ?? "http://localhost:8787";
  try {
    const res = await fetch(`${base}${path}`, {
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
