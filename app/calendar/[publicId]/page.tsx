"use client";

import { useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import CalendarGrid from "@/components/CalendarGrid";
import DayModal from "@/components/DayModal";
import Header from "@/components/Header";

type Props = { params: { publicId: string } };

// Données de démonstration
const mockDayData = [
  {
    day: 1,
    photo: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400",
    message: "Premier jour de décembre ! Que ce mois soit rempli de magie et de bonheur. Je t'aime ❤️",
    drawing: null,
    music: null,
    musicTitle: null
  },
  {
    day: 2,
    photo: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400",
    message: "Souviens-toi de ce moment magique ensemble...",
    drawing: null,
    music: null,
    musicTitle: null
  },
  // Ajoutez plus de données si nécessaire
];

export default function PublicCalendarPage({ params }: Props) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const todayParis = new Date();
  const yyyyMMdd = formatInTimeZone(todayParis, "Europe/Paris", "yyyy-MM-dd");

  // Dates du calendrier
  const startDate = new Date("2025-12-01");
  const endDate = new Date("2025-12-24");
  const dayOffset = Math.floor((new Date(yyyyMMdd).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentDay = Math.min(Math.max(dayOffset + 1, 1), 24);

  const isBeforeStart = new Date(yyyyMMdd) < startDate;
  const isAfterEnd = new Date(yyyyMMdd) > endDate;

  // Générer les 24 jours
  const days = Array.from({ length: 24 }).map((_, i) => {
    const day = i + 1;
    const isUnlocked = day < currentDay;
    const isToday = day === currentDay;
    
    return {
      day,
      photo: mockDayData.find(d => d.day === day)?.photo,
      message: mockDayData.find(d => d.day === day)?.message,
      drawing: mockDayData.find(d => d.day === day)?.drawing,
      music: mockDayData.find(d => d.day === day)?.music,
      isUnlocked,
      isToday
    };
  });

  const handleDayClick = (day: number) => {
    const dayData = days.find(d => d.day === day);
    if (dayData && (dayData.isUnlocked || dayData.isToday)) {
      setSelectedDay(day);
    }
  };

  const selectedDayContent = selectedDay ? (days.find(d => d.day === selectedDay) as any) : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-600 via-green-600 to-red-600 relative overflow-hidden pt-20">
      <Header />
      {/* Effet de neige décoratif en arrière-plan */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/snowflakes.svg')] animate-snow"></div>
      </div>

      {/* Flocons de neige animés */}
      <div className="snowflakes absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="snowflake absolute text-white opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 2}s`,
              fontSize: `${Math.random() * 10 + 10}px`
            }}
          >
            ❄
          </div>
        ))}
      </div>

      {/* Contenu principal */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="mx-auto max-w-6xl px-6 py-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
              <span>🎅</span>
              <span>ID: {params.publicId}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl">
              🎄 Calendrier de l'Avent 🎁
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-semibold drop-shadow-lg">
              Un cadeau personnalisé créé rien que pour toi
            </p>
          </div>
        </div>

        {/* Messages d'état */}
        {isBeforeStart && (
          <div className="mx-auto max-w-4xl px-6 py-12">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center">
              <div className="text-8xl mb-6">🎅</div>
              <h2 className="text-4xl font-bold mb-4">La magie commence bientôt !</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Reviens le <span className="font-bold text-red-600">1er décembre 2025</span> pour ouvrir la première case de ton calendrier de l'Avent personnalisé.
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-green-500 text-white rounded-full font-bold">
                <span>⏰</span>
                <span>Patience... La surprise en vaut la peine !</span>
              </div>
            </div>
          </div>
        )}

        {isAfterEnd && (
          <div className="mx-auto max-w-4xl px-6 py-12">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center">
              <div className="text-8xl mb-6">🎊</div>
              <h2 className="text-4xl font-bold mb-4">Le calendrier est terminé !</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Tu peux toujours revoir tous les jours et te replonger dans ces beaux souvenirs.
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-green-500 text-white rounded-full font-bold">
                <span>✨</span>
                <span>Joyeuses fêtes !</span>
              </div>
            </div>
          </div>
        )}

        {/* Calendrier actif */}
        {!isBeforeStart && !isAfterEnd && (
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
              {/* En-tête du calendrier */}
              <div className="bg-gradient-to-r from-red-500 to-green-500 text-white px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Décembre 2025</h2>
                    <p className="text-white/90">Ouvre une case par jour</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black">{currentDay}</div>
                    <div className="text-sm">Jour actuel</div>
                  </div>
                </div>
              </div>

              {/* Grille du calendrier */}
              <CalendarGrid days={days} onDayClick={handleDayClick} />

              {/* Légende */}
              <div className="px-8 py-6 bg-gradient-to-r from-red-50 to-green-50 dark:from-red-950 dark:to-green-950 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
                      🎁
                    </div>
                    <span>Aujourd'hui</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                      ✨
                    </div>
                    <span>Débloqué</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                      🔒
                    </div>
                    <span>À venir</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Message d'encouragement */}
            <div className="mt-8 text-center">
              <p className="text-white text-lg font-semibold drop-shadow-lg">
                ✨ Chaque jour apporte une nouvelle surprise ! ✨
              </p>
            </div>
          </div>
        )}

        {/* Modal pour afficher le contenu du jour */}
        <DayModal
          isOpen={selectedDay !== null}
          onClose={() => setSelectedDay(null)}
          content={selectedDayContent}
        />

        {/* Footer */}
        <footer className="relative z-10 py-8 text-center text-white/80 text-sm">
          <p>Fait avec ❤️ pour toi</p>
          <p className="mt-2">Calendrier de l'Avent personnalisé</p>
        </footer>
      </div>
    </main>
  );
}
