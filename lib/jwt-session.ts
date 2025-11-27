/**
 * JWT Session Management
 *
 * Remplace les cookies JSON non signés par des JWT sécurisés
 * Corrige VULN-002: Sessions basées sur cookies JSON non signés
 */

import { SignJWT, jwtVerify } from 'jose';

// Types
export type BuyerSessionPayload = {
  userId: string;
  plan: string;
  name: string;
  email?: string;
  payment_status?: string;
};

export type RecipientSessionPayload = {
  type: 'recipient';
  buyer_id: string;
  calendar_id: string;
  recipient_id: string;
  verified_at: string;
};

// Secret key (doit être en variable d'environnement)
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET is not defined in environment variables. ' +
      'Please add JWT_SECRET to your .env file.'
    );
  }

  return new TextEncoder().encode(secret);
}

/**
 * Crée un JWT signé pour une session buyer
 * @param payload - Données de la session
 * @param expiresIn - Durée de validité (défaut: 30 jours)
 */
export async function createBuyerSessionToken(
  payload: BuyerSessionPayload,
  expiresIn: string = '30d'
): Promise<string> {
  const secret = getJwtSecret();

  const token = await new SignJWT({
    userId: payload.userId,
    plan: payload.plan,
    name: payload.name,
    email: payload.email,
    payment_status: payload.payment_status,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setSubject(payload.userId)
    .sign(secret);

  return token;
}

/**
 * Vérifie et décode un JWT buyer
 * @param token - JWT à vérifier
 * @returns Payload décodé ou null si invalide
 */
export async function verifyBuyerSessionToken(
  token: string
): Promise<BuyerSessionPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    // Vérifier que les champs requis sont présents
    if (
      typeof payload.userId !== 'string' ||
      typeof payload.plan !== 'string' ||
      typeof payload.name !== 'string'
    ) {
      console.warn('[jwt-session] Invalid JWT payload structure');
      return null;
    }

    return {
      userId: payload.userId,
      plan: payload.plan,
      name: payload.name,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      payment_status: typeof payload.payment_status === 'string' ? payload.payment_status : undefined,
    };
  } catch (error) {
    // JWT invalide, expiré, ou signature incorrecte
    if (error instanceof Error) {
      console.warn('[jwt-session] Token verification failed:', error.message);
    }
    return null;
  }
}

/**
 * Crée un JWT signé pour une session recipient
 * @param payload - Données de la session recipient
 * @param expiresIn - Durée de validité (défaut: 30 jours)
 */
export async function createRecipientSessionToken(
  payload: RecipientSessionPayload,
  expiresIn: string = '30d'
): Promise<string> {
  const secret = getJwtSecret();

  const token = await new SignJWT({
    type: 'recipient',
    buyer_id: payload.buyer_id,
    calendar_id: payload.calendar_id,
    recipient_id: payload.recipient_id,
    verified_at: payload.verified_at,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setSubject(payload.calendar_id)
    .sign(secret);

  return token;
}

/**
 * Vérifie et décode un JWT recipient
 * @param token - JWT à vérifier
 * @returns Payload décodé ou null si invalide
 */
export async function verifyRecipientSessionToken(
  token: string
): Promise<RecipientSessionPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    // Vérifier que les champs requis sont présents
    if (
      payload.type !== 'recipient' ||
      typeof payload.buyer_id !== 'string' ||
      typeof payload.calendar_id !== 'string' ||
      typeof payload.recipient_id !== 'string' ||
      typeof payload.verified_at !== 'string'
    ) {
      console.warn('[jwt-session] Invalid recipient JWT payload structure');
      return null;
    }

    return {
      type: 'recipient',
      buyer_id: payload.buyer_id,
      calendar_id: payload.calendar_id,
      recipient_id: payload.recipient_id,
      verified_at: payload.verified_at,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.warn('[jwt-session] Recipient token verification failed:', error.message);
    }
    return null;
  }
}
