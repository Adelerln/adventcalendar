import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { PlanKey } from "@/lib/plan-theme";

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();

    if (!plan || (plan !== "plan_essentiel" && plan !== "plan_premium")) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("buyer_session");

    if (!sessionCookie) {
      return NextResponse.json({ error: "Aucune session" }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }

    // Mettre à jour le plan dans la session
    const updatedSession = {
      ...session,
      plan: plan as PlanKey
    };

    const response = NextResponse.json({ 
      success: true,
      session: updatedSession
    });

    // Mettre à jour le cookie
    response.cookies.set("buyer_session", JSON.stringify(updatedSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
