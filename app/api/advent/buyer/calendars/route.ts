import { NextRequest, NextResponse } from "next/server";
import { db } from "@/advent/adapters/db/db-memory";
import { compute24Days } from "@/advent/domain/usecases";
import { genToken, hashToken } from "@/advent/lib/tokens";

export async function GET() {
  await db.bootstrap();
  const list = await db.listCalendarsByBuyer("dev-buyer-1");
  return NextResponse.json({ calendars: list });
}

export async function POST(req: NextRequest) {
  await db.bootstrap();
  const body = await req.json();
  const buyerId = body.buyerId ?? "dev-buyer-1";

  const rcpt = await db.createRecipient({
    displayName: body.recipient?.displayName ?? null,
    phoneE164: body.recipient?.phoneE164 ?? null,
    email: body.recipient?.email ?? null
  });

  const cal = await db.createCalendar({
    buyerId,
    recipientId: rcpt.id,
    title: body.title,
    startDate: body.start_date,
    delivery: body.delivery,
    status: "draft"
  });

  const debugUnlock: boolean = !!body.debugUnlock;
  const rows = compute24Days(body.start_date, cal.id, body.days);
  const finalRows = rows.map((r) => ({
    ...r,
    lockedUntil: debugUnlock ? new Date().toISOString() : r.lockedUntil
  }));
  await db.bulkInsertDays(finalRows);

  const token = genToken(32);
  const tokenHashB64 = hashToken(token).toString("base64");
  await db.updateCalendar(cal.id, {
    status: "active",
    openTokenHashB64: tokenHashB64,
    openTokenExpiresAt: new Date(new Date().getFullYear() + 1, 0, 15).toISOString()
  });

  const base = process.env.NEXT_PUBLIC_OPEN_BASE_URL ?? "http://localhost:3000/open";
  const link = `${base}/c/${token}`;

  return NextResponse.json({ calendarId: cal.id, link });
}
