export const CANDIDATE_PAIN_SCORING_COEFFICIENTS = {
  painSuitability: {
    currentDiscomfort: 0.9,
    moderatePain: 1.8,
    historicalSensitivity: 0.4,
  },
  jointCost: {
    currentDiscomfort: 0.8,
    moderatePain: 1.4,
    historicalSensitivity: 0.35,
    axial: 0.35,
    accumulation: 0.7,
  },
} as const;
