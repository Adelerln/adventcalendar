import { NextRequest, NextResponse } from "next/server";
import { readBuyerSession } from "@/lib/server-session";
import { getBuyerPaymentInfo } from "@/lib/buyer-payment";
import { findLatestProjectForUser } from "@/lib/projects-repository";

export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const session = await readBuyerSession(req);
  if (!session) {
    return NextResponse.json({ payment: null }, { status: 200 });
  }

  const project = await findLatestProjectForUser(session.id);
  if (project) {
    return NextResponse.json({ payment: project });
  }

  const payment = await getBuyerPaymentInfo(session.id);
  return NextResponse.json({ payment });
}
