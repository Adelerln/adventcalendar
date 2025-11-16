"use client";

import { useState } from "react";
import Header from "@/components/Header";
import GoldenEnvelopeTree from "@/components/GoldenEnvelopeTree";
import RedSilkEnvelope from "@/components/RedSilkEnvelope";

// Données d'exemple pour le calendrier de démonstration
const mockCalendarData = [
  { day: 1, photo: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400", message: "Notre premier Noël ensemble ❤️", drawing: null, music: null },
  { day: 2, photo: null, message: "Je pense à toi chaque jour... Tu illumines ma vie comme les guirlandes illuminent le sapin ! 🎄✨", drawing: null, music: null },
  { day: 3, photo: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400", message: "Ce moment magique", drawing: null, music: null },
  { day: 4, photo: null, message: "4 jours de décembre... 4 raisons de sourire. Tu es ma plus belle raison ! 💖", drawing: null, music: null },
  { day: 5, photo: null, message: null, drawing: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23fff' width='200' height='200'/%3E%3Ctext x='100' y='100' text-anchor='middle' fill='%23e63946' font-size='60' font-family='Arial'%3E❤️%3C/text%3E%3C/svg%3E", music: null },
  { day: 6, photo: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=400", message: "Souvenirs de neige ❄️", drawing: null, music: null },
  { day: 7, photo: null, message: "Une semaine déjà ! Chaque jour avec toi est un cadeau 🎁", drawing: null, music: null },
  { day: 8, photo: "https://images.unsplash.com/photo-1544273677-95fb17c8ca3b?w=400", message: "Les lumières de la ville", drawing: null, music: null },
  { day: 9, photo: null, message: "9 jours... 9 sourires... 9 moments précieux à tes côtés 💫", drawing: null, music: null },
  { day: 10, photo: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400", message: "Douceur hivernale", drawing: null, music: null },
  { day: 11, photo: null, message: "Tu es ma plus belle aventure ! 🌟", drawing: null, music: null },
  { day: 12, photo: "https://images.unsplash.com/photo-1512916206820-91b2da6145b4?w=400", message: "Ambiance festive 🎊", drawing: null, music: null },
  { day: 13, photo: null, message: "À mi-chemin de Noël... et je t'aime de plus en plus ! 💝", drawing: null, music: null },
  { day: 14, photo: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400", message: "Chocolat chaud ensemble ☕", drawing: null, music: null },
  { day: 15, photo: null, message: "15 jours de bonheur... et ce n'est que le début ! ✨", drawing: null, music: null },
  { day: 16, photo: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400", message: "Paysage hivernal", drawing: null, music: null },
  { day: 17, photo: null, message: "Plus que 7 jours avant Noël ! Tu es mon plus beau cadeau 🎁❤️", drawing: null, music: null },
  { day: 18, photo: "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=400", message: "Magie des fêtes", drawing: null, music: null },
  { day: 19, photo: null, message: "5 jours... Mon cœur bat la chamade à l'idée de passer Noël avec toi ! 💓", drawing: null, music: null },
  { day: 20, photo: "https://images.unsplash.com/photo-1514897575457-c4db467cf78e?w=400", message: "Moments précieux", drawing: null, music: null },
  { day: 21, photo: null, message: "3 jours avant le grand jour ! Tu rends tout magique ✨🎄", drawing: null, music: null },
  { day: 22, photo: "https://images.unsplash.com/photo-1545278452-7c60720592da?w=400", message: "Décorations scintillantes", drawing: null, music: null },
  { day: 23, photo: null, message: "Demain c'est Noël ! J'ai tellement hâte de le célébrer avec toi ! 🎅❤️", drawing: null, music: null },
  { day: 24, photo: "https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=400", message: "Joyeux Noël mon amour ! 🎄❤️🎁", drawing: null, music: null },
];

export default function DashboardPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Transformer les données pour le format attendu par ChristmasTreeCarousel
  const days = mockCalendarData.map((data) => ({
    day: data.day,
    isUnlocked: true, // Tous les jours débloqués pour la démo
    isToday: false,
    photo: data.photo,
    message: data.message,
    drawing: data.drawing,
    music: data.music,
  }));

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  const selectedDayContent = selectedDay
    ? mockCalendarData.find((d) => d.day === selectedDay) ?? null
    : null;
  return (
    <>
      <Header />
      <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-red-800">
        <GoldenEnvelopeTree days={days} onDayClick={handleDayClick} />
      </main>
    </>
  );
}
