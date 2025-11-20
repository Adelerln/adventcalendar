"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import GoldenEnvelopeTree from "@/components/GoldenEnvelopeTree";
import { type PlanKey } from "@/lib/plan-theme";

type Project = {
  id: string;
  plan: PlanKey;
  payment_status: "pending" | "paid";
  payment_amount: number;
  stripe_checkout_session_id?: string | null;
};

// Données d'exemple pour le calendrier de démonstration
const mockCalendarData = [
  { day: 1, photo: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400", message: "Notre premier Noël ensemble ❤️", drawing: null, music: null },
  { day: 2, photo: null, message: "Je pense à toi chaque jour... Tu illumines ma vie comme les guirlandes illuminent le sapin ! 🎄✨", drawing: null, music: null },
  { day: 3, photo: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400", message: "Ce moment magique", drawing: null, music: null },
  { day: 4, photo: null, message: "4 jours de décembre... 4 raisons de sourire. Tu es ma plus belle raison ! 💖", drawing: null, music: null },
  { day: 5, photo: null, message: null, drawing: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23fff' width='200' height='200'/%3E%3Ctext x='100' y='100' text-anchor='middle' fill='%23e63946' font-size='60' font-family='Arial'%3E❤️%3C/text%3E%3C/svg%3E", music: null },
  { day: 6, photo: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=400", message: "Souvenirs de neige ❄️", drawing: null, music: null },
  { day: 7, photo: null, message: "Une semaine déjà ! Chaque jour avec toi est un cadeau 🎁", drawing: null, music: null },
  { day: 8, photo: "https://images.unsplash.com/photo-1544273677-95fb17c8ca3b?w=400", message: "Les lumières de la ville", drawing: null, music: null },
  { day: 9, photo: null, message: "9 jours... 9 sourires... 9 moments précieux à tes côtés 💫", drawing: null, music: null },
  { day: 10, photo: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400", message: "Douceur hivernale", drawing: null, music: null },
  { day: 11, photo: null, message: "Tu es ma plus belle aventure ! 🌟", drawing: null, music: null },
  { day: 12, photo: "https://images.unsplash.com/photo-1512916206820-91b2da6145b4?w=400", message: "Ambiance festive 🎊", drawing: null, music: null },
  { day: 13, photo: null, message: "À mi-chemin de Noël... et je t'aime de plus en plus ! 💝", drawing: null, music: null },
  { day: 14, photo: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400", message: "Chocolat chaud ensemble ☕", drawing: null, music: null },
  { day: 15, photo: null, message: "15 jours de bonheur... et ce n'est que le début ! ✨", drawing: null, music: null },
  { day: 16, photo: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400", message: "Paysage hivernal", drawing: null, music: null },
  { day: 17, photo: null, message: "Plus que 7 jours avant Noël ! Tu es mon plus beau cadeau 🎁❤️", drawing: null, music: null },
  { day: 18, photo: "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=400", message: "Magie des fêtes", drawing: null, music: null },
  { day: 19, photo: null, message: "5 jours... Mon cœur bat la chamade à l'idée de passer Noël avec toi ! 💓", drawing: null, music: null },
  { day: 20, photo: "https://images.unsplash.com/photo-1514897575457-c4db467cf78e?w=400", message: "Moments précieux", drawing: null, music: null },
  { day: 21, photo: null, message: "3 jours avant le grand jour ! Tu rends tout magique ✨🎄", drawing: null, music: null },
  { day: 22, photo: "https://images.unsplash.com/photo-1545278452-7c60720592da?w=400", message: "Décorations scintillantes", drawing: null, music: null },
  { day: 23, photo: null, message: "Demain c'est Noël ! J'ai tellement hâte de le célébrer avec toi ! 🎅❤️", drawing: null, music: null },
  { day: 24, photo: "https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=400", message: "Joyeux Noël mon amour ! 🎄❤️🎁", drawing: null, music: null },
];

function PaymentBlock() {
  const searchParams = useSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const payLabel = useMemo(() => {
    const plan = project?.plan ?? "plan_essentiel";
    return plan === "plan_premium" ? "Payer (15€)" : "Payer (10€)";
  }, [project?.plan]);

  useEffect(() => {
    void fetchPayment();
    const status = searchParams?.get("payment");
    if (status === "success") {
      setSuccessMessage("Paiement validé !");
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      window.history.replaceState({}, "", url.toString());
    } else if (status === "cancelled") {
      setError("Paiement annulé.");
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  async function fetchPayment() {
    setError(null);
    try {
      const res = await fetch("/api/payment-status", { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) {
          setError("Connectez-vous pour lancer le paiement.");
          return;
        }
        throw new Error("Impossible de récupérer le projet");
      }
      const data = await res.json();
      setProject(
        data.payment
          ? {
              id: data.payment.id,
              plan: data.payment.plan,
              payment_status: data.payment.payment_status,
              payment_amount: data.payment.payment_amount,
              stripe_checkout_session_id: data.payment.stripe_checkout_session_id
            }
          : null
      );
    } catch (err) {
      setError("Impossible de récupérer le statut du paiement.");
    }
  }

  async function handlePay() {
    setLoadingCheckout(true);
    setError(null);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project?.id })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Impossible de démarrer le paiement Stripe");
      }
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl as string;
      } else {
        throw new Error("URL Stripe manquante");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
      setLoadingCheckout(false);
    }
  }

  async function handleGenerate() {
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Paiement requis avant génération");
      }
      setSuccessMessage("Paiement validé. Génération prête !");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    } finally {
      setChecking(false);
    }
  }

  const isPaid = project?.payment_status === "paid";

  return (
    <section className="bg-white/10 border border-white/20 rounded-3xl shadow-xl p-6 text-white space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-[#d4af37]">Paiement</p>
          <h2 className="text-2xl font-bold">Statut: {isPaid ? "payé" : "en attente"}</h2>
        </div>
        <button
          onClick={fetchPayment}
          className="px-3 py-2 rounded-full border border-white/30 text-sm hover:bg-white/10"
        >
          Rafraîchir
        </button>
      </div>

      {isPaid ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-green-300 bg-green-700/30 px-4 py-3 text-sm">
            Paiement validé. Merci !
          </div>
          <button
            onClick={handleGenerate}
            disabled={checking}
            className="rounded-full bg-white text-[#4a0808] font-semibold py-3 px-5 hover:shadow-lg disabled:opacity-60"
          >
            {checking ? "Vérification..." : "Générer mon calendrier"}
          </button>
          {successMessage && <p className="text-sm text-green-200">{successMessage}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-white/80">
            Cliquez sur le bouton pour être redirigé vers Stripe et finaliser le règlement.
          </p>
          <button
            onClick={handlePay}
            disabled={loadingCheckout}
            className="rounded-full bg-[#d4af37] text-[#4a0808] font-bold py-3 px-5 hover:shadow-lg disabled:opacity-60"
          >
            {loadingCheckout ? "Redirection vers Stripe..." : payLabel}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-200">{error}</p>}
      {successMessage && <p className="text-sm text-green-200">{successMessage}</p>}
    </section>
  );
}

export default function DashboardPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const days = mockCalendarData.map((data) => ({
    day: data.day,
    isUnlocked: true,
    isToday: false,
    photo: data.photo,
    message: data.message,
    drawing: data.drawing,
    music: data.music,
  }));

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-red-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <PaymentBlock />
        </div>
        <GoldenEnvelopeTree days={days} onDayClick={handleDayClick} />
      </main>
    </>
  );
}
