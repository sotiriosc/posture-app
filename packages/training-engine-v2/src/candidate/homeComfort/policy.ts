import {
  HOME_COMFORT_SELECTION_POLICY_CONTRACT,
  type HomeComfortBurden,
  type HomeComfortConfidence,
  type HomeComfortFamiliarity,
  type HomeComfortFit,
  type HomeComfortSelectionContext,
  type HomeComfortSelectionTrace,
} from "./contracts";
import { HOME_COMFORT_PROFILES } from "./profiles";

export const HOME_COMFORT_SELECTION_PRECEDENCE = Object.freeze([
  "training_safety",
  "hard_contraindication_or_personal_block",
  "equipment_legality",
  "required_purpose_or_coverage",
  "pain_and_response_truth",
  "required_dependency",
  "productive_continuity_or_exact_familiarity",
  "home_comfort_when_familiarity_unknown_or_limited",
  "redundancy_and_setup_consequence",
  "local_candidate_rank_or_deterministic_tie",
] as const);

export const HOME_COMFORT_SELECTION_POLICY = Object.freeze({
  contract: HOME_COMFORT_SELECTION_POLICY_CONTRACT,
  precedence: HOME_COMFORT_SELECTION_PRECEDENCE,
  weightedScore: null,
  noveltyQuota: 0,
  varietyQuota: 0,
  homeMeansBeginner: false,
});

const fitRank: Readonly<Record<HomeComfortFit, number>> = { excellent: 0, good: 1, possible: 2, poor: 3 };
const burdenRank: Readonly<Record<HomeComfortBurden, number>> = { low: 0, moderate: 1, high: 2 };
const confidenceRank: Readonly<Record<HomeComfortConfidence, number>> = { high: 0, moderate: 1, low: 2 };

const PACKAGE_R_EXERCISE_IDS = new Set([
  "dumbbell-floor-press",
  "dumbbell-triceps-extension",
  "bent-over-dumbbell-reverse-fly",
  "side-lying-hip-abduction",
  "bird-dog",
  "band-biceps-curl",
  "machine-shoulder-press",
  "machine-leg-extension",
]);

function familiarity(context: HomeComfortSelectionContext, exerciseId: string): HomeComfortFamiliarity {
  if (context.productiveContinuityIds.includes(exerciseId)) return "exact_productive";
  return context.familiarityByExerciseId[exerciseId] ?? "unknown";
}

const familiarityRank: Readonly<Record<HomeComfortFamiliarity, number>> = {
  exact_productive: 0,
  exact_tolerated: 1,
  limited: 2,
  unknown: 3,
};

export function compareHomeComfortCandidates(
  leftExerciseId: string,
  rightExerciseId: string,
  context: HomeComfortSelectionContext,
): { readonly comparison: number; readonly trace: HomeComfortSelectionTrace } {
  const leftFamiliarity = familiarity(context, leftExerciseId);
  const rightFamiliarity = familiarity(context, rightExerciseId);
  const base = {
    leftFamiliarity,
    rightFamiliarity,
    comfortOverrodeSafetyOrLegality: false as const,
    noveltyRewarded: false as const,
  };
  if (context.environment !== "home") {
    return { comparison: 0, trace: { ...base, applicable: false, winnerExerciseId: null, firstMeaningfulDifference: null, stableAnchorPreserved: false } };
  }
  if (!PACKAGE_R_EXERCISE_IDS.has(leftExerciseId) && !PACKAGE_R_EXERCISE_IDS.has(rightExerciseId)) {
    return { comparison: 0, trace: { ...base, applicable: false, winnerExerciseId: null, firstMeaningfulDifference: null, stableAnchorPreserved: false } };
  }

  if (familiarityRank[leftFamiliarity] !== familiarityRank[rightFamiliarity] &&
      (leftFamiliarity.startsWith("exact") || rightFamiliarity.startsWith("exact"))) {
    const comparison = familiarityRank[leftFamiliarity] - familiarityRank[rightFamiliarity];
    return { comparison, trace: { ...base, applicable: true, winnerExerciseId: comparison < 0 ? leftExerciseId : rightExerciseId, firstMeaningfulDifference: "productive_continuity_or_exact_familiarity", stableAnchorPreserved: leftFamiliarity === "exact_productive" || rightFamiliarity === "exact_productive" } };
  }

  const left = HOME_COMFORT_PROFILES[leftExerciseId];
  const right = HOME_COMFORT_PROFILES[rightExerciseId];
  if (!left || !right) {
    return { comparison: 0, trace: { ...base, applicable: false, winnerExerciseId: null, firstMeaningfulDifference: "profile_missing_review_required", stableAnchorPreserved: false } };
  }
  const dimensions = [
    ["first_session_comfort", fitRank[left.firstSessionComfortDisposition], fitRank[right.firstSessionComfortDisposition]],
    ["recognition_familiarity_expectation", confidenceRank[left.recognitionFamiliarityExpectation], confidenceRank[right.recognitionFamiliarityExpectation]],
    ["setup_complexity", burdenRank[left.setupComplexity], burdenRank[right.setupComplexity]],
    ["environmental_anchor_dependence", burdenRank[left.environmentalAnchorDependence], burdenRank[right.environmentalAnchorDependence]],
    ["support_confidence", confidenceRank[left.supportConfidence], confidenceRank[right.supportConfidence]],
    ["balance_stability_burden", burdenRank[left.balanceStabilityBurden], burdenRank[right.balanceStabilityBurden]],
    ["coordination_burden", burdenRank[left.coordinationBurden], burdenRank[right.coordinationBurden]],
    ["transition_complexity", burdenRank[left.transitionComplexity], burdenRank[right.transitionComplexity]],
    ["stop_restart_clarity", confidenceRank[left.stopRestartClarity], confidenceRank[right.stopRestartClarity]],
    ["equipment_ambiguity", burdenRank[left.equipmentAmbiguity], burdenRank[right.equipmentAmbiguity]],
  ] as const;
  const difference = dimensions.find(([, leftValue, rightValue]) => leftValue !== rightValue);
  const comparison = difference ? difference[1] - difference[2] : 0;
  return {
    comparison,
    trace: {
      ...base,
      applicable: true,
      winnerExerciseId: comparison === 0 ? null : comparison < 0 ? leftExerciseId : rightExerciseId,
      firstMeaningfulDifference: difference?.[0] ?? null,
      stableAnchorPreserved: false,
    },
  };
}
