"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { PLAN_APPEARANCE, type PlanKey, DEFAULT_PLAN } from "@/lib/plan-theme";

const GoldenEnvelopeTree = dynamic(() => import("@/components/GoldenEnvelopeTree"), { ssr: false });

// Icônes SVG simples
const PhotoIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const DrawingIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const MessageIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const MusicIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

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
  const [currentCalendarId, setCurrentCalendarId] = useState<string | null>(null);

  useEffect(() => {
    const savedName = typeof window !== "undefined" ? localStorage.getItem("calendar_current_name") : null;
    const savedCalendarId = typeof window !== "undefined" ? localStorage.getItem("current_calendar_id") : null;
    if (savedName) setCalendarName(savedName);
    setCurrentCalendarId(savedCalendarId);
  }, []);

  useEffect(() => {
    if (currentCalendarId === undefined) return; // Attendre que currentCalendarId soit initialis\u00e9
    let cancelled = false;
    setLoading(true);
    setError(null);
    const url = currentCalendarId 
      ? `/api/calendar-contents?calendar_id=${currentCalendarId}`
      : "/api/calendar-contents";
    fetch(url)
      .then(async (res) => {
        const text = await res.text();
        let json: any = null;
        try {
          json = text ? JSON.parse(text) : null;
        } catch {
          /* ignore parse error */
        }
        if (!res.ok) {
          if (res.status === 401) throw new Error("Reconnecte-toi pour récupérer tes créations.");
          throw new Error(json?.error || "Impossible de charger tes créations.");
        }
        return json;
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
  }, [currentCalendarId]);

  const stats = useMemo(() => {
    const daysSet = new Set<number>();
    const counts: Record<string, number> = { photo: 0, ai_photo: 0, drawing: 0, message: 0, music: 0, voice: 0 };
    for (const item of items) {
      daysSet.add(item.day);
      counts[item.type] = (counts[item.type] ?? 0) + 1;
    }
    const totalDays = daysSet.size;
    const completionPercentage = Math.round((totalDays / 24) * 100);
    return {
      totalDays,
      completionPercentage,
      counts,
      plan: DEFAULT_PLAN as PlanKey
    };
  }, [items]);

  const planTheme = PLAN_APPEARANCE[stats.plan];
  const empty = items.length === 0;

  const days = useMemo(() => {
    const perDay = new Map<
      number,
      { 
        day: number; 
        photo: string | null; 
        photoTitle: string | null;
        message: string | null; 
        drawing: string | null; 
        drawingTitle: string | null;
        music: string | null;
        musicTitle: string | null;
      }
    >();
    for (const item of items) {
      const existing = perDay.get(item.day) ?? { 
        day: item.day, 
        photo: null, 
        photoTitle: null,
        message: null, 
        drawing: null, 
        drawingTitle: null,
        music: null,
        musicTitle: null
      };
      if (item.type === "photo" || item.type === "ai_photo") {
        existing.photo = item.content;
        existing.photoTitle = item.title ?? null;
      }
      if (item.type === "message") existing.message = item.content;
      if (item.type === "drawing") {
        existing.drawing = item.content;
        existing.drawingTitle = item.title ?? null;
      }
      if (item.type === "music" || item.type === "voice") {
        existing.music = item.content;
        existing.musicTitle = item.title ?? null;
      }
      perDay.set(item.day, existing);
    }
    return Array.from({ length: 24 }, (_, idx) => {
      const dayNum = idx + 1;
      const data = perDay.get(dayNum);
      return {
        day: dayNum,
        isUnlocked: Boolean(data),
        isToday: false,
        photo: data?.photo ?? null,
        photoTitle: data?.photoTitle ?? null,
        message: data?.message ?? null,
        drawing: data?.drawing ?? null,
        drawingTitle: data?.drawingTitle ?? null,
        music: data?.music ?? null,
        musicTitle: data?.musicTitle ?? null
      };
    });
  }, [items]);

  const handleNameChange = (value: string) => {
    setCalendarName(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("calendar_current_name", value);
    }
  };

  const handleCreateNewCalendar = () => {
    const confirmCreate = window.confirm(
      "Créer un nouveau calendrier vierge ? Votre calendrier actuel sera sauvegardé et vous pourrez y revenir plus tard."
    );
    if (!confirmCreate) return;

    // Générer un nouvel UUID pour le nouveau calendrier
    const newCalendarId = crypto.randomUUID();
    
    // Sauvegarder l'ancien calendrier dans la liste
    if (typeof window !== "undefined") {
      const savedCalendars = JSON.parse(localStorage.getItem("saved_calendars") || "[]");
      const currentCalendarId = localStorage.getItem("current_calendar_id");
      
      // Sauvegarder le calendrier actuel s'il a du contenu
      if (items.length > 0) {
        const calendarExists = savedCalendars.some((cal: any) => cal.id === currentCalendarId);
        if (!calendarExists) {
          savedCalendars.push({
            id: currentCalendarId || null, // null pour l'ancien calendrier par défaut
            name: calendarName || "Calendrier sans nom",
            itemsCount: items.length,
            savedAt: new Date().toISOString()
          });
          localStorage.setItem("saved_calendars", JSON.stringify(savedCalendars));
        }
      }
      
      // Nettoyer le localStorage pour le nouveau calendrier
      localStorage.removeItem("calendar_current_name");
      localStorage.setItem("current_calendar_id", newCalendarId);
      
      // Clear draft data
      const draftKeys = Object.keys(localStorage).filter(k => k.startsWith("calendar_draft_"));
      draftKeys.forEach(k => localStorage.removeItem(k));
    }
    
    // Rediriger vers la création
    router.push("/calendars/new?stage=plan&new=true");
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
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon />
              <p className="text-xs uppercase tracking-[0.3em] text-[#f8d97c]">Espace créateur</p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Mes créations</h1>
            <p className="text-white/80 text-sm">
              Retrouve tes calendriers en cours et continue la confection sans rien perdre.
            </p>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur px-6 py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-3"></div>
            <p className="text-white text-sm">Chargement de tes créations…</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-300/50 bg-red-500/20 backdrop-blur px-6 py-4 text-white">
            <p className="font-semibold mb-1">⚠️ Oups !</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {empty ? (
              <div className="rounded-3xl border-2 border-dashed border-white/30 bg-white/10 backdrop-blur p-12 text-center text-white">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Aucune création enregistrée</h2>
                  <p className="text-white/70 text-sm mb-6">
                    Commence un nouveau calendrier ou poursuis celui que tu viens de créer. Chaque case peut contenir une photo, un message, un dessin ou une musique !
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/calendars/new?stage=creation")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-red-700 font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <SparklesIcon />
                    Commencer un calendrier
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Carte principale du calendrier */}
                <div className="lg:col-span-2 rounded-3xl border-2 border-white/25 bg-white/15 backdrop-blur-xl p-6 text-white space-y-5 shadow-2xl">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[#f8d97c]">En cours de création</p>
                    </div>
                    <input
                      value={calendarName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Nom du calendrier (ex: Pour Rayene)"
                      className="w-full rounded-2xl bg-white/15 border border-white/30 px-4 py-3 text-white text-lg font-medium placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Barre de progression */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/90 font-medium">Progression</span>
                      <span className="text-white font-bold">{stats.totalDays}/24 cases</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/20">
                      <div 
                        className="h-full bg-gradient-to-r from-[#f8d97c] to-[#d4af37] rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${stats.completionPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-white/60 text-right">{stats.completionPercentage}% complété</p>
                  </div>

                  {/* Statistiques avec icônes */}
                  <div className="grid grid-cols-2 gap-3">
                    <InfoPill 
                      icon={<PhotoIcon />}
                      label="Photos/IA" 
                      value={(stats.counts.photo ?? 0) + (stats.counts.ai_photo ?? 0)} 
                    />
                    <InfoPill 
                      icon={<DrawingIcon />}
                      label="Dessins" 
                      value={stats.counts.drawing ?? 0} 
                    />
                    <InfoPill 
                      icon={<MessageIcon />}
                      label="Messages" 
                      value={stats.counts.message ?? 0} 
                    />
                    <InfoPill 
                      icon={<MusicIcon />}
                      label="Audio/Musique" 
                      value={(stats.counts.music ?? 0) + (stats.counts.voice ?? 0)} 
                    />
                  </div>

                  {/* Aperçu */}
                  <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-white/90 font-medium">👁️ Aperçu destinataire</p>
                      <span className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">Vue préliminaire</span>
                    </div>
                    <div className="rounded-xl overflow-hidden bg-gradient-to-b from-white/5 to-white/10 border border-white/10 p-2">
                      <GoldenEnvelopeTree days={days} onDayClick={() => {}} hideBackground />
                    </div>
                  </div>

                  {/* Actions principales */}
                  <div className="flex gap-3 flex-wrap pt-2">
                    <button
                      type="button"
                      onClick={() => router.push("/calendars/new?stage=creation")}
                      className="flex-1 min-w-[200px] px-6 py-4 rounded-2xl bg-white text-red-700 font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                    >
                      ✨ Continuer la confection
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/recipient/dashboard")}
                      className="flex-1 min-w-[200px] px-6 py-4 rounded-2xl border-2 border-white/60 text-white font-semibold hover:bg-white/15 hover:border-white transition-all duration-200"
                    >
                      👀 Aperçu complet
                    </button>
                  </div>
                </div>

                {/* Carte secondaire - Actions supplémentaires */}
                  <div className="space-y-4">
                  <div className="rounded-3xl border-2 border-white/25 bg-gradient-to-br from-white/15 to-white/10 backdrop-blur-xl p-6 text-white space-y-4 shadow-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f8d97c]/20 flex items-center justify-center flex-shrink-0">
                        <SparklesIcon />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1">Nouveau calendrier</h3>
                        <p className="text-sm text-white/70 leading-relaxed">
                          Crée un calendrier vierge pour une autre personne. Ton calendrier actuel sera sauvegardé.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateNewCalendar}
                      className="w-full px-5 py-3 rounded-2xl border-2 border-white/60 bg-white/10 text-white font-semibold hover:bg-white/20 hover:border-white transition-all duration-200"
                    >
                      🎁 Créer un nouveau calendrier
                    </button>
                  </div>                  {/* Carte de conseils */}
                  <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur p-5 text-white space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <span>💡</span> Conseils
                    </h4>
                    <ul className="space-y-2 text-xs text-white/80">
                      <li className="flex items-start gap-2">
                        <span className="text-[#f8d97c] mt-0.5">•</span>
                        <span>Varie les types de contenu pour plus de surprise</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#f8d97c] mt-0.5">•</span>
                        <span>Sauvegarde automatique à chaque modification</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#f8d97c] mt-0.5">•</span>
                        <span>Prévisualise avant d'envoyer au destinataire</span>
                      </li>
                    </ul>
                  </div>

                  {/* Bouton pour revenir au calendrier par défaut */}
                  {currentCalendarId && (
                    <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur p-5 text-white space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <span>📋</span> Mes calendriers
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            localStorage.removeItem("current_calendar_id");
                            window.location.reload();
                          }
                        }}
                        className="w-full px-4 py-2 rounded-xl border border-white/40 text-white text-sm hover:bg-white/10 transition-all"
                      >
                        ← Voir mon calendrier principal
                      </button>
                    </div>
                  )}
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

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="group rounded-2xl bg-white/10 border border-white/20 px-4 py-3 hover:bg-white/15 hover:border-white/30 transition-all duration-200 hover:scale-[1.02]">
      <div className="flex items-center gap-2 mb-1">
        <div className="text-[#f8d97c] group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <p className="text-xs text-white/70">{label}</p>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
