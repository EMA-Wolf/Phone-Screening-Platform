import type { AnalysisResult } from "@/types/analysis.types";

const MOCK: AnalysisResult = {
  summary:
    "The candidate communicates clearly and gives structured examples. Responses align reasonably with the role, though a few answers stay high-level and would benefit from follow-up in a live call.",
  strengths: [
    "Concrete examples when describing past work and trade-offs.",
    "Professional tone and coherent narrative across answers.",
    "Shows awareness of collaboration and stakeholder communication.",
  ],
  concerns: [
    "Limited depth on metrics and measurable outcomes in one response.",
    "One answer is brief relative to the question scope.",
  ],
  recommendation: "hold",
};

/**
 * Simulated “analysis” for the take-home (no real AI).
 */
export function fetchMockAnalysis(): Promise<AnalysisResult> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK), 1600);
  });
}
