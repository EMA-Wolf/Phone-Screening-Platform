"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Briefcase,
  Calendar,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Info,
  Lock,
  MessageSquare,
  Mic,
  Mic2,
  RefreshCw,
  Sparkles,
  Volume2,
} from "lucide-react";

import { AnimatedQuestionStep } from "@/components/screening/animated-question-step";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { appendSubmission } from "@/lib/submissions-storage";
import { latestScreeningForJob } from "@/lib/screenings-storage";
import { cn } from "@/lib/utils";
import {
  validateWelcomeForm,
  welcomeFormIsValid,
  type WelcomeFormErrors,
} from "@/lib/welcome-form-validation";
import type { Job } from "@/types/jobs.types";
import type { Answer } from "@/types/submission.types";
import type { Question, Screening } from "@/types/screening.types";

const DEMO_COMPANY = "TechFlow Systems";

const EVALUATOR_HINTS = [
  "We are looking for your ability to break down complex issues and communicate technical solutions clearly.",
  "Share concrete examples and outcomes where possible — we care about how you think, not buzzwords.",
  "Be honest about trade-offs and constraints; we value judgment over perfection.",
  "Structure your answer: context first, then what you did, then the result.",
  "We read for clarity and collaboration signals, especially on distributed teams.",
  "There are no trick questions — take your time and answer in your own words.",
];

function wordCount(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

function formatSubmittedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}

function formatReferenceId(submissionId: string): string {
  const alnum = submissionId.replace(/-/g, "").toUpperCase().padEnd(10, "0");
  const a = alnum.slice(0, 3);
  const b = alnum.slice(3, 7);
  const c = alnum.slice(7, 10);
  return `${a}-${b}-${c}`;
}

function responseFormatLabel(questions: Question[]): string {
  const hasText = questions.some((q) => q.responseType === "text");
  const hasAudio = questions.some((q) => q.responseType === "audio");
  if (hasText && hasAudio) return "Audio/Text";
  if (hasAudio) return "Audio";
  return "Written";
}

function estimatedMinutes(questionCount: number): number {
  return Math.max(10, Math.round(questionCount * 2.5));
}

function AihrlyLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <span
        className="relative flex size-9 items-center justify-center"
        aria-hidden
      >
        <span className="absolute size-6 rotate-45 rounded-sm bg-zinc-900 dark:bg-zinc-100" />
        <span className="absolute size-2.5 rotate-45 rounded-[2px] bg-white dark:bg-zinc-900" />
      </span>
      <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-800">
        Aihrly
      </span>
    </div>
  );
}

function CandidatePreviewButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-lg border-zinc-200 bg-white text-xs font-medium text-zinc-700 shadow-none hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
      title="You are viewing the candidate-facing screening experience."
    >
      Candidate Preview
    </Button>
  );
}

function PageFooterLinks() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
      <Link
        href="#"
        className="transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        Terms
      </Link>
      <Link
        href="#"
        className="transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        Privacy
      </Link>
      <Link
        href="#"
        className="transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        Support
      </Link>
    </div>
  );
}

type Step = "welcome" | "question" | "complete";

export function CandidateScreeningExperience({ job }: { job: Job }) {
  const [hydrated, setHydrated] = useState(false);
  const [screening, setScreening] = useState<Screening | null>(null);
  const [step, setStep] = useState<Step>("welcome");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionDirection, setQuestionDirection] = useState(1);
  const [answers, setAnswers] = useState<(Answer | null)[]>([]);
  const [draftText, setDraftText] = useState("");
  const [draftMode, setDraftMode] = useState<"text" | "audio">("text");
  const [submitted, setSubmitted] = useState<{
    id: string;
    submittedAt: string;
  } | null>(null);
  const [welcomeErrors, setWelcomeErrors] = useState<WelcomeFormErrors>({});
  const [welcomeTouched, setWelcomeTouched] = useState<{
    name?: boolean;
    email?: boolean;
  }>({});

  useEffect(() => {
    queueMicrotask(() => {
      setScreening(latestScreeningForJob(job.id) ?? null);
      setHydrated(true);
    });
  }, [job.id]);

  const questions = useMemo(
    () => screening?.questions ?? [],
    [screening]
  );
  const total = questions.length;

  const progressPct = useMemo(() => {
    if (total === 0) return 0;
    return Math.min(100, Math.max(2, (questionIndex / total) * 100));
  }, [questionIndex, total]);

  const currentQuestion = questions[questionIndex];

  const syncDraftForIndex = useCallback(
    (index: number, answerList: (Answer | null)[]) => {
      const qs = screening?.questions ?? [];
      const q = qs[index];
      if (!q) return;
      const existing = answerList[index];
      if (existing) {
        setDraftText(existing.value);
        setDraftMode(existing.responseType);
      } else {
        setDraftText("");
        setDraftMode(q.responseType === "audio" ? "audio" : "text");
      }
    },
    [screening]
  );

  const welcomeValid = useMemo(
    () => welcomeFormIsValid(candidateName, candidateEmail),
    [candidateName, candidateEmail]
  );

  const beginScreening = () => {
    if (total === 0) return;
    const errors = validateWelcomeForm(candidateName, candidateEmail);
    if (Object.keys(errors).length > 0) {
      setWelcomeErrors(errors);
      setWelcomeTouched({ name: true, email: true });
      return;
    }
    setWelcomeErrors({});
    const slots: (Answer | null)[] = Array.from({ length: total }, () => null);
    setAnswers(slots);
    setQuestionDirection(1);
    setQuestionIndex(0);
    syncDraftForIndex(0, slots);
    setStep("question");
  };

  const handleWelcomeSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    beginScreening();
  };

  const persistAndFinish = (finalAnswers: Answer[]) => {
    const id = crypto.randomUUID();
    const submittedAt = new Date().toISOString();
    const submission = {
      id,
      jobId: job.id,
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.trim(),
      answers: finalAnswers,
      submittedAt,
    };
    appendSubmission(submission);
    setSubmitted({ id, submittedAt });
    setStep("complete");
  };

  const goContinue = () => {
    if (!currentQuestion) return;
    if (draftMode === "text") {
      if (!draftText.trim()) return;
    }

    const audioFallback =
      "[Voice response — recorded in practice mode for this demo.]";
    const value =
      draftMode === "text" ? draftText : draftText.trim() || audioFallback;

    const nextAnswers = answers.slice();
    nextAnswers[questionIndex] = {
      questionId: currentQuestion.id,
      responseType: draftMode,
      value,
    };
    setAnswers(nextAnswers);

    if (questionIndex >= total - 1) {
      persistAndFinish(nextAnswers as Answer[]);
      return;
    }

    const nextIdx = questionIndex + 1;
    setQuestionDirection(1);
    setQuestionIndex(nextIdx);
    syncDraftForIndex(nextIdx, nextAnswers);
  };

  const goPrevious = () => {
    if (questionIndex <= 0) return;
    const nextIdx = questionIndex - 1;
    setQuestionDirection(-1);
    setQuestionIndex(nextIdx);
    syncDraftForIndex(nextIdx, answers);
  };

  const canContinue = useMemo(() => {
    if (draftMode === "text") return draftText.trim().length > 0;
    return true;
  }, [draftMode, draftText]);

  const downloadTranscript = () => {
    if (!submitted || questions.length === 0) return;
    const lines: string[] = [
      `Aihrly phone screening transcript`,
      `Job: ${job.title}`,
      `Candidate: ${candidateName.trim()}`,
      `Email: ${candidateEmail.trim()}`,
      `Submitted: ${formatSubmittedAt(submitted.submittedAt)}`,
      "",
    ];
    questions.forEach((q, i) => {
      const a = answers[i];
      lines.push(`Q${i + 1}: ${q.text}`);
      lines.push(
        `A${i + 1} (${a?.responseType ?? "?"}): ${a?.value ?? "—"}`
      );
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `screening-transcript-${submitted.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wc = wordCount(draftText);
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading screening…</p>
      </div>
    );
  }

  if (!screening || total === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_top,_#f4f4f5_0%,_#e4e4e7_55%,_#d4d4d8_100%)] dark:bg-zinc-950">
        <header className="relative flex h-16 items-center justify-center px-4 sm:h-20">
          <AihrlyLogo />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <CandidatePreviewButton />
          </div>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center px-4 pb-24">
          <Card className="max-w-md border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
            <CardHeader>
              <CardTitle className="text-center text-lg">
                No screening available yet
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              The hiring team has not published a phone screening for this role.
              Please check your link or contact the recruiter.
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex max-h-full flex-col",
        step === "complete"
          ? "bg-white dark:bg-zinc-950"
          : "bg-[radial-gradient(ellipse_at_top,_#f4f4f5_0%,_#e4e4e7_55%,_#d4d4d8_100%)] dark:bg-zinc-950"
      )}
    >
      {step === "question" ? (
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 bg-zinc-200 dark:bg-zinc-800"
          aria-hidden
        >
          <div
            className="h-full bg-zinc-900 transition-[width] duration-300 dark:bg-zinc-100"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      ) : null}

      <header
        className={cn(
          "relative flex h-16 items-center justify-center px-4 sm:h-20",
          step === "question" ? "pt-1" : ""
        )}
      >
        <AihrlyLogo />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <CandidatePreviewButton />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 pb-28 pt-4 sm:px-6 sm:pb-32 sm:pt-8">
        {step === "welcome" ? (
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.12)] dark:border-zinc-800 dark:bg-zinc-950 sm:p-10">
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-[1.65rem] sm:leading-tight">
                  Welcome to your Phone Screening
                </h1>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  We&apos;re excited to learn more about your experience and fit
                  for the role.
                </p>
              </div>

              <div className="mt-8 flex gap-4 rounded-xl border border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950">
                  <Briefcase className="size-5 text-zinc-500" aria-hidden />
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {job.title}
                  </p>
                  <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                    {DEMO_COMPANY} · {job.location}
                  </p>
                </div>
              </div>

              <div className="mt-8 border-y border-zinc-200 py-6 dark:border-zinc-800">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="space-y-2">
                    <Clock
                      className="mx-auto size-5 text-zinc-400"
                      aria-hidden
                    />
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {estimatedMinutes(total)} Mins
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                      Duration
                    </p>
                  </div>
                  <div className="space-y-2 border-x border-zinc-200 dark:border-zinc-800">
                    <MessageSquare
                      className="mx-auto size-5 text-zinc-400"
                      aria-hidden
                    />
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {total} Questions
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                      Assessment
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Mic2
                      className="mx-auto size-5 text-zinc-400"
                      aria-hidden
                    />
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {responseFormatLabel(questions)}
                    </p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                      Response
                    </p>
                  </div>
                </div>
              </div>

              <form
                className="mt-8 space-y-4"
                onSubmit={handleWelcomeSubmit}
                noValidate
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                  Your information
                </p>
                <div className="space-y-1.5">
                  <label
                    htmlFor="screening-name"
                    className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Full Name
                  </label>
                  <input
                    id="screening-name"
                    name="candidateName"
                    autoComplete="name"
                    placeholder="e.g. Alex Johnson"
                    value={candidateName}
                    onChange={(e) => {
                      setCandidateName(e.target.value);
                      if (welcomeTouched.name) {
                        const next = validateWelcomeForm(
                          e.target.value,
                          candidateEmail
                        );
                        setWelcomeErrors((prev) => ({
                          ...prev,
                          name: next.name,
                        }));
                      }
                    }}
                    onBlur={() => {
                      setWelcomeTouched((prev) => ({ ...prev, name: true }));
                      const next = validateWelcomeForm(
                        candidateName,
                        candidateEmail
                      );
                      setWelcomeErrors((prev) => ({
                        ...prev,
                        name: next.name,
                      }));
                    }}
                    required
                    minLength={2}
                    aria-invalid={Boolean(welcomeErrors.name)}
                    aria-describedby={
                      welcomeErrors.name ? "screening-name-error" : undefined
                    }
                    className={cn(
                      "h-11 w-full rounded-lg border bg-white px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:ring-4 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600",
                      welcomeErrors.name
                        ? "border-red-400 focus:border-red-400 focus:ring-red-400/20 dark:border-red-500 dark:focus:border-red-500"
                        : "border-zinc-200 focus:border-zinc-300 dark:border-zinc-700 dark:focus:border-zinc-600"
                    )}
                  />
                  {welcomeErrors.name ? (
                    <p
                      id="screening-name-error"
                      role="alert"
                      className="text-xs text-red-600 dark:text-red-400"
                    >
                      {welcomeErrors.name}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="screening-email"
                    className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Email Address
                  </label>
                  <input
                    id="screening-email"
                    name="candidateEmail"
                    type="email"
                    autoComplete="email"
                    placeholder="alex@example.com"
                    value={candidateEmail}
                    onChange={(e) => {
                      setCandidateEmail(e.target.value);
                      if (welcomeTouched.email) {
                        const next = validateWelcomeForm(
                          candidateName,
                          e.target.value
                        );
                        setWelcomeErrors((prev) => ({
                          ...prev,
                          email: next.email,
                        }));
                      }
                    }}
                    onBlur={() => {
                      setWelcomeTouched((prev) => ({ ...prev, email: true }));
                      const next = validateWelcomeForm(
                        candidateName,
                        candidateEmail
                      );
                      setWelcomeErrors((prev) => ({
                        ...prev,
                        email: next.email,
                      }));
                    }}
                    required
                    inputMode="email"
                    spellCheck={false}
                    pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                    aria-invalid={Boolean(welcomeErrors.email)}
                    aria-describedby={
                      welcomeErrors.email ? "screening-email-error" : undefined
                    }
                    className={cn(
                      "h-11 w-full rounded-lg border bg-white px-3 text-sm text-zinc-900 outline-none ring-zinc-900/10 placeholder:text-zinc-400 focus:ring-4 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-600",
                      welcomeErrors.email
                        ? "border-red-400 focus:border-red-400 focus:ring-red-400/20 dark:border-red-500 dark:focus:border-red-500"
                        : "border-zinc-200 focus:border-zinc-300 dark:border-zinc-700 dark:focus:border-zinc-600"
                    )}
                  />
                  {welcomeErrors.email ? (
                    <p
                      id="screening-email-error"
                      role="alert"
                      className="text-xs text-red-600 dark:text-red-400"
                    >
                      {welcomeErrors.email}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-3 pt-4">
                  <Button
                    type="submit"
                    disabled={!welcomeValid}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-[15px] font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Begin Screening
                    <ChevronRight className="size-5 opacity-90" aria-hidden />
                  </Button>
                  <p className="text-center text-[11px] leading-relaxed text-zinc-400">
                    By clicking &apos;Begin Screening&apos;, you agree to our
                    processing of your responses for recruitment purposes.
                  </p>
                </div>
              </form>

              <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  <Info className="size-4 text-zinc-500" aria-hidden />
                  Important Instructions
                </div>
                <ul className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  <li className="flex gap-2.5">
                    <Mic className="mt-0.5 size-4 shrink-0 text-zinc-400" />
                    <span>
                      Please ensure you are in a quiet environment; some
                      questions may require audio responses.
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    <Lock className="mt-0.5 size-4 shrink-0 text-zinc-400" />
                    <span>
                      Your responses are captured in real-time. You can pause,
                      but we recommend finishing in one go.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-10 flex justify-center gap-6 text-zinc-300 dark:text-zinc-700">
              <MessageSquare className="size-5" aria-hidden />
              <Mic2 className="size-5" aria-hidden />
              <CalendarClock className="size-5" aria-hidden />
            </div>
          </div>
        ) : null}

        {step === "question" && currentQuestion ? (
          <div className="w-full max-w-3xl overflow-x-hidden pb-8">
            <AnimatedQuestionStep
              questionKey={currentQuestion.id}
              direction={questionDirection}
            >
              <span className="inline-flex rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                Technical Screening
              </span>
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                Progress: {questionIndex + 1} / {total} Questions Completed
              </p>
            <h1 className="mt-4 text-2xl font-bold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              {currentQuestion.text}
            </h1>
            <p className="mt-4 text-sm italic leading-relaxed text-zinc-500 dark:text-zinc-400">
              &ldquo;{EVALUATOR_HINTS[questionIndex % EVALUATOR_HINTS.length]}
              &rdquo;
            </p>

            <div className="mt-8">
              <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900/80">
                <button
                  type="button"
                  onClick={() => setDraftMode("text")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    draftMode === "text"
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  )}
                >
                  <MessageSquare className="size-4" aria-hidden />
                  Written Response
                </button>
                <button
                  type="button"
                  onClick={() => setDraftMode("audio")}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    draftMode === "audio"
                      ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                      : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  )}
                >
                  <Mic className="size-4" aria-hidden />
                  Audio Response
                </button>
              </div>

              {draftMode === "text" ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                  <textarea
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    placeholder="Type your response here... Be as detailed as you like."
                    rows={10}
                    className="w-full resize-none border-0 bg-transparent px-4 py-4 text-sm leading-relaxed text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50"
                  />
                  <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    <span>Minimum 50 words recommended</span>
                    <span className="tabular-nums">Word count: {wc}</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Audio capture is a UI placeholder in this demo. Add an
                    optional note below if you like; we&apos;ll still record this
                    answer as an audio-type response.
                  </p>
                  <textarea
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    placeholder="Optional: short summary of what you would say in audio…"
                    rows={4}
                    className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                  />
                </div>
              )}
            </div>
            </AnimatedQuestionStep>

            <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goPrevious}
                disabled={questionIndex === 0}
                className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 disabled:opacity-40 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <ChevronLeft className="size-4" aria-hidden />
                Previous
              </button>
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Press Enter to continue
              </p>
              <Button
                type="button"
                onClick={goContinue}
                disabled={!canContinue}
                className="inline-flex h-11 min-w-[140px] items-center justify-center gap-2 rounded-full bg-zinc-900 px-8 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Continue
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>

            <div className="mt-12 space-y-3 text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Need help? Visit our{" "}
                <Link href="#" className="font-medium underline underline-offset-2">
                  Support Center
                </Link>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <Volume2 className="size-3.5" aria-hidden />
                  Audio enabled
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <RefreshCw className="size-3.5" aria-hidden />
                  Auto-save active
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {step === "complete" && submitted ? (
          <div className="w-full max-w-4xl space-y-12 pb-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="flex size-20 items-center justify-center rounded-full bg-zinc-900 shadow-[0_0_0_8px_rgba(0,0,0,0.04)] dark:bg-zinc-100 dark:shadow-[0_0_0_8px_rgba(255,255,255,0.06)]">
                  <Check
                    className="size-10 text-white dark:text-zinc-900"
                    strokeWidth={3}
                    aria-hidden
                  />
                </div>
                <Sparkles
                  className="absolute -right-2 -top-1 size-5 text-amber-400"
                  aria-hidden
                />
                <Sparkles
                  className="absolute -bottom-1 -left-3 size-4 text-amber-300/90"
                  aria-hidden
                />
              </div>
              <h1 className="mt-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
                Application Submitted!
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Great job! Your phone screening responses have been successfully
                recorded and sent to the hiring team.
              </p>
            </div>

            <Card className="border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <CardTitle className="text-base font-semibold">
                  Submission Details
                </CardTitle>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  Finalized
                </span>
              </CardHeader>
              <CardContent className="grid gap-8 pt-6 sm:grid-cols-2">
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Position
                    </p>
                    <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-50">
                      {job.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Company
                    </p>
                    <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-50">
                      {DEMO_COMPANY} Inc.
                    </p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Submitted on
                    </p>
                    <p className="mt-1 font-semibold text-zinc-900 dark:text-zinc-50">
                      {formatSubmittedAt(submitted.submittedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Reference ID
                    </p>
                    <p className="mt-1 font-mono text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-50">
                      {formatReferenceId(submitted.id)}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 border-t border-zinc-100 bg-transparent dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((n) => (
                      <span
                        key={n}
                        className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-zinc-200 text-[10px] font-semibold text-zinc-600 dark:border-zinc-950 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {String(n).padStart(2, "0")}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {total} Question{total === 1 ? "" : "s"} Answered
                  </span>
                </div>
                <button
                  type="button"
                  onClick={downloadTranscript}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
                >
                  <Download className="size-4" aria-hidden />
                  Download Transcript
                </button>
              </CardFooter>
            </Card>

            {/* <div className="space-y-3 text-center">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                What happens next?
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Here is the typical timeline for our recruitment process.
              </p>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-3">
              {(
                [
                  {
                    icon: CalendarClock,
                    title: "Recruiter Review",
                    body: "Our AI analysis tool will summarize your responses for the hiring team within 24 hours.",
                  },
                  {
                    icon: MessageSquare,
                    title: "Initial Feedback",
                    body: "You will receive an email notification regarding the status of your application by next Tuesday.",
                  },
                  {
                    icon: Calendar,
                    title: "Interview Phase",
                    body: "Successful candidates will be invited for a 1:1 technical interview with the engineering lead.",
                  },
                ] as const
              ).map((item, i, arr) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex flex-1 items-stretch gap-3">
                    <Card className="min-w-0 flex-1 border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                      <CardContent className="flex flex-col gap-3 p-5 text-left">
                        <Icon className="size-5 text-zinc-500" aria-hidden />
                        <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                          {item.title}
                        </p>
                        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                          {item.body}
                        </p>
                      </CardContent>
                    </Card>
                    {i < arr.length - 1 ? (
                      <div className="hidden shrink-0 items-center md:flex">
                        <ChevronRight
                          className="size-5 text-zinc-300 dark:text-zinc-700"
                          aria-hidden
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div> */}

            <div className="flex flex-col items-center gap-4 pt-4">
              <Button
                asChild
                className="h-12 rounded-full bg-zinc-900 px-10 text-[15px] font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 no-underline"
                >
                  Return Home
                  <ChevronRight className="size-5" aria-hidden />
                </Link>
              </Button>
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <Link
                  href="#"
                  className="inline-flex items-center gap-1 font-medium hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  View Career Portal
                  <ExternalLink className="size-3.5" aria-hidden />
                </Link>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <Link
                  href="#"
                  className="font-medium hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <footer
        className={cn(
          "mt-auto border-t border-zinc-200/80 px-4 py-6 dark:border-zinc-800",
          step === "welcome"
            ? "bg-transparent"
            : "bg-white/80 dark:bg-zinc-950/80"
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} Aihrly Platform. Built for modern hiring.
          </p>
          <PageFooterLinks />
        </div>
      </footer>
    </div>
  );
}
