"use client";

export default function DebugBar() {
  async function reset() {
    await fetch("/api/advent/internal/debug/reset", { method: "POST" });
    location.reload();
  }

  return (
    <div className="fixed bottom-4 right-4 p-2 border rounded-xl bg-white/70 backdrop-blur shadow">
      <button onClick={reset} className="text-sm font-semibold">
        Reset mémoire
      </button>
    </div>
  );
}
