import type { Question } from "@/types/screening.types";

/**
 * Mock phone-screening questions (no backend). 6 templates per generation.
 */
export function buildDefaultQuestions(jobTitle: string): Question[] {
  const templates = [
    `In about two minutes, what draws you to the ${jobTitle} role, and what do you hope to learn in the next year?`,
    `Describe a recent project where you owned a meaningful slice of delivery end to end. What was hard, and what would you do differently?`,
    `How do you approach breaking down an ambiguous problem when requirements are still shifting?`,
    `Tell us about a time you disagreed with a teammate or stakeholder. How did you move the work forward?`,
    `What does good collaboration look like for you on a remote or distributed team?`,
    `Do you have any questions for us about the role, the team, or how success is measured here?`,
  ];

  return templates.map((text) => ({
    id: crypto.randomUUID(),
    text,
    responseType: "text" as const,
    isCustom: false,
  }));
}
