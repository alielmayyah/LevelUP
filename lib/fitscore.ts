export interface FitScoreTier {
  label: string;
  dotClassName: string;
  textClassName: string;
  pillClassName: string;
}

/**
 * FitScore reflects current body composition (0-100), separate from XP/Level
 * which reflects long-term effort. Tiers per product spec. Colors route
 * through the theme's semantic success/warning/danger tokens so a rebrand
 * never has to touch this file.
 */
export function getFitScoreTier(score: number): FitScoreTier {
  if (score >= 70) {
    return {
      label: score >= 90 ? "Elite" : score >= 80 ? "Excellent" : "Very Good",
      dotClassName: "bg-success",
      textClassName: "text-success",
      pillClassName: "bg-success/15",
    };
  }
  if (score >= 50) {
    return {
      label: score >= 60 ? "Good" : "Average",
      dotClassName: "bg-warning",
      textClassName: "text-warning",
      pillClassName: "bg-warning/15",
    };
  }
  return {
    label: "Needs Improvement",
    dotClassName: "bg-danger",
    textClassName: "text-danger",
    pillClassName: "bg-danger/15",
  };
}
