import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * GET /api/advent/recipient/session
 * Récupère la session du receveur authentifié
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("recipient_session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const session = JSON.parse(sessionCookie.value);

    // TODO: Récupérer les infos réelles du calendrier depuis la DB
    // Pour l'instant, données mockées
    return NextResponse.json({
      session: {
        calendarId: session.calendarId,
        recipientId: session.recipientId,
        recipientName: session.recipientName || "Destinataire",
        senderName: "Votre être cher", // TODO: récupérer depuis la DB
        plan: "plan_premium", // TODO: récupérer depuis la DB
        verifiedAt: session.verifiedAt
      }
    });

  } catch (error) {
    console.error("Session retrieval error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la session" },
      { status: 500 }
    );
  }
}
