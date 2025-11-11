import Link from "next/link";

const plans = [
  {
    key: "plan_essentiel",
    name: "Plan Essentiel",
    price: "10€",
    description: "24 attentions personnalisées",
    perks: ["Messages illimités", "Partage sécurisé"],
    accent: "border-red-300"
  },
  {
    key: "plan_premium",
    name: "Plan Premium",
    price: "15€",
    description: "Ajoute photos, liens et musiques",
    perks: ["Contenus enrichis", "Support prioritaire"],
    accent: "border-green-400"
  }
];

export default function ChoosePlanPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-red-50 to-green-50 py-16 px-4">
      <div className="mx-auto max-w-5xl space-y-10 rounded-3xl bg-white p-8 shadow-2xl">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-red-500 font-semibold">Étape 1/5</p>
          <h1 className="text-4xl font-bold text-gray-900">Choisissez votre forfait</h1>
          <p className="text-gray-600">Commencez par sélectionner l&rsquo;offre qui correspond à votre calendrier personnalisé.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.key} className={`rounded-3xl border-2 ${plan.accent} p-6 space-y-4 shadow-sm bg-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>
                <p className="text-4xl font-black text-red-600">{plan.price}</p>
              </div>
              <ul className="text-gray-600 list-disc list-inside">
                {plan.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <Link
                href={`/gift/login?plan=${plan.key}`}
                className="inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-white font-semibold shadow hover:bg-red-700"
              >
                Continuer
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
