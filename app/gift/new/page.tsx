"use client";

import { Suspense } from "react";
import Link from "next/link";
import GiftWizard from "@/components/gift-builder/GiftWizard";
import { useSearchParams } from "next/navigation";
import { sparkleRandom } from "@/lib/sparkle-random";

function GiftNewPageContent() {
  const searchParams = useSearchParams();
  const hasAccess = !!searchParams?.get('access');

  if (!hasAccess) {
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
        <div className="absolute inset-0">
          {[...Array(150)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                top: `${sparkleRandom(i, 11) * 100}%`,
                left: `${sparkleRandom(i, 12) * 100}%`,
                width: sparkleRandom(i, 13) * 3 + 1,
                height: sparkleRandom(i, 14) * 3 + 1,
                background: i % 2 === 0 ? '#fbbf24' : '#ffffff',
                opacity: sparkleRandom(i, 15) * 0.7 + 0.3,
                animationDelay: `${sparkleRandom(i, 16) * 2}s`,
                animationDuration: `${sparkleRandom(i, 17) * 3 + 2}s`,
              }}
            />
          ))}
        </div>
        </div>

        <div className="relative z-10 mx-auto max-w-3xl rounded-3xl bg-white/10 backdrop-blur-md border-2 border-white/20 p-8 shadow-2xl text-center space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] font-semibold text-white drop-shadow-lg" style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Étape 3</p>
          <h1 className="text-3xl font-bold text-white drop-shadow-2xl">Authentifie-toi puis règle l'abonnement avant d'accéder à l'éditeur</h1>
          <p className="text-white/90 drop-shadow-lg">
            Parcours complet : Connexion → Paiement → Création. Reprends l'étape 1 pour valider ton accès puis reviens ici.
          </p>
          <Link
            href="/gift/login"
            className="inline-flex items-center justify-center rounded-full border-2 border-[#4a0808] px-8 py-3 font-semibold shadow-lg hover:scale-105 transition-all text-[#4a0808]"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
            }}
          >
            Reprendre le parcours
          </Link>
        </div>
      </main>
    );
  }

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
        <div className="absolute inset-0">
          {[...Array(150)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                top: `${sparkleRandom(i, 11) * 100}%`,
                left: `${sparkleRandom(i, 12) * 100}%`,
                width: sparkleRandom(i, 13) * 3 + 1,
                height: sparkleRandom(i, 14) * 3 + 1,
                background: i % 2 === 0 ? '#fbbf24' : '#ffffff',
                opacity: sparkleRandom(i, 15) * 0.7 + 0.3,
                animationDelay: `${sparkleRandom(i, 16) * 2}s`,
                animationDuration: `${sparkleRandom(i, 17) * 3 + 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl space-y-6">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] font-semibold text-white drop-shadow-lg" style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Parcours acheteur</p>
          <h1 className="text-4xl font-bold text-white drop-shadow-2xl">Créer un calendrier de l'Avent personnalisé</h1>
          <p className="text-white/90 drop-shadow-lg">Complète les 3 étapes pour générer ton lien de partage.</p>
        </div>
        <GiftWizard />
      </div>
    </main>
  );
}

export default function GiftNewPage() {
  return (
    <Suspense fallback={null}>
      <GiftNewPageContent />
    </Suspense>
  );
}
