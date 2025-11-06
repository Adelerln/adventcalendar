"use client";

import { useState } from "react";

type DayData = {
  day: number;
  photo?: string | null;
  message?: string | null;
  drawing?: string | null;
  music?: string | null;
  isUnlocked: boolean;
  isToday: boolean;
};

type CalendarGridProps = {
  days: DayData[];
  onDayClick: (day: number) => void;
};

export default function CalendarGrid({ days, onDayClick }: CalendarGridProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 p-6">
      {days.map((dayData) => {
        const { day, isUnlocked, isToday } = dayData;
        
        return (
          <button
            key={day}
            onClick={() => onDayClick(day)}
            disabled={!isUnlocked && !isToday}
            className={`
              aspect-square rounded-2xl flex flex-col items-center justify-center 
              text-xl font-bold transition-all duration-300 relative overflow-hidden
              ${
                isToday
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-2xl ring-4 ring-yellow-300 animate-pulse scale-110"
                  : isUnlocked
                  ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:scale-110 hover:shadow-2xl cursor-pointer"
                  : "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              }
            `}
          >
            {/* Effet de brillance */}
            {(isToday || isUnlocked) && (
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-50"></div>
            )}
            
            {/* Numéro du jour */}
            <span className="relative z-10 text-2xl font-black">{day}</span>
            
            {/* Icône décorative */}
            {isToday && <span className="absolute bottom-1 text-xs">🎁</span>}
            {isUnlocked && !isToday && <span className="absolute bottom-1 text-xs">✨</span>}
            {!isUnlocked && !isToday && <span className="absolute bottom-1 text-xs">🔒</span>}
          </button>
        );
      })}
    </div>
  );
}
