"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  searchParams?: { auth?: string; plan?: string };
}

export default function RecipientInfoPage({ searchParams }: Props) {
  const router = useRouter();
  const isAuthenticated = searchParams?.auth === "ok";
  const plan = searchParams?.plan ?? "plan_essentiel";
  const [recipient, setRecipient] = useState({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("Pour toi 🎁");

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 py-16 px-4">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-2xl text-center space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-red-500 font-semibold">Étape verrouillée</p>
          <h1 className="text-3xl font-bold text-gray-900">Merci de vous connecter avant de renseigner le bénéficiaire</h1>
          <button
            onClick={() => router.push(`/gift/login?plan=${plan}`)}
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-3 text-white font-semibold shadow-lg hover:bg-red-700"
          >
            Revenir à l&rsquo;étape 2
          </button>
        </div>
      </main>
    );
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(`/gift/pay?auth=ok&recipient=ok&plan=${plan}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 py-16 px-4">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-red-500 font-semibold">Étape 3/5</p>
          <h1 className="text-4xl font-bold text-gray-900">Renseignez le bénéficiaire</h1>
          <p className="text-gray-600">Ces informations permettront d’envoyer le lien magique et de personnaliser le ton du calendrier.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-semibold text-gray-700">
              Nom complet
              <input
                required
                value={recipient.name}
                onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3"
                placeholder="Nom du proche"
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Email
              <input
                type="email"
                required
                value={recipient.email}
                onChange={(e) => setRecipient({ ...recipient, email: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3"
                placeholder="destinataire@example.com"
              />
            </label>
          </div>
          <label className="text-sm font-semibold text-gray-700">
            Téléphone (optionnel)
            <input
              value={recipient.phone}
              onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3"
              placeholder="+33 6 12 34 56 78"
            />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Message d&rsquo;introduction
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 h-32"
            />
          </label>
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => router.push(`/gift/login?plan=${plan}`)}
              className="rounded-full border border-gray-300 px-6 py-3 font-semibold"
            >
              Retour
            </button>
            <button type="submit" className="rounded-full bg-green-600 px-6 py-3 text-white font-semibold shadow">
              Enregistrer et continuer
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
