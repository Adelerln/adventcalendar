"use client";
import { useState } from "react";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  async function submit() {
    await fetch("/api/advent/internal/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, phoneE164: phone || null })
    });
    location.href = "/waitlist/success";
  }

  return (
    <main className="p-8 max-w-md mx-auto space-y-3">
      <h1 className="text-2xl font-bold">Rejoins la waitlist</h1>
      <input className="border p-2 rounded w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="border p-2 rounded w-full" placeholder="Nom (optionnel)" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="border p-2 rounded w-full" placeholder="Téléphone (optionnel)" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button onClick={submit} className="rounded-xl border px-6 py-3 font-semibold">
        Je m’inscris
      </button>
    </main>
  );
}
