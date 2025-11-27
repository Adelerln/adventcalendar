# Plan d'implémentation : Connexion calendrier acheteur → receveur

## Problème identifié

Le flux actuel ne crée jamais d'enregistrement dans la table `calendars`, ce qui empêche le système de vérification des recipients de fonctionner. Les contenus sont sauvegardés dans `calendar_contents` mais il n'y a pas de pont entre le token de partage et le `buyer_id`.

## Architecture de la solution

### Phase 1 : Utilitaires de création de calendrier

**Fichier : `lib/calendar-creation.ts`**

Fonctions à créer :

```typescript
/**
 * Génère un token d'accès sécurisé pour le lien de partage
 * @returns Token de 32 bytes en base64url (URL-safe)
 */
export function generateAccessToken(): string

/**
 * Génère un code d'accès à 4 chiffres
 * @returns Code numérique de 0000 à 9999
 */
export function generateAccessCode(): string

/**
 * Hash un token avec SHA-256 pour stockage en DB
 * @param token - Token en clair
 * @returns Hash base64 du token
 */
export function hashAccessToken(token: string): string

/**
 * Hash un code d'accès avec bcrypt pour stockage en DB
 * @param code - Code à 4 chiffres
 * @returns Hash bcrypt du code
 */
export async function hashAccessCode(code: string): Promise<string>

/**
 * Crée un enregistrement calendrier dans Supabase
 * @param params - Paramètres du calendrier
 * @returns ID du calendrier créé et token/code en clair
 */
export async function createCalendarRecord(params: {
  buyerId: string
  recipientId: string
  title?: string
  startDate?: string
  timezone?: string
}): Promise<{
  calendarId: string
  token: string
  code: string
  shareUrl: string
}>

/**
 * Vérifie qu'un acheteur a bien payé avant de créer le calendrier
 * @param buyerId - ID de l'acheteur
 * @returns true si l'acheteur a payé
 */
export async function verifyBuyerPaymentStatus(buyerId: string): Promise<boolean>
```

**Sécurité :**
- Token : 32 bytes random → base64url (43 caractères URL-safe)
- Hash token : SHA-256 → base64 pour stockage
- Code : 4 chiffres aléatoires (0000-9999)
- Hash code : bcrypt avec salt automatique (rounds=10)

**Validation :**
- Vérifier que le `buyer_id` existe dans la table `buyers`
- Vérifier que le `recipient_id` existe dans la table `receivers`
- Vérifier que le buyer a bien payé (`payment_status = 'paid'` ou `'paid_with_code'`)

---

### Phase 2 : Endpoint de création de calendrier

**Fichier : `app/api/calendars/route.ts`**

**POST /api/calendars**

Authentification : Session buyer JWT requise

Payload :
```typescript
{
  recipientId: string      // UUID du receveur (créé via /api/receivers)
  title?: string           // Titre du calendrier (défaut: "Mon calendrier de l'Avent")
  startDate?: string       // Date de début ISO (défaut: 1er décembre année courante)
  timezone?: string        // Timezone (défaut: "Europe/Paris")
  delivery?: "email" | "sms" | "both"  // Mode de livraison (défaut: "email")
}
```

Logique :
1. Authentifier le buyer via `readBuyerSession()`
2. Valider le payload avec Zod schema
3. Vérifier que le `recipientId` existe ET appartient au buyer
4. Vérifier que le buyer a payé via `verifyBuyerPaymentStatus()`
5. Vérifier qu'il n'existe pas déjà un calendrier actif pour ce buyer
6. Appeler `createCalendarRecord()` pour créer l'enregistrement
7. Retourner `{ calendarId, shareUrl, accessCode }`

Réponse :
```typescript
{
  calendarId: string       // UUID du calendrier créé
  shareUrl: string         // URL complète: https://app.com/r/[token]
  accessCode: string       // Code à 4 chiffres (en clair, une seule fois)
  expiresAt: string        // Date d'expiration ISO
}
```

**Codes d'erreur :**
- 401 : Non authentifié
- 400 : Payload invalide
- 403 : Recipient n'appartient pas au buyer OU buyer n'a pas payé
- 409 : Calendrier déjà créé pour ce buyer
- 500 : Erreur Supabase

**Sécurité :**
- Rate limiting : Max 5 créations par buyer par jour
- Log des créations pour audit
- Code d'accès retourné UNE SEULE FOIS (jamais récupérable après)

---

### Phase 3 : Intégration webhook Stripe

**Fichier : `app/api/webhooks/stripe/route.ts`**

Modifier `handleCheckoutSession()` (ligne 44) :

```typescript
async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  const projectId = session.metadata?.project_id;
  const buyerId = session.metadata?.buyer_id;

  // Étapes existantes (update project, mark buyer as paid)
  // ...

  // NOUVELLE ÉTAPE : Auto-créer le calendrier si receiver existe
  if (buyerId) {
    try {
      // 1. Récupérer le dernier receiver créé par ce buyer
      const supabase = supabaseServer();
      const { data: receiver } = await supabase
        .from("receivers")
        .select("id, full_name, email")
        .eq("buyer_id", buyerId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (receiver) {
        // 2. Créer le calendrier automatiquement
        const result = await createCalendarRecord({
          buyerId,
          recipientId: receiver.id,
          title: "Mon calendrier de l'Avent",
          startDate: computeNextDecember1st(),
          timezone: "Europe/Paris"
        });

        // 3. Envoyer l'email avec le lien de partage + code d'accès
        await sendCalendarShareEmail({
          buyerEmail: await getBuyerEmail(buyerId),
          recipientName: receiver.full_name,
          shareUrl: result.shareUrl,
          accessCode: result.code,
          calendarId: result.calendarId
        });

        console.info("[stripe-webhook] Calendar auto-created", {
          buyerId,
          calendarId: result.calendarId
        });
      } else {
        console.warn("[stripe-webhook] No receiver found for buyer", buyerId);
      }
    } catch (error) {
      console.error("[stripe-webhook] Calendar auto-creation failed", error);
      // Ne pas faire échouer le webhook pour autant
    }
  }
}
```

**Logique de fallback :**
- Si l'auto-création échoue, le buyer peut toujours créer manuellement via l'interface
- Ajouter un bouton "Créer mon calendrier" dans le dashboard si aucun calendrier n'existe

**Helper `computeNextDecember1st()` :**
```typescript
function computeNextDecember1st(): string {
  const now = new Date();
  const year = now.getMonth() >= 11 ? now.getFullYear() + 1 : now.getFullYear();
  return `${year}-12-01`;
}
```

---

### Phase 4 : Page de partage du lien

**Fichier : `app/share/[calendarId]/page.tsx`**

Page affichée après création du calendrier (redirection depuis `/dashboard` ou `/checkout`).

**Fonctionnalités :**
1. Afficher le lien de partage (copie au clic)
2. Afficher le code d'accès à 4 chiffres (gros, visible)
3. Instructions claires pour le partage
4. Boutons de partage : Email, SMS, WhatsApp, Copier
5. Avertissement : "Le code d'accès ne sera plus affiché après cette page"
6. Option de télécharger une carte PDF avec le lien + code
7. Bouton "Retour au tableau de bord"

**Design :**
- Fond festif (même style que les autres pages)
- Card centrale avec le lien en gros
- Code d'accès en gros caractères dorés
- Boutons de partage stylisés

**Sécurité :**
- Vérifier que le buyer est bien le propriétaire du calendrier
- Le code d'accès est récupéré depuis les query params (passé une seule fois après création)
- Ne JAMAIS afficher le code si absent des query params (pas d'API pour le récupérer)

---

### Phase 5 : Templates d'email pour le partage

**Fichier : `lib/email-templates.ts`**

Ajouter un nouveau template :

```typescript
/**
 * Email envoyé au buyer avec le lien de partage et le code d'accès
 */
export function generateCalendarShareEmail(params: {
  buyerName: string
  recipientName: string
  shareUrl: string
  accessCode: string
  calendarId: string
}): {
  subject: string
  html: string
  text: string
}
```

**Contenu de l'email :**
- Sujet : "Votre calendrier de l'Avent est prêt ! 🎄"
- Corps :
  - Félicitations, votre calendrier pour [recipientName] est créé
  - Lien de partage : [shareUrl]
  - Code d'accès : [accessCode] (en gros, dans une box)
  - Instructions : Partagez ce lien et communiquez le code séparément par sécurité
  - Bouton CTA : "Voir mon calendrier dans le tableau de bord"
  - Footer : Lien vers support, FAQ

**Template HTML :**
- Design responsive
- Couleurs festives (rouge, or, blanc)
- Code d'accès dans une box dorée bien visible
- Lien cliquable et facile à copier

---

### Phase 6 : Interface dashboard pour gérer les calendriers

**Fichier : `app/dashboard/page.tsx`**

Ajouter une section "Mes calendriers" :

```typescript
interface CalendarListItem {
  id: string
  recipientName: string
  title: string
  startDate: string
  status: "active" | "draft" | "expired"
  shareUrl: string  // Sans le code d'accès
  createdAt: string
  contentsCount: number  // Nombre de jours remplis
}
```

**Fonctionnalités :**
1. Liste des calendriers créés
2. Pour chaque calendrier :
   - Nom du recipient
   - Date de début
   - Statut (actif, brouillon, expiré)
   - Nombre de jours remplis
   - Bouton "Copier le lien" (sans le code)
   - Bouton "Modifier les contenus"
   - Bouton "Voir en tant que recipient" (avec code auto-rempli pour test)
3. Bouton "Créer un nouveau calendrier" si aucun calendrier actif

**Endpoint : GET /api/calendars**
Retourne la liste des calendriers du buyer authentifié.

---

### Phase 7 : Flux utilisateur complet mis à jour

**Nouveau parcours :**

1. **Création du contenu** (`/calendars/new`)
   - Sélection du plan
   - Remplissage des 24 jours
   - Sauvegarde dans `calendar_contents`

2. **Infos du receveur** (`/recipient`)
   - Nom, email, relation
   - Sauvegarde dans `receivers`

3. **Paiement** (`/checkout` → Stripe)
   - Paiement réussi → webhook appelé

4. **Auto-création du calendrier** (webhook Stripe)
   - Création de l'enregistrement `calendars`
   - Génération token + code
   - Email envoyé au buyer

5. **Redirection vers page de partage** (`/share/[calendarId]?code=XXXX`)
   - Affichage du lien + code
   - Boutons de partage
   - Avertissement : code affiché une seule fois

6. **Partage au recipient**
   - Buyer partage le lien via email/SMS/WhatsApp
   - Buyer communique le code (idéalement séparément)

7. **Accès recipient** (`/r/[token]`)
   - Recipient entre le code à 4 chiffres
   - Vérification via `verifyRecipientAccess()`
   - Création session JWT recipient
   - Redirection vers `/open/calendar`

8. **Visualisation** (`/open/calendar`)
   - Liste des 24 jours
   - Ouverture d'un jour via `/api/advent/recipient/open`
   - Récupération du contenu depuis `calendar_contents` via `buyer_id`

---

### Phase 8 : Migrations et schémas Supabase

**Vérifier que la table `calendars` contient bien :**

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
```

**Ajouter une contrainte unique :**
```sql
-- Un buyer ne peut avoir qu'un seul calendrier actif à la fois
CREATE UNIQUE INDEX idx_calendars_buyer_active
ON calendars(buyer_id)
WHERE status = 'active';
```

---

### Phase 9 : Tests à effectuer

**Tests unitaires :**
- [ ] `generateAccessToken()` génère des tokens uniques
- [ ] `generateAccessCode()` génère des codes à 4 chiffres
- [ ] `hashAccessToken()` produit des hashs SHA-256 corrects
- [ ] `hashAccessCode()` produit des hashs bcrypt valides
- [ ] `createCalendarRecord()` crée bien l'enregistrement avec tous les champs

**Tests d'intégration :**
- [ ] POST /api/calendars avec session buyer valide → 200
- [ ] POST /api/calendars sans session → 401
- [ ] POST /api/calendars avec recipientId invalide → 403
- [ ] POST /api/calendars sans paiement → 403
- [ ] POST /api/calendars deux fois → 409 (calendrier déjà créé)
- [ ] Webhook Stripe crée bien le calendrier automatiquement
- [ ] Email de partage envoyé après paiement

**Tests end-to-end :**
- [ ] Flux complet : création contenu → paiement → calendrier créé → lien partagé
- [ ] Recipient clique sur lien → entre code → voit les 24 jours
- [ ] Recipient ouvre jour 1 → voit le contenu correct
- [ ] Recipient ouvre jour 24 → voit le contenu correct
- [ ] Contenu multi-types (photo + message + dessin) sur même jour
- [ ] Vérification que le `buyer_id` dans la session recipient correspond au bon buyer
- [ ] Token expiré → erreur 401
- [ ] Code incorrect → erreur 401
- [ ] Calendrier d'un autre buyer inaccessible

---

### Phase 10 : Rollback et gestion d'erreurs

**Stratégie de rollback :**

1. **Si création calendrier échoue après paiement :**
   - Email au buyer : "Nous finalisons votre calendrier..."
   - Retry automatique après 1 min, 5 min, 15 min
   - Si échec persistant : email avec lien support + bouton "Créer mon calendrier" manuel

2. **Si email ne part pas :**
   - Stocker dans une queue de retry
   - Afficher le lien + code dans le dashboard même sans email

3. **Si le buyer perd le code :**
   - Pas de récupération possible (sécurité)
   - Option : "Générer un nouveau lien" qui crée un nouveau token + code
   - Invalide l'ancien token

**Monitoring :**
- Logs pour chaque étape de création
- Alert si taux d'échec > 5%
- Dashboard admin pour voir les calendriers créés
- Métriques : temps moyen de création, taux de succès, taux d'ouverture recipient

---

### Phase 11 : Documentation utilisateur

**FAQ à ajouter :**
- Comment partager mon calendrier ?
- Que faire si le recipient n'a pas reçu le lien ?
- Comment modifier le contenu après création ?
- Puis-je créer plusieurs calendriers ?
- Que faire si j'ai perdu le code d'accès ?
- Combien de temps le lien est-il valide ?

**Guide pas-à-pas :**
- Screenshots de chaque étape
- Vidéo de démonstration
- Email d'onboarding avec tutoriel

---

## Estimation de temps

| Phase | Tâche | Temps estimé |
|-------|-------|--------------|
| 1 | Utilitaires calendar-creation.ts | 2h |
| 2 | Endpoint POST /api/calendars | 2h |
| 3 | Intégration webhook Stripe | 1h30 |
| 4 | Page share/[calendarId] | 3h |
| 5 | Template email | 1h30 |
| 6 | Interface dashboard | 2h |
| 7 | Flux utilisateur complet | 1h |
| 8 | Migrations Supabase | 30min |
| 9 | Tests | 4h |
| 10 | Rollback et monitoring | 2h |
| 11 | Documentation | 1h30 |
| **TOTAL** | | **~21h** |

---

## Ordre d'implémentation recommandé

1. ✅ Phase 8 (Migrations) - S'assurer que la DB est prête
2. ✅ Phase 1 (Utilitaires) - Fondations sécurisées
3. ✅ Phase 2 (Endpoint création) - API de base
4. ✅ Phase 3 (Webhook Stripe) - Auto-création
5. ✅ Phase 5 (Email template) - Communication
6. ✅ Phase 4 (Page partage) - Interface utilisateur
7. ✅ Phase 6 (Dashboard) - Gestion des calendriers
8. ✅ Phase 9 (Tests) - Validation complète
9. ✅ Phase 7 (Flux complet) - Documentation du parcours
10. ✅ Phase 10 (Rollback) - Robustesse
11. ✅ Phase 11 (Documentation) - Support utilisateur

---

## Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Migrations Supabase exécutées
- [ ] Tests passent sur staging
- [ ] Email templates testés avec vrais emails
- [ ] Webhook Stripe configuré avec bonne URL
- [ ] Logs et monitoring en place
- [ ] Documentation à jour
- [ ] Support team briefé sur nouveau flux
- [ ] Rollout progressif (10% → 50% → 100%)
