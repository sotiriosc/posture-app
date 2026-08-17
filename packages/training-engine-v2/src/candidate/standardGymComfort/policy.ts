import type { HomeComfortFamiliarity } from "../homeComfort";
import {
  STANDARD_GYM_COMFORT_POLICY_CONTRACT,
  type StandardGymComfortContext,
  type StandardGymComfortTrace,
} from "./contracts";
import { STANDARD_GYM_COMFORT_PROFILES } from "./profiles";

export const STANDARD_GYM_COMFORT_PRECEDENCE = Object.freeze([
  "training_safety_and_hard_contraindication",
  "equipment_legality_and_required_purpose",
  "productive_continuity_or_exact_familiarity",
  "exact_machine_capability",
  "clearer_standard_machine_setup_when_familiarity_unknown",
  "local_candidate_rank_or_deterministic_tie",
] as const);

export const STANDARD_GYM_COMFORT_POLICY = Object.freeze({
  contract: STANDARD_GYM_COMFORT_POLICY_CONTRACT,
  precedence: STANDARD_GYM_COMFORT_PRECEDENCE,
  weightedScore: null,
  noveltyQuota: 0,
  varietyQuota: 0,
  machineMandatory: false,
  machineSaferClaim: false,
});

const familiarityRank: Readonly<Record<HomeComfortFamiliarity, number>> = {
  exact_productive: 0,
  exact_tolerated: 1,
  limited: 2,
  unknown: 3,
};

function familiarity(context: StandardGymComfortContext, exerciseId: string): HomeComfortFamiliarity {
  if (context.productiveContinuityIds.includes(exerciseId)) return "exact_productive";
  return context.familiarityByExerciseId[exerciseId] ?? "unknown";
}

export function compareStandardGymComfortCandidates(
  leftExerciseId: string,
  rightExerciseId: string,
  context: StandardGymComfortContext,
): { readonly comparison: number; readonly trace: StandardGymComfortTrace } {
  const base = {
    weightedScoreApplied: false as const,
    machineSafetyClaimApplied: false as const,
    noveltyRewarded: false as const,
  };
  if (context.environment !== "commercial_gym") {
    return { comparison: 0, trace: { ...base, applicable: false, winnerExerciseId: null, firstMeaningfulDifference: null, exactMachineCapabilityConfirmed: false, productiveAnchorPreserved: false } };
  }

  const leftProfile = STANDARD_GYM_COMFORT_PROFILES[leftExerciseId];
  const rightProfile = STANDARD_GYM_COMFORT_PROFILES[rightExerciseId];
  if (!leftProfile && !rightProfile) {
    return { comparison: 0, trace: { ...base, applicable: false, winnerExerciseId: null, firstMeaningfulDifference: null, exactMachineCapabilityConfirmed: false, productiveAnchorPreserved: false } };
  }

  const leftFamiliarity = familiarity(context, leftExerciseId);
  const rightFamiliarity = familiarity(context, rightExerciseId);
  if (familiarityRank[leftFamiliarity] !== familiarityRank[rightFamiliarity] &&
      (leftFamiliarity.startsWith("exact") || rightFamiliarity.startsWith("exact"))) {
    const comparison = familiarityRank[leftFamiliarity] - familiarityRank[rightFamiliarity];
    return {
      comparison,
      trace: {
        ...base,
        applicable: true,
        winnerExerciseId: comparison < 0 ? leftExerciseId : rightExerciseId,
        firstMeaningfulDifference: "productive_continuity_or_exact_familiarity",
        exactMachineCapabilityConfirmed: false,
        productiveAnchorPreserved: leftFamiliarity === "exact_productive" || rightFamiliarity === "exact_productive",
      },
    };
  }

  if (![leftFamiliarity, rightFamiliarity].every((value) => value === "unknown" || value === "limited")) {
    return { comparison: 0, trace: { ...base, applicable: false, winnerExerciseId: null, firstMeaningfulDifference: null, exactMachineCapabilityConfirmed: false, productiveAnchorPreserved: false } };
  }

  const leftExact = Boolean(leftProfile && context.availableMachineIds.includes(leftProfile.exactMachineId));
  const rightExact = Boolean(rightProfile && context.availableMachineIds.includes(rightProfile.exactMachineId));
  const leftClear = leftExact && leftProfile?.setupClarity === "clear";
  const rightClear = rightExact && rightProfile?.setupClarity === "clear";
  const comparison = leftClear === rightClear ? 0 : leftClear ? -1 : 1;
  return {
    comparison,
    trace: {
      ...base,
      applicable: leftClear || rightClear,
      winnerExerciseId: comparison === 0 ? null : comparison < 0 ? leftExerciseId : rightExerciseId,
      firstMeaningfulDifference: comparison === 0 ? null : "clearer_standard_machine_setup_when_familiarity_unknown",
      exactMachineCapabilityConfirmed: leftExact || rightExact,
      productiveAnchorPreserved: false,
    },
  };
}
