"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import EmptyEnvelope from "@/components/EmptyEnvelope";
import EnvelopeEditor from "@/components/EnvelopeEditor";

type Plan = "plan_essentiel" | "plan_premium" | null;

type DayContent = {
  type: "photo" | "message" | "drawing" | "music";
  content: string;
  title?: string;
};

export default function NewCalendarPage() {
  const [step, setStep] = useState<"plan" | "creation">("plan");
  const [selectedPlan, setSelectedPlan] = useState<Plan>(null);
  const [calendarData, setCalendarData] = useState<Record<number, DayContent>>({});
  const [editingDay, setEditingDay] = useState<number | null>(null);

  // Détecter si un plan est passé dans l'URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const planFromUrl = new URLSearchParams(window.location.search).get("plan") as Plan;
    if (planFromUrl === "plan_essentiel" || planFromUrl === "plan_premium") {
      setSelectedPlan(planFromUrl);
      setStep("creation");
    }
  }, []);

  const handlePlanSelection = (plan: Plan) => {
    setSelectedPlan(plan);
    setStep("creation");
  };

  const handleSaveDay = (day: number, content: DayContent) => {
    setCalendarData(prev => ({
      ...prev,
      [day]: content
    }));
  };

  const handleFinish = () => {
    const filledDays = Object.keys(calendarData).length;
    if (filledDays < 24) {
      const confirm = window.confirm(
        `Vous avez rempli ${filledDays}/24 jours. Voulez-vous continuer quand même ?`
      );
      if (!confirm) return;
    }

    // Rediriger vers le paiement avec les données du calendrier
    alert(`Calendrier prêt ! Plan: ${selectedPlan}\nJours remplis: ${filledDays}/24\n\nRedirection vers le paiement...`);
    // TODO: Sauvegarder les données et rediriger vers Stripe
  };

  const allowMusic = selectedPlan === "plan_premium";
  const filledCount = Object.keys(calendarData).length;
  const progress = (filledCount / 24) * 100;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 dark:from-red-950 dark:via-gray-900 dark:to-green-950 pt-24 px-6 py-12">
        {/* Step 1: Plan selection */}
        {step === "plan" && (
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 text-red-600 dark:text-red-500">
                Créer mon calendrier
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300">
                Choisissez votre plan pour commencer
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Plan Essentiel */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border-2 border-red-300 hover:shadow-2xl transition-all">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold mb-2">Plan Essentiel</h2>
                  <div className="text-6xl font-bold text-red-600 mb-2">10€</div>
                  <p className="text-gray-600 dark:text-gray-400">Paiement après création</p>
                </div>
                <div className="mb-6">
                  <div className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                    24 intentions composées de :
                  </div>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">📷</span>
                      <span>Photos personnalisées</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">💌</span>
                      <span>Messages personnalisés</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">🎨</span>
                      <span>Dessins créatifs</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handlePlanSelection("plan_essentiel")}
                  className="w-full rounded-full bg-red-600 text-white px-8 py-4 text-lg font-bold hover:shadow-xl transition-all"
                >
                  Choisir ce plan
                </button>
              </div>

              {/* Plan Premium */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border-4 border-green-500 hover:shadow-2xl transition-all relative">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                  ⭐ POPULAIRE
                </div>
                <div className="text-center mb-6 mt-4">
                  <h2 className="text-3xl font-bold mb-2">Plan Premium</h2>
                  <div className="text-6xl font-bold text-green-600 mb-2">15€</div>
                  <p className="text-gray-600 dark:text-gray-400">Paiement après création</p>
                </div>
                <div className="mb-6">
                  <div className="font-semibold text-lg mb-3 text-gray-800 dark:text-gray-200">
                    24 intentions composées de :
                  </div>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">📷</span>
                      <span>Photos personnalisées</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">💌</span>
                      <span>Messages personnalisés</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">🎨</span>
                      <span>Dessins créatifs</span>
                    </li>
                    <li className="flex items-center gap-2 bg-green-50 dark:bg-green-950 -mx-4 px-4 py-2 rounded-lg">
                      <span className="text-yellow-500 text-xl">🎵</span>
                      <span className="font-bold text-green-700 dark:text-green-300">Musiques personnalisées</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handlePlanSelection("plan_premium")}
                  className="w-full rounded-full bg-green-600 text-white px-8 py-4 text-lg font-bold hover:shadow-2xl transition-all"
                >
                  Choisir le Premium
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Calendar creation */}
        {step === "creation" && (
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-red-600 dark:text-red-500">
                    Personnalisez votre calendrier
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Plan: {selectedPlan === "plan_premium" ? "Premium (15€)" : "Essentiel (10€)"}
                  </p>
                </div>
                <button
                  onClick={() => setStep("plan")}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Changer de plan
                </button>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Progression</span>
                  <span className="text-sm font-bold text-green-600">{filledCount}/24 jours</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-red-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Grid of envelopes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              {Array.from({ length: 24 }).map((_, i) => {
                const day = i + 1;
                return (
                  <EmptyEnvelope
                    key={day}
                    day={day}
                    content={calendarData[day] || null}
                    onClick={() => setEditingDay(day)}
                  />
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {filledCount === 24 
                      ? "✨ Votre calendrier est complet !" 
                      : `Il reste ${24 - filledCount} jour(s) à remplir`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Vous pourrez payer une fois votre calendrier terminé
                  </p>
                </div>
                <button
                  onClick={handleFinish}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition-all disabled:opacity-50"
                >
                  Terminer et payer
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
            onSave={(content) => handleSaveDay(editingDay, content)}
            onClose={() => setEditingDay(null)}
          />
        )}
      </main>
    </>
  );
}
