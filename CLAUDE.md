# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Calendrier de l'Avent (Advent Calendar) is a Next.js 16 application that allows users to create personalized 24-day advent calendars with daily content (text, images, videos, links) that unlocks progressively. Users (buyers) create calendars and share them with recipients via SMS/email, who can then open one day at a time.

**Tech Stack:**
- Next.js 16 (App Router)
- TypeScript
- Supabase (primary database) + PostgreSQL (legacy/fallback via `lib/db.ts`)
- Stripe (payments + promo codes)
- Resend (email delivery)
- JWT-based sessions (buyer & recipient)
- React Three Fiber (3D Christmas tree animations)

## Development Commands

```bash
# Start development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Two-Actor System

The app has two distinct user types with separate authentication flows:

1. **Buyers** - Create and manage advent calendars
   - Session: JWT in `buyer_session` cookie (via `lib/jwt-session.ts`)
   - Routes: `/gift/*`, `/dashboard`, `/calendars/*`
   - Protected by middleware checking `buyer_session`

2. **Recipients** - Receive and view advent calendars
   - Session: JWT in `recipient_session` cookie
   - Routes: `/open/*`, `/r/*`
   - Access granted via magic token links (SHA-256 hashed)
   - Protected by middleware checking `recipient_session`

### Security Model (IMPORTANT)

This codebase has undergone security hardening. Key security patterns:

- **JWT sessions** (`lib/jwt-session.ts`): All sessions use signed JWTs, never plain JSON cookies
- **Token hashing** (`lib/recipient-verification.ts`): Magic links use SHA-256 hashed tokens stored in `open_token_hash_b64`
- **Access code verification** (`lib/recipient-auth.ts`): Recipients must provide bcrypt-hashed access codes
- **Promo codes** (`lib/promo-codes.ts`): Uses Stripe Promotion Codes API, not custom DB tables
- **Middleware protection** (`middleware.ts`): Both buyer and recipient routes are protected with JWT verification
- **Environment secrets**: `JWT_SECRET` (required), `ADMIN_SECRET` (optional), `CRON_SECRET` (required for crons)

When adding new endpoints:
- Use `verifyBuyerSessionToken()` or `verifyRecipientSessionToken()` from `lib/jwt-session.ts`
- Never trust user input without validation (use Zod schemas in `lib/schemas.ts`)
- Hash sensitive tokens before DB storage

### Database Architecture

**Primary: Supabase** (via `lib/supabase.ts`)
- `supabaseServer()` - Server-side with service role key
- `supabaseBrowser()` - Client-side with anon key

**Legacy: PostgreSQL Pool** (via `lib/db.ts`)
- Direct Pool connection, used in some older code paths
- Falls back to env vars: `DATABASE_URL`, `POSTGRES_URL`, etc.

**Key Tables:**
- `buyers` - User accounts (buyer side)
- `calendars` - Each advent calendar (links buyer → recipient)
- `calendar_days` - 24 days per calendar with `lockedUntil` timestamps
- `recipients` - Recipient contact info (phone/email)
- `waitlist` - Email signups

**Domain Layer** (`advent/domain/`):
- `usecases.ts` - Business logic (compute24Days, verifyMagicToken)
- `types.ts` - Core domain types (Calendar, CalendarDay, Recipient)
- Port/adapter pattern in `advent/adapters/` (db, messaging, payments)

### Payment Flow (Stripe)

1. Buyer creates calendar → `/api/gift/checkout` or `/api/create-checkout-session`
2. Redirects to Stripe Checkout
3. Webhook at `/api/webhooks/stripe` handles `checkout.session.completed`
4. Updates buyer `payment_status` to `paid` or `paid_with_code` (if promo code used)
5. Finalizes calendar creation via `/api/gift/finalize`

**Promo Codes:**
- Managed entirely through Stripe API (not custom DB)
- Validate with `validatePromoCode()` from `lib/promo-codes.ts`
- Apply at checkout via `discounts` parameter in Stripe session

### Recipient Verification Flow

1. Buyer shares link: `/r/[token]` or `/open/c/[token]`
2. Recipient accesses link → verifies token hash in DB
3. Sets `recipient_session` JWT cookie via `lib/recipient-auth.ts`
4. Middleware protects `/open/calendar` route
5. Recipient can open one day at a time based on `lockedUntil` field

### Scheduled Tasks

**Cron Job** (configured in `vercel.json`):
- Runs daily at 05:30 UTC
- Endpoint: `/api/emails/send-daily`
- Protected by `CRON_SECRET` header
- Sends email notifications for newly unlocked days

### API Routes Structure

```
/api/
  advent/
    buyer/calendars/           # Buyer calendar management
    recipient/
      verify/                  # Recipient token verification
      open/                    # Open a day
      days/                    # Get calendar days
      session/                 # Recipient session
    internal/
      waitlist/                # Waitlist signup
      debug/reset/             # Reset calendars (ADMIN_SECRET)
  gift/
    draft/                     # Save gift draft
    checkout/                  # Create Stripe session
    finalize/                  # Finalize after payment
  webhooks/stripe/             # Stripe webhook handler
  emails/send-daily/           # Cron endpoint (CRON_SECRET)
  session/                     # Buyer session management
  calendar-contents/           # Fetch calendar contents
```

### Component Structure

**Key Components:**
- `components/BuyerWizard.tsx` - Multi-step calendar creation wizard
- `components/CalendarGrid.tsx` - 24-day grid for recipient view
- `components/GoldenEnvelopeTree.tsx` - Main 3D animated Christmas tree
- `components/DayModal.tsx` - Modal for opening daily content
- `components/SpotifySearchModal.tsx` - Spotify music search integration

**3D Components:**
- Uses `@react-three/fiber` and `@react-three/drei`
- Main scene in `ChristmasTree3D.tsx` and `ChristmasTreeCarousel.tsx`

### Utility Libraries

- `lib/schedule.ts` - Date/time calculations for day locking
- `lib/phone.ts` - Phone number validation (libphonenumber-js)
- `lib/schemas.ts` - Zod validation schemas
- `lib/email.ts` - Email sending via Resend
- `lib/stripe.ts` - Stripe client initialization

## Environment Variables

Required variables (see `.env.example` for full list):

```bash
# Security (REQUIRED)
JWT_SECRET=                    # openssl rand -base64 32
CRON_SECRET=                   # For /emails/send-daily endpoint
ADMIN_SECRET=                  # For /debug/reset endpoint (optional)

# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=                  # Optional fallback to direct Postgres

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email
RESEND_API_KEY=

# Base URL
NEXT_PUBLIC_APP_URL=
```

## Code Patterns

### Adding a New Protected Buyer Route

```typescript
// In route handler
import { getBuyerFromRequest } from "@/lib/server-session";

export async function GET(req: NextRequest) {
  const buyer = await getBuyerFromRequest(req);
  if (!buyer) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... your logic
}
```

### Adding a New Protected Recipient Route

```typescript
import { getRecipientFromRequest } from "@/lib/recipient-auth";

export async function GET(req: NextRequest) {
  const recipient = await getRecipientFromRequest(req);
  if (!recipient) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... your logic
}
```

### Validating Input with Zod

```typescript
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
});

const result = schema.safeParse(body);
if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 400 });
}
```

### Working with Supabase

```typescript
import { supabaseServer } from "@/lib/supabase";

const supabase = supabaseServer();
const { data, error } = await supabase
  .from("calendars")
  .select("*")
  .eq("buyer_id", buyerId);
```

## Testing & Debugging

- **Debug endpoint**: `/api/advent/internal/debug/reset` (requires `ADMIN_SECRET`)
  - Resets all calendars' opened days for testing
- **Buyer session**: Check `buyer_session` cookie in DevTools
- **Recipient session**: Check `recipient_session` cookie

## Deployment

Recommended: Vercel

1. Push to main branch
2. Vercel auto-deploys
3. Ensure all environment variables are set in Vercel dashboard
4. Stripe webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
5. Cron job automatically configured via `vercel.json`

## Important Notes

- **Date/Time Handling**: All dates stored in ISO format. Use `date-fns` and `date-fns-tz` for timezone-aware operations
- **Path Aliases**: Use `@/*` to import from root (configured in `tsconfig.json`)
- **Spotify Integration**: Uses RapidAPI for music search (requires `RAPIDAPI_KEY`)
- **Content Types**: Currently supports text, image, video, link. Extensible via `contentType` field
- **i18n Ready**: Uses `next-intl` for internationalization support
- **Security**: Always hash tokens before storing, use JWT for sessions, validate promo codes via Stripe API

## Documentation

- `docs/SECURITY_VULNERABILITIES.md` - Security audit and fixes
- `docs/FRONT_FLOWS.md` - Frontend flow diagrams
- `docs/SPOTIFY_INTEGRATION.md` - Spotify search integration
- `docs/STRIPE_PROMO_CODES.md` - Stripe promo code setup
