import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { jobs } from "@/data/jobs";

import { JobDetailView } from "./job-detail-view";

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
  if (!job) return { title: "Job" };
  return { title: `${job.title} — Jobs` };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const job = jobs.find((j) => j.id === jobId);
  if (!job) {
    notFound();
  }
  return <JobDetailView job={job} />;
}
