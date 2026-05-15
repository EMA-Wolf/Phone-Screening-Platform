import { Skeleton } from "@/components/ui/skeleton";

export function ApplicantDetailSkeleton() {
  return (
    <div
      className="flex min-h-full flex-col bg-zinc-100/90 dark:bg-zinc-950"
      aria-busy="true"
      aria-label="Loading applicant"
    >
      <header className="border-b border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
          <Skeleton className="h-5 w-44" />
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-100 px-6 py-5 sm:px-8 dark:border-zinc-800">
            <Skeleton className="h-4 w-36" />
          </div>

          <div className="grid gap-0 lg:grid-cols-12 lg:divide-x lg:divide-zinc-100 dark:lg:divide-zinc-800">
            <div className="space-y-0 lg:col-span-8">
              <div className="border-b border-zinc-100 px-6 py-8 sm:px-8 sm:py-10 dark:border-zinc-800">
                <div className="flex gap-5">
                  <Skeleton className="size-18 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </div>

              <div className="space-y-6 px-6 py-8 sm:px-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-3 rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 p-6 sm:p-8 lg:col-span-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
