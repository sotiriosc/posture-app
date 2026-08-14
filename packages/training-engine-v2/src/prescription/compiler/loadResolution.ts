import type { ExerciseDefinition } from "../../domain/exercise";
import type { ExerciseDose } from "../dose";
import type { EffortTarget, LeverPrescription, RangePrescription, SupportPrescription } from "../executionStandard";
import type { LoadTarget } from "../load";
import type { PrescriptionSideBehavior } from "../types";
import type {
  PrescriptionEquipmentRealization,
  PrescriptionLoadResolutionTrace,
  PriorPrescriptionRealizationEvidence,
} from "./contracts";
import { explicitIsoTime, sameSemanticValue } from "./utilities";

function repetitionTarget(dose: ExerciseDose): unknown {
  return dose.mode === "repetition_sets" ? dose.repetitions : null;
}

export function validatePriorPrescriptionRealizationEvidence(
  evidence: PriorPrescriptionRealizationEvidence,
): readonly string[] {
  const reasons: string[] = [];
  for (const value of [
    evidence.exerciseId,
    evidence.prescriptionId,
    evidence.prescriptionRevisionId,
    evidence.sourceExposureEventId,
    evidence.actualPerformanceRef,
  ]) {
    if (!value.trim()) reasons.push("PRIOR_REALIZATION_IDENTITY_INCOMPLETE");
  }
  if (!explicitIsoTime(evidence.occurredAt)) reasons.push("PRIOR_REALIZATION_TIME_INVALID");
  if (evidence.progressionAssumed !== false) reasons.push("PRIOR_REALIZATION_PROGRESSSION_FLAG_INVALID");
  if (
    evidence.completed &&
    (evidence.observedActualLoad === null || !evidence.actualPerformanceRef.trim())
  ) reasons.push("PRIOR_REALIZATION_ACTUAL_OBSERVATION_INCOMPLETE");
  return [...new Set(reasons)].sort();
}

export function resolvePrescriptionLoad(input: {
  readonly exercise: ExerciseDefinition;
  readonly mode: ExerciseDose["mode"];
  readonly currentDoseWithoutLoad: ExerciseDose;
  readonly effort: EffortTarget;
  readonly currentEquipmentRealization: PrescriptionEquipmentRealization;
  readonly sideBehavior: PrescriptionSideBehavior | null;
  readonly support: SupportPrescription | null;
  readonly range: RangePrescription | null;
  readonly lever: LeverPrescription | null;
  readonly priorEvidence: PriorPrescriptionRealizationEvidence | null;
  readonly reviewedRequirementLoad: LoadTarget | null;
}): { readonly invalidEvidence: boolean; readonly trace: PrescriptionLoadResolutionTrace } {
  if (input.reviewedRequirementLoad) {
    return {
      invalidEvidence: false,
      trace: {
        status: "REVIEWED_REQUIREMENT_APPLIED",
        selectedLoad: input.reviewedRequirementLoad,
        exactPriorRejectionReasonCodes: [],
        automaticProgressionApplied: false,
      },
    };
  }
  if (input.exercise.loading.loadability === "none") {
    return {
      invalidEvidence: false,
      trace: {
        status: "BODYWEIGHT",
        selectedLoad: { kind: "bodyweight" },
        exactPriorRejectionReasonCodes: [],
        automaticProgressionApplied: false,
      },
    };
  }
  const evidence = input.priorEvidence;
  if (!evidence) {
    return fallback(input.effort, ["NO_PRIOR_REALIZATION_EVIDENCE"]);
  }
  const invalidReasons = validatePriorPrescriptionRealizationEvidence(evidence);
  if (invalidReasons.length > 0) {
    return {
      invalidEvidence: true,
      trace: fallback(input.effort, invalidReasons).trace,
    };
  }
  const rejectionReasons: string[] = [];
  if (evidence.exerciseId !== input.exercise.id) rejectionReasons.push("PRIOR_EXERCISE_IDENTITY_DIFFERS");
  if (evidence.doseMode !== input.mode) rejectionReasons.push("PRIOR_DOSE_MODE_DIFFERS");
  if (evidence.equipmentRealization.realizationId !== input.currentEquipmentRealization.realizationId) rejectionReasons.push("PRIOR_EQUIPMENT_REALIZATION_DIFFERS");
  if (!sameSemanticValue(evidence.sideBehavior, input.sideBehavior)) rejectionReasons.push("PRIOR_SIDE_BEHAVIOR_DIFFERS");
  if (!sameSemanticValue(evidence.support, input.support)) rejectionReasons.push("PRIOR_SUPPORT_DIFFERS");
  if (!sameSemanticValue(evidence.range, input.range)) rejectionReasons.push("PRIOR_RANGE_DIFFERS");
  if (!sameSemanticValue(evidence.lever, input.lever)) rejectionReasons.push("PRIOR_LEVER_DIFFERS");
  if (!sameSemanticValue(repetitionTarget(evidence.plannedDose), repetitionTarget(input.currentDoseWithoutLoad))) rejectionReasons.push("PRIOR_REPETITION_TARGET_INCOMPATIBLE");
  if (evidence.observedActualLoad === null) rejectionReasons.push("PRIOR_ACTUAL_LOAD_NOT_OBSERVED");
  if (!evidence.completed) rejectionReasons.push("PRIOR_REALIZATION_NOT_COMPLETED");
  if (!evidence.productivelyTolerated) rejectionReasons.push("PRIOR_REALIZATION_NOT_PRODUCTIVELY_TOLERATED");
  if (evidence.unresolvedLoadRestriction) rejectionReasons.push("UNRESOLVED_LOAD_RESTRICTION");
  if (!evidence.exactIncrementStillAvailable) rejectionReasons.push("EXACT_INCREMENT_UNAVAILABLE");
  if (evidence.progressionAssumed !== false) rejectionReasons.push("PROGRESSION_MAY_NOT_BE_ASSUMED");
  if (rejectionReasons.length > 0 || evidence.observedActualLoad === null) {
    return fallback(input.effort, rejectionReasons);
  }
  return {
    invalidEvidence: false,
    trace: {
      status: "EXACT_PRIOR_LOAD_RETAINED",
      selectedLoad: evidence.observedActualLoad,
      exactPriorRejectionReasonCodes: [],
      automaticProgressionApplied: false,
    },
  };
}

function fallback(
  effort: EffortTarget,
  rejectionReasons: readonly string[],
): { readonly invalidEvidence: false; readonly trace: PrescriptionLoadResolutionTrace } {
  return {
    invalidEvidence: false,
    trace: {
      status: "USER_SELECTED_BY_EFFORT",
      selectedLoad: {
        kind: "user_selected_by_effort",
        effort: effort.kind === "quality_limited"
          ? {
            kind: "self_selected_by_reviewed_standard",
            standardId: "PRESCRIPTION_POLICY_V1:quality-limited",
            description: effort.description,
          }
          : effort,
      },
      exactPriorRejectionReasonCodes: [...rejectionReasons].sort(),
      automaticProgressionApplied: false,
    },
  };
}
