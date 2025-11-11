"use client";

import { useFormContext } from "react-hook-form";
import type { GiftDraft } from "@/lib/types";
import { normalizePhone } from "@/lib/phone";

type Props = {
  onNext: () => void;
};

export default function StepRecipient({ onNext }: Props) {
  const {
    register,
    setValue,
    formState: { errors }
  } = useFormContext<GiftDraft>();

  const handlePhoneBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const normalized = normalizePhone(event.target.value);
    setValue("recipient.phone", normalized, { shouldValidate: true });
  };

  return (
    <section className="rounded-3xl bg-white p-6 shadow-lg space-y-6">
      <header>
        <p className="text-sm uppercase tracking-widest text-red-500 font-semibold">Étape 1</p>
        <h2 className="text-2xl font-bold text-gray-900">Destinataire & informations clés</h2>
        <p className="text-gray-500 mt-1">Présente ton cadeau et renseigne les coordonnées du bénéficiaire.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="text-sm font-semibold text-gray-700">
          Titre du calendrier
          <input
            {...register("title")}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          {errors.title && <span className="text-sm text-red-500">{errors.title.message}</span>}
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Message d&rsquo;intro
          <input
            {...register("message")}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            placeholder="Un mot doux pour démarrer"
          />
          {errors.message && <span className="text-sm text-red-500">{errors.message.message}</span>}
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Fuseau horaire
          <input
            {...register("timezone")}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            placeholder="Europe/Paris"
          />
          {errors.timezone && <span className="text-sm text-red-500">{errors.timezone.message}</span>}
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="text-sm font-semibold text-gray-700">
          Téléphone du bénéficiaire
          <input
            {...register("recipient.phone")}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            placeholder="06 12 34 56 78"
            onBlur={handlePhoneBlur}
          />
          {errors.recipient?.phone && <span className="text-sm text-red-500">{errors.recipient.phone.message}</span>}
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Email
          <input
            {...register("recipient.email")}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
            placeholder="prenom@example.com"
          />
          {errors.recipient?.email && <span className="text-sm text-red-500">{errors.recipient.email.message}</span>}
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="rounded-full bg-red-600 px-6 py-3 font-semibold text-white shadow-lg hover:bg-red-700"
        >
          Continuer
        </button>
      </div>
    </section>
  );
}
