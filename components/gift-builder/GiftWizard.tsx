"use client";

import { useState } from "react";
import { FormProvider, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import StepRecipient from "./StepRecipient";
import StepCalendar from "./StepCalendar";
import StepReview from "./StepReview";
import type { GiftDraft } from "@/lib/types";
import { giftDraftSchema } from "@/lib/schemas";

const defaultDays = () =>
  Array.from({ length: 24 }, (_, i) => ({
    dayIndex: i + 1,
    contentType: "text" as const,
    content: { text: `Surprise ${i + 1}` }
  }));

export default function GiftWizard() {
  const router = useRouter();
  const methods = useForm<GiftDraft>({
    mode: "onChange",
    resolver: zodResolver(giftDraftSchema),
    defaultValues: {
      title: "Calendrier magique",
      message: "",
      startsOn: `${new Date().getFullYear()}-12-01`,
      timezone: "Europe/Paris",
      theme: "classic",
      recipient: {
        phone: "",
        email: ""
      },
      days: defaultDays()
    }
  });

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const goNext = async (fields?: FieldPath<GiftDraft> | FieldPath<GiftDraft>[]) => {
    const valid = await methods.trigger(fields);
    if (valid) {
      setStep((s) => Math.min(s + 1, 2));
    }
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleCheckout = async () => {
    setError(null);
    const valid = await methods.trigger();
    if (!valid) {
      setError("Merci de compléter les informations manquantes.");
      return;
    }

    setLoading(true);
    setStatus("Initialisation du paiement (démo)...");
    try {
      const payload = methods.getValues();
      const checkoutRes = await fetch("/api/gift/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!checkoutRes.ok) throw new Error("Impossible de lancer le paiement");
      const checkoutData = await checkoutRes.json();

      setStatus("Finalisation du cadeau...");
      const finalizeRes = await fetch("/api/gift/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ giftId: checkoutData.giftId })
      });
      if (!finalizeRes.ok) throw new Error("Impossible de finaliser le cadeau");
      const finalizeData = await finalizeRes.json();
      const shareUrl = finalizeData.shareUrl as string;
      router.push(`/gift/${checkoutData.giftId}/share?shareUrl=${encodeURIComponent(shareUrl)}&token=${finalizeData.token}`);
    } catch (err: any) {
      setError(err.message ?? "Une erreur est survenue");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {["Destinataire", "Calendrier", "Récap"].map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                step >= index ? "bg-red-600" : "bg-gray-300"
              }`}>
                {index + 1}
              </div>
              <span className={step === index ? "font-semibold text-gray-900" : "hidden sm:block"}>{label}</span>
              {index < 2 && <span className="text-gray-300">—</span>}
            </div>
          ))}
        </div>

        {step === 0 && <StepRecipient onNext={() => goNext(["title", "message", "startsOn", "timezone", "recipient.phone", "recipient.email"])} />}
        {step === 1 && <StepCalendar onBack={goBack} onNext={() => goNext(["theme", "days"])} />}
        {step === 2 && (
          <StepReview
            onBack={goBack}
            onSubmit={handleCheckout}
            loading={loading}
            status={status}
            error={error}
          />
        )}
      </div>
    </FormProvider>
  );
}
