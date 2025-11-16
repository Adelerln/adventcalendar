"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import RedSilkEnvelope from "./RedSilkEnvelope";

type DayBox = {
  day: number;
  isUnlocked: boolean;
  isToday: boolean;
  photo?: string | null;
  message?: string | null;
  drawing?: string | null;
  music?: string | null;
};

type ChristmasTreeCarouselProps = {
  days: DayBox[];
  onDayClick: (day: number) => void;
};

// Distribution des jours par niveau (de bas en haut) pour coller à la photo
const LEVELS: number[][] = [
  [1, 2, 3, 23, 4, 5, 6], // base (exemple, disposés autour)
  [7, 8, 9, 10, 11],
  [12, 13, 14, 15, 16],
  [17, 18, 19, 20],
  [21, 22, 23],
  [24],
  [25],
];

export default function ChristmasTreeCarousel({ days, onDayClick }: ChristmasTreeCarouselProps) {
  const getDayData = (dayNumber: number): DayBox => {
    return (
      days.find((d) => d.day === dayNumber) || {
        day: dayNumber,
        isUnlocked: false,
        isToday: false,
      }
    );
  };

  // rotation angle par niveau (de bas=0 à haut=6)
  const [rotations, setRotations] = useState<number[]>(LEVELS.map(() => 0));

  // selected / envelope state
  const [selectedContent, setSelectedContent] = useState<DayBox | null>(null);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  // Drag handling (per level)
  const dragging = useRef<{ level: number | null; startX: number; startAngle: number } | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const { level, startX, startAngle } = dragging.current;
      if (level === null) return;
      const dx = e.clientX - startX;
      const newAngle = startAngle + dx * 0.35; // sensibilité légèrement augmentée
      setRotations((r) => r.map((val, i) => (i === level ? newAngle : val)));
    };
    const onUp = () => {
      // snap to nearest house when releasing drag
      if (dragging.current) {
        const { level } = dragging.current;
        if (level !== null) {
          setRotations((r) => {
            const cur = r[level];
            const levelDays = LEVELS[level];
            const n = levelDays.length;
            const anglePer = 360 / n;
            const snapped = Math.round(cur / anglePer) * anglePer;
            return r.map((val, i) => (i === level ? snapped : val));
          });
        }
      }
      dragging.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const startDrag = (level: number, clientX: number) => {
    dragging.current = { level, startX: clientX, startAngle: rotations[level] };
  };

  const rotateBy = (level: number, delta: number) => {
    setRotations((r) => r.map((val, i) => (i === level ? val + delta : val)));
  };

  const handleHouseOpen = (day: number) => {
    const content = getDayData(day);
    setSelectedContent(content);
    // play small house-open animation before showing full-screen envelope
    setTimeout(() => setEnvelopeOpen(true), 650);
    // preserve existing external handler
    onDayClick(day);
  };

  const handleEnvelopeClose = () => {
    setEnvelopeOpen(false);
    setTimeout(() => setSelectedContent(null), 300);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto py-8 px-4" style={{ perspective: 1200 }}>
      <div className="text-center mb-6">
        <div className="inline-block text-6xl w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 shadow-xl flex items-center justify-center">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l2.39 4.85L19 8.27l-3.5 2.85L16.78 16 12 13.5 7.22 16l1.28-4.88L5 8.27l4.61-.42L12 2z" fill="#fff" />
          </svg>
        </div>
      </div>

      {/* Niveaux du plus haut (25) au plus bas */}
      <div className="flex flex-col items-center gap-6">
        {LEVELS.slice().reverse().map((levelDays, idx) => {
          const level = LEVELS.length - 1 - idx; // 0 = base
          const radius = 56 + idx * 44; // ajusté pour proportions

          return (
            <div key={level} className="relative flex flex-col items-center">
              {/* plaque circulaire (plateau) - style bois */}
              <div
                className="rounded-full relative shadow-2xl border-t border-b border-amber-700"
                style={{
                  width: radius * 6 + "px",
                  height: radius * 2 + "px",
                  background: "linear-gradient(180deg,#7a4f2a,#7f5a36)",
                  boxShadow: "inset 0 6px 20px rgba(0,0,0,0.35)",
                }}
              >
                {/* inner ring */}
                <div
                  className="absolute inset-6 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle at 50% 20%, rgba(255,255,255,0.06), transparent 40%)",
                  }}
                />
              </div>

              {/* zone interactive - houses positioned in circle */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center"
                style={{ width: radius * 6 + "px", height: radius * 2 + "px" }}
                onMouseDown={(e) => startDrag(level, e.clientX)}
                onTouchStart={(e) => startDrag(level, e.touches[0].clientX)}
              >
                  <div
                    className="relative w-full h-full"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: `rotateZ(${rotations[level]}deg)`,
                      transition: "transform 420ms cubic-bezier(.22,.9,.24,1)",
                      touchAction: "pan-y",
                    }}
                  >
                  {levelDays.map((day, i) => {
                    const angle = (360 / levelDays.length) * i;
                    const rad = (angle * Math.PI) / 180;
                    const x = Math.cos(rad) * radius * 2.2; // position sur plateau
                    const y = Math.sin(rad) * (radius * 0.16); // léger offset vertical

                    const dayData = getDayData(day);

                    return (
                      <div
                        key={day}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{ transform: `translate(${x}px, ${y}px) rotate(${-rotations[level]}deg)` }}
                      >
                        {/* small decorative pine between houses (image from public) */}
                        <div className="absolute -left-10 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.95 }}>
                          <img src="/sapin.jpeg" alt="sapin" className="w-10 h-12 object-cover rounded-md shadow-sm" />
                        </div>

                        <House
                          day={day}
                          dayData={dayData}
                          onOpen={() => handleHouseOpen(day)}
                          isSelected={selectedContent?.day === day}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* controls */}
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => rotateBy(level, -360 / Math.max(1, levelDays.length))}
                  className="w-9 h-9 rounded-full bg-white shadow border hover:scale-105"
                >
                  ←
                </button>
                <button
                  onClick={() => rotateBy(level, 360 / Math.max(1, levelDays.length))}
                  className="w-9 h-9 rounded-full bg-white shadow border hover:scale-105"
                >
                  →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* trunk */}
      <div className="flex justify-center mt-8">
        <div className="w-20 h-28 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 rounded-b-xl shadow-2xl border-2 border-amber-800" />
      </div>

      {/* Red silk envelope overlay */}
      <RedSilkEnvelope
        isOpen={envelopeOpen}
        onOpen={() => {}}
        onClose={handleEnvelopeClose}
        content={
          selectedContent
            ? {
                day: selectedContent.day,
                photo: selectedContent.photo || null,
                message: selectedContent.message || null,
                drawing: selectedContent.drawing || null,
                music: selectedContent.music || null,
                musicTitle: null,
              }
            : null
        }
      />
    </div>
  );
}

// Simple maison (visuel proche de la photo)
function House({ day, dayData, onOpen, isSelected }: { day: number; dayData: DayBox; onOpen: () => void; isSelected?: boolean }) {
  const canClick = dayData.isUnlocked || dayData.isToday;

  return (
    <button
      onClick={canClick ? onOpen : undefined}
      disabled={!canClick}
      className={clsx(
        "relative w-20 h-28 flex flex-col items-center transition-transform",
        canClick ? "cursor-pointer hover:-translate-y-1 hover:scale-105" : "opacity-60 cursor-not-allowed"
      )}
      aria-label={`Jour ${day}`}
    >
      {/* roof */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "28px solid transparent",
          borderRight: "28px solid transparent",
          borderBottom: "22px solid #d18b6a",
          filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.28))",
        }}
      />

  {/* house body */}
  <div className={clsx("w-20 h-20 bg-[#d8b48e] border-2 border-white rounded-b-md relative shadow-lg flex items-center justify-center overflow-hidden", isSelected ? "scale-105 translate-y-[-6px] shadow-2xl" : "") }>
        {/* gold ribbon */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-3 mx-4 rounded-full" style={{ background: 'linear-gradient(90deg,#e6c067,#ffd86b,#e6c067)' }} />

        <div className="bg-white w-12 h-12 flex items-center justify-center rounded-sm border-2 border-gray-300 font-black text-lg relative z-10">
          {day}
        </div>

        {/* small envelope that pops up when selected */}
        <div
          className={clsx(
            "absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-10 rounded-md overflow-hidden pointer-events-none",
            isSelected ? "opacity-100 translate-y-[-20px] scale-110" : "opacity-0 translate-y-0 scale-90"
          )}
          style={{
            transition: "all 520ms cubic-bezier(.2,.9,.25,1)",
            transformOrigin: "50% 100%",
          }}
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-md shadow-md" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[28px] border-r-[28px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-700" />
          </div>
        </div>
      </div>

      {/* small indicator */}
      <div className="absolute -top-2 -right-2 text-sm">{dayData.isUnlocked ? "✨" : dayData.isToday ? "🎁" : "🔒"}</div>
    </button>
  );
}
