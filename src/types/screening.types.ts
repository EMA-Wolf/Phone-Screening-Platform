export type ResponseType = "text" | "audio";

export interface Question {
  id: string;
  text: string;
  responseType: ResponseType;
  isCustom: boolean;
}

export interface Screening {
  id: string;
  jobId: string;
  createdAt: string;
  questions: Question[];
}
