/**
 * Worker programado: descarga y persiste el histórico de sorteos.
 * Usa Scrapoxy como proxy rotativo para evitar bloqueos por IP.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { pgTable, uuid, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { parseDraws, type ParsedDraw } from "./parser.js";

export interface Env {
  NEON_DATABASE_URL: string;
  SCRAPOXY_URL: string;
  LOTERIA_SOURCE_URL: string;
}

// Definición local de la tabla destino (evita acoplar al paquete del backend).
const gameTypeEnum = pgEnum("game_type", ["diaria", "pega3", "premia2", "super_premio"]);
const lotteryHistory = pgTable("lottery_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  game: gameTypeEnum("game").notNull(),
  drawNumber: integer("draw_number").unique().notNull(),
  winningNumbers: integer("winning_numbers").array().notNull(),
  drawTimestamp: timestamp("draw_timestamp").notNull(),
  insertedAt: timestamp("inserted_at").defaultNow().notNull(),
});

async function fetchSource(env: Env): Promise<string> {
  // Si hay Scrapoxy configurado, las peticiones salen por el proxy rotativo.
  // En Workers no hay agente HTTP configurable, así que el proxy se aplica a
  // nivel de red/infra; aquí hacemos el fetch directo a la fuente.
  const res = await fetch(env.LOTERIA_SOURCE_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; LotoAnalyticsBot/1.0)" },
  });
  if (!res.ok) {
    throw new Error(`Fuente respondió ${res.status}`);
  }
  return res.text();
}

async function persist(env: Env, draws: ParsedDraw[]): Promise<number> {
  if (draws.length === 0) return 0;
  const db = drizzle(neon(env.NEON_DATABASE_URL));
  // Idempotente: si drawNumber ya existe, no inserta (no rompe).
  const result = await db
    .insert(lotteryHistory)
    .values(
      draws.map((d) => ({
        game: d.game,
        drawNumber: d.drawNumber,
        winningNumbers: d.winningNumbers,
        drawTimestamp: new Date(d.drawTimestamp),
      })),
    )
    .onConflictDoNothing({ target: lotteryHistory.drawNumber })
    .returning({ id: lotteryHistory.id });
  return result.length;
}

export async function runScrape(env: Env): Promise<number> {
  const html = await fetchSource(env);
  const draws = parseDraws(html);
  return persist(env, draws);
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    try {
      const inserted = await runScrape(env);
      console.log(`Scraper OK. Sorteos nuevos insertados: ${inserted}`);
    } catch (err) {
      console.error("Scraper falló:", err);
    }
  },
};
