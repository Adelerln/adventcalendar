import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@supabase/supabase-js";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
const model = process.env.REPLICATE_MODEL || "google/nano-banana";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const prompt = data.get("prompt") as string;
    const imageFile = data.get("image") as File | null;
    let imageUrl: string | undefined = undefined;

    // Si image uploadée, on l'upload d'abord sur Supabase pour avoir une URL accessible
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const fileName = `ai-photo-input-${Date.now()}.png`;
      const { data: uploadData, error } = await supabase.storage
        .from("ai-photos")
        .upload(fileName, arrayBuffer, { contentType: imageFile.type });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ai-photos/${fileName}`;
    }

    // Appel Replicate
    const input: any = { prompt };
    if (imageUrl) input.image_input = [imageUrl];
    const output = await replicate.run(model, { input });
    const resultUrl = Array.isArray(output) ? output[0] : output?.url?.() || output;
    if (!resultUrl) return NextResponse.json({ error: "No output from Replicate" }, { status: 500 });

    // Télécharge l'image générée
    const res = await fetch(resultUrl);
    const blob = await res.blob();
    const outName = `ai-photo-output-${Date.now()}.jpg`;
    const { data: outUpload, error: outError } = await supabase.storage
      .from("ai-photos")
      .upload(outName, await blob.arrayBuffer(), { contentType: blob.type });
    if (outError) return NextResponse.json({ error: outError.message }, { status: 500 });
    const finalUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ai-photos/${outName}`;

    return NextResponse.json({ url: finalUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Erreur serveur" }, { status: 500 });
  }
}
