import { NextRequest, NextResponse } from "next/server";
import { db } from "@/advent/adapters/db/db-memory";

export async function POST(req: NextRequest) {
  await db.bootstrap();
  // @ts-ignore
  const cookie = req.cookies?.get?.("recipient_session");
  if (!cookie) return new NextResponse("Unauthorized", { status: 401 });
  const { calendar_id } = JSON.parse(cookie.value);
  const { day_number } = await req.json();
  const updated = await db.markDayOpened(calendar_id, Number(day_number), new Date().toISOString());
  if (!updated) return NextResponse.json({ error: "locked or not found" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
