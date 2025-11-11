"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { PLAN_APPEARANCE, DEFAULT_PLAN, type PlanKey } from "@/lib/plan-theme";

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
  plan?: PlanKey;
};

const DAY_STYLES: Record<PlanKey, {
  unlockedBg: string;
  todayBg: string;
  lockedBg: string;
  flapUnlocked: string;
  flapToday: string;
  flapLocked: string;
  statusUnlocked: string;
  statusToday: string;
  statusLocked: string;
  chipUnlocked: string;
  chipToday: string;
  chipLocked: string;
}> = {
  plan_essentiel: {
    unlockedBg: "bg-gradient-to-br from-[#f4f6fb] to-[#dde2ec]",
    todayBg: "bg-gradient-to-br from-white to-[#f3f6fa]",
    lockedBg: "bg-gradient-to-br from-[#eceff5] to-[#e1e4eb]",
    flapUnlocked: "bg-gradient-to-br from-white/80 to-white/60 border-[#dfe3eb]",
    flapToday: "bg-gradient-to-br from-white to-white/70 border-[#dfe5ef]",
    flapLocked: "bg-gradient-to-br from-white/70 to-white/50 border-[#dfe3eb]",
    statusUnlocked: "text-[#4d5663]",
    statusToday: "text-[#6f7782]",
    statusLocked: "text-[#8d94a1]",
    chipUnlocked: "bg-white/85 text-[#4d5663]",
    chipToday: "bg-white/85 text-[#6f7782]",
    chipLocked: "bg-white/70 text-[#8d94a1]"
  },
  plan_premium: {
    unlockedBg: "bg-gradient-to-br from-[#fff4e6] to-[#f6e0c6]",
    todayBg: "bg-gradient-to-br from-white to-[#fdf3e5]",
    lockedBg: "bg-gradient-to-br from-[#f7e6d3] to-[#edd4ba]",
    flapUnlocked: "bg-gradient-to-br from-white to-[#fff3e5] border-[#f2deca]",
    flapToday: "bg-gradient-to-br from-white to-[#fff7ef] border-[#f5e5d4]",
    flapLocked: "bg-gradient-to-br from-white to-[#f9ecdc] border-[#f0dac3]",
    statusUnlocked: "text-[#8a613c]",
    statusToday: "text-[#a37247]",
    statusLocked: "text-[#c89b65]",
    chipUnlocked: "bg-white/85 text-[#8a613c]",
    chipToday: "bg-white/90 text-[#a37247]",
    chipLocked: "bg-white/75 text-[#c89b65]"
  }
};

export default function CalendarGrid({ days, onDayClick, plan }: CalendarGridProps) {
  const [recipientDays, setRecipientDays] = useState<RecipientDay[]>([]);
  const [loading, setLoading] = useState(!days);
  const [error, setError] = useState<string | null>(null);
  const planKey: PlanKey = plan ?? DEFAULT_PLAN;
  const theme = PLAN_APPEARANCE[planKey].tile;
  const dayTheme = DAY_STYLES[planKey];

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur";
      setError(message);
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
        const baseBg = isUnlocked ? dayTheme.unlockedBg : isToday ? dayTheme.todayBg : dayTheme.lockedBg;
        const flapBg = isUnlocked ? dayTheme.flapUnlocked : isToday ? dayTheme.flapToday : dayTheme.flapLocked;
        const statusClass = isUnlocked ? dayTheme.statusUnlocked : isToday ? dayTheme.statusToday : dayTheme.statusLocked;
        const chipClass = isUnlocked ? dayTheme.chipUnlocked : isToday ? dayTheme.chipToday : dayTheme.chipLocked;
        const numberBg = isUnlocked ? theme.numberFilledBg : theme.numberEmptyBg;
        const numberText = isUnlocked ? theme.numberFilledText : theme.numberEmptyText;

        return (
          <button
            key={day}
            type="button"
            onClick={() => handleDayAction(day, canOpen)}
            disabled={!canOpen}
            className="group aspect-square relative"
          >
            <div
              className={clsx(
                "relative w-full h-full rounded-2xl border-2 shadow-lg transition-all",
                baseBg,
                theme.border,
                !canOpen && "opacity-70"
              )}
            >
              <div
                className={clsx("absolute inset-x-0 top-0 h-1/2 clip-envelope border-b-2", flapBg)}
              ></div>

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div
                  className={clsx(
                    "w-16 h-16 rounded-full flex items-center justify-center border-2 font-black text-3xl shadow",
                    numberBg,
                    numberText,
                    theme.border
                  )}
                >
                  {day}
                </div>

                <span className={clsx("text-sm font-semibold", statusClass)}>
                  {isUnlocked ? "Ouvert" : isToday ? "Aujourd&rsquo;hui" : "Bientôt"}
                </span>
              </div>

              <div className="absolute bottom-3 inset-x-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className={clsx("text-xs font-semibold px-3 py-1 rounded-full", chipClass)}>
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
