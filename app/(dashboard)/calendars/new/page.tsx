"use client";

import { useForm } from "react-hook-form";

type FormValues = {
  title: string;
  recipientEmail: string;
  recipientName?: string;
};

export default function NewCalendarPage() {
  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: { title: "", recipientEmail: "", recipientName: "" },
  });

  function onSubmit(values: FormValues) {
    // Placeholder: wire up to server action later
    alert(`Calendrier créé: ${values.title} → ${values.recipientEmail}`);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">Nouveau calendrier</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Titre</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" {...register("title", { required: true })} />
        </div>
        <div>
          <label className="block text-sm font-medium">E-mail destinataire</label>
          <input type="email" className="mt-1 w-full rounded-md border px-3 py-2" {...register("recipientEmail", { required: true })} />
        </div>
        <div>
          <label className="block text-sm font-medium">Nom destinataire (optionnel)</label>
          <input className="mt-1 w-full rounded-md border px-3 py-2" {...register("recipientName")} />
        </div>
        <button disabled={formState.isSubmitting} className="rounded-md bg-black text-white px-5 py-3">
          Continuer
        </button>
      </form>
    </main>
  );
}


