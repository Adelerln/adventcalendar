"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { sparkleRandom } from "@/lib/sparkle-random";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Impossible de vous connecter.");
      }
      router.push(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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

      <section className="relative z-10 mx-auto max-w-md px-6 py-32">
        <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">Se connecter</h1>
            <p className="text-sm text-white/80">Retrouvez vos calendriers et continuez la création.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-white">
              Adresse e-mail
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                required
              />
            </label>
            <label className="block text-sm font-semibold text-white">
              Mot de passe
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                required
              />
            </label>
            {error && <p className="text-sm text-red-200 bg-red-500/20 backdrop-blur px-4 py-2 rounded-lg border border-red-300/30">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full px-6 py-4 text-lg font-bold shadow-lg disabled:opacity-60 transition-all border-2 border-[#4a0808]"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                color: '#4a0808'
              }}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)'
      }}>
        <div className="text-white text-xl">Chargement...</div>
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}
