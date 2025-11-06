import { formatInTimeZone } from "date-fns-tz";

type Props = { params: { publicId: string } };

export default async function PublicCalendarPage({ params }: Props) {
  const todayParis = new Date();
  const yyyyMMdd = formatInTimeZone(todayParis, "Europe/Paris", "yyyy-MM-dd");

  // Placeholder static dates for MVP
  const startDate = new Date("2025-12-01");
  const endDate = new Date("2025-12-24");
  const dayOffset = Math.floor((new Date(yyyyMMdd).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentDay = Math.min(Math.max(dayOffset + 1, 1), 24);

  const isBeforeStart = new Date(yyyyMMdd) < startDate;
  const isAfterEnd = new Date(yyyyMMdd) > endDate;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 space-y-6">
      <h1 className="text-2xl font-bold">Calendrier</h1>
      <p className="text-sm text-gray-600">ID public: {params.publicId}</p>
      {isBeforeStart && <p>Reviens le 01/12/2025.</p>}
      {isAfterEnd && <p>Le calendrier est terminé. Joyeuses fêtes !</p>}
      {!isBeforeStart && !isAfterEnd && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {Array.from({ length: 24 }).map((_, i) => {
            const day = i + 1;
            const state = day < currentDay ? "open" : day === currentDay ? "today" : "locked";
            return (
              <div
                key={day}
                className={
                  "aspect-square rounded-md flex items-center justify-center text-lg font-semibold " +
                  (state === "open"
                    ? "bg-green-100 border border-green-300"
                    : state === "today"
                    ? "bg-yellow-100 border border-yellow-300"
                    : "bg-gray-100 border border-gray-300")
                }
              >
                {day}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}


