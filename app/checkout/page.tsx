import Header from "@/components/Header";
import ParcoursBanner from "@/components/ParcoursBanner";
import StepNavigation from "@/components/StepNavigation";
import { PLAN_APPEARANCE, type PlanKey } from "@/lib/plan-theme";

const PLAN_INFO = {
  plan_essentiel: {
    name: "Plan Essentiel",
    price: "10€"
  },
  plan_premium: {
    name: "Plan Premium",
    price: "20€"
  }
} as const;

type CheckoutPageProps = {
  searchParams?: {
    plan?: keyof typeof PLAN_INFO;
    recipient_name?: string;
    recipient_email?: string;
    relationship?: string;
    delivery_date?: string;
    notes?: string;
    filled?: string;
  };
};

export default function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const planKey: PlanKey = searchParams?.plan === "plan_premium" ? "plan_premium" : "plan_essentiel";
  const plan = PLAN_INFO[planKey];
  const theme = PLAN_APPEARANCE[planKey];
  const recipientName = searchParams?.recipient_name || "Votre proche";
  const relationship = searchParams?.relationship || "Proche";
  const deliveryDate = searchParams?.delivery_date ? new Date(searchParams.delivery_date).toLocaleDateString("fr-FR") : null;
  const recipientEmail = searchParams?.recipient_email;
  const notes = searchParams?.notes;
  const filled = searchParams?.filled;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-24">
      <Header />
      <StepNavigation
        plan={planKey}
        currentStep={5}
        prev={{ label: "Infos receveur", href: `/recipient?plan=${planKey}${filled ? `&filled=${filled}` : ""}` }}
        className="mt-6"
      />
      <section className="mx-auto max-w-5xl px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="mt-6 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Finalisez votre paiement
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Vous vous apprêtez à être redirigé(e) vers Stripe afin de régler votre {plan.name.toLowerCase()}. Une fois le paiement validé, vous accéderez automatiquement à l’éditeur de calendrier.
          </p>
        </div>
        <ParcoursBanner plan={planKey} currentStep={5} />

        <div className="grid md:grid-cols-[3fr_2fr] gap-10 items-start">
          <div className={`bg-white rounded-3xl shadow-2xl border ${theme.border} p-10 space-y-8`}>
            <div className="space-y-4">
              <div>
                <p className={`text-sm uppercase tracking-[0.3em] ${theme.accentText} mb-2`}>Forfait sélectionné</p>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{plan.name}</h2>
                    <p className="text-sm text-gray-500">Calendrier de l&rsquo;Avent personnalisé</p>
                  </div>
                  <div className={`text-4xl font-black ${theme.priceColor} mt-3 md:mt-0`}>{plan.price}</div>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-gray-200 p-6">
                <p className="text-sm uppercase tracking-wide text-gray-500 mb-2">Récapitulatif</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total dû</span>
                  <span className="text-3xl font-black">{plan.price}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`bg-white rounded-3xl shadow-xl border ${theme.border} p-8 space-y-4`}>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Receveur</h3>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Nom & prénom : <span className="font-bold">{recipientName}</span>
              </p>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Relation : <span className="font-bold">{relationship}</span>
              </p>
              {deliveryDate && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Ouverture prévue le {deliveryDate}</p>
              )}
              {recipientEmail && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Email : {recipientEmail}</p>
              )}
              {notes && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{notes}</p>
                </div>
              )}
              {filled && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{filled}/24 cases remplies.</p>
              )}
            </div>

            <div className={`rounded-3xl shadow-2xl p-8 space-y-6 ${theme.ctaBg} ${theme.ctaText}`}>
              <h3 className="text-3xl font-extrabold">Procéder au paiement</h3>
              <p className="text-lg font-semibold">
                Le paiement s’effectue sur Stripe. Utilisez le même e-mail que celui fourni à l&rsquo;étape précédente pour faciliter la correspondance.
              </p>
              <a
                href="https://stripe.com/payments/checkout"
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center rounded-full bg-white text-black font-bold py-4 text-lg hover:shadow-xl transition-all"
              >
                Ouvrir Stripe dans un nouvel onglet
              </a>
              <div className="bg-white/10 rounded-2xl p-4">
              <p className="text-base font-semibold">Une fois le paiement validé</p>
              <p className="text-sm text-white/80">
                Revenez ici pour accéder immédiatement à l’éditeur.
              </p>
            </div>
              <p className="text-xs text-white/90 text-center">
                Besoin d’aide ? Écrivez-nous à <span className="font-semibold">support@avent.com</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
