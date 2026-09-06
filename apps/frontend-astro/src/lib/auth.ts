import type { AstroCookies } from "astro";

export interface TokenPayload {
  sub: string;
  role: "customer" | "admin" | "clerk";
  exp: number;
}

export function getToken(cookies: AstroCookies): string | null {
  return cookies.get("loto_token")?.value ?? null;
}

export function decodePayload(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]!)) as Partial<TokenPayload>;
    if (!payload.sub || !payload.role || !payload.exp) return null;
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export function isExpired(payload: TokenPayload): boolean {
  return Date.now() / 1000 > payload.exp;
}

export function getValidPayload(cookies: AstroCookies): TokenPayload | null {
  const token = getToken(cookies);
  if (!token) return null;
  const payload = decodePayload(token);
  if (!payload || isExpired(payload)) return null;
  return payload;
}
