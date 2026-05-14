import type { Metadata } from "next";

import { JobsDashboard } from "@/components/jobs/jobs-dashboard";
import { jobs } from "@/data/jobs";

export const metadata: Metadata = {
  title: "Jobs Dashboard — Aihrly Phone Screening",
  description:
    "Recruiter workspace for managing jobs and phone screenings.",
};

export default function JobsPage() {
  return <JobsDashboard jobs={jobs} />;
}
