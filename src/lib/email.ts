import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Vision <noreply@methode-vision.com>";

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Réinitialisation de votre mot de passe — Vision",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#111;margin-bottom:8px">Réinitialiser votre mot de passe</h2>
        <p style="color:#444;margin-bottom:24px">
          Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous — il est valable <strong>1 heure</strong>.
        </p>
        <a href="${url}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Réinitialiser mon mot de passe
        </a>
        <p style="color:#888;font-size:13px;margin-top:24px">
          Si vous n'avez pas fait cette demande, ignorez cet email.
        </p>
      </div>
    `,
  });
}
