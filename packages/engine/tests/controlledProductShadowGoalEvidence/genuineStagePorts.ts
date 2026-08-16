import {
  ANCHORED_BANDS_EQUIPMENT,
  BODYWEIGHT_EQUIPMENT,
  DUMBBELLS_AND_BENCH_EQUIPMENT,
  EXPLICIT_STANDALONE_PRESCRIPTION_PURPOSE_SOURCE_CONTRACT_REFERENCE,
  FULL_GYM_EQUIPMENT,
  POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE,
  PRESCRIPTION_POLICY_V1,
  PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE,
  PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_1_CONTRACT_REFERENCE,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_2_CONTRACT_REFERENCE,
  PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_POLICY_V2,
  REFERENCE_EXERCISES,
  SESSION_SEQUENCING_POLICY_V1,
  buildExplicitStandalonePrescriptionPurposeEvidenceSnapshot,
  buildProductionPhaseProgramSnapshot,
  buildSessionCandidateResults,
  buildSessionPrescriptionHandoff,
  buildSessionSequencingInput,
  buildTrainingReadinessTrace,
  compilePrescriptionAssignmentV1_3,
  compileSessionPrescription,
  composeSessionSkeleton,
  composeSupportedPurposeWeekV1_1,
  deriveAlignmentPriorities,
  deriveCanonicalCompositionFacts,
  materializeSupportedPurposeObjectiveV1_1,
  planSessionIntent,
  planSupportedPurposeWeeklyIntentV1_1,
  sequenceFinalSession,
  validatePostPrescriptionWeek,
  validatePostPrescriptionWeekV1_2,
  type AssessmentState,
  type CurrentSessionEquipment,
  type EquipmentCapabilities,
  type PainAndInjuryState,
  type PrescriptionAssignmentCompilerInputV1_3,
  type PrescriptionCompilationContextFacts,
  type PrescriptionExecutionRequirement,
  type PrescriptionLocalPurpose,
  type PrescriptionSessionCompilerInput,
  type ProductionExplicitWeeklyPriorityV1_1,
  type ProductionPostPrescriptionWeekValidationInput,
  type ProductionPostPrescriptionWeekValidationResult,
  type ProductionWeekObjectiveSnapshot,
  type ProductionWeekReservationSnapshot,
  type ProductionWeeklyIntentV1_1,
  type SessionCandidateBuildContext,
  type SessionIntentPlannerInput,
  type TrainingOutcomeGoal,
} from "@praxis/training-engine-v2";
import {
  CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4,
  PRODUCT_SHADOW_B1_B4_STAGE_ORDER,
  type ProductShadowB1B4StagePort,
} from "../../src/controlledProductShadowGoalRealization";
import type { ControlledProductShadowGoalRealizationMappingBundleV1 } from
  "@praxis/training-engine-v2";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2,
} from "../../../training-engine-v2/tests/cagt/effectiveAuthorityRegistryV2";
import { buildFullPrescribedProgramSnapshot } from
  "../../../training-engine-v2/tests/helpers/fullPrescribedProgramPipeline";
import {
  CLEAR_TRAINING_READINESS,
  PRODUCTION_FINAL_SEQUENCING_TEST_SEARCH_POLICY,
} from "../../../training-engine-v2/tests/helpers/productionFinalSequencingLab";
import {
  plannerDirective,
  plannerInput,
  plannerObjective,
} from "../../../training-engine-v2/tests/helpers/sessionIntentPlannerProduction";
import { buildB4CompilerInput } from
  "../../../training-engine-v2/tests/cagt/equipmentExperienceContextEvidence";
import type {
  GoalSpecificArtifactReference,
  GoalSpecificStageAuthenticityEntry,
} from "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/contracts";
import type { GoalSpecificProductFixture } from
  "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/scenarioManifest";
import { evidenceDigest } from "./artifactStore";
import type { GoalSpecificProductShadowArtifactStore } from "./artifactStore";

type Stage = typeof PRODUCT_SHADOW_B1_B4_STAGE_ORDER[number];
type WeeklyIntent = ReturnType<typeof planSupportedPurposeWeeklyIntentV1_1>;
type WeekPlan = ReturnType<typeof composeSupportedPurposeWeekV1_1>;
type Materialized = ReturnType<typeof materializeSupportedPurposeObjectiveV1_1>;
type PlanningResult = ReturnType<typeof planSessionIntent>;
type CandidateResults = ReturnType<typeof buildSessionCandidateResults>;
type Skeleton = ReturnType<typeof composeSessionSkeleton>;
type Handoff = ReturnType<typeof buildSessionPrescriptionHandoff>;
type PrescriptionV13 = ReturnType<typeof compilePrescriptionAssignmentV1_3>;
type SequenceResult = ReturnType<typeof sequenceFinalSession>;
type Gate13V12 = ReturnType<typeof validatePostPrescriptionWeekV1_2>;
type PhaseSnapshot = ReturnType<typeof buildProductionPhaseProgramSnapshot>;

interface SessionExecution {
  readonly opportunityId: string;
  readonly reservationId: string;
  readonly materialized: readonly Materialized[];
  readonly plannerInput: SessionIntentPlannerInput;
  readonly planning: PlanningResult;
  candidateResults?: CandidateResults;
  skeleton?: Skeleton;
  handoff?: Handoff;
  compatibilityCompilation?: ReturnType<typeof compileSessionPrescription>;
  realizationResults?: readonly PrescriptionV13[];
  sequencing?: SequenceResult;
}

function executionIdentity(fixture: GoalSpecificProductFixture): string {
  return `${fixture.athleteShellId}:${fixture.productSourceRevision}`;
}

export interface GenuineStageExecutionState {
  mappingBundle: ControlledProductShadowGoalRealizationMappingBundleV1;
  planningBrief: ControlledProductShadowGoalRealizationMappingBundleV1["planningBrief"];
  weeklyIntent?: WeeklyIntent;
  weekPlan?: WeekPlan;
  materialized?: readonly Materialized[];
  sessions?: readonly SessionExecution[];
  gate13Input?: ProductionPostPrescriptionWeekValidationInput;
  gate13V1?: ProductionPostPrescriptionWeekValidationResult;
  gate13V12?: Gate13V12;
  fullProgramSnapshot?: NonNullable<ReturnType<typeof buildFullPrescribedProgramSnapshot>["snapshot"]>;
  phaseSnapshot?: PhaseSnapshot;
}

function trainingOutcome(bundle: ControlledProductShadowGoalRealizationMappingBundleV1): TrainingOutcomeGoal {
  const outcome = bundle.goalMapping.primaryOutcome;
  if (!outcome) throw new Error("GOAL_SPECIFIC_PRIMARY_OUTCOME_REQUIRED");
  return outcome;
}

function purposeFamily(purpose: PrescriptionLocalPurpose):
Pick<ProductionExplicitWeeklyPriorityV1_1, "family" | "purpose"> {
  if (purpose === "strength_development") return { family: "strength", purpose: "movement_development" };
  if (purpose === "hypertrophy_development") return { family: "muscle", purpose: "muscle_development" };
  if (purpose === "movement_quality_development") {
    return { family: "movement_quality", purpose: "movement_quality_development" };
  }
  if (purpose === "muscular_endurance_development") {
    return { family: "muscular_endurance", purpose: "muscular_endurance_development" };
  }
  if (purpose === "direct_development") return { family: "direct", purpose: "direct_action_development" };
  if (purpose === "capacity_development") return { family: "capacity", purpose: "capacity_development" };
  throw new Error(`GOAL_SPECIFIC_UNSUPPORTED_PURPOSE:${purpose}`);
}

function targetForPurpose(purpose: PrescriptionLocalPurpose) {
  if (purpose === "capacity_development") {
    return Object.freeze({
      targetMovementRoles: Object.freeze(["carry"] as const),
      targetActionFunctions: Object.freeze([]),
      targetMuscles: Object.freeze(["trunk"] as const),
      muscleRequirement: "primary_required" as const,
      targetBodyRegions: Object.freeze(["general"] as const),
    });
  }
  return Object.freeze({
    targetMovementRoles: Object.freeze(["horizontal_push"] as const),
    targetActionFunctions: Object.freeze([]),
    targetMuscles: Object.freeze(["chest"] as const),
    muscleRequirement: "primary_required" as const,
    targetBodyRegions: Object.freeze(["shoulder"] as const),
  });
}

function priorities(bundle: ControlledProductShadowGoalRealizationMappingBundleV1):
readonly ProductionExplicitWeeklyPriorityV1_1[] {
  const brief = bundle.planningBrief;
  if (!brief) throw new Error("GOAL_SPECIFIC_PLANNING_BRIEF_REQUIRED");
  const semanticEvidenceRefs = Object.freeze([
    `mapped-primary-outcome:${brief.primaryOutcome}`,
    `mapped-training-mode:${brief.trainingMode}`,
    ...(brief.secondaryOutcome ? [`mapped-secondary-outcome:${brief.secondaryOutcome}`] : []),
  ]);
  const ordered = [
    ...brief.requiredPurposeFamilies.map((purpose) => ({ purpose, priority: "required" as const })),
    ...brief.preferredPurposeFamilies.map((purpose) => ({ purpose, priority: "preferred" as const })),
    ...brief.optionalPurposeFamilies.map((purpose) => ({ purpose, priority: "optional" as const })),
  ];
  return Object.freeze(ordered.map((entry, index) => {
    const family = purposeFamily(entry.purpose);
    return Object.freeze({
      priorityId: `goal-specific:${entry.priority}:${entry.purpose}:${index}`,
      ...family,
      localPrescriptionPurpose: entry.purpose,
      purposeAuthority: "primary_local_purpose" as const,
      target: targetForPurpose(entry.purpose),
      priority: entry.priority,
      priorityOrder: index,
      goalRelationships: Object.freeze([
        Object.freeze({ goal: brief.primaryOutcome, relationship: "primary_weekly_goal" as const,
          sourceEvidenceRefs: semanticEvidenceRefs }),
        ...(brief.secondaryOutcome ? [Object.freeze({ goal: brief.secondaryOutcome,
          relationship: "secondary_weekly_goal" as const,
          sourceEvidenceRefs: semanticEvidenceRefs })] : []),
      ]),
      sourceEvidenceRefs: semanticEvidenceRefs,
    });
  }));
}

function equipmentFor(bundle: ControlledProductShadowGoalRealizationMappingBundleV1): EquipmentCapabilities {
  const selected = bundle.equipmentCapabilityMapping.selectedLabels;
  if (selected.includes("dumbbells")) return DUMBBELLS_AND_BENCH_EQUIPMENT;
  if (selected.includes("bands")) return ANCHORED_BANDS_EQUIPMENT;
  if (selected.includes("gym")) return FULL_GYM_EQUIPMENT;
  return BODYWEIGHT_EQUIPMENT;
}

function assessmentFor(bundle: ControlledProductShadowGoalRealizationMappingBundleV1): AssessmentState {
  const signal = bundle.assessmentMapping.signals.find((entry) =>
    entry.action === "horizontal_push_control" && entry.reviewState === "reviewed");
  if (!signal) return { signals: [], historicalWeaknesses: [] };
  return { signals: [{
    id: signal.signalId,
    type: "control_finding",
    source: "movement_screen",
    confidence: "high",
    priority: "primary",
    region: "shoulder",
    movementRole: "horizontal_push",
    actionFunctions: [],
    side: "bilateral",
    description: "Reviewed structured horizontal-push control finding.",
  }], historicalWeaknesses: [] };
}

function painFor(bundle: ControlledProductShadowGoalRealizationMappingBundleV1): PainAndInjuryState {
  const base: PainAndInjuryState = {
    historicalInjuries: [], historicalSensitivities: [], currentDiscomforts: [],
    moderatePain: [], acuteSeverePain: [], hardContraindications: [],
    personalExerciseBlocks: [],
  };
  return {
    ...base,
    historicalSensitivities: bundle.painContextMapping.regions
      .filter((region) => region.includes("shoulder"))
      .map((region, index) => ({
      kind: "historical_sensitivity" as const,
      id: `goal-specific-pain:${index}:${region}`,
      region: region.includes("shoulder") ? "shoulder" as const :
        region.includes("knee") ? "knee" as const : "ankle" as const,
      stressTags: region.includes("shoulder") ? ["horizontal_pressing" as const] :
        region.includes("knee") ? ["loaded_knee_flexion" as const] : ["high_impact" as const],
      preferredModification: "monitor" as const,
      description: "Structured non-diagnostic Product pain context.",
    })),
  };
}

function executionRequirementsFor(session: SessionExecution): readonly PrescriptionExecutionRequirement[] {
  return Object.freeze(session.handoff!.assignments.flatMap((assignment) =>
    assignment.knownRequirements.unclassifiedRequirementIds.map((requirementId) => Object.freeze({
      requirementId,
      targetAssignmentHandoffId: assignment.handoffId,
      sourceOwner: "pain_response" as const,
      sourceRef: requirementId,
      targetDimension: "unresolved_other" as const,
      requestedAction: "observe_only" as const,
      side: null,
      reviewStatus: "accepted" as const,
      provenance: evidenceProvenance(`goal-specific-observe-only:${requirementId}`),
      resolutionState: "resolved" as const,
      reviewedResolution: Object.freeze({
        kind: "unresolved_other" as const,
        reasonCode: "PRODUCT_REGION_CONTEXT_OBSERVE_ONLY",
      }),
    }))));
}

function sessionExecutions(input: {
  readonly fixture: GoalSpecificProductFixture;
  readonly bundle: ControlledProductShadowGoalRealizationMappingBundleV1;
  readonly materialized: readonly Materialized[];
}): readonly SessionExecution[] {
  const grouped = new Map<string, Materialized[]>();
  input.materialized.forEach((entry) => grouped.set(entry.opportunityId,
    [...(grouped.get(entry.opportunityId) ?? []), entry]));
  const equipment = equipmentFor(input.bundle);
  return Object.freeze([...grouped.entries()].sort(([left], [right]) => left.localeCompare(right))
    .map(([opportunityId, objectives], index) => {
      const minutes = input.bundle.availabilityMapping.opportunities.find((entry) =>
        entry.opportunityId === opportunityId)?.minutes ?? 45;
      const evaluationTime = input.bundle.provenance.find((entry) =>
        entry.startsWith("evaluation-time:"))?.replace("evaluation-time:", "") ??
        input.fixture.productSourceRevision;
      const directive = { ...plannerDirective({
        id: `goal-specific-session:${executionIdentity(input.fixture)}:${index + 1}`,
        athleteId: input.fixture.athleteShellId,
        outcomeGoal: trainingOutcome(input.bundle),
        minutes,
        capacity: minutes <= 30 ? "condensed" : minutes >= 60 ? "expanded" : "standard",
        programmingContextModes: input.bundle.goalMapping.programmingContexts,
        objectives: objectives.map((objective) => plannerObjective({
          id: objective.allocatedObjectiveId,
          kind: objective.localPrescriptionPurpose === "direct_development" ? "direct_accessory" :
            objective.localPrescriptionPurpose === "capacity_development"
              ? "capacity_main" : "dominant_main",
          priority: objective.priority,
          priorityOrder: index,
          selectionTarget: targetForPurpose(objective.localPrescriptionPurpose),
          sourceEvidence: [{ sourceKind: "future_week_allocation",
            sourceId: objective.weeklyObjectiveId,
            evidenceRefs: objective.plannerProvenance.sourceEvidenceRefs }],
        })),
      }), evaluationAsOf: evaluationTime };
      const base = plannerInput({ directive, assessment: assessmentFor(input.bundle),
        pain: painFor(input.bundle), equipment: {
          capabilities: equipment,
          provenance: "explicit_today",
          sourceRef: `goal-specific-equipment:${executionIdentity(input.fixture)}`,
        } satisfies CurrentSessionEquipment });
      const actualInput: SessionIntentPlannerInput = {
        ...base,
        athlete: {
          ...base.athlete,
          id: input.fixture.athleteShellId,
          primaryGoal: trainingOutcome(input.bundle),
          secondaryGoals: input.bundle.goalMapping.secondaryOutcome ?
            [input.bundle.goalMapping.secondaryOutcome] : [],
          availability: { daysPerWeek: input.fixture.daysPerWeek, minutesPerSession: minutes,
            preferredTrainingDays: [] },
        },
        phaseIntent: { ...base.phaseIntent, primaryGoal: trainingOutcome(input.bundle) },
        evaluationAsOf: evaluationTime,
      };
      return {
        opportunityId,
        reservationId: `goal-specific-reservation:${opportunityId}`,
        materialized: Object.freeze(objectives),
        plannerInput: actualInput,
        planning: planSessionIntent(actualInput),
      };
    }));
}

function compilationContext(fixture: GoalSpecificProductFixture,
  purpose: PrescriptionLocalPurpose): PrescriptionCompilationContextFacts {
  return {
    familiarity: "unknown", returnAfterAbsence: fixture.trainingIntent === "rehab",
    painAwareLoadToleranceRegressionPermitted: fixture.painAreas.some((region) => region.includes("shoulder")),
    reliablePriorPerformance: false, reviewedRegression: false,
    adverseResponseSupportsReducedDose: false, newEquipmentRealization: false,
    requiredPreparationDependency: false, reviewedRangeOrControlDependency: false,
    sharedPreparationDependency: false, successfulBoundedPriorPreparation: false,
    requiredActivationDependency: false, explicitControlRequirement: false,
    lowFatigueActivationSuitable: false, adverseActivationFatigueResponse: false,
    mainWorkPreserved: true, secondaryObjectiveRequired: false, secondaryWeeklyPriority: false,
    secondaryCapacitySupported: true, secondaryHigherPriorityConflict: false,
    secondaryNonRedundantUpstream: true, accessoryPriority: "optional",
    accessoryUniquePurposeActive: true, accessoryCoherencePreserved: true,
    overlappingExposureRepresented: false, firstExposure: true, insufficientResponseHistory: true,
    directObjectiveConfirmedUpstream: purpose === "direct_development",
    allocatedRecoveryResponsibility: false, successfulBreathResponse: false,
    sessionCapacityPreservesMainWork: true,
    carryPurpose: purpose === "capacity_development" || purpose === "muscular_endurance_development"
      ? "capacity_main" : "accessory",
    stationaryMarchRealization: "count", reviewedAcclimationBlockCount: null,
    requestedTempoIntent: "natural", explicitPowerObjective: null,
    powerIntentPermittedByExerciseKnowledge: false, assessmentPriorityIds: [],
    alignmentPriorityIds: [], provenanceRefs: [`goal-specific-purpose:${purpose}`],
  };
}

function compatibilityCompilerInput(fixture: GoalSpecificProductFixture,
  session: SessionExecution, equipment: EquipmentCapabilities): PrescriptionSessionCompilerInput {
  const intent = session.planning.sessionIntent!;
  const skeleton = session.skeleton!;
  const handoff = session.handoff!;
  const purposeByNeed = new Map(session.materialized.map((entry) =>
    [entry.allocatedObjectiveId, entry.localPrescriptionPurpose]));
  const fallbackPurpose = session.materialized[0]!.localPrescriptionPurpose;
  return {
    sessionIntent: intent,
    sessionSkeleton: skeleton,
    handoff,
    athlete: session.plannerInput.athlete,
    exerciseRegistry: REFERENCE_EXERCISES,
    exerciseKnowledgeRegistry: REFERENCE_EXERCISES.map((entry) => entry.prescriptionKnowledge),
    currentEquipment: equipment,
    trainingReadiness: buildTrainingReadinessTrace({ trainingSafety: session.plannerInput.trainingSafety }),
    executionRequirements: executionRequirementsFor(session),
    contextByHandoffId: Object.fromEntries(handoff.assignments.map((assignment) => [
      assignment.handoffId,
      compilationContext(fixture, assignment.satisfiedNeedIds.map((needId) => purposeByNeed.get(needId))
        .find((value): value is PrescriptionLocalPurpose => Boolean(value)) ?? fallbackPurpose),
    ])),
    continuityEvidenceByHandoffId: Object.fromEntries(handoff.assignments.map((assignment) =>
      [assignment.handoffId, null])),
    priorRealizationEvidenceByHandoffId: Object.fromEntries(handoff.assignments.map((assignment) =>
      [assignment.handoffId, null])),
    completedPerformanceReferences: [], responseReceiverEvidence: [],
    executionAttemptId: `goal-specific-attempt:${executionIdentity(fixture)}:${session.opportunityId}`,
    evaluationTime: session.plannerInput.evaluationAsOf,
    policy: PRESCRIPTION_POLICY_V1,
    availablePolicies: [PRESCRIPTION_POLICY_V1],
    revisionContextByHandoffId: Object.fromEntries(handoff.assignments.map((assignment) =>
      [assignment.handoffId, null])),
  };
}

function b4Input(input: {
  readonly fixture: GoalSpecificProductFixture;
  readonly bundle: ControlledProductShadowGoalRealizationMappingBundleV1;
  readonly session: SessionExecution;
  readonly assignment: Handoff["assignments"][number];
  readonly compatibilityInput: PrescriptionSessionCompilerInput;
}): PrescriptionAssignmentCompilerInputV1_3 {
  const { fixture, bundle, session, assignment, compatibilityInput } = input;
  const materialized = session.materialized.find((entry) =>
    assignment.satisfiedNeedIds.includes(entry.allocatedObjectiveId)) ?? session.materialized[0]!;
  const knowledge = REFERENCE_EXERCISES.find((entry) => entry.id === assignment.exerciseId)!
    .prescriptionKnowledge;
  const attemptId = `goal-specific-purpose-attempt:${executionIdentity(fixture)}:${assignment.handoffId}`;
  const purposeEvidenceSnapshot = buildExplicitStandalonePrescriptionPurposeEvidenceSnapshot({
    source: {
      contractReference: EXPLICIT_STANDALONE_PRESCRIPTION_PURPOSE_SOURCE_CONTRACT_REFERENCE,
      sourceId: `goal-specific-purpose-source:${materialized.responsibilityId}`,
      owner: "production_week_planner_v1_1",
      athleteId: fixture.athleteShellId,
      outcomeGoal: trainingOutcome(bundle),
      localPurpose: materialized.localPrescriptionPurpose,
      purposeAuthority: materialized.purposeAuthority,
      targetSessionIntentId: session.planning.sessionIntent!.id,
      targetObjectiveIds: [materialized.weeklyObjectiveId],
      targetSessionNeedIds: assignment.satisfiedNeedIds,
      targetAssignmentHandoffId: assignment.handoffId,
      priority: materialized.priority,
      priorityOrder: 0,
      section: assignment.section,
      role: assignment.role,
      expectedDoseModeLane: knowledge.primaryDoseMode,
      evidenceRefs: materialized.plannerProvenance.sourceEvidenceRefs,
      reviewState: "policy_reviewed",
      explicitUnknowns: [],
      provenance: { owner: "production_week_purpose_projection",
        sourceRefs: materialized.plannerProvenance.sourceEvidenceRefs,
        ruleRefs: ["WEEK_V1_1_EXACT_PURPOSE_PROPAGATION"] },
    },
    sessionIntent: session.planning.sessionIntent!,
    sessionSkeleton: session.skeleton!,
    prescriptionHandoff: session.handoff!,
    evaluationTime: session.plannerInput.evaluationAsOf,
    purposeResolutionAttemptId: attemptId,
    resolverPolicyReference: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE,
  });
  const base = buildB4CompilerInput({ exerciseId: assignment.exerciseId,
    coarseExperience: fixture.experience.toLowerCase() as "beginner" | "intermediate" | "advanced",
    firstExposure: true, habitualKnown: false,
    equipmentMaximum: assignment.exerciseId === "push-up"
      ? null : bundle.equipmentLoadRealizationMapping.loadMaximum,
    equipmentIncrement: assignment.exerciseId === "push-up"
      ? null : bundle.equipmentLoadRealizationMapping.loadIncrement,
    loadCeilingInsufficient: fixture.equipmentDetail === "dumbbell_low_ceiling",
    trainingMode: bundle.planningBrief!.trainingMode,
    timeBudgetMinutes: fixture.minutes,
  });
  const athleteId = fixture.athleteShellId;
  const implementId = base.equipmentLoadProfile.implementId;
  return {
    ...base,
    sessionIntent: session.planning.sessionIntent!,
    sessionSkeleton: session.skeleton!,
    handoff: session.handoff!,
    assignmentHandoffId: assignment.handoffId,
    athlete: compatibilityInput.athlete,
    currentEquipment: compatibilityInput.currentEquipment,
    trainingReadiness: compatibilityInput.trainingReadiness,
    executionRequirements: compatibilityInput.executionRequirements,
    executionAttemptId: compatibilityInput.executionAttemptId,
    evaluationTime: compatibilityInput.evaluationTime,
    context: compatibilityInput.contextByHandoffId[assignment.handoffId]!,
    continuityEvidence: null,
    priorRealizationEvidence: null,
    purposeEvidenceSnapshot,
    purposeResolutionAttemptId: attemptId,
    experienceProfile: { ...base.experienceProfile, athleteId },
    identityFamiliarityProfile: { ...base.identityFamiliarityProfile, athleteId,
      exerciseId: assignment.exerciseId },
    realizationFamiliarityProfile: { ...base.realizationFamiliarityProfile, athleteId,
      realization: { ...base.realizationFamiliarityProfile.realization,
        exerciseId: assignment.exerciseId, doseMode: knowledge.primaryDoseMode,
        equipmentImplementId: implementId, section: assignment.section, role: assignment.role,
        purpose: materialized.localPrescriptionPurpose } },
    habitualExposureProfile: { ...base.habitualExposureProfile, athleteId },
    equipmentLoadProfile: { ...base.equipmentLoadProfile, athleteId },
    programmingBrief: null,
    specializationProfile: null,
    painAwareContext: Object.freeze({
      relevant: bundle.painContextMapping.regions.some((region) => region.includes("shoulder")),
      region: bundle.painContextMapping.regions.find((region) => region.includes("shoulder")) ?? null,
      side: null, explicitRestrictionIds: Object.freeze([]), diagnosisClaimed: false,
      causalPostureClaimed: false, successfulReExposure: false,
    }),
  };
}

function evidenceProvenance(sourceRef: string) {
  return Object.freeze({ source: "synthetic_contract_fixture" as const, sourceRef });
}

function sourcePurpose(purpose: PrescriptionLocalPurpose): ProductionWeekObjectiveSnapshot["purpose"] {
  if (purpose === "hypertrophy_development") return "muscle_development";
  if (purpose === "direct_development") return "direct_action_development";
  if (purpose === "capacity_development") return "capacity_development";
  if (purpose === "muscular_endurance_development") return "movement_development";
  return "movement_development";
}

function gate13Input(input: {
  readonly fixture: GoalSpecificProductFixture;
  readonly bundle: ControlledProductShadowGoalRealizationMappingBundleV1;
  readonly intent: ProductionWeeklyIntentV1_1;
  readonly plan: WeekPlan;
  readonly sessions: readonly SessionExecution[];
}): ProductionPostPrescriptionWeekValidationInput {
  const provenance = [evidenceProvenance(`goal-specific:${executionIdentity(input.fixture)}`)];
  const intentById = new Map(input.intent.objectives.map((objective) =>
    [objective.objectiveId, objective]));
  const objectives: readonly ProductionWeekObjectiveSnapshot[] = input.sessions.flatMap((session) =>
    session.materialized.map((materialized) => {
      const objective = intentById.get(materialized.weeklyObjectiveId)!;
      return {
        objectiveId: materialized.allocatedObjectiveId,
        purpose: sourcePurpose(objective.localPrescriptionPurpose),
        target: objective.target,
        priority: objective.priority,
        priorityOrder: objective.priorityOrder,
        goalRelationships: objective.goalRelationships,
        frequencyIntent: { minimumAllocatedSessions: 1, targetAllocatedSessions: 1,
          softMaximumAllocatedSessions: 1,
          sourceRef: materialized.responsibilityId, provenance },
        supportedPolicyRef: PRODUCTION_WEEK_POLICY_V2.reference,
        dosePolicyState: "explicit_reviewed_target" as const,
        spacingState: "SPACING_R0_PRESCRIPTION_PENDING" as const,
        sourceEvidenceRefs: Object.freeze([
          ...objective.sourceEvidenceRefs,
          `weekly-intent-objective:${objective.objectiveId}`,
        ]),
        provenance,
      };
    }));
  const reservations: readonly ProductionWeekReservationSnapshot[] = input.sessions.map((session) => ({
    reservationId: session.reservationId,
    opportunityId: session.opportunityId,
    allocatedObjectiveIds: session.materialized.map((entry) => entry.allocatedObjectiveId),
    expectedSessionGoal: trainingOutcome(input.bundle),
    responsibilityEvidenceRefs: session.materialized.flatMap((entry) =>
      entry.plannerProvenance.sourceEvidenceRefs),
    availabilityState: "available",
    executionState: "not_started",
    invalidationState: "active",
    provenance,
  }));
  const opportunities = input.bundle.availabilityMapping.opportunities.map((opportunity) => ({
    opportunityId: opportunity.opportunityId,
    order: opportunity.order,
    calendarDateTime: null,
    availableMinutes: opportunity.minutes,
    availabilityState: "available" as const,
    executionState: "not_started" as const,
    reservationIds: reservations.filter((reservation) =>
      reservation.opportunityId === opportunity.opportunityId).map((reservation) => reservation.reservationId),
    provenance,
  }));
  const allocationTraces = input.sessions.flatMap((session) => session.materialized.map((objective) => ({
    allocationTraceId: `goal-specific-allocation:${objective.responsibilityId}`,
    objectiveId: objective.allocatedObjectiveId,
    reservationId: session.reservationId,
    opportunityId: session.opportunityId,
    sessionDirectiveId: session.planning.sessionIntent?.id ?? null,
    sessionNeedIds: session.planning.sessionIntent!.needs
      .filter((need) => need.plannerProvenance?.objectiveIds.includes(objective.allocatedObjectiveId) ?? false)
      .map((need) => need.id),
    sourceEvidenceRefs: objective.plannerProvenance.sourceEvidenceRefs,
    provenance,
  })));
  return {
    validatorContract: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_CONTRACT_REFERENCE,
    validationPolicy: POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE,
    availableValidationPolicies: [POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE],
    weekSource: {
      sourceContract: PRODUCTION_PRESCRIBED_WEEK_SOURCE_CONTRACT_REFERENCE,
      sourceSnapshotId: `goal-specific-week-source:${input.bundle.mappingFingerprint}`,
      sourceSnapshotRevisionId: `goal-specific-week-source-revision:${evidenceDigest({
        mapping: input.bundle.mappingFingerprint, intent: input.intent, plan: input.plan,
      }).slice(0, 24)}`,
      sourceAuthority: "COMPATIBILITY_ADAPTER",
      athleteId: input.fixture.athleteShellId,
      planningHorizonId: `goal-specific-horizon:${executionIdentity(input.fixture)}`,
      weeklyIntentId: input.intent.intentId,
      weekAllocationPlanId: input.plan.planId,
      horizonBoundary: { startsAt: null, endsAt: null, timezone: "America/Toronto" },
      opportunities: Object.freeze(opportunities), objectives: Object.freeze(objectives),
      reservations: Object.freeze(reservations), allocationTraces: Object.freeze(allocationTraces),
      unsupportedScopes: input.bundle.planningBrief?.unsupportedScope ?? [],
      unresolvedPolicyRefs: [], evaluationTime: input.intent.evaluationTime,
      provenance,
    },
    sessionBundles: Object.freeze(input.sessions.map((session) => ({
      reservationId: session.reservationId,
      opportunityId: session.opportunityId,
      sessionIntentId: session.planning.sessionIntent!.id,
      executionAttemptId: `goal-specific-attempt:${executionIdentity(input.fixture)}:${session.opportunityId}`,
      sessionIntent: session.planning.sessionIntent!, sessionSkeleton: session.skeleton!,
      prescriptionCompilation: session.compatibilityCompilation!,
      sequencingResult: session.sequencing!, expectedArtifactState: "expected" as const,
      provenance,
    }))),
    exerciseRegistry: REFERENCE_EXERCISES,
    evaluationTime: input.intent.evaluationTime,
    upstreamGateState: "PASS",
    priorValidationRevisionContext: null,
  };
}

function purposeEvents(sessions: readonly SessionExecution[]) {
  return Object.freeze(sessions.flatMap((session) => (session.realizationResults ?? []).flatMap((result) => {
    const plan = result.plan;
    const contribution = plan?.purposeContributions.find((entry) => entry.weeklyCreditCandidate);
    const block = contribution ? plan?.doseBlocks.find((entry) => entry.blockId === contribution.blockId) : null;
    const compatibilityBlock = session.compatibilityCompilation?.plans
      .find((entry) => entry.sourceExposureEvent.sourceExposureEventId ===
        plan?.sourceExposureEvent.sourceExposureEventId)?.doseBlocks
      .find((entry) => entry.contributionClassification === "developmental_credit_candidate");
    const materialized = session.materialized[0];
    if (!plan || !contribution || !block || !compatibilityBlock || !materialized) return [];
    return [Object.freeze({
      sourceExposureEventId: plan.sourceExposureEvent.sourceExposureEventId,
      blockId: compatibilityBlock.blockId,
      blockPurpose: block.purpose,
      localPurpose: contribution.localPurpose!,
      primaryLane: contribution.primaryLane,
      objectiveViews: Object.freeze([Object.freeze({
        objectiveId: materialized.allocatedObjectiveId,
        localPurpose: contribution.localPurpose!,
        relationship: "primary_weekly_goal" as const,
        creditRequested: true,
      })]),
      doseFingerprint: evidenceDigest(block.dose),
      duplicateDoseCreated: false as const,
      systemicConditioningClaimed: false as const,
      completedPerformanceClaimed: false as const,
      adaptationClaimed: false as const,
    })];
  })));
}

function realizationEvents(sessions: readonly SessionExecution[]) {
  return Object.freeze(sessions.flatMap((session) => (session.realizationResults ?? []).flatMap((result) => {
    const plan = result.plan;
    if (!plan) return [];
    return [Object.freeze({
      sourceExposureEventId: plan.sourceExposureEvent.sourceExposureEventId,
      exerciseId: plan.exerciseId,
      prescriptionRevisionId: plan.prescriptionRevisionId,
      equipmentRealizationProfileId: plan.equipmentLoadRealization.profileId,
      experienceProfileId: `goal-specific-experience:${session.opportunityId}`,
      identityFamiliarityProfileId: `goal-specific-identity:${plan.exerciseId}`,
      realizationFamiliarityProfileId: `goal-specific-realization:${plan.exerciseId}`,
      contextRealizationVariant: plan.contextRealization.variant,
      startingPointStatus: plan.startingPoint.status,
      returnOrRebuildStatus: plan.returnOrRebuild?.status ?? null,
      habitualExposureComparison: plan.habitualExposureComparison,
      rampUpBlocks: plan.rampUp.blocks,
      timeBudgetState: plan.rampUp.durationIncluded ? "within_budget" as const : "unknown" as const,
      advancedIntensityTechniqueRequestCount: 0,
      intensityTechniqueFlattenedCount: 0 as const,
      preparatoryDevelopmentalCreditCount: 0 as const,
      completedPerformanceClaimed: false as const,
      adaptationClaimed: false as const,
      systemicConditioningClaimed: false as const,
      fractionalCoefficient: null,
    })];
  })));
}

function stageManifest(): readonly GoalSpecificStageAuthenticityEntry[] {
  const kernels: Readonly<Record<Stage, readonly [string, string, boolean]>> = Object.freeze({
    week_source: ["buildControlledProductShadowGoalRealizationMappingBundleV1", "Chunk C mapping bundle", true],
    weekly_intent: ["planSupportedPurposeWeeklyIntentV1_1", "planning brief to weekly priorities", true],
    week_allocation: ["composeSupportedPurposeWeekV1_1", "ordered Product opportunities", true],
    planning_context: ["materializeSupportedPurposeObjectiveV1_1", "week responsibility materializer", true],
    session_intent: ["planSessionIntent", "materialized objectives to allocation directive", true],
    candidate_intelligence: ["buildSessionCandidateResults", "typed mapping context adapter", true],
    session_composer: ["composeSessionSkeleton + buildSessionPrescriptionHandoff", "real candidate results", true],
    prescription: ["compilePrescriptionAssignmentV1_3 + compileSessionPrescription@1.0.0", "actual handoff and purpose snapshot", true],
    final_sequence: ["sequenceFinalSession", "actual compatibility compilation", true],
    gate_13: ["validatePostPrescriptionWeekV1_2", "actual final prescriptions and sequence", true],
    phase_snapshot: ["buildProductionPhaseProgramSnapshot", "planned truth only", true],
    longitudinal: ["NO_PERFORMANCE_PRECONDITION_BOUNDARY", "no completed shadow Performance", false],
    application_orchestration: ["NO_ACTION_PRECONDITION_BOUNDARY", "no longitudinal directive", false],
  });
  return Object.freeze(PRODUCT_SHADOW_B1_B4_STAGE_ORDER.map((stage, index) => {
    const [kernel, adapter, counts] = kernels[stage];
    const reference = CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4.stageReferences[index]!;
    const semantic = { stage, contractId: reference.contractId, contractVersion: reference.contractVersion,
      productionKernel: kernel, sourceAdapter: adapter,
      inputArtifactTypes: index === 0 ? ["mapping_bundle"] : [PRODUCT_SHADOW_B1_B4_STAGE_ORDER[index - 1]!],
      outputArtifactType: stage === "longitudinal" ? "longitudinal_restriction" :
        stage === "application_orchestration" ? "orchestration_no_action" : `${stage}_artifact`,
      genuineExecution: counts, fixtureOnly: false, scriptedStatus: false as const,
      countsAsEvidence: true, unresolvedOwner: counts ? null :
        stage === "longitudinal" ? "COMPLETED_PERFORMANCE_SOURCE" : "FINAL_LONGITUDINAL_DIRECTIVE" };
    return Object.freeze({ ...semantic, fingerprint: evidenceDigest(semantic) });
  }));
}

export const GOAL_SPECIFIC_STAGE_AUTHENTICITY_MANIFEST = stageManifest();

function artifact(input: {
  readonly store: GoalSpecificProductShadowArtifactStore;
  readonly fixture: GoalSpecificProductFixture;
  readonly stage: Stage;
  readonly artifactType: string;
  readonly payload: unknown;
  readonly lineage: readonly string[];
}): GoalSpecificArtifactReference {
  const index = PRODUCT_SHADOW_B1_B4_STAGE_ORDER.indexOf(input.stage);
  const contract = CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4.stageReferences[index]!;
  const artifactId = `${input.artifactType}:${input.fixture.fixtureId}`;
  const artifactRevisionId = `${input.artifactType}-revision:${evidenceDigest(input.payload).slice(0, 32)}`;
  return input.store.put({ artifactType: input.artifactType, artifactId, artifactRevisionId,
    contractId: contract.contractId, contractVersion: contract.contractVersion,
    athleteId: input.fixture.athleteShellId,
    scenarioId: input.fixture.fixtureId.replace(/^fixture:/, "scenario:"),
    stage: input.stage, sourceLineage: Object.freeze([...input.lineage]),
    counterfactualOnly: true, payload: input.payload });
}

function pipelineReference(reference: GoalSpecificArtifactReference, stage: Stage) {
  const contractReference = CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4.stageReferences[
    PRODUCT_SHADOW_B1_B4_STAGE_ORDER.indexOf(stage)]!;
  return Object.freeze({ artifactType: reference.artifactType,
    artifactRevisionId: reference.artifactRevisionId, contractReference, counterfactualOnly: true as const });
}

export function createGenuineGoalSpecificStagePorts(input: {
  readonly fixture: GoalSpecificProductFixture;
  readonly mappingBundle: ControlledProductShadowGoalRealizationMappingBundleV1;
  readonly store: GoalSpecificProductShadowArtifactStore;
}) {
  const state: GenuineStageExecutionState = {
    mappingBundle: input.mappingBundle,
    planningBrief: input.mappingBundle.planningBrief,
  };
  const put = (stage: Stage, type: string, payload: unknown, lineage: readonly string[]) =>
    artifact({ store: input.store, fixture: input.fixture, stage, artifactType: type, payload, lineage });
  const complete = (stage: Stage, reference: GoalSpecificArtifactReference, unresolved: readonly string[] = []) =>
    Object.freeze({ status: "complete" as const, artifactReference: pipelineReference(reference, stage),
      unresolvedRequirements: Object.freeze([...unresolved]) });
  const notApplicable = (stage: Stage, reference: GoalSpecificArtifactReference,
    unresolved: readonly string[]) => Object.freeze({ status: "not_applicable" as const,
      artifactReference: pipelineReference(reference, stage), unresolvedRequirements: Object.freeze([...unresolved]) });

  const evaluators: Readonly<Record<Stage, ProductShadowB1B4StagePort["evaluate"]>> = {
    week_source: () => {
      const reference = put("week_source", "goal_specific_planning_brief",
        state.planningBrief, [input.mappingBundle.mappingFingerprint]);
      return complete("week_source", reference);
    },
    weekly_intent: () => {
      state.weeklyIntent = planSupportedPurposeWeeklyIntentV1_1({
        policy: PRODUCTION_WEEK_POLICY_V2,
        intentId: `goal-specific-weekly-intent:${input.mappingBundle.mappingFingerprint.slice(0, 24)}`,
        athleteId: input.fixture.athleteShellId,
        outcomeGoal: trainingOutcome(input.mappingBundle),
        priorities: priorities(input.mappingBundle),
        evaluationTime: input.fixture.productSourceRevision.startsWith("time:")
          ? input.fixture.productSourceRevision.slice(5) :
          input.mappingBundle.provenance.find((entry) => entry.startsWith("evaluation-time:"))!
            .replace("evaluation-time:", ""),
      });
      const reference = put("weekly_intent", "production_weekly_intent_v1_1", state.weeklyIntent,
        [input.mappingBundle.mappingFingerprint]);
      return complete("weekly_intent", reference);
    },
    week_allocation: () => {
      state.weekPlan = composeSupportedPurposeWeekV1_1({ intent: state.weeklyIntent!,
        opportunities: input.mappingBundle.availabilityMapping.opportunities.map((entry) => ({
          opportunityId: entry.opportunityId,
          structuralCapacity: (entry.minutes ?? 45) <= 30 ? "condensed" as const :
            (entry.minutes ?? 45) >= 60 ? "expanded" as const : "standard" as const,
        })) });
      const reference = put("week_allocation", "production_week_allocation_v1_1", state.weekPlan,
        [state.weeklyIntent!.intentId]);
      return complete("week_allocation", reference);
    },
    planning_context: () => {
      state.materialized = Object.freeze(state.weekPlan!.reservations.map(materializeSupportedPurposeObjectiveV1_1));
      const reference = put("planning_context", "materialized_session_objectives_v1_1", state.materialized,
        [state.weekPlan!.planId]);
      return complete("planning_context", reference);
    },
    session_intent: () => {
      state.sessions = sessionExecutions({ fixture: input.fixture, bundle: input.mappingBundle,
        materialized: state.materialized! });
      const failed = state.sessions.filter((session) => session.planning.status !== "planned" ||
        !session.planning.sessionIntent);
      if (failed.length) return Object.freeze({ status: "incomplete_policy" as const,
        artifactReference: null, unresolvedRequirements: Object.freeze(failed.map((session) =>
          `SESSION_INTENT_NOT_PLANNED:${session.planning.status}`)) });
      const reference = put("session_intent", "production_session_intents",
        state.sessions.map((session) => session.planning), [state.weekPlan!.planId]);
      return complete("session_intent", reference);
    },
    candidate_intelligence: () => {
      state.sessions!.forEach((session) => {
        const planner = session.plannerInput;
        const context: SessionCandidateBuildContext = {
          athlete: planner.athlete, assessment: planner.assessment,
          alignmentPriorities: deriveAlignmentPriorities(planner.assessment).priorities,
          painAndInjury: planner.painAndInjury, trainingSafety: planner.trainingSafety,
          equipment: planner.currentEquipment.capabilities, history: planner.history,
          satisfiedPrerequisiteIds: planner.satisfiedPrerequisiteIds,
          evaluationAsOf: planner.evaluationAsOf,
        };
        session.candidateResults = buildSessionCandidateResults(session.planning.sessionIntent!, context);
      });
      const reference = put("candidate_intelligence", "production_candidate_results",
        state.sessions!.map((session) => session.candidateResults),
        state.sessions!.map((session) => session.planning.sessionIntent!.id));
      return complete("candidate_intelligence", reference);
    },
    session_composer: () => {
      state.sessions!.forEach((session) => {
        session.skeleton = composeSessionSkeleton({ intent: session.planning.sessionIntent!,
          candidateResultsByNeed: session.candidateResults! });
        session.handoff = buildSessionPrescriptionHandoff({ intent: session.planning.sessionIntent!,
          skeleton: session.skeleton, candidateResultsByNeed: session.candidateResults! });
      });
      const failed = state.sessions!.filter((session) => !session.skeleton?.assignments.length ||
        !session.handoff?.assignments.length);
      if (failed.length) return Object.freeze({ status: "search_inconclusive" as const,
        artifactReference: null,
        unresolvedRequirements: Object.freeze(["SESSION_COMPOSER_ASSIGNMENT_REQUIRED"]) });
      const reference = put("session_composer", "production_session_skeletons_and_handoffs",
        state.sessions!.map((session) => ({ skeleton: session.skeleton, handoff: session.handoff })),
        state.sessions!.map((session) => session.planning.sessionIntent!.id));
      return complete("session_composer", reference);
    },
    prescription: () => {
      const equipment = equipmentFor(input.mappingBundle);
      state.sessions!.forEach((session) => {
        const compatibility = compatibilityCompilerInput(input.fixture, session, equipment);
        session.compatibilityCompilation = compileSessionPrescription(compatibility);
        session.realizationResults = Object.freeze(session.handoff!.assignments.map((assignment) =>
          compilePrescriptionAssignmentV1_3(b4Input({ fixture: input.fixture, bundle: input.mappingBundle,
            session, assignment, compatibilityInput: compatibility }))));
      });
      const failures = state.sessions!.flatMap((session) => [
        ...(session.compatibilityCompilation?.status === "compiled" ? [] :
          [`COMPATIBILITY_COMPILATION:${session.compatibilityCompilation?.status}`]),
        ...(session.realizationResults ?? []).filter((result) => !result.plan)
          .map((result) => `REALIZATION_COMPILATION:${result.status}`),
      ]);
      if (failures.length) return Object.freeze({ status: failures.some((entry) =>
        entry.includes("load_ceiling")) ? "incomplete_mapping" as const : "incomplete_policy" as const,
      artifactReference: null, unresolvedRequirements: Object.freeze(failures) });
      const reference = put("prescription", "production_prescription_v1_3_with_v1_0_compatibility",
        state.sessions!.map((session) => ({ compatibility: session.compatibilityCompilation,
          realization: session.realizationResults })),
        state.sessions!.map((session) => session.handoff!.sessionIntentId));
      return complete("prescription", reference);
    },
    final_sequence: () => {
      state.sessions!.forEach((session) => {
        const facts = deriveCanonicalCompositionFacts({ candidateResultsByNeed: session.candidateResults!,
          continuity: session.planning.sessionIntent!.continuityEvidence });
        session.sequencing = sequenceFinalSession({
          sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
          policy: SESSION_SEQUENCING_POLICY_V1,
          availablePolicies: [SESSION_SEQUENCING_POLICY_V1],
          intent: session.planning.sessionIntent!, skeleton: session.skeleton!,
          sequencingHandoff: buildSessionSequencingInput(session.skeleton!),
          prescriptionSession: session.compatibilityCompilation!,
          compositionFacts: session.skeleton!.assignments.map((assignment) => facts.get(assignment.exerciseId)!),
          currentEquipment: session.plannerInput.currentEquipment.capabilities,
          equipmentRealizations: session.compatibilityCompilation!.assignmentResults.flatMap((result) =>
            result.equipmentRealization ? [result.equipmentRealization] : []),
          explicitTransitionFacts: [],
          availableMinutes: session.planning.sessionIntent!.availableMinutes,
          trainingReadiness: CLEAR_TRAINING_READINESS,
          executionAttemptId: `goal-specific-attempt:${executionIdentity(input.fixture)}:${session.opportunityId}`,
          evaluationTime: session.plannerInput.evaluationAsOf,
          searchResourcePolicy: PRODUCTION_FINAL_SEQUENCING_TEST_SEARCH_POLICY,
          availableSearchResourcePolicies: [PRODUCTION_FINAL_SEQUENCING_TEST_SEARCH_POLICY],
          revisionContext: null,
        });
      });
      const failures = state.sessions!.filter((session) => !session.sequencing?.plan);
      if (failures.length) return Object.freeze({ status: "search_inconclusive" as const,
        artifactReference: null, unresolvedRequirements: Object.freeze(failures.map((session) =>
          `FINAL_SEQUENCE:${session.sequencing?.status}`)) });
      const reference = put("final_sequence", "production_final_sequences",
        state.sessions!.map((session) => session.sequencing),
        state.sessions!.flatMap((session) => session.compatibilityCompilation!.plans
          .map((plan) => plan.prescriptionRevisionId)));
      return complete("final_sequence", reference);
    },
    gate_13: () => {
      state.gate13Input = gate13Input({ fixture: input.fixture, bundle: input.mappingBundle,
        intent: state.weeklyIntent!, plan: state.weekPlan!, sessions: state.sessions! });
      state.gate13V1 = validatePostPrescriptionWeek(state.gate13Input);
      state.gate13V12 = validatePostPrescriptionWeekV1_2({
        validatorContract: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_2_CONTRACT_REFERENCE,
        baseValidationInput: {
          validatorContract: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_1_CONTRACT_REFERENCE,
          baseValidationInput: state.gate13Input,
          purposeContributionEvents: purposeEvents(state.sessions!),
        },
        realizationContextEvents: realizationEvents(state.sessions!),
      });
      const full = buildFullPrescribedProgramSnapshot({ validationInput: state.gate13Input,
        authorityRegistry: CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V2,
        provenance: ["goal-specific-product-shadow:real-artifacts"] });
      if (full.status !== "built" || !state.gate13V1.status.startsWith("validated_") ||
          !state.gate13V12.status.startsWith("validated_")) {
        return Object.freeze({ status: "incomplete_policy" as const, artifactReference: null,
          unresolvedRequirements: Object.freeze([
            `GATE13_V1:${state.gate13V1.status}`,
            `GATE13_V1_2:${state.gate13V12.status}`,
            ...full.reasonCodes,
          ]) });
      }
      state.fullProgramSnapshot = full.snapshot;
      const reference = put("gate_13", "full_prescribed_program_snapshot",
        { gate13V1: state.gate13V1, gate13V12: state.gate13V12,
          fullProgramSnapshot: state.fullProgramSnapshot },
        state.sessions!.flatMap((session) => session.sequencing!.plan!.sourceExposureEventIds));
      return complete("gate_13", reference);
    },
    phase_snapshot: () => {
      state.phaseSnapshot = buildProductionPhaseProgramSnapshot({
        weekSource: state.gate13Input!.weekSource,
        postPrescriptionWeekResult: state.gate13V1!,
        sessionIntents: state.sessions!.map((session) => session.planning.sessionIntent!),
        sessionSkeletons: state.sessions!.map((session) => session.skeleton!),
        prescriptionSessionResults: state.sessions!.map((session) => session.compatibilityCompilation!),
        finalSequencePlans: state.sessions!.map((session) => session.sequencing!.plan!),
        phaseStateContext: { phaseId: state.sessions![0]!.planning.sessionIntent!.phaseIntent.id,
          phaseStateId: `goal-specific-phase-state:${input.fixture.athleteShellId}`,
          phaseStateRevisionId: `goal-specific-phase-state-revision:${input.mappingBundle.mappingFingerprint.slice(0, 24)}` },
        evaluationTime: state.gate13Input!.evaluationTime,
        basedOnRevisionId: null,
        provenance: ["goal-specific-product-shadow:planned-truth-only"],
      });
      const reference = put("phase_snapshot", "production_phase_program_snapshot_planned_truth",
        state.phaseSnapshot, [state.fullProgramSnapshot!.snapshotRevisionId]);
      return complete("phase_snapshot", reference, ["PHASE_TRANSITION_READINESS_NOT_PROVEN"]);
    },
    longitudinal: () => {
      const payload = Object.freeze({ status: "restricted_insufficient_evidence",
        completedShadowPerformanceCount: 0, adaptationDecisionCount: 0,
        reason: "NO_COMPLETED_SHADOW_PERFORMANCE" });
      const reference = put("longitudinal", "longitudinal_restriction", payload,
        [state.phaseSnapshot!.snapshotRevisionId]);
      return notApplicable("longitudinal", reference, ["LONGITUDINAL_REQUIRES_COMPLETED_PERFORMANCE"]);
    },
    application_orchestration: () => {
      const payload = Object.freeze({ status: "no_action_no_application", directiveCount: 0,
        ownerInvocationCount: 0, applicationCount: 0, reason: "NO_LONGITUDINAL_DIRECTIVE" });
      const reference = put("application_orchestration", "orchestration_no_action", payload,
        [state.phaseSnapshot!.snapshotRevisionId]);
      return notApplicable("application_orchestration", reference,
        ["APPLICATION_ORCHESTRATION_NOT_APPLICABLE_NO_DIRECTIVE"]);
    },
  };
  const ports = Object.freeze(PRODUCT_SHADOW_B1_B4_STAGE_ORDER.map((stage, index) => Object.freeze({
    stage,
    contractReference: CONTROLLED_PRODUCT_SHADOW_PIPELINE_PROFILE_B1_B4.stageReferences[index]!,
    evaluate: evaluators[stage],
  })));
  return Object.freeze({ ports, state });
}
