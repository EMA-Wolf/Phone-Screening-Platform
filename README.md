# Phone Screening Platform

A UI-only **Next.js** take-home for **Remotown GmbH / Aihrly Hiring** — a two-sided app where recruiters create phone screenings for seeded jobs and candidates complete them via a public link. There is **no backend**; jobs live in code and screenings/submissions persist in **localStorage**.

## Quick start

**Requirements:** Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/jobs`).

Other scripts:

```bash
npm run build   # production build
npm run start   # serve production build
npm run lint    # ESLint
npm test        # Jest (welcome form validation)
```

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, functional components + hooks |
| Styling | Tailwind CSS v4, shadcn/ui-style components |
| Persistence | `localStorage` (`aihrly_screenings`, `aihrly_submissions`) |
| Jobs data | Static seed in `src/data/jobs.ts` |

**Out of scope (per brief):** backend/API, database, auth, real audio recording, real AI analysis.

## Routes

| Path | Audience | Purpose |
|------|----------|---------|
| `/jobs` | Recruiter | Jobs dashboard — cards, search, title filter, screening/applicant counts |
| `/jobs/create-screening` | Recruiter | Create screening — pick job, generate/edit questions, save |
| `/jobs/[jobId]` | Recruiter | Job detail — description, public link, applicants table |
| `/jobs/[jobId]/applicants/[applicantId]` | Recruiter | Applicant responses + mock **Analyze** |
| `/screening/[jobId]` | Candidate | Welcome → one question at a time → thank-you |

## Data model & storage

**Jobs** — `src/data/jobs.ts` (4 seeded roles).

**Screenings** — key `aihrly_screenings`, array of:

```ts
interface Screening {
  id: string;
  jobId: string;
  createdAt: string;
  questions: Question[];
}
```

**Submissions** — key `aihrly_submissions`, array of:

```ts
interface Submission {
  id: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  answers: Answer[];
  submittedAt: string;
}
```

Recruiter and candidate flows share these keys so submissions appear on the job detail page after a candidate finishes.

**Helpers:** `src/lib/screenings-storage.ts`, `src/lib/submissions-storage.ts`, `src/data/default-screening-questions.ts` (6 template questions per job on generate).

## Approach

- **App Router** with server pages for static job params and **client components** wherever `localStorage` or interaction is required.
- **Hydration pattern:** defer reading storage until after mount (`queueMicrotask` + `mounted` flag) to avoid SSR/client mismatches and satisfy the React Compiler lint rules around effects.
- **Feature-oriented folders:** `src/components/jobs/`, `src/components/screening/`, `src/app/...` route shells, `src/types/` for shared shapes aligned with the PDF.
- **Latest screening per job** drives the candidate flow (`latestScreeningForJob`); recruiters can save multiple versions over time.

## What was built (core brief)

### Recruiter

- [x] **Jobs dashboard** — grid/list, job cards (title, location, type, screening count, applicant count), empty states, search by title, filter by job title toggles.
- [x] **Create phone screening** — job select, generate questions (~600ms loading), edit text, text/audio type, add custom, remove, save to `localStorage`, return to job detail.
- [x] **Job detail** — header, copyable screening URL, preview link, applicants list with view action, empty states, screening stats.
- [x] **Applicant detail** — Q&A (text + audio placeholder UI), mock analysis with loading delay, recommendation badge, back navigation.

### Candidate

- [x] **Welcome** — job context, name/email **form** with validation (valid email shape, min name length).
- [x] **Question flow** — one question at a time, progress bar and “X of Y”, written/audio toggle (audio is demo placeholder), **Previous** supported.
- [x] **Thank-you** — submission summary, persist to `aihrly_submissions`, download transcript.

### UX / quality (from brief)

- [x] Responsive layouts and empty states.
- [x] Form validation on candidate welcome step.
- [x] Focus-visible styles on interactive controls.
- [x] Component split (dashboard, cards, create flow, job/applicant views, screening experience).
- [x] TypeScript types for jobs, screenings, submissions, analysis.

## Nice-to-have / bonus (partial)

| Item | Status |
|------|--------|
| Search/filter on jobs | Done (search + title funnel) |
| Applicant count on job cards | Done |
| Back navigation in candidate flow | Done |
| Drag-and-drop question reorder | Done — `@dnd-kit` on create-screening |
| Light/dark mode toggle (persists in `aihrly_theme`) | Done — global toggle, top-right on all pages |
| Framer Motion on question transitions | Done — slide/fade between questions (respects reduced motion) |
| Unit tests (Jest + RTL) | Partial — Jest tests for `validateWelcomeForm` in `src/lib/welcome-form-validation.test.ts` |
| Working MediaRecorder audio | Not implemented (placeholder + optional text note) |

  ## Trade-offs & Assumptions

**Trade-offs**
- **“Started” applicants**  — Only **completed** submissions (saved on thank-you) appear in the recruiter list; partial in-progress answers are not stored.
- **Audio answers**  — UI supports audio type; demo stores a placeholder string or optional note, not real recordings.
- **Analyze**  — Static mock in `src/lib/mock-analysis.ts` with ~1.6s delay; no API.

**Assumptions**
- **Company name on candidate welcome**  — “TechFlow Systems” is display copy for the mock UI; job title/location come from seed data.
- **Generate questions**  — Template list tailored by job title, not per-job static maps (acceptable per brief).
- **Multiple screenings per job**  — Candidates use the **latest** saved screening by `createdAt`. Older versions remain in storage but are not offered as a picker on the public link.

## Project structure (high level)

```
src/
├── app/                    # Routes (jobs, screening, create-screening)
├── components/
│   ├── jobs/               # Dashboard, cards, create flow
│   ├── screening/          # Candidate experience
│   └── ui/                 # Button, Card, etc.
├── data/                   # jobs.ts, default-screening-questions.ts
├── lib/                    # localStorage + mock analysis
└── types/                  # Job, Screening, Submission, Analysis
```

## End-to-end demo

1. Open `/jobs` → **Create Phone Screening** → pick a job → **Generate** → edit if needed → **Save**.
2. Open the job → copy **screening link** or use **Preview screening**.
3. Complete the candidate flow (valid name + email, answer all questions).
4. Return to job detail → open applicant → **Analyze responses**.

To reset client data, clear `aihrly_screenings` and `aihrly_submissions` in DevTools → Application → Local Storage.

## Live preview

**Deployed app:** _[https://phone-screening-five.vercel.app/](https://phone-screening-five.vercel.app/)_

**Time spent:** ~11 hours 20 minutes (5 sessions: setup & jobs dashboard, recruiter flows, candidate screening, polish/bonus features, skeletons & final review)


---

**Remotown GmbH / Aihrly Hiring** — Frontend take-home, NSS 2026/2027. Confidential assessment materials.
