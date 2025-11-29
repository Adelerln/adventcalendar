"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import ParcoursBanner from "@/components/ParcoursBanner";
import StepNavigation from "@/components/StepNavigation";
import { type PlanKey } from "@/lib/plan-theme";
import { sparkleRandom } from "@/lib/sparkle-random";

const PLAN_INFO = {
  plan_essentiel: {
    name: "Plan Essentiel",
    price: "10€"
  },
  plan_premium: {
    name: "Plan Premium",
    price: "15€"
  }
} as const;

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main
          className="relative min-h-screen flex items-center justify-center"
          style={{ background: "linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)" }}
        >
          <p className="text-white text-xl">Chargement du paiement…</p>
        </main>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const planParam = searchParams?.get("plan");
  const planKey: PlanKey = planParam === "plan_premium" ? "plan_premium" : "plan_essentiel";
  const plan = PLAN_INFO[planKey];
  const recipientName = searchParams?.get("recipient_name") || "Votre proche";
  const relationship = searchParams?.get("relationship") || "Proche";
  const deliveryDate = searchParams?.get("delivery_date") ? new Date(searchParams.get("delivery_date")!).toLocaleDateString("fr-FR") : null;
  const recipientEmail = searchParams?.get("recipient_email");
  const recipientPhone = searchParams?.get("recipient_phone");
  const notes = searchParams?.get("notes");
  const filled = searchParams?.get("filled");

  async function handleCheckout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const detail = body.details ? ` (Détail: ${body.details})` : "";
        if (res.status === 401) {
          throw new Error(body.error || "Vous devez vous reconnecter avant de payer." + detail);
        }
        throw new Error(
          (body.error ||
            "Impossible de lancer Stripe Checkout. Vérifiez votre connexion/bloqueur de pub et réessayez, ou contactez le support.") +
            detail
        );
      }
      const data = await res.json();
      if (data.checkoutUrl) {
        // Rediriger vers Stripe
        window.location.href = data.checkoutUrl as string;
      } else {
        throw new Error("URL de paiement absente");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <Header />
      {/* Fond rouge dégradé */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, #a52a2a 0%, #8b1a1a 40%, #6b0f0f 70%, #4a0808 100%)'
        }}
      />
      {/* Paillettes scintillantes */}
      <div className="absolute inset-0 z-0">
        {[...Array(150)].map((_, i) => {
          const size = sparkleRandom(i, 3) * 6 + 2;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${sparkleRandom(i, 1) * 100}%`,
                left: `${sparkleRandom(i, 2) * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: i % 2 === 0 ? '#d4af37' : '#ffffff',
                opacity: sparkleRandom(i, 4) * 0.6 + 0.2,
                animation: `sparkle ${sparkleRandom(i, 5) * 1.5 + 1}s ease-in-out infinite`,
                animationDelay: `${sparkleRandom(i, 6) * 2}s`,
                transform: `rotate(${sparkleRandom(i, 7) * 360}deg)`,
              }}
            />
          );
        })}
      </div>
      <StepNavigation
        plan={planKey}
        currentStep={5}
        prev={{ href: `/recipient?plan=${planKey}${filled ? `&filled=${filled}` : ""}` }}
        className="mt-6 relative z-10"
      />
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="mt-6 text-4xl md:text-5xl font-bold text-white">
            Finalisez votre paiement
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-3xl mx-auto">
            Vous vous apprêtez à être redirigé(e) vers Stripe afin de régler votre {plan.name.toLowerCase()}. Une fois le paiement validé, vous accéderez automatiquement à l'éditeur de calendrier.
          </p>
        </div>
        <ParcoursBanner plan={planKey} currentStep={5} />

        <div className="grid md:grid-cols-[3fr_2fr] gap-10 items-start">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/20 p-10 space-y-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#d4af37] mb-2">Forfait sélectionné</p>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-white">{plan.name}</h2>
                    <p className="text-sm text-white/70">Calendrier de l&rsquo;Avent personnalisé</p>
                  </div>
                  <div className="text-4xl font-black text-[#d4af37] mt-3 md:mt-0">{plan.price}</div>
                </div>
              </div>
              <div className="rounded-2xl border-2 border-dashed border-[#d4af37] bg-white/5 backdrop-blur p-6">
                <p className="text-sm uppercase tracking-wide text-white/70 mb-2">Récapitulatif</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-white">Total dû</span>
                  <span className="text-3xl font-black text-[#d4af37]">{plan.price}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-xl border-2 border-white/20 p-8 space-y-4">
              <h3 className="text-2xl font-bold text-white">Receveur</h3>
              <p className="text-lg font-semibold text-white/90">
                Nom & prénom : <span className="font-bold text-white">{recipientName}</span>
              </p>
              <p className="text-lg font-semibold text-white/90">
                Relation : <span className="font-bold text-white">{relationship}</span>
              </p>
              {deliveryDate && (
                <p className="text-sm text-white/70">Ouverture prévue le {deliveryDate}</p>
              )}
              {recipientEmail && (
                <p className="text-sm text-white/70">Email : {recipientEmail}</p>
              )}
              {recipientPhone && (
                <p className="text-sm text-white/70">Téléphone : {recipientPhone}</p>
              )}
              {notes && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#d4af37] mb-1">Notes</p>
                  <p className="text-sm text-white/80 whitespace-pre-line">{notes}</p>
                </div>
              )}
              {filled && (
                <p className="text-sm text-white/70">{filled}/24 cases remplies.</p>
              )}
            </div>

            <div className="rounded-3xl shadow-2xl p-8 space-y-6 border-2 border-[#d4af37]"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)'
              }}
            >
              <h3 className="text-3xl font-extrabold text-[#4a0808]">Procéder au paiement</h3>
              <p className="text-lg font-semibold text-[#4a0808]/90">
                Le paiement s'effectue sur Stripe. Utilisez le même e-mail que celui fourni à l&rsquo;étape précédente pour faciliter la correspondance.
              </p>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={loading}
                className="block w-full text-center rounded-full bg-[#4a0808] text-white font-bold py-4 text-lg hover:shadow-xl transition-all border-2 border-[#4a0808] disabled:opacity-60"
              >
                {loading ? "Redirection vers Stripe..." : "Payer via Stripe"}
              </button>
              {error && <p className="text-sm text-[#4a0808]">{error}</p>}
              <div className="bg-[#4a0808]/20 backdrop-blur rounded-2xl p-4 border border-[#4a0808]/30">
                <p className="text-base font-semibold text-[#4a0808]">Une fois le paiement validé</p>
                <p className="text-sm text-[#4a0808]/80">
                  Revenez ici pour accéder immédiatement à l'éditeur.
                </p>
              </div>
              <p className="text-xs text-[#4a0808]/90 text-center">
                Besoin d'aide ? Nous restons disponibles pour vous accompagner.
              </p>
            </div>
          </div>
        </div>
      </section>
      <style jsx>{`
        @keyframes sparkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(2) rotate(180deg);
          }
        }
      `}</style>
    </main>
  );
}
