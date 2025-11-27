/**
 * Promo Codes Management (Stripe Integration)
 *
 * Corrige VULN-008: Code promo hardcodé
 * Utilise les Stripe Promotion Codes au lieu d'une table custom
 *
 * Avantages:
 * - Gestion native par Stripe (expiration, limites, etc.)
 * - Interface dashboard Stripe pour créer/gérer les codes
 * - Intégration automatique avec Checkout Sessions
 * - Pas de table custom à maintenir
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-10-29.clover",
});

export type StripePromoCode = {
  id: string;
  code: string;
  couponId: string;
  percentOff: number | null;
  amountOff: number | null;
  active: boolean;
  expiresAt: number | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
};

export type ValidatePromoResult =
  | {
      valid: true;
      promoCodeId: string;
      code: string;
      percentOff: number;
      amountOff: number;
    }
  | {
      valid: false;
      error: string;
    };

/**
 * Valide un code promo via l'API Stripe
 *
 * @param code - Code promo fourni par l'utilisateur
 * @returns Résultat de la validation avec détails ou erreur
 */
export async function validatePromoCode(
  code: string
): Promise<ValidatePromoResult> {
  if (!code || code.trim().length < 3) {
    return {
      valid: false,
      error: "Code promo invalide",
    };
  }

  const normalizedCode = code.trim().toUpperCase();

  try {
    // ✅ Récupérer le promotion code depuis Stripe
    const promoCodes = await stripe.promotionCodes.list({
      code: normalizedCode,
      active: true,
      limit: 1,
      expand: ['data.coupon'],
    });

    if (promoCodes.data.length === 0) {
      return {
        valid: false,
        error: "Code promo invalide",
      };
    }

    const promoCode = promoCodes.data[0] as any;
    const coupon = promoCode.coupon as Stripe.Coupon;

    // ✅ Vérifier l'expiration du coupon
    if (coupon.redeem_by && coupon.redeem_by * 1000 < Date.now()) {
      return {
        valid: false,
        error: "Ce code promo a expiré",
      };
    }

    // ✅ Vérifier l'expiration du promotion code
    if (promoCode.expires_at && promoCode.expires_at * 1000 < Date.now()) {
      return {
        valid: false,
        error: "Ce code promo a expiré",
      };
    }

    // ✅ Vérifier les limites d'utilisation
    if (
      promoCode.max_redemptions &&
      promoCode.times_redeemed >= promoCode.max_redemptions
    ) {
      return {
        valid: false,
        error: "Ce code promo a atteint sa limite d'utilisation",
      };
    }

    if (
      coupon.max_redemptions &&
      coupon.times_redeemed >= coupon.max_redemptions
    ) {
      return {
        valid: false,
        error: "Ce code promo a atteint sa limite d'utilisation",
      };
    }

    // ✅ Code promo valide !
    return {
      valid: true,
      promoCodeId: promoCode.id,
      code: promoCode.code,
      percentOff: coupon.percent_off ?? 0,
      amountOff: coupon.amount_off ?? 0,
    };
  } catch (error) {
    console.error("[promo-codes] Stripe API error:", error);
    return {
      valid: false,
      error: "Erreur lors de la vérification du code promo",
    };
  }
}

/**
 * Récupère un promotion code Stripe par ID
 * Utile pour vérifier avant d'appliquer à une session
 *
 * @param promoCodeId - ID du promotion code Stripe
 */
export async function getPromoCodeById(
  promoCodeId: string
): Promise<StripePromoCode | null> {
  try {
    const promoCode = (await stripe.promotionCodes.retrieve(promoCodeId, {
      expand: ['coupon'],
    })) as any;
    const coupon = promoCode.coupon as Stripe.Coupon;

    return {
      id: promoCode.id,
      code: promoCode.code,
      couponId: coupon.id,
      percentOff: coupon.percent_off ?? null,
      amountOff: coupon.amount_off ?? null,
      active: promoCode.active,
      expiresAt: promoCode.expires_at,
      maxRedemptions: promoCode.max_redemptions,
      timesRedeemed: promoCode.times_redeemed,
    };
  } catch (error) {
    console.error("[promo-codes] Failed to retrieve promo code:", error);
    return null;
  }
}

/**
 * Crée un nouveau code promo Stripe (admin uniquement)
 *
 * Note: Il faut d'abord créer un Coupon, puis un Promotion Code
 *
 * @param params - Paramètres du code promo
 */
export async function createStripePromoCode(params: {
  code: string;
  percentOff?: number;
  amountOff?: number;
  currency?: string;
  maxRedemptions?: number;
  expiresAt?: number; // Unix timestamp
}): Promise<StripePromoCode | null> {
  try {
    // 1. Créer le Coupon
    const couponParams: Stripe.CouponCreateParams = {
      name: params.code,
      ...(params.percentOff ? { percent_off: params.percentOff } : {}),
      ...(params.amountOff
        ? {
            amount_off: params.amountOff,
            currency: params.currency || "eur",
          }
        : {}),
      ...(params.maxRedemptions ? { max_redemptions: params.maxRedemptions } : {}),
    };

    const coupon = await stripe.coupons.create(couponParams);

    // 2. Créer le Promotion Code lié au Coupon
    const promoCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: params.code.trim().toUpperCase(),
      ...(params.expiresAt ? { expires_at: params.expiresAt } : {}),
      ...(params.maxRedemptions ? { max_redemptions: params.maxRedemptions } : {}),
    } as any);

    return {
      id: promoCode.id,
      code: promoCode.code,
      couponId: coupon.id,
      percentOff: coupon.percent_off ?? null,
      amountOff: coupon.amount_off ?? null,
      active: promoCode.active,
      expiresAt: promoCode.expires_at,
      maxRedemptions: promoCode.max_redemptions,
      timesRedeemed: promoCode.times_redeemed,
    };
  } catch (error) {
    console.error("[promo-codes] Failed to create Stripe promo code:", error);
    return null;
  }
}
