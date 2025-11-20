import { NextRequest, NextResponse } from "next/server";
import { readBuyerSession } from "@/lib/server-session";
import { getBuyerPaymentInfo } from "@/lib/buyer-payment";

export const runtime = "nodejs";

// Compat: expose a project-like payload based on buyer payment info.
export async function GET(req: NextRequest) {
  const session = readBuyerSession(req);
  if (!session) {
    return NextResponse.json({ project: null }, { status: 200 });
  }

  const payment = await getBuyerPaymentInfo(session.id);
  return NextResponse.json({
    project: payment
      ? {
          id: payment.id,
          plan: payment.plan,
          payment_status: payment.payment_status,
          payment_amount: payment.payment_amount,
          stripe_checkout_session_id: payment.stripe_checkout_session_id
        }
      : null
  });
}
