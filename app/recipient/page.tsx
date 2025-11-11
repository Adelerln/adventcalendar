import Header from "@/components/Header";
import ParcoursBanner from "@/components/ParcoursBanner";
import StepNavigation from "@/components/StepNavigation";
import { PLAN_APPEARANCE, type PlanKey } from "@/lib/plan-theme";

const PLAN_DETAILS = {
  plan_essentiel: { name: "Plan Essentiel", price: "10€" },
  plan_premium: { name: "Plan Premium", price: "20€" }
} as const;

type RecipientPageProps = {
  searchParams?: {
    plan?: keyof typeof PLAN_DETAILS;
    filled?: string;
  };
};

export default function RecipientPage({ searchParams }: RecipientPageProps) {
  const planKey: PlanKey = searchParams?.plan === "plan_premium" ? "plan_premium" : "plan_essentiel";
  const plan = PLAN_DETAILS[planKey];
  const theme = PLAN_APPEARANCE[planKey];
  const filled = Number(searchParams?.filled ?? "0");
  const inputSurface =
    planKey === "plan_premium"
      ? "border-[#f5e6d4] bg-[#fff9f4]"
      : "border-[#e5e9ef] bg-[#f7f9fc]";
  const inputRing = planKey === "plan_premium" ? "focus:ring-[#f6dfc2]" : "focus:ring-[#d7dde5]";

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-24">
      <Header />
      <StepNavigation
        plan={planKey}
        currentStep={4}
        prev={{ label: "Calendrier personnalisé", href: `/calendars/new?plan=${planKey}` }}
        next={{ label: "Paiement Stripe", href: `/checkout?plan=${planKey}${filled ? `&filled=${filled}` : ""}` }}
        className="mt-6"
      />
      <section className="mx-auto max-w-5xl px-6 py-12 space-y-10">
        <div className="text-center space-y-4">
          <h1 className="mt-6 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Dites-nous à qui ira ce calendrier
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Ces informations nous permettent de personnaliser vos messages et de préparer l’envoi au bon moment.
          </p>
        </div>
        <ParcoursBanner plan={planKey} currentStep={4} />

        <div className="grid gap-8 md:grid-cols-[3fr_2fr] items-stretch">
          <form
            action="/checkout"
            method="GET"
            className={`bg-white rounded-3xl shadow-2xl border ${theme.border} p-10 flex flex-col`}
          >
            <input type="hidden" name="plan" value={planKey} />
            <div className="space-y-6 flex-1">
              <div className="grid md:grid-cols-2 gap-6">
                <label className="text-sm font-semibold text-gray-700">
                  Prénom et nom du receveur
                  <input
                    name="recipient_name"
                    required
                    placeholder="Prénom Nom"
                    className={`mt-2 w-full rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 ${inputSurface} ${inputRing}`}
                  />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  E-mail du receveur
                  <input
                    name="recipient_email"
                    type="email"
                    required
                    placeholder="ami@example.com"
                    className={`mt-2 w-full rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 ${inputSurface} ${inputRing}`}
                  />
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <label className="text-sm font-semibold text-gray-700">
                  Relation
                  <input
                    name="relationship"
                    required
                    placeholder="Partenaire, ami(e), famille..."
                    className={`mt-2 w-full rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 ${inputSurface} ${inputRing}`}
                  />
                </label>
                <label className="text-sm font-semibold text-gray-700">
                  Date d’ouverture prévue
                  <input
                    name="delivery_date"
                    type="date"
                    required
                    className={`mt-2 w-full rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 ${inputSurface} ${inputRing}`}
                  />
                </label>
              </div>

              <label className="text-sm font-semibold text-gray-700 block">
                Instructions particulières
                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Message spécial, contraintes de dates, prononciation du prénom..."
                  className={`mt-2 w-full rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 ${inputSurface} ${inputRing}`}
                />
              </label>
            </div>

            <div className="mt-8 space-y-3">
              <button
                type="submit"
                className={`w-full rounded-full px-8 py-4 text-lg font-semibold shadow-lg transition-all ${theme.ctaBg} ${theme.ctaHover} ${theme.ctaText}`}
              >
                Continuer vers le paiement Stripe
              </button>
              <p className="text-center text-xs uppercase tracking-wide text-gray-400">
                Étape suivante : paiement sécurisé
              </p>
            </div>
          </form>

          <aside className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6 flex flex-col">
            <div className={`rounded-2xl border ${theme.border} bg-white px-6 py-5`}>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Forfait</p>
              <h2 className={`text-3xl font-bold mt-2 ${theme.accentText}`}>{plan.name}</h2>
              <p className={`text-4xl font-black mt-2 ${theme.priceColor}`}>{plan.price}</p>
            </div>
            <div className={`rounded-2xl border border-dashed ${theme.border} p-6 space-y-2`}>
              <p className="text-sm font-semibold text-gray-600">Progression</p>
              <p className="text-2xl font-bold text-gray-900">{filled}/24 jours remplis</p>
              <p className="text-sm text-gray-500">
                Vous pourrez encore modifier votre calendrier après le paiement.
              </p>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-6 mt-auto">
              <p className="text-sm text-gray-500">Besoin d’aide ?</p>
              <p className="text-lg font-semibold text-gray-800">support@avent.com</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
