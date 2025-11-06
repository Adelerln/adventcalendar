import { fromZonedTime } from "date-fns-tz";

export function todayInParis(): Date {
  const now = new Date();
  // Convert local midnight to Paris time midnight
  const paris = fromZonedTime(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T00:00:00`,
    "Europe/Paris"
  );
  return paris;
}

