"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import ParcoursBanner from "@/components/ParcoursBanner";
import StepNavigation from "@/components/StepNavigation";
import { type PlanKey } from "@/lib/plan-theme";
import { sparkleRandom } from "@/lib/sparkle-random";

const PLAN_DETAILS = {
  plan_essentiel: { name: "Plan Essentiel", price: "10€" },
  plan_premium: { name: "Plan Premium", price: "15€" }
} as const;

function RecipientPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam = searchParams?.get("plan");
  const planKey: PlanKey = planParam === "plan_premium" ? "plan_premium" : "plan_essentiel";
  const plan = PLAN_DETAILS[planKey];
  const filled = Number(searchParams?.get("filled") ?? "0");

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
      <div className="absolute inset-0 z-0">
        {[...Array(150)].map((_, i) => {
          const size = sparkleRandom(i, 3) * 6 + 2;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${sparkleRandom(i, 1) * 100}%`,
                left: `${sparkleRandom(i, 2) * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: i % 2 === 0 ? '#d4af37' : '#ffffff',
                opacity: sparkleRandom(i, 4) * 0.6 + 0.2,
                animation: `sparkle ${sparkleRandom(i, 5) * 1.5 + 1}s ease-in-out infinite`,
                animationDelay: `${sparkleRandom(i, 6) * 2}s`,
                transform: `rotate(${sparkleRandom(i, 7) * 360}deg)`,
              }}
            />
          );
        })}
      </div>
      <StepNavigation
        plan={planKey}
        currentStep={4}
        prev={{ href: `/calendars/new?plan=${planKey}` }}
        next={{ href: `/checkout?plan=${planKey}${filled ? `&filled=${filled}` : ""}` }}
        className="mt-6 relative z-10"
      />
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-12 space-y-10">
        <div className="text-center space-y-4">
          <h1 className="mt-6 text-4xl md:text-5xl font-bold text-white">
            Dites-nous à qui ira ce calendrier
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-3xl mx-auto">
            Ces informations nous permettent de personnaliser vos messages et de préparer l'envoi au bon moment.
          </p>
        </div>
        <ParcoursBanner plan={planKey} currentStep={4} />

        <div className="grid gap-8 md:grid-cols-[3fr_2fr] items-stretch">
          <form
            action="/checkout"
            method="GET"
            className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/20 p-10 flex flex-col"
          >
            <input type="hidden" name="plan" value={planKey} />
            <div className="space-y-6 flex-1">
              <div className="grid md:grid-cols-2 gap-6">
                <label className="text-sm font-semibold text-white">
                  Prénom et nom du receveur
                  <input
                    name="recipient_name"
                    required
                    placeholder="Prénom Nom"
                    className="mt-2 w-full rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </label>
                <label className="text-sm font-semibold text-white">
                  E-mail du receveur
                  <input
                    name="recipient_email"
                    type="email"
                    required
                    placeholder="ami@example.com"
                    className="mt-2 w-full rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </label>
              </div>

              <div className="grid gap-6">
                <label className="text-sm font-semibold text-white">
                  Relation
                  <input
                    name="relationship"
                    required
                    placeholder="Partenaire, ami(e), famille..."
                    className="mt-2 w-full rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                  />
                </label>
              </div>

              <label className="text-sm font-semibold text-white block">
                Instructions particulières
                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Message spécial, contraintes de dates, prononciation du prénom..."
                  className="mt-2 w-full rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                />
              </label>
            </div>

            <div className="mt-8 space-y-3">
              <button
                type="submit"
                className="w-full rounded-full px-8 py-4 text-lg font-bold shadow-lg transition-all border-2 border-[#4a0808]"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                  color: '#4a0808'
                }}
              >
                Continuer vers le paiement Stripe
              </button>
              <p className="text-center text-xs uppercase tracking-wide text-white/70">
                Étape suivante : paiement sécurisé
              </p>
            </div>
          </form>

          <aside className="bg-white/10 backdrop-blur-md rounded-3xl shadow-xl border-2 border-white/20 p-8 space-y-6 flex flex-col">
            <div className="rounded-2xl border-2 border-[#d4af37] bg-white/10 backdrop-blur px-6 py-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Forfait</p>
              <h2 className="text-3xl font-bold mt-2 text-white">{plan.name}</h2>
              <p className="text-4xl font-black mt-2 text-[#d4af37]">{plan.price}</p>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-[#d4af37] bg-white/5 backdrop-blur p-6 space-y-2">
              <p className="text-sm font-semibold text-white/90">Progression</p>
              <p className="text-2xl font-bold text-white">{filled}/24 jours remplis</p>
              <p className="text-sm text-white/70">
                Vous pourrez encore modifier votre calendrier après le paiement.
              </p>
              <button
                type="button"
                onClick={() => router.push("/pricing")}
                className="mt-3 inline-flex w-full items-center justify-center rounded-full border-2 border-white/30 bg-white/10 backdrop-blur px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/20 hover:text-[#4a0808]"
              >
                Retourner aux tarifs
              </button>
            </div>
            <div className="bg-white/5 backdrop-blur rounded-2xl border-2 border-white/10 p-6 mt-auto">
              <p className="text-sm text-white/70">Besoin d'aide ?</p>
            </div>
          </aside>
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

export default function RecipientPage() {
  return (
    <Suspense fallback={null}>
      <RecipientPageContent />
    </Suspense>
  );
}
