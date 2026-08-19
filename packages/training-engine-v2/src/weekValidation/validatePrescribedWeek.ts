import type { ExerciseDefinition } from "../domain/exercise";
import type { ExerciseDose } from "../prescription/dose";
import { numericBounds, stableId, uniqueSorted } from "../prescription/compiler/utilities";
import type { ProductionPrescriptionDoseBlock } from "../prescription/compiler/contracts";
import type {
  ProductionBlockPurposeView,
  ProductionObjectivePrescribedRealizationStatus,
  ProductionObjectiveThresholdState,
  ProductionPlannedBurdenVector,
  ProductionPlannedConcentrationTrace,
  ProductionPlannedDoseLaneView,
  ProductionPlannedMovementActionCapacityView,
  ProductionPlannedMuscleRelationshipView,
  ProductionPlannedPrescribedWeekArgumentStatus,
  ProductionPlannedPrescribedWeekArgumentTrace,
  ProductionPlannedSourceExposureLedgerEntry,
  ProductionPlannedSpacingTrace,
  ProductionPlannedRecoverySupportView,
  ProductionPlannedStressExposureResolutionState,
  ProductionPlannedStressExposureTrace,
  ProductionPostPrescriptionWeekCompatibilityProjection,
  ProductionPostPrescriptionWeekGate13Subgate,
  ProductionPostPrescriptionWeekGate13Trace,
  ProductionPostPrescriptionWeekInputAuthorityTrace,
  ProductionPostPrescriptionWeekSessionBundle,
  ProductionPostPrescriptionWeekSpacingResult,
  ProductionPostPrescriptionWeekValidationInput,
  ProductionPostPrescriptionWeekValidationResult,
  ProductionPostPrescriptionWeekValidationStatus,
  ProductionSessionAdmissibilityTrace,
  ProductionSourceEventIntegrityTrace,
  ProductionWeeklyDurationView,
  ProductionWeeklyAssessmentPreparationTrace,
  ProductionWeeklyObjectivePrescribedRealizationTrace,
} from "./contracts";
import {
  PRODUCTION_POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE,
} from "./contracts";
import type { ProductionPostPrescriptionWeekValidationPolicy } from "./policies/contracts";
import { frequencyRuleForPriority } from "./policies/contracts";
import { resolvePostPrescriptionWeekValidationPolicy } from "./policies/policyResolution";
import type {
  PrescribedWeekSourceSnapshot,
  ProductionWeekObjectiveSnapshot,
  ProductionWeekReservationSnapshot,
} from "./sourceContracts";
import {
  buildPostPrescriptionWeekValidationRevisionLedger,
  derivePostPrescriptionWeekValidationId,
  derivePostPrescriptionWeekValidationRevisionId,
} from "./validationIdentity";
import {
  validateProductionBlockContributionViews,
  validateProductionAssessmentPreparationTrace,
  validateProductionBurdenVectors,
  validateProductionCompleteWeekArgument,
  validateProductionDoseLanes,
  validateProductionDurationView,
  validateProductionFinalPrescriptionRevisions,
  validateProductionFinalSequenceRevisions,
  validateProductionObjectiveToEventChain,
  validateProductionPlannedSourceExposureLedger,
  validateProductionPostPrescriptionWeekCompatibilityProjection,
  validateProductionPostPrescriptionWeekInput,
  validateProductionRelationshipViews,
  validateProductionRecoveryViews,
  validateProductionSpacingTraces,
  validateProductionStressViews,
} from "./validation";

const sortedUnique = (values: readonly string[]): readonly string[] => [...new Set(values)].sort();

function durationPending(status: string, upperBound: number | null): boolean {
  return upperBound === null || [
    "possibly_over_budget",
    "unknown_due_to_prescription",
    "unknown_due_to_setup_transition",
    "unknown_due_to_interexercise_recovery",
    "unknown_due_to_section_transition",
  ].includes(status);
}

function classifySession(input: {
  readonly source: PrescribedWeekSourceSnapshot;
  readonly reservation: ProductionWeekReservationSnapshot;
  readonly bundle: ProductionPostPrescriptionWeekSessionBundle | undefined;
  readonly inputReasonCodes: readonly string[];
}): ProductionSessionAdmissibilityTrace {
  const { reservation, bundle } = input;
  if (reservation.invalidationState !== "active" || bundle?.expectedArtifactState === "cancelled" ||
      bundle?.expectedArtifactState === "superseded") {
    return {
      reservationId: reservation.reservationId,
      opportunityId: reservation.opportunityId,
      sessionIntentId: bundle?.sessionIntentId ?? null,
      executionAttemptId: bundle?.executionAttemptId ?? null,
      status: "superseded_or_cancelled",
      prescribedRealizationPresent: false,
      executableMinimumEligible: false,
      pendingFeasibilityEligible: false,
      durationState: "unavailable",
      reasonCodes: ["RESERVATION_SUPERSEDED_OR_CANCELLED"],
    };
  }
  if (!bundle || !bundle.sessionIntent || !bundle.sessionSkeleton) {
    return {
      reservationId: reservation.reservationId,
      opportunityId: reservation.opportunityId,
      sessionIntentId: bundle?.sessionIntentId ?? null,
      executionAttemptId: bundle?.executionAttemptId ?? null,
      status: "missing_session_artifact",
      prescribedRealizationPresent: false,
      executableMinimumEligible: false,
      pendingFeasibilityEligible: false,
      durationState: "unavailable",
      reasonCodes: ["MISSING_SESSION_ARTIFACT"],
    };
  }
  const compilation = bundle.prescriptionCompilation;
  const sequencing = bundle.sequencingResult;
  const opportunityExists = input.source.opportunities.some((entry) => entry.opportunityId === reservation.opportunityId);
  const prescriptionIdentityValid = compilation?.plans.every((plan) =>
    plan.sourceExposureEvent.sessionIntentId === bundle.sessionIntentId &&
    plan.revisionLedger.executionAttemptId === bundle.executionAttemptId &&
    plan.revisionLedger.finalRevisionId === plan.prescriptionRevisionId) !== false;
  const sequencePlan = sequencing?.plan ?? null;
  const sequenceIdentityValid = !sequencePlan ||
    sequencePlan.sessionIntentId === bundle.sessionIntentId &&
    sequencePlan.executionAttemptId === bundle.executionAttemptId &&
    sequencePlan.revisionLedger.finalRevisionId === sequencePlan.sequenceRevisionId;
  const identityValid = opportunityExists &&
    bundle.reservationId === reservation.reservationId &&
    bundle.opportunityId === reservation.opportunityId &&
    bundle.sessionIntent.id === bundle.sessionIntentId &&
    bundle.sessionIntent.athleteId === input.source.athleteId &&
    bundle.sessionSkeleton.sessionIntentId === bundle.sessionIntentId &&
    prescriptionIdentityValid && sequenceIdentityValid;
  if (!identityValid || input.inputReasonCodes.some((reason) => [
    "UNSUPPORTED_PRESCRIPTION_CONTRACT_VERSION",
    "UNSUPPORTED_SEQUENCING_CONTRACT_VERSION",
  ].includes(reason))) {
    return {
      reservationId: reservation.reservationId,
      opportunityId: reservation.opportunityId,
      sessionIntentId: bundle.sessionIntentId,
      executionAttemptId: bundle.executionAttemptId,
      status: "invalid_identity_chain",
      prescribedRealizationPresent: Boolean(compilation?.plans.length),
      executableMinimumEligible: false,
      pendingFeasibilityEligible: false,
      durationState: sequencePlan?.duration.status ?? "unavailable",
      reasonCodes: ["INVALID_SESSION_IDENTITY_CHAIN"],
    };
  }
  if (!compilation || compilation.status === "incomplete" || compilation.status === "invalid_session_handoff") {
    return {
      reservationId: reservation.reservationId,
      opportunityId: reservation.opportunityId,
      sessionIntentId: bundle.sessionIntentId,
      executionAttemptId: bundle.executionAttemptId,
      status: "incomplete_prescription",
      prescribedRealizationPresent: Boolean(compilation?.plans.length),
      executableMinimumEligible: false,
      pendingFeasibilityEligible: false,
      durationState: "unavailable",
      reasonCodes: ["INCOMPLETE_PRESCRIPTION"],
    };
  }
  if (compilation.status === "blocked_by_training_readiness" || sequencing?.status === "blocked_by_training_readiness") {
    return {
      reservationId: reservation.reservationId,
      opportunityId: reservation.opportunityId,
      sessionIntentId: bundle.sessionIntentId,
      executionAttemptId: bundle.executionAttemptId,
      status: "blocked_by_training_readiness",
      prescribedRealizationPresent: compilation.plans.length > 0,
      executableMinimumEligible: false,
      pendingFeasibilityEligible: false,
      durationState: sequencePlan?.duration.status ?? "unavailable",
      reasonCodes: ["BLOCKED_BY_TRAINING_READINESS"],
    };
  }
  if (!sequencing) {
    return {
      reservationId: reservation.reservationId,
      opportunityId: reservation.opportunityId,
      sessionIntentId: bundle.sessionIntentId,
      executionAttemptId: bundle.executionAttemptId,
      status: "incomplete_sequencing",
      prescribedRealizationPresent: compilation.plans.length > 0,
      executableMinimumEligible: false,
      pendingFeasibilityEligible: false,
      durationState: "unavailable",
      reasonCodes: ["PRESCRIPTION_PRESENT_SEQUENCE_MISSING"],
    };
  }
  if (sequencing.status === "search_inconclusive") {
    return {
      reservationId: reservation.reservationId,
      opportunityId: reservation.opportunityId,
      sessionIntentId: bundle.sessionIntentId,
      executionAttemptId: bundle.executionAttemptId,
      status: "search_inconclusive",
      prescribedRealizationPresent: compilation.plans.length > 0,
      executableMinimumEligible: false,
      pendingFeasibilityEligible: false,
      durationState: "unavailable",
      reasonCodes: ["SEQUENCING_SEARCH_INCONCLUSIVE"],
    };
  }
  if (!sequencePlan) {
    return {
      reservationId: reservation.reservationId,
      opportunityId: reservation.opportunityId,
      sessionIntentId: bundle.sessionIntentId,
      executionAttemptId: bundle.executionAttemptId,
      status: "incomplete_sequencing",
      prescribedRealizationPresent: compilation.plans.length > 0,
      executableMinimumEligible: false,
      pendingFeasibilityEligible: false,
      durationState: "unavailable",
      reasonCodes: [`INCOMPLETE_SEQUENCING:${sequencing.status}`],
    };
  }
  if (sequencePlan.duration.status === "definitely_over_budget") {
    return {
      reservationId: reservation.reservationId,
      opportunityId: reservation.opportunityId,
      sessionIntentId: bundle.sessionIntentId,
      executionAttemptId: bundle.executionAttemptId,
      status: "definitely_over_budget",
      prescribedRealizationPresent: true,
      executableMinimumEligible: false,
      pendingFeasibilityEligible: false,
      durationState: sequencePlan.duration.status,
      reasonCodes: ["DEFINITELY_OVER_BUDGET_REQUIRES_WEEK_REVIEW"],
    };
  }
  if (sequencePlan.duration.status === "possibly_over_budget") {
    return {
      reservationId: reservation.reservationId,
      opportunityId: reservation.opportunityId,
      sessionIntentId: bundle.sessionIntentId,
      executionAttemptId: bundle.executionAttemptId,
      status: "possibly_over_budget",
      prescribedRealizationPresent: true,
      executableMinimumEligible: false,
      pendingFeasibilityEligible: true,
      durationState: sequencePlan.duration.status,
      reasonCodes: ["EXECUTION_FEASIBILITY_PENDING"],
    };
  }
  if (durationPending(sequencePlan.duration.status, sequencePlan.duration.knownUpperBoundSeconds)) {
    return {
      reservationId: reservation.reservationId,
      opportunityId: reservation.opportunityId,
      sessionIntentId: bundle.sessionIntentId,
      executionAttemptId: bundle.executionAttemptId,
      status: "prescribed_duration_unresolved",
      prescribedRealizationPresent: true,
      executableMinimumEligible: false,
      pendingFeasibilityEligible: true,
      durationState: sequencePlan.duration.status,
      reasonCodes: ["PRESCRIBED_REALIZATION_PRESENT_DURATION_PENDING"],
    };
  }
  return {
    reservationId: reservation.reservationId,
    opportunityId: reservation.opportunityId,
    sessionIntentId: bundle.sessionIntentId,
    executionAttemptId: bundle.executionAttemptId,
    status: "prescribed_and_sequenced",
    prescribedRealizationPresent: true,
    executableMinimumEligible: true,
    pendingFeasibilityEligible: false,
    durationState: sequencePlan.duration.status,
    reasonCodes: ["PRESCRIBED_AND_SEQUENCED"],
  };
}

function containsUnknownTarget(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsUnknownTarget);
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return record.kind === "unknown" || Object.values(record).some(containsUnknownTarget);
}

function doseLane(sourceEventId: string, block: ProductionPrescriptionDoseBlock): ProductionPlannedDoseLaneView {
  return {
    sourceExposureEventId: sourceEventId,
    blockId: block.blockId,
    purpose: block.purpose,
    contributionClassification: block.contributionClassification,
    mode: block.dose.mode,
    dose: block.dose,
    commensurableWithinModeOnly: true,
    timingKnown: !containsUnknownTarget(block.dose),
    provenance: block.provenance,
  };
}

function capacityLane(
  role: ProductionPlannedSourceExposureLedgerEntry["role"],
  exercise: ExerciseDefinition,
  modes: readonly ExerciseDose["mode"][],
): ProductionPlannedMovementActionCapacityView["capacityLane"] {
  if (role !== "capacity") return "none";
  if (modes.some((mode) => mode === "distance_carry" || mode === "timed_carry")) return "loaded_carry";
  if (modes.includes("step_march")) return "supported_stationary_capacity";
  return exercise.loading.loadingPotential !== "low" ? "loaded_bracing" : "supported_stationary_capacity";
}

function stressResolution(scope: string): ProductionPlannedStressExposureResolutionState {
  if (scope === "intrinsic") return "intrinsic_planned_exposure";
  if (scope === "prescription_modifiable") return "prescription_modified_exposure";
  if (scope === "variant_dependent") return "variant_confirmed_exposure";
  if (scope === "dose_created") return "dose_created_potential_unresolved";
  return "unknown_requires_review";
}

function developmentalSetRange(blocks: readonly ProductionPrescriptionDoseBlock[]): readonly [number, number] | null {
  const ranges = blocks.flatMap((block) => {
    if (block.dose.mode !== "repetition_sets") return [];
    const bounds = numericBounds(block.dose.sets);
    return bounds ? [bounds] : [];
  });
  return ranges.length === 0 ? null : [
    ranges.reduce((sum, range) => sum + range[0], 0),
    ranges.reduce((sum, range) => sum + range[1], 0),
  ];
}

function allocationObjectiveIds(
  source: PrescribedWeekSourceSnapshot,
  reservationId: string,
  satisfiedNeedIds: readonly string[],
  intentNeedObjectiveIds: ReadonlyMap<string, readonly string[]>,
): readonly string[] {
  const traceObjectives = source.allocationTraces
    .filter((trace) => trace.reservationId === reservationId &&
      trace.sessionNeedIds.some((needId) => satisfiedNeedIds.includes(needId)))
    .map((trace) => trace.objectiveId);
  const plannerObjectives = satisfiedNeedIds.flatMap((needId) => intentNeedObjectiveIds.get(needId) ?? []);
  return sortedUnique(traceObjectives.filter((objectiveId) => plannerObjectives.includes(objectiveId)));
}

function buildLedger(input: {
  readonly validationInput: ProductionPostPrescriptionWeekValidationInput;
  readonly validationId: string;
  readonly validationRevisionId: string;
  readonly sessions: readonly ProductionSessionAdmissibilityTrace[];
}): readonly ProductionPlannedSourceExposureLedgerEntry[] {
  const { validationInput } = input;
  const exerciseById = new Map(validationInput.exerciseRegistry.map((exercise) => [exercise.id, exercise]));
  const sessionByReservation = new Map(input.sessions.map((session) => [session.reservationId, session]));
  const entries: ProductionPlannedSourceExposureLedgerEntry[] = [];
  for (const bundle of validationInput.sessionBundles) {
    const sequencePlan = bundle.sequencingResult?.plan;
    const compilation = bundle.prescriptionCompilation;
    const session = sessionByReservation.get(bundle.reservationId);
    if (!sequencePlan || !compilation || !bundle.sessionIntent || !session ||
        ["missing_session_artifact", "incomplete_prescription", "incomplete_sequencing", "search_inconclusive",
          "invalid_identity_chain", "superseded_or_cancelled", "blocked_by_training_readiness"].includes(session.status)) continue;
    const prescriptionById = new Map(compilation.plans.map((plan) => [plan.prescriptionId, plan]));
    const needObjectiveIds = new Map(bundle.sessionIntent.needs.map((need) => [
      need.id,
      need.plannerProvenance?.objectiveIds ?? [],
    ]));
    for (const step of sequencePlan.steps) {
      const prescription = prescriptionById.get(step.prescriptionId);
      const exercise = exerciseById.get(step.exerciseId);
      if (!prescription || !exercise) continue;
      const objectiveIds = allocationObjectiveIds(
        validationInput.weekSource,
        bundle.reservationId,
        step.satisfiedNeedIds,
        needObjectiveIds,
      );
      const developmentalBlocks = prescription.doseBlocks
        .filter((block) => block.contributionClassification === "developmental_credit_candidate");
      const blockViews: readonly ProductionBlockPurposeView[] = prescription.doseBlocks.map((block) => ({
        blockId: block.blockId,
        purpose: block.purpose,
        contributionClassification: block.contributionClassification,
        doseMode: block.dose.mode,
        objectiveIds,
        developmentalCreditEligible: block.contributionClassification === "developmental_credit_candidate",
        reasonCodes: [`BLOCK_CONTRIBUTION:${block.contributionClassification}`],
      }));
      const muscleViews: readonly ProductionPlannedMuscleRelationshipView[] = exercise.muscleContributions.map((view) => ({
        sourceExposureEventId: step.sourceExposureEventId,
        exerciseId: step.exerciseId,
        objectiveIds,
        muscle: view.muscle,
        relationship: view.relationship,
        blockIds: developmentalBlocks.map((block) => block.blockId),
        developmentalSetRange: developmentalSetRange(developmentalBlocks),
        nonSetLaneRefs: developmentalBlocks.filter((block) => block.dose.mode !== "repetition_sets")
          .map((block) => `${block.blockId}:${block.dose.mode}`),
        reviewStatus: view.reviewStatus,
        fractionalCoefficient: null,
        provenance: view.provenance.map((provenance) => provenance.sourceRef),
      }));
      const movementView: ProductionPlannedMovementActionCapacityView = {
        sourceExposureEventId: step.sourceExposureEventId,
        exerciseId: step.exerciseId,
        objectiveIds,
        movementRoles: exercise.movementRoles,
        actionFunctions: exercise.actionFunctions.filter((view) => view.reviewStatus === "accepted").map((view) => view.action),
        capacityLane: capacityLane(step.role, exercise, prescription.doseBlocks.map((block) => block.dose.mode)),
        assessmentLane: prescription.doseBlocks.some((block) =>
          block.contributionClassification === "technique_quality_observation_only")
          ? "technique_quality"
          : ["preparation", "activation"].includes(step.role) ? "preparation_control" : "none",
        recoveryLane: prescription.doseBlocks.some((block) =>
          block.contributionClassification === "recovery_observation_only")
          ? "prescribed_recovery_support" : "none",
        provenance: exercise.actionFunctions.flatMap((view) => view.provenance.map((provenance) => provenance.sourceRef)),
      };
      const stressViews: readonly ProductionPlannedStressExposureTrace[] = (exercise.stressAnnotations ?? [])
        .map((annotation) => ({
          sourceExposureEventId: step.sourceExposureEventId,
          exerciseId: step.exerciseId,
          blockIds: prescription.doseBlocks.map((block) => block.blockId),
          stressTag: annotation.tag,
          source: annotation.source,
          exposureScope: annotation.exposureScope,
          sideScope: annotation.sideScope,
          prescribedRealizationFacts: prescription.doseBlocks.map((block) => `${block.blockId}:${block.dose.mode}`),
          resolutionState: stressResolution(annotation.exposureScope),
          injuryOrDiagnosisClaimed: false,
          provenance: annotation.provenance.map((provenance) => provenance.sourceRef),
        }));
      entries.push({
        validatorContract: validationInput.validatorContract,
        validationId: input.validationId,
        validationRevisionId: input.validationRevisionId,
        athleteId: validationInput.weekSource.athleteId,
        planningHorizonId: validationInput.weekSource.planningHorizonId,
        weeklyIntentId: validationInput.weekSource.weeklyIntentId,
        weekAllocationPlanId: validationInput.weekSource.weekAllocationPlanId,
        reservationId: bundle.reservationId,
        opportunityId: bundle.opportunityId,
        sessionIntentId: bundle.sessionIntentId,
        executionAttemptId: sequencePlan.executionAttemptId,
        sequencePlanId: sequencePlan.sequencePlanId,
        finalSequenceRevisionId: sequencePlan.sequenceRevisionId,
        sequenceIndex: step.sequenceIndex,
        assignmentId: step.assignmentId,
        sourceExposureEventId: step.sourceExposureEventId,
        exerciseId: step.exerciseId,
        prescriptionId: step.prescriptionId,
        finalPrescriptionRevisionId: step.finalPrescriptionRevisionId,
        section: step.section,
        role: step.role,
        satisfiedSessionNeedIds: step.satisfiedNeedIds,
        weeklyObjectiveIds: objectiveIds,
        doseBlockIds: step.orderedDoseBlockIds,
        blockPurposeViews: blockViews,
        doseLanes: prescription.doseBlocks.map((block) => doseLane(step.sourceExposureEventId, block)),
        muscleRelationshipViews: muscleViews,
        movementActionCapacityView: movementView,
        stressExposureViews: stressViews,
        durationInterval: prescription.durationInterval,
        sessionAdmissibilityState: session.status,
        provenance: [prescription.provenance, ...sequencePlan.provenance],
      });
    }
  }
  return entries.sort((left, right) => left.reservationId.localeCompare(right.reservationId) ||
    left.sequenceIndex - right.sequenceIndex || left.assignmentId.localeCompare(right.assignmentId));
}

function sourceIntegrity(
  input: ProductionPostPrescriptionWeekValidationInput,
  ledger: readonly ProductionPlannedSourceExposureLedgerEntry[],
): ProductionSourceEventIntegrityTrace {
  const activeReservations = new Set(input.weekSource.reservations
    .filter((reservation) => reservation.invalidationState === "active")
    .map((reservation) => reservation.reservationId));
  const expectedAssignments = input.sessionBundles.flatMap((bundle) =>
    bundle.expectedArtifactState === "expected" && activeReservations.has(bundle.reservationId)
      ? bundle.sessionSkeleton?.assignments.map((assignment) => ({
          reservationId: bundle.reservationId,
          opportunityId: bundle.opportunityId,
          executionAttemptId: bundle.executionAttemptId,
          assignmentId: assignment.routinePrescriptionHandoffId,
        })) ?? []
      : []);
  const eventGroups = new Map<string, ProductionPlannedSourceExposureLedgerEntry[]>();
  for (const entry of ledger) eventGroups.set(entry.sourceExposureEventId, [
    ...(eventGroups.get(entry.sourceExposureEventId) ?? []), entry,
  ]);
  const duplicateEventCount = [...eventGroups.values()]
    .reduce((count, events) => count + Math.max(0, events.length - 1), 0);
  const crossSessionEventCollisionCount = [...eventGroups.values()]
    .filter((events) => new Set(events.map((event) => event.reservationId)).size > 1).length;
  const observedAssignments = new Set(ledger.map((entry) => `${entry.reservationId}:${entry.assignmentId}`));
  const missingEventCount = expectedAssignments.filter((entry) =>
    !observedAssignments.has(`${entry.reservationId}:${entry.assignmentId}`)).length;
  let orphanEventCount = 0;
  let stalePrescriptionRevisionCount = 0;
  let staleSequenceRevisionCount = 0;
  let wrongReservationCount = 0;
  let wrongOpportunityCount = 0;
  let wrongExecutionAttemptCount = 0;
  const reservationById = new Map(input.weekSource.reservations.map((reservation) => [reservation.reservationId, reservation]));
  const bundleByReservation = new Map(input.sessionBundles.map((bundle) => [bundle.reservationId, bundle]));
  for (const bundle of input.sessionBundles) {
    const represented = new Set(ledger.filter((entry) => entry.reservationId === bundle.reservationId)
      .map((entry) => entry.sourceExposureEventId));
    orphanEventCount += (bundle.prescriptionCompilation?.sourceExposureEvents ?? [])
      .filter((event) => !represented.has(event.sourceExposureEventId) &&
        bundle.expectedArtifactState === "expected" && activeReservations.has(bundle.reservationId)).length;
    const sequencePlan = bundle.sequencingResult?.plan;
    if (sequencePlan && sequencePlan.revisionLedger.finalRevisionId !== sequencePlan.sequenceRevisionId) {
      staleSequenceRevisionCount += 1;
    }
  }
  for (const entry of ledger) {
    const bundle = bundleByReservation.get(entry.reservationId);
    const reservation = reservationById.get(entry.reservationId);
    const prescription = bundle?.prescriptionCompilation?.plans.find((plan) => plan.prescriptionId === entry.prescriptionId);
    if (!prescription || prescription.prescriptionRevisionId !== entry.finalPrescriptionRevisionId ||
        prescription.revisionLedger.finalRevisionId !== entry.finalPrescriptionRevisionId) {
      stalePrescriptionRevisionCount += 1;
    }
    if (!reservation || bundle?.reservationId !== entry.reservationId) wrongReservationCount += 1;
    if (reservation?.opportunityId !== entry.opportunityId || bundle?.opportunityId !== entry.opportunityId) {
      wrongOpportunityCount += 1;
    }
    if (bundle?.executionAttemptId !== entry.executionAttemptId) wrongExecutionAttemptCount += 1;
  }
  const reasonCodes = [
    duplicateEventCount > 0 ? "DUPLICATE_SOURCE_EVENT" : null,
    missingEventCount > 0 ? "MISSING_SOURCE_EVENT" : null,
    orphanEventCount > 0 ? "ORPHAN_SOURCE_EVENT" : null,
    crossSessionEventCollisionCount > 0 ? "CROSS_SESSION_EVENT_COLLISION" : null,
    stalePrescriptionRevisionCount > 0 ? "STALE_PRESCRIPTION_REVISION" : null,
    staleSequenceRevisionCount > 0 ? "STALE_SEQUENCE_REVISION" : null,
    wrongReservationCount > 0 ? "WRONG_RESERVATION_MAPPING" : null,
    wrongOpportunityCount > 0 ? "WRONG_OPPORTUNITY_MAPPING" : null,
    wrongExecutionAttemptCount > 0 ? "WRONG_EXECUTION_ATTEMPT_MAPPING" : null,
  ].filter((value): value is string => value !== null);
  return {
    expectedEventCount: expectedAssignments.length,
    observedEventCount: ledger.length,
    uniqueEventCount: eventGroups.size,
    duplicateEventCount,
    missingEventCount,
    orphanEventCount,
    crossSessionEventCollisionCount,
    stalePrescriptionRevisionCount,
    staleSequenceRevisionCount,
    wrongReservationCount,
    wrongOpportunityCount,
    wrongExecutionAttemptCount,
    reasonCodes,
  };
}

function intersects<T>(left: readonly T[], right: readonly T[]): boolean {
  return left.some((value) => right.includes(value));
}

function eventQualification(
  objective: ProductionWeekObjectiveSnapshot,
  event: ProductionPlannedSourceExposureLedgerEntry,
): { readonly qualifies: boolean; readonly reasons: readonly string[]; readonly evidence: readonly string[] } {
  if (!event.weeklyObjectiveIds.includes(objective.objectiveId)) {
    return { qualifies: false, reasons: ["WEEK_OBJECTIVE_SOURCE_TRACE_INCOMPLETE"], evidence: [] };
  }
  const developmental = event.blockPurposeViews.some((block) => block.developmentalCreditEligible);
  const technique = event.blockPurposeViews.some((block) =>
    block.contributionClassification === "technique_quality_observation_only");
  const recovery = event.blockPurposeViews.some((block) =>
    block.contributionClassification === "recovery_observation_only");
  const movement = intersects(event.movementActionCapacityView.movementRoles, objective.target.targetMovementRoles);
  const action = intersects(event.movementActionCapacityView.actionFunctions, objective.target.targetActionFunctions);
  const muscleViews = event.muscleRelationshipViews.filter((view) => objective.target.targetMuscles.includes(view.muscle));
  const primary = muscleViews.some((view) => view.relationship === "primary_target");
  const keySecondary = muscleViews.some((view) => view.relationship === "key_secondary_target");
  if (objective.purpose === "movement_development") {
    const qualifies = developmental && movement && ["primary_strength", "secondary_strength", "capacity"].includes(event.role);
    return { qualifies, reasons: qualifies ? [] : [developmental ? "MOVEMENT_RELATIONSHIP_INCOMPATIBLE" : "DEVELOPMENTAL_BLOCK_REQUIRED"], evidence: movement ? event.movementActionCapacityView.movementRoles : [] };
  }
  if (objective.purpose === "muscle_development") {
    const relationship = primary || keySecondary && objective.target.muscleRequirement !== "primary_required";
    const qualifies = developmental && relationship && ["primary_strength", "secondary_strength", "hypertrophy_accessory"].includes(event.role);
    return { qualifies, reasons: qualifies ? [] : [developmental ? "MUSCLE_RELATIONSHIP_INCOMPATIBLE" : "DEVELOPMENTAL_BLOCK_REQUIRED"], evidence: muscleViews.map((view) => `${view.muscle}:${view.relationship}`) };
  }
  if (objective.purpose === "direct_action_development") {
    const qualifies = developmental && (action || primary);
    return { qualifies, reasons: qualifies ? [] : [developmental ? "DIRECT_REQUIRES_EXACT_ACTION_OR_PRIMARY_TARGET" : "DEVELOPMENTAL_BLOCK_REQUIRED"], evidence: [...event.movementActionCapacityView.actionFunctions, ...muscleViews.map((view) => `${view.muscle}:${view.relationship}`)] };
  }
  if (objective.purpose === "assessment_priority_development") {
    const qualifies = technique || event.movementActionCapacityView.assessmentLane === "preparation_control" ||
      event.movementActionCapacityView.assessmentLane === "reviewed_assessment_development";
    return { qualifies, reasons: qualifies ? [] : ["ASSESSMENT_REALIZATION_REQUIRED"], evidence: [event.movementActionCapacityView.assessmentLane] };
  }
  if (objective.purpose === "capacity_development") {
    const qualifies = developmental && event.role === "capacity" && event.movementActionCapacityView.capacityLane !== "none";
    return { qualifies, reasons: qualifies ? [] : ["CAPACITY_RELATIONSHIP_INCOMPATIBLE"], evidence: [event.movementActionCapacityView.capacityLane] };
  }
  if (objective.purpose === "recovery_support") {
    const qualifies = recovery && event.role === "recovery";
    return { qualifies, reasons: qualifies ? [] : ["RECOVERY_SUPPORT_EXPLICIT_ONLY"], evidence: [event.movementActionCapacityView.recoveryLane] };
  }
  return { qualifies: false, reasons: ["UNSUPPORTED_OBJECTIVE_SCOPE"], evidence: [] };
}

function thresholdState(value: number, threshold: number): ProductionObjectiveThresholdState {
  return value < threshold ? "below" : value === threshold ? "met" : "above";
}

function executionRequirementReasons(
  objective: ProductionWeekObjectiveSnapshot,
  qualifyingEvents: readonly ProductionPlannedSourceExposureLedgerEntry[],
): readonly string[] {
  const requirements = objective.executionRequirements;
  if (!requirements) return [];
  const reasons: string[] = [];
  const developmental = qualifyingEvents.some((event) => event.blockPurposeViews.some((block) =>
    block.developmentalCreditEligible));
  if (requirements.developmentalCreditRequired && !developmental) {
    reasons.push("WEEKLY_EXECUTION_DEVELOPMENTAL_CREDIT_REQUIRED");
  }
  const purposeMatches = requirements.requiredPrescriptionPurpose === "strength_development" ?
    objective.purpose === "movement_development" && qualifyingEvents.some((event) =>
      ["primary_strength", "secondary_strength"].includes(event.role)) :
    requirements.requiredPrescriptionPurpose === "hypertrophy_development" ?
      objective.purpose === "muscle_development" :
      requirements.requiredPrescriptionPurpose === "direct_development" ?
        objective.purpose === "direct_action_development" :
        requirements.requiredPrescriptionPurpose === "capacity_development" ?
          objective.purpose === "capacity_development" && qualifyingEvents.some((event) => event.role === "capacity") :
          objective.purpose === "assessment_priority_development";
  if (!purposeMatches) reasons.push("WEEKLY_EXECUTION_REQUIRED_PRESCRIPTION_PURPOSE_MISSING");
  if (requirements.loadingSuitabilityRequired &&
      ["unresolved", "insufficient"].includes(requirements.loadingCompletenessState)) {
    reasons.push(`WEEKLY_EXECUTION_LOADING_${requirements.loadingCompletenessState.toUpperCase()}`);
  }
  return sortedUnique(reasons);
}

function buildObjectiveTraces(input: {
  readonly source: PrescribedWeekSourceSnapshot;
  readonly ledger: readonly ProductionPlannedSourceExposureLedgerEntry[];
  readonly sessions: readonly ProductionSessionAdmissibilityTrace[];
  readonly policy: ProductionPostPrescriptionWeekValidationPolicy | null;
  readonly policyStatus: "resolved" | "required" | "unavailable" | "conflict";
}): readonly ProductionWeeklyObjectivePrescribedRealizationTrace[] {
  const sessionByReservation = new Map(input.sessions.map((session) => [session.reservationId, session]));
  return [...input.source.objectives]
    .sort((left, right) => left.priorityOrder - right.priorityOrder || left.objectiveId.localeCompare(right.objectiveId))
    .map((objective) => {
      const allocatedReservationIds = input.source.reservations
        .filter((reservation) => reservation.allocatedObjectiveIds.includes(objective.objectiveId))
        .map((reservation) => reservation.reservationId);
      const objectiveEvents = input.ledger.filter((event) => event.weeklyObjectiveIds.includes(objective.objectiveId));
      const qualifications = objectiveEvents.map((event) => ({ event, ...eventQualification(objective, event) }));
      const qualifying = qualifications.filter((entry) => entry.qualifies);
      const prescribedReservationIds = sortedUnique(qualifying.map((entry) => entry.event.reservationId));
      const executableReservationIds = prescribedReservationIds.filter((id) =>
        sessionByReservation.get(id)?.executableMinimumEligible);
      const pendingReservationIds = prescribedReservationIds.filter((id) =>
        sessionByReservation.get(id)?.pendingFeasibilityEligible);
      const nonexecutiveReservationIds = allocatedReservationIds.filter((id) =>
        !sessionByReservation.get(id)?.executableMinimumEligible && !sessionByReservation.get(id)?.pendingFeasibilityEligible);
      const rule = input.policy?.frequencyRules.find((entry) => entry.purpose === objective.purpose);
      const thresholds = rule ? frequencyRuleForPriority(rule, objective.priority) : null;
      const executionReasons = executionRequirementReasons(objective, qualifying.map((entry) => entry.event));
      let status: ProductionObjectivePrescribedRealizationStatus;
      if (input.policyStatus === "conflict") status = "weekly_policy_conflict";
      else if (!input.policy || input.policyStatus !== "resolved") status = "weekly_policy_required";
      else if (!input.policy.supportedPurposes.some((purpose) => purpose === objective.purpose)) status = "unsupported_objective_scope";
      else if (qualifying.length === 0 && objectiveEvents.length > 0) status = "prescribed_realization_incompatible";
      else if (qualifying.length === 0 && allocatedReservationIds.length > 0) {
        status = nonexecutiveReservationIds.some((id) => ["incomplete_sequencing", "search_inconclusive"]
          .includes(sessionByReservation.get(id)?.status ?? ""))
          ? "prescription_present_sequence_missing" : "allocation_present_prescription_missing";
      } else if (qualifying.length === 0) status = objective.priority === "optional" ? "optional_not_prescribed" : "prescribed_realization_missing";
      else if (pendingReservationIds.length > 0 && executableReservationIds.length === 0) status = "prescribed_realization_present_duration_pending";
      else if (thresholds && executableReservationIds.length > thresholds[2]) status = "prescribed_above_soft_maximum_review";
      else if (thresholds && executableReservationIds.length >= thresholds[1]) status = "prescribed_target_opportunities_met";
      else if (thresholds && executableReservationIds.length >= thresholds[0]) status = "prescribed_minimum_opportunities_met";
      else status = "prescribed_below_minimum_unresolved";
      return {
        objectiveId: objective.objectiveId,
        purpose: objective.purpose,
        target: objective.target,
        priority: objective.priority,
        priorityOrder: objective.priorityOrder,
        policyRef: input.policy ? { policyId: input.policy.policyId, version: input.policy.version } : null,
        allocatedReservationIds,
        prescribedQualifyingReservationIds: prescribedReservationIds,
        executableQualifyingReservationIds: executableReservationIds,
        pendingDurationReservationIds: pendingReservationIds,
        nonexecutiveReservationIds,
        qualifyingEventIds: sortedUnique(qualifying.map((entry) => entry.event.sourceExposureEventId)),
        nonqualifyingEvents: qualifications.filter((entry) => !entry.qualifies)
          .map((entry) => ({ eventId: entry.event.sourceExposureEventId, reasonCodes: entry.reasons })),
        qualifyingBlockIds: sortedUnique(qualifying.flatMap((entry) => entry.event.blockPurposeViews
          .filter((block) => block.developmentalCreditEligible ||
            ["assessment_priority_development", "recovery_support"].includes(objective.purpose))
          .map((block) => block.blockId))),
        relationshipEvidence: sortedUnique(qualifications.flatMap((entry) => entry.evidence)),
        allocatedOpportunityCount: allocatedReservationIds.length,
        prescribedFrequencyCount: prescribedReservationIds.length,
        executablePrescribedFrequencyCount: executableReservationIds.length,
        pendingFeasibilityOpportunityCount: pendingReservationIds.length,
        minimumState: thresholds ? thresholdState(executableReservationIds.length, thresholds[0]) : "not_applicable",
        targetState: thresholds ? thresholdState(executableReservationIds.length, thresholds[1]) : "not_applicable",
        softMaximumState: thresholds ? thresholdState(executableReservationIds.length, thresholds[2]) : "not_applicable",
        dosePolicyState: objective.dosePolicyState,
        spacingState: "spacing_policy_not_defined",
        executionRequirements: objective.executionRequirements ?? null,
        executionRequirementsSatisfied: executionReasons.length === 0,
        executionRequirementReasonCodes: executionReasons,
        loadingCompletenessState: objective.executionRequirements?.loadingCompletenessState ?? "not_applicable",
        status,
        unresolvedRefs: [
          ...(status === "unsupported_objective_scope" ? ["UNSUPPORTED_OBJECTIVE_SCOPE"] : []),
          ...(objective.dosePolicyState === "prescribed_dose_target_not_defined" ? ["INSUFFICIENT_FOR_NUMERIC_VALIDATION"] : []),
          ...executionReasons,
          ...(objective.executionRequirements?.unresolvedCapabilityRefs ?? []),
        ],
        provenance: [...objective.sourceEvidenceRefs],
      };
    });
}

function buildBurdenVectors(
  input: ProductionPostPrescriptionWeekValidationInput,
  ledger: readonly ProductionPlannedSourceExposureLedgerEntry[],
): readonly ProductionPlannedBurdenVector[] {
  const exerciseById = new Map(input.exerciseRegistry.map((exercise) => [exercise.id, exercise]));
  return input.weekSource.reservations.map((reservation) => {
    const events = ledger.filter((event) => event.reservationId === reservation.reservationId);
    const pairs = events.flatMap((event) => {
      const exercise = exerciseById.get(event.exerciseId);
      return exercise ? [{ event, exercise }] : [];
    });
    const stressCounts = new Map<string, number>();
    for (const stress of events.flatMap((event) => event.stressExposureViews)) {
      stressCounts.set(stress.stressTag, (stressCounts.get(stress.stressTag) ?? 0) + 1);
    }
    return {
      reservationId: reservation.reservationId,
      localFatigue: pairs.map(({ event, exercise }) => `${event.sourceExposureEventId}:${exercise.loading.localFatigue}`),
      systemicFatigue: pairs.map(({ event, exercise }) => `${event.sourceExposureEventId}:${exercise.loading.systemicFatigue}`),
      axialLoading: pairs.map(({ event, exercise }) => `${event.sourceExposureEventId}:${exercise.loading.axialLoading}`),
      gripLoading: pairs.filter(({ event }) => event.movementActionCapacityView.capacityLane === "loaded_carry")
        .map(({ event }) => `${event.sourceExposureEventId}:planned_potential`),
      trunkBracing: pairs.filter(({ event }) => event.role === "capacity" || event.section === "main")
        .map(({ event }) => `${event.sourceExposureEventId}:planned_potential`),
      repeatedStressTags: [...stressCounts.entries()].filter(([, count]) => count > 1).map(([tag]) => tag) as ProductionPlannedBurdenVector["repeatedStressTags"],
      developmentalBlockCount: events.flatMap((event) => event.blockPurposeViews).filter((block) => block.developmentalCreditEligible).length,
      preparatoryBlockCount: events.flatMap((event) => event.blockPurposeViews)
        .filter((block) => block.contributionClassification === "not_weekly_developmental_credit").length,
      knownTimedExposureSeconds: events.reduce((sum, event) => sum + event.durationInterval.knownLowerBoundSeconds, 0),
      unknownDurationComponents: sortedUnique(events.flatMap((event) => event.durationInterval.unknownComponents)),
      highEffortEventCount: events.filter((event) => event.doseLanes.some((lane) => {
        const effort = lane.dose.effort;
        return effort?.kind === "rir" && effort.target.kind === "range" &&
          typeof effort.target.max === "number" && effort.target.max <= 3;
      })).length,
      observedRecoveryCost: null,
      aggregateScore: null,
    };
  });
}

function buildConcentrationTraces(
  ledger: readonly ProductionPlannedSourceExposureLedgerEntry[],
  burden: readonly ProductionPlannedBurdenVector[],
): readonly ProductionPlannedConcentrationTrace[] {
  const traces: ProductionPlannedConcentrationTrace[] = [];
  for (const vector of burden) {
    const events = ledger.filter((event) => event.reservationId === vector.reservationId);
    const objectives = events.flatMap((event) => event.weeklyObjectiveIds);
    const base = { reservationIds: [vector.reservationId], sourceExposureEventIds: events.map((event) => event.sourceExposureEventId), observationOnly: true as const, hardLimitPolicyRef: null };
    if (new Set(objectives).size < objectives.length) traces.push({ kind: "repeated_objective_in_one_session", ...base });
    if (vector.repeatedStressTags.length > 0) traces.push({ kind: "repeated_joint_stress_tag", ...base });
    if (vector.gripLoading.length > 1) traces.push({ kind: "grip_loading_concentration", ...base });
    if (vector.axialLoading.filter((value) => value.endsWith(":high")).length > 1) traces.push({ kind: "axial_loading_concentration", ...base });
    if (vector.trunkBracing.length > 2) traces.push({ kind: "trunk_bracing_concentration", ...base });
    if (vector.highEffortEventCount > 2) traces.push({ kind: "several_high_effort_developmental_events", ...base });
    if (vector.preparatoryBlockCount > 2) traces.push({ kind: "supporting_work_accumulation", ...base });
    const primary = events.flatMap((event) => event.muscleRelationshipViews.filter((view) => view.relationship === "primary_target").map((view) => view.muscle));
    if (new Set(primary).size < primary.length) traces.push({ kind: "repeated_muscle_primary_target", ...base });
    const secondary = events.flatMap((event) => event.muscleRelationshipViews.filter((view) => view.relationship === "key_secondary_target").map((view) => view.muscle));
    if (new Set(secondary).size < secondary.length) traces.push({ kind: "repeated_key_secondary", ...base });
  }
  return traces;
}

function buildAssessmentPreparationTrace(
  source: PrescribedWeekSourceSnapshot,
  ledger: readonly ProductionPlannedSourceExposureLedgerEntry[],
): ProductionWeeklyAssessmentPreparationTrace {
  const objectivePurpose = new Map(source.objectives.map((objective) => [objective.objectiveId, objective.purpose]));
  const supporting = ledger.filter((event) => ["preparation", "activation"].includes(event.role));
  const eventGroups = new Map<string, ProductionPlannedSourceExposureLedgerEntry[]>();
  for (const event of supporting) eventGroups.set(event.sourceExposureEventId, [
    ...(eventGroups.get(event.sourceExposureEventId) ?? []), event,
  ]);
  const supportingByReservation = new Map<string, ProductionPlannedSourceExposureLedgerEntry[]>();
  for (const event of supporting) supportingByReservation.set(event.reservationId, [
    ...(supportingByReservation.get(event.reservationId) ?? []), event,
  ]);
  return {
    preparationEventIds: supporting.filter((event) => event.role === "preparation")
      .map((event) => event.sourceExposureEventId),
    activationEventIds: supporting.filter((event) => event.role === "activation")
      .map((event) => event.sourceExposureEventId),
    dependencyDrivenRecurrenceEventIds: supporting.filter((event) => event.satisfiedSessionNeedIds.length > 0)
      .map((event) => event.sourceExposureEventId),
    assessmentObjectiveRecurrenceEventIds: supporting.filter((event) => event.weeklyObjectiveIds.some((objectiveId) =>
      objectivePurpose.get(objectiveId) === "assessment_priority_development"))
      .map((event) => event.sourceExposureEventId),
    sharedDependencyCoverageEventIds: supporting.filter((event) =>
      event.satisfiedSessionNeedIds.length > 1 || event.weeklyObjectiveIds.length > 1)
      .map((event) => event.sourceExposureEventId),
    genericSupportingEventIds: supporting.filter((event) =>
      event.satisfiedSessionNeedIds.length === 0 && event.weeklyObjectiveIds.length === 0)
      .map((event) => event.sourceExposureEventId),
    developmentalMiscreditEventIds: supporting.filter((event) => event.blockPurposeViews.some((block) =>
      block.developmentalCreditEligible)).map((event) => event.sourceExposureEventId),
    duplicateSupportingEventIds: [...eventGroups.entries()].filter(([, events]) => events.length > 1)
      .map(([eventId]) => eventId),
    supportingWorkConcentrationReservationIds: [...supportingByReservation.entries()]
      .filter(([, events]) => events.length > 2).map(([reservationId]) => reservationId),
    validatorCreatedSupportingAssignmentCount: 0,
  };
}

function buildRecoveryViews(
  ledger: readonly ProductionPlannedSourceExposureLedgerEntry[],
): readonly ProductionPlannedRecoverySupportView[] {
  return ledger.filter((event) => event.movementActionCapacityView.recoveryLane === "prescribed_recovery_support")
    .map((event) => ({
      sourceExposureEventId: event.sourceExposureEventId,
      reservationId: event.reservationId,
      exerciseId: event.exerciseId,
      objectiveIds: event.weeklyObjectiveIds,
      blockIds: event.blockPurposeViews.filter((block) =>
        block.contributionClassification === "recovery_observation_only").map((block) => block.blockId),
      observation: "PRESCRIBED_RECOVERY_SUPPORT_OBSERVATION" as const,
      recoveredStateClaimed: false as const,
    }));
}

function buildWeeklyDuration(
  input: ProductionPostPrescriptionWeekValidationInput,
  sessions: readonly ProductionSessionAdmissibilityTrace[],
): ProductionWeeklyDurationView {
  const durations = input.sessionBundles.flatMap((bundle) => bundle.sequencingResult?.plan
    ? [{ reservationId: bundle.reservationId, duration: bundle.sequencingResult.plan.duration }]
    : []);
  const activeReservationCount = input.weekSource.reservations.filter((reservation) => reservation.invalidationState === "active").length;
  const allUpperKnown = durations.length === activeReservationCount && durations.every((entry) => entry.duration.knownUpperBoundSeconds !== null);
  return {
    knownLowerBoundSeconds: durations.reduce((sum, entry) => sum + entry.duration.knownLowerBoundSeconds, 0),
    knownUpperBoundSeconds: allUpperKnown
      ? durations.reduce((sum, entry) => sum + (entry.duration.knownUpperBoundSeconds ?? 0), 0)
      : null,
    unknownSessionIds: sessions.filter((session) => ["prescribed_duration_unresolved", "possibly_over_budget",
      "missing_session_artifact", "incomplete_prescription", "incomplete_sequencing", "search_inconclusive"]
      .includes(session.status)).map((session) => session.reservationId),
    definitelyOverBudgetReservationIds: sessions.filter((session) => session.status === "definitely_over_budget").map((session) => session.reservationId),
    possiblyOverBudgetReservationIds: sessions.filter((session) => session.status === "possibly_over_budget").map((session) => session.reservationId),
    totalDurationKnown: allUpperKnown,
    physiologicalDoseMetric: false,
  };
}

function timestamp(value: string | null): number | null {
  if (!value || !value.includes("T")) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildSpacingTraces(
  source: PrescribedWeekSourceSnapshot,
  objectives: readonly ProductionWeeklyObjectivePrescribedRealizationTrace[],
): readonly ProductionPlannedSpacingTrace[] {
  const reservationById = new Map(source.reservations.map((reservation) => [reservation.reservationId, reservation]));
  const opportunityById = new Map(source.opportunities.map((opportunity) => [opportunity.opportunityId, opportunity]));
  const traces: ProductionPlannedSpacingTrace[] = [];
  for (const objective of objectives) {
    const reservations = objective.prescribedQualifyingReservationIds
      .flatMap((id) => reservationById.get(id) ? [reservationById.get(id)!] : [])
      .sort((left, right) => (opportunityById.get(left.opportunityId)?.order ?? 0) -
        (opportunityById.get(right.opportunityId)?.order ?? 0));
    for (let index = 1; index < reservations.length; index += 1) {
      const earlier = reservations[index - 1];
      const later = reservations[index];
      const earlierOpportunity = opportunityById.get(earlier.opportunityId);
      const laterOpportunity = opportunityById.get(later.opportunityId);
      const earlierTime = timestamp(earlierOpportunity?.calendarDateTime ?? null);
      const laterTime = timestamp(laterOpportunity?.calendarDateTime ?? null);
      const elapsedMinutes = earlierTime !== null && laterTime !== null ? (laterTime - earlierTime) / 60_000 : null;
      const result: ProductionPostPrescriptionWeekSpacingResult = "spacing_policy_not_defined";
      traces.push({
        objectiveId: objective.objectiveId,
        earlierReservationId: earlier.reservationId,
        laterReservationId: later.reservationId,
        elapsedMinutes,
        elapsedTimeKnown: elapsedMinutes !== null,
        orderedOpportunityGap: (laterOpportunity?.order ?? 0) - (earlierOpportunity?.order ?? 0),
        prescribedBurdenKnown: true,
        responseEvidenceAvailable: false,
        applicableSpacingPolicy: "SPACING_R0_PRESCRIPTION_PENDING",
        result,
      });
    }
  }
  return traces;
}

function completeStatus(input: {
  readonly inputReasons: readonly string[];
  readonly policyStatus: "resolved" | "required" | "unavailable" | "conflict";
  readonly sessions: readonly ProductionSessionAdmissibilityTrace[];
  readonly integrity: ProductionSourceEventIntegrityTrace;
  readonly objectives: readonly ProductionWeeklyObjectivePrescribedRealizationTrace[];
}): ProductionPlannedPrescribedWeekArgumentStatus {
  if (input.policyStatus === "required" || input.policyStatus === "unavailable") return "weekly_policy_required";
  if (input.policyStatus === "conflict") return "weekly_policy_conflict";
  if (input.inputReasons.length > 0 || input.sessions.some((session) => session.status === "invalid_identity_chain") ||
      input.integrity.reasonCodes.length > 0) return "invalid_source_exposure_ledger";
  if (input.sessions.some((session) => session.status === "missing_session_artifact")) return "incomplete_due_to_missing_session_artifact";
  if (input.sessions.some((session) => session.status === "blocked_by_training_readiness")) return "blocked_by_training_readiness";
  if (input.sessions.some((session) => session.status === "incomplete_prescription")) return "incomplete_due_to_prescription";
  if (input.sessions.some((session) => ["incomplete_sequencing", "search_inconclusive"].includes(session.status))) return "incomplete_due_to_sequencing";
  if (input.objectives.some((objective) => objective.status === "unsupported_objective_scope")) return "unsupported_policy_scope";
  if (input.objectives.some((objective) => objective.priority === "required" && [
    "prescribed_realization_missing", "prescribed_below_minimum_unresolved", "allocation_present_prescription_missing",
    "prescription_present_sequence_missing", "prescribed_realization_incompatible",
  ].includes(objective.status))) return "required_prescribed_realization_missing";
  if (input.sessions.some((session) => session.status === "definitely_over_budget")) return "week_reallocation_review_required";
  if (input.sessions.some((session) => ["prescribed_duration_unresolved", "possibly_over_budget"].includes(session.status))) {
    return "coherent_with_execution_feasibility_pending";
  }
  if (input.objectives.some((objective) => objective.dosePolicyState === "prescribed_dose_target_not_defined")) {
    return "coherent_with_unresolved_dose_sufficiency";
  }
  return "coherent_within_supported_scope";
}

function gateFailures(input: {
  readonly inputReasons: readonly string[];
  readonly policyStatus: "resolved" | "required" | "unavailable" | "conflict";
  readonly extraBundleCount: number;
  readonly sessions: readonly ProductionSessionAdmissibilityTrace[];
  readonly integrity: ProductionSourceEventIntegrityTrace;
  readonly ledger: readonly ProductionPlannedSourceExposureLedgerEntry[];
  readonly objectives: readonly ProductionWeeklyObjectivePrescribedRealizationTrace[];
  readonly completeStatus: ProductionPlannedPrescribedWeekArgumentStatus;
  readonly derivedReasons: Readonly<Record<ProductionPostPrescriptionWeekGate13Subgate, readonly string[]>>;
}): Readonly<Record<ProductionPostPrescriptionWeekGate13Subgate, readonly string[]>> {
  const incomplete = input.sessions.filter((session) => ["missing_session_artifact", "incomplete_prescription",
    "incomplete_sequencing", "search_inconclusive", "invalid_identity_chain"].includes(session.status));
  const unknownBlocks = input.ledger.flatMap((event) => event.blockPurposeViews)
    .filter((block) => block.contributionClassification === "unknown_requires_review");
  const mappingFailures = input.objectives.filter((objective) => ["source_trace_incomplete", "prescribed_realization_incompatible"]
    .includes(objective.status));
  const frequencyFailures = input.objectives.filter((objective) => objective.priority === "required" && [
    "prescribed_realization_missing", "prescribed_below_minimum_unresolved", "allocation_present_prescription_missing",
    "prescription_present_sequence_missing", "definitely_over_budget_requires_week_review",
  ].includes(objective.status));
  return {
    "13.0_week_input_truth": [
      ...input.inputReasons,
      ...(input.policyStatus !== "resolved" ? [`POLICY_${input.policyStatus.toUpperCase()}`] : []),
      ...input.derivedReasons["13.0_week_input_truth"],
    ],
    "13.1_session_completeness": [
      ...(incomplete.length > 0 ? ["SESSION_ARTIFACT_INCOMPLETE"] : []),
      ...(input.extraBundleCount > 0 ? ["EXTRA_SESSION_ARTIFACT"] : []),
      ...input.derivedReasons["13.1_session_completeness"],
    ],
    "13.2_source_event_integrity": [...input.integrity.reasonCodes, ...input.derivedReasons["13.2_source_event_integrity"]],
    "13.3_block_contribution_truth": [
      ...(unknownBlocks.length > 0 ? ["UNKNOWN_BLOCK_CONTRIBUTION_REQUIRES_REVIEW"] : []),
      ...input.derivedReasons["13.3_block_contribution_truth"],
    ],
    "13.4_weekly_objective_mapping": [
      ...(mappingFailures.length > 0 ? ["WEEK_OBJECTIVE_SOURCE_TRACE_INCOMPLETE"] : []),
      ...input.derivedReasons["13.4_weekly_objective_mapping"],
    ],
    "13.5_prescribed_frequency_distribution": [
      ...(frequencyFailures.length > 0 ? ["REQUIRED_PRESCRIBED_REALIZATION_MISSING"] : []),
      ...input.derivedReasons["13.5_prescribed_frequency_distribution"],
    ],
    "13.6_dose_lane_truth": input.derivedReasons["13.6_dose_lane_truth"],
    "13.7_stress_concentration_duration": input.derivedReasons["13.7_stress_concentration_duration"],
    "13.8_spacing_truth": input.derivedReasons["13.8_spacing_truth"],
    "13.9_complete_prescribed_week_argument": [
      ...(!["coherent_within_supported_scope", "coherent_with_unresolved_dose_sufficiency",
        "coherent_with_execution_feasibility_pending", "unsupported_policy_scope"]
        .includes(input.completeStatus) ? [`COMPLETE_WEEK_ARGUMENT:${input.completeStatus}`] : []),
      ...input.derivedReasons["13.9_complete_prescribed_week_argument"],
    ],
  };
}

function buildGate13Trace(
  failures: ReturnType<typeof gateFailures>,
  upstreamGateState: "PASS" | "FAIL_STOP",
): readonly ProductionPostPrescriptionWeekGate13Trace[] {
  if (upstreamGateState === "FAIL_STOP") return PRODUCTION_POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES.map((subgate) => ({
    subgate,
    state: "SHADOW_DIAGNOSTIC_ONLY",
    scored: false,
    reasonCodes: ["UPSTREAM_GATE_FAILURE_NO_RESCUE", ...failures[subgate]],
  }));
  let stopped = false;
  return PRODUCTION_POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES.map((subgate) => {
    const reasonCodes = failures[subgate];
    if (stopped) return { subgate, state: "SHADOW_DIAGNOSTIC_ONLY", scored: false, reasonCodes };
    if (reasonCodes.length > 0) {
      stopped = true;
      return { subgate, state: "FAIL_STOP", scored: true, reasonCodes };
    }
    return { subgate, state: "PASS", scored: true, reasonCodes: [`${subgate.toUpperCase()}:PASS`] };
  });
}

function resultStatus(input: {
  readonly inputReasons: readonly string[];
  readonly policyStatus: "resolved" | "required" | "unavailable" | "conflict";
  readonly revisionValid: boolean;
  readonly completeStatus: ProductionPlannedPrescribedWeekArgumentStatus;
}): ProductionPostPrescriptionWeekValidationStatus {
  if (input.inputReasons.includes("UNSUPPORTED_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_VERSION")) return "unsupported_validator_contract_version";
  if (input.inputReasons.includes("UNSUPPORTED_PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_VERSION")) return "source_contract_unavailable";
  if (input.inputReasons.includes("PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REQUIRED")) return "source_contract_required";
  if (input.inputReasons.includes("UNSUPPORTED_PRESCRIPTION_CONTRACT_VERSION")) return "unsupported_prescription_contract_version";
  if (input.inputReasons.includes("UNSUPPORTED_SEQUENCING_CONTRACT_VERSION")) return "unsupported_sequencing_contract_version";
  if (input.policyStatus === "required" || input.policyStatus === "unavailable") return "weekly_policy_required";
  if (input.policyStatus === "conflict") return "weekly_policy_conflict";
  if (!input.revisionValid) return "invalid_validation_revision_context";
  if (input.inputReasons.length > 0) return "invalid_source_contract";
  if (input.completeStatus === "coherent_within_supported_scope") return "validated_supported_scope";
  if (input.completeStatus === "coherent_with_unresolved_dose_sufficiency") return "validated_with_unresolved_dose_sufficiency";
  if (input.completeStatus === "coherent_with_execution_feasibility_pending") return "validated_with_execution_feasibility_pending";
  if (input.completeStatus === "blocked_by_training_readiness") return "blocked_by_training_readiness";
  if (input.completeStatus === "incomplete_due_to_missing_session_artifact") return "incomplete_due_to_missing_session_artifact";
  if (input.completeStatus === "incomplete_due_to_prescription") return "incomplete_due_to_prescription";
  if (input.completeStatus === "incomplete_due_to_sequencing") return "incomplete_due_to_sequencing";
  if (input.completeStatus === "invalid_source_exposure_ledger") return "invalid_source_exposure_ledger";
  if (input.completeStatus === "invalid_objective_mapping") return "invalid_objective_mapping";
  if (input.completeStatus === "required_prescribed_realization_missing") return "required_prescribed_realization_missing";
  if (input.completeStatus === "week_reallocation_review_required") return "week_reallocation_review_required";
  if (input.completeStatus === "unsupported_policy_scope") return "unsupported_objective_scope";
  return "invalid_source_contract";
}

function inputAuthority(source: PrescribedWeekSourceSnapshot): readonly ProductionPostPrescriptionWeekInputAuthorityTrace[] {
  return Object.freeze([
    { field: "weekSource", authority: source.sourceAuthority, owner: "Production Prescribed Week Source", reasonCode: source.sourceAuthority === "COMPATIBILITY_ADAPTER" ? "DESIGN_SOURCE_COMPATIBILITY_ADAPTED" : "PRODUCTION_SOURCE_CONTRACT" },
    { field: "sessionIntent", authority: "PRODUCTION_PLANNER_AUTHORITY", owner: "Session Intent Planner", reasonCode: "PRODUCTION_CONTRACT" },
    { field: "sessionSkeleton", authority: "PRODUCTION_COMPOSER_AUTHORITY", owner: "Session Composer", reasonCode: "PRODUCTION_CONTRACT" },
    { field: "prescriptionCompilation", authority: "PRODUCTION_PRESCRIPTION_AUTHORITY", owner: "Prescription Compiler", reasonCode: "PRODUCTION_KERNEL_AUTHORITY" },
    { field: "sequencingResult", authority: "PRODUCTION_SEQUENCING_AUTHORITY", owner: "Final Session Sequencing", reasonCode: "PRODUCTION_KERNEL_AUTHORITY" },
    { field: "validationPolicy", authority: "EXPLICIT_VALIDATION_POLICY", owner: "Post-Prescription Week Validation", reasonCode: "EXPLICIT_INJECTION_REQUIRED" },
    { field: "performance", authority: "UNRESOLVED_FUTURE_OWNER", owner: "Performance", reasonCode: "OUTSIDE_VALIDATOR_INPUT" },
  ]);
}

function compatibilityProjection(
  objectives: readonly ProductionWeeklyObjectivePrescribedRealizationTrace[],
  sessions: readonly ProductionSessionAdmissibilityTrace[],
  duration: ProductionWeeklyDurationView,
  unresolvedPolicies: readonly string[],
): ProductionPostPrescriptionWeekCompatibilityProjection {
  return {
    objectivePrescribedStates: Object.fromEntries(objectives.map((objective) => [objective.objectiveId, objective.status])),
    qualifyingReservationIdsByObjective: Object.fromEntries(objectives.map((objective) => [objective.objectiveId, objective.prescribedQualifyingReservationIds])),
    sourceEventIdsByObjective: Object.fromEntries(objectives.map((objective) => [objective.objectiveId, objective.qualifyingEventIds])),
    sessionAdmissibilityByReservation: Object.fromEntries(sessions.map((session) => [session.reservationId, session.status])),
    durationState: duration.totalDurationKnown ? "known" : "unknown",
    unresolvedPolicies,
    noncanonical: true,
  };
}

export function validatePostPrescriptionWeek(
  input: ProductionPostPrescriptionWeekValidationInput,
): ProductionPostPrescriptionWeekValidationResult {
  const policyResolution = resolvePostPrescriptionWeekValidationPolicy(input);
  const inputReasons = validateProductionPostPrescriptionWeekInput(input);
  const validationId = derivePostPrescriptionWeekValidationId(input);
  const policyRef = policyResolution.policy
    ? { policyId: policyResolution.policy.policyId, version: policyResolution.policy.version }
    : null;
  const basedOnRevisionId = input.priorValidationRevisionContext?.ledger.finalRevisionId ?? null;
  const validationRevisionId = derivePostPrescriptionWeekValidationRevisionId({
    validationId,
    policyRef,
    validationInput: input,
    basedOnRevisionId,
  });
  const revision = policyRef ? buildPostPrescriptionWeekValidationRevisionLedger({
    validationInput: input,
    validationId,
    validationRevisionId,
    policyRef,
  }) : { ledger: null, reasonCodes: ["VALIDATION_POLICY_REQUIRED_FOR_REVISION"] };
  const bundleByReservation = new Map(input.sessionBundles.map((bundle) => [bundle.reservationId, bundle]));
  const sessions = input.weekSource.reservations.map((reservation) => classifySession({
    source: input.weekSource,
    reservation,
    bundle: bundleByReservation.get(reservation.reservationId),
    inputReasonCodes: inputReasons,
  }));
  const ledger = buildLedger({ validationInput: input, validationId, validationRevisionId, sessions });
  const integrity = sourceIntegrity(input, ledger);
  const objectives = buildObjectiveTraces({
    source: input.weekSource,
    ledger,
    sessions,
    policy: policyResolution.policy,
    policyStatus: policyResolution.status,
  });
  const burdens = buildBurdenVectors(input, ledger);
  const concentrations = buildConcentrationTraces(ledger, burdens);
  const assessmentPreparation = buildAssessmentPreparationTrace(input.weekSource, ledger);
  const recoveryViews = buildRecoveryViews(ledger);
  const spacing = buildSpacingTraces(input.weekSource, objectives);
  const duration = buildWeeklyDuration(input, sessions);
  const completeArgumentStatus = completeStatus({
    inputReasons,
    policyStatus: policyResolution.status,
    sessions,
    integrity,
    objectives,
  });
  const completeArgument: ProductionPlannedPrescribedWeekArgumentTrace = {
    status: completeArgumentStatus,
    requiredObjectivesPresent: objectives.filter((objective) => objective.priority === "required")
      .every((objective) => objective.prescribedQualifyingReservationIds.length > 0),
    allocationsPreserved: true,
    sessionsBelongToReservations: sessions.length === input.weekSource.reservations.length,
    assignmentsMapToOneSourceEvent: integrity.missingEventCount === 0 && integrity.orphanEventCount === 0,
    sourceEventsUnique: integrity.duplicateEventCount === 0 && integrity.crossSessionEventCollisionCount === 0,
    finalPrescriptionRevisionsPreserved: integrity.stalePrescriptionRevisionCount === 0,
    finalSequenceRevisionsPreserved: integrity.staleSequenceRevisionCount === 0,
    minimumPrescribedOpportunitiesMet: objectives.filter((objective) => objective.priority === "required")
      .every((objective) => objective.minimumState !== "below"),
    supportingLanesSeparate: ledger.every((event) => event.blockPurposeViews.every((block) =>
      block.developmentalCreditEligible === (block.contributionClassification === "developmental_credit_candidate"))),
    relationshipsPreserved: ledger.flatMap((event) => event.muscleRelationshipViews)
      .every((view) => view.fractionalCoefficient === null),
    noncommensurableDoseModesSeparate: true,
    overBudgetSessionsExposed: sessions.filter((session) => session.status === "definitely_over_budget")
      .every((session) => !session.executableMinimumEligible),
    unknownDurationsExposed: sessions.filter((session) => session.durationState === "unavailable" ||
      ["prescribed_duration_unresolved", "possibly_over_budget"].includes(session.status))
      .every((session) => !session.executableMinimumEligible),
    spacingUnknownsExposed: spacing.every((trace) => trace.elapsedTimeKnown || trace.elapsedMinutes === null),
    unsupportedScopesExplicit: input.weekSource.unsupportedScopes.length > 0,
    validationAddedSessionCount: 0,
    validationRemovedSessionCount: 0,
    validationAddedExerciseCount: 0,
    validationRemovedExerciseCount: 0,
    plannedFactsCalledCompletedCount: 0,
    reasonCodes: [completeArgumentStatus.toUpperCase()],
  };
  const activeReservationIds = new Set(input.weekSource.reservations
    .filter((reservation) => reservation.invalidationState === "active")
    .map((reservation) => reservation.reservationId));
  const extraBundleCount = input.sessionBundles.filter((bundle) => !activeReservationIds.has(bundle.reservationId) &&
    bundle.expectedArtifactState === "expected").length;
  const derivedReasons: Readonly<Record<ProductionPostPrescriptionWeekGate13Subgate, readonly string[]>> = {
    "13.0_week_input_truth": [],
    "13.1_session_completeness": [],
    "13.2_source_event_integrity": [
      ...validateProductionPlannedSourceExposureLedger(ledger),
      ...validateProductionFinalPrescriptionRevisions(input, ledger),
      ...validateProductionFinalSequenceRevisions(input, ledger),
    ],
    "13.3_block_contribution_truth": validateProductionBlockContributionViews(
      ledger.flatMap((event) => event.blockPurposeViews),
    ).concat(validateProductionAssessmentPreparationTrace(assessmentPreparation)),
    "13.4_weekly_objective_mapping": validateProductionObjectiveToEventChain(input, ledger),
    "13.5_prescribed_frequency_distribution": [],
    "13.6_dose_lane_truth": [
      ...validateProductionDoseLanes(ledger.flatMap((event) => event.doseLanes)),
      ...validateProductionRelationshipViews(ledger.flatMap((event) => event.muscleRelationshipViews)),
    ],
    "13.7_stress_concentration_duration": [
      ...validateProductionStressViews(ledger.flatMap((event) => event.stressExposureViews)),
      ...validateProductionRecoveryViews(recoveryViews),
      ...validateProductionBurdenVectors(burdens),
      ...validateProductionDurationView(duration),
    ],
    "13.8_spacing_truth": validateProductionSpacingTraces(spacing),
    "13.9_complete_prescribed_week_argument": validateProductionCompleteWeekArgument(completeArgument),
  };
  const failures = gateFailures({
    inputReasons: [...inputReasons, ...revision.reasonCodes],
    policyStatus: policyResolution.status,
    extraBundleCount,
    sessions,
    integrity,
    ledger,
    objectives,
    completeStatus: completeArgumentStatus,
    derivedReasons,
  });
  const gate13Trace = buildGate13Trace(failures, input.upstreamGateState);
  const unresolvedPolicies = sortedUnique([
    ...input.weekSource.unresolvedPolicyRefs,
    ...(policyResolution.policy?.unsupportedScopes ?? []),
    ...(policyResolution.policy ? [policyResolution.policy.h2Disposition, policyResolution.policy.spacingPolicy] : []),
  ]);
  const projection = compatibilityProjection(objectives, sessions, duration, unresolvedPolicies);
  const projectionReasons = validateProductionPostPrescriptionWeekCompatibilityProjection(projection);
  const status = resultStatus({
    inputReasons: [...inputReasons, ...projectionReasons],
    policyStatus: policyResolution.status,
    revisionValid: revision.ledger !== null,
    completeStatus: completeArgumentStatus,
  });
  const authority = inputAuthority(input.weekSource);
  return {
    validatorContract: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE,
    validationPolicyRef: policyRef,
    validationId,
    validationRevisionId,
    revisionLedger: revision.ledger,
    athleteId: input.weekSource.athleteId,
    sourceSnapshotId: input.weekSource.sourceSnapshotId,
    sourceSnapshotRevisionId: input.weekSource.sourceSnapshotRevisionId,
    status,
    sourceExposureLedger: ledger,
    objectiveRealizationTraces: objectives,
    sessionAdmissibilityTraces: sessions,
    doseLaneSummaries: ledger.flatMap((event) => event.doseLanes),
    muscleRelationshipViews: ledger.flatMap((event) => event.muscleRelationshipViews),
    movementActionCapacityViews: ledger.map((event) => event.movementActionCapacityView),
    assessmentPreparationTrace: assessmentPreparation,
    recoveryViews,
    stressTraces: ledger.flatMap((event) => event.stressExposureViews),
    burdenVectors: burdens,
    concentrationTraces: concentrations,
    spacingTraces: spacing,
    weeklyDurationView: duration,
    sourceEventIntegrityTrace: integrity,
    completeWeekArgument: completeArgument,
    unsupportedScopes: input.weekSource.unsupportedScopes,
    unresolvedPolicies,
    gate13Trace,
    inputAuthorityTrace: authority,
    decisionTrace: {
      contractVersionTrace: [
        `${input.validatorContract.contractId}@${input.validatorContract.contractVersion}`,
        `${input.weekSource.sourceContract.contractId}@${input.weekSource.sourceContract.contractVersion}`,
      ],
      sourceAdapterAuthorityTrace: [`SOURCE_AUTHORITY:${input.weekSource.sourceAuthority}`],
      policyResolutionTrace: policyResolution.reasonCodes,
      weekInputTrace: [input.weekSource.sourceSnapshotId, input.weekSource.sourceSnapshotRevisionId],
      sessionInventoryTrace: sessions.map((session) => `${session.reservationId}:${session.status}`),
      sessionAdmissibilityTrace: sessions.flatMap((session) => session.reasonCodes),
      objectiveProvenanceTrace: objectives.map((objective) => `${objective.objectiveId}:${objective.status}`),
      sourceEventTrace: integrity.reasonCodes.length > 0 ? integrity.reasonCodes : ["SOURCE_EVENT_IDENTITY_PRESERVED"],
      prescriptionRevisionTrace: uniqueSorted(ledger.map((event) => event.finalPrescriptionRevisionId)),
      sequenceRevisionTrace: uniqueSorted(ledger.map((event) => event.finalSequenceRevisionId)),
      blockContributionTrace: uniqueSorted(ledger.flatMap((event) => event.blockPurposeViews.map((block) => `${block.blockId}:${block.contributionClassification}`))),
      frequencyTrace: objectives.map((objective) => `${objective.objectiveId}:${objective.executablePrescribedFrequencyCount}`),
      doseLaneTrace: uniqueSorted(ledger.flatMap((event) => event.doseLanes.map((lane) => `${lane.blockId}:${lane.mode}`))),
      relationshipTrace: uniqueSorted(ledger.flatMap((event) => event.muscleRelationshipViews.map((view) => `${view.muscle}:${view.relationship}`))),
      assessmentPreparationTrace: ledger.map((event) => `${event.sourceExposureEventId}:${event.movementActionCapacityView.assessmentLane}`),
      capacityRecoveryTrace: ledger.map((event) => `${event.sourceExposureEventId}:${event.movementActionCapacityView.capacityLane}:${event.movementActionCapacityView.recoveryLane}`),
      stressTrace: ledger.flatMap((event) => event.stressExposureViews.map((trace) => `${trace.stressTag}:${trace.resolutionState}`)),
      burdenConcentrationTrace: concentrations.map((trace) => trace.kind),
      durationTrace: [`WEEK_DURATION_UPPER:${duration.knownUpperBoundSeconds ?? "UNKNOWN"}`],
      spacingTrace: spacing.length > 0 ? spacing.map((trace) => `${trace.objectiveId}:${trace.result}`) : ["NO_MULTI_RESERVATION_SPACING_PAIR"],
      unsupportedScopeTrace: input.weekSource.unsupportedScopes,
      noRescueTrace: input.upstreamGateState === "FAIL_STOP"
        ? ["UPSTREAM_FAILURE_RETAINED", "GATE_13_SHADOW_ONLY"]
        : gate13Trace.some((gate) => gate.state === "FAIL_STOP")
          ? ["EARLIEST_GATE_13_FAILURE_RETAINED", "LATER_SUBGATES_SHADOW_ONLY"]
          : ["NO_DOWNSTREAM_RESCUE_ATTEMPTED"],
      completeWeekTrace: completeArgument.reasonCodes,
      finalReasonCodes: [status.toUpperCase(), ...projectionReasons],
      actualPerformanceConsumed: false,
      longitudinalDecisionConsumed: false,
    },
    compatibilityProjection: projection,
    provenance: [{
      source: "prescription_contract",
      sourceRef: `production-post-prescription-week:${stableId("result", { validationId, validationRevisionId })}`,
    }],
    authority: "PRODUCTION_KERNEL_AUTHORITY",
    productionActivationStatus: "NOT_ACTIVATED",
  };
}
