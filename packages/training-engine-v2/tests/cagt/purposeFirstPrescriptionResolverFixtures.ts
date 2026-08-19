import {
  PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1,
  PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE,
  PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE,
  buildProductionPrescriptionPurposeEvidenceSnapshot,
  type ExerciseDefinition,
  type ExerciseDoseMode,
  type PrescriptionAssignmentCompilerInputV1_1,
  type PrescriptionLocalPurpose,
  type PrescriptionPurposeAuthority,
  type PrescriptionPurposeResolverPolicyReference,
  type ProductionExercisePrescriptionPlan,
  type ProductionExercisePrescriptionPlanV1_1,
  type ProductionPrescriptionPurposeEvidenceSnapshot,
  type ProductionPrescriptionPurposeRequirement,
  type ProductionPrescriptionPurposeResolverPolicy,
  type SessionNeedPriority,
  type SessionSection,
  type TrainingOutcomeGoal,
  type TrainingRole,
} from "../../src";
import { buildCatalogCompilerInput } from "../helpers/productionPrescriptionCompiler";

export const PURPOSE_FIRST_TEST_TIME = "2026-08-15T12:00:00-04:00" as const;

export interface PurposeFixtureRequirement {
  readonly purpose: PrescriptionLocalPurpose;
  readonly authority?: PrescriptionPurposeAuthority;
  readonly priority?: SessionNeedPriority;
  readonly priorityOrder?: number;
  readonly section?: SessionSection;
  readonly role?: TrainingRole;
  readonly requirementId?: string;
}

export interface PurposeFirstCatalogFixtureOptions {
  readonly requirements?: readonly PurposeFixtureRequirement[];
  readonly outcomeGoal?: TrainingOutcomeGoal;
  readonly purposeResolverPolicy?: ProductionPrescriptionPurposeResolverPolicy |
    PrescriptionPurposeResolverPolicyReference | null;
  readonly availablePurposeResolverPolicies?: readonly ProductionPrescriptionPurposeResolverPolicy[];
  readonly purposeResolutionAttemptId?: string;
  readonly snapshotSourceKind?: ProductionPrescriptionPurposeEvidenceSnapshot["sourceKind"];
  readonly unresolvedLineage?: readonly string[];
  readonly directObjectiveConfirmedUpstream?: boolean;
  readonly requestedMode?: ExerciseDoseMode;
}

export function supportedPurposeForAssignment(input: {
  readonly role: TrainingRole;
  readonly mode: ExerciseDefinition["prescriptionKnowledge"]["primaryDoseMode"];
}): PrescriptionLocalPurpose {
  if (input.role === "preparation") return "preparation";
  if (input.role === "activation") return "activation";
  if (input.role === "recovery") return "recovery";
  if (input.role === "capacity") return "capacity_development";
  if (input.mode === "timed_hold" || input.mode === "breath_cycles") return "technique_or_control";
  if (input.role === "hypertrophy_accessory") return "direct_development";
  return "strength_development";
}

export function buildPurposeFirstCatalogFixture(
  exercise: ExerciseDefinition,
  options: PurposeFirstCatalogFixtureOptions = {},
): PrescriptionAssignmentCompilerInputV1_1 {
  const sessionInput = buildCatalogCompilerInput(exercise, { requestedMode: options.requestedMode });
  const handoffAssignment = sessionInput.handoff.assignments[0];
  if (!handoffAssignment) throw new Error(`Catalog handoff missing for ${exercise.id}.`);
  const sessionIntent = options.outcomeGoal ? {
    ...sessionInput.sessionIntent,
    outcomeGoal: options.outcomeGoal,
  } : sessionInput.sessionIntent;
  const purposeResolutionAttemptId = options.purposeResolutionAttemptId ??
    `purpose-resolution:${exercise.id}`;
  const outcomeGoal = sessionIntent.outcomeGoal;
  if (!outcomeGoal) throw new Error(`Canonical outcome goal missing for ${exercise.id}.`);
  const requirements = (options.requirements ?? [{
    purpose: supportedPurposeForAssignment({
      role: handoffAssignment.role,
      mode: options.requestedMode ?? exercise.prescriptionKnowledge.primaryDoseMode,
    }),
  }]).map((requirement, index) => buildPurposeRequirement({
    exercise,
    athleteId: sessionInput.athlete.id,
    sessionIntentId: sessionIntent.id,
    outcomeGoal,
    handoffId: handoffAssignment.handoffId,
    needIds: handoffAssignment.satisfiedNeedIds,
    section: requirement.section ?? handoffAssignment.section,
    role: requirement.role ?? handoffAssignment.role,
    requirement: { ...requirement, requirementId: requirement.requirementId ??
      `purpose-requirement:${exercise.id}:${index}` },
    expectedDoseModeLane: options.requestedMode ?? exercise.prescriptionKnowledge.primaryDoseMode,
  }));
  const snapshot = buildProductionPrescriptionPurposeEvidenceSnapshot({
    athleteId: sessionInput.athlete.id,
    sessionIntentId: sessionIntent.id,
    sessionSkeleton: sessionInput.sessionSkeleton,
    prescriptionHandoff: sessionInput.handoff,
    sourceKind: options.snapshotSourceKind ?? "explicit_standalone_purpose",
    weeklyIntent: null,
    weekPlan: null,
    requirements,
    excludedRequirements: [],
    conflicts: [],
    unresolvedLineage: options.unresolvedLineage ?? [],
    evaluationTime: PURPOSE_FIRST_TEST_TIME,
    purposeResolutionAttemptId,
    resolverPolicyReference: PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_REFERENCE,
    provenance: {
      owner: "explicit_standalone_purpose_owner",
      sourceRefs: [`purpose-fixture:${exercise.id}`],
      ruleRefs: ["EXPLICIT_LOCAL_PURPOSE_REQUIRED"],
    },
  });
  const handoffId = handoffAssignment.handoffId;
  return {
    ...sessionInput,
    sessionIntent,
    assignmentHandoffId: handoffId,
    context: {
      ...sessionInput.contextByHandoffId[handoffId],
      ...(handoffAssignment.role === "capacity" ? {
        carryPurpose: handoffAssignment.section === "main" ? "capacity_main" as const : "accessory" as const,
      } : {}),
      ...(options.directObjectiveConfirmedUpstream === undefined ? {} : {
        directObjectiveConfirmedUpstream: options.directObjectiveConfirmedUpstream,
      }),
    },
    continuityEvidence: sessionInput.continuityEvidenceByHandoffId[handoffId] ?? null,
    priorRealizationEvidence: sessionInput.priorRealizationEvidenceByHandoffId[handoffId] ?? null,
    revisionContext: sessionInput.revisionContextByHandoffId[handoffId] ?? null,
    evaluationTime: PURPOSE_FIRST_TEST_TIME,
    compilerContract: PRODUCTION_PRESCRIPTION_COMPILER_V1_1_CONTRACT_REFERENCE,
    purposeEvidenceSnapshot: snapshot,
    purposeResolverPolicy: options.purposeResolverPolicy === undefined
      ? PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1
      : options.purposeResolverPolicy,
    availablePurposeResolverPolicies: options.availablePurposeResolverPolicies ??
      [PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1],
    purposeResolutionAttemptId,
  };
}

function buildPurposeRequirement(input: {
  readonly exercise: ExerciseDefinition;
  readonly athleteId: string;
  readonly sessionIntentId: string;
  readonly outcomeGoal: TrainingOutcomeGoal;
  readonly handoffId: string;
  readonly needIds: readonly string[];
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly requirement: PurposeFixtureRequirement & { readonly requirementId: string };
  readonly expectedDoseModeLane: ExerciseDoseMode;
}): ProductionPrescriptionPurposeRequirement {
  return Object.freeze({
    requirementId: input.requirement.requirementId,
    athleteId: input.athleteId,
    targetSessionIntentId: input.sessionIntentId,
    targetSessionNeedIds: Object.freeze([...input.needIds]),
    targetAssignmentHandoffId: input.handoffId,
    sourceKind: "explicit_standalone_purpose",
    sourceWeeklyIntent: null,
    sourceWeekPlan: null,
    sourceWeeklyObjectiveId: null,
    sourceObjectiveFamily: null,
    sourceObjectivePurpose: null,
    sourceGoalRelationships: Object.freeze([{
      goal: input.outcomeGoal,
      relationship: input.requirement.authority === "secondary_local_purpose" ?
        "secondary_weekly_goal" as const : input.requirement.authority === "cross_goal_support" ?
          "cross_goal_support" as const : "primary_weekly_goal" as const,
      sourceEvidenceRefs: Object.freeze([`purpose-fixture:${input.exercise.id}:goal`]),
    }]),
    localPurpose: input.requirement.purpose,
    purposeAuthority: input.requirement.authority ??
      (input.requirement.purpose === "preparation" || input.requirement.purpose === "activation" ||
       input.requirement.purpose === "recovery" ? "dependency_support" : "primary_local_purpose"),
    priority: input.requirement.priority ?? "required",
    priorityOrder: input.requirement.priorityOrder ?? 0,
    section: input.section,
    role: input.role,
    expectedDoseModeLane: input.expectedDoseModeLane,
    sourceEvidenceRefs: Object.freeze([`purpose-fixture:${input.exercise.id}:evidence`]),
    reviewState: "owner_reviewed",
    explicitUnknowns: Object.freeze([]),
    provenance: Object.freeze({
      owner: "explicit_standalone_purpose_owner",
      sourceRefs: Object.freeze([`purpose-fixture:${input.exercise.id}`]),
      ruleRefs: Object.freeze(["EXPLICIT_LOCAL_PURPOSE_REQUIRED"]),
    }),
  });
}

export function comparablePrescriptionSemantics(
  plan: ProductionExercisePrescriptionPlan | ProductionExercisePrescriptionPlanV1_1 | null,
): unknown {
  if (!plan) return null;
  return {
    exerciseId: plan.exerciseId,
    sourceExposureEvent: plan.sourceExposureEvent,
    doseBlocks: plan.doseBlocks,
    restInstructions: plan.restInstructions,
    compatibilityProjection: plan.compatibilityProjection,
    selectedPolicyRuleRefs: plan.selectedPolicyRuleRefs,
    requirementRefs: plan.requirementRefs,
    unresolvedRequirementRefs: plan.unresolvedRequirementRefs,
    durationInterval: plan.durationInterval,
    executionStandardsByBlockId: plan.executionStandardsByBlockId,
  };
}
