/**
 * Cliente mínimo de Brevo (ex-Sendinblue) para emails transaccionales.
 * Usa fetch nativo (compatible con Cloudflare Workers).
 */

const BREVO_API = "https://api.brevo.com/v3/smtp/email";

interface BrevoEmailParams {
  apiKey: string;
  to: { email: string; name?: string };
  subject: string;
  htmlContent: string;
  senderName?: string;
  senderEmail?: string;
}

export async function sendBrevoEmail(params: BrevoEmailParams): Promise<void> {
  const res = await fetch(BREVO_API, {
    method: "POST",
    headers: {
      "api-key": params.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: params.senderName ?? "Loto Honduras Analytics",
        email: params.senderEmail ?? "noreply@lotohn.com",
      },
      to: [params.to],
      subject: params.subject,
      htmlContent: params.htmlContent,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo error ${res.status}: ${body}`);
  }
}

export function buildPasswordResetEmail(resetUrl: string, name?: string | null): string {
  const displayName = name ?? "Usuario";
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#0f766e">Recuperar contraseña</h2>
      <p>Hola ${displayName},</p>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Loto Honduras Analytics.</p>
      <p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#0f766e;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
          Restablecer contraseña
        </a>
      </p>
      <p style="color:#64748b;font-size:13px">
        Este enlace expira en 30 minutos. Si no solicitaste este restablecimiento, ignora este correo.
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
      <p style="color:#94a3b8;font-size:11px">Loto Honduras Analytics — análisis con fines informativos.</p>
    </div>
  `;
}

export function buildWelcomeEmail(name?: string | null): string {
  const displayName = name ?? "Usuario";
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#0f766e">¡Bienvenido a Loto Honduras Analytics!</h2>
      <p>Hola ${displayName},</p>
      <p>Tu cuenta ha sido creada exitosamente. Ya puedes acceder a los patrones estadísticos de los sorteos.</p>
      <p>
        <a href="https://lotohn.com/premium"
           style="display:inline-block;background:#0f766e;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
          Ver meta-patrones Premium
        </a>
      </p>
      <p style="color:#64748b;font-size:13px">Con tu cuenta gratuita ya puedes guardar favoritos y acceder a patrones avanzados.</p>
    </div>
  `;
}

/** Notificación de recibo de pago compartido, dirigida al correo de soporte. */
export interface ReceiptNotif {
  userName: string;
  userEmail: string;
  method: string;
  amount: number | null;
  reference: string;
  note?: string | null;
}

export function buildReceiptNotifEmail(r: ReceiptNotif): string {
  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#0f766e">📄 Recibo de pago compartido</h2>
      <p>Un usuario compartió un comprobante para activar el plan Premium. Por favor revísalo.</p>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        <tbody>
          <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;color:#64748b">Usuario</td><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:600">${r.userName}</td></tr>
          <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;color:#64748b">Email</td><td style="padding:6px 8px;border:1px solid #e2e8f0">${r.userEmail}</td></tr>
          <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;color:#64748b">Método</td><td style="padding:6px 8px;border:1px solid #e2e8f0">${r.method}</td></tr>
          <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;color:#64748b">Monto</td><td style="padding:6px 8px;border:1px solid #e2e8f0;font-weight:600">${r.amount != null ? `L. ${r.amount.toLocaleString("es-HN")}` : "—"}</td></tr>
          <tr><td style="padding:6px 8px;border:1px solid #e2e8f0;color:#64748b">Referencia</td><td style="padding:6px 8px;border:1px solid #e2e8f0">${r.reference}</td></tr>
          ${r.note ? `<tr><td style="padding:6px 8px;border:1px solid #e2e8f0;color:#64748b">Nota</td><td style="padding:6px 8px;border:1px solid #e2e8f0">${r.note}</td></tr>` : ""}
        </tbody>
      </table>
      <p style="margin-top:16px">Entra al panel de administración → "Recibos de pago" para confirmar y activar el plan del usuario.</p>
    </div>
  `;
}
