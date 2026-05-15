export type HiringRecommendation = "advance" | "reject" | "hold";

export interface AnalysisResult {
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendation: HiringRecommendation;
}
