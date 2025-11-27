import { NextRequest, NextResponse } from "next/server";
import { readBuyerSession } from "@/lib/server-session";
import { getBuyerPaymentInfo } from "@/lib/buyer-payment";
import { findLatestProjectForUser } from "@/lib/projects-repository";

export const runtime = "nodejs";

// Return the latest project for the logged-in buyer, falling back to payment info for backward compatibility.
export async function GET(req: NextRequest) {
  const session = await readBuyerSession(req);
  if (!session) {
    return NextResponse.json({ project: null }, { status: 200 });
  }

  const project = await findLatestProjectForUser(session.id);
  if (project) {
    return NextResponse.json({ project });
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
