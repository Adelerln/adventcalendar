import { NextRequest, NextResponse } from "next/server";
import { readBuyerSession } from "@/lib/server-session";
import { getBuyerPaymentInfo } from "@/lib/buyer-payment";
export const runtime = "nodejs";

import { findLatestProjectForUser } from "@/lib/projects-repository";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = readBuyerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
  }

  const project = await findLatestProjectForUser(session.id);
  if (project) {
    if (project.user_id !== session.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    if (project.payment_status !== "paid") {
      return NextResponse.json({ error: "Paiement requis" }, { status: 402 });
    }
    return NextResponse.json({ ok: true, projectId: project.id });
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
