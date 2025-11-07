import { NextRequest, NextResponse } from "next/server";
import { db } from "@/advent/adapters/db/db-memory";

export async function GET(req: NextRequest) {
  await db.bootstrap();
  // @ts-ignore
  const cookie = req.cookies?.get?.("recipient_session");
  if (!cookie) return new NextResponse("Unauthorized", { status: 401 });
  const { calendar_id } = JSON.parse(cookie.value);
  const days = await db.listOpenDays(calendar_id, new Date().toISOString());
  return NextResponse.json({ days });
}
