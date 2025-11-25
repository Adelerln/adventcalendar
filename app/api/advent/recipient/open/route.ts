import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { readBuyerSession } from "@/lib/server-session";
import { db } from "@/advent/adapters/db/db-memory";

export async function POST(req: NextRequest) {
  await db.bootstrap();
  const buyerSession = readBuyerSession(req as any);
  if (!buyerSession) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { dayNumber, day_number } = await req.json();
  const finalDayNumber = Number(dayNumber || day_number);

  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (supabaseConfigured) {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("calendar_contents")
      .select("type,content,title")
      .eq("buyer_id", buyerSession.id)
      .eq("day", finalDayNumber)
      .maybeSingle();

    if (error) {
      console.error("[recipient/open] supabase fetch failed", error);
      return NextResponse.json({ error: "Erreur récupération" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "No content for this day" }, { status: 404 });
    }

    const payload: Record<string, unknown> = {
      day: finalDayNumber,
      type: data.type,
      content: data.content,
      title: data.title ?? null
    };

    return NextResponse.json({ ok: true, content: payload });
  }

  // Fallback mémoire
  const cookie = req.cookies.get("recipient_session");
  if (!cookie) return new NextResponse("Unauthorized", { status: 401 });
  const session = JSON.parse(cookie.value);
  const calendar_id = session.calendarId || session.calendar_id;
  const updated = await db.markDayOpened(calendar_id, Number(finalDayNumber), new Date().toISOString());
  if (!updated) return NextResponse.json({ error: "locked or not found" }, { status: 400 });

  const mockContent = {
    day: Number(finalDayNumber),
    type: "message",
    content: `Ceci est un message spécial pour le jour ${finalDayNumber} ! 🎄✨`,
    title: null
  };

  return NextResponse.json({
    ok: true,
    content: mockContent
  });
}
