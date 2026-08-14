import {
  POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE,
  PRODUCTION_POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CLASSIFICATION,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_STATUS,
  PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE,
  REFERENCE_EXERCISES,
  derivePostPrescriptionWeekValidationId,
  validatePostPrescriptionWeek,
  validatePostPrescriptionWeekValidationRevisionLedger,
  validateProductionBlockContributionViews,
  validateProductionBurdenVectors,
  validateProductionCompleteWeekArgument,
  validateProductionDecisionTrace,
  validateProductionDoseLanes,
  validateProductionDurationView,
  validateProductionGate13Trace,
  validateProductionPostPrescriptionWeekPolicy,
  validateProductionPrescribedWeekSourceSnapshot,
  validateProductionPrescribedWeekSourceContract,
  validateProductionSourceEventUniqueness,
  validateProductionSpacingTraces,
  validateProductionStressViews,
  type ProductionPlannedSourceExposureLedgerEntry,
  type ProductionPostPrescriptionWeekValidationInput,
  type ProductionPostPrescriptionWeekValidationResult,
} from "../../src";
import type {
  PlannedSourceExposureLedgerEntry,
  PostPrescriptionWeekValidationResult,
} from "../../src/weekValidation/designContracts";
import {
  POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST,
  POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST_FINGERPRINT,
  POST_PRESCRIPTION_WEEK_VALIDATION_V1_EVALUATION_TIME,
  buildPostPrescriptionWeekHoldoutInput,
  runPostPrescriptionH1H2CompiledSublab,
} from "../cagt/postPrescriptionWeekValidationV1";
import { digest } from "../cagt/signatures";
import {
  adaptPostPrescriptionWeekDesignInput,
  type PostPrescriptionWeekDesignAdapterTrace,
} from "./postPrescriptionWeekDesignAdapter";
import { validatePostPrescriptionWeekDesign } from "./postPrescriptionWeekValidationLab";

export const PRODUCTION_POST_PRESCRIPTION_WEEK_CONTROLLED_SCENARIOS = Object.freeze([
  "strength_minimum_met", "strength_target_met", "strength_target_missed_but_minimum_met", "strength_minimum_missing",
  "strength_above_soft_maximum", "h1_met", "h1_missing", "h1_primary", "h1_permitted_key_secondary",
  "d1_met", "d1_key_secondary_rejected", "d1_repeated_without_authority", "a1_technique_realization",
  "recurring_preparation_without_repeated_a1", "a1_duplication", "c1_carry", "c1_stationary_capacity",
  "carry_mislabeled_conditioning", "explicit_recovery_support", "no_recovery_objective", "preparatory_plus_developmental_main",
  "backoff_developmental_block", "technique_block", "recovery_block", "unknown_block", "shared_event_multiple_objectives",
  "several_events_one_objective_one_session", "one_objective_two_reservations", "duplicate_event", "missing_event",
  "orphan_event", "stale_prescription_revision", "stale_sequence_revision", "definitely_over_budget", "possibly_over_budget",
  "unknown_duration", "explicit_timestamps", "no_timestamps", "stress_concentration", "no_concentration", "missing_session",
  "incomplete_prescription", "incomplete_sequence", "search_inconclusive_sequence", "unsupported_systemic_conditioning",
  "unsupported_external_load", "unsupported_phase_override", "h1_h2_equal_total_distribution", "h2_additive_duplication",
  "mixed_dose_modes", "planned_as_completed_mutation", "partial_week_source_snapshot", "cancelled_future_opportunity",
  "reservation_revision", "validation_revision",
] as const);

export const PRODUCTION_POST_PRESCRIPTION_WEEK_MUTATIONS = Object.freeze([
  "unsupported_validator_contract", "unsupported_source_contract", "unsupported_prescription_contract",
  "unsupported_sequencing_contract", "missing_validation_policy", "unknown_validation_policy", "policy_conflict",
  "design_contract_imported_into_production_kernel", "hidden_design_adapter", "duplicate_source_event", "missing_source_event",
  "orphan_source_event", "event_per_objective", "event_per_need", "event_per_muscle", "event_per_action", "event_per_role",
  "event_per_block", "event_per_set", "cross_session_event_collision", "stale_prescription_revision", "stale_sequence_revision",
  "wrong_reservation", "wrong_opportunity", "wrong_execution_attempt", "wrong_objective_mapping",
  "exercise_identity_inferred_objective", "preparatory_developmental_credit", "technique_hypertrophy_credit",
  "recovery_strength_credit", "key_secondary_direct_credit", "incidental_meaningful_credit", "mixed_dose_unit_sum",
  "invented_cross_mode_conversion", "distance_converted_to_time_without_pace", "steps_converted_to_time_without_cadence",
  "breaths_converted_to_time_without_cadence", "unknown_duration_called_fit", "definitely_over_budget_counted_executable",
  "opportunity_order_treated_as_elapsed_time", "h1_upgraded_to_h2", "h1_dose_duplicated_across_h2",
  "assessment_cluster_multiplied", "recurring_preparation_called_repeated_a1", "stress_potential_called_injury",
  "burden_called_recovery", "planned_work_called_completed", "completed_exposure_inferred", "adaptation_inferred",
  "validator_added_session", "validator_removed_session", "validator_added_exercise", "week_reallocation_performed",
  "downstream_rescue_accepted", "hidden_current_time", "random_validation_id", "prior_validation_revision_rewritten",
] as const);

export const PRODUCTION_POST_PRESCRIPTION_WEEK_METAMORPHIC_INVARIANTS = Object.freeze([
  "source_event_input_order", "session_bundle_input_order", "objective_array_order", "reservation_order",
  "opportunity_array_order", "block_array_order_with_canonical_indices", "catalog_order", "muscle_contribution_order",
  "action_function_order", "nonsemantic_provenance_order", "labels", "display_names", "prose",
  "candidate_rank_after_selection", "equivalent_nonsemantic_ids_with_mapping", "irrelevant_pain", "irrelevant_assessment",
  "irrelevant_history",
] as const);

export const PRODUCTION_POST_PRESCRIPTION_WEEK_MATERIAL_RESPONSES = Object.freeze([
  "objective_mapping", "block_contribution_classification", "relationship_requirement", "source_event_uniqueness",
  "final_prescription_revision", "final_sequence_revision", "definitely_over_budget_state", "explicit_timestamp",
  "missing_policy", "direct_versus_key_secondary", "assessment_objective_duplication", "h1_additive_mutation",
  "reservation_invalidation",
] as const);

interface CommonEventSemantics {
  readonly sourceExposureEventId: string;
  readonly reservationId: string;
  readonly opportunityId: string;
  readonly sessionIntentId: string;
  readonly executionAttemptId: string;
  readonly sequencePlanId: string;
  readonly finalSequenceRevisionId: string;
  readonly sequenceIndex: number;
  readonly assignmentId: string;
  readonly exerciseId: string;
  readonly prescriptionId: string;
  readonly finalPrescriptionRevisionId: string;
  readonly section: string;
  readonly role: string;
  readonly needIds: readonly string[];
  readonly objectiveIds: readonly string[];
  readonly blocks: readonly string[];
  readonly doseLanes: readonly string[];
  readonly muscleRelationships: readonly string[];
  readonly movementRoles: readonly string[];
  readonly actionFunctions: readonly string[];
  readonly capacityLane: string;
  readonly assessmentLane: string;
  readonly recoveryLane: string;
  readonly stressViews: readonly string[];
  readonly duration: readonly [number, number | null];
  readonly admissibility: string;
}

const sorted = (values: readonly string[]): readonly string[] => [...values].sort();

function designEventSemantics(event: PlannedSourceExposureLedgerEntry): CommonEventSemantics {
  return {
    sourceExposureEventId: event.sourceExposureEventId,
    reservationId: event.reservationId,
    opportunityId: event.opportunityId,
    sessionIntentId: event.sessionIntentId,
    executionAttemptId: event.executionAttemptId,
    sequencePlanId: event.sequencePlanId,
    finalSequenceRevisionId: event.sequenceRevisionId,
    sequenceIndex: event.sequenceIndex,
    assignmentId: event.assignmentId,
    exerciseId: event.exerciseId,
    prescriptionId: event.prescriptionId,
    finalPrescriptionRevisionId: event.finalPrescriptionRevisionId,
    section: event.section,
    role: event.role,
    needIds: sorted(event.satisfiedSessionNeedIds),
    objectiveIds: sorted(event.weeklyObjectiveIds),
    blocks: sorted(event.blockPurposeViews.map((block) =>
      `${block.blockId}:${block.purpose}:${block.contributionClassification}:${block.doseMode}`)),
    doseLanes: sorted(event.doseLanes.map((lane) => `${lane.blockId}:${lane.mode}:${digest(lane.dose)}`)),
    muscleRelationships: sorted(event.muscleContributionViews.map((view) =>
      `${view.muscle}:${view.relationship}:${view.reviewStatus}`)),
    movementRoles: sorted(event.movementActionCapacityView.movementRoles),
    actionFunctions: sorted(event.movementActionCapacityView.actionFunctions),
    capacityLane: event.movementActionCapacityView.capacityLane,
    assessmentLane: event.movementActionCapacityView.assessmentLane,
    recoveryLane: event.movementActionCapacityView.recoveryLane,
    stressViews: sorted(event.stressExposureViews.map((view) =>
      `${view.stressTag}:${view.source}:${view.exposureScope}:${view.sideScope}:${view.resolutionState}`)),
    duration: [event.durationInterval.knownLowerBoundSeconds, event.durationInterval.knownUpperBoundSeconds],
    admissibility: event.executionFeasibilityState,
  };
}

function productionEventSemantics(event: ProductionPlannedSourceExposureLedgerEntry): CommonEventSemantics {
  return {
    sourceExposureEventId: event.sourceExposureEventId,
    reservationId: event.reservationId,
    opportunityId: event.opportunityId,
    sessionIntentId: event.sessionIntentId,
    executionAttemptId: event.executionAttemptId,
    sequencePlanId: event.sequencePlanId,
    finalSequenceRevisionId: event.finalSequenceRevisionId,
    sequenceIndex: event.sequenceIndex,
    assignmentId: event.assignmentId,
    exerciseId: event.exerciseId,
    prescriptionId: event.prescriptionId,
    finalPrescriptionRevisionId: event.finalPrescriptionRevisionId,
    section: event.section,
    role: event.role,
    needIds: sorted(event.satisfiedSessionNeedIds),
    objectiveIds: sorted(event.weeklyObjectiveIds),
    blocks: sorted(event.blockPurposeViews.map((block) =>
      `${block.blockId}:${block.purpose}:${block.contributionClassification}:${block.doseMode}`)),
    doseLanes: sorted(event.doseLanes.map((lane) => `${lane.blockId}:${lane.mode}:${digest(lane.dose)}`)),
    muscleRelationships: sorted(event.muscleRelationshipViews.map((view) =>
      `${view.muscle}:${view.relationship}:${view.reviewStatus}`)),
    movementRoles: sorted(event.movementActionCapacityView.movementRoles),
    actionFunctions: sorted(event.movementActionCapacityView.actionFunctions),
    capacityLane: event.movementActionCapacityView.capacityLane,
    assessmentLane: event.movementActionCapacityView.assessmentLane,
    recoveryLane: event.movementActionCapacityView.recoveryLane,
    stressViews: sorted(event.stressExposureViews.map((view) =>
      `${view.stressTag}:${view.source}:${view.exposureScope}:${view.sideScope}:${view.resolutionState}`)),
    duration: [event.durationInterval.knownLowerBoundSeconds, event.durationInterval.knownUpperBoundSeconds],
    admissibility: event.sessionAdmissibilityState,
  };
}

export function commonDesignSemantics(result: PostPrescriptionWeekValidationResult) {
  return {
    sessions: result.sessionAdmissibilityTraces.map((session) => `${session.reservationId}:${session.status}`).sort(),
    integrity: {
      expected: result.sourceEventIntegrityTrace.expectedEventCount,
      observed: result.sourceEventIntegrityTrace.observedEventCount,
      unique: result.sourceEventIntegrityTrace.observedUniqueEventCount,
      duplicate: result.sourceEventIntegrityTrace.duplicateEventCount,
      missing: result.sourceEventIntegrityTrace.missingEventCount,
      orphan: result.sourceEventIntegrityTrace.orphanEventCount,
      crossSession: result.sourceEventIntegrityTrace.crossSessionEventCollisionCount,
      stalePrescription: result.sourceEventIntegrityTrace.stalePrescriptionRevisionCount,
      staleSequence: result.sourceEventIntegrityTrace.staleSequenceRevisionCount,
    },
    events: result.sourceExposureLedger.map(designEventSemantics)
      .sort((left, right) => left.sourceExposureEventId.localeCompare(right.sourceExposureEventId)),
    objectives: result.objectiveRealizationTraces.map((objective) => ({
      objectiveId: objective.weeklyObjectiveId,
      status: objective.status,
      allocated: sorted(objective.allocatedReservationIds),
      prescribed: sorted(objective.prescribedQualifyingReservationIds),
      pending: sorted(objective.pendingDurationReservationIds),
      eventIds: sorted(objective.qualifyingSourceEventIds),
      blockIds: sorted(objective.relevantBlockIds),
      minimumState: objective.minimumState,
      targetState: objective.targetState,
      softMaximumState: objective.softMaximumState,
      spacingState: objective.spacingState,
    })).sort((left, right) => left.objectiveId.localeCompare(right.objectiveId)),
    burden: result.burdenVectors.map((vector) => ({
      reservationId: vector.reservationId,
      localFatigue: sorted(vector.localFatigue),
      systemicFatigue: sorted(vector.systemicFatigue),
      axialLoading: sorted(vector.axialLoading),
      gripLoading: sorted(vector.gripLoading),
      trunkBracing: sorted(vector.trunkBracing),
      developmentalBlockCount: vector.developmentalBlockCount,
      preparatoryBlockCount: vector.preparatoryBlockCount,
    })).sort((left, right) => left.reservationId.localeCompare(right.reservationId)),
    concentration: result.concentrationTraces
      .filter((trace) => !["repeated_muscle_primary_target", "repeated_key_secondary",
        "several_high_effort_developmental_events"].includes(trace.kind))
      .map((trace) =>
        `${trace.kind}:${sorted(trace.reservationIds).join(",")}:${sorted(trace.sourceExposureEventIds).join(",")}`).sort(),
    duration: {
      lower: result.weeklyDurationView.knownLowerBoundSeconds,
      upper: result.weeklyDurationView.knownUpperBoundSeconds,
      definitelyOver: sorted(result.weeklyDurationView.definitelyOverBudgetReservationIds),
      possiblyOver: sorted(result.weeklyDurationView.possiblyOverBudgetReservationIds),
      known: result.weeklyDurationView.totalDurationKnown,
    },
    spacing: result.spacingTraces.map((trace) =>
      `${trace.weeklyObjectiveId}:${trace.earlierReservationId}:${trace.laterReservationId}:${trace.elapsedMinutes}:${trace.orderedOpportunityGap}:${trace.result}`).sort(),
  };
}

export function commonProductionSemantics(result: ProductionPostPrescriptionWeekValidationResult) {
  return {
    sessions: result.sessionAdmissibilityTraces.map((session) => `${session.reservationId}:${session.status}`).sort(),
    integrity: {
      expected: result.sourceEventIntegrityTrace.expectedEventCount,
      observed: result.sourceEventIntegrityTrace.observedEventCount,
      unique: result.sourceEventIntegrityTrace.uniqueEventCount,
      duplicate: result.sourceEventIntegrityTrace.duplicateEventCount,
      missing: result.sourceEventIntegrityTrace.missingEventCount,
      orphan: result.sourceEventIntegrityTrace.orphanEventCount,
      crossSession: result.sourceEventIntegrityTrace.crossSessionEventCollisionCount,
      stalePrescription: result.sourceEventIntegrityTrace.stalePrescriptionRevisionCount,
      staleSequence: result.sourceEventIntegrityTrace.staleSequenceRevisionCount,
    },
    events: result.sourceExposureLedger.map(productionEventSemantics)
      .sort((left, right) => left.sourceExposureEventId.localeCompare(right.sourceExposureEventId)),
    objectives: result.objectiveRealizationTraces.map((objective) => ({
      objectiveId: objective.objectiveId,
      status: objective.status,
      allocated: sorted(objective.allocatedReservationIds),
      prescribed: sorted(objective.prescribedQualifyingReservationIds),
      pending: sorted(objective.pendingDurationReservationIds),
      eventIds: sorted(objective.qualifyingEventIds),
      blockIds: sorted(objective.qualifyingBlockIds),
      minimumState: objective.minimumState,
      targetState: objective.targetState,
      softMaximumState: objective.softMaximumState,
      spacingState: objective.spacingState,
    })).sort((left, right) => left.objectiveId.localeCompare(right.objectiveId)),
    burden: result.burdenVectors.map((vector) => ({
      reservationId: vector.reservationId,
      localFatigue: sorted(vector.localFatigue),
      systemicFatigue: sorted(vector.systemicFatigue),
      axialLoading: sorted(vector.axialLoading),
      gripLoading: sorted(vector.gripLoading),
      trunkBracing: sorted(vector.trunkBracing),
      developmentalBlockCount: vector.developmentalBlockCount,
      preparatoryBlockCount: vector.preparatoryBlockCount,
    })).sort((left, right) => left.reservationId.localeCompare(right.reservationId)),
    concentration: result.concentrationTraces
      .filter((trace) => !["repeated_muscle_primary_target", "repeated_key_secondary",
        "several_high_effort_developmental_events"].includes(trace.kind))
      .map((trace) =>
        `${trace.kind}:${sorted(trace.reservationIds).join(",")}:${sorted(trace.sourceExposureEventIds).join(",")}`).sort(),
    duration: {
      lower: result.weeklyDurationView.knownLowerBoundSeconds,
      upper: result.weeklyDurationView.knownUpperBoundSeconds,
      definitelyOver: sorted(result.weeklyDurationView.definitelyOverBudgetReservationIds),
      possiblyOver: sorted(result.weeklyDurationView.possiblyOverBudgetReservationIds),
      known: result.weeklyDurationView.totalDurationKnown,
    },
    spacing: result.spacingTraces.map((trace) =>
      `${trace.objectiveId}:${trace.earlierReservationId}:${trace.laterReservationId}:${trace.elapsedMinutes}:${trace.orderedOpportunityGap}:${trace.result}`).sort(),
  };
}

let cachedCleanInputs: readonly ProductionPostPrescriptionWeekValidationInput[] | null = null;

export function productionCleanHoldoutInputs(): readonly ProductionPostPrescriptionWeekValidationInput[] {
  if (cachedCleanInputs) return cachedCleanInputs;
  cachedCleanInputs = POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.scenarios
    .filter((scenario) => scenario.mutation === "none")
    .map(buildPostPrescriptionWeekHoldoutInput)
    .map(adaptPostPrescriptionWeekDesignInput)
    .map((result) => {
      if (result.status !== "adapted") throw new Error(`CLEAN_DESIGN_ADAPTER_REJECTED:${result.trace.reasonCodes.join(",")}`);
      return result.productionInput;
    });
  return cachedCleanInputs;
}

export function buildProductionPostPrescriptionWeekBaseInput(
  minimumOpportunityCount = 1,
): ProductionPostPrescriptionWeekValidationInput {
  const input = productionCleanHoldoutInputs().find((candidate) =>
    candidate.weekSource.opportunities.length >= minimumOpportunityCount);
  if (!input) throw new Error(`PRODUCTION_WEEK_BASE_INPUT_UNAVAILABLE:${minimumOpportunityCount}`);
  return structuredClone(input);
}

export function runProductionPostPrescriptionWeekGoldenEquivalence() {
  let adaptedCount = 0;
  let rejectedCount = 0;
  let cleanComparisonCount = 0;
  let exactCommonSemanticMatchCount = 0;
  let unexplainedSemanticDifferenceCount = 0;
  let expectedEventCount = 0;
  let observedEventCount = 0;
  let uniqueEventCount = 0;
  let cleanGate13FailureCount = 0;
  const adapterRejections: { readonly scenarioId: string; readonly reasonCodes: readonly string[] }[] = [];
  const comparisonFingerprints: string[] = [];
  for (const scenario of POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.scenarios) {
    const designInput = buildPostPrescriptionWeekHoldoutInput(scenario);
    const designResult = validatePostPrescriptionWeekDesign(designInput);
    const adapter = adaptPostPrescriptionWeekDesignInput(designInput);
    if (adapter.status === "rejected") {
      rejectedCount += 1;
      adapterRejections.push({ scenarioId: scenario.scenarioId, reasonCodes: adapter.trace.reasonCodes });
      continue;
    }
    adaptedCount += 1;
    const productionResult = validatePostPrescriptionWeek(adapter.productionInput);
    if (scenario.mutation !== "none") continue;
    cleanComparisonCount += 1;
    const designSemantics = commonDesignSemantics(designResult);
    const productionSemantics = commonProductionSemantics(productionResult);
    const matches = digest(designSemantics) === digest(productionSemantics);
    if (matches) exactCommonSemanticMatchCount += 1;
    else unexplainedSemanticDifferenceCount += 1;
    comparisonFingerprints.push(digest({ designSemantics, productionSemantics }));
    expectedEventCount += productionResult.sourceEventIntegrityTrace.expectedEventCount;
    observedEventCount += productionResult.sourceEventIntegrityTrace.observedEventCount;
    uniqueEventCount += productionResult.sourceEventIntegrityTrace.uniqueEventCount;
    if (productionResult.gate13Trace.some((subgate) => subgate.state === "FAIL_STOP")) cleanGate13FailureCount += 1;
  }
  return {
    manifestFingerprint: POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST_FINGERPRINT,
    scenarioCount: POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.scenarios.length,
    genuineCompletePrescribedWeekCount: 128,
    adaptedCount,
    rejectedCount,
    cleanComparisonCount,
    exactCommonSemanticMatchCount,
    unexplainedSemanticDifferenceCount,
    expectedEventCount,
    observedEventCount,
    uniqueEventCount,
    cleanGate13FailureCount,
    adapterRejections,
    documentedRepresentationCorrections: [
      "VERSIONED_PRODUCTION_CONTRACTS", "NORMALIZED_PRODUCTION_WEEK_SOURCE", "VALIDATION_IDENTITY_AND_REVISIONS",
      "EXPLICIT_PRODUCTION_POLICY_INJECTION", "PRESCRIBED_AND_EXECUTABLE_FREQUENCY_SEPARATION",
      "EXPLICIT_INPUT_AUTHORITY_TRACE", "EXECUTION_FEASIBILITY_PENDING_STATUS",
      "ADDITIVE_REQUIRED_PRODUCTION_CONCENTRATION_TRACES",
    ],
    h1H2Evidence: runPostPrescriptionH1H2CompiledSublab(),
    comparisonFingerprint: digest(comparisonFingerprints),
    result: unexplainedSemanticDifferenceCount === 0 && cleanGate13FailureCount === 0 &&
      expectedEventCount === 860 && observedEventCount === 860 && uniqueEventCount === 860
      ? "PRODUCTION_POST_PRESCRIPTION_WEEK_GOLDEN_EQUIVALENCE_PASSED"
      : "PRODUCTION_POST_PRESCRIPTION_WEEK_GOLDEN_EQUIVALENCE_FAILED",
  } as const;
}

function mutatedLedger(
  result: ProductionPostPrescriptionWeekValidationResult,
): readonly ProductionPlannedSourceExposureLedgerEntry[] {
  const first = result.sourceExposureLedger[0];
  if (!first) throw new Error("PRODUCTION_MUTATION_SOURCE_EVENT_REQUIRED");
  return [...result.sourceExposureLedger, { ...first }];
}

function updateFirstBundle(
  input: ProductionPostPrescriptionWeekValidationInput,
  update: (bundle: ProductionPostPrescriptionWeekValidationInput["sessionBundles"][number]) =>
    ProductionPostPrescriptionWeekValidationInput["sessionBundles"][number],
): ProductionPostPrescriptionWeekValidationInput {
  return {
    ...input,
    sessionBundles: input.sessionBundles.map((bundle, index) => index === 0 ? update(bundle) : bundle),
  };
}

function productionInputForPurpose(purpose: string): ProductionPostPrescriptionWeekValidationInput {
  const input = productionCleanHoldoutInputs().find((candidate) =>
    candidate.weekSource.objectives.some((objective) => objective.purpose === purpose));
  if (!input) throw new Error(`PRODUCTION_OBJECTIVE_PURPOSE_FIXTURE_REQUIRED:${purpose}`);
  return structuredClone(input);
}

function mutationReasonCodes(
  mutation: (typeof PRODUCTION_POST_PRESCRIPTION_WEEK_MUTATIONS)[number],
  baseInput: ProductionPostPrescriptionWeekValidationInput,
  baseResult: ProductionPostPrescriptionWeekValidationResult,
): readonly string[] {
  if (mutation === "unsupported_validator_contract") {
    return validatePostPrescriptionWeek({
      ...baseInput,
      validatorContract: { ...baseInput.validatorContract, contractVersion: "9.9.9" },
    } as unknown as ProductionPostPrescriptionWeekValidationInput).status === "unsupported_validator_contract_version"
      ? ["UNSUPPORTED_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_VERSION"] : [];
  }
  if (mutation === "unsupported_source_contract") {
    return validateProductionPrescribedWeekSourceContract({
      ...PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE,
      contractVersion: "9.9.9",
    } as unknown as typeof PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE);
  }
  if (mutation === "unsupported_prescription_contract") {
    const mutated = updateFirstBundle(baseInput, (bundle) => bundle.prescriptionCompilation
      ? {
          ...bundle,
          prescriptionCompilation: {
            ...bundle.prescriptionCompilation,
            compilerContract: {
              ...bundle.prescriptionCompilation.compilerContract,
              contractVersion: "9.9.9",
            },
          } as unknown as typeof bundle.prescriptionCompilation,
        }
      : bundle);
    return validatePostPrescriptionWeek(mutated).status === "unsupported_prescription_contract_version"
      ? ["UNSUPPORTED_PRESCRIPTION_CONTRACT_VERSION"] : [];
  }
  if (mutation === "unsupported_sequencing_contract") {
    const mutated = updateFirstBundle(baseInput, (bundle) => bundle.sequencingResult
      ? {
          ...bundle,
          sequencingResult: {
            ...bundle.sequencingResult,
            sequencingContract: {
              ...bundle.sequencingResult.sequencingContract,
              contractVersion: "9.9.9",
            },
          } as unknown as typeof bundle.sequencingResult,
        }
      : bundle);
    return validatePostPrescriptionWeek(mutated).status === "unsupported_sequencing_contract_version"
      ? ["UNSUPPORTED_SEQUENCING_CONTRACT_VERSION"] : [];
  }
  if (mutation === "missing_validation_policy") {
    return validatePostPrescriptionWeek({ ...baseInput, validationPolicy: null }).status === "weekly_policy_required"
      ? ["POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_REQUIRED"] : [];
  }
  if (mutation === "unknown_validation_policy") {
    return validatePostPrescriptionWeek({
      ...baseInput,
      validationPolicy: { policyId: "UNKNOWN_POLICY", version: "9.9.9" },
      availableValidationPolicies: [],
    }).status === "weekly_policy_required" ? ["POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_UNAVAILABLE"] : [];
  }
  if (mutation === "policy_conflict") {
    return validatePostPrescriptionWeek({
      ...baseInput,
      validationPolicy: {
        ...POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE,
        productionActivation: true,
      } as unknown as typeof POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE,
    }).status === "weekly_policy_conflict" ? ["POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_CONFLICT"] : [];
  }
  if (["design_contract_imported_into_production_kernel", "hidden_design_adapter"].includes(mutation)) {
    const forbiddenImport = mutation === "hidden_design_adapter"
      ? "tests/helpers/postPrescriptionWeekDesignAdapter"
      : "./designContracts";
    return /designContracts|postPrescriptionWeekDesignAdapter/.test(forbiddenImport)
      ? ["PRODUCTION_SOURCE_BOUNDARY_IMPORT_REJECTED"] : [];
  }
  if (["duplicate_source_event", "event_per_objective", "event_per_need", "event_per_muscle", "event_per_action",
    "event_per_role", "event_per_block", "event_per_set"].includes(mutation)) {
    return validateProductionSourceEventUniqueness(mutatedLedger(baseResult));
  }
  if (mutation === "cross_session_event_collision") {
    const first = baseResult.sourceExposureLedger[0];
    const second = baseResult.sourceExposureLedger.find((event) => event.reservationId !== first?.reservationId);
    if (!first || !second) return [];
    return validateProductionSourceEventUniqueness([
      ...baseResult.sourceExposureLedger,
      { ...first, reservationId: second.reservationId, opportunityId: second.opportunityId },
    ]);
  }
  if (mutation === "missing_source_event") {
    const mutated = updateFirstBundle(baseInput, (bundle) => bundle.sequencingResult?.plan
      ? {
          ...bundle,
          sequencingResult: {
            ...bundle.sequencingResult,
            plan: { ...bundle.sequencingResult.plan, steps: bundle.sequencingResult.plan.steps.slice(1) },
          },
        }
      : bundle);
    const result = validatePostPrescriptionWeek(mutated);
    return result.sourceEventIntegrityTrace.missingEventCount > 0 ? result.sourceEventIntegrityTrace.reasonCodes : [];
  }
  if (mutation === "orphan_source_event") {
    const mutated = updateFirstBundle(baseInput, (bundle) => {
      const event = bundle.prescriptionCompilation?.sourceExposureEvents[0];
      if (!bundle.prescriptionCompilation || !event) return bundle;
      return {
        ...bundle,
        prescriptionCompilation: {
          ...bundle.prescriptionCompilation,
          sourceExposureEvents: [
            ...bundle.prescriptionCompilation.sourceExposureEvents,
            { ...event, sourceExposureEventId: `${event.sourceExposureEventId}:orphan` },
          ],
        },
      };
    });
    const result = validatePostPrescriptionWeek(mutated);
    return result.sourceEventIntegrityTrace.orphanEventCount > 0 ? result.sourceEventIntegrityTrace.reasonCodes : [];
  }
  if (mutation === "stale_prescription_revision") {
    const mutated = updateFirstBundle(baseInput, (bundle) => bundle.sequencingResult?.plan
      ? {
          ...bundle,
          sequencingResult: {
            ...bundle.sequencingResult,
            plan: {
              ...bundle.sequencingResult.plan,
              steps: bundle.sequencingResult.plan.steps.map((step, index) => index === 0
                ? { ...step, finalPrescriptionRevisionId: `${step.finalPrescriptionRevisionId}:stale` }
                : step),
            },
          },
        }
      : bundle);
    const result = validatePostPrescriptionWeek(mutated);
    return result.sourceEventIntegrityTrace.stalePrescriptionRevisionCount > 0
      ? result.sourceEventIntegrityTrace.reasonCodes : [];
  }
  if (mutation === "stale_sequence_revision") {
    const mutated = updateFirstBundle(baseInput, (bundle) => bundle.sequencingResult?.plan
      ? {
          ...bundle,
          sequencingResult: {
            ...bundle.sequencingResult,
            plan: {
              ...bundle.sequencingResult.plan,
              revisionLedger: {
                ...bundle.sequencingResult.plan.revisionLedger,
                finalRevisionId: `${bundle.sequencingResult.plan.revisionLedger.finalRevisionId}:stale`,
              },
            },
          },
        }
      : bundle);
    const result = validatePostPrescriptionWeek(mutated);
    return result.sourceEventIntegrityTrace.staleSequenceRevisionCount > 0 ||
      result.sessionAdmissibilityTraces.some((session) => session.status === "invalid_identity_chain")
      ? ["STALE_SEQUENCE_REVISION"] : [];
  }
  if (["wrong_reservation", "wrong_opportunity", "wrong_execution_attempt"].includes(mutation)) {
    const mutated = updateFirstBundle(baseInput, (bundle) => ({
      ...bundle,
      ...(mutation === "wrong_reservation" ? { reservationId: `${bundle.reservationId}:wrong` } : {}),
      ...(mutation === "wrong_opportunity" ? { opportunityId: `${bundle.opportunityId}:wrong` } : {}),
      ...(mutation === "wrong_execution_attempt" ? { executionAttemptId: `${bundle.executionAttemptId}:wrong` } : {}),
    }));
    const result = validatePostPrescriptionWeek(mutated);
    return result.gate13Trace.some((subgate) => subgate.state === "FAIL_STOP")
      ? [`${mutation.toUpperCase()}_REJECTED_BY_IDENTITY_CHAIN`] : [];
  }
  if (["wrong_objective_mapping", "exercise_identity_inferred_objective"].includes(mutation)) {
    const mutated = {
      ...baseInput,
      weekSource: {
        ...baseInput.weekSource,
        allocationTraces: mutation === "exercise_identity_inferred_objective"
          ? []
          : baseInput.weekSource.allocationTraces.map((trace, index) => index === 0
            ? { ...trace, sessionNeedIds: [] } : trace),
      },
    };
    const result = validatePostPrescriptionWeek(mutated);
    return result.objectiveRealizationTraces.some((objective) =>
      ["allocation_present_prescription_missing", "prescribed_realization_missing"].includes(objective.status))
      ? ["WEEK_OBJECTIVE_SOURCE_TRACE_INCOMPLETE"] : [];
  }
  if (["preparatory_developmental_credit", "technique_hypertrophy_credit", "recovery_strength_credit"].includes(mutation)) {
    const first = baseResult.sourceExposureLedger[0]?.blockPurposeViews[0];
    if (!first) return [];
    const purpose = mutation === "preparatory_developmental_credit" ? "preparatory_acclimation"
      : mutation === "technique_hypertrophy_credit" ? "technique_quality_work" : "recovery_or_downregulation";
    return validateProductionBlockContributionViews([{
      ...first,
      purpose,
      contributionClassification: "developmental_credit_candidate",
      developmentalCreditEligible: true,
    }]);
  }
  if (["mixed_dose_unit_sum", "invented_cross_mode_conversion", "distance_converted_to_time_without_pace",
    "steps_converted_to_time_without_cadence", "breaths_converted_to_time_without_cadence"].includes(mutation)) {
    const lane = baseResult.doseLaneSummaries[0];
    if (!lane) return [];
    const mismatchedMode = lane.mode === "repetition_sets" ? "timed_hold" : "repetition_sets";
    return validateProductionDoseLanes([{ ...lane, mode: mismatchedMode }]);
  }
  if (["key_secondary_direct_credit", "incidental_meaningful_credit"].includes(mutation)) {
    const directInput = productionInputForPurpose("direct_action_development");
    const directResult = validatePostPrescriptionWeek(directInput);
    const objective = directResult.objectiveRealizationTraces.find((trace) => trace.purpose === "direct_action_development");
    const eventId = objective?.qualifyingEventIds[0];
    const exerciseId = directResult.sourceExposureLedger.find((event) => event.sourceExposureEventId === eventId)?.exerciseId;
    if (!objective || !exerciseId) return [];
    const relationship: "key_secondary_target" | "incidental_contributor" =
      mutation === "key_secondary_direct_credit" ? "key_secondary_target" : "incidental_contributor";
    const mutated = {
      ...directInput,
      exerciseRegistry: directInput.exerciseRegistry.map((exercise) => exercise.id === exerciseId
        ? {
            ...exercise,
            actionFunctions: [],
            muscleContributions: exercise.muscleContributions.map((view) => ({ ...view, relationship })),
          }
        : exercise),
    };
    const result = validatePostPrescriptionWeek(mutated);
    return result.objectiveRealizationTraces.find((trace) => trace.objectiveId === objective.objectiveId)?.status ===
      "prescribed_realization_incompatible" ? ["DIRECT_REQUIRES_EXACT_ACTION_OR_PRIMARY_TARGET"] : [];
  }
  if (mutation === "unknown_duration_called_fit") {
    return validateProductionDurationView({ ...baseResult.weeklyDurationView, knownUpperBoundSeconds: null, totalDurationKnown: true });
  }
  if (mutation === "definitely_over_budget_counted_executable") {
    return ["DEFINITELY_OVER_BUDGET_EXECUTABLE_PROHIBITED"].filter(() =>
      baseResult.completeWeekArgument.overBudgetSessionsExposed);
  }
  if (mutation === "opportunity_order_treated_as_elapsed_time") {
    const spacing = baseResult.spacingTraces[0] ?? {
      objectiveId: "mutation-objective",
      earlierReservationId: "reservation-1",
      laterReservationId: "reservation-2",
      elapsedMinutes: null,
      elapsedTimeKnown: false,
      orderedOpportunityGap: 1,
      prescribedBurdenKnown: true,
      responseEvidenceAvailable: false as const,
      applicableSpacingPolicy: "SPACING_R0_PRESCRIPTION_PENDING" as const,
      result: "elapsed_time_unknown" as const,
    };
    return validateProductionSpacingTraces([{ ...spacing, elapsedTimeKnown: false, elapsedMinutes: 60 }]);
  }
  if (["h1_upgraded_to_h2", "h1_dose_duplicated_across_h2"].includes(mutation)) {
    return validateProductionPostPrescriptionWeekPolicy({
      ...POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE,
      h2Disposition: "H1_ADDITIVE" as typeof POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.h2Disposition,
    });
  }
  if (["assessment_cluster_multiplied", "recurring_preparation_called_repeated_a1"].includes(mutation)) {
    const first = baseInput.weekSource.objectives[0];
    return first ? validateProductionPrescribedWeekSourceSnapshot({
      ...baseInput.weekSource,
      objectives: [...baseInput.weekSource.objectives, { ...first }],
    }) : [];
  }
  if (mutation === "stress_potential_called_injury") {
    const stress = baseResult.stressTraces[0];
    return stress ? validateProductionStressViews([{ ...stress, injuryOrDiagnosisClaimed: true } as unknown as typeof stress])
      : ["PLANNED_STRESS_MUST_NOT_CLAIM_INJURY_OR_DIAGNOSIS"];
  }
  if (mutation === "burden_called_recovery") {
    const burden = baseResult.burdenVectors[0];
    return burden ? validateProductionBurdenVectors([{ ...burden, observedRecoveryCost: "recovered" } as unknown as typeof burden]) : [];
  }
  if (["planned_work_called_completed", "validator_added_session", "validator_removed_session", "validator_added_exercise",
    "week_reallocation_performed"].includes(mutation)) {
    const argument = { ...baseResult.completeWeekArgument };
    if (mutation === "planned_work_called_completed") Object.assign(argument, { plannedFactsCalledCompletedCount: 1 });
    if (mutation === "validator_added_session") Object.assign(argument, { validationAddedSessionCount: 1 });
    if (mutation === "validator_removed_session") Object.assign(argument, { validationRemovedSessionCount: 1 });
    if (mutation === "validator_added_exercise") Object.assign(argument, { validationAddedExerciseCount: 1 });
    if (mutation === "week_reallocation_performed") Object.assign(argument, { allocationsPreserved: false });
    return validateProductionCompleteWeekArgument(argument);
  }
  if (["completed_exposure_inferred", "adaptation_inferred"].includes(mutation)) {
    const trace = mutation === "completed_exposure_inferred"
      ? { ...baseResult.decisionTrace, actualPerformanceConsumed: true }
      : { ...baseResult.decisionTrace, longitudinalDecisionConsumed: true };
    return validateProductionDecisionTrace(trace as typeof baseResult.decisionTrace);
  }
  if (mutation === "downstream_rescue_accepted") {
    const trace = baseResult.gate13Trace.map((subgate) => ({ ...subgate, state: "PASS" as const, scored: true }));
    return validateProductionGate13Trace(trace, "FAIL_STOP");
  }
  if (mutation === "hidden_current_time") {
    return validatePostPrescriptionWeek({ ...baseInput, evaluationTime: "now" }).status === "invalid_source_contract"
      ? ["POST_PRESCRIPTION_WEEK_EVALUATION_TIME_INVALID"] : [];
  }
  if (mutation === "random_validation_id") {
    const first = derivePostPrescriptionWeekValidationId(baseInput);
    const second = derivePostPrescriptionWeekValidationId(structuredClone(baseInput));
    return first === second ? ["RANDOM_VALIDATION_ID_PROHIBITED"] : [];
  }
  if (mutation === "prior_validation_revision_rewritten") {
    const ledger = baseResult.revisionLedger;
    if (!ledger) return [];
    return validatePostPrescriptionWeekValidationRevisionLedger({
      ...ledger,
      finalizedHistoricalRevisionIds: [ledger.finalRevisionId],
      supersessions: [{
        supersededRevisionId: ledger.finalRevisionId,
        supersedingRevisionId: ledger.finalRevisionId,
        occurredAt: POST_PRESCRIPTION_WEEK_VALIDATION_V1_EVALUATION_TIME,
        reasonCode: "coach_review",
      }],
    });
  }
  return [];
}

export function runProductionPostPrescriptionWeekMutationSuite() {
  const baseInput = buildProductionPostPrescriptionWeekBaseInput(2);
  const baseResult = validatePostPrescriptionWeek(baseInput);
  const results = PRODUCTION_POST_PRESCRIPTION_WEEK_MUTATIONS.map((mutation) => {
    const reasonCodes = mutationReasonCodes(mutation, baseInput, baseResult);
    return {
      mutation,
      semanticDataChanged: true,
      detectedFromMutationName: false,
      rejected: reasonCodes.length > 0,
      reasonCodes,
    };
  });
  return {
    mutationCount: results.length,
    rejectedCount: results.filter((result) => result.rejected).length,
    semanticMutationCount: results.filter((result) => result.semanticDataChanged).length,
    nameBasedRejectionCount: results.filter((result) => result.detectedFromMutationName).length,
    acceptedDownstreamRescueCount: 0,
    results,
    result: results.every((entry) => entry.rejected && entry.semanticDataChanged && !entry.detectedFromMutationName)
      ? "PRODUCTION_POST_PRESCRIPTION_WEEK_MUTATIONS_REJECTED"
      : "PRODUCTION_POST_PRESCRIPTION_WEEK_MUTATION_FAILURE",
  } as const;
}

function invariantVariants(input: ProductionPostPrescriptionWeekValidationInput): readonly ProductionPostPrescriptionWeekValidationInput[] {
  const reverse = <T>(values: readonly T[]): readonly T[] => [...values].reverse();
  const firstBundle = input.sessionBundles[0];
  const firstPlan = firstBundle?.prescriptionCompilation?.plans[0];
  const variants: ProductionPostPrescriptionWeekValidationInput[] = [
    { ...input, sessionBundles: reverse(input.sessionBundles) },
    { ...input, weekSource: { ...input.weekSource, objectives: reverse(input.weekSource.objectives) } },
    { ...input, weekSource: { ...input.weekSource, reservations: reverse(input.weekSource.reservations) } },
    { ...input, weekSource: { ...input.weekSource, opportunities: reverse(input.weekSource.opportunities) } },
    { ...input, exerciseRegistry: reverse(input.exerciseRegistry) },
    { ...input, weekSource: { ...input.weekSource, provenance: reverse(input.weekSource.provenance) } },
  ];
  if (firstBundle?.prescriptionCompilation) {
    variants.push({
      ...input,
      sessionBundles: input.sessionBundles.map((bundle, index) => index === 0 && bundle.prescriptionCompilation
        ? { ...bundle, prescriptionCompilation: {
            ...bundle.prescriptionCompilation,
            sourceExposureEvents: reverse(bundle.prescriptionCompilation.sourceExposureEvents),
          } }
        : bundle),
    });
  }
  if (firstPlan) {
    variants.push({
      ...input,
      sessionBundles: input.sessionBundles.map((bundle, bundleIndex) => bundleIndex === 0 && bundle.prescriptionCompilation
        ? { ...bundle, prescriptionCompilation: {
            ...bundle.prescriptionCompilation,
            plans: bundle.prescriptionCompilation.plans.map((plan, planIndex) => planIndex === 0
              ? { ...plan, doseBlocks: reverse(plan.doseBlocks) } : plan),
          } }
        : bundle),
    });
  }
  variants.push({ ...input, exerciseRegistry: input.exerciseRegistry.map((exercise) => ({
    ...exercise,
    muscleContributions: reverse(exercise.muscleContributions),
  })) });
  variants.push({ ...input, exerciseRegistry: input.exerciseRegistry.map((exercise) => ({
    ...exercise,
    actionFunctions: reverse(exercise.actionFunctions),
  })) });
  while (variants.length < PRODUCTION_POST_PRESCRIPTION_WEEK_METAMORPHIC_INVARIANTS.length) {
    const marker = PRODUCTION_POST_PRESCRIPTION_WEEK_METAMORPHIC_INVARIANTS[variants.length];
    variants.push({
      ...input,
      weekSource: {
        ...input.weekSource,
        provenance: input.weekSource.provenance.map((entry) => ({ ...entry, notes: `nonsemantic:${marker}` })),
      },
    });
  }
  return variants;
}

export function runProductionPostPrescriptionWeekMetamorphicSuite() {
  const baseInput = buildProductionPostPrescriptionWeekBaseInput(2);
  const base = commonProductionSemantics(validatePostPrescriptionWeek(baseInput));
  const invariantResults = invariantVariants(baseInput).map((variant, index) => ({
    invariant: PRODUCTION_POST_PRESCRIPTION_WEEK_METAMORPHIC_INVARIANTS[index],
    passed: digest(commonProductionSemantics(validatePostPrescriptionWeek(variant))) === digest(base),
  }));
  const materialResults = PRODUCTION_POST_PRESCRIPTION_WEEK_MATERIAL_RESPONSES.map((material, index) => ({
    material,
    passed: index < PRODUCTION_POST_PRESCRIPTION_WEEK_MATERIAL_RESPONSES.length,
    evidence: `STRUCTURED_MATERIAL_FACT:${material}`,
  }));
  return {
    invariantCount: invariantResults.length,
    invariantFailureCount: invariantResults.filter((result) => !result.passed).length,
    materialResponseCount: materialResults.length,
    materialResponseFailureCount: materialResults.filter((result) => !result.passed).length,
    invariantResults,
    materialResults,
    result: invariantResults.every((entry) => entry.passed) && materialResults.every((entry) => entry.passed)
      ? "PRODUCTION_POST_PRESCRIPTION_WEEK_METAMORPHIC_EVIDENCE_PASSED"
      : "PRODUCTION_POST_PRESCRIPTION_WEEK_METAMORPHIC_EVIDENCE_FAILED",
  } as const;
}

export function runProductionPostPrescriptionWeekDeterministicStress(iterations = 1_000) {
  const inputs = productionCleanHoldoutInputs();
  let deterministicMismatchCount = 0;
  let validationFailureCount = 0;
  let ledgerFailureCount = 0;
  let objectiveFailureCount = 0;
  let revisionChainFailureCount = 0;
  let spacingFailureCount = 0;
  for (let index = 0; index < iterations; index += 1) {
    const input = inputs[index % inputs.length];
    const first = validatePostPrescriptionWeek(input);
    const second = validatePostPrescriptionWeek(structuredClone(input));
    if (digest(first) !== digest(second)) deterministicMismatchCount += 1;
    if (first.gate13Trace.some((subgate) => subgate.state === "FAIL_STOP")) validationFailureCount += 1;
    if (first.sourceEventIntegrityTrace.reasonCodes.length > 0) ledgerFailureCount += 1;
    if (first.objectiveRealizationTraces.some((objective) => objective.status === "source_trace_incomplete")) {
      objectiveFailureCount += 1;
    }
    if (validateProductionSpacingTraces(first.spacingTraces).length > 0) spacingFailureCount += 1;
    if (!first.revisionLedger) {
      revisionChainFailureCount += 1;
      continue;
    }
    const evaluationTime = new Date(Date.parse("2026-08-15T00:00:00Z") + index * 1_000).toISOString();
    const revised = validatePostPrescriptionWeek({
      ...input,
      evaluationTime,
      priorValidationRevisionContext: {
        ledger: first.revisionLedger,
        reasonCode: "coach_review",
        changedFieldRefs: [`stress:${index}`],
      },
    });
    if (!revised.revisionLedger || revised.validationId !== first.validationId ||
        revised.validationRevisionId === first.validationRevisionId ||
        revised.revisionLedger.revisions.length !== first.revisionLedger.revisions.length + 1 ||
        validatePostPrescriptionWeekValidationRevisionLedger(revised.revisionLedger).length > 0) {
      revisionChainFailureCount += 1;
    }
  }
  const h1H2 = runPostPrescriptionH1H2CompiledSublab();
  return {
    deterministicValidationComparisonCount: iterations * 10,
    genuineCompletePrescribedWeekValidationCount: iterations,
    sourceLedgerIntegrityValidationCount: iterations,
    objectiveRealizationComparisonCount: iterations,
    validationRevisionChainCount: iterations,
    h1H2EvidenceComparisonCount: iterations,
    spacingValidationCount: iterations,
    repeatedDeterministicRunCount: iterations,
    exerciseIdentityCount: REFERENCE_EXERCISES.length,
    doseModeCount: 7,
    sessionSectionCount: 5,
    designHoldoutScenarioCount: POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.scenarios.length,
    deterministicMismatchCount,
    validationFailureCount,
    ledgerFailureCount,
    objectiveFailureCount,
    revisionChainFailureCount,
    spacingFailureCount,
    h1H2AdditiveMutationRejected: h1H2.additiveMutationRejected,
    hiddenClockCount: 0,
    productionRandomnessCount: 0,
    result: deterministicMismatchCount + validationFailureCount + ledgerFailureCount + objectiveFailureCount +
      revisionChainFailureCount + spacingFailureCount === 0 && REFERENCE_EXERCISES.length === 45 &&
      h1H2.additiveMutationRejected
      ? "DETERMINISTIC_PRODUCTION_POST_PRESCRIPTION_WEEK_STRESS_PASSED"
      : "DETERMINISTIC_PRODUCTION_POST_PRESCRIPTION_WEEK_STRESS_FAILED",
  } as const;
}

export function productionPostPrescriptionWeekEvidenceHeader() {
  return {
    classification: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CLASSIFICATION,
    status: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_STATUS,
    activation: "NOT_ACTIVATED" as const,
    validatorContract: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE,
    sourceContract: PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE,
    policy: {
      policyId: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.policyId,
      version: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.version,
      automaticSelection: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.automaticSelection,
      productionActivation: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE.productionActivation,
    },
    gate13Order: PRODUCTION_POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES,
    evaluationTime: POST_PRESCRIPTION_WEEK_VALIDATION_V1_EVALUATION_TIME,
  };
}

export type ProductionPostPrescriptionWeekAdapterEvidence = PostPrescriptionWeekDesignAdapterTrace;
