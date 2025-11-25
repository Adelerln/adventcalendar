import { NextRequest, NextResponse } from "next/server";
import { db } from "@/advent/adapters/db/db-memory";
import { supabaseServer } from "@/lib/supabase";
import { readBuyerSession } from "@/lib/server-session";
import { DEFAULT_PLAN, type PlanKey } from "@/lib/plan-theme";

export async function GET(req: NextRequest) {
  await db.bootstrap();
  // Priorité : session acheteur pour récupérer ses contenus
  const buyerSession = readBuyerSession(req as any);
  if (!buyerSession) {
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
      .eq("buyer_id", buyerSession.id)
      .order("day", { ascending: true });

    if (error) {
      console.error("[recipient/days] supabase fetch failed", error);
      return NextResponse.json({ error: "Erreur récupération" }, { status: 500 });
    }

    const days = Array.from({ length: 24 }, (_, idx) => {
      const dayNumber = idx + 1;
      const row = data?.find((r) => r.day === dayNumber);
      return {
        day: dayNumber,
        dayNumber,
        isUnlocked: Boolean(row),
        isToday: false,
        type: row?.type ?? null,
        content: row?.content ?? null,
        title: row?.title ?? null
      };
    });

    return NextResponse.json({ days, plan: (buyerSession.plan as PlanKey) ?? DEFAULT_PLAN });
  }

  // Fallback mémoire : données de dev
  const cookie = req.cookies.get("recipient_session");
  if (!cookie) return new NextResponse("Unauthorized", { status: 401 });
  const { calendar_id } = JSON.parse(cookie.value);
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
