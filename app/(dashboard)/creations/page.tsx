"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { PLAN_APPEARANCE, type PlanKey, DEFAULT_PLAN } from "@/lib/plan-theme";

type CalendarItem = {
  day: number;
  type: "photo" | "message" | "drawing" | "music" | "voice" | "ai_photo";
  content: string;
  title?: string | null;
};

export default function CreationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarName, setCalendarName] = useState<string>("");

  useEffect(() => {
    const savedName = typeof window !== "undefined" ? localStorage.getItem("calendar_current_name") : null;
    if (savedName) setCalendarName(savedName);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/calendar-contents")
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error("Reconnecte-toi pour récupérer tes créations.");
          return res.json().then((b) => {
            throw new Error(b?.error || "Impossible de charger tes créations.");
          });
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const fetched = (data?.items as CalendarItem[] | undefined) ?? [];
        setItems(fetched);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "Impossible de charger tes créations.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const daysSet = new Set<number>();
    const counts: Record<string, number> = { photo: 0, ai_photo: 0, drawing: 0, message: 0, music: 0, voice: 0 };
    for (const item of items) {
      daysSet.add(item.day);
      counts[item.type] = (counts[item.type] ?? 0) + 1;
    }
    return {
      totalDays: daysSet.size,
      counts,
      plan: DEFAULT_PLAN as PlanKey
    };
  }, [items]);

  const planTheme = PLAN_APPEARANCE[stats.plan];
  const empty = items.length === 0;

  const handleNameChange = (value: string) => {
    setCalendarName(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("calendar_current_name", value);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Header />
      <div
        className="fixed inset-0 z-0"
        style={{
          background: "linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)"
        }}
      />
      <div className="absolute inset-0 z-0">
        {[...Array(150)].map((_, i) => {
          const size = (Math.sin(i * 12.9898) * 43758.5453 % 1) * 6 + 2;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${(Math.sin(i * 0.5) * 1000 % 100 + 100) % 100}%`,
                left: `${(Math.cos(i * 0.8) * 1000 % 100 + 100) % 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: i % 2 === 0 ? "#d4af37" : "#ffffff",
                opacity: 0.2 + ((i * 7) % 10) / 15,
                animation: `sparkle ${1 + ((i * 3) % 10) / 5}s ease-in-out infinite`,
                animationDelay: `${((i * 5) % 20) / 10}s`,
                transform: `rotate(${(i * 17) % 360}deg)`
              }}
            />
          );
        })}
      </div>

      <div className="container relative z-10 mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#f8d97c]">Espace créateur</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Mes créations</h1>
            <p className="text-white/80 text-sm mt-2">
              Retrouve tes calendriers en cours et continue la confection sans rien perdre.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/calendars/new?stage=plan")}
            className={`${planTheme.ctaBg} ${planTheme.ctaHover} ${planTheme.ctaText} px-4 py-3 rounded-full font-semibold shadow-lg`}
          >
            Créer un nouveau projet
          </button>
        </div>

        {loading && (
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur px-4 py-3 text-white text-sm">
            Chargement de tes créations…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-white/15 backdrop-blur px-4 py-3 text-white text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {empty ? (
              <div className="rounded-3xl border-2 border-dashed border-white/25 bg-white/10 backdrop-blur p-8 text-center text-white">
                <p className="text-lg font-semibold mb-2">Aucune création enregistrée pour le moment.</p>
                <p className="text-white/80 text-sm mb-4">
                  Commence un nouveau calendrier ou poursuis celui que tu viens de créer.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/calendars/new?stage=creation")}
                  className="mt-2 px-5 py-3 rounded-full bg-white text-red-700 font-semibold shadow-md"
                >
                  Continuer l'édition
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border-2 border-white/25 bg-white/15 backdrop-blur p-6 text-white space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-[#f8d97c]">Calendrier en cours</p>
                      <input
                        value={calendarName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Nom du calendrier (ex: Pour Rayene)"
                        className="mt-2 w-full rounded-2xl bg-white/15 border border-white/25 px-3 py-2 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                      <p className="text-sm text-white/70 mt-2">{stats.totalDays}/24 cases enregistrées</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <InfoPill label="Photos/IA" value={(stats.counts.photo ?? 0) + (stats.counts.ai_photo ?? 0)} />
                    <InfoPill label="Dessins" value={stats.counts.drawing ?? 0} />
                    <InfoPill label="Messages" value={stats.counts.message ?? 0} />
                    <InfoPill label="Audio/Musique" value={(stats.counts.music ?? 0) + (stats.counts.voice ?? 0)} />
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => router.push("/calendars/new?stage=creation")}
                      className="px-5 py-3 rounded-full bg-white text-red-700 font-semibold shadow-md"
                    >
                      Continuer la confection
                    </button>
                  </div>
                </div>
                <div className="rounded-3xl border-2 border-white/25 bg-white/10 backdrop-blur p-6 text-white space-y-4 shadow-lg">
                  <h3 className="text-xl font-bold">Besoin d'un nouveau calendrier ?</h3>
                  <p className="text-sm text-white/80">
                    Lance une nouvelle création pour une autre personne sans perdre ton projet actuel.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/calendars/new?stage=plan")}
                    className="px-5 py-3 rounded-full border-2 border-white/60 bg-white/10 text-white font-semibold hover:bg-white/20 transition"
                  >
                    Créer un autre calendrier
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes sparkle {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(0.8) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(2) rotate(180deg);
          }
        }
      `}</style>
    </main>
  );
}

function InfoPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
      <p className="text-xs text-white/70">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
