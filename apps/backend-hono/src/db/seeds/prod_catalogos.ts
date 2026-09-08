/**
 * Seed de PRODUCCIÓN — carga estructural inicial de la BD. Idempotente.
 * PROHIBIDO: datos ficticios, usuarios de prueba, credenciales por defecto.
 * Ver ai-software-governance/03_Database/Seeds_Strategy.md
 *
 * Incluye el histórico REAL de sorteos extraído (Data/raw) y el cálculo de
 * patrones con el motor estadístico (misma lógica que la ingestión periódica).
 * Los sorteos se insertan con ON CONFLICT DO NOTHING por session_id; los
 * patrones se recalculan por juego (borra y regenera), por lo que es seguro
 * re-ejecutar.
 */
import type { Database } from "../client.js";
import { lotteryHistory } from "../schema.js";
import { loadHistoricalDraws } from "./import-raw.js";
import { computePatternsForGame } from "../../patterns/compute.js";
import type { GameType } from "@loto/shared-types";

const ALL_GAMES: GameType[] = [
  "diaria_11am", "diaria_3pm", "diaria_9pm",
  "pega3_11am", "pega3_3pm", "pega3_9pm",
  "premia2_11am", "premia2_3pm", "premia2_9pm",
  "juga3_11am", "juga3_3pm", "juga3_9pm",
  "super_premio",
];

/** Inserta en lotes para no exceder el límite de parámetros del driver. */
const INSERT_BATCH = 500;

export async function seedProduction(db: Database): Promise<void> {
  // Histórico REAL de sorteos (Data/raw/*.json), mapeado por siteGameId.
  const draws = loadHistoricalDraws();
  let inserted = 0;
  for (let i = 0; i < draws.length; i += INSERT_BATCH) {
    const batch = draws.slice(i, i + INSERT_BATCH);
    const rows = await db
      .insert(lotteryHistory)
      .values(batch)
      .onConflictDoNothing({ target: lotteryHistory.sessionId })
      .returning({ id: lotteryHistory.id });
    inserted += rows.length;
  }
  console.log(
    `  · ${inserted}/${draws.length} sorteos históricos insertados (${draws.length - inserted} ya existentes).`,
  );

  // Calcular patrones reales para los 13 juegos con el motor estadístico.
  let totalPatterns = 0;
  let totalMeta = 0;
  for (const game of ALL_GAMES) {
    const result = await computePatternsForGame(db, game, []);
    totalPatterns += result.patternsCreated;
    totalMeta += result.metaPatternsCreated;
    console.log(
      `  · ${game}: ${result.patternsCreated} patrones, ${result.metaPatternsCreated} meta-patrones`,
    );
  }
  console.log(`  · Total: ${totalPatterns} patrones + ${totalMeta} meta-patrones`);
}