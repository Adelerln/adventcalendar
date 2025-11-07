import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getGift, setShareToken } from "@/lib/gift-memory-store";

export async function POST(req: NextRequest) {
  const { giftId } = await req.json();
  if (!giftId) return NextResponse.json({ error: "giftId requis" }, { status: 400 });
  const gift = getGift(giftId);
  if (!gift) return NextResponse.json({ error: "Gift introuvable" }, { status: 404 });
  const token = crypto.randomBytes(24).toString("base64url");
  const shareUrl = `/r/${token}`;
  setShareToken(giftId, shareUrl, token);
  return NextResponse.json({ giftId, token, shareUrl });
}
