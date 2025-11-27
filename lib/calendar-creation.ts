/**
 * Calendar Creation Utilities
 *
 * Fonctions pour créer et sécuriser les calendriers de l'Avent
 * avec génération de tokens d'accès et codes de vérification
 */

import { randomBytes, createHash } from "crypto";
import { hash as bcryptHash } from "bcryptjs";
import { supabaseServer } from "./supabase";

/**
 * Génère un token d'accès sécurisé pour le lien de partage
 * Utilise 32 bytes random encodés en base64url (URL-safe)
 *
 * @returns Token de 43 caractères URL-safe
 */
export function generateAccessToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Génère un code d'accès à 4 chiffres aléatoire
 *
 * @returns Code numérique de "0000" à "9999" (avec padding)
 */
export function generateAccessCode(): string {
  const code = Math.floor(Math.random() * 10000);
  return code.toString().padStart(4, "0");
}

/**
 * Hash un token avec SHA-256 pour stockage sécurisé en DB
 *
 * @param token - Token en clair
 * @returns Hash base64 du token
 */
export function hashAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("base64");
}

/**
 * Hash un code d'accès avec bcrypt pour stockage sécurisé en DB
 * Utilise bcrypt avec 10 rounds de salt automatique
 *
 * @param code - Code à 4 chiffres en clair
 * @returns Hash bcrypt du code
 */
export async function hashAccessCode(code: string): Promise<string> {
  return bcryptHash(code, 10);
}

/**
 * Calcule la date du prochain 1er décembre
 * Si on est déjà en décembre, retourne l'année suivante
 *
 * @returns Date ISO du prochain 1er décembre
 */
export function computeNextDecember1st(): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11

  // Si on est en décembre ou après, passer à l'année suivante
  const targetYear = currentMonth >= 11 ? currentYear + 1 : currentYear;

  return `${targetYear}-12-01`;
}

/**
 * Vérifie qu'un acheteur a bien payé avant de créer le calendrier
 *
 * @param buyerId - ID de l'acheteur
 * @returns true si l'acheteur a payé (status 'paid' ou 'paid_with_code')
 */
export async function verifyBuyerPaymentStatus(buyerId: string): Promise<boolean> {
  try {
    const supabase = supabaseServer();
    const { data: buyer, error } = await supabase
      .from("buyers")
      .select("payment_status")
      .eq("id", buyerId)
      .maybeSingle();

    if (error || !buyer) {
      console.error("[verifyBuyerPaymentStatus] Buyer not found or error", { buyerId, error });
      return false;
    }

    return buyer.payment_status === "paid" || buyer.payment_status === "paid_with_code";
  } catch (error) {
    console.error("[verifyBuyerPaymentStatus] Exception", error);
    return false;
  }
}

/**
 * Récupère l'email d'un acheteur
 *
 * @param buyerId - ID de l'acheteur
 * @returns Email de l'acheteur ou null
 */
export async function getBuyerEmail(buyerId: string): Promise<string | null> {
  try {
    const supabase = supabaseServer();
    const { data: buyer, error } = await supabase
      .from("buyers")
      .select("email")
      .eq("id", buyerId)
      .maybeSingle();

    if (error || !buyer) {
      console.error("[getBuyerEmail] Buyer not found or error", { buyerId, error });
      return null;
    }

    return buyer.email;
  } catch (error) {
    console.error("[getBuyerEmail] Exception", error);
    return null;
  }
}

export type CalendarCreationParams = {
  buyerId: string;
  recipientId: string;
  title?: string;
  startDate?: string;
  timezone?: string;
  delivery?: "email" | "sms" | "both";
};

export type CalendarCreationResult = {
  calendarId: string;
  token: string;
  code: string;
  shareUrl: string;
  expiresAt: string;
};

/**
 * Crée un enregistrement calendrier dans Supabase avec tous les paramètres de sécurité
 *
 * Étapes:
 * 1. Valide que le buyer et le recipient existent
 * 2. Vérifie qu'il n'existe pas déjà un calendrier actif pour ce buyer
 * 3. Génère le token et le code d'accès
 * 4. Hash le token et le code pour stockage
 * 5. Crée l'enregistrement dans la table calendars
 * 6. Retourne l'ID, le token/code en clair, et l'URL de partage
 *
 * @param params - Paramètres du calendrier
 * @returns Résultat avec ID, token/code en clair, et URL
 * @throws Error si la création échoue
 */
export async function createCalendarRecord(
  params: CalendarCreationParams
): Promise<CalendarCreationResult> {
  const {
    buyerId,
    recipientId,
    title = "Mon calendrier de l'Avent",
    startDate = computeNextDecember1st(),
    timezone = "Europe/Paris",
    delivery = "email"
  } = params;

  const supabase = supabaseServer();

  // 1. Vérifier que le buyer existe
  const { data: buyer, error: buyerError } = await supabase
    .from("buyers")
    .select("id")
    .eq("id", buyerId)
    .maybeSingle();

  if (buyerError || !buyer) {
    throw new Error(`Buyer not found: ${buyerId}`);
  }

  // 2. Vérifier que le recipient existe ET appartient au buyer
  const { data: recipient, error: recipientError } = await supabase
    .from("receivers")
    .select("id, buyer_id")
    .eq("id", recipientId)
    .maybeSingle();

  if (recipientError || !recipient) {
    throw new Error(`Recipient not found: ${recipientId}`);
  }

  if (recipient.buyer_id !== buyerId) {
    throw new Error(`Recipient ${recipientId} does not belong to buyer ${buyerId}`);
  }

  // 3. Vérifier qu'il n'existe pas déjà un calendrier actif pour ce buyer
  const { data: existingCalendar, error: existingError } = await supabase
    .from("calendars")
    .select("id")
    .eq("buyer_id", buyerId)
    .eq("status", "active")
    .maybeSingle();

  if (existingError) {
    console.error("[createCalendarRecord] Error checking existing calendar", existingError);
  }

  if (existingCalendar) {
    throw new Error(`Active calendar already exists for buyer ${buyerId}: ${existingCalendar.id}`);
  }

  // 4. Générer le token et le code d'accès
  const token = generateAccessToken();
  const code = generateAccessCode();

  // 5. Hash le token et le code
  const tokenHash = hashAccessToken(token);
  const codeHash = await hashAccessCode(code);

  // 6. Calculer la date d'expiration (1 an après création)
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  const expiresAtISO = expiresAt.toISOString();

  // 7. Créer l'enregistrement dans la table calendars
  const { data: calendar, error: createError } = await supabase
    .from("calendars")
    .insert({
      buyer_id: buyerId,
      recipient_id: recipientId,
      title,
      start_date: startDate,
      timezone,
      delivery,
      status: "active",
      open_token_hash_b64: tokenHash,
      access_code_hash: codeHash,
      open_token_expires_at: expiresAtISO
    })
    .select("id")
    .single();

  if (createError || !calendar) {
    console.error("[createCalendarRecord] Failed to create calendar", createError);
    throw new Error(`Failed to create calendar: ${createError?.message || "Unknown error"}`);
  }

  // 8. Construire l'URL de partage
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const shareUrl = `${baseUrl}/r/${token}`;

  console.info("[createCalendarRecord] Calendar created successfully", {
    calendarId: calendar.id,
    buyerId,
    recipientId,
    shareUrl: `${baseUrl}/r/[token]` // Log sans le vrai token
  });

  return {
    calendarId: calendar.id,
    token,
    code,
    shareUrl,
    expiresAt: expiresAtISO
  };
}

/**
 * Vérifie si un buyer a déjà un calendrier actif
 *
 * @param buyerId - ID de l'acheteur
 * @returns ID du calendrier actif ou null
 */
export async function findActiveCalendarForBuyer(
  buyerId: string
): Promise<string | null> {
  try {
    const supabase = supabaseServer();
    const { data: calendar, error } = await supabase
      .from("calendars")
      .select("id")
      .eq("buyer_id", buyerId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("[findActiveCalendarForBuyer] Error", error);
      return null;
    }

    return calendar?.id || null;
  } catch (error) {
    console.error("[findActiveCalendarForBuyer] Exception", error);
    return null;
  }
}

/**
 * Récupère les détails d'un calendrier avec infos buyer et recipient
 *
 * @param calendarId - ID du calendrier
 * @returns Détails du calendrier ou null
 */
export async function getCalendarDetails(calendarId: string) {
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("calendars")
      .select(`
        id,
        buyer_id,
        recipient_id,
        title,
        start_date,
        timezone,
        delivery,
        status,
        open_token_expires_at,
        created_at,
        buyers (
          email,
          name
        ),
        receivers (
          full_name,
          email
        )
      `)
      .eq("id", calendarId)
      .maybeSingle();

    if (error) {
      console.error("[getCalendarDetails] Error", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("[getCalendarDetails] Exception", error);
    return null;
  }
}
