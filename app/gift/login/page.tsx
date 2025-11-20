"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { sparkleRandom } from "@/lib/sparkle-random";

const plans = [
  {
    key: "plan_essentiel",
    title: "Plan Essentiel",
    price: "10€",
    perks: ["24 messages personnalisés", "Partage sécurisé"],
  },
  {
    key: "plan_premium",
    title: "Plan Premium",
    price: "15€",
    perks: ["Photos, liens, vidéos", "Support prioritaire"],
  }
] as const;

export default function GiftLoginPage() {
  return (
    <Suspense
      fallback={
        <main
          className="min-h-screen flex items-center justify-center"
          style={{ background: "linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)" }}
        >
          <p className="text-white text-xl">Chargement…</p>
        </main>
      }
    >
      <GiftLoginContent />
    </Suspense>
  );
}

function GiftLoginContent() {
  const searchParams = useSearchParams();
  const planKey = searchParams?.get('plan') === "plan_premium" ? "plan_premium" : "plan_essentiel";
  const plan = plans.find((p) => p.key === planKey)!;
  const nextUrl = encodeURIComponent(`/gift/recipient?auth=ok&plan=${plan.key}`);

  return (
    <main className="min-h-screen relative bg-transparent px-6 pt-20 pb-16">
      {/* Fond rouge pailleté festif */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)',
        }}
      >
        {/* Texture pointillée */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
        
        {/* Paillettes scintillantes */}
        <div className="absolute inset-0">
          {[...Array(150)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                top: `${sparkleRandom(i, 1) * 100}%`,
                left: `${sparkleRandom(i, 2) * 100}%`,
                width: sparkleRandom(i, 3) * 3 + 1,
                height: sparkleRandom(i, 4) * 3 + 1,
                background: i % 2 === 0 ? '#fbbf24' : '#ffffff',
                opacity: sparkleRandom(i, 5) * 0.7 + 0.3,
                animationDelay: `${sparkleRandom(i, 6) * 2}s`,
                animationDuration: `${sparkleRandom(i, 7) * 3 + 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl space-y-10 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-white/20 p-8 shadow-2xl">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] font-semibold text-white drop-shadow-lg" style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Étape 2/5</p>
          <h1 className="text-4xl font-bold text-white drop-shadow-2xl">Connecte-toi avant de créer ton calendrier 🎄</h1>
          <p className="text-white/90 drop-shadow-lg">Authentifie-toi pour sécuriser l'abonnement et retrouver facilement ton espace.</p>
        </div>

        <div className="rounded-3xl border-2 border-[#d4af37] p-6 flex flex-col gap-3 shadow-lg bg-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white drop-shadow-md" style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Connexion + {plan.title}</p>
              <p className="text-3xl font-bold text-white drop-shadow-lg">{plan.price}</p>
            </div>
            <Link
              href={`/auth?plan=${plan.key}&next=${nextUrl}`}
              className="rounded-full border-2 border-[#4a0808] px-6 py-2 font-semibold shadow-lg hover:scale-105 transition-all text-[#4a0808]"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
              }}
            >
              Me connecter
            </Link>
          </div>
          <ul className="text-sm text-white/90 list-disc list-inside drop-shadow-md">
            {plan.perks.map((perk) => (
              <li key={perk}>{perk}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4 text-sm text-white/90 drop-shadow-md">
          <p><strong>Parcours complet :</strong> Choix du forfait → Authentification → Bénéficiaire → Paiement → Création.</p>
          <p>Après connexion, tu seras redirigé(e) automatiquement vers l'étape "Bénéficiaire".</p>
        </div>
      </div>
    </main>
  );
}
