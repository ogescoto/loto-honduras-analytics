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
