"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";

const GoldenEnvelopeTree = dynamic(() => import("@/components/GoldenEnvelopeTree"), { ssr: false });

// Flocons de neige qui tombent (version allégée)
function Snowfall() {
  const [snowflakes, setSnowflakes] = useState<
    Array<{ id: number; x: number; delay: number; duration: number; size: number; rotation: number; drift: number }>
  >([]);

  useEffect(() => {
    // Moins de particules pour limiter le coût initial
    const flakes = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 8 + Math.random() * 8,
      size: 6 + Math.random() * 6,
      rotation: Math.random() * 360,
      drift: Math.random() * 60 - 30
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute"
          style={{
            left: `${flake.x}%`,
            top: -20
          }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, flake.drift, 0],
            rotate: [flake.rotation, flake.rotation + 360],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <svg
            width={flake.size}
            height={flake.size}
            viewBox="0 0 24 24"
            fill="none"
            style={{
              filter: "drop-shadow(0 0 2px rgba(255,255,255,0.8))"
            }}
          >
            <line x1="12" y1="2" x2="12" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="4.93" y1="6.5" x2="19.07" y2="17.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="4.93" y1="17.5" x2="19.07" y2="6.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="5" x2="10" y2="7" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <line x1="12" y1="5" x2="14" y2="7" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <line x1="12" y1="19" x2="10" y2="17" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <line x1="12" y1="19" x2="14" y2="17" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <line x1="6.5" y1="8.2" x2="8.5" y2="9.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <line x1="6.5" y1="8.2" x2="7.5" y2="6.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <line x1="17.5" y1="15.8" x2="15.5" y2="14.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <line x1="17.5" y1="15.8" x2="16.5" y2="17.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <line x1="6.5" y1="15.8" x2="8.5" y2="14.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <line x1="6.5" y1="15.8" x2="7.5" y2="17.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <line x1="17.5" y1="8.2" x2="15.5" y2="9.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <line x1="17.5" y1="8.2" x2="16.5" y2="6.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
            <circle cx="12" cy="12" r="1.5" fill="white" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

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
  { day: 1, isUnlocked: true, isToday: false, photo: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400", message: "Coucou mon amour ! Je suis ravie de partager ce premier Noël à tes côtés ❤️", drawing: null, music: null },
  { day: 2, isUnlocked: true, isToday: false, photo: null, message: "Je pense à toi chaque jour... Tu illumines ma vie comme les guirlandes illuminent le sapin ! 🎄✨", drawing: null, music: null },
  { day: 3, isUnlocked: true, isToday: false, photo: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400", message: "Juste une petite occasion pour te remémorer ce souvenir... C'était l'un des plus beaux moments de ma vie 💫", drawing: null, music: null },
  { day: 4, isUnlocked: true, isToday: false, photo: null, message: "4 jours de décembre... 4 raisons de sourire. Tu es ma plus belle raison ! 💖", drawing: null, music: null },
  { day: 5, isUnlocked: true, isToday: false, photo: null, message: null, drawing: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23fff' width='200' height='200'/%3E%3Ctext x='100' y='100' text-anchor='middle' fill='%23e63946' font-size='60' font-family='Arial'%3E❤️%3C/text%3E%3C/svg%3E", music: null },
  { day: 6, isUnlocked: true, isToday: false, photo: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=400", message: "Souvenirs de neige ❄️", drawing: null, music: null },
  { day: 7, isUnlocked: true, isToday: false, photo: null, message: "Une semaine déjà ! Chaque jour avec toi est un cadeau 🎁", drawing: null, music: null },
  { day: 8, isUnlocked: true, isToday: false, photo: "https://images.unsplash.com/photo-1511407397940-d57f68e81203?w=400", message: "Les lumières de la ville", drawing: null, music: null },
  { day: 9, isUnlocked: true, isToday: false, photo: null, message: "9 jours... 9 sourires... 9 moments précieux à tes côtés 💫", drawing: null, music: null },
  { day: 10, isUnlocked: true, isToday: false, photo: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400", message: "Douceur hivernale", drawing: null, music: null },
  { day: 11, isUnlocked: true, isToday: false, photo: null, message: "Tu es ma plus belle aventure ! �", drawing: null, music: null },
  { day: 12, isUnlocked: true, isToday: false, photo: "https://images.unsplash.com/photo-1512474932049-78ac69ede12c?w=400", message: "Ambiance festive 🎊", drawing: null, music: null },
  { day: 13, isUnlocked: true, isToday: false, photo: null, message: "À mi-chemin de Noël... et je t'aime de plus en plus ! 💝", drawing: null, music: null },
  { day: 14, isUnlocked: true, isToday: false, photo: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400", message: "Chocolat chaud ensemble ☕", drawing: null, music: null },
  { day: 15, isUnlocked: true, isToday: false, photo: null, message: "15 jours de bonheur... et ce n'est que le début ! ✨", drawing: null, music: null },
  { day: 16, isUnlocked: true, isToday: false, photo: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400", message: "Paysage hivernal", drawing: null, music: null },
  { day: 17, isUnlocked: true, isToday: false, photo: null, message: "Plus que 7 jours avant Noël ! Tu es mon plus beau cadeau 🎁❤️", drawing: null, music: null },
  { day: 18, isUnlocked: true, isToday: false, photo: "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=400", message: "Magie des fêtes", drawing: null, music: null },
  { day: 19, isUnlocked: true, isToday: false, photo: null, message: "5 jours... Mon cœur bat la chamade à l'idée de passer Noël avec toi ! 💓", drawing: null, music: null },
  { day: 20, isUnlocked: true, isToday: false, photo: "https://images.unsplash.com/photo-1514897575457-c4db467cf78e?w=400", message: "Moments précieux", drawing: null, music: null },
  { day: 21, isUnlocked: true, isToday: false, photo: null, message: "3 jours avant le grand jour ! Tu rends tout magique ✨🎄", drawing: null, music: null },
  { day: 22, isUnlocked: true, isToday: false, photo: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400", message: "Décorations scintillantes", drawing: null, music: null },
  { day: 23, isUnlocked: true, isToday: false, photo: null, message: "Demain c'est Noël ! J'ai tellement hâte de le célébrer avec toi ! 🎅❤️", drawing: null, music: null },
  { day: 24, isUnlocked: true, isToday: false, photo: "https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=400", message: "Joyeux Noël mon amour ! 🎄❤️�", drawing: null, music: null },
];

function createDeterministicRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export default function MarketingHomePage() {
  const [ctaHref, setCtaHref] = useState("/pricing");
  // Force le fond transparent sur cette page
  useEffect(() => {
    document.body.style.background = 'transparent';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    if (typeof window === "undefined") return;
    const hasDraft = Object.keys(localStorage || {}).some((k) => k.startsWith("calendar_draft_"));
    setCtaHref(hasDraft ? "/calendars/new?stage=creation" : "/pricing");
  }, []);

  const sparkles = useMemo(() => {
    const rand = createDeterministicRandom(2025);
    // Moins de paillettes pour alléger le rendu initial
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      top: rand() * 100,
      left: rand() * 100,
      width: 2 + rand() * 4,
      height: 2 + rand() * 4,
      colorIndex: Math.floor(rand() * 3),
      duration: 1 + rand() * 1.5,
      delay: rand(),
    }));
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
        
        {/* Flocons de neige */}
        {isClient && <Snowfall />}
        
        {/* Paillettes scintillantes */}
        {isClient && (
          <div className="absolute inset-0">
            {sparkles.map((sparkle) => (
              <motion.div
                key={sparkle.id}
                className="absolute rounded-full"
                style={{
                  top: `${sparkle.top}%`,
                  left: `${sparkle.left}%`,
                  width: sparkle.width,
                  height: sparkle.height,
                  background: sparkle.colorIndex === 0 ? '#fbbf24' : sparkle.colorIndex === 1 ? '#fcd34d' : '#ffffff',
                  boxShadow: '0 0 20px currentColor',
                }}
                animate={{
                  opacity: [0.1, 1, 0.1],
                  scale: [0.8, 2, 0.8],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: sparkle.duration,
                  repeat: Infinity,
                  delay: sparkle.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}
        
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
      <section className="relative z-10 px-4 sm:px-6 lg:px-16 pt-16 sm:pt-24 pb-8 sm:pb-12">
        <div className="max-w-[1600px] mx-auto w-full grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Texte à gauche */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4 sm:space-y-8"
          >
            <p className="uppercase tracking-[.3em] sm:tracking-[.5em] text-sm sm:text-lg text-white/90 drop-shadow-lg">
              Noël 2025
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-2xl">
              CRÉE TON PROPRE<br />
              <span className="text-[#f5e6d3]">CALENDRIER DE L'AVENT</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-white/90 drop-shadow-lg max-w-xl">
              Offre 24 jours de surprises personnalisées avec des messages, photos, dessins et musiques
            </p>

            <a 
              href={ctaHref}
              className="inline-block px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold text-[#4a0808] rounded-full shadow-2xl hover:scale-105 transition-transform duration-300 border-2 border-[#4a0808]"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
              }}
            >
              Continuer le calendrier
            </a>
          </motion.div>

          {/* Exemple miniature à droite */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative pt-4 sm:pt-8"
          >
            <div 
              className="rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col justify-center overflow-hidden" 
              style={{
                background: 'linear-gradient(to bottom, #a52a2a 0%, #8b0000 50%, #4a0808 100%)',
                height: 'fit-content',
                maxHeight: '450px',
              }}
            >
              <div className="text-center mb-2 sm:mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white drop-shadow-2xl">
                  ESSAIE-LE
                </h3>
              </div>
              <div className="scale-75 sm:scale-90 origin-center flex items-center justify-center">
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
      <section className="relative z-10 px-4 sm:px-6 lg:px-16 pb-12 sm:pb-20 pt-8 sm:pt-16">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-center space-y-3 sm:space-y-4">
                  <div 
                    className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                    }}
                  >
                    {index + 1}
                  </div>
                  <h3 className="text-white font-bold text-lg sm:text-xl">{step.title}</h3>
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="relative z-10 py-12 sm:py-20 px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8"
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white drop-shadow-2xl">
            Prêt à créer la magie ?
          </h2>
          <a 
            href="/pricing"
            className="inline-block px-10 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-bold text-[#4a0808] rounded-full shadow-2xl hover:scale-105 transition-transform duration-300 border-2 border-[#4a0808]"
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
