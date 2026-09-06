import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { requireAuth, requireRole } from "./auth.js";

const SECRET = "test-secret";

async function tokenFor(role: string) {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return sign({ sub: "u1", role, exp }, SECRET, "HS256");
}

function app() {
  const a = new Hono<{ Bindings: { JWT_SECRET: string } }>();
  a.use("/admin/*", requireAuth, requireRole("admin", "clerk"));
  a.get("/admin/ping", (c) => c.json({ success: true, data: "ok" }));
  return a;
}

const env = { JWT_SECRET: SECRET };

describe("requireAuth + requireRole", () => {
  it("rechaza sin token (401)", async () => {
    const res = await app().request("/admin/ping", {}, env);
    expect(res.status).toBe(401);
  });

  it("rechaza rol insuficiente (403)", async () => {
    const t = await tokenFor("customer");
    const res = await app().request(
      "/admin/ping",
      { headers: { Authorization: `Bearer ${t}` } },
      env,
    );
    expect(res.status).toBe(403);
  });

  it("permite rol admin (200)", async () => {
    const t = await tokenFor("admin");
    const res = await app().request(
      "/admin/ping",
      { headers: { Authorization: `Bearer ${t}` } },
      env,
    );
    expect(res.status).toBe(200);
  });
});
