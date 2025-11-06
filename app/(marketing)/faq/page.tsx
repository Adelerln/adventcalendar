import Link from "next/link";
import Header from "@/components/Header";

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 dark:from-red-950 dark:via-gray-900 dark:to-green-950 pt-20">
      <Header />
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 text-red-600 dark:text-red-500">
            Foire aux questions
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Tout ce que vous devez savoir
          </p>
        </div>

        <div className="space-y-6">
          <details className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <summary className="font-semibold cursor-pointer text-lg">Qu'est-ce qu'un calendrier de l'Avent personnalisé ?</summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              C'est un calendrier numérique avec 24 cases (du 1er au 24 décembre) que vous personnalisez avec vos propres photos, messages, dessins et musiques.
            </p>
          </details>

          <details className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <summary className="font-semibold cursor-pointer text-lg">Quelle est la différence entre les plans ?</summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Le Plan Essentiel (10€) inclut photos, messages et dessins. Le Plan Premium (15€) ajoute 24 musiques personnalisées.
            </p>
          </details>

          <details className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <summary className="font-semibold cursor-pointer text-lg">Le paiement est-il sécurisé ?</summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Absolument. Tous les paiements sont traités via Stripe, la plateforme la plus sécurisée.
            </p>
          </details>

          <details className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <summary className="font-semibold cursor-pointer text-lg">Quand mon proche pourra-t-il ouvrir les cases ?</summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Une nouvelle case se débloque automatiquement chaque jour de décembre, du 1er au 24.
            </p>
          </details>

          <details className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <summary className="font-semibold cursor-pointer text-lg">Puis-je modifier le calendrier après création ?</summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Oui, vous pouvez modifier le contenu jusqu'au moment où une case se débloque.
            </p>
          </details>
        </div>

        <div className="mt-16 bg-red-600 rounded-3xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Vous n'avez pas trouvé votre réponse ?</h2>
          <p className="text-lg mb-6">Notre équipe est là pour vous aider !</p>
          <a href="mailto:support@adventcalendar.com" className="inline-block px-8 py-3 bg-white text-red-600 rounded-full font-bold hover:shadow-xl transition-all">
            Contactez-nous
          </a>
        </div>
      </div>
    </main>
  );
}
