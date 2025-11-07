import Link from "next/link";
import Header from "@/components/Header";

const PLAN_INFO = {
  plan_essentiel: {
    name: "Plan Essentiel",
    price: "10€",
    color: "from-red-500 to-rose-500"
  },
  plan_premium: {
    name: "Plan Premium",
    price: "15€",
    color: "from-green-500 to-emerald-500"
  }
} as const;

type CheckoutPageProps = {
  searchParams?: {
    plan?: keyof typeof PLAN_INFO;
  };
};

export default function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const planKey = searchParams?.plan === "plan_premium" ? "plan_premium" : "plan_essentiel";
  const plan = PLAN_INFO[planKey];
  const editorUrl = `/calendars/new?plan=${planKey}&paid=1`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-green-900 pt-24">
      <Header />
      <section className="mx-auto max-w-5xl px-6 py-16 space-y-12">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-gray-600 dark:text-gray-200">
            💳 Étape Stripe sécurisée
          </p>
          <h1 className="mt-6 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Finalisez votre paiement
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Vous vous apprêtez à être redirigé(e) vers Stripe afin de régler votre {plan.name.toLowerCase()}. Une fois le paiement validé, vous accéderez automatiquement à l’éditeur de calendrier.
          </p>
        </div>

        <div className="grid md:grid-cols-[3fr_2fr] gap-10 items-start">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-10 space-y-8">
            <div className={`rounded-2xl bg-gradient-to-br ${plan.color} text-white p-6`}>
              <p className="text-sm uppercase tracking-wider text-white/80">Forfait sélectionné</p>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4">
                <div>
                  <h2 className="text-3xl font-bold">{plan.name}</h2>
                  <p className="text-white/80">Calendrier de l'Avent personnalisé</p>
                </div>
                <div className="text-4xl font-black mt-4 md:mt-0">{plan.price}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <p className="font-semibold">Connexion confirmée</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vous arrivez sur cette page après authentification.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <p className="font-semibold">Paiement Stripe</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Finalisez votre achat sécurisé sur Stripe.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <p className="font-semibold">Éditeur du calendrier</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Accédez automatiquement à l'espace de personnalisation.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Récapitulatif
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total dû</span>
                <span className="text-3xl font-black">{plan.price}</span>
              </div>
            </div>
          </div>

          <div className="bg-red-600 text-white rounded-3xl shadow-2xl p-8 space-y-6">
            <h3 className="text-2xl font-bold">Procéder au paiement</h3>
            <p className="text-white/80">
              Le paiement s’effectue sur Stripe. Utilisez le même e-mail que celui fourni à l'étape précédente pour faciliter la correspondance.
            </p>
            <a
              href="https://stripe.com/payments/checkout"
              target="_blank"
              rel="noreferrer"
              className="block w-full text-center rounded-full bg-white text-red-600 font-semibold py-3 hover:shadow-xl transition-all"
            >
              Ouvrir Stripe dans un nouvel onglet
            </a>
            <div className="bg-white/10 rounded-2xl p-4">
              <p className="text-sm font-semibold">Une fois le paiement validé</p>
              <p className="text-sm text-white/80">
                Revenez ici puis cliquez ci-dessous pour accéder immédiatement à l’éditeur.
              </p>
            </div>
            <Link
              href={editorUrl}
              className="block w-full text-center rounded-full border-2 border-white text-white font-semibold py-3 hover:bg-white/10 transition-all"
            >
              J'ai payé, personnaliser mon calendrier
            </Link>
            <p className="text-xs text-white/80 text-center">
              Besoin d’aide ? Écrivez-nous à <span className="font-semibold">support@avent.com</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
