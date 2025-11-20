"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { sparkleRandom } from "@/lib/sparkle-random";

function RecipientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = searchParams?.get("auth") === "ok";
  const plan = searchParams?.get("plan") ?? "plan_essentiel";
  const [recipient, setRecipient] = useState({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("Pour toi 🎁");

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

        <div className="relative z-10 w-full max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl p-8 shadow-2xl text-center space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-[#d4af37] font-semibold">Étape verrouillée</p>
            <h1 className="text-3xl font-bold text-white">Merci de vous connecter avant de renseigner le bénéficiaire</h1>
            <button
              onClick={() => router.push(`/gift/login?plan=${plan}`)}
              className="inline-flex items-center justify-center rounded-full px-8 py-4 text-lg font-bold shadow-lg transition-all border-2 border-[#4a0808]"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                color: '#4a0808'
              }}
            >
              Revenir à l&rsquo;étape 2
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(`/gift/pay?auth=ok&recipient=ok&plan=${plan}`);
  };

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
          const size = sparkleRandom(i, 13) * 6 + 2;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${sparkleRandom(i, 11) * 100}%`,
                left: `${sparkleRandom(i, 12) * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: i % 2 === 0 ? '#d4af37' : '#ffffff',
                opacity: sparkleRandom(i, 14) * 0.6 + 0.2,
                animation: `sparkle ${sparkleRandom(i, 15) * 1.5 + 1}s ease-in-out infinite`,
                animationDelay: `${sparkleRandom(i, 16) * 2}s`,
                transform: `rotate(${sparkleRandom(i, 17) * 360}deg)`,
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <p className="text-sm uppercase tracking-[0.4em] text-[#d4af37] font-semibold">Étape 3/5</p>
            <h1 className="text-4xl font-bold text-white">Renseignez le bénéficiaire</h1>
            <p className="text-white/80">Ces informations permettront d'envoyer le lien magique et de personnaliser le ton du calendrier.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm font-semibold text-white">
                Nom complet
                <input
                  required
                  value={recipient.name}
                  onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
                  className="mt-1 w-full rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur px-4 py-3 text-white placeholder:text-white/50"
                  placeholder="Nom du proche"
                />
              </label>
              <label className="text-sm font-semibold text-white">
                Email
                <input
                  type="email"
                  required
                  value={recipient.email}
                  onChange={(e) => setRecipient({ ...recipient, email: e.target.value })}
                  className="mt-1 w-full rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur px-4 py-3 text-white placeholder:text-white/50"
                  placeholder="destinataire@example.com"
                />
              </label>
            </div>
            <label className="text-sm font-semibold text-white">
              Téléphone (optionnel)
              <input
                value={recipient.phone}
                onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })}
                className="mt-1 w-full rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur px-4 py-3 text-white placeholder:text-white/50"
                placeholder="+33 6 12 34 56 78"
              />
            </label>
            <label className="text-sm font-semibold text-white">
              Message d&rsquo;introduction
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur px-4 py-3 h-32 text-white placeholder:text-white/50"
              />
            </label>
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => router.push(`/gift/login?plan=${plan}`)}
                className="rounded-full border-2 border-white/40 bg-white/10 backdrop-blur px-6 py-3 text-white font-semibold hover:bg-white/20 transition-all"
              >
                Retour
              </button>
              <button 
                type="submit" 
                className="rounded-full px-8 py-4 text-lg font-bold shadow-lg transition-all border-2 border-[#4a0808]"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                  color: '#4a0808'
                }}
              >
                Enregistrer et continuer
              </button>
            </div>
          </form>
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

export default function RecipientInfoPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)'
      }}>
        <div className="text-white text-xl">Chargement...</div>
      </main>
    }>
      <RecipientContent />
    </Suspense>
  );
}
