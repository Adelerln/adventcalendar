import Link from "next/link";
import Header from "@/components/Header";

const featureItems = [
  "Photos personnalisées",
  "Messages personnalisés",
  "Dessins créatifs",
  "Musique",
  "Vidéos en IA",
  "Petits jeux vidéos",
  "Prix à gagner $",
];

export default function PricingPage() {
  const essentialIncluded = new Set(featureItems.slice(0, 4));

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 dark:from-red-950 dark:via-gray-900 dark:to-green-950 px-6 pt-20 pb-16 text-black">
      <Header />
      <div className="mx-auto max-w-6xl py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6">Choisissez votre forfait</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Créez un calendrier de l'avent personnalisé
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="rounded-3xl border-2 border-gray-300 p-8 transition-colors bg-transparent hover:bg-white/90 flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">PLAN ESSENTIEL</h2>
              <div className="text-6xl font-bold text-gray-400 mb-4">10€</div>
              <p className="text-gray-700">Paiement après création</p>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg mb-4">24 intentions composées de :</div>
              <ul className="space-y-3 ml-2">
                {featureItems.map((feature) => {
                  const included = essentialIncluded.has(feature);
                  const iconClass = included ? "text-[#06B800]" : "text-[#ED0200]";
                  return (
                    <li key={feature} className="flex items-center gap-3 text-lg">
                      <span className={`text-xl font-semibold ${iconClass}`}>
                        {included ? "✔" : "✘"}
                      </span>
                      <span className="font-medium">{feature}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="mt-10">
              <Link
                href="/create-account?plan=plan_essentiel"
                className="block w-full rounded-full border-2 border-gray-500 bg-[rgba(209,213,220,0.2)] text-black px-8 py-4 text-lg font-bold text-center transition-all hover:bg-white"
              >
                Choisir ce plan
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border-4 border-[#ead3c0] p-8 transition-colors bg-transparent hover:bg-white/90 flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">PLAN PREMIUM</h2>
              <div className="text-6xl font-bold text-[#ead3c0] mb-4">20€</div>
              <p className="text-gray-700">Paiement après création</p>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg mb-4">24 intentions composées de :</div>
              <ul className="space-y-3 ml-2">
                {featureItems.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-lg">
                    <span className="text-xl font-semibold text-[#06B800]">✔</span>
                    <span className="font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10 relative">
              <div className="absolute -top-4 right-6">
                <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#ead3c0] text-black text-sm font-bold shadow">
                  ⭐ POPULAIRE
                </span>
              </div>
              <Link
                href="/create-account?plan=plan_premium"
                className="block w-full rounded-full border-2 border-[#ead3c0] bg-[rgba(233,211,191,0.2)] text-black px-8 py-4 text-lg font-bold text-center transition-all hover:bg-white"
              >
                Choisir le Premium
              </Link>
            </div>
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
