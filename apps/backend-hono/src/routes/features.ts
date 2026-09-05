/**
 * Rutas del motor de características analíticas:
 *   GET  /api/v1/features/:game        — estado latente de los 100 números para un juego
 *   POST /api/v1/features/:game/filter — filtro combinatorio: recibe lista de feature codes,
 *                                        devuelve candidatos que cumplen todas (o aproximación)
 *   POST /api/v1/features/:game/refresh — (uso interno/cron) recalcula y persiste en number_states
 */
import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";
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
  const allDraws = await db
    .select({ numbers: lotteryHistory.numbers, drawDate: lotteryHistory.drawDate })
    .from(lotteryHistory)
    .where(eq(lotteryHistory.game, game))
    .orderBy(desc(lotteryHistory.drawDate));

  return computeNumberStates(
    allDraws.map((d) => ({ numbers: d.numbers, drawDate: new Date(d.drawDate) })),
    allDraws.map((d) => ({ numbers: d.numbers, drawDate: new Date(d.drawDate) })),
  );
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
