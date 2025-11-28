import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_MODEL = "google/nano-banana";

function getSupabase(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("[api/ai-photo] Supabase credentials missing, storage disabled");
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

function getReplicate(): Replicate | null {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    console.warn("[api/ai-photo] REPLICATE_API_TOKEN missing");
    return null;
  }
  return new Replicate({ auth: token });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const replicate = getReplicate();

    if (!replicate) {
      return NextResponse.json({ error: "Replicate API token missing" }, { status: 500 });
    }

    const data = await req.formData();
    const prompt = data.get("prompt") as string;
    const imageFile = data.get("image") as File | null;
    let imageUrl: string | undefined;

    // Upload l'image d'entrée si fournie — on supporte deux modes:
    // 1) si Supabase est configuré, upload et expose une URL publique
    // 2) sinon on encode l'image en data URL (base64) pour la passer directement au modèle
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      if (!supabase) {
        // encode en data URL pour fournir l'image directement au modèle
        const buf = Buffer.from(arrayBuffer);
        const dataUrl = `data:${imageFile.type};base64,${buf.toString("base64")}`;
        imageUrl = dataUrl;
        console.warn("[api/ai-photo] Supabase non configuré — envoi de l'image en data URL au modèle");
      } else {
        const fileName = `ai-photo-input-${Date.now()}.png`;
        const { error } = await supabase.storage
          .from("ai-photos")
          .upload(fileName, arrayBuffer, { contentType: imageFile.type });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ai-photos/${fileName}`;
      }
    }

    // Appel Replicate — enrichit l'input avec plusieurs clés possibles pour maximiser la compatibilité
    const input: Record<string, unknown> = { prompt };
    if (imageUrl) {
      // certains modèles attendent 'image', d'autres 'image_url', 'init_images' ou 'image_input'
      input.image = imageUrl;
      input.image_url = imageUrl;
      input.init_image = imageUrl;
      input.init_images = [imageUrl];
      input.image_input = [imageUrl];
    }
    const modelId = (process.env.REPLICATE_MODEL || DEFAULT_MODEL) as `${string}/${string}` | `${string}/${string}:${string}`;
    const output = await replicate.run(modelId, { input });

    // Extraire l'URL ou le buffer
    const tryExtractUrl = (val: unknown): string | null => {
      if (!val) return null;
      if (typeof val === "string") return val;
      if (typeof val === "object" && "url" in (val as any)) {
        const u = (val as any).url;
        if (typeof u === "function") return u();
        if (typeof u === "string") return u;
      }
      return null;
    };

    let resultUrl: string | null = null;
    let resultBuffer: ArrayBuffer | Buffer | null = null;

    if (Array.isArray(output)) {
      for (const item of output) {
        const url = tryExtractUrl(item);
        if (url) {
          resultUrl = url;
          break;
        }
        if (item && (item instanceof Uint8Array || (typeof Buffer !== "undefined" && Buffer.isBuffer(item)))) {
          resultBuffer = item as any;
          break;
        }
      }
    } else {
      resultUrl = tryExtractUrl(output);
      if (!resultUrl && output && (output instanceof Uint8Array || (typeof Buffer !== "undefined" && Buffer.isBuffer(output)))) {
        resultBuffer = output as any;
      }
    }

    if (!resultUrl && !resultBuffer) {
      return NextResponse.json({ error: "No usable output from Replicate" }, { status: 500 });
    }

    // Récupère les octets finaux
    let finalBuffer: ArrayBuffer | Buffer | null = null;
    let contentType = "image/jpeg";

    if (resultUrl) {
      const res = await fetch(resultUrl);
      if (!res.ok) return NextResponse.json({ error: `Failed to fetch result URL: ${res.status}` }, { status: 500 });
      contentType = res.headers.get("content-type") || contentType;
      finalBuffer = await res.arrayBuffer();
    } else if (resultBuffer) {
      finalBuffer = resultBuffer;
    }

    if (!finalBuffer) {
      return NextResponse.json({ error: "Unable to obtain output bytes" }, { status: 500 });
    }

    // Stockage ou retour direct
    if (supabase) {
      const outName = `ai-photo-output-${Date.now()}.jpg`;
      const uploadData = finalBuffer instanceof ArrayBuffer ? finalBuffer : (finalBuffer as Buffer).buffer;
      const { error: outError } = await supabase.storage
        .from("ai-photos")
        .upload(outName, uploadData as any, { contentType });
      if (outError) return NextResponse.json({ error: outError.message }, { status: 500 });
      const finalUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ai-photos/${outName}`;
      return NextResponse.json({ url: finalUrl });
    }

    if (resultUrl) {
      return NextResponse.json({ url: resultUrl });
    }

    return NextResponse.json({ error: "Model returned binary data but Supabase is not configured to store it." }, { status: 500 });
  } catch (e: any) {
    console.error("[api/ai-photo] error:", e);
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}
