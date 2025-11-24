import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@supabase/supabase-js";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const model = process.env.REPLICATE_MODEL || "google/nano-banana";

let supabase: ReturnType<typeof createClient> | null = null;
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
} else {
  console.warn("[api/ai-photo] Supabase not configured (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing). Skipping uploads.");
}

export async function POST(req: NextRequest) {
  try {
    console.log("[api/ai-photo] POST called");
    const data = await req.formData();
    const prompt = data.get("prompt") as string;
    const imageFile = data.get("image") as File | null;
    console.log("[api/ai-photo] prompt length:", prompt?.length, "hasImage:", !!imageFile);
    let imageUrl: string | undefined = undefined;

    // Si image uploadée, on l'upload d'abord sur Supabase pour avoir une URL accessible
    if (imageFile && imageFile.size > 0) {
      if (supabase) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const fileName = `ai-photo-input-${Date.now()}.png`;
        const { data: uploadData, error } = await supabase.storage
          .from("ai-photos")
          .upload(fileName, arrayBuffer, { contentType: imageFile.type });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ai-photos/${fileName}`;
      } else {
        // Supabase not configured: cannot upload input image. Continue without image.
        console.warn("[api/ai-photo] Received image but Supabase not configured; skipping input upload.");
        imageUrl = undefined;
      }
    }

  // Appel Replicate
    const input: any = { prompt };
    if (imageUrl) input.image_input = [imageUrl];
  console.log("[api/ai-photo] calling replicate model", model);
  const output = await replicate.run(model as any, { input });
  console.log("[api/ai-photo] replicate output:", output);

  // Normalize different possible outputs from replicate.run
  let resultUrl: string | null = null;
  let resultBuffer: ArrayBuffer | Buffer | null = null;

  const tryExtractUrl = (val: any): string | null => {
    try {
      if (!val) return null;
      if (typeof val === "string") return val;
      if (typeof val.url === "function") return val.url();
      if (val.url && typeof val.url === "string") return val.url;
      return null;
    } catch (err) {
      return null;
    }
  };

  if (Array.isArray(output)) {
    // prefer first extractable URL
    for (const item of output) {
      const u = tryExtractUrl(item);
      if (u) {
        resultUrl = u;
        break;
      }
      // check buffer-like
      if (item && (item instanceof Uint8Array || (typeof Buffer !== 'undefined' && Buffer.isBuffer(item)))) {
        resultBuffer = item as any;
        break;
      }
    }
  } else {
    resultUrl = tryExtractUrl(output);
    if (!resultUrl) {
      // maybe binary
      if (output && (output instanceof Uint8Array || (typeof Buffer !== 'undefined' && Buffer.isBuffer(output)))) {
        resultBuffer = output as any;
      }
    }
  }

  if (!resultUrl && !resultBuffer) {
    return NextResponse.json({ error: "No usable output from Replicate (no url() or binary returned)" }, { status: 500 });
  }

  // If we have a URL, fetch it to get the bytes; otherwise use the buffer directly
  let finalBuffer: ArrayBuffer | Buffer | null = null;
  let contentType = "image/jpeg";

  if (resultUrl) {
    const res = await fetch(resultUrl);
    if (!res.ok) return NextResponse.json({ error: `Failed to fetch result URL: ${res.status}` }, { status: 500 });
    contentType = res.headers.get("content-type") || contentType;
    finalBuffer = await res.arrayBuffer();
  } else if (resultBuffer) {
    finalBuffer = resultBuffer as any;
  }

  if (!finalBuffer) return NextResponse.json({ error: "Unable to obtain output bytes" }, { status: 500 });

  // Upload to Supabase if available, else return a message or the original resultUrl if present
  if (supabase) {
    const outName = `ai-photo-output-${Date.now()}.jpg`;
    // Ensure we pass an ArrayBuffer or Buffer
    const uploadData = finalBuffer instanceof ArrayBuffer ? finalBuffer : (finalBuffer as Buffer).buffer;
    const { data: outUpload, error: outError } = await supabase.storage
      .from("ai-photos")
      .upload(outName, uploadData as any, { contentType });
    if (outError) return NextResponse.json({ error: outError.message }, { status: 500 });
    const finalUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ai-photos/${outName}`;
    return NextResponse.json({ url: finalUrl });
  }

  // Supabase not configured: if we had an original accessible URL, return it; otherwise, return an error
  if (resultUrl) {
    return NextResponse.json({ url: resultUrl });
  }

  return NextResponse.json({ error: "Model returned binary data but Supabase is not configured to store it." }, { status: 500 });
  } catch (e: any) {
    console.error("[api/ai-photo] error:", e);
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}
