"use client";

import { useEffect } from "react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-red-500 to-green-500 text-white px-6 py-4 rounded-t-3xl flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            🎄 Jour {content.day} 🎁
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-2xl transition-all"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Photo */}
          {content.photo && (
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={content.photo} 
                alt={`Jour ${content.day}`}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Message */}
          {content.message && (
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 rounded-2xl p-6 border-2 border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <span className="text-3xl">💌</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 text-red-800 dark:text-red-200">Message du cœur</h3>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {content.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Drawing */}
          {content.drawing && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">🎨</span>
                <h3 className="font-bold text-lg text-purple-800 dark:text-purple-200">Dessin personnalisé</h3>
              </div>
              <div className="rounded-xl overflow-hidden bg-white dark:bg-gray-900 p-4">
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
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-3xl">🎵</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-green-800 dark:text-green-200">
                    {content.musicTitle || "Musique du jour"}
                  </h3>
                </div>
              </div>
              
              {/* Vérifier si c'est un lien Spotify */}
              {content.music.includes('spotify.com') ? (
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <iframe
                    src={content.music.replace('open.spotify.com/track/', 'open.spotify.com/embed/track/')}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="encrypted-media"
                    title="Spotify player"
                    className="rounded-xl"
                  ></iframe>
                </div>
              ) : (
                /* Fallback pour les fichiers audio classiques */
                <audio 
                  controls 
                  className="w-full"
                  src={content.music}
                >
                  Votre navigateur ne supporte pas la lecture audio.
                </audio>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900 px-6 py-4 rounded-b-3xl flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-green-500 text-white rounded-full font-bold hover:shadow-lg transition-all"
          >
            Fermer ✨
          </button>
        </div>
      </div>
    </div>
  );
}
