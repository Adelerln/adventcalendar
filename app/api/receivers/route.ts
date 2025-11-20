import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readBuyerSession } from "@/lib/server-session";
import { supabaseServer } from "@/lib/supabase";
import { saveReceiver } from "@/lib/receivers-store";

export const runtime = "nodejs";

const payloadSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().max(32).optional().or(z.literal("")),
  relationship: z.string().min(2).max(64)
});

export async function POST(req: NextRequest) {
  const session = await readBuyerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
  }

  const { fullName, email, phone, relationship } = parsed.data;
  const normalizePhone = phone?.trim() || null;
  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  const receiverPayload = {
    buyer_id: session.id,
    full_name: fullName,
    email: email.toLowerCase(),
    phone_e164: normalizePhone,
    relationship
  };

  if (supabaseConfigured) {
    try {
      const supabase = supabaseServer();
      const { data, error } = await supabase
        .from("receivers")
        .insert(receiverPayload)
        .select("id")
        .single();

      if (error || !data) {
        console.error("Erreur Supabase receivers", error);
      } else {
        return NextResponse.json({ receiverId: data.id });
      }
    } catch (error) {
      console.error("Exception Supabase receivers", error);
    }
  }

  const fallback = saveReceiver(receiverPayload);
  return NextResponse.json({ receiverId: fallback.id, storage: "memory" });
}
