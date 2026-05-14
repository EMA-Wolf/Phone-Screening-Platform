"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  Briefcase,
  ChevronRight,
  ClipboardCheck,
  Copy,
  ExternalLink,
  ListChecks,
  MapPin,
  MoreHorizontal,
  Search,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loadScreenings } from "@/lib/screenings-storage";
import { submissionsForJob } from "@/lib/submissions-storage";
import { cn } from "@/lib/utils";
import type { Job } from "@/types/jobs.types";
import type { Screening } from "@/types/screening.types";
import type { Submission } from "@/types/submission.types";

type JobDetailViewProps = {
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

function StatTile({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

export function JobDetailView({ job }: JobDetailViewProps) {
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [applicantQuery, setApplicantQuery] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      setHydrated(true);
    });
  }, []);

  const screenings: Screening[] = useMemo(() => {
    if (!hydrated) return [];
    return loadScreenings().filter((s) => s.jobId === job.id);
  }, [hydrated, job.id]);

  const submissions: Submission[] = useMemo(() => {
    if (!hydrated) return [];
    return submissionsForJob(job.id);
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

  const filteredSubmissions = useMemo(() => {
    const q = applicantQuery.trim().toLowerCase();
    if (!q) return submissions;
    return submissions.filter(
      (s) =>
        s.candidateName.toLowerCase().includes(q) ||
        s.candidateEmail.toLowerCase().includes(q)
    );
  }, [submissions, applicantQuery]);

  async function copyScreeningLink() {
    try {
      await navigator.clipboard.writeText(screeningLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-muted/40">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/jobs"
            className="text-sm font-semibold tracking-tight text-foreground sm:text-base"
          >
            Aihrly Phone Screening
          </Link>
          <div className="relative hidden max-w-xs flex-1 sm:block md:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search jobs…"
              disabled
              className="h-9 w-full cursor-not-allowed rounded-lg border border-border bg-muted/40 py-1 pl-9 pr-3 text-sm text-muted-foreground"
              aria-label="Search jobs (coming soon)"
              title="Recruiter-wide search can plug in here later"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <nav
          className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm"
          aria-label="Breadcrumb"
        >
          <Link href="/jobs" className="hover:text-foreground">
            Jobs dashboard
          </Link>
          <ChevronRight className="size-3.5 shrink-0" aria-hidden />
          <span className="font-medium text-foreground">Job details</span>
        </nav>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0" aria-hidden />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="size-4 shrink-0" aria-hidden />
                {job.employmentType}
              </span>
              {latest ? (
                <span className="inline-flex items-center gap-1.5">
                  <ClipboardCheck className="size-4 shrink-0" aria-hidden />
                  Latest screening{" "}
                  {formatSubmittedAt(latest.createdAt)}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" size="default" asChild>
              <Link href={`/screening/${job.id}`} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" aria-hidden />
                Preview screening
              </Link>
            </Button>
            <Button variant="default" size="default" disabled title="Seed data only in this demo">
              Edit job details
            </Button>
          </div>
        </div>

        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {job.description}
        </p>

        <section
          className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Job summary"
        >
          <StatTile
            label="Applicant submissions"
            value={submissions.length}
            icon={Users}
          />
          <StatTile
            label="Saved screening versions"
            value={screenings.length}
            icon={ClipboardCheck}
          />
          <StatTile
            label="Questions (latest)"
            value={latest?.questions.length ?? 0}
            icon={ListChecks}
          />
          <Card className="border-border/80 shadow-sm sm:col-span-2 xl:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Public screening link
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                Share this URL with candidates. It opens the guided flow for
                this job (no login in this demo).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="flex gap-2">
                <code className="min-w-0 flex-1 truncate rounded-md border border-border bg-muted/40 px-2 py-2 text-[11px] leading-snug sm:text-xs">
                  {screeningLink}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  aria-label="Copy screening link"
                  onClick={() => void copyScreeningLink()}
                >
                  {copied ? (
                    <span className="text-[10px] font-medium">OK</span>
                  ) : (
                    <Copy className="size-4" aria-hidden />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="mt-10 border-border/80 shadow-sm">
          <CardHeader className="flex flex-col gap-4 border-b border-border/60 bg-muted/20 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Applicants</CardTitle>
              <CardDescription>
                Submissions stored locally for this job (
                <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
                  aihrly_submissions
                </code>
                ).
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-48 flex-1 sm:max-w-xs">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  type="search"
                  placeholder="Filter by name or email…"
                  value={applicantQuery}
                  onChange={(e) => setApplicantQuery(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-card py-1 pl-8 pr-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/30 sm:text-sm"
                  aria-label="Filter applicants"
                />
              </div>
              <Button type="button" variant="outline" size="sm" disabled>
                <span className="hidden sm:inline">More filters</span>
                <MoreHorizontal className="size-4 sm:ml-1" aria-hidden />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {submissions.length === 0 ? (
              <p className="m-6 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground">
                No applicants yet. When candidates finish{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  /screening/{job.id}
                </code>
                , their rows will show up here.
              </p>
            ) : filteredSubmissions.length === 0 ? (
              <p className="m-6 text-center text-sm text-muted-foreground">
                No applicants match your filter.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-160 text-left text-sm">
                  <thead className="border-b border-border bg-muted/30 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 sm:px-6">Candidate</th>
                      <th className="hidden px-4 py-3 sm:table-cell sm:px-6">
                        Submitted
                      </th>
                      <th className="px-4 py-3 sm:px-6">Status</th>
                      <th className="px-4 py-3 text-right sm:px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/80">
                    {filteredSubmissions.map((s) => (
                      <tr
                        key={s.id}
                        className="bg-card transition-colors hover:bg-muted/30"
                      >
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex items-start gap-3">
                            <div
                              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
                              aria-hidden
                            >
                              {s.candidateName
                                .split(/\s+/)
                                .map((p) => p[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground">
                                {s.candidateName}
                              </p>
                              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                                {s.candidateEmail}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground sm:hidden">
                                {formatSubmittedAt(s.submittedAt)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden whitespace-nowrap px-4 py-4 text-muted-foreground sm:table-cell sm:px-6">
                          {formatSubmittedAt(s.submittedAt)}
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <span className="inline-flex rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-foreground">
                            Submitted
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right sm:px-6">
                          <Button variant="link" size="sm" className="h-auto p-0" asChild>
                            <Link href={`/jobs/${job.id}/applicants/${s.id}`}>
                              View responses
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {submissions.length > 0 ? (
              <div className="flex flex-col items-start justify-between gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6 sm:text-sm">
                <p>
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {filteredSubmissions.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {submissions.length}
                  </span>{" "}
                  applicant{submissions.length === 1 ? "" : "s"}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </main>

      <footer className="mt-auto border-t border-border/80 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Aihrly Phone Screening — assessment build
        for Remotown GmbH
      </footer>
    </div>
  );
}
