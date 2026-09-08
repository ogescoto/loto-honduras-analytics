/**
 * Gestión admin de resultados de sorteos.
 *
 * MÓDULO PROTEGIDO (.aicodeprotect.yml) — aprobado para esta feature.
 * Protegido por requireAuth + requireRole en index.ts (/api/v1/admin/*).
 *
 * - GET    /            listado reciente con trazabilidad (source/verified/origen).
 * - POST   /manual      alta/actualización de un resultado MANUAL (provisional).
 * - DELETE /:id         borra una fila manual (no permite borrar oficiales).
 *
 * Reglas de negocio:
 *   - Un resultado manual es provisional (verified=false, source=manual).
 *   - Si ya existe un resultado OFICIAL para el mismo juego+día → 409.
 *   - Cuando la ingestión reciba el oficial para ese juego+día, reemplaza al manual.
 *   - La fecha se normaliza al día UTC y se persiste a las 04:00:00Z (misma
 *     convención que las fuentes), para que el reemplazo coincida.
 */
import { Hono } from "hono";
import { eq, and, gte, lt, desc } from "drizzle-orm";
import type { Database } from "../../db/client.js";
import { lotteryHistory, drawSources, users } from "../../db/schema.js";
import type { GameType } from "@loto/shared-types";
import type { ManualDrawDto } from "@loto/shared-types";

const VALID_GAMES = new Set<GameType>([
  "diaria_11am", "diaria_3pm", "diaria_9pm",
  "pega3_11am",  "pega3_3pm",  "pega3_9pm",
  "premia2_11am","premia2_3pm","premia2_9pm",
  "juga3_11am",  "juga3_3pm",  "juga3_9pm",
  "super_premio",
]);

const MAX_NUMBERS = 8;
const MAX_NOTE = 500;

function normalizeSlotDate(input: string): { iso: string; dayStart: Date; dayEnd: Date } | null {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  const dayStart = new Date(Date.UTC(y, m, day, 0, 0, 0, 0));
  const dayEnd = new Date(dayStart.getTime() + 86_400_000);
  const iso = new Date(Date.UTC(y, m, day, 4, 0, 0, 0)).toISOString();
  return { iso, dayStart, dayEnd };
}

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

export const adminDrawsRoutes = new Hono<{ Variables: { db: Database } }>();

// GET /api/v1/admin/draws?game=&days=&source=&limit=
adminDrawsRoutes.get("/", async (c) => {
  const db = c.get("db");
  const gameParam = c.req.query("game");
  const sourceParam = c.req.query("source");
  const days = Math.min(Math.max(parseInt(c.req.query("days") ?? "30", 10) || 30, 1), 90);
  const limit = Math.min(Math.max(parseInt(c.req.query("limit") ?? "200", 10) || 200, 1), 500);
  const since = new Date(Date.now() - days * 86_400_000);

  const conditions = [gte(lotteryHistory.drawDate, since)];
  if (gameParam && VALID_GAMES.has(gameParam as GameType)) conditions.push(eq(lotteryHistory.game, gameParam as GameType));
  if (sourceParam === "official" || sourceParam === "manual") conditions.push(eq(lotteryHistory.source, sourceParam));

  const rows = await db
    .select({
      id: lotteryHistory.id,
      game: lotteryHistory.game,
      sessionId: lotteryHistory.sessionId,
      numbers: lotteryHistory.numbers,
      signs: lotteryHistory.signs,
      drawDate: lotteryHistory.drawDate,
      source: lotteryHistory.source,
      verified: lotteryHistory.verified,
      note: lotteryHistory.note,
      sourceName: drawSources.name,
      enteredByEmail: users.email,
    })
    .from(lotteryHistory)
    .leftJoin(drawSources, eq(lotteryHistory.sourceUrlId, drawSources.id))
    .leftJoin(users, eq(lotteryHistory.enteredByAdminId, users.id))
    .where(and(...conditions))
    .orderBy(desc(lotteryHistory.drawDate))
    .limit(limit);

  return c.json({
    success: true,
    data: rows.map((r) => ({
      id: r.id,
      game: r.game,
      sessionId: r.sessionId,
      numbers: r.numbers,
      signs: r.signs,
      drawDate: r.drawDate.toISOString(),
      source: r.source,
      verified: r.verified,
      sourceName: r.sourceName ?? null,
      note: r.note ?? null,
      enteredBy: r.enteredByEmail ?? null,
    })),
  });
});

// POST /api/v1/admin/draws/manual
adminDrawsRoutes.post("/manual", async (c) => {
  const db = c.get("db");
  const auth = c.get("auth");
  const body = (await c.req.json().catch(() => null)) as ManualDrawDto | null;

  const game = body?.game;
  const numbersRaw = Array.isArray(body?.numbers) ? body.numbers : null;
  const signsRaw = Array.isArray(body?.signs) ? body.signs : null;
  const note = typeof body?.note === "string" ? body.note.trim() : "";

  if (!game || !VALID_GAMES.has(game))
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "game inválido." } }, 400);

  if (!numbersRaw || numbersRaw.length === 0 || numbersRaw.length > MAX_NUMBERS)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `numbers: entre 1 y ${MAX_NUMBERS} valores.` } }, 400);

  const numbers = numbersRaw.map((n) => String(n).trim()).filter(Boolean);
  if (numbers.length === 0 || numbers.some((n) => n.length > 20))
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "numbers con valores vacíos o demasiado largos." } }, 400);

  const signs = (signsRaw ?? []).map((s) => String(s).trim()).filter(Boolean);
  if (signs.length > MAX_NUMBERS || signs.some((s) => s.length > 40))
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "signs inválidos." } }, 400);

  if (note.length > MAX_NOTE)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: `note no puede superar ${MAX_NOTE} caracteres.` } }, 400);

  const norm = normalizeSlotDate(body!.drawDate);
  if (!norm)
    return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "drawDate inválida." } }, 400);

  // ¿Ya existe un resultado (oficial o manual) para ese juego+día?
  const [existing] = await db
    .select()
    .from(lotteryHistory)
    .where(and(
      eq(lotteryHistory.game, game),
      gte(lotteryHistory.drawDate, norm.dayStart),
      lt(lotteryHistory.drawDate, norm.dayEnd),
    ))
    .limit(1);

  if (existing && existing.source === "official") {
    return c.json(
      { success: false, error: { code: "CONFLICT", message: "Ya existe un resultado oficial para ese juego y día; no se puede sobrescribir manualmente." } },
      409,
    );
  }

  if (existing) {
    const [updated] = await db
      .update(lotteryHistory)
      .set({
        numbers,
        signs,
        note: note || null,
        verified: false,
        enteredByAdminId: auth.sub,
      })
      .where(eq(lotteryHistory.id, existing.id))
      .returning();
    return c.json({
      success: true,
      data: {
        id: updated!.id,
        mode: "updated",
        message: "Resultado manual actualizado.",
      },
    });
  }

  const [created] = await db
    .insert(lotteryHistory)
    .values({
      game,
      sessionId: `manual-${game}-${ymd(new Date(norm.iso))}`,
      numbers,
      signs,
      drawDate: new Date(norm.iso),
      source: "manual",
      verified: false,
      enteredByAdminId: auth.sub,
      note: note || null,
    })
    .returning();

  return c.json({
    success: true,
    data: {
      id: created!.id,
      mode: "created",
      message: "Resultado manual registrado (se reemplazará cuando llegue el oficial).",
    },
  }, 201);
});

// DELETE /api/v1/admin/draws/:id — solo manuales
adminDrawsRoutes.delete("/:id", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");

  const [existing] = await db.select().from(lotteryHistory).where(eq(lotteryHistory.id, id)).limit(1);
  if (!existing)
    return c.json({ success: false, error: { code: "NOT_FOUND", message: "Sorteo no encontrado." } }, 404);

  if (existing.source !== "manual") {
    return c.json(
      { success: false, error: { code: "CONFLICT", message: "Solo se pueden eliminar resultados manuales." } },
      409,
    );
  }

  await db.delete(lotteryHistory).where(eq(lotteryHistory.id, id));
  return c.json({ success: true, data: { message: "Resultado manual eliminado." } });
});
