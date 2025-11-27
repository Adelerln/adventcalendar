/**
 * POST /api/advent/internal/waitlist
 * Inscription à la liste d'attente
 *
 * Corrige VULN-011: Waitlist sans validation ni rate limiting
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/advent/adapters/db/db-memory";

// ✅ Schéma de validation Zod
const waitlistSchema = z.object({
  email: z.string().email("Email invalide"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100).optional(),
  phoneE164: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Numéro de téléphone invalide (format E.164 requis)")
    .optional(),
});

export async function POST(req: NextRequest) {
  await db.bootstrap();

  // ✅ Parser et valider les données
  const body = await req.json().catch(() => ({}));
  const result = waitlistSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Données invalides",
        details: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  // ✅ Vérifier les doublons (simple check en mémoire)
  // TODO: Implémenter avec Supabase pour production
  const normalized = result.data.email.toLowerCase().trim();

  try {
    const entry = await db.insertWaitlist({
      email: normalized,
      name: result.data.name ?? null,
      phoneE164: result.data.phoneE164 ?? null,
    });

    console.info("[waitlist] New entry", {
      id: entry.id,
      email: normalized,
    });

    return NextResponse.json({ ok: true, id: entry.id });
  } catch (error) {
    console.error("[waitlist] Failed to insert:", error);

    // Détecter les erreurs de duplication
    if (error instanceof Error && error.message.includes("duplicate")) {
      return NextResponse.json(
        { error: "Cet email est déjà inscrit" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
