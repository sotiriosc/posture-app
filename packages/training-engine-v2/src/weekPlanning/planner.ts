import { buildTrainingReadinessTrace } from "../domain/trainingSafety";
import {
  canonicalize,
  deriveWeeklyIntentId,
  deriveWeeklyIntentRevisionId,
  explicitIsoTime,
  sameSemanticValue,
  stableId,
  uniqueSorted,
  validateProductionWeekPlanningSourceSnapshot,
  validateProductionWeeklyIntent,
} from "./canonical";
import {
  PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE,
  type ProductionExplicitWeeklyPriority,
  type ProductionWeeklyDevelopmentObjective,
  type ProductionWeeklyIntent,
  type ProductionWeeklyIntentPlannerInput,
  type ProductionWeeklyIntentPlanningResult,
  type ProductionWeeklyPriorityTrace,
} from "./contracts";
import { isConfirmedProductionTrainingOpportunity } from "./source";
import { resolveProductionWeekFrequency, resolveProductionWeekPolicy } from "./policy";

const PRIORITY_RANK = { required: 0, preferred: 1, optional: 2 } as const;

function targetKey(priority: ProductionExplicitWeeklyPriority): string {
  return JSON.stringify(canonicalize({
    family: priority.family,
    purpose: priority.purpose,
    target: priority.target,
    goalRelationships: [...priority.goalRelationships]
      .map((entry) => ({ goal: entry.goal, relationship: entry.relationship }))
      .sort((left, right) => `${left.goal}:${left.relationship}`.localeCompare(`${right.goal}:${right.relationship}`)),
    sourceOwners: uniqueSorted(priority.sourceEvidence.map((entry) => entry.sourceKind)),
    exactActionOwnership: priority.exactActionOwnership ?? null,
    uniqueMarginalValueRef: priority.uniqueMarginalValueRef ?? null,
  }));
}

function traceFor(objective: ProductionWeeklyDevelopmentObjective, ruleRef: string): ProductionWeeklyPriorityTrace {
  return Object.freeze({
    objectiveId: objective.objectiveId,
    sourcePriorityIds: objective.sourcePriorityIds,
    ruleRefs: Object.freeze([ruleRef]),
    evidenceRefs: uniqueSorted(objective.sourceEvidence.flatMap((entry) => entry.evidenceRefs)),
  });
}

function objectiveGroups(
  priorities: readonly ProductionExplicitWeeklyPriority[],
  policy: Parameters<typeof resolveProductionWeekFrequency>[0],
): { readonly objectives: readonly ProductionWeeklyDevelopmentObjective[];
  readonly included: readonly ProductionWeeklyPriorityTrace[]; readonly merged: readonly ProductionWeeklyPriorityTrace[];
  readonly reasons: readonly string[] } {
  const groups = new Map<string, ProductionExplicitWeeklyPriority[]>();
  for (const priority of priorities) groups.set(targetKey(priority), [...(groups.get(targetKey(priority)) ?? []), priority]);
  const reasons: string[] = [];
  const merged: ProductionWeeklyPriorityTrace[] = [];
  const objectives = [...groups.entries()].sort(([left], [right]) => left.localeCompare(right)).flatMap(([, entries]) => {
    const ordered = [...entries].sort((left, right) => PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority] ||
      left.priorityOrder - right.priorityOrder || left.priorityId.localeCompare(right.priorityId));
    const authority = ordered[0]!;
    const frequency = resolveProductionWeekFrequency(policy, authority.family, authority.priority);
    if (!frequency) {
      reasons.push(`UNSUPPORTED_WEEK_OBJECTIVE_SCOPE:${authority.family}:${authority.priority}`);
      return [];
    }
    if (authority.family === "direct" && authority.exactActionOwnership === undefined &&
        authority.target.muscleRequirement !== "primary_required") {
      reasons.push(`DIRECT_OBJECTIVE_OWNERSHIP_REQUIRED:${authority.priorityId}`);
      return [];
    }
    const sourcePriorityIds = uniqueSorted(ordered.map((entry) => entry.priorityId));
    const objectiveId = stableId("weekly-objective", {
      structuralKey: targetKey(authority), sourcePriorityIds,
    });
    const objective: ProductionWeeklyDevelopmentObjective = Object.freeze({
      objectiveId,
      family: authority.family,
      purpose: authority.purpose,
      target: Object.freeze({
        targetMovementRoles: Object.freeze([...authority.target.targetMovementRoles].sort()),
        targetActionFunctions: Object.freeze([...authority.target.targetActionFunctions].sort()),
        targetMuscles: Object.freeze([...authority.target.targetMuscles].sort()),
        muscleRequirement: authority.target.muscleRequirement,
        targetBodyRegions: Object.freeze([...authority.target.targetBodyRegions].sort()),
      }),
      priority: authority.priority,
      priorityOrder: Math.min(...ordered.map((entry) => entry.priorityOrder)),
      sourceEvidence: Object.freeze(ordered.flatMap((entry) => entry.sourceEvidence)
        .sort((left, right) => left.sourceId.localeCompare(right.sourceId))),
      sourcePriorityIds,
      goalRelationships: Object.freeze(ordered.flatMap((entry) => entry.goalRelationships)
        .sort((left, right) => `${left.goal}:${left.relationship}`.localeCompare(`${right.goal}:${right.relationship}`))),
      frequencyIntent: frequency,
      dosePolicyState: authority.purpose === "assessment_priority_development" ? "not_applicable" : "pending_prescription_policy",
      spacingRequirementRefs: Object.freeze([]),
      roleFlexibility: Object.freeze(authority.family === "direct" || authority.family === "muscle"
        ? ["secondary", "accessory"] as const : ["main", "secondary", "accessory"] as const),
      uniqueMarginalValueRef: authority.uniqueMarginalValueRef ?? null,
      policyState: "resolved_for_allocation",
      reasonCode: ordered.length > 1 ? "merged_structurally_equivalent_objective" :
        authority.purpose === "recovery_support" ? "explicit_recovery_support" : "explicit_supported_weekly_priority",
      provenance: Object.freeze({ owner: "weekly_intent_planner",
        sourceRefs: uniqueSorted(ordered.flatMap((entry) => entry.sourceEvidence.map((evidence) => evidence.sourceId))),
        ruleRefs: Object.freeze([frequency.sourceRef, "STRUCTURAL_OBJECTIVE_MERGE"]),
      }),
    });
    if (ordered.length > 1) merged.push(traceFor(objective, "STRUCTURAL_OBJECTIVE_MERGE"));
    return [objective];
  }).sort((left, right) => PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority] ||
    left.priorityOrder - right.priorityOrder || left.objectiveId.localeCompare(right.objectiveId));
  return Object.freeze({ objectives: Object.freeze(objectives),
    included: Object.freeze(objectives.map((objective) => traceFor(objective, "EXPLICIT_PRIORITY_TO_WEEKLY_OBJECTIVE"))),
    merged: Object.freeze(merged), reasons: uniqueSorted(reasons) });
}

function emptyResult(
  input: ProductionWeeklyIntentPlannerInput,
  status: ProductionWeeklyIntentPlanningResult["status"],
  reasons: readonly string[],
): ProductionWeeklyIntentPlanningResult {
  return Object.freeze({
    status,
    weeklyIntent: null,
    includedObjectiveTraces: Object.freeze([]),
    omittedPriorityTraces: Object.freeze([]),
    mergedObjectiveTraces: Object.freeze([]),
    policyFindings: uniqueSorted(reasons),
    ownershipFindings: Object.freeze(["PHASE_CONTEXT_ONLY", "PAIN_CREATES_NO_WEEKLY_OBJECTIVE"]),
    unresolvedContext: input.sourceSnapshot.unresolvedContext,
    trainingReadiness: buildTrainingReadinessTrace({ trainingSafety: input.trainingSafety,
      acuteSeverePain: input.painAndInjury.acuteSeverePain }),
    decisionTrace: Object.freeze([status, ...uniqueSorted(reasons), "NO_RESERVATION_CREATED"]),
    provenance: Object.freeze({ owner: "weekly_intent_planner", sourceRefs: Object.freeze([
      input.sourceSnapshot.sourceSnapshotRevisionId]), ruleRefs: Object.freeze([status]) }),
  });
}

export function planWeeklyIntent(input: ProductionWeeklyIntentPlannerInput): ProductionWeeklyIntentPlanningResult {
  if (!sameSemanticValue(input.plannerContract, PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE)) {
    return emptyResult(input, "unsupported_contract_version", ["UNSUPPORTED_PRODUCTION_WEEKLY_INTENT_PLANNER_VERSION"]);
  }
  const sourceReasons = validateProductionWeekPlanningSourceSnapshot(input.sourceSnapshot);
  if (sourceReasons.length > 0) return emptyResult(input, "invalid_source_snapshot", sourceReasons);
  if (!explicitIsoTime(input.evaluationTime) || input.evaluationTime !== input.sourceSnapshot.evaluationTime) {
    return emptyResult(input, "contradictory_week_input", ["EXPLICIT_EVALUATION_TIME_REQUIRED_AND_SOURCE_ALIGNED"]);
  }
  if (!input.explicitOutcomeGoal || !input.outcomeGoalLineageId.trim()) {
    return emptyResult(input, "weekly_goal_under_specified", ["EXPLICIT_OUTCOME_GOAL_LINEAGE_REQUIRED"]);
  }
  const readiness = buildTrainingReadinessTrace({ trainingSafety: input.trainingSafety,
    acuteSeverePain: input.painAndInjury.acuteSeverePain });
  if (!readiness.downstreamTrainingAllowed) {
    return emptyResult(input, "blocked_by_training_readiness", readiness.unresolvedSignalIds);
  }
  if (!input.sourceSnapshot.opportunities.some(isConfirmedProductionTrainingOpportunity)) {
    return emptyResult(input, "current_week_availability_required", ["CURRENT_WEEK_AVAILABILITY_REQUIRED"]);
  }
  const policyResolution = resolveProductionWeekPolicy(input.policy, input.policyRegistry);
  if (!policyResolution.policy) return emptyResult(input, "weekly_policy_required", [policyResolution.reasonCode]);
  const sourceBlocking = input.sourceSnapshot.unresolvedContext.filter((entry) => entry.blocksWeeklyIntent);
  const externalBlocking = input.externalLoadObservations.filter((entry) => entry.materiallyBlocksPlanning);
  if (sourceBlocking.length > 0 || externalBlocking.length > 0) {
    return emptyResult(input, "unsupported_context", uniqueSorted([
      ...sourceBlocking.map((entry) => entry.observationId),
      ...externalBlocking.map((entry) => `EXTERNAL_LOAD_RECEIVER_POLICY_REQUIRED:${entry.observationId}`),
    ]));
  }
  const priorityIds = input.explicitWeeklyPriorities.map((entry) => entry.priorityId);
  if (new Set(priorityIds).size !== priorityIds.length || input.explicitWeeklyPriorities.some((entry) =>
    !entry.priorityId.trim() || !Number.isInteger(entry.priorityOrder) || entry.priorityOrder < 0)) {
    return emptyResult(input, "contradictory_week_input", ["EXPLICIT_WEEKLY_PRIORITY_ID_OR_ORDER_INVALID"]);
  }
  if (input.explicitWeeklyPriorities.length === 0) {
    return emptyResult(input, "weekly_goal_under_specified", ["EXPLICIT_SUPPORTED_WEEKLY_RESPONSIBILITY_REQUIRED"]);
  }
  if (["general_fitness", "conditioning", "posture_and_movement_quality"].includes(input.explicitOutcomeGoal) &&
      input.explicitWeeklyPriorities.every((entry) => entry.family === "capacity")) {
    return emptyResult(input, "weekly_policy_required", [`UNSUPPORTED_PRIMARY_GOAL_POLICY_SCOPE:${input.explicitOutcomeGoal}`]);
  }
  const normalized = objectiveGroups(input.explicitWeeklyPriorities, policyResolution.policy);
  if (normalized.reasons.length > 0 || normalized.objectives.length === 0) {
    return emptyResult(input, "weekly_policy_required", normalized.reasons.length > 0 ? normalized.reasons :
      ["SUPPORTED_WEEKLY_OBJECTIVE_REQUIRED"]);
  }
  if (input.priorIntentRevision && (input.priorIntentRevision.intentAttemptId !== input.intentAttemptId ||
      input.priorIntentRevision.athleteId !== input.athlete.id ||
      input.priorIntentRevision.planningHorizonId !== input.sourceSnapshot.planningHorizonId)) {
    return emptyResult(input, "invalid_prior_revision_context", ["WEEKLY_INTENT_PRIOR_REVISION_LINEAGE_MISMATCH"]);
  }
  const intentId = deriveWeeklyIntentId({ athleteId: input.athlete.id,
    planningHorizonId: input.sourceSnapshot.planningHorizonId,
    outcomeGoalLineageId: input.outcomeGoalLineageId,
    policyReference: policyResolution.policy.reference,
    intentAttemptId: input.intentAttemptId });
  const base: Omit<ProductionWeeklyIntent, "intentRevisionId" | "provenance"> = {
    intentId,
    basedOnRevisionId: input.priorIntentRevision?.intentRevisionId ?? null,
    intentAttemptId: input.intentAttemptId,
    athleteId: input.athlete.id,
    planningHorizonId: input.sourceSnapshot.planningHorizonId,
    horizonRevisionId: input.sourceSnapshot.horizonRevisionId,
    sourceSnapshotRevisionId: input.sourceSnapshot.sourceSnapshotRevisionId,
    outcomeGoal: input.explicitOutcomeGoal,
    orderedSecondaryGoals: Object.freeze([...input.orderedSecondaryGoals]),
    programmingContextModes: Object.freeze([...input.programmingContextModes].sort()),
    phaseIntentRef: input.phaseIntent.id,
    objectives: normalized.objectives,
    policyReference: policyResolution.policy.reference,
    continuityEvidence: input.continuityEvidence,
    unresolvedContext: input.sourceSnapshot.unresolvedContext,
    evaluationTime: input.evaluationTime,
  };
  const weeklyIntent: ProductionWeeklyIntent = Object.freeze({
    ...base,
    intentRevisionId: deriveWeeklyIntentRevisionId(base),
    provenance: Object.freeze({ owner: "weekly_intent_planner",
      sourceRefs: uniqueSorted([input.sourceSnapshot.sourceSnapshotRevisionId,
        ...normalized.objectives.flatMap((entry) => entry.sourcePriorityIds)]),
      ruleRefs: Object.freeze([`${policyResolution.policy.reference.policyId}@${policyResolution.policy.reference.version}`,
        "NO_OPPORTUNITY_PLACEMENT", "PHASE_CONTEXT_ONLY", "PAIN_CONTEXT_ONLY"]),
    }),
  });
  const validationReasons = validateProductionWeeklyIntent(weeklyIntent);
  if (validationReasons.length > 0) return emptyResult(input, "contradictory_week_input", validationReasons);
  return Object.freeze({
    status: "weekly_intent_planned",
    weeklyIntent,
    includedObjectiveTraces: normalized.included,
    omittedPriorityTraces: Object.freeze([]),
    mergedObjectiveTraces: normalized.merged,
    policyFindings: Object.freeze([...policyResolution.policy.unsupportedScopes].map((scope) => `UNSUPPORTED_SCOPE:${scope}`)),
    ownershipFindings: Object.freeze(["PHASE_CONTEXT_ONLY", "PAIN_CREATES_NO_WEEKLY_OBJECTIVE",
      "OPPORTUNITY_PLACEMENT_DEFERRED_TO_WEEK_ALLOCATION_COMPOSER"]),
    unresolvedContext: input.sourceSnapshot.unresolvedContext,
    trainingReadiness: readiness,
    decisionTrace: Object.freeze(["EXPLICIT_SOURCE_SNAPSHOT", "EXPLICIT_WEEK_POLICY", "OBJECTIVES_NORMALIZED",
      "ONE_FINAL_INTENT_REVISION", "NO_RESERVATIONS_CREATED"]),
    provenance: weeklyIntent.provenance,
  });
}
