/**
 * Server Session Management (JWT-based)
 *
 * Corrige VULN-002: Sessions basées sur cookies JSON non signés
 * Utilise des JWT signés au lieu de JSON brut pour empêcher la falsification
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createBuyerSessionToken,
  verifyBuyerSessionToken,
  type BuyerSessionPayload,
} from "./jwt-session";

export type BuyerSession = {
  id: string;
  plan: string;
  name: string;
  email?: string;
  payment_status?: string;
};

const COOKIE_NAME = "buyer_session";
const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/**
 * Attache une session buyer sécurisée (JWT) au cookie
 */
export async function attachBuyerSession(
  response: NextResponse,
  session: BuyerSession
): Promise<NextResponse> {
  try {
    // Créer un JWT signé au lieu de JSON brut
    const token = await createBuyerSessionToken({
      userId: session.id,
      plan: session.plan,
      name: session.name,
      email: session.email,
      payment_status: session.payment_status,
    });

    response.cookies.set(COOKIE_NAME, token, {
      ...baseCookie,
      maxAge: 60 * 60 * 24 * 30, // 30 jours
    });

    return response;
  } catch (error) {
    console.error("[server-session] Failed to create buyer session:", error);
    throw new Error("Failed to create session token");
  }
}

/**
 * Supprime la session buyer
 */
export function clearBuyerSession(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, "", {
    ...baseCookie,
    maxAge: 0,
  });
  return response;
}

/**
 * Lit et vérifie une session buyer (JWT)
 * Retourne null si le token est invalide, expiré, ou falsifié
 */
export async function readBuyerSession(
  req: NextRequest
): Promise<BuyerSession | null> {
  const cookie = req.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return null;

  try {
    // Vérifier le JWT (signature + expiration)
    const payload = await verifyBuyerSessionToken(cookie.value);

    if (!payload) {
      return null;
    }

    // Convertir le payload JWT en BuyerSession
    return {
      id: payload.userId,
      plan: payload.plan,
      name: payload.name,
      email: payload.email,
      payment_status: payload.payment_status,
    };
  } catch (error) {
    console.warn("[server-session] Failed to verify buyer session:", error);
    return null;
  }
}

/**
 * Version synchrone pour la rétrocompatibilité (à migrer vers async)
 * @deprecated Utiliser readBuyerSession() avec await
 */
export function readBuyerSessionSync(req: NextRequest): BuyerSession | null {
  console.warn(
    "[server-session] readBuyerSessionSync is deprecated and insecure. Use readBuyerSession() with await."
  );

  const cookie = req.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return null;

  // Essayer de parser l'ancien format JSON (pour migration progressive)
  try {
    const parsed = JSON.parse(cookie.value);
    if (parsed && typeof parsed.id === "string") {
      return parsed as BuyerSession;
    }
  } catch {
    // Pas du JSON, probablement un JWT
  }

  return null;
}
