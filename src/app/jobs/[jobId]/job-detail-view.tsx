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
import { loadScreenings } from "@/lib/screenings-storage";
import type { Job } from "@/types/jobs.types";
import type { Screening } from "@/types/screening.types";

type JobDetailViewProps = {
  job: Job;
};

export function JobDetailView({ job }: JobDetailViewProps) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setHydrated(true);
    });
  }, []);

  const screenings: Screening[] = useMemo(() => {
    if (!hydrated) return [];
    return loadScreenings().filter((s) => s.jobId === job.id);
  }, [hydrated, job.id]);

  const screeningLink = useMemo(() => {
    if (!hydrated) return `/screening/${job.id}`;
    return `${window.location.origin}/screening/${job.id}`;
  }, [hydrated, job.id]);

  const latest = useMemo(
    () =>
      [...screenings].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0],
    [screenings]
  );

  return (
    <div className="flex min-h-full flex-col bg-muted/40">
      <header className="border-b border-border/80 bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/jobs">← Jobs</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Job detail
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {job.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {job.location} · {job.employmentType}
          </p>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {job.description}
        </p>

        <Card className="mt-8 border-border/80">
          <CardHeader>
            <CardTitle className="text-base">Phone screening</CardTitle>
            <CardDescription>
              {screenings.length === 0
                ? "No screening saved for this job yet. Create one from the jobs dashboard."
                : `${screenings.length} screening version${screenings.length === 1 ? "" : "s"} saved locally. Latest has ${latest?.questions.length ?? 0} questions.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Candidate link
              </p>
              <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
                <code className="block truncate rounded-md border bg-muted/50 px-2 py-1.5 text-xs">
                  {screeningLink}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(screeningLink);
                  }}
                >
                  Copy link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-border/80">
          <CardHeader>
            <CardTitle className="text-base">Applicants</CardTitle>
            <CardDescription>
              Submissions from candidates will appear here once the candidate
              flow writes to shared storage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              No applicants yet.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
