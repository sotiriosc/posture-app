import {
  compareProposedWithHabitualExposure,
  resolveAdvancedIntensityTechniqueBoundary,
  resolveEquipmentLoadRealization,
  resolveExperienceAuthority,
  resolveExperienceContextRealization,
  resolvePrescriptionRampUp,
  resolveProgressionStartingPoint,
  resolveReturnOrRebuildRealization,
  stableAnchorDisposition,
  validateAthleteAuthoredProgrammingBrief,
  buildProgressionAxisRealizationOptions,
  validateAthleteTrainingExperienceProfile,
  validateExerciseIdentityFamiliarityProfile,
  validateExerciseRealizationFamiliarityProfile,
  validateHabitualTrainingExposureProfile,
  validateSpecializationPriorityProfile,
} from "../../realizationContext";
import { compilePrescriptionAssignmentV1_2,
  PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE } from "../compilerV1_2";
import {
  PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE,
  type PrescriptionAssignmentCompilationResultV1_3,
  type PrescriptionAssignmentCompilerInputV1_3,
  type PrescriptionCompilerStatusV1_3,
  type ProductionExercisePrescriptionPlanV1_3,
} from "./contracts";

function applyStartingLoad(
  plan: NonNullable<PrescriptionAssignmentCompilationResultV1_3["baseCompilation"]>["plan"],
  selectedLoad: NonNullable<PrescriptionAssignmentCompilationResultV1_3["startingPoint"]>["selectedLoad"],
) {
  if (!plan || !selectedLoad) return plan;
  const doseBlocks = plan.doseBlocks.map((block) => block.purpose === "developmental_work" ?
    Object.freeze({ ...block, dose: Object.freeze({ ...block.dose, load: selectedLoad }) }) : block);
  const projectedDose = plan.compatibilityProjection.projectedDose;
  return Object.freeze({
    ...plan,
    doseBlocks: Object.freeze(doseBlocks),
    compatibilityProjection: projectedDose ? Object.freeze({
      ...plan.compatibilityProjection,
      projectedDose: Object.freeze({ ...projectedDose, load: selectedLoad }),
    }) : plan.compatibilityProjection,
  });
}

function empty(input: PrescriptionAssignmentCompilerInputV1_3,
  status: PrescriptionCompilerStatusV1_3,
  reasons: readonly string[],
  partial: Partial<PrescriptionAssignmentCompilationResultV1_3> = {},
): PrescriptionAssignmentCompilationResultV1_3 {
  return Object.freeze({
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE,
    status,
    realizationStatusTrace: Object.freeze([...reasons]),
    baseCompilation: null,
    plan: null,
    equipmentLoadRealization: null,
    startingPoint: null,
    contextRealization: null,
    returnOrRebuild: null,
    habitualExposureComparison: null,
    rampUp: null,
    progressionOptions: null,
    intensityTechniqueBoundary: resolveAdvancedIntensityTechniqueBoundary(
      input.intensityTechniqueRequests,
    ),
    fallbackApplied: false,
    progressionApplied: false,
    authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME",
    productionActivationStatus: "NOT_ACTIVATED",
    ...partial,
  });
}

export function compilePrescriptionAssignmentV1_3(
  input: PrescriptionAssignmentCompilerInputV1_3,
): PrescriptionAssignmentCompilationResultV1_3 {
  if (input.compilerContract.contractId !==
      PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE.contractId ||
      input.compilerContract.contractVersion !==
      PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE.contractVersion) {
    return empty(input, "context_realization_conflict", ["UNSUPPORTED_COMPILER_CONTRACT"]);
  }
  const handoff = input.handoff.assignments.find((entry) => entry.handoffId === input.assignmentHandoffId);
  const knowledge = handoff ? input.exerciseKnowledgeRegistry.find((entry) =>
    entry.exerciseId === handoff.exerciseId) : null;
  if (!handoff || !knowledge) return empty(input, "catalog_identity_gap",
    ["EXACT_CANONICAL_EXERCISE_ID_REQUIRED"]);
  const profileIssues = [
    ...validateAthleteTrainingExperienceProfile(input.experienceProfile),
    ...validateExerciseIdentityFamiliarityProfile(input.identityFamiliarityProfile),
    ...validateExerciseRealizationFamiliarityProfile(input.realizationFamiliarityProfile)
      .filter((issue) => issue !== "REALIZATION_FAMILIARITY_FRESHNESS_POLICY_REQUIRED"),
    ...validateHabitualTrainingExposureProfile(input.habitualExposureProfile),
    ...(input.programmingBrief ? validateAthleteAuthoredProgrammingBrief(input.programmingBrief) : []),
    ...(input.specializationProfile ?
      validateSpecializationPriorityProfile(input.specializationProfile) : []),
  ];
  const athleteIds = [input.experienceProfile.athleteId, input.identityFamiliarityProfile.athleteId,
    input.realizationFamiliarityProfile.athleteId, input.habitualExposureProfile.athleteId,
    input.equipmentLoadProfile.athleteId, input.programmingBrief?.athleteId,
    input.specializationProfile?.athleteId].filter((value): value is string => value !== undefined);
  if (athleteIds.some((athleteId) => athleteId !== input.athlete.id)) {
    profileIssues.push("REALIZATION_CONTEXT_ATHLETE_MISMATCH");
  }
  if (input.identityFamiliarityProfile.exerciseId !== handoff.exerciseId ||
      input.realizationFamiliarityProfile.realization.exerciseId !== handoff.exerciseId ||
      input.realizationFamiliarityProfile.realization.doseMode !== knowledge.primaryDoseMode ||
      input.realizationFamiliarityProfile.realization.equipmentImplementId !==
        input.equipmentLoadProfile.implementId ||
      input.realizationFamiliarityProfile.realization.section !== handoff.section ||
      input.realizationFamiliarityProfile.realization.role !== handoff.role) {
    profileIssues.push("REALIZATION_CONTEXT_EXACT_DIMENSION_MISMATCH");
  }
  if (profileIssues.length > 0) {
    return empty(input, "context_realization_conflict", [...new Set(profileIssues)].sort());
  }
  const intensity = resolveAdvancedIntensityTechniqueBoundary(input.intensityTechniqueRequests);
  if (intensity.status === "ADVANCED_INTENSITY_TECHNIQUE_POLICY_REQUIRED") {
    return empty(input, "advanced_intensity_technique_policy_required",
      ["ADVANCED_INTENSITY_TECHNIQUE_POLICY_REQUIRED"], { intensityTechniqueBoundary: intensity });
  }
  const equipment = resolveEquipmentLoadRealization({
    profile: input.equipmentLoadProfile,
    requestedLoad: input.requestedLoad,
    currentExactLoad: input.currentExactLoad,
    loadCeilingInsufficientForPurpose: input.loadCeilingInsufficientForPurpose,
  });
  if (equipment.status === "equipment_realization_incomplete") {
    return empty(input, "equipment_realization_incomplete", equipment.reasonCodes,
      { equipmentLoadRealization: equipment, intensityTechniqueBoundary: intensity });
  }
  if (equipment.candidateRecompositionRequired) {
    return empty(input, "load_ceiling_recomposition_required", equipment.reasonCodes,
      { equipmentLoadRealization: equipment, intensityTechniqueBoundary: intensity });
  }
  const experienceAuthority = resolveExperienceAuthority({
    experience: input.experienceProfile,
    identityFamiliarity: input.identityFamiliarityProfile,
    realizationFamiliarity: input.realizationFamiliarityProfile,
    hasExactCompletedPerformance: input.startingPointEvidence.some((entry) =>
      entry.kind === "exact_current_productive_realization" && entry.completedPerformanceRef !== null),
    hasRepeatedRelatedCompletedPerformance: input.startingPointEvidence.filter((entry) =>
      entry.kind === "related_productive_realization" && entry.completedPerformanceRef !== null).length > 1,
    hasCoachReviewedCurrentRealizationHistory: input.startingPointEvidence.some((entry) =>
      entry.kind === "coach_reviewed_current_load_context"),
    hasAuthenticatedAthleteCurrentRealizationReport: input.startingPointEvidence.some((entry) =>
      entry.kind === "athlete_reported_current_load_context"),
  });
  const startingPoint = resolveProgressionStartingPoint({
    authority: experienceAuthority.authority,
    evidence: input.startingPointEvidence,
    equipment,
    doseMode: knowledge.primaryDoseMode,
    targetRangeDescription: `Use the admitted ${knowledge.primaryDoseMode} target from Prescription Policy V2.`,
    targetEffort: { kind: "self_selected_by_reviewed_standard",
      standardId: "B4:STARTING_POINT_CALIBRATION",
      description: "Select a load that meets the compiled effort and quality target." },
    support: input.realizationFamiliarityProfile.realization.support,
    range: input.realizationFamiliarityProfile.realization.range,
    sideBehavior: input.realizationFamiliarityProfile.realization.sideBehavior,
  });
  const contextRealization = resolveExperienceContextRealization({
    familiarity: input.realizationFamiliarityProfile.state,
    interruption: input.experienceProfile.recentInterruptionState,
    equipment,
    painContext: input.painAwareContext,
    equipmentChanged: input.equipmentChanged,
    supportOrRangeChanged: input.supportOrRangeChanged,
    sideSpecific: input.sideSpecificRealization,
    timeConstrained: input.timeConstrained,
    firstExposure: input.context.firstExposure,
  });
  const returnOrRebuild = input.trainingMode === "return_or_rebuild" && input.returnOrRebuildContext ?
    resolveReturnOrRebuildRealization({
      ...input.returnOrRebuildContext,
      painAwareRegressionRequired: input.painAwareContext.relevant,
    }) : null;
  if (input.trainingMode === "return_or_rebuild" && !returnOrRebuild) {
    return empty(input, "context_realization_conflict", ["RETURN_REBUILD_CONTEXT_REQUIRED"],
      { equipmentLoadRealization: equipment, startingPoint, contextRealization,
        intensityTechniqueBoundary: intensity });
  }
  const habitualComparison = compareProposedWithHabitualExposure({
    profile: input.habitualExposureProfile,
    laneId: input.habitualExposureLaneId,
    proposedDoseMode: knowledge.primaryDoseMode,
    proposedDevelopmentalBlockCount: input.proposedDevelopmentalBlockCount,
    reviewedComparison: input.reviewedHabitualComparison === "unknown" ? undefined :
      input.reviewedHabitualComparison,
  });
  const baseCompilation = compilePrescriptionAssignmentV1_2({
    ...input,
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE,
    trainingMode: input.trainingMode === "return_or_rebuild" ? "develop" : input.trainingMode,
    context: {
      ...input.context,
      returnAfterAbsence: input.trainingMode === "return_or_rebuild" || input.context.returnAfterAbsence,
      reviewedRegression: contextRealization.selectedExistingVariant === "regression" ||
        input.context.reviewedRegression,
      firstExposure: contextRealization.calibrationRequired || input.context.firstExposure,
    },
  });
  if (!baseCompilation.plan) {
    return empty(input, "base_compilation_failed", baseCompilation.decisionTrace.finalReasonCodes,
      { baseCompilation, equipmentLoadRealization: equipment, startingPoint, contextRealization,
        returnOrRebuild, habitualExposureComparison: habitualComparison,
        intensityTechniqueBoundary: intensity });
  }
  const realizedBasePlan = applyStartingLoad(baseCompilation.plan, startingPoint.selectedLoad);
  if (!realizedBasePlan) {
    return empty(input, "base_compilation_failed", ["BASE_PLAN_REALIZATION_FAILED"],
      { baseCompilation, equipmentLoadRealization: equipment, startingPoint, contextRealization,
        returnOrRebuild, habitualExposureComparison: habitualComparison,
        intensityTechniqueBoundary: intensity });
  }
  const sourceExposureEventId = realizedBasePlan.sourceExposureEvent.sourceExposureEventId;
  const rampUp = resolvePrescriptionRampUp({
    exerciseId: handoff.exerciseId,
    sourceExposureEventId,
    familiarity: input.realizationFamiliarityProfile.state,
    loadDelta: input.loadDelta,
    workingLoadKnown: startingPoint.selectedLoad !== null,
    exactRampLoads: input.exactRampLoads,
    mainDevelopmentalWork: handoff.section === "main",
    rampAppropriateForMode: knowledge.primaryDoseMode === "repetition_sets",
    currentReadinessAllowsTraining: baseCompilation.status === "compiled",
    sessionMinutesKnown: input.timeBudgetMinutes !== null,
    reviewedRampBlockCount: input.reviewedRampBlockCount,
    athletePreferredRampBlockCount: input.athletePreferredRampBlockCount,
  });
  const progressionOptions = buildProgressionAxisRealizationOptions({
    exerciseId: handoff.exerciseId,
    doseMode: knowledge.primaryDoseMode,
    equipment,
    blockedAxes: input.blockedProgressionAxes,
  });
  const stableAnchor = input.programmingBrief ? stableAnchorDisposition({
    brief: input.programmingBrief,
    exerciseId: handoff.exerciseId,
    legal: true,
    tolerated: !["exact_current_adverse", "exact_current_limited"]
      .includes(input.realizationFamiliarityProfile.state),
    equipmentAvailable: true,
  }) : "not_requested";
  const plan: ProductionExercisePrescriptionPlanV1_3 = Object.freeze({
    ...realizedBasePlan,
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE,
    equipmentLoadRealization: equipment,
    startingPoint,
    contextRealization,
    returnOrRebuild,
    habitualExposureComparison: habitualComparison,
    rampUp,
    progressionOptions,
    intensityTechniqueBoundary: intensity,
    progressionApplied: false,
    volumeAdded: false,
    exerciseIdentitySelected: false,
  });
  const trace = [
    `EXPERIENCE_AUTHORITY:${experienceAuthority.authority}`,
    `REALIZATION:${contextRealization.variant}`,
    `STARTING_POINT:${startingPoint.status}`,
    `EQUIPMENT:${equipment.status}`,
    `HABITUAL:${habitualComparison.comparison}`,
    `RAMP:${rampUp.status}:${rampUp.blocks.length}`,
    `STABLE_ANCHOR:${stableAnchor}`,
    `SPECIALIZATION_PRIORITY_COUNT:${input.specializationProfile?.priorities.length ?? 0}`,
    "PROGRESSION_APPLIED:false",
    "PRODUCT_RUNTIME:false",
  ];
  let status: PrescriptionCompilerStatusV1_3 = "compiled_context_realization";
  if (returnOrRebuild) status = "return_rebuild_calibration_required";
  else if (startingPoint.status === "exact_prior_load_retained" &&
      contextRealization.variant === "exact_productive_continuity") {
    status = "exact_productive_realization_retained";
  } else if (startingPoint.calibration) status = "self_selected_calibration_required";
  else if (equipment.status === "load_increment_unavailable") status = "load_increment_unavailable_hold";
  else if (habitualComparison.reviewRequired) status = "habitual_exposure_review_required";
  else if (rampUp.status === "time_review_required" || input.timeBudgetMinutes === null) {
    status = "time_budget_review_required";
  }
  return Object.freeze({
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_3_CONTRACT_REFERENCE,
    status,
    realizationStatusTrace: Object.freeze(trace),
    baseCompilation,
    plan,
    equipmentLoadRealization: equipment,
    startingPoint,
    contextRealization,
    returnOrRebuild,
    habitualExposureComparison: habitualComparison,
    rampUp,
    progressionOptions,
    intensityTechniqueBoundary: intensity,
    fallbackApplied: false,
    progressionApplied: false,
    authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME",
    productionActivationStatus: "NOT_ACTIVATED",
  });
}
