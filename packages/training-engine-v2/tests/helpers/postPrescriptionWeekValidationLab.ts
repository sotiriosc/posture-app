import type { ExerciseDefinition } from "../../src/domain/exercise";
import type { ExerciseDose } from "../../src/prescription/dose";
import type { FinalSequencedSessionDurationInterval } from "../../src/sequencing/contracts";
import type { WeeklyDevelopmentObjective } from "../../src/weekComposer/designContracts";
import type {
  PlannedBurdenVector,
  PlannedConcentrationTrace,
  PlannedDoseLaneView,
  PlannedMovementActionCapacityView,
  PlannedMuscleRelationshipView,
  PlannedSourceExposureLedgerEntry,
  PlannedSpacingTrace,
  PlannedStressExposureTrace,
  PlannedWeeklyDurationView,
  PostPrescriptionWeekArgumentStatus,
  PostPrescriptionWeekGate13Subgate,
  PostPrescriptionWeekGate13Trace,
  PostPrescriptionWeekInputAuthorityTrace,
  PostPrescriptionWeekPolicyReference,
  PostPrescriptionWeekSessionArtifact,
  PostPrescriptionWeekSpacingResult,
  PostPrescriptionWeekValidationInput,
  PostPrescriptionWeekValidationPolicy,
  PostPrescriptionWeekValidationResult,
  SessionAdmissibilityTrace,
  SourceEventIntegrityTrace,
  WeeklyObjectivePrescribedRealizationTrace,
} from "../../src/weekValidation/designContracts";
import {
  POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES,
  POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT_REFERENCE,
} from "../../src/weekValidation/designContracts";

const sortedUnique = (values: readonly string[]): readonly string[] => [...new Set(values)].sort();

function referenceMatches(
  left: PostPrescriptionWeekPolicyReference,
  right: PostPrescriptionWeekPolicyReference,
): boolean {
  return left.policyId === right.policyId && left.version === right.version;
}

function resolvePolicy(input: PostPrescriptionWeekValidationInput): {
  readonly policy: PostPrescriptionWeekValidationPolicy | null;
  readonly status: "resolved" | "required" | "unavailable" | "conflict";
  readonly trace: readonly string[];
} {
  if (input.validationPolicy === null) {
    return { policy: null, status: "required", trace: ["WEEKLY_POLICY_REQUIRED"] };
  }
  if ("frequencyRules" in input.validationPolicy) {
    if (!referenceMatches(input.validationPolicy.weekPolicyRef, input.weekPolicyRef)) {
      return { policy: null, status: "conflict", trace: ["WEEKLY_POLICY_CONFLICT"] };
    }
    return { policy: input.validationPolicy, status: "resolved", trace: [
      `POLICY_RESOLVED:${input.validationPolicy.policyId}@${input.validationPolicy.version}`,
    ] };
  }
  const matches = (input.validationPolicyRegistry ?? [])
    .filter((policy) => referenceMatches(policy, input.validationPolicy as PostPrescriptionWeekPolicyReference));
  if (matches.length === 0) {
    return { policy: null, status: "unavailable", trace: ["WEEKLY_POLICY_REQUIRED:UNKNOWN_REFERENCE"] };
  }
  if (matches.length > 1) {
    return { policy: null, status: "conflict", trace: ["WEEKLY_POLICY_CONFLICT:DUPLICATE_REFERENCE"] };
  }
  if (!referenceMatches(matches[0].weekPolicyRef, input.weekPolicyRef)) {
    return { policy: null, status: "conflict", trace: ["WEEKLY_POLICY_CONFLICT:WEEK_POLICY_MISMATCH"] };
  }
  return { policy: matches[0], status: "resolved", trace: [
    `POLICY_RESOLVED_FROM_REGISTRY:${matches[0].policyId}@${matches[0].version}`,
  ] };
}

export const POST_PRESCRIPTION_WEEK_INPUT_AUTHORITY: readonly PostPrescriptionWeekInputAuthorityTrace[] =
  Object.freeze([
    { field: "validationContract", authority: "COMPATIBILITY_INPUT", owner: "Post-Prescription Week Validation", reasonCode: "DESIGN_CONTRACT_ONLY" },
    { field: "weeklyIntent", authority: "DESIGN_UPSTREAM_AUTHORITY", owner: "Weekly Intent Planner", reasonCode: "PRODUCTION_WEEK_ADAPTER_REQUIRED" },
    { field: "weekAllocationPlan", authority: "DESIGN_UPSTREAM_AUTHORITY", owner: "Week Allocation Composer", reasonCode: "PRODUCTION_WEEK_ADAPTER_REQUIRED" },
    { field: "orderedReservations", authority: "DESIGN_UPSTREAM_AUTHORITY", owner: "Week Allocation Composer", reasonCode: "EXPLICIT_RESERVATION_ORDER" },
    { field: "planningHorizon", authority: "DESIGN_UPSTREAM_AUTHORITY", owner: "Product Horizon Adapter design", reasonCode: "PRODUCT_ADAPTER_NOT_WIRED" },
    { field: "sessionIntent", authority: "PRODUCTION_UPSTREAM_AUTHORITY", owner: "Session Intent Planner", reasonCode: "PRODUCTION_CONTRACT" },
    { field: "sessionSkeleton", authority: "PRODUCTION_UPSTREAM_AUTHORITY", owner: "Session Composer", reasonCode: "PRODUCTION_CONTRACT" },
    { field: "prescriptionCompilation", authority: "PRODUCTION_UPSTREAM_AUTHORITY", owner: "Prescription Compiler", reasonCode: "PRODUCTION_KERNEL_AUTHORITY" },
    { field: "sequencingResult", authority: "PRODUCTION_UPSTREAM_AUTHORITY", owner: "Final Session Sequencing", reasonCode: "PRODUCTION_KERNEL_AUTHORITY" },
    { field: "exerciseRegistry", authority: "PRODUCTION_UPSTREAM_AUTHORITY", owner: "Exercise domain", reasonCode: "CANONICAL_REGISTRY" },
    { field: "completedPerformance", authority: "FUTURE_PRODUCTION_ADAPTER_REQUIRED", owner: "Performance", reasonCode: "OUTSIDE_VALIDATION_INPUT" },
  ]);

function durationUnresolved(duration: FinalSequencedSessionDurationInterval): boolean {
  return duration.knownUpperBoundSeconds === null || [
    "possibly_over_budget",
    "unknown_due_to_prescription",
    "unknown_due_to_setup_transition",
    "unknown_due_to_interexercise_recovery",
    "unknown_due_to_section_transition",
  ].includes(duration.status);
}

function classifySession(
  reservationId: string,
  opportunityId: string,
  artifact: PostPrescriptionWeekSessionArtifact | undefined,
): SessionAdmissibilityTrace {
  if (!artifact) {
    return {
      reservationId,
      opportunityId,
      sessionIntentId: null,
      executionAttemptId: null,
      status: "missing_session_artifact",
      prescribedWorkPresent: false,
      executableMinimumEligible: false,
      durationState: "unavailable",
      reasonCodes: ["MISSING_SESSION_ARTIFACT"],
    };
  }
  const compilation = artifact.prescriptionCompilation;
  const sequencing = artifact.sequencingResult;
  const identityValid = artifact.sessionSkeleton.sessionIntentId === artifact.sessionIntent.id &&
    compilation?.plans.every((plan) => plan.sourceExposureEvent.sessionIntentId === artifact.sessionIntent.id) !== false &&
    sequencing?.plan?.sessionIntentId !== undefined &&
    sequencing.plan.sessionIntentId === artifact.sessionIntent.id;
  if (!identityValid && compilation && sequencing?.plan) {
    return {
      reservationId,
      opportunityId,
      sessionIntentId: artifact.sessionIntent.id,
      executionAttemptId: sequencing.plan.executionAttemptId,
      status: "invalid_identity_chain",
      prescribedWorkPresent: compilation.plans.length > 0,
      executableMinimumEligible: false,
      durationState: sequencing.plan.duration.status,
      reasonCodes: ["INVALID_SESSION_IDENTITY_CHAIN"],
    };
  }
  if (!compilation || compilation.status === "incomplete" || compilation.status === "invalid_session_handoff") {
    return {
      reservationId,
      opportunityId,
      sessionIntentId: artifact.sessionIntent.id,
      executionAttemptId: null,
      status: "incomplete_prescription",
      prescribedWorkPresent: Boolean(compilation?.plans.length),
      executableMinimumEligible: false,
      durationState: "unavailable",
      reasonCodes: ["INCOMPLETE_PRESCRIPTION"],
    };
  }
  if (compilation.status === "blocked_by_training_readiness" ||
      sequencing?.status === "blocked_by_training_readiness") {
    return {
      reservationId,
      opportunityId,
      sessionIntentId: artifact.sessionIntent.id,
      executionAttemptId: sequencing?.plan?.executionAttemptId ?? null,
      status: "blocked_by_training_readiness",
      prescribedWorkPresent: compilation.plans.length > 0,
      executableMinimumEligible: false,
      durationState: sequencing?.plan?.duration.status ?? "unavailable",
      reasonCodes: ["BLOCKED_BY_TRAINING_READINESS"],
    };
  }
  if (!sequencing) {
    return {
      reservationId,
      opportunityId,
      sessionIntentId: artifact.sessionIntent.id,
      executionAttemptId: null,
      status: "incomplete_sequencing",
      prescribedWorkPresent: compilation.plans.length > 0,
      executableMinimumEligible: false,
      durationState: "unavailable",
      reasonCodes: ["PRESCRIPTION_PRESENT_SEQUENCE_MISSING"],
    };
  }
  if (sequencing.status === "search_inconclusive") {
    return {
      reservationId,
      opportunityId,
      sessionIntentId: artifact.sessionIntent.id,
      executionAttemptId: null,
      status: "search_inconclusive",
      prescribedWorkPresent: compilation.plans.length > 0,
      executableMinimumEligible: false,
      durationState: "unavailable",
      reasonCodes: ["SEQUENCING_SEARCH_INCONCLUSIVE"],
    };
  }
  if (!sequencing.plan) {
    return {
      reservationId,
      opportunityId,
      sessionIntentId: artifact.sessionIntent.id,
      executionAttemptId: null,
      status: "incomplete_sequencing",
      prescribedWorkPresent: compilation.plans.length > 0,
      executableMinimumEligible: false,
      durationState: "unavailable",
      reasonCodes: [`INCOMPLETE_SEQUENCING:${sequencing.status}`],
    };
  }
  if (sequencing.plan.duration.status === "definitely_over_budget") {
    return {
      reservationId,
      opportunityId,
      sessionIntentId: artifact.sessionIntent.id,
      executionAttemptId: sequencing.plan.executionAttemptId,
      status: "definitely_over_budget",
      prescribedWorkPresent: true,
      executableMinimumEligible: false,
      durationState: sequencing.plan.duration.status,
      reasonCodes: ["DEFINITELY_OVER_BUDGET_REQUIRES_WEEK_REVIEW"],
    };
  }
  if (durationUnresolved(sequencing.plan.duration)) {
    return {
      reservationId,
      opportunityId,
      sessionIntentId: artifact.sessionIntent.id,
      executionAttemptId: sequencing.plan.executionAttemptId,
      status: "prescribed_duration_unresolved",
      prescribedWorkPresent: true,
      executableMinimumEligible: false,
      durationState: sequencing.plan.duration.status,
      reasonCodes: ["PRESCRIBED_REALIZATION_PRESENT_DURATION_PENDING"],
    };
  }
  return {
    reservationId,
    opportunityId,
    sessionIntentId: artifact.sessionIntent.id,
    executionAttemptId: sequencing.plan.executionAttemptId,
    status: "prescribed_and_sequenced",
    prescribedWorkPresent: true,
    executableMinimumEligible: true,
    durationState: sequencing.plan.duration.status,
    reasonCodes: ["PRESCRIBED_AND_SEQUENCED"],
  };
}

function doseLane(
  sourceExposureEventId: string,
  block: NonNullable<PostPrescriptionWeekSessionArtifact["prescriptionCompilation"]>["plans"][number]["doseBlocks"][number],
): PlannedDoseLaneView {
  return {
    sourceExposureEventId,
    blockId: block.blockId,
    mode: block.dose.mode,
    dose: block.dose,
    commensurableWithinModeOnly: true,
    developmentalCreditEligible: block.contributionClassification === "developmental_credit_candidate",
    provenance: block.provenance,
  };
}

function capacityLane(
  role: PlannedSourceExposureLedgerEntry["role"],
  exercise: ExerciseDefinition,
  modes: readonly ExerciseDose["mode"][],
): PlannedMovementActionCapacityView["capacityLane"] {
  if (role !== "capacity") return "none";
  if (modes.some((mode) => mode === "distance_carry" || mode === "timed_carry")) return "loaded_carry";
  if (modes.includes("step_march")) return "supported_stationary_capacity";
  return exercise.loading.loadingPotential !== "low" ? "loaded_bracing" : "supported_stationary_capacity";
}

function stressResolution(
  scope: NonNullable<ExerciseDefinition["stressAnnotations"]>[number]["exposureScope"],
): PlannedStressExposureTrace["resolutionState"] {
  if (scope === "intrinsic") return "intrinsic_planned_exposure";
  if (scope === "prescription_modifiable") return "prescription_modified_exposure";
  if (scope === "variant_dependent") return "variant_confirmed_exposure";
  if (scope === "dose_created") return "dose_created_potential_unresolved";
  return "unknown_requires_review";
}

function buildLedgerEntries(input: PostPrescriptionWeekValidationInput, traces: readonly SessionAdmissibilityTrace[]):
readonly PlannedSourceExposureLedgerEntry[] {
  const exerciseById = new Map(input.exerciseRegistry.map((exercise) => [exercise.id, exercise]));
  const traceByReservationId = new Map(traces.map((trace) => [trace.reservationId, trace]));
  const reservationById = new Map(input.orderedReservations.map((reservation) => [reservation.id, reservation]));
  const entries: PlannedSourceExposureLedgerEntry[] = [];
  for (const artifact of input.sessionArtifacts) {
    const plan = artifact.sequencingResult?.plan;
    const compilation = artifact.prescriptionCompilation;
    const reservation = reservationById.get(artifact.reservationId);
    const admissibility = traceByReservationId.get(artifact.reservationId);
    if (!plan || !compilation || !reservation || !admissibility) continue;
    const planByPrescriptionId = new Map(compilation.plans.map((entry) => [entry.prescriptionId, entry]));
    const needById = new Map(artifact.sessionIntent.needs.map((need) => [need.id, need]));
    const allocatedObjectiveIds = new Set(reservation.allocatedObjectives.map((objective) => objective.weeklyObjectiveId));
    for (const step of plan.steps) {
      const prescription = planByPrescriptionId.get(step.prescriptionId);
      const exercise = exerciseById.get(step.exerciseId);
      if (!prescription || !exercise) continue;
      const weeklyObjectiveIds = sortedUnique(step.satisfiedNeedIds.flatMap((needId) =>
        (needById.get(needId)?.plannerProvenance?.objectiveIds ?? [])
          .filter((objectiveId) => allocatedObjectiveIds.has(objectiveId))));
      const doseLanes = prescription.doseBlocks.map((block) => doseLane(step.sourceExposureEventId, block));
      const developmentalBlocks = prescription.doseBlocks
        .filter((block) => block.contributionClassification === "developmental_credit_candidate");
      const muscleViews: PlannedMuscleRelationshipView[] = exercise.muscleContributions.map((relationship) => ({
        sourceExposureEventId: step.sourceExposureEventId,
        exerciseId: step.exerciseId,
        muscle: relationship.muscle,
        relationship: relationship.relationship,
        blockIds: developmentalBlocks.map((block) => block.blockId),
        doseModes: sortedUnique(developmentalBlocks.map((block) => block.dose.mode)) as readonly ExerciseDose["mode"][],
        reviewStatus: relationship.reviewStatus,
        fractionalCoefficient: null,
        provenance: relationship.provenance.map((entry) => entry.sourceRef),
      }));
      const movementView: PlannedMovementActionCapacityView = {
        sourceExposureEventId: step.sourceExposureEventId,
        exerciseId: step.exerciseId,
        movementRoles: exercise.movementRoles,
        actionFunctions: exercise.actionFunctions.filter((entry) => entry.reviewStatus === "accepted").map((entry) => entry.action),
        capacityLane: capacityLane(step.role, exercise, prescription.doseBlocks.map((block) => block.dose.mode)),
        assessmentLane: prescription.doseBlocks.some((block) => block.contributionClassification === "technique_quality_observation_only")
          ? "technique_quality"
          : ["preparation", "activation"].includes(step.role) ? "preparation_control" : "none",
        recoveryLane: prescription.doseBlocks.some((block) => block.contributionClassification === "recovery_observation_only")
          ? "prescribed_recovery_support" : "none",
        provenance: exercise.actionFunctions.flatMap((entry) => entry.provenance.map((provenance) => provenance.sourceRef)),
      };
      const stressViews: PlannedStressExposureTrace[] = (exercise.stressAnnotations ?? []).map((annotation) => ({
        sourceExposureEventId: step.sourceExposureEventId,
        exerciseId: step.exerciseId,
        blockIds: prescription.doseBlocks.map((block) => block.blockId),
        stressTag: annotation.tag,
        source: annotation.source,
        exposureScope: annotation.exposureScope,
        sideScope: annotation.sideScope,
        resolutionState: stressResolution(annotation.exposureScope),
        actualInjuryClaimed: false,
        provenance: annotation.provenance.map((entry) => entry.sourceRef),
      }));
      entries.push({
        athleteId: input.athleteId,
        planningHorizonId: input.planningHorizon.id,
        reservationId: reservation.id,
        opportunityId: reservation.opportunityId,
        sessionIntentId: artifact.sessionIntent.id,
        executionAttemptId: plan.executionAttemptId,
        sequencePlanId: plan.sequencePlanId,
        sequenceRevisionId: plan.sequenceRevisionId,
        sequenceIndex: step.sequenceIndex,
        assignmentId: step.assignmentId,
        sourceExposureEventId: step.sourceExposureEventId,
        exerciseId: step.exerciseId,
        prescriptionId: step.prescriptionId,
        finalPrescriptionRevisionId: step.finalPrescriptionRevisionId,
        section: step.section,
        role: step.role,
        satisfiedSessionNeedIds: step.satisfiedNeedIds,
        weeklyObjectiveIds,
        doseBlockIds: step.orderedDoseBlockIds,
        blockPurposeViews: prescription.doseBlocks.map((block) => ({
          blockId: block.blockId,
          purpose: block.purpose,
          contributionClassification: block.contributionClassification,
          doseMode: block.dose.mode,
          objectiveIds: weeklyObjectiveIds,
          developmentalCreditEligible: block.contributionClassification === "developmental_credit_candidate",
          reasonCodes: [`BLOCK_CONTRIBUTION:${block.contributionClassification}`],
        })),
        doseLanes,
        muscleContributionViews: muscleViews,
        movementActionCapacityView: movementView,
        stressExposureViews: stressViews,
        durationInterval: prescription.durationInterval,
        executionFeasibilityState: admissibility.status,
        provenance: [prescription.provenance, ...plan.provenance],
      });
    }
  }
  return entries.sort((left, right) => left.reservationId.localeCompare(right.reservationId) ||
    left.sequenceIndex - right.sequenceIndex || left.assignmentId.localeCompare(right.assignmentId));
}

function sourceIntegrity(
  input: PostPrescriptionWeekValidationInput,
  ledger: readonly PlannedSourceExposureLedgerEntry[],
): SourceEventIntegrityTrace {
  const expectedAssignments = input.sessionArtifacts.flatMap((artifact) => artifact.sessionSkeleton.assignments.map((assignment) => ({
    reservationId: artifact.reservationId,
    assignmentId: assignment.routinePrescriptionHandoffId,
  })));
  const eventGroups = new Map<string, PlannedSourceExposureLedgerEntry[]>();
  ledger.forEach((entry) => eventGroups.set(entry.sourceExposureEventId, [
    ...(eventGroups.get(entry.sourceExposureEventId) ?? []), entry,
  ]));
  const duplicateEventCount = [...eventGroups.values()].reduce((count, entries) => count + Math.max(0, entries.length - 1), 0);
  const crossSessionEventCollisionCount = [...eventGroups.values()]
    .filter((entries) => new Set(entries.map((entry) => entry.reservationId)).size > 1).length;
  const observedAssignments = new Set(ledger.map((entry) => `${entry.reservationId}:${entry.assignmentId}`));
  const missingEventCount = expectedAssignments
    .filter((entry) => !observedAssignments.has(`${entry.reservationId}:${entry.assignmentId}`)).length;
  const artifactByReservation = new Map(input.sessionArtifacts.map((artifact) => [artifact.reservationId, artifact]));
  let stalePrescriptionRevisionCount = 0;
  let staleSequenceRevisionCount = 0;
  let orphanEventCount = 0;
  for (const artifact of input.sessionArtifacts) {
    const plan = artifact.sequencingResult?.plan;
    const represented = new Set(ledger.filter((entry) => entry.reservationId === artifact.reservationId)
      .map((entry) => entry.sourceExposureEventId));
    orphanEventCount += (artifact.prescriptionCompilation?.sourceExposureEvents ?? [])
      .filter((event) => !represented.has(event.sourceExposureEventId)).length;
    if (plan && plan.revisionLedger.finalRevisionId !== plan.sequenceRevisionId) staleSequenceRevisionCount += 1;
  }
  for (const entry of ledger) {
    const artifact = artifactByReservation.get(entry.reservationId);
    const prescription = artifact?.prescriptionCompilation?.plans
      .find((plan) => plan.prescriptionId === entry.prescriptionId);
    if (!prescription || prescription.prescriptionRevisionId !== entry.finalPrescriptionRevisionId ||
        prescription.revisionLedger.finalRevisionId !== entry.finalPrescriptionRevisionId) {
      stalePrescriptionRevisionCount += 1;
    }
  }
  const reasonCodes = [
    duplicateEventCount > 0 ? "DUPLICATE_SOURCE_EVENT" : null,
    missingEventCount > 0 ? "MISSING_SOURCE_EVENT" : null,
    orphanEventCount > 0 ? "ORPHAN_SOURCE_EVENT" : null,
    crossSessionEventCollisionCount > 0 ? "CROSS_SESSION_EVENT_COLLISION" : null,
    stalePrescriptionRevisionCount > 0 ? "STALE_PRESCRIPTION_REVISION" : null,
    staleSequenceRevisionCount > 0 ? "STALE_SEQUENCE_REVISION" : null,
  ].filter((value): value is string => value !== null);
  return {
    expectedEventCount: expectedAssignments.length,
    observedEventCount: ledger.length,
    observedUniqueEventCount: eventGroups.size,
    duplicateEventCount,
    missingEventCount,
    orphanEventCount,
    crossSessionEventCollisionCount,
    stalePrescriptionRevisionCount,
    staleSequenceRevisionCount,
    sourceEventRewriteCount: 0,
    reasonCodes,
  };
}

function intersects<T>(left: readonly T[], right: readonly T[]): boolean {
  return left.some((value) => right.includes(value));
}

function eventQualification(
  objective: WeeklyDevelopmentObjective,
  event: PlannedSourceExposureLedgerEntry,
): { readonly qualifies: boolean; readonly reasons: readonly string[]; readonly evidence: readonly string[] } {
  if (!event.weeklyObjectiveIds.includes(objective.id)) {
    return { qualifies: false, reasons: ["WEEK_OBJECTIVE_SOURCE_TRACE_INCOMPLETE"], evidence: [] };
  }
  const developmental = event.blockPurposeViews.some((block) => block.developmentalCreditEligible);
  const technique = event.blockPurposeViews.some((block) => block.contributionClassification === "technique_quality_observation_only");
  const recovery = event.blockPurposeViews.some((block) => block.contributionClassification === "recovery_observation_only");
  const movement = intersects(event.movementActionCapacityView.movementRoles, objective.selectionTarget.targetMovementRoles);
  const action = intersects(event.movementActionCapacityView.actionFunctions, objective.selectionTarget.targetActionFunctions);
  const muscleViews = event.muscleContributionViews
    .filter((view) => objective.selectionTarget.targetMuscles.includes(view.muscle));
  const primary = muscleViews.some((view) => view.relationship === "primary_target");
  const keySecondary = muscleViews.some((view) => view.relationship === "key_secondary_target");
  const purpose = objective.purpose;
  if (purpose === "movement_development") {
    return {
      qualifies: developmental && movement && ["primary_strength", "secondary_strength", "capacity"].includes(event.role),
      reasons: developmental ? movement ? [] : ["MOVEMENT_RELATIONSHIP_INCOMPATIBLE"] : ["DEVELOPMENTAL_BLOCK_REQUIRED"],
      evidence: movement ? event.movementActionCapacityView.movementRoles : [],
    };
  }
  if (purpose === "muscle_development") {
    const compatible = primary || keySecondary && objective.selectionTarget.muscleRequirement !== "primary_required";
    return {
      qualifies: developmental && compatible && ["primary_strength", "secondary_strength", "hypertrophy_accessory"].includes(event.role),
      reasons: developmental ? compatible ? [] : ["MUSCLE_RELATIONSHIP_INCOMPATIBLE"] : ["DEVELOPMENTAL_BLOCK_REQUIRED"],
      evidence: muscleViews.map((view) => `${view.muscle}:${view.relationship}`),
    };
  }
  if (purpose === "direct_action_development") {
    return {
      qualifies: developmental && (action || primary),
      reasons: developmental ? action || primary ? [] : ["DIRECT_REQUIRES_EXACT_ACTION_OR_PRIMARY_TARGET"] : ["DEVELOPMENTAL_BLOCK_REQUIRED"],
      evidence: [
        ...event.movementActionCapacityView.actionFunctions,
        ...muscleViews.map((view) => `${view.muscle}:${view.relationship}`),
      ],
    };
  }
  if (purpose === "assessment_priority_development") {
    const compatible = technique || event.movementActionCapacityView.assessmentLane === "preparation_control";
    return { qualifies: compatible, reasons: compatible ? [] : ["ASSESSMENT_REALIZATION_REQUIRED"], evidence: [event.movementActionCapacityView.assessmentLane] };
  }
  if (purpose === "capacity_development") {
    const compatible = developmental && event.role === "capacity" && event.movementActionCapacityView.capacityLane !== "none";
    return { qualifies: compatible, reasons: compatible ? [] : ["CAPACITY_RELATIONSHIP_INCOMPATIBLE"], evidence: [event.movementActionCapacityView.capacityLane] };
  }
  if (purpose === "recovery_support") {
    const compatible = recovery && event.role === "recovery";
    return { qualifies: compatible, reasons: compatible ? [] : ["RECOVERY_SUPPORT_EXPLICIT_ONLY"], evidence: [event.movementActionCapacityView.recoveryLane] };
  }
  return { qualifies: false, reasons: ["UNSUPPORTED_OBJECTIVE_SCOPE"], evidence: [] };
}

function thresholdState(value: number, threshold: number): "below" | "met" | "above" {
  return value < threshold ? "below" : value === threshold ? "met" : "above";
}

function frequencyRule(
  policy: PostPrescriptionWeekValidationPolicy | null,
  objective: WeeklyDevelopmentObjective,
): readonly [number, number, number] | null {
  if (!policy) return null;
  const rule = policy.frequencyRules.find((entry) => entry.purpose === objective.purpose);
  if (!rule) return null;
  return objective.priority === "required" ? rule.required : objective.priority === "preferred" ? rule.preferred : rule.optional;
}

function buildObjectiveTraces(
  input: PostPrescriptionWeekValidationInput,
  ledger: readonly PlannedSourceExposureLedgerEntry[],
  sessions: readonly SessionAdmissibilityTrace[],
  policy: PostPrescriptionWeekValidationPolicy | null,
): readonly WeeklyObjectivePrescribedRealizationTrace[] {
  const sessionByReservationId = new Map(sessions.map((session) => [session.reservationId, session]));
  return [...input.weeklyIntent.objectives].sort((left, right) => left.priorityOrder - right.priorityOrder || left.id.localeCompare(right.id))
    .map((objective) => {
      const allocatedReservationIds = input.orderedReservations
        .filter((reservation) => reservation.allocatedObjectives.some((allocated) => allocated.weeklyObjectiveId === objective.id))
        .map((reservation) => reservation.id);
      const objectiveEvents = ledger.filter((event) => event.weeklyObjectiveIds.includes(objective.id));
      const qualification = objectiveEvents.map((event) => ({ event, ...eventQualification(objective, event) }));
      const qualifying = qualification.filter((entry) => entry.qualifies);
      const qualifyingReservationIds = sortedUnique(qualifying.map((entry) => entry.event.reservationId));
      const pendingDurationReservationIds = qualifyingReservationIds.filter((reservationId) =>
        sessionByReservationId.get(reservationId)?.status === "prescribed_duration_unresolved");
      const executableReservationIds = qualifyingReservationIds.filter((reservationId) =>
        sessionByReservationId.get(reservationId)?.executableMinimumEligible);
      const nonexecutiveReservationIds = allocatedReservationIds.filter((reservationId) =>
        !sessionByReservationId.get(reservationId)?.executableMinimumEligible);
      const thresholds = frequencyRule(policy, objective);
      let status: WeeklyObjectivePrescribedRealizationTrace["status"];
      if (!policy) status = "weekly_policy_required";
      else if (!policy.supportedPurposes.includes(objective.purpose)) status = "unsupported_objective_scope";
      else if (qualifying.length === 0 && objectiveEvents.length > 0) status = "prescribed_realization_incompatible";
      else if (qualifying.length === 0 && allocatedReservationIds.length > 0 && nonexecutiveReservationIds.length > 0) status =
        nonexecutiveReservationIds.some((id) => sessionByReservationId.get(id)?.status === "incomplete_sequencing")
          ? "prescription_present_sequence_missing" : "allocation_present_prescription_missing";
      else if (qualifying.length === 0) status = objective.priority === "optional" ? "optional_not_prescribed" : "prescribed_realization_missing";
      else if (pendingDurationReservationIds.length > 0 && executableReservationIds.length === 0) status = "prescribed_realization_present_duration_pending";
      else if (thresholds && executableReservationIds.length > thresholds[2]) status = "prescribed_above_soft_maximum_review";
      else if (thresholds && executableReservationIds.length >= thresholds[1]) status = "prescribed_target_opportunities_met";
      else if (thresholds && executableReservationIds.length >= thresholds[0]) status = "prescribed_minimum_opportunities_met";
      else status = "prescribed_below_minimum_unresolved";
      return {
        weeklyObjectiveId: objective.id,
        purpose: objective.purpose,
        priority: objective.priority,
        priorityOrder: objective.priorityOrder,
        target: objective.selectionTarget,
        allocatedReservationIds,
        prescribedQualifyingReservationIds: qualifyingReservationIds,
        pendingDurationReservationIds,
        nonexecutiveReservationIds,
        qualifyingSourceEventIds: sortedUnique(qualifying.map((entry) => entry.event.sourceExposureEventId)),
        nonqualifyingSourceEvents: qualification.filter((entry) => !entry.qualifies)
          .map((entry) => ({ eventId: entry.event.sourceExposureEventId, reasonCodes: entry.reasons })),
        relevantBlockIds: sortedUnique(qualifying.flatMap((entry) => entry.event.blockPurposeViews
          .filter((block) => block.developmentalCreditEligible || ["assessment_priority_development", "recovery_support"].includes(objective.purpose))
          .map((block) => block.blockId))),
        relationshipEvidence: sortedUnique(qualification.flatMap((entry) => entry.evidence)),
        prescribedFrequencyCount: executableReservationIds.length,
        minimumState: thresholds ? thresholdState(executableReservationIds.length, thresholds[0]) : "not_applicable",
        targetState: thresholds ? thresholdState(executableReservationIds.length, thresholds[1]) : "not_applicable",
        softMaximumState: thresholds ? thresholdState(executableReservationIds.length, thresholds[2]) : "not_applicable",
        dosePolicyState: objective.dosePolicyReference.state === "explicit_reviewed_target" ? "explicit_reviewed_target" :
          objective.dosePolicyReference.state === "not_applicable" ? "not_applicable" : "prescribed_dose_target_not_defined",
        spacingState: "spacing_policy_not_defined",
        status,
        unresolvedRefs: [
          ...objective.recoverySpacingRequirementRefs,
          ...(status === "unsupported_objective_scope" ? ["UNSUPPORTED_OBJECTIVE_SCOPE"] : []),
        ],
        provenance: objective.sourceEvidence.flatMap((evidence) => evidence.evidenceRefs),
      };
    });
}

function buildBurdenVectors(
  input: PostPrescriptionWeekValidationInput,
  ledger: readonly PlannedSourceExposureLedgerEntry[],
): readonly PlannedBurdenVector[] {
  const exerciseById = new Map(input.exerciseRegistry.map((exercise) => [exercise.id, exercise]));
  return input.orderedReservations.map((reservation) => {
    const events = ledger.filter((event) => event.reservationId === reservation.id);
    const exercisePairs = events.flatMap((event) => {
      const exercise = exerciseById.get(event.exerciseId);
      return exercise ? [{ event, exercise }] : [];
    });
    const stressCounts = new Map<string, number>();
    events.flatMap((event) => event.stressExposureViews).forEach((stress) =>
      stressCounts.set(stress.stressTag, (stressCounts.get(stress.stressTag) ?? 0) + 1));
    return {
      reservationId: reservation.id,
      localFatigue: exercisePairs.map(({ event, exercise }) => `${event.sourceExposureEventId}:${exercise.loading.localFatigue}`),
      systemicFatigue: exercisePairs.map(({ event, exercise }) => `${event.sourceExposureEventId}:${exercise.loading.systemicFatigue}`),
      axialLoading: exercisePairs.map(({ event, exercise }) => `${event.sourceExposureEventId}:${exercise.loading.axialLoading}`),
      gripLoading: exercisePairs.filter(({ event }) => event.movementActionCapacityView.capacityLane === "loaded_carry")
        .map(({ event }) => `${event.sourceExposureEventId}:planned_potential`),
      trunkBracing: exercisePairs.filter(({ event }) => event.role === "capacity" || event.section === "main")
        .map(({ event }) => `${event.sourceExposureEventId}:planned_potential`),
      repeatedStressTags: [...stressCounts.entries()].filter(([, count]) => count > 1).map(([tag]) => tag) as PlannedBurdenVector["repeatedStressTags"],
      developmentalBlockCount: events.flatMap((event) => event.blockPurposeViews).filter((block) => block.developmentalCreditEligible).length,
      preparatoryBlockCount: events.flatMap((event) => event.blockPurposeViews)
        .filter((block) => block.contributionClassification === "not_weekly_developmental_credit").length,
      knownTimedExposureSeconds: events.reduce((sum, event) => sum + event.durationInterval.knownLowerBoundSeconds, 0),
      unknownDurationComponents: sortedUnique(events.flatMap((event) => event.durationInterval.unknownComponents)),
      observedRecoveryCost: null,
      aggregateScore: null,
    };
  });
}

function buildConcentrationTraces(
  ledger: readonly PlannedSourceExposureLedgerEntry[],
  burden: readonly PlannedBurdenVector[],
): readonly PlannedConcentrationTrace[] {
  const traces: PlannedConcentrationTrace[] = [];
  for (const vector of burden) {
    const events = ledger.filter((event) => event.reservationId === vector.reservationId);
    const objectives = events.flatMap((event) => event.weeklyObjectiveIds);
    if (new Set(objectives).size < objectives.length) traces.push({
      kind: "repeated_objective_in_one_session", reservationIds: [vector.reservationId],
      sourceExposureEventIds: events.map((event) => event.sourceExposureEventId), observationOnly: true, hardLimitPolicyRef: null,
    });
    if (vector.repeatedStressTags.length > 0) traces.push({
      kind: "repeated_joint_stress_tag", reservationIds: [vector.reservationId],
      sourceExposureEventIds: events.map((event) => event.sourceExposureEventId), observationOnly: true, hardLimitPolicyRef: null,
    });
    if (vector.gripLoading.length > 1) traces.push({
      kind: "grip_loading_concentration", reservationIds: [vector.reservationId],
      sourceExposureEventIds: events.map((event) => event.sourceExposureEventId), observationOnly: true, hardLimitPolicyRef: null,
    });
    if (vector.axialLoading.filter((entry) => entry.endsWith(":high")).length > 1) traces.push({
      kind: "axial_loading_concentration", reservationIds: [vector.reservationId],
      sourceExposureEventIds: events.map((event) => event.sourceExposureEventId), observationOnly: true, hardLimitPolicyRef: null,
    });
    if (vector.trunkBracing.length > 2) traces.push({
      kind: "trunk_bracing_concentration", reservationIds: [vector.reservationId],
      sourceExposureEventIds: events.map((event) => event.sourceExposureEventId), observationOnly: true, hardLimitPolicyRef: null,
    });
    if (vector.preparatoryBlockCount > 2) traces.push({
      kind: "supporting_work_accumulation", reservationIds: [vector.reservationId],
      sourceExposureEventIds: events.map((event) => event.sourceExposureEventId), observationOnly: true, hardLimitPolicyRef: null,
    });
  }
  return traces;
}

function buildWeeklyDuration(
  input: PostPrescriptionWeekValidationInput,
  sessions: readonly SessionAdmissibilityTrace[],
): PlannedWeeklyDurationView {
  const durationByReservation = new Map(input.sessionArtifacts.flatMap((artifact) => artifact.sequencingResult?.plan
    ? [[artifact.reservationId, artifact.sequencingResult.plan.duration] as const] : []));
  const durations = input.orderedReservations.flatMap((reservation) => {
    const duration = durationByReservation.get(reservation.id);
    return duration ? [{ reservationId: reservation.id, duration }] : [];
  });
  const allUpperKnown = durations.length === input.orderedReservations.length &&
    durations.every((entry) => entry.duration.knownUpperBoundSeconds !== null);
  return {
    knownLowerBoundSeconds: durations.reduce((sum, entry) => sum + entry.duration.knownLowerBoundSeconds, 0),
    knownUpperBoundSeconds: allUpperKnown
      ? durations.reduce((sum, entry) => sum + (entry.duration.knownUpperBoundSeconds ?? 0), 0)
      : null,
    sessionUnknowns: durations.filter((entry) => entry.duration.unknownComponents.length > 0)
      .map((entry) => ({ reservationId: entry.reservationId, components: entry.duration.unknownComponents })),
    definitelyOverBudgetReservationIds: sessions.filter((session) => session.status === "definitely_over_budget")
      .map((session) => session.reservationId),
    possiblyOverBudgetReservationIds: durations.filter((entry) => entry.duration.status === "possibly_over_budget")
      .map((entry) => entry.reservationId),
    unresolvedReservationIds: sessions.filter((session) => [
      "prescribed_duration_unresolved", "missing_session_artifact", "incomplete_prescription", "incomplete_sequencing", "search_inconclusive",
    ].includes(session.status)).map((session) => session.reservationId),
    totalDurationKnown: allUpperKnown,
    physiologicalDoseMetric: false,
  };
}

function explicitTimestamp(value: string | undefined): number | null {
  if (!value || !value.includes("T")) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildSpacingTraces(
  input: PostPrescriptionWeekValidationInput,
  objectives: readonly WeeklyObjectivePrescribedRealizationTrace[],
): readonly PlannedSpacingTrace[] {
  const opportunityById = new Map(input.planningHorizon.opportunities.map((opportunity) => [opportunity.id, opportunity]));
  const reservationById = new Map(input.orderedReservations.map((reservation) => [reservation.id, reservation]));
  const traces: PlannedSpacingTrace[] = [];
  for (const objective of objectives) {
    const reservations = objective.prescribedQualifyingReservationIds
      .map((id) => reservationById.get(id)).filter((value): value is NonNullable<typeof value> => Boolean(value))
      .sort((left, right) => (opportunityById.get(left.opportunityId)?.order ?? 0) -
        (opportunityById.get(right.opportunityId)?.order ?? 0));
    for (let index = 1; index < reservations.length; index += 1) {
      const earlier = reservations[index - 1];
      const later = reservations[index];
      const earlierOpportunity = opportunityById.get(earlier.opportunityId);
      const laterOpportunity = opportunityById.get(later.opportunityId);
      const earlierTime = explicitTimestamp(earlierOpportunity?.calendarDateRef);
      const laterTime = explicitTimestamp(laterOpportunity?.calendarDateRef);
      const elapsedMinutes = earlierTime !== null && laterTime !== null ? (laterTime - earlierTime) / 60_000 : null;
      const result: PostPrescriptionWeekSpacingResult = "spacing_policy_not_defined";
      traces.push({
        weeklyObjectiveId: objective.weeklyObjectiveId,
        earlierReservationId: earlier.id,
        laterReservationId: later.id,
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

function failureCodesBySubgate(input: {
  readonly contractValid: boolean;
  readonly policyStatus: ReturnType<typeof resolvePolicy>["status"];
  readonly extraArtifactCount: number;
  readonly sessions: readonly SessionAdmissibilityTrace[];
  readonly integrity: SourceEventIntegrityTrace;
  readonly ledger: readonly PlannedSourceExposureLedgerEntry[];
  readonly objectives: readonly WeeklyObjectivePrescribedRealizationTrace[];
  readonly completeStatus: PostPrescriptionWeekArgumentStatus;
}): Readonly<Record<PostPrescriptionWeekGate13Subgate, readonly string[]>> {
  const missingArtifacts = input.sessions.filter((session) => session.status === "missing_session_artifact");
  const sourceFailures = input.integrity.reasonCodes;
  const unknownBlocks = input.ledger.flatMap((event) => event.blockPurposeViews)
    .filter((block) => block.contributionClassification === "unknown_requires_review");
  const mappingFailures = input.objectives.filter((objective) => objective.status === "source_trace_incomplete" ||
    objective.status === "prescribed_realization_incompatible");
  const frequencyFailures = input.objectives.filter((objective) => objective.priority === "required" && [
    "prescribed_realization_missing", "prescribed_below_minimum_unresolved", "allocation_present_prescription_missing",
    "prescription_present_sequence_missing", "definitely_over_budget_requires_week_review",
  ].includes(objective.status));
  return {
    "13.0_week_input_truth": [
      ...(!input.contractValid ? ["UNSUPPORTED_VALIDATION_CONTRACT"] : []),
      ...(input.policyStatus !== "resolved" ? [`POLICY_${input.policyStatus.toUpperCase()}`] : []),
    ],
    "13.1_session_completeness": [
      ...(missingArtifacts.length > 0 ? ["MISSING_SESSION_ARTIFACT"] : []),
      ...(input.extraArtifactCount > 0 ? ["EXTRA_SESSION_ARTIFACT"] : []),
    ],
    "13.2_source_event_integrity": sourceFailures,
    "13.3_block_contribution_truth": unknownBlocks.length > 0 ? ["UNKNOWN_BLOCK_CONTRIBUTION_REQUIRES_REVIEW"] : [],
    "13.4_weekly_objective_mapping": mappingFailures.length > 0 ? ["WEEK_OBJECTIVE_SOURCE_TRACE_INCOMPLETE"] : [],
    "13.5_prescribed_frequency_distribution": frequencyFailures.length > 0 ? ["REQUIRED_PRESCRIBED_REALIZATION_MISSING"] : [],
    "13.6_dose_lane_truth": [],
    "13.7_stress_concentration_duration": [],
    "13.8_spacing_truth": [],
    "13.9_complete_prescribed_week_argument": [
      ...(!["coherent_within_supported_scope", "coherent_with_unresolved_dose_sufficiency", "unsupported_policy_scope"]
        .includes(input.completeStatus) ? [`COMPLETE_WEEK_ARGUMENT:${input.completeStatus}`] : []),
    ],
  };
}

function buildGate13Trace(failures: ReturnType<typeof failureCodesBySubgate>): readonly PostPrescriptionWeekGate13Trace[] {
  let stopped = false;
  return POST_PRESCRIPTION_WEEK_GATE_13_SUBGATES.map((subgate) => {
    const reasons = failures[subgate];
    if (stopped) return { subgate, state: "SHADOW_DIAGNOSTIC_ONLY", scored: false, reasonCodes: reasons };
    if (reasons.length > 0) {
      stopped = true;
      return { subgate, state: "FAIL_STOP", scored: true, reasonCodes: reasons };
    }
    return { subgate, state: "PASS", scored: true, reasonCodes: [`${subgate.toUpperCase()}:PASS`] };
  });
}

function completeStatus(input: {
  readonly policyStatus: ReturnType<typeof resolvePolicy>["status"];
  readonly sessions: readonly SessionAdmissibilityTrace[];
  readonly integrity: SourceEventIntegrityTrace;
  readonly objectives: readonly WeeklyObjectivePrescribedRealizationTrace[];
}): PostPrescriptionWeekArgumentStatus {
  if (input.policyStatus === "required" || input.policyStatus === "unavailable") return "weekly_policy_required";
  if (input.policyStatus === "conflict") return "weekly_policy_conflict";
  if (input.sessions.some((session) => session.status === "missing_session_artifact")) return "incomplete_due_to_missing_session_artifact";
  if (input.sessions.some((session) => session.status === "invalid_identity_chain") || input.integrity.reasonCodes.length > 0) {
    return "invalid_source_exposure_ledger";
  }
  if (input.sessions.some((session) => session.status === "blocked_by_training_readiness")) return "blocked_by_training_readiness";
  if (input.sessions.some((session) => session.status === "incomplete_prescription")) return "incomplete_due_to_prescription";
  if (input.sessions.some((session) => ["incomplete_sequencing", "search_inconclusive"].includes(session.status))) {
    return "incomplete_due_to_sequencing";
  }
  if (input.objectives.some((objective) => objective.status === "unsupported_objective_scope")) return "unsupported_policy_scope";
  if (input.objectives.some((objective) => objective.priority === "required" && [
    "prescribed_realization_missing", "prescribed_below_minimum_unresolved", "allocation_present_prescription_missing",
    "prescription_present_sequence_missing", "prescribed_realization_incompatible",
  ].includes(objective.status))) return "required_prescribed_realization_missing";
  if (input.sessions.some((session) => session.status === "definitely_over_budget")) return "week_reallocation_review_required";
  if (input.sessions.some((session) => session.status === "prescribed_duration_unresolved") ||
      input.objectives.some((objective) => objective.dosePolicyState === "prescribed_dose_target_not_defined")) {
    return "coherent_with_unresolved_dose_sufficiency";
  }
  return "coherent_within_supported_scope";
}

export function validatePostPrescriptionWeekDesign(
  input: PostPrescriptionWeekValidationInput,
): PostPrescriptionWeekValidationResult {
  const policyResolution = resolvePolicy(input);
  const artifactByReservationId = new Map(input.sessionArtifacts.map((artifact) => [artifact.reservationId, artifact]));
  const sessions = input.orderedReservations.map((reservation) => classifySession(
    reservation.id, reservation.opportunityId, artifactByReservationId.get(reservation.id),
  ));
  const ledger = buildLedgerEntries(input, sessions);
  const integrity = sourceIntegrity(input, ledger);
  const objectives = buildObjectiveTraces(input, ledger, sessions, policyResolution.policy);
  const burdenVectors = buildBurdenVectors(input, ledger);
  const concentrationTraces = buildConcentrationTraces(ledger, burdenVectors);
  const spacingTraces = buildSpacingTraces(input, objectives);
  const weeklyDurationView = buildWeeklyDuration(input, sessions);
  const status = completeStatus({ policyStatus: policyResolution.status, sessions, integrity, objectives });
  const reservationIds = new Set(input.orderedReservations.map((reservation) => reservation.id));
  const extraArtifactCount = input.sessionArtifacts.filter((artifact) => !reservationIds.has(artifact.reservationId)).length;
  const contractValid = input.validationContract.contractId === POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT_REFERENCE.contractId &&
    input.validationContract.contractVersion === POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT_REFERENCE.contractVersion;
  const gate13Trace = buildGate13Trace(failureCodesBySubgate({
    contractValid, policyStatus: policyResolution.status, extraArtifactCount, sessions, integrity, ledger, objectives, completeStatus: status,
  }));
  const unsupportedScopes = policyResolution.policy?.unsupportedScopes ?? [];
  const argument = {
    status,
    requiredObjectivesPresent: !objectives.some((objective) => objective.priority === "required" &&
      objective.status === "prescribed_realization_missing"),
    allocationsPreserved: true,
    sessionsBelongToReservations: extraArtifactCount === 0,
    assignmentsMapToOneSourceEvent: integrity.missingEventCount === 0,
    sourceEventsUnique: integrity.duplicateEventCount === 0 && integrity.crossSessionEventCollisionCount === 0,
    finalPrescriptionRevisionsPreserved: integrity.stalePrescriptionRevisionCount === 0,
    finalSequenceRevisionsPreserved: integrity.staleSequenceRevisionCount === 0,
    minimumPrescribedOpportunitiesMet: !objectives.some((objective) => objective.priority === "required" && objective.minimumState === "below"),
    supportingLanesSeparate: true,
    relationshipsPreserved: true,
    noncommensurableDoseModesSeparate: true,
    overBudgetSessionsExposed: sessions.filter((session) => session.status === "definitely_over_budget").length ===
      weeklyDurationView.definitelyOverBudgetReservationIds.length,
    unknownDurationsExposed: sessions.filter((session) => session.status === "prescribed_duration_unresolved").length <=
      weeklyDurationView.unresolvedReservationIds.length,
    spacingUnknownsExposed: true,
    unsupportedScopesExplicit: unsupportedScopes.length > 0,
    validationAddedExerciseCount: 0 as const,
    validationRemovedExerciseCount: 0 as const,
    plannedFactsCalledCompletedCount: 0 as const,
    reasonCodes: [status.toUpperCase()],
  };
  return {
    validationContract: POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT_REFERENCE,
    authority: "POST_PRESCRIPTION_WEEK_VALIDATION_DESIGN_EVIDENCE",
    productionActivationStatus: "NOT_ACTIVATED",
    athleteId: input.athleteId,
    weeklyIntentId: input.weeklyIntent.id,
    weekAllocationPlanId: `week-allocation-plan:${input.weekAllocationPlan.weeklyIntentId}`,
    planningHorizonId: input.planningHorizon.id,
    status,
    sourceExposureLedger: ledger,
    objectiveRealizationTraces: objectives,
    sessionAdmissibilityTraces: sessions,
    doseLaneSummaries: ledger.flatMap((entry) => entry.doseLanes),
    muscleRelationshipViews: ledger.flatMap((entry) => entry.muscleContributionViews),
    movementActionCapacityViews: ledger.map((entry) => entry.movementActionCapacityView),
    stressTraces: ledger.flatMap((entry) => entry.stressExposureViews),
    burdenVectors,
    concentrationTraces,
    spacingTraces,
    weeklyDurationView,
    sourceEventIntegrityTrace: integrity,
    completeWeekArgument: argument,
    unsupportedScopes,
    unresolvedPolicies: [
      ...unsupportedScopes,
      ...(policyResolution.policy?.spacingPolicy === "SPACING_R0_PRESCRIPTION_PENDING" ? ["SPACING_R0_PRESCRIPTION_PENDING"] : []),
      ...(policyResolution.policy?.h2Disposition ? [policyResolution.policy.h2Disposition] : []),
    ],
    gate13Trace,
    decisionTrace: {
      inputAuthorityTrace: POST_PRESCRIPTION_WEEK_INPUT_AUTHORITY,
      policyResolutionTrace: policyResolution.trace,
      sessionInventoryTrace: sessions.map((session) => `${session.reservationId}:${session.status}`),
      identityTrace: integrity.reasonCodes.length > 0 ? integrity.reasonCodes : ["SOURCE_EVENT_IDENTITY_PRESERVED"],
      blockContributionTrace: sortedUnique(ledger.flatMap((event) => event.blockPurposeViews
        .map((block) => `${block.blockId}:${block.contributionClassification}`))),
      objectiveMappingTrace: objectives.map((objective) => `${objective.weeklyObjectiveId}:${objective.status}`),
      doseLaneTrace: sortedUnique(ledger.flatMap((event) => event.doseLanes.map((lane) => `${lane.blockId}:${lane.mode}`))),
      stressDurationTrace: [
        `STRESS_TRACE_COUNT:${ledger.flatMap((entry) => entry.stressExposureViews).length}`,
        `WEEK_DURATION_UPPER:${weeklyDurationView.knownUpperBoundSeconds ?? "UNKNOWN"}`,
      ],
      spacingTrace: spacingTraces.length > 0 ? spacingTraces.map((trace) => `${trace.weeklyObjectiveId}:${trace.result}`) : ["NO_MULTI_SESSION_OBJECTIVE_SPACING_PAIR"],
      noDownstreamRescueTrace: gate13Trace.some((gate) => gate.state === "FAIL_STOP")
        ? ["EARLIEST_GATE_FAILURE_RETAINED", "LATER_SUBGATES_SHADOW_ONLY"] : ["NO_DOWNSTREAM_RESCUE_ATTEMPTED"],
      completedPerformanceConsumed: false,
      longitudinalDecisionConsumed: false,
      finalReasonCodes: [status.toUpperCase()],
    },
    provenance: [{ source: "synthetic_contract_fixture", sourceRef: `post-prescription-week-design:${input.weeklyIntent.id}` }],
  };
}
