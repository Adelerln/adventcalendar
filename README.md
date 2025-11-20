# Calendrier de l'Avent – Next.js 14 (App Router)Calendrier de l’Avent ## Variables d'environnement (.env.local)



## DémarrageAjouter ces clés:



Démarrer le serveur de dev:- NEXT_PUBLIC_SUPABASE_URL

- NEXT_PUBLIC_SUPABASE_ANON_KEY

```bash- SUPABASE_SERVICE_ROLE_KEY

npm run dev- STRIPE_SECRET_KEY

# or- STRIPE_WEBHOOK_SECRET

yarn dev- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# or- NEXT_PUBLIC_STRIPE_PRICE_ONE_TIME

pnpm dev- NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY

# or- RESEND_API_KEY

bun dev- NEXT_PUBLIC_APP_URL

```- RAPIDAPI_KEY (pour l'intégration Spotify)



Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.Voir `.env.example` pour plus de détails.App Router)



Vous pouvez modifier la page d'accueil via `app/(marketing)/page.tsx`.## Démarrage



This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.Demarrer le serveur de dev:



## Variables d'environnement (.env.local)```bash

npm run dev

Ajouter ces clés:# or

yarn dev

- NEXT_PUBLIC_SUPABASE_URL# or

- NEXT_PUBLIC_SUPABASE_ANON_KEYpnpm dev

- SUPABASE_SERVICE_ROLE_KEY# or

- STRIPE_SECRET_KEYbun dev

- STRIPE_WEBHOOK_SECRET```

- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

- NEXT_PUBLIC_STRIPE_PRICE_ONE_TIMEOuvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

- NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY

- RESEND_API_KEYVous pouvez modifier la page d’accueil via `app/(marketing)/page.tsx`.

- NEXT_PUBLIC_APP_URL

- **RAPIDAPI_KEY** (pour l'intégration Spotify)This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.



Voir `.env.example` pour plus de détails.## Variables d’environnement (.env.local)



## DocumentationAjouter ces clés:



- [Intégration Spotify](./docs/SPOTIFY_INTEGRATION.md) - Guide complet de l'intégration de recherche musicale Spotify- NEXT_PUBLIC_SUPABASE_URL

- [Flows Frontend](./docs/FRONT_FLOWS.md) - Diagrammes des flux utilisateur- NEXT_PUBLIC_SUPABASE_ANON_KEY

- SUPABASE_SERVICE_ROLE_KEY

## En savoir plus- STRIPE_SECRET_KEY

- STRIPE_WEBHOOK_SECRET

To learn more about Next.js, take a look at the following resources:- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

- NEXT_PUBLIC_STRIPE_PRICE_ONE_TIME

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.- NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY

- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.- RESEND_API_KEY

- NEXT_PUBLIC_APP_URL

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

To learn more about Next.js, take a look at the following resources:

## Cron Vercel

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

`vercel.json` inclut une tâche quotidienne (05:30 UTC) vers `/api/emails/send-daily`.- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.



## DéploiementYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!



The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.## Cron Vercel



Déploiement recommandé: Vercel.`vercel.json` inclut une tâche quotidienne (05:30 UTC) vers `/api/emails/send-daily`.


The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Déploiement recommandé: Vercel.
