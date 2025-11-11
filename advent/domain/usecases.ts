import { CalendarDay } from "./types";
import { zonedStartOfDay, addDaysISO } from "../lib/time";
import { hashToken } from "../lib/tokens";
import type { DbPort } from "../adapters/db/db-ports";

export function compute24Days(startDateISO: string, calendarId: string, contents?: string[]) {
  const start = zonedStartOfDay(startDateISO);
  const days: Omit<CalendarDay, "id">[] = [];
  for (let i = 0; i < 24; i++) {
    const day: Omit<CalendarDay, "id"> = {
      calendarId,
      dayNumber: i + 1,
      contentType: "text",
      contentText: contents?.[i] ?? null,
      lockedUntil: addDaysISO(start, i),
      openedAt: null
    };
    days.push(day);
  }
  return days;
}

export async function verifyMagicToken(db: DbPort, token: string) {
  const hash = hashToken(token).toString("base64");
  const cal = await db.findCalendarByTokenHash(hash);
  if (!cal) return null;
  if (cal.openTokenExpiresAt && new Date(cal.openTokenExpiresAt) < new Date()) return null;
  return cal;
}
