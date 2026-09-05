/**
 * Cliente de proxies WebShare para la ingestión (contexto Node / GitHub Actions).
 *
 * WebShare entrega una LISTA de proxies (no un gateway). En Node SÍ se puede
 * enrutar `fetch` por un proxy con `undici` ProxyAgent — a diferencia del runtime
 * de Cloudflare Workers, donde `fetch` no admite proxy. Por eso la ingestión
 * principal corre aquí y no en el Worker.
 *
 * Formato de la lista de WebShare (una línea por proxy):
 *   ip:puerto:usuario:contraseña
 */
import { ProxyAgent, request } from "undici";

export interface Proxy {
  host: string;
  port: number;
  username: string;
  password: string;
}

/** Descarga y parsea la lista de proxies desde la URL de WebShare. */
export async function fetchProxyList(listUrl: string): Promise<Proxy[]> {
  const res = await request(listUrl);
  if (res.statusCode >= 400) {
    throw new Error(`WebShare respondió ${res.statusCode} al pedir la lista de proxies.`);
  }
  const text = await res.body.text();
  return parseProxyList(text);
}

/** Parsea el texto `ip:puerto:user:pass` (una línea por proxy). */
export function parseProxyList(text: string): Proxy[] {
  const proxies: Proxy[] = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [host, port, username, password] = trimmed.split(":");
    if (!host || !port || !username || !password) continue;
    proxies.push({ host, port: Number(port), username, password });
  }
  return proxies;
}

/** Elige un proxy al azar de la lista (rotación). */
export function pickProxy(proxies: Proxy[]): Proxy {
  if (proxies.length === 0) throw new Error("La lista de proxies de WebShare está vacía.");
  return proxies[Math.floor(Math.random() * proxies.length)]!;
}

/** Construye un ProxyAgent de undici con autenticación Basic para un proxy. */
export function agentFor(proxy: Proxy): ProxyAgent {
  const auth = Buffer.from(`${proxy.username}:${proxy.password}`).toString("base64");
  return new ProxyAgent({
    uri: `http://${proxy.host}:${proxy.port}`,
    token: `Basic ${auth}`,
  });
}

/** GET a `targetUrl` saliendo por el proxy indicado; devuelve el cuerpo como texto. */
export async function fetchViaProxy(targetUrl: string, proxy: Proxy): Promise<string> {
  const res = await request(targetUrl, {
    dispatcher: agentFor(proxy),
    headers: { "User-Agent": "Mozilla/5.0 (compatible; LotoAnalyticsBot/1.0)" },
  });
  if (res.statusCode >= 400) {
    throw new Error(`La fuente respondió ${res.statusCode} a través del proxy.`);
  }
  return res.body.text();
}
