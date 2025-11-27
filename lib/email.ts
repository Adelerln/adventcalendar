import { Resend } from "resend";
import { supabaseServer } from "@/lib/supabase";
import { findBuyerById } from "@/lib/buyers-store";

let resendClient: Resend | null = null;

function getResendClient() {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  resendClient = new Resend(apiKey);
  return resendClient;
}

export async function sendDailyEmail(params: {
  to: string;
  subject: string;
  previewText?: string;
  html: string;
}) {
  const client = getResendClient();
  if (!client || !params.to) return;
  await client.emails.send({
    from: "Calendrier <noreply@your-domain>",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}

export async function sendPaymentConfirmationEmail(buyerId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  let email: string | null = null;
  let fullName: string | null = null;

  if (supabaseUrl && supabaseServiceRole) {
    const supabase = supabaseServer();
    const { data } = await supabase.from("buyers").select("email, full_name").eq("id", buyerId).maybeSingle();
    email = data?.email ?? null;
    fullName = data?.full_name ?? null;
  } else {
    const buyer = findBuyerById(buyerId);
    if (buyer) {
      email = buyer.email;
      fullName = buyer.full_name;
    }
  }

  if (!email) return;

  await sendDailyEmail({
    to: email,
    subject: "Paiement validé – Calendrier de l'Avent",
    previewText: "Votre paiement est confirmé",
    html: `<p>Bonjour ${fullName ?? "cher client"},</p><p>Bravo, votre paiement est confirmé. Vous pouvez retourner sur votre espace pour générer votre calendrier.</p>`
  });
}

export type CalendarShareEmailParams = {
  buyerEmail: string;
  buyerName?: string;
  recipientName: string;
  shareUrl: string;
  accessCode: string;
  calendarId: string;
};

/**
 * Envoie un email au buyer avec le lien de partage et le code d'accès
 * pour son calendrier de l'Avent
 *
 * Template festif avec:
 * - Lien de partage cliquable
 * - Code d'accès dans une box dorée bien visible
 * - Instructions de partage
 * - Avertissement de sécurité (communiquer le code séparément)
 */
export async function sendCalendarShareEmail(params: CalendarShareEmailParams) {
  const { buyerEmail, buyerName, recipientName, shareUrl, accessCode, calendarId } = params;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn("[sendCalendarShareEmail] RESEND_API_KEY not configured");
    return;
  }

  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre calendrier de l'Avent est prêt !</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(180deg, #8b1a1a 0%, #6b0f0f 50%, #4a0808 100%); min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #d4af37; font-size: 32px; margin: 0 0 10px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
        🎄 Votre calendrier est prêt !
      </h1>
      <p style="color: #ffffff; font-size: 16px; margin: 0;">
        Partagez la magie de Noël avec ${recipientName}
      </p>
    </div>

    <!-- Main Card -->
    <div style="background: rgba(255, 255, 255, 0.95); border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.3); border: 2px solid rgba(212, 175, 55, 0.3);">

      <p style="color: #4a0808; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Bonjour ${buyerName || ""},
      </p>

      <p style="color: #4a0808; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Félicitations ! Votre calendrier de l'Avent personnalisé pour <strong>${recipientName}</strong> est maintenant prêt à être partagé. 🎁
      </p>

      <!-- Share URL Section -->
      <div style="background: linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%); border-radius: 15px; padding: 25px; margin: 30px 0; text-align: center; border: 2px solid #4a0808;">
        <p style="color: #4a0808; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">
          🔗 Lien de partage
        </p>
        <a href="${shareUrl}" style="display: inline-block; background: #ffffff; color: #4a0808; text-decoration: none; padding: 15px 30px; border-radius: 10px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.2); word-break: break-all;">
          ${shareUrl}
        </a>
      </div>

      <!-- Access Code Section -->
      <div style="background: linear-gradient(135deg, #8b1a1a 0%, #6b0f0f 100%); border-radius: 15px; padding: 25px; margin: 30px 0; text-align: center; border: 3px solid #d4af37;">
        <p style="color: #ffffff; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">
          🔐 Code d'accès
        </p>
        <div style="background: rgba(212, 175, 55, 0.2); border: 3px dashed #d4af37; border-radius: 10px; padding: 20px; display: inline-block;">
          <span style="color: #d4af37; font-size: 48px; font-weight: bold; letter-spacing: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
            ${accessCode}
          </span>
        </div>
        <p style="color: #ffffff; font-size: 12px; margin: 15px 0 0 0; font-style: italic;">
          ⚠️ Ce code ne sera plus accessible après cet email. Conservez-le précieusement !
        </p>
      </div>

      <!-- Instructions -->
      <div style="background: rgba(139, 26, 26, 0.1); border-left: 4px solid #d4af37; padding: 20px; margin: 30px 0; border-radius: 8px;">
        <p style="color: #4a0808; font-size: 14px; font-weight: bold; margin: 0 0 15px 0;">
          📝 Comment partager votre calendrier :
        </p>
        <ol style="color: #4a0808; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Envoyez le <strong>lien de partage</strong> à ${recipientName} (par email, SMS ou WhatsApp)</li>
          <li>Communiquez le <strong>code d'accès</strong> séparément pour plus de sécurité</li>
          <li>${recipientName} pourra ouvrir une surprise par jour à partir du 1er décembre ! 🎅</li>
        </ol>
      </div>

      <!-- Security Notice -->
      <div style="background: rgba(212, 175, 55, 0.1); border: 1px dashed #d4af37; padding: 15px; margin: 30px 0; border-radius: 8px; text-align: center;">
        <p style="color: #4a0808; font-size: 13px; margin: 0; line-height: 1.6;">
          🛡️ <strong>Pour votre sécurité :</strong><br>
          Nous vous recommandons de communiquer le code d'accès séparément du lien,<br>
          par exemple par téléphone ou SMS.
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0 20px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%); color: #4a0808; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-size: 16px; font-weight: bold; box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4); border: 2px solid #4a0808; transition: transform 0.2s;">
          📊 Voir mon tableau de bord
        </a>
      </div>

      <p style="color: #666; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
        Vous pouvez encore modifier le contenu de votre calendrier depuis votre espace personnel.<br>
        Les changements seront visibles pour ${recipientName} dès qu'ils ouvriront un jour.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 40px; padding: 20px;">
      <p style="color: rgba(255, 255, 255, 0.7); font-size: 12px; margin: 0 0 10px 0;">
        Joyeuses fêtes ! 🎄✨
      </p>
      <p style="color: rgba(255, 255, 255, 0.5); font-size: 11px; margin: 0;">
        Calendrier de l'Avent · <a href="${dashboardUrl}" style="color: #d4af37; text-decoration: none;">Mon compte</a>
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();

  const plainText = `
Votre calendrier de l'Avent est prêt ! 🎄

Bonjour ${buyerName || ""},

Félicitations ! Votre calendrier de l'Avent personnalisé pour ${recipientName} est maintenant prêt à être partagé.

🔗 LIEN DE PARTAGE
${shareUrl}

🔐 CODE D'ACCÈS
${accessCode}

⚠️ Ce code ne sera plus accessible après cet email. Conservez-le précieusement !

COMMENT PARTAGER VOTRE CALENDRIER :
1. Envoyez le lien de partage à ${recipientName} (par email, SMS ou WhatsApp)
2. Communiquez le code d'accès séparément pour plus de sécurité
3. ${recipientName} pourra ouvrir une surprise par jour à partir du 1er décembre !

🛡️ POUR VOTRE SÉCURITÉ :
Nous vous recommandons de communiquer le code d'accès séparément du lien,
par exemple par téléphone ou SMS.

Vous pouvez encore modifier le contenu de votre calendrier depuis votre espace personnel.

Tableau de bord : ${dashboardUrl}

Joyeuses fêtes ! 🎄✨
  `.trim();

  try {
    await sendDailyEmail({
      to: buyerEmail,
      subject: "🎄 Votre calendrier de l'Avent est prêt !",
      previewText: `Partagez la magie de Noël avec ${recipientName}`,
      html
    });

    console.info("[sendCalendarShareEmail] Email sent successfully", {
      buyerEmail,
      calendarId,
      recipientName
    });
  } catch (error) {
    console.error("[sendCalendarShareEmail] Failed to send email", error);
    throw error;
  }
}
