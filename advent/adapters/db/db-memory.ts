import { DbPort } from "./db-ports";
import { Calendar, CalendarDay, Recipient, WaitlistEntry } from "../../domain/types";
import fs from "fs";
import path from "path";
import crypto from "crypto";

type State = {
  recipients: Recipient[];
  calendars: Calendar[];
  days: CalendarDay[];
  waitlist: WaitlistEntry[];
};

const DATA_PATH = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_PATH, "dev-db.json");
function ensureDir() {
  if (!fs.existsSync(DATA_PATH)) fs.mkdirSync(DATA_PATH, { recursive: true });
}
function genId() {
  return crypto.randomUUID();
}

export class MemoryDb implements DbPort {
  private s: State = { recipients: [], calendars: [], days: [], waitlist: [] };

  async bootstrap() {
    ensureDir();
    if (fs.existsSync(FILE)) {
      try {
        this.s = JSON.parse(fs.readFileSync(FILE, "utf-8"));
      } catch {}
    }
  }
  private save() {
    ensureDir();
    fs.writeFileSync(FILE, JSON.stringify(this.s, null, 2), "utf-8");
  }
  async reset() {
    this.s = { recipients: [], calendars: [], days: [], waitlist: [] };
    this.save();
  }

  async createRecipient(partial: Partial<Recipient>) {
    const r: Recipient = { id: genId(), displayName: null, email: null, phoneE164: null, ...partial };
    this.s.recipients.push(r);
    this.save();
    return r;
  }
  async getRecipient(id: string) {
    return this.s.recipients.find((r) => r.id === id) ?? null;
  }

  async createCalendar(partial: Partial<Calendar>) {
    const c: Calendar = {
      id: genId(),
      buyerId: partial.buyerId!,
      recipientId: partial.recipientId ?? null,
      title: partial.title ?? "Mon calendrier",
      startDate:
        partial.startDate ?? new Date(Date.UTC(new Date().getUTCFullYear(), 11, 1)).toISOString(),
      delivery: partial.delivery ?? "sms",
      status: partial.status ?? "draft",
      openTokenHashB64: null,
      openTokenExpiresAt: null,
      createdAt: new Date().toISOString()
    };
    this.s.calendars.push(c);
    this.save();
    return c;
  }
  async updateCalendar(id: string, patch: Partial<Calendar>) {
    const i = this.s.calendars.findIndex((c) => c.id === id);
    if (i >= 0) {
      this.s.calendars[i] = { ...this.s.calendars[i], ...patch };
      this.save();
    }
  }
  async getCalendar(id: string) {
    return this.s.calendars.find((c) => c.id === id) ?? null;
  }
  async findCalendarByTokenHash(hashB64: string) {
    return this.s.calendars.find((c) => c.openTokenHashB64 === hashB64) ?? null;
  }
  async listCalendarsByBuyer(buyerId: string) {
    return this.s.calendars
      .filter((c) => c.buyerId === buyerId)
      .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  }

  async bulkInsertDays(rows: Omit<CalendarDay, "id">[]) {
    rows.forEach((r) => this.s.days.push({ ...r, id: genId() }));
    this.save();
  }
  async listOpenDays(calendarId: string, nowISO: string) {
    const now = new Date(nowISO);
    return this.s.days
      .filter((d) => d.calendarId === calendarId && new Date(d.lockedUntil) <= now)
      .sort((a, b) => a.dayNumber - b.dayNumber);
  }
  async markDayOpened(calendarId: string, dayNumber: number, nowISO: string) {
    const d = this.s.days.find((x) => x.calendarId === calendarId && x.dayNumber === dayNumber);
    if (!d) return null;
    if (new Date(d.lockedUntil) > new Date(nowISO)) return null;
    if (!d.openedAt) d.openedAt = nowISO;
    this.save();
    return d;
  }

  async insertWaitlist(e: Omit<WaitlistEntry, "id" | "createdAt">) {
    const w: WaitlistEntry = { id: genId(), createdAt: new Date().toISOString(), ...e };
    this.s.waitlist.push(w);
    this.save();
    return w;
  }
}

export const db = new MemoryDb();
