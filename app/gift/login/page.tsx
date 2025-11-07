import Link from "next/link";

const plans = [
  {
    key: "plan_essentiel",
    title: "Plan Essentiel",
    price: "10€",
    perks: ["24 messages personnalisés", "Partage sécurisé"],
    accent: "border-red-300",
    text: "text-red-600"
  },
  {
    key: "plan_premium",
    title: "Plan Premium",
    price: "15€",
    perks: ["Photos, liens, vidéos", "Support prioritaire"],
    accent: "border-green-400",
    text: "text-green-600"
  }
] as const;

interface Props {
  searchParams?: { plan?: string };
}

export default function GiftLoginPage({ searchParams }: Props) {
  const planKey = searchParams?.plan === "plan_premium" ? "plan_premium" : "plan_essentiel";
  const plan = plans.find((p) => p.key === planKey)!;
  const nextUrl = encodeURIComponent(`/gift/recipient?auth=ok&plan=${plan.key}`);

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-red-50 to-green-50 py-16 px-4">
      <div className="mx-auto max-w-4xl space-y-10 rounded-3xl bg-white p-8 shadow-2xl">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-red-500 font-semibold">Étape 2/5</p>
          <h1 className="text-4xl font-bold text-gray-900">Connecte-toi avant de créer ton calendrier 🎄</h1>
          <p className="text-gray-600">Authentifie-toi pour sécuriser l’abonnement et retrouver facilement ton espace.</p>
        </div>

        <div className={`rounded-3xl border-2 ${plan.accent} p-6 flex flex-col gap-3 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-semibold ${plan.text}`}>Connexion + {plan.title}</p>
              <p className="text-3xl font-bold text-gray-900">{plan.price}</p>
            </div>
            <Link
              href={`/auth?plan=${plan.key}&next=${nextUrl}`}
              className="rounded-full bg-red-600 px-6 py-2 text-white font-semibold shadow hover:bg-red-700"
            >
              Me connecter
            </Link>
          </div>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            {plan.perks.map((perk) => (
              <li key={perk}>{perk}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          <p><strong>Parcours complet :</strong> Choix du forfait → Authentification → Bénéficiaire → Paiement → Création.</p>
          <p>Après connexion, tu seras redirigé(e) automatiquement vers l’étape “Bénéficiaire”.</p>
        </div>
      </div>
    </main>
  );
}
