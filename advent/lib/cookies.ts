import { cookies } from "next/headers";
export function setRecipientSession(calendarId: string) {
  cookies().set("recipient_session", JSON.stringify({ calendar_id: calendarId }), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/open",
    maxAge: 60 * 60 * 24 * 60
  });
}
