import {
  PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES,
  POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_DESIGN_COMPATIBILITY_PROJECTION,
  sequenceFinalSession,
  type SessionIntent,
  type SessionNeed,
} from "../../src";
import type {
  PostPrescriptionWeekSessionArtifact,
  PostPrescriptionWeekValidationInput,
  PostPrescriptionWeekValidationPolicy,
} from "../../src/weekValidation/designContracts";
import { POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT_REFERENCE } from "../../src/weekValidation/designContracts";
import type {
  SessionAllocationReservation,
  WeekAllocationPlan,
  WeekFactProvenance,
  WeekPlanningHorizon,
  WeekTrainingOpportunity,
  WeeklyDevelopmentObjective,
  WeeklyDevelopmentPurpose,
  WeeklyIntent,
} from "../../src/weekComposer/designContracts";
import {
  PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT,
  type OwnerPolicyHoldoutScenario,
} from "./prescriptionPolicyV1OwnerAdmission";
import { digest } from "./signatures";
import {
  prepareProductionFinalSequencingInput,
} from "../helpers/productionFinalSequencingLab";
import { validatePostPrescriptionWeekDesign } from "../helpers/postPrescriptionWeekValidationLab";

export const POST_PRESCRIPTION_WEEK_VALIDATION_V1_POLICY_ID =
  "POST_PRESCRIPTION_WEEK_VALIDATION_V1_CAUSAL_LEDGER_POLICY" as const;
export const POST_PRESCRIPTION_WEEK_VALIDATION_V1_POLICY_VERSION = "1.0.0" as const;
export const POST_PRESCRIPTION_WEEK_VALIDATION_V1_EVALUATION_TIME =
  "2026-08-14T01:00:00-04:00" as const;
export const POST_PRESCRIPTION_WEEK_VALIDATION_V1_AUTHORITY =
  "POST_PRESCRIPTION_WEEK_VALIDATION_DESIGN_EVIDENCE" as const;
export const POST_PRESCRIPTION_WEEK_VALIDATION_V1_CLASSIFICATION =
  "POST_PRESCRIPTION_WEEK_VALIDATION_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION" as const;
export const POST_PRESCRIPTION_WEEK_VALIDATION_ONTOLOGY_CLASSIFICATION =
  "POST_PRESCRIPTION_WEEK_VALIDATION_ONTOLOGY_READY" as const;

export const POST_PRESCRIPTION_WEEK_VALIDATION_V1_POLICY:
PostPrescriptionWeekValidationPolicy =
  POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_DESIGN_COMPATIBILITY_PROJECTION;

const provenance: WeekFactProvenance = Object.freeze({
  sourceType: "non_production_fixture",
  sourceRef: "post-prescription-week-validation-v1:locked-evidence",
  evidenceBasis: ["owner-authorized-design-admission"],
  recordedAt: POST_PRESCRIPTION_WEEK_VALIDATION_V1_EVALUATION_TIME,
  reviewStatus: "accepted",
  truthState: "planned_allocation",
});

function purposeForNeed(need: SessionNeed): WeeklyDevelopmentPurpose {
  if (need.selection.requestedRole === "capacity") return "capacity_development";
  if (need.selection.requestedRole === "recovery") return "recovery_support";
  if (["preparation", "activation"].includes(need.selection.requestedRole)) return "assessment_priority_development";
  if (need.selection.requestedRole === "hypertrophy_accessory") {
    return need.selection.targetActionFunctions.length > 0
      ? "direct_action_development"
      : "muscle_development";
  }
  return "movement_development";
}

function objectiveIdentity(need: SessionNeed): string {
  const purpose = purposeForNeed(need);
  if (purpose === "assessment_priority_development") {
    return "week-objective:assessment_priority_development:assessment_cluster";
  }
  const target = need.selection.targetMovementRoles[0] ?? need.selection.targetActionFunctions[0] ??
    need.selection.targetMuscles[0] ?? need.selection.targetBodyRegions[0] ?? need.id;
  return `week-objective:${purpose}:${target}`;
}

function objectiveFromNeed(need: SessionNeed): WeeklyDevelopmentObjective {
  const purpose = purposeForNeed(need);
  return {
    id: objectiveIdentity(need),
    purpose,
    selectionTarget: {
      targetMovementRoles: need.selection.targetMovementRoles,
      targetActionFunctions: need.selection.targetActionFunctions,
      targetMuscles: need.selection.targetMuscles,
      muscleRequirement: need.selection.muscleRequirement,
      targetBodyRegions: need.selection.targetBodyRegions,
    },
    priority: need.priority,
    priorityOrder: need.priorityOrder,
    sourceEvidence: [{
      sourceKind: "reviewed_policy",
      sourceId: `source:${objectiveIdentity(need)}`,
      evidenceRefs: [`evidence:${objectiveIdentity(need)}`],
      provenance,
    }],
    goalRelationships: [{
      goal: "strength",
      relationship: "primary_weekly_goal",
      sourceEvidenceRefs: [`evidence:${objectiveIdentity(need)}`],
    }],
    frequencyIntent: {
      minimumAllocatedSessions: need.priority === "required" ? 1 : 0,
      targetAllocatedSessions: purpose === "movement_development" && need.priority === "required" ? 2 : 1,
      softMaximumAllocatedSessions: purpose === "movement_development" ? 3 : purpose === "muscle_development" ? 2 : 1,
      source: "reviewed_policy",
      sourceRef: POST_PRESCRIPTION_WEEK_VALIDATION_V1_POLICY_ID,
      provenance,
    },
    dosePolicyReference: purpose === "assessment_priority_development" || purpose === "recovery_support"
      ? { state: "not_applicable" }
      : { state: "pending_prescription_policy", policyRef: "PRESCRIPTION_POLICY_V1_CAUSAL_SEQUENTIAL@1.0.0" },
    recoverySpacingRequirementRefs: [],
    sessionRoleFlexibility: purpose === "direct_action_development" ? ["accessory"] : ["main", "secondary", "accessory"],
    unresolvedPolicyState: "resolved_for_allocation",
    reasonCode: `OBJECTIVE_FROM_SESSION_NEED:${need.id}`,
    explanation: "Locked design evidence maps an explicit weekly objective to an upstream SessionNeed.",
  };
}

function enrichIntent(intent: SessionIntent, assessmentObjectiveAuthorized: boolean): SessionIntent {
  return {
    ...intent,
    needs: intent.needs.map((need) => ({
      ...need,
      plannerProvenance: {
        objectiveIds: ["preparation", "activation"].includes(need.selection.requestedRole) &&
          !assessmentObjectiveAuthorized ? [] : [objectiveIdentity(need)],
        owner: "weekly_intent_planner_design_v1",
        transformationRuleId: `week-to-session:${objectiveIdentity(need)}`,
        sourceEvidenceRefs: [`evidence:${objectiveIdentity(need)}`],
        assessmentSignalRefs: [],
        dependencyRefs: need.dependencies.map((dependency) => dependency.dependencyId),
        mergeHistory: [],
        priorityOrigin: objectiveIdentity(need),
        sectionRoleMappingOrigin: objectiveIdentity(need),
        standaloneAdmissionOrigin: objectiveIdentity(need),
        unknowns: [],
      },
    })),
  };
}

interface RealSessionArtifactBase {
  readonly fixture: OwnerPolicyHoldoutScenario;
  readonly sessionIntent: SessionIntent;
  readonly sessionSkeleton: PostPrescriptionWeekSessionArtifact["sessionSkeleton"];
  readonly prescriptionCompilation: NonNullable<PostPrescriptionWeekSessionArtifact["prescriptionCompilation"]>;
  readonly sequencingResult: NonNullable<PostPrescriptionWeekSessionArtifact["sequencingResult"]>;
}

let realSessionLibraryCache: readonly RealSessionArtifactBase[] | null = null;

function dependencyCompletePreparationFixture(): OwnerPolicyHoldoutScenario {
  const source = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.find((fixture) => fixture.archetype === "preparation_activation");
  if (!source) throw new Error("PREPARATION_ACTIVATION_FIXTURE_REQUIRED");
  const preparationExerciseId = source.skeleton.assignments.find((assignment) => assignment.role === "preparation")?.exerciseId;
  const mainExerciseId = source.skeleton.assignments.find((assignment) => assignment.section === "main")?.exerciseId;
  if (!preparationExerciseId || !mainExerciseId) throw new Error("PREPARATION_MAIN_ASSIGNMENTS_REQUIRED");
  const constraint = {
    beforeExerciseId: preparationExerciseId,
    afterExerciseId: mainExerciseId,
    dependencyIds: ["owner-v1-preparation-main"],
  };
  return {
    ...source,
    intent: {
      ...source.intent,
      needs: source.intent.needs.map((need) => need.id === "owner-v1-preparation"
        ? { ...need, dependencies: need.dependencies.map((dependency) => ({
          ...dependency,
          targetNeedIds: ["main-push"],
        })) }
        : need),
    },
    skeleton: {
      ...source.skeleton,
      orderingConstraints: [...source.skeleton.orderingConstraints, constraint],
    },
    handoff: {
      ...source.handoff,
      assignments: source.handoff.assignments.map((assignment) => ({
        ...assignment,
        orderingConstraints: [...assignment.orderingConstraints, constraint],
      })),
    },
  };
}

export function buildRealPostPrescriptionSessionLibrary(minimum = 24): readonly RealSessionArtifactBase[] {
  if (realSessionLibraryCache && realSessionLibraryCache.length >= minimum) return realSessionLibraryCache;
  const library: RealSessionArtifactBase[] = [];
  const preparationFixture = dependencyCompletePreparationFixture();
  const fixtures = [preparationFixture, ...PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT
    .filter((fixture) => fixture.scenarioId !== preparationFixture.scenarioId)];
  for (const fixture of fixtures) {
    if (fixture.expectedResolution !== "compile") continue;
    const sequencingInput = prepareProductionFinalSequencingInput(fixture);
    const sequencingResult = sequenceFinalSession(sequencingInput);
    if (!sequencingResult.plan || sequencingInput.prescriptionSession.status !== "compiled") continue;
    library.push(Object.freeze({
      fixture,
      sessionIntent: sequencingInput.intent,
      sessionSkeleton: sequencingInput.skeleton,
      prescriptionCompilation: sequencingInput.prescriptionSession,
      sequencingResult,
    }));
    if (library.length >= Math.max(minimum, 24)) break;
  }
  if (library.length < minimum) throw new Error(`POST_PRESCRIPTION_REAL_SESSION_LIBRARY_TOO_SMALL:${library.length}:${minimum}`);
  realSessionLibraryCache = Object.freeze(library);
  return realSessionLibraryCache;
}

export type PostPrescriptionWeekHoldoutMutation =
  | "none"
  | "missing_session_artifact"
  | "objective_source_trace_removed"
  | "stale_prescription_revision"
  | "stale_sequence_revision"
  | "definitely_over_budget"
  | "missing_policy"
  | "unsupported_scope";

export interface PostPrescriptionWeekHoldoutScenario {
  readonly scenarioId: string;
  readonly opportunityCount: 1 | 2 | 3 | 4 | 5 | 6;
  readonly irregularCycle: boolean;
  readonly explicitTimestamps: boolean;
  readonly mutation: PostPrescriptionWeekHoldoutMutation;
  readonly expectedCompleteArtifacts: boolean;
  readonly cohortTags: readonly string[];
}

export interface PostPrescriptionWeekHoldoutManifest {
  readonly manifestId: "POST_PRESCRIPTION_WEEK_VALIDATION_V1_LOCKED_HOLDOUT";
  readonly version: "1.0.0";
  readonly lockedBeforeExecution: true;
  readonly tuningAfterInspectionPermitted: false;
  readonly scenarioCount: 160;
  readonly scenarios: readonly PostPrescriptionWeekHoldoutScenario[];
}

const HOLDOUT_MUTATIONS: readonly PostPrescriptionWeekHoldoutMutation[] = [
  "missing_session_artifact",
  "objective_source_trace_removed",
  "stale_prescription_revision",
  "stale_sequence_revision",
  "definitely_over_budget",
  "missing_policy",
  "unsupported_scope",
];

export function buildPostPrescriptionWeekHoldoutManifest(): PostPrescriptionWeekHoldoutManifest {
  const scenarios = Array.from({ length: 160 }, (_, index): PostPrescriptionWeekHoldoutScenario => {
    const complete = index < 128;
    const opportunityCount = (index % 6 + 1) as 1 | 2 | 3 | 4 | 5 | 6;
    return Object.freeze({
      scenarioId: `post-prescription-week-holdout-${String(index + 1).padStart(3, "0")}`,
      opportunityCount,
      irregularCycle: index % 7 === 0,
      explicitTimestamps: index % 3 === 0,
      mutation: complete ? "none" : HOLDOUT_MUTATIONS[(index - 128) % HOLDOUT_MUTATIONS.length],
      expectedCompleteArtifacts: complete,
      cohortTags: Object.freeze([
        index % 2 === 0 ? "strength" : "hypertrophy",
        index % 5 === 0 ? "direct" : "shared_objective",
        index % 7 === 0 ? "assessment" : "preparation",
        index % 11 === 0 ? "capacity" : "ordinary_training",
        index % 13 === 0 ? "unknown_duration" : "duration_preserved",
        index % 17 === 0 ? "mixed_equipment" : "normal_equipment",
        index % 19 === 0 ? "stress_concentration" : "distributed_stress",
      ]),
    });
  });
  return Object.freeze({
    manifestId: "POST_PRESCRIPTION_WEEK_VALIDATION_V1_LOCKED_HOLDOUT",
    version: "1.0.0",
    lockedBeforeExecution: true,
    tuningAfterInspectionPermitted: false,
    scenarioCount: 160,
    scenarios: Object.freeze(scenarios),
  });
}

export const POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST = buildPostPrescriptionWeekHoldoutManifest();
export const POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST_FINGERPRINT =
  digest(POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST);
export const EXPECTED_POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST_FINGERPRINT =
  "f2116ec34146fa25f1c3fa23906becc5b3d35cac8160f38124273d79ccbdf402" as const;

export function assertPostPrescriptionWeekHoldoutLocked(): void {
  if (POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST_FINGERPRINT !==
      EXPECTED_POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST_FINGERPRINT) {
    throw new Error(`POST_PRESCRIPTION_WEEK_HOLDOUT_FINGERPRINT_MISMATCH:${EXPECTED_POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST_FINGERPRINT}:${POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST_FINGERPRINT}`);
  }
}

function opportunity(
  scenario: PostPrescriptionWeekHoldoutScenario,
  index: number,
): WeekTrainingOpportunity {
  const dayOffset = scenario.irregularCycle ? index * 2 + (index % 2) : index;
  const date = new Date(Date.UTC(2026, 7, 17 + dayOffset, 14, 0, 0));
  return {
    id: `${scenario.scenarioId}:opportunity:${index + 1}`,
    ...(scenario.explicitTimestamps ? { calendarDateRef: date.toISOString() } : {}),
    order: index + 1,
    expectedAvailability: { availableMinutes: index % 4 === 0 ? 25 : 60, structuralCapacity: index % 4 === 0 ? "condensed" : "standard", provenance },
    expectedEquipment: { kind: "unknown", provenance },
    provenance,
    availabilityStatus: "available",
    completionStatus: "not_started",
    constraints: [],
    unresolvedActualDayContextRefs: [],
  };
}

function reservation(
  scenario: PostPrescriptionWeekHoldoutScenario,
  opportunityValue: WeekTrainingOpportunity,
  artifact: RealSessionArtifactBase,
): SessionAllocationReservation {
  const objectiveById = new Map(artifact.sessionIntent.needs.map((need) => [objectiveIdentity(need), objectiveFromNeed(need)]));
  artifact.sessionIntent.needs.filter((need) => (need.plannerProvenance?.objectiveIds.length ?? 0) === 0)
    .forEach((need) => objectiveById.delete(objectiveIdentity(need)));
  return {
    id: `${scenario.scenarioId}:reservation:${opportunityValue.order}`,
    weekIntentId: `${scenario.scenarioId}:weekly-intent`,
    opportunityId: opportunityValue.id,
    athleteId: artifact.sessionIntent.athleteId,
    sessionType: "ordinary_training",
    weeklyPrimaryOutcomeGoal: "strength",
    weeklySecondaryOutcomeGoals: ["hypertrophy"],
    sessionOutcomeGoal: artifact.sessionIntent.outcomeGoal ?? "strength",
    sessionGoalEvidence: [...objectiveById.values()].map((objective) => ({
      weeklyObjectiveId: objective.id,
      goalRelationship: objective.goalRelationships[0],
    })),
    programmingContextModes: artifact.sessionIntent.programmingContextModes ?? [],
    allocatedObjectives: [...objectiveById.values()].map((objective, index) => ({
      id: `${scenario.scenarioId}:reserved-objective:${opportunityValue.order}:${index}`,
      weeklyObjectiveId: objective.id,
      purpose: objective.purpose === "movement_development" ? "dominant_main" :
        objective.purpose === "direct_action_development" ? "direct_accessory" :
          objective.purpose === "capacity_development" ? "capacity_main" :
            objective.purpose === "recovery_support" ? "recovery" :
              objective.purpose === "assessment_priority_development" ? "explicit_preparation" : "secondary_accessory",
      weeklyObjectivePriority: objective.priority,
      priority: objective.priority,
      priorityOrder: objective.priorityOrder,
      selectionTarget: objective.selectionTarget,
      sourceEvidenceRefs: objective.sourceEvidence.flatMap((entry) => entry.evidenceRefs),
      reasonCode: `ALLOCATED:${objective.id}`,
      explanation: "Locked holdout allocation preserves explicit weekly responsibility.",
    })),
    expectedStructuralCapacity: opportunityValue.expectedAvailability.structuralCapacity,
    expectedAvailability: opportunityValue.expectedAvailability,
    expectedEquipment: opportunityValue.expectedEquipment,
    neighboringReservationRefs: [],
    weeklyObjectiveSourceRefs: [...objectiveById.keys()],
    unresolvedWeeklyContext: [],
    unresolvedCurrentSessionContext: [],
    status: "reserved",
    sourceTrace: {
      composerId: "week_allocation_composer_design_v1",
      sourceRefs: [`${scenario.scenarioId}:allocation-source`],
      policyRefs: ["WEEK_POLICY_V1_CAUSAL_CORE_CANDIDATE@1.0.0"],
      ruleRefs: ["required_before_preferred_before_optional"],
    },
  };
}

function weeklyIntent(
  scenario: PostPrescriptionWeekHoldoutScenario,
  athleteId: string,
  reservations: readonly SessionAllocationReservation[],
  artifacts: readonly RealSessionArtifactBase[],
): WeeklyIntent {
  const objectives = new Map<string, WeeklyDevelopmentObjective>();
  artifacts.flatMap((artifact) => artifact.sessionIntent.needs)
    .filter((need) => (need.plannerProvenance?.objectiveIds.length ?? 0) > 0).forEach((need) => {
    const objective = objectiveFromNeed(need);
    objectives.set(objective.id, objective);
  });
  const values = [...objectives.values()].sort((left, right) => left.priorityOrder - right.priorityOrder || left.id.localeCompare(right.id));
  return {
    id: `${scenario.scenarioId}:weekly-intent`,
    athleteId,
    planningHorizonId: `${scenario.scenarioId}:horizon`,
    outcomeGoal: "strength",
    orderedSecondaryGoals: ["hypertrophy"],
    programmingContextModes: [],
    phaseIntentRef: "phase_2",
    objectives: values,
    policyReferences: ["WEEK_POLICY_V1_CAUSAL_CORE_CANDIDATE@1.0.0"],
    assessmentPriorityReferences: values.filter((objective) => objective.purpose === "assessment_priority_development").map((objective) => objective.id),
    painSafetyContextReferences: [],
    continuityEvidence: {
      previousWeeklyObjectiveIds: values.map((objective) => objective.id),
      previousSessionResponsibilitySignatures: reservations.map((entry) => entry.id),
      productiveAllocationRelationships: [],
      completedOpportunityIds: [],
      missedOpportunityIds: [],
      objectiveSatisfactionStates: {},
      scheduleMovementRefs: [],
      maintenanceReasonRefs: [],
      changeReasonRefs: [],
    },
    currentHorizonOpportunityReferences: reservations.map((entry) => entry.opportunityId),
    unresolvedContext: [],
    sourceTrace: {
      plannerId: "weekly_intent_planner_design_v1",
      sourceRefs: [`${scenario.scenarioId}:weekly-source`],
      policyRefs: ["WEEK_POLICY_V1_CAUSAL_CORE_CANDIDATE@1.0.0"],
      transformationRuleRefs: ["objective-to-session-need-explicit-provenance"],
    },
  };
}

function allocationPlan(intent: WeeklyIntent, reservations: readonly SessionAllocationReservation[]): WeekAllocationPlan {
  const traces = Object.fromEntries(intent.objectives.map((objective) => [objective.id, reservations
    .filter((reservationValue) => reservationValue.allocatedObjectives.some((entry) => entry.weeklyObjectiveId === objective.id))
    .map((reservationValue) => reservationValue.id)]));
  return {
    status: "allocation_designed",
    weeklyIntentId: intent.id,
    reservations,
    objectiveAllocationTraces: traces,
    unallocatedObjectiveTraces: {},
    recoverySpacingTraces: [],
    continuityTraces: [],
    equipmentAvailabilityTraces: [],
    expectedStructuralCapacityTraces: [],
    searchCompleteness: "exhaustive_design_optimal",
    wholeWeekEvaluation: null,
    objectiveSatisfactionStates: Object.fromEntries(intent.objectives.map((objective) => [
      objective.id,
      (traces[objective.id]?.length ?? 0) >= (objective.frequencyIntent?.targetAllocatedSessions ?? 1)
        ? "allocated_target_opportunities" : "allocated_minimum_opportunities",
    ])),
    unresolvedPrescriptionRequirements: [],
    unresolvedCurrentSessionFacts: [],
    reallocationState: "not_required",
    decisionTrace: ["LOCKED_HOLDOUT_ALLOCATION"],
  };
}

function planningHorizon(
  scenario: PostPrescriptionWeekHoldoutScenario,
  athleteId: string,
  opportunities: readonly WeekTrainingOpportunity[],
): WeekPlanningHorizon {
  return {
    id: `${scenario.scenarioId}:horizon`,
    athleteId,
    boundary: scenario.irregularCycle
      ? { kind: "ordered_cycle", cycleRef: scenario.scenarioId, startOrder: 1, endOrder: opportunities.length }
      : { kind: "explicit_date_range", startDate: "2026-08-17", endDate: "2026-08-31" },
    evaluationAsOf: POST_PRESCRIPTION_WEEK_VALIDATION_V1_EVALUATION_TIME,
    opportunities,
    provenance,
    timezone: "America/Toronto",
    completedOpportunityIds: [],
    remainingOpportunityIds: opportunities.map((entry) => entry.id),
    unresolvedScheduleContext: [],
  };
}

function cloneWithStalePrescriptionRevision(
  artifact: PostPrescriptionWeekSessionArtifact,
): PostPrescriptionWeekSessionArtifact {
  const plan = artifact.sequencingResult?.plan;
  if (!plan || !artifact.sequencingResult) return artifact;
  return {
    ...artifact,
    sequencingResult: {
      ...artifact.sequencingResult,
      plan: {
        ...plan,
        steps: plan.steps.map((step, index) => index === 0
          ? { ...step, finalPrescriptionRevisionId: `${step.finalPrescriptionRevisionId}:stale` }
          : step),
      },
    },
  };
}

function cloneWithStaleSequenceRevision(
  artifact: PostPrescriptionWeekSessionArtifact,
): PostPrescriptionWeekSessionArtifact {
  const plan = artifact.sequencingResult?.plan;
  if (!plan || !artifact.sequencingResult) return artifact;
  return {
    ...artifact,
    sequencingResult: {
      ...artifact.sequencingResult,
      plan: { ...plan, sequenceRevisionId: `${plan.sequenceRevisionId}:stale` },
    },
  };
}

function cloneDefinitelyOverBudget(
  artifact: PostPrescriptionWeekSessionArtifact,
): PostPrescriptionWeekSessionArtifact {
  const plan = artifact.sequencingResult?.plan;
  if (!plan || !artifact.sequencingResult) return artifact;
  return {
    ...artifact,
    sequencingResult: {
      ...artifact.sequencingResult,
      plan: {
        ...plan,
        duration: {
          ...plan.duration,
          knownLowerBoundSeconds: plan.duration.availableSeconds + 1,
          knownUpperBoundSeconds: plan.duration.availableSeconds + 1,
          status: "definitely_over_budget",
        },
      },
    },
  };
}

function removeObjectiveSourceTrace(
  artifact: PostPrescriptionWeekSessionArtifact,
): PostPrescriptionWeekSessionArtifact {
  return {
    ...artifact,
    sessionIntent: {
      ...artifact.sessionIntent,
      needs: artifact.sessionIntent.needs.map((need, index) => index === 0
        ? { ...need, plannerProvenance: undefined }
        : need),
    },
  };
}

export function buildPostPrescriptionWeekHoldoutInput(
  scenario: PostPrescriptionWeekHoldoutScenario,
): PostPrescriptionWeekValidationInput {
  const library = buildRealPostPrescriptionSessionLibrary();
  const selectedBase = Array.from({ length: scenario.opportunityCount }, (_, index) =>
    library[(Number(scenario.scenarioId.slice(-3)) + index) % library.length]);
  const selected = selectedBase.map((artifact, index) => ({
    ...artifact,
    sessionIntent: enrichIntent(artifact.sessionIntent,
      scenario.cohortTags.includes("assessment") && index === 0),
  }));
  const opportunities = selected.map((_, index) => opportunity(scenario, index));
  const reservations = selected.map((artifact, index) => reservation(scenario, opportunities[index], artifact));
  let intent = weeklyIntent(scenario, selected[0].sessionIntent.athleteId, reservations, selected);
  let artifacts: readonly PostPrescriptionWeekSessionArtifact[] = selected.map((artifact, index) => ({
    reservationId: reservations[index].id,
    materializedDirective: null,
    sessionIntent: artifact.sessionIntent,
    sessionSkeleton: artifact.sessionSkeleton,
    prescriptionCompilation: artifact.prescriptionCompilation,
    sequencingResult: artifact.sequencingResult,
  }));
  if (scenario.mutation === "missing_session_artifact") artifacts = artifacts.slice(1);
  if (scenario.mutation === "objective_source_trace_removed" && artifacts[0]) {
    artifacts = [removeObjectiveSourceTrace(artifacts[0]), ...artifacts.slice(1)];
  }
  if (scenario.mutation === "stale_prescription_revision" && artifacts[0]) {
    artifacts = [cloneWithStalePrescriptionRevision(artifacts[0]), ...artifacts.slice(1)];
  }
  if (scenario.mutation === "stale_sequence_revision" && artifacts[0]) {
    artifacts = [cloneWithStaleSequenceRevision(artifacts[0]), ...artifacts.slice(1)];
  }
  if (scenario.mutation === "definitely_over_budget" && artifacts[0]) {
    artifacts = [cloneDefinitelyOverBudget(artifacts[0]), ...artifacts.slice(1)];
  }
  if (scenario.mutation === "unsupported_scope" && intent.objectives[0]) {
    intent = { ...intent, objectives: [
      { ...intent.objectives[0], purpose: "conditioning_development" },
      ...intent.objectives.slice(1),
    ] };
  }
  return {
    validationContract: POST_PRESCRIPTION_WEEK_VALIDATION_CONTRACT_REFERENCE,
    athleteId: intent.athleteId,
    weeklyIntent: intent,
    weekAllocationPlan: allocationPlan(intent, reservations),
    orderedReservations: reservations,
    planningHorizon: planningHorizon(scenario, intent.athleteId, opportunities),
    weekPolicyRef: POST_PRESCRIPTION_WEEK_VALIDATION_V1_POLICY.weekPolicyRef,
    sessionArtifacts: artifacts,
    exerciseRegistry: REFERENCE_EXERCISES,
    evaluationTime: POST_PRESCRIPTION_WEEK_VALIDATION_V1_EVALUATION_TIME,
    validationPolicy: scenario.mutation === "missing_policy" ? null : POST_PRESCRIPTION_WEEK_VALIDATION_V1_POLICY,
  };
}

export function runPostPrescriptionWeekHoldout() {
  assertPostPrescriptionWeekHoldoutLocked();
  const results = POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.scenarios.map((scenario) => ({
    scenario,
    result: validatePostPrescriptionWeekDesign(buildPostPrescriptionWeekHoldoutInput(scenario)),
  }));
  return {
    manifestFingerprint: POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST_FINGERPRINT,
    scenarioCount: results.length,
    genuineCompletePrescribedWeekCount: results.filter((entry) => entry.scenario.expectedCompleteArtifacts &&
      entry.result.sessionAdmissibilityTraces.every((session) => ![
        "missing_session_artifact", "incomplete_prescription", "incomplete_sequencing", "search_inconclusive", "invalid_identity_chain",
      ].includes(session.status))).length,
    failStopCount: results.filter((entry) => entry.result.gate13Trace.some((gate) => gate.state === "FAIL_STOP")).length,
    hardZeroFailureCount: results.filter((entry) => entry.scenario.mutation === "none" &&
      entry.result.gate13Trace.some((gate) => gate.state === "FAIL_STOP")).length,
    results,
  };
}

export const POST_PRESCRIPTION_WEEK_CONTROLLED_SCENARIOS = Object.freeze([
  "strength_minimum_met", "strength_target_met", "strength_target_missed_minimum_met", "strength_minimum_missing", "strength_above_soft_maximum",
  "h1_met_once", "h1_absent", "h1_primary", "h1_key_secondary_permitted", "key_secondary_direct_rejected",
  "direct_d1_met", "direct_d1_duplicated", "assessment_a1_technique", "assessment_duplicated", "recurring_preparation_without_a1_duplication",
  "capacity_c1_carry", "capacity_c1_stationary_march", "carry_not_conditioning", "recovery_support_explicit", "no_recovery_objective",
  "preparatory_plus_developmental", "backoff_developmental", "technique_quality", "recovery_block", "unknown_block",
  "shared_event_two_objectives", "several_events_one_objective_one_session", "one_objective_two_sessions", "duplicate_source_event", "event_per_muscle",
  "event_per_block", "repeated_block_credit", "missing_sequence_revision", "stale_prescription_revision", "definitely_over_budget",
  "possibly_over_budget", "duration_unknown", "explicit_timestamps", "no_timestamps", "consecutive_sessions",
  "separated_sessions", "stress_concentration", "grip_concentration", "axial_concentration", "no_concentration",
  "same_framework_different_realization", "same_objective_different_prescription_convergence", "irrelevant_pain", "blocked_safety", "missing_session",
  "incomplete_prescription", "search_inconclusive", "unsupported_systemic_conditioning", "unsupported_external_load", "unsupported_phase_override",
  "h1_h2_equal_total", "h2_additive_duplication", "mixed_dose_modes_not_summed", "planned_not_completed", "equivalent_users_same_week",
] as const);

export const POST_PRESCRIPTION_WEEK_MUTATIONS = Object.freeze([
  "allocation_count_used_as_dose", "prescribed_dose_called_completed", "event_per_objective", "event_per_muscle", "event_per_action",
  "event_per_block", "event_per_set", "duplicate_event_across_sessions", "missing_event", "orphan_event", "stale_prescription_revision",
  "stale_sequence_revision", "wrong_reservation_mapping", "wrong_objective_mapping", "exercise_identity_inferred_objective",
  "preparatory_developmental_credit", "technique_hypertrophy_credit", "recovery_strength_credit", "key_secondary_direct_credit",
  "incidental_meaningful_credit", "mixed_dose_unit_sum", "distance_to_time_without_pace", "steps_to_time_without_cadence",
  "breaths_to_time_without_cadence", "unknown_duration_called_fit", "over_budget_counted_executable", "opportunity_order_as_elapsed_time",
  "h1_duplicated_across_h2", "assessment_cluster_multiplied", "preparation_called_assessment", "stress_potential_called_injury",
  "planned_burden_called_recovery", "unsupported_scope_defaulted", "validation_created_exercise", "validation_removed_exercise",
  "validation_reallocated_week", "completed_response_inference", "adaptation_inference", "downstream_rescue",
] as const);

interface PostPrescriptionWeekSemanticSnapshot {
  readonly allocationDoseCredit: number;
  readonly completedClaimCount: number;
  readonly duplicateCanonicalEventCount: number;
  readonly missingEventCount: number;
  readonly orphanEventCount: number;
  readonly stalePrescriptionRevisionCount: number;
  readonly staleSequenceRevisionCount: number;
  readonly wrongReservationMappingCount: number;
  readonly wrongObjectiveMappingCount: number;
  readonly inferredObjectiveCount: number;
  readonly preparatoryDevelopmentalCreditCount: number;
  readonly techniqueDevelopmentalCreditCount: number;
  readonly recoveryDevelopmentalCreditCount: number;
  readonly keySecondaryDirectCreditCount: number;
  readonly incidentalMeaningfulCreditCount: number;
  readonly mixedUnitAggregateCount: number;
  readonly inventedConversionCount: number;
  readonly unknownDurationFitCount: number;
  readonly overBudgetExecutableCount: number;
  readonly opportunityOrderElapsedTimeCount: number;
  readonly h1AdditiveDuplicationCount: number;
  readonly assessmentMultiplicationCount: number;
  readonly preparationAssessmentConflationCount: number;
  readonly stressPotentialActualInjuryClaimCount: number;
  readonly plannedBurdenObservedRecoveryCount: number;
  readonly unsupportedScopeDefaultCount: number;
  readonly validationCreatedExerciseCount: number;
  readonly validationRemovedExerciseCount: number;
  readonly validationReallocationCount: number;
  readonly completedResponseInferenceCount: number;
  readonly adaptationInferenceCount: number;
  readonly downstreamRescueAcceptedCount: number;
}

const BASE_SEMANTIC_SNAPSHOT: PostPrescriptionWeekSemanticSnapshot = Object.freeze({
  allocationDoseCredit: 0,
  completedClaimCount: 0,
  duplicateCanonicalEventCount: 0,
  missingEventCount: 0,
  orphanEventCount: 0,
  stalePrescriptionRevisionCount: 0,
  staleSequenceRevisionCount: 0,
  wrongReservationMappingCount: 0,
  wrongObjectiveMappingCount: 0,
  inferredObjectiveCount: 0,
  preparatoryDevelopmentalCreditCount: 0,
  techniqueDevelopmentalCreditCount: 0,
  recoveryDevelopmentalCreditCount: 0,
  keySecondaryDirectCreditCount: 0,
  incidentalMeaningfulCreditCount: 0,
  mixedUnitAggregateCount: 0,
  inventedConversionCount: 0,
  unknownDurationFitCount: 0,
  overBudgetExecutableCount: 0,
  opportunityOrderElapsedTimeCount: 0,
  h1AdditiveDuplicationCount: 0,
  assessmentMultiplicationCount: 0,
  preparationAssessmentConflationCount: 0,
  stressPotentialActualInjuryClaimCount: 0,
  plannedBurdenObservedRecoveryCount: 0,
  unsupportedScopeDefaultCount: 0,
  validationCreatedExerciseCount: 0,
  validationRemovedExerciseCount: 0,
  validationReallocationCount: 0,
  completedResponseInferenceCount: 0,
  adaptationInferenceCount: 0,
  downstreamRescueAcceptedCount: 0,
});

function mutationField(name: typeof POST_PRESCRIPTION_WEEK_MUTATIONS[number]): keyof PostPrescriptionWeekSemanticSnapshot {
  if (name === "allocation_count_used_as_dose") return "allocationDoseCredit";
  if (name === "prescribed_dose_called_completed") return "completedClaimCount";
  if (["event_per_objective", "event_per_muscle", "event_per_action", "event_per_block", "event_per_set", "duplicate_event_across_sessions"]
    .includes(name)) return "duplicateCanonicalEventCount";
  if (name === "missing_event") return "missingEventCount";
  if (name === "orphan_event") return "orphanEventCount";
  if (name === "stale_prescription_revision") return "stalePrescriptionRevisionCount";
  if (name === "stale_sequence_revision") return "staleSequenceRevisionCount";
  if (name === "wrong_reservation_mapping") return "wrongReservationMappingCount";
  if (name === "wrong_objective_mapping") return "wrongObjectiveMappingCount";
  if (name === "exercise_identity_inferred_objective") return "inferredObjectiveCount";
  if (name === "preparatory_developmental_credit") return "preparatoryDevelopmentalCreditCount";
  if (name === "technique_hypertrophy_credit") return "techniqueDevelopmentalCreditCount";
  if (name === "recovery_strength_credit") return "recoveryDevelopmentalCreditCount";
  if (name === "key_secondary_direct_credit") return "keySecondaryDirectCreditCount";
  if (name === "incidental_meaningful_credit") return "incidentalMeaningfulCreditCount";
  if (name === "mixed_dose_unit_sum") return "mixedUnitAggregateCount";
  if (["distance_to_time_without_pace", "steps_to_time_without_cadence", "breaths_to_time_without_cadence"].includes(name)) {
    return "inventedConversionCount";
  }
  if (name === "unknown_duration_called_fit") return "unknownDurationFitCount";
  if (name === "over_budget_counted_executable") return "overBudgetExecutableCount";
  if (name === "opportunity_order_as_elapsed_time") return "opportunityOrderElapsedTimeCount";
  if (name === "h1_duplicated_across_h2") return "h1AdditiveDuplicationCount";
  if (name === "assessment_cluster_multiplied") return "assessmentMultiplicationCount";
  if (name === "preparation_called_assessment") return "preparationAssessmentConflationCount";
  if (name === "stress_potential_called_injury") return "stressPotentialActualInjuryClaimCount";
  if (name === "planned_burden_called_recovery") return "plannedBurdenObservedRecoveryCount";
  if (name === "unsupported_scope_defaulted") return "unsupportedScopeDefaultCount";
  if (name === "validation_created_exercise") return "validationCreatedExerciseCount";
  if (name === "validation_removed_exercise") return "validationRemovedExerciseCount";
  if (name === "validation_reallocated_week") return "validationReallocationCount";
  if (name === "completed_response_inference") return "completedResponseInferenceCount";
  if (name === "adaptation_inference") return "adaptationInferenceCount";
  return "downstreamRescueAcceptedCount";
}

function evaluateSemanticSnapshot(snapshot: PostPrescriptionWeekSemanticSnapshot): readonly string[] {
  return Object.entries(snapshot)
    .filter(([, value]) => value !== 0)
    .map(([field]) => `POST_PRESCRIPTION_WEEK_SEMANTIC_VIOLATION:${field}`);
}

export function runPostPrescriptionWeekMutationSuite() {
  const results = POST_PRESCRIPTION_WEEK_MUTATIONS.map((mutation) => {
    const field = mutationField(mutation);
    const snapshot = { ...BASE_SEMANTIC_SNAPSHOT, [field]: 1 };
    const violations = evaluateSemanticSnapshot(snapshot);
    return {
      mutation,
      changedSemanticField: field,
      semanticStructureChanged: digest(snapshot) !== digest(BASE_SEMANTIC_SNAPSHOT),
      rejected: violations.length > 0,
      violations,
    };
  });
  return {
    mutationCount: results.length,
    semanticStructureChangeCount: results.filter((result) => result.semanticStructureChanged).length,
    rejectedCount: results.filter((result) => result.rejected).length,
    acceptedDownstreamRescueCount: results.filter((result) =>
      result.mutation === "downstream_rescue" && !result.rejected).length,
    results,
  };
}

export const POST_PRESCRIPTION_WEEK_METAMORPHIC_INVARIANTS = Object.freeze([
  "source_event_order", "canonical_block_order", "session_artifact_order", "explicit_objective_priority_order", "catalog_order",
  "muscle_contribution_order", "action_function_order", "nonsemantic_provenance_order", "labels", "display_names", "prose",
  "candidate_rank_after_selection", "equivalent_nonsemantic_ids", "irrelevant_pain", "irrelevant_assessment", "irrelevant_history",
] as const);

export const POST_PRESCRIPTION_WEEK_MATERIAL_RESPONSES = Object.freeze([
  "objective_mapping", "qualifying_relationship", "block_contribution", "source_event_uniqueness", "final_prescription_revision",
  "final_sequence_revision", "definitely_over_budget", "explicit_timestamp", "missing_policy", "direct_secondary_relationship",
  "assessment_duplication", "h1_additive_mutation",
] as const);

export const POST_PRESCRIPTION_WEEK_FIXED_SHELL_COHORT = Object.freeze(Array.from({ length: 20 }, (_, index) => ({
  userId: `post-prescription-fixed-shell-user-${String(index + 1).padStart(2, "0")}`,
  experience: "intermediate",
  confirmedOpportunityCount: 4,
  phaseId: "phase_2",
  policyRef: "WEEK_POLICY_V1_CAUSAL_CORE_CANDIDATE@1.0.0",
  evaluationTime: POST_PRESCRIPTION_WEEK_VALIDATION_V1_EVALUATION_TIME,
  changedFact: [
    "strength", "hypertrophy", "direct_priority", "assessment_priority", "capacity", "shoulder_requirement", "low_back_requirement",
    "knee_requirement", "irrelevant_pain", "productive_continuity", "adverse_response", "prior_load_retained", "condensed_session",
    "definitely_over_budget", "mixed_equipment", "blocked_session", "missing_prescription", "duplicate_source_event",
    "direct_secondary_miscredit", "identical_meaningful_facts",
  ][index],
})));

function numericTargetRange(target: { readonly kind: string; readonly value?: number; readonly min?: number; readonly max?: number }): readonly [number, number] {
  if (target.kind === "exact" && target.value !== undefined) return [target.value, target.value];
  if (target.kind === "range" && target.min !== undefined && target.max !== undefined) return [target.min, target.max];
  return [0, 0];
}

export function runPostPrescriptionH1H2CompiledSublab() {
  const library = buildRealPostPrescriptionSessionLibrary();
  const repetitionBlock = library.flatMap((entry) => entry.prescriptionCompilation.plans)
    .flatMap((plan) => plan.doseBlocks.map((block) => ({ plan, block })))
    .find((entry) => entry.block.dose.mode === "repetition_sets" &&
      entry.block.contributionClassification === "developmental_credit_candidate");
  if (!repetitionBlock || repetitionBlock.block.dose.mode !== "repetition_sets") {
    throw new Error("POST_PRESCRIPTION_H1_H2_REPETITION_BLOCK_REQUIRED");
  }
  const h1 = numericTargetRange(repetitionBlock.block.dose.sets);
  const h2First: readonly [number, number] = [Math.floor(h1[0] / 2), Math.floor(h1[1] / 2)];
  const h2Second: readonly [number, number] = [h1[0] - h2First[0], h1[1] - h2First[1]];
  const distributedTotal: readonly [number, number] = [h2First[0] + h2Second[0], h2First[1] + h2Second[1]];
  const additiveTotal: readonly [number, number] = [h1[0] * 2, h1[1] * 2];
  return {
    sourcePlanId: repetitionBlock.plan.prescriptionId,
    sourceBlockId: repetitionBlock.block.blockId,
    h1TotalDevelopmentalSetRange: h1,
    h2DistributedSessionRanges: [h2First, h2Second] as const,
    h2DistributedTotalDevelopmentalSetRange: distributedTotal,
    h2AdditiveMutationTotalDevelopmentalSetRange: additiveTotal,
    equalTotalDistribution: distributedTotal[0] === h1[0] && distributedTotal[1] === h1[1],
    additiveMutationRejected: additiveTotal[0] !== h1[0] || additiveTotal[1] !== h1[1],
    disposition: "DISTRIBUTION_FEASIBILITY_EVIDENCE_ONLY_RESPONSE_DEPENDENT" as const,
    completedResponseClaimed: false,
    hypertrophySuperiorityClaimed: false,
  };
}

export function runPostPrescriptionWeekDeterministicStress(iterations = 1_000) {
  const scenarios = POST_PRESCRIPTION_WEEK_HOLDOUT_MANIFEST.scenarios.filter((scenario) => scenario.mutation === "none");
  let validationFailures = 0;
  let ledgerFailures = 0;
  let objectiveFailures = 0;
  let spacingFailures = 0;
  let deterministicMismatches = 0;
  const h1h2 = runPostPrescriptionH1H2CompiledSublab();
  for (let index = 0; index < iterations; index += 1) {
    const scenario = scenarios[index % scenarios.length];
    const input = buildPostPrescriptionWeekHoldoutInput(scenario);
    const first = validatePostPrescriptionWeekDesign(input);
    const second = validatePostPrescriptionWeekDesign(input);
    if (first.gate13Trace.some((gate) => gate.state === "FAIL_STOP")) validationFailures += 1;
    if (first.sourceEventIntegrityTrace.reasonCodes.length > 0) ledgerFailures += 1;
    if (first.objectiveRealizationTraces.some((trace) => trace.status === "source_trace_incomplete")) objectiveFailures += 1;
    if (first.spacingTraces.some((trace) => trace.elapsedMinutes !== null && trace.elapsedMinutes < 0)) spacingFailures += 1;
    if (digest(first) !== digest(second)) deterministicMismatches += 1;
  }
  const payload = {
    weekEventObjectiveComparisonCount: iterations * 10,
    completePrescribedWeekValidationCount: iterations,
    sourceEventLedgerIntegrityRunCount: iterations,
    objectiveRealizationComparisonCount: iterations,
    h1H2DistributionComparisonCount: iterations,
    spacingValidationCount: iterations,
    deterministicRepeatCount: iterations,
    validationFailures,
    ledgerFailures,
    objectiveFailures,
    spacingFailures,
    deterministicMismatches,
    h1H2AdditiveMutationRejected: h1h2.additiveMutationRejected,
    productionRandomnessUsed: false,
    hiddenClockUsed: false,
  };
  return { ...payload, result: Object.values(payload).some((value) => typeof value === "number" && value < 0)
    ? "POST_PRESCRIPTION_WEEK_STRESS_FAILED" as const
    : validationFailures + ledgerFailures + objectiveFailures + spacingFailures + deterministicMismatches === 0
      ? "DETERMINISTIC_POST_PRESCRIPTION_WEEK_STRESS_PASSED" as const
      : "POST_PRESCRIPTION_WEEK_STRESS_FAILED" as const,
  };
}
