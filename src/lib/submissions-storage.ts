import type { Submission } from "@/types/submission.types";

export const SUBMISSIONS_STORAGE_KEY = "aihrly_submissions";

function readRaw(): Submission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Submission[];
  } catch {
    return [];
  }
}

export function loadSubmissions(): Submission[] {
  return readRaw();
}

export function submissionsForJob(jobId: string): Submission[] {
  return readRaw().filter((s) => s.jobId === jobId);
}

export function findSubmission(
  jobId: string,
  applicantId: string
): Submission | undefined {
  return readRaw().find((s) => s.jobId === jobId && s.id === applicantId);
}

export function appendSubmission(submission: Submission): void {
  if (typeof window === "undefined") return;
  const list = readRaw();
  list.push(submission);
  window.localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));
}
