import CalendarGrid from "@/components/CalendarGrid";
import DebugBar from "@/components/DebugBar";
import type { PlanKey } from "@/lib/plan-theme";

type RecipientCalendarPageProps = {
  searchParams?: { plan?: PlanKey };
};

export default function RecipientCalendarPage({ searchParams }: RecipientCalendarPageProps) {
  const planKey: PlanKey = searchParams?.plan === "plan_premium" ? "plan_premium" : "plan_essentiel";
  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Ton calendrier 🎄</h1>
      <CalendarGrid plan={planKey} />
      <DebugBar />
    </main>
  );
}
