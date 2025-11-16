"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type DayBox = {
  day: number;
  isUnlocked: boolean;
  isToday: boolean;
  photo?: string | null;
  message?: string | null;
  drawing?: string | null;
  music?: string | null;
};

type GoldenEnvelopeTreeProps = {
  days: DayBox[];
  onDayClick: (day: number) => void;
  hideBackground?: boolean; // Option pour masquer le fond
};

// Disposition en grille 6x4 (24 cases)
const GRID_LAYOUT = [
  [1, 2, 3, 4, 5, 6],
  [7, 8, 9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18],
  [19, 20, 21, 22, 23, 24],
];

// Confetti component
function Confetti({ trigger }: { trigger: boolean }) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; rotation: number; color: string; delay: number }>>([]);

  useEffect(() => {
    if (trigger) {
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * -100,
        rotation: Math.random() * 360,
        color: ['#fbbf24', '#f59e0b', '#ef4444', '#dc2626', '#fcd34d'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.3,
      }));
      setConfetti(newConfetti);
      
      setTimeout(() => setConfetti([]), 3000);
    }
  }, [trigger]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {confetti.map((c) => (
        <motion.div
          key={c.id}
          className="absolute top-1/2 left-1/2 w-3 h-3 rounded-sm"
          style={{ backgroundColor: c.color }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{
            x: c.x * 8,
            y: c.y * 8 + 800,
            rotate: c.rotation * 4,
            opacity: 0,
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: c.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export default function GoldenEnvelopeTree({ days, onDayClick, hideBackground = false }: GoldenEnvelopeTreeProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isOpened, setIsOpened] = useState(false);
  const [openedDays, setOpenedDays] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);

  const getDayData = (day: number) => days.find((d) => d.day === day) || { day, isUnlocked: false, isToday: false };

  const handleEnvelopeClick = (day: number) => {
    const dayData = getDayData(day);
    if (!dayData.isUnlocked && !dayData.isToday) return;

    setSelectedDay(day);
    setIsOpened(openedDays.has(day));
    onDayClick(day);
  };

  const handleOpenEnvelope = () => {
    if (selectedDay) {
      setOpenedDays(prev => new Set(prev).add(selectedDay));
      setIsOpened(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
    }
  };

  const handleClose = () => {
    setSelectedDay(null);
  };

  const selectedContent = selectedDay ? getDayData(selectedDay) : null;

  return (
    <div 
      className={`relative w-full overflow-hidden flex items-center justify-center ${hideBackground ? 'py-4 px-2' : 'min-h-screen py-8 px-4'}`}
      style={hideBackground ? {} : {
        background: 'linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)',
      }}
    >
      {/* Texture pointillée comme sur l'image */}
      {!hideBackground && (
        <div className="absolute inset-0 pointer-events-none opacity-30"
             style={{
               backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
               backgroundSize: '20px 20px',
             }}
        />
      )}
      
      {/* Paillettes scintillantes améliorées */}
      {!hideBackground && (
        <div className="absolute inset-0 pointer-events-none">
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
      )}
      
      {/* Effet de vignette subtil */}
      {!hideBackground && (
        <div className="absolute inset-0 pointer-events-none"
             style={{
               background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.2) 100%)',
             }}
        />
      )}

      {/* Grille d'enveloppes */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
          {GRID_LAYOUT.flat().map((day) => {
            const dayData = getDayData(day);
            const canClick = dayData.isUnlocked || dayData.isToday;
            const isOpen = openedDays.has(day);

            return (
              <motion.button
                key={day}
                onClick={() => handleEnvelopeClick(day)}
                disabled={!canClick}
                className="relative group aspect-[4/3]"
                whileHover={canClick ? { scale: 1.1 } : {}}
                whileTap={canClick ? { scale: 0.95 } : {}}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20,
                  mass: 0.5
                }}
              >
                <Envelope day={day} canClick={canClick} isOpen={isOpen} content={dayData} isPreview={hideBackground} />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Modal d'enveloppe agrandie */}
      <AnimatePresence>
        {selectedDay && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
              onClick={handleClose}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 100 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                onClick={(e) => e.stopPropagation()}
                className="relative"
              >
                {!isOpened ? (
                  <EnvelopeLarge day={selectedDay} onClick={handleOpenEnvelope} />
                ) : (
                  <EnvelopeContent content={selectedContent} onClose={handleClose} />
                )}
              </motion.div>
            </motion.div>
            <Confetti trigger={showConfetti} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Petite enveloppe dans le sapin
function Envelope({ day, canClick, isOpen, content, isPreview }: { day: number; canClick: boolean; isOpen: boolean; content: DayBox; isPreview?: boolean }) {
  // Jours spéciaux avec enveloppe rouge et ruban doré
  const isSpecialDay = [5, 15, 24].includes(day);
  
  // Taille des rubans : plus larges pour la page complète, fins pour l'aperçu
  const ribbonHorizontalClass = isPreview ? "h-3" : "h-5";
  const ribbonVerticalClass = isPreview ? "w-3" : "w-5";
  const knotClass = isPreview ? "w-6 h-6" : "w-8 h-8";
  
  return (
    <div className={`relative w-full h-full ${canClick ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}>
      {/* Enveloppe avec effet brillant - dorée ou rouge selon le jour */}
      <motion.div
        className="absolute inset-0 rounded-xl shadow-xl overflow-hidden"
        style={{
          background: isSpecialDay 
            ? "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #7f1d1d 100%)"
            : "linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)",
        }}
        animate={isOpen ? {
          boxShadow: isSpecialDay
            ? [
                "0 4px 20px rgba(220,38,38,0.6), 0 0 0 4px rgba(251,191,36,0.4)",
                "0 4px 25px rgba(239,68,68,0.8), 0 0 0 5px rgba(251,191,36,0.6)",
                "0 4px 20px rgba(220,38,38,0.6), 0 0 0 4px rgba(251,191,36,0.4)",
              ]
            : [
                "0 4px 20px rgba(212,175,55,0.6), 0 0 0 4px rgba(255,215,0,0.4)",
                "0 4px 25px rgba(255,215,0,0.8), 0 0 0 5px rgba(255,215,0,0.6)",
                "0 4px 20px rgba(212,175,55,0.6), 0 0 0 4px rgba(255,215,0,0.4)",
              ]
        } : {
          boxShadow: isSpecialDay
            ? "0 4px 20px rgba(220,38,38,0.5), inset 0 1px 3px rgba(255,255,255,0.2)"
            : "0 4px 20px rgba(212,175,55,0.4), inset 0 1px 3px rgba(255,255,255,0.3)"
        }}
        transition={{ duration: 2, repeat: isOpen ? Infinity : 0 }}
      >
        {/* Effet paillettes scintillantes */}
        <motion.div 
          className="absolute inset-0 rounded-lg"
          style={{
            background: isSpecialDay
              ? "radial-gradient(circle at 30% 30%, rgba(251,191,36,0.5) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(251,191,36,0.6) 0%, transparent 50%)"
              : "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(232,213,168,0.6) 0%, transparent 50%)"
          }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Aperçu miniature du contenu si ouvert */}
        {isOpen && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center p-2 bg-white/95 backdrop-blur-sm rounded-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {content.photo ? (
              <img 
                src={content.photo} 
                alt={`Jour ${day}`} 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : content.drawing ? (
              <img 
                src={content.drawing} 
                alt={`Dessin jour ${day}`} 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : content.message ? (
              <div className="text-xs text-center text-gray-700 font-bold leading-tight px-1 line-clamp-4">
                {content.message.substring(0, 100)}...
              </div>
            ) : content.music ? (
              <span className="text-3xl">🎵</span>
            ) : (
              <span className="text-3xl">🎁</span>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Rabat enveloppe agrandi - doré ou rouge */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 z-10"
        style={{
          borderLeft: "50% solid transparent",
          borderRight: "50% solid transparent",
          borderTop: isSpecialDay ? "40% solid #991b1b" : "40% solid #c9a050",
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
        }}
      />

      {/* Ruban animé (caché si ouvert) - rouge ou doré selon le type d'enveloppe */}
      {!isOpen && (
        <>
          <motion.div 
            className={`absolute top-1/2 left-0 right-0 ${ribbonHorizontalClass} -translate-y-1/2 z-20 rounded-sm`}
            style={{
              background: isSpecialDay
                ? "linear-gradient(180deg, #f4d03f 0%, #e8c547 50%, #d4af37 100%)"
                : "linear-gradient(180deg, #dc2626 0%, #b91c1c 50%, #7f1d1d 100%)",
            }}
            animate={{
              boxShadow: isSpecialDay
                ? [
                    "0 2px 10px rgba(244,208,63,0.5)",
                    "0 2px 15px rgba(244,208,63,0.8)",
                    "0 2px 10px rgba(244,208,63,0.5)",
                  ]
                : [
                    "0 2px 10px rgba(220,38,38,0.4)",
                    "0 2px 15px rgba(220,38,38,0.6)",
                    "0 2px 10px rgba(220,38,38,0.4)",
                  ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div 
            className={`absolute top-0 bottom-0 left-1/2 ${ribbonVerticalClass} -translate-x-1/2 z-20 rounded-sm`}
            style={{
              background: isSpecialDay
                ? "linear-gradient(90deg, #f4d03f 0%, #e8c547 50%, #d4af37 100%)"
                : "linear-gradient(90deg, #dc2626 0%, #b91c1c 50%, #7f1d1d 100%)",
            }}
            animate={{
              boxShadow: isSpecialDay
                ? [
                    "0 2px 10px rgba(244,208,63,0.5)",
                    "0 2px 15px rgba(244,208,63,0.8)",
                    "0 2px 10px rgba(244,208,63,0.5)",
                  ]
                : [
                    "0 2px 10px rgba(220,38,38,0.4)",
                    "0 2px 15px rgba(220,38,38,0.6)",
                    "0 2px 10px rgba(220,38,38,0.4)",
                  ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Noeud brillant agrandi - doré ou rouge */}
          <motion.div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${knotClass} rounded-full z-30`}
            style={{
              background: isSpecialDay
                ? "radial-gradient(circle at 40% 40%, #fde68a 0%, #f4d03f 40%, #e8c547 100%)"
                : "radial-gradient(circle at 40% 40%, #ef4444 0%, #dc2626 40%, #991b1b 100%)",
            }}
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: isSpecialDay
                ? [
                    "0 0 10px rgba(244,208,63,0.7)",
                    "0 0 20px rgba(253,230,138,1)",
                    "0 0 10px rgba(244,208,63,0.7)",
                  ]
                : [
                    "0 0 10px rgba(220,38,38,0.6)",
                    "0 0 20px rgba(220,38,38,0.9)",
                    "0 0 10px rgba(220,38,38,0.6)",
                  ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </>
      )}

      {/* Numéro avec effet brillant agrandi */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center z-40"
        animate={!isOpen ? {
          textShadow: [
            "0 0 10px rgba(255,255,255,0.8)",
            "0 0 20px rgba(255,255,255,1)",
            "0 0 10px rgba(255,255,255,0.8)",
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className={`font-black text-3xl md:text-4xl ${isOpen ? 'text-gray-800' : 'text-white'}`}>
          {day}
        </span>
      </motion.div>

      {/* Indicateur spécial uniquement pour le jour 24 */}
      {day === 24 && !isOpen && (
        <motion.div
          className="absolute top-1 right-1 z-50"
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="text-2xl drop-shadow-lg">⭐</span>
        </motion.div>
      )}
    </div>
  );
}

// Grande enveloppe centrée (avant ouverture)
function EnvelopeLarge({ day, onClick }: { day: number; onClick: () => void }) {
  const [animationStage, setAnimationStage] = useState(0);

  const handleClick = () => {
    if (animationStage === 0) {
      // Démarrer l'animation d'ouverture
      setAnimationStage(1);
      // Attendre que l'animation soit finie puis ouvrir le contenu
      setTimeout(() => {
        onClick();
      }, 1400);
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className="relative w-96 h-64 cursor-pointer"
      whileHover={animationStage === 0 ? { scale: 1.05, rotate: 1 } : {}}
      whileTap={animationStage === 0 ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Enveloppe dorée grande avec effet scintillant */}
      <motion.div
        className="absolute inset-0 rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #d4af37 0%, #e8d5a8 30%, #d4af37 60%, #c9a050 100%)",
        }}
        animate={{
          boxShadow: [
            "0 20px 60px rgba(212,175,55,0.5), inset 0 2px 10px rgba(255,255,255,0.4)",
            "0 25px 70px rgba(255,215,0,0.7), inset 0 2px 10px rgba(255,255,255,0.6)",
            "0 20px 60px rgba(212,175,55,0.5), inset 0 2px 10px rgba(255,255,255,0.4)",
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Paillettes scintillantes améliorées */}
        <motion.div 
          className="absolute inset-0 rounded-3xl"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6) 0%, transparent 40%), radial-gradient(circle at 70% 70%, rgba(232,213,168,0.8) 0%, transparent 40%)"
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 1 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </motion.div>

      {/* Rabat - s'ouvre avec rotation gracieuse */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 z-10"
        style={{
          borderLeft: "192px solid transparent",
          borderRight: "192px solid transparent",
          borderTop: "140px solid #c9a050",
          filter: "drop-shadow(0 10px 25px rgba(0,0,0,0.3))",
          transformOrigin: "bottom center",
        }}
        animate={
          animationStage >= 1
            ? { rotateX: -180, opacity: 0, y: -20 }
            : { rotateX: 0, opacity: 1, y: 0 }
        }
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* Ruban rouge - animation gracieuse et fluide */}
      <motion.div
        className="absolute inset-0 z-20"
        animate={
          animationStage >= 1
            ? { y: -120, opacity: 0, scale: 0.7, rotate: -15 }
            : { y: 0, opacity: 1, scale: 1, rotate: 0 }
        }
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Ruban horizontal avec effet soyeux */}
        <motion.div 
          className="absolute top-1/2 left-0 right-0 h-12 -translate-y-1/2 shadow-xl rounded-sm"
          style={{
            background: "linear-gradient(180deg, #dc2626 0%, #b91c1c 50%, #7f1d1d 100%)",
          }}
          animate={{
            boxShadow: [
              "0 4px 20px rgba(220,38,38,0.5)",
              "0 6px 30px rgba(220,38,38,0.8)",
              "0 4px 20px rgba(220,38,38,0.5)",
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Ruban vertical avec effet soyeux */}
        <motion.div 
          className="absolute top-0 bottom-0 left-1/2 w-12 -translate-x-1/2 shadow-xl rounded-sm"
          style={{
            background: "linear-gradient(90deg, #dc2626 0%, #b91c1c 50%, #7f1d1d 100%)",
          }}
          animate={{
            boxShadow: [
              "0 4px 20px rgba(220,38,38,0.5)",
              "0 6px 30px rgba(220,38,38,0.8)",
              "0 4px 20px rgba(220,38,38,0.5)",
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Gros noeud élégant avec animation */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 2, 0, -2, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative w-24 h-24">
            {/* Boucles du noeud */}
            <motion.div 
              className="absolute top-0 left-0 w-20 h-20 rounded-full shadow-2xl"
              style={{
                background: "radial-gradient(circle at 30% 30%, #ef4444 0%, #dc2626 50%, #7f1d1d 100%)",
              }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(220,38,38,0.6)",
                  "0 0 35px rgba(239,68,68,0.9)",
                  "0 0 20px rgba(220,38,38,0.6)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div 
              className="absolute top-0 right-0 w-20 h-20 rounded-full shadow-2xl"
              style={{
                background: "radial-gradient(circle at 70% 30%, #ef4444 0%, #dc2626 50%, #7f1d1d 100%)",
              }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(220,38,38,0.6)",
                  "0 0 35px rgba(239,68,68,0.9)",
                  "0 0 20px rgba(220,38,38,0.6)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            {/* Centre du noeud */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full shadow-xl z-10"
                 style={{
                   background: "radial-gradient(circle at 40% 40%, #f87171 0%, #dc2626 40%, #991b1b 100%)",
                 }} 
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Indication élégante */}
      {animationStage === 0 && (
        <motion.div
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: [0.7, 1, 0.7], y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-white text-xl font-bold drop-shadow-2xl">✨ Cliquez pour ouvrir ✨</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// Contenu de l'enveloppe ouverte
function EnvelopeContent({ content, onClose }: { content: DayBox | null; onClose: () => void }) {
  if (!content) return null;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 50, rotateX: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ 
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.6
      }}
      onClick={(e) => e.stopPropagation()}
      className="relative max-w-4xl max-h-[90vh] w-full rounded-3xl shadow-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(120,20,20,0.95) 0%, rgba(60,10,10,0.98) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Paillettes dorées dans le fond */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              background: i % 2 === 0 ? '#fbbf24' : '#fcd34d',
              boxShadow: '0 0 10px currentColor',
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Header élégant */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="relative px-8 py-6 border-b border-white/10"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center text-2xl font-bold transition-all text-white backdrop-blur-sm z-50 cursor-pointer"
          style={{ touchAction: 'manipulation' }}
        >
          ✕
        </button>
        <motion.h2 
          className="text-4xl font-bold text-center text-white drop-shadow-lg"
          animate={{
            textShadow: [
              "0 0 20px rgba(251,191,36,0.5)",
              "0 0 30px rgba(251,191,36,0.8)",
              "0 0 20px rgba(251,191,36,0.5)",
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨ Jour {content.day} ✨
        </motion.h2>
      </motion.div>

      {/* Contenu scrollable avec fond transparent */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="overflow-y-auto p-8 max-h-[calc(90vh-100px)] relative z-10"
      >
        {content.photo && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
            className="mb-8 relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl"
                 style={{
                   boxShadow: '0 0 40px rgba(251,191,36,0.3), 0 20px 60px rgba(0,0,0,0.5)'
                 }}>
              <img 
                src={content.photo} 
                alt={`Jour ${content.day}`} 
                className="w-full h-auto max-h-[60vh] object-contain bg-gradient-to-br from-yellow-900/20 to-red-900/20" 
              />
              {/* Cadre doré brillant */}
              <div className="absolute inset-0 border-4 border-yellow-500/30 rounded-2xl pointer-events-none" />
            </div>
          </motion.div>
        )}

        {content.drawing && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
            className="mb-8 rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.15) 100%)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(168,85,247,0.3)',
              boxShadow: '0 0 30px rgba(168,85,247,0.2)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.span 
                className="text-4xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎨
              </motion.span>
              <h3 className="text-2xl font-bold text-purple-200 drop-shadow-lg">Dessin personnalisé</h3>
            </div>
            <div className="relative rounded-xl overflow-hidden"
                 style={{ boxShadow: '0 0 30px rgba(168,85,247,0.3)' }}>
              <img src={content.drawing} alt="Dessin" className="w-full h-auto max-h-[50vh] object-contain bg-white/90" />
            </div>
          </motion.div>
        )}

        {content.message && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
            className="mb-8 rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(236,72,153,0.2) 100%)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(239,68,68,0.4)',
              boxShadow: '0 0 40px rgba(239,68,68,0.3)',
            }}
          >
            <div className="flex items-start gap-4 mb-4">
              <motion.span 
                className="text-5xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                💌
              </motion.span>
              <h3 className="text-2xl font-bold text-red-200 drop-shadow-lg">Message du cœur</h3>
            </div>
            <motion.p 
              className="text-xl text-white/95 leading-relaxed whitespace-pre-wrap font-light"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
            >
              {content.message}
            </motion.p>
          </motion.div>
        )}

        {content.music && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, type: "spring" }}
            className="mb-8 rounded-2xl p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.2) 100%)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(16,185,129,0.4)',
              boxShadow: '0 0 40px rgba(16,185,129,0.3)',
            }}
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.span 
                className="text-5xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎵
              </motion.span>
              <h3 className="text-2xl font-bold text-emerald-200 drop-shadow-lg">Musique du jour</h3>
            </div>
            <audio 
              controls 
              className="w-full h-16 rounded-xl" 
              src={content.music} 
              autoPlay
              style={{
                filter: 'drop-shadow(0 4px 20px rgba(16,185,129,0.4))',
              }}
            >
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
