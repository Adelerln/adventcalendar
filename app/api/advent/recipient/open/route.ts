/**
 * POST /api/advent/recipient/open
 * Ouvre le contenu d'un jour du calendrier pour un recipient authentifié
 *
 * Corrige VULN-004: Absence de contrôle d'accès sur endpoints recipient
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { readBuyerSession } from "@/lib/server-session";
import { authenticateRecipient } from "@/lib/recipient-auth";
import { db } from "@/advent/adapters/db/db-memory";

export async function POST(req: NextRequest) {
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

  const { dayNumber, day_number } = await req.json();
  const finalDayNumber = Number(dayNumber || day_number);

  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (supabaseConfigured) {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("calendar_contents")
      .select("type,content,title")
      .eq("buyer_id", buyerId)
      .eq("day", finalDayNumber)
      .order("updated_at", { ascending: true });

    if (error) {
      console.error("[recipient/open] supabase fetch failed", error);
      return NextResponse.json({ error: "Erreur récupération" }, { status: 500 });
    }

    const rows = data ?? [];
    if (!rows.length) {
      return NextResponse.json({ error: "No content for this day" }, { status: 404 });
    }

    const payload = mergeContents(finalDayNumber, rows);
    return NextResponse.json({ ok: true, content: payload });
  }

  // Fallback mémoire
  const recipientAuth = await authenticateRecipient(req);
  if (!recipientAuth.authenticated) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const calendar_id = recipientAuth.session.calendar_id;
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

function mapContentToDayPayload(day: number, type?: string | null, content?: string | null, title?: string | null) {
  const base = { day };
  const c = content ?? "";
  switch (type) {
    case "photo":
    case "ai_photo":
      return { ...base, photo: c, message: null, drawing: null, music: null, musicTitle: title ?? null };
    case "message":
      return { ...base, photo: null, message: c, drawing: null, music: null, musicTitle: null };
    case "drawing":
      return { ...base, photo: null, message: null, drawing: c, music: null, musicTitle: null };
    case "music":
    case "voice":
      return { ...base, photo: null, message: null, drawing: null, music: c, musicTitle: title ?? null };
    default:
      return { ...base, photo: null, message: c || null, drawing: null, music: null, musicTitle: null };
  }
}

function mergeContents(
  day: number,
  rows: Array<{ type?: string | null; content?: string | null; title?: string | null }>
) {
  let photo: string | null = null;
  let message: string | null = null;
  let drawing: string | null = null;
  let music: string | null = null;
  let musicTitle: string | null = null;

  for (const row of rows) {
    const type = row.type;
    const c = row.content ?? "";
    if (type === "photo" || type === "ai_photo") {
      photo = c;
    } else if (type === "message") {
      message = c;
    } else if (type === "drawing") {
      drawing = c;
    } else if (type === "music" || type === "voice") {
      music = c;
      musicTitle = row.title ?? musicTitle;
    }
  }

  return { day, photo, message, drawing, music, musicTitle };
}
