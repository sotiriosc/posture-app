import type { LoadTarget } from "../prescription/load";
import {
  PRESCRIPTION_RAMP_UP_POLICY_V1_REFERENCE,
  type ExerciseRealizationFamiliarityState,
  type PrescriptionRampUpBlock,
  type PrescriptionRampUpResult,
  type RampLoadDelta,
} from "./contracts";

export function resolvePrescriptionRampUp(input: {
  readonly exerciseId: string;
  readonly sourceExposureEventId: string;
  readonly familiarity: ExerciseRealizationFamiliarityState;
  readonly loadDelta: RampLoadDelta;
  readonly workingLoadKnown: boolean;
  readonly exactRampLoads: readonly LoadTarget[];
  readonly mainDevelopmentalWork: boolean;
  readonly rampAppropriateForMode: boolean;
  readonly currentReadinessAllowsTraining: boolean;
  readonly sessionMinutesKnown: boolean;
  readonly reviewedRampBlockCount: 0 | 1 | 2 | 3 | 4 | null;
  readonly athletePreferredRampBlockCount: 0 | 1 | 2 | 3 | 4 | null;
}): PrescriptionRampUpResult {
  if (!input.mainDevelopmentalWork || !input.rampAppropriateForMode) return Object.freeze({
    policyReference: PRESCRIPTION_RAMP_UP_POLICY_V1_REFERENCE,
    status: "not_required", blocks: Object.freeze([]), sameSourceExposureEvent: true,
    developmentalCreditCount: 0, exactLoadGuessed: false,
    durationIncluded: input.sessionMinutesKnown,
    reasonCodes: Object.freeze(["RAMP_NOT_APPROPRIATE_FOR_REALIZATION"]),
  });
  if (!input.currentReadinessAllowsTraining) return Object.freeze({
    policyReference: PRESCRIPTION_RAMP_UP_POLICY_V1_REFERENCE,
    status: "policy_required", blocks: Object.freeze([]), sameSourceExposureEvent: true,
    developmentalCreditCount: 0, exactLoadGuessed: false,
    durationIncluded: input.sessionMinutesKnown,
    reasonCodes: Object.freeze(["TRAINING_READINESS_BLOCKS_RAMP_RESOLUTION"]),
  });
  let count: 0 | 1 | 2 | 3 | 4;
  if (input.reviewedRampBlockCount !== null) {
    count = input.reviewedRampBlockCount;
  } else if (input.familiarity === "exact_current_productive" && input.loadDelta === "none") {
    count = 0;
  } else if (["identity_only", "unknown", "related_limited"].includes(input.familiarity) ||
      input.loadDelta === "large") {
    count = 2;
  } else {
    count = 1;
  }
  if (input.athletePreferredRampBlockCount !== null && input.reviewedRampBlockCount === null) {
    count = Math.max(count, input.athletePreferredRampBlockCount) as 0 | 1 | 2 | 3 | 4;
  }
  const blocks = Array.from({ length: count }, (_, index): PrescriptionRampUpBlock => {
    const exactLoad = input.exactRampLoads[index] ?? null;
    return Object.freeze({
      rampBlockId: `${input.sourceExposureEventId}:ramp:${index + 1}`,
      sourceExposureEventId: input.sourceExposureEventId,
      ordinal: (index + 1) as 1 | 2 | 3 | 4,
      loadInstruction: exactLoad ? "exact_reviewed_load" : input.workingLoadKnown ?
        "self_selected_progressive_effort" : "self_selected_progressive_effort",
      exactLoad,
      targetEffortDescription: `Ramp ${index + 1} of ${count}: remain clearly below developmental effort.`,
      developmentalCredit: false,
      completedPerformanceClaimed: false,
    });
  });
  const reasons = [
    "RAMP_BLOCKS_SHARE_DEVELOPMENTAL_SOURCE_EVENT",
    "RAMP_BLOCKS_RECEIVE_ZERO_DEVELOPMENTAL_CREDIT",
    input.reviewedRampBlockCount !== null ? "REVIEWED_RAMP_COUNT_APPLIED" :
      "CONTEXT_SPECIFIC_BOUNDED_RAMP_COUNT",
  ];
  return Object.freeze({
    policyReference: PRESCRIPTION_RAMP_UP_POLICY_V1_REFERENCE,
    status: input.sessionMinutesKnown ? "resolved" : "time_review_required",
    blocks: Object.freeze(blocks),
    sameSourceExposureEvent: true,
    developmentalCreditCount: 0,
    exactLoadGuessed: false,
    durationIncluded: input.sessionMinutesKnown,
    reasonCodes: Object.freeze(reasons),
  });
}
