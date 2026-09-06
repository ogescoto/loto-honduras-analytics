/**
 * Rutas del motor de características analíticas:
 *   GET  /api/v1/features/:game        — estado latente de los 100 números para un juego
 *   POST /api/v1/features/:game/filter — filtro combinatorio: recibe lista de feature codes,
 *                                        devuelve candidatos que cumplen todas (o aproximación)
 *   POST /api/v1/features/:game/refresh — (uso interno/cron) recalcula y persiste en number_states
 */
import { Hono } from "hono";
import { eq, desc, asc, inArray, sql } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { lotteryHistory, numberStates, featureCompliance } from "../db/schema.js";
import type { GameType } from "@loto/shared-types";
import {
  ALL_FEATURES,
  FEATURE_LABELS,
  FEATURE_DESCRIPTIONS,
  FEATURE_META,
  findExclusiveConflict,
  computeNumberStates,
  filterByFeatures,
  type FeatureCode,
} from "../patterns/features-engine.js";
import { complianceSummary, topFeatureCombos, type Draw } from "../patterns/compliance.js";

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

/** Etiqueta de la jornada/hora para cada juego. */
const SLOT_HOURS: Record<string, string> = {
  diaria_11am: "11 AM", diaria_3pm: "3 PM", diaria_9pm: "9 PM",
  pega3_11am: "11 AM", pega3_3pm: "3 PM", pega3_9pm: "9 PM",
  premia2_11am: "11 AM", premia2_3pm: "3 PM", premia2_9pm: "9 PM",
  juga3_11am: "11 AM", juga3_3pm: "3 PM", juga3_9pm: "9 PM",
  super_premio: "9 PM (dom)",
};

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
    block: FEATURE_BLOCKS[code],
    scope: FEATURE_META[code].scope,
    category: FEATURE_META[code].category,
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
  frecuencia_100: "H", reciente_5_juego: "H", terminacion_top_100: "H",
  decena_top_100: "H", promedio_vencido: "H", gusto_sueno: "H",
};

const BLOCK_INFO: Record<string, { name: string; desc: string }> = {
  A: { name: "Recencia", desc: "Ausencia del número (global o por jornada)." },
  B: { name: "Frecuencia", desc: "Ecos y repeticiones recientes." },
  C: { name: "Anatomía", desc: "Propiedades del número mismo (gemelos, decena, terminación)." },
  D: { name: "Aritmética", desc: "Relaciones aritméticas con el último ganador." },
  E: { name: "Recencia +", desc: "Ventanas de recencia extendidas y sobredemora." },
  F: { name: "Complemento", desc: "Números complementarios del último ganador." },
  G: { name: "Estructura por jornada", desc: "Contexto del juego/jornada." },
  H: { name: "Perfil del juego", desc: "Patrones según los últimos 100 sorteos de ESTE juego + imaginario popular." },
};

featuresRoutes.get("/config", (c) => {
  const patterns = ALL_FEATURES.map((code) => ({
    code,
    label: FEATURE_LABELS[code],
    description: FEATURE_DESCRIPTIONS[code],
    block: FEATURE_BLOCKS[code],
    scope: FEATURE_META[code].scope,
    windowDesc: FEATURE_META[code].windowDesc,
  }));
  const manual = {
    version: "1.0",
    autor: "Loto Honduras Analytics",
    explicacion:
      "Cada patrón define una condición sobre un número (00-99). Una combinación agrupa 1-7 patrones; " +
      "un número 'candidato' cumple TODAS las condiciones. La efectividad se mide contra el histórico: " +
      "cuántos sorteos pasados tuvieron un ganador que cumplía toda la combinación (hitRatePct).",
    alcance:
      "Los patrones analizan secuencias continuas de sorteos, no una hora aislada. El campo 'scope' indica el " +
      "ámbito: 'familia' = analiza TODA la serie del tipo de juego (varias jornadas/horas y días seguidos, p. ej. " +
      "las 3 horas de La Diaria); 'juego' = se calcula contra la jornada/hora concreta de ese juego (por ejemplo " +
      "solo Diaria 3 PM). Cuando un patrón aplica a una sola hora de sorteo, su descripción y 'windowDesc' lo dicen.",
    bloques: BLOCK_INFO,
    comoInterpretarElJson:
      "patterns: lista con code (identificador estable), label, description, block (A-H), scope (familia|juego) " +
      "y windowDesc (ventana de análisis). El campo 'expresion' describe la regla en lenguaje natural; el motor " +
      "la implementa en features-engine.ts.",
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

  const conflict = findExclusiveConflict(body.features as FeatureCode[]);
  if (conflict)
    return c.json({
      success: false,
      error: {
        code: "INCOMPATIBLE_COMBINATION",
        message: `No se pueden combinar patrones de la misma clasificación (${conflict.category}): ${conflict.codes.join(", ")}.`,
      },
    }, 400);

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

  const conflict = findExclusiveConflict(body.features as FeatureCode[]);
  if (conflict)
    return c.json({
      success: false,
      error: {
        code: "INCOMPATIBLE_COMBINATION",
        message: `No se pueden combinar patrones de la misma clasificación (${conflict.category}): ${conflict.codes.join(", ")}.`,
      },
    }, 400);

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

// POST /api/v1/features/:game/top-combos — top de combinaciones de K características
// que más veces estuvieron activas en el ganador de la jornada en los últimos N sorteos.
// Body: { k?: number (def.3), days?: number (def.30), top?: number (def.10) }
featuresRoutes.post("/:game/top-combos", async (c) => {
  const game = c.req.param("game") as GameType;
  if (!ALL_GAME_TYPES.has(game))
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `Juego inválido: "${game}".` } }, 400);

  const body = (await c.req.json().catch(() => null)) as { k?: number; days?: number; top?: number } | null;
  const db = c.get("db");
  const family = familyOf(game);

  const familyRows = await db
    .select({ game: lotteryHistory.game, sessionId: lotteryHistory.sessionId, numbers: lotteryHistory.numbers, drawDate: lotteryHistory.drawDate })
    .from(lotteryHistory)
    .where(inArray(lotteryHistory.game, family))
    .orderBy(asc(lotteryHistory.drawDate));

  const slotRows = familyRows.filter((r) => r.game === game);
  const toDraw = (rows: typeof familyRows): Draw[] =>
    rows.map((r) => ({
      game: r.game,
      sessionId: r.sessionId,
      numbers: r.numbers,
      drawDate: new Date(r.drawDate).getTime(),
    }));

  const result = topFeatureCombos(toDraw(familyRows), toDraw(slotRows), {
    k: Number(body?.k) || 3,
    maxDraws: Math.min(Math.max(Number(body?.days) || 30, 1), 120),
    topN: Number(body?.top) || 10,
  });

  return c.json({
    success: true,
    data: {
      game,
      k: Number(body?.k) || 3,
      days: body?.days || 30,
      evaluatedDraws: result.evaluatedDraws,
      combos: result.combos,
    },
  });
});

// POST /api/v1/features/:game/analytics — análisis de números favoritos o una
// combinación: frecuencias por jornada, día de la semana, mes (últimos N meses)
// y en qué patrones se da, para un período ajustable.
// Body: { numbers: number[], days?: number (1-120, def. 120) }
featuresRoutes.post("/:game/analytics", async (c) => {
  const game = c.req.param("game") as GameType;
  if (!ALL_GAME_TYPES.has(game))
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `Juego inválido: "${game}".` } }, 400);

  const body = (await c.req.json().catch(() => null)) as { numbers?: number[]; days?: number } | null;
  const requested = (body?.numbers ?? []).filter((n) => Number.isInteger(n) && n >= 0 && n <= 99);
  const days = Math.min(Math.max(Number(body?.days) || 120, 1), 120);

  if (requested.length === 0 || requested.length > 50)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "numbers debe tener entre 1 y 50 números (0-99)." } }, 400);

  const db = c.get("db");
  const family = familyOf(game);
  const familyRows = await db
    .select({ game: lotteryHistory.game, sessionId: lotteryHistory.sessionId, numbers: lotteryHistory.numbers, drawDate: lotteryHistory.drawDate })
    .from(lotteryHistory)
    .where(inArray(lotteryHistory.game, family))
    .orderBy(asc(lotteryHistory.drawDate));

  const slotRows = familyRows.filter((r) => r.game === game);
  const toDraw = (rows: typeof familyRows): Draw[] =>
    rows.map((r) => ({
      game: r.game,
      sessionId: r.sessionId,
      numbers: r.numbers,
      drawDate: new Date(r.drawDate).getTime(),
    }));

  const familyDraws = toDraw(familyRows);
  const slotDraws = toDraw(slotRows);

  const cutoff = Date.now() - days * 86_400_000;
  const set = new Set(requested);
  const target = requested[0]!; // estado de patrones lo mostramos para el primer número

  // Frecuencias por jornada (slot) / día de semana / mes, dentro de la ventana.
  const bySlot = new Map<string, number>();
  const byWeekday = new Map<string, number>();
  const byMonth = new Map<string, number>();
  let totalHits = 0;
  let rangeEnd: string | null = null;
  let rangeStart: string | null = null;

  for (const draw of slotDraws) {
    if (draw.drawDate < cutoff) continue;
    const dt = new Date(draw.drawDate);
    const present = draw.numbers.some((raw) => set.has(parseInt(raw, 10)));
    if (!present) continue;

    totalHits++;
    const d = new Date(dt.getTime() + 6 * 3600_000); // a hora HN para el día civil (GMT-6)
    const isoDay = d.toISOString().slice(0, 10);
    if (!rangeStart || isoDay < rangeStart) rangeStart = isoDay;
    if (!rangeEnd || isoDay > rangeEnd) rangeEnd = isoDay;

    const slotName = SLOT_HOURS[game] ?? game;
    bySlot.set(slotName, (bySlot.get(slotName) ?? 0) + 1);

    const weekday = d.toLocaleString("es-HN", { timeZone: "UTC", weekday: "short" });
    byWeekday.set(weekday, (byWeekday.get(weekday) ?? 0) + 1);

    const month = d.toLocaleString("es-HN", { timeZone: "UTC", month: "short", year: "2-digit" });
    byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
  }

  // Patrones activos del número objetivo en el estado actual (cache number_states).
  const cachedStates = await db
    .select()
    .from(numberStates)
    .where(eq(numberStates.game, game))
    .orderBy(numberStates.number);
  const targetStateRow = cachedStates.find((r) => r.number === target);
  const activePatterns = targetStateRow
    ? ALL_FEATURES.filter((f) => (targetStateRow.features as Record<string, boolean>)[f]).map((f) => ({
        code: f,
        label: FEATURE_LABELS[f],
        block: FEATURE_BLOCKS[f],
        category: FEATURE_META[f].category,
        scope: FEATURE_META[f].scope,
      }))
    : [];

  // Frecuencia por número en la ventana (para los solicitados).
  const perNumber = requested.map((n) => {
    let c = 0;
    for (const draw of slotDraws) {
      if (draw.drawDate < cutoff) continue;
      if (draw.numbers.some((raw) => parseInt(raw, 10) === n)) c++;
    }
    return { number: n, count: c };
  });

  const sortDesc = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);

  return c.json({
    success: true,
    data: {
      game,
      numbers: requested,
      primaryNumber: target,
      days,
      range: { from: rangeStart, to: rangeEnd },
      totalOccurrences: totalHits,
      perNumber,
      bySlot: sortDesc(bySlot),
      byWeekday: sortDesc(byWeekday),
      byMonth: sortDesc(byMonth),
      activePatterns,
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
        features: sql`excluded.features`,
        updatedAt: new Date(),
      },
    });

  return states.length;
}
