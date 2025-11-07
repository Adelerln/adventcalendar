import { NextRequest, NextResponse } from "next/server";
import { giftDraftSchema } from "@/lib/schemas";
import { saveGift } from "@/lib/gift-memory-store";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const draft = giftDraftSchema.parse(payload);
  const stored = saveGift(draft);
  return NextResponse.json({ checkoutUrl: "/mock-checkout", giftId: stored.id });
}
