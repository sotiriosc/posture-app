import type { ExerciseDoseMode } from "../prescription/dose";
import type { EffortTarget, RangePrescription, SupportPrescription } from
  "../prescription/executionStandard";
import type { PrescriptionSideBehavior } from "../prescription/types";
import {
  PROGRESSION_STARTING_POINT_POLICY_V1_REFERENCE,
  type EquipmentLoadRealizationResult,
  type ExperienceAuthority,
  type ProgressionStartingPointEvidence,
  type ProgressionStartingPointResult,
  type SelfSelectedCalibrationPrescription,
} from "./contracts";

const EVIDENCE_ORDER: readonly ProgressionStartingPointEvidence["kind"][] = Object.freeze([
  "exact_current_productive_realization",
  "exact_current_tolerated_realization",
  "related_productive_realization",
  "coach_reviewed_current_load_context",
  "athlete_reported_current_load_context",
  "self_selected_effort_calibration",
  "unknown",
]);

function calibration(input: {
  readonly doseMode: ExerciseDoseMode;
  readonly targetRangeDescription: string;
  readonly targetEffort: EffortTarget;
  readonly support: SupportPrescription | null;
  readonly range: RangePrescription | null;
  readonly sideBehavior: PrescriptionSideBehavior | null;
  readonly confirmationOnly: boolean;
}): SelfSelectedCalibrationPrescription {
  return Object.freeze({
    targetDoseMode: input.doseMode,
    targetRangeDescription: input.targetRangeDescription,
    targetEffort: input.targetEffort,
    legalSupport: input.support,
    legalRange: input.range,
    sideBehavior: input.sideBehavior,
    failureRequired: false,
    stopConditions: Object.freeze([
      "STOP_ON_QUALITY_LOSS",
      "STOP_ON_EXPLICIT_RESTRICTION",
      "STOP_IF_TARGET_EFFORT_CANNOT_BE_ESTIMATED",
    ]),
    evidenceToRecord: Object.freeze([
      "ACTUAL_LOAD_OR_REALIZATION",
      "COMPLETED_REPETITIONS_OR_DURATION",
      "OBSERVED_EFFORT",
      "QUALITY_AND_TOLERANCE",
      "EQUIPMENT_SUPPORT_RANGE_SIDE",
    ]),
    confirmationOnly: input.confirmationOnly,
    automaticProgression: false,
  });
}
export function resolveProgressionStartingPoint(input: {
  readonly authority: ExperienceAuthority;
  readonly evidence: readonly ProgressionStartingPointEvidence[];
  readonly equipment: EquipmentLoadRealizationResult;
  readonly doseMode: ExerciseDoseMode;
  readonly targetRangeDescription: string;
  readonly targetEffort: EffortTarget;
  readonly support: SupportPrescription | null;
  readonly range: RangePrescription | null;
  readonly sideBehavior: PrescriptionSideBehavior | null;
}): ProgressionStartingPointResult {
  const reasons: string[] = [];
  if (input.equipment.candidateRecompositionRequired) {
    return Object.freeze({ policyReference: PROGRESSION_STARTING_POINT_POLICY_V1_REFERENCE,
      status: "candidate_composer_recomposition_required", authorityUsed: input.authority,
      evidenceId: null, selectedLoad: null, calibration: null,
      automaticProgressionApplied: false, exactLoadGuessed: false,
      reasonCodes: Object.freeze(["LOAD_CEILING_RECOMPOSITION_REQUIRED"]),
    });
  }
  if (input.equipment.status === "load_ceiling_reached") {
    return Object.freeze({ policyReference: PROGRESSION_STARTING_POINT_POLICY_V1_REFERENCE,
      status: "load_ceiling_reached", authorityUsed: input.authority, evidenceId: null,
      selectedLoad: input.equipment.selectedLoad, calibration: null,
      automaticProgressionApplied: false, exactLoadGuessed: false,
      reasonCodes: Object.freeze(["LOAD_CEILING_VISIBLE"]),
    });
  }
  if (input.equipment.status === "load_increment_unavailable") {
    reasons.push("EXACT_INCREMENT_UNAVAILABLE");
  }
  const ordered = [...input.evidence].sort((left, right) =>
    EVIDENCE_ORDER.indexOf(left.kind) - EVIDENCE_ORDER.indexOf(right.kind) ||
    left.evidenceId.localeCompare(right.evidenceId));
  const exact = ordered.find((entry) =>
    !entry.stale && entry.exactRealizationMatch && entry.productivelyTolerated && entry.load !== null &&
    ["exact_current_productive_realization", "exact_current_tolerated_realization"].includes(entry.kind));
  if (exact && input.equipment.status === "exact_capability_available") {
    return Object.freeze({ policyReference: PROGRESSION_STARTING_POINT_POLICY_V1_REFERENCE,
      status: "exact_prior_load_retained", authorityUsed: input.authority,
      evidenceId: exact.evidenceId, selectedLoad: exact.load, calibration: null,
      automaticProgressionApplied: false, exactLoadGuessed: false,
      reasonCodes: Object.freeze(["EXACT_CURRENT_PRODUCTIVE_OR_TOLERATED_LOAD_RETAINED"]),
    });
  }
  const reviewed = ordered.find((entry) => !entry.stale && entry.load !== null &&
    ["coach_reviewed_current_load_context", "athlete_reported_current_load_context"].includes(entry.kind));
  if (reviewed && input.equipment.status === "exact_capability_available") {
    return Object.freeze({ policyReference: PROGRESSION_STARTING_POINT_POLICY_V1_REFERENCE,
      status: "reviewed_load_requirement_applied", authorityUsed: input.authority,
      evidenceId: reviewed.evidenceId, selectedLoad: reviewed.load, calibration: null,
      automaticProgressionApplied: false, exactLoadGuessed: false,
      reasonCodes: Object.freeze([reviewed.kind === "coach_reviewed_current_load_context" ?
        "COACH_REVIEWED_LOAD_CONTEXT_APPLIED" : "ATHLETE_REPORTED_LOAD_CONTEXT_APPLIED_NOT_PERFORMANCE"]),
    });
  }
  const related = ordered.find((entry) => entry.kind === "related_productive_realization" &&
    !entry.stale && entry.productivelyTolerated);
  if (related) reasons.push("RELATED_PRODUCTIVE_CONTEXT_REQUIRES_CONFIRMATION");
  if (ordered.some((entry) => entry.stale)) reasons.push("STALE_LOAD_NOT_RETAINED");
  if (input.equipment.status === "load_not_applicable") {
    return Object.freeze({ policyReference: PROGRESSION_STARTING_POINT_POLICY_V1_REFERENCE,
      status: "load_not_applicable", authorityUsed: input.authority, evidenceId: related?.evidenceId ?? null,
      selectedLoad: input.equipment.selectedLoad, calibration: null,
      automaticProgressionApplied: false, exactLoadGuessed: false,
      reasonCodes: Object.freeze([...reasons, "LOAD_NOT_APPLICABLE_TO_REALIZATION"]),
    });
  }
  if (input.equipment.selectedLoad?.kind === "bodyweight") {
    return Object.freeze({ policyReference: PROGRESSION_STARTING_POINT_POLICY_V1_REFERENCE,
      status: "bodyweight_realization", authorityUsed: input.authority,
      evidenceId: related?.evidenceId ?? null, selectedLoad: input.equipment.selectedLoad,
      calibration: calibration({ ...input, confirmationOnly: related !== undefined }),
      automaticProgressionApplied: false, exactLoadGuessed: false,
      reasonCodes: Object.freeze([...reasons, "BODYWEIGHT_REALIZATION_REQUIRES_LEVER_RANGE_ASSISTANCE_TRUTH"]),
    });
  }
  return Object.freeze({ policyReference: PROGRESSION_STARTING_POINT_POLICY_V1_REFERENCE,
    status: input.equipment.status === "load_increment_unavailable" ?
      "load_increment_unavailable" : "self_selected_effort_calibration",
    authorityUsed: input.authority, evidenceId: related?.evidenceId ?? null, selectedLoad: null,
    calibration: calibration({ ...input, confirmationOnly: true }),
    automaticProgressionApplied: false, exactLoadGuessed: false,
    reasonCodes: Object.freeze([...reasons, "SELF_SELECTED_LOAD_CALIBRATION_REQUIRED"]),
  });
}
