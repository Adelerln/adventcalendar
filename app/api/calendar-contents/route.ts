/**
 * API Route: /api/calendar-contents
 *
 * Corrige VULN-006: Stockage XSS via contenu non sanitisé
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase";
import { readBuyerSession } from "@/lib/server-session";
import { DEFAULT_PLAN } from "@/lib/plan-theme";

// Minimal server-safe sanitizer to avoid jsdom/ESM issues in serverless
const sanitize = (val: string) => val.replace(/</g, "&lt;").replace(/>/g, "&gt;");

const schema = z.object({
  day: z.number().int().min(1).max(24),
  type: z.enum(["photo", "message", "drawing", "music", "voice", "ai_photo"]),
  // ✅ Sanitize pour éviter XSS
  content: z.string().min(1).transform((val) => sanitize(val)),
  // ✅ Titre optionnel et nullable + sanitize
  title: z
    .string()
    .max(255)
    .nullable()
    .optional()
    .transform((val) => (val ? sanitize(val) : val)),
  plan: z.enum(["plan_essentiel", "plan_premium"]).optional()
});

type MemoryContent = z.infer<typeof schema> & { buyer_id: string; updated_at: string; created_at: string };

export const runtime = "nodejs";

const CALENDAR_BUCKET = "calendar-images";
const isImageType = (t: string) => t === "photo" || t === "drawing" || t === "ai_photo";
const isDataUrl = (val: string) => typeof val === "string" && val.startsWith("data:");
const isHttpUrl = (val: string) => {
  if (typeof val !== "string") return false;
  try {
    const u = new URL(val);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

export function OPTIONS() {
  // Autoriser les preflight ou appels tests
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const session = await readBuyerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !supabaseServiceRole) {
    return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
  }

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

export async function POST(req: NextRequest) {
  try {
    const session = await readBuyerSession(req);
    if (!session) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));
    const result = schema.safeParse(payload);
    if (!result.success) {
      return NextResponse.json({ error: "Payload invalide", details: result.error.flatten() }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!supabaseUrl || !supabaseServiceRole) {
      return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
    }

    const data = {
      buyer_id: session.id,
      day: result.data.day,
      type: result.data.type,
      content: result.data.content,
      title: result.data.title ?? null,
      plan: (result.data.plan ?? session.plan ?? DEFAULT_PLAN) as "plan_essentiel" | "plan_premium"
    };

    // Upload image vers Supabase Storage si data URL
    if (isImageType(data.type) && isDataUrl(data.content)) {
      const uploadedUrl = await uploadDataUrlToSupabase({
        bucket: CALENDAR_BUCKET,
        buyerId: session.id,
        day: data.day,
        dataUrl: data.content
      });
      if (!uploadedUrl) {
        return NextResponse.json({ error: "Upload image Supabase échoué" }, { status: 500 });
      }
      data.content = uploadedUrl;
    }

    // Upload audio (musique/voix) vers Supabase si data URL ou lien HTTP(S)
    if ((data.type === "music" || data.type === "voice") && (isDataUrl(data.content) || isHttpUrl(data.content))) {
      const uploadedAudio = await uploadAudioToSupabase({
        bucket: CALENDAR_BUCKET,
        buyerId: session.id,
        day: data.day,
        source: data.content
      });
      if (!uploadedAudio) {
        console.warn("[calendar-contents] upload audio échoué, conservation du lien original");
      } else {
        data.content = uploadedAudio;
      }
    }

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

    if (error) {
      console.error("[calendar-contents] supabase upsert failed", error);
      return NextResponse.json({ error: "Erreur enregistrement Supabase" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[calendar-contents] fatal error", err);
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

  const uploadOnce = async () =>
    supabase.storage.from(bucket).upload(path, buffer, { contentType: mimeType, upsert: true });

  let uploadError = await uploadOnce();

  // Si le bucket n'existe pas, tenter de le créer puis réessayer
  if (uploadError.error && uploadError.error.message?.toLowerCase().includes("not found")) {
    console.warn("[calendar-contents] bucket manquant, tentative de création", bucket);
    const { error: bucketErr } = await supabase.storage.createBucket(bucket, { public: true });
    if (bucketErr) {
      console.error("[calendar-contents] création bucket échouée", bucketErr);
      return null;
    }
    uploadError = await uploadOnce();
  }

  if (uploadError.error) {
    console.error("[calendar-contents] supabase storage upload failed", uploadError.error);
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    console.error("[calendar-contents] NEXT_PUBLIC_SUPABASE_URL manquant pour générer l'URL publique");
    return null;
  }
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

async function uploadAudioToSupabase(params: {
  bucket: string;
  buyerId: string;
  day: number;
  source: string;
}): Promise<string | null> {
  const { bucket, buyerId, day, source } = params;
  const supabase = supabaseServer();

  let buffer: ArrayBuffer | Uint8Array;
  let mimeType = "audio/mpeg";
  let extension = "mp3";

  if (isDataUrl(source)) {
    const match = source.match(/^data:(.+?);base64,(.*)$/);
    if (!match) return null;
    mimeType = match[1];
    const base64 = match[2];
    buffer = Buffer.from(base64, "base64");
    const ext = mimeType.split("/")[1];
    if (ext) extension = ext;
  } else if (isHttpUrl(source)) {
    const res = await fetch(source);
    if (!res.ok) {
      console.error("[calendar-contents] audio fetch failed", res.status, await res.text().catch(() => ""));
      return null;
    }
    mimeType = res.headers.get("content-type") || mimeType;
    const urlExt = source.split(".").pop();
    if (urlExt && urlExt.length <= 4) {
      extension = urlExt.split(/[?#]/)[0] || extension;
    } else if (mimeType.includes("/")) {
      extension = mimeType.split("/")[1];
    }
    buffer = await res.arrayBuffer();
  } else {
    return null;
  }

  const daySlug = `day-${String(day).padStart(2, "0")}`;
  const filename = `${Date.now()}.${extension || "mp3"}`;
  const path = `${buyerId}/${daySlug}/audio-${filename}`;

  const uploadOnce = async () =>
    supabase.storage.from(bucket).upload(path, buffer, { contentType: mimeType, upsert: true });

  let uploadError = await uploadOnce();

  if (uploadError.error && uploadError.error.message?.toLowerCase().includes("not found")) {
    console.warn("[calendar-contents] audio bucket manquant, tentative de création", bucket);
    const { error: bucketErr } = await supabase.storage.createBucket(bucket, { public: true });
    if (bucketErr) {
      console.error("[calendar-contents] création bucket audio échouée", bucketErr);
      return null;
    }
    uploadError = await uploadOnce();
  }

  if (uploadError.error) {
    console.error("[calendar-contents] supabase audio upload failed", uploadError.error);
    return null;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    console.error("[calendar-contents] NEXT_PUBLIC_SUPABASE_URL manquant pour générer l'URL publique (audio)");
    return null;
  }
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
