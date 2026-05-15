import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalysisResultSkeleton() {
  return (
    <Card
      className="border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-busy="true"
      aria-label="Loading analysis"
    >
      <CardHeader className="space-y-2 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-40" />
      </CardHeader>
      <CardContent className="space-y-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="mt-2 h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </CardContent>
    </Card>
  );
}
