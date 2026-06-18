import type { Professional } from "../types";

/** Credibility score out of 100 derived from profile metrics. */
export function getCredibilityScore(professional: Professional): number {
  const ratingPart = Math.round((professional.rating / 5) * 40);
  const completionPart = Math.round(professional.completionRate * 0.25);
  const onTimePart = Math.round(professional.onTimeRate * 0.25);
  const communicationPart = Math.round(professional.communicationScore * 0.1);
  return Math.min(100, ratingPart + completionPart + onTimePart + communicationPart);
}
