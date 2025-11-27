/**
 * POST /api/advent/recipient/verify
 * Vérifie le token et le code du receveur via Supabase, puis crée une session JWT sécurisée
 *
 * Corrige VULN-003: Validation destinataire sans vérification DB
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyRecipientAccess } from "@/lib/recipient-verification";
import { createRecipientSessionToken } from "@/lib/jwt-session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, code } = body;

    if (!token || !code) {
      return NextResponse.json(
        { error: "Token et code requis" },
        { status: 400 }
      );
    }

    // ✅ Vérification réelle avec la base de données
    const verificationResult = await verifyRecipientAccess(token, code);

    if (!verificationResult.valid) {
      return NextResponse.json(
        { error: verificationResult.error },
        { status: 401 }
      );
    }

    // ✅ Créer une session recipient JWT sécurisée avec les VRAIES données
    const recipientSessionPayload = {
      type: "recipient" as const,
      buyer_id: verificationResult.buyer_id,
      calendar_id: verificationResult.calendar_id,
      recipient_id: verificationResult.recipient_id,
      verified_at: new Date().toISOString(),
    };

    // Créer un JWT signé
    const sessionToken = await createRecipientSessionToken(recipientSessionPayload);

    // Stocker le JWT dans un cookie sécurisé
    const cookieStore = await cookies();
    cookieStore.set("recipient_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: "/",
    });

    return NextResponse.json({
      success: true,
      recipient: {
        name: verificationResult.recipient_name || "Destinataire",
        calendarId: verificationResult.calendar_id,
        buyerId: verificationResult.buyer_id,
      },
    });
  } catch (error) {
    console.error("[recipient/verify] Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}
