import { notFound } from "next/navigation";

import { jobs } from "@/data/jobs";

import { ApplicantDetailView } from "./applicant-detail-view";

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ jobId: string; applicantId: string }>;
}) {
  const { jobId, applicantId } = await params;
  const job = jobs.find((j) => j.id === jobId);
  if (!job) {
    notFound();
  }
  return (
    <ApplicantDetailView
      jobId={jobId}
      applicantId={applicantId}
      jobTitle={job.title}
    />
  );
}
