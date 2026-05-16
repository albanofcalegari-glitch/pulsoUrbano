interface TrustInput {
  reportsCount: number;
  confirmedReportsCount: number;
  rejectedReportsCount: number;
  flagsReceivedCount: number;
}

export function calculateTrustScore(input: TrustInput): number {
  let score = 10;

  score += input.confirmedReportsCount * 5;
  score += input.reportsCount * 2;
  score -= input.flagsReceivedCount * 10;
  score -= input.rejectedReportsCount * 15;

  return Math.max(0, score);
}

export function getStarsFromScore(trustScore: number): number {
  if (trustScore <= 15) return 1;
  if (trustScore <= 40) return 2;
  if (trustScore <= 80) return 3;
  if (trustScore <= 150) return 4;
  return 5;
}
