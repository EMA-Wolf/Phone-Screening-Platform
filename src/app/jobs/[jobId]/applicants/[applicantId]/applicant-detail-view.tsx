"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  ChevronDown,
  FileText,
  Loader2,
  Mail,
  Search,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Volume2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApplicantDetailSkeleton } from "@/components/skeletons/applicant-detail-skeleton";
import { AnalysisResultSkeleton } from "@/components/skeletons/analysis-result-skeleton";
import { fetchMockAnalysis } from "@/lib/mock-analysis";
import { loadScreenings } from "@/lib/screenings-storage";
import { findSubmission } from "@/lib/submissions-storage";
import { cn } from "@/lib/utils";
import type { AnalysisResult } from "@/types/analysis.types";
import type { Job } from "@/types/jobs.types";
import type { Question } from "@/types/screening.types";
import type { Submission } from "@/types/submission.types";

type ApplicantDetailViewProps = {
  jobId: string;
  applicantId: string;
  job: Job;
};

function formatSubmittedAt(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatAppliedDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function formatRelativeSubmitted(iso: string) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diffMs = Date.now() - t;
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "Submitted recently";
  if (hours < 48) return `Submitted ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Submitted 1 day ago" : `Submitted ${days} days ago`;
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

function recommendationStyles(r: AnalysisResult["recommendation"]) {
  switch (r) {
    case "advance":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100";
    case "reject":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    default:
      return "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100";
  }
}

function recommendationLabel(r: AnalysisResult["recommendation"]) {
  switch (r) {
    case "advance":
      return "Advance";
    case "reject":
      return "Reject";
    default:
      return "Hold";
  }
}

const outlineActionClass =
  "h-10 gap-2 rounded-lg border-zinc-300 bg-white px-4 text-zinc-900 shadow-none hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900";

export function ApplicantDetailView({
  jobId,
  applicantId,
  job,
}: ApplicantDetailViewProps) {
  const [hydrated, setHydrated] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setHydrated(true);
    });
  }, []);

  const submission: Submission | null | undefined = useMemo(() => {
    if (!hydrated) return undefined;
    return findSubmission(jobId, applicantId) ?? null;
  }, [hydrated, jobId, applicantId]);

  const questionById = useMemo(() => {
    if (!hydrated) return new Map<string, Question>();
    const list = loadScreenings().filter((s) => s.jobId === jobId);
    const latest = [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
    const map = new Map<string, Question>();
    if (latest) {
      for (const q of latest.questions) {
        map.set(q.id, q);
      }
    }
    return map;
  }, [hydrated, jobId]);

  async function runAnalysis() {
    if (!submission || analyzing) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await fetchMockAnalysis();
      setAnalysis(result);
    } finally {
      setAnalyzing(false);
    }
  }

  if (!hydrated || submission === undefined) {
    return <ApplicantDetailSkeleton />;
  }

  if (submission === null) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Applicant not found
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This submission is not in local storage, or the link is invalid.
        </p>
        <Button className="mt-6" asChild>
          <Link href={`/jobs/${jobId}`}>Back to job</Link>
        </Button>
      </div>
    );
  }

  const answered = submission.answers.length;

  return (
    <div className="flex max-h-full flex-col bg-zinc-100/90 dark:bg-zinc-950">
      <header className="border-b border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/jobs"
            className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            Aihrly Phone Screening
          </Link>
          <div className="relative hidden max-w-xs flex-1 sm:block md:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search jobs…"
              disabled
              className="h-9 w-full cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-50 py-1 pl-9 pr-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500"
              aria-label="Search jobs (placeholder)"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-100 px-6 py-5 sm:px-8 sm:py-6 dark:border-zinc-800">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={`/jobs/${jobId}`}
                className="inline-flex w-fit items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Back to applicants
              </Link>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className={outlineActionClass}
                  onClick={() =>
                    setDemoNotice("Reject is a UI placeholder in this demo.")
                  }
                >
                  <ThumbsDown className="size-4" aria-hidden />
                  Reject
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={outlineActionClass}
                  onClick={() =>
                    setDemoNotice(
                      "Shortlist is a UI placeholder in this demo."
                    )
                  }
                >
                  <ThumbsUp className="size-4" aria-hidden />
                  Shortlist
                </Button>
              </div>
            </div>
          </div>

          {demoNotice ? (
            <div className="border-b border-zinc-100 bg-zinc-50/80 px-6 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 sm:px-8">
              {demoNotice}{" "}
              <button
                type="button"
                className="font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
                onClick={() => setDemoNotice(null)}
              >
                Dismiss
              </button>
            </div>
          ) : null}

          <div className="grid gap-0 lg:grid-cols-12 lg:divide-x lg:divide-zinc-100 dark:lg:divide-zinc-800">
            <div className="space-y-0 lg:col-span-8">
              <div className="border-b border-zinc-100 px-6 py-8 sm:px-8 sm:py-10 dark:border-zinc-800">
                <div className="flex min-w-0 gap-5">
                    <div className="relative shrink-0">
                      <div
                        className="flex size-18 items-center justify-center rounded-full bg-zinc-100 text-lg font-semibold tracking-tight text-zinc-700 ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:text-zinc-200 dark:ring-zinc-700"
                        aria-hidden
                      >
                        {initials(submission.candidateName)}
                      </div>
                      <span
                        className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full border-[2.5px] border-white bg-emerald-500 dark:border-zinc-950"
                        title="Active in demo UI"
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
                          {submission.candidateName}
                        </h1>
                        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                          Active application
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {job.title} · {job.location}
                      </p>
                      <div className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-2">
                          <Mail className="size-4 shrink-0 text-zinc-400" aria-hidden />
                          <span className="truncate">
                            {submission.candidateEmail}
                          </span>
                        </span>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-zinc-500">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarClock
                              className="size-4 shrink-0 text-zinc-400"
                              aria-hidden
                            />
                            Applied {formatAppliedDate(submission.submittedAt)}
                          </span>
                          <span className="hidden sm:inline">·</span>
                          <span>{formatRelativeSubmitted(submission.submittedAt)}</span>
                        </div>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                          Logged {formatSubmittedAt(submission.submittedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              <section
                className="px-6 pb-10 pt-8 sm:px-8 sm:pb-12 sm:pt-10"
                aria-labelledby="responses-heading"
              >
                <div className="mb-8 flex flex-col gap-2 border-b border-zinc-100 pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-zinc-800">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                      <FileText className="size-4 text-zinc-600 dark:text-zinc-400" aria-hidden />
                    </div>
                    <div>
                      <h2
                        id="responses-heading"
                        className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
                      >
                        Screening responses
                      </h2>
                      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                        {questionById.size > 0
                          ? "Matched to your latest saved screening when question IDs align."
                          : "Save a screening for this job to show full question prompts."}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium tabular-nums text-zinc-600 dark:text-zinc-400">
                    {answered} question{answered === 1 ? "" : "s"} completed
                  </p>
                </div>

                <div className="space-y-8">
                  {submission.answers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 py-14 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
                      No answers on this submission yet.
                    </div>
                  ) : (
                    submission.answers.map((a, index) => {
                      const q = questionById.get(a.questionId);
                      const label = q?.text ?? `Question (${a.questionId})`;
                      const isAudio = a.responseType === "audio";

                      return (
                        <div
                          key={`${a.questionId}-${index}`}
                          className="rounded-xl border border-zinc-200/90 bg-zinc-50/30 p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/20"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                              Question {index + 1}
                            </span>
                            <span
                              className={cn(
                                "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                                isAudio
                                  ? "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-200"
                                  : "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400"
                              )}
                            >
                              {isAudio ? "Audio response" : "Text response"}
                            </span>
                          </div>
                          <p className="mt-4 text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
                            {label}
                          </p>
                          <div className="mt-5">
                            {isAudio ? (
                              <div className="space-y-4">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                  Audio is a UI placeholder — no playback in this
                                  demo.
                                </p>
                                <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3.5 dark:border-zinc-800 dark:bg-zinc-950">
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      disabled
                                      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
                                      aria-label="Play (disabled)"
                                    >
                                      <span className="text-xs">▶</span>
                                    </button>
                                    <div className="min-w-0 flex-1 space-y-1.5">
                                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                                        <div
                                          className="h-full w-[45%] rounded-full bg-zinc-400 dark:bg-zinc-600"
                                          aria-hidden
                                        />
                                      </div>
                                      <div className="flex justify-between font-mono text-[10px] text-zinc-400">
                                        <span>0:42</span>
                                        <span>1:24</span>
                                      </div>
                                    </div>
                                    <Volume2
                                      className="size-4 shrink-0 text-zinc-400"
                                      aria-hidden
                                    />
                                    <span className="text-[10px] font-medium text-zinc-400">
                                      1.0×
                                    </span>
                                  </div>
                                </div>
                                <details className="group rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                                  <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 text-sm font-medium text-zinc-700 [&::-webkit-details-marker]:hidden dark:text-zinc-300">
                                    <ChevronDown className="size-4 text-zinc-400 transition-transform group-open:rotate-180" />
                                    View transcript
                                  </summary>
                                  <div className="border-t border-zinc-100 px-3 py-3 text-sm leading-relaxed text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                                    {a.value?.trim()
                                      ? a.value
                                      : "No transcript text stored for this demo answer."}
                                  </div>
                                </details>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-zinc-100 bg-zinc-100/60 px-4 py-4 text-sm leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200">
                                <p className="whitespace-pre-wrap">
                                  {a.value?.trim() || "—"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>

            <aside className="flex flex-col gap-6 bg-zinc-50/50 p-6 sm:p-8 lg:col-span-4 dark:bg-zinc-900/30">
              <div className="lg:sticky lg:top-24 lg:space-y-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                    Insights engine
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Demo build — static summary, not a live model.
                  </p>
                </div>

                <Card className="border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                  <CardContent className="space-y-5 p-5">
                    <div className="flex gap-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950">
                        <Sparkles className="size-5 text-zinc-700 dark:text-zinc-300" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          Ready for analysis
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                          Generate an automated summary of this candidate’s
                          responses and key talking points for your review.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="h-11 w-full gap-2 rounded-lg bg-zinc-900 font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      disabled={analyzing || submission.answers.length === 0}
                      onClick={() => void runAnalysis()}
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                          Analyzing…
                        </>
                      ) : (
                        <>
                          <Sparkles className="size-4" aria-hidden />
                          Analyze responses
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {analyzing ? <AnalysisResultSkeleton /> : null}

                {analysis ? (
                  <Card className="border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <CardHeader className="space-y-1 pb-2">
                      <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        Summary
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Mock output for interview practice.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
                      <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {analysis.summary}
                      </p>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          Strengths
                        </p>
                        <ul className="mt-2 space-y-1.5 text-zinc-600 dark:text-zinc-400">
                          {analysis.strengths.map((s) => (
                            <li key={s} className="flex gap-2">
                              <span className="text-zinc-300 dark:text-zinc-600">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          Concerns
                        </p>
                        <ul className="mt-2 space-y-1.5 text-zinc-600 dark:text-zinc-400">
                          {analysis.concerns.map((c) => (
                            <li key={c} className="flex gap-2">
                              <span className="text-zinc-300 dark:text-zinc-600">•</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                        <span className="text-xs font-medium text-zinc-500">
                          Recommendation
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                            recommendationStyles(analysis.recommendation)
                          )}
                        >
                          {recommendationLabel(analysis.recommendation)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                <div className="space-y-3 border-t border-zinc-200/80 pt-6 dark:border-zinc-800">
                  <Button
                    type="button"
                    className="h-12 w-full rounded-lg bg-zinc-900 text-[15px] font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    disabled
                    title="Demo only — connect to your workflow when you extend the app."
                  >
                    Approve to next stage
                  </Button>
                  <button
                    type="button"
                    className="w-full text-center text-sm font-medium text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    onClick={() =>
                      setDemoNotice("Decline is a UI placeholder in this demo.")
                    }
                  >
                    Decline applicant
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-200/80 bg-white py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-500">
        © {new Date().getFullYear()} Aihrly Phone Screening — built for modern
        hiring (assessment)
      </footer>
    </div>
  );
}
