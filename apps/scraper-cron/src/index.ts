/**
 * Worker de ingestión de sorteos — LOTO Honduras.
 *
 * Disparado por cron a las :15 de cada franja HN (11:15 / 15:15 / 21:15).
 * Por cada ejecución intenta obtener los resultados de los juegos de la franja;
 * si aún no están publicados, espera 5 minutos y reintenta (hasta un tope),
 * igual que pediría un operador: "intenta a las :15 y cada 5 min hasta que
 * salgan los juegos correspondientes".
 *
 * Multi-fuente (verificación cruzada):
 *   - Consulta las fuentes habilitadas vía GET /api/v1/sources del backend.
 *   - Un resultado se marca verified=true cuando lo reporta la fuente PRIMARIA
 *     o cuando ≥2 fuentes coinciden (correlación para dar confianza a la data).
 *   - Persiste en el backend (POST /api/v1/ingest), con caída a persistencia
 *     directa en Neon si el backend no responde.
 *
 * Endpoint activo de la fuente (2026-09): GET /site-games/{siteGameId}, que
 * devuelve las últimas ~6 sesiones por juego (incluido score de La Diaria con
 * IDs que se resuelven con game.score_layout).
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import {
  parseSiteGameSessions,
  SITE_GAME_IDS,
  type ParsedDraw,
} from "./parser.js";
import { LOTO_HN_SCHEDULES, type GameSchedule, HN_UTC_OFFSET } from "./schedules.js";
import type { GameType } from "@loto/shared-types";

export interface Env {
  NEON_DATABASE_URL: string;
  /** Base de la API de la fuente por defecto si no hay fuentes configuradas. */
  API_BASE_URL?: string;
  /** Base de nuestro backend (para /api/v1/sources y /api/v1/ingest). */
  APP_API_BASE_URL?: string;
  /** Token de servicio para POST /api/v1/ingest y /api/v1/sources/health. */
  INGEST_SERVICE_TOKEN?: string;
}

// Definición local de la tabla (evita acoplar al paquete del backend).
const gameTypeEnum = pgEnum("game_type", [
  "diaria_11am", "diaria_3pm", "diaria_9pm",
  "pega3_11am", "pega3_3pm", "pega3_9pm",
  "premia2_11am", "premia2_3pm", "premia2_9pm",
  "juga3_11am", "juga3_3pm", "juga3_9pm",
  "super_premio",
]);
const lotteryHistory = pgTable("lottery_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  game: gameTypeEnum("game").notNull(),
  sessionId: text("session_id").unique().notNull(),
  numbers: text("numbers").array().notNull(),
  signs: text("signs").array().notNull().default([]),
  drawDate: timestamp("draw_date").notNull(),
  insertedAt: timestamp("inserted_at").defaultNow().notNull(),
});

const UA = "Mozilla/5.0 (compatible; LotoAnalyticsCron/1.0)";
const RETRY_INTERVAL_MS = 5 * 60 * 1000; // reintento cada 5 minutos
const MAX_ATTEMPTS = 12; // ~60 min de ventana por franja
/** Sesiones elegibles de días previos (auto-recuperación de resultados tardíos). */
const CATCH_UP_DAYS = 6;

/** Marcadores (día 04:00Z) elegibles: hoy + los CATCH_UP_DAYS días previos. */
function eligibleMarkers(todayMarkerMs: number): number[] {
  const out: number[] = [];
  for (let i = 0; i <= CATCH_UP_DAYS; i++) out.push(todayMarkerMs - i * 86_400_000);
  return out;
}

interface RemoteSource {
  id: string | null;
  name: string;
  baseUrl: string;
  isPrimary: boolean;
}

interface SlotInfo {
  targetHour: number;
  expected: GameType[];
  markerMs: number;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Determina la franja activa (hora HN) y los juegos esperados + marcador de día. */
function computeSlot(nowMs: number): SlotInfo {
  const localMs = nowMs + HN_UTC_OFFSET * 3_600_000;
  const local = new Date(localMs);
  const day = local.getUTCDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const hour = local.getUTCHours();

  const targetHour = hour >= 10 && hour < 14 ? 11 : hour >= 14 && hour < 20 ? 15 : 21;

  const schedules: GameSchedule[] = LOTO_HN_SCHEDULES.filter(
    (s) => s.drawHour === targetHour && (!s.days || s.days.includes(day)),
  );
  const expected = schedules.map((s) => s.game as GameType);
  const markerMs = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), 4, 0, 0, 0);

  return { targetHour, expected, markerMs };
}

function siteIdByGame(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [id, game] of Object.entries(SITE_GAME_IDS)) map[game] = id;
  return map;
}

async function getJson(baseUrl: string, path: string): Promise<unknown> {
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
    headers: { "User-Agent": UA },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${path}`);
  return res.json();
}

/** Carga las fuentes habilitadas desde el backend; fallback a API_BASE_URL. */
async function loadSources(env: Env): Promise<RemoteSource[]> {
  if (env.APP_API_BASE_URL) {
    try {
      const res = await fetch(`${env.APP_API_BASE_URL.replace(/\/$/, "")}/api/v1/sources`, {
        headers: { "User-Agent": UA },
      });
      if (res.ok) {
        const body = (await res.json()) as {
          data?: Array<{ id: string; name: string; baseUrl: string; isPrimary: boolean }>;
        };
        const rows = body.data ?? [];
        if (rows.length > 0) {
          return rows.map((r) => ({ id: r.id, name: r.name, baseUrl: r.baseUrl, isPrimary: r.isPrimary }));
        }
      }
    } catch {
      // caer al fallback local
    }
  }
  if (env.API_BASE_URL) {
    return [{ id: null, name: "default", baseUrl: env.API_BASE_URL, isPrimary: true }];
  }
  return [];
}

interface LogEvent {
  level: "info" | "warn" | "error";
  sourceId?: string;
  game?: string;
  message: string;
  meta?: Record<string, unknown>;
}

/** Envía un evento de log al backend (best-effort, no bloqueante). */
async function emitLogEvent(env: Env, ev: LogEvent): Promise<void> {
  if (!env.APP_API_BASE_URL || !env.INGEST_SERVICE_TOKEN) return;
  try {
    await fetch(`${env.APP_API_BASE_URL.replace(/\/$/, "")}/api/v1/ingest/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Ingest-Token": env.INGEST_SERVICE_TOKEN },
      body: JSON.stringify({
        level: ev.level,
        sourceId: ev.sourceId,
        game: ev.game,
        message: ev.message,
        meta: ev.meta,
      }),
    });
  } catch {
    // no crítico
  }
}

/** Reporta salud de la fuente al backend (best-effort). */
async function reportHealth(env: Env, source: RemoteSource, ok: boolean, error?: string): Promise<void> {
  if (!env.APP_API_BASE_URL || !env.INGEST_SERVICE_TOKEN) return;
  const message = ok
    ? `Fuente "${source.name}" OK`
    : `Fuente "${source.name}": ${error?.slice(0, 200) ?? "error desconocido"}`;
  await emitLogEvent(env, {
    level: ok ? "info" : "error",
    sourceId: source.id ?? undefined,
    message,
  });
  if (!source.id) return;
  try {
    await fetch(`${env.APP_API_BASE_URL.replace(/\/$/, "")}/api/v1/sources/health`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Ingest-Token": env.INGEST_SERVICE_TOKEN },
      body: JSON.stringify({ sourceId: source.id, ok, error: error?.slice(0, 300) }),
    });
  } catch {
    // no crítico
  }
}

interface IngestDraw {
  game: GameType;
  sessionId: string;
  numbers: string[];
  signs: string[];
  drawDate: string;
  verified: boolean;
  sourceUrlId?: string;
}

/** Persiste vía backend; cae a inserción directa en Neon si no hay backend. */
async function ingestDraws(env: Env, draws: IngestDraw[]): Promise<number> {
  if (draws.length === 0) return 0;

  if (env.APP_API_BASE_URL && env.INGEST_SERVICE_TOKEN) {
    try {
      const res = await fetch(`${env.APP_API_BASE_URL.replace(/\/$/, "")}/api/v1/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Ingest-Token": env.INGEST_SERVICE_TOKEN,
        },
        body: JSON.stringify({ draws }),
      });
      if (res.ok) {
        const body = (await res.json()) as { data?: { inserted?: number } };
        return body.data?.inserted ?? 0;
      }
      await emitLogEvent(env, {
        level: "warn",
        message: `POST /api/v1/ingest → HTTP ${res.status}; fallback a inserción directa (${draws.length} sorteos)`,
        meta: { httpStatus: res.status, draws: draws.length },
      });
    } catch {
      await emitLogEvent(env, {
        level: "error",
        message: `POST /api/v1/ingest no disponible; fallback a inserción directa (${draws.length} sorteos)`,
        meta: { draws: draws.length },
      });
    }
  }

  // Fallback directo (oficial, sin verificación cruzada enriquecida).
  const db = drizzle(neon(env.NEON_DATABASE_URL));
  const result = await db
    .insert(lotteryHistory)
    .values(
      draws.map((d) => ({
        game: d.game,
        sessionId: d.sessionId,
        numbers: d.numbers,
        signs: d.signs,
        drawDate: new Date(d.drawDate),
      })),
    )
    .onConflictDoNothing({ target: lotteryHistory.sessionId })
    .returning({ id: lotteryHistory.id });
  return result.length;
}

/** Intenta el slot: reintenta cada 5 min hasta publicar todos o agotar intentos. */
async function runSlot(env: Env, slot: SlotInfo): Promise<void> {
  if (slot.expected.length === 0) {
    console.log("Sin sorteos esperados en esta franja.");
    return;
  }
  const siteId = siteIdByGame();
  // Marcadores elegibles: hoy y los CATCH_UP_DAYS previos. Cada ejecución
  // re-ingiere lo que falte de los días recientes (idempotente por session_id),
  // de modo que un resultado publicado tarde se auto-recupera en el siguiente cron.
  const markers = eligibleMarkers(slot.markerMs);
  const markerSet = new Set(markers);
  let totalInserted = 0;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      console.log(`  ⏳ intento ${attempt}: esperando 5 min antes de reintentar...`);
      await sleep(RETRY_INTERVAL_MS);
    }

    const sources = await loadSources(env);
    if (sources.length === 0) {
      console.log("Sin fuentes disponibles (ni backend ni API_BASE_URL).");
      return;
    }

    const missing: string[] = [];
    const toIngest: IngestDraw[] = [];

    for (const game of slot.expected) {
      const id = siteId[game];
      if (!id) continue;

      // Sesión → reportes de las fuentes que la vieron (consenso + verificación).
      const bySession = new Map<string, Array<{ source: RemoteSource; draw: ParsedDraw }>>();
      let foundToday = false;

      for (const source of sources) {
        try {
          const doc = await getJson(source.baseUrl, `/site-games/${id}`);
          const draws = parseSiteGameSessions(id, doc);
          for (const draw of draws) {
            const marker = Date.parse(draw.drawDate);
            if (!Number.isNaN(marker) && markerSet.has(marker)) {
              const list = bySession.get(draw.sessionId) ?? [];
              list.push({ source, draw });
              bySession.set(draw.sessionId, list);
              if (marker === slot.markerMs) foundToday = true;
            }
          }
          await reportHealth(env, source, true);
        } catch (err) {
          const msg = (err as Error).message;
          await reportHealth(env, source, false, msg);
        }
      }

      if (bySession.size === 0) {
        missing.push(game);
        console.log(`  · ${game}: aún sin publicar (${sources.map((x) => x.name).join(", ")})`);
        continue;
      }

      // Consenso: el reporte del primario manda; si ningún primario lo vio,
      // hace falta que ≥2 fuentes coincidan en la secuencia de números.
      for (const [sessionId, reports] of bySession) {
        const primary = reports.find((r) => r.source.isPrimary);
        const draw = (primary ?? reports[0]!).draw;
        const sigCounts = new Map<string, number>();
        for (const r of reports) {
          const sig = r.draw.numbers.join("|");
          sigCounts.set(sig, (sigCounts.get(sig) ?? 0) + 1);
        }
        const agreeing = sigCounts.get(draw.numbers.join("|")) ?? 1;
        const verified = primary ? true : agreeing >= 2;

        toIngest.push({
          game,
          sessionId,
          numbers: draw.numbers,
          signs: draw.signs,
          // Normaliza el marcador de la fuente (04:00Z) al día civil canónico (10:00Z = 04:00 HN).
          drawDate: new Date(Date.parse(draw.drawDate) + HN_UTC_OFFSET * 3_600_000).toISOString(),
          verified,
          ...(primary?.source.id ? { sourceUrlId: primary.source.id } : {}),
        });
        console.log(
          `  ✓ ${game} [${sessionId}]: [${draw.numbers.join(", ")}] ${verified ? "verified" : "pendiente"} (fuentes: ${reports.length})`,
        );
      }

      if (!foundToday) {
        missing.push(game);
        console.log(`  · ${game}: sorteo de HOY aún no publicado (se rellenó ${bySession.size} sesión(es) previa(s))`);
      }
    }

    if (toIngest.length > 0) {
      totalInserted += await ingestDraws(env, toIngest);
    }

    if (missing.length === 0) {
      console.log(`Franja completada. Insertados en esta ejecución: ${totalInserted}`);
      await emitLogEvent(env, {
        level: "info",
        message: `Franja ${slot.targetHour}:00 HN completada — ${totalInserted} sorteos insertados`,
        meta: { targetHour: slot.targetHour, inserted: totalInserted },
      });
      return;
    }

    console.log(`Faltan por publicar (${missing.length}): ${missing.join(", ")}`);
    if (attempt === MAX_ATTEMPTS) {
      console.warn(
        `Se agotaron ${MAX_ATTEMPTS} intentos. Quedaron sin publicar: ${missing.join(", ")} (se auto-recuperarán en el próximo cron)`,
      );
      await emitLogEvent(env, {
        level: "warn",
        message: `Franja ${slot.targetHour}:00 HN — agotados ${MAX_ATTEMPTS} intentos; sin publicar: ${missing.join(", ")}`,
        meta: { targetHour: slot.targetHour, inserted: totalInserted, missing, attempts: MAX_ATTEMPTS },
      });
    }
  }
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const slot = computeSlot(Date.now());
    console.log(`[cron] Franja ${slot.targetHour}:00 HN — juegos: ${slot.expected.join(", ")}`);
    ctx.waitUntil(runSlot(env, slot));
  },
};
