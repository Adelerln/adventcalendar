import Header from "@/components/Header";

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 dark:from-red-950 dark:via-gray-900 dark:to-green-950 pt-20">
      <Header />
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 text-black dark:text-black">
            Foire aux questions
          </h1>
          <p className="text-xl text-black dark:text-gray-300">
            Tout ce que vous devez savoir
          </p>
        </div>

        <div className="space-y-6">
          <details className="bg-transparent border border-white/70 dark:border-white/40 hover:bg-white dark:hover:bg-white/10 open:bg-white dark:open:bg-white/10 transition-colors rounded-2xl p-6 shadow">
            <summary className="font-semibold cursor-pointer text-lg">Qu&rsquo;est-ce qu&rsquo;un calendrier de l&rsquo;Avent personnalisé ?</summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              C&rsquo;est un calendrier numérique avec 24 cases (du 1er au 24 décembre) que vous personnalisez avec vos propres photos, messages, dessins, musiques et autres (version Premium).
            </p>
          </details>

          <details className="bg-transparent border border-white/70 dark:border-white/40 hover:bg-white dark:hover:bg-white/10 open:bg-white dark:open:bg-white/10 transition-colors rounded-2xl p-6 shadow">
            <summary className="font-semibold cursor-pointer text-lg">Quelle est la différence entre les plans ?</summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Le Plan Essentiel (10€) inclut photos, messages, dessins et musiques. Le Plan Premium (20€) ajoute des vidéos d&rsquo;IA, des petits jeux vidéos et un vrai prix à gagner (pour Noël).
            </p>
          </details>

          <details className="bg-transparent border border-white/70 dark:border-white/40 hover:bg-white dark:hover:bg-white/10 open:bg-white dark:open:bg-white/10 transition-colors rounded-2xl p-6 shadow">
            <summary className="font-semibold cursor-pointer text-lg">Le paiement est-il sécurisé ?</summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Absolument. Tous les paiements sont traités via Stripe, la plateforme la plus sécurisée.
            </p>
          </details>

          <details className="bg-transparent border border-white/70 dark:border-white/40 hover:bg-white dark:hover:bg-white/10 open:bg-white dark:open:bg-white/10 transition-colors rounded-2xl p-6 shadow">
            <summary className="font-semibold cursor-pointer text-lg">Quand mon proche pourra-t-il ouvrir les cases ?</summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Une nouvelle case se débloque automatiquement chaque jour de décembre, du 1er au 24.
            </p>
          </details>

          <details className="bg-transparent border border-white/70 dark:border-white/40 hover:bg-white dark:hover:bg-white/10 open:bg-white dark:open:bg-white/10 transition-colors rounded-2xl p-6 shadow">
            <summary className="font-semibold cursor-pointer text-lg">Puis-je modifier le calendrier après création ?</summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Oui, vous pouvez modifier le contenu jusqu&rsquo;au moment où une case se débloque.
            </p>
          </details>
        </div>

        <div className="mt-16 text-center text-white px-4 space-y-4 drop-shadow-[0_20px_45px_rgba(0,0,0,0.55)]">
          <h2 className="text-3xl font-bold text-black">Vous n&rsquo;avez pas trouvé votre réponse ?</h2>
          <p className="text-lg text-black">Notre équipe est là pour vous aider !</p>
          <a href="mailto:aymeric.desbazeille@hec.edu" className="inline-block px-8 py-3 border-2 border-white text-black rounded-full font-bold transition-all hover:bg-white hover:text-black">
            Contactez-nous
          </a>
        </div>
      </div>
    </main>
  );
}
