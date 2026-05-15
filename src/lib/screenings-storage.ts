import type { Screening } from "@/types/screening.types";

export const SCREENINGS_STORAGE_KEY = "aihrly_screenings";

function readRaw(): Screening[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SCREENINGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Screening[];
  } catch {
    return [];
  }
}

export function loadScreenings(): Screening[] {
  return readRaw();
}

export function saveScreenings(screenings: Screening[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    SCREENINGS_STORAGE_KEY,
    JSON.stringify(screenings)
  );
}

export function appendScreening(screening: Screening): void {
  const list = readRaw();
  list.push(screening);
  saveScreenings(list);
}

/** Most recently created screening for a job (by `createdAt`). */
export function latestScreeningForJob(jobId: string): Screening | undefined {
  const forJob = readRaw().filter((s) => s.jobId === jobId);
  if (forJob.length === 0) return undefined;
  return [...forJob].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
}
