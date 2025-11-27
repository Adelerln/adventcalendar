"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { sparkleRandom } from "@/lib/sparkle-random";

export default function SharePage({ params }: { params: Promise<{ calendarId: string }> }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SharePageContent params={params} />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <main
      className="relative min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)" }}
    >
      <p className="text-white text-xl">Chargement…</p>
    </main>
  );
}

function SharePageContent({ params }: { params: Promise<{ calendarId: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();

  const calendarId = resolvedParams.calendarId;
  const shareUrl = searchParams?.get("url");
  const accessCode = searchParams?.get("code");
  const recipientName = searchParams?.get("recipient");

  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    // Rediriger vers le dashboard si pas de code (sécurité)
    if (!accessCode) {
      console.warn("[share-page] No access code provided, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [accessCode, router]);

  const handleCopy = async (text: string, setCopyState: (val: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(true);
      setTimeout(() => setCopyState(false), 3000);
    } catch (error) {
      console.error("Failed to copy", error);
    }
  };

  const handleShare = (platform: "email" | "sms" | "whatsapp") => {
    if (!shareUrl) return;

    const message = `🎄 J'ai créé un calendrier de l'Avent spécial pour toi ! Clique sur ce lien pour le découvrir : ${shareUrl}`;

    switch (platform) {
      case "email":
        window.location.href = `mailto:?subject=Ton calendrier de l'Avent est prêt ! 🎄&body=${encodeURIComponent(message)}`;
        break;
      case "sms":
        window.location.href = `sms:?body=${encodeURIComponent(message)}`;
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
        break;
    }
  };

  if (!shareUrl || !accessCode) {
    return <LoadingFallback />;
  }

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
              className="absolute rounded-full animate-pulse"
              style={{
                top: `${sparkleRandom(i, 1) * 100}%`,
                left: `${sparkleRandom(i, 2) * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: i % 2 === 0 ? '#d4af37' : '#ffffff',
                opacity: sparkleRandom(i, 4) * 0.6 + 0.2,
                animationDelay: `${sparkleRandom(i, 5) * 2}s`,
                animationDuration: `${sparkleRandom(i, 6) * 3 + 2}s`,
              }}
            />
          );
        })}
      </div>

      <section className="relative z-10 mx-auto max-w-4xl px-6 py-12 pt-32 space-y-10">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="text-7xl mb-4">🎄</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            Votre calendrier est prêt !
          </h1>
          <p className="text-lg text-white/90 drop-shadow-md max-w-2xl mx-auto">
            {recipientName ? `Partagez la magie de Noël avec ${recipientName}` : "Partagez la magie de Noël avec votre proche"}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/20 p-8 md:p-12 space-y-8">

          {/* Lien de partage */}
          <div>
            <h2 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider mb-4 text-center">
              🔗 Lien de partage
            </h2>
            <div className="bg-gradient-to-r from-[#d4af37] via-[#e8d5a8] to-[#d4af37] rounded-2xl p-1">
              <div className="bg-white rounded-xl p-6">
                <p className="text-[#4a0808] font-mono text-sm md:text-base break-all text-center">
                  {shareUrl}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleCopy(shareUrl, setCopied)}
              className="w-full mt-4 bg-white/20 hover:bg-white/30 backdrop-blur text-white font-bold py-3 px-6 rounded-xl transition-all border-2 border-white/30"
            >
              {copied ? "✓ Copié !" : "📋 Copier le lien"}
            </button>
          </div>

          {/* Code d'accès */}
          <div>
            <h2 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider mb-4 text-center">
              🔐 Code d'accès
            </h2>
            <div className="bg-gradient-to-r from-[#8b1a1a] via-[#6b0f0f] to-[#8b1a1a] rounded-2xl p-1">
              <div className="bg-[#4a0808] rounded-xl p-8 text-center">
                <div className="inline-block bg-[#d4af37]/20 border-4 border-dashed border-[#d4af37] rounded-xl px-8 py-6">
                  <p className="text-[#d4af37] font-bold text-6xl md:text-7xl tracking-[0.5em] drop-shadow-lg">
                    {accessCode}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleCopy(accessCode, setCodeCopied)}
              className="w-full mt-4 bg-white/20 hover:bg-white/30 backdrop-blur text-white font-bold py-3 px-6 rounded-xl transition-all border-2 border-white/30"
            >
              {codeCopied ? "✓ Copié !" : "📋 Copier le code"}
            </button>
            <p className="text-center text-white/70 text-sm mt-4 italic">
              ⚠️ Ce code ne sera plus accessible après cette page. Sauvegardez-le précieusement !
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-[#8b1a1a]/30 backdrop-blur border-l-4 border-[#d4af37] rounded-lg p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Comment partager votre calendrier
            </h3>
            <ol className="text-white/90 space-y-3 ml-8 list-decimal">
              <li>Envoyez le <strong>lien de partage</strong> à votre proche (par email, SMS ou WhatsApp)</li>
              <li>Communiquez le <strong>code d'accès</strong> séparément pour plus de sécurité</li>
              <li>Votre proche pourra ouvrir une surprise par jour à partir du 1er décembre ! 🎅</li>
            </ol>
          </div>

          {/* Boutons de partage */}
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleShare("email")}
              className="bg-white/20 hover:bg-white/30 backdrop-blur text-white font-semibold py-4 px-4 rounded-xl transition-all border-2 border-white/30 flex flex-col items-center gap-2"
            >
              <span className="text-2xl">📧</span>
              <span className="text-sm">Email</span>
            </button>
            <button
              onClick={() => handleShare("sms")}
              className="bg-white/20 hover:bg-white/30 backdrop-blur text-white font-semibold py-4 px-4 rounded-xl transition-all border-2 border-white/30 flex flex-col items-center gap-2"
            >
              <span className="text-2xl">💬</span>
              <span className="text-sm">SMS</span>
            </button>
            <button
              onClick={() => handleShare("whatsapp")}
              className="bg-white/20 hover:bg-white/30 backdrop-blur text-white font-semibold py-4 px-4 rounded-xl transition-all border-2 border-white/30 flex flex-col items-center gap-2"
            >
              <span className="text-2xl">📱</span>
              <span className="text-sm">WhatsApp</span>
            </button>
          </div>

          {/* Notice de sécurité */}
          <div className="bg-[#d4af37]/10 border border-[#d4af37]/50 rounded-lg p-4 text-center">
            <p className="text-white/80 text-sm">
              <strong className="text-[#d4af37]">🛡️ Conseil de sécurité :</strong><br />
              Nous vous recommandons de communiquer le code d'accès séparément du lien,<br className="hidden md:block" />
              par exemple par téléphone ou SMS.
            </p>
          </div>

          {/* CTA Retour */}
          <div className="text-center pt-6">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-block bg-gradient-to-r from-[#d4af37] via-[#e8d5a8] to-[#d4af37] text-[#4a0808] font-bold py-4 px-8 rounded-full transition-all border-2 border-[#4a0808] shadow-lg hover:shadow-xl"
            >
              📊 Retour au tableau de bord
            </button>
            <p className="text-white/70 text-sm mt-4">
              Vous pouvez encore modifier le contenu de votre calendrier depuis votre espace personnel
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-white/50 text-sm pb-8">
          <p>Joyeuses fêtes ! 🎄✨</p>
        </div>
      </section>
    </main>
  );
}
