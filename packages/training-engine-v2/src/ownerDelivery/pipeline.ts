import { deriveAlignmentPriorities } from "../alignment";
import { buildTrainingReadinessTrace, NO_TRAINING_SAFETY_SIGNALS } from "../domain/trainingSafety";
import { EMPTY_TRAINING_HISTORY } from "../domain/history";
import { NO_PAIN_OR_INJURY, type PainAndInjuryState } from "../domain/painInjury";
import { THREE_PHASE_FOUNDATION } from "../domain/phase";
import type { AthleteProfile } from "../domain/athlete";
import type { EquipmentCapabilities } from "../domain/equipment";
import type { CurrentSessionEquipment, SessionAllocationDirective } from "../domain/sessionPlanningDirective";
import { REFERENCE_EXERCISES } from "../data/referenceExercises";
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
import { projectOwnerPrescriptionDoseBlocks } from "./projection";

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
  readonly approvalAllowed: boolean;
  readonly programSemanticCompletenessSatisfied: boolean;
  readonly stages: readonly OwnerPipelineStageArtifact[];
  readonly projection: OwnerProgramProjection | null;
  readonly unresolvedFacts: readonly string[];
  readonly genuineProductionStageCount: number;
  readonly productShadowCallCount: 0;
  readonly legacyGenerateProgramCallCount: 0;
  readonly pipelineFingerprint: string;
}

export const OWNER_GET_STRONGER_RESPONSIBILITY_KEYS = Object.freeze([
  "knee_dominant_lower_body",
  "hinge_lower_body",
  "upper_body_push",
  "upper_body_pull",
] as const);

export interface OwnerProgramSemanticCompletenessInput {
  readonly weeklyResponsibilitiesComplete: boolean;
  readonly allocationCoverageComplete: boolean;
  readonly sessionNeedCoverageComplete: boolean;
  readonly assignmentCoverageComplete: boolean;
  readonly developmentalPrescriptionCoverageComplete: boolean;
  readonly projectionCoverageComplete: boolean;
  readonly availabilityNotAutomaticallyFilled: boolean;
  readonly exactEquipmentCapabilityPreserved: boolean;
}

export function evaluateOwnerProgramSemanticCompleteness(input: OwnerProgramSemanticCompletenessInput) {
  const definitions = Object.freeze([
    Object.freeze({ id: "OWNER_BROAD_STRENGTH_RESPONSIBILITIES_COMPLETE",
      satisfied: input.weeklyResponsibilitiesComplete }),
    Object.freeze({ id: "OWNER_WEEK_ALLOCATION_COVERS_REQUIRED_RESPONSIBILITIES",
      satisfied: input.allocationCoverageComplete }),
    Object.freeze({ id: "OWNER_SESSION_NEEDS_PRESERVE_ALLOCATED_RESPONSIBILITIES",
      satisfied: input.sessionNeedCoverageComplete }),
    Object.freeze({ id: "OWNER_ASSIGNMENTS_COVER_REQUIRED_SESSION_NEEDS",
      satisfied: input.assignmentCoverageComplete }),
    Object.freeze({ id: "OWNER_REQUIRED_ASSIGNMENTS_HAVE_DEVELOPMENTAL_PRESCRIPTION",
      satisfied: input.developmentalPrescriptionCoverageComplete }),
    Object.freeze({ id: "OWNER_PROJECTION_PRESERVES_ORDERED_PRESCRIPTION_BLOCKS",
      satisfied: input.projectionCoverageComplete }),
    Object.freeze({ id: "OWNER_AVAILABILITY_NOT_AUTOMATICALLY_FILLED",
      satisfied: input.availabilityNotAutomaticallyFilled }),
    Object.freeze({ id: "OWNER_EXACT_EQUIPMENT_CAPABILITIES_PRESERVED",
      satisfied: input.exactEquipmentCapabilityPreserved }),
  ]);
  const reasonCodes = Object.freeze(definitions.filter((entry) => !entry.satisfied).map((entry) => entry.id));
  return Object.freeze({ approvalAllowed: reasonCodes.length === 0, invariants: definitions, reasonCodes });
}

function artifact(stage: OwnerPipelineStageArtifact["stage"], productionKernel: string,
  payload: unknown, reasonCodes: readonly string[] = []): OwnerPipelineStageArtifact {
  return Object.freeze({ stage, productionKernel, status: reasonCodes.length ? "blocked" : "complete",
    artifactFingerprint: deterministicToken({ stage, productionKernel, payload, reasonCodes }), payload,
    reasonCodes: Object.freeze(uniqueSorted(reasonCodes)) });
}

export function buildOwnerEquipmentCapabilities(profile: OwnerGetStrongerProfileRevision): EquipmentCapabilities {
  const ids = new Set(profile.equipmentCapabilitySnapshot.capabilityIds);
  const bodyweight = ids.has("bodyweight");
  const dumbbells = ids.has("dumbbells");
  const barbellRack = ids.has("barbell_rack");
  const adjustableBench = ids.has("adjustable_bench");
  const cables = ids.has("cables");
  return Object.freeze({
    environment: profile.equipmentCapabilitySnapshot.environment === "commercial_gym" ?
      "commercial_gym" : "home",
    trainingSpace: Object.freeze({ stableLoadedStandingSpace: ids.has("stable_loaded_standing_space"),
      loadedGait: Object.freeze({ available: false }) }),
    bodyweight: Object.freeze({ floorSpace: bodyweight, wallAvailable: false,
      pullUpBar: ids.has("pull_up_station") }),
    bench: Object.freeze({ types: Object.freeze(adjustableBench ? ["adjustable" as const] : []),
      stable: adjustableBench }),
    dumbbells: Object.freeze({ available: dumbbells, pairAvailable: dumbbells, adjustable: false }),
    barbell: Object.freeze({ available: barbellRack, rackAvailable: barbellRack }),
    cables: Object.freeze({ available: cables, adjustableHeight: false, availableHeights: Object.freeze([]) }),
    bands: Object.freeze({ types: Object.freeze([]), anchors: Object.freeze([]) }),
    machines: Object.freeze({ availableMachineIds: Object.freeze([]) }),
    supportSurfaces: Object.freeze([]),
  });
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

export function buildOwnerGetStrongerWeeklyPriorities(
  profile: OwnerGetStrongerProfileRevision,
): readonly ProductionExplicitWeeklyPriorityV1_1[] {
  const definitions = [
    { key: OWNER_GET_STRONGER_RESPONSIBILITY_KEYS[0], roles: ["squat", "single_leg"] as const,
      muscles: ["quads", "glutes"] as const, regions: ["knee", "hip", "ankle"] as const },
    { key: OWNER_GET_STRONGER_RESPONSIBILITY_KEYS[1], roles: ["hinge"] as const,
      muscles: ["hamstrings", "glutes"] as const, regions: ["hip", "lumbar_spine"] as const },
    { key: OWNER_GET_STRONGER_RESPONSIBILITY_KEYS[2], roles: ["horizontal_push"] as const,
      muscles: ["chest", "triceps"] as const, regions: ["shoulder", "elbow"] as const },
    { key: OWNER_GET_STRONGER_RESPONSIBILITY_KEYS[3], roles: ["horizontal_pull"] as const,
      muscles: ["mid_back", "lats"] as const, regions: ["shoulder", "thoracic_spine"] as const },
  ];
  return Object.freeze(definitions.map((definition, priorityOrder) => Object.freeze({
    priorityId: `owner-strength-responsibility:${definition.key}:${profile.revisionId}`,
    family: "strength" as const,
    purpose: "movement_development" as const,
    localPrescriptionPurpose: "strength_development" as const,
    purposeAuthority: "primary_local_purpose" as const,
    target: Object.freeze({ targetMovementRoles: Object.freeze(definition.roles),
      targetActionFunctions: Object.freeze([]), targetMuscles: Object.freeze(definition.muscles),
      muscleRequirement: "any_meaningful_contributor" as const,
      targetBodyRegions: Object.freeze(definition.regions) }),
    priority: "required" as const,
    priorityOrder,
    goalRelationships: Object.freeze([Object.freeze({ goal: "strength" as const,
      relationship: "primary_weekly_goal" as const,
      sourceEvidenceRefs: Object.freeze([`owner-profile:${profile.revisionId}`]) })]),
    sourceEvidenceRefs: Object.freeze([`owner-profile:${profile.revisionId}`, "product-goal:get_stronger",
      "phase-intent:phase_2:whole-person-strength-capabilities"]),
  })));
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
  readonly objectives: readonly MaterializedAllocatedObjectiveV1_1[]; readonly intent: WeeklyIntent }): SessionAllocationDirective {
  return Object.freeze({ id: stableId("owner-session-directive", { commandId: input.command.commandId,
    opportunityId: input.opportunityId }), source: "future_week_composer", athleteId: input.profile.userId,
  sessionType: "ordinary_training", outcomeGoal: "strength", programmingContextModes: Object.freeze([]),
  currentSessionAvailability: Object.freeze({ availableMinutes: input.minutes ?? 45,
    structuralCapacity: input.minutes === null ? "standard" : input.minutes <= 30 ? "condensed" :
      input.minutes >= 60 ? "expanded" : "standard", provenance: "week_allocation",
    sourceRef: `owner-profile-opportunity:${input.opportunityId}` }),
  allocatedObjectives: Object.freeze(input.objectives.map((objective, index) => {
    const weeklyObjective = input.intent.objectives.find((entry) =>
      entry.objectiveId === objective.weeklyObjectiveId);
    if (!weeklyObjective) throw new Error("OWNER_WEEKLY_OBJECTIVE_TARGET_MISSING");
    return Object.freeze({
      id: objective.allocatedObjectiveId,
      kind: index === 0 ? "dominant_main" as const : "secondary_main" as const,
      priority: objective.priority,
      priorityOrder: index,
      selectionTarget: Object.freeze({
        ...weeklyObjective.target,
        targetMovementRoles: Object.freeze([...weeklyObjective.target.targetMovementRoles]),
        targetActionFunctions: Object.freeze([...weeklyObjective.target.targetActionFunctions]),
        targetMuscles: Object.freeze([...weeklyObjective.target.targetMuscles]),
        targetBodyRegions: Object.freeze([...weeklyObjective.target.targetBodyRegions]),
      }),
      sourceEvidence: Object.freeze([Object.freeze({ sourceKind: "future_week_allocation" as const,
        sourceId: objective.weeklyObjectiveId, evidenceRefs: objective.plannerProvenance.sourceEvidenceRefs })]),
      standaloneAdmissionDirection: "policy_default" as const,
      reasonCode: "OWNER_WEEK_STRENGTH_ALLOCATION",
      explanation: "Required strength objective allocated by the production Week planner.",
    });
  })),
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

function executeSessions(input: ControlledOwnerProductionPipelineInput, intent: WeeklyIntent,
  weekPlan: WeekPlan): readonly SessionExecution[] {
  const equipment = buildOwnerEquipmentCapabilities(input.profile);
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
          minutes: opportunity.minutes, objectives, intent }), athlete,
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
        const block = plan?.doseBlocks.find((entry) => entry.purpose === "developmental_work") ??
          plan?.doseBlocks[0];
        const doseBlocks = plan ? projectOwnerPrescriptionDoseBlocks(plan) : Object.freeze([]);
        const projectedBlock = doseBlocks.find((entry) => entry.blockId === block?.blockId);
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
          sets, reps: projectedBlock?.target ?? (repetitionTarget ? "Calibration required" : "unknown"),
          tempo: projectedBlock?.tempo ?? null,
          restSeconds: rest?.kind === "exact" ? rest.value : null,
          effort: projectedBlock?.effort ?? null,
          doseBlocks,
          equipmentRequirementIds: Object.freeze(realization?.requirementTraces.map((trace) =>
            trace.requirementId) ?? []),
          reasonCodes: Object.freeze(plan?.rationaleReasonCodes ?? []) });
      })), practiceModes: Object.freeze(["full", "lighter", "recovery"] as const) }))),
    unresolvedFacts, safetyState: input.profile.trainingSafety, engineVersion: input.command.engineVersion,
    policyVersions: input.command.policyVersions });
}

function semanticCompleteness(input: { readonly profile: OwnerGetStrongerProfileRevision;
  readonly intent: WeeklyIntent; readonly weekPlan: WeekPlan; readonly sessions: readonly SessionExecution[];
  readonly projection: OwnerProgramProjection }): ReturnType<typeof evaluateOwnerProgramSemanticCompleteness> {
  const expectedTargets = [
    ["single_leg", "squat"],
    ["hinge"],
    ["horizontal_push"],
    ["horizontal_pull"],
  ].map((roles) => roles.join("|"));
  const actualTargets = input.intent.objectives.map((objective) =>
    [...objective.target.targetMovementRoles].sort().join("|"));
  const allocationCounts = new Map(input.intent.objectives.map((objective) => [objective.objectiveId, 0]));
  input.weekPlan.reservations.forEach((reservation) => allocationCounts.set(reservation.weeklyObjectiveId,
    (allocationCounts.get(reservation.weeklyObjectiveId) ?? 0) + 1));
  const requiredNeedIds = input.sessions.flatMap((session) => session.planning.sessionIntent!.needs
    .filter((need) => need.priority === "required").map((need) => need.id));
  const coveredNeedIds = new Set(input.sessions.flatMap((session) => session.handoff.assignments
    .flatMap((assignment) => assignment.satisfiedNeedIds)));
  const allPlans = input.sessions.flatMap((session) => session.compilation.plans);
  const projectedAssignments = input.projection.sessions.flatMap((session) => session.exerciseAssignments);
  const exactEquipment = buildOwnerEquipmentCapabilities(input.profile);
  const capabilityIds = new Set(input.profile.equipmentCapabilitySnapshot.capabilityIds);
  const targetSessionCount = Math.min(input.profile.sessionOpportunities.length,
    Math.max(...input.intent.objectives.map((objective) => objective.frequencyIntent.targetAllocatedSessions)));
  return evaluateOwnerProgramSemanticCompleteness({
    weeklyResponsibilitiesComplete: actualTargets.length === expectedTargets.length &&
      expectedTargets.every((target) => actualTargets.includes(target)),
    allocationCoverageComplete: input.intent.objectives.every((objective) => {
      const count = allocationCounts.get(objective.objectiveId) ?? 0;
      return count >= objective.frequencyIntent.minimumAllocatedSessions &&
        count <= objective.frequencyIntent.targetAllocatedSessions;
    }),
    sessionNeedCoverageComplete: input.sessions.every((session) => session.materialized.every((materialized) =>
      session.planning.sessionIntent!.needs.some((need) =>
        need.plannerProvenance?.objectiveIds.includes(materialized.allocatedObjectiveId)))),
    assignmentCoverageComplete: requiredNeedIds.every((needId) => coveredNeedIds.has(needId)),
    developmentalPrescriptionCoverageComplete: allPlans.length === projectedAssignments.length &&
      allPlans.every((plan) => plan.doseBlocks.some((block) => block.purpose === "developmental_work")),
    projectionCoverageComplete: projectedAssignments.every((assignment) => {
      const plan = allPlans.find((entry) => entry.prescriptionRevisionId === assignment.prescriptionRevisionId);
      return Boolean(plan && assignment.doseBlocks && assignment.doseBlocks.length === plan.doseBlocks.length &&
        assignment.doseBlocks.every((block, index) => block.blockId === plan.doseBlocks[index]?.blockId));
    }),
    availabilityNotAutomaticallyFilled: input.sessions.length === targetSessionCount,
    exactEquipmentCapabilityPreserved: exactEquipment.machines.availableMachineIds.length === 0 &&
      exactEquipment.bands.types.length === 0 && exactEquipment.bands.anchors.length === 0 &&
      !exactEquipment.trainingSpace.loadedGait.available &&
      exactEquipment.trainingSpace.stableLoadedStandingSpace ===
        capabilityIds.has("stable_loaded_standing_space") &&
      exactEquipment.dumbbells.available === capabilityIds.has("dumbbells") &&
      exactEquipment.bench.stable === capabilityIds.has("adjustable_bench") &&
      exactEquipment.barbell.available === capabilityIds.has("barbell_rack") &&
      exactEquipment.cables.available === capabilityIds.has("cables") &&
      exactEquipment.bodyweight.pullUpBar === capabilityIds.has("pull_up_station"),
  });
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
    const priorities = buildOwnerGetStrongerWeeklyPriorities(input.profile);
    const intent = planSupportedPurposeWeeklyIntentV1_1({ policy: PRODUCTION_WEEK_POLICY_V2,
      intentId: stableId("owner-week-intent", input.command), athleteId: input.profile.userId,
      outcomeGoal: "strength", priorities,
      evaluationTime: input.command.evaluationTime });
    stages.push(artifact("week_intent", "planSupportedPurposeWeeklyIntentV1_1", intent));
    const weekPlan = composeSupportedPurposeWeekV1_1({ intent,
      opportunities: input.profile.sessionOpportunities.map((entry) => ({ opportunityId: entry.opportunityId,
        structuralCapacity: entry.minutes === null ? "unknown" : entry.minutes <= 30 ? "condensed" :
          entry.minutes >= 60 ? "expanded" : "standard" })),
      responsibilityPacking: "coherent_shared_sessions" });
    stages.push(artifact("week_allocation", "composeSupportedPurposeWeekV1_1", weekPlan));
    const sessions = executeSessions(input, intent, weekPlan);
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
    let projection = displayProjection(input, intent, sessions, unresolvedFacts);
    const completeness = semanticCompleteness({ profile: input.profile, intent, weekPlan, sessions, projection });
    const finalUnresolvedFacts = uniqueSorted([...unresolvedFacts, ...completeness.reasonCodes]);
    if (finalUnresolvedFacts.length !== unresolvedFacts.length) {
      projection = displayProjection(input, intent, sessions, finalUnresolvedFacts);
    }
    const readiness = Object.freeze({ approvalAvailable: finalUnresolvedFacts.length === 0,
      unresolvedFacts: Object.freeze(finalUnresolvedFacts), semanticCompleteness: completeness,
      profileRevisionId: input.profile.revisionId,
      productRevisionId: input.command.sourceProductRevisionId });
    stages.push(artifact("application_readiness", "validateControlledOwnerApplicationReadiness", readiness,
      completeness.reasonCodes));
    stages.push(artifact("owner_envelope_projection", "buildOwnerProgramProjection", projection));
    return Object.freeze({ status: "complete", approvalAllowed: readiness.approvalAvailable,
      programSemanticCompletenessSatisfied: completeness.approvalAllowed,
      stages: Object.freeze(stages), projection,
      unresolvedFacts: Object.freeze(finalUnresolvedFacts), genuineProductionStageCount: 13,
      productShadowCallCount: 0, legacyGenerateProgramCallCount: 0,
      pipelineFingerprint: deterministicToken(stages) });
  } catch (error) {
    const code = error instanceof Error ? error.message : "OWNER_GENERATION_UNKNOWN_FAILURE";
    return Object.freeze({ status: "blocked", approvalAllowed: false,
      programSemanticCompletenessSatisfied: false,
      stages: Object.freeze(stages), projection: null,
      unresolvedFacts: Object.freeze(uniqueSorted([...unresolvedFacts, code])),
      genuineProductionStageCount: stages.length, productShadowCallCount: 0,
      legacyGenerateProgramCallCount: 0, pipelineFingerprint: deterministicToken({ stages, code }) });
  }
}

export const CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS = ENGINE_POLICY_VERSIONS;
