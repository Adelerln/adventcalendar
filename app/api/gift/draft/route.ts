import { NextRequest, NextResponse } from "next/server";
import { saveDraft } from "@/lib/gift-memory-store";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const draftId = saveDraft(body);
  return NextResponse.json({ ok: true, draftId });
}
