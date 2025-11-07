"use client";

import { useEffect, useMemo, useState } from "react";

type PropsDay = {
  day: number;
  photo?: string | null;
  message?: string | null;
  drawing?: string | null;
  music?: string | null;
  isUnlocked: boolean;
  isToday: boolean;
};

type RecipientDay = {
  dayNumber: number;
  openedAt?: string | null;
};

type CalendarGridProps = {
  days?: PropsDay[];
  onDayClick?: (day: number) => void;
};

export default function CalendarGrid({ days, onDayClick }: CalendarGridProps) {
  const [recipientDays, setRecipientDays] = useState<RecipientDay[]>([]);
  const [loading, setLoading] = useState(!days);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!days) {
      refresh();
    }
  }, [days]);

  async function refresh() {
    try {
      const response = await fetch("/api/advent/recipient/days");
      if (!response.ok) throw new Error("Unauthorized");
      const data = await response.json();
      setRecipientDays(data.days || []);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function handleDayAction(dayNumber: number, canOpen: boolean) {
    if (!canOpen) return;
    if (onDayClick) {
      onDayClick(dayNumber);
      return;
    }

    await fetch("/api/advent/recipient/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day_number: dayNumber })
    });
    refresh();
  }

  const computedDays: PropsDay[] = useMemo(() => {
    if (days) return days;

    const openedSet = new Set(recipientDays.map((d) => d.dayNumber));
    const lastOpened = openedSet.size ? Math.max(...openedSet) : 0;
    const currentDay = Math.min(lastOpened + 1, 24);

    return Array.from({ length: 24 }, (_, index) => {
      const dayNumber = index + 1;
      const isUnlocked = openedSet.has(dayNumber);
      return {
        day: dayNumber,
        isUnlocked,
        isToday: !isUnlocked && dayNumber === currentDay,
        photo: null,
        message: null,
        drawing: null,
        music: null
      };
    });
  }, [days, recipientDays]);

  if (!days && loading) {
    return <div className="p-8">Chargement…</div>;
  }

  if (!days && error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
      {computedDays.map((dayData) => {
        const { day, isUnlocked, isToday } = dayData;
        const canOpen = isUnlocked || isToday;

        return (
          <button
            key={day}
            type="button"
            onClick={() => handleDayAction(day, canOpen)}
            disabled={!canOpen}
            className="group aspect-square relative"
          >
            <div
              className={`relative w-full h-full rounded-2xl border-2 shadow-lg transition-all ${
                isUnlocked
                  ? "bg-gradient-to-br from-green-100 to-green-200 border-green-400 group-hover:shadow-2xl"
                  : isToday
                  ? "bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400 group-hover:shadow-2xl"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 opacity-70 cursor-not-allowed"
              }`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-1/2 clip-envelope border-b-2 ${
                  isUnlocked
                    ? "bg-gradient-to-br from-green-200 to-green-300 border-green-400"
                    : isToday
                    ? "bg-gradient-to-br from-yellow-200 to-yellow-300 border-yellow-400"
                    : "bg-gradient-to-br from-gray-200 to-gray-300 border-gray-400"
                }`}
              ></div>

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center border-2 font-black text-3xl shadow ${
                    isUnlocked
                      ? "bg-green-500 border-green-700 text-white"
                      : isToday
                      ? "bg-white border-yellow-500 text-yellow-600"
                      : "bg-white border-gray-400 text-gray-500"
                  }`}
                >
                  {day}
                </div>

                <span className="text-sm font-semibold text-gray-600">
                  {isUnlocked ? "Ouvert" : isToday ? "Aujourd'hui" : "Bientôt"}
                </span>
              </div>

              <div className="absolute bottom-3 inset-x-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    isUnlocked
                      ? "bg-white/80 text-green-700"
                      : isToday
                      ? "bg-white/80 text-yellow-600"
                      : "bg-white/60 text-gray-500"
                  }`}
                >
                  {isUnlocked ? "Voir le souvenir" : isToday ? "Cliquer pour ouvrir" : "Patience"}
                </span>
              </div>

              <div className="absolute top-2 left-2 text-lg">
                {isUnlocked ? "✨" : isToday ? "🎁" : "🔒"}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
