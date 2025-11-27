/**
 * Recipient Token Verification
 *
 * Corrige VULN-003: Validation destinataire sans vérification DB
 * Vérifie réellement le token et le code d'accès via Supabase
 */

import { compare } from "bcryptjs";
import { supabaseServer } from "./supabase";
import { createHash } from "crypto";

export type RecipientVerificationResult = {
  valid: true;
  calendar_id: string;
  buyer_id: string;
  recipient_id: string;
  recipient_name: string | null;
} | {
  valid: false;
  error: string;
};

/**
 * Hash un token pour le comparer avec open_token_hash_b64 en DB
 * Utilise SHA-256 comme mentionné dans le rapport de sécurité
 */
function hashToken(token: string): string {
  const hash = createHash('sha256').update(token).digest('base64');
  return hash;
}

/**
 * Vérifie un token et code d'accès destinataire
 *
 * @param token - Token d'accès fourni dans l'URL
 * @param code - Code d'accès à 4 chiffres
 * @returns Résultat de la vérification avec les vraies données du calendrier
 */
export async function verifyRecipientAccess(
  token: string,
  code: string
): Promise<RecipientVerificationResult> {
  // 1. Validation des inputs
  if (!token || token.length < 10) {
    return {
      valid: false,
      error: "Token invalide",
    };
  }

  if (!code || code.length < 4) {
    return {
      valid: false,
      error: "Code d'accès invalide",
    };
  }

  try {
    // 2. Hasher le token pour le comparer avec la DB
    const tokenHash = hashToken(token);

    // 3. Récupérer le calendrier depuis Supabase
    const supabase = supabaseServer();
    const { data: calendar, error: dbError } = await supabase
      .from("calendars")
      .select(`
        id,
        buyer_id,
        recipient_id,
        access_code_hash,
        open_token_expires_at,
        receivers (
          full_name
        )
      `)
      .eq("open_token_hash_b64", tokenHash)
      .maybeSingle();

    if (dbError) {
      console.error("[recipient-verification] Database error:", dbError);
      return {
        valid: false,
        error: "Erreur de vérification",
      };
    }

    if (!calendar) {
      return {
        valid: false,
        error: "Token invalide ou expiré",
      };
    }

    // 4. Vérifier l'expiration du token
    if (calendar.open_token_expires_at) {
      const expiresAt = new Date(calendar.open_token_expires_at);
      if (expiresAt < new Date()) {
        return {
          valid: false,
          error: "Le lien d'accès a expiré",
        };
      }
    }

    // 5. Vérifier le code d'accès (bcrypt compare)
    if (!calendar.access_code_hash) {
      console.error("[recipient-verification] No access_code_hash found for calendar", calendar.id);
      return {
        valid: false,
        error: "Configuration du calendrier invalide",
      };
    }

    const isValidCode = await compare(code, calendar.access_code_hash);
    if (!isValidCode) {
      return {
        valid: false,
        error: "Code d'accès incorrect",
      };
    }

    // 6. Retourner les VRAIES données du calendrier
    const recipientName = Array.isArray(calendar.receivers)
      ? calendar.receivers[0]?.full_name
      : (calendar.receivers as any)?.full_name || null;

    return {
      valid: true,
      calendar_id: calendar.id,
      buyer_id: calendar.buyer_id,
      recipient_id: calendar.recipient_id || "unknown",
      recipient_name: recipientName,
    };
  } catch (error) {
    console.error("[recipient-verification] Unexpected error:", error);
    return {
      valid: false,
      error: "Erreur lors de la vérification",
    };
  }
}

/**
 * Valide qu'un calendrier appartient bien à un buyer_id
 * Utilisé pour vérifier l'accès aux endpoints recipient
 *
 * @param calendar_id - ID du calendrier
 * @param buyer_id - ID du buyer attendu
 * @returns true si le calendrier appartient au buyer
 */
export async function validateCalendarOwnership(
  calendar_id: string,
  buyer_id: string
): Promise<boolean> {
  try {
    const supabase = supabaseServer();
    const { data: calendar, error } = await supabase
      .from("calendars")
      .select("buyer_id")
      .eq("id", calendar_id)
      .eq("buyer_id", buyer_id)
      .maybeSingle();

    if (error || !calendar) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("[recipient-verification] Ownership validation error:", error);
    return false;
  }
}
