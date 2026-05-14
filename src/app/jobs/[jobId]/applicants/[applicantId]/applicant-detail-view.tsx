"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { findSubmission } from "@/lib/submissions-storage";
import type { Submission } from "@/types/submission.types";

type ApplicantDetailViewProps = {
  jobId: string;
  applicantId: string;
  jobTitle: string;
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

export function ApplicantDetailView({
  jobId,
  applicantId,
  jobTitle,
}: ApplicantDetailViewProps) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setHydrated(true);
    });
  }, []);

  const submission: Submission | null | undefined = useMemo(() => {
    if (!hydrated) return undefined;
    return findSubmission(jobId, applicantId) ?? null;
  }, [hydrated, jobId, applicantId]);

  const answersPreview = useMemo(() => {
    if (!submission) return [];
    return submission.answers.slice(0, 12);
  }, [submission]);

  if (!hydrated || submission === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (submission === null) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-lg font-semibold">Applicant not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This submission is not in local storage, or the link is invalid.
        </p>
        <Button className="mt-6" asChild>
          <Link href={`/jobs/${jobId}`}>Back to job</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-muted/40">
      <header className="border-b border-border/80 bg-card">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4 sm:px-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/jobs/${jobId}`}>← Job detail</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {jobTitle}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {submission.candidateName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {submission.candidateEmail}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Submitted {formatSubmittedAt(submission.submittedAt)}
        </p>

        <Card className="mt-8 border-border/80">
          <CardHeader>
            <CardTitle className="text-base">Responses</CardTitle>
            <CardDescription>
              {submission.answers.length} answer
              {submission.answers.length === 1 ? "" : "s"} recorded for this
              submission.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {answersPreview.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No answers stored on this submission object.
              </p>
            ) : (
              answersPreview.map((a, i) => (
                <div
                  key={`${a.questionId}-${i}`}
                  className="rounded-lg border border-border/80 bg-muted/20 p-3 text-sm"
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    Question {a.questionId}
                    <span className="text-foreground"> · {a.responseType}</span>
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-foreground">
                    {a.value || "—"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link href={`/jobs/${jobId}`}>Back to applicants list</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
