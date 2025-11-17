"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import Header from "@/components/Header";
import GoldenEnvelopeTree from "@/components/GoldenEnvelopeTree";

const steps = [
  {
    title: "Choisis ton calendrier",
    description: "Sélectionne ce que tu veux mettre dans tes cadeaux quotidiens.",
  },
  {
    title: "Remplis les 24 jours",
    description: "Glisse textes, photos, dessins, audios, jeux ou vidéos IA pour chaque surprise.",
  },
  {
    title: "Partage la magie",
    description: "La personne découvre un nouveau cadeau chaque matin de décembre.",
  },
] as const;

// Données de démo pour l'exemple avec du contenu varié
const mockDays = [
  { day: 1, isUnlocked: true, isToday: false, message: "Joyeux début décembre ! 🎄", photo: null, drawing: null, music: null },
  { day: 2, isUnlocked: true, isToday: false, message: null, photo: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400", drawing: null, music: null },
  { day: 3, isUnlocked: true, isToday: false, message: "Tu me manques déjà ❤️", photo: null, drawing: null, music: null },
  { day: 4, isUnlocked: true, isToday: false, message: null, photo: null, drawing: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ctext x='50' y='100' font-size='60'%3E❄️%3C/text%3E%3C/svg%3E", music: null },
  { day: 5, isUnlocked: true, isToday: false, message: null, photo: null, drawing: null, music: "Jingle Bells 🎵" },
  { day: 6, isUnlocked: true, isToday: false, message: "Souviens-toi de ce moment magique 💫", photo: null, drawing: null, music: null },
  { day: 7, isUnlocked: true, isToday: false, message: null, photo: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=400", drawing: null, music: null },
  { day: 8, isUnlocked: true, isToday: false, message: "8 jours déjà ! ⭐", photo: null, drawing: null, music: null },
  { day: 9, isUnlocked: true, isToday: false, message: null, photo: null, drawing: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ctext x='50' y='100' font-size='60'%3E🎁%3C/text%3E%3C/svg%3E", music: null },
  { day: 10, isUnlocked: true, isToday: false, message: null, photo: null, drawing: null, music: "All I Want for Christmas 🎶" },
  { day: 11, isUnlocked: true, isToday: false, message: "Plus que 2 semaines ! 🎅", photo: null, drawing: null, music: null },
  { day: 12, isUnlocked: true, isToday: false, message: null, photo: "https://images.unsplash.com/photo-1544273677-1b31a1641eb1?w=400", drawing: null, music: null },
  { day: 13, isUnlocked: true, isToday: false, message: "Chaque jour avec toi est un cadeau 🎀", photo: null, drawing: null, music: null },
  { day: 14, isUnlocked: true, isToday: false, message: null, photo: null, drawing: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ctext x='50' y='100' font-size='60'%3E⛄%3C/text%3E%3C/svg%3E", music: null },
  { day: 15, isUnlocked: true, isToday: false, message: null, photo: null, drawing: null, music: "Let it Snow 🌨️" },
  { day: 16, isUnlocked: true, isToday: false, message: "Bientôt Noël ! 🎄", photo: null, drawing: null, music: null },
  { day: 17, isUnlocked: true, isToday: false, message: null, photo: "https://images.unsplash.com/photo-1576522509875-8dc8f8bdc8d4?w=400", drawing: null, music: null },
  { day: 18, isUnlocked: true, isToday: false, message: "Je t'aime ❤️", photo: null, drawing: null, music: null },
  { day: 19, isUnlocked: true, isToday: false, message: null, photo: null, drawing: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ctext x='50' y='100' font-size='60'%3E🌟%3C/text%3E%3C/svg%3E", music: null },
  { day: 20, isUnlocked: true, isToday: false, message: null, photo: null, drawing: null, music: "Silent Night 🕯️" },
  { day: 21, isUnlocked: true, isToday: false, message: "Plus que 4 jours ! 🎊", photo: null, drawing: null, music: null },
  { day: 22, isUnlocked: true, isToday: false, message: null, photo: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400", drawing: null, music: null },
  { day: 23, isUnlocked: true, isToday: false, message: "Demain c'est Noël ! 🎁", photo: null, drawing: null, music: null },
  { day: 24, isUnlocked: true, isToday: false, message: "Joyeux Noël mon amour ! 🎄❤️🎅", photo: null, drawing: null, music: null },
];

export default function MarketingHomePage() {
  // Force le fond transparent sur cette page
  useEffect(() => {
    document.body.style.background = 'transparent';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  return (
    <main className="min-h-screen flex flex-col relative bg-transparent">
      {/* Fond rouge pailleté festif */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)',
        }}
      >
        {/* Texture pointillée */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
        
        {/* Paillettes scintillantes */}
        <div className="absolute inset-0">
          {[...Array(150)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: Math.random() * 6 + 2,
                height: Math.random() * 6 + 2,
                background: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#fcd34d' : '#ffffff',
                boxShadow: '0 0 20px currentColor',
              }}
              animate={{
                opacity: [0.1, 1, 0.1],
                scale: [0.8, 2, 0.8],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 1 + Math.random() * 1.5,
                repeat: Infinity,
                delay: Math.random() * 1,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        
        {/* Effet de vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.2) 100%)',
          }}
        />
      </div>

      <Header />

      {/* Hero Section - Titre + Aperçu */}
      <section className="relative z-10 px-6 lg:px-16 pt-24 pb-12">
        <div className="max-w-[1600px] mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Texte à gauche */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <p className="uppercase tracking-[.5em] text-lg text-white/90 drop-shadow-lg">
              Noël 2025
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
              CRÉE TON PROPRE<br />
              <span className="text-[#f5e6d3]">CALENDRIER DE L'AVENT</span>
            </h1>
            <p className="text-base sm:text-lg text-white/90 drop-shadow-lg max-w-xl">
              Offre 24 jours de surprises personnalisées avec des messages, photos, dessins et musiques
            </p>

            <a 
              href="/pricing"
              className="inline-block px-10 py-4 text-lg font-bold text-[#4a0808] rounded-full shadow-2xl hover:scale-105 transition-transform duration-300 border-2 border-[#4a0808]"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
              }}
            >
              Commencer maintenant
            </a>
          </motion.div>

          {/* Exemple miniature à droite */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative pt-8"
          >
            <div 
              className="rounded-3xl p-5 shadow-2xl flex flex-col justify-center overflow-hidden" 
              style={{
                background: 'linear-gradient(to bottom, #a52a2a 0%, #8b0000 50%, #4a0808 100%)',
                height: 'fit-content',
                maxHeight: '550px',
              }}
            >
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-white drop-shadow-2xl">
                  ESSAIE-LE
                </h3>
              </div>
              <div className="scale-90 origin-center flex items-center justify-center">
                <GoldenEnvelopeTree 
                  days={mockDays}
                  onDayClick={(day) => console.log(`Jour ${day} cliqué`)}
                  hideBackground={true}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section des 3 étapes - Sur toute la largeur */}
      <section className="relative z-10 px-6 lg:px-16 pb-20 pt-16">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-center space-y-4">
                  <div 
                    className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                    }}
                  >
                    {index + 1}
                  </div>
                  <h3 className="text-white font-bold text-xl">{step.title}</h3>
                  <p className="text-white/80 text-base leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="relative z-10 py-20 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <h2 className="text-4xl sm:text-6xl font-bold text-white drop-shadow-2xl">
            Prêt à créer la magie ?
          </h2>
          <a 
            href="/pricing"
            className="inline-block px-12 py-5 text-xl font-bold text-[#4a0808] rounded-full shadow-2xl hover:scale-105 transition-transform duration-300 border-2 border-[#4a0808]"
            style={{
              background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
            }}
          >
            Créer mon calendrier
          </a>
        </motion.div>
      </section>
    </main>
  );
}
