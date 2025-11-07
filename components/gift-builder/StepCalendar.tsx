"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import type { GiftDraft } from "@/lib/types";
import DayEditor from "./DayEditor";

const themes = [
  { value: "classic", label: "Classique", accent: "from-red-500 to-rose-500" },
  { value: "minimal", label: "Minimal", accent: "from-gray-100 to-gray-300" },
  { value: "festive", label: "Festif", accent: "from-green-500 to-emerald-500" }
];

type Props = {
  onBack: () => void;
  onNext: () => void;
};

export default function StepCalendar({ onBack, onNext }: Props) {
  const { watch, setValue } = useFormContext<GiftDraft>();
  const theme = watch("theme");
  const days = watch("days");
  const [editingDay, setEditingDay] = useState<number | null>(null);

  const handleSaveDay = (updatedDay: GiftDraft["days"][number]) => {
    const nextDays = days.map((day) => (day.dayIndex === updatedDay.dayIndex ? updatedDay : day));
    setValue("days", nextDays, { shouldValidate: true });
    setEditingDay(null);
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-lg space-y-6">
      <header>
        <p className="text-sm uppercase tracking-widest text-red-500 font-semibold">Étape 2</p>
        <h2 className="text-2xl font-bold text-gray-900">Personnalise ton calendrier</h2>
        <p className="text-gray-500 mt-1">Choisis un thème et remplis les 24 intentions.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        {themes.map((t) => (
          <button
            type="button"
            key={t.value}
            className={`rounded-2xl border-2 px-4 py-4 text-left transition ${
              theme === t.value ? "border-red-500 shadow-xl" : "border-gray-200"
            }`}
            onClick={() => setValue("theme", t.value as GiftDraft["theme"], { shouldValidate: true })}
          >
            <span className="text-sm uppercase tracking-widest text-gray-500">Thème</span>
            <p className="text-xl font-semibold text-gray-900">{t.label}</p>
            <div className={`mt-3 h-2 rounded-full bg-gradient-to-r ${t.accent}`}></div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {days.map((day) => (
          <button
            key={day.dayIndex}
            type="button"
            onClick={() => setEditingDay(day.dayIndex)}
            className="rounded-2xl border border-gray-200 p-4 text-left hover:border-red-400 hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-bold text-gray-900">J{day.dayIndex}</span>
              <span className={`text-xs font-semibold ${day.content.text ? "text-green-600" : "text-orange-500"}`}>
                {day.content.text || day.content.url ? "OK" : "À compléter"}
              </span>
            </div>
            <p className="text-sm text-gray-500 h-10 overflow-hidden">
              {day.contentType === "text" ? day.content.text : day.content.url}
            </p>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="rounded-full border border-gray-300 px-6 py-3 font-semibold">
          Retour
        </button>
        <button type="button" onClick={onNext} className="rounded-full bg-red-600 px-6 py-3 font-semibold text-white">
          Continuer
        </button>
      </div>

      {editingDay && (
        <DayEditor
          key={editingDay}
          day={days.find((d) => d.dayIndex === editingDay)!}
          onCancel={() => setEditingDay(null)}
          onSave={handleSaveDay}
        />
      )}
    </section>
  );
}
