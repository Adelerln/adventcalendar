import Header from "@/components/Header";
import { sparkleRandom } from "@/lib/sparkle-random";

export default function FaqPage() {
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

      <Header />
      <div className="relative z-10 mx-auto max-w-4xl py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-2xl">
            Foire aux questions
          </h1>
          <p className="text-xl text-white/90 drop-shadow-lg">
            Tout ce que vous devez savoir
          </p>
        </div>

        <div className="space-y-6">
          <details className="bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/15 open:bg-white/15 transition-colors rounded-2xl p-6 shadow-lg">
            <summary className="font-semibold cursor-pointer text-lg text-white drop-shadow-md">Qu&rsquo;est-ce qu&rsquo;un calendrier de l&rsquo;Avent personnalisé ?</summary>
            <p className="mt-3 text-white/90">
              C&rsquo;est un calendrier numérique avec 24 cases (du 1er au 24 décembre) que vous personnalisez avec vos propres photos, messages, dessins et musiques (version Premium).
            </p>
          </details>

          <details className="bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/15 open:bg-white/15 transition-colors rounded-2xl p-6 shadow-lg">
            <summary className="font-semibold cursor-pointer text-lg text-white drop-shadow-md">Quelle est la différence entre les plans ?</summary>
            <p className="mt-3 text-white/90">
              Le Plan Essentiel (10€) inclut photos, messages et dessins. Le Plan Premium (15€) ajoute les musiques, des vidéos d&rsquo;IA et un vrai prix à gagner (pour Noël).
            </p>
          </details>

          <details className="bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/15 open:bg-white/15 transition-colors rounded-2xl p-6 shadow-lg">
            <summary className="font-semibold cursor-pointer text-lg text-white drop-shadow-md">Le paiement est-il sécurisé ?</summary>
            <p className="mt-3 text-white/90">
              Absolument. Tous les paiements sont traités via Stripe, la plateforme la plus sécurisée.
            </p>
          </details>

          <details className="bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/15 open:bg-white/15 transition-colors rounded-2xl p-6 shadow-lg">
            <summary className="font-semibold cursor-pointer text-lg text-white drop-shadow-md">Quand mon proche pourra-t-il ouvrir les cases ?</summary>
            <p className="mt-3 text-white/90">
              Une nouvelle case se débloque automatiquement chaque jour de décembre, du 1er au 24.
            </p>
          </details>

          <details className="bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/15 open:bg-white/15 transition-colors rounded-2xl p-6 shadow-lg">
            <summary className="font-semibold cursor-pointer text-lg text-white drop-shadow-md">Puis-je modifier le calendrier après création ?</summary>
            <p className="mt-3 text-white/90">
              Oui, vous pouvez modifier le contenu jusqu&rsquo;au moment où une case se débloque.
            </p>
          </details>
        </div>

        <div className="mt-16 text-center px-4 space-y-4">
          <h2 className="text-3xl font-bold text-white drop-shadow-2xl">Vous n&rsquo;avez pas trouvé votre réponse ?</h2>
          <p className="text-lg text-white/90 drop-shadow-lg">Notre équipe est là pour vous aider !</p>
          <button 
            type="button"
            className="inline-block px-8 py-3 border-2 border-[#4a0808] rounded-full font-bold transition-all hover:scale-105 text-[#4a0808]"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
            }}
          >
            Contactez-nous
          </button>
        </div>
      </div>
    </main>
  );
}
