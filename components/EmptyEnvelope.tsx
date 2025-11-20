"use client";

import type { PlanKey } from "@/lib/plan-theme";
import { PLAN_APPEARANCE, DEFAULT_PLAN } from "@/lib/plan-theme";

type DayContent = {
  type: "photo" | "message" | "drawing" | "music" | "voice" | "ai_photo";
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

  const baseBg = hasContent ? "bg-white/20 backdrop-blur-sm" : "bg-white/10 backdrop-blur-sm";

  return (
    <div onClick={onClick} className="relative cursor-pointer group aspect-square">
      <div
        className={`relative w-full h-full border-2 rounded-2xl shadow-lg transition-all duration-300 ${baseBg} border-white/30 group-hover:bg-white/30`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-2 transition-all ${
              hasContent 
                ? "border-[#d4af37]" 
                : "bg-white/10 backdrop-blur-sm border-white/30"
            }`}
            style={hasContent ? {
              background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)'
            } : {}}
          >
            <span
              className={`text-3xl font-black ${
                hasContent ? "text-[#4a0808]" : "text-white"
              }`}
            >
              {day}
            </span>
          </div>
        </div>

        {hasContent && (
          <div className="absolute bottom-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center shadow-md">
            <span className="text-lg">
              {content.type === "photo" && "📷"}
              {content.type === "message" && "💌"}
              {content.type === "drawing" && "🎨"}
              {content.type === "music" && "🎵"}
              {content.type === "voice" && "🎙️"}
              {content.type === "ai_photo" && "🤖"}
            </span>
          </div>
        )}

        <div className="absolute bottom-3 inset-x-0 text-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full bg-[#d4af37] text-[#4a0808] border border-[#4a0808]"
          >
            {hasContent ? "Modifier" : "Ajouter contenu"}
          </span>
        </div>

        {hasContent && (
          <div
            className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold shadow bg-[#d4af37] text-[#4a0808]"
          >
            ✓
          </div>
        )}
      </div>
    </div>
  );
}
