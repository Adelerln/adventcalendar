import { NextRequest, NextResponse } from "next/server";
import { readBuyerSession } from "@/lib/server-session";
import { getBuyerPaymentInfo } from "@/lib/buyer-payment";

export const runtime = "nodejs";

/**
 * Simple guard endpoint: ensures the buyer is authentifié et payé avant génération.
 */
export async function POST(req: NextRequest) {
  const session = readBuyerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
  }

  const payment = await getBuyerPaymentInfo(session.id);
  if (!payment) {
    return NextResponse.json({ error: "Aucun paiement en cours" }, { status: 404 });
  }

  if (payment.payment_status !== "paid") {
    return NextResponse.json({ error: "Paiement requis" }, { status: 402 });
  }

  return NextResponse.json({ ok: true, payment });
}
