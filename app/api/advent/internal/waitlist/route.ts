import { NextRequest, NextResponse } from "next/server";
import { db } from "@/advent/adapters/db/db-memory";

export async function POST(req: NextRequest) {
  await db.bootstrap();
  const b = await req.json();
  const r = await db.insertWaitlist({
    email: b.email,
    name: b.name ?? null,
    phoneE164: b.phoneE164 ?? null
  });
  return NextResponse.json({ ok: true, id: r.id });
}
