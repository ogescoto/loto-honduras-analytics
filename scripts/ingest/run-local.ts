/**
 * Prueba local del flujo completo de ingestión.
 *
 * Simula lo que haría el cron de GitHub Actions pero:
 *   - Sin proxy (fetch directo a la API pública)
 *   - Sin esperas entre reintentos (1 solo intento)
 *   - Contra el backend local en :8787
 *   - Franja forzada por argumento: node run-local.ts [11am|3pm|9pm|all]
 *
 * Uso:
 *   INGEST_SERVICE_TOKEN=<token> pnpm --filter @loto/ingest-job run local [franja]
 *   o con tsx:
 *   INGEST_SERVICE_TOKEN=<token> npx tsx run-local.ts [franja]
 *
 * Si no se indica franja, usa la franja activa según la hora actual HN.
 * "all" prueba las 3 franjas a la vez (útil para verificar todos los juegos).
 */
import { parseSessions, SITE_GAME_IDS, type ParsedDraw } from "./parse-feed.js";
import { LOTO_HN_SCHEDULES, HN_UTC_OFFSET } from "./schedules.js";

const API_BASE  = process.env["API_BASE_URL"]  ?? "https://api.loteriasdehonduras.com/honduras";
const APP_API   = process.env["APP_API_BASE_URL"] ?? "http://localhost:8787";
const TOKEN     = process.env["INGEST_SERVICE_TOKEN"] ?? "";
const ARG_SLOT  = (process.argv[2] ?? "").toLowerCase();

if (!TOKEN) {
  console.error("Falta INGEST_SERVICE_TOKEN. Exporta la variable antes de ejecutar.");
  process.exit(1);
}

/** Descarga las últimas sesiones de todos los juegos via /sessions (fetch directo). */
async function fetchAllDraws(): Promise<ParsedDraw[]> {
  const anySiteId = Object.keys(SITE_GAME_IDS)[0]!;
  const url = `${API_BASE.replace(/\/$/, "")}/sessions?siteGameId=${anySiteId}&limit=3`;
  console.log(`  Fetching: ${url}`);
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; LotoAnalyticsLocalTest/1.0)" },
  });
  if (!res.ok) throw new Error(`API respondió ${res.status}: ${await res.text()}`);
  const body = await res.text();
  return parseSessions(body);
}

/** Envía sorteos al backend local. */
async function ingestToBackend(draws: ParsedDraw[]): Promise<{ received: number; valid: number; inserted: number }> {
  const res = await fetch(`${APP_API.replace(/\/$/, "")}/api/v1/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Ingest-Token": TOKEN,
    },
    body: JSON.stringify({ draws }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend respondió ${res.status}: ${text}`);
  }
  const result = (await res.json()) as { data?: { received?: number; valid?: number; inserted?: number } };
  return {
    received: result.data?.received ?? 0,
    valid: result.data?.valid ?? 0,
    inserted: result.data?.inserted ?? 0,
  };
}

/** Determina qué juegos corresponden a una franja horaria. */
function gamesForSlot(slot: "11am" | "3pm" | "9pm"): Set<string> {
  const hour = slot === "11am" ? 11 : slot === "3pm" ? 15 : 21;
  return new Set(LOTO_HN_SCHEDULES.filter((s) => s.drawHour === hour).map((s) => s.game));
}

/** Detecta la franja activa por la hora Honduras actual. */
function currentSlot(): "11am" | "3pm" | "9pm" {
  const localHour = new Date(Date.now() + HN_UTC_OFFSET * 3_600_000).getUTCHours();
  if (localHour >= 10 && localHour < 14) return "11am";
  if (localHour >= 14 && localHour < 20) return "3pm";
  return "9pm";
}

async function main(): Promise<void> {
  console.log("=== PRUEBA LOCAL DE INGESTIÓN ===");
  console.log(`  Backend: ${APP_API}`);
  console.log(`  API:     ${API_BASE}`);

  // Verificar que el backend local responde
  try {
    const health = await fetch(`${APP_API}/health`);
    const h = (await health.json()) as { success?: boolean };
    if (!h.success) throw new Error("backend no saludable");
    console.log("  Backend local: OK\n");
  } catch {
    console.error(`  ERROR: No se puede conectar al backend en ${APP_API}`);
    console.error("  Asegúrate de que el backend esté corriendo (pnpm --filter backend-hono dev)");
    process.exit(1);
  }

  // Obtener todos los sorteos de la API
  console.log("Obteniendo sorteos de la API...");
  let allDraws: ParsedDraw[];
  try {
    allDraws = await fetchAllDraws();
    console.log(`  Sorteos obtenidos: ${allDraws.length}`);
    if (allDraws.length === 0) {
      console.error("  La API no devolvió sorteos con números válidos. Verifica la conexión.");
      process.exit(1);
    }
  } catch (err) {
    console.error("  ERROR al obtener sorteos:", (err as Error).message);
    process.exit(1);
  }

  // Filtrar por franja
  let slotsToTest: Array<"11am" | "3pm" | "9pm">;
  if (ARG_SLOT === "all") {
    slotsToTest = ["11am", "3pm", "9pm"];
  } else if (ARG_SLOT === "11am" || ARG_SLOT === "3pm" || ARG_SLOT === "9pm") {
    slotsToTest = [ARG_SLOT];
  } else {
    const detected = currentSlot();
    console.log(`Franja auto-detectada (hora HN actual): ${detected}`);
    slotsToTest = [detected];
  }

  for (const slot of slotsToTest) {
    const expectedGames = gamesForSlot(slot);
    const slotDraws = allDraws.filter((d) => expectedGames.has(d.game));

    console.log(`\n--- Franja ${slot.toUpperCase()} ---`);
    console.log(`  Juegos esperados:  ${[...expectedGames].join(", ")}`);
    console.log(`  Sorteos disponibles: ${slotDraws.length}`);

    for (const d of slotDraws) {
      const date = new Date(d.drawDate).toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric" });
      console.log(`    ${d.game.padEnd(14)} ${date}  [${d.numbers.join(", ")}]  sid=${d.sessionId.slice(-6)}`);
    }

    const missingGames = [...expectedGames].filter((g) => !slotDraws.some((d) => d.game === g));
    if (missingGames.length > 0) {
      console.log(`  ⚠ Sin datos aún para: ${missingGames.join(", ")}`);
    }

    if (slotDraws.length === 0) {
      console.log("  Nada que ingerir para esta franja.");
      continue;
    }

    // Ingerir al backend local
    try {
      const result = await ingestToBackend(slotDraws);
      console.log(`\n  → Ingestión: recibidos=${result.received} válidos=${result.valid} insertados=${result.inserted}`);
      if (result.inserted === 0) {
        console.log("  (Todos los sorteos ya estaban en la BD — idempotente ✓)");
      } else {
        console.log(`  ✓ ${result.inserted} sorteo(s) nuevo(s) guardado(s).`);
      }
    } catch (err) {
      console.error("  ERROR al ingerir:", (err as Error).message);
    }
  }

  console.log("\n=== FIN DE PRUEBA ===");
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
