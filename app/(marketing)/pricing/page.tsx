import Link from "next/link";
import Header from "@/components/Header";
import { sparkleRandom } from "@/lib/sparkle-random";

const featureItems = [
  "Photos personnalisées",
  "Vidéos personnalisées",
  "Messages personnalisés",
  "Dessins créatifs",
  "Musique",
  "Photos IA"
];

export default function PricingPage() {
  const essentialIncluded = new Set(featureItems.slice(0, 4));

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
      <div className="relative z-10 mx-auto max-w-6xl py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-2xl">Choisissez votre forfait</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto drop-shadow-lg">
            Créez un calendrier de l&rsquo;avent personnalisé
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="rounded-3xl border-2 border-white/20 p-8 transition-colors bg-white/10 backdrop-blur-md hover:bg-white/15 flex flex-col">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2 text-white">PLAN ESSENTIEL</h2>
              <div className="text-6xl font-bold text-white/80 mb-4">10€</div>
              <p className="text-white/80">Paiement après création</p>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg mb-4 text-white">24 intentions avec plusieurs surprises possibles dont :</div>
              <ul className="space-y-3 ml-2">
                {featureItems.map((feature) => {
                  const included = essentialIncluded.has(feature);
                  const iconClass = included ? "text-[#4ade80]" : "text-[#f87171]";
                  return (
                    <li key={feature} className="flex items-center gap-3 text-lg">
                      <span className={`text-xl font-semibold ${iconClass}`}>
                        {included ? "✔" : "✘"}
                      </span>
                      <span className="font-medium text-white">{feature}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="mt-10">
              <Link
                href="/create-account?plan=plan_essentiel"
                className="block w-full rounded-full border-2 border-white/30 bg-white/10 text-white px-8 py-4 text-lg font-bold text-center transition-all hover:bg-white/20 backdrop-blur-sm"
              >
                Choisir ce plan
              </Link>
            </div>
          </div>

          <div className="group rounded-3xl border-2 border-[#d4af37] p-8 transition-colors bg-white/10 backdrop-blur-md hover:bg-white/15 flex flex-col relative overflow-hidden">
            {/* Effet brillant doré */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/10 to-transparent pointer-events-none" />
            
            <div className="text-center mb-6 relative z-10">
              <h2 className="text-3xl font-bold mb-2 text-white">PLAN PREMIUM</h2>
              <div className="text-6xl font-bold mb-4" style={{ 
                background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>15€</div>
              <p className="text-white/80">Paiement après création</p>
            </div>
            <div className="flex-1 relative z-10">
              <div className="font-semibold text-lg mb-4 text-white">24 intentions avec plusieurs surprises possibles dont :</div>
              <ul className="space-y-3 ml-2">
                {featureItems.flatMap((feature) => {
                  const entries = [
                    <li key={feature} className="flex items-center gap-3 text-lg">
                      <span className="text-xl font-semibold text-[#4ade80]">✔</span>
                      <span className="font-medium text-white">{feature}</span>
                    </li>
                  ];
                  if (feature === "Dessins créatifs") {
                    entries.push(
                      <li key="messages-vocaux" className="flex items-center gap-3 text-lg">
                        <span className="text-xl font-semibold text-[#4ade80]">✔</span>
                        <span className="font-medium text-white">Messages vocaux personnalisés</span>
                      </li>
                    );
                  }
                  return entries;
                })}
              </ul>
            </div>
            <div className="mt-10 relative z-10">
            <div className="absolute -top-4 right-6 z-30 pointer-events-none">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-bold shadow-lg transition-transform duration-200 will-change-transform group-hover:scale-105 hover:scale-105 origin-bottom"
                      style={{
                        background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                      }}>
                  ⭐ POPULAIRE
                </span>
              </div>
            <Link
              href="/create-account?plan=plan_premium"
              className="relative z-10 block w-full rounded-full border-2 border-[#4a0808] px-8 py-4 text-lg font-bold text-center transition-transform duration-200 will-change-transform hover:scale-105 group-hover:scale-105 group-hover:z-20 origin-top text-[#4a0808]"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                }}
              >
                Choisir le Premium
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link href="/faq" className="text-white/90 hover:text-white font-semibold drop-shadow-md text-lg">
            Questions fréquentes →
          </Link>
        </div>
      </div>
    </main>
  );
}
