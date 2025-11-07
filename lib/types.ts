export type CalendarDay = {
  dayIndex: number; // 1..24
  contentType: "text" | "image" | "video" | "link";
  content: { text?: string; url?: string };
};

export type GiftDraft = {
  id?: string;
  title: string;
  message?: string;
  startsOn: string; // '2025-12-01'
  timezone: string; // 'Europe/Paris'
  theme: "classic" | "minimal" | "festive";
  recipient: { phone: string; email: string };
  days: CalendarDay[]; // toujours 24 éléments
};
