import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JobDetailStorageSkeleton() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading job data">
      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-hidden
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 shadow-sm"
          >
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-3 h-8 w-12" />
          </div>
        ))}
      </section>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 bg-muted/20 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <Skeleton className="h-9 w-full max-w-xs rounded-lg" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/80">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 py-4 sm:px-6"
              >
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="hidden h-4 w-28 sm:block" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
