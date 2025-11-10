import Link from "next/link";
import Header from "@/components/Header";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 dark:from-red-950 dark:via-gray-900 dark:to-green-950 px-6 py-16 pt-24">
      <Header />
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 text-red-600 dark:text-red-500">
            Choisissez votre forfait
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Créez un calendrier de l'avent personnalisé
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border-2 border-red-300 flex flex-col gap-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-3">PLAN ESSENTIEL</h2>
              <div className="text-7xl font-bold text-red-600 mb-4">10€</div>
              <p className="text-2xl text-gray-600 dark:text-gray-400">Paiement après création</p>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-xl mb-5 text-gray-800 dark:text-gray-200">
                24 intentions composées de :
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-4">
                  <span className="text-2xl leading-none text-red-500">📷</span>
                  <div>
                    <div className="font-medium text-xl">Photos personnalisées</div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Vos plus beaux souvenirs</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl leading-none text-red-500">💌</span>
                  <div>
                    <div className="font-medium text-xl">Messages personnalisés</div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Messages du cœur</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl leading-none text-red-500">🎨</span>
                  <div>
                    <div className="font-medium text-xl">Dessins créatifs</div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Créativité sans limites</p>
                  </div>
                </li>
              </ul>
            </div>
            <Link href="/create-account?plan=plan_essentiel" className="mt-auto block w-full rounded-full bg-red-600 text-white px-8 py-4 text-lg font-bold hover:shadow-xl transition-all text-center">
              Choisir ce plan
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border-4 border-green-500 relative flex flex-col gap-8">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full text-sm font-bold">
              ⭐ POPULAIRE
            </div>
            <div className="text-center mt-4">
              <h2 className="text-4xl font-bold mb-3">PLAN PREMIUM</h2>
              <div className="text-7xl font-bold text-green-600 mb-4">15€</div>
              <p className="text-2xl text-gray-600 dark:text-gray-400">Paiement après création</p>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-xl mb-5 text-gray-800 dark:text-gray-200">
                24 intentions composées de :
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-4">
                  <span className="text-2xl leading-none text-green-500">📷</span>
                  <div>
                    <div className="font-medium text-xl">Photos personnalisées</div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Vos plus beaux moments</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl leading-none text-green-500">💌</span>
                  <div>
                    <div className="font-medium text-xl">Messages personnalisés</div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Messages du cœur</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-2xl leading-none text-green-500">🎨</span>
                  <div>
                    <div className="font-medium text-xl">Dessins créatifs</div>
                    <p className="text-lg text-gray-600 dark:text-gray-400">Créativité illimitée</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 rounded-2xl border border-green-100 dark:border-green-900 bg-green-50/80 dark:bg-green-950/40 px-4 py-3">
                  <span className="text-2xl leading-none text-yellow-500">🎵</span>
                  <div>
                    <div className="font-bold text-lg text-black dark:text-white">Musiques personnalisées</div>
                    <p className="text-base text-gray-900 dark:text-gray-100">Partagez vos chansons préférées</p>
                  </div>
                </li>
              </ul>
            </div>
            <Link href="/create-account?plan=plan_premium" className="mt-auto block w-full rounded-full bg-green-600 text-white px-8 py-4 text-lg font-bold hover:shadow-2xl transition-all text-center">
              Choisir le Premium
            </Link>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link href="/faq" className="text-green-800 hover:text-green-900 dark:text-green-200 dark:hover:text-green-100 font-semibold">
            Questions fréquentes →
          </Link>
        </div>
      </div>
    </main>
  );
}
