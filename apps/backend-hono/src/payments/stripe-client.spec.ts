import { describe, it, expect } from "vitest";
import { verifyWebhook } from "./stripe-client.js";

const SECRET = "whsec_test";

async function signPayload(payload: string, timestamp: number) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const buf = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`),
  );
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

describe("verifyWebhook", () => {
  it("acepta una firma válida y reciente", async () => {
    const payload = JSON.stringify({ type: "checkout.session.completed" });
    const ts = Math.floor(Date.now() / 1000);
    const sig = await signPayload(payload, ts);
    const event = (await verifyWebhook(payload, `t=${ts},v1=${sig}`, SECRET)) as {
      type: string;
    };
    expect(event.type).toBe("checkout.session.completed");
  });

  it("rechaza una firma incorrecta", async () => {
    const payload = JSON.stringify({ type: "x" });
    const ts = Math.floor(Date.now() / 1000);
    await expect(
      verifyWebhook(payload, `t=${ts},v1=deadbeef`, SECRET),
    ).rejects.toThrow();
  });

  it("rechaza un evento fuera de la ventana de tolerancia", async () => {
    const payload = JSON.stringify({ type: "x" });
    const ts = Math.floor(Date.now() / 1000) - 10_000;
    const sig = await signPayload(payload, ts);
    await expect(
      verifyWebhook(payload, `t=${ts},v1=${sig}`, SECRET),
    ).rejects.toThrow();
  });
});
