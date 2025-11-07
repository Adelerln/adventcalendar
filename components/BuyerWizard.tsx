"use client";
import { useState } from "react";

export default function BuyerWizard() {
  const [title, setTitle] = useState("Pour toi 🎁");
  const [buyerId] = useState("dev-buyer-1");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [days, setDays] = useState<string[]>(Array(24).fill(""));
  const [debugUnlock, setDebugUnlock] = useState(false);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    try {
      const res = await fetch("/api/advent/buyer/calendars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId,
          title,
          recipient: {
            displayName: recipientName,
            phoneE164: recipientPhone || null,
            email: recipientEmail || null
          },
          start_date: new Date(new Date().getFullYear(), 11, 1).toISOString(),
          delivery: recipientPhone ? "sms" : "email",
          days,
          debugUnlock
        })
      });
      const data = await res.json();
      setLink(data.link);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <label className="block text-sm font-semibold">
          Titre
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="border p-2 rounded w-full mt-1" />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm font-semibold">
            Nom destinataire
            <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="border p-2 rounded w-full mt-1" />
          </label>
          <label className="block text-sm font-semibold">
            Téléphone (option)
            <input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} className="border p-2 rounded w-full mt-1" />
          </label>
        </div>
        <label className="block text-sm font-semibold">
          Email (option)
          <input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className="border p-2 rounded w-full mt-1" />
        </label>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={debugUnlock} onChange={(e) => setDebugUnlock(e.target.checked)} />
          <span>Mode debug (tout déverrouiller)</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 24 }).map((_, i) => (
            <label key={i} className="text-xs font-semibold">
              Jour {i + 1}
              <textarea
                value={days[i]}
                onChange={(e) => {
                  const arr = [...days];
                  arr[i] = e.target.value;
                  setDays(arr);
                }}
                className="border p-2 rounded w-full h-20 mt-1"
              />
            </label>
          ))}
        </div>
        <button
          onClick={create}
          disabled={loading}
          className="rounded-xl border px-6 py-3 font-semibold hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "Création..." : "Simuler paiement & générer le lien"}
        </button>
      </div>
      {!!link && (
        <div className="p-4 border rounded-xl bg-white">
          <p className="font-semibold mb-1">Lien destinataire :</p>
          <pre className="break-all text-sm text-gray-600">{link}</pre>
        </div>
      )}
    </div>
  );
}
