import { deriveAlignmentPriorities } from "../alignment";
import { buildTrainingReadinessTrace, NO_TRAINING_SAFETY_SIGNALS } from "../domain/trainingSafety";
import { EMPTY_TRAINING_HISTORY } from "../domain/history";
import { NO_PAIN_OR_INJURY, type PainAndInjuryState } from "../domain/painInjury";
import { THREE_PHASE_FOUNDATION } from "../domain/phase";
import type { AthleteProfile } from "../domain/athlete";
import type { CurrentSessionEquipment, SessionAllocationDirective } from "../domain/sessionPlanningDirective";
import {
  ANCHORED_BANDS_EQUIPMENT,
  BODYWEIGHT_EQUIPMENT,
  DUMBBELLS_AND_BENCH_EQUIPMENT,
  FULL_GYM_EQUIPMENT,
} from "../data/goldenPersonas";
import { PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES } from "../data/referenceExercises";
import { buildSessionCandidateResults } from "../sessionComposer/candidatePools";
import { composeSessionSkeleton } from "../sessionComposer/composeSessionSkeleton";
import { buildSessionPrescriptionHandoff } from "../sessionComposer/prescriptionHandoff";
import { deriveCanonicalCompositionFacts } from "../sessionComposer/compositionFacts";
import { buildSessionSequencingInput } from "../sessionComposer/sequencingHandoff";
import { planSessionIntent } from "../sessionPlanner/planSessionIntent";
import type { SessionIntentPlannerInput } from "../sessionPlanner/contracts";
import {
  materializeSupportedPurposeObjectiveV1_1,
  planSupportedPurposeWeeklyIntentV1_1,
  composeSupportedPurposeWeekV1_1,
  PRODUCTION_WEEK_POLICY_V2,
  type MaterializedAllocatedObjectiveV1_1,
  type ProductionExplicitWeeklyPriorityV1_1,
} from "../weekPlanningV1_1";
import {
  compileSessionPrescription,
  PRESCRIPTION_POLICY_V1,
  type PrescriptionCompilationContextFacts,
  type PrescriptionLocalPurpose,
  type PrescriptionSessionCompilerInput,
} from "../prescription";
import {
  PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
  SESSION_SEQUENCING_POLICY_V1,
  sequenceFinalSession,
  type FinalSequencingSearchResourcePolicy,
} from "../sequencing";
import {
  POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE,
  PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE,
  validatePostPrescriptionWeek,
  type ProductionPostPrescriptionWeekValidationInput,
  type ProductionWeekObjectiveSnapshot,
  type ProductionWeekReservationSnapshot,
} from "../weekValidation";
import { buildProductionPhaseProgramSnapshot } from "../phaseContinuity";
import { deterministicToken, stableId, uniqueSorted } from "../prescription/compiler/utilities";
import {
  buildOwnerProgramProjection,
  type OwnerGenerationCommand,
  type OwnerGetStrongerProfileRevision,
  type OwnerPipelineStageArtifact,
  type OwnerProgramProjection,
  type ProposedOwnerImportFact,
} from "./contracts";

const ENGINE_POLICY_VERSIONS = Object.freeze([
  "PRODUCTION_WEEK_POLICY_V2@2.0.0",
  "PRESCRIPTION_POLICY_V1@1.0.0",
  "SESSION_SEQUENCING_POLICY_V1@1.0.0",
  "POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE@1.0.0",
]);

const OWNER_FINAL_SEQUENCE_SEARCH_POLICY: FinalSequencingSearchResourcePolicy = Object.freeze({
  policyId: "FINAL_SEQUENCING_EXACT_SEARCH_RESOURCE_POLICY",
  version: "1.0.0",
  mode: "exact_only",
  maximumStatesExpanded: 100_000,
  maximumLegalCompleteOrdersEvaluated: 100_000,
  onLimit: "RETURN_SEARCH_INCONCLUSIVE",
  provenance: Object.freeze({ source: "policy", sourceRef: "controlled-owner-delivery:exact-search" }),
});

type WeeklyIntent = ReturnType<typeof planSupportedPurposeWeeklyIntentV1_1>;
type WeekPlan = ReturnType<typeof composeSupportedPurposeWeekV1_1>;
type Planning = ReturnType<typeof planSessionIntent>;
type Candidates = ReturnType<typeof buildSessionCandidateResults>;
type Skeleton = ReturnType<typeof composeSessionSkeleton>;
type Handoff = ReturnType<typeof buildSessionPrescriptionHandoff>;
type Compilation = ReturnType<typeof compileSessionPrescription>;
type Sequence = ReturnType<typeof sequenceFinalSession>;

interface SessionExecution {
  readonly opportunityId: string;
  readonly reservationId: string;
  readonly minutes: number | null;
  readonly materialized: readonly MaterializedAllocatedObjectiveV1_1[];
  readonly plannerInput: SessionIntentPlannerInput;
  readonly planning: Planning;
  readonly candidates: Candidates;
  readonly skeleton: Skeleton;
  readonly handoff: Handoff;
  readonly compilation: Compilation;
  readonly sequence: Sequence;
}

export interface ControlledOwnerProductionPipelineInput {
  readonly command: OwnerGenerationCommand;
  readonly profile: OwnerGetStrongerProfileRevision;
  readonly proposedProductFacts: readonly ProposedOwnerImportFact[];
}

export interface ControlledOwnerProductionPipelineResult {
  readonly status: "complete" | "blocked";
  readonly stages: readonly OwnerPipelineStageArtifact[];
  readonly projection: OwnerProgramProjection | null;
  readonly unresolvedFacts: readonly string[];
  readonly genuineProductionStageCount: number;
  readonly productShadowCallCount: 0;
  readonly legacyGenerateProgramCallCount: 0;
  readonly pipelineFingerprint: string;
}

function artifact(stage: OwnerPipelineStageArtifact["stage"], productionKernel: string,
  payload: unknown, reasonCodes: readonly string[] = []): OwnerPipelineStageArtifact {
  return Object.freeze({ stage, productionKernel, status: reasonCodes.length ? "blocked" : "complete",
    artifactFingerprint: deterministicToken({ stage, productionKernel, payload, reasonCodes }), payload,
    reasonCodes: Object.freeze(uniqueSorted(reasonCodes)) });
}

function equipmentFor(profile: OwnerGetStrongerProfileRevision) {
  const ids = profile.equipmentCapabilitySnapshot.capabilityIds;
  if (profile.equipmentCapabilitySnapshot.environment !== "home" || ids.includes("commercial_gym")) {
    return FULL_GYM_EQUIPMENT;
  }
  if (ids.some((id) => id.includes("dumbbell")) && ids.some((id) => id.includes("bench"))) {
    return DUMBBELLS_AND_BENCH_EQUIPMENT;
  }
  if (ids.some((id) => id.includes("band"))) return ANCHORED_BANDS_EQUIPMENT;
  return BODYWEIGHT_EQUIPMENT;
}

function painFor(profile: OwnerGetStrongerProfileRevision): PainAndInjuryState {
  return Object.freeze({ ...NO_PAIN_OR_INJURY,
    historicalSensitivities: Object.freeze(profile.painContext.regionIds.map((region, index) => Object.freeze({
      kind: "historical_sensitivity" as const,
      id: `owner-pain-context:${index}:${region}`,
      region: region.includes("shoulder") ? "shoulder" as const :
        region.includes("knee") ? "knee" as const :
          region.includes("lumbar") || region.includes("back") ? "lumbar_spine" as const : "ankle" as const,
      stressTags: region.includes("shoulder") ? ["horizontal_pressing" as const] :
        region.includes("knee") ? ["loaded_knee_flexion" as const] :
          region.includes("lumbar") || region.includes("back") ? ["loaded_hinge" as const] : ["high_impact" as const],
      preferredModification: "monitor" as const,
      description: "Confirmed structured owner limitation context.",
    }))) });
}

function weeklyPriority(profile: OwnerGetStrongerProfileRevision): ProductionExplicitWeeklyPriorityV1_1 {
  return Object.freeze({
    priorityId: `owner-strength-priority:${profile.revisionId}`,
    family: "strength",
    purpose: "movement_development",
    localPrescriptionPurpose: "strength_development",
    purposeAuthority: "primary_local_purpose",
    target: Object.freeze({ targetMovementRoles: Object.freeze(["horizontal_push"] as const),
      targetActionFunctions: Object.freeze([]), targetMuscles: Object.freeze(["chest"] as const),
      muscleRequirement: "primary_required", targetBodyRegions: Object.freeze(["shoulder"] as const) }),
    priority: "required",
    priorityOrder: 0,
    goalRelationships: Object.freeze([Object.freeze({ goal: "strength", relationship: "primary_weekly_goal",
      sourceEvidenceRefs: Object.freeze([`owner-profile:${profile.revisionId}`]) })]),
    sourceEvidenceRefs: Object.freeze([`owner-profile:${profile.revisionId}`, "product-goal:get_stronger"]),
  });
}

function athleteFor(profile: OwnerGetStrongerProfileRevision): AthleteProfile {
  return Object.freeze({ id: profile.userId, label: "Controlled owner", experience: profile.coarseExperience,
    primaryGoal: "strength", secondaryGoals: Object.freeze([]),
    preferences: Object.freeze({ preferredExerciseIds: Object.freeze(profile.familiarity
      .filter((entry) => entry.status === "known").map((entry) => entry.exerciseId)),
    dislikedExerciseIds: Object.freeze([]), varietyPreference: "low", notes: Object.freeze([]) }),
    availability: Object.freeze({ daysPerWeek: profile.daysPerWeek,
      minutesPerSession: profile.sessionMinutes.status === "known" ? profile.sessionMinutes.minutes : 45,
      preferredTrainingDays: Object.freeze([]) }) });
}

function directive(input: { readonly command: OwnerGenerationCommand; readonly profile: OwnerGetStrongerProfileRevision;
  readonly opportunityId: string; readonly minutes: number | null;
  readonly objectives: readonly MaterializedAllocatedObjectiveV1_1[] }): SessionAllocationDirective {
  return Object.freeze({ id: stableId("owner-session-directive", { commandId: input.command.commandId,
    opportunityId: input.opportunityId }), source: "future_week_composer", athleteId: input.profile.userId,
  sessionType: "ordinary_training", outcomeGoal: "strength", programmingContextModes: Object.freeze([]),
  currentSessionAvailability: Object.freeze({ availableMinutes: input.minutes ?? 45,
    structuralCapacity: input.minutes === null ? "standard" : input.minutes <= 30 ? "condensed" :
      input.minutes >= 60 ? "expanded" : "standard", provenance: "week_allocation",
    sourceRef: `owner-profile-opportunity:${input.opportunityId}` }),
  allocatedObjectives: Object.freeze(input.objectives.map((objective, index) => Object.freeze({
    id: objective.allocatedObjectiveId, kind: "dominant_main" as const, priority: objective.priority,
    priorityOrder: index, selectionTarget: Object.freeze({
      targetMovementRoles: Object.freeze(["horizontal_push"] as const),
      targetActionFunctions: Object.freeze([]), targetMuscles: Object.freeze(["chest"] as const),
      muscleRequirement: "primary_required" as const,
      targetBodyRegions: Object.freeze(["shoulder"] as const)}),
    sourceEvidence: Object.freeze([Object.freeze({ sourceKind: "future_week_allocation" as const,
      sourceId: objective.weeklyObjectiveId, evidenceRefs: objective.plannerProvenance.sourceEvidenceRefs })]),
    standaloneAdmissionDirection: "policy_default" as const, reasonCode: "OWNER_WEEK_STRENGTH_ALLOCATION",
    explanation: "Required strength objective allocated by the production Week planner." }))),
  neighboringSessionContextRefs: Object.freeze([]), unresolvedWeeklyContextRefs: Object.freeze([]),
  weekReallocationEvidenceRefs: Object.freeze([]), unresolvedContextObservations: Object.freeze([]),
  sourceTrace: Object.freeze({ owner: "future_week_composer", sourceRefs: Object.freeze([input.command.commandId]),
    transformationRuleIds: Object.freeze(["OWNER_WEEK_V1_1_EXACT_ALLOCATION"]) }),
  evaluationAsOf: input.command.evaluationTime });
}

function compilationContext(): PrescriptionCompilationContextFacts {
  return { familiarity: "unknown", returnAfterAbsence: false, painAwareLoadToleranceRegressionPermitted: false,
    reliablePriorPerformance: false, reviewedRegression: false, adverseResponseSupportsReducedDose: false,
    newEquipmentRealization: false, requiredPreparationDependency: false, reviewedRangeOrControlDependency: false,
    sharedPreparationDependency: false, successfulBoundedPriorPreparation: false,
    requiredActivationDependency: false, explicitControlRequirement: false, lowFatigueActivationSuitable: false,
    adverseActivationFatigueResponse: false, mainWorkPreserved: true, secondaryObjectiveRequired: false,
    secondaryWeeklyPriority: false, secondaryCapacitySupported: true, secondaryHigherPriorityConflict: false,
    secondaryNonRedundantUpstream: true, accessoryPriority: "optional", accessoryUniquePurposeActive: true,
    accessoryCoherencePreserved: true, overlappingExposureRepresented: false, firstExposure: true,
    insufficientResponseHistory: true, directObjectiveConfirmedUpstream: false,
    allocatedRecoveryResponsibility: false, successfulBreathResponse: false, sessionCapacityPreservesMainWork: true,
    carryPurpose: "accessory", stationaryMarchRealization: "count", reviewedAcclimationBlockCount: null,
    requestedTempoIntent: "natural", explicitPowerObjective: null,
    powerIntentPermittedByExerciseKnowledge: false, assessmentPriorityIds: [], alignmentPriorityIds: [],
    provenanceRefs: ["controlled-owner-delivery:confirmed-profile"] };
}

function compileSession(input: { readonly command: OwnerGenerationCommand; readonly profile: OwnerGetStrongerProfileRevision;
  readonly plannerInput: SessionIntentPlannerInput; readonly planning: Planning; readonly skeleton: Skeleton;
  readonly handoff: Handoff; readonly materialized: readonly MaterializedAllocatedObjectiveV1_1[] }): Compilation {
  const intent = input.planning.sessionIntent!;
  const purpose: PrescriptionLocalPurpose = input.materialized[0]?.localPrescriptionPurpose ?? "strength_development";
  const compilerInput: PrescriptionSessionCompilerInput = {
    sessionIntent: intent, sessionSkeleton: input.skeleton, handoff: input.handoff,
    athlete: input.plannerInput.athlete, exerciseRegistry: REFERENCE_EXERCISES,
    exerciseKnowledgeRegistry: REFERENCE_EXERCISES.map((entry) => entry.prescriptionKnowledge),
    currentEquipment: input.plannerInput.currentEquipment.capabilities,
    trainingReadiness: buildTrainingReadinessTrace({ trainingSafety: input.plannerInput.trainingSafety }),
    executionRequirements: [],
    contextByHandoffId: Object.fromEntries(input.handoff.assignments.map((assignment) =>
      [assignment.handoffId, compilationContext()])),
    continuityEvidenceByHandoffId: Object.fromEntries(input.handoff.assignments.map((assignment) =>
      [assignment.handoffId, null])),
    priorRealizationEvidenceByHandoffId: Object.fromEntries(input.handoff.assignments.map((assignment) =>
      [assignment.handoffId, null])), completedPerformanceReferences: [], responseReceiverEvidence: [],
    executionAttemptId: stableId("owner-generation-attempt", { commandId: input.command.commandId,
      intentId: intent.id }), evaluationTime: input.command.evaluationTime, policy: PRESCRIPTION_POLICY_V1,
    availablePolicies: [PRESCRIPTION_POLICY_V1],
    revisionContextByHandoffId: Object.fromEntries(input.handoff.assignments.map((assignment) =>
      [assignment.handoffId, null])),
  };
  void purpose;
  return compileSessionPrescription(compilerInput);
}

function executeSessions(input: ControlledOwnerProductionPipelineInput, weekPlan: WeekPlan): readonly SessionExecution[] {
  const equipment = equipmentFor(input.profile);
  const athlete = athleteFor(input.profile);
  const assessment = Object.freeze({ signals: Object.freeze([]), historicalWeaknesses: Object.freeze([]) });
  const grouped = new Map<string, MaterializedAllocatedObjectiveV1_1[]>();
  weekPlan.reservations.map(materializeSupportedPurposeObjectiveV1_1).forEach((entry) => {
    grouped.set(entry.opportunityId, [...(grouped.get(entry.opportunityId) ?? []), entry]);
  });
  return Object.freeze([...grouped.entries()].sort(([left], [right]) => left.localeCompare(right))
    .map(([opportunityId, objectives]) => {
      const opportunity = input.profile.sessionOpportunities.find((entry) => entry.opportunityId === opportunityId)!;
      const plannerInput: SessionIntentPlannerInput = Object.freeze({
        directive: directive({ command: input.command, profile: input.profile, opportunityId,
          minutes: opportunity.minutes, objectives }), athlete,
        phaseIntent: Object.freeze({ ...THREE_PHASE_FOUNDATION[1], primaryGoal: "strength" as const }),
        assessment, painAndInjury: painFor(input.profile), trainingSafety: NO_TRAINING_SAFETY_SIGNALS,
        currentEquipment: Object.freeze({ capabilities: equipment, provenance: "profile_default",
          sourceRef: input.profile.equipmentCapabilitySnapshot.sourceRevision }) satisfies CurrentSessionEquipment,
        history: EMPTY_TRAINING_HISTORY,
        trainingResponseHistory: EMPTY_TRAINING_HISTORY.trainingResponseHistory ?? { observations: [] },
        satisfiedPrerequisiteIds: Object.freeze(["push-up-plank-control", "hinge-control",
          "suitcase-carry-loaded-gait-setup"]), evaluationAsOf: input.command.evaluationTime,
      });
      const planning = planSessionIntent(plannerInput);
      if (planning.status !== "planned" || !planning.sessionIntent) {
        throw new Error(`OWNER_SESSION_INTENT_BLOCKED:${planning.status}`);
      }
      const candidates = buildSessionCandidateResults(planning.sessionIntent, {
        athlete, assessment, alignmentPriorities: deriveAlignmentPriorities(assessment).priorities,
        painAndInjury: plannerInput.painAndInjury, trainingSafety: plannerInput.trainingSafety,
        equipment, history: plannerInput.history, satisfiedPrerequisiteIds: plannerInput.satisfiedPrerequisiteIds,
        evaluationAsOf: input.command.evaluationTime,
      }, { candidatePool: REFERENCE_EXERCISES });
      const skeleton = composeSessionSkeleton({ intent: planning.sessionIntent, candidateResultsByNeed: candidates });
      const handoff = buildSessionPrescriptionHandoff({ intent: planning.sessionIntent, skeleton,
        candidateResultsByNeed: candidates });
      if (!skeleton.assignments.length || !handoff.assignments.length) throw new Error("OWNER_SESSION_COMPOSER_EMPTY");
      const compilation = compileSession({ command: input.command, profile: input.profile, plannerInput, planning,
        skeleton, handoff, materialized: objectives });
      if (compilation.status !== "compiled") throw new Error(`OWNER_PRESCRIPTION_BLOCKED:${compilation.status}`);
      const facts = deriveCanonicalCompositionFacts({ candidateResultsByNeed: candidates,
        continuity: planning.sessionIntent.continuityEvidence });
      const sequence = sequenceFinalSession({ sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
        policy: SESSION_SEQUENCING_POLICY_V1, availablePolicies: [SESSION_SEQUENCING_POLICY_V1],
        intent: planning.sessionIntent, skeleton, sequencingHandoff: buildSessionSequencingInput(skeleton),
        prescriptionSession: compilation,
        compositionFacts: skeleton.assignments.map((assignment) => facts.get(assignment.exerciseId)!),
        currentEquipment: equipment,
        equipmentRealizations: compilation.assignmentResults.flatMap((result) =>
          result.equipmentRealization ? [result.equipmentRealization] : []),
        explicitTransitionFacts: [], availableMinutes: planning.sessionIntent.availableMinutes,
        trainingReadiness: buildTrainingReadinessTrace({ trainingSafety: plannerInput.trainingSafety }),
        executionAttemptId: stableId("owner-generation-attempt", { commandId: input.command.commandId,
          intentId: planning.sessionIntent.id }), evaluationTime: input.command.evaluationTime,
        searchResourcePolicy: OWNER_FINAL_SEQUENCE_SEARCH_POLICY,
        availableSearchResourcePolicies: [OWNER_FINAL_SEQUENCE_SEARCH_POLICY], revisionContext: null });
      if (!sequence.plan) throw new Error(`OWNER_FINAL_SEQUENCE_BLOCKED:${sequence.status}`);
      return Object.freeze({ opportunityId,
        reservationId: stableId("owner-week-reservation", { commandId: input.command.commandId, opportunityId }),
        minutes: opportunity.minutes, materialized: Object.freeze(objectives), plannerInput, planning, candidates,
        skeleton, handoff, compilation, sequence });
    }));
}

function sourcePurpose(purpose: PrescriptionLocalPurpose): ProductionWeekObjectiveSnapshot["purpose"] {
  if (purpose === "hypertrophy_development") return "muscle_development";
  if (purpose === "direct_development") return "direct_action_development";
  if (purpose === "capacity_development") return "capacity_development";
  return "movement_development";
}

function gateInput(input: ControlledOwnerProductionPipelineInput, intent: WeeklyIntent, weekPlan: WeekPlan,
  sessions: readonly SessionExecution[]): ProductionPostPrescriptionWeekValidationInput {
  const provenance = [Object.freeze({ source: "policy" as const,
    sourceRef: `controlled-owner-delivery:${input.command.commandId}` })];
  const intentById = new Map(intent.objectives.map((objective) => [objective.objectiveId, objective]));
  const objectives: readonly ProductionWeekObjectiveSnapshot[] = sessions.flatMap((session) =>
    session.materialized.map((materialized) => {
      const objective = intentById.get(materialized.weeklyObjectiveId)!;
      return { objectiveId: materialized.allocatedObjectiveId, purpose: sourcePurpose(objective.localPrescriptionPurpose),
        target: objective.target, priority: objective.priority, priorityOrder: objective.priorityOrder,
        goalRelationships: objective.goalRelationships,
        frequencyIntent: { minimumAllocatedSessions: 1, targetAllocatedSessions: 1,
          softMaximumAllocatedSessions: 1, sourceRef: materialized.responsibilityId, provenance },
        supportedPolicyRef: PRODUCTION_WEEK_POLICY_V2.reference,
        dosePolicyState: "explicit_reviewed_target" as const,
        spacingState: "SPACING_R0_PRESCRIPTION_PENDING" as const,
        sourceEvidenceRefs: objective.sourceEvidenceRefs, provenance };
    }));
  const reservations: readonly ProductionWeekReservationSnapshot[] = sessions.map((session) => ({
    reservationId: session.reservationId, opportunityId: session.opportunityId,
    allocatedObjectiveIds: session.materialized.map((entry) => entry.allocatedObjectiveId),
    expectedSessionGoal: "strength", responsibilityEvidenceRefs: session.materialized.flatMap((entry) =>
      entry.plannerProvenance.sourceEvidenceRefs), availabilityState: "available", executionState: "not_started",
    invalidationState: "active", provenance }));
  return { validatorContract: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE,
    validationPolicy: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE,
    availableValidationPolicies: [POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE],
    weekSource: { sourceContract: PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE,
      sourceSnapshotId: input.command.sourceProductSnapshotId,
      sourceSnapshotRevisionId: input.command.sourceProductRevisionId, sourceAuthority: "COMPATIBILITY_ADAPTER",
      athleteId: input.profile.userId, planningHorizonId: stableId("owner-product-horizon", input.command),
      weeklyIntentId: intent.intentId, weekAllocationPlanId: weekPlan.planId,
      horizonBoundary: { startsAt: null, endsAt: null, timezone: "America/Toronto" },
      opportunities: input.profile.sessionOpportunities.map((entry) => ({ opportunityId: entry.opportunityId,
        order: entry.order, calendarDateTime: null, availableMinutes: entry.minutes, availabilityState: "available",
        executionState: "not_started", reservationIds: reservations.filter((reservation) =>
          reservation.opportunityId === entry.opportunityId).map((reservation) => reservation.reservationId), provenance })),
      objectives, reservations,
      allocationTraces: sessions.flatMap((session) => session.materialized.map((objective) => ({
        allocationTraceId: stableId("owner-allocation-trace", objective), objectiveId: objective.allocatedObjectiveId,
        reservationId: session.reservationId, opportunityId: session.opportunityId,
        sessionDirectiveId: session.planning.sessionIntent?.id ?? null,
        sessionNeedIds: session.planning.sessionIntent!.needs.filter((need) =>
          need.plannerProvenance?.objectiveIds.includes(objective.allocatedObjectiveId) ?? false).map((need) => need.id),
        sourceEvidenceRefs: objective.plannerProvenance.sourceEvidenceRefs, provenance }))),
      unsupportedScopes: [], unresolvedPolicyRefs: [], evaluationTime: input.command.evaluationTime, provenance },
    sessionBundles: sessions.map((session) => ({ reservationId: session.reservationId,
      opportunityId: session.opportunityId, sessionIntentId: session.planning.sessionIntent!.id,
      executionAttemptId: stableId("owner-generation-attempt", { commandId: input.command.commandId,
        intentId: session.planning.sessionIntent!.id }), sessionIntent: session.planning.sessionIntent!,
      sessionSkeleton: session.skeleton, prescriptionCompilation: session.compilation,
      sequencingResult: session.sequence, expectedArtifactState: "expected", provenance })),
    exerciseRegistry: REFERENCE_EXERCISES, evaluationTime: input.command.evaluationTime,
    upstreamGateState: "PASS", priorValidationRevisionContext: null };
}

function displayProjection(input: ControlledOwnerProductionPipelineInput, intent: WeeklyIntent,
  sessions: readonly SessionExecution[], unresolvedFacts: readonly string[]): OwnerProgramProjection {
  return buildOwnerProgramProjection({ goal: "strength", mode: "develop",
    weekObjectiveIds: intent.objectives.map((objective) => objective.objectiveId),
    sessions: Object.freeze(sessions.map((session) => Object.freeze({
      sessionId: session.planning.sessionIntent!.id, opportunityId: session.opportunityId,
      purpose: "strength_development", durationStatus: session.minutes === null ? "unknown" : "known",
      durationMinutes: session.minutes,
      exerciseAssignments: Object.freeze(session.handoff.assignments.map((assignment) => {
        const plan = session.compilation.plans.find((entry) => entry.exerciseId === assignment.exerciseId);
        const block = plan?.doseBlocks[0];
        const realization = session.compilation.assignmentResults.find((entry) =>
          entry.handoffAssignment?.handoffId === assignment.handoffId)?.equipmentRealization ?? null;
        const dose = block?.dose;
        const setTarget = dose && "sets" in dose ? dose.sets : null;
        const sets = setTarget?.kind === "exact" ? setTarget.value : null;
        const repetitionTarget = dose && "repetitions" in dose ? dose.repetitions :
          dose && "steps" in dose ? dose.steps : dose && "duration" in dose ? dose.duration : null;
        const rest = dose?.rest;
        return Object.freeze({ assignmentId: assignment.handoffId, exerciseId: assignment.exerciseId,
          realizationId: realization?.realizationId ?? null,
          sourceEventId: plan?.sourceExposureEvent.sourceExposureEventId ?? null,
          prescriptionRevisionId: plan?.prescriptionRevisionId ?? null,
          sets, reps: repetitionTarget ? JSON.stringify(repetitionTarget) : "unknown",
          tempo: dose && "tempo" in dose && dose.tempo ? JSON.stringify(dose.tempo) : null,
          restSeconds: rest?.kind === "exact" ? rest.value : null,
          effort: dose?.effort ? JSON.stringify(dose.effort) : null,
          equipmentRequirementIds: Object.freeze(realization?.requirementTraces.map((trace) =>
            trace.requirementId) ?? []),
          reasonCodes: Object.freeze(plan?.rationaleReasonCodes ?? []) });
      })), practiceModes: Object.freeze(["full", "lighter", "recovery"] as const) }))),
    unresolvedFacts, safetyState: input.profile.trainingSafety, engineVersion: input.command.engineVersion,
    policyVersions: input.command.policyVersions });
}

export function runControlledOwnerProductionPipeline(
  input: ControlledOwnerProductionPipelineInput,
): ControlledOwnerProductionPipelineResult {
  const stages: OwnerPipelineStageArtifact[] = [];
  const unresolvedFacts = input.profile.sessionMinutes.status === "explicit_unknown"
    ? ["OWNER_SESSION_DURATION_EXPLICIT_UNKNOWN"] : [];
  try {
    const mapping = Object.freeze({ sourceGoal: "get_stronger", trainingOutcome: "strength",
      sourceProductSnapshotId: input.command.sourceProductSnapshotId,
      sourceProductRevisionId: input.command.sourceProductRevisionId,
      proposedFactReferences: input.proposedProductFacts.map((fact) => Object.freeze({ factId: fact.factId,
        status: fact.status, sourceRevision: fact.sourceRevision })) });
    stages.push(artifact("product_mapping", "mapGetStrongerProductGoalToStrength", mapping));
    const horizon = Object.freeze({ horizonId: stableId("owner-product-horizon", input.command),
      athleteId: input.profile.userId, opportunityIds: input.profile.sessionOpportunities.map((entry) =>
        entry.opportunityId), evaluationTime: input.command.evaluationTime });
    stages.push(artifact("product_horizon", "buildControlledOwnerProductHorizon", horizon));
    const intent = planSupportedPurposeWeeklyIntentV1_1({ policy: PRODUCTION_WEEK_POLICY_V2,
      intentId: stableId("owner-week-intent", input.command), athleteId: input.profile.userId,
      outcomeGoal: "strength", priorities: [weeklyPriority(input.profile)],
      evaluationTime: input.command.evaluationTime });
    stages.push(artifact("week_intent", "planSupportedPurposeWeeklyIntentV1_1", intent));
    const weekPlan = composeSupportedPurposeWeekV1_1({ intent,
      opportunities: input.profile.sessionOpportunities.map((entry) => ({ opportunityId: entry.opportunityId,
        structuralCapacity: entry.minutes === null ? "unknown" : entry.minutes <= 30 ? "condensed" :
          entry.minutes >= 60 ? "expanded" : "standard" })) });
    stages.push(artifact("week_allocation", "composeSupportedPurposeWeekV1_1", weekPlan));
    const sessions = executeSessions(input, weekPlan);
    stages.push(artifact("session_intent", "planSessionIntent", sessions.map((entry) => entry.planning)));
    stages.push(artifact("candidate_intelligence", "buildSessionCandidateResults",
      sessions.map((entry) => entry.candidates)));
    stages.push(artifact("session_composer", "composeSessionSkeleton+buildSessionPrescriptionHandoff",
      sessions.map((entry) => ({ skeleton: entry.skeleton, handoff: entry.handoff }))));
    stages.push(artifact("prescription_compiler", "compileSessionPrescription",
      sessions.map((entry) => entry.compilation)));
    stages.push(artifact("final_sequencing", "sequenceFinalSession", sessions.map((entry) => entry.sequence)));
    const validationInput = gateInput(input, intent, weekPlan, sessions);
    const gate13 = validatePostPrescriptionWeek(validationInput);
    const gateReasons = gate13.status.startsWith("validated_") ? [] : [
      `OWNER_GATE_13:${gate13.status}`,
      ...gate13.decisionTrace.finalReasonCodes.map((code) => `OWNER_GATE_13_REASON:${code}`),
    ];
    stages.push(artifact("gate_13", "validatePostPrescriptionWeek", gate13, gateReasons));
    if (gateReasons.length) throw new Error(gateReasons.join(","));
    const phase = buildProductionPhaseProgramSnapshot({ weekSource: validationInput.weekSource,
      postPrescriptionWeekResult: gate13, sessionIntents: sessions.map((entry) => entry.planning.sessionIntent!),
      sessionSkeletons: sessions.map((entry) => entry.skeleton),
      prescriptionSessionResults: sessions.map((entry) => entry.compilation),
      finalSequencePlans: sessions.map((entry) => entry.sequence.plan!),
      phaseStateContext: { phaseId: "phase_2", phaseStateId: stableId("owner-phase-state", input.profile.userId),
        phaseStateRevisionId: stableId("owner-phase-state-revision", input.command.commandId) },
      evaluationTime: input.command.evaluationTime, basedOnRevisionId: null,
      provenance: ["controlled-owner-delivery:planned-truth-only"] });
    stages.push(artifact("phase_snapshot", "buildProductionPhaseProgramSnapshot", phase));
    const readiness = Object.freeze({ approvalAvailable: unresolvedFacts.length === 0,
      unresolvedFacts: Object.freeze(unresolvedFacts), profileRevisionId: input.profile.revisionId,
      productRevisionId: input.command.sourceProductRevisionId });
    stages.push(artifact("application_readiness", "validateControlledOwnerApplicationReadiness", readiness));
    const projection = displayProjection(input, intent, sessions, unresolvedFacts);
    stages.push(artifact("owner_envelope_projection", "buildOwnerProgramProjection", projection));
    return Object.freeze({ status: "complete", stages: Object.freeze(stages), projection,
      unresolvedFacts: Object.freeze(unresolvedFacts), genuineProductionStageCount: 13,
      productShadowCallCount: 0, legacyGenerateProgramCallCount: 0,
      pipelineFingerprint: deterministicToken(stages) });
  } catch (error) {
    const code = error instanceof Error ? error.message : "OWNER_GENERATION_UNKNOWN_FAILURE";
    return Object.freeze({ status: "blocked", stages: Object.freeze(stages), projection: null,
      unresolvedFacts: Object.freeze(uniqueSorted([...unresolvedFacts, code])),
      genuineProductionStageCount: stages.length, productShadowCallCount: 0,
      legacyGenerateProgramCallCount: 0, pipelineFingerprint: deterministicToken({ stages, code }) });
  }
}

export const CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS = ENGINE_POLICY_VERSIONS;
