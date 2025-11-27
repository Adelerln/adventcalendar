/**
 * POST /api/advent/internal/debug/reset
 * Reset de la base de données (DEBUG UNIQUEMENT)
 *
 * Corrige VULN-005: Endpoint de reset accessible publiquement
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/advent/adapters/db/db-memory";

export async function POST(req: NextRequest) {
  // ✅ SÉCURITÉ 1: Bloquer complètement en production
  if (process.env.NODE_ENV === "production") {
    console.warn("[SECURITY] Attempted reset in production blocked", {
      ip: req.headers.get("x-forwarded-for"),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: "Forbidden in production" },
      { status: 403 }
    );
  }

  // ✅ SÉCURITÉ 2: Vérifier un secret admin même en dev
  const adminSecret = req.headers.get("x-admin-secret");
  const expectedSecret = process.env.ADMIN_SECRET;

  if (expectedSecret && adminSecret !== expectedSecret) {
    console.warn("[SECURITY] Unauthorized reset attempt in development", {
      ip: req.headers.get("x-forwarded-for"),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // ✅ Logger l'action pour audit
  console.warn("[ADMIN] Database reset executed", {
    ip: req.headers.get("x-forwarded-for"),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });

  await db.bootstrap();
  await db.reset();

  return NextResponse.json({
    ok: true,
    message: "Database reset completed",
    environment: process.env.NODE_ENV,
  });
}
