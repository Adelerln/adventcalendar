"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";

const PLAN_COPY = {
  plan_essentiel: {
    name: "Plan Essentiel",
    price: "10€"
  },
  plan_premium: {
    name: "Plan Premium",
    price: "20€"
  }
} as const;

const FEATURE_ITEMS = [
  "Photos personnalisées",
  "Messages personnalisés",
  "Dessins créatifs",
  "Musique",
  "Vidéos en IA",
  "Petits jeux vidéos",
  "Prix à gagner $"
] as const;

const ESSENTIAL_INCLUDED = new Set(FEATURE_ITEMS.slice(0, 4));

export default function CreateAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement…</div>}>
      <CreateAccountContent />
    </Suspense>
  );
}

function CreateAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const planParam = searchParams.get("plan");
  const nextParam = searchParams.get("next");
  const planKey = planParam === "plan_premium" ? "plan_premium" : "plan_essentiel";
  const plan = PLAN_COPY[planKey];
  const isPremium = planKey === "plan_premium";
  const accentBorder = isPremium ? "border-[#ead3c0]" : "border-gray-300";

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 pt-24 text-black">
      <Header />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-black">
            Créez votre compte pour accéder à votre calendrier
          </h1>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          <div className={`rounded-2xl border-2 ${accentBorder} bg-white px-6 py-4 text-left`}>
            <p className="text-sm uppercase tracking-wide font-semibold mb-1 text-black">Parcours</p>
            <p className="text-sm leading-relaxed">
              1. Choisir le forfait → 2. Créer un compte → 3. Personnaliser →
              4. Infos receveur → 5. Paiement Stripe
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-2 items-stretch">
            <form
              onSubmit={handleSubmit}
              className={`bg-white rounded-3xl shadow-2xl border-2 ${accentBorder} p-8 space-y-6`}
            >
              <input type="hidden" name="plan" value={planKey} />
              {/* Section compte acheteur */}
              <div>
                <p className="text-xs uppercase tracking-[0.4em] font-semibold mb-2">Acheteur</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="text-sm font-semibold text-black">
                    Nom complet
                    <input
                      name="buyer_full_name"
                      required
                      placeholder="Prénom Nom"
                      className="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </label>
                  <label className="text-sm font-semibold text-black">
                    Téléphone
                    <input
                      name="buyer_phone"
                      required
                      placeholder="+33 6 12 34 56 78"
                      className="mt-1 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
                  Adresse e-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="vous@example.com"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-black mb-2">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-red-400"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="block w-full rounded-full border-2 border-gray-500 bg-[rgba(209,213,220,0.2)] text-black px-8 py-4 text-lg font-bold text-center transition-all hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Création en cours..." : "Créer mon compte"}
              </button>
              <p className="text-center text-xs uppercase tracking-wide text-black">
                Étape suivante : personnalisation du calendrier
              </p>
            </form>

            <div
              className={`rounded-3xl shadow-2xl border-2 ${accentBorder} bg-white p-8 space-y-6 flex flex-col h-full`}
            >
              <div>
                <h2 className="text-3xl font-bold">{plan.name}</h2>
                <div
                  className={`text-6xl font-black mt-2 ${
                    isPremium ? "text-[#cda982]" : "text-gray-400"
                  }`}
                >
                  {plan.price}
                </div>
              </div>
              <ul className="space-y-3 flex-1">
                {FEATURE_ITEMS.map((feature) => {
                  const included =
                    planKey === "plan_premium" ? true : ESSENTIAL_INCLUDED.has(feature);
                  const icon = included ? "✔" : "✘";
                  const iconClass = included ? "text-[#06B800]" : "text-[#ED0200]";
                  return (
                    <li key={feature} className="flex items-center gap-3 text-lg font-medium">
                      <span className={`text-xl font-semibold ${iconClass}`}>{icon}</span>
                      <span>{feature}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
