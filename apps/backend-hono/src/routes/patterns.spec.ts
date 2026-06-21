import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { patternsRoutes } from "./patterns.js";
import type { Database } from "../db/client.js";

// Doble de BD mínimo: select().from() devuelve una lista fija.
const fakeDb = {
  select: () => ({ from: async () => [{ id: "p1", patternType: "frio_caliente" }] }),
} as unknown as Database;

function appWithDb() {
  const app = new Hono<{ Variables: { db: Database } }>();
  app.use("*", async (c, next) => {
    c.set("db", fakeDb);
    await next();
  });
  app.route("/", patternsRoutes);
  return app;
}

describe("GET /api/v1/patterns", () => {
  it("devuelve los patrones envueltos en { success, data }", async () => {
    const res = await appWithDb().request("/");

    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: unknown[] };
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(1);
  });
});
