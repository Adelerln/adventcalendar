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
    <div className="relative group">
      {/* Enveloppe fermée */}
      <div
        onClick={handleClick}
        className={`cursor-pointer transition-all duration-500 ${
          isOpen ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
        }`}
      >
        <div className="relative w-full aspect-square">
          {/* Corps de l'enveloppe */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 rounded-lg shadow-lg border-2 border-red-300 dark:border-red-700 group-hover:shadow-xl group-hover:scale-105 transition-all">
            {/* Rabat de l'enveloppe */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-br from-red-200 to-red-300 dark:from-red-800 dark:to-red-700 clip-envelope">
              <div className="absolute inset-0 border-b-2 border-red-400 dark:border-red-600"></div>
            </div>
            
            {/* Numéro du jour */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-2 border-red-400 dark:border-red-600">
                <span className="text-3xl font-black bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">
                  {day}
                </span>
              </div>
            </div>

            {/* Indication hover */}
            <div className="absolute bottom-4 inset-x-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-semibold text-red-700 dark:text-red-300 bg-white/50 dark:bg-black/50 px-3 py-1 rounded-full">
                Cliquer pour ouvrir
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu dévoilé */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-green-400 dark:border-green-600 overflow-hidden animate-fadeIn">
          {/* Bouton fermer */}
          <button
            onClick={handleClick}
            className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg transition-colors"
          >
            ✕
          </button>

          {/* Numéro petit en haut */}
          <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow">
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
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400 font-medium">
                    {content.title}
                  </p>
                )}
              </div>
            )}

            {/* Message */}
            {content.type === "message" && (
              <div className="w-full h-full flex flex-col items-center justify-center p-3">
                <div className="text-6xl mb-3">💌</div>
                <p className="text-center text-sm leading-relaxed text-gray-700 dark:text-gray-300 font-medium overflow-y-auto max-h-full">
                  {content.content}
                </p>
              </div>
            )}

            {/* Musique */}
            {content.type === "music" && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <div className="text-6xl animate-bounce">🎵</div>
                <p className="text-center text-sm font-bold text-gray-800 dark:text-gray-200">
                  {content.title || "Musique du jour"}
                </p>
                <audio controls className="w-full max-w-[200px]" src={content.content}>
                  Votre navigateur ne supporte pas l'audio.
                </audio>
              </div>
            )}

            {/* Dessin */}
            {content.type === "drawing" && (
              <div className="w-full h-full flex flex-col gap-2">
                <div className="text-3xl text-center">🎨</div>
                <div className="flex-1 relative rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
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
