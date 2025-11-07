export type DeliveryMethod = "sms" | "email";
export type CalendarStatus = "draft" | "active" | "expired";

export interface Recipient {
  id: string;
  phoneE164?: string | null;
  email?: string | null;
  displayName?: string | null;
}

export interface Calendar {
  id: string;
  buyerId: string;
  recipientId?: string | null;
  title: string;
  startDate: string;
  delivery: DeliveryMethod;
  status: CalendarStatus;
  openTokenHashB64?: string | null;
  openTokenExpiresAt?: string | null;
  createdAt: string;
}

export interface CalendarDay {
  id: string;
  calendarId: string;
  dayNumber: number; // 1..24
  contentType: "text";
  contentText?: string | null;
  lockedUntil: string;
  openedAt?: string | null;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  phoneE164?: string | null;
  name?: string | null;
  createdAt: string;
}
