import { NextRequest, NextResponse } from "next/server";
import { db } from "@/advent/adapters/db/db-memory";

export async function POST(req: NextRequest) {
  await db.bootstrap();
  const cookie = req.cookies.get("recipient_session");
  if (!cookie) return new NextResponse("Unauthorized", { status: 401 });
  
  const session = JSON.parse(cookie.value);
  const calendar_id = session.calendarId || session.calendar_id;
  
  const { dayNumber, day_number } = await req.json();
  const finalDayNumber = dayNumber || day_number;
  
  const updated = await db.markDayOpened(calendar_id, Number(finalDayNumber), new Date().toISOString());
  if (!updated) return NextResponse.json({ error: "locked or not found" }, { status: 400 });
  
  // TODO: Récupérer le vrai contenu depuis la DB
  // Pour l'instant, retourner des données mockées
  const mockContent = {
    day: Number(finalDayNumber),
    photo: null,
    message: `Ceci est un message spécial pour le jour ${finalDayNumber} ! 🎄✨`,
    drawing: null,
    music: null,
    musicTitle: null
  };
  
  return NextResponse.json({ 
    ok: true,
    content: mockContent
  });
}
