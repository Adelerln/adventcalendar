import Link from "next/link";
import Header from "@/components/Header";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 dark:from-red-950 dark:via-gray-900 dark:to-green-950 px-6 py-16 pt-24">
      <Header />
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-clip-text text-transparent">
            Choisissez votre forfait
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Créez un calendrier de l'avent personnalisé
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border-2 border-red-300">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Plan Essentiel</h2>
              <div className="text-6xl font-bold text-red-600 mb-4">10€</div>
              <p className="text-gray-600 dark:text-gray-400">Achat unique</p>
            </div>
            <div className="mb-8">
              <div className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
                24 intentions composées de :
              </div>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 text-xl">📷</span>
                  <div>
                    <div className="font-medium">Photos personnalisées</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Vos plus beaux souvenirs</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 text-xl">💌</span>
                  <div>
                    <div className="font-medium">Messages personnalisés</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Messages du cœur</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 text-xl">🎨</span>
                  <div>
                    <div className="font-medium">Dessins créatifs</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Créativité sans limites</p>
                  </div>
                </li>
              </ul>
            </div>
            <form action="/api/stripe/checkout" method="post">
              <input type="hidden" name="productId" value="plan_essentiel" />
              <button className="w-full rounded-full bg-red-600 text-white px-8 py-4 text-lg font-bold hover:shadow-xl transition-all">
                Choisir ce plan
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border-4 border-green-500 relative">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full text-sm font-bold">
              ⭐ POPULAIRE
            </div>
            <div className="text-center mb-8 mt-4">
              <h2 className="text-3xl font-bold mb-2">Plan Premium</h2>
              <div className="text-6xl font-bold text-green-600 mb-4">15€</div>
              <p className="text-gray-600 dark:text-gray-400">Achat unique</p>
            </div>
            <div className="mb-8">
              <div className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">
                24 intentions composées de :
              </div>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">📷</span>
                  <div>
                    <div className="font-medium">Photos personnalisées</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Vos plus beaux moments</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">💌</span>
                  <div>
                    <div className="font-medium">Messages personnalisés</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Messages du cœur</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">🎨</span>
                  <div>
                    <div className="font-medium">Dessins créatifs</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Créativité illimitée</p>
                  </div>
                </li>
                <li className="flex items-start bg-green-50 dark:bg-green-950 -mx-4 px-4 py-3 rounded-lg">
                  <span className="text-yellow-500 mr-3 text-2xl">🎵</span>
                  <div>
                    <div className="font-bold text-green-700 dark:text-green-300">Musiques personnalisées</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Partagez vos chansons préférées</p>
                  </div>
                </li>
              </ul>
            </div>
            <form action="/api/stripe/checkout" method="post">
              <input type="hidden" name="productId" value="plan_premium" />
              <button className="w-full rounded-full bg-green-600 text-white px-8 py-4 text-lg font-bold hover:shadow-2xl transition-all">
                Choisir le Premium 🎵
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link href="/faq" className="text-green-600 hover:text-green-700 font-semibold">
            Questions fréquentes →
          </Link>
        </div>
      </div>
    </main>
  );
}
