/**
 * Worker programado: descarga y persiste el histórico de sorteos.
 * Sale a la fuente a través del gateway de proxy de **Decodo** para evitar
 * bloqueos por reputación de IP.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { pgTable, uuid, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { parseDraws, type ParsedDraw } from "./parser.js";

export interface Env {
  NEON_DATABASE_URL: string;
  LOTERIA_SOURCE_URL: string;
  // Gateway de proxy Decodo (credenciales por secreto, NO en el código).
  DECODO_PROXY_HOST: string;
  DECODO_PROXY_PORT: string;
  DECODO_PROXY_USERNAME: string;
  DECODO_PROXY_PASSWORD: string;
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

/**
 * Realiza el fetch a la URL objetivo saliendo por el gateway de Decodo.
 *
 * El runtime de Cloudflare Workers no expone un agente HTTP configurable
 * (no se puede pasar `agent`/`proxy` a `fetch`). Decodo expone un gateway
 * HTTP al que se le indica el destino y que reenvía la respuesta usando su
 * pool de IPs rotativas. La autenticación va por cabecera `Proxy-Authorization`
 * (Basic), construida desde las credenciales del entorno.
 */
export async function fetchViaDecodo(env: Env): Promise<string> {
  const credentials = `${env.DECODO_PROXY_USERNAME}:${env.DECODO_PROXY_PASSWORD}`;
  const basic = btoa(credentials);

  // El gateway recibe la URL destino y la cabecera de destino objetivo.
  const gatewayUrl = `https://${env.DECODO_PROXY_HOST}:${env.DECODO_PROXY_PORT}/`;

  const res = await fetch(gatewayUrl, {
    method: "GET",
    headers: {
      "Proxy-Authorization": `Basic ${basic}`,
      "X-Target-Url": env.LOTERIA_SOURCE_URL,
      "User-Agent": "Mozilla/5.0 (compatible; LotoAnalyticsBot/1.0)",
    },
  });

  if (!res.ok) {
    throw new Error(`Gateway Decodo respondió ${res.status} para la fuente.`);
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
  const html = await fetchViaDecodo(env);
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
