/**
 * Orquesta el cálculo de patrones desde el histórico y lo persiste en
 * game_patterns y meta_patterns. Pensado para ejecutarse periódicamente.
 */
import type { Database } from "../db/client.js";
import { lotteryHistory, gamePatterns, metaPatterns } from "../db/schema.js";
import type { GameType } from "@loto/shared-types";
import {
  hotCold,
  inverseStreaks,
  parity,
  crossMetaPatterns,
  type DrawRecord,
} from "./engine.js";
import { DREAM_GUIDE } from "./dream-guide.js";

const MAX_NUMBER = 99; // dominio de la lotería diaria (00–99)
const WINDOWS = [30, 90, 365];

export interface ComputeResult {
  patternsCreated: number;
  metaPatternsCreated: number;
}

/**
 * Calcula y persiste patrones para un juego.
 * @param dreamNumbers números derivados de sueños/búsquedas en tendencia.
 */
export async function computePatternsForGame(
  db: Database,
  game: GameType,
  dreamNumbers: number[],
  now: Date = new Date(),
): Promise<ComputeResult> {
  const rows = await db
    .select()
    .from(lotteryHistory)
    .where(eqGame(game));

  const draws: DrawRecord[] = rows.map((r) => ({
    sessionId: r.sessionId,
    numbers: r.numbers,
    drawDate: r.drawDate,
  }));

  const inserts: (typeof gamePatterns.$inferInsert)[] = [];

  for (const w of WINDOWS) {
    const hc = hotCold(draws, w, 5, now);
    inserts.push({
      patternType: "frio_caliente",
      game,
      targetNumbers: hc.hot.map((h) => h.number),
      metadata: { windowDays: w, hot: hc.hot, cold: hc.cold },
    });
  }

  const streaks = inverseStreaks(draws, MAX_NUMBER, 5);
  inserts.push({
    patternType: "rachas_inversas",
    game,
    targetNumbers: streaks.map((s) => s.number),
    metadata: { streaks },
  });

  const par = parity(draws);
  inserts.push({
    patternType: "par_impar",
    game,
    targetNumbers: [],
    metadata: { ...par },
  });

  // Reemplazar patrones anteriores del juego (evita acumulación infinita).
  await db.delete(gamePatterns).where(eq(gamePatterns.game, game));

  let patternsCreated = 0;
  if (inserts.length) {
    const created = await db.insert(gamePatterns).values(inserts).returning({ id: gamePatterns.id });
    patternsCreated = created.length;
  }

  // Meta-patrones: limpiar y recalcular (acoplados al juego por parentPatternIds en el futuro;
  // por ahora se limpian globalmente si no hay suscriptores activos con meta-patrones vigentes).
  // Salvo que se provea una lista explícita, usa la guía de los sueños (imaginario popular)
  // como numerología de referencia para el cruce calientes ∩ sueños.
  const dreamRef = dreamNumbers.length > 0 ? dreamNumbers : Object.values(DREAM_GUIDE);
  const hot30 = hotCold(draws, 30, 10, now).hot;
  const candidates = crossMetaPatterns(hot30, dreamRef);
  let metaPatternsCreated = 0;
  if (candidates.length) {
    const created = await db
      .insert(metaPatterns)
      .values(
        candidates.map((c) => ({
          parentPatternIds: [] as string[],
          description: c.description,
          crossData: { targetNumbers: c.targetNumbers, confidenceScore: c.confidenceScore },
        })),
      )
      .returning({ id: metaPatterns.id });
    metaPatternsCreated = created.length;
  }

  return { patternsCreated, metaPatternsCreated };
}

// Helper local para el where (evita importar eq en el caller).
import { eq } from "drizzle-orm";
function eqGame(game: GameType) {
  return eq(lotteryHistory.game, game);
}

