"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import ParcoursBanner from "@/components/ParcoursBanner";
import StepNavigation from "@/components/StepNavigation";
import { PLAN_APPEARANCE, type PlanKey } from "@/lib/plan-theme";
import { sparkleRandom } from "@/lib/sparkle-random";

const PLAN_COPY = {
  plan_essentiel: {
    name: "Plan Essentiel",
    price: "10€"
  },
  plan_premium: {
    name: "Plan Premium",
    price: "15€"
  }
} as const;

const FEATURE_ITEMS = [
  "Photos personnalisées",
  "Messages personnalisés",
  "Dessins créatifs",
  "Musique",
  "Vidéos en IA",
  "Prix à gagner $"
] as const;

const ESSENTIAL_INCLUDED = new Set(FEATURE_ITEMS.slice(0, 3));

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
      // Si le plan de la session est différent du plan demandé, mettre à jour le plan
      if (session.plan !== planKey) {
        fetch("/api/session/update-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planKey })
        })
          .then(() => {
            router.replace(`/calendars/new?plan=${planKey}&stage=creation`);
          })
          .catch(() => {
            // En cas d'erreur, rediriger quand même
            router.replace(`/calendars/new?plan=${planKey}&stage=creation`);
          });
      } else {
        // Le plan est déjà bon, rediriger directement
        router.replace(`/calendars/new?plan=${planKey}&stage=creation`);
      }
    }
  }, [router, session, planKey]);

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
  const renderSparkles = (seedOffset = 0) => (
    <div className="absolute inset-0 z-0">
      {[...Array(150)].map((_, i) => {
        const idx = seedOffset * 200 + i;
        const size = sparkleRandom(idx, 3) * 6 + 2;
        return (
          <div
            key={idx}
            className="absolute rounded-full"
            style={{
              top: `${sparkleRandom(idx, 1) * 100}%`,
              left: `${sparkleRandom(idx, 2) * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: idx % 2 === 0 ? '#d4af37' : '#ffffff',
              opacity: sparkleRandom(idx, 4) * 0.6 + 0.2,
              animation: `sparkle ${sparkleRandom(idx, 5) * 1.5 + 1}s ease-in-out infinite`,
              animationDelay: `${sparkleRandom(idx, 6) * 2}s`,
              transform: `rotate(${sparkleRandom(idx, 7) * 360}deg)`,
            }}
          />
        );
      })}
    </div>
  );

  if (session) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <Header />
        {/* Fond rouge dégradé */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            background: 'linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)'
          }}
        />
        {/* Paillettes scintillantes */}
        {renderSparkles(0)}
        <section className="relative z-10 mx-auto max-w-4xl px-6 py-32 text-center space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-[#d4af37]">Connexion détectée</p>
          <h1 className="text-4xl font-bold text-white">Redirection vers votre calendrier…</h1>
          <p className="text-white/80">
            Vous êtes déjà connecté(e). Nous vous emmenons directement vers l&rsquo;étape de personnalisation.
          </p>
        </section>
        <style jsx>{`
          @keyframes sparkle {
            0%, 100% {
              opacity: 0.2;
              transform: scale(0.8) rotate(0deg);
            }
            50% {
              opacity: 1;
              transform: scale(2) rotate(180deg);
            }
          }
        `}</style>
      </main>
    );
  }

  if (checkingSession) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <Header />
        {/* Fond rouge dégradé */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            background: 'linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)'
          }}
        />
        {/* Paillettes scintillantes */}
        {renderSparkles(1)}
        <section className="relative z-10 mx-auto max-w-4xl px-6 py-32 text-center text-white">Chargement…</section>
        <style jsx>{`
          @keyframes sparkle {
            0%, 100% {
              opacity: 0.2;
              transform: scale(0.8) rotate(0deg);
            }
            50% {
              opacity: 1;
              transform: scale(2) rotate(180deg);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Header />
      {/* Fond rouge dégradé */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)'
        }}
      />
      {/* Paillettes scintillantes */}
      {renderSparkles(2)}
      <StepNavigation
        plan={planKey}
        currentStep={2}
        prev={{ onClick: () => router.push(`/calendars/new?plan=${planKey}&stage=plan`) }}
        next={{ onClick: () => router.push(`/calendars/new?plan=${planKey}`) }}
        className="mt-6 relative z-10"
      />
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-12 space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Créez votre compte pour accéder à votre calendrier
          </h1>
        </div>
        <ParcoursBanner plan={planKey} currentStep={2} className="max-w-5xl mx-auto" />

        <div className="max-w-5xl mx-auto space-y-8">
          <div className="grid gap-10 md:grid-cols-2 items-stretch">
            <form
              onSubmit={handleSubmit}
              className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/20 p-8 space-y-6"
            >
              <input type="hidden" name="plan" value={planKey} />
              {/* Section compte acheteur */}
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#d4af37] font-semibold mb-2">Acheteur</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="text-sm font-semibold text-white">
                    Nom complet
                    <input
                      name="buyer_full_name"
                      required
                      placeholder="Prénom Nom"
                      className="mt-1 w-full rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                    />
                  </label>
                  <label className="text-sm font-semibold text-white">
                    Téléphone
                    <input
                      name="buyer_phone"
                      required
                      placeholder="+33 6 12 34 56 78"
                      className="mt-1 w-full rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                  Adresse e-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="vous@example.com"
                  className="w-full rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-200 bg-red-500/20 backdrop-blur px-4 py-2 rounded-lg border border-red-300/30">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="block w-full rounded-full border-2 border-[#4a0808] px-8 py-4 text-lg font-bold text-center transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                  color: '#4a0808'
                }}
              >
                {isSubmitting ? "Création en cours..." : "Créer mon compte"}
              </button>
              <p className="text-center text-xs uppercase tracking-wide text-white/80">
                Étape suivante : personnalisation du calendrier
              </p>
            </form>

            <div
              className="rounded-3xl shadow-2xl border-2 border-white/20 bg-white/10 backdrop-blur-md p-8 space-y-6 flex flex-col h-full"
            >
              <div>
                <h2 className="text-3xl font-bold text-white">{plan.name}</h2>
                <div className="text-6xl font-black mt-2 text-[#d4af37]">
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
                    <li key={feature} className="flex items-center gap-3 text-lg font-medium text-white">
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
      <style jsx>{`
        @keyframes sparkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(2) rotate(180deg);
          }
        }
      `}</style>
    </main>
  );
}
