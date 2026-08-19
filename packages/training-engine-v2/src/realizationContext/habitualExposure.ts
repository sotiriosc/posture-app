import {
  HABITUAL_TRAINING_EXPOSURE_PROFILE_CONTRACT_REFERENCE,
  type HabitualExposureComparisonResult,
  type HabitualTrainingExposureProfile,
  type ProposedHabitualExposureComparison,
} from "./contracts";

export function compareProposedWithHabitualExposure(input: {
  readonly profile: HabitualTrainingExposureProfile;
  readonly laneId: string;
  readonly proposedDoseMode: string;
  readonly proposedDevelopmentalBlockCount: number;
  readonly reviewedComparison?: Exclude<ProposedHabitualExposureComparison, "unknown">;
}): HabitualExposureComparisonResult {
  const lane = input.profile.lanes.find((entry) => entry.laneId === input.laneId) ?? null;
  const reasons: string[] = [];
  let comparison: ProposedHabitualExposureComparison = "unknown";

  if (!lane || lane.state === "unknown" || lane.completedSourceExposureEventIds.length === 0) {
    reasons.push("HABITUAL_COMPLETED_EXPOSURE_REQUIRED");
  } else if (lane.doseMode !== input.proposedDoseMode) {
    comparison = "incomparable_modes";
    reasons.push("INCOMPATIBLE_DOSE_MODES_NOT_SUMMED");
  } else if (input.reviewedComparison) {
    comparison = input.reviewedComparison;
    reasons.push("CALLER_REVIEWED_COMPARISON_APPLIED");
  } else if (input.proposedDevelopmentalBlockCount === lane.completedDevelopmentalBlockCount) {
    comparison = "within_habitual";
    reasons.push("EXACT_COMPLETED_BLOCK_COUNT_MATCH");
  } else if (input.proposedDevelopmentalBlockCount < lane.completedDevelopmentalBlockCount) {
    comparison = "below_habitual";
    reasons.push("PROPOSED_BLOCK_COUNT_BELOW_COMPLETED_BASELINE");
  } else {
    reasons.push("ABOVE_HABITUAL_MAGNITUDE_POLICY_REQUIRED");
  }

  return Object.freeze({
    laneId: lane?.laneId ?? null,
    comparison,
    habitualCompletedBlockCount: lane?.completedDevelopmentalBlockCount ?? null,
    proposedDevelopmentalBlockCount: input.proposedDevelopmentalBlockCount,
    thresholdPolicyApplied: false,
    universalPercentageApplied: false,
    reviewRequired: ["materially_above_habitual_review_required",
      "materially_below_habitual_review_required", "unknown"].includes(comparison),
    reasonCodes: Object.freeze(reasons),
  });
}

export function validateHabitualTrainingExposureProfile(
  profile: HabitualTrainingExposureProfile,
): readonly string[] {
  const reasons: string[] = [];
  if (profile.contractReference.contractId !==
      HABITUAL_TRAINING_EXPOSURE_PROFILE_CONTRACT_REFERENCE.contractId ||
      profile.contractReference.contractVersion !==
      HABITUAL_TRAINING_EXPOSURE_PROFILE_CONTRACT_REFERENCE.contractVersion) {
    reasons.push("HABITUAL_EXPOSURE_PROFILE_VERSION_INVALID");
  }
  if (!profile.profileId.trim() || !profile.athleteId.trim()) {
    reasons.push("HABITUAL_EXPOSURE_PROFILE_IDENTITY_REQUIRED");
  }
  if (profile.userAuthoredDraftEventCount !== 0) {
    reasons.push("DRAFT_PLAN_CANNOT_BECOME_COMPLETED_EXPOSURE");
  }
  if (profile.incompatibleModesSummed) reasons.push("INCOMPATIBLE_MODES_CANNOT_BE_SUMMED");
  const laneIds = new Set<string>();
  for (const lane of profile.lanes) {
    if (laneIds.has(lane.laneId)) reasons.push(`DUPLICATE_HABITUAL_LANE:${lane.laneId}`);
    laneIds.add(lane.laneId);
    if (lane.fractionalSetEquivalent !== null) reasons.push(`FRACTIONAL_SET_EQUIVALENT:${lane.laneId}`);
    if (lane.materialAuthority === "completed_source_events" &&
        lane.completedSourceExposureEventIds.length === 0) {
      reasons.push(`COMPLETED_SOURCE_EVENT_REQUIRED:${lane.laneId}`);
    }
  }
  return Object.freeze([...new Set(reasons)].sort());
}
