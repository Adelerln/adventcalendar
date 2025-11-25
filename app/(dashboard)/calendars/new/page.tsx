"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import EmptyEnvelope from "@/components/EmptyEnvelope";
import EnvelopeEditor from "@/components/EnvelopeEditor";
import ParcoursBanner from "@/components/ParcoursBanner";
import { PLAN_APPEARANCE, DEFAULT_PLAN, type PlanKey } from "@/lib/plan-theme";
import StepNavigation from "@/components/StepNavigation";
import { sparkleRandom } from "@/lib/sparkle-random";

type Plan = PlanKey | null;

type DayContent = {
  type: "photo" | "message" | "drawing" | "music" | "voice" | "ai_photo";
  content: string;
  title?: string;
};

export default function NewCalendarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement…</div>}>
      <NewCalendarPageContent />
    </Suspense>
  );
}

function NewCalendarPageContent() {
  const searchParams = useSearchParams();
  const planFromUrl = searchParams.get("plan") as Plan | null;
  const stageParam = searchParams.get("stage");
  const planFromQuery = useMemo<Plan>(() => {
    if (planFromUrl === "plan_essentiel" || planFromUrl === "plan_premium") {
      return planFromUrl;
    }
    return null;
  }, [planFromUrl]);
  const [selectedPlan, setSelectedPlan] = useState<Plan>(planFromQuery);
  const [step, setStep] = useState<"plan" | "creation">(() => {
    if (stageParam === "plan") return "plan";
    if (stageParam === "creation") return "creation";
    return planFromQuery ? "creation" : "plan";
  });
  const [calendarData, setCalendarData] = useState<Record<number, DayContent>>({});
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [session, setSession] = useState<{ id: string; name: string; plan: PlanKey } | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const draftLoadedRef = useRef(false);
  const draftLoadedKeyRef = useRef<string | null>(null);
  const draftToastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (stageParam === "plan") {
      setStep("plan");
      return;
    }
    if (stageParam === "creation") {
      setStep("creation");
      return;
    }
    if (planFromQuery) {
      setStep("creation");
    }
  }, [stageParam, planFromQuery]);

  useEffect(() => {
    if (planFromQuery && planFromQuery !== selectedPlan) {
      setSelectedPlan(planFromQuery);
    }
  }, [planFromQuery, selectedPlan]);

  useEffect(() => {
    let ignore = false;
    fetch("/api/session")
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;
        const user = data.user as { id: string; name: string; plan: PlanKey } | null;
        setSession(user ?? null);
      })
      .catch(() => {
        setSession(null);
      });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    // Ne pas écraser le plan sélectionné par l'utilisateur avec le plan de session
    // Seulement utiliser le plan de session si aucun plan n'a été sélectionné ET qu'il n'y a pas de plan dans l'URL
    if (!selectedPlan && !planFromQuery && session?.plan) {
      setSelectedPlan(session.plan);
    }
  }, [selectedPlan, planFromQuery, session]);

  const draftKey = useMemo(() => `calendar_draft_${session?.id || "guest"}`, [session?.id]);

  // Charger un brouillon local si disponible
  useEffect(() => {
    if (typeof window === "undefined") return;
    const candidateKeys = [draftKey, "calendar_draft_guest"].filter(
      (k, idx, arr) => k && arr.indexOf(k) === idx
    ) as string[];

    const nextKeyToLoad = candidateKeys.find(
      (k) => k !== draftLoadedKeyRef.current && localStorage.getItem(k)
    );

    if (!nextKeyToLoad) return;

    try {
      const raw = localStorage.getItem(nextKeyToLoad);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.calendarData) setCalendarData(parsed.calendarData);
        if (parsed?.selectedPlan) setSelectedPlan(parsed.selectedPlan);
        if (parsed?.step) setStep(parsed.step);
      }
      draftLoadedKeyRef.current = nextKeyToLoad;
      draftLoadedRef.current = true;
    } catch (err) {
      console.warn("Impossible de charger le brouillon du calendrier:", err);
    }
  }, [draftKey]);

  useEffect(() => {
    return () => {
      if (draftToastRef.current) clearTimeout(draftToastRef.current);
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, []);

  const handlePlanSelection = (plan: Plan) => {
    if (!plan) return;
    setSelectedPlan(plan);
    setStep("creation");
    const params = new URLSearchParams(searchParams.toString());
    params.set("plan", plan);
    params.set("stage", "creation");
    router.replace(`/calendars/new?${params.toString()}`, { scroll: false });
  };

  const handleSaveDay = (day: number, content: DayContent) => {
    setCalendarData(prev => ({
      ...prev,
      [day]: content
    }));
  };

  const handleContinue = () => {
    const planForNext = selectedPlan ?? planFromQuery ?? session?.plan;
    if (!planForNext) {
      setStep("plan");
      const params = new URLSearchParams(searchParams.toString());
      params.set("stage", "plan");
      router.replace(`/calendars/new?${params.toString()}`, { scroll: false });
      return;
    }

    const filledDays = Object.keys(calendarData).length;
    if (filledDays < 24) {
      const confirm = window.confirm(
        `Vous avez rempli ${filledDays}/24 jours. Voulez-vous continuer quand même ?`
      );
      if (!confirm) return;
    }

    const params = new URLSearchParams({
      plan: planForNext,
      filled: filledDays.toString()
    });

    router.push(`/recipient?${params.toString()}`);
  };

  const handleSaveDraft = () => {
    if (typeof window === "undefined") return;
    const candidateKeys = [draftKey, "calendar_draft_guest"].filter(
      (k, idx, arr) => k && arr.indexOf(k) === idx
    ) as string[];
    const payload = {
      calendarData,
      selectedPlan,
      step,
      updatedAt: Date.now()
    };
    candidateKeys.forEach((k) => localStorage.setItem(k, JSON.stringify(payload)));
    draftLoadedKeyRef.current = candidateKeys[0] || draftLoadedKeyRef.current;
    setSaveFeedback("Brouillon sauvegardé");
    if (draftToastRef.current) clearTimeout(draftToastRef.current);
    draftToastRef.current = setTimeout(() => setSaveFeedback(null), 3000);
  };

  // Sauvegarde automatique dès qu'il y a une modification
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!draftLoadedRef.current && !draftLoadedKeyRef.current) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      const candidateKeys = [draftKey, "calendar_draft_guest"].filter(
        (k, idx, arr) => k && arr.indexOf(k) === idx
      ) as string[];
      const payload = {
        calendarData,
        selectedPlan,
        step,
        updatedAt: Date.now()
      };
      candidateKeys.forEach((k) => localStorage.setItem(k, JSON.stringify(payload)));
      draftLoadedKeyRef.current = candidateKeys[0] || draftLoadedKeyRef.current;
      setSaveFeedback("Brouillon sauvegardé");
      if (draftToastRef.current) clearTimeout(draftToastRef.current);
      draftToastRef.current = setTimeout(() => setSaveFeedback(null), 2000);
    }, 800);
  }, [calendarData, selectedPlan, step, draftKey]);

  const activePlan = (selectedPlan ?? planFromQuery ?? DEFAULT_PLAN) as PlanKey;
  const planTheme = PLAN_APPEARANCE[activePlan];
  const planPriceLabel = activePlan === "plan_premium" ? "Plan Premium (15€)" : "Plan Essentiel (10€)";
  const allowMusic = activePlan === "plan_premium";
  const showPlanSelection = step === "plan";
  const currentParcoursStep = showPlanSelection ? 1 : 3;
  const filledCount = Object.keys(calendarData).length;
  const progress = (filledCount / 24) * 100;
  const heroTitle = showPlanSelection ? "Choisissez votre forfait" : "Personnalisez votre calendrier";
  const heroSubtitle = showPlanSelection
    ? "Sélectionnez l'offre qui correspond à votre surprise."
    : "Complétez vos 24 attentions avant d'aller vers le bénéficiaire.";

  // Styles de paillettes pré-calculés (décimales arrondies pour éviter les mismatches d'hydratation)
  const sparkles = useMemo(() => {
    return Array.from({ length: 150 }, (_, i) => {
      const top = `${(sparkleRandom(i, 1) * 100).toFixed(4)}%`;
      const left = `${(sparkleRandom(i, 2) * 100).toFixed(4)}%`;
      const width = `${(sparkleRandom(i, 3) * 3 + 1).toFixed(4)}px`;
      const height = `${(sparkleRandom(i, 4) * 3 + 1).toFixed(4)}px`;
      const opacity = (sparkleRandom(i, 5) * 0.7 + 0.3).toFixed(6);
      const animationDelay = `${(sparkleRandom(i, 6) * 2).toFixed(4)}s`;
      const animationDuration = `${(sparkleRandom(i, 7) * 3 + 2).toFixed(4)}s`;

      return {
        top,
        left,
        width,
        height,
        opacity,
        animationDelay,
        animationDuration,
        background: i % 2 === 0 ? "#fbbf24" : "#ffffff",
      };
    });
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen relative bg-transparent pt-24 px-6 py-12">
        {/* Fond rouge pailleté festif */}
        <div 
          className="fixed inset-0 z-0"
          style={{
            background: 'linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)',
          }}
        >
          {/* Texture pointillée */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}
          />
          
          {/* Paillettes scintillantes */}
          <div className="absolute inset-0">
            {sparkles.map((sparkle, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-pulse"
                style={sparkle}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 space-y-10">
        <StepNavigation
          plan={activePlan}
          currentStep={currentParcoursStep}
          prev={
            showPlanSelection
              ? {
                  onClick: () => router.push("/pricing")
                }
              : session
              ? {
                  onClick: () => router.push(`/calendars/new?plan=${activePlan}&stage=plan`)
                }
              : {
                  onClick: () => router.push(`/create-account?plan=${activePlan}`)
                }
          }
          next={
            showPlanSelection
              ? {
                  onClick: () => {
                    const planToUse = selectedPlan ?? planFromQuery;
                    if (!planToUse) return;
                    router.push(`/create-account?plan=${planToUse}`);
                  },
                  disabled: !(selectedPlan ?? planFromQuery)
                }
              : { onClick: handleContinue }
          }
          className="mt-6"
        />
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{heroTitle}</h1>
          <p className="text-lg text-white/90 drop-shadow-md">{heroSubtitle}</p>
        </div>
        <ParcoursBanner plan={activePlan} currentStep={currentParcoursStep} className="max-w-7xl mx-auto" />
        {/* Step 1: Plan selection */}
        {showPlanSelection && (
          <div className="mx-auto max-w-5xl">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Plan Essentiel */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-xl p-8 border-2 border-white/20 hover:shadow-2xl transition-all min-h-[560px] flex flex-col">
                <div className="text-center mb-6 mt-6 min-h-[150px] flex flex-col justify-center">
                  <h2 className="text-3xl font-bold mb-2 text-white">Plan Essentiel</h2>
                  <div className="text-6xl font-bold text-[#d4af37] mb-2">10€</div>
                  <p className="text-white/80">Paiement après création</p>
                </div>
                <div className="mb-6 flex-1">
                  <div className="font-semibold text-lg mb-3 text-white">
                    24 intentions avec plusieurs surprises possibles dont :
                  </div>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-center gap-2 text-white/90">
                      <span className="text-[#d4af37]">✔</span>
                      <span>Photos personnalisées</span>
                    </li>
                    <li className="flex items-center gap-2 text-white/90">
                      <span className="text-[#d4af37]">✔</span>
                      <span>Messages personnalisés</span>
                    </li>
                    <li className="flex items-center gap-2 text-white/90">
                      <span className="text-[#d4af37]">✔</span>
                      <span>Dessins créatifs</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handlePlanSelection("plan_essentiel")}
                  className="mt-auto w-full rounded-full px-8 py-4 text-lg font-bold transition-all border-2 border-[#4a0808]"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                    color: '#4a0808'
                  }}
                >
                  Choisir ce plan
                </button>
              </div>

              {/* Plan Premium */}
              <div className="bg-gradient-to-br from-[#d4af37]/20 to-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border-2 border-[#d4af37] hover:shadow-2xl transition-all min-h-[560px] flex flex-col relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-[#4a0808]"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)'
                  }}
                >
                  ⭐ RECOMMANDÉ
                </div>
                <div className="text-center mb-6 mt-6 min-h-[150px] flex flex-col justify-center">
                  <h2 className="text-3xl font-bold mb-2 text-white">Plan Premium</h2>
                  <div className="text-6xl font-bold text-[#d4af37] mb-2">15€</div>
                  <p className="text-white/80">Paiement après création</p>
                </div>
                <div className="mb-6 flex-1">
                  <div className="font-semibold text-lg mb-3 text-white">
                    24 intentions avec plusieurs surprises possibles dont :
                  </div>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-center gap-2 text-white/90">
                      <span className="text-[#d4af37]">✔</span>
                      <span>Photos personnalisées</span>
                    </li>
                    <li className="flex items-center gap-2 text-white/90">
                      <span className="text-[#d4af37]">✔</span>
                      <span>Messages personnalisés</span>
                    </li>
                    <li className="flex items-center gap-2 text-white/90">
                      <span className="text-[#d4af37]">✔</span>
                      <span>Dessins créatifs</span>
                    </li>
                    <li className="flex items-center gap-2 bg-[#d4af37]/20 backdrop-blur -mx-4 px-4 py-2 rounded-lg">
                      <span className="text-[#d4af37] text-xl">✔</span>
                      <span className="font-bold text-white">Musiques personnalisées</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handlePlanSelection("plan_premium")}
                  className="mt-auto w-full rounded-full px-8 py-4 text-lg font-bold transition-all border-2 border-[#4a0808]"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                    color: '#4a0808'
                  }}
                >
                  Choisir le Premium
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Calendar creation */}
        {!showPlanSelection && (
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 border-2 border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                    Personnalisez votre calendrier
                  </h2>
                  <p className="text-white/90">{planPriceLabel}</p>
                </div>
                <button
                  onClick={() => setStep("plan")}
                  className="text-sm text-white/80 hover:text-white border border-white/30 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all"
                >
                  Changer de plan
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">Progression</span>
                  <span className="text-sm font-bold text-[#d4af37]">
                    {filledCount}/24 jours
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${progress}%`,
                      background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)'
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 24 }).map((_, i) => {
                const day = i + 1;
                return (
                  <EmptyEnvelope
                    key={day}
                    day={day}
                    plan={activePlan}
                    content={calendarData[day] || null}
                    onClick={() => setEditingDay(day)}
                  />
                );
              })}
            </div>

            <div className="bg-gradient-to-br from-[#782525]/80 to-[#551313]/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border-2 border-white/20">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <p className="text-sm text-white mb-1">
                    {filledCount === 24
                      ? "✨ Votre calendrier est complet !"
                      : `Encore ${24 - filledCount} jour(s) avant de passer à l'étape suivante`}
                  </p>
                  <p className="text-xs text-white/70">
                    Étape suivante : renseigner les informations du receveur
                  </p>
                  {saveFeedback && (
                    <p className="text-xs text-white/80 mt-2">{saveFeedback}</p>
                  )}
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full lg:w-auto px-8 py-4 rounded-full font-bold text-lg transition-all disabled:opacity-50 border-2 border-[#4a0808] shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                  style={{
                    background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                    color: '#4a0808'
                  }}
                >
                  Continuer vers les infos du receveur
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Editor modal */}
        {editingDay !== null && (
          <EnvelopeEditor
            day={editingDay}
            initialContent={calendarData[editingDay] || null}
            allowMusic={allowMusic}
            plan={activePlan}
            onSave={(content) => handleSaveDay(editingDay, content)}
            onClose={() => setEditingDay(null)}
          />
        )}
        </div>
      </main>
    </>
  );
}
