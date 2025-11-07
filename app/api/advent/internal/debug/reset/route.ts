import { NextResponse } from "next/server";
import { db } from "@/advent/adapters/db/db-memory";

export async function POST() {
  await db.bootstrap();
  await db.reset();
  return NextResponse.json({ ok: true });
}
