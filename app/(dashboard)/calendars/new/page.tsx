"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import EmptyEnvelope from "@/components/EmptyEnvelope";
import EnvelopeEditor from "@/components/EnvelopeEditor";
import ParcoursBanner from "@/components/ParcoursBanner";
import { PLAN_APPEARANCE, DEFAULT_PLAN, type PlanKey } from "@/lib/plan-theme";
import StepNavigation from "@/components/StepNavigation";

type Plan = PlanKey | null;

type DayContent = {
  type: "photo" | "message" | "drawing" | "music";
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
    if (!selectedPlan && session?.plan) {
      setSelectedPlan(session.plan);
    }
  }, [selectedPlan, session]);

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

  const activePlan = (selectedPlan ?? planFromQuery ?? session?.plan ?? DEFAULT_PLAN) as PlanKey;
  const planTheme = PLAN_APPEARANCE[activePlan];
  const planPriceLabel = activePlan === "plan_premium" ? "Plan Premium (20€)" : "Plan Essentiel (10€)";
  const allowMusic = activePlan === "plan_premium";
  const showPlanSelection = step === "plan";
  const currentParcoursStep = showPlanSelection ? 1 : 3;
  const filledCount = Object.keys(calendarData).length;
  const progress = (filledCount / 24) * 100;
  const heroTitle = showPlanSelection ? "Choisissez votre forfait" : "Personnalisez votre calendrier";
  const heroSubtitle = showPlanSelection
    ? "Sélectionnez l'offre qui correspond à votre surprise."
    : "Complétez vos 24 attentions avant d'aller vers le bénéficiaire.";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-24 px-6 py-12 space-y-10">
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{heroTitle}</h1>
          <p className="text-lg text-gray-600">{heroSubtitle}</p>
        </div>
        <ParcoursBanner plan={activePlan} currentStep={currentParcoursStep} className="max-w-7xl mx-auto" />
        {/* Step 1: Plan selection */}
        {showPlanSelection && (
          <div className="mx-auto max-w-5xl">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Plan Essentiel */}
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-300 hover:shadow-2xl transition-all min-h-[560px] flex flex-col">
                <div className="text-center mb-6 mt-6 min-h-[150px] flex flex-col justify-center">
                  <h2 className="text-3xl font-bold mb-2">Plan Essentiel</h2>
                  <div className="text-6xl font-bold text-gray-500 mb-2">10€</div>
                  <p className="text-gray-600">Paiement après création</p>
                </div>
                <div className="mb-6 flex-1">
                  <div className="font-semibold text-lg mb-3 text-gray-800">
                    24 intentions avec plusieurs surprises possibles dont :
                  </div>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-center gap-2">
                      <span className="text-[#06B800]">✔</span>
                      <span>Photos personnalisées</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#06B800]">✔</span>
                      <span>Messages personnalisés</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#06B800]">✔</span>
                      <span>Dessins créatifs</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handlePlanSelection("plan_essentiel")}
                  className="mt-auto w-full rounded-full bg-[#f0f2f6] text-[#4d5663] px-8 py-4 text-lg font-bold hover:bg-[#e0e4ec] transition-all"
                >
                  Choisir ce plan
                </button>
              </div>

              {/* Plan Premium */}
              <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-[#ead3c0] hover:shadow-2xl transition-all min-h-[560px] flex flex-col">
                <div className="text-center mb-6 mt-6 min-h-[150px] flex flex-col justify-center">
                  <h2 className="text-3xl font-bold mb-2">Plan Premium</h2>
                  <div className="text-6xl font-bold text-[#cda982] mb-2">20€</div>
                  <p className="text-gray-600">Paiement après création</p>
                </div>
                <div className="mb-6 flex-1">
                  <div className="font-semibold text-lg mb-3 text-gray-800">
                    24 intentions avec plusieurs surprises possibles dont :
                  </div>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-center gap-2">
                      <span className="text-[#06B800]">✔</span>
                      <span>Photos personnalisées</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#06B800]">✔</span>
                      <span>Messages personnalisés</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#06B800]">✔</span>
                      <span>Dessins créatifs</span>
                    </li>
                    <li className="flex items-center gap-2 bg-[#fdf6f1] -mx-4 px-4 py-2 rounded-lg">
                      <span className="text-[#06B800] text-xl">✔</span>
                      <span className="font-bold text-[#c89b65]">Musiques personnalisées</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handlePlanSelection("plan_premium")}
                  className="mt-auto w-full rounded-full bg-[#fbeedc] text-[#5c3b1d] px-8 py-4 text-lg font-bold hover:bg-[#f3dfc7] transition-all"
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
            <div className={`bg-white rounded-2xl shadow-lg p-6 border ${planTheme.border}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={`text-3xl font-bold ${planTheme.accentText}`}>
                    Personnalisez votre calendrier
                  </h2>
                  <p className={planTheme.mutedText}>{planPriceLabel}</p>
                </div>
                <button
                  onClick={() => setStep("plan")}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Changer de plan
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Progression</span>
                  <span className={`text-sm font-bold ${planTheme.accentText}`}>
                    {filledCount}/24 jours
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${planTheme.progressFill} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${progress}%` }}
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

            <div className={`bg-white rounded-2xl shadow-lg p-6 border ${planTheme.border}`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {filledCount === 24
                      ? "✨ Votre calendrier est complet !"
                      : `Encore ${24 - filledCount} jour(s) avant de passer à l'étape suivante`}
                  </p>
                  <p className="text-xs text-gray-500">
                    Étape suivante : renseigner les informations du receveur
                  </p>
                </div>
                <button
                  onClick={handleContinue}
                  className={`${planTheme.ctaBg} ${planTheme.ctaHover} ${planTheme.ctaText} px-8 py-4 rounded-full font-bold text-lg transition-all disabled:opacity-50`}
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
      </main>
    </>
  );
}
