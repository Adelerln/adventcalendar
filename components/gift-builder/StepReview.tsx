"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import type { GiftDraft } from "@/lib/types";

type Props = {
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  status: string | null;
  error: string | null;
};

function maskPhone(phone: string) {
  if (!phone) return "";
  const trimmed = phone.trim();
  if (trimmed.length <= 4) return trimmed;
  return `${"*".repeat(trimmed.length - 4)}${trimmed.slice(-4)}`;
}

export default function StepReview({ onBack, onSubmit, loading, status, error }: Props) {
  const { watch } = useFormContext<GiftDraft>();
  const title = watch("title");
  const message = watch("message");
  const startsOn = watch("startsOn");
  const theme = watch("theme");
  const recipient = watch("recipient");
  const days = watch("days");

  const completed = useMemo(() => days.filter((day) => day.content.text || day.content.url).length, [days]);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-lg space-y-6">
      <header>
        <p className="text-sm uppercase tracking-widest text-red-500 font-semibold">Étape 3</p>
        <h2 className="text-2xl font-bold text-gray-900">Récapitulatif & paiement</h2>
        <p className="text-gray-500 mt-1">Vérifie les informations avant de lancer le paiement.</p>
      </header>

      <div className="rounded-2xl border border-gray-200 p-4 space-y-2">
        <p className="text-lg font-semibold text-gray-900">{title}</p>
        {message && <p className="text-gray-600">{message}</p>}
        <p className="text-sm text-gray-500">Débute le {startsOn} – Thème {theme}</p>
        <p className="text-sm text-gray-500">Destinataire : {maskPhone(recipient.phone)} {recipient.email ? `| ${recipient.email}` : ""}</p>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-gray-700">Progression : {completed}/24 prêts</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {days.map((day) => (
            <div
              key={day.dayIndex}
              className={`rounded-xl border px-3 py-2 text-center text-sm font-semibold ${
                day.content.text || day.content.url ? "border-green-400 text-green-700" : "border-orange-300 text-orange-600"
              }`}
            >
              J{day.dayIndex}
            </div>
          ))}
        </div>
      </div>

      {status && <p className="text-sm text-green-600">{status}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} className="rounded-full border border-gray-300 px-6 py-3 font-semibold">
          Retour
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="rounded-full bg-green-600 px-6 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Paiement en cours..." : "Procéder au paiement (démo)"}
        </button>
      </div>
    </section>
  );
}
