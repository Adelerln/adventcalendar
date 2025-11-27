/**
 * GET /api/advent/recipient/days
 * Liste tous les jours d'un calendrier pour un recipient authentifié
 *
 * Corrige VULN-004: Absence de contrôle d'accès sur endpoints recipient
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/advent/adapters/db/db-memory";
import { supabaseServer } from "@/lib/supabase";
import { readBuyerSession } from "@/lib/server-session";
import { authenticateRecipient } from "@/lib/recipient-auth";
import { DEFAULT_PLAN, type PlanKey } from "@/lib/plan-theme";

export async function GET(req: NextRequest) {
  await db.bootstrap();

  // ✅ Priorité 1: Session buyer authentifiée (propriétaire du calendrier)
  const buyerSession = await readBuyerSession(req);
  let buyerId: string | null = null;

  if (buyerSession) {
    // Le propriétaire peut voir son propre calendrier
    buyerId = buyerSession.id;
  } else {
    // ✅ Priorité 2: Session recipient vérifiée avec JWT
    const recipientAuth = await authenticateRecipient(req);

    if (!recipientAuth.authenticated) {
      return NextResponse.json(
        { error: recipientAuth.error },
        { status: recipientAuth.status }
      );
    }

    // ✅ Utiliser le buyer_id vérifié depuis la DB (pas du cookie !)
    buyerId = recipientAuth.session.buyer_id;
  }

  if (!buyerId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date().toISOString();

  // Si Supabase est configuré, récupérer les contenus réels
  if (supabaseConfigured) {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("calendar_contents")
      .select("day,type,content,title")
      .eq("buyer_id", buyerId)
      .order("day", { ascending: true });

    if (error) {
      console.error("[recipient/days] supabase fetch failed", error);
      return NextResponse.json({ error: "Erreur récupération" }, { status: 500 });
    }

    const days = Array.from({ length: 24 }, (_, idx) => {
      const dayNumber = idx + 1;
      const rows = (data ?? []).filter((r) => r.day === dayNumber);
      const hasContent = rows.length > 0;
      // Fusionner les types pour signaler la présence
      return {
        day: dayNumber,
        dayNumber,
        isUnlocked: hasContent,
        isToday: false,
        hasPhoto: rows.some((r) => r.type === "photo" || r.type === "ai_photo"),
        hasMessage: rows.some((r) => r.type === "message"),
        hasDrawing: rows.some((r) => r.type === "drawing"),
        hasMusic: rows.some((r) => r.type === "music" || r.type === "voice")
      };
    });

    return NextResponse.json({ days, plan: (buyerSession?.plan as PlanKey) ?? DEFAULT_PLAN });
  }

  // Fallback mémoire : données de dev
  const recipientAuth = await authenticateRecipient(req);
  if (!recipientAuth.authenticated) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const calendar_id = recipientAuth.session.calendar_id;
  const opened = await db.listOpenDays(calendar_id, now);
  const openedSet = new Set(opened.map((d) => d.dayNumber));
  const days = Array.from({ length: 24 }, (_, idx) => {
    const dayNumber = idx + 1;
    const isUnlocked = openedSet.has(dayNumber);
    return {
      day: dayNumber,
      dayNumber,
      isUnlocked,
      isToday: false,
      type: null,
      content: null,
      title: null
    };
  });

  return NextResponse.json({ days, plan: DEFAULT_PLAN });
}
