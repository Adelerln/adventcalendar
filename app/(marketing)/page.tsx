import Link from "next/link";
import Header from "@/components/Header";
import SnowfallAnimation from "@/components/SnowfallAnimation";

export default function MarketingHomePage() {
  return (
    <main className="min-h-screen pt-16">
      <Header />
      <SnowfallAnimation />
      <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-green-50 dark:from-red-950 dark:via-gray-900 dark:to-green-950">
        <div className="absolute inset-0 bg-[url('/snowflakes.svg')] opacity-10 animate-snow"></div>
        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-full text-sm font-semibold">
            ✨ Noël 2025 approche ! ✨
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-red-600 dark:text-red-500 mb-6">
            Calendrier de l'Avent<br />Personnalisé
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Créez un calendrier magique unique pour vos proches. 24 jours de surprises personnalisées avec photos, messages, dessins et musique.
          </p>
          <div className="flex flex-col items-center gap-4 mb-12">
            <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
              <Link href="/pricing" className="rounded-full bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105">
                Voir les forfaits 🎁
              </Link>
              <Link href="/dashboard" className="rounded-full border-2 border-green-600 text-green-600 dark:text-green-400 px-8 py-4 text-lg font-semibold hover:bg-green-50 dark:hover:bg-green-950 transition-all">
                Découvrir un exemple
              </Link>
            </div>
            <Link href="/dashboard" className="rounded-full border-2 border-red-600 text-red-600 dark:text-red-400 px-8 py-4 text-lg font-semibold hover:bg-red-50 dark:hover:bg-red-950 transition-all">
              Accéder à mon calendrier
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Comment ça marche ?</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-16 text-lg">
            Créez votre calendrier personnalisé en 3 étapes simples
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl bg-red-50 dark:bg-red-950">
              <div className="text-5xl mb-4">1️⃣</div>
              <h3 className="text-2xl font-bold mb-3">Choisissez votre plan</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sélectionnez le forfait qui vous convient
              </p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-green-50 dark:bg-green-950">
              <div className="text-5xl mb-4">2️⃣</div>
              <h3 className="text-2xl font-bold mb-3">Personnalisez</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Ajoutez photos, messages, dessins et musiques
              </p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-red-50 dark:bg-red-950">
              <div className="text-5xl mb-4">3️⃣</div>
              <h3 className="text-2xl font-bold mb-3">Partagez</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Envoyez le lien à votre proche
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-red-600 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Prêt à créer la magie de Noël ? 🎄</h2>
          <p className="text-xl mb-8 opacity-90">
            Offrez un cadeau unique et inoubliable
          </p>
          <Link href="/pricing" className="inline-block rounded-full bg-white text-red-600 px-10 py-4 text-xl font-bold hover:shadow-2xl transition-all">
            Commencer maintenant
          </Link>
        </div>
      </section>
    </main>
  );
}
