"use client";

import { useState } from "react";

type EnvelopeContent = {
  day: number;
  type: "photo" | "music" | "message" | "drawing";
  content: string;
  title?: string;
};

type Props = {
  day: number;
  content: EnvelopeContent;
};

export default function Envelope({ day, content }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative group w-24 sm:w-28 md:w-32 lg:w-36">
      {/* Enveloppe fermée */}
      <div
        onClick={handleClick}
        className={`cursor-pointer transition-all duration-500 ${
          isOpen ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
        }`}
      >
        <div className="relative w-full aspect-square">
          <div className="absolute inset-0 rounded-2xl border-2 border-white bg-transparent transition-colors duration-300 group-hover:bg-white group-hover:shadow-[0_15px_35px_rgba(0,0,0,0.15)]" />

          {/* Numéro du jour */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shadow-lg border border-white">
              <span className="text-2xl sm:text-3xl font-black text-black">{day}</span>
            </div>
          </div>

          {/* Indication hover */}
          <div className="absolute bottom-2 inset-x-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs font-semibold text-black bg-white/60 px-2 py-1 rounded-full">
              Cliquer pour ouvrir
            </span>
          </div>
        </div>
      </div>

      {/* Contenu dévoilé */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="relative w-full h-full bg-white rounded-lg shadow-2xl border-2 border-white/80 overflow-hidden animate-fadeIn text-black">
          {/* Bouton fermer */}
          <button
            onClick={handleClick}
            className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/80 hover:bg-white text-black rounded-full flex items-center justify-center font-bold shadow-lg border border-black/10 transition-colors"
          >
            ✕
          </button>

          {/* Numéro petit en haut */}
          <div className="absolute top-2 left-2 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow">
            {day}
          </div>

          <div className="w-full h-full p-4 flex flex-col items-center justify-center">
            {/* Photo */}
            {content.type === "photo" && (
              <div className="w-full h-full flex flex-col gap-2">
                <div className="flex-1 relative rounded-lg overflow-hidden">
                  <img
                    src={content.content}
                    alt={`Jour ${day}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                {content.title && (
                  <p className="text-xs text-center text-black font-medium">
                    {content.title}
                  </p>
                )}
              </div>
            )}

            {/* Message */}
            {content.type === "message" && (
              <div className="w-full h-full flex flex-col items-center justify-center p-3">
                <div className="text-6xl mb-3">💌</div>
                <p className="text-center text-sm leading-relaxed text-black font-medium overflow-y-auto max-h-full">
                  {content.content}
                </p>
              </div>
            )}

            {/* Musique */}
            {content.type === "music" && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <div className="text-6xl animate-bounce">🎵</div>
                <p className="text-center text-sm font-bold text-black">
                  {content.title || "Musique du jour"}
                </p>
                <audio controls className="w-full max-w-[200px]" src={content.content}>
                  Votre navigateur ne supporte pas l&rsquo;audio.
                </audio>
              </div>
            )}

            {/* Dessin */}
            {content.type === "drawing" && (
              <div className="w-full h-full flex flex-col gap-2">
                <div className="text-3xl text-center">🎨</div>
                <div className="flex-1 relative rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={content.content}
                    alt={`Dessin du jour ${day}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
