"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Info, Loader2, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SortableQuestionList } from "@/components/jobs/sortable-question-list";
import { buildDefaultQuestions } from "@/data/default-screening-questions";
import { appendScreening } from "@/lib/screenings-storage";
import { cn } from "@/lib/utils";
import type { Job } from "@/types/jobs.types";
import type { Question } from "@/types/screening.types";

const GENERATE_DELAY_MS = 600;

type Phase = "setup" | "questions";

type CreateScreeningFlowProps = {
  jobs: Job[];
};

export function CreateScreeningFlow({ jobs }: CreateScreeningFlowProps) {
  const router = useRouter();
  const [jobId, setJobId] = useState("");
  const [phase, setPhase] = useState<Phase>("setup");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const selectedJob = useMemo(
    () => jobs.find((j) => j.id === jobId),
    [jobs, jobId]
  );

  function updateQuestion(id: string, patch: Partial<Question>) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
    );
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function addCustomQuestion() {
    setQuestions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: "",
        responseType: "text",
        isCustom: true,
      },
    ]);
  }

  async function handleGenerate() {
    if (!selectedJob) return;
    setGenerating(true);
    setSaveError(false);
    await new Promise((resolve) => setTimeout(resolve, GENERATE_DELAY_MS));
    setQuestions(buildDefaultQuestions(selectedJob.title));
    setGenerating(false);
    setPhase("questions");
  }

  function handleSave() {
    if (!selectedJob || questions.length === 0) return;
    const trimmed = questions.map((q) => ({
      ...q,
      text: q.text.trim(),
    }));
    if (trimmed.some((q) => !q.text)) {
      setSaveError(true);
      return;
    }
    setSaveError(false);
    appendScreening({
      id: crypto.randomUUID(),
      jobId: selectedJob.id,
      createdAt: new Date().toISOString(),
      questions: trimmed,
    });
    router.push(`/jobs/${selectedJob.id}`);
  }

  const canGenerate = Boolean(jobId) && !generating;
  const saveButtonDisabled = !selectedJob || questions.length === 0;

  return (
    <div className="flex max-h-full flex-col bg-muted/40">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/jobs"
            className="text-sm font-semibold tracking-tight text-foreground sm:text-base"
          >
            Aihrly Phone Screening
          </Link>
          <div className="relative hidden max-w-xs flex-1 sm:block md:max-w-md">
            <span className="text-xs text-muted-foreground sm:text-sm">
              Create screening
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10 sm:px-6 sm:py-14">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {phase === "setup"
            ? "Step 1 of 2 · Context"
            : "Step 2 of 2 · Questions"}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Start your screening flow
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {phase === "setup"
            ? "Choose a job role. We will draft role-aware phone-screening questions you can edit before saving — no backend call, templates only."
            : "Review each question, adjust wording and response type, add your own, then save to attach this screening to the job."}
        </p>

        <div className="mt-8 flex flex-col gap-8">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">Select target job</CardTitle>
              <CardDescription>
                This uses the job title and description from your seed data to
                shape the question templates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="create-screening-job"
                  className="text-sm font-medium text-foreground"
                >
                  Job position
                </label>
                <select
                  id="create-screening-job"
                  value={jobId}
                  disabled={phase === "questions"}
                  onChange={(e) => setJobId(e.target.value)}
                  className={cn(
                    "h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none transition-[box-shadow,border-color] focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
                  )}
                >
                  <option value="">Choose a job…</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} · {j.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 rounded-lg border border-border/80 bg-muted/40 p-3 text-sm text-muted-foreground">
                <Info
                  className="mt-0.5 size-4 shrink-0 text-foreground/70"
                  aria-hidden
                />
                <p>
                  Selecting a job ties this screening to that listing. After
                  you save, recruiters open the job detail page to copy the
                  candidate link and review submissions.
                </p>
              </div>
            </CardContent>
          </Card>

          {phase === "setup" ? (
            <div className="rounded-xl border-2 border-dashed border-border/80 bg-card/40 p-8 text-center shadow-sm">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-border bg-muted/60">
                <Sparkles className="size-7 text-foreground/80" aria-hidden />
              </div>
              <h2 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
                Ready to draft questions?
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Generates six phone-screening prompts tailored to the role
                name. You will edit wording and response types on the next step
                before saving.
              </p>
              <Button
                type="button"
                size="lg"
                className="mt-6 h-11 min-w-56 gap-2"
                disabled={!canGenerate}
                onClick={() => void handleGenerate()}
              >
                {generating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" aria-hidden />
                    Generate questions
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Questions</CardTitle>
                <CardDescription>
                  {questions.length} question
                  {questions.length === 1 ? "" : "s"} — drag the handle to
                  reorder. Text or audio (audio is UI-only for candidates).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SortableQuestionList
                  questions={questions}
                  onReorder={setQuestions}
                  onUpdate={updateQuestion}
                  onRemove={removeQuestion}
                  onEditStart={() => setSaveError(false)}
                />

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 border-dashed"
                  onClick={addCustomQuestion}
                >
                  <Plus className="size-4" aria-hidden />
                  Add custom question
                </Button>
              </CardContent>
              <CardFooter className="flex flex-col items-stretch gap-3 border-t sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setSaveError(false);
                    setPhase("setup");
                    setQuestions([]);
                  }}
                >
                  ← Back to job selection
                </Button>
                <div className="flex flex-col items-stretch gap-2 sm:items-end">
                  {saveError ? (
                    <p className="text-xs text-destructive" role="alert">
                      Fill in every question before saving.
                    </p>
                  ) : null}
                  <Button
                    type="button"
                    disabled={saveButtonDisabled}
                    onClick={handleSave}
                  >
                    Save screening
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>

      <footer className="mt-auto border-t border-border/80 bg-card/80">
        <div className="mx-auto flex max-w-6xl flex-col items-stretch justify-between gap-3 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
          <span>
            © {new Date().getFullYear()} Aihrly Phone Screening — Remotown
            assessment
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link href="/jobs">Cancel</Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
