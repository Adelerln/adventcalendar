"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  triggerClassName?: string;
}

export default function TokenDialog({ triggerClassName }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("/r/");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const close = () => {
    setOpen(false);
    setError(null);
  };

  const handleNavigate = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Merci de coller votre lien");
      return;
    }

    let path = trimmed;
    try {
      if (trimmed.startsWith("http")) {
        const url = new URL(trimmed);
        path = url.pathname + url.search;
      }
    } catch {
      setError("URL invalide");
      return;
    }

    if (!path.startsWith("/r/")) {
      setError("Le lien doit commencer par /r/");
      return;
    }

    router.push(path);
    close();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "border-2 border-red-600 text-red-600 px-6 py-2 rounded-full font-semibold hover:bg-red-50"
        }
      >
        Accéder à mon calendrier
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900">Coller votre lien</h3>
            <p className="text-sm text-gray-500">Ex : https://monsite.com/r/abcd1234</p>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-3">
              <button onClick={close} className="rounded-full border border-gray-300 px-4 py-2 font-semibold">
                Annuler
              </button>
              <button
                onClick={handleNavigate}
                className="rounded-full bg-green-600 px-5 py-2 font-semibold text-white"
              >
                Aller
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
