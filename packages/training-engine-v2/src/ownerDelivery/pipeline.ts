import { deriveAlignmentPriorities } from "../alignment";
import type { AssessmentState } from "../domain/assessment";
import { buildTrainingReadinessTrace, NO_TRAINING_SAFETY_SIGNALS,
  type TrainingSafetyState } from "../domain/trainingSafety";
import { EMPTY_TRAINING_HISTORY } from "../domain/history";
import { NO_PAIN_OR_INJURY, type PainAndInjuryState } from "../domain/painInjury";
import { THREE_PHASE_FOUNDATION } from "../domain/phase";
import type { AthleteProfile } from "../domain/athlete";
import type { EquipmentCapabilities } from "../domain/equipment";
import type { ExerciseDefinition } from "../domain/exercise";
import { BODY_REGIONS, type BodyRegion, type JointStressTag } from "../domain/primitives";
import type { CurrentSessionEquipment } from "../domain/sessionPlanningDirective";
import { isLowFatigueActivationCandidate } from "../candidate";
import { REFERENCE_EXERCISES } from "../data/referenceExercises";
import { buildSessionCandidateResults } from "../sessionComposer/candidatePools";
import { composeSessionSkeleton } from "../sessionComposer/composeSessionSkeleton";
import { buildSessionPrescriptionHandoff } from "../sessionComposer/prescriptionHandoff";
import { deriveCanonicalCompositionFacts } from "../sessionComposer/compositionFacts";
import { buildSessionSequencingInput } from "../sessionComposer/sequencingHandoff";
import { planSessionIntent } from "../sessionPlanner/planSessionIntent";
import type { SessionIntentPlannerInput } from "../sessionPlanner/contracts";
import {
  buildProductionWeekPlanningSourceSnapshot,
  composeWeekAllocation,
  deriveWeekOpportunityId,
  deriveWeekOpportunityRevisionId,
  deriveWeekPlanningHorizonId,
  materializeSessionAllocation,
  planWeeklyIntent,
  PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE,
  PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_POLICY_V1,
  type ProductionExplicitWeeklyPriority,
  type ProductionReservedSessionObjective,
  type ProductionSessionAllocationMaterializationResult,
  type ProductionWeekAllocationPlan,
  type ProductionWeekPlanningSourceSnapshot,
  type ProductionWeekTrainingOpportunity,
  type ProductionWeeklyIntent,
} from "../weekPlanning";
import {
  compileSessionPrescription,
  PRESCRIPTION_POLICY_V1,
  type PrescriptionCompilationContextFacts,
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
  evaluateOwnerProfileReadiness,
  type OwnerGenerationCommand,
  type OwnerGetStrongerProfileRevision,
  type OwnerPipelineStageArtifact,
  type OwnerProgramProjection,
  type ProposedOwnerImportFact,
} from "./contracts";
import { projectOwnerPrescriptionDoseBlocks } from "./projection";
import {
  buildOwnerGetStrongerTopologyPolicy,
  buildOwnerWeekFeasibilityOracle,
  evaluateOwnerWeekTopology,
  OWNER_GET_STRONGER_TOPOLOGY_POLICY_REFERENCE,
  OWNER_WEEK_TOPOLOGY_SEARCH_POLICY,
} from "./weekTopology";

const ENGINE_POLICY_VERSIONS = Object.freeze([
  "PRODUCTION_WEEK_POLICY_V1_CAUSAL_CORE@1.0.0",
  `${OWNER_GET_STRONGER_TOPOLOGY_POLICY_REFERENCE.policyId}@${OWNER_GET_STRONGER_TOPOLOGY_POLICY_REFERENCE.version}`,
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

type WeeklyIntent = ProductionWeeklyIntent;
type WeekPlan = ProductionWeekAllocationPlan;
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
  readonly materialized: readonly ProductionReservedSessionObjective[];
  readonly allocationMaterialization: ProductionSessionAllocationMaterializationResult;
  readonly plannerInput: SessionIntentPlannerInput;
  readonly planning: Planning;
  readonly candidates: Candidates;
  readonly skeleton: Skeleton;
  readonly handoff: Handoff;
  readonly compilation: Compilation;
  readonly sequence: Sequence;
}

export interface ControlledOwnerAssessmentHandoff {
  readonly assessment: AssessmentState;
  readonly sourceProductRevisionId: string;
  readonly confirmedAssessmentReferences: readonly string[];
  readonly mappingTraceRefs: readonly string[];
  readonly unresolvedConfirmedReferences: readonly string[];
  readonly mappingStatus: "mapped" | "mapped_with_unresolved_observations" | "absent" | "unsupported_shape";
  readonly trainingSafety?: TrainingSafetyState;
  readonly painOwnership?: {
    readonly status: "not_present" | "review_required" | "transferred";
    readonly expectedPainFactIds: readonly string[];
    readonly confirmedPainFactIds: readonly string[];
    readonly canonicalPainRegionIds: readonly string[];
    readonly reasonCodes: readonly string[];
    readonly resolvedAssessmentReferences: readonly string[];
    readonly sourceRefs: readonly string[];
  };
  readonly opaqueTextConsumed: false;
  readonly diagnosticInferenceCount: 0;
}

export interface ControlledOwnerProductionPipelineInput {
  readonly command: OwnerGenerationCommand;
  readonly profile: OwnerGetStrongerProfileRevision;
  readonly proposedProductFacts: readonly ProposedOwnerImportFact[];
  readonly assessmentHandoff?: ControlledOwnerAssessmentHandoff;
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
  readonly supportingWorkCarriesNoDevelopmentalCredit: boolean;
  readonly durationProjectionTruthful: boolean;
  readonly topologyQualitySatisfied: boolean;
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
    Object.freeze({ id: "OWNER_SUPPORTING_WORK_HAS_NO_DEVELOPMENTAL_CREDIT",
      satisfied: input.supportingWorkCarriesNoDevelopmentalCredit }),
    Object.freeze({ id: "OWNER_CALCULATED_DURATION_DISTINCT_FROM_AVAILABLE",
      satisfied: input.durationProjectionTruthful }),
    Object.freeze({ id: "OWNER_CANONICAL_WEEK_TOPOLOGY_QUALITY_SATISFIED",
      satisfied: input.topologyQualitySatisfied }),
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
  const wall = ids.has("wall");
  return Object.freeze({
    environment: profile.equipmentCapabilitySnapshot.environment === "commercial_gym" ?
      "commercial_gym" : "home",
    trainingSpace: Object.freeze({ stableLoadedStandingSpace: ids.has("stable_loaded_standing_space"),
      loadedGait: Object.freeze({ available: false }) }),
    bodyweight: Object.freeze({ floorSpace: bodyweight, wallAvailable: wall,
      pullUpBar: ids.has("pull_up_station") }),
    bench: Object.freeze({ types: Object.freeze(adjustableBench ? ["adjustable" as const] : []),
      stable: adjustableBench }),
    dumbbells: Object.freeze({ available: dumbbells, pairAvailable: dumbbells, adjustable: false }),
    barbell: Object.freeze({ available: barbellRack, rackAvailable: barbellRack }),
    cables: Object.freeze({ available: cables, adjustableHeight: false, availableHeights: Object.freeze([]) }),
    bands: Object.freeze({ types: Object.freeze([]), anchors: Object.freeze([]) }),
    machines: Object.freeze({ availableMachineIds: Object.freeze([]) }),
    supportSurfaces: Object.freeze(wall ? ["wall" as const] : []),
  });
}

const painStressTags = (...tags: JointStressTag[]): readonly JointStressTag[] => Object.freeze(tags);
const OWNER_PAIN_STRESS_TAGS: Readonly<Partial<Record<BodyRegion, readonly JointStressTag[]>>> = Object.freeze({
  shoulder: painStressTags("horizontal_pressing"),
  lumbar_spine: painStressTags("loaded_hinge"),
  knee: painStressTags("loaded_knee_flexion"),
  ankle: painStressTags("high_impact"),
});

function canonicalPainRegion(value: string): BodyRegion | null {
  return BODY_REGIONS.includes(value as BodyRegion) ? value as BodyRegion : null;
}

export function buildControlledOwnerPainAndInjuryState(
  profile: OwnerGetStrongerProfileRevision,
): PainAndInjuryState {
  return Object.freeze({ ...NO_PAIN_OR_INJURY,
    historicalSensitivities: Object.freeze(profile.painContext.regionIds.flatMap((value, index) => {
      const region = canonicalPainRegion(value);
      return region ? [Object.freeze({
        kind: "historical_sensitivity" as const,
        id: `owner-pain-context:${index}:${region}`,
        region,
        stressTags: OWNER_PAIN_STRESS_TAGS[region] ?? Object.freeze([]),
        preferredModification: "monitor" as const,
        description: "Confirmed structured owner limitation context.",
      })] : [];
    })) });
}

export function buildOwnerGetStrongerWeeklyPriorities(
  profile: OwnerGetStrongerProfileRevision,
): readonly ProductionExplicitWeeklyPriority[] {
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
    target: Object.freeze({ targetMovementRoles: Object.freeze(definition.roles),
      targetActionFunctions: Object.freeze([]), targetMuscles: Object.freeze(definition.muscles),
      muscleRequirement: "any_meaningful_contributor" as const,
      targetBodyRegions: Object.freeze(definition.regions) }),
    priority: "required" as const,
    priorityOrder,
    goalRelationships: Object.freeze([Object.freeze({ goal: "strength" as const,
      relationship: "primary_weekly_goal" as const,
      sourceEvidenceRefs: Object.freeze([`owner-profile:${profile.revisionId}`]) })]),
    sourceEvidence: Object.freeze([Object.freeze({ sourceKind: "user_explicit_weekly_priority" as const,
      sourceId: `owner-profile:${profile.revisionId}:${definition.key}`,
      evidenceRefs: Object.freeze([`owner-profile:${profile.revisionId}`, "product-goal:get_stronger",
        "phase-intent:phase_2:whole-person-strength-capabilities"]) })]),
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

function ownerStructuralCapacity(minutes: number | null): "condensed" | "standard" | "expanded" {
  return minutes !== null && minutes <= 30 ? "condensed" : minutes !== null && minutes >= 60 ? "expanded" : "standard";
}

function buildOwnerWeekSource(input: ControlledOwnerProductionPipelineInput): ProductionWeekPlanningSourceSnapshot {
  const equipment = buildOwnerEquipmentCapabilities(input.profile);
  const planningBoundary = Object.freeze({ kind: "ordered_cycle" as const,
    cycleRef: `owner-profile-week:${input.profile.revisionId}`, startOrder: 1,
    endOrder: input.profile.sessionOpportunities.length });
  const horizonLineageAttemptId = input.command.commandId;
  const horizonId = deriveWeekPlanningHorizonId({ athleteId: input.profile.userId,
    boundary: planningBoundary, lineageAttemptId: horizonLineageAttemptId });
  const opportunities: readonly ProductionWeekTrainingOpportunity[] = input.profile.sessionOpportunities.map((entry) => {
    const intendedWindowRef = `owner-profile-opportunity:${entry.opportunityId}`;
    const base: Omit<ProductionWeekTrainingOpportunity, "opportunityRevisionId" | "provenance"> = {
      opportunityId: deriveWeekOpportunityId({ horizonId, intendedWindowRef }),
      intendedWindowRef,
      order: entry.order,
      availabilityStatus: "available",
      completionStatus: "not_started",
      expectedAvailableMinutes: entry.minutes,
      expectedStructuralCapacity: ownerStructuralCapacity(entry.minutes),
      expectedEquipment: Object.freeze({ kind: "capability_snapshot" as const, capabilities: equipment,
        sourceRef: input.profile.equipmentCapabilitySnapshot.sourceRevision }),
      constraints: Object.freeze([Object.freeze({ constraintId: `owner-single-session:${entry.opportunityId}`,
        kind: "single_session_only" as const, targetOpportunityIds: Object.freeze([]), required: true,
        sourceRef: `owner-profile:${input.profile.revisionId}` })]),
      confirmationState: "user_confirmed",
      sourceAuthority: "owner_decision",
    };
    return Object.freeze({ ...base, opportunityRevisionId: deriveWeekOpportunityRevisionId(base),
      provenance: Object.freeze({ owner: "product_horizon_source" as const,
        sourceRefs: Object.freeze([input.profile.revisionId, entry.opportunityId]),
        ruleRefs: Object.freeze(["OWNER_CONFIRMED_ORDERED_OPPORTUNITY", "NO_CALENDAR_SPACING_INFERRED"]) }) });
  });
  const unresolvedContext = input.profile.continuityReferences.map((reference) => Object.freeze({
    observationId: stableId("owner-opaque-continuity-reference", { profileRevisionId: input.profile.revisionId,
      reference }),
    category: "programming_policy" as const,
    owner: "application_orchestration" as const,
    resolutionState: "requires_typed_input" as const,
    blocksWeeklyIntent: false,
    blocksAllocation: false,
    sourceRef: reference,
  }));
  const result = buildProductionWeekPlanningSourceSnapshot({ athleteId: input.profile.userId,
    planningBoundary, horizonLineageAttemptId, opportunities,
    evaluationTime: input.command.evaluationTime, priorHorizonRevisionId: null,
    unresolvedContext, sourceAuthority: "owner_decision",
    provenance: Object.freeze({ owner: "product_horizon_source" as const,
      sourceRefs: Object.freeze([input.profile.revisionId, input.command.sourceProductRevisionId]),
      ruleRefs: Object.freeze(["CONTROLLED_OWNER_CONFIRMED_AVAILABILITY_ADAPTER",
        "OPAQUE_CONTINUITY_REMAINS_UNRESOLVED", "NO_DATES_OR_RECOVERY_SPACING_FABRICATED"]) }) });
  if (!result.snapshot) throw new Error(result.reasonCodes.join(","));
  return result.snapshot;
}

function compilationContext(input: { readonly assignment: Handoff["assignments"][number];
  readonly intent: NonNullable<Planning["sessionIntent"]>; readonly profile: OwnerGetStrongerProfileRevision;
  readonly assessment: AssessmentState; readonly selectedExercise: ExerciseDefinition | null }): PrescriptionCompilationContextFacts {
  const needs = input.intent.needs.filter((need) => input.assignment.satisfiedNeedIds.includes(need.id));
  const dependencies = needs.flatMap((need) => need.dependencies);
  const assessmentPriorityIds = uniqueSorted(dependencies.flatMap((entry) => entry.assessmentSignalIds));
  const alignmentPriorityIds = deriveAlignmentPriorities(input.assessment).priorities
    .filter((priority) => priority.sourceAssessmentSignalIds.some((id) => assessmentPriorityIds.includes(id)))
    .map((priority) => priority.id);
  const familiarity = input.profile.familiarity.find((entry) => entry.exerciseId === input.assignment.exerciseId);
  const explicitControl = dependencies.some((entry) => entry.actionFunctions.length > 0 ||
    entry.movementRoles.length > 0 || (entry.rangeRequirements?.length ?? 0) > 0);
  return { familiarity: familiarity?.status === "known" ? "known_productive" :
    familiarity?.status === "calibration_required" ? "unfamiliar" : "unknown",
    returnAfterAbsence: false, painAwareLoadToleranceRegressionPermitted: false,
    reliablePriorPerformance: false, reviewedRegression: false, adverseResponseSupportsReducedDose: false,
    newEquipmentRealization: false,
    requiredPreparationDependency: input.assignment.section === "warmup" &&
      dependencies.some((entry) => entry.required),
    reviewedRangeOrControlDependency: dependencies.some((entry) =>
      entry.rangeRequirements?.some((requirement) => requirement.reviewStatus === "accepted") ?? false) ||
      explicitControl,
    sharedPreparationDependency: dependencies.some((entry) => entry.ownership === "shared"),
    successfulBoundedPriorPreparation: false,
    requiredActivationDependency: input.assignment.section === "activation" &&
      dependencies.some((entry) => entry.required),
    explicitControlRequirement: input.assignment.section === "activation" && explicitControl,
    lowFatigueActivationSuitable: input.assignment.section === "activation" &&
      input.selectedExercise !== null && isLowFatigueActivationCandidate(input.selectedExercise),
    adverseActivationFatigueResponse: false, mainWorkPreserved: true, secondaryObjectiveRequired: false,
    secondaryWeeklyPriority: false, secondaryCapacitySupported: true, secondaryHigherPriorityConflict: false,
    secondaryNonRedundantUpstream: true, accessoryPriority: "optional", accessoryUniquePurposeActive: true,
    accessoryCoherencePreserved: true, overlappingExposureRepresented: false, firstExposure: true,
    insufficientResponseHistory: true, directObjectiveConfirmedUpstream: false,
    allocatedRecoveryResponsibility: input.assignment.section === "cooldown",
    successfulBreathResponse: false, sessionCapacityPreservesMainWork: true,
    carryPurpose: "accessory", stationaryMarchRealization: "count", reviewedAcclimationBlockCount: null,
    requestedTempoIntent: "natural", explicitPowerObjective: null,
    powerIntentPermittedByExerciseKnowledge: false, assessmentPriorityIds, alignmentPriorityIds,
    provenanceRefs: uniqueSorted(["controlled-owner-delivery:confirmed-profile",
      ...dependencies.flatMap((entry) => entry.provenance?.evidenceRefs ?? [])]) };
}

function compileSession(input: { readonly command: OwnerGenerationCommand; readonly profile: OwnerGetStrongerProfileRevision;
  readonly plannerInput: SessionIntentPlannerInput; readonly planning: Planning; readonly skeleton: Skeleton;
  readonly candidates: Candidates; readonly handoff: Handoff }): Compilation {
  const intent = input.planning.sessionIntent!;
  const compilerInput: PrescriptionSessionCompilerInput = {
    sessionIntent: intent, sessionSkeleton: input.skeleton, handoff: input.handoff,
    athlete: input.plannerInput.athlete, exerciseRegistry: REFERENCE_EXERCISES,
    exerciseKnowledgeRegistry: REFERENCE_EXERCISES.map((entry) => entry.prescriptionKnowledge),
    currentEquipment: input.plannerInput.currentEquipment.capabilities,
    trainingReadiness: buildTrainingReadinessTrace({ trainingSafety: input.plannerInput.trainingSafety }),
    executionRequirements: [],
    contextByHandoffId: Object.fromEntries(input.handoff.assignments.map((assignment) => {
      const selectedExercise = assignment.satisfiedNeedIds.flatMap((needId) =>
        input.candidates[needId]?.rankedCandidates ?? [])
        .find((candidate) => candidate.exercise.id === assignment.exerciseId)?.exercise ?? null;
      return [assignment.handoffId, compilationContext({ assignment, intent, profile: input.profile,
        assessment: input.plannerInput.assessment, selectedExercise })];
    })),
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
  return compileSessionPrescription(compilerInput);
}

function executeSessions(input: ControlledOwnerProductionPipelineInput, source: ProductionWeekPlanningSourceSnapshot,
  intent: WeeklyIntent, weekPlan: WeekPlan): readonly SessionExecution[] {
  const equipment = buildOwnerEquipmentCapabilities(input.profile);
  const athlete = athleteFor(input.profile);
  const assessment = input.assessmentHandoff?.assessment ??
    Object.freeze({ signals: Object.freeze([]), historicalWeaknesses: Object.freeze([]) });
  const trainingSafety = input.assessmentHandoff?.trainingSafety ?? NO_TRAINING_SAFETY_SIGNALS;
  return Object.freeze([...weekPlan.reservations].sort((left, right) => {
    const leftOrder = source.opportunities.find((entry) => entry.opportunityId === left.opportunityId)!.order;
    const rightOrder = source.opportunities.find((entry) => entry.opportunityId === right.opportunityId)!.order;
    return leftOrder - rightOrder || left.opportunityId.localeCompare(right.opportunityId);
  }).map((reservation) => {
      const sourceOpportunity = source.opportunities.find((entry) =>
        entry.opportunityId === reservation.opportunityId)!;
      const opportunity = input.profile.sessionOpportunities.find((entry) =>
        `owner-profile-opportunity:${entry.opportunityId}` === sourceOpportunity.intendedWindowRef)!;
      const allocationMaterialization = materializeSessionAllocation({
        materializerContract: PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_CONTRACT_REFERENCE,
        reservation,
        expectedWeekPlanRevisionId: weekPlan.weekPlanRevisionId,
        actualCurrentAvailability: Object.freeze({ availableMinutes: opportunity.minutes ?? 45,
          structuralCapacity: ownerStructuralCapacity(opportunity.minutes), provenance: "week_allocation",
          sourceRef: `owner-profile-opportunity:${opportunity.opportunityId}` }),
        actualCurrentStructuralCapacity: ownerStructuralCapacity(opportunity.minutes),
        actualCurrentEquipment: Object.freeze({ capabilities: equipment, provenance: "explicit_today",
          sourceRef: input.profile.equipmentCapabilitySnapshot.sourceRevision }),
        actualTrainingSafety: trainingSafety,
        actualEvaluationTime: input.command.evaluationTime,
        userCancelled: false,
        unresolvedCurrentContext: Object.freeze([]),
        productUpdateRefs: Object.freeze([input.command.sourceProductRevisionId]),
        materializationAttemptId: stableId("owner-session-materialization", {
          commandId: input.command.commandId, reservationRevisionId: reservation.reservationRevisionId }),
      });
      if (allocationMaterialization.status !== "directive_materialized" || !allocationMaterialization.directive) {
        throw new Error(`OWNER_SESSION_ALLOCATION_MATERIALIZATION_BLOCKED:${allocationMaterialization.status}`);
      }
      const objectives = reservation.allocatedObjectives;
      const plannerInput: SessionIntentPlannerInput = Object.freeze({
        directive: allocationMaterialization.directive, athlete,
        phaseIntent: Object.freeze({ ...THREE_PHASE_FOUNDATION[1], primaryGoal: "strength" as const }),
        assessment, painAndInjury: buildControlledOwnerPainAndInjuryState(input.profile), trainingSafety,
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
      if (!planning.trainingReadiness.downstreamTrainingAllowed) {
        throw new Error("OWNER_TRAINING_SAFETY_REVIEW_REQUIRED_BEFORE_CANDIDATE");
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
        skeleton, candidates, handoff });
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
      return Object.freeze({ opportunityId: reservation.opportunityId,
        reservationId: reservation.reservationId, minutes: opportunity.minutes,
        materialized: Object.freeze(objectives), allocationMaterialization, plannerInput, planning, candidates,
        skeleton, handoff, compilation, sequence });
    }));
}

function gateInput(input: ControlledOwnerProductionPipelineInput, source: ProductionWeekPlanningSourceSnapshot,
  intent: WeeklyIntent, weekPlan: WeekPlan,
  sessions: readonly SessionExecution[]): ProductionPostPrescriptionWeekValidationInput {
  const provenance = [Object.freeze({ source: "policy" as const,
    sourceRef: `controlled-owner-delivery:${input.command.commandId}` })];
  const objectives: readonly ProductionWeekObjectiveSnapshot[] = intent.objectives.map((objective) => ({
    objectiveId: objective.objectiveId, purpose: objective.purpose,
    target: objective.target, priority: objective.priority, priorityOrder: objective.priorityOrder,
    goalRelationships: objective.goalRelationships,
    frequencyIntent: { ...objective.frequencyIntent, provenance },
    supportedPolicyRef: PRODUCTION_WEEK_POLICY_V1.reference,
    dosePolicyState: objective.dosePolicyState === "not_applicable" ? "not_applicable" as const :
      "explicit_reviewed_target" as const,
    spacingState: "SPACING_R0_PRESCRIPTION_PENDING" as const,
    sourceEvidenceRefs: uniqueSorted(objective.sourceEvidence.flatMap((entry) =>
      [entry.sourceId, ...entry.evidenceRefs])), provenance }));
  const reservations: readonly ProductionWeekReservationSnapshot[] = sessions.map((session) => ({
    reservationId: session.reservationId, opportunityId: session.opportunityId,
    allocatedObjectiveIds: session.materialized.map((entry) => entry.weeklyObjectiveId),
    expectedSessionGoal: "strength", responsibilityEvidenceRefs: session.materialized.flatMap((entry) =>
      entry.sourceEvidenceRefs), availabilityState: "available", executionState: "not_started",
    invalidationState: "active", provenance }));
  return { validatorContract: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE,
    validationPolicy: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE,
    availableValidationPolicies: [POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE],
    weekSource: { sourceContract: PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE,
      sourceSnapshotId: source.sourceSnapshotId,
      sourceSnapshotRevisionId: source.sourceSnapshotRevisionId, sourceAuthority: "PRODUCTION_WEEK_SOURCE_CONTRACT",
      athleteId: input.profile.userId, planningHorizonId: source.planningHorizonId,
      weeklyIntentId: intent.intentId, weekAllocationPlanId: weekPlan.weekPlanId,
      horizonBoundary: { startsAt: null, endsAt: null, timezone: null },
      opportunities: source.opportunities.map((entry) => ({ opportunityId: entry.opportunityId,
        order: entry.order, calendarDateTime: null, availableMinutes: entry.expectedAvailableMinutes,
        availabilityState: "available",
        executionState: "not_started", reservationIds: reservations.filter((reservation) =>
          reservation.opportunityId === entry.opportunityId).map((reservation) => reservation.reservationId), provenance })),
      objectives, reservations,
      allocationTraces: sessions.flatMap((session) => session.materialized.map((objective) => ({
        allocationTraceId: stableId("owner-allocation-trace", objective), objectiveId: objective.weeklyObjectiveId,
        reservationId: session.reservationId, opportunityId: session.opportunityId,
        sessionDirectiveId: session.planning.sessionIntent?.id ?? null,
        sessionNeedIds: session.planning.sessionIntent!.needs.filter((need) =>
          need.plannerProvenance?.objectiveIds.includes(objective.weeklyObjectiveId) ?? false).map((need) => need.id),
        sourceEvidenceRefs: objective.sourceEvidenceRefs, provenance }))),
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
      purpose: "strength_development",
      durationStatus: session.sequence.plan!.duration.status === "fully_determinable" ? "known" : "unknown",
      durationMinutes: session.sequence.plan!.duration.status === "fully_determinable" ?
        session.sequence.plan!.duration.knownLowerBoundSeconds / 60 : null,
      availableMinutes: session.minutes,
      calculatedDuration: Object.freeze({
        status: session.sequence.plan!.duration.status,
        knownLowerBoundSeconds: session.sequence.plan!.duration.knownLowerBoundSeconds,
        knownUpperBoundSeconds: session.sequence.plan!.duration.knownUpperBoundSeconds,
        unknownComponents: Object.freeze([...session.sequence.plan!.duration.unknownComponents]),
        accountedAssignmentIds: Object.freeze(session.sequence.plan!.steps.map((step) => step.assignmentId)),
        noInventedTime: true as const,
      }),
      exerciseAssignments: Object.freeze(session.sequence.plan!.steps.map((step) => {
        const assignment = session.handoff.assignments.find((entry) => entry.handoffId === step.assignmentId)!;
        const plan = session.compilation.plans.find((entry) =>
          entry.sourceExposureEvent.sessionAssignmentId === assignment.handoffId);
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
        const dependencies = session.planning.sessionIntent!.needs
          .filter((need) => assignment.satisfiedNeedIds.includes(need.id)).flatMap((need) => need.dependencies);
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
          reasonCodes: Object.freeze(plan?.rationaleReasonCodes ?? []),
          section: assignment.section, role: assignment.role,
          preparationCategories: Object.freeze(uniqueSorted(dependencies.flatMap((entry) =>
            entry.requiredPreparationCategories ?? []))),
          dependencyIds: Object.freeze(uniqueSorted(dependencies.map((entry) => entry.dependencyId))),
          dependencyReasons: Object.freeze(uniqueSorted(dependencies.flatMap((entry) =>
            entry.explanation ? [entry.explanation] : []))) });
      })), practiceModes: Object.freeze(["full", "lighter", "recovery"] as const) }))),
    unresolvedFacts, safetyState: input.profile.trainingSafety, engineVersion: input.command.engineVersion,
    policyVersions: input.command.policyVersions });
}

function semanticCompleteness(input: { readonly profile: OwnerGetStrongerProfileRevision;
  readonly source: ProductionWeekPlanningSourceSnapshot; readonly intent: WeeklyIntent;
  readonly weekPlan: WeekPlan; readonly sessions: readonly SessionExecution[];
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
  input.weekPlan.reservations.forEach((reservation) => reservation.allocatedObjectives.forEach((objective) =>
    allocationCounts.set(objective.weeklyObjectiveId,
      (allocationCounts.get(objective.weeklyObjectiveId) ?? 0) + 1)));
  const requiredNeedIds = input.sessions.flatMap((session) => session.planning.sessionIntent!.needs
    .filter((need) => need.priority === "required").map((need) => need.id));
  const coveredNeedIds = new Set(input.sessions.flatMap((session) => session.handoff.assignments
    .flatMap((assignment) => assignment.satisfiedNeedIds)));
  const allPlans = input.sessions.flatMap((session) => session.compilation.plans);
  const projectedAssignments = input.projection.sessions.flatMap((session) => session.exerciseAssignments);
  const exactEquipment = buildOwnerEquipmentCapabilities(input.profile);
  const capabilityIds = new Set(input.profile.equipmentCapabilitySnapshot.capabilityIds);
  const topology = evaluateOwnerWeekTopology({ plan: input.weekPlan, intent: input.intent,
    policy: buildOwnerGetStrongerTopologyPolicy(input.intent),
    opportunityIds: input.source.opportunities.map((entry) => entry.opportunityId) });
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
        need.plannerProvenance?.objectiveIds.includes(materialized.weeklyObjectiveId)))),
    assignmentCoverageComplete: requiredNeedIds.every((needId) => coveredNeedIds.has(needId)),
    developmentalPrescriptionCoverageComplete: input.sessions.every((session) => session.skeleton.assignments
      .filter((assignment) => assignment.section === "main" || assignment.section === "accessory")
      .every((assignment) => session.compilation.plans.some((plan) =>
        plan.sourceExposureEvent.sessionAssignmentId === assignment.routinePrescriptionHandoffId &&
        plan.doseBlocks.some((block) => block.purpose === "developmental_work")))),
    projectionCoverageComplete: projectedAssignments.every((assignment) => {
      const plan = allPlans.find((entry) => entry.prescriptionRevisionId === assignment.prescriptionRevisionId);
      return Boolean(plan && assignment.doseBlocks && assignment.doseBlocks.length === plan.doseBlocks.length &&
        assignment.doseBlocks.every((block, index) => block.blockId === plan.doseBlocks[index]?.blockId));
    }),
    availabilityNotAutomaticallyFilled: input.sessions.length === topology.occupiedSessionCount &&
      input.sessions.length <= input.profile.sessionOpportunities.length,
    exactEquipmentCapabilityPreserved: exactEquipment.machines.availableMachineIds.length === 0 &&
      exactEquipment.bands.types.length === 0 && exactEquipment.bands.anchors.length === 0 &&
      !exactEquipment.trainingSpace.loadedGait.available &&
      exactEquipment.trainingSpace.stableLoadedStandingSpace ===
        capabilityIds.has("stable_loaded_standing_space") &&
      exactEquipment.dumbbells.available === capabilityIds.has("dumbbells") &&
      exactEquipment.bench.stable === capabilityIds.has("adjustable_bench") &&
      exactEquipment.barbell.available === capabilityIds.has("barbell_rack") &&
      exactEquipment.cables.available === capabilityIds.has("cables") &&
      exactEquipment.bodyweight.pullUpBar === capabilityIds.has("pull_up_station") &&
      exactEquipment.bodyweight.wallAvailable === capabilityIds.has("wall") &&
      exactEquipment.supportSurfaces.includes("wall") === capabilityIds.has("wall"),
    supportingWorkCarriesNoDevelopmentalCredit: input.sessions.every((session) => session.skeleton.assignments
      .filter((assignment) => ["warmup", "activation", "cooldown"].includes(assignment.section))
      .every((assignment) => session.compilation.plans.some((plan) =>
        plan.sourceExposureEvent.sessionAssignmentId === assignment.routinePrescriptionHandoffId &&
        !plan.doseBlocks.some((block) => block.purpose === "developmental_work")))),
    durationProjectionTruthful: input.projection.sessions.every((session) =>
      session.availableMinutes !== undefined && session.calculatedDuration !== undefined &&
      session.calculatedDuration.noInventedTime &&
      session.calculatedDuration.accountedAssignmentIds.length === session.exerciseAssignments.length &&
      (session.durationStatus === "known") ===
        (session.calculatedDuration.status === "fully_determinable")),
    topologyQualitySatisfied: topology.valid,
  });
}

export function runControlledOwnerProductionPipeline(
  input: ControlledOwnerProductionPipelineInput,
): ControlledOwnerProductionPipelineResult {
  const stages: OwnerPipelineStageArtifact[] = [];
  let unresolvedFacts: readonly string[] = input.profile.sessionMinutes.status === "explicit_unknown"
    ? ["OWNER_SESSION_DURATION_EXPLICIT_UNKNOWN"] : [];
  unresolvedFacts = uniqueSorted([...unresolvedFacts,
    ...(input.assessmentHandoff?.unresolvedConfirmedReferences.map((reference) =>
      `OWNER_ASSESSMENT_REFERENCE_UNRESOLVED:${reference}`) ?? []),
    ...(input.assessmentHandoff?.painOwnership?.reasonCodes ?? [])]);
  try {
    const profileReadiness = evaluateOwnerProfileReadiness(input.profile);
    if (!profileReadiness.previewAllowed) throw new Error(profileReadiness.reasonCodes.join(","));
    if (input.assessmentHandoff && (input.assessmentHandoff.sourceProductRevisionId !==
      input.command.sourceProductRevisionId ||
      JSON.stringify(uniqueSorted(input.assessmentHandoff.confirmedAssessmentReferences)) !==
        JSON.stringify(uniqueSorted(input.profile.assessmentReferences)))) {
      throw new Error("OWNER_ASSESSMENT_HANDOFF_SOURCE_OR_CONFIRMATION_MISMATCH");
    }
    const mapping = Object.freeze({ sourceGoal: "get_stronger", trainingOutcome: "strength",
      sourceProductSnapshotId: input.command.sourceProductSnapshotId,
      sourceProductRevisionId: input.command.sourceProductRevisionId,
      proposedFactReferences: input.proposedProductFacts.map((fact) => Object.freeze({ factId: fact.factId,
        status: fact.status, sourceRevision: fact.sourceRevision })),
      assessmentHandoff: input.assessmentHandoff ? Object.freeze({
        mappingStatus: input.assessmentHandoff.mappingStatus,
        confirmedAssessmentReferences: input.assessmentHandoff.confirmedAssessmentReferences,
        mappedSignalIds: input.assessmentHandoff.assessment.signals.map((signal) => signal.id),
        mappingTraceRefs: input.assessmentHandoff.mappingTraceRefs,
        unresolvedConfirmedReferences: input.assessmentHandoff.unresolvedConfirmedReferences,
        trainingSafetySignalIds: input.assessmentHandoff.trainingSafety?.signals.map((signal) => signal.signalId) ?? [],
        painOwnership: input.assessmentHandoff.painOwnership ?? null,
        opaqueTextConsumed: input.assessmentHandoff.opaqueTextConsumed,
        diagnosticInferenceCount: input.assessmentHandoff.diagnosticInferenceCount,
      }) : null });
    stages.push(artifact("product_mapping", "mapGetStrongerProductGoalToStrength", mapping));
    const source = buildOwnerWeekSource(input);
    stages.push(artifact("product_horizon", "buildProductionWeekPlanningSourceSnapshot", source));
    const priorities = buildOwnerGetStrongerWeeklyPriorities(input.profile);
    const assessment = input.assessmentHandoff?.assessment ??
      Object.freeze({ signals: Object.freeze([]), historicalWeaknesses: Object.freeze([]) });
    const trainingSafety = input.assessmentHandoff?.trainingSafety ?? NO_TRAINING_SAFETY_SIGNALS;
    const intentResult = planWeeklyIntent({ plannerContract: PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE,
      policy: PRODUCTION_WEEK_POLICY_V1, sourceSnapshot: source, athlete: athleteFor(input.profile),
      explicitOutcomeGoal: "strength", outcomeGoalLineageId: `product-goal:get_stronger:${input.profile.revisionId}`,
      orderedSecondaryGoals: Object.freeze([]), programmingContextModes: Object.freeze([]),
      phaseIntent: Object.freeze({ ...THREE_PHASE_FOUNDATION[1], primaryGoal: "strength" as const }),
      assessment, painAndInjury: buildControlledOwnerPainAndInjuryState(input.profile), trainingSafety,
      history: EMPTY_TRAINING_HISTORY,
      trainingResponseHistory: EMPTY_TRAINING_HISTORY.trainingResponseHistory ?? { observations: [] },
      explicitWeeklyPriorities: priorities, externalLoadObservations: Object.freeze([]),
      continuityEvidence: Object.freeze({ priorPlanRevisionId: null, productiveRelationships: Object.freeze([]),
        completedOpportunityIds: Object.freeze([]), missedOpportunityIds: Object.freeze([]),
        changeReasonRefs: Object.freeze([]) }),
      evaluationTime: input.command.evaluationTime,
      intentAttemptId: stableId("owner-week-intent-attempt", input.command),
    });
    stages.push(artifact("week_intent", "planWeeklyIntent", intentResult,
      intentResult.weeklyIntent ? [] : intentResult.decisionTrace));
    if (!intentResult.weeklyIntent) throw new Error(`OWNER_WEEK_INTENT_BLOCKED:${intentResult.status}`);
    const intent = intentResult.weeklyIntent;
    const topologyPolicy = buildOwnerGetStrongerTopologyPolicy(intent);
    const weekPlan = composeWeekAllocation({
      composerContract: PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE,
      weeklyIntent: intent, sourceSnapshot: source, orderedOpportunities: source.opportunities,
      completionState: Object.freeze(Object.fromEntries(source.opportunities.map((entry) =>
        [entry.opportunityId, entry.completionStatus]))),
      previousWeekStructureEvidence: intent.continuityEvidence,
      policy: PRODUCTION_WEEK_POLICY_V1, spacingRequirements: Object.freeze([]), topologyPolicy,
      feasibilityOracle: buildOwnerWeekFeasibilityOracle(trainingSafety),
      searchResourcePolicy: OWNER_WEEK_TOPOLOGY_SEARCH_POLICY,
      evaluationTime: input.command.evaluationTime,
      allocationAttemptId: stableId("owner-week-allocation-attempt", input.command),
    });
    const topologyEvidence = evaluateOwnerWeekTopology({ plan: weekPlan, intent, policy: topologyPolicy,
      opportunityIds: source.opportunities.map((entry) => entry.opportunityId) });
    const weekReasons = weekPlan.status === "allocation_composed" && topologyEvidence.valid ? [] :
      uniqueSorted([`OWNER_WEEK_ALLOCATION:${weekPlan.status}`, ...topologyEvidence.reasonCodes]);
    stages.push(artifact("week_allocation", "composeWeekAllocation", Object.freeze({ weekPlan, topologyEvidence }),
      weekReasons));
    if (weekReasons.length) throw new Error(weekReasons.join(","));
    const sessions = executeSessions(input, source, intent, weekPlan);
    unresolvedFacts = uniqueSorted([...unresolvedFacts, ...sessions.flatMap((session) => {
      const status = session.sequence.plan!.duration.status;
      return status === "fully_determinable" || status === "fits_known_bound" ? [] :
        [`OWNER_CALCULATED_SESSION_DURATION_INDETERMINATE:${session.opportunityId}:${status}`];
    })]);
    stages.push(artifact("session_intent", "planSessionIntent", sessions.map((entry) => entry.planning)));
    stages.push(artifact("candidate_intelligence", "buildSessionCandidateResults",
      sessions.map((entry) => entry.candidates)));
    stages.push(artifact("session_composer", "composeSessionSkeleton+buildSessionPrescriptionHandoff",
      sessions.map((entry) => ({ skeleton: entry.skeleton, handoff: entry.handoff }))));
    stages.push(artifact("prescription_compiler", "compileSessionPrescription",
      sessions.map((entry) => entry.compilation)));
    stages.push(artifact("final_sequencing", "sequenceFinalSession", sessions.map((entry) => entry.sequence)));
    const validationInput = gateInput(input, source, intent, weekPlan, sessions);
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
    const completeness = semanticCompleteness({ profile: input.profile, source, intent, weekPlan, sessions, projection });
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
