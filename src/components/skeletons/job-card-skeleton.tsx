import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JobCardSkeleton() {
  return (
    <Card
      className="h-full border-border/80 bg-card shadow-sm"
      aria-busy="true"
      aria-label="Loading job card"
    >
      <CardHeader className="gap-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
        </div>
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 pb-2">
        <Skeleton className="h-[4.25rem] rounded-lg" />
        <Skeleton className="h-[4.25rem] rounded-lg" />
      </CardContent>
      <CardFooter className="border-t border-border/60 pt-4">
        <Skeleton className="h-4 w-24" />
      </CardFooter>
    </Card>
  );
}
