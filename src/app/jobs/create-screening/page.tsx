import type { Metadata } from "next";

import { CreateScreeningFlow } from "@/components/jobs/create-screening-flow";
import { jobs } from "@/data/jobs";

export const metadata: Metadata = {
  title: "Create Phone Screening",
  description: "Create a phone screening for a job listing.",
};

export default function CreateScreeningPage() {
  return <CreateScreeningFlow jobs={jobs} />;
}
