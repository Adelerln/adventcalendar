"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function DemoPayButton({ plan }: { plan?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      router.push(`/gift/new?access=demo&plan=${plan ?? "plan_essentiel"}`);
    }, 800);
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="mt-6 w-full rounded-full px-6 py-4 text-lg font-bold shadow-lg disabled:opacity-70 transition-all border-2 border-[#4a0808]"
      style={{
        background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
        color: '#4a0808'
      }}
    >
      {loading ? "Paiement en cours..." : "Payer mon abonnement (démo)"}
    </button>
  );
}

function PayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAuthenticated = searchParams?.get("auth") === "ok";
  const hasRecipient = searchParams?.get("recipient") === "ok";
  const selectedPlan = searchParams?.get("plan");

  if (!isAuthenticated) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Fond rouge dégradé */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            background: 'linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)'
          }}
        />
        
        {/* Paillettes scintillantes */}
        <div className="absolute inset-0 z-0">
          {[...Array(150)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                background: i % 2 === 0 ? '#d4af37' : '#ffffff',
                opacity: Math.random() * 0.6 + 0.2,
                animation: `sparkle ${Math.random() * 1.5 + 1}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-[#d4af37] font-semibold">Étape verrouillée</p>
            <h1 className="text-3xl font-bold text-white">Merci de vous authentifier avant le paiement</h1>
            <p className="text-white/80">Cliquez sur le bouton ci-dessous pour revenir à l&rsquo;étape de connexion.</p>
            <Link
              href="/gift/login"
              className="inline-flex items-center justify-center rounded-full px-8 py-4 text-lg font-bold shadow-lg transition-all border-2 border-[#4a0808]"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                color: '#4a0808'
              }}
            >
              Revenir à l&rsquo;étape 2
            </Link>
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

  if (!hasRecipient) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Fond rouge dégradé */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            background: 'linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)'
          }}
        />
        
        {/* Paillettes scintillantes */}
        <div className="absolute inset-0 z-0">
          {[...Array(150)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                background: i % 2 === 0 ? '#d4af37' : '#ffffff',
                opacity: Math.random() * 0.6 + 0.2,
                animation: `sparkle ${Math.random() * 1.5 + 1}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-[#d4af37] font-semibold">Étape verrouillée</p>
            <h1 className="text-3xl font-bold text-white">Merci de remplir les informations du bénéficiaire avant le paiement</h1>
            <button
              onClick={() => router.push(`/gift/recipient?auth=ok&plan=${selectedPlan ?? "plan_essentiel"}`)}
              className="inline-flex items-center justify-center rounded-full px-8 py-4 text-lg font-bold shadow-lg transition-all border-2 border-[#4a0808]"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                color: '#4a0808'
              }}
            >
              Revenir à l&rsquo;étape 3
            </button>
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
        {[...Array(150)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              background: i % 2 === 0 ? '#d4af37' : '#ffffff',
              opacity: Math.random() * 0.6 + 0.2,
              animation: `sparkle ${Math.random() * 1.5 + 1}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl p-8 shadow-2xl space-y-8">
          <div className="text-center space-y-3">
            <p className="text-sm uppercase tracking-[0.4em] text-[#d4af37] font-semibold">Étape 4/5</p>
            <h1 className="text-4xl font-bold text-white">Choisis ton forfait avant de créer ton calendrier</h1>
            <p className="text-white/80">Le paiement déverrouille l'éditeur et te donne accès à la personnalisation complète.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div
              className={`rounded-3xl border-2 p-6 space-y-3 bg-white/10 backdrop-blur-md transition-all ${
                selectedPlan === "plan_essentiel" ? "border-[#d4af37] shadow-xl scale-105" : "border-white/30"
              }`}
            >
              <h2 className="text-2xl font-bold text-white">Forfait Classique</h2>
              <p className="text-4xl font-black text-[#d4af37]">10€</p>
              <ul className="space-y-2 text-white/90">
                <li className="flex items-center gap-2">
                  <span className="text-[#d4af37]">✓</span>
                  24 messages personnalisés
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#d4af37]">✓</span>
                  Partage via lien magique
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#d4af37]">✓</span>
                  Support email
                </li>
              </ul>
            </div>
            <div
              className={`relative rounded-3xl border-2 p-6 space-y-3 bg-gradient-to-br from-[#d4af37]/20 to-white/10 backdrop-blur-md transition-all ${
                selectedPlan === "plan_premium" ? "border-[#d4af37] shadow-xl scale-105" : "border-[#d4af37]"
              }`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-[#4a0808]"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)'
                }}
              >
                ⭐ RECOMMANDÉ
              </div>
              <h2 className="text-2xl font-bold text-white">Forfait Festif</h2>
              <p className="text-4xl font-black text-[#d4af37]">15€</p>
              <ul className="space-y-2 text-white/90">
                <li className="flex items-center gap-2">
                  <span className="text-[#d4af37]">✓</span>
                  Contenus illimités (texte, images, liens)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#d4af37]">✓</span>
                  Accès anticipé et badges festifs
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#d4af37]">✓</span>
                  Support prioritaire
                </li>
              </ul>
            </div>
          </div>

          <DemoPayButton plan={selectedPlan ?? undefined} />

          <p className="text-center text-sm text-white/70">
            Une fois le paiement validé, tu es automatiquement redirigé vers l'éditeur complet.
          </p>

          <div className="text-center text-sm">
            <Link href="/pricing" className="text-[#d4af37] font-semibold hover:underline">
              Besoin de comparer les plans en détail ?
            </Link>
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

export default function GiftPayPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)'
      }}>
        <div className="text-white text-xl">Chargement...</div>
      </main>
    }>
      <PayContent />
    </Suspense>
  );
}
