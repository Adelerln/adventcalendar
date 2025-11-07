import { Calendar, CalendarDay, Recipient, WaitlistEntry } from "../../domain/types";

export interface DbPort {
  bootstrap(): Promise<void>;
  reset(): Promise<void>;

  createRecipient(partial: Partial<Recipient>): Promise<Recipient>;
  getRecipient(id: string): Promise<Recipient | null>;

  createCalendar(partial: Partial<Calendar>): Promise<Calendar>;
  updateCalendar(id: string, patch: Partial<Calendar>): Promise<void>;
  getCalendar(id: string): Promise<Calendar | null>;
  findCalendarByTokenHash(hashB64: string): Promise<Calendar | null>;
  listCalendarsByBuyer(buyerId: string): Promise<Calendar[]>;

  bulkInsertDays(rows: Omit<CalendarDay, "id">[]): Promise<void>;
  listOpenDays(calendarId: string, nowISO: string): Promise<CalendarDay[]>;
  markDayOpened(calendarId: string, dayNumber: number, nowISO: string): Promise<CalendarDay | null>;

  insertWaitlist(e: Omit<WaitlistEntry, "id" | "createdAt">): Promise<WaitlistEntry>;
}
