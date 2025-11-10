    "use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";

const PLAN_COPY = {
  plan_essentiel: {
    name: "PLAN ESSENTIEL",
    price: "10€",
    color: "text-red-600",
    features: [
      "24 intentions personnalisées",
      "Photos, messages et dessins",
      "Paiement unique après création"
    ]
  },
  plan_premium: {
    name: "PLAN PREMIUM",
    price: "15€",
    color: "text-green-400",
    features: [
      "Tout le plan Essentiel",
      "Ajout de musiques personnalisées",
      "Support prioritaire"
    ]
  }
} as const;

export default function CreateAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const planParam = searchParams.get("plan");
  const nextParam = searchParams.get("next");
  const planKey = planParam === "plan_premium" ? "plan_premium" : "plan_essentiel";
  const plan = PLAN_COPY[planKey];

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const fullName = (formData.get("buyer_full_name") || "").toString().trim();
    const phone = (formData.get("buyer_phone") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const password = (formData.get("password") || "").toString();

    if (!fullName || !phone || !email || !password) {
      setError("Merci de remplir tous les champs.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      plan: planKey,
      fullName,
      phone,
      email,
      password,
    };

    try {
      const response = await fetch("/api/buyers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Impossible de créer le compte");
      }

      const result = await response.json();
      const targetUrl =
        nextParam ?? `/calendars/new?plan=${result.plan}&buyer=${result.id}`;
      router.push(targetUrl);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 dark:from-red-950 dark:via-gray-900 dark:to-green-950 pt-24">
      <Header />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/90 dark:bg-white/10 text-red-700 dark:text-white text-base font-semibold shadow-sm">
            2️⃣ Créez votre compte
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl font-bold text-red-700 dark:text-red-300">
            Créez votre compte pour accéder à votre calendrier
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Après avoir choisi votre forfait, confirmez votre profil utilisateur pour passer à la personnalisation.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 items-start">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-red-100 dark:border-gray-800 p-8 space-y-6">
            <input type="hidden" name="plan" value={planKey} />
            {/* Section compte acheteur */}
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-red-500 font-semibold mb-2">Acheteur</p>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Nom complet
                  <input
                    name="buyer_full_name"
                    required
                    placeholder="Prénom Nom"
                    className="mt-1 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </label>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Téléphone
                  <input
                    name="buyer_phone"
                    required
                    placeholder="+33 6 12 34 56 78"
                    className="mt-1 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="vous@example.com"
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Création en cours..." : "Créer mon compte"}
            </button>
            <p className="text-center text-xs uppercase tracking-wide text-gray-400">
              Étape suivante : personnalisation du calendrier
            </p>
          </form>

          <div className="bg-red-600 text-white rounded-3xl shadow-2xl p-8 space-y-6">
            <p className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/20 text-sm font-semibold">
              <span>🎯</span>
              <span>Récapitulatif de votre plan</span>
            </p>
            <h2 className="text-3xl font-bold">{plan.name}</h2>
            <div className="text-6xl font-black">{plan.price}</div>
            <p className="text-white/80">
              Votre compte vous permet de sauvegarder vos créations et de revenir à tout moment sur votre calendrier.
            </p>
            <ul className="space-y-3 text-white/90">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="text-2xl">✅</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl bg-white/15 px-6 py-4">
              <p className="text-sm uppercase tracking-wide text-white/75">Parcours</p>
              <p className="text-lg font-semibold">
                1. Choisir le forfait → 2. Créer un compte → 3. Personnaliser → 4. Infos receveur → 5. Paiement Stripe
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
