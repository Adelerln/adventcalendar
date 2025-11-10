import Header from "@/components/Header";

const PLAN_INFO = {
  plan_essentiel: {
    name: "Plan Essentiel",
    accent: "text-red-600",
    bg: "from-red-100 to-rose-100",
    price: "10€"
  },
  plan_premium: {
    name: "Plan Premium",
    accent: "text-green-600",
    bg: "from-emerald-100 to-green-100",
    price: "15€"
  }
} as const;

type RecipientPageProps = {
  searchParams?: {
    plan?: keyof typeof PLAN_INFO;
    filled?: string;
  };
};

export default function RecipientPage({ searchParams }: RecipientPageProps) {
  const planKey = searchParams?.plan === "plan_premium" ? "plan_premium" : "plan_essentiel";
  const plan = PLAN_INFO[planKey];
  const filled = Number(searchParams?.filled ?? "0");

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-red-950 pt-24">
      <Header />
      <section className="mx-auto max-w-5xl px-6 py-16 space-y-12">
        <div className="text-center">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/10 text-sm font-semibold text-gray-700 dark:text-gray-100">
            4️⃣ Informations sur le receveur
          </p>
          <h1 className="mt-6 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Dites-nous à qui ira ce calendrier
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Ces informations nous permettent de personnaliser vos messages et de préparer l’envoi au bon moment.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[3fr_2fr] items-start">
          <form
            action="/checkout"
            method="GET"
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-10 space-y-6"
          >
            <input type="hidden" name="plan" value={planKey} />
            <div className="grid md:grid-cols-2 gap-6">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Prénom et nom du receveur
                <input
                  name="recipient_name"
                  required
                  placeholder="Prénom Nom"
                  className="mt-2 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </label>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                E-mail du receveur (facultatif)
                <input
                  name="recipient_email"
                  type="email"
                  placeholder="ami@example.com"
                  className="mt-2 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Relation
                <input
                  name="relationship"
                  required
                  placeholder="Partenaire, ami(e), famille..."
                  className="mt-2 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </label>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Date d'ouverture prévue
                <input
                  name="delivery_date"
                  type="date"
                  required
                  className="mt-2 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </label>
            </div>

            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 block">
              Instructions particulières
              <textarea
                name="notes"
                rows={4}
                placeholder="Message spécial, contraintes de dates, prononciation du prénom..."
                className="mt-2 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Continuer vers le paiement Stripe
            </button>
            <p className="text-center text-xs uppercase tracking-wide text-gray-400">
              Étape suivante : paiement sécurisé
            </p>
          </form>

          <aside className="bg-gradient-to-br from-white/70 to-white rounded-3xl shadow-xl border border-white/40 dark:border-gray-800 dark:from-gray-800 dark:to-gray-900 p-8 space-y-6">
            <div className={`rounded-2xl bg-gradient-to-br ${plan.bg} p-6`}>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-600">Forfait</p>
              <h2 className={`text-3xl font-bold mt-2 ${plan.accent}`}>{plan.name}</h2>
              <p className="text-4xl font-black text-gray-900 mt-2">{plan.price}</p>
            </div>
            <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-6 space-y-2">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Progression</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filled}/24 jours remplis</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Vous pourrez encore modifier votre calendrier après le paiement.
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-5 space-y-2">
              <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Rappel du parcours</p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>✅ 1. Forfait choisi</li>
                <li>✅ 2. Compte créé</li>
                <li>✅ 3. Calendrier personnalisé</li>
                <li>🟡 4. Infos receveur (vous êtes ici)</li>
                <li>⚪ 5. Paiement Stripe</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
