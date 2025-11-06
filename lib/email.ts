import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function sendDailyEmail(params: {
  to: string;
  subject: string;
  previewText?: string;
  html: string;
}) {
  if (!params.to) return;
  await resend.emails.send({
    from: "Calendrier <noreply@your-domain>",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}


