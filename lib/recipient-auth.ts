/**
 * Recipient Authentication Middleware
 *
 * Corrige VULN-004: Absence de contrôle d'accès sur endpoints recipient
 * Vérifie que la session recipient JWT est valide et correspond à un calendrier réel
 */

import { NextRequest } from "next/server";
import {
  verifyRecipientSessionToken,
  type RecipientSessionPayload,
} from "./jwt-session";
import { validateCalendarOwnership } from "./recipient-verification";

export type RecipientAuthResult =
  | {
      authenticated: true;
      session: RecipientSessionPayload;
    }
  | {
      authenticated: false;
      error: string;
      status: number;
    };

/**
 * Authentifie et valide une session recipient
 *
 * @param req - NextRequest contenant le cookie recipient_session
 * @returns Résultat de l'authentification avec la session ou l'erreur
 */
export async function authenticateRecipient(
  req: NextRequest
): Promise<RecipientAuthResult> {
  // 1. Récupérer le cookie recipient_session
  const cookie = req.cookies.get("recipient_session");

  if (!cookie?.value) {
    return {
      authenticated: false,
      error: "Session non trouvée",
      status: 401,
    };
  }

  // 2. Vérifier le JWT
  const session = await verifyRecipientSessionToken(cookie.value);

  if (!session) {
    return {
      authenticated: false,
      error: "Session invalide ou expirée",
      status: 401,
    };
  }

  // 3. Vérifier que le calendrier existe et appartient au buyer_id
  const isValid = await validateCalendarOwnership(
    session.calendar_id,
    session.buyer_id
  );

  if (!isValid) {
    return {
      authenticated: false,
      error: "Accès non autorisé",
      status: 403,
    };
  }

  // ✅ Session valide et vérifiée
  return {
    authenticated: true,
    session,
  };
}

/**
 * Lit et vérifie une session recipient (legacy support pour migration progressive)
 * Version simplifiée qui retourne buyer_id et calendar_id directement
 *
 * @deprecated Utiliser authenticateRecipient() pour une meilleure sécurité
 */
export async function getRecipientSession(
  req: NextRequest
): Promise<{ buyer_id: string; calendar_id: string } | null> {
  const result = await authenticateRecipient(req);

  if (!result.authenticated) {
    return null;
  }

  return {
    buyer_id: result.session.buyer_id,
    calendar_id: result.session.calendar_id,
  };
}
