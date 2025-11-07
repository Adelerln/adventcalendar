"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { daySchema } from "@/lib/schemas";
import type { CalendarDay } from "@/lib/types";

type Props = {
  day: CalendarDay;
  onSave: (day: CalendarDay) => void;
  onCancel: () => void;
};

export default function DayEditor({ day, onSave, onCancel }: Props) {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors }
  } = useForm<CalendarDay>({
    resolver: zodResolver(daySchema),
    defaultValues: day
  });

  const contentType = watch("contentType");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form
        onSubmit={handleSubmit(onSave)}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4"
      >
        <h3 className="text-xl font-bold">Jour {day.dayIndex}</h3>

        <label className="text-sm font-semibold text-gray-700">
          Type de contenu
          <select
            {...register("contentType")}
            className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2"
          >
            <option value="text">Texte</option>
            <option value="image">Image (URL)</option>
            <option value="video">Vidéo (URL)</option>
            <option value="link">Lien</option>
          </select>
        </label>

        {contentType === "text" ? (
          <label className="text-sm font-semibold text-gray-700">
            Message
            <textarea
              {...register("content.text")}
              className="mt-1 h-32 w-full rounded-2xl border border-gray-200 px-4 py-2"
            />
            {errors.content?.text && (
              <span className="text-sm text-red-500">{errors.content.text.message}</span>
            )}
          </label>
        ) : (
          <label className="text-sm font-semibold text-gray-700">
            URL
            <input
              {...register("content.url")}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-2"
              placeholder="https://..."
            />
            {errors.content?.url && (
              <span className="text-sm text-red-500">{errors.content.url.message}</span>
            )}
          </label>
        )}

        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-gray-300 px-5 py-2 font-semibold"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="rounded-full bg-green-600 px-5 py-2 font-semibold text-white"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
