import {
  EXPERIENCE_CONTEXT_PRESCRIPTION_REALIZATION_POLICY_V1_REFERENCE,
  type EquipmentLoadRealizationResult,
  type ExperienceContextRealizationResult,
  type ExerciseRealizationFamiliarityState,
  type PainAwareRealizationContext,
  type RecentInterruptionState,
} from "./contracts";

export function resolveExperienceContextRealization(input: {
  readonly familiarity: ExerciseRealizationFamiliarityState;
  readonly interruption: RecentInterruptionState;
  readonly equipment: EquipmentLoadRealizationResult;
  readonly painContext: PainAwareRealizationContext;
  readonly equipmentChanged: boolean;
  readonly supportOrRangeChanged: boolean;
  readonly sideSpecific: boolean;
  readonly timeConstrained: boolean;
  readonly firstExposure: boolean;
}): ExperienceContextRealizationResult {
  const reasons: string[] = [];
  let variant: ExperienceContextRealizationResult["variant"] = "unknown_review_required";
  let selectedExistingVariant: ExperienceContextRealizationResult["selectedExistingVariant"] = null;
  let calibrationRequired = false;
  let recompositionRequired = false;

  if (input.painContext.relevant || input.familiarity === "exact_current_adverse" ||
      input.familiarity === "exact_current_limited") {
    variant = "pain_aware_regression";
    selectedExistingVariant = "regression";
    calibrationRequired = true;
    reasons.push("PAIN_OR_LIMITATION_MODIFIES_REALIZATION_WITHOUT_DIAGNOSIS");
  } else if (input.equipment.candidateRecompositionRequired ||
      input.equipment.status === "load_ceiling_reached") {
    variant = "load_ceiling_recomposition";
    recompositionRequired = true;
    reasons.push("PRESCRIPTION_CANNOT_SELECT_NEW_EXERCISE_IDENTITY");
  } else if (input.interruption === "short_absence") {
    variant = "return_after_short_absence";
    selectedExistingVariant = "regression";
    calibrationRequired = true;
    reasons.push("SHORT_ABSENCE_REQUIRES_CONFIRMATION_NOT_PERCENTAGE_REDUCTION");
  } else if (["extended_absence", "currently_interrupted"].includes(input.interruption)) {
    variant = "return_after_extended_absence";
    selectedExistingVariant = "regression";
    calibrationRequired = true;
    reasons.push("EXTENDED_ABSENCE_REQUIRES_BOUNDED_REBUILD");
  } else if (input.equipmentChanged) {
    variant = "equipment_changed";
    selectedExistingVariant = "regression";
    calibrationRequired = true;
    reasons.push("EQUIPMENT_CHANGE_INVALIDATES_EXACT_LOAD_CONTINUITY");
  } else if (input.supportOrRangeChanged) {
    variant = "support_or_range_changed";
    selectedExistingVariant = "regression";
    calibrationRequired = true;
    reasons.push("SUPPORT_OR_RANGE_CHANGE_IS_NEW_REALIZATION_CONTEXT");
  } else if (input.sideSpecific) {
    variant = "side_specific_realization";
    calibrationRequired = true;
    reasons.push("SIDES_DO_NOT_INHERIT_LOAD_AUTHORITY");
  } else if (input.firstExposure || input.familiarity === "unknown") {
    variant = "first_exposure_calibration";
    selectedExistingVariant = "regression";
    calibrationRequired = true;
    reasons.push("FIRST_EXPOSURE_CONFIRMATION_ONLY");
  } else if (input.familiarity === "identity_only" || input.familiarity.startsWith("related_")) {
    variant = "identity_familiar_realization_new";
    selectedExistingVariant = "regression";
    calibrationRequired = true;
    reasons.push("IDENTITY_FAMILIARITY_NOT_EXACT_REALIZATION_AUTHORITY");
  } else if (input.familiarity === "exact_current_productive") {
    variant = "exact_productive_continuity";
    selectedExistingVariant = "standard";
    reasons.push("PRODUCTIVE_LEGAL_ANCHOR_PRESERVED");
  } else if (input.familiarity === "exact_current_tolerated") {
    variant = "familiar_stable";
    selectedExistingVariant = "standard";
    reasons.push("EXACT_TOLERATED_REALIZATION_PRESERVED");
  } else if (input.familiarity === "exact_historical_stale") {
    variant = "unknown_review_required";
    calibrationRequired = true;
    reasons.push("STALE_HISTORY_NOT_CURRENT_AUTHORITY");
  }
  if (input.timeConstrained && !recompositionRequired) {
    variant = "time_constrained_preserve_purpose";
    reasons.push("OPTIONAL_REDUNDANCY_REMOVAL_PRECEDES_PURPOSE_OR_REST_CHANGE");
  }
  return Object.freeze({
    policyReference: EXPERIENCE_CONTEXT_PRESCRIPTION_REALIZATION_POLICY_V1_REFERENCE,
    variant, selectedExistingVariant, preserveExerciseIdentity: !recompositionRequired,
    calibrationRequired, recompositionRequired, purposeChanged: false,
    exerciseIdentitySelected: false, progressionAuthorized: false,
    reasonCodes: Object.freeze(reasons),
  });
}
