import CalendarGrid from "@/components/CalendarGrid";
import DebugBar from "@/components/DebugBar";

export default function RecipientCalendarPage() {
  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Ton calendrier 🎄</h1>
      <CalendarGrid />
      <DebugBar />
    </main>
  );
}
