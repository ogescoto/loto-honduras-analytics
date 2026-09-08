import { describe, it, expect } from "vitest";
import app from "./index.js";
import { isAllowedOrigin } from "./middlewares/cors.js";

const PROD_FRONT = "https://pronosticos-hn.oged-solutions.com";
const STAGING_FRONT = "https://staging.pronosticos-hn.pages.dev";

describe("isAllowedOrigin", () => {
  it("acepta orígenes propios de producción y staging", () => {
    expect(isAllowedOrigin(PROD_FRONT)).toBe(true);
    expect(isAllowedOrigin(STAGING_FRONT)).toBe(true);
  });

  it("acepta cualquier localhost con puerto (desarrollo)", () => {
    expect(isAllowedOrigin("http://localhost:4321")).toBe(true);
    expect(isAllowedOrigin("http://localhost:8787")).toBe(true);
  });

  it("acepta orígenes extra configurados por env", () => {
    expect(isAllowedOrigin("https://cliente.example.com", "https://cliente.example.com")).toBe(true);
  });

  it("rechaza orígenes desconocidos y el valor literal 'null'", () => {
    expect(isAllowedOrigin("https://evil.example")).toBe(false);
    expect(isAllowedOrigin("null")).toBe(false);
  });
});

describe("preflight CORS (OPTIONS)", () => {
  it("responde 204 con ACAO para un origin permitido", async () => {
    const res = await app.request("https://api.pronosticos-hn.oged-solutions.com/api/v1/features/diaria_11am", {
      method: "OPTIONS",
      headers: {
        Origin: PROD_FRONT,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "authorization, content-type",
      },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe(PROD_FRONT);
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("GET");
    expect(res.headers.get("Access-Control-Allow-Headers")?.toLowerCase()).toContain("authorization");
  });

  it("responde 204 para origin localhost de desarrollo", async () => {
    const res = await app.request("/api/v1/features/diaria_11am", {
      method: "OPTIONS",
      headers: { Origin: "http://localhost:4321", "Access-Control-Request-Method": "GET" },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:4321");
  });

  it("no emite Access-Control-Allow-Origin para orígenes no permitidos", async () => {
    const res = await app.request("/api/v1/features/diaria_11am", {
      method: "OPTIONS",
      headers: { Origin: "https://evil.example", "Access-Control-Request-Method": "GET" },
    });
    expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });
});