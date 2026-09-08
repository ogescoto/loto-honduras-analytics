/**
 * Ajustes de planes (tiempo de gracia) — público para leer la visibilidad
 * y admin para cambiar la configuración.
 *
 * GET  /api/v1/settings/plans           — público: qué plan(es) se muestran
 * GET  /api/v1/admin/settings/plans     — admin: lee la configuración completa
 * PATCH /api/v1/admin/settings/plans    — admin: cambia show_paid_plan (gracia)
 */
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { Database } from "../db/client.js";
import { appSettings } from "../db/schema.js";

export const settingsRoutes = new Hono<{ Variables: { db: Database } }>();
export const adminSettingsRoutes = new Hono<{ Variables: { db: Database } }>();

const KEY = "plans";
const DEFAULT_PLANS = { showPaidPlan: false, paidLabel: "Premium · 30 días", paidAmountHnl: 20000, trialDays: 30 };

async function loadPlans(db: Database): Promise<{ showPaidPlan: boolean; paidLabel: string; paidAmountHnl: number; trialDays: number }> {
  const [row] = await db.select().from(appSettings).where(eq(appSettings.key, KEY)).limit(1);
  if (!row) return { ...DEFAULT_PLANS };
  return { ...DEFAULT_PLANS, ...(row.value as object) };
}

// GET /api/v1/settings/plans — público (visibilidad del plan).
settingsRoutes.get("/plans", async (c) => {
  const db = c.get("db");
  const plans = await loadPlans(db);
  return c.json({
    success: true,
    data: {
      showPaidPlan: plans.showPaidPlan,
      trialDays: plans.trialDays,
      paid: { label: plans.paidLabel, amount: plans.paidAmountHnl, currency: "HNL" },
    },
  });
});

// GET /api/v1/admin/settings/plans — admin.
adminSettingsRoutes.get("/plans", async (c) => {
  const db = c.get("db");
  return c.json({ success: true, data: await loadPlans(db) });
});

// PATCH /api/v1/admin/settings/plans — admin cambia la visibilidad del plan pagado.
adminSettingsRoutes.patch("/plans", async (c) => {
  const db = c.get("db");
  const body = (await c.req.json().catch(() => null)) as { showPaidPlan?: boolean; paidLabel?: string; paidAmountHnl?: number; trialDays?: number } | null;
  if (!body) return c.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Body inválido." } }, 400);

  const current = await loadPlans(db);
  const next = {
    showPaidPlan: typeof body.showPaidPlan === "boolean" ? body.showPaidPlan : current.showPaidPlan,
    paidLabel: typeof body.paidLabel === "string" && body.paidLabel ? body.paidLabel : current.paidLabel,
    paidAmountHnl: Number.isInteger(body.paidAmountHnl) && (body.paidAmountHnl ?? 0) > 0 ? body.paidAmountHnl! : current.paidAmountHnl,
    trialDays: Number.isInteger(body.trialDays) && (body.trialDays ?? 0) > 0 ? body.trialDays! : current.trialDays,
  };

  await db
    .insert(appSettings)
    .values({ key: KEY, value: next, updatedAt: new Date() })
    .onConflictDoUpdate({ target: appSettings.key, set: { value: next, updatedAt: new Date() } });

  return c.json({ success: true, data: next });
});