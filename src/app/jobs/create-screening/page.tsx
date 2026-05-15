import type { Metadata } from "next";
import { Suspense } from "react";

import { CreateScreeningFlow } from "@/components/jobs/create-screening-flow";
import { jobs } from "@/data/jobs";

export const metadata: Metadata = {
  title: "Create Phone Screening",
  description: "Create a phone screening for a job listing.",
};

export default function CreateScreeningPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <CreateScreeningFlow jobs={jobs} />
    </Suspense>
  );
}
