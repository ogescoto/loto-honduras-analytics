/**
 * Job de ingestión con reintentos inteligentes (GitHub Actions, Node).
 *
 * Flujo por sorteo:
 *   1. Esperar availableAfterMin tras el horario del sorteo.
 *   2. Intentar hasta maxRetries veces con retryIntervalMin entre cada intento.
 *   3. Si ninguno tiene datos → descansar restAfterFailMin y reintentar el ciclo.
 *   4. En cuanto hay datos → ingerir y marcar como completado.
 *
 * El job se lanza 3 veces al día por GitHub Actions (una por franja horaria).
 * Cada ejecución detecta qué sorteos corresponden a esa franja, reintenta
 * hasta obtener resultados y persiste de forma idempotente (sessionId único).
 *
 * Variables de entorno requeridas (secrets de Actions):
 *   WEBSHARE_PROXY_LIST_URL  URL de descarga de la lista de proxies WebShare
 *   API_BASE_URL             base de la API de sorteos (loteriasdehonduras)
 *   APP_API_BASE_URL         base de NUESTRO backend (Cloudflare Worker)
 *   INGEST_SERVICE_TOKEN     token de servicio para POST /api/v1/ingest
 */
import { fetchProxyList, pickProxy, fetchViaProxy, type Proxy } from "./webshare.js";
import { parseSessions, SITE_GAME_IDS, type ParsedDraw } from "./parse-feed.js";
import { LOTO_HN_SCHEDULES, type GameSchedule, HN_UTC_OFFSET } from "./schedules.js";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Falta la variable de entorno: ${name}`);
  return v;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Descarga las últimas 3 sesiones de cada juego via /sessions.
 * Usa proxy si se provee lista, o fetch directo en modo local.
 */
async function fetchDraws(apiBase: string, proxies: Proxy[]): Promise<ParsedDraw[]> {
  const base = apiBase.replace(/\/$/, "");
  // Una sola siteGameId dispara el endpoint que devuelve los 13 juegos a la vez
  const anySiteId = Object.keys(SITE_GAME_IDS)[0]!;
  const url = `${base}/sessions?siteGameId=${anySiteId}&limit=3`;

  let body: string;
  if (proxies.length > 0) {
    const proxy = pickProxy(proxies);
    console.log(`  → Proxy ${proxy.host}:${proxy.port}`);
    body = await fetchViaProxy(url, proxy);
  } else {
    // Modo local: fetch directo sin proxy
    console.log(`  → Fetch directo (sin proxy): ${url}`);
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LotoAnalyticsBot/1.0)" },
    });
    if (!res.ok) throw new Error(`API respondió ${res.status}`);
    body = await res.text();
  }
  return parseSessions(body);
}

/**
 * Envía los sorteos al backend para upsert idempotente.
 * Devuelve el número de sorteos realmente insertados.
 */
async function ingestDraws(
  draws: ParsedDraw[],
  appApi: string,
  token: string,
): Promise<number> {
  const res = await fetch(`${appApi.replace(/\/$/, "")}/api/v1/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Ingest-Token": token,
    },
    body: JSON.stringify({ draws }),
  });
  if (!res.ok) {
    throw new Error(`Backend respondió ${res.status}: ${await res.text()}`);
  }
  const result = (await res.json()) as { data?: { inserted?: number } };
  return result.data?.inserted ?? 0;
}

/**
 * Determina qué sorteos de la franja actual (según hora UTC) aún necesitan
 * ingestión. Filtra por juegos cuya ventana de reintentos está activa ahora.
 *
 * La franja se identifica por la hora UTC en que se lanza el cron:
 *   17:30 UTC = sorteos 11 AM HN
 *   21:30 UTC = sorteos 3 PM HN
 *   03:30 UTC = sorteos 9 PM HN (día siguiente UTC)
 */
function getCurrentSlotSchedules(): GameSchedule[] {
  const now = Date.now();
  const localMs = now + HN_UTC_OFFSET * 3_600_000;
  const localDate = new Date(localMs);
  const localDay = localDate.getUTCDay();

  // Soporte para forzar franja manualmente (workflow_dispatch)
  const forceSlot = (process.env["FORCE_SLOT"] ?? "").trim().toLowerCase();
  let targetHour: number;

  if (forceSlot === "11am") {
    targetHour = 11;
  } else if (forceSlot === "3pm") {
    targetHour = 15;
  } else if (forceSlot === "9pm") {
    targetHour = 21;
  } else {
    // Auto-detectar por hora local Honduras
    const localHour = localDate.getUTCHours();
    if (localHour >= 10 && localHour < 14) targetHour = 11;
    else if (localHour >= 14 && localHour < 20) targetHour = 15;
    else targetHour = 21; // 20-23 y 0-3
  }

  return LOTO_HN_SCHEDULES.filter((s) => {
    if (s.drawHour !== targetHour) return false;
    if (s.days && !s.days.includes(localDay as 0 | 1 | 2 | 3 | 4 | 5 | 6)) return false;
    return true;
  });
}

/**
 * Ejecuta el ciclo de reintentos para un conjunto de sorteos.
 *
 * Algoritmo:
 *  - Por cada ciclo (hasta MAX_CYCLES):
 *    - Intentar maxRetries veces, cada retryIntervalMin minutos.
 *    - Si se obtienen datos de TODOS los juegos esperados → terminar OK.
 *    - Si se obtienen datos PARCIALES → ingerir lo que hay y seguir con los que faltan.
 *    - Si no hay nada → descansar restAfterFailMin y volver a intentar.
 *
 * `draws` viene del primer fetch exitoso; los juegos pendientes se detectan
 * comparando los games de las draws con los schedules esperados.
 */
async function runWithRetries(
  schedules: GameSchedule[],
  apiBase: string,
  appApi: string,
  token: string,
  proxies: Proxy[],
): Promise<void> {
  if (schedules.length === 0) {
    console.log("Sin sorteos programados para esta franja. Nada que ingerir.");
    return;
  }

  const expectedGames = new Set(schedules.map((s) => s.game));
  console.log(`Juegos esperados en esta franja: ${[...expectedGames].join(", ")}`);

  // Parámetros del primer schedule (todos deben ser iguales dentro de la franja)
  const { maxRetries, retryIntervalMin, restAfterFailMin } = schedules[0]!;
  const MAX_CYCLES = 2; // ciclo principal + 1 ciclo de recuperación tras descanso

  const completedGames = new Set<string>();
  let totalInserted = 0;

  for (let cycle = 0; cycle < MAX_CYCLES; cycle++) {
    if (cycle > 0) {
      console.log(`\nCiclo de recuperación #${cycle} — descansando ${restAfterFailMin} min antes de reintentar...`);
      await sleep(restAfterFailMin * 60_000);
    }

    let cycleInserted = 0;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const pending = [...expectedGames].filter((g) => !completedGames.has(g));
      if (pending.length === 0) break;

      console.log(`\n[Ciclo ${cycle + 1}] Intento ${attempt}/${maxRetries} — pendientes: ${pending.join(", ")}`);

      try {
        const allDraws = await fetchDraws(apiBase, proxies);
        // Filtrar solo los juegos pendientes de esta franja
        const relevantDraws = allDraws.filter((d) => pending.includes(d.game));

        if (relevantDraws.length > 0) {
          const inserted = await ingestDraws(relevantDraws, appApi, token);
          cycleInserted += inserted;
          totalInserted += inserted;

          // Marcar como completados los juegos con datos
          const gamesWithData = new Set(relevantDraws.map((d) => d.game));
          for (const g of gamesWithData) completedGames.add(g);

          console.log(`  ✓ Insertados: ${inserted}. Completados: ${[...completedGames].join(", ")}`);

          if (completedGames.size >= expectedGames.size) {
            console.log(`\nTodos los juegos completados (${totalInserted} sorteos insertados en total).`);
            return;
          }
        } else {
          console.log(`  ✗ Sin datos aún para los juegos pendientes.`);
        }
      } catch (err) {
        console.warn(`  ✗ Error en intento ${attempt}: ${(err as Error).message}`);
      }

      // Esperar antes del siguiente intento (no esperar después del último)
      if (attempt < maxRetries) {
        const stillPending = [...expectedGames].filter((g) => !completedGames.has(g));
        if (stillPending.length > 0) {
          console.log(`  ⏳ Esperando ${retryIntervalMin} min antes del próximo intento...`);
          await sleep(retryIntervalMin * 60_000);
        }
      }
    }

    const stillPending = [...expectedGames].filter((g) => !completedGames.has(g));
    if (stillPending.length === 0) {
      console.log(`\nTodos los juegos completados tras ciclo ${cycle + 1} (${totalInserted} insertados).`);
      return;
    }

    if (cycle === MAX_CYCLES - 1) {
      console.warn(`\nSe agotaron los ciclos. Juegos sin datos: ${stillPending.join(", ")}`);
    }
  }

  if (totalInserted > 0) {
    console.log(`\nIngestión parcial completada: ${totalInserted} sorteos insertados.`);
  }
}

async function main(): Promise<void> {
  const apiBase = requireEnv("API_BASE_URL");
  const appApi = requireEnv("APP_API_BASE_URL");
  const token = requireEnv("INGEST_SERVICE_TOKEN");

  // Modo local: sin proxy (WEBSHARE_PROXY_LIST_URL opcional)
  const proxyListUrl = process.env["WEBSHARE_PROXY_LIST_URL"] ?? "";
  let proxies: Proxy[] = [];
  if (proxyListUrl) {
    proxies = await fetchProxyList(proxyListUrl);
    console.log(`Proxies WebShare disponibles: ${proxies.length}`);
  } else {
    console.log("Modo local: sin proxy (fetch directo a la API).");
  }

  // Determinar franja activa según la hora actual HN
  const schedules = getCurrentSlotSchedules();

  if (schedules.length === 0) {
    console.log("No hay sorteos programados en la franja horaria actual. Terminando.");
    return;
  }

  // Ejecutar con lógica de reintentos
  await runWithRetries(schedules, apiBase, appApi, token, proxies);
}

main().catch((err) => {
  console.error("Ingestión falló con error fatal:", err);
  process.exit(1);
});
