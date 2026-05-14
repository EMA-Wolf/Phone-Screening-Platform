export type AnswerResponseType = "text" | "audio";

export interface Answer {
  questionId: string;
  responseType: AnswerResponseType;
  value: string;
}

export interface Submission {
  id: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  answers: Answer[];
  submittedAt: string;
}
