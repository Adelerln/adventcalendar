"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import GoldenEnvelopeTree from "@/components/GoldenEnvelopeTree";
import SnowfallAnimation from "@/components/SnowfallAnimation";
import DayModal from "@/components/DayModal";
import { type PlanKey } from "@/lib/plan-theme";
import { sparkleRandom } from "@/lib/sparkle-random";

type RecipientSession = {
  calendarId: string;
  recipientName: string;
  plan: PlanKey;
  senderName?: string;
};

type DayContent = {
  day: number;
  photo?: string | null;
  message?: string | null;
  drawing?: string | null;
  music?: string | null;
  musicTitle?: string | null;
};

type DayData = {
  day: number;
  photo?: string | null;
  message?: string | null;
  drawing?: string | null;
  music?: string | null;
  isUnlocked: boolean;
  isToday: boolean;
};

export default function RecipientDashboard() {
  const [session, setSession] = useState<RecipientSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayContent, setDayContent] = useState<DayContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [days, setDays] = useState<DayData[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Vérifier la session receveur
    fetch("/api/advent/recipient/session")
      .then((res) => {
        if (!res.ok) throw new Error("Non authentifié");
        return res.json();
      })
      .then((data) => {
        setSession(data.session);
        loadCalendarDays();
        setLoading(false);
      })
      .catch(() => {
        // Rediriger vers la page d'accueil si pas de session
        router.push("/");
      });
  }, [router]);

  const loadCalendarDays = async () => {
    try {
      const response = await fetch("/api/advent/recipient/days");
      if (!response.ok) throw new Error("Erreur de chargement");
      
      const data = await response.json();
      const recipientDays = data.days || [];
      
      // Créer les 24 jours avec leur état
      const openedDays = recipientDays.map((d: { dayNumber: number }) => d.dayNumber);
      const openedSet = new Set(openedDays);
      const lastOpened = openedDays.length ? Math.max(...openedDays) : 0;
      const currentDay = Math.min(lastOpened + 1, 24);

      const allDays: DayData[] = Array.from({ length: 24 }, (_, index) => {
        const dayNumber = index + 1;
        const isUnlocked = openedSet.has(dayNumber);
        return {
          day: dayNumber,
          photo: null,
          message: null,
          drawing: null,
          music: null,
          isUnlocked,
          isToday: !isUnlocked && dayNumber === currentDay
        };
      });

      setDays(allDays);
    } catch (error) {
      console.error("Error loading calendar days:", error);
    }
  };

  const handleDayClick = async (day: number) => {
    setSelectedDay(day);
    setLoadingContent(true);

    try {
      // Marquer le jour comme ouvert et récupérer le contenu
      const response = await fetch("/api/advent/recipient/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayNumber: day })
      });

      if (!response.ok) {
        throw new Error("Impossible d'ouvrir ce jour");
      }

      const data = await response.json();
      setDayContent(data.content);
    } catch (error) {
      console.error("Error opening day:", error);
      alert("Impossible d'ouvrir ce jour pour le moment");
      setSelectedDay(null);
      setDayContent(null);
    } finally {
      setLoadingContent(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#a52a2a] to-[#4a0808]">
        <div className="text-white text-xl">Chargement de votre calendrier... ✨</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Header />
      <SnowfallAnimation />
      <main className="min-h-screen relative pt-20 px-4 py-8">{/* Padding top réduit de 24 à 20 */}
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
          
          {/* Grosses paillettes dorées scintillantes */}
          <div className="absolute inset-0">
            {[...Array(200)].map((_, i) => {
              const size = sparkleRandom(i, 3) * 6 + 3;
              return (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    top: `${sparkleRandom(i, 1) * 100}%`,
                    left: `${sparkleRandom(i, 2) * 100}%`,
                    width: size,
                    height: size,
                    background: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#d4af37' : '#ffffff',
                    opacity: sparkleRandom(i, 4) * 0.8 + 0.2,
                    animation: `sparkle ${sparkleRandom(i, 5) * 3 + 2}s ease-in-out infinite`,
                    animationDelay: `${sparkleRandom(i, 6) * 2}s`,
                    boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          {/* Message personnalisé de l'offreur */}
          <div className="text-center space-y-3">
            <div className="text-5xl animate-bounce">🎄</div>
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              Bonjour {session.recipientName} !
            </h1>
            <p className="text-lg md:text-xl text-white/95 drop-shadow-md max-w-2xl mx-auto leading-relaxed">
              {session.senderName ? (
                <>
                  Un petit cadeau créé avec <span className="font-semibold" style={{ color: '#fda4af' }}>amour</span> par <span className="font-bold" style={{ color: '#fda4af' }}>{session.senderName}</span> juste pour <span className="text-white font-semibold">vous</span>
                </>
              ) : (
                <>Un petit cadeau créé avec <span className="font-semibold" style={{ color: '#fda4af' }}>amour</span> par <span className="font-bold" style={{ color: '#fda4af' }}>votre être cher</span> juste pour <span className="text-white font-semibold">vous</span></>
              )}
            </p>
          </div>

          {/* Instructions simplifiées et marketing */}
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-5 border-2 border-white/20">
            <h2 className="text-lg font-bold text-white mb-3 text-center">
              Comment ça marche ?
            </h2>
            <div className="space-y-2 text-white/90 text-sm md:text-base">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">•</span>
                <p>Chaque jour, une nouvelle case dorée s'ouvre</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">•</span>
                <p>Découvrez ce que votre proche a préparé : photos, messages, musiques…</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">•</span>
                <p>Revenez demain pour la prochaine surprise !</p>
              </div>
            </div>
          </div>

          {/* Progression visuelle - Sapin qui se décore */}
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-4 border-2 border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-4xl">
                  {days.filter(d => d.isUnlocked).length >= 20 ? '🎄' : 
                   days.filter(d => d.isUnlocked).length >= 10 ? '🌲' : '�'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Votre progression</p>
                  <p className="text-xs text-white/70">
                    {days.filter(d => d.isUnlocked).length} / 24 cases ouvertes
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: '#fbbf24' }}>
                  {Math.round((days.filter(d => d.isUnlocked).length / 24) * 100)}%
                </div>
                <p className="text-xs text-white/70">complété</p>
              </div>
            </div>
            {/* Barre de progression */}
            <div className="mt-3 w-full bg-white/20 rounded-full h-2 backdrop-blur-sm overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${(days.filter(d => d.isUnlocked).length / 24) * 100}%`,
                  background: 'linear-gradient(90deg, #fbbf24 0%, #fcd34d 50%, #fbbf24 100%)',
                  boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)'
                }}
              ></div>
            </div>
          </div>

          {/* Calendrier avec enveloppes dorées */}
          <div className="py-4">
            <GoldenEnvelopeTree
              days={days}
              onDayClick={handleDayClick}
              hideBackground={true}
            />
          </div>
        </div>

        {/* Modale d'ouverture des jours */}
        <DayModal
          isOpen={selectedDay !== null}
          content={dayContent}
          onClose={() => {
            setSelectedDay(null);
            setDayContent(null);
            setLoadingContent(false);
          }}
        />

        {/* Indicateur de chargement */}
        {loadingContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 border-white/20">
              <div className="text-center space-y-4">
                <div className="text-6xl animate-bounce">🎁</div>
                <p className="text-white text-xl font-semibold">Ouverture en cours...</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes sparkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.5) rotate(180deg);
          }
        }
      `}</style>
    </>
  );
}
