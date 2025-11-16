"use client";

import { useState } from "react";
import clsx from "clsx";

type DayContent = {
  day: number;
  photo?: string | null;
  message?: string | null;
  drawing?: string | null;
  music?: string | null;
  musicTitle?: string | null;
};

type RedSilkEnvelopeProps = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  content: DayContent | null;
};

export default function RedSilkEnvelope({ isOpen, onOpen, onClose, content }: RedSilkEnvelopeProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [showContent, setShowContent] = useState(false);

  if (!isOpen || !content) return null;

  const handleEnvelopeClick = () => {
    if (showContent) return; // Déjà ouvert
    
    setIsOpening(true);
    // longer, smoother opening with scale and fade
    setTimeout(() => {
      setShowContent(true);
    }, 900); // timing tuned for snappier reveal
  };

  const handleClose = () => {
    setShowContent(false);
    setIsOpening(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {!showContent ? (
        // Enveloppe rouge en soie avec ruban doré
        <div
          onClick={handleEnvelopeClick}
          className={clsx(
            "relative cursor-pointer transition-all",
            isOpening ? "scale-105 opacity-0" : "scale-100 opacity-100 hover:scale-105"
          )}
          style={{ transitionDuration: "700ms" }}
        >
          <div className="relative w-96 h-64">
            {/* Ruban doré horizontal */}
            <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-12 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20" />
            </div>

            {/* Ruban doré vertical */}
            <div className="absolute left-1/2 -translate-x-1/2 inset-y-0 w-12 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-black/20" />
            </div>

            {/* Nœud doré au centre */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="relative w-20 h-20">
                {/* Boucles du nœud */}
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-2xl border-4 border-yellow-300" />
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-2xl border-4 border-yellow-300" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 shadow-xl border-2 border-yellow-400 z-10" />
                
                {/* Effet brillant */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-white/60 rounded-full blur-sm animate-shimmer" />
              </div>
            </div>

            {/* Enveloppe rouge en soie */}
            <div className="absolute inset-0 -z-10">
              {/* Rabat supérieur (fermé) */}
              <div 
                className={clsx(
                  "absolute top-0 left-1/2 -translate-x-1/2 transition-all",
                  "w-0 h-0 border-l-[192px] border-r-[192px] border-t-[140px]",
                  "border-l-transparent border-r-transparent",
                  isOpening 
                    ? "border-t-red-700 -translate-y-24 opacity-0 rotate-[6deg]" 
                    : "border-t-red-800"
                )}
                style={{
                  filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.4))",
                  transitionDuration: "900ms",
                }}
              >
                {/* Texture soie */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/40 via-transparent to-red-900/40 pointer-events-none" />
              </div>

              {/* Corps de l'enveloppe */}
              <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-lg shadow-2xl">
                {/* Texture soie brillante */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/30 rounded-lg" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3)_0%,transparent_50%)] rounded-lg" />
                
                {/* Motif de soie */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-xl" />
                  <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-lg" />
                </div>
              </div>
            </div>

            {/* Texte indicatif */}
            {!isOpening && (
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center">
                <p className="text-white text-lg font-bold drop-shadow-lg animate-pulse">
                  ✨ Cliquez pour ouvrir ✨
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Contenu en plein écran
        <div className="w-full h-full flex items-center justify-center animate-scaleIn">
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full p-8">
            {/* Bouton fermer */}
            <button
              onClick={handleClose}
              className="absolute top-8 right-8 z-20 w-14 h-14 rounded-full bg-white/90 hover:bg-white text-gray-800 font-bold text-2xl shadow-2xl border-2 border-gray-300 transition-all hover:scale-110"
            >
              ✕
            </button>

            {/* Affichage du contenu */}
            <div className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              {/* Header avec jour */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-6">
                <h2 className="text-4xl font-bold text-center">
                  🎄 Jour {content.day} 🎁
                </h2>
              </div>

              {/* Contenu principal */}
              <div className="flex-1 overflow-y-auto p-8">
                {/* Photo en grand */}
                {content.photo && (
                  <div className="mb-8">
                    <img
                      src={content.photo}
                      alt={`Jour ${content.day}`}
                      className="w-full h-auto max-h-[60vh] object-contain rounded-2xl shadow-xl"
                    />
                  </div>
                )}

                {/* Dessin en grand */}
                {content.drawing && (
                  <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl">🎨</span>
                      <h3 className="text-2xl font-bold text-purple-800">Dessin personnalisé</h3>
                    </div>
                    <img
                      src={content.drawing}
                      alt="Dessin"
                      className="w-full h-auto max-h-[50vh] object-contain rounded-xl"
                    />
                  </div>
                )}

                {/* Message */}
                {content.message && (
                  <div className="mb-8 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 border-2 border-red-200">
                    <div className="flex items-start gap-4 mb-4">
                      <span className="text-5xl">💌</span>
                      <h3 className="text-2xl font-bold text-red-800">Message du cœur</h3>
                    </div>
                    <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {content.message}
                    </p>
                  </div>
                )}

                {/* Musique */}
                {content.music && (
                  <div className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-5xl">🎵</span>
                      <h3 className="text-2xl font-bold text-green-800">
                        {content.musicTitle || "Musique du jour"}
                      </h3>
                    </div>
                    <audio
                      controls
                      className="w-full h-16"
                      src={content.music}
                      autoPlay
                    >
                      Votre navigateur ne supporte pas la lecture audio.
                    </audio>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
