import { Resend } from "resend";

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

