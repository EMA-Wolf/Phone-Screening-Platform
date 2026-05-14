import React from 'react'
import { jobs } from '@/data/jobs'
import { JobCard } from '@/components/jobs/jobCards'
export default function page() {
  return (
    <div>
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} screeningCount={0} />
      ))}
    </div>
  )
}
