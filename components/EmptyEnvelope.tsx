"use client";

import type { PlanKey } from "@/lib/plan-theme";
import { PLAN_APPEARANCE, DEFAULT_PLAN } from "@/lib/plan-theme";

type DayContent = {
  type: "photo" | "message" | "drawing" | "music";
  content: string;
  title?: string;
};

type Props = {
  day: number;
  content: DayContent | null;
  onClick: () => void;
  plan?: PlanKey;
};

export default function EmptyEnvelope({ day, content, onClick, plan }: Props) {
  const hasContent = content !== null;
  const palette = PLAN_APPEARANCE[plan ?? DEFAULT_PLAN].tile;

  const baseBg = hasContent ? "bg-white/80" : "bg-white/30";

  return (
    <div onClick={onClick} className="relative cursor-pointer group aspect-square">
      <div
        className={`relative w-full h-full border-2 rounded-2xl shadow-lg transition-all duration-300 ${baseBg} ${palette.border} group-hover:bg-white`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-2 transition-all ${
              hasContent ? palette.numberFilledBg : palette.numberEmptyBg
            }`}
          >
            <span
              className={`text-3xl font-black ${
                hasContent ? palette.numberFilledText : palette.numberEmptyText
              }`}
            >
              {day}
            </span>
          </div>
        </div>

        {hasContent && (
          <div className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
            <span className="text-lg">
              {content.type === "photo" && "📷"}
              {content.type === "message" && "💌"}
              {content.type === "drawing" && "🎨"}
              {content.type === "music" && "🎵"}
            </span>
          </div>
        )}

        <div className="absolute bottom-3 inset-x-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${palette.indicatorBg} ${palette.indicatorText}`}
          >
            {hasContent ? "Modifier" : "Ajouter contenu"}
          </span>
        </div>

        {hasContent && (
          <div
            className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold shadow ${palette.badgeBg} ${palette.badgeText}`}
          >
            ✓
          </div>
        )}
      </div>
    </div>
  );
}
