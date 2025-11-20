"use client";

import Link from "next/link";
import { sparkleRandom } from "@/lib/sparkle-random";

const plans = [
  {
    key: "plan_essentiel",
    name: "Plan Essentiel",
    price: "10€",
    description: "24 attentions personnalisées",
    perks: ["Messages illimités", "Partage sécurisé"],
  },
  {
    key: "plan_premium",
    name: "Plan Premium",
    price: "15€",
    description: "Ajoute photos, liens et musiques",
    perks: ["Contenus enrichis", "Support prioritaire"],
    isPremium: true
  }
];

export default function ChoosePlanPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
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

      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl p-8 shadow-2xl space-y-10">
          <div className="text-center space-y-3">
            <p className="text-sm uppercase tracking-[0.4em] text-[#d4af37] font-semibold">Étape 1/5</p>
            <h1 className="text-4xl font-bold text-white">Choisissez votre forfait</h1>
            <p className="text-white/80">Commencez par sélectionner l&rsquo;offre qui correspond à votre calendrier personnalisé.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <div 
                key={plan.key} 
                className={`relative rounded-3xl border-2 p-6 space-y-4 shadow-lg transition-all hover:scale-105 ${
                  plan.isPremium 
                    ? 'border-[#d4af37] bg-gradient-to-br from-[#d4af37]/20 to-white/10 backdrop-blur-md' 
                    : 'border-white/30 bg-white/10 backdrop-blur-md'
                }`}
              >
                {plan.isPremium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-[#4a0808]"
                    style={{
                      background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)'
                    }}
                  >
                    ⭐ RECOMMANDÉ
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                    <p className="text-sm text-white/70">{plan.description}</p>
                  </div>
                  <p className="text-4xl font-black text-[#d4af37]">{plan.price}</p>
                </div>
                <ul className="text-white/90 space-y-2">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2">
                      <span className="text-[#d4af37]">✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/gift/login?plan=${plan.key}`}
                  className="inline-flex w-full items-center justify-center rounded-full px-6 py-3 font-semibold shadow-lg transition-all border-2 border-[#4a0808]"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                    color: '#4a0808'
                  }}
                >
                  Continuer
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

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
