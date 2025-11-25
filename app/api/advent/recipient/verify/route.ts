import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST /api/advent/recipient/verify
 * Vérifie le token et le code du receveur, puis crée une session
 */
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

    // TODO: Implémenter la vérification réelle avec la base de données
    // 1. Vérifier que le token existe et n'est pas expiré
    // 2. Vérifier que le code correspond (hash comparison)
    // 3. Récupérer les infos du calendrier et du receveur
    
    // Pour l'instant, simulation avec un code de test
    const isValid = code === "NOEL24" || code.length >= 4;

    if (!isValid) {
      return NextResponse.json(
        { error: "Code invalide ou expiré" },
        { status: 401 }
      );
    }

    // Créer une session receveur sécurisée
    // Simplification : on utilise le token comme buyer_id (attendu dans le lien partagé)
    const recipientSession = {
      type: "recipient",
      token,
      buyer_id: token,
      calendarId: token,
      recipientId: "recipient",
      recipientName: "Destinataire",
      verifiedAt: new Date().toISOString()
    };

    // Stocker la session dans un cookie sécurisé
    const cookieStore = await cookies();
    cookieStore.set("recipient_session", JSON.stringify(recipientSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: "/"
    });

    return NextResponse.json({
      success: true,
      recipient: {
        name: recipientSession.recipientName,
        calendarId: recipientSession.calendarId,
        buyerId: recipientSession.buyer_id
      }
    });

  } catch (error) {
    console.error("Recipient verification error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}
