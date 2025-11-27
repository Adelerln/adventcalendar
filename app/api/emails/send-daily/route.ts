/**
 * GET /api/emails/send-daily
 * Cron job pour l'envoi quotidien d'emails
 *
 * Corrige VULN-010: Endpoint emails sans protection
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // ✅ SÉCURITÉ: Vérifier le secret Vercel Cron
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Si un secret est configuré, le vérifier
  if (cronSecret) {
    const expectedAuth = `Bearer ${cronSecret}`;

    if (authHeader !== expectedAuth) {
      console.warn("[SECURITY] Unauthorized cron access attempt", {
        ip: req.headers.get("x-forwarded-for"),
        timestamp: new Date().toISOString(),
        hasAuth: !!authHeader,
      });

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  } else {
    // Avertir si aucun secret n'est configuré
    console.warn(
      "[SECURITY] CRON_SECRET not configured! This endpoint is unprotected. " +
      "Add CRON_SECRET to environment variables."
    );
  }

  // ✅ Logger l'exécution du cron
  console.info("[CRON] Daily email job started", {
    timestamp: new Date().toISOString(),
  });

  // TODO: Implémenter la logique d'envoi d'emails
  // 1. Récupérer les calendriers actifs aujourd'hui
  // 2. Envoyer un email pour chaque calendrier
  // 3. Logger les résultats

  console.info("[CRON] Daily email job completed", {
    timestamp: new Date().toISOString(),
    sent: 0, // À remplacer par le nombre réel d'emails envoyés
  });

  return NextResponse.json({
    ok: true,
    message: "Daily email job executed",
    sent: 0, // À remplacer par le nombre réel d'emails envoyés
  });
}


