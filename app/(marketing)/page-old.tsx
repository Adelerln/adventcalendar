"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import Header from "@/components/Header";
import { sparkleRandom } from "@/lib/sparkle-random";

const steps = [
  {
    title: "1 — Choisis le type de calendrier que tu préfères offrir.",
    description: "Sélectionne l’univers et la présentation qui lui ressemblent.",
  },
  {
    title: "2 — Remplis les 24 cadeaux quotidiens.",
    description: "Glisse textes, photos ou audios pour chaque intention.",
  },
  {
    title: "3 — La personne receveuse verra son cadeau tous les matins.",
    description: "Un nouveau souvenir apparaît chaque aube de décembre.",
  },
] as const;

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
          background: 'linear-gradient(180deg, #8B0000 0%, #660000 40%, #4a0000 70%, #2d0000 100%)',
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
          {[...Array(150)].map((_, i) => {
            const size = sparkleRandom(i, 3) * 6 + 2;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  top: `${sparkleRandom(i, 1) * 100}%`,
                  left: `${sparkleRandom(i, 2) * 100}%`,
                  width: size,
                  height: size,
                  background: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#fcd34d' : '#ffffff',
                  boxShadow: '0 0 20px currentColor',
                }}
                animate={{
                  opacity: [0.1, 1, 0.1],
                  scale: [0.8, 2, 0.8],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 1 + sparkleRandom(i, 4) * 1.5,
                  repeat: Infinity,
                  delay: sparkleRandom(i, 5),
                  ease: "easeInOut",
                }}
              />
            );
          })}
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

      {/* Hero */}
      <section className="relative min-h-screen flex items-stretch overflow-hidden">
        <div
          className="absolute inset-0 bg-cover z-10"
          style={{
            backgroundImage: "url(/advent_calendar.png)",
            backgroundPosition: "calc(100% + 140px) center",
            backgroundSize: "110% auto",
          }}
        />
        <div className="relative z-20 flex flex-col w-full gap-10 px-6 lg:px-16 pt-32 pb-16">
          <div className="w-full lg:w-2/5 max-w-2xl space-y-8 text-white drop-shadow-[0_25px_60px_rgba(0,0,0,0.85)]">
            <motion.p 
              className="uppercase tracking-[.5em] text-2xl text-white/90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Noël 2025
            </motion.p>
            <motion.div 
              className="space-y-4 text-4xl sm:text-6xl lg:text-7xl leading-tight uppercase [text-shadow:0_30px_70px_rgba(0,0,0,0.85)]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex flex-wrap gap-x-8 pl-12 sm:pl-24">
                <span className="tracking-[0.5em] whitespace-nowrap">FAIS</span>
              </div>
              <span className="block ml-20 sm:ml-40 tracking-[0.5em] text-4xl sm:text-5xl lg:text-[2.0rem]">
                ton propre
              </span>
              <span className="block ml-10 sm:pl-24 tracking-[0.5em]">CALENDRIER</span>
              <div className="ml-16 sm:ml-36 space-y-2">
                <span className="block tracking-[0.5em] text-4xl sm:text-5xl lg:text-[2.0rem]">
                  DE
                </span>
                <span className="block tracking-[0.5em]">L&rsquo;AVENT</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Étapes dynamiques */}
      <section className="relative py-20 text-white" style={{ background: 'rgba(143, 139, 136, 0.5)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <p className="uppercase tracking-[0.4em] text-2xl text-white/80">Processus</p>
            <h2 className="text-4xl sm:text-5xl">Trois étapes simples</h2>
          </div>

          <div className="space-y-8 text-center">
            {steps.map((step, index) => (
              <motion.div 
                key={step.title} 
                className="transform transition-transform duration-200 ease-in-out hover:scale-105"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <p className="text-2xl sm:text-3xl leading-tight">{step.title}</p>
                <p className="text-base text-white/95">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
