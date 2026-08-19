import {
  RETURN_OR_REBUILD_REALIZATION_POLICY_V1_REFERENCE,
  type ReturnOrRebuildAbsenceState,
  type ReturnOrRebuildRealizationResult,
} from "./contracts";

export function resolveReturnOrRebuildRealization(input: {
  readonly absenceState: ReturnOrRebuildAbsenceState;
  readonly priorExactOrRelatedProductive: boolean;
  readonly equipmentCompatible: boolean;
  readonly supportRangeSideCompatible: boolean;
  readonly safetyClear: boolean;
  readonly painAwareRegressionRequired: boolean;
  readonly currentReadinessKnown: boolean;
  readonly currentFamiliarityKnown: boolean;
  readonly priorProductiveVolumeKnown: boolean;
  readonly currentTimeCapacityKnown: boolean;
}): ReturnOrRebuildRealizationResult {
  const reasons: string[] = [];
  if (!input.safetyClear) reasons.push("TRAINING_SAFETY_OWNER_REQUIRED");
  if (!input.currentReadinessKnown) reasons.push("CURRENT_READINESS_REQUIRED");
  if (!input.currentTimeCapacityKnown) reasons.push("CURRENT_TIME_CAPACITY_REQUIRED");
  if (!input.priorProductiveVolumeKnown) reasons.push("PRIOR_PRODUCTIVE_VOLUME_UNKNOWN");

  const requiresRegression = input.painAwareRegressionRequired ||
    input.absenceState === "extended" || input.absenceState === "detrained" ||
    !input.equipmentCompatible || !input.supportRangeSideCompatible;
  const unknown = input.absenceState === "unknown" || !input.currentFamiliarityKnown || !input.safetyClear;
  const status: ReturnOrRebuildRealizationResult["status"] = unknown ? "review_required" :
    requiresRegression ? "regression_variant_calibration_required" :
      input.priorExactOrRelatedProductive ? "identity_preserved_calibration_required" :
        "confirmation_exposures_required";
  reasons.push("NO_UNIVERSAL_PERCENTAGE_OR_SET_REDUCTION");
  reasons.push("PROGRESSION_HELD_PENDING_REALIZED_RESPONSE");
  return Object.freeze({
    policyReference: RETURN_OR_REBUILD_REALIZATION_POLICY_V1_REFERENCE,
    status,
    preserveExerciseIdentity: input.priorExactOrRelatedProductive && input.safetyClear,
    selectedExistingVariant: requiresRegression ? "regression" : null,
    calibrationRequired: true,
    boundedAcclimationPermitted: input.safetyClear,
    progressionHeld: true,
    confirmationExposureCount: unknown ? null : input.absenceState === "short" ? 1 : 2,
    universalPercentageReductionApplied: false,
    universalSetReductionApplied: false,
    deloadApplied: false,
    outcomeGoalChanged: false,
    reasonCodes: Object.freeze(reasons),
  });
}
