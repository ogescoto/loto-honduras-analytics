/**
 * Cliente mínimo de Stripe vía API REST (fetch), compatible con Cloudflare
 * Workers. Evita el SDK de Node, que no corre bien en el edge.
 *
 * MÓDULO PROTEGIDO (.aicodeprotect.yml): flujos de pago, sensible a PCI.
 * Cambios requieren APPROVED.
 */

const STRIPE_API = "https://api.stripe.com/v1";

/** Codifica un objeto plano como application/x-www-form-urlencoded (formato de Stripe). */
function toForm(params: Record<string, string>): string {
  return new URLSearchParams(params).toString();
}

export interface CheckoutSessionParams {
  customerEmail: string;
  validityMonths: number;
  unitAmountCents: number; // precio por mes, en centavos
  successUrl: string;
  cancelUrl: string;
  clientReferenceId: string; // userId, para reconciliar en el webhook
}

export async function createCheckoutSession(
  apiKey: string,
  p: CheckoutSessionParams,
): Promise<{ id: string; url: string }> {
  const body = toForm({
    mode: "payment",
    customer_email: p.customerEmail,
    client_reference_id: p.clientReferenceId,
    success_url: p.successUrl,
    cancel_url: p.cancelUrl,
    "line_items[0][quantity]": String(p.validityMonths),
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(p.unitAmountCents),
    "line_items[0][price_data][product_data][name]": "Suscripción Premium Loto Honduras (1 mes)",
    "metadata[validityMonths]": String(p.validityMonths),
  });

  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`Stripe checkout falló (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as { id: string; url: string };
}

/**
 * Verifica la firma del webhook de Stripe (esquema v1, HMAC-SHA256) usando
 * Web Crypto. Devuelve el evento parseado si es válido; lanza si no.
 */
export async function verifyWebhook(
  payload: string,
  sigHeader: string,
  webhookSecret: string,
  toleranceSeconds = 300,
): Promise<unknown> {
  const parts = Object.fromEntries(
    sigHeader.split(",").map((kv) => kv.split("=") as [string, string]),
  );
  const timestamp = parts["t"];
  const expectedSig = parts["v1"];
  if (!timestamp || !expectedSig) {
    throw new Error("Cabecera de firma de Stripe inválida.");
  }

  const age = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (age > toleranceSeconds) {
    throw new Error("Webhook de Stripe fuera de la ventana de tolerancia.");
  }

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload),
  );
  const computed = [...new Uint8Array(sigBuffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (computed !== expectedSig) {
    throw new Error("Firma del webhook de Stripe no coincide.");
  }
  return JSON.parse(payload);
}
