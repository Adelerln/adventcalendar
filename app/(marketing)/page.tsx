"use client";

import Header from "@/components/Header";

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

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative min-h-screen flex items-stretch overflow-hidden">
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: "url(/advent_calendar.png)",
            backgroundPosition: "calc(100% + 140px) center",
            backgroundSize: "110% auto",
          }}
        />
        <div className="relative z-10 flex flex-col w-full gap-10 px-6 lg:px-16 pt-32 pb-16">
          <div className="w-full lg:w-2/5 max-w-2xl space-y-8 text-white drop-shadow-[0_18px_45px_rgba(0,0,0,0.65)]">
            <p className="uppercase tracking-[.5em] text-2xl text-white/70">Noël 2025</p>
            <div className="space-y-4 text-4xl sm:text-6xl lg:text-7xl leading-tight uppercase [text-shadow:0_25px_55px_rgba(0,0,0,0.65)]">
              <div className="flex flex-wrap gap-x-8 pl-12 sm:pl-24">
                <span className="tracking-[0.5em] whitespace-nowrap">FAIS</span>
              </div>
              <span className="block ml-20 sm:ml-40 tracking-[0.5em] text-4xl sm:text-5xl lg:text-[2.0rem]">
                ton propre
              </span>
              <span className="block ml-10 sm:ml-24 tracking-[0.5em]">CALENDRIER</span>
              <div className="ml-16 sm:ml-36 space-y-2">
                <span className="block tracking-[0.5em] text-4xl sm:text-5xl lg:text-[2.0rem]">
                  DE
                </span>
                <span className="block tracking-[0.5em]">L&rsquo;AVENT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Étapes dynamiques */}
      <section className="bg-[#8F8B88] text-white py-20">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <p className="uppercase tracking-[0.4em] text-2xl text-white/60">Processus</p>
            <h2 className="text-4xl sm:text-5xl">Trois étapes simples</h2>
          </div>

          <div className="space-y-8 text-center">
            {steps.map(step => (
              <div key={step.title} className="transform transition-transform duration-200 ease-in-out hover:scale-105">
                <p className="text-2xl sm:text-3xl leading-tight">{step.title}</p>
                <p className="text-base text-white/85">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
