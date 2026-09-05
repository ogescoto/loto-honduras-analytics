import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { ingestRoutes } from "./ingest.js";
import { requireServiceToken } from "../middlewares/require-service-token.js";
import type { Database } from "../db/client.js";

// Doble de BD: captura las filas insertadas y simula onConflictDoNothing.
function fakeDb(captured: { rows: unknown[] }) {
  return {
    insert: () => ({
      values: (rows: unknown[]) => {
        captured.rows = rows;
        return {
          onConflictDoNothing: () => ({
            returning: async () => (rows as unknown[]).map((_, i) => ({ id: `id-${i}` })),
          }),
        };
      },
    }),
    delete: () => ({
      where: async () => ({ rowCount: 0 }),
    }),
  } as unknown as Database;
}

function appWithDb(captured: { rows: unknown[] }) {
  const app = new Hono<{ Variables: { db: Database } }>();
  app.use("*", async (c, next) => {
    c.set("db", fakeDb(captured));
    await next();
  });
  app.route("/", ingestRoutes);
  return app;
}

const validDraw = {
  game: "diaria_3pm",
  sessionId: "s1",
  numbers: ["00", "JG", "9"],
  signs: ["00 Avión", "JG", "9"],
  drawDate: "2026-06-22T04:00:00.000Z",
};

describe("POST /api/v1/ingest", () => {
  it("inserta sorteos válidos y reporta el conteo", async () => {
    const captured = { rows: [] as unknown[] };
    const res = await appWithDb(captured).request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draws: [validDraw] }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { inserted: number; valid: number } };
    expect(body.data.inserted).toBe(1);
    expect(body.data.valid).toBe(1);
    expect(captured.rows).toHaveLength(1);
  });

  it("descarta sorteos con juego inválido o sin sessionId", async () => {
    const captured = { rows: [] as unknown[] };
    const res = await appWithDb(captured).request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draws: [
          { ...validDraw, game: "juego_falso" },
          { ...validDraw, sessionId: undefined },
        ],
      }),
    });
    const body = (await res.json()) as { data: { inserted: number } };
    expect(body.data.inserted).toBe(0);
  });

  it("rechaza un cuerpo sin draws[]", async () => {
    const res = await appWithDb({ rows: [] }).request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foo: 1 }),
    });
    expect(res.status).toBe(400);
  });
});

describe("requireServiceToken", () => {
  function guarded(envToken?: string) {
    const app = new Hono();
    app.use("*", async (c, next) => {
      // Inyecta el env del Worker en el contexto.
      c.env = { INGEST_SERVICE_TOKEN: envToken } as never;
      await next();
    });
    app.use("*", requireServiceToken);
    app.get("/", (c) => c.json({ ok: true }));
    return app;
  }

  it("rechaza sin token (401)", async () => {
    const res = await guarded("secreto").request("/");
    expect(res.status).toBe(401);
  });

  it("rechaza token incorrecto (401)", async () => {
    const res = await guarded("secreto").request("/", {
      headers: { "X-Ingest-Token": "otro" },
    });
    expect(res.status).toBe(401);
  });

  it("acepta token correcto", async () => {
    const res = await guarded("secreto").request("/", {
      headers: { "X-Ingest-Token": "secreto" },
    });
    expect(res.status).toBe(200);
  });

  it("falla 500 si el servidor no tiene el token configurado", async () => {
    const res = await guarded(undefined).request("/", {
      headers: { "X-Ingest-Token": "x" },
    });
    expect(res.status).toBe(500);
  });
});
