/**
 * API Route: /api/calendars
 *
 * POST - Crée un nouveau calendrier pour un buyer authentifié
 * GET  - Liste tous les calendriers d'un buyer authentifié
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readBuyerSession } from "@/lib/server-session";
import { supabaseServer } from "@/lib/supabase";
import {
  createCalendarRecord,
  verifyBuyerPaymentStatus,
  findActiveCalendarForBuyer,
  type CalendarCreationParams
} from "@/lib/calendar-creation";

export const runtime = "nodejs";

// Schema de validation pour la création d'un calendrier
const createCalendarSchema = z.object({
  recipientId: z.string().uuid(),
  title: z.string().min(1).max(255).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  timezone: z.string().max(64).optional(),
  delivery: z.enum(["email", "sms", "both"]).optional()
});

/**
 * GET /api/calendars
 * Liste tous les calendriers d'un buyer authentifié
 */
export async function GET(req: NextRequest) {
  // 1. Authentifier le buyer
  const session = await readBuyerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
  }

  try {
    // 2. Récupérer tous les calendriers du buyer
    const supabase = supabaseServer();
    const { data: calendars, error } = await supabase
      .from("calendars")
      .select(`
        id,
        title,
        start_date,
        timezone,
        delivery,
        status,
        open_token_expires_at,
        created_at,
        updated_at,
        receivers (
          id,
          full_name,
          email,
          relationship
        )
      `)
      .eq("buyer_id", session.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/calendars] Supabase error", error);
      return NextResponse.json({ error: "Erreur de récupération" }, { status: 500 });
    }

    // 3. Enrichir avec le nombre de contenus pour chaque calendrier
    const enrichedCalendars = await Promise.all(
      (calendars || []).map(async (calendar) => {
        const { count } = await supabase
          .from("calendar_contents")
          .select("day", { count: "exact", head: true })
          .eq("buyer_id", session.id);

        // Construire l'URL de partage (sans le token)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const shareUrlBase = `${baseUrl}/r/[token]`;

        return {
          id: calendar.id,
          title: calendar.title,
          startDate: calendar.start_date,
          timezone: calendar.timezone,
          delivery: calendar.delivery,
          status: calendar.status,
          expiresAt: calendar.open_token_expires_at,
          createdAt: calendar.created_at,
          updatedAt: calendar.updated_at,
          recipient: calendar.receivers ? {
            id: (calendar.receivers as any).id,
            fullName: (calendar.receivers as any).full_name,
            email: (calendar.receivers as any).email,
            relationship: (calendar.receivers as any).relationship
          } : null,
          contentsCount: count || 0,
          shareUrlBase
        };
      })
    );

    return NextResponse.json({ calendars: enrichedCalendars });
  } catch (error) {
    console.error("[GET /api/calendars] Exception", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/calendars
 * Crée un nouveau calendrier pour un buyer authentifié
 *
 * Étapes:
 * 1. Authentifier le buyer
 * 2. Valider le payload
 * 3. Vérifier que le buyer a payé
 * 4. Vérifier qu'il n'existe pas déjà un calendrier actif
 * 5. Créer le calendrier avec token + code sécurisés
 * 6. Retourner l'ID, l'URL de partage et le code d'accès (une seule fois)
 */
export async function POST(req: NextRequest) {
  // 1. Authentifier le buyer
  const session = await readBuyerSession(req);
  if (!session) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
  }

  try {
    // 2. Valider le payload
    const body = await req.json().catch(() => ({}));
    const result = createCalendarSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Payload invalide",
          details: result.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { recipientId, title, startDate, timezone, delivery } = result.data;

    // 3. Vérifier que le buyer a payé
    const hasPaid = await verifyBuyerPaymentStatus(session.id);
    if (!hasPaid) {
      return NextResponse.json(
        {
          error: "Paiement requis",
          message: "Vous devez effectuer le paiement avant de créer un calendrier"
        },
        { status: 403 }
      );
    }

    // 4. Vérifier qu'il n'existe pas déjà un calendrier actif
    const existingCalendarId = await findActiveCalendarForBuyer(session.id);
    if (existingCalendarId) {
      return NextResponse.json(
        {
          error: "Calendrier existant",
          message: "Vous avez déjà un calendrier actif",
          calendarId: existingCalendarId
        },
        { status: 409 }
      );
    }

    // 5. Créer le calendrier
    const params: CalendarCreationParams = {
      buyerId: session.id,
      recipientId,
      title,
      startDate,
      timezone,
      delivery
    };

    const calendar = await createCalendarRecord(params);

    // 6. Retourner les infos (token et code en clair pour cette requête uniquement)
    return NextResponse.json({
      success: true,
      calendar: {
        id: calendar.calendarId,
        shareUrl: calendar.shareUrl,
        accessCode: calendar.code,
        expiresAt: calendar.expiresAt
      },
      warning: "Le code d'accès ne sera plus accessible après cette réponse. Sauvegardez-le précieusement."
    });
  } catch (error) {
    console.error("[POST /api/calendars] Exception", error);

    // Gérer les erreurs connues
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes("does not belong")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes("already exists")) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du calendrier" },
      { status: 500 }
    );
  }
}
