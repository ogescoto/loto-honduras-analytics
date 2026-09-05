import { Hono } from "hono";
import { and, eq, gte, desc, asc, inArray } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { lotteryHistory } from "../db/schema.js";
import type { GameType } from "@loto/shared-types";

const VALID_GAMES = new Set<GameType>([
  "diaria_11am", "diaria_3pm", "diaria_9pm",
  "pega3_11am",  "pega3_3pm",  "pega3_9pm",
  "premia2_11am","premia2_3pm","premia2_9pm",
  "juga3_11am",  "juga3_3pm",  "juga3_9pm",
  "super_premio",
]);

/**
 * Familias de juegos: "all_diaria" → todas las jornadas de La Diaria, etc.
 * El valor especial "all" devuelve todos los juegos sin filtro.
 */
const FAMILY_GAMES: Record<string, GameType[]> = {
  all_diaria:  ["diaria_11am",  "diaria_3pm",  "diaria_9pm"],
  all_pega3:   ["pega3_11am",   "pega3_3pm",   "pega3_9pm"],
  all_premia2: ["premia2_11am", "premia2_3pm", "premia2_9pm"],
  all_juga3:   ["juga3_11am",   "juga3_3pm",   "juga3_9pm"],
};

const MAX_DAYS = 30;

export const historyRoutes = new Hono<{ Variables: { db: Database } }>();

// GET /api/v1/history?game=<GameType|all_*>&days=<1-30>&order=asc|desc
// Soporta game=all_diaria para ver todas las jornadas de una familia.
historyRoutes.get("/", async (c) => {
  const gameParam = c.req.query("game");
  const daysParam = c.req.query("days");
  const orderParam = c.req.query("order") ?? "desc";

  const familyGames = gameParam ? FAMILY_GAMES[gameParam] : undefined;
  const isSingleGame = gameParam && VALID_GAMES.has(gameParam as GameType);

  if (!gameParam || (!isSingleGame && !familyGames)) {
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: `Parámetro "game" requerido y debe ser un juego o familia válida.` } },
      400,
    );
  }

  const days = Math.min(Math.max(parseInt(daysParam ?? "10", 10) || 10, 1), MAX_DAYS);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const orderFn = orderParam === "asc" ? asc : desc;

  const db = c.get("db");

  const whereClause = familyGames
    ? and(inArray(lotteryHistory.game, familyGames), gte(lotteryHistory.drawDate, since))
    : and(eq(lotteryHistory.game, gameParam as GameType), gte(lotteryHistory.drawDate, since));

  const draws = await db
    .select({
      id:        lotteryHistory.id,
      game:      lotteryHistory.game,
      sessionId: lotteryHistory.sessionId,
      numbers:   lotteryHistory.numbers,
      signs:     lotteryHistory.signs,
      drawDate:  lotteryHistory.drawDate,
    })
    .from(lotteryHistory)
    .where(whereClause)
    .orderBy(orderFn(lotteryHistory.drawDate));

  return c.json({ success: true, data: draws });
});

// GET /api/v1/history/search?numbers=07,23&days=<1-30>[&game=<juego|familia|all>]
// Busca qué días y juegos salió un número o combinación en los últimos N días.
// `game` acepta un juego ("diaria_9pm"), una familia ("all_diaria") o se omite
// para buscar en todos los juegos.
historyRoutes.get("/search", async (c) => {
  const numbersParam = c.req.query("numbers") ?? "";
  const daysParam = c.req.query("days");
  const gameParam = c.req.query("game");

  const query = numbersParam.trim();
  if (!query) {
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: `Parámetro "numbers" requerido (ej: 07 o 07,23).` } },
      400,
    );
  }

  // Límite de longitud para evitar DoS
  if (query.length > 50) {
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: `Parámetro "numbers" demasiado largo (máx. 50 caracteres).` } },
      400,
    );
  }

  // Parsear números buscados: "07,23" → ["07", "23"], también acepta "7" → "07"
  // Solo se aceptan tokens puramente numéricos (1-2 dígitos)
  const rawTokens = query.split(/[,\s]+/).map((n) => n.trim()).filter(Boolean);
  const invalidToken = rawTokens.find((n) => !/^\d{1,2}$/.test(n));
  if (invalidToken) {
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: `Token inválido: "${invalidToken.slice(0, 10)}". Solo se aceptan números del 0 al 99.` } },
      400,
    );
  }
  const searched = rawTokens.map((n) => n.padStart(2, "0"));

  if (searched.length === 0 || searched.length > 6) {
    return c.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: `Ingresa entre 1 y 6 números separados por coma.` } },
      400,
    );
  }

  const days = Math.min(Math.max(parseInt(daysParam ?? "30", 10) || 30, 1), MAX_DAYS);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const db = c.get("db");

  // Filtro de juego opcional: acepta un juego individual ("diaria_9pm"),
  // una familia ("all_diaria") o ausente/vacío = todos los juegos.
  const familyGames = gameParam ? FAMILY_GAMES[gameParam] : undefined;
  const isSingleGame = gameParam && VALID_GAMES.has(gameParam as GameType);
  const validGameFilter = familyGames || isSingleGame;

  const baseWhere = validGameFilter
    ? and(
        familyGames
          ? inArray(lotteryHistory.game, familyGames)
          : eq(lotteryHistory.game, gameParam as GameType),
        gte(lotteryHistory.drawDate, since),
      )
    : gte(lotteryHistory.drawDate, since);

  const draws = await db
    .select({
      id:        lotteryHistory.id,
      game:      lotteryHistory.game,
      sessionId: lotteryHistory.sessionId,
      numbers:   lotteryHistory.numbers,
      signs:     lotteryHistory.signs,
      drawDate:  lotteryHistory.drawDate,
    })
    .from(lotteryHistory)
    .where(baseWhere)
    .orderBy(desc(lotteryHistory.drawDate));

  // Filtrar en memoria: todos los números buscados deben estar en el sorteo
  const matches = draws.filter((d) =>
    searched.every(
      (n) => d.numbers.includes(n) || d.signs.includes(n),
    ),
  );

  return c.json({
    success: true,
    data: {
      searched,
      days,
      total: matches.length,
      draws: matches,
    },
  });
});
