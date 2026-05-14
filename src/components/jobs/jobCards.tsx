import Link from "next/link";
import { ArrowRight, ClipboardList, MapPin, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Job } from "@/types/jobs.types";

export type JobCardProps = {
  job: Job;
  /** Number of phone screenings created for this job (from localStorage or in-memory store). */
  screeningCount: number;
  /** Completed / submitted applicants for this job (optional; e.g. from submissions in localStorage). */
  applicantCount?: number;
  href?: string;
  className?: string;
};

export function JobCard({
  job,
  screeningCount,
  applicantCount = 0,
  href,
  className,
}: JobCardProps) {
  const detailHref = href ?? `/jobs/${job.id}`;

  return (
    <Link
      href={detailHref}
      className={cn(
        "group block h-full rounded-xl outline-none ring-offset-2 ring-offset-background transition-[box-shadow,transform] focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <Card className="h-full border-border/80 bg-card shadow-sm transition-[box-shadow,transform] group-hover:-translate-y-0.5 group-hover:shadow-md">
        <CardHeader className="gap-3 pb-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {job.title}
            </CardTitle>
            <span className="shrink-0 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {job.employmentType}
            </span>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin
              className="size-3.5 shrink-0 opacity-70"
              aria-hidden
            />
            <span className="line-clamp-1">{job.location}</span>
          </p>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-3 pb-2">
          <div className="rounded-lg border border-border/80 bg-muted/40 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <ClipboardList className="size-3 opacity-80" aria-hidden />
              Screenings
            </div>
            <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
              {screeningCount}
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-muted/40 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Users className="size-3 opacity-80" aria-hidden />
              Applicants
            </div>
            <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
              {applicantCount}
            </p>
          </div>
        </CardContent>

        <CardFooter className="justify-between gap-2 border-t border-border/80 bg-muted/30 text-xs text-muted-foreground">
          <span className="truncate">Role #{job.id.replace(/^job-/, "")}</span>
          <span className="inline-flex shrink-0 items-center gap-1 font-medium text-foreground transition-colors group-hover:text-foreground">
            View detail
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}