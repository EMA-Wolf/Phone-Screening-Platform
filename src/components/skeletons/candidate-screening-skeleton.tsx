import { Skeleton } from "@/components/ui/skeleton";

export function CandidateScreeningSkeleton() {
  return (
    <div
      className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_at_top,_#f4f4f5_0%,_#e4e4e7_55%,_#d4d4d8_100%)] dark:bg-zinc-950"
      aria-busy="true"
      aria-label="Loading screening"
    >
      <header className="relative flex h-16 items-center justify-center px-4 sm:h-20">
        <Skeleton className="h-7 w-28" />
      </header>
      <main className="flex flex-1 flex-col items-center px-4 pb-28 pt-4 sm:px-6 sm:pt-8">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 sm:p-10">
          <div className="space-y-3 text-center">
            <Skeleton className="mx-auto h-8 w-4/5" />
            <Skeleton className="mx-auto h-4 w-full" />
            <Skeleton className="mx-auto h-4 w-3/4" />
          </div>
          <Skeleton className="mt-8 h-20 w-full rounded-xl" />
          <Skeleton className="mt-8 h-24 w-full" />
          <div className="mt-8 space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  );
}
