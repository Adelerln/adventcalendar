/**
 * API Route: /api/calendar-contents
 *
 * Corrige VULN-006: Stockage XSS via contenu non sanitisé
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";
import { supabaseServer } from "@/lib/supabase";
import { readBuyerSession } from "@/lib/server-session";
import { DEFAULT_PLAN } from "@/lib/plan-theme";

const schema = z.object({
  day: z.number().int().min(1).max(24),
  type: z.enum(["photo", "message", "drawing", "music", "voice", "ai_photo"]),
  // ✅ Sanitize pour éviter XSS
  content: z.string().min(1).transform((val) => DOMPurify.sanitize(val)),
  // ✅ Titre optionnel et nullable + sanitize
  title: z
    .string()
    .max(255)
    .nullable()
    .optional()
    .transform((val) => (val ? DOMPurify.sanitize(val) : val)),
  plan: z.enum(["plan_essentiel", "plan_premium"]).optional()
});

type MemoryContent = z.infer<typeof schema> & { buyer_id: string; updated_at: string; created_at: string };
const memoryStore: Map<string, MemoryContent> = new Map();

export const runtime = "nodejs";

const CALENDAR_BUCKET = "calendar-images";
const isImageType = (t: string) => t === "photo" || t === "drawing" || t === "ai_photo";
const isDataUrl = (val: string) => typeof val === "string" && val.startsWith("data:");

export async function GET(req: NextRequest) {
  const session = await readBuyerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
  }

  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (supabaseConfigured) {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("calendar_contents")
      .select("day,type,content,title")
      .eq("buyer_id", session.id)
      .order("day", { ascending: true });

    if (error) {
      console.error("[calendar-contents] supabase fetch failed", error);
      return NextResponse.json({ error: "Erreur récupération" }, { status: 500 });
    }

    return NextResponse.json({ items: data ?? [] });
  }

  const items = Array.from(memoryStore.values())
    .filter((item) => item.buyer_id === session.id)
    .map(({ day, type, content, title }) => ({ day, type, content, title }));
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await readBuyerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
  }

  const payload = await req.json().catch(() => ({}));
  const result = schema.safeParse(payload);
  if (!result.success) {
    return NextResponse.json({ error: "Payload invalide", details: result.error.flatten() }, { status: 400 });
  }

  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  const data = {
    buyer_id: session.id,
    day: result.data.day,
    type: result.data.type,
    content: result.data.content,
    title: result.data.title ?? null,
    plan: (result.data.plan ?? session.plan ?? DEFAULT_PLAN) as "plan_essentiel" | "plan_premium"
  };

  try {
    // Si c'est une image en data URL et que Supabase est configuré, uploade dans le bucket
    if (supabaseConfigured && isImageType(data.type) && isDataUrl(data.content)) {
      try {
        const uploadedUrl = await uploadDataUrlToSupabase({
          bucket: CALENDAR_BUCKET,
          buyerId: session.id,
          day: data.day,
          dataUrl: data.content
        });
        if (uploadedUrl) {
          data.content = uploadedUrl;
        }
      } catch (err) {
        console.error("[calendar-contents] upload image to supabase failed, keeping data URL", err);
      }
    }

    if (supabaseConfigured) {
      try {
        const supabase = supabaseServer();
        const { error } = await supabase
          .from("calendar_contents")
          .upsert(
            {
              ...data,
              updated_at: new Date().toISOString()
            },
            { onConflict: "buyer_id,day,type" }
          );

        if (!error) {
          return NextResponse.json({ ok: true });
        }

        console.error("[calendar-contents] supabase upsert failed, falling back to memory store", error);
      } catch (err) {
        console.error("[calendar-contents] supabase upsert exception, falling back to memory store", err);
        // Continue vers le fallback mémoire
      }
    }
  } catch (err) {
    console.error("[calendar-contents] unexpected error, fallback to memory", err);
    // Continue vers fallback mémoire
  }

  // Fallback mémoire (toujours renvoyer 200)
  try {
    const key = `${session.id}-${data.day}`;
    const now = new Date().toISOString();
    memoryStore.set(key, {
      buyer_id: data.buyer_id,
      day: data.day,
      type: data.type,
      content: data.content,
      title: data.title ?? undefined,
      plan: data.plan,
      created_at: memoryStore.get(key)?.created_at ?? now,
      updated_at: now
    });
    return NextResponse.json({ ok: true, storage: "memory" });
  } catch (memErr) {
    console.error("[calendar-contents] memory fallback failed", memErr);
    return NextResponse.json({ error: "Impossible d'enregistrer le jour" }, { status: 500 });
  }
}

async function uploadDataUrlToSupabase(params: {
  bucket: string;
  buyerId: string;
  day: number;
  dataUrl: string;
}): Promise<string | null> {
  const { bucket, buyerId, day, dataUrl } = params;
  const supabase = supabaseServer();

  const match = dataUrl.match(/^data:(.+?);base64,(.*)$/);
  if (!match) return null;
  const mimeType = match[1];
  const base64 = match[2];
  const buffer = Buffer.from(base64, "base64");

  const extension = mimeType.split("/")[1] || "bin";
  const daySlug = `day-${String(day).padStart(2, "0")}`;
  const filename = `${Date.now()}.${extension}`;
  const path = `${buyerId}/${daySlug}/${filename}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType: mimeType, upsert: true });

  if (error) {
    console.error("[calendar-contents] supabase storage upload failed", error);
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return null;
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
