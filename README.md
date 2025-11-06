Calendrier de l’Avent – Next.js 14 (App Router)

## Démarrage

Demarrer le serveur de dev:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

Vous pouvez modifier la page d’accueil via `app/(marketing)/page.tsx`.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Variables d’environnement (.env.local)

Ajouter ces clés:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- NEXT_PUBLIC_STRIPE_PRICE_ONE_TIME
- NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY
- RESEND_API_KEY
- NEXT_PUBLIC_APP_URL

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Cron Vercel

`vercel.json` inclut une tâche quotidienne (05:30 UTC) vers `/api/emails/send-daily`.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Déploiement recommandé: Vercel.
