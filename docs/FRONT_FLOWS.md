# Parcours front Advent – flux & intégrations

## 1. Wizard Acheteur (`/gift/new`)
- Les trois étapes vivent dans `components/gift-builder/*`.
- Le wizard consomme l’API mock (`/api/gift/*`).
- **Brancher Stripe** : remplacer l’appel `POST /api/gift/checkout` par une création de session Checkout (ou PaymentIntent). Le callback `handleCheckout` est l’unique endroit où déclencher la redirection vers Stripe et traiter le webhook (`checkout.session.completed`) pour appeler ensuite `/api/gift/finalize`.
- **Persister le brouillon** : à l’étape 1 ou 2, appeler `POST /api/gift/draft` (ou Supabase) pour stocker au fur et à mesure. Le module `lib/gift-memory-store.ts` montre l’interface minimale à implémenter (`saveDraft`, `saveGift`, `setShareToken`).
- **Calcul des verrouillages** : lorsque le backend deviendra réel, ajouter `lockedUntil` côté API en fonction de `startsOn` (jour 1 = `startsOn`, jour n = `startsOn + (n-1)` jours). C’est l’étape où seront générés les champs pour l’expérience bénéficiaire.

## 2. Page de partage (`/gift/[id]/share`)
- Lit les query params `shareUrl` / `token` et interroge également `getShareToken(giftId)` (mémoire).
- Pour la version connectée, remplacer cette mémoire par une lecture Supabase/SQL (ex : table `gift_share_links`).
- Le bouton Copier (`CopyButton`) suffit pour la démo ; branchement futur : ajout d’un envoi SMS/WhatsApp via Twilio/WhatsApp API.

## 3. Placeholder bénéficiaire (`/r/[token]`)
- Actuellement informatif. Cette route deviendra le point d’entrée de l’espace destinataire : vérification du token (hash en DB), pose du cookie httpOnly et affichage du calendrier final.

## 4. CTA landing
- `Créer mon calendrier` → `/gift/new` (wizard).
- `Accéder à mon calendrier` ouvre un dialog (Token Dialog) demandant l’URL `/r/...` puis redirige l’utilisateur. Le composant est câblé dans le header.

## À brancher plus tard
1. **Stripe** : intégrer Checkout dans `GiftWizard.handleCheckout`. Une fois le webhook reçu, appeler `setShareToken` (ou équivalent Supabase) pour publier le lien.
2. **Supabase / Postgres** : remplacer `lib/gift-memory-store.ts` par un adapter DB. Les routes API deviennent de simples proxys.
3. **Calendrier bénéficiaire** : créer les vraies pages `/r/[token]` + `/open/calendar` en s’appuyant sur les données persistées (24 cases + états `lockedUntil`).
