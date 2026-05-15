import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { CandidateScreeningExperience } from "@/components/screening/candidate-screening-experience";
import { jobs } from "@/data/jobs";

export function generateStaticParams() {
  return jobs.map((job) => ({ jobId: job.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ jobId: string }>;
}): Promise<Metadata> {
  const { jobId } = await params;
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return { title: "Screening" };
  return { title: `${job.title} — Phone screening` };
}

export default async function ScreeningPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const job = jobs.find((j) => j.id === jobId);
  if (!job) {
    notFound();
  }
  return <CandidateScreeningExperience job={job} />;
}
