"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { sparkleRandom } from "@/lib/sparkle-random";
import { PLAN_APPEARANCE, DEFAULT_PLAN, type PlanKey } from "@/lib/plan-theme";

const GoldenEnvelopeTree = dynamic(() => import("@/components/GoldenEnvelopeTree"), { ssr: false });

const mockDays = Array.from({ length: 24 }, (_, idx) => ({
  day: idx + 1,
  isUnlocked: idx < 5,
  isToday: false,
  photo: null,
  message: idx === 0 ? "Votre calendrier vous attend" : null,
  drawing: null,
  music: null
}));

function CheckoutCancelPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam = (searchParams?.get("plan") as PlanKey | null) ?? null;
  const plan = planParam === "plan_premium" ? "plan_premium" : planParam === "plan_essentiel" ? "plan_essentiel" : DEFAULT_PLAN;
  const planTheme = PLAN_APPEARANCE[plan];

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Header />
      <div
        className="fixed inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)"
        }}
      />
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
                background: i % 2 === 0 ? "#d4af37" : "#ffffff",
                opacity: sparkleRandom(i, 4) * 0.6 + 0.2,
                animation: `sparkle ${sparkleRandom(i, 5) * 1.5 + 1}s ease-in-out infinite`,
                animationDelay: `${sparkleRandom(i, 6) * 2}s`,
                transform: `rotate(${sparkleRandom(i, 7) * 360}deg)`
              }}
            />
          );
        })}
      </div>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-16 space-y-10">
        <div className="text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[#f8d97c]">Paiement annulé</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Pas de souci, on garde ton travail</h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Ton calendrier est sauvegardé. Tu peux reprendre la création ou relancer le paiement quand tu veux.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] items-stretch">
          <div className="rounded-3xl border-2 border-white/25 bg-white/15 backdrop-blur p-6 text-white shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#f8d97c]">Aperçu</p>
                <h2 className="text-2xl font-bold">Calendrier en cours</h2>
                <p className="text-sm text-white/70">Continue ou repasse au paiement quand tu es prêt(e).</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => router.push("/calendars/new?stage=creation")}
                  className="px-5 py-3 rounded-full bg-white text-red-700 font-semibold shadow-md"
                >
                  Continuer la confection
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/checkout?plan=${plan}`)}
                  className="px-5 py-3 rounded-full border-2 border-white/60 text-white font-semibold hover:bg-white/10"
                >
                  Relancer le paiement
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/15 rounded-2xl p-4 flex items-center justify-center">
              <div className="w-full max-w-3xl mx-auto">
                <GoldenEnvelopeTree days={mockDays} onDayClick={() => {}} hideBackground />
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border-2 border-white/25 bg-white/10 backdrop-blur p-6 text-white space-y-4 shadow-xl">
            <div className="rounded-2xl border-2 border-[#d4af37] bg-white/10 backdrop-blur px-6 py-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Plan</p>
              <h2 className="text-3xl font-bold mt-2 text-white">{planTheme.name ?? "Calendrier"}</h2>
              <p className="text-sm text-white/70">Tu peux revenir régler plus tard, les données restent sauvegardées.</p>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => router.push("/creations")}
                className="w-full rounded-full px-5 py-3 font-semibold border-2 border-white/40 bg-white/10 hover:bg-white/20 transition"
              >
                Voir mes créations
              </button>
              <button
                type="button"
                onClick={() => router.push("/recipient/dashboard")}
                className="w-full rounded-full px-5 py-3 font-semibold bg-white text-red-700 shadow-md"
              >
                Aperçu côté destinataire
              </button>
            </div>
            <p className="text-xs text-white/70">Besoin d'aide ? Contacte le support et mentionne ton email de commande.</p>
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

export default function CheckoutCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Chargement…</div>}>
      <CheckoutCancelPageContent />
    </Suspense>
  );
}
