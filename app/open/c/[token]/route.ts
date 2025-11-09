import { NextRequest, NextResponse } from "next/server";
import { db } from "@/advent/adapters/db/db-memory";
import { hashToken } from "@/advent/lib/tokens";
import { setRecipientSession } from "@/advent/lib/cookies";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  const { token } = await context.params;
  await db.bootstrap();
  const tokenHashB64 = hashToken(token).toString("base64");
  const cal = await db.findCalendarByTokenHash(tokenHashB64);
  if (!cal || (cal.openTokenExpiresAt && new Date(cal.openTokenExpiresAt) < new Date())) {
    const url = new URL("/open/expired", req.url);
    return NextResponse.redirect(url);
  }
  await setRecipientSession(cal.id);
  return NextResponse.redirect(new URL("/open/calendar", req.url));
}
