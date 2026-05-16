import { Resend } from "resend";

const API_KEY = process.env.RESEND_API_KEY;
const HAS_RESEND = !!API_KEY && API_KEY !== "re_xxxxxxxxxxxx";
const resend = HAS_RESEND ? new Resend(API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "Pulso Urbano <noreply@resend.dev>";

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  if (!resend) {
    console.log(`[DEV][Pulso Urbano] Código de verificación para ${email}: ${code}`);
    return true;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Tu código de verificación — Pulso Urbano",
      html: `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 400px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #7c5cfc; font-family: 'Syne', sans-serif;">Pulso Urbano</h2>
          <p>Tu código de verificación es:</p>
          <div style="background: #f5f5ff; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Este código expira en 15 minutos.</p>
          <p style="color: #6b7280; font-size: 14px;">Si no solicitaste este código, ignorá este email.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("Error enviando email:", err);
    return false;
  }
}
