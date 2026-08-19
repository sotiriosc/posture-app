import {
  PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_ID,
  PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_VERSION,
} from "../prescription/compiler/contracts";
import { explicitIsoTime } from "../prescription/compiler/utilities";
import { validateProductionWeeklyExecutionRequirements } from "../domain/weeklyExecutionRequirements";
import {
  PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_ID,
  PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_VERSION,
} from "../sequencing/contracts";
import type {
  ProductionBlockPurposeView,
  ProductionPlannedDoseLaneView,
  ProductionPlannedBurdenVector,
  ProductionPlannedMuscleRelationshipView,
  ProductionPlannedPrescribedWeekArgumentTrace,
  ProductionPlannedSourceExposureLedgerEntry,
  ProductionPlannedSpacingTrace,
  ProductionPlannedStressExposureTrace,
  ProductionPlannedRecoverySupportView,
  ProductionPostPrescriptionWeekCompatibilityProjection,
  ProductionPostPrescriptionWeekDecisionTrace,
  ProductionPostPrescriptionWeekGate13Trace,
  ProductionPostPrescriptionWeekSessionBundle,
  ProductionPostPrescriptionWeekValidationInput,
  ProductionPostPrescriptionWeekValidatorContractReference,
  ProductionWeeklyDurationView,
  ProductionWeeklyAssessmentPreparationTrace,
} from "./contracts";
import {
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_ID,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_VERSION,
} from "./contracts";
import type { ProductionPostPrescriptionWeekValidationPolicy } from "./policies/contracts";
import type {
  PrescribedWeekSourceSnapshot,
  ProductionWeekObjectiveSnapshot,
  ProductionWeekOpportunitySnapshot,
  ProductionWeekReservationSnapshot,
  ProductionPrescribedWeekSourceContractReference,
} from "./sourceContracts";
import {
  PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_ID,
  PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_VERSION,
} from "./sourceContracts";
import { validatePostPrescriptionWeekValidationRevisionLedger } from "./validationIdentity";

export function validateProductionPostPrescriptionWeekValidatorContract(
  contract: ProductionPostPrescriptionWeekValidatorContractReference | null | undefined,
): readonly string[] {
  if (!contract) return ["POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REQUIRED"];
  return contract.contractId === PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_ID &&
    contract.contractVersion === PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_VERSION
    ? []
    : ["UNSUPPORTED_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_VERSION"];
}

export function validateProductionPrescribedWeekSourceContract(
  contract: ProductionPrescribedWeekSourceContractReference | null | undefined,
): readonly string[] {
  if (!contract) return ["PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REQUIRED"];
  return contract.contractId === PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_ID &&
    contract.contractVersion === PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_VERSION
    ? []
    : ["UNSUPPORTED_PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_VERSION"];
}

function duplicates(values: readonly string[]): boolean {
  return new Set(values).size !== values.length;
}

export function validateProductionWeekObjectives(
  objectives: readonly ProductionWeekObjectiveSnapshot[],
): readonly string[] {
  const reasons: string[] = [];
  if (duplicates(objectives.map((objective) => objective.objectiveId))) reasons.push("DUPLICATE_SOURCE_OBJECTIVE_ID");
  for (const objective of objectives) {
    if (!objective.objectiveId || objective.priorityOrder < 0 || objective.sourceEvidenceRefs.length === 0 ||
        objective.provenance.length === 0) reasons.push("INVALID_SOURCE_OBJECTIVE");
    if (objective.frequencyIntent.minimumAllocatedSessions < 0 ||
        objective.frequencyIntent.targetAllocatedSessions < objective.frequencyIntent.minimumAllocatedSessions ||
        objective.frequencyIntent.softMaximumAllocatedSessions < objective.frequencyIntent.targetAllocatedSessions) {
      reasons.push("INVALID_SOURCE_OBJECTIVE_FREQUENCY");
    }
    if (objective.executionRequirements) {
      reasons.push(...validateProductionWeeklyExecutionRequirements(objective.executionRequirements));
    }
  }
  return [...new Set(reasons)].sort();
}

export function validateProductionWeekReservations(
  reservations: readonly ProductionWeekReservationSnapshot[],
  objectiveIds: ReadonlySet<string>,
  opportunityIds: ReadonlySet<string>,
): readonly string[] {
  const reasons: string[] = [];
  if (duplicates(reservations.map((reservation) => reservation.reservationId))) reasons.push("DUPLICATE_SOURCE_RESERVATION_ID");
  for (const reservation of reservations) {
    if (!opportunityIds.has(reservation.opportunityId)) reasons.push("SOURCE_RESERVATION_OPPORTUNITY_MISSING");
    if (reservation.allocatedObjectiveIds.some((id) => !objectiveIds.has(id))) reasons.push("SOURCE_RESERVATION_OBJECTIVE_MISSING");
    if (reservation.provenance.length === 0) reasons.push("SOURCE_RESERVATION_PROVENANCE_REQUIRED");
  }
  return [...new Set(reasons)].sort();
}

export function validateProductionWeekOpportunities(
  opportunities: readonly ProductionWeekOpportunitySnapshot[],
  reservationIds: ReadonlySet<string>,
): readonly string[] {
  const reasons: string[] = [];
  if (duplicates(opportunities.map((opportunity) => opportunity.opportunityId))) reasons.push("DUPLICATE_SOURCE_OPPORTUNITY_ID");
  for (const opportunity of opportunities) {
    if (opportunity.order < 0 || opportunity.reservationIds.some((id) => !reservationIds.has(id))) {
      reasons.push("INVALID_SOURCE_OPPORTUNITY");
    }
    if (opportunity.calendarDateTime !== null && !explicitIsoTime(opportunity.calendarDateTime)) {
      reasons.push("INVALID_SOURCE_OPPORTUNITY_TIME");
    }
  }
  return [...new Set(reasons)].sort();
}

export function validateProductionPrescribedWeekSourceSnapshot(
  snapshot: PrescribedWeekSourceSnapshot,
): readonly string[] {
  const reasons = [...validateProductionPrescribedWeekSourceContract(snapshot.sourceContract)];
  if (!snapshot.sourceSnapshotId || !snapshot.sourceSnapshotRevisionId) reasons.push("INVALID_SOURCE_SNAPSHOT_IDENTITY");
  if (!snapshot.athleteId || !snapshot.planningHorizonId || !snapshot.weeklyIntentId || !snapshot.weekAllocationPlanId) {
    reasons.push("INVALID_SOURCE_WEEK_IDENTITY");
  }
  if (!explicitIsoTime(snapshot.evaluationTime)) reasons.push("INVALID_SOURCE_EVALUATION_TIME");
  const objectiveIds = new Set(snapshot.objectives.map((objective) => objective.objectiveId));
  const reservationIds = new Set(snapshot.reservations.map((reservation) => reservation.reservationId));
  const opportunityIds = new Set(snapshot.opportunities.map((opportunity) => opportunity.opportunityId));
  reasons.push(...validateProductionWeekObjectives(snapshot.objectives));
  reasons.push(...validateProductionWeekReservations(snapshot.reservations, objectiveIds, opportunityIds));
  reasons.push(...validateProductionWeekOpportunities(snapshot.opportunities, reservationIds));
  for (const trace of snapshot.allocationTraces) {
    if (!objectiveIds.has(trace.objectiveId) || !reservationIds.has(trace.reservationId) ||
        !opportunityIds.has(trace.opportunityId) ||
        trace.sourceEvidenceRefs.length === 0 || trace.provenance.length === 0) {
      reasons.push("INVALID_SOURCE_ALLOCATION_TRACE");
    }
  }
  return [...new Set(reasons)].sort();
}

export function validateProductionPostPrescriptionWeekPolicy(
  policy: ProductionPostPrescriptionWeekValidationPolicy,
): readonly string[] {
  const reasons: string[] = [];
  if (!policy.policyId || !policy.version || policy.state !== "reviewed_not_activated") reasons.push("INVALID_VALIDATION_POLICY_IDENTITY");
  if (policy.automaticSelection !== false || policy.productionActivation !== false) reasons.push("VALIDATION_POLICY_MUST_REMAIN_INACTIVE");
  if (policy.h1Policy !== "MUSCLE_H1_SINGLE_FLEXIBLE" ||
      policy.h2Disposition !== "DEFERRED_PENDING_PRESCRIPTION_AND_COMPLETED_RESPONSE_EVIDENCE" ||
      policy.spacingPolicy !== "SPACING_R0_PRESCRIPTION_PENDING") reasons.push("INVALID_VALIDATION_POLICY_SCOPE");
  if (duplicates(policy.frequencyRules.map((rule) => rule.purpose))) reasons.push("DUPLICATE_VALIDATION_POLICY_RULE");
  if (policy.frequencyRules.some((rule) => [rule.required, rule.preferred, rule.optional]
    .some(([minimum, target, maximum]) => minimum < 0 || target < minimum || maximum < target))) {
    reasons.push("INVALID_VALIDATION_POLICY_FREQUENCY_RANGE");
  }
  return reasons;
}

export function validateProductionPostPrescriptionWeekSessionBundle(
  bundle: ProductionPostPrescriptionWeekSessionBundle,
): readonly string[] {
  const reasons: string[] = [];
  if (!bundle.reservationId || !bundle.opportunityId || !bundle.sessionIntentId || !bundle.executionAttemptId) {
    reasons.push("INVALID_SESSION_BUNDLE_IDENTITY");
  }
  if (bundle.prescriptionCompilation &&
      (bundle.prescriptionCompilation.compilerContract.contractId !== PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_ID ||
       bundle.prescriptionCompilation.compilerContract.contractVersion !== PRODUCTION_PRESCRIPTION_COMPILER_CONTRACT_VERSION)) {
    reasons.push("UNSUPPORTED_PRESCRIPTION_CONTRACT_VERSION");
  }
  if (bundle.sequencingResult &&
      (bundle.sequencingResult.sequencingContract.contractId !== PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_ID ||
       bundle.sequencingResult.sequencingContract.contractVersion !== PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_VERSION)) {
    reasons.push("UNSUPPORTED_SEQUENCING_CONTRACT_VERSION");
  }
  return reasons;
}

export function validateProductionPostPrescriptionWeekInput(
  input: ProductionPostPrescriptionWeekValidationInput,
): readonly string[] {
  const reasons = [
    ...validateProductionPostPrescriptionWeekValidatorContract(input.validatorContract),
    ...validateProductionPrescribedWeekSourceSnapshot(input.weekSource),
    ...input.sessionBundles.flatMap(validateProductionPostPrescriptionWeekSessionBundle),
  ];
  if (input.validationPolicy && "frequencyRules" in input.validationPolicy) {
    reasons.push(...validateProductionPostPrescriptionWeekPolicy(input.validationPolicy));
  }
  for (const policy of input.availableValidationPolicies ?? []) {
    reasons.push(...validateProductionPostPrescriptionWeekPolicy(policy));
  }
  if (!explicitIsoTime(input.evaluationTime)) reasons.push("POST_PRESCRIPTION_WEEK_EVALUATION_TIME_INVALID");
  if (duplicates(input.sessionBundles.map((bundle) => bundle.reservationId))) reasons.push("DUPLICATE_SESSION_BUNDLE_RESERVATION");
  if (input.priorValidationRevisionContext) {
    reasons.push(...validatePostPrescriptionWeekValidationRevisionLedger(input.priorValidationRevisionContext.ledger));
  }
  return [...new Set(reasons)].sort();
}

export function validateProductionObjectiveToEventChain(
  input: ProductionPostPrescriptionWeekValidationInput,
  ledger: readonly ProductionPlannedSourceExposureLedgerEntry[],
): readonly string[] {
  const reasons: string[] = [];
  const objectiveIds = new Set(input.weekSource.objectives.map((objective) => objective.objectiveId));
  const reservationIds = new Set(input.weekSource.reservations.map((reservation) => reservation.reservationId));
  const allocationKeys = new Set(input.weekSource.allocationTraces.map((trace) =>
    `${trace.objectiveId}:${trace.reservationId}:${trace.opportunityId}`));
  for (const event of ledger) {
    if (event.weeklyObjectiveIds.some((objectiveId) => !objectiveIds.has(objectiveId) ||
        !allocationKeys.has(`${objectiveId}:${event.reservationId}:${event.opportunityId}`))) {
      reasons.push("WEEK_OBJECTIVE_SOURCE_TRACE_INCOMPLETE");
    }
    if (!reservationIds.has(event.reservationId) || event.satisfiedSessionNeedIds.length === 0 ||
        !event.assignmentId || !event.sourceExposureEventId || !event.prescriptionId ||
        !event.finalPrescriptionRevisionId || !event.finalSequenceRevisionId) {
      reasons.push("WEEK_OBJECTIVE_SOURCE_TRACE_INCOMPLETE");
    }
  }
  return [...new Set(reasons)].sort();
}

export function validateProductionSourceEventUniqueness(
  ledger: readonly ProductionPlannedSourceExposureLedgerEntry[],
): readonly string[] {
  const groups = new Map<string, ProductionPlannedSourceExposureLedgerEntry[]>();
  for (const event of ledger) groups.set(event.sourceExposureEventId, [
    ...(groups.get(event.sourceExposureEventId) ?? []), event,
  ]);
  const reasons: string[] = [];
  if ([...groups.values()].some((events) => events.length > 1)) reasons.push("DUPLICATE_SOURCE_EVENT");
  if ([...groups.values()].some((events) => new Set(events.map((event) => event.reservationId)).size > 1)) {
    reasons.push("CROSS_SESSION_EVENT_COLLISION");
  }
  return reasons;
}

export function validateProductionPlannedSourceExposureLedger(
  ledger: readonly ProductionPlannedSourceExposureLedgerEntry[],
): readonly string[] {
  const reasons = [...validateProductionSourceEventUniqueness(ledger)];
  for (const event of ledger) {
    if (!event.validationId || !event.validationRevisionId || !event.athleteId || !event.reservationId ||
        !event.opportunityId || !event.sessionIntentId || !event.executionAttemptId || !event.sequencePlanId ||
        !event.assignmentId || !event.sourceExposureEventId || !event.exerciseId || !event.prescriptionId ||
        event.sequenceIndex < 0 || event.provenance.length === 0) reasons.push("INVALID_SOURCE_EXPOSURE_LEDGER_ENTRY");
    if (event.doseBlockIds.length !== event.blockPurposeViews.length ||
        event.doseBlockIds.length !== event.doseLanes.length) reasons.push("SOURCE_EVENT_BLOCK_MAPPING_INCOMPLETE");
  }
  return [...new Set(reasons)].sort();
}

export function validateProductionFinalPrescriptionRevisions(
  input: ProductionPostPrescriptionWeekValidationInput,
  ledger: readonly ProductionPlannedSourceExposureLedgerEntry[],
): readonly string[] {
  const finalByPrescription = new Map(input.sessionBundles.flatMap((bundle) =>
    bundle.prescriptionCompilation?.plans.map((plan) => [plan.prescriptionId, plan.revisionLedger.finalRevisionId] as const) ?? []));
  return ledger.some((event) => finalByPrescription.get(event.prescriptionId) !== event.finalPrescriptionRevisionId)
    ? ["STALE_PRESCRIPTION_REVISION"] : [];
}

export function validateProductionFinalSequenceRevisions(
  input: ProductionPostPrescriptionWeekValidationInput,
  ledger: readonly ProductionPlannedSourceExposureLedgerEntry[],
): readonly string[] {
  const finalByPlan = new Map(input.sessionBundles.flatMap((bundle) => bundle.sequencingResult?.plan
    ? [[bundle.sequencingResult.plan.sequencePlanId, bundle.sequencingResult.plan.revisionLedger.finalRevisionId] as const]
    : []));
  return ledger.some((event) => finalByPlan.get(event.sequencePlanId) !== event.finalSequenceRevisionId)
    ? ["STALE_SEQUENCE_REVISION"] : [];
}

export function validateProductionBlockContributionViews(
  views: readonly ProductionBlockPurposeView[],
): readonly string[] {
  const canonical = {
    preparatory_acclimation: "not_weekly_developmental_credit",
    developmental_work: "developmental_credit_candidate",
    technique_quality_work: "technique_quality_observation_only",
    recovery_or_downregulation: "recovery_observation_only",
    unknown: "unknown_requires_review",
  } as const;
  return views.some((view) =>
    view.developmentalCreditEligible !== (view.contributionClassification === "developmental_credit_candidate") ||
    canonical[view.purpose] !== view.contributionClassification)
    ? ["INVALID_BLOCK_CONTRIBUTION_CLASSIFICATION"] : [];
}

export function validateProductionDoseLanes(
  lanes: readonly ProductionPlannedDoseLaneView[],
): readonly string[] {
  return lanes.some((lane) => lane.mode !== lane.dose.mode || lane.commensurableWithinModeOnly !== true)
    ? ["INVALID_NONCOMMENSURABLE_DOSE_LANE"] : [];
}

export function validateProductionRelationshipViews(
  views: readonly ProductionPlannedMuscleRelationshipView[],
): readonly string[] {
  return views.some((view) => view.fractionalCoefficient !== null)
    ? ["FRACTIONAL_MUSCLE_RELATIONSHIP_COEFFICIENT_PROHIBITED"] : [];
}

export function validateProductionStressViews(
  views: readonly ProductionPlannedStressExposureTrace[],
): readonly string[] {
  return views.some((view) => view.injuryOrDiagnosisClaimed !== false)
    ? ["PLANNED_STRESS_MUST_NOT_CLAIM_INJURY_OR_DIAGNOSIS"] : [];
}

export function validateProductionAssessmentPreparationTrace(
  trace: ProductionWeeklyAssessmentPreparationTrace,
): readonly string[] {
  const reasons: string[] = [];
  if (trace.genericSupportingEventIds.length > 0) reasons.push("GENERIC_SUPPORTING_WORK_WITHOUT_DEPENDENCY");
  if (trace.developmentalMiscreditEventIds.length > 0) reasons.push("SUPPORTING_WORK_DEVELOPMENTAL_MISCREDIT");
  if (trace.duplicateSupportingEventIds.length > 0) reasons.push("SUPPORTING_SOURCE_EVENT_DUPLICATION");
  if (trace.validatorCreatedSupportingAssignmentCount !== 0) reasons.push("VALIDATOR_CREATED_SUPPORTING_ASSIGNMENT");
  return reasons;
}

export function validateProductionRecoveryViews(
  views: readonly ProductionPlannedRecoverySupportView[],
): readonly string[] {
  return views.some((view) => view.observation !== "PRESCRIBED_RECOVERY_SUPPORT_OBSERVATION" ||
    view.recoveredStateClaimed !== false)
    ? ["RECOVERY_SUPPORT_MUST_NOT_CLAIM_RECOVERED_STATE"] : [];
}

export function validateProductionBurdenVectors(
  vectors: readonly ProductionPlannedBurdenVector[],
): readonly string[] {
  return vectors.some((vector) => vector.observedRecoveryCost !== null || vector.aggregateScore !== null)
    ? ["PLANNED_BURDEN_MUST_REMAIN_STRUCTURED_OBSERVATION"] : [];
}

export function validateProductionDurationView(view: ProductionWeeklyDurationView): readonly string[] {
  const reasons: string[] = [];
  if (view.knownLowerBoundSeconds < 0 ||
      (view.knownUpperBoundSeconds !== null && view.knownUpperBoundSeconds < view.knownLowerBoundSeconds)) {
    reasons.push("INVALID_WEEK_DURATION_INTERVAL");
  }
  if ((view.knownUpperBoundSeconds === null) === view.totalDurationKnown) reasons.push("INVALID_WEEK_DURATION_KNOWLEDGE_STATE");
  if (view.physiologicalDoseMetric !== false) reasons.push("DURATION_MUST_NOT_BECOME_PHYSIOLOGICAL_DOSE");
  return reasons;
}

export function validateProductionSpacingTraces(
  traces: readonly ProductionPlannedSpacingTrace[],
): readonly string[] {
  return traces.some((trace) =>
    (trace.elapsedTimeKnown && trace.elapsedMinutes === null) ||
    (!trace.elapsedTimeKnown && trace.elapsedMinutes !== null) ||
    trace.responseEvidenceAvailable !== false || trace.applicableSpacingPolicy !== "SPACING_R0_PRESCRIPTION_PENDING")
    ? ["INVALID_WEEK_SPACING_TRACE"] : [];
}

export function validateProductionCompleteWeekArgument(
  argument: ProductionPlannedPrescribedWeekArgumentTrace,
): readonly string[] {
  const reasons: string[] = [];
  if (argument.validationAddedSessionCount !== 0 || argument.validationRemovedSessionCount !== 0 ||
      argument.validationAddedExerciseCount !== 0 || argument.validationRemovedExerciseCount !== 0) {
    reasons.push("VALIDATOR_MUTATED_PRESCRIBED_WEEK");
  }
  if (!argument.allocationsPreserved) reasons.push("VALIDATOR_REALLOCATED_PRESCRIBED_WEEK");
  if (argument.plannedFactsCalledCompletedCount !== 0) reasons.push("PLANNED_FACT_CALLED_COMPLETED");
  if (!argument.noncommensurableDoseModesSeparate) reasons.push("DOSE_LANE_CONFLATION");
  return reasons;
}

export function validateProductionGate13Trace(
  trace: readonly ProductionPostPrescriptionWeekGate13Trace[],
  upstreamGateState: "PASS" | "FAIL_STOP",
): readonly string[] {
  const reasons: string[] = [];
  if (trace.length !== 10) reasons.push("INVALID_GATE_13_SUBGATE_COUNT");
  if (upstreamGateState === "FAIL_STOP" && trace.some((subgate) => subgate.scored || subgate.state !== "SHADOW_DIAGNOSTIC_ONLY")) {
    reasons.push("DOWNSTREAM_RESCUE_PROHIBITED");
  }
  const failIndex = trace.findIndex((subgate) => subgate.state === "FAIL_STOP");
  if (failIndex >= 0 && trace.slice(failIndex + 1).some((subgate) => subgate.scored || subgate.state !== "SHADOW_DIAGNOSTIC_ONLY")) {
    reasons.push("GATE_13_FAIL_STOP_ORDER_VIOLATION");
  }
  return reasons;
}

export function validateProductionDecisionTrace(trace: ProductionPostPrescriptionWeekDecisionTrace): readonly string[] {
  return trace.actualPerformanceConsumed || trace.longitudinalDecisionConsumed
    ? ["PLANNED_WEEK_VALIDATOR_OWNER_BOUNDARY_VIOLATION"] : [];
}

export function validateProductionPostPrescriptionWeekCompatibilityProjection(
  projection: ProductionPostPrescriptionWeekCompatibilityProjection,
): readonly string[] {
  const objectiveIds = Object.keys(projection.objectivePrescribedStates).sort();
  return objectiveIds.every((id) =>
    Object.hasOwn(projection.qualifyingReservationIdsByObjective, id) &&
    Object.hasOwn(projection.sourceEventIdsByObjective, id))
    ? []
    : ["INVALID_POST_PRESCRIPTION_WEEK_COMPATIBILITY_PROJECTION"];
}
