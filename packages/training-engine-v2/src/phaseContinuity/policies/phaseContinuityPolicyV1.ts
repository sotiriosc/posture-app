import type { ProductionPhaseContinuityPolicy } from "./policyContracts";
import { PRODUCTION_PHASE_CONTINUITY_V1_CRITERIA } from "./phaseCriteriaV1";

export const PHASE_CONTINUITY_POLICY_V1_ID =
  "PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT" as const;
export const PHASE_CONTINUITY_POLICY_V1_VERSION = "1.0.0" as const;
export const PHASE_CONTINUITY_POLICY_V1_REFERENCE = Object.freeze({
  policyId: PHASE_CONTINUITY_POLICY_V1_ID,
  version: PHASE_CONTINUITY_POLICY_V1_VERSION,
});

export const PRODUCTION_PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT:
ProductionPhaseContinuityPolicy = Object.freeze({
  reference: PHASE_CONTINUITY_POLICY_V1_REFERENCE,
  state: "OWNER_SELECTED_FOR_PRODUCTION_KERNEL_NOT_ACTIVATED",
  reviewer: "phase_continuity_policy_owner",
  reviewedAt: "2026-08-14T12:00:00-04:00",
  philosophy: Object.freeze([
    "EVIDENCE_BEFORE_TRANSITION",
    "STAY_IS_ALWAYS_LEGAL_WHEN_SAFE",
    "ADJACENT_ADVANCEMENT_ONLY",
    "NO_CALENDAR_TRIGGER",
    "NO_PROGRAM_RESET",
    "KEEP_PRODUCTIVE_ANCHORS",
    "PRESCRIPTION_REVIEW_BEFORE_REPLACEMENT",
    "NO_AUTOMATIC_EXERCISE_PROGRESSION",
    "NO_AUTOMATIC_ROTATION",
    "UNKNOWN_MEANS_HOLD",
    "CONFLICT_MEANS_REVIEW",
  ]),
  criterionDefinitionIds: Object.freeze(PRODUCTION_PHASE_CONTINUITY_V1_CRITERIA.map((entry) => entry.criterionId)),
  automaticAdvancement: false,
  automaticRegression: false,
  automaticCycleReset: false,
  automaticProgression: false,
  automaticReplacement: false,
  automaticRotation: false,
  automaticDeload: false,
  provenance: Object.freeze([
    "owner-authorization:PRODUCTION_PHASE_CONTINUITY_KERNEL_IMPLEMENTATION_NOT_ACTIVATION",
    "admitted-design:PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT@1.0.0",
  ]),
});
