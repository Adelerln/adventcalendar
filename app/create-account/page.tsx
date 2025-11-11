"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import ParcoursBanner from "@/components/ParcoursBanner";
import StepNavigation from "@/components/StepNavigation";
import { PLAN_APPEARANCE, type PlanKey } from "@/lib/plan-theme";

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
  const [session, setSession] = useState<{ id: string; plan: PlanKey } | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const planParam = searchParams.get("plan");
  const nextParam = searchParams.get("next");
  const planKey: PlanKey = planParam === "plan_premium" ? "plan_premium" : "plan_essentiel";
  const plan = PLAN_COPY[planKey];
  const theme = PLAN_APPEARANCE[planKey];

  useEffect(() => {
    let ignore = false;
    fetch("/api/session")
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;
        const user = data.user as { id: string; plan: PlanKey } | null;
        setSession(user ?? null);
      })
      .catch(() => {
        setSession(null);
      })
      .finally(() => {
        if (!ignore) setCheckingSession(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (session) {
      router.replace(`/calendars/new?plan=${session.plan}&stage=creation`);
    }
  }, [router, session]);

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
      const buyerPlan = result?.buyer?.plan ?? planKey;
      const buyerId = result?.buyer?.id ?? "";
      const targetUrl =
        nextParam ?? `/calendars/new?plan=${buyerPlan}&buyer=${buyerId}`;
      router.push(targetUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputSurface =
    planKey === "plan_premium"
      ? "border-[#f5e6d4] bg-[#fff9f4]"
      : "border-[#e5e9ef] bg-[#f8fafd]";
  const inputRing = planKey === "plan_premium" ? "focus:ring-[#f6dfc2]" : "focus:ring-[#d7dde5]";

  if (session) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-24 text-black">
        <Header />
        <section className="mx-auto max-w-4xl px-6 py-32 text-center space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-gray-500">Connexion détectée</p>
          <h1 className="text-4xl font-bold">Redirection vers votre calendrier…</h1>
          <p className="text-gray-600">
            Vous êtes déjà connecté(e). Nous vous emmenons directement vers l&rsquo;étape de personnalisation.
          </p>
        </section>
      </main>
    );
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-24 text-black">
        <Header />
        <section className="mx-auto max-w-4xl px-6 py-32 text-center text-gray-500">Chargement…</section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-24 text-black">
      <Header />
      <StepNavigation
        plan={planKey}
        currentStep={2}
        prev={{ onClick: () => router.push(`/calendars/new?plan=${planKey}&stage=plan`) }}
        next={{ onClick: () => router.push(`/calendars/new?plan=${planKey}`) }}
        className="mt-6"
      />
      <section className="mx-auto max-w-6xl px-6 py-12 space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-black">
            Créez votre compte pour accéder à votre calendrier
          </h1>
        </div>
        <ParcoursBanner plan={planKey} currentStep={2} className="max-w-5xl mx-auto" />

        <div className="max-w-5xl mx-auto space-y-8">
          <div className="grid gap-10 md:grid-cols-2 items-stretch">
            <form
              onSubmit={handleSubmit}
              className={`bg-white rounded-3xl shadow-2xl border-2 ${theme.border} p-8 space-y-6`}
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
                      className={`mt-1 w-full rounded-2xl px-4 py-3 text-black focus:outline-none focus:ring-2 ${inputSurface} ${inputRing}`}
                    />
                  </label>
                  <label className="text-sm font-semibold text-black">
                    Téléphone
                    <input
                      name="buyer_phone"
                      required
                      placeholder="+33 6 12 34 56 78"
                      className={`mt-1 w-full rounded-2xl px-4 py-3 text-black focus:outline-none focus:ring-2 ${inputSurface} ${inputRing}`}
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
                  className={`w-full rounded-2xl px-4 py-3 text-black focus:outline-none focus:ring-2 ${inputSurface} ${inputRing}`}
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
                  className={`w-full rounded-2xl px-4 py-3 text-black focus:outline-none focus:ring-2 ${inputSurface} ${inputRing}`}
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`block w-full rounded-full border-2 ${theme.border} ${theme.ctaBg} ${theme.ctaHover} ${theme.ctaText} px-8 py-4 text-lg font-bold text-center transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? "Création en cours..." : "Créer mon compte"}
              </button>
              <p className="text-center text-xs uppercase tracking-wide text-black">
                Étape suivante : personnalisation du calendrier
              </p>
            </form>

            <div
              className={`rounded-3xl shadow-2xl border-2 ${theme.border} bg-white p-8 space-y-6 flex flex-col h-full`}
            >
              <div>
                <h2 className="text-3xl font-bold">{plan.name}</h2>
                <div className={`text-6xl font-black mt-2 ${theme.priceColor}`}>
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
