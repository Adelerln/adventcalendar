"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { sparkleRandom } from "@/lib/sparkle-random";
import { PLAN_APPEARANCE, DEFAULT_PLAN, type PlanKey } from "@/lib/plan-theme";

const GoldenEnvelopeTree = dynamic(() => import("@/components/GoldenEnvelopeTree"), { ssr: false });

type CalendarItem = {
  day: number;
  type: "photo" | "message" | "drawing" | "music" | "voice" | "ai_photo";
  content: string;
  title?: string | null;
 };

function CheckoutSuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam = (searchParams?.get("plan") as PlanKey | null) ?? null;
  const plan = planParam === "plan_premium" ? "plan_premium" : planParam === "plan_essentiel" ? "plan_essentiel" : DEFAULT_PLAN;
  const planTheme = PLAN_APPEARANCE[plan];
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/calendar-contents")
      .then(async (res) => {
        const text = await res.text();
        let json: any = null;
        try {
          json = text ? JSON.parse(text) : null;
        } catch {
          /* ignore */
        }
        if (!res.ok) {
          throw new Error(json?.error || "Impossible de charger le calendrier.");
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
        setError(err?.message || "Impossible de charger le calendrier.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const days = useMemo(() => {
    const perDay = new Map<number, { day: number; photo: string | null; message: string | null; drawing: string | null; music: string | null }>();
    for (const item of items) {
      const existing = perDay.get(item.day) ?? { day: item.day, photo: null, message: null, drawing: null, music: null };
      if (item.type === "photo" || item.type === "ai_photo") existing.photo = item.content;
      if (item.type === "message") existing.message = item.content;
      if (item.type === "drawing") existing.drawing = item.content;
      if (item.type === "music" || item.type === "voice") existing.music = item.content;
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
        message: data?.message ?? null,
        drawing: data?.drawing ?? null,
        music: data?.music ?? null
      };
    });
  }, [items]);

  const filledCount = useMemo(() => {
    const uniqueDays = new Set(items.map((i) => i.day));
    return uniqueDays.size;
  }, [items]);

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
          const size = sparkleRandom(i, 3) * 6 + 2;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${sparkleRandom(i, 1) * 100}%`,
                left: `${sparkleRandom(i, 2) * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: i % 2 === 0 ? "#d4af37" : "#ffffff",
                opacity: sparkleRandom(i, 4) * 0.6 + 0.2,
                animation: `sparkle ${sparkleRandom(i, 5) * 1.5 + 1}s ease-in-out infinite`,
                animationDelay: `${sparkleRandom(i, 6) * 2}s`,
                transform: `rotate(${sparkleRandom(i, 7) * 360}deg)`
              }}
            />
          );
        })}
      </div>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-16 space-y-10">
        <div className="text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-[#f8d97c]">Paiement confirmé</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Félicitations !</h1>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Ton calendrier est créé. Tu peux encore le modifier pour les jours à venir et prévisualiser ce que verra ton destinataire.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr] items-stretch">
          <div className="rounded-3xl border-2 border-white/25 bg-white/15 backdrop-blur p-6 text-white shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#f8d97c]">Prévisualisation</p>
                <h2 className="text-2xl font-bold">Calendrier finalisé</h2>
                <p className="text-sm text-white/70">{filledCount}/24 cases enregistrées</p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/calendars/new?stage=creation")}
                className="px-5 py-3 rounded-full bg-white text-red-700 font-semibold shadow-md"
              >
                Modifier mon calendrier
              </button>
            </div>

            <div className="bg-white/5 border border-white/15 rounded-2xl p-4 flex items-center justify-center">
              <div className="w-full max-w-3xl mx-auto">
                <GoldenEnvelopeTree
                  days={days}
                  onDayClick={() => {}}
                  hideBackground
                />
              </div>
            </div>
            {error && <p className="mt-4 text-sm text-red-200">{error}</p>}
          </div>

          <aside className="rounded-3xl border-2 border-white/25 bg-white/10 backdrop-blur p-6 text-white space-y-4 shadow-xl">
            <div className="rounded-2xl border-2 border-[#d4af37] bg-white/10 backdrop-blur px-6 py-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">Plan</p>
              <h2 className="text-3xl font-bold mt-2 text-white">{planTheme.name ?? "Calendrier"}</h2>
              <p className="text-sm text-white/70">Tu peux modifier les jours non écoulés.</p>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => router.push("/creations")}
                className="w-full rounded-full px-5 py-3 font-semibold border-2 border-white/40 bg-white/10 hover:bg-white/20 transition"
              >
                Voir mes créations
              </button>
              <button
                type="button"
                onClick={() => router.push("/recipient/dashboard")}
                className="w-full rounded-full px-5 py-3 font-semibold bg-white text-red-700 shadow-md"
              >
                Aperçu côté destinataire
              </button>
            </div>
            <p className="text-xs text-white/70">Besoin d'aide ? Contacte le support et mentionne ton email de commande.</p>
          </aside>
        </div>
      </section>

      <style jsx>{`
        @keyframes sparkle {
          0%, 100% {
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Chargement…</div>}>
      <CheckoutSuccessPageContent />
    </Suspense>
  );
}
