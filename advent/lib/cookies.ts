import { cookies } from "next/headers";

export async function setRecipientSession(calendarId: string) {
  const store = await cookies();
  store.set("recipient_session", JSON.stringify({ calendar_id: calendarId }), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/open",
    maxAge: 60 * 60 * 24 * 60
  });
}
