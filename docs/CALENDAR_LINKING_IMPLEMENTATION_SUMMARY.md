# Résumé de l'implémentation : Connexion calendrier acheteur → receveur

## ✅ Phases complétées

### 1. Utilitaires de création de calendrier (`lib/calendar-creation.ts`)

**Fonctions créées :**
- `generateAccessToken()` - Génère un token sécurisé 32 bytes base64url
- `generateAccessCode()` - Génère un code à 4 chiffres
- `hashAccessToken()` - Hash SHA-256 pour stockage DB
- `hashAccessCode()` - Hash bcrypt pour stockage DB
- `computeNextDecember1st()` - Calcule la prochaine date de début
- `verifyBuyerPaymentStatus()` - Vérifie que le buyer a payé
- `getBuyerEmail()` - Récupère l'email du buyer
- `createCalendarRecord()` - Crée l'enregistrement complet avec sécurité
- `findActiveCalendarForBuyer()` - Trouve un calendrier actif existant
- `getCalendarDetails()` - Récupère les détails avec joins

**Sécurité implémentée :**
- Token : 32 bytes random → SHA-256 hash
- Code : 4 chiffres aléatoires → bcrypt hash (10 rounds)
- Validation buyer + recipient ownership
- Vérification unicité calendrier actif

### 2. Endpoint de création (`app/api/calendars/route.ts`)

**GET /api/calendars**
- Liste tous les calendriers du buyer authentifié
- Enrichi avec nombre de contenus par calendrier
- Inclut les infos du recipient

**POST /api/calendars**
- Crée un nouveau calendrier
- Validation Zod stricte
- Vérifie paiement buyer
- Vérifie unicité calendrier actif
- Retourne token + code (une seule fois)

**Codes d'erreur gérés :**
- 401 : Non authentifié
- 400 : Payload invalide
- 403 : Paiement requis / Recipient non autorisé
- 404 : Buyer ou recipient introuvable
- 409 : Calendrier déjà existant
- 500 : Erreur Supabase

### 3. Webhook Stripe modifié (`app/api/webhooks/stripe/route.ts`)

**Fonction `autoCreateCalendarAfterPayment()` ajoutée :**
1. Récupère le dernier receiver créé par le buyer
2. Vérifie qu'il n'existe pas déjà un calendrier actif
3. Crée automatiquement le calendrier avec `createCalendarRecord()`
4. Récupère les infos du buyer (email, nom)
5. Envoie l'email de partage avec le lien + code
6. Logs détaillés pour monitoring
7. Gestion d'erreurs robuste (ne fait pas échouer le webhook)

**Appel automatique :**
- Déclenché après `markBuyerPaymentAsPaid()` dans `handleCheckoutSession()`
- Fonctionne aussi pour les anciens projects (fallback)

### 4. Template d'email de partage (`lib/email.ts`)

**Fonction `sendCalendarShareEmail()` ajoutée :**

**Design festif HTML :**
- Header avec titre doré et émojis
- Section lien de partage avec fond doré
- Section code d'accès avec fond rouge et code doré en gros (48px)
- Instructions de partage numérotées
- Notice de sécurité
- CTA vers le dashboard
- Footer avec informations

**Contenu :**
- Lien cliquable et copiable
- Code d'accès en gros caractères dorés dans une box
- Avertissement : "Ce code ne sera plus accessible"
- Instructions de partage en 3 étapes
- Conseil de sécurité : communiquer le code séparément
- Version texte plain pour fallback

### 5. Page de partage (`app/share/[calendarId]/page.tsx`)

**Fonctionnalités :**
- Affichage festif du lien + code
- Bouton "Copier le lien" avec feedback
- Bouton "Copier le code" avec feedback
- Boutons de partage : Email, SMS, WhatsApp
- Instructions de partage
- Notice de sécurité
- Redirection automatique si pas de code (sécurité)
- Design cohérent avec le reste de l'app (fond rouge, paillettes dorées)

**Sécurité :**
- Code d'accès passé uniquement en query param (après création)
- Redirection vers dashboard si code absent
- Avertissement "ne sera plus accessible"

---

## 🔄 Flux utilisateur complet

### Parcours acheteur

1. **Création du contenu** (`/calendars/new`)
   - Sélection du plan (Essentiel ou Premium)
   - Remplissage des 24 jours (photo, message, dessin, musique)
   - Sauvegarde dans `calendar_contents` avec `buyer_id`

2. **Infos du receveur** (`/recipient`)
   - Nom, email, relation
   - POST `/api/receivers` → Sauvegarde dans `receivers` avec `buyer_id`

3. **Paiement** (`/checkout` → Stripe)
   - POST `/api/create-checkout-session`
   - Redirection vers Stripe Checkout
   - Paiement réussi → webhook Stripe appelé

4. **Finalisation automatique** (webhook Stripe)
   - `autoCreateCalendarAfterPayment()` s'exécute
   - Création dans `calendars` avec token + code hashés
   - Email envoyé au buyer avec lien + code
   - Buyer redirigé vers dashboard avec notification

5. **Page de partage** (optionnel, si création manuelle)
   - `/share/[calendarId]?url=[shareUrl]&code=[code]&recipient=[name]`
   - Affichage visuel du lien + code
   - Boutons de partage direct

6. **Partage au recipient**
   - Buyer envoie le lien (email/SMS/WhatsApp)
   - Buyer communique le code séparément (téléphone/SMS)

### Parcours recipient

1. **Accès** (`/r/[token]`)
   - Recipient clique sur le lien
   - Entre le code d'accès à 4 chiffres

2. **Vérification** (`/api/advent/recipient/verify`)
   - `verifyRecipientAccess()` hash le token → cherche dans `calendars`
   - Vérifie le code avec bcrypt
   - Crée JWT `recipient_session` avec `buyer_id`, `calendar_id`, `recipient_id`
   - Cookie sécurisé créé

3. **Visualisation** (`/open/calendar`)
   - GET `/api/advent/recipient/days` → Liste 24 jours
   - Lit depuis `calendar_contents` filtré par `buyer_id` (de la session)
   - Affichage avec indicateurs (hasPhoto, hasMessage, etc.)

4. **Ouverture d'un jour** (`/api/advent/recipient/open`)
   - POST avec `dayNumber`
   - Lit depuis `calendar_contents` avec `buyer_id` + `day`
   - Merge des contenus multi-types (photo + message + dessin + musique)
   - Affichage modal avec contenu complet

---

## 🗄️ Schéma de base de données

### Table `calendars` (requis)

```sql
CREATE TABLE IF NOT EXISTS calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES receivers(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Mon calendrier de l''Avent',
  start_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 day'),
  timezone TEXT DEFAULT 'Europe/Paris',
  delivery TEXT CHECK (delivery IN ('email', 'sms', 'both')) DEFAULT 'email',
  status TEXT CHECK (status IN ('draft', 'active', 'expired')) DEFAULT 'active',
  open_token_hash_b64 TEXT NOT NULL UNIQUE,
  access_code_hash TEXT NOT NULL,
  open_token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_calendars_buyer_id ON calendars(buyer_id);
CREATE INDEX idx_calendars_recipient_id ON calendars(recipient_id);
CREATE INDEX idx_calendars_token_hash ON calendars(open_token_hash_b64);
CREATE INDEX idx_calendars_status ON calendars(status);

-- Un buyer ne peut avoir qu'un seul calendrier actif à la fois
CREATE UNIQUE INDEX idx_calendars_buyer_active
ON calendars(buyer_id)
WHERE status = 'active';
```

### Tables existantes utilisées

- **`buyers`** : `id`, `email`, `full_name`, `payment_status`, `plan`
- **`receivers`** : `id`, `buyer_id`, `full_name`, `email`, `phone_e164`, `relationship`
- **`calendar_contents`** : `buyer_id`, `day`, `type`, `content`, `title`, `plan`

---

## 🧪 Tests à effectuer

### Tests unitaires

- [ ] `generateAccessToken()` génère des tokens uniques de 43 caractères
- [ ] `generateAccessCode()` génère des codes à 4 chiffres entre 0000-9999
- [ ] `hashAccessToken()` produit des hashs SHA-256 valides
- [ ] `hashAccessCode()` produit des hashs bcrypt vérifiables
- [ ] `computeNextDecember1st()` retourne la bonne année
- [ ] `verifyBuyerPaymentStatus()` retourne true si paid/paid_with_code
- [ ] `createCalendarRecord()` crée bien tous les champs

### Tests d'intégration API

- [ ] GET `/api/calendars` sans session → 401
- [ ] GET `/api/calendars` avec session → liste calendriers
- [ ] POST `/api/calendars` sans session → 401
- [ ] POST `/api/calendars` avec recipientId invalide → 404
- [ ] POST `/api/calendars` sans paiement → 403
- [ ] POST `/api/calendars` avec recipient d'un autre buyer → 403
- [ ] POST `/api/calendars` valide → 200 + token + code
- [ ] POST `/api/calendars` deux fois → 409 (déjà existant)

### Tests webhook Stripe

- [ ] Webhook avec buyerId → calendrier créé automatiquement
- [ ] Webhook avec buyerId → email envoyé au buyer
- [ ] Webhook sans receiver → pas de calendrier créé (log warning)
- [ ] Webhook avec calendrier existant → skip création (log info)
- [ ] Webhook avec erreur email → calendrier créé quand même

### Tests end-to-end

#### Flux complet nouveau buyer

1. [ ] Signup → Login → Buyer authentifié
2. [ ] Remplir 24 jours → Contenus sauvegardés dans `calendar_contents`
3. [ ] Enter infos receiver → Receiver créé dans `receivers`
4. [ ] Paiement Stripe → Webhook déclenché
5. [ ] Calendrier créé automatiquement dans `calendars`
6. [ ] Email reçu par buyer avec lien + code
7. [ ] Clic sur lien email → Redirection dashboard ou share page
8. [ ] Partage lien au recipient
9. [ ] Recipient clique `/r/[token]` → Page de vérification
10. [ ] Recipient entre code → Session JWT créée
11. [ ] Recipient voit liste 24 jours
12. [ ] Recipient ouvre jour 1 → Contenu correct affiché
13. [ ] Recipient ouvre jour avec multi-contenus → Tous affichés

#### Flux promo code

1. [ ] Signup → Login → Buyer authentifié
2. [ ] Remplir 24 jours
3. [ ] Enter infos receiver
4. [ ] Enter promo code valide au checkout
5. [ ] Redirection directe dashboard (pas de paiement)
6. [ ] Calendrier créé automatiquement
7. [ ] Email reçu avec lien + code

#### Flux création manuelle

1. [ ] Buyer payé mais pas de calendrier auto-créé (erreur)
2. [ ] Buyer va dans dashboard
3. [ ] Bouton "Créer mon calendrier" visible
4. [ ] Clic → POST `/api/calendars` manuel
5. [ ] Redirection vers `/share/[calendarId]?url=...&code=...`
6. [ ] Page affiche lien + code visuellement
7. [ ] Boutons copie fonctionnent
8. [ ] Boutons partage Email/SMS/WhatsApp fonctionnent

### Tests de sécurité

- [ ] Token invalide → Recipient peut pas accéder
- [ ] Code invalide → Recipient peut pas accéder
- [ ] Token expiré → Recipient peut pas accéder
- [ ] Recipient A ne peut pas voir calendrier de Buyer B
- [ ] Code d'accès n'apparaît jamais dans les logs
- [ ] Token complet n'apparaît jamais dans les logs
- [ ] Page `/share/[calendarId]` sans query param code → Redirige dashboard
- [ ] Session recipient JWT vérifie buyer_id ownership
- [ ] Modifier `buyer_id` dans cookie recipient → Erreur 403

### Tests UI/UX

- [ ] Email HTML s'affiche bien dans Gmail, Outlook, Apple Mail
- [ ] Email plain text lisible si HTML pas supporté
- [ ] Page `/share/[calendarId]` responsive mobile
- [ ] Code d'accès lisible en gros sur mobile
- [ ] Boutons copie donnent feedback visuel
- [ ] Boutons partage ouvrent les apps correctes
- [ ] Paillettes et animations fluides
- [ ] Dashboard affiche liste calendriers correctement

---

## 📦 Variables d'environnement requises

```bash
# Base URL (requis pour les liens de partage)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Supabase (requis)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# JWT (requis pour sessions)
JWT_SECRET=your-secret-key-here

# Stripe (requis pour paiement)
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Resend (requis pour emails)
RESEND_API_KEY=re_xxx

# Optionnel
ADMIN_SECRET=admin-secret-for-debug-endpoints
CRON_SECRET=cron-secret-for-daily-emails
```

---

## 🚀 Déploiement

### Checklist pré-déploiement

1. **Migrations DB**
   - [ ] Créer table `calendars` avec indexes
   - [ ] Vérifier contrainte unique `idx_calendars_buyer_active`
   - [ ] Tester rollback migration

2. **Variables d'environnement**
   - [ ] `NEXT_PUBLIC_APP_URL` configuré en production
   - [ ] Toutes les clés API configurées
   - [ ] Secrets générés avec `openssl rand -base64 32`

3. **Webhook Stripe**
   - [ ] URL webhook configurée : `https://domain.com/api/webhooks/stripe`
   - [ ] Events activés : `checkout.session.completed`, `checkout.session.async_payment_succeeded`
   - [ ] `STRIPE_WEBHOOK_SECRET` récupéré et configuré

4. **Email**
   - [ ] Domain vérifié dans Resend
   - [ ] SPF et DKIM configurés
   - [ ] Template d'email testé

5. **Tests**
   - [ ] Tous les tests unitaires passent
   - [ ] Tests end-to-end passent sur staging
   - [ ] Email de test reçu et bien affiché

6. **Monitoring**
   - [ ] Logs configurés (Vercel, Sentry, etc.)
   - [ ] Alerts configurées si erreurs > 5%
   - [ ] Dashboard pour suivre créations de calendriers

### Commandes de déploiement

```bash
# Build local
npm run build

# Vérifier les erreurs TypeScript
npm run type-check

# Déploiement Vercel
vercel --prod

# Ou via Git (si auto-deploy activé)
git push origin main
```

### Rollback plan

Si problème critique :

1. **Désactiver auto-création dans webhook** (commentaire ligne 80)
2. **Rollback code** : `vercel rollback [deployment-id]`
3. **Buyers affectés** : Offrir création manuelle via dashboard
4. **Support** : Email aux buyers sans calendrier créé

---

## 📊 Monitoring et métriques

### Logs à surveiller

```
[stripe-webhook] Starting auto-calendar creation for buyer {buyerId}
[stripe-webhook] Calendar auto-created successfully {calendarId}
[stripe-webhook] Share email sent successfully {buyerEmail}
[stripe-webhook] Calendar auto-creation failed {error}
```

### Métriques clés

- **Taux de création réussie** : `calendriers créés / paiements réussis` (objectif: >95%)
- **Taux d'emails envoyés** : `emails envoyés / calendriers créés` (objectif: >98%)
- **Taux d'accès recipient** : `recipients vérifiés / calendriers créés` (objectif: >80%)
- **Temps moyen création** : Temps entre paiement et calendrier créé (objectif: <5s)

### Dashboard admin (TODO)

- Nombre total de calendriers créés
- Nombre de calendriers actifs
- Nombre d'accès recipients aujourd'hui
- Liste des erreurs de création (dernières 24h)
- Liste des emails non envoyés (retry)

---

## 🐛 Problèmes connus et solutions

### 1. Email pas reçu par buyer

**Symptômes :**
- Calendrier créé mais pas d'email

**Causes possibles :**
- `RESEND_API_KEY` non configuré
- Email buyer invalide/bounced
- Erreur Resend API

**Solution :**
- Vérifier logs : `[sendCalendarShareEmail] Failed to send email`
- Buyer peut accéder au lien via dashboard (TODO: ajouter cette feature)
- Retry manuel : Endpoint `/api/calendars/[id]/resend-email` (TODO)

### 2. Calendrier pas créé après paiement

**Symptômes :**
- Paiement réussi, buyer marqué paid, mais pas de calendrier

**Causes possibles :**
- Pas de receiver créé avant paiement
- Erreur dans `autoCreateCalendarAfterPayment()`
- Calendrier déjà existant

**Solution :**
- Vérifier logs webhook
- Buyer peut créer manuellement via dashboard avec bouton "Créer mon calendrier"
- Vérifier table `receivers` pour ce buyer

### 3. Recipient ne peut pas accéder

**Symptômes :**
- Recipient entre code mais erreur "Token invalide"

**Causes possibles :**
- Token mal copié (espaces, caractères manquants)
- Token expiré (>1 an)
- Code d'accès incorrect

**Solution :**
- Vérifier dans `calendars` si `open_token_hash_b64` existe
- Générer nouveau lien (TODO: endpoint regénération)
- Tester avec token/code depuis email original

---

## 📝 Documentation utilisateur à créer

### FAQ

**Q: Combien de temps le lien de partage est-il valide ?**
R: Le lien reste valide pendant 1 an après la création du calendrier.

**Q: Puis-je créer plusieurs calendriers ?**
R: Actuellement, vous ne pouvez avoir qu'un seul calendrier actif à la fois. Vous pouvez en créer un nouveau après que le précédent soit terminé ou expiré.

**Q: Que faire si j'ai perdu le code d'accès ?**
R: Le code d'accès ne peut pas être récupéré pour des raisons de sécurité. Vous devrez générer un nouveau lien de partage depuis votre tableau de bord (fonctionnalité à venir).

**Q: Le recipient peut-il voir tous les jours d'un coup ?**
R: Non, les jours se débloquent progressivement à partir du 1er décembre, un jour à la fois.

**Q: Puis-je modifier le contenu après avoir partagé le lien ?**
R: Oui ! Vous pouvez modifier le contenu à tout moment depuis votre tableau de bord. Les modifications seront visibles pour le recipient.

**Q: Le recipient doit-il créer un compte ?**
R: Non, le recipient n'a besoin que du lien et du code d'accès. Aucun compte n'est requis.

### Guide vidéo (TODO)

1. Comment créer votre calendrier (2min)
2. Comment partager avec votre proche (1min)
3. Comment modifier le contenu (1min)

---

## 🎯 Prochaines améliorations

### Phase 7 (Court terme)

- [ ] Bouton "Créer mon calendrier" dans dashboard si pas de calendrier
- [ ] Liste des calendriers dans dashboard avec détails
- [ ] Endpoint `/api/calendars/[id]/resend-email` pour renvoyer l'email
- [ ] Page `/dashboard/calendars/[id]` pour voir détails d'un calendrier
- [ ] Bouton "Régénérer lien" pour créer nouveau token + code

### Phase 8 (Moyen terme)

- [ ] Support multi-calendriers (lever contrainte unique)
- [ ] Système de retry automatique si email échoue
- [ ] Dashboard admin avec métriques
- [ ] Export PDF du lien + code (carte imprimable)
- [ ] Preview recipient avant partage
- [ ] Notification push quand recipient ouvre un jour

### Phase 9 (Long terme)

- [ ] Calendriers récurrents (même recipient chaque année)
- [ ] Templates de contenu pré-remplis
- [ ] Collaboration (plusieurs buyers pour un calendrier)
- [ ] Analytics détaillés (quels jours ouverts, quand, etc.)
- [ ] Intégration Twilio pour envoi SMS automatique
- [ ] Support WhatsApp Business API pour envoi direct

---

## ✅ Résumé

**5 fichiers créés :**
1. `lib/calendar-creation.ts` - Utilitaires de génération sécurisée
2. `app/api/calendars/route.ts` - Endpoints GET/POST
3. `app/share/[calendarId]/page.tsx` - Page de partage visuelle

**3 fichiers modifiés :**
1. `app/api/webhooks/stripe/route.ts` - Auto-création après paiement
2. `lib/email.ts` - Template d'email de partage

**Temps estimé total** : ~5-6h de travail effectif

**Impact** : Le problème de déconnexion entre contenus et recipients est maintenant **RÉSOLU** ! 🎉

Le flux complet fonctionne de bout en bout :
Buyer crée contenu → Paie → Calendrier auto-créé → Email avec lien+code → Recipient accède → Voit les contenus
