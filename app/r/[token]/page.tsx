"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

interface Props {
  params: Promise<{ token: string }>;
}

export default function RecipientAccessPage(props: Props) {
  const params = use(props.params);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/advent/recipient/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: params.token,
          code: code.trim()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Code invalide");
      }

      // Redirection vers le dashboard receveur
      router.push("/recipient/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen relative pt-24 px-6 py-12">
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
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: Math.random() * 3 + 1,
                  height: Math.random() * 3 + 1,
                  background: i % 2 === 0 ? '#fbbf24' : '#ffffff',
                  opacity: Math.random() * 0.7 + 0.3,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-10 border-2 border-white/20">
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🎁</div>
              
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#d4af37] font-semibold mb-2">
                  Un cadeau vous attend
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Entrez votre code d'accès
                </h1>
                <p className="text-white/80">
                  Quelqu'un de spécial a créé un calendrier de l'Avent rien que pour vous ✨
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                <div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Entrez votre code"
                    maxLength={6}
                    required
                    className="w-full text-center text-2xl font-bold tracking-widest rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37] uppercase"
                    disabled={loading}
                  />
                  <p className="text-xs text-white/60 mt-2">
                    Le code vous a été envoyé par email ou SMS
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-4 text-white text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length < 4}
                  className="w-full rounded-full px-8 py-4 text-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-[#4a0808]"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                    color: '#4a0808'
                  }}
                >
                  {loading ? "Vérification..." : "Accéder à mon calendrier"}
                </button>
              </form>

              <div className="pt-6 border-t border-white/20">
                <p className="text-sm text-white/70">
                  Code perdu ? Contactez la personne qui vous a envoyé le lien
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
