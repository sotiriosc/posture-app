import { createHash } from "node:crypto";
import {
  BODYWEIGHT_EQUIPMENT,
  CONTROLLED_CANDIDATE_SCENARIOS,
  EMPTY_TRAINING_HISTORY,
  NO_PAIN_OR_INJURY,
  NO_TRAINING_SAFETY_SIGNALS,
  buildTrainingReadinessTrace,
  planAndComposeSessionSkeleton,
  type AllocatedSessionObjective,
  type CurrentSessionAvailability,
  type CurrentSessionEquipment,
  type EquipmentCapabilities,
  type SessionAllocationDirective,
  type StructuralCapacityMode,
  type TrainingOutcomeGoal,
  type TrainingSafetyState,
} from "../../src";
import type {
  ExpectedSessionEquipment,
  ExplicitWeeklyPriority,
  ExternalTrainingLoadEvent,
  PrecomputedSessionFeasibilityResult,
  ReviewedPolicyQuestion,
  ReviewedWeeklyProgrammingPolicy,
  SessionAllocationMaterializationInput,
  SessionAllocationMaterializationResult,
  SessionAllocationReservation,
  SessionFeasibilityOracleStatus,
  SessionResponsibilityPurpose,
  StandaloneRecoverySessionDesignVerdict,
  UnresolvedWeekContextObservation,
  WeekAllocationCompositionInput,
  WeekAllocationPlan,
  WeekDesignFinding,
  WeekEvaluationVector,
  WeekFactProvenance,
  WeekObjectiveSatisfactionState,
  WeekPlanningHorizon,
  WeekStructureContinuityEvidence,
  WeekTrainingOpportunity,
  WeeklyDevelopmentObjective,
  WeeklyFrequencyIntent,
  WeeklyIntent,
  WeeklyIntentPlannerInput,
  WeeklyIntentPlanningResult,
  WeeklyRecoverySpacingRequirement,
  WeeklySelectionTarget,
} from "../../src/weekComposer/designContracts";

export const WEEK_DESIGN_AS_OF = "2026-08-12T18:00:00-04:00";
export const WEEK_DESIGN_SEED = 0x086710;

const BASE_REQUEST = CONTROLLED_CANDIDATE_SCENARIOS.find((entry) =>
  entry.id === "horizontal-pull-gym-neutral")!.request;

function unique<T extends string>(values: readonly T[]): readonly T[] {
  return [...new Set(values)].sort();
}

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function fixtureProvenance(
  sourceRef: string,
  truthState: WeekFactProvenance["truthState"] = "expected_future_fact",
): WeekFactProvenance {
  return {
    sourceType: "non_production_fixture",
    sourceRef,
    evidenceBasis: ["Explicit deterministic design-lab fixture; not production programming policy."],
    recordedAt: WEEK_DESIGN_AS_OF,
    reviewStatus: "needs_review",
    truthState,
  };
}

export const NON_PRODUCTION_WEEKLY_POLICY: ReviewedWeeklyProgrammingPolicy = {
  policyId: "week-design-policy-fixture",
  version: "0.0.0-design",
  sourceType: "NON_PRODUCTION_POLICY_FIXTURE",
  sourceRefs: ["WEEKLY_INTENT_AND_WEEK_ALLOCATION_COMPOSER_ONTOLOGY_DESIGN_LAB"],
  evidenceBasis: ["Consequence comparison only; no scientific values are approved."],
  reviewer: "design_lab_fixture",
  reviewedAt: WEEK_DESIGN_AS_OF,
  applicableGoals: ["strength", "hypertrophy", "general_fitness", "conditioning", "posture_and_movement_quality"],
  applicableExperienceLevels: ["novice", "beginner", "intermediate", "advanced"],
  applicablePhaseIds: ["phase_1", "phase_2", "phase_3"],
  applicableContextModes: ["pain_aware_return"],
  ruleRefs: [
    "fixture_explicit_frequency_only",
    "fixture_required_before_preferred_before_optional",
    "fixture_no_dose_credit",
    "fixture_no_fixed_split",
  ],
  rules: [{
    id: "fixture-constrained-priority",
    kind: "constrained_horizon_priority",
    scope: {
      outcomeGoals: [], secondaryGoals: [], experienceLevels: [], phaseIds: [], contextModes: [],
      objectivePurposes: [], targetTypes: [], populations: [], horizonCapacity: [],
    },
    behavior: "required_before_preferred_before_optional",
    evidenceRefs: ["NON_PRODUCTION_POLICY_FIXTURE"],
    overridesRuleIds: [],
  }],
  explicitUnknowns: [
    "production_frequency_policy",
    "production_dose_policy",
    "production_recovery_spacing_policy",
    "production_search_bounds",
  ],
};

export function frequencyIntent(input: {
  readonly minimum?: number;
  readonly target?: number;
  readonly softMaximum?: number;
  readonly sourceRef?: string;
} = {}): WeeklyFrequencyIntent {
  const minimum = input.minimum ?? 1;
  const target = input.target ?? minimum;
  const softMaximum = input.softMaximum ?? target;
  return {
    minimumAllocatedSessions: minimum,
    targetAllocatedSessions: target,
    softMaximumAllocatedSessions: softMaximum,
    source: "explicit_owner_decision",
    sourceRef: input.sourceRef ?? "NON_PRODUCTION_POLICY_FIXTURE:frequency",
    provenance: fixtureProvenance(input.sourceRef ?? "fixture-frequency", "planned_allocation"),
  };
}

export function weeklyTarget(input: Partial<WeeklySelectionTarget> = {}): WeeklySelectionTarget {
  return {
    targetMovementRoles: input.targetMovementRoles ?? ["horizontal_pull"],
    targetActionFunctions: input.targetActionFunctions ?? [],
    targetMuscles: input.targetMuscles ?? ["mid_back", "lats"],
    muscleRequirement: input.muscleRequirement ?? "primary_required",
    targetBodyRegions: input.targetBodyRegions ?? ["shoulder", "thoracic_spine"],
  };
}

export function weeklyPriority(input: Partial<ExplicitWeeklyPriority> & Pick<ExplicitWeeklyPriority, "id" | "purpose">): ExplicitWeeklyPriority {
  return {
    id: input.id,
    purpose: input.purpose,
    target: input.target ?? weeklyTarget(),
    priority: input.priority ?? "required",
    priorityOrder: input.priorityOrder ?? 0,
    frequencyIntent: input.frequencyIntent ?? frequencyIntent(),
    dosePolicyReference: input.dosePolicyReference ?? { state: "pending_prescription_policy", policyRef: "future-prescription-policy" },
    sourceEvidence: input.sourceEvidence ?? [{
      sourceKind: "external_weekly_brief",
      sourceId: `${input.id}:source`,
      evidenceRefs: [`${input.id}:explicit-priority`],
      provenance: fixtureProvenance(`${input.id}:priority`, "planned_allocation"),
    }],
    goalRelationships: input.goalRelationships ?? [{
      goal: "strength",
      relationship: "primary_weekly_goal",
      sourceEvidenceRefs: [`${input.id}:explicit-priority`],
    }],
  };
}

export function weekOpportunity(input: {
  readonly id: string;
  readonly order: number;
  readonly capacity?: "condensed" | "standard" | "expanded" | "unknown";
  readonly minutes?: number | null;
  readonly equipment?: EquipmentCapabilities;
  readonly equipmentRef?: string;
  readonly availabilityStatus?: WeekTrainingOpportunity["availabilityStatus"];
  readonly completionStatus?: WeekTrainingOpportunity["completionStatus"];
  readonly dateRef?: string;
}): WeekTrainingOpportunity {
  const expectedEquipment: ExpectedSessionEquipment = input.equipment
    ? { kind: "capability_snapshot", capabilities: input.equipment, provenance: fixtureProvenance(`${input.id}:equipment`) }
    : input.equipmentRef
      ? { kind: "equipment_reference", equipmentRef: input.equipmentRef, provenance: fixtureProvenance(`${input.id}:equipment-ref`) }
      : { kind: "unknown", provenance: fixtureProvenance(`${input.id}:equipment-unknown`) };
  return {
    id: input.id,
    ...(input.dateRef ? { calendarDateRef: input.dateRef } : {}),
    order: input.order,
    expectedAvailability: {
      availableMinutes: input.minutes === undefined ? 45 : input.minutes,
      structuralCapacity: input.capacity ?? "standard",
      provenance: fixtureProvenance(`${input.id}:availability`),
    },
    expectedEquipment,
    provenance: fixtureProvenance(`${input.id}:opportunity`),
    availabilityStatus: input.availabilityStatus ?? "available",
    completionStatus: input.completionStatus ?? "not_started",
    constraints: [{
      constraintId: `${input.id}:single-session`,
      kind: "single_session_only",
      targetOpportunityIds: [],
      required: true,
      provenance: fixtureProvenance(`${input.id}:single-session`),
    }],
    unresolvedActualDayContextRefs: [`${input.id}:actual-context-pending`],
  };
}

export function weekHorizon(input: {
  readonly id?: string;
  readonly opportunities?: readonly WeekTrainingOpportunity[];
  readonly unresolved?: readonly UnresolvedWeekContextObservation[];
} = {}): WeekPlanningHorizon {
  const opportunities = input.opportunities ?? [
    weekOpportunity({ id: "opportunity-1", order: 0, equipment: BASE_REQUEST.equipment }),
    weekOpportunity({ id: "opportunity-2", order: 1, equipment: BASE_REQUEST.equipment }),
    weekOpportunity({ id: "opportunity-3", order: 2, equipment: BASE_REQUEST.equipment }),
  ];
  return {
    id: input.id ?? "week-design-horizon",
    athleteId: BASE_REQUEST.athlete.id,
    boundary: { kind: "ordered_cycle", cycleRef: "irregular-design-cycle", startOrder: 0, endOrder: Math.max(0, opportunities.length - 1) },
    evaluationAsOf: WEEK_DESIGN_AS_OF,
    opportunities,
    provenance: fixtureProvenance("week-design-horizon"),
    timezone: "America/Toronto",
    completedOpportunityIds: opportunities.filter((entry) => entry.completionStatus === "completed").map((entry) => entry.id),
    remainingOpportunityIds: opportunities.filter((entry) => entry.completionStatus === "not_started" && entry.availabilityStatus === "available").map((entry) => entry.id),
    unresolvedScheduleContext: input.unresolved ?? [],
  };
}

export const EMPTY_WEEK_CONTINUITY: WeekStructureContinuityEvidence = {
  previousWeeklyObjectiveIds: [],
  previousSessionResponsibilitySignatures: [],
  productiveAllocationRelationships: [],
  completedOpportunityIds: [],
  missedOpportunityIds: [],
  objectiveSatisfactionStates: {},
  scheduleMovementRefs: [],
  maintenanceReasonRefs: [],
  changeReasonRefs: [],
};

export function weeklyIntentInput(input: {
  readonly outcomeGoal?: WeeklyIntentPlannerInput["explicitOutcomeGoal"];
  readonly secondaryGoals?: WeeklyIntentPlannerInput["orderedSecondaryGoals"];
  readonly priorities?: readonly ExplicitWeeklyPriority[];
  readonly horizon?: WeekPlanningHorizon;
  readonly policy?: ReviewedWeeklyProgrammingPolicy | null;
  readonly contextModes?: WeeklyIntentPlannerInput["programmingContextModes"];
  readonly assessment?: WeeklyIntentPlannerInput["assessment"];
  readonly pain?: WeeklyIntentPlannerInput["painAndInjury"];
  readonly safety?: TrainingSafetyState;
  readonly externalLoad?: readonly ExternalTrainingLoadEvent[];
} = {}): WeeklyIntentPlannerInput {
  return {
    athlete: BASE_REQUEST.athlete,
    explicitOutcomeGoal: input.outcomeGoal === undefined ? "strength" : input.outcomeGoal,
    orderedSecondaryGoals: input.secondaryGoals ?? [],
    programmingContextModes: input.contextModes ?? [],
    phaseIntent: BASE_REQUEST.phase,
    planningHorizon: input.horizon ?? weekHorizon(),
    assessment: input.assessment ?? { signals: [], historicalWeaknesses: [] },
    painAndInjury: input.pain ?? NO_PAIN_OR_INJURY,
    trainingSafety: input.safety ?? NO_TRAINING_SAFETY_SIGNALS,
    history: EMPTY_TRAINING_HISTORY,
    trainingResponseHistory: { observations: [] },
    explicitWeeklyPriorities: input.priorities ?? [weeklyPriority({ id: "weekly-pull", purpose: "movement_development" })],
    ...(input.policy !== null ? { reviewedPolicy: input.policy ?? NON_PRODUCTION_WEEKLY_POLICY } : {}),
    externalLoadContext: input.externalLoad ?? [],
    evaluationAsOf: WEEK_DESIGN_AS_OF,
  };
}

const PRIORITY_RANK = { required: 0, preferred: 1, optional: 2 } as const;

function targetKey(target: WeeklySelectionTarget): string {
  return JSON.stringify({
    movement: [...target.targetMovementRoles].sort(),
    action: [...target.targetActionFunctions].sort(),
    muscles: [...target.targetMuscles].sort(),
    relationship: target.muscleRequirement,
    regions: [...target.targetBodyRegions].sort(),
  });
}

function normalizeWeeklyObjectives(priorities: readonly ExplicitWeeklyPriority[]): {
  readonly objectives: readonly WeeklyDevelopmentObjective[];
  readonly included: WeeklyIntentPlanningResult["includedObjectiveTraces"];
  readonly merged: WeeklyIntentPlanningResult["mergedObjectiveTraces"];
} {
  const grouped = new Map<string, ExplicitWeeklyPriority[]>();
  for (const priority of priorities) {
    const key = `${priority.purpose}:${targetKey(priority.target)}`;
    grouped.set(key, [...(grouped.get(key) ?? []), priority]);
  }
  const merged: WeeklyIntentPlanningResult["mergedObjectiveTraces"][number][] = [];
  const objectives = [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([, entries]) => {
    const ordered = [...entries].sort((left, right) => PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority] ||
      left.priorityOrder - right.priorityOrder || left.id.localeCompare(right.id));
    const source = ordered[0];
    const id = ordered.length === 1 ? `weekly-objective:${source.id}` : `weekly-objective:merged:${ordered.map((entry) => entry.id).sort().join("+")}`;
    if (ordered.length > 1) merged.push({
      objectiveId: id,
      sourcePriorityIds: ordered.map((entry) => entry.id).sort(),
      ruleRefs: ["structured_equivalent_weekly_objective_merge"],
      evidenceRefs: unique(ordered.flatMap((entry) => entry.sourceEvidence.flatMap((evidence) => evidence.evidenceRefs))),
    });
    return {
      id,
      purpose: source.purpose,
      selectionTarget: {
        targetMovementRoles: [...source.target.targetMovementRoles].sort(),
        targetActionFunctions: [...source.target.targetActionFunctions].sort(),
        targetMuscles: [...source.target.targetMuscles].sort(),
        muscleRequirement: source.target.muscleRequirement,
        targetBodyRegions: [...source.target.targetBodyRegions].sort(),
      },
      priority: source.priority,
      priorityOrder: source.priorityOrder,
      sourceEvidence: ordered.flatMap((entry) => entry.sourceEvidence).sort((left, right) => left.sourceId.localeCompare(right.sourceId)),
      goalRelationships: ordered.flatMap((entry) => entry.goalRelationships)
        .sort((left, right) => left.goal.localeCompare(right.goal) || left.relationship.localeCompare(right.relationship)),
      ...(source.frequencyIntent ? { frequencyIntent: source.frequencyIntent } : {}),
      dosePolicyReference: source.dosePolicyReference,
      recoverySpacingRequirementRefs: [],
      sessionRoleFlexibility: source.purpose === "direct_action_development" || source.purpose === "muscle_development"
        ? ["secondary", "accessory"] as const
        : ["main", "secondary", "accessory"] as const,
      unresolvedPolicyState: source.frequencyIntent ?
        (source.dosePolicyReference.state === "unknown" ? "dose_policy_pending" : "resolved_for_allocation") :
        "FREQUENCY_POLICY_REQUIRED",
      reasonCode: `explicit_weekly_${source.purpose}`,
      explanation: `Inert design-lab rationale for ${source.id}.`,
    } satisfies WeeklyDevelopmentObjective;
  });
  const ordered = [...objectives].sort((left, right) => PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority] ||
    left.priorityOrder - right.priorityOrder || left.id.localeCompare(right.id));
  return {
    objectives: ordered,
    included: ordered.map((objective) => ({
      objectiveId: objective.id,
      sourcePriorityIds: unique(objective.sourceEvidence.map((entry) => entry.sourceId)),
      ruleRefs: ["explicit_priority_to_weekly_objective"],
      evidenceRefs: unique(objective.sourceEvidence.flatMap((entry) => entry.evidenceRefs)),
    })),
    merged,
  };
}

function emptyWeeklyIntentResult(input: WeeklyIntentPlannerInput, status: WeeklyIntentPlanningResult["status"],
  findings: readonly WeekDesignFinding[] = []): WeeklyIntentPlanningResult {
  return {
    status,
    weeklyIntent: null,
    trainingReadiness: buildTrainingReadinessTrace({ trainingSafety: input.trainingSafety, acuteSeverePain: input.painAndInjury.acuteSeverePain }),
    includedObjectiveTraces: [],
    omittedPriorityTraces: [],
    mergedObjectiveTraces: [],
    policyFindings: findings,
    contextOwnershipFindings: [],
    unresolvedContext: input.planningHorizon.unresolvedScheduleContext,
    decisionTrace: ["NON_PRODUCTION_DESIGN_LAB", status],
  };
}

export function designWeeklyIntent(input: WeeklyIntentPlannerInput): WeeklyIntentPlanningResult {
  const readiness = buildTrainingReadinessTrace({ trainingSafety: input.trainingSafety, acuteSeverePain: input.painAndInjury.acuteSeverePain });
  if (!input.explicitOutcomeGoal) return emptyWeeklyIntentResult(input, "weekly_goal_under_specified");
  if (readiness.downstreamTrainingAllowed === false) return emptyWeeklyIntentResult(input, "blocked_by_training_readiness");
  const available = input.planningHorizon.opportunities.filter((entry) =>
    entry.availabilityStatus === "available" && entry.completionStatus === "not_started");
  if (available.length === 0) return emptyWeeklyIntentResult(input, "current_week_availability_required");
  if (!input.reviewedPolicy) return emptyWeeklyIntentResult(input, "weekly_policy_required", [{
    severity: "error", code: "REVIEWED_WEEKLY_POLICY_REQUIRED", owner: "weekly_intent_planner",
    sourceRef: input.planningHorizon.id, classification: "OWNER_POLICY_REQUIRED",
    message: "The design lab does not invent weekly programming policy.",
  }]);
  if (input.externalLoadContext.some((event) => event.reviewedReceiverState === "unresolved_context") ||
      input.planningHorizon.unresolvedScheduleContext.some((entry) => entry.blocksWeeklyIntent)) {
    return emptyWeeklyIntentResult(input, "unsupported_context");
  }
  const IDs = input.explicitWeeklyPriorities.map((entry) => entry.id);
  const orderKeys = input.explicitWeeklyPriorities.map((entry) => `${entry.priority}:${entry.priorityOrder}`);
  if (new Set(IDs).size !== IDs.length || new Set(orderKeys).size !== orderKeys.length) {
    return emptyWeeklyIntentResult(input, "contradictory_week_input");
  }
  if (input.explicitWeeklyPriorities.some((entry) => !entry.frequencyIntent)) {
    return emptyWeeklyIntentResult(input, "weekly_policy_required", [{
      severity: "error", code: "FREQUENCY_POLICY_REQUIRED", owner: "weekly_intent_planner",
      sourceRef: input.reviewedPolicy.policyId, classification: "OWNER_POLICY_REQUIRED",
      message: "Every allocated-session frequency band requires an explicit source.",
    }]);
  }
  const normalized = normalizeWeeklyObjectives(input.explicitWeeklyPriorities);
  const painSafetyRefs = unique([
    ...input.painAndInjury.historicalInjuries.map((entry) => entry.id),
    ...input.painAndInjury.historicalSensitivities.map((entry) => entry.id),
    ...input.painAndInjury.currentDiscomforts.map((entry) => entry.id),
    ...input.painAndInjury.moderatePain.map((entry) => entry.id),
    ...input.painAndInjury.acuteSeverePain.map((entry) => entry.id),
    ...input.trainingSafety.signals.map((entry) => entry.signalId),
  ]);
  const weeklyIntent: WeeklyIntent = {
    id: `${input.planningHorizon.id}:weekly-intent`,
    athleteId: input.athlete.id,
    planningHorizonId: input.planningHorizon.id,
    outcomeGoal: input.explicitOutcomeGoal,
    orderedSecondaryGoals: [...input.orderedSecondaryGoals],
    programmingContextModes: [...input.programmingContextModes].sort(),
    phaseIntentRef: input.phaseIntent.id,
    objectives: normalized.objectives,
    policyReferences: [input.reviewedPolicy.policyId],
    assessmentPriorityReferences: input.assessment.signals.map((entry) => entry.id).sort(),
    painSafetyContextReferences: painSafetyRefs,
    continuityEvidence: EMPTY_WEEK_CONTINUITY,
    currentHorizonOpportunityReferences: available.map((entry) => entry.id).sort(),
    unresolvedContext: input.planningHorizon.unresolvedScheduleContext,
    sourceTrace: {
      plannerId: "weekly_intent_planner_design_v1",
      sourceRefs: unique([input.planningHorizon.id, ...normalized.included.flatMap((entry) => entry.evidenceRefs)]),
      policyRefs: [input.reviewedPolicy.policyId],
      transformationRuleRefs: ["explicit_priority_normalization", "no_fixed_split", "no_dose_credit"],
    },
  };
  return {
    status: "weekly_intent_planned",
    weeklyIntent,
    trainingReadiness: readiness,
    includedObjectiveTraces: normalized.included,
    omittedPriorityTraces: [],
    mergedObjectiveTraces: normalized.merged,
    policyFindings: input.reviewedPolicy.explicitUnknowns.map((unknown) => ({
      severity: "observation", code: "POLICY_UNKNOWN", owner: "reviewed_weekly_programming_policy",
      sourceRef: unknown, classification: "OWNER_POLICY_REQUIRED", message: `${unknown} remains unapproved.`,
    })),
    contextOwnershipFindings: [
      { severity: "observation", code: "PHASE_CONTEXT_ONLY", owner: "reviewed_weekly_programming_policy", sourceRef: input.phaseIntent.id,
        classification: "DESIGN_READY", message: "Phase affects weekly behavior only through reviewed policy." },
      { severity: "observation", code: "PAIN_CREATES_NO_OBJECTIVE", owner: "pain_and_safety_domains", sourceRef: input.planningHorizon.id,
        classification: "DESIGN_READY", message: "Pain and safety are context, restrictions, or blockers, never objective generators." },
    ],
    unresolvedContext: input.planningHorizon.unresolvedScheduleContext,
    decisionTrace: ["NON_PRODUCTION_DESIGN_LAB", "explicit_goal", "explicit_priorities", "frequency_source_present", "objective_normalization"],
  };
}

function combinations(values: readonly string[], count: number): readonly (readonly string[])[] {
  if (count === 0) return [[]];
  if (count > values.length) return [];
  const result: string[][] = [];
  const visit = (start: number, selected: string[]): void => {
    if (selected.length === count) {
      result.push([...selected]);
      return;
    }
    for (let index = start; index < values.length; index += 1) {
      selected.push(values[index]);
      visit(index + 1, selected);
      selected.pop();
    }
  };
  visit(0, []);
  return result;
}

type ObjectiveOpportunityAssignments = Readonly<Record<string, readonly string[]>>;

function enumerateAssignments(intent: WeeklyIntent, opportunities: readonly WeekTrainingOpportunity[]): readonly ObjectiveOpportunityAssignments[] {
  const availableIds = opportunities
    .filter((entry) => entry.availabilityStatus === "available" && entry.completionStatus === "not_started")
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))
    .map((entry) => entry.id);
  let states: ObjectiveOpportunityAssignments[] = [{}];
  for (const objective of intent.objectives) {
    if (!objective.frequencyIntent) return [];
    const minimum = objective.priority === "optional" ? 0 : objective.frequencyIntent.minimumAllocatedSessions;
    const maximum = Math.min(availableIds.length, objective.frequencyIntent.targetAllocatedSessions);
    const choices: (readonly string[])[] = [];
    for (let count = minimum; count <= maximum; count += 1) choices.push(...combinations(availableIds, count));
    states = states.flatMap((state) => choices.map((choice) => ({ ...state, [objective.id]: choice })));
  }
  return states;
}

function objectiveIdsForOpportunity(assignments: ObjectiveOpportunityAssignments, opportunityId: string): readonly string[] {
  return Object.entries(assignments).filter(([, opportunityIds]) => opportunityIds.includes(opportunityId))
    .map(([objectiveId]) => objectiveId).sort();
}

function feasibilityFor(
  input: WeekAllocationCompositionInput,
  opportunityId: string,
  objectiveIds: readonly string[],
): PrecomputedSessionFeasibilityResult | undefined {
  return input.precomputedFeasibilityResults.find((entry) =>
    entry.opportunityId === opportunityId &&
    JSON.stringify([...entry.objectiveIds].sort()) === JSON.stringify([...objectiveIds].sort()));
}

function spacingValid(
  assignments: ObjectiveOpportunityAssignments,
  opportunities: readonly WeekTrainingOpportunity[],
  requirements: readonly WeeklyRecoverySpacingRequirement[],
): boolean {
  const orderById = new Map(opportunities.map((entry) => [entry.id, entry.order]));
  return requirements.every((requirement) => {
    const basis = requirement.spacingBasis;
    if (!requirement.required || basis.kind !== "ordered_opportunity_gap") return true;
    const allocated = unique(requirement.weeklyObjectiveIds.flatMap((id) => assignments[id] ?? []))
      .map((id) => orderById.get(id))
      .filter((order): order is number => order !== undefined)
      .sort((left, right) => left - right);
    return allocated.every((order, index) => index === 0 ||
      order - allocated[index - 1] >= basis.minimumGap);
  });
}

const FEASIBILITY_RANK: Readonly<Record<SessionFeasibilityOracleStatus, number>> = {
  feasible_session_skeleton: 4,
  prescription_resolution_required: 3,
  candidate_review_required: 2,
  search_inconclusive: 1,
  infeasible_objective_combination: 0,
};

function evaluateAssignments(input: WeekAllocationCompositionInput, assignments: ObjectiveOpportunityAssignments): WeekEvaluationVector {
  const objectives = input.weeklyIntent.objectives;
  const available = input.orderedTrainingOpportunities.filter((entry) =>
    entry.availabilityStatus === "available" && entry.completionStatus === "not_started");
  const required = objectives.filter((entry) => entry.priority === "required");
  const preferred = objectives.filter((entry) => entry.priority === "preferred");
  const optional = objectives.filter((entry) => entry.priority === "optional");
  const feasibility = available.flatMap((opportunity) => {
    const objectiveIds = objectiveIdsForOpportunity(assignments, opportunity.id);
    if (objectiveIds.length === 0) return [];
    return [feasibilityFor(input, opportunity.id, objectiveIds)?.status ?? "search_inconclusive"];
  });
  const requiredMinimum = required.map((objective) =>
    (assignments[objective.id]?.length ?? 0) >= (objective.frequencyIntent?.minimumAllocatedSessions ?? Number.POSITIVE_INFINITY));
  const opportunityLegality = available.map((opportunity) =>
    objectiveIdsForOpportunity(assignments, opportunity.id).length === 0 || opportunity.availabilityStatus === "available");
  const spacing = input.recoverySpacingRequirements.map((requirement) => spacingValid(assignments, available, [requirement]));
  const continuity = input.previousWeekStructureEvidence.productiveAllocationRelationships.map((relationship) =>
    (assignments[relationship.objectiveId] ?? []).some((opportunityId) =>
      relationship.responsibilitySignature === `${relationship.objectiveId}@${opportunityId}`));
  const equipmentCapacity = available.flatMap((opportunity) => {
    const ids = objectiveIdsForOpportunity(assignments, opportunity.id);
    return ids.length === 0 ? [] : [(feasibilityFor(input, opportunity.id, ids)?.status ?? "search_inconclusive") !== "infeasible_objective_combination"];
  });
  const hardValid = requiredMinimum.every(Boolean) && opportunityLegality.every(Boolean) && spacing.every(Boolean) &&
    feasibility.every((status) => status !== "infeasible_objective_combination");
  return {
    hardValid,
    requiredMinimumAllocationVector: requiredMinimum,
    globalTrainingSafetyAllowsExecution: true,
    opportunityLegalityVector: opportunityLegality,
    requiredRecoverySpacingVector: spacing,
    structuralContinuityVector: continuity,
    sessionFeasibilityVector: feasibility,
    requiredFrequencyVector: required.map((objective) => assignments[objective.id]?.length ?? 0),
    priorityFrequencyVector: objectives.map((objective) => assignments[objective.id]?.length ?? 0),
    stressConcentrationBurden: 0,
    equipmentCapacityCoherenceVector: equipmentCapacity,
    preferredTargetAllocationVector: preferred.map((objective) =>
      (assignments[objective.id]?.length ?? 0) >= (objective.frequencyIntent?.targetAllocatedSessions ?? Number.POSITIVE_INFINITY)),
    optionalMarginalValueVector: optional.map((objective) => {
      const count = assignments[objective.id]?.length ?? 0;
      return count > 0 && count <= (objective.frequencyIntent?.targetAllocatedSessions ?? 0);
    }),
    unnecessaryDuplicationBurden: objectives.reduce((total, objective) =>
      total + Math.max(0, (assignments[objective.id]?.length ?? 0) - (objective.frequencyIntent?.softMaximumAllocatedSessions ?? 0)), 0),
    canonicalTieBreak: Object.entries(assignments).sort(([left], [right]) => left.localeCompare(right))
      .map(([objectiveId, opportunityIds]) => `${objectiveId}:${[...opportunityIds].sort().join(",")}`).join("|"),
  };
}

function compareBooleans(left: readonly boolean[], right: readonly boolean[]): number {
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const l = left[index] ?? false;
    const r = right[index] ?? false;
    if (l !== r) return l ? -1 : 1;
  }
  return 0;
}

function compareNumbers(left: readonly number[], right: readonly number[], higherBetter = true): number {
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const l = left[index] ?? 0;
    const r = right[index] ?? 0;
    if (l !== r) return higherBetter ? r - l : l - r;
  }
  return 0;
}

export function compareWeekEvaluations(left: WeekEvaluationVector, right: WeekEvaluationVector): number {
  if (left.hardValid !== right.hardValid) return left.hardValid ? -1 : 1;
  let compared = compareBooleans(left.requiredMinimumAllocationVector, right.requiredMinimumAllocationVector);
  if (compared !== 0) return compared;
  if (left.globalTrainingSafetyAllowsExecution !== right.globalTrainingSafetyAllowsExecution) {
    return left.globalTrainingSafetyAllowsExecution ? -1 : 1;
  }
  for (const pair of [
    [left.opportunityLegalityVector, right.opportunityLegalityVector],
    [left.requiredRecoverySpacingVector, right.requiredRecoverySpacingVector],
    [left.structuralContinuityVector, right.structuralContinuityVector],
  ] as const) {
    compared = compareBooleans(pair[0], pair[1]);
    if (compared !== 0) return compared;
  }
  compared = compareNumbers(left.sessionFeasibilityVector.map((entry) => FEASIBILITY_RANK[entry]),
    right.sessionFeasibilityVector.map((entry) => FEASIBILITY_RANK[entry]));
  if (compared !== 0) return compared;
  compared = compareNumbers(left.requiredFrequencyVector, right.requiredFrequencyVector);
  if (compared !== 0) return compared;
  compared = compareNumbers(left.priorityFrequencyVector, right.priorityFrequencyVector);
  if (compared !== 0) return compared;
  if (left.stressConcentrationBurden !== right.stressConcentrationBurden) {
    return left.stressConcentrationBurden - right.stressConcentrationBurden;
  }
  compared = compareBooleans(left.equipmentCapacityCoherenceVector, right.equipmentCapacityCoherenceVector);
  if (compared !== 0) return compared;
  compared = compareBooleans(left.preferredTargetAllocationVector, right.preferredTargetAllocationVector);
  if (compared !== 0) return compared;
  compared = compareBooleans(left.optionalMarginalValueVector, right.optionalMarginalValueVector);
  if (compared !== 0) return compared;
  if (left.unnecessaryDuplicationBurden !== right.unnecessaryDuplicationBurden) {
    return left.unnecessaryDuplicationBurden - right.unnecessaryDuplicationBurden;
  }
  return left.canonicalTieBreak.localeCompare(right.canonicalTieBreak);
}

function sessionPurpose(objective: WeeklyDevelopmentObjective, dominant: boolean): SessionResponsibilityPurpose {
  if (dominant) return objective.purpose === "capacity_development" || objective.purpose === "conditioning_development"
    ? "capacity_main" : "dominant_main";
  if (objective.purpose === "direct_action_development" || objective.purpose === "muscle_development") return "direct_accessory";
  if (objective.purpose === "capacity_development" || objective.purpose === "conditioning_development") return "capacity_accessory";
  if (objective.purpose === "assessment_priority_development") return "activation";
  if (objective.purpose === "recovery_support") return "recovery";
  return "secondary_main";
}

export function resolveSessionOutcomeGoal(
  objectives: readonly WeeklyDevelopmentObjective[],
  weeklyPrimaryGoal: TrainingOutcomeGoal,
): { readonly status: "session_goal_resolved"; readonly goal: TrainingOutcomeGoal; readonly evidence: readonly string[] } |
  { readonly status: "SESSION_GOAL_CONFLICT"; readonly goal: null; readonly evidence: readonly string[] } {
  const dominant = objectives.find((entry) => entry.purpose !== "recovery_support" &&
    entry.purpose !== "assessment_priority_development" && entry.purpose !== "direct_action_development");
  const relationships = dominant?.goalRelationships.filter((entry) => entry.relationship !== "cross_goal_support") ?? [];
  const goals = unique(relationships.map((entry) => entry.goal));
  if (goals.length > 1) {
    return { status: "SESSION_GOAL_CONFLICT", goal: null,
      evidence: unique(relationships.flatMap((entry) => entry.sourceEvidenceRefs)) };
  }
  return { status: "session_goal_resolved", goal: goals[0] ?? weeklyPrimaryGoal,
    evidence: unique(relationships.flatMap((entry) => entry.sourceEvidenceRefs)) };
}

function reservationFor(
  input: WeekAllocationCompositionInput,
  assignments: ObjectiveOpportunityAssignments,
  opportunity: WeekTrainingOpportunity,
  objectiveIds: readonly string[],
): SessionAllocationReservation {
  const objectives = objectiveIds.map((id) => input.weeklyIntent.objectives.find((entry) => entry.id === id)!)
    .sort((left, right) => PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority] || left.priorityOrder - right.priorityOrder || left.id.localeCompare(right.id));
  const dominantIndex = objectives.findIndex((entry) => entry.purpose !== "recovery_support" && entry.purpose !== "assessment_priority_development" &&
    entry.purpose !== "direct_action_development");
  const sessionGoal = resolveSessionOutcomeGoal(objectives, input.weeklyIntent.outcomeGoal);
  if (sessionGoal.status === "SESSION_GOAL_CONFLICT") throw new Error("SESSION_GOAL_CONFLICT");
  return {
    id: `${input.weeklyIntent.id}:reservation:${opportunity.id}`,
    weekIntentId: input.weeklyIntent.id,
    opportunityId: opportunity.id,
    athleteId: input.weeklyIntent.athleteId,
    sessionType: "ordinary_training",
    weeklyPrimaryOutcomeGoal: input.weeklyIntent.outcomeGoal,
    weeklySecondaryOutcomeGoals: input.weeklyIntent.orderedSecondaryGoals,
    sessionOutcomeGoal: sessionGoal.goal,
    sessionGoalEvidence: objectives.flatMap((objective) => objective.goalRelationships.map((goalRelationship) => ({
      weeklyObjectiveId: objective.id,
      goalRelationship,
    }))),
    programmingContextModes: input.weeklyIntent.programmingContextModes,
    allocatedObjectives: objectives.map((objective, index) => ({
      id: `${opportunity.id}:${objective.id}`,
      weeklyObjectiveId: objective.id,
      purpose: sessionPurpose(objective, index === dominantIndex),
      weeklyObjectivePriority: objective.priority,
      priority: index === dominantIndex ? "required" : objective.priority,
      priorityOrder: objective.priorityOrder,
      selectionTarget: objective.selectionTarget,
      sourceEvidenceRefs: unique(objective.sourceEvidence.flatMap((entry) => entry.evidenceRefs)),
      reasonCode: `reservation_${objective.reasonCode}`,
      explanation: `Inert reservation rationale for ${objective.id}.`,
    })),
    expectedStructuralCapacity: opportunity.expectedAvailability.structuralCapacity,
    expectedAvailability: opportunity.expectedAvailability,
    expectedEquipment: opportunity.expectedEquipment,
    neighboringReservationRefs: input.orderedTrainingOpportunities
      .filter((entry) => Math.abs(entry.order - opportunity.order) === 1)
      .filter((entry) => objectiveIdsForOpportunity(assignments, entry.id).length > 0)
      .map((entry) => `${input.weeklyIntent.id}:reservation:${entry.id}`).sort(),
    weeklyObjectiveSourceRefs: objectiveIds,
    unresolvedWeeklyContext: input.weeklyIntent.unresolvedContext,
    unresolvedCurrentSessionContext: opportunity.unresolvedActualDayContextRefs.map((ref) => ({
      observationId: ref,
      category: "current_availability",
      proposedOwner: "session_allocation_materializer",
      resolutionState: "requires_typed_input",
      blocksWeeklyIntent: false,
      blocksAllocation: false,
      sourceRef: ref,
      explanation: "Actual day-of context remains future truth until materialization.",
    })),
    status: "reserved",
    sourceTrace: {
      composerId: "week_allocation_composer_design_v1",
      sourceRefs: [input.weeklyIntent.id, opportunity.id],
      policyRefs: [input.allocationPolicy.policyId],
      ruleRefs: ["NON_PRODUCTION_DESIGN_LAB", "objective_responsibility_allocation", "expected_facts_not_current"],
    },
  };
}

function satisfactionState(objective: WeeklyDevelopmentObjective, count: number): WeekObjectiveSatisfactionState {
  if (!objective.frequencyIntent) return "frequency_policy_required";
  if (count < objective.frequencyIntent.minimumAllocatedSessions) {
    return objective.priority === "optional" ? "optional_not_allocated" : "below_minimum_unresolved";
  }
  if (count > objective.frequencyIntent.softMaximumAllocatedSessions) return "above_soft_ceiling_review";
  if (count >= objective.frequencyIntent.targetAllocatedSessions) return "allocated_target_opportunities";
  return "allocated_minimum_opportunities";
}

export function designWeekAllocation(input: WeekAllocationCompositionInput): WeekAllocationPlan {
  if (input.allocationPolicy.sourceType !== "NON_PRODUCTION_POLICY_FIXTURE") {
    return {
      status: "requires_policy", weeklyIntentId: input.weeklyIntent.id, reservations: [], objectiveAllocationTraces: {},
      unallocatedObjectiveTraces: {}, recoverySpacingTraces: [], continuityTraces: [], equipmentAvailabilityTraces: [],
      expectedStructuralCapacityTraces: [], searchCompleteness: "search_inconclusive", wholeWeekEvaluation: null,
      objectiveSatisfactionStates: Object.fromEntries(input.weeklyIntent.objectives.map((entry) => [entry.id, "frequency_policy_required"])),
      unresolvedPrescriptionRequirements: [], unresolvedCurrentSessionFacts: [], reallocationState: "not_required",
      decisionTrace: ["DESIGN_LAB_ACCEPTS_NON_PRODUCTION_POLICY_FIXTURES_ONLY"],
    };
  }
  const assignments = enumerateAssignments(input.weeklyIntent, input.orderedTrainingOpportunities);
  if (assignments.length === 0) {
    return {
      status: "allocation_infeasible", weeklyIntentId: input.weeklyIntent.id, reservations: [], objectiveAllocationTraces: {},
      unallocatedObjectiveTraces: Object.fromEntries(input.weeklyIntent.objectives.map((entry) => [entry.id, ["no_legal_frequency_assignment"]])),
      recoverySpacingTraces: [], continuityTraces: [], equipmentAvailabilityTraces: [], expectedStructuralCapacityTraces: [],
      searchCompleteness: "exhaustive_design_infeasible", wholeWeekEvaluation: null,
      objectiveSatisfactionStates: Object.fromEntries(input.weeklyIntent.objectives.map((entry) => [entry.id, "blocked_by_availability"])),
      unresolvedPrescriptionRequirements: input.weeklyIntent.objectives.map((entry) => `${entry.id}:dose`), unresolvedCurrentSessionFacts: [],
      reallocationState: "not_required", decisionTrace: ["NON_PRODUCTION_DESIGN_LAB", "no_assignment_states"],
    };
  }
  const evaluated = assignments.map((assignment) => ({ assignment, evaluation: evaluateAssignments(input, assignment) }))
    .sort((left, right) => compareWeekEvaluations(left.evaluation, right.evaluation));
  const winner = evaluated[0];
  const opportunities = [...input.orderedTrainingOpportunities].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
  const reservations = opportunities.flatMap((opportunity) => {
    const objectiveIds = objectiveIdsForOpportunity(winner.assignment, opportunity.id);
    return objectiveIds.length === 0 ? [] : [reservationFor(input, winner.assignment, opportunity, objectiveIds)];
  });
  const satisfaction = Object.fromEntries(input.weeklyIntent.objectives.map((objective) =>
    [objective.id, satisfactionState(objective, winner.assignment[objective.id]?.length ?? 0)]));
  const valid = winner.evaluation.hardValid;
  return {
    status: valid ? "allocation_designed" : "allocation_infeasible",
    weeklyIntentId: input.weeklyIntent.id,
    reservations,
    objectiveAllocationTraces: Object.fromEntries(input.weeklyIntent.objectives.map((objective) =>
      [objective.id, winner.assignment[objective.id] ?? []])),
    unallocatedObjectiveTraces: Object.fromEntries(input.weeklyIntent.objectives
      .filter((objective) => (winner.assignment[objective.id]?.length ?? 0) < (objective.frequencyIntent?.minimumAllocatedSessions ?? 0))
      .map((objective) => [objective.id, ["below_explicit_minimum_after_exhaustive_design_search"]])),
    recoverySpacingTraces: input.recoverySpacingRequirements.map((entry) =>
      `${entry.id}:${spacingValid(winner.assignment, opportunities, [entry]) ? "satisfied" : "unresolved"}`),
    continuityTraces: input.previousWeekStructureEvidence.productiveAllocationRelationships.map((entry) =>
      `${entry.objectiveId}:${(winner.assignment[entry.objectiveId]?.length ?? 0) > 0 ? "responsibility_preserved" : "not_preserved"}`),
    equipmentAvailabilityTraces: reservations.map((entry) => `${entry.opportunityId}:${entry.expectedEquipment.kind}`),
    expectedStructuralCapacityTraces: reservations.map((entry) => `${entry.opportunityId}:${entry.expectedStructuralCapacity}`),
    searchCompleteness: valid ? "exhaustive_design_optimal" : "exhaustive_design_infeasible",
    wholeWeekEvaluation: winner.evaluation,
    objectiveSatisfactionStates: satisfaction,
    unresolvedPrescriptionRequirements: input.weeklyIntent.objectives
      .filter((entry) => entry.dosePolicyReference.state !== "not_applicable")
      .map((entry) => `${entry.id}:${entry.dosePolicyReference.state}`),
    unresolvedCurrentSessionFacts: reservations.flatMap((entry) => entry.unresolvedCurrentSessionContext.map((context) => context.observationId)),
    reallocationState: input.currentCompletionState && Object.values(input.currentCompletionState).includes("missed")
      ? "completed_history_preserved" : "not_required",
    decisionTrace: [
      "NON_PRODUCTION_DESIGN_LAB",
      `exhaustive_states:${evaluated.length}`,
      "strict_lexicographic_week_evaluation",
      "no_session_or_candidate_score_sum",
      "no_dose_sufficiency_claim",
    ],
  };
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonical(entry)]));
  }
  return value;
}

function sameEquipment(expected: ExpectedSessionEquipment, actual: CurrentSessionEquipment): boolean {
  return expected.kind !== "capability_snapshot" || JSON.stringify(canonical(expected.capabilities)) === JSON.stringify(canonical(actual.capabilities));
}

function allocatedObjectiveFromReservation(
  objective: SessionAllocationReservation["allocatedObjectives"][number],
  index: number,
): AllocatedSessionObjective {
  return {
    id: objective.id,
    kind: objective.purpose,
    priority: objective.priority,
    priorityOrder: index,
    selectionTarget: objective.selectionTarget,
    sourceEvidence: [{
      sourceKind: "future_week_allocation",
      sourceId: objective.weeklyObjectiveId,
      evidenceRefs: objective.sourceEvidenceRefs,
    }],
    standaloneAdmissionDirection: "policy_default",
    reasonCode: objective.reasonCode,
    explanation: objective.explanation,
  };
}

export function materializeReservationDesign(input: SessionAllocationMaterializationInput): SessionAllocationMaterializationResult {
  const readiness = buildTrainingReadinessTrace({ trainingSafety: input.actualSafetyState });
  const base = {
    plannerCurrentEquipment: null,
    expectedActualComparisonTrace: [] as string[],
    retainedWeeklyObjectiveIds: input.reservation.allocatedObjectives.map((entry) => entry.weeklyObjectiveId).sort(),
    reallocationEvidenceRefs: [] as string[],
    unresolvedContext: input.actualUnresolvedContext,
    decisionTrace: ["NON_PRODUCTION_DESIGN_LAB", "materializer_adds_no_allocation_policy"],
  };
  if (!readiness.downstreamTrainingAllowed) {
    return { ...base, status: "blocked_by_training_readiness", directive: null,
      reallocationEvidenceRefs: readiness.unresolvedSignalIds };
  }
  if (!input.actualCurrentAvailability || input.actualCurrentAvailability.availableMinutes === null || !input.actualCurrentEquipment) {
    return { ...base, status: "under_specified_current_context", directive: null };
  }
  if (input.actualUnresolvedContext.some((entry) => entry.blocksPlanning)) {
    return { ...base, status: "unsupported_context", directive: null };
  }
  const reservationCannotExecute = input.reservation.status === "missed_requires_reallocation" ||
    input.reservation.status === "cancelled_requires_reallocation" || input.reservation.status === "blocked_by_training_readiness";
  const capacityChanged = input.reservation.expectedStructuralCapacity !== input.actualCurrentAvailability.structuralCapacity;
  const equipmentChanged = !sameEquipment(input.reservation.expectedEquipment, input.actualCurrentEquipment);
  if (reservationCannotExecute || capacityChanged || equipmentChanged) {
    const refs = [
      ...(reservationCannotExecute ? [`reservation_status:${input.reservation.status}`] : []),
      ...(capacityChanged ? ["actual_structural_capacity_differs"] : []),
      ...(equipmentChanged ? ["actual_equipment_differs"] : []),
    ];
    return { ...base, status: "requires_week_reallocation", directive: null,
      plannerCurrentEquipment: input.actualCurrentEquipment,
      expectedActualComparisonTrace: refs,
      reallocationEvidenceRefs: refs };
  }
  const directive: SessionAllocationDirective = {
    id: `${input.reservation.id}:materialized`,
    source: "future_week_composer",
    athleteId: input.reservation.athleteId,
    sessionType: input.reservation.sessionType,
    outcomeGoal: input.reservation.sessionOutcomeGoal,
    programmingContextModes: input.reservation.programmingContextModes,
    currentSessionAvailability: input.actualCurrentAvailability,
    allocatedObjectives: input.reservation.allocatedObjectives.map(allocatedObjectiveFromReservation),
    neighboringSessionContextRefs: input.reservation.neighboringReservationRefs,
    unresolvedWeeklyContextRefs: input.reservation.unresolvedWeeklyContext.map((entry) => entry.observationId),
    weekReallocationEvidenceRefs: [],
    unresolvedContextObservations: input.actualUnresolvedContext,
    sourceTrace: {
      owner: "future_week_composer",
      sourceRefs: [input.reservation.id, ...input.explicitProductUserUpdateRefs],
      transformationRuleIds: ["reservation_plus_actual_context_no_new_policy"],
    },
    evaluationAsOf: input.actualEvaluationTime,
  };
  return {
    ...base,
    status: "directive_materialized",
    directive,
    plannerCurrentEquipment: input.actualCurrentEquipment,
    expectedActualComparisonTrace: [
      `expected_minutes:${input.reservation.expectedAvailability.availableMinutes ?? "unknown"}`,
      `actual_minutes:${input.actualCurrentAvailability.availableMinutes}`,
      "structural_capacity_match",
      "equipment_snapshot_match_or_expected_reference",
    ],
  };
}

export function runProductionSessionFeasibilityOracle(input: {
  readonly reservation: SessionAllocationReservation;
  readonly availability?: CurrentSessionAvailability;
  readonly equipment?: CurrentSessionEquipment;
}): PrecomputedSessionFeasibilityResult {
  const expectedCapabilities = input.reservation.expectedEquipment.kind === "capability_snapshot"
    ? input.reservation.expectedEquipment.capabilities : BASE_REQUEST.equipment;
  const materialized = materializeReservationDesign({
    reservation: input.reservation,
    actualCurrentAvailability: input.availability ?? {
      availableMinutes: input.reservation.expectedAvailability.availableMinutes ?? 45,
      structuralCapacity: input.reservation.expectedStructuralCapacity,
      provenance: "explicit_today",
      sourceRef: `${input.reservation.id}:actual-availability-fixture`,
    },
    actualCurrentEquipment: input.equipment ?? {
      capabilities: expectedCapabilities,
      provenance: "explicit_today",
      sourceRef: `${input.reservation.id}:actual-equipment-fixture`,
    },
    actualEvaluationTime: WEEK_DESIGN_AS_OF,
    actualSafetyState: NO_TRAINING_SAFETY_SIGNALS,
    actualUnresolvedContext: [],
    explicitProductUserUpdateRefs: ["design-oracle-explicit-fixture"],
  });
  if (materialized.status !== "directive_materialized" || !materialized.directive || !materialized.plannerCurrentEquipment) {
    return { opportunityId: input.reservation.opportunityId,
      objectiveIds: input.reservation.allocatedObjectives.map((entry) => entry.weeklyObjectiveId).sort(),
      status: "infeasible_objective_combination", sourceTraceRefs: materialized.decisionTrace,
      unresolvedRequirementRefs: materialized.reallocationEvidenceRefs };
  }
  const result = planAndComposeSessionSkeleton({
    directive: materialized.directive,
    athlete: BASE_REQUEST.athlete,
    phaseIntent: BASE_REQUEST.phase,
    assessment: BASE_REQUEST.assessment,
    painAndInjury: BASE_REQUEST.painAndInjury,
    trainingSafety: BASE_REQUEST.trainingSafety ?? NO_TRAINING_SAFETY_SIGNALS,
    currentEquipment: materialized.plannerCurrentEquipment,
    history: BASE_REQUEST.history,
    trainingResponseHistory: BASE_REQUEST.history.trainingResponseHistory ?? { observations: [] },
    satisfiedPrerequisiteIds: ["push-up-plank-control", "hinge-control", "suitcase-carry-loaded-gait-setup"],
    evaluationAsOf: WEEK_DESIGN_AS_OF,
  });
  const status: SessionFeasibilityOracleStatus = !result.skeleton || result.skeleton.compositionStatus === "infeasible"
    ? "infeasible_objective_combination"
    : result.skeleton.compositionStatus === "search_inconclusive"
      ? "search_inconclusive"
      : result.skeleton.executionReadiness === "candidate_review_required" ||
          result.skeleton.executionReadiness === "candidate_review_and_prescription_required"
        ? "candidate_review_required"
        : result.skeleton.executionReadiness === "prescription_resolution_required"
          ? "prescription_resolution_required"
          : "feasible_session_skeleton";
  return {
    opportunityId: input.reservation.opportunityId,
    objectiveIds: input.reservation.allocatedObjectives.map((entry) => entry.weeklyObjectiveId).sort(),
    status,
    sourceTraceRefs: [materialized.directive.id, result.skeleton?.sessionIntentId ?? "no-skeleton"],
    unresolvedRequirementRefs: result.skeleton?.assignments.flatMap((entry) => [
      ...entry.unresolvedCandidateReviewIds,
      ...entry.executionBlockingPrescriptionRequirementIds,
    ]) ?? [],
  };
}

function allNonEmptySubsets(values: readonly string[]): readonly (readonly string[])[] {
  const result: string[][] = [];
  for (let mask = 1; mask < 2 ** values.length; mask += 1) {
    result.push(values.filter((_, index) => (mask & (1 << index)) !== 0));
  }
  return result;
}

function hasDominantEligiblePurpose(objectives: readonly WeeklyDevelopmentObjective[]): boolean {
  return objectives.some((entry) => entry.purpose === "movement_development" || entry.purpose === "capacity_development");
}

export function buildPrecomputedFeasibility(input: {
  readonly intent: WeeklyIntent;
  readonly horizon: WeekPlanningHorizon;
  readonly explicitlyInfeasible?: readonly { readonly opportunityId: string; readonly objectiveIds: readonly string[]; readonly reason: string }[];
}): readonly PrecomputedSessionFeasibilityResult[] {
  const objectiveIds = input.intent.objectives.map((entry) => entry.id).sort();
  return input.horizon.opportunities.flatMap((opportunity) =>
    allNonEmptySubsets(objectiveIds).map((ids): PrecomputedSessionFeasibilityResult => {
      const objectives = ids.map((id) => input.intent.objectives.find((entry) => entry.id === id)!);
      const bodyweightOnly = opportunity.expectedEquipment.kind === "capability_snapshot" &&
        JSON.stringify(canonical(opportunity.expectedEquipment.capabilities)) === JSON.stringify(canonical(BODYWEIGHT_EQUIPMENT));
      const unsupportedBodyweightTarget = bodyweightOnly && objectives.some((objective) =>
        objective.selectionTarget.targetMovementRoles.some((role) =>
          ["horizontal_pull", "vertical_pull", "squat", "knee_dominant", "hinge", "carry"].includes(role)));
      const condensedOptionalCombination = opportunity.expectedAvailability.structuralCapacity === "condensed" &&
        objectives.some((objective) => objective.priority === "optional");
      const explicit = input.explicitlyInfeasible?.find((entry) => entry.opportunityId === opportunity.id &&
        JSON.stringify([...entry.objectiveIds].sort()) === JSON.stringify([...ids].sort()));
      const status: SessionFeasibilityOracleStatus = explicit || unsupportedBodyweightTarget || condensedOptionalCombination
        ? "infeasible_objective_combination"
        : opportunity.expectedEquipment.kind === "unknown"
          ? "search_inconclusive"
          : hasDominantEligiblePurpose(objectives)
            ? "feasible_session_skeleton"
            : "infeasible_objective_combination";
      return {
        opportunityId: opportunity.id,
        objectiveIds: ids,
        status,
        sourceTraceRefs: [
          "NON_PRODUCTION_PRECOMPUTED_FEASIBILITY_FIXTURE",
          ...(explicit ? [explicit.reason] : []),
          ...(unsupportedBodyweightTarget ? ["production_oracle_fixture_cannot_serve_target_with_bodyweight_snapshot"] : []),
          ...(condensedOptionalCombination ? ["fixture_condensed_capacity_reserves_required_before_optional"] : []),
          `equipment:${opportunity.expectedEquipment.kind}`,
        ],
        unresolvedRequirementRefs: status === "feasible_session_skeleton" ? [] : [`${opportunity.id}:${ids.join("+")}:review`],
      };
    }));
}

export function allocationInput(input: {
  readonly intent: WeeklyIntent;
  readonly horizon: WeekPlanningHorizon;
  readonly recovery?: readonly WeeklyRecoverySpacingRequirement[];
  readonly continuity?: WeekStructureContinuityEvidence;
  readonly explicitlyInfeasible?: readonly { readonly opportunityId: string; readonly objectiveIds: readonly string[]; readonly reason: string }[];
}): WeekAllocationCompositionInput {
  return {
    weeklyIntent: input.intent,
    planningHorizon: input.horizon,
    orderedTrainingOpportunities: [...input.horizon.opportunities].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id)),
    currentCompletionState: Object.fromEntries(input.horizon.opportunities.map((entry) => [entry.id, entry.completionStatus])),
    previousWeekStructureEvidence: input.continuity ?? EMPTY_WEEK_CONTINUITY,
    allocationPolicy: NON_PRODUCTION_WEEKLY_POLICY,
    recoverySpacingRequirements: input.recovery ?? [],
    precomputedFeasibilityResults: buildPrecomputedFeasibility({
      intent: input.intent,
      horizon: input.horizon,
      explicitlyInfeasible: input.explicitlyInfeasible,
    }),
    evaluationAsOf: WEEK_DESIGN_AS_OF,
    deterministicSearchPolicy: {
      policyId: "week-design-exhaustive-search",
      mode: "exhaustive_design_lab",
      fixedSeed: WEEK_DESIGN_SEED,
      status: "NON_PRODUCTION_POLICY_FIXTURE",
    },
  };
}

export type FixedSplitBaseline = "generic_full_body" | "upper_lower" | "push_pull_legs" | "greedy_first_available";

export interface FixedSplitBaselineResult {
  readonly baseline: FixedSplitBaseline;
  readonly assignments: ObjectiveOpportunityAssignments;
  readonly failureCodes: readonly string[];
}

function lowerTarget(objective: WeeklyDevelopmentObjective): boolean {
  return objective.selectionTarget.targetMovementRoles.some((role) => ["squat", "knee_dominant", "hinge", "single_leg"].includes(role)) ||
    objective.selectionTarget.targetMuscles.some((muscle) => ["quads", "hamstrings", "glutes", "calves"].includes(muscle));
}

function pushTarget(objective: WeeklyDevelopmentObjective): boolean {
  return objective.selectionTarget.targetMovementRoles.some((role) => ["horizontal_push", "vertical_push"].includes(role)) ||
    objective.selectionTarget.targetActionFunctions.includes("elbow_extension");
}

function pullTarget(objective: WeeklyDevelopmentObjective): boolean {
  return objective.selectionTarget.targetMovementRoles.some((role) => ["horizontal_pull", "vertical_pull"].includes(role)) ||
    objective.selectionTarget.targetActionFunctions.includes("elbow_flexion");
}

export function runFixedSplitBaseline(
  baseline: FixedSplitBaseline,
  intent: WeeklyIntent,
  horizon: WeekPlanningHorizon,
): FixedSplitBaselineResult {
  const opportunities = horizon.opportunities.filter((entry) => entry.availabilityStatus === "available" && entry.completionStatus === "not_started")
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
  const assignments: Record<string, readonly string[]> = {};
  for (const objective of intent.objectives) {
    if (baseline === "generic_full_body") assignments[objective.id] = opportunities.map((entry) => entry.id);
    if (baseline === "greedy_first_available") assignments[objective.id] = opportunities[0] ? [opportunities[0].id] : [];
    if (baseline === "upper_lower") {
      assignments[objective.id] = opportunities.filter((_, index) => lowerTarget(objective) ? index % 2 === 1 : index % 2 === 0)
        .slice(0, objective.frequencyIntent?.targetAllocatedSessions ?? 0).map((entry) => entry.id);
    }
    if (baseline === "push_pull_legs") {
      const lane = lowerTarget(objective) ? 2 : pushTarget(objective) ? 0 : pullTarget(objective) ? 1 : 0;
      assignments[objective.id] = opportunities.filter((_, index) => index % 3 === lane)
        .slice(0, objective.frequencyIntent?.targetAllocatedSessions ?? 0).map((entry) => entry.id);
    }
  }
  const countsByOpportunity = opportunities.map((entry) => objectiveIdsForOpportunity(assignments, entry.id).length);
  const failureCodes = unique([
    ...(intent.objectives.some((objective) => (assignments[objective.id]?.length ?? 0) < (objective.frequencyIntent?.minimumAllocatedSessions ?? 0))
      ? ["required_frequency_missed"] : []),
    ...(baseline === "generic_full_body" && intent.objectives.some((objective) => objective.priority === "optional")
      ? ["optional_objective_repeated_without_unique_value"] : []),
    ...(baseline === "generic_full_body" && intent.assessmentPriorityReferences.length > 0
      ? ["assessment_repeated_every_opportunity"] : []),
    ...(countsByOpportunity.some((count) => count === 0) && baseline !== "greedy_first_available"
      ? ["template_lane_unused_despite_label"] : []),
    ...(countsByOpportunity[0] > 3 ? ["first_or_every_opportunity_overloaded"] : []),
    ...(opportunities.some((entry) => entry.expectedEquipment.kind === "unknown") ? ["equipment_context_ignored"] : []),
    ...(baseline === "greedy_first_available" && opportunities.length > 1 ? ["recovery_and_distribution_ignored"] : []),
    ...(["upper_lower", "push_pull_legs"].includes(baseline) ? ["split_label_caused_allocation"] : []),
  ]);
  return { baseline, assignments, failureCodes };
}

export interface FixedSplitFailureMatrixRow {
  readonly scenarioId: string;
  readonly baseline: FixedSplitBaseline;
  readonly failureCodes: readonly string[];
  readonly reviewedAllocationStatus: WeekAllocationPlan["status"];
}

export function buildFixedSplitFailureMatrix(scenarios: readonly ControlledWeekScenarioResult[]): readonly FixedSplitFailureMatrixRow[] {
  return scenarios.filter((entry) => entry.intent.weeklyIntent !== null).flatMap((entry) =>
    (["generic_full_body", "upper_lower", "push_pull_legs", "greedy_first_available"] as const).map((baseline) => {
      const result = runFixedSplitBaseline(baseline, entry.intent.weeklyIntent!, entry.horizon);
      return { scenarioId: entry.id, baseline, failureCodes: result.failureCodes, reviewedAllocationStatus: entry.plan?.status ?? "requires_policy" };
    }));
}

function movementPriority(input: {
  readonly id: string;
  readonly role: WeeklySelectionTarget["targetMovementRoles"][number];
  readonly muscles: WeeklySelectionTarget["targetMuscles"];
  readonly priority?: ExplicitWeeklyPriority["priority"];
  readonly order?: number;
  readonly frequency?: WeeklyFrequencyIntent;
}): ExplicitWeeklyPriority {
  const regions = input.role === "squat" || input.role === "knee_dominant" ? ["knee", "hip"] as const
    : input.role === "hinge" ? ["hip", "lumbar_spine"] as const
      : input.role === "horizontal_push" || input.role === "vertical_push" ? ["shoulder"] as const
        : ["shoulder", "thoracic_spine"] as const;
  return weeklyPriority({
    id: input.id,
    purpose: "movement_development",
    priority: input.priority ?? "required",
    priorityOrder: input.order ?? 0,
    frequencyIntent: input.frequency ?? frequencyIntent(),
    target: weeklyTarget({ targetMovementRoles: [input.role], targetMuscles: input.muscles, targetBodyRegions: regions }),
  });
}

function directPriority(input: {
  readonly id: string;
  readonly action: WeeklySelectionTarget["targetActionFunctions"][number];
  readonly muscle: WeeklySelectionTarget["targetMuscles"][number];
  readonly priority?: ExplicitWeeklyPriority["priority"];
  readonly order?: number;
}): ExplicitWeeklyPriority {
  return weeklyPriority({
    id: input.id,
    purpose: "direct_action_development",
    priority: input.priority ?? "preferred",
    priorityOrder: input.order ?? 0,
    target: weeklyTarget({ targetMovementRoles: [], targetActionFunctions: [input.action], targetMuscles: [input.muscle],
      targetBodyRegions: input.muscle === "calves" ? ["ankle"] : ["elbow"] }),
  });
}

const PUSH_PRIORITY = movementPriority({ id: "push", role: "horizontal_push", muscles: ["chest"], order: 0 });
const PULL_PRIORITY = movementPriority({ id: "pull", role: "horizontal_pull", muscles: ["mid_back", "lats"], order: 1 });
const SQUAT_PRIORITY = movementPriority({ id: "squat", role: "squat", muscles: ["quads", "glutes"], order: 2 });
const HINGE_PRIORITY = movementPriority({ id: "hinge", role: "hinge", muscles: ["hamstrings", "glutes"], order: 3 });

function opportunitySeries(input: {
  readonly count: number;
  readonly capacities?: readonly StructuralCapacityMode[];
  readonly equipment?: readonly (EquipmentCapabilities | "unknown")[];
  readonly missedFirst?: boolean;
}): readonly WeekTrainingOpportunity[] {
  return Array.from({ length: input.count }, (_, index) => weekOpportunity({
    id: `opportunity-${index + 1}`,
    order: index,
    capacity: input.capacities?.[index] ?? "standard",
    minutes: input.capacities?.[index] === "condensed" ? 25 : 50,
    ...(input.equipment?.[index] === "unknown" ? {} : { equipment: input.equipment?.[index] ?? BASE_REQUEST.equipment }),
    ...(input.missedFirst && index === 0 ? { availabilityStatus: "cancelled" as const, completionStatus: "missed" as const } : {}),
  }));
}

function spacingRequirement(input: {
  readonly id: string;
  readonly objectiveIds: readonly string[];
  readonly separation?: number;
  readonly roles?: readonly WeeklySelectionTarget["targetMovementRoles"][number][];
  readonly muscles?: readonly WeeklySelectionTarget["targetMuscles"][number][];
  readonly stressTags?: readonly WeeklyRecoverySpacingRequirement["stressTags"][number][];
}): WeeklyRecoverySpacingRequirement {
  return {
    id: input.id,
    weeklyObjectiveIds: input.objectiveIds,
    movementRoles: input.roles ?? [],
    muscles: input.muscles ?? [],
    stressTags: input.stressTags ?? [],
    capacityLanes: [],
    spacingBasis: { kind: "ordered_opportunity_gap", minimumGap: input.separation ?? 2 },
    required: true,
    policySourceRef: "NON_PRODUCTION_POLICY_FIXTURE:spacing",
    provenance: fixtureProvenance(`${input.id}:spacing`, "planned_allocation"),
    unresolvedPrescriptionDependency: true,
  };
}

export type ControlledWeekScenarioExpectation =
  | "allocation_designed"
  | "allocation_infeasible"
  | "blocked_by_training_readiness"
  | "current_week_availability_required";

export interface ControlledWeekScenarioDefinition {
  readonly id: string;
  readonly title: string;
  readonly intentInput: WeeklyIntentPlannerInput;
  readonly horizon: WeekPlanningHorizon;
  readonly recovery: readonly WeeklyRecoverySpacingRequirement[];
  readonly continuity: WeekStructureContinuityEvidence;
  readonly expectation: ControlledWeekScenarioExpectation;
}

export interface ControlledWeekScenarioResult {
  readonly id: string;
  readonly title: string;
  readonly horizon: WeekPlanningHorizon;
  readonly intent: WeeklyIntentPlanningResult;
  readonly plan: WeekAllocationPlan | null;
  readonly materializations: readonly SessionAllocationMaterializationResult[];
  readonly downstreamOracleResults: readonly PrecomputedSessionFeasibilityResult[];
  readonly expectation: ControlledWeekScenarioExpectation;
}

function scenario(input: {
  readonly id: string;
  readonly title: string;
  readonly goal?: WeeklyIntentPlannerInput["explicitOutcomeGoal"];
  readonly priorities: readonly ExplicitWeeklyPriority[];
  readonly opportunities: readonly WeekTrainingOpportunity[];
  readonly recovery?: readonly WeeklyRecoverySpacingRequirement[];
  readonly continuity?: WeekStructureContinuityEvidence;
  readonly pain?: WeeklyIntentPlannerInput["painAndInjury"];
  readonly assessment?: WeeklyIntentPlannerInput["assessment"];
  readonly safety?: TrainingSafetyState;
  readonly expectation?: ControlledWeekScenarioExpectation;
}): ControlledWeekScenarioDefinition {
  const horizon = weekHorizon({ id: `${input.id}:horizon`, opportunities: input.opportunities });
  return {
    id: input.id,
    title: input.title,
    horizon,
    intentInput: weeklyIntentInput({
      outcomeGoal: input.goal,
      priorities: input.priorities,
      horizon,
      pain: input.pain,
      assessment: input.assessment,
      safety: input.safety,
    }),
    recovery: input.recovery ?? [],
    continuity: input.continuity ?? EMPTY_WEEK_CONTINUITY,
    expectation: input.expectation ?? "allocation_designed",
  };
}

function sensitivity(region: "shoulder" | "lumbar_spine" | "knee" | "wrist") {
  return {
    ...NO_PAIN_OR_INJURY,
    historicalSensitivities: [{
      kind: "historical_sensitivity" as const,
      id: `${region}:sensitivity`,
      region,
      stressTags: region === "shoulder" ? ["horizontal_pressing" as const]
        : region === "lumbar_spine" ? ["loaded_hinge" as const]
          : region === "knee" ? ["loaded_knee_flexion" as const] : ["grip_loading" as const],
      preferredModification: "monitor" as const,
      description: "Trace-only sensitivity fixture.",
    }],
  };
}

export function buildControlledWeekScenarioDefinitions(): readonly ControlledWeekScenarioDefinition[] {
  const two = opportunitySeries({ count: 2 });
  const three = opportunitySeries({ count: 3 });
  const four = opportunitySeries({ count: 4 });
  const calf = directPriority({ id: "calf", action: "ankle_plantar_flexion", muscle: "calves", order: 0 });
  const assessment = weeklyPriority({ id: "scapular-assessment", purpose: "assessment_priority_development", priority: "preferred", priorityOrder: 0,
    target: weeklyTarget({ targetMovementRoles: ["scapular_control"], targetActionFunctions: ["scapular_retraction"],
      targetMuscles: ["serratus"], muscleRequirement: "any_meaningful_contributor", targetBodyRegions: ["shoulder"] }),
    sourceEvidence: [{ sourceKind: "assessment_with_reviewed_policy", sourceId: "assessment-policy-allocation",
      evidenceRefs: ["high-confidence-primary-scapular-cluster", "NON_PRODUCTION_POLICY_FIXTURE"],
      provenance: fixtureProvenance("assessment-weekly-allocation", "planned_allocation") }] });
  const stable: WeekStructureContinuityEvidence = {
    ...EMPTY_WEEK_CONTINUITY,
    previousWeeklyObjectiveIds: ["weekly-objective:push", "weekly-objective:pull"],
    previousSessionResponsibilitySignatures: ["weekly-objective:push@opportunity-1", "weekly-objective:pull@opportunity-3"],
    productiveAllocationRelationships: [
      { objectiveId: "weekly-objective:push", responsibilitySignature: "weekly-objective:push@opportunity-1", sourceEvidenceRefs: ["prior-push-productive"] },
      { objectiveId: "weekly-objective:pull", responsibilitySignature: "weekly-objective:pull@opportunity-3", sourceEvidenceRefs: ["prior-pull-productive"] },
    ],
    maintenanceReasonRefs: ["productive_prior_responsibilities"],
  };
  const safety: TrainingSafetyState = { signals: [{
    signalId: "global-week-safety-block",
    requestedReviewLevel: "review_required_before_ordinary_training",
    authority: { source: "upstream_safety_system", sourceRef: "week-safety", evidenceBasis: ["Explicit design fixture."],
      reportedBy: "fixture", reportedAt: WEEK_DESIGN_AS_OF },
    resolution: { state: "unresolved" },
    notes: [],
  }] };
  const missed = opportunitySeries({ count: 3, missedFirst: true });
  const missedContinuity: WeekStructureContinuityEvidence = {
    ...EMPTY_WEEK_CONTINUITY,
    missedOpportunityIds: ["opportunity-1"],
    changeReasonRefs: ["explicit_missed_opportunity_reallocation"],
  };
  return [
    scenario({ id: "two-day-strength", title: "Two-day strength week", goal: "strength", priorities: [PUSH_PRIORITY, HINGE_PRIORITY], opportunities: two,
      recovery: [spacingRequirement({ id: "two-day-distinct", objectiveIds: ["weekly-objective:push", "weekly-objective:hinge"], separation: 1 })] }),
    scenario({ id: "three-day-general-fitness", title: "Three-day general-fitness week", goal: "general_fitness",
      priorities: [PUSH_PRIORITY, PULL_PRIORITY, SQUAT_PRIORITY], opportunities: three }),
    scenario({ id: "three-day-hypertrophy", title: "Three-day hypertrophy week", goal: "hypertrophy",
      priorities: [PUSH_PRIORITY, PULL_PRIORITY, directPriority({ id: "biceps", action: "elbow_flexion", muscle: "biceps" })], opportunities: three }),
    scenario({ id: "four-day-hypertrophy", title: "Four-day hypertrophy week", goal: "hypertrophy",
      priorities: [PUSH_PRIORITY, PULL_PRIORITY, SQUAT_PRIORITY, calf], opportunities: four }),
    scenario({ id: "four-day-strength", title: "Four-day strength week", goal: "strength",
      priorities: [PUSH_PRIORITY, PULL_PRIORITY, SQUAT_PRIORITY, HINGE_PRIORITY], opportunities: four }),
    scenario({ id: "mixed-equipment", title: "Mixed-equipment week", priorities: [PUSH_PRIORITY, PULL_PRIORITY],
      opportunities: opportunitySeries({ count: 3, equipment: [BASE_REQUEST.equipment, BODYWEIGHT_EQUIPMENT, BASE_REQUEST.equipment] }) }),
    scenario({ id: "travel-week", title: "Travel week", priorities: [PUSH_PRIORITY, PULL_PRIORITY, SQUAT_PRIORITY],
      opportunities: opportunitySeries({ count: 2, capacities: ["condensed", "standard"], equipment: [BODYWEIGHT_EQUIPMENT, BASE_REQUEST.equipment] }) }),
    scenario({ id: "consecutive-days", title: "Consecutive-day availability", priorities: [PUSH_PRIORITY, PULL_PRIORITY], opportunities: three,
      recovery: [spacingRequirement({ id: "push-spacing", objectiveIds: ["weekly-objective:push"], roles: ["horizontal_push"] })] }),
    scenario({ id: "low-back-sensitive", title: "Low-back-sensitive week", priorities: [HINGE_PRIORITY, PUSH_PRIORITY], opportunities: three,
      pain: sensitivity("lumbar_spine"), recovery: [spacingRequirement({ id: "hinge-spacing", objectiveIds: ["weekly-objective:hinge"], roles: ["hinge"], stressTags: ["loaded_hinge"] })] }),
    scenario({ id: "shoulder-sensitive", title: "Shoulder-sensitive week", priorities: [PUSH_PRIORITY, PULL_PRIORITY], opportunities: three,
      pain: sensitivity("shoulder"), recovery: [spacingRequirement({ id: "press-spacing", objectiveIds: ["weekly-objective:push"], roles: ["horizontal_push"], stressTags: ["horizontal_pressing"] })] }),
    scenario({ id: "knee-sensitive", title: "Knee-sensitive week", priorities: [SQUAT_PRIORITY, PULL_PRIORITY], opportunities: three,
      pain: sensitivity("knee") }),
    scenario({ id: "grip-sensitive", title: "Grip-sensitive week", priorities: [PULL_PRIORITY, PUSH_PRIORITY,
      weeklyPriority({ id: "carry", purpose: "capacity_development", priority: "preferred", priorityOrder: 0,
        target: weeklyTarget({ targetMovementRoles: ["carry"], targetMuscles: ["trunk"], muscleRequirement: "any_meaningful_contributor",
          targetBodyRegions: ["shoulder", "wrist", "lumbar_spine"] }) })], opportunities: three,
      pain: sensitivity("wrist"), recovery: [spacingRequirement({ id: "grip-spacing", objectiveIds: ["weekly-objective:pull", "weekly-objective:carry"], stressTags: ["grip_loading"] })] }),
    scenario({ id: "assessment-priority", title: "Assessment-priority week", priorities: [PULL_PRIORITY, assessment], opportunities: three,
      assessment: { signals: [{ id: "high-confidence-primary-scapular-cluster", type: "control_finding", source: "movement_screen", confidence: "high",
        priority: "primary", region: "shoulder", movementRole: "scapular_control", actionFunctions: ["scapular_retraction"], description: "Structured fixture." }], historicalWeaknesses: [] } }),
    scenario({ id: "direct-calf", title: "Direct-calf priority week", priorities: [SQUAT_PRIORITY, calf], opportunities: three }),
    scenario({ id: "productive-stable", title: "Productive stable week", priorities: [PUSH_PRIORITY, PULL_PRIORITY], opportunities: three, continuity: stable }),
    scenario({ id: "missed-reallocation", title: "Missed-session reallocation", priorities: [PUSH_PRIORITY, PULL_PRIORITY], opportunities: missed,
      continuity: missedContinuity }),
    scenario({ id: "two-opportunity-constrained", title: "Two-opportunity constrained week",
      priorities: [PUSH_PRIORITY, PULL_PRIORITY, weeklyPriority({ ...calf, id: "optional-calf", priority: "optional", priorityOrder: 0 })],
      opportunities: opportunitySeries({ count: 2, capacities: ["condensed", "condensed"] }) }),
    scenario({ id: "global-safety-block", title: "Global safety block", priorities: [PUSH_PRIORITY], opportunities: three, safety,
      expectation: "blocked_by_training_readiness" }),
    scenario({ id: "no-current-availability", title: "No current-week availability", priorities: [PUSH_PRIORITY], opportunities: [],
      expectation: "current_week_availability_required" }),
  ];
}

export function runControlledWeekScenarios(): readonly ControlledWeekScenarioResult[] {
  return buildControlledWeekScenarioDefinitions().map((definition) => {
    const intent = designWeeklyIntent(definition.intentInput);
    if (!intent.weeklyIntent) {
      return { id: definition.id, title: definition.title, horizon: definition.horizon, intent, plan: null,
        materializations: [], downstreamOracleResults: [], expectation: definition.expectation };
    }
    const plan = designWeekAllocation(allocationInput({ intent: intent.weeklyIntent, horizon: definition.horizon,
      recovery: definition.recovery, continuity: definition.continuity }));
    const materializations = plan.reservations.map((reservation) => {
      const opportunity = definition.horizon.opportunities.find((entry) => entry.id === reservation.opportunityId)!;
      const capabilities = opportunity.expectedEquipment.kind === "capability_snapshot"
        ? opportunity.expectedEquipment.capabilities : BASE_REQUEST.equipment;
      return materializeReservationDesign({
        reservation,
        actualCurrentAvailability: {
          availableMinutes: opportunity.expectedAvailability.availableMinutes ?? 45,
          structuralCapacity: opportunity.expectedAvailability.structuralCapacity,
          provenance: "explicit_today",
          sourceRef: `${opportunity.id}:actual-availability`,
        },
        actualCurrentEquipment: { capabilities, provenance: "explicit_today", sourceRef: `${opportunity.id}:actual-equipment` },
        actualEvaluationTime: WEEK_DESIGN_AS_OF,
        actualSafetyState: NO_TRAINING_SAFETY_SIGNALS,
        actualUnresolvedContext: [],
        explicitProductUserUpdateRefs: ["controlled-week-scenario"],
      });
    });
    const downstreamOracleResults = plan.reservations.slice(0, 1).map((reservation) => runProductionSessionFeasibilityOracle({ reservation }));
    return { id: definition.id, title: definition.title, horizon: definition.horizon, intent, plan, materializations,
      downstreamOracleResults, expectation: definition.expectation };
  });
}

export type WeekCohortClassification =
  | "MATERIAL_WEEK_INTENT_DIFFERENCE"
  | "MATERIAL_ALLOCATION_DIFFERENCE"
  | "SAME_WEEK_INTENT_DIFFERENT_SESSION_MATERIALIZATION"
  | "SAME_RESPONSIBILITY_DIFFERENT_SESSION_SKELETON"
  | "JUSTIFIED_CONVERGENCE"
  | "REQUIRES_WEEK_POLICY"
  | "REQUIRES_CURRENT_WEEK_AVAILABILITY"
  | "REQUIRES_WEEK_REALLOCATION"
  | "WRONG_LAYER_EFFECT"
  | "UNRESPONSIVE_TO_MATERIAL_INPUT"
  | "UNSUPPORTED_CONTEXT_REQUIRES_TYPED_CONTRACT";

export interface FixedShellWeekCohortRow {
  readonly id: string;
  readonly classification: WeekCohortClassification;
  readonly intent: WeeklyIntentPlanningResult;
  readonly plan: WeekAllocationPlan | null;
  readonly materializationStatus: SessionAllocationMaterializationResult["status"] | null;
  readonly downstreamStatus: SessionFeasibilityOracleStatus | null;
}

function highAssessmentPriority(): ExplicitWeeklyPriority {
  return weeklyPriority({
    id: "weekly-scapular-priority",
    purpose: "assessment_priority_development",
    priority: "preferred",
    priorityOrder: 0,
    target: weeklyTarget({
      targetMovementRoles: ["scapular_control"],
      targetActionFunctions: ["scapular_retraction"],
      targetMuscles: ["serratus"],
      muscleRequirement: "any_meaningful_contributor",
      targetBodyRegions: ["shoulder"],
    }),
    sourceEvidence: [{
      sourceKind: "assessment_with_reviewed_policy",
      sourceId: "weekly-assessment-owner-allocation",
      evidenceRefs: ["high-confidence-assessment", "NON_PRODUCTION_POLICY_FIXTURE"],
      provenance: fixtureProvenance("weekly-assessment-owner-allocation", "planned_allocation"),
    }],
  });
}

function externalLoad(unresolved = true): ExternalTrainingLoadEvent {
  return {
    id: "external-sport-load",
    kind: "sport_practice",
    opportunityProximityRefs: ["opportunity-2"],
    movementRoles: ["carry"],
    bodyRegions: ["general"],
    stressTags: ["loaded_gait"],
    expectedOrObserved: "expected",
    provenance: fixtureProvenance("external-sport-load"),
    reviewedReceiverState: unresolved ? "unresolved_context" : "reviewed_policy_available",
  };
}

function runCohortCase(input: {
  readonly id: string;
  readonly classification: WeekCohortClassification;
  readonly goal?: WeeklyIntentPlannerInput["explicitOutcomeGoal"];
  readonly priorities?: readonly ExplicitWeeklyPriority[];
  readonly contextModes?: WeeklyIntentPlannerInput["programmingContextModes"];
  readonly pain?: WeeklyIntentPlannerInput["painAndInjury"];
  readonly horizon?: WeekPlanningHorizon;
  readonly continuity?: WeekStructureContinuityEvidence;
  readonly externalLoad?: readonly ExternalTrainingLoadEvent[];
  readonly actualEquipment?: CurrentSessionEquipment;
  readonly recovery?: readonly WeeklyRecoverySpacingRequirement[];
}): FixedShellWeekCohortRow {
  const horizon = input.horizon ?? weekHorizon({ id: `${input.id}:horizon` });
  const intent = designWeeklyIntent(weeklyIntentInput({
    outcomeGoal: input.goal,
    priorities: input.priorities ?? [PUSH_PRIORITY, PULL_PRIORITY],
    contextModes: input.contextModes,
    pain: input.pain,
    horizon,
    externalLoad: input.externalLoad,
  }));
  if (!intent.weeklyIntent) return { id: input.id, classification: input.classification, intent, plan: null,
    materializationStatus: null, downstreamStatus: null };
  const plan = designWeekAllocation(allocationInput({ intent: intent.weeklyIntent, horizon,
    continuity: input.continuity, recovery: input.recovery }));
  const reservation = plan.reservations[0];
  if (!reservation) return { id: input.id, classification: input.classification, intent, plan,
    materializationStatus: null, downstreamStatus: null };
  const opportunity = horizon.opportunities.find((entry) => entry.id === reservation.opportunityId)!;
  const expectedCapabilities = opportunity.expectedEquipment.kind === "capability_snapshot"
    ? opportunity.expectedEquipment.capabilities : BASE_REQUEST.equipment;
  const materialization = materializeReservationDesign({
    reservation,
    actualCurrentAvailability: {
      availableMinutes: opportunity.expectedAvailability.availableMinutes ?? 45,
      structuralCapacity: opportunity.expectedAvailability.structuralCapacity,
      provenance: "explicit_today",
      sourceRef: `${input.id}:actual-availability`,
    },
    actualCurrentEquipment: input.actualEquipment ?? {
      capabilities: expectedCapabilities,
      provenance: "explicit_today",
      sourceRef: `${input.id}:actual-equipment`,
    },
    actualEvaluationTime: WEEK_DESIGN_AS_OF,
    actualSafetyState: NO_TRAINING_SAFETY_SIGNALS,
    actualUnresolvedContext: [],
    explicitProductUserUpdateRefs: [input.id],
  });
  const downstream = materialization.status === "directive_materialized"
    ? runProductionSessionFeasibilityOracle({ reservation, equipment: materialization.plannerCurrentEquipment ?? undefined })
    : null;
  return { id: input.id, classification: input.classification, intent, plan,
    materializationStatus: materialization.status, downstreamStatus: downstream?.status ?? null };
}

export function buildFixedShellWeekCohort(): readonly FixedShellWeekCohortRow[] {
  const mixedHorizon = weekHorizon({ id: "mixed-current-equipment:horizon", opportunities: opportunitySeries({ count: 3,
    equipment: [BASE_REQUEST.equipment, BODYWEIGHT_EQUIPMENT, BASE_REQUEST.equipment] }) });
  const shortHorizon = weekHorizon({ id: "two-short:horizon", opportunities: opportunitySeries({ count: 2,
    capacities: ["condensed", "condensed"] }) });
  const missedHorizon = weekHorizon({ id: "missed:horizon", opportunities: opportunitySeries({ count: 3, missedFirst: true }) });
  const calf = directPriority({ id: "cohort-calf", action: "ankle_plantar_flexion", muscle: "calves" });
  const stable: WeekStructureContinuityEvidence = {
    ...EMPTY_WEEK_CONTINUITY,
    productiveAllocationRelationships: [{
      objectiveId: "weekly-objective:push",
      responsibilitySignature: "weekly-objective:push@opportunity-2",
      sourceEvidenceRefs: ["productive-prior-week"],
    }],
    maintenanceReasonRefs: ["productive-prior-week"],
  };
  return [
    runCohortCase({ id: "strength-goal", classification: "JUSTIFIED_CONVERGENCE", goal: "strength" }),
    runCohortCase({ id: "hypertrophy-goal", classification: "MATERIAL_WEEK_INTENT_DIFFERENCE", goal: "hypertrophy",
      priorities: [PUSH_PRIORITY, PULL_PRIORITY, directPriority({ id: "cohort-biceps", action: "elbow_flexion", muscle: "biceps" })] }),
    runCohortCase({ id: "general-fitness-goal", classification: "MATERIAL_WEEK_INTENT_DIFFERENCE", goal: "general_fitness",
      priorities: [PUSH_PRIORITY, PULL_PRIORITY, SQUAT_PRIORITY] }),
    runCohortCase({ id: "posture-goal", classification: "MATERIAL_WEEK_INTENT_DIFFERENCE", goal: "posture_and_movement_quality",
      priorities: [PULL_PRIORITY, highAssessmentPriority()] }),
    runCohortCase({ id: "pain-aware-strength", classification: "MATERIAL_WEEK_INTENT_DIFFERENCE", goal: "strength",
      contextModes: ["pain_aware_return"] }),
    runCohortCase({ id: "shoulder-sensitivity", classification: "MATERIAL_ALLOCATION_DIFFERENCE", pain: sensitivity("shoulder"),
      recovery: [spacingRequirement({ id: "cohort-press-spacing", objectiveIds: ["weekly-objective:push"], roles: ["horizontal_push"] })] }),
    runCohortCase({ id: "low-back-sensitivity", classification: "MATERIAL_ALLOCATION_DIFFERENCE", pain: sensitivity("lumbar_spine"),
      priorities: [HINGE_PRIORITY, PUSH_PRIORITY], recovery: [spacingRequirement({ id: "cohort-hinge-spacing", objectiveIds: ["weekly-objective:hinge"] })] }),
    runCohortCase({ id: "knee-sensitivity", classification: "JUSTIFIED_CONVERGENCE", pain: sensitivity("knee") }),
    runCohortCase({ id: "assessment-priority", classification: "MATERIAL_WEEK_INTENT_DIFFERENCE",
      priorities: [PULL_PRIORITY, highAssessmentPriority()] }),
    runCohortCase({ id: "direct-calf", classification: "MATERIAL_WEEK_INTENT_DIFFERENCE", priorities: [SQUAT_PRIORITY, calf] }),
    runCohortCase({ id: "productive-continuity", classification: "MATERIAL_ALLOCATION_DIFFERENCE", continuity: stable }),
    runCohortCase({ id: "adverse-response", classification: "JUSTIFIED_CONVERGENCE" }),
    runCohortCase({ id: "two-short-opportunities", classification: "MATERIAL_ALLOCATION_DIFFERENCE", horizon: shortHorizon,
      priorities: [PUSH_PRIORITY, PULL_PRIORITY, weeklyPriority({ ...calf, id: "short-optional-calf", priority: "optional" })] }),
    runCohortCase({ id: "mixed-current-equipment", classification: "MATERIAL_ALLOCATION_DIFFERENCE", horizon: mixedHorizon }),
    runCohortCase({ id: "missed-prior-opportunity", classification: "REQUIRES_WEEK_REALLOCATION", horizon: missedHorizon }),
    runCohortCase({ id: "travel-equipment-change", classification: "SAME_WEEK_INTENT_DIFFERENT_SESSION_MATERIALIZATION",
      actualEquipment: { capabilities: BODYWEIGHT_EQUIPMENT, provenance: "explicit_today", sourceRef: "travel-actual-home" } }),
    runCohortCase({ id: "high-external-sport-load", classification: "UNSUPPORTED_CONTEXT_REQUIRES_TYPED_CONTRACT",
      externalLoad: [externalLoad(true)] }),
    runCohortCase({ id: "irrelevant-pain", classification: "JUSTIFIED_CONVERGENCE", pain: sensitivity("wrist") }),
  ];
}

export function weeklyIntentSignature(result: WeeklyIntentPlanningResult): unknown {
  return {
    status: result.status,
    goal: result.weeklyIntent?.outcomeGoal,
    secondaryGoals: result.weeklyIntent?.orderedSecondaryGoals,
    contextModes: result.weeklyIntent?.programmingContextModes,
    objectives: result.weeklyIntent?.objectives.map((objective) => ({
      purpose: objective.purpose,
      priority: objective.priority,
      order: objective.priorityOrder,
      target: objective.selectionTarget,
      frequency: objective.frequencyIntent,
      doseState: objective.dosePolicyReference.state,
      policyState: objective.unresolvedPolicyState,
    })),
    unresolved: result.unresolvedContext.map((entry) => [entry.category, entry.proposedOwner, entry.resolutionState]),
  };
}

export function allocationSignature(plan: WeekAllocationPlan | null): unknown {
  return plan && {
    status: plan.status,
    reservations: plan.reservations.map((reservation) => ({
      opportunityId: reservation.opportunityId,
      responsibilities: reservation.allocatedObjectives.map((objective) => [objective.weeklyObjectiveId, objective.purpose]),
      capacity: reservation.expectedStructuralCapacity,
      equipment: reservation.expectedEquipment.kind,
    })),
    satisfaction: plan.objectiveSatisfactionStates,
    recovery: plan.recoverySpacingTraces,
    reallocation: plan.reallocationState,
  };
}

export const REAL_USER_WEEK_VARIABLES = [
  ["actual current-week days", "Product Adapter"],
  ["variable minutes by day", "Product Adapter"],
  ["variable equipment by day", "Product Adapter"],
  ["shift work", "Week Allocation Composer"],
  ["travel", "Product Adapter"],
  ["holidays", "Product Adapter"],
  ["missed sessions", "Week Allocation Composer"],
  ["sport practice", "Requires Future Typed Contract"],
  ["running/cardio", "Requires Future Typed Contract"],
  ["manual occupation", "Requires Future Typed Contract"],
  ["classes", "Requires Future Typed Contract"],
  ["competition/event date", "Requires Future Typed Contract"],
  ["current pain", "Session Materializer"],
  ["persistent restrictions", "Safety/Clinical"],
  ["temporary symptoms", "Session Materializer"],
  ["illness", "Safety/Clinical"],
  ["poor sleep", "Requires Future Typed Contract"],
  ["accessibility", "Requires Future Typed Contract"],
  ["training partner", "Prescription"],
  ["crowded gym", "Product Adapter"],
  ["childcare/schedule uncertainty", "Product Adapter"],
  ["preferred rest days", "Intentionally No Direct Effect"],
  ["two-a-day availability", "Requires Future Typed Contract"],
  ["adherence trend", "Longitudinal Adaptation"],
  ["previous week fatigue", "Longitudinal Adaptation"],
  ["productive session structure", "Week Allocation Composer"],
  ["direct user priorities", "Weekly Intent Planner"],
  ["changing goals", "Weekly Intent Planner"],
  ["multiple goals", "Weekly Intent Planner"],
  ["phase transition", "Longitudinal Adaptation"],
  ["deload need", "Longitudinal Adaptation"],
  ["return after absence", "Longitudinal Adaptation"],
] as const;

export const REVIEWED_POLICY_QUESTIONS: readonly ReviewedPolicyQuestion[] = [
  { id: "weekly-set-targets", topic: "weekly_set_targets", status: "HUMAN_EXERCISE_SCIENCE_REVIEW_REQUIRED",
    requiredEvidence: ["goal/context scope", "dose definition", "individual response limits"], prohibitedAssumptions: ["hard sets inferred from allocation"] },
  { id: "frequency-superiority", topic: "frequency_superiority", status: "EXTERNAL_REFERENCE_PENDING",
    requiredEvidence: ["dose-equated evidence", "goal and experience scope"], prohibitedAssumptions: ["more sessions is always better"] },
  { id: "recovery-spacing", topic: "recovery_spacing", status: "HUMAN_EXERCISE_SCIENCE_REVIEW_REQUIRED",
    requiredEvidence: ["prescribed burden", "stress scope", "response evidence"], prohibitedAssumptions: ["universal recovery hours"] },
  { id: "direct-secondary-credit", topic: "direct_secondary_credit", status: "OWNER_DECISION_REQUIRED",
    requiredEvidence: ["canonical muscle relationships", "prescribed source exposure"], prohibitedAssumptions: ["fractional set equivalence"] },
  { id: "deload-schedule", topic: "deload_schedule", status: "CURRENTLY_UNSUPPORTED",
    requiredEvidence: ["longitudinal adherence", "performance", "recovery", "response"], prohibitedAssumptions: ["calendar-only deload"] },
  { id: "phase-volume-adjustment", topic: "phase_volume_adjustment", status: "OWNER_DECISION_REQUIRED",
    requiredEvidence: ["phase-specific policy and review"], prohibitedAssumptions: ["phase prose multiplier"] },
];

export const STANDALONE_RECOVERY_SESSION_VERDICT: StandaloneRecoverySessionDesignVerdict = "KEEP_DEFERRED";

export interface WeeklyPolicyConsequenceRow {
  readonly id: string;
  readonly fixtureA: string;
  readonly fixtureB: string;
  readonly observedConsequence: string;
  readonly productionDecision: "NOT_SELECTED";
}

export function runWeeklyPolicyConsequenceLab(): readonly WeeklyPolicyConsequenceRow[] {
  return [
    { id: "one-vs-two-opportunities", fixtureA: "minimum=1,target=1", fixtureB: "minimum=1,target=2",
      observedConsequence: "The second fixture reserves another developmental opportunity when feasible; neither proves more dose.", productionDecision: "NOT_SELECTED" },
    { id: "primary-vs-secondary-priority", fixtureA: "required push before preferred pull", fixtureB: "required pull before preferred push",
      observedConsequence: "Constrained allocation preserves the explicitly required responsibility first.", productionDecision: "NOT_SELECTED" },
    { id: "direct-vs-secondary-development", fixtureA: "explicit direct action objective", fixtureB: "meaningful-secondary feasibility only",
      observedConsequence: "Only the direct objective owns an allocation responsibility; secondary contribution awaits Prescription credit review.", productionDecision: "NOT_SELECTED" },
    { id: "recovery-spacing-contrast", fixtureA: "separation=1 opportunity", fixtureB: "separation=2 opportunities",
      observedConsequence: "The legal assignment set changes; exact recovery sufficiency remains unknown without dose.", productionDecision: "NOT_SELECTED" },
    { id: "strict-minimum-vs-flexible-target", fixtureA: "required minimum", fixtureB: "preferred target",
      observedConsequence: "Hard validity protects the minimum while target coverage remains later in the lexicographic vector.", productionDecision: "NOT_SELECTED" },
    { id: "soft-ceiling", fixtureA: "at target", fixtureB: "above soft maximum",
      observedConsequence: "The latter returns review state and duplication burden instead of a raw-count reward.", productionDecision: "NOT_SELECTED" },
    { id: "constrained-vs-expanded", fixtureA: "condensed opportunities", fixtureB: "expanded opportunities",
      observedConsequence: "The constrained fixture omits infeasible optional work while preserving required responsibilities.", productionDecision: "NOT_SELECTED" },
  ];
}

export function buildSearchArchitectureComparison() {
  return {
    recommendation: "strict_lexicographic_with_pareto_pruned_partial_states_and_exposed_bounds",
    strictLexicographic: {
      classification: "DESIGN_READY",
      reason: "Preserves hard validity and ordered responsibility without compensatory arithmetic.",
    },
    pareto: {
      classification: "DESIGN_READY",
      reason: "Suitable for pruning partial plans, but complete-plan policy still needs deterministic lexicographic choice.",
    },
    weightedContrast: {
      classification: "OWNER_POLICY_REQUIRED",
      reason: "Arbitrary weights permit lower-priority counts to compensate for required or safety facts.",
    },
    productionBounds: "UNAPPROVED",
  } as const;
}

export function runDeterministicWeekDesignFuzz(caseCount = 10_000) {
  let seed = WEEK_DESIGN_SEED;
  const next = (): number => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const failures: string[] = [];
  const signatures: string[] = [];
  for (let index = 0; index < caseCount; index += 1) {
    const opportunityCount = 1 + next() % 4;
    const capacities = Array.from({ length: opportunityCount }, () =>
      (["condensed", "standard", "expanded", "unknown"] as const)[next() % 4]);
    const horizon = weekHorizon({ id: `fuzz-${index}:horizon`, opportunities: opportunitySeries({ count: opportunityCount, capacities }) });
    const primary = movementPriority({ id: `fuzz-main-${index}`, role: next() % 2 === 0 ? "horizontal_push" : "horizontal_pull",
      muscles: next() % 2 === 0 ? ["chest"] : ["mid_back", "lats"], frequency: frequencyIntent({ target: 1 + next() % Math.min(2, opportunityCount) }) });
    const optional = weeklyPriority({ id: `fuzz-optional-${index}`, purpose: "direct_action_development", priority: "optional", priorityOrder: 0,
      target: weeklyTarget({ targetMovementRoles: [], targetActionFunctions: ["elbow_flexion"], targetMuscles: ["biceps"], targetBodyRegions: ["elbow"] }) });
    const priorities = next() % 2 === 0 ? [primary, optional] : [optional, primary];
    const input = weeklyIntentInput({ horizon, priorities });
    const left = designWeeklyIntent(input);
    const right = designWeeklyIntent(input);
    if (digest(weeklyIntentSignature(left)) !== digest(weeklyIntentSignature(right))) failures.push(`nondeterministic_intent:${index}`);
    if (left.status !== "weekly_intent_planned" || !left.weeklyIntent) failures.push(`unexpected_intent_status:${index}`);
    if (left.weeklyIntent?.objectives.some((objective) => "exerciseId" in objective)) failures.push(`exercise_id_leaked:${index}`);
    if (left.weeklyIntent && index % 10 === 0) {
      const planInput = allocationInput({ intent: left.weeklyIntent, horizon });
      const planA = designWeekAllocation(planInput);
      const planB = designWeekAllocation(planInput);
      if (digest(allocationSignature(planA)) !== digest(allocationSignature(planB))) failures.push(`nondeterministic_allocation:${index}`);
      if (planA.reservations.some((reservation) => reservation.allocatedObjectives.some((objective) => "exerciseId" in objective))) {
        failures.push(`exercise_id_in_reservation:${index}`);
      }
    }
    signatures.push(digest(weeklyIntentSignature(left)));
  }
  return { cases: caseCount, allocationCases: Math.ceil(caseCount / 10), failures, digest: digest(signatures), fixedSeed: WEEK_DESIGN_SEED };
}

export function buildWeekDesignFingerprintPayloads() {
  const scenarios = runControlledWeekScenarios();
  const cohort = buildFixedShellWeekCohort();
  const baselineIntent = designWeeklyIntent(weeklyIntentInput());
  const baselineHorizon = weekHorizon();
  const baselinePlan = baselineIntent.weeklyIntent
    ? designWeekAllocation(allocationInput({ intent: baselineIntent.weeklyIntent, horizon: baselineHorizon })) : null;
  const baselineReservation = baselinePlan?.reservations[0] ?? null;
  const baselineMaterialization = baselineReservation ? materializeReservationDesign({
    reservation: baselineReservation,
    actualCurrentAvailability: {
      availableMinutes: baselineReservation.expectedAvailability.availableMinutes ?? 45,
      structuralCapacity: baselineReservation.expectedStructuralCapacity,
      provenance: "explicit_today",
      sourceRef: "fingerprint-actual-availability",
    },
    actualCurrentEquipment: {
      capabilities: baselineReservation.expectedEquipment.kind === "capability_snapshot"
        ? baselineReservation.expectedEquipment.capabilities : BASE_REQUEST.equipment,
      provenance: "explicit_today",
      sourceRef: "fingerprint-actual-equipment",
    },
    actualEvaluationTime: WEEK_DESIGN_AS_OF,
    actualSafetyState: NO_TRAINING_SAFETY_SIGNALS,
    actualUnresolvedContext: [],
    explicitProductUserUpdateRefs: ["fingerprint-materialization"],
  }) : null;
  const fixedSplit = buildFixedSplitFailureMatrix(scenarios);
  const payloads = {
    weekOntologyAudit: {
      preDesignClassification: "WEEK_ONTOLOGY_FOUNDATION_GAP",
      truthStates: ["expected_future_fact", "actual_current_fact", "planned_allocation", "prescribed_dose", "completed_performance", "observed_response"],
      legacyDisposition: "LEGACY_COMPATIBILITY_ONLY",
    },
    factOwnership: [
      "weekly_intent_planner:objective_truth",
      "week_allocation_composer:reservation_distribution",
      "session_allocation_materializer:actual_context",
      "session_intent_planner:session_needs",
      "prescription:dose",
      "longitudinal_adaptation:future_target_change",
    ],
    contextCoverage: REAL_USER_WEEK_VARIABLES,
    weeklyIntentProposal: weeklyIntentSignature(baselineIntent),
    weeklyDevelopmentObjective: baselineIntent.weeklyIntent?.objectives[0],
    reviewedWeeklyProgrammingPolicy: NON_PRODUCTION_WEEKLY_POLICY,
    planningHorizon: baselineHorizon,
    trainingOpportunities: baselineHorizon.opportunities,
    reservation: baselineReservation,
    materialization: baselineMaterialization,
    allocationResult: allocationSignature(baselinePlan),
    ledgerBoundary: {
      allocation: "responsibility_and_opportunity_no_dose_credit",
      plannedPrescription: "one_source_exposure_and_prescribed_dose",
      completedResponse: "performance_adherence_symptoms_recovery_response",
    },
    recoverySpacingModel: spacingRequirement({ id: "fingerprint-spacing", objectiveIds: ["weekly-objective:weekly-pull"] }),
    reallocationPolicy: ["completed_history_immutable", "no_automatic_doubling", "required_before_lower_priority", "explicit_unresolved_if_impossible"],
    evaluationVector: baselinePlan?.wholeWeekEvaluation,
    searchComparison: buildSearchArchitectureComparison(),
    fixedSplitFailureMatrix: fixedSplit.map((entry) => [entry.scenarioId, entry.baseline, entry.failureCodes]),
    controlledWeekScenarios: scenarios.map((entry) => [entry.id, entry.intent.status, entry.plan?.status, entry.plan?.reservations.length,
      entry.downstreamOracleResults.map((result) => result.status)]),
    fixedShellPersonalization: cohort.map((entry) => [entry.id, entry.classification, weeklyIntentSignature(entry.intent), allocationSignature(entry.plan),
      entry.materializationStatus, entry.downstreamStatus]),
    sameExperienceEquipmentRegression: cohort.slice(0, 12).map((entry) => [entry.id, digest(weeklyIntentSignature(entry.intent)), digest(allocationSignature(entry.plan))]),
    realUserVariables: REAL_USER_WEEK_VARIABLES,
    policyConsequenceLab: runWeeklyPolicyConsequenceLab(),
    implementationReadiness: {
      classification: "WEEK_LAYER_DESIGN_READY_FOR_OWNER_POLICY_APPROVAL",
      ownerPolicyRequired: REVIEWED_POLICY_QUESTIONS.map((entry) => entry.id),
      productionImplementationAuthorized: false,
      recoverySessionVerdict: STANDALONE_RECOVERY_SESSION_VERDICT,
    },
  };
  return payloads;
}

export function computeWeekDesignFingerprints(): Readonly<Record<string, string>> {
  const individual = Object.fromEntries(Object.entries(buildWeekDesignFingerprintPayloads())
    .map(([key, value]) => [key, digest(value)]));
  return { ...individual, combinedWeekDesign: digest(individual) };
}

export const EXPECTED_WEEK_DESIGN_FINGERPRINTS: Readonly<Record<string, string>> = {
  weekOntologyAudit: "9b72a4a676f419938965031d100c63a7a603b05ae02abadbabe37064cbb19b4d",
  factOwnership: "c91607863c1afd2c830439913f79aa9e2da9872d673823c15bf38b18e72ded95",
  contextCoverage: "8cb401e6a70fa8a90d88b9e56e83a3e350c95805a1ed3f42d8bef38a4955bcdb",
  weeklyIntentProposal: "607efc4a20aeff42565142ad6bc7fd2f317fed6f8237a3840113e1ee1c32c2e0",
  weeklyDevelopmentObjective: "c7eb8840236e71493674359ff726e2df1f507eb7d59a1347930600e8dde706c4",
  reviewedWeeklyProgrammingPolicy: "e29e268d9d480d5c11c49766cf0e8489fef00fd8dd4d4797329f76cfb4b862b6",
  planningHorizon: "d782dc1d1877d18aa0defddf2ab2ada5ac239258df32a5a143d315d03f44a2b9",
  trainingOpportunities: "cc9ef6dda45d8c0a884907d5ae8500eb3fc5c1e9b0cbdebd9cc340e146d1c97b",
  reservation: "3d36d6ba36851cc036cee3fec14b118a3605fa86d292cb8d6b2863bc2f0e131a",
  materialization: "76abe73f18dc1501b9f9b3208d820d526d619ab57a26dab3e9d0c9d164044410",
  allocationResult: "162f66cbdb41ae57f3aa88ae4cd2981635c0f24c6df874b72e0e3135096322e0",
  ledgerBoundary: "4095f7d32e21cff5121193d74bae22e254177c8aff52b28b0cb79d3b0096e805",
  recoverySpacingModel: "dcfe21444996f8e9f643d3782b0d8b15c6512685f16173f6323e835429290280",
  reallocationPolicy: "b43f6e5f96af207178ceb2bf947d95e0899f5011f96e22893e56931c9edbee4b",
  evaluationVector: "7b9e26674d6d9da5a347202d5fdb32584a3d955c16ca9d50a2f2f7d21c2728b7",
  searchComparison: "67a40cc12b67c0c21bca8f57a51356b604606932d291dc3d5eb0b7b406dc0f59",
  fixedSplitFailureMatrix: "714806c6cda196744619e798288fd6a5e67142f072bf4220564a3c5023db17f1",
  controlledWeekScenarios: "e4ed5cf8f44974bff20001b3ccd5b90f61d8b54ddcf5a4582c9023af7c633662",
  fixedShellPersonalization: "76b64a2aa336e24453e0aebc75529e66d38270bce0208a76ea9da1b6630b6179",
  sameExperienceEquipmentRegression: "dc3a3edd88a9d17c23e9dcfa46ebd0c1f669bc95f6ef481b27aa60d7966c4d63",
  realUserVariables: "8cb401e6a70fa8a90d88b9e56e83a3e350c95805a1ed3f42d8bef38a4955bcdb",
  policyConsequenceLab: "cb2d45db82bc841137ae17d36e28aab00bea5ad5e932fcea54ca4adff8d668de",
  implementationReadiness: "1f83f306077122c75ee81547e85e6acdffda64d347fff470323a6a7c54bfd04c",
  combinedWeekDesign: "903d034e50b2c210ad7ffee011e267e4f4d7ff9b396d9735a49f276909137047",
};
