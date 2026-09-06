/**
 * Rutas del motor de características analíticas:
 *   GET  /api/v1/features/:game        — estado latente de los 100 números para un juego
 *   POST /api/v1/features/:game/filter — filtro combinatorio: recibe lista de feature codes,
 *                                        devuelve candidatos que cumplen todas (o aproximación)
 *   POST /api/v1/features/:game/refresh — (uso interno/cron) recalcula y persiste en number_states
 */
import { Hono } from "hono";
import { eq, desc, asc, inArray } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { lotteryHistory, numberStates, featureCompliance } from "../db/schema.js";
import type { GameType } from "@loto/shared-types";
import {
  ALL_FEATURES,
  FEATURE_LABELS,
  FEATURE_DESCRIPTIONS,
  computeNumberStates,
  filterByFeatures,
  type FeatureCode,
} from "../patterns/features-engine.js";
import { complianceSummary, type Draw } from "../patterns/compliance.js";

const SLOT_GAMES: Record<string, string[]> = {
  diaria_11am: ["diaria_11am"],
  diaria_3pm:  ["diaria_3pm"],
  diaria_9pm:  ["diaria_9pm"],
  pega3_11am:  ["pega3_11am"],
  pega3_3pm:   ["pega3_3pm"],
  pega3_9pm:   ["pega3_9pm"],
  premia2_11am:["premia2_11am"],
  premia2_3pm: ["premia2_3pm"],
  premia2_9pm: ["premia2_9pm"],
  juga3_11am:  ["juga3_11am"],
  juga3_3pm:   ["juga3_3pm"],
  juga3_9pm:   ["juga3_9pm"],
  super_premio:["super_premio"],
};

const ALL_GAME_TYPES = new Set(Object.keys(SLOT_GAMES));

// Familia de un juego: mismo tipo en las distintas jornadas (diaria_11am → todas las diaria).
function familyOf(game: GameType): GameType[] {
  const prefix = game.replace(/_(\d+am|\d+pm)$/, "");
  return Object.keys(SLOT_GAMES).filter(
    (g) => g.startsWith(`${prefix}_`) || g === prefix,
  ) as GameType[];
}

type Variables = { db: Database };

export const featuresRoutes = new Hono<{ Variables: Variables }>();

// GET /api/v1/features/catalog — catálogo de características (público)
featuresRoutes.get("/catalog", (c) => {
  const catalog = ALL_FEATURES.map((code) => ({
    code,
    label: FEATURE_LABELS[code],
    description: FEATURE_DESCRIPTIONS[code],
  }));
  return c.json({ success: true, data: catalog });
});

// GET /api/v1/features/config — configuración de patrones (público, para el
// constructor y para la pantalla de administración de patrones).
// Devuelve el JSON interpretable y testeable: versión, bloques, manual y cada
// patrón con código, etiqueta, descripción, bloque, y umbrales/parámetros.
const FEATURE_BLOCKS: Record<FeatureCode, string> = {
  frio_absoluto: "A", frio_horario: "A", despertar_promedio: "A", latencia_reciente: "A",
  caliente_cortoplazo: "B", eco_consecutivo: "B", eco_horario: "B",
  digitos_gemelos: "C", cluster_decena_activa: "C", terminacion_caliente: "C",
  inversion_directa: "D", multiplo_base_cinco: "D", multiplo_generacional: "D",
  producto_interno: "D", suma_consecutiva: "D",
  presencia_corta: "E", sobredemora: "E",
  pareja_100: "F", complemento_99: "F", vecino_ganador: "F", raiz_digitos_ganador: "F",
  docena_activa: "G", decena_activa_jornada: "G", favorito_jornada_anterior: "G",
  terminacion_fria: "G",
};

const BLOCK_INFO: Record<string, { name: string; desc: string }> = {
  A: { name: "Recencia", desc: "Ausencia del número (global o por jornada)." },
  B: { name: "Frecuencia", desc: "Ecos y repeticiones recientes." },
  C: { name: "Anatomía", desc: "Propiedades del número mismo (gemelos, decena, terminación)." },
  D: { name: "Aritmética", desc: "Relaciones aritméticas con el último ganador." },
  E: { name: "Recencia +", desc: "Ventanas de recencia extendidas y sobredemora." },
  F: { name: "Complemento", desc: "Números complementarios del último ganador." },
  G: { name: "Estructura por jornada", desc: "Contexto del juego/jornada." },
};

featuresRoutes.get("/config", (c) => {
  const patterns = ALL_FEATURES.map((code) => ({
    code,
    label: FEATURE_LABELS[code],
    description: FEATURE_DESCRIPTIONS[code],
    block: FEATURE_BLOCKS[code],
  }));
  const manual = {
    version: "1.0",
    autor: "Loto Honduras Analytics",
    explicacion:
      "Cada patrón define una condición sobre un número (00-99). Una combinación agrupa 1-7 patrones; " +
      "un número 'candidato' cumple TODAS las condiciones. La efectividad se mide contra el histórico: " +
      "cuántos sorteos pasados tuvieron un ganador que cumplía toda la combinación (hitRatePct).",
    bloques: BLOCK_INFO,
    comoInterpretarElJson:
      "patterns: lista de patrones con code (identificador estable), label, description y block (A-G). " +
      "El campo 'expresion' describe la regla en lenguaje natural; el motor la implementa en features-engine.ts.",
  };
  return c.json({
    success: true,
    data: {
      version: 1,
      generatedAt: new Date().toISOString(),
      manual,
      blocks: BLOCK_INFO,
      patterns,
      defaults: {
        maxFeaturesPerCombo: 7,
        maxEvalDays: 90,
        games: Object.keys(SLOT_GAMES),
      },
    },
  });
});

// GET /api/v1/features/:game — estado latente actual de los 100 números
featuresRoutes.get("/:game", async (c) => {
  const game = c.req.param("game") as GameType;
  if (!ALL_GAME_TYPES.has(game))
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `Juego inválido: "${game}".` } }, 400);

  const db = c.get("db");

  // Intentar leer desde caché (number_states) si existe
  const cached = await db
    .select()
    .from(numberStates)
    .where(eq(numberStates.game, game))
    .orderBy(numberStates.number);

  if (cached.length === 100) {
    return c.json({
      success: true,
      data: {
        game,
        updatedAt: cached[0]!.updatedAt,
        numbers: cached.map((r) => ({ number: r.number, features: r.features })),
      },
    });
  }

  // Sin caché: calcular en vivo
  const states = await _computeForGame(db, game);
  return c.json({
    success: true,
    data: {
      game,
      updatedAt: new Date(),
      numbers: states.map((s) => ({ number: s.number, features: s.features })),
    },
  });
});

// POST /api/v1/features/:game/filter — filtro combinatorio
featuresRoutes.post("/:game/filter", async (c) => {
  const game = c.req.param("game") as GameType;
  if (!ALL_GAME_TYPES.has(game))
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `Juego inválido: "${game}".` } }, 400);

  const body = (await c.req.json().catch(() => null)) as { features?: string[] } | null;
  if (!body?.features || !Array.isArray(body.features) || body.features.length === 0)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Se requiere al menos una característica." } }, 400);

  const invalid = body.features.filter((f) => !ALL_FEATURES.includes(f as FeatureCode));
  if (invalid.length > 0)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `Características inválidas: ${invalid.join(", ")}.` } }, 400);

  if (body.features.length > 7)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Máximo 7 características por filtro." } }, 400);

  const db = c.get("db");
  const requested = body.features as FeatureCode[];

  // Leer desde caché o calcular en vivo
  const cached = await db
    .select()
    .from(numberStates)
    .where(eq(numberStates.game, game))
    .orderBy(numberStates.number);

  const states = cached.length === 100
    ? cached.map((r) => ({
        number: r.number,
        features: r.features as Record<FeatureCode, boolean>,
        daysSinceLastGlobal: 0,
        daysSinceLastInSlot: 0,
        countLast10Days: 0,
      }))
    : await _computeForGame(db, game);

  const result = filterByFeatures(states, requested);

  return c.json({
    success: true,
    data: {
      game,
      requestedFeatures: requested.map((f) => ({ code: f, label: FEATURE_LABELS[f] })),
      exact: result.exact,
      partial: result.partial,
      matchCount: result.matchCount,
      totalRequested: requested.length,
      isExact: result.exact.length > 0,
    },
  });
});

// POST /api/v1/features/:game/hits — historial de aciertos por sorteo (juego seleccionado).
// Para cada sorteo histórico del juego (orden cronológico), reconstruye el estado latente
// justo ANTES de ese sorteo y reporta si el/los ganadores cumplían TODAS las features.
// Implementación optimizada: solo evalúa ganadores con búsquedas binarias (compliance.ts),
// evita el loop de los 100 números por sorteo que excedía la CPU del Worker.
featuresRoutes.post("/:game/hits", async (c) => {
  const game = c.req.param("game") as GameType;
  if (!ALL_GAME_TYPES.has(game))
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `Juego inválido: "${game}".` } }, 400);

  const body = (await c.req.json().catch(() => null)) as { features?: string[]; days?: number } | null;
  if (!body?.features || !Array.isArray(body.features) || body.features.length === 0)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Se requiere al menos una característica." } }, 400);

  const invalid = body.features.filter((f) => !ALL_FEATURES.includes(f as FeatureCode));
  if (invalid.length > 0)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `Características inválidas: ${invalid.join(", ")}.` } }, 400);

  if (body.features.length > 7)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Máximo 7 características por combinación." } }, 400);

  // Ventana de emulación (opcional): evaluar solo sorteos de los últimos N días.
  const days = Math.min(Math.max(Number(body.days) || 30, 1), 90);

  const db = c.get("db");
  const requested = body.features as FeatureCode[];
  const family = familyOf(game);

  // Todos los sorteos de la familia, ascendentes (cronólogico).
  const familyRows = await db
    .select({ game: lotteryHistory.game, sessionId: lotteryHistory.sessionId, numbers: lotteryHistory.numbers, drawDate: lotteryHistory.drawDate })
    .from(lotteryHistory)
    .where(inArray(lotteryHistory.game, family))
    .orderBy(asc(lotteryHistory.drawDate));

  const slotRows = familyRows.filter((r) => r.game === game);
  // Ventana de emulación: solo sorteos del juego a partir de `hoy - days`.
  const cutoff = Date.now() - days * 86_400_000;
  const windowed = slotRows.filter((r) => new Date(r.drawDate).getTime() >= cutoff);
  const toDraw = (rows: typeof familyRows): Draw[] =>
    rows.map((r) => ({
      game: r.game,
      sessionId: r.sessionId,
      numbers: r.numbers,
      drawDate: new Date(r.drawDate).getTime(),
    }));

  const res = complianceSummary(requested, toDraw(familyRows), toDraw(windowed.length ? windowed : slotRows));
  const pct = res.evaluatedDraws > 0 ? Math.round((res.totalHits / res.evaluatedDraws) * 100) : 0;

  // Últimos 30 sorteos cronológicos (los más recientes primero).
  return c.json({
    success: true,
    data: {
      game,
      days,
      requestedFeatures: requested.map((f) => ({ code: f, label: FEATURE_LABELS[f] })),
      totalHits: res.totalHits,
      evaluatedDraws: res.evaluatedDraws,
      hitRatePct: pct,
      hits: res.hits.slice().reverse(),
    },
  });
});

// POST /api/v1/features/:game/refresh — recalcula y persiste (llamado por ingest)
featuresRoutes.post("/:game/refresh", async (c) => {
  const game = c.req.param("game") as GameType;
  if (!ALL_GAME_TYPES.has(game))
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `Juego inválido: "${game}".` } }, 400);

  const db = c.get("db");
  const count = await _computeAndPersist(db, game);
  return c.json({ success: true, data: { game, upserted: count } });
});

// ─── helpers ────────────────────────────────────────────────────────────────

async function _computeForGame(db: Database, game: GameType) {
  // Familia completa (todas las jornadas del mismo tipo) para patrones inter-jornada.
  const family = familyOf(game);
  const familyRows = await db
    .select({ numbers: lotteryHistory.numbers, drawDate: lotteryHistory.drawDate })
    .from(lotteryHistory)
    .where(inArray(lotteryHistory.game, family))
    .orderBy(desc(lotteryHistory.drawDate));

  // Jornada objetivo (solo la jornada específica del juego).
  const slotRows = await db
    .select({ numbers: lotteryHistory.numbers, drawDate: lotteryHistory.drawDate })
    .from(lotteryHistory)
    .where(eq(lotteryHistory.game, game))
    .orderBy(desc(lotteryHistory.drawDate));

  const toDraw = (rows: typeof familyRows) =>
    rows.map((d) => ({ numbers: d.numbers, drawDate: new Date(d.drawDate) }));

  return computeNumberStates(toDraw(familyRows), toDraw(slotRows), toDraw(familyRows));
}

export async function computeAndPersistFeatures(db: Database, game: GameType): Promise<number> {
  return _computeAndPersist(db, game);
}

async function _computeAndPersist(db: Database, game: GameType): Promise<number> {
  const states = await _computeForGame(db, game);

  await db
    .insert(numberStates)
    .values(
      states.map((s) => ({
        game,
        number: s.number,
        features: s.features,
        updatedAt: new Date(),
      })),
    )
    .onConflictDoUpdate({
      target: [numberStates.game, numberStates.number],
      set: {
        features: numberStates.features,
        updatedAt: new Date(),
      },
    });

  return states.length;
}
