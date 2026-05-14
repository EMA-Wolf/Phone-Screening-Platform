import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Phone Screening",
};

export default function CreateScreeningPage() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center px-4 py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Recruiter workspace
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Create phone screening
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The multi-step create flow will live here (job pick, generate questions,
        edit, save).
      </p>
      <Link
        href="/jobs"
        className="mt-8 inline-flex w-fit text-sm font-medium text-foreground underline-offset-4 hover:underline"
      >
        ← Back to jobs dashboard
      </Link>
    </div>
  );
}
