"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function DemoPayButton({ plan }: { plan?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      router.push(`/gift/new?access=demo&plan=${plan ?? "plan_essentiel"}`);
    }, 800);
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="mt-6 w-full rounded-full bg-green-600 px-6 py-3 text-white font-semibold shadow-lg hover:bg-green-700 disabled:opacity-70"
    >
      {loading ? "Paiement en cours..." : "Payer mon abonnement (démo)"}
    </button>
  );
}

interface Props {
  searchParams?: { auth?: string; recipient?: string; plan?: string };
}

export default function GiftPayPage({ searchParams }: Props) {
  const isAuthenticated = searchParams?.auth === "ok";
  const hasRecipient = searchParams?.recipient === "ok";
  const selectedPlan = searchParams?.plan;

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-white via-red-50 to-green-50 py-16 px-4">
        <div className="mx-auto max-w-3xl space-y-6 rounded-3xl bg-white p-8 text-center shadow-2xl">
          <p className="text-sm uppercase tracking-[0.4em] text-red-500 font-semibold">Étape verrouillée</p>
          <h1 className="text-3xl font-bold text-gray-900">Merci de vous authentifier avant le paiement</h1>
          <p className="text-gray-600">Cliquez sur le bouton ci-dessous pour revenir à l&rsquo;étape de connexion.</p>
          <Link
            href="/gift/login"
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-3 text-white font-semibold shadow-lg hover:bg-red-700"
          >
            Revenir à l&rsquo;étape 2
          </Link>
        </div>
      </main>
    );
  }

  if (!hasRecipient) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-white via-red-50 to-green-50 py-16 px-4">
        <div className="mx-auto max-w-3xl space-y-6 rounded-3xl bg-white p-8 text-center shadow-2xl">
          <p className="text-sm uppercase tracking-[0.4em] text-red-500 font-semibold">Étape verrouillée</p>
          <h1 className="text-3xl font-bold text-gray-900">Merci de remplir les informations du bénéficiaire avant le paiement</h1>
          <button
            onClick={() => (window.location.href = `/gift/recipient?auth=ok&plan=${selectedPlan ?? "plan_essentiel"}`)}
            className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-3 text-white font-semibold shadow-lg hover:bg-red-700"
          >
            Revenir à l&rsquo;étape 3
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-red-50 to-green-50 py-16 px-4">
      <div className="mx-auto max-w-4xl space-y-8 rounded-3xl bg-white p-8 shadow-2xl">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-green-600 font-semibold">Étape 2/3</p>
          <h1 className="text-4xl font-bold text-gray-900">Choisis ton forfait avant de créer ton calendrier</h1>
          <p className="text-gray-600">Le paiement déverrouille l’éditeur et te donne accès à la personnalisation complète.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div
            className={`rounded-3xl border-2 p-6 space-y-3 ${
              selectedPlan === "plan_essentiel" ? "border-red-400 shadow-lg" : "border-red-200"
            }`}
          >
            <h2 className="text-2xl font-bold text-gray-900">Forfait Classique</h2>
            <p className="text-4xl font-black text-red-600">10€</p>
            <ul className="space-y-2 text-gray-600">
              <li>• 24 messages personnalisés</li>
              <li>• Partage via lien magique</li>
              <li>• Support email</li>
            </ul>
          </div>
          <div
            className={`rounded-3xl border-4 p-6 space-y-3 bg-green-50 ${
              selectedPlan === "plan_premium" ? "border-green-500 shadow-lg" : "border-green-400"
            }`}
          >
            <p className="text-xs uppercase tracking-widest text-green-700 font-semibold">Recommandé</p>
            <h2 className="text-2xl font-bold text-gray-900">Forfait Festif</h2>
            <p className="text-4xl font-black text-green-600">15€</p>
            <ul className="space-y-2 text-gray-600">
              <li>• Contenus illimités (texte, images, liens)</li>
              <li>• Accès anticipé et badges festifs</li>
              <li>• Support prioritaire</li>
            </ul>
          </div>
        </div>

        <DemoPayButton plan={selectedPlan} />

        <p className="text-center text-sm text-gray-500">
          Une fois le paiement validé, tu es automatiquement redirigé vers l’éditeur complet.
        </p>

        <div className="text-center text-sm">
          <Link href="/pricing" className="text-red-600 font-semibold hover:underline">
            Besoin de comparer les plans en détail ?
          </Link>
        </div>
      </div>
    </main>
  );
}
