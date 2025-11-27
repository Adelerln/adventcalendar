# 🎫 GUIDE: Codes Promo avec Stripe

## ✅ Avantages de l'approche Stripe

Au lieu de gérer les codes promo dans une table custom, on utilise les **Stripe Promotion Codes** :

- ✅ Gestion native par Stripe (expiration, limites, etc.)
- ✅ Interface Dashboard Stripe pour créer/gérer
- ✅ Tracking automatique des utilisations
- ✅ Intégration avec Checkout Sessions
- ✅ Pas de table custom à maintenir
- ✅ Audit trail natif

---

## 🚀 Comment créer un code promo

### Option 1: Via le Dashboard Stripe (Recommandé)

1. Connectez-vous au [Dashboard Stripe](https://dashboard.stripe.com)
2. Allez dans **Products** → **Coupons**
3. Cliquez sur **Create coupon**
4. Configurez :
   - **Name**: X-HEC-2026
   - **Type**: Percentage discount → 100%
   - **Duration**: Once
   - **Redemption limits**: Max 500 times
   - **Expiration**: 31 Dec 2026

5. Créez ensuite un **Promotion Code** :
   - Allez dans **Products** → **Promotion codes**
   - Cliquez **Create promotion code**
   - Sélectionnez le coupon créé
   - Entrez le code: `X-HEC-2026`
   - Activez-le

✅ **C'est tout !** Le code sera automatiquement validé par l'API.

---

### Option 2: Via l'API (Pour automatisation)

Utilisez la fonction `createStripePromoCode()` :

```typescript
import { createStripePromoCode } from "@/lib/promo-codes";

// Créer un code 100% off
const promoCode = await createStripePromoCode({
  code: "X-HEC-2026",
  percentOff: 100,
  maxRedemptions: 500,
  expiresAt: Math.floor(new Date("2026-12-31").getTime() / 1000),
});
```

---

### Option 3: Via Stripe CLI

```bash
# 1. Créer le coupon
stripe coupons create \
  --percent-off 100 \
  --name "X-HEC-2026" \
  --max-redemptions 500

# 2. Créer le promotion code (remplacer COUPON_ID)
stripe promotion_codes create \
  --coupon COUPON_ID \
  --code X-HEC-2026 \
  --expires-at 1735689600
```

---

## 🔍 Comment ça fonctionne

### 1. L'utilisateur entre un code promo

```typescript
// Frontend envoie le code au checkout
POST /api/create-checkout-session
{
  "promoCode": "X-HEC-2026"
}
```

### 2. Le backend valide via Stripe

```typescript
import { validatePromoCode } from "@/lib/promo-codes";

const result = await validatePromoCode("X-HEC-2026");

if (result.valid) {
  // Code valide !
  console.log("Réduction:", result.percentOff, "%");
  console.log("ID Stripe:", result.promoCodeId);
}
```

### 3. Application automatique dans Checkout Session

Le code `create-checkout-session/route.ts` gère déjà :
- Validation du code
- Application du prix (0€ si 100%)
- Bypass de Stripe si gratuit

---

## 📊 Suivi des utilisations

### Dashboard Stripe
- Allez dans **Products** → **Promotion codes**
- Cliquez sur votre code
- Voir : **Times redeemed** / **Max redemptions**

### Via l'API
```typescript
import { getPromoCodeById } from "@/lib/promo-codes";

const promo = await getPromoCodeById("promo_xxxxx");
console.log(`Utilisé ${promo.timesRedeemed} / ${promo.maxRedemptions} fois`);
```

---

## 🎯 Exemples de codes promo

### Code 100% off (gratuit)
```typescript
await createStripePromoCode({
  code: "NOEL2024",
  percentOff: 100,
  maxRedemptions: 100,
});
```

### Code 50% off
```typescript
await createStripePromoCode({
  code: "PROMO50",
  percentOff: 50,
});
```

### Montant fixe (10€ de réduction)
```typescript
await createStripePromoCode({
  code: "10EUROS",
  amountOff: 1000, // en centimes
  currency: "eur",
});
```

### Code avec expiration
```typescript
await createStripePromoCode({
  code: "SUMMER2024",
  percentOff: 30,
  expiresAt: Math.floor(new Date("2024-08-31").getTime() / 1000),
});
```

---

## 🔧 Configuration

**Aucune configuration nécessaire !**

Le système utilise votre `STRIPE_SECRET_KEY` existant.

---

## ❌ Migration SQL obsolète

⚠️ **La migration `001_create_promo_codes_table.sql` n'est plus nécessaire**

On n'utilise plus de table custom. Vous pouvez :
- Ignorer cette migration
- Ou la supprimer : `rm migrations/001_create_promo_codes_table.sql`

---

## 🧪 Tester en développement

```bash
# 1. Créer un code test dans Stripe Test Mode
# Dashboard → Products → Promotion codes → Create

# 2. Tester l'endpoint
curl -X POST http://localhost:3000/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Cookie: buyer_session=YOUR_JWT" \
  -d '{
    "promoCode": "X-HEC-2026"
  }'

# Vérifier que le prix est réduit ou gratuit
```

---

## 📚 Documentation Stripe

- [Coupons API](https://stripe.com/docs/api/coupons)
- [Promotion Codes API](https://stripe.com/docs/api/promotion_codes)
- [Checkout with Coupons](https://stripe.com/docs/billing/subscriptions/coupons)

---

## ✅ Checklist

- [ ] Créer le code promo dans Stripe Dashboard
- [ ] Tester la validation avec `validatePromoCode()`
- [ ] Tester un checkout avec le code
- [ ] Vérifier le tracking dans Dashboard Stripe
- [ ] ~~Exécuter la migration SQL~~ (plus nécessaire)
