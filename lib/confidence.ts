import type { LocationValidation } from "@/types";

interface ConfidenceInput {
  hasPhoto: boolean;
  locationValidation: LocationValidation;
  userTrustStars: number;
  confirmationCount: number;
  flagCount: number;
  removalCount: number;
  hoursOld: number;
}

export function calculateConfidence(input: ConfidenceInput): number {
  let score = 0;

  if (input.hasPhoto) score += 20;

  if (input.locationValidation === "validated_nearby") score += 25;
  else if (input.locationValidation === "too_far") score -= 5;

  score += input.userTrustStars * 5;

  score += Math.min(input.confirmationCount * 10, 30);

  score -= input.flagCount * 15;
  score -= input.removalCount * 10;

  if (input.hoursOld > 48) score -= 10;

  return Math.max(0, Math.min(100, score));
}

export function getConfidenceLevel(score: number): {
  label: string;
  color: string;
} {
  if (score <= 25) return { label: "Confianza baja", color: "#EF4444" };
  if (score <= 50) return { label: "Confianza media", color: "#F59E0B" };
  if (score <= 75) return { label: "Confianza alta", color: "#10B981" };
  return { label: "Confianza muy alta", color: "#059669" };
}
