"use client";

import Header from "@/components/Header";
import Envelope from "@/components/Envelope";

// Données d'exemple pour le calendrier de démonstration
const mockCalendarData = [
  { day: 1, type: "photo" as const, content: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400", title: "Notre premier Noël ensemble ❤️" },
  { day: 2, type: "message" as const, content: "Je pense à toi chaque jour... Tu illumines ma vie comme les guirlandes illuminent le sapin ! 🎄✨" },
  { day: 3, type: "photo" as const, content: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400", title: "Ce moment magique" },
  { day: 4, type: "message" as const, content: "4 jours de décembre... 4 raisons de sourire. Tu es ma plus belle raison ! 💖" },
  { day: 5, type: "drawing" as const, content: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23fff' width='200' height='200'/%3E%3Ctext x='100' y='100' text-anchor='middle' fill='%23e63946' font-size='60' font-family='Arial'%3E❤️%3C/text%3E%3C/svg%3E" },
  { day: 6, type: "photo" as const, content: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=400", title: "Souvenirs de neige ❄️" },
  { day: 7, type: "message" as const, content: "Une semaine déjà ! Chaque jour avec toi est un cadeau 🎁" },
  { day: 8, type: "photo" as const, content: "https://images.unsplash.com/photo-1544273677-95fb17c8ca3b?w=400", title: "Les lumières de la ville" },
  { day: 9, type: "message" as const, content: "9 jours... 9 sourires... 9 moments précieux à tes côtés 💫" },
  { day: 10, type: "photo" as const, content: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400", title: "Douceur hivernale" },
  { day: 11, type: "message" as const, content: "Tu es ma plus belle aventure ! 🌟" },
  { day: 12, type: "photo" as const, content: "https://images.unsplash.com/photo-1512916206820-91b2da6145b4?w=400", title: "Ambiance festive 🎊" },
  { day: 13, type: "message" as const, content: "À mi-chemin de Noël... et je t'aime de plus en plus ! 💝" },
  { day: 14, type: "photo" as const, content: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400", title: "Chocolat chaud ensemble ☕" },
  { day: 15, type: "message" as const, content: "15 jours de bonheur... et ce n'est que le début ! ✨" },
  { day: 16, type: "photo" as const, content: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400", title: "Paysage hivernal" },
  { day: 17, type: "message" as const, content: "Plus que 7 jours avant Noël ! Tu es mon plus beau cadeau 🎁❤️" },
  { day: 18, type: "photo" as const, content: "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=400", title: "Magie des fêtes" },
  { day: 19, type: "message" as const, content: "5 jours... Mon cœur bat la chamade à l'idée de passer Noël avec toi ! 💓" },
  { day: 20, type: "photo" as const, content: "https://images.unsplash.com/photo-1514897575457-c4db467cf78e?w=400", title: "Moments précieux" },
  { day: 21, type: "message" as const, content: "3 jours avant le grand jour ! Tu rends tout magique ✨🎄" },
  { day: 22, type: "photo" as const, content: "https://images.unsplash.com/photo-1545278452-7c60720592da?w=400", title: "Décorations scintillantes" },
  { day: 23, type: "message" as const, content: "Demain c'est Noël ! J'ai tellement hâte de le célébrer avec toi ! 🎅❤️" },
  { day: 24, type: "photo" as const, content: "https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=400", title: "Joyeux Noël mon amour ! 🎄❤️🎁" },
];

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 dark:from-red-950 dark:via-gray-900 dark:to-green-950 px-6 py-12 pt-24">
        <div className="mx-auto max-w-7xl">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-clip-text text-transparent">
              Calendrier de l'Avent Exemple
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
              Cliquez sur les enveloppes pour découvrir les surprises ! 🎁
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Voici à quoi ressemblera votre calendrier personnalisé
            </p>
          </div>

          {/* Grille d'enveloppes - 24 jours */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
            {mockCalendarData.map((data) => (
              <Envelope key={data.day} day={data.day} content={data} />
            ))}
          </div>

          {/* Call to action */}
          <div className="bg-gradient-to-r from-red-600 to-green-600 rounded-3xl p-8 text-center text-white shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">Prêt à créer le vôtre ? 🎄</h2>
            <p className="text-lg mb-6 opacity-90">
              Personnalisez chaque jour avec vos propres photos, messages, dessins et musiques
            </p>
            <a 
              href="/pricing" 
              className="inline-block px-8 py-4 bg-white text-red-600 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              Choisir mon forfait
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

