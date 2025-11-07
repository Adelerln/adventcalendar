"use client";

import { useState } from "react";

type Props = {
  value: string;
};

export default function CopyButton({ value }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("clipboard", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full bg-red-600 px-5 py-2 text-white font-semibold"
    >
      {copied ? "Copié !" : "Copier"}
    </button>
  );
}
