"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Filter,
  LayoutGrid,
  LayoutList,
  Plus,
  Search,
} from "lucide-react";

import { JobCard } from "@/components/jobs/jobCards";
import { JobCardSkeleton } from "@/components/skeletons/job-card-skeleton";
import { Button } from "@/components/ui/button";
import { loadSubmissions } from "@/lib/submissions-storage";
import { loadScreenings } from "@/lib/screenings-storage";
import { cn } from "@/lib/utils";
import type { Job } from "@/types/jobs.types";

type JobsDashboardProps = {
  jobs: Job[];
};

export function JobsDashboard({ jobs }: JobsDashboardProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [funnelOpen, setFunnelOpen] = useState(false);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(() =>
    new Set(jobs.map((j) => j.id))
  );

  const funnelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
    });
  }, []);

  const screeningsByJob = useMemo(() => {
    void pathname;
    if (!mounted || typeof window === "undefined") return {};
    const list = loadScreenings();
    const counts: Record<string, number> = {};
    for (const s of list) {
      counts[s.jobId] = (counts[s.jobId] ?? 0) + 1;
    }
    return counts;
  }, [mounted, pathname]);

  const submissionsByJob = useMemo(() => {
    void pathname;
    if (!mounted || typeof window === "undefined") return {};
    const list = loadSubmissions();
    const counts: Record<string, number> = {};
    for (const s of list) {
      counts[s.jobId] = (counts[s.jobId] ?? 0) + 1;
    }
    return counts;
  }, [mounted, pathname]);

  useEffect(() => {
    if (!funnelOpen) return;
    function handlePointerDown(e: PointerEvent) {
      const el = funnelRef.current;
      if (el && !el.contains(e.target as Node)) {
        setFunnelOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [funnelOpen]);

  const titleFilterActive =
    jobs.length > 0 && selectedJobIds.size < jobs.length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => {
      if (!selectedJobIds.has(j.id)) {
        return false;
      }
      if (!q) return true;
      return j.title.toLowerCase().includes(q);
    });
  }, [jobs, query, selectedJobIds]);

  const hasActiveFilters = query.trim() !== "" || titleFilterActive;

  function resetFilters() {
    setQuery("");
    setSelectedJobIds(new Set(jobs.map((j) => j.id)));
  }

  function toggleJobTitleFilter(jobId: string) {
    setSelectedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        if (next.size <= 1) return prev;
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  }

  function selectAllJobTitles() {
    setSelectedJobIds(new Set(jobs.map((j) => j.id)));
  }

  return (
    <div className="flex max-h-full flex-col bg-muted/40">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
          <Link
            href="/jobs"
            className="text-sm font-semibold tracking-tight text-foreground sm:text-base"
          >
            Aihrly Phone Screening
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-6 border-b border-border/60 pb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="space-y-3">
            <span className="inline-flex w-fit items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Recruiter workspace
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Jobs Dashboard
              </h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
                You have{" "}
                <span className="font-medium text-foreground">
                  {jobs.length} job role{jobs.length === 1 ? "" : "s"}
                </span>
                . Search or filter by{" "}
                <span className="font-medium text-foreground">job title</span>,
                then open a role for screening links and applicants.
              </p>
            </div>
          </div>
          <Button asChild size="lg" className="h-11 min-w-48 shrink-0 sm:self-center">
            <Link href="/jobs/create-screening">
              <Plus className="size-4 shrink-0" aria-hidden />
              Create Phone Screening
            </Link>
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative min-w-0 flex-1 lg:max-w-xl">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search by job title…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none transition-[box-shadow,border-color] placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
                aria-label="Search jobs by title"
              />
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-start">
              <div
                className="flex rounded-lg border border-border/80 bg-card p-0.5 shadow-sm"
                role="group"
                aria-label="Layout"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    "rounded-md",
                    viewMode === "grid" &&
                      "bg-muted text-foreground shadow-sm"
                  )}
                  aria-pressed={viewMode === "grid"}
                  aria-label="Grid view"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    "rounded-md",
                    viewMode === "list" &&
                      "bg-muted text-foreground shadow-sm"
                  )}
                  aria-pressed={viewMode === "list"}
                  aria-label="List view"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="size-4" />
                </Button>
              </div>

              <div className="relative" ref={funnelRef}>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    "shadow-sm",
                    (funnelOpen || titleFilterActive) &&
                      "border-foreground/20 bg-muted/60"
                  )}
                  aria-expanded={funnelOpen}
                  aria-haspopup="dialog"
                  aria-label="Filter by job title"
                  onClick={() => setFunnelOpen((o) => !o)}
                >
                  <Filter className="size-4" />
                </Button>

                {funnelOpen ? (
                  <div
                    className="absolute right-0 z-30 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg"
                    role="dialog"
                    aria-label="Filter by job title"
                  >
                    <p className="text-xs font-medium text-muted-foreground">
                      Job title
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Choose which roles appear in the list. At least one title
                      must stay selected. Works together with the title search
                      above.
                    </p>
                    <div className="mt-3 flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
                      {jobs.map((job) => {
                        const on = selectedJobIds.has(job.id);
                        return (
                          <button
                            key={job.id}
                            type="button"
                            onClick={() => toggleJobTitleFilter(job.id)}
                            className={cn(
                              "flex w-full rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors sm:text-sm",
                              on
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <span className="line-clamp-2">{job.title}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex justify-end gap-2 border-t border-border pt-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          selectAllJobTitles();
                          setFunnelOpen(false);
                        }}
                      >
                        Show all titles
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setFunnelOpen(false)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground sm:text-sm">
            <p>
              Showing{" "}
              <span className="font-medium tabular-nums text-foreground">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="font-medium tabular-nums text-foreground">
                {jobs.length}
              </span>{" "}
              {jobs.length === 1 ? "role" : "roles"}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        {jobs.length === 0 ? (
          <div
            className="mt-10 flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center"
            role="status"
          >
            <p className="text-sm font-medium text-foreground">No jobs yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Seed jobs in{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                src/data/jobs.ts
              </code>{" "}
              to get started.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="mt-10 flex flex-col items-center justify-center rounded-xl border border-border bg-card/60 px-6 py-14 text-center"
            role="status"
          >
            <p className="text-sm font-medium text-foreground">
              No roles match your filters
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try clearing the title search, showing more job titles in the
              filter, or resetting all filters.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={resetFilters}
            >
              Reset all filters
            </Button>
          </div>
        ) : (
          <ul
            className={cn(
              "mt-6 list-none gap-4",
              viewMode === "grid"
                ? "grid sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
                : "flex max-w-3xl flex-col gap-3"
            )}
          >
            {filtered.map((job) => (
              <li key={job.id} className="min-h-0">
                {mounted ? (
                  <JobCard
                    job={job}
                    screeningCount={screeningsByJob[job.id] ?? 0}
                    applicantCount={submissionsByJob[job.id] ?? 0}
                  />
                ) : (
                  <JobCardSkeleton />
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="mt-auto border-t border-border/80 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Aihrly Phone Screening — assessment build
        for Remotown GmbH
      </footer>
    </div>
  );
}
