import {
  CONTROLLED_CANDIDATE_SCENARIOS,
  ANCHORED_BANDS_EQUIPMENT,
  BODYWEIGHT_EQUIPMENT,
  DUMBBELLS_AND_BENCH_EQUIPMENT,
  FULL_GYM_EQUIPMENT,
  MIXED_HOME_EQUIPMENT,
  NO_TRAINING_SAFETY_SIGNALS,
  PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE,
  PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_POLICY_V1,
  buildProductionWeekPlanningSourceSnapshot,
  canonicalWeekFingerprint,
  composeWeekAllocation,
  deriveWeekOpportunityId,
  deriveWeekOpportunityRevisionId,
  deriveReservationRevisionId,
  deriveWeekPlanningHorizonId,
  deriveWeekPlanRevisionId,
  planWeeklyIntent,
  type ProductionExplicitWeeklyPriority,
  type EquipmentCapabilities,
  type ProductionSessionAllocationMaterializationInput,
  type ProductionSessionFeasibilityOracle,
  type ProductionSessionFeasibilityOracleInput,
  type ProductionSessionFeasibilityStatus,
  type ProductionWeekAllocationComposerInput,
  type ProductionWeekAllocationPlan,
  type ProductionWeekPlanningBoundary,
  type ProductionWeekPlanningSourceSnapshot,
  type ProductionWeekSearchResourcePolicy,
  type ProductionWeekTrainingOpportunity,
  type ProductionWeeklyIntent,
  type ProductionWeeklyIntentPlannerInput,
  type ProductionWeeklySelectionTarget,
} from "../../src";

export const PRODUCTION_WEEK_TEST_TIME = "2026-08-15T10:00:00-04:00";
export const PRODUCTION_WEEK_DEFAULT_BOUNDARY = Object.freeze({
  kind: "explicit_date_range" as const,
  startDate: "2026-08-17",
  endDate: "2026-08-23",
});
export const PRODUCTION_WEEK_HORIZON_LINEAGE_ATTEMPT_ID = "production-week-test-lineage";
export const PRODUCTION_WEEK_DEFAULT_HORIZON_ID = deriveWeekPlanningHorizonId({
  athleteId: CONTROLLED_CANDIDATE_SCENARIOS.find((entry) => entry.id === "horizontal-pull-gym-neutral")!.request.athlete.id,
  boundary: PRODUCTION_WEEK_DEFAULT_BOUNDARY,
  lineageAttemptId: PRODUCTION_WEEK_HORIZON_LINEAGE_ATTEMPT_ID,
});
export const PRODUCTION_WEEK_BASE_REQUEST = CONTROLLED_CANDIDATE_SCENARIOS.find((entry) =>
  entry.id === "horizontal-pull-gym-neutral")!.request;

export const PRODUCTION_WEEK_HOLDOUT_EQUIPMENT = Object.freeze({
  full_gym: FULL_GYM_EQUIPMENT,
  dumbbells: DUMBBELLS_AND_BENCH_EQUIPMENT,
  bands: ANCHORED_BANDS_EQUIPMENT,
  bodyweight: BODYWEIGHT_EQUIPMENT,
  mixed: MIXED_HOME_EQUIPMENT,
} satisfies Readonly<Record<string, EquipmentCapabilities>>);

export const PRODUCTION_WEEK_TEST_PROVENANCE = Object.freeze({
  owner: "product_horizon_source" as const,
  sourceRefs: Object.freeze(["explicit-production-week-test-source"]),
  ruleRefs: Object.freeze(["CALLER_SUPPLIED_SOURCE_TRUTH"]),
});

export function productionOpportunity(input: {
  readonly index: number;
  readonly status?: ProductionWeekTrainingOpportunity["availabilityStatus"];
  readonly completion?: ProductionWeekTrainingOpportunity["completionStatus"];
  readonly confirmation?: ProductionWeekTrainingOpportunity["confirmationState"];
  readonly minutes?: number | null;
  readonly capacity?: ProductionWeekTrainingOpportunity["expectedStructuralCapacity"];
  readonly equipmentKind?: "snapshot" | "unknown";
  readonly equipmentCapabilities?: EquipmentCapabilities;
  readonly horizonId?: string;
}): ProductionWeekTrainingOpportunity {
  const intendedWindowRef = `window-${input.index}`;
  const opportunityId = deriveWeekOpportunityId({ horizonId: input.horizonId ?? PRODUCTION_WEEK_DEFAULT_HORIZON_ID,
    intendedWindowRef });
  const base: Omit<ProductionWeekTrainingOpportunity, "opportunityRevisionId" | "provenance"> = {
    opportunityId,
    intendedWindowRef,
    order: input.index,
    timeWindow: Object.freeze({
      startsAt: `2026-08-${String(17 + input.index).padStart(2, "0")}T10:00:00-04:00`,
      endsAt: `2026-08-${String(17 + input.index).padStart(2, "0")}T11:00:00-04:00`,
      timezone: "America/Toronto",
    }),
    availabilityStatus: input.status ?? "available",
    completionStatus: input.completion ?? "not_started",
    expectedAvailableMinutes: input.minutes === undefined ? 60 : input.minutes,
    expectedStructuralCapacity: input.capacity ?? "standard",
    expectedEquipment: input.equipmentKind === "unknown" ?
      Object.freeze({ kind: "unknown" as const, sourceRef: `equipment-unknown-${input.index}` }) :
      Object.freeze({ kind: "capability_snapshot" as const,
        capabilities: input.equipmentCapabilities ?? PRODUCTION_WEEK_BASE_REQUEST.equipment,
        sourceRef: `equipment-snapshot-${input.index}` }),
    locationRef: "test-gym",
    constraints: Object.freeze([{ constraintId: `single-session-${input.index}`, kind: "single_session_only" as const,
      targetOpportunityIds: Object.freeze([]), required: true, sourceRef: `opportunity-${input.index}` }]),
    confirmationState: input.confirmation ?? "user_confirmed",
    sourceAuthority: "explicit_user_fact",
  };
  return Object.freeze({ ...base, opportunityRevisionId: deriveWeekOpportunityRevisionId(base),
    provenance: PRODUCTION_WEEK_TEST_PROVENANCE });
}

export function productionSourceSnapshot(
  opportunities: readonly ProductionWeekTrainingOpportunity[] = [productionOpportunity({ index: 0 }),
    productionOpportunity({ index: 1 }), productionOpportunity({ index: 2 })],
  planningBoundary: ProductionWeekPlanningBoundary = PRODUCTION_WEEK_DEFAULT_BOUNDARY,
): ProductionWeekPlanningSourceSnapshot {
  const built = buildProductionWeekPlanningSourceSnapshot({
    athleteId: PRODUCTION_WEEK_BASE_REQUEST.athlete.id,
    planningBoundary,
    horizonLineageAttemptId: PRODUCTION_WEEK_HORIZON_LINEAGE_ATTEMPT_ID,
    opportunities,
    evaluationTime: PRODUCTION_WEEK_TEST_TIME,
    timezone: "America/Toronto",
    priorHorizonRevisionId: null,
    unresolvedContext: Object.freeze([]),
    sourceAuthority: "explicit_user_fact",
    provenance: PRODUCTION_WEEK_TEST_PROVENANCE,
  });
  if (!built.snapshot) throw new Error(built.reasonCodes.join(","));
  return built.snapshot;
}

export function productionPriority(input: Partial<ProductionExplicitWeeklyPriority> = {}): ProductionExplicitWeeklyPriority {
  const defaultTarget: ProductionWeeklySelectionTarget = Object.freeze({
    targetMovementRoles: Object.freeze(["horizontal_pull"] as const),
    targetActionFunctions: Object.freeze([] as const),
    targetMuscles: Object.freeze(["lats", "mid_back"] as const),
    muscleRequirement: "primary_required",
    targetBodyRegions: Object.freeze(["shoulder", "thoracic_spine"] as const),
  });
  return Object.freeze({
    priorityId: input.priorityId ?? "explicit-strength-priority",
    family: input.family ?? "strength",
    purpose: input.purpose ?? "movement_development",
    target: input.target ?? defaultTarget,
    priority: input.priority ?? "required",
    priorityOrder: input.priorityOrder ?? 0,
    sourceEvidence: input.sourceEvidence ?? Object.freeze([{
      sourceKind: "user_explicit_weekly_priority",
      sourceId: `${input.priorityId ?? "explicit-strength-priority"}:source`,
      evidenceRefs: Object.freeze([`${input.priorityId ?? "explicit-strength-priority"}:evidence`]),
    }]),
    goalRelationships: input.goalRelationships ?? Object.freeze([{
      goal: "strength",
      relationship: "primary_weekly_goal",
      sourceEvidenceRefs: Object.freeze([`${input.priorityId ?? "explicit-strength-priority"}:goal`]),
    }]),
    ...(input.exactActionOwnership ? { exactActionOwnership: input.exactActionOwnership } : {}),
    ...(input.uniqueMarginalValueRef ? { uniqueMarginalValueRef: input.uniqueMarginalValueRef } : {}),
  });
}

export function productionPlannerInput(input: {
  readonly source?: ProductionWeekPlanningSourceSnapshot;
  readonly priorities?: readonly ProductionExplicitWeeklyPriority[];
  readonly outcomeGoal?: ProductionWeeklyIntentPlannerInput["explicitOutcomeGoal"];
  readonly safety?: ProductionWeeklyIntentPlannerInput["trainingSafety"];
  readonly policy?: ProductionWeeklyIntentPlannerInput["policy"];
  readonly attemptId?: string;
  readonly phase?: ProductionWeeklyIntentPlannerInput["phaseIntent"];
  readonly pain?: ProductionWeeklyIntentPlannerInput["painAndInjury"];
} = {}): ProductionWeeklyIntentPlannerInput {
  return {
    plannerContract: PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE,
    policy: input.policy === undefined ? PRODUCTION_WEEK_POLICY_V1 : input.policy,
    sourceSnapshot: input.source ?? productionSourceSnapshot(),
    athlete: PRODUCTION_WEEK_BASE_REQUEST.athlete,
    explicitOutcomeGoal: input.outcomeGoal === undefined ? "strength" : input.outcomeGoal,
    outcomeGoalLineageId: "explicit-strength-goal-lineage",
    orderedSecondaryGoals: Object.freeze([]),
    programmingContextModes: Object.freeze([]),
    phaseIntent: input.phase ?? PRODUCTION_WEEK_BASE_REQUEST.phase,
    assessment: PRODUCTION_WEEK_BASE_REQUEST.assessment,
    painAndInjury: input.pain ?? PRODUCTION_WEEK_BASE_REQUEST.painAndInjury,
    trainingSafety: input.safety ?? NO_TRAINING_SAFETY_SIGNALS,
    history: PRODUCTION_WEEK_BASE_REQUEST.history,
    trainingResponseHistory: PRODUCTION_WEEK_BASE_REQUEST.history.trainingResponseHistory ?? { observations: [] },
    explicitWeeklyPriorities: input.priorities ?? Object.freeze([productionPriority()]),
    externalLoadObservations: Object.freeze([]),
    continuityEvidence: Object.freeze({ priorPlanRevisionId: null, productiveRelationships: Object.freeze([]),
      completedOpportunityIds: Object.freeze([]), missedOpportunityIds: Object.freeze([]), changeReasonRefs: Object.freeze([]) }),
    evaluationTime: PRODUCTION_WEEK_TEST_TIME,
    intentAttemptId: input.attemptId ?? "intent-attempt-1",
  };
}

export function productionWeeklyIntent(input: Parameters<typeof productionPlannerInput>[0] = {}): ProductionWeeklyIntent {
  const planned = planWeeklyIntent(productionPlannerInput(input));
  if (!planned.weeklyIntent) throw new Error(planned.decisionTrace.join(","));
  return planned.weeklyIntent;
}

export function productionFeasibilityOracle(
  status: ProductionSessionFeasibilityStatus = "feasible_session_skeleton",
): ProductionSessionFeasibilityOracle {
  const oracle: ProductionSessionFeasibilityOracle = {
    oracleId: "explicit-production-test-oracle",
    oracleVersion: "1.0.0",
    evaluate: (input: ProductionSessionFeasibilityOracleInput) => Object.freeze({
      opportunityId: input.opportunity.opportunityId,
      opportunityRevisionId: input.opportunity.opportunityRevisionId,
      objectiveIds: Object.freeze(input.objectives.map((entry) => entry.objectiveId).sort()),
      status,
      sourceRefs: Object.freeze(["explicit-caller-supplied-oracle"]),
      unresolvedRequirementRefs: status === "feasible_session_skeleton" ? Object.freeze([]) : Object.freeze([status]),
      downstreamContractVersions: Object.freeze(["PRODUCTION_SESSION_INTENT_PLANNER@1.0.0",
        "PRODUCTION_CANDIDATE_INTELLIGENCE@1.0.0", "PRODUCTION_SESSION_COMPOSER@1.0.0"]),
      resultFingerprint: canonicalWeekFingerprint({ opportunity: input.opportunity.opportunityRevisionId,
        objectives: input.objectives.map((entry) => entry.objectiveId).sort(), status }),
    }),
  };
  return Object.freeze(oracle);
}

export const PRODUCTION_WEEK_EXACT_SEARCH_POLICY: ProductionWeekSearchResourcePolicy = Object.freeze({
  policyId: "PRODUCTION_WEEK_EXACT_TEST_POLICY",
  version: "1.0.0",
  mode: "exact_only",
  maximumExpandedStates: 50_000,
  maximumCompletePlansEvaluated: 50_000,
  maximumParetoStatesRetained: 50_000,
  onLimit: "RETURN_SEARCH_INCONCLUSIVE",
  provenance: Object.freeze({ owner: "week_allocation_composer", sourceRefs: Object.freeze(["explicit-test-policy"]),
    ruleRefs: Object.freeze(["EXACT_ONLY"]) }),
});

export function productionComposerInput(input: {
  readonly source?: ProductionWeekPlanningSourceSnapshot;
  readonly intent?: ProductionWeeklyIntent;
  readonly search?: ProductionWeekSearchResourcePolicy;
  readonly oracle?: ProductionSessionFeasibilityOracle;
} = {}): ProductionWeekAllocationComposerInput {
  const source = input.source ?? productionSourceSnapshot();
  const intent = input.intent ?? productionWeeklyIntent({ source });
  return {
    composerContract: PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE,
    weeklyIntent: intent,
    sourceSnapshot: source,
    orderedOpportunities: source.opportunities,
    completionState: Object.freeze(Object.fromEntries(source.opportunities.map((entry) =>
      [entry.opportunityId, entry.completionStatus]))),
    previousWeekStructureEvidence: intent.continuityEvidence,
    policy: PRODUCTION_WEEK_POLICY_V1,
    spacingRequirements: Object.freeze([]),
    feasibilityOracle: input.oracle ?? productionFeasibilityOracle(),
    searchResourcePolicy: input.search ?? PRODUCTION_WEEK_EXACT_SEARCH_POLICY,
    evaluationTime: PRODUCTION_WEEK_TEST_TIME,
    allocationAttemptId: "allocation-attempt-1",
  };
}

export function productionWeekPlan(input: Parameters<typeof productionComposerInput>[0] = {}): ProductionWeekAllocationPlan {
  const plan = composeWeekAllocation(productionComposerInput(input));
  if (plan.status !== "allocation_composed") throw new Error(plan.decisionTrace.join(","));
  return plan;
}

export function productionMaterializationInput(
  plan: ProductionWeekAllocationPlan = productionWeekPlan(),
): ProductionSessionAllocationMaterializationInput {
  const reservation = plan.reservations[0]!;
  const capabilities = reservation.expectedEquipment.kind === "capability_snapshot" ?
    reservation.expectedEquipment.capabilities : PRODUCTION_WEEK_BASE_REQUEST.equipment;
  return {
    materializerContract: PRODUCTION_SESSION_ALLOCATION_MATERIALIZER_CONTRACT_REFERENCE,
    reservation,
    expectedWeekPlanRevisionId: plan.weekPlanRevisionId,
    actualCurrentAvailability: Object.freeze({ availableMinutes: reservation.expectedAvailableMinutes,
      structuralCapacity: reservation.expectedStructuralCapacity, provenance: "explicit_today", sourceRef: "actual-availability" }),
    actualCurrentStructuralCapacity: reservation.expectedStructuralCapacity,
    actualCurrentEquipment: Object.freeze({ capabilities, provenance: "explicit_today", sourceRef: "actual-equipment" }),
    actualTrainingSafety: NO_TRAINING_SAFETY_SIGNALS,
    actualEvaluationTime: PRODUCTION_WEEK_TEST_TIME,
    actualLocationRef: "test-gym",
    userCancelled: false,
    unresolvedCurrentContext: Object.freeze([]),
    productUpdateRefs: Object.freeze(["explicit-product-update"]),
    materializationAttemptId: "materialization-attempt-1",
  };
}

export function reviseProductionPlanReservationStatuses(
  plan: ProductionWeekAllocationPlan,
  statusByReservationId: Readonly<Record<string, ProductionWeekAllocationPlan["reservations"][number]["status"]>>,
): ProductionWeekAllocationPlan {
  const revisionReservations = plan.reservations.map((reservation) => {
    const { reservationRevisionId: _priorRevisionId, provenance, ...priorContent } = reservation;
    void _priorRevisionId;
    void provenance;
    const { weekPlanRevisionId: _priorPlanRevisionId, ...revisionContent } = priorContent;
    void _priorPlanRevisionId;
    return { ...revisionContent, status: statusByReservationId[reservation.reservationId] ?? reservation.status };
  });
  const { weekPlanRevisionId: priorPlanRevisionId, provenance, reservations: _priorReservations,
    ...priorPlanContent } = plan;
  void _priorReservations;
  const revisionContent = { ...priorPlanContent, basedOnRevisionId: priorPlanRevisionId,
    reservations: revisionReservations };
  const weekPlanRevisionId = deriveWeekPlanRevisionId(revisionContent);
  const reservations = plan.reservations.map((reservation, index) => {
    const { reservationRevisionId: _priorRevisionId, provenance: reservationProvenance,
      ...priorContent } = reservation;
    void _priorRevisionId;
    const content = { ...priorContent, weekPlanRevisionId, status: revisionReservations[index]!.status };
    return Object.freeze({ ...content, reservationRevisionId: deriveReservationRevisionId(content),
      provenance: reservationProvenance });
  });
  return Object.freeze({ ...revisionContent, weekPlanRevisionId,
    reservations: Object.freeze(reservations), provenance });
}
