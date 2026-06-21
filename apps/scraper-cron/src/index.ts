/**
 * Worker programado: descarga y persiste el histórico de sorteos.
 * Usa Scrapoxy como proxy rotativo para evitar bloqueos.
 */
import { parseDraws } from "./parser.js";

export interface Env {
  NEON_DATABASE_URL: string;
  SCRAPOXY_URL: string;
  LOTERIA_SOURCE_URL: string;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    // TODO: fetch vía Scrapoxy + parseDraws + upsert idempotente en lottery_history.
    const draws = parseDraws("");
    console.log(`Scraper ejecutado. Sorteos detectados: ${draws.length}`);
    void env;
  },
};
