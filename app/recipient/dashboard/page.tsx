"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import GoldenEnvelopeTree from "@/components/GoldenEnvelopeTree";
import SnowfallAnimation from "@/components/SnowfallAnimation";
import DayModal from "@/components/DayModal";
import { type PlanKey } from "@/lib/plan-theme";

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
          
          {/* Grosses paillettes dorées scintillantes */}
          <div className="absolute inset-0">
            {[...Array(200)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: Math.random() * 6 + 3,
                  height: Math.random() * 6 + 3,
                  background: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#d4af37' : '#ffffff',
                  opacity: Math.random() * 0.8 + 0.2,
                  animation: `sparkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                  boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-8">
          {/* En-tête personnalisé */}
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4 animate-bounce">🎄</div>
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Bonjour {session.recipientName} !
            </h1>
            <p className="text-xl text-white/90 drop-shadow-md">
              {session.senderName ? (
                <>
                  <span className="font-semibold">{session.senderName}</span> a créé ce calendrier de l'Avent spécialement pour vous ✨
                </>
              ) : (
                <>Votre calendrier de l'Avent personnalisé vous attend ✨</>
              )}
            </p>
          </div>

          {/* Message d'instructions */}
          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 border-2 border-white/20">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🎁</div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Comment ça marche ?
                </h2>
                <p className="text-white/90 text-sm leading-relaxed">
                  Chaque jour, une nouvelle surprise s'ouvre ! Cliquez sur les enveloppes dorées pour découvrir les attentions 
                  qui ont été préparées pour vous : photos, messages, dessins et peut-être même de la musique 🎵
                </p>
              </div>
            </div>
          </div>

          {/* Calendrier avec enveloppes dorées */}
          <div className="py-8">
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
