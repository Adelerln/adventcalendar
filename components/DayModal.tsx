"use client";

import { useEffect } from "react";
import { playOpeningSound } from "@/lib/opening-sound";

type DayContent = {
  day: number;
  photo?: string | null;
  message?: string | null;
  drawing?: string | null;
  music?: string | null;
  musicTitle?: string | null;
};

type DayModalProps = {
  isOpen: boolean;
  onClose: () => void;
  content: DayContent | null;
};

export default function DayModal({ isOpen, onClose, content }: DayModalProps) {
  // Jouer le son d'ouverture
  useEffect(() => {
    if (isOpen) {
      playOpeningSound();
    }
  }, [isOpen]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-red-500 to-green-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl sm:rounded-t-3xl flex items-center justify-between">
          <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
            🎄 Jour {content.day} 🎁
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xl sm:text-2xl transition-all flex-shrink-0"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Photo */}
          {content.photo && (
            <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={content.photo} 
                alt={`Jour ${content.day}`}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Message */}
          {content.message && (
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-red-200 dark:border-red-800">
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl flex-shrink-0">💌</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg mb-2 text-red-800 dark:text-red-200">Message du cœur</h3>
                  <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {content.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Drawing */}
          {content.drawing && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-amber-200/70 dark:border-amber-800/70 shadow-lg">
              <div className="flex items-start gap-2 sm:gap-3 mb-3">
                <span className="text-2xl sm:text-3xl flex-shrink-0">🎨</span>
                <h3 className="font-bold text-base sm:text-lg text-amber-800 dark:text-amber-100">Dessin personnalisé</h3>
              </div>
              <div className="rounded-xl overflow-hidden bg-white dark:bg-gray-900 p-2 sm:p-4">
                <img 
                  src={content.drawing} 
                  alt="Dessin"
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}

          {/* Music */}
          {content.music && (
            <div className="bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-amber-950 dark:to-emerald-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-amber-200/70 dark:border-amber-800/70 shadow-lg">
              <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl flex-shrink-0">🎵</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-emerald-900 dark:text-emerald-100">
                    Musique du jour
                  </h3>
                </div>
              </div>
              
              {/* Message personnel si présent */}
              {content.musicTitle && (
                <div className="mb-4 p-3 sm:p-4 bg-white/60 dark:bg-black/20 rounded-lg border border-amber-200/60 dark:border-amber-700/60">
                  <p className="text-sm sm:text-base text-emerald-900 dark:text-emerald-100 italic whitespace-pre-wrap">
                    "{content.musicTitle}"
                  </p>
                </div>
              )}
              
              {/* Vérifier si c'est un lien Spotify */}
              {content.music.includes('spotify.com') ? (
                <div className="rounded-xl overflow-hidden shadow-lg bg-black">
                  <iframe
                    src={content.music.replace('open.spotify.com/track/', 'open.spotify.com/embed/track/') + '?theme=0'}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="encrypted-media"
                    title="Spotify player"
                    className="rounded-xl"
                  ></iframe>
                </div>
              ) : isAudioPlayable(content.music) ? (
                /* Fallback pour les fichiers audio classiques */
                <audio 
                  controls 
                  className="w-full rounded-lg"
                  src={content.music}
                  preload="metadata"
                >
                  Votre navigateur ne supporte pas la lecture audio.
                </audio>
              ) : (
                <p className="text-sm text-emerald-900 dark:text-emerald-100 italic">
                  Fichier audio indisponible ou lien invalide.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900 px-4 sm:px-6 py-3 sm:py-4 rounded-b-2xl sm:rounded-b-3xl flex justify-center">
          <button
            onClick={onClose}
            className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-red-500 to-green-500 text-white rounded-full font-bold hover:shadow-lg transition-all"
          >
            Fermer ✨
          </button>
        </div>
      </div>
    </div>
  );
}

function isAudioPlayable(src: string) {
  if (!src) return false;
  const lower = src.toLowerCase();
  return lower.startsWith("http") || lower.startsWith("data:audio") || lower.startsWith("blob:");
}
