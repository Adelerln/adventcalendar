import { Suspense } from "react";
import { DashboardWithSearchParams } from "./_components/DashboardWithSearchParams";

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardWithSearchParams />
    </Suspense>
  );
}
