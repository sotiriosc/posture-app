import { describe, expect, it } from "vitest";
import {
  CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS,
  EMPTY_TRAINING_HISTORY,
  NO_PAIN_OR_INJURY,
  NO_TRAINING_SAFETY_SIGNALS,
  OWNER_WEEK_TOPOLOGY_SEARCH_POLICY,
  PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE,
  PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE,
  PRODUCTION_WEEK_POLICY_V1,
  THREE_PHASE_FOUNDATION,
  buildOwnerGenerationCommand,
  buildOwnerGetStrongerTopologyPolicy,
  buildOwnerProfileRevision,
  buildOwnerWeekFeasibilityOracle,
  composeWeekAllocation,
  evaluateOwnerWeekTopology,
  planWeeklyIntent,
  runControlledOwnerProductionPipeline,
  type ControlledOwnerProductionPipelineResult,
  type OwnerAvailableTrainingDays,
  type OwnerGetStrongerProfileRevision,
  type OwnerWeekTopologyEvidence,
  type ProductionWeekAllocationPlan,
  type ProductionWeekPlanningSourceSnapshot,
  type ProductionWeeklyIntent,
  type ProductionWeeklyIntentPlanningResult,
} from "../../src";
import { applyProductGetStrongerDevelopWeeklyResponsibilityPolicyV1,
  type ProductGetStrongerDevelopWeeklyPolicyResult } from
  "../../src/productGoalArchitecture/getStrongerDevelopWeeklyPolicyV1";

const NOW = "2026-08-18T12:00:00.000Z";
const USER_ID = "owner-week-topology-test-user";

interface TopologyFixture {
  readonly profile: OwnerGetStrongerProfileRevision;
  readonly result: ControlledOwnerProductionPipelineResult;
  readonly source: ProductionWeekPlanningSourceSnapshot;
  readonly intent: ProductionWeeklyIntent;
  readonly plan: ProductionWeekAllocationPlan;
  readonly evidence: OwnerWeekTopologyEvidence;
}

const fixtures = new Map<OwnerAvailableTrainingDays, TopologyFixture>();

function fixture(days: OwnerAvailableTrainingDays): TopologyFixture {
  const prior = fixtures.get(days);
  if (prior) return prior;
  const profile = buildOwnerProfileRevision({ userId: USER_ID, basedOnRevisionId: null,
    primaryGoal: "strength", trainingMode: "develop", secondaryGoal: null, daysPerWeek: days,
    sessionOpportunities: Array.from({ length: days }, (_, index) => ({
      opportunityId: `owner-opportunity-${index + 1}`, order: index + 1, minutes: 90,
    })),
    sessionMinutes: { status: "known", minutes: 90 },
    equipmentCapabilitySnapshot: { environment: "commercial_gym",
      capabilityIds: ["commercial_gym", "bodyweight", "dumbbells", "adjustable_bench", "barbell_rack",
        "cables", "pull_up_station", "wall"], confirmed: true, sourceRevision: "owner-equipment:topology" },
    coarseExperience: "advanced", familiarity: [{ exerciseId: "dumbbell-romanian-deadlift",
      realizationId: null, status: "known" }],
    painContext: { regionIds: [], limitationIds: [], confirmed: true, diagnosticClaimCount: 0 },
    assessmentReferences: [], trainingSafety: "clear", continuityReferences: [], evaluationTime: NOW,
    provenance: { source: "owner_confirmation", sourceRefs: ["owner-topology-fixture"] },
    reviewState: "confirmed", createdAt: NOW });
  const command = buildOwnerGenerationCommand({ userId: USER_ID,
    enrollmentRevisionId: "owner-enrollment-revision:topology", profileRevisionId: profile.revisionId,
    sourceProductSnapshotId: "product-snapshot:topology", sourceProductRevisionId: "product-revision:topology",
    activeLegacyProgramRevisionId: "legacy-program:unchanged", engineVersion: "training-engine-v2@topology",
    policyVersions: CONTROLLED_OWNER_PRODUCTION_POLICY_VERSIONS,
    evaluationTime: NOW, requestedAt: NOW });
  const result = runControlledOwnerProductionPipeline({ command, profile, proposedProductFacts: [] });
  expect(result.status, result.unresolvedFacts.join(",")).toBe("complete");
  const source = result.stages.find((entry) => entry.stage === "product_horizon")!
    .payload as ProductionWeekPlanningSourceSnapshot;
  const intentResult = result.stages.find((entry) => entry.stage === "week_intent")!
    .payload as ProductionWeeklyIntentPlanningResult;
  const allocation = result.stages.find((entry) => entry.stage === "week_allocation")!.payload as {
    readonly weekPlan: ProductionWeekAllocationPlan;
    readonly topologyEvidence: OwnerWeekTopologyEvidence;
  };
  if (!intentResult.weeklyIntent) throw new Error(intentResult.status);
  const value = Object.freeze({ profile, result, source, intent: intentResult.weeklyIntent,
    plan: allocation.weekPlan, evidence: allocation.topologyEvidence });
  fixtures.set(days, value);
  return value;
}

function roleFor(intent: ProductionWeeklyIntent, objectiveId: string): "knee" | "hinge" | "push" | "pull" {
  const roles = new Set(intent.objectives.find((entry) => entry.objectiveId === objectiveId)!.target.targetMovementRoles);
  return roles.has("squat") ? "knee" : roles.has("hinge") ? "hinge" :
    roles.has("horizontal_push") ? "push" : "pull";
}

describe("controlled-owner canonical Week topology", () => {
  it.each([
    { days: 2 as const, counts: [4, 4], occupied: 2, unused: 0 },
    { days: 3 as const, counts: [3, 3, 2], occupied: 3, unused: 0 },
    { days: 4 as const, counts: [2, 2, 2, 2], occupied: 4, unused: 0 },
    { days: 5 as const, counts: [2, 2, 2, 2], occupied: 4, unused: 1 },
    { days: 6 as const, counts: [2, 2, 2, 2], occupied: 4, unused: 2 },
  ])("uses $occupied sessions across $days available opportunities", ({ days, counts, occupied, unused }) => {
    const value = fixture(days);
    expect(value.evidence).toMatchObject({ valid: true, availableOpportunityCount: days,
      occupiedSessionCount: occupied, responsibilityCountsBySession: counts });
    expect(value.evidence.unusedOpportunityIds).toHaveLength(unused);
    expect(Object.values(value.evidence.weeklyExposureCounts)).toEqual([2, 2, 2, 2]);
    expect(value.plan.reservations.every((reservation) =>
      reservation.allocatedObjectives.filter((objective) => objective.purpose === "dominant_main").length === 1))
      .toBe(true);
  });

  it("produces the reviewed four-opportunity primary/supporting structure", () => {
    const value = fixture(4);
    expect(value.evidence.assignments.map((assignment) => assignment.responsibilities.map((responsibility) =>
      `${responsibility.role}:${roleFor(value.intent, responsibility.weeklyObjectiveId)}`))).toEqual([
      ["primary:knee", "supporting:hinge"],
      ["primary:push", "supporting:pull"],
      ["supporting:knee", "primary:hinge"],
      ["supporting:push", "primary:pull"],
    ]);
  });

  it("keeps two- and three-session primary emphasis stable in canonical priority order", () => {
    expect(fixture(2).evidence.assignments.map((assignment) => roleFor(fixture(2).intent,
      assignment.responsibilities.find((responsibility) => responsibility.role === "primary")!
        .weeklyObjectiveId))).toEqual(["knee", "push"]);
    expect(fixture(3).evidence.assignments.map((assignment) => roleFor(fixture(3).intent,
      assignment.responsibilities.find((responsibility) => responsibility.role === "primary")!
        .weeklyObjectiveId))).toEqual(["knee", "push", "hinge"]);
    expect(fixture(2).evidence.primaryEmphasisFingerprint)
      .toBe(fixture(2).plan.wholeWeekEvaluation?.primaryEmphasisFingerprint);
    expect(fixture(3).evidence.primaryEmphasisFingerprint)
      .toBe(fixture(3).plan.wholeWeekEvaluation?.primaryEmphasisFingerprint);
  });

  it("supports a variable required set when typed evidence separately owns both push planes", () => {
    const value = fixture(4);
    const policyResult = applyProductGetStrongerDevelopWeeklyResponsibilityPolicyV1({
      productLabel: "get_stronger", trainingMode: "develop", outcomeGoal: "strength",
      sourceProductRevisionId: "product-revision:topology",
      goalFactId: "product-fact:get-stronger", modeFactId: "product-fact:develop",
      experience: "advanced", experienceFactId: "owner-fact:advanced",
      availableOpportunityCount: 4,
      separatePlaneFacts: [{ factId: "product-fact:both-push-planes", family: "upper_push",
        requiredPlanes: ["horizontal", "vertical"], owner: "explicit_subgoal",
        evidenceRefs: ["owner-confirmation:both-push-planes"] }],
      additionalResponsibilityFacts: [], loadingEvidence: [],
    });
    expect(policyResult.status).toBe("resolved");
    const athlete = Object.freeze({ id: value.profile.userId, label: "Controlled owner", experience: "advanced" as const,
      primaryGoal: "strength" as const, secondaryGoals: Object.freeze([]),
      preferences: Object.freeze({ preferredExerciseIds: Object.freeze([]), dislikedExerciseIds: Object.freeze([]),
        varietyPreference: "low" as const, notes: Object.freeze([]) }),
      availability: Object.freeze({ daysPerWeek: 4, minutesPerSession: 90, preferredTrainingDays: Object.freeze([]) }) });
    const intentResult = planWeeklyIntent({ plannerContract: PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE,
      policy: PRODUCTION_WEEK_POLICY_V1, sourceSnapshot: value.source, athlete,
      explicitOutcomeGoal: "strength", outcomeGoalLineageId: "product-fact:get-stronger",
      orderedSecondaryGoals: [], programmingContextModes: [],
      phaseIntent: Object.freeze({ ...THREE_PHASE_FOUNDATION[1], primaryGoal: "strength" as const }),
      assessment: { signals: [], historicalWeaknesses: [] }, painAndInjury: NO_PAIN_OR_INJURY,
      trainingSafety: NO_TRAINING_SAFETY_SIGNALS, history: EMPTY_TRAINING_HISTORY,
      trainingResponseHistory: EMPTY_TRAINING_HISTORY.trainingResponseHistory ?? { observations: [] },
      explicitWeeklyPriorities: policyResult.priorities, externalLoadObservations: [],
      continuityEvidence: { priorPlanRevisionId: null, productiveRelationships: [], completedOpportunityIds: [],
        missedOpportunityIds: [], changeReasonRefs: [] }, evaluationTime: NOW,
      intentAttemptId: "owner-variable-topology-intent-attempt" });
    expect(intentResult.weeklyIntent).not.toBeNull();
    const intent = intentResult.weeklyIntent!;
    const topologyPolicy = buildOwnerGetStrongerTopologyPolicy(intent);
    expect(topologyPolicy.eligibleObjectiveIds).toHaveLength(5);
    const plan = composeWeekAllocation({ composerContract: PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE,
      weeklyIntent: intent, sourceSnapshot: value.source, orderedOpportunities: value.source.opportunities,
      completionState: Object.fromEntries(value.source.opportunities.map((entry) =>
        [entry.opportunityId, entry.completionStatus])), previousWeekStructureEvidence: intent.continuityEvidence,
      policy: PRODUCTION_WEEK_POLICY_V1, spacingRequirements: [], topologyPolicy,
      feasibilityOracle: buildOwnerWeekFeasibilityOracle(NO_TRAINING_SAFETY_SIGNALS),
      searchResourcePolicy: OWNER_WEEK_TOPOLOGY_SEARCH_POLICY, evaluationTime: NOW,
      allocationAttemptId: "owner-variable-topology-allocation-attempt" });
    const evidence = evaluateOwnerWeekTopology({ plan, intent, policy: topologyPolicy,
      opportunityIds: value.source.opportunities.map((entry) => entry.opportunityId) });
    expect(plan.status, plan.decisionTrace.join(",")).toBe("allocation_composed");
    expect(evidence.valid, evidence.reasonCodes.join(",")).toBe(true);
    expect(Object.values(evidence.weeklyExposureCounts)).toEqual([2, 2, 2, 2, 2]);
  });

  it("is deterministic, permutation-stable, and introduces no automatic future-week rotation", () => {
    const value = fixture(5);
    const mapping = value.result.stages.find((entry) => entry.stage === "product_mapping")!.payload as {
      readonly weeklyResponsibilityPolicy: ProductGetStrongerDevelopWeeklyPolicyResult;
    };
    const priorities = [...mapping.weeklyResponsibilityPolicy.priorities].reverse();
    const athlete = Object.freeze({ id: value.profile.userId, label: "Controlled owner", experience: "advanced" as const,
      primaryGoal: "strength" as const, secondaryGoals: Object.freeze([]),
      preferences: Object.freeze({ preferredExerciseIds: Object.freeze([]), dislikedExerciseIds: Object.freeze([]),
        varietyPreference: "low" as const, notes: Object.freeze([]) }),
      availability: Object.freeze({ daysPerWeek: 5, minutesPerSession: 90, preferredTrainingDays: Object.freeze([]) }) });
    const replanned = planWeeklyIntent({ plannerContract: PRODUCTION_WEEKLY_INTENT_PLANNER_CONTRACT_REFERENCE,
      policy: PRODUCTION_WEEK_POLICY_V1, sourceSnapshot: value.source, athlete,
      explicitOutcomeGoal: "strength", outcomeGoalLineageId: `product-goal:get_stronger:${value.profile.revisionId}`,
      orderedSecondaryGoals: Object.freeze([]), programmingContextModes: Object.freeze([]),
      phaseIntent: Object.freeze({ ...THREE_PHASE_FOUNDATION[1], primaryGoal: "strength" as const }),
      assessment: Object.freeze({ signals: Object.freeze([]), historicalWeaknesses: Object.freeze([]) }),
      painAndInjury: NO_PAIN_OR_INJURY, trainingSafety: NO_TRAINING_SAFETY_SIGNALS,
      history: EMPTY_TRAINING_HISTORY,
      trainingResponseHistory: EMPTY_TRAINING_HISTORY.trainingResponseHistory ?? { observations: [] },
      explicitWeeklyPriorities: priorities, externalLoadObservations: Object.freeze([]),
      continuityEvidence: Object.freeze({ priorPlanRevisionId: null, productiveRelationships: Object.freeze([]),
        completedOpportunityIds: Object.freeze([]), missedOpportunityIds: Object.freeze([]),
        changeReasonRefs: Object.freeze([]) }), evaluationTime: NOW,
      intentAttemptId: value.intent.intentAttemptId });
    expect(replanned.weeklyIntent).toEqual(value.intent);
    const topologyPolicy = buildOwnerGetStrongerTopologyPolicy(value.intent);
    const input = { composerContract: PRODUCTION_WEEK_ALLOCATION_COMPOSER_CONTRACT_REFERENCE,
      weeklyIntent: value.intent, sourceSnapshot: value.source, orderedOpportunities: value.source.opportunities,
      completionState: Object.freeze(Object.fromEntries(value.source.opportunities.map((entry) =>
        [entry.opportunityId, entry.completionStatus]))), previousWeekStructureEvidence: value.intent.continuityEvidence,
      policy: PRODUCTION_WEEK_POLICY_V1, spacingRequirements: Object.freeze([]), topologyPolicy,
      feasibilityOracle: buildOwnerWeekFeasibilityOracle(NO_TRAINING_SAFETY_SIGNALS),
      searchResourcePolicy: OWNER_WEEK_TOPOLOGY_SEARCH_POLICY, evaluationTime: NOW,
      allocationAttemptId: value.plan.allocationAttemptId } as const;
    expect(composeWeekAllocation(input)).toEqual(value.plan);
    expect(composeWeekAllocation(input)).toEqual(composeWeekAllocation(input));
    expect(topologyPolicy.provenance.ruleRefs).toContain("NO_FUTURE_WEEK_ROTATION");
    expect(JSON.stringify(value.plan)).not.toMatch(/rotation|progression|novelty/i);
  });

  it("fails the packed-first-two mutation on all reviewed topology evidence", () => {
    const value = fixture(5);
    const policy = buildOwnerGetStrongerTopologyPolicy(value.intent);
    const byObjective = new Map(value.plan.reservations.flatMap((reservation) =>
      reservation.allocatedObjectives.map((objective) => [objective.weeklyObjectiveId, objective] as const)));
    const reservations = value.plan.reservations.slice(0, 2).map((reservation, reservationIndex) => ({
      ...reservation,
      allocatedObjectives: policy.eligibleObjectiveIds.map((objectiveId, objectiveIndex) => ({
        ...byObjective.get(objectiveId)!,
        responsibilityId: `mutated-responsibility:${reservationIndex}:${objectiveId}`,
        purpose: objectiveIndex === reservationIndex ? "dominant_main" as const : "secondary_main" as const,
        priorityOrder: objectiveIndex,
      })),
    }));
    const mutated = { ...value.plan, reservations,
      decisionTrace: value.plan.decisionTrace.filter((entry) => !entry.startsWith("TOPOLOGY_POLICY:")),
      provenance: { ...value.plan.provenance,
        ruleRefs: value.plan.provenance.ruleRefs.filter((entry) =>
          !entry.startsWith("CONTROLLED_OWNER_GET_STRONGER_TOPOLOGY_POLICY@")) } };
    expect(evaluateOwnerWeekTopology({ plan: mutated, intent: value.intent, policy,
      opportunityIds: value.source.opportunities.map((entry) => entry.opportunityId) }).reasonCodes).toEqual(
      expect.arrayContaining([
        "OWNER_TOPOLOGY_OCCUPIED_SESSION_COUNT_INVALID",
        "OWNER_TOPOLOGY_MAXIMUM_RESPONSIBILITY_CONCENTRATION_INVALID",
        "OWNER_TOPOLOGY_PRIMARY_EMPHASIS_FINGERPRINT_INVALID",
        "OWNER_TOPOLOGY_PROVENANCE_INVALID",
      ]));
  });

  it("keeps Week free of exercise, dose, load, preparation, cooldown, and novelty authority", () => {
    const serialized = JSON.stringify(fixture(5).plan);
    expect(serialized).not.toMatch(/exerciseId|doseBlock|sets|repetitions|loadTarget|warmup|cooldown|novelty/i);
    expect(serialized).toContain("NO_EXERCISE_SELECTION");
    expect(serialized).toContain("NO_DOSE");
  });

  it("produces the complete five-day controlled-owner counterfactual without forcing exercise variety", () => {
    const value = fixture(5);
    const sessions = value.result.projection!.sessions;
    expect(value.source.opportunities).toHaveLength(5);
    expect(sessions).toHaveLength(4);
    expect(value.evidence.unusedOpportunityIds).toHaveLength(1);
    expect(sessions.every((session) => session.availableMinutes === 90 && session.calculatedDuration !== undefined))
      .toBe(true);
    expect(sessions.every((session) => session.exerciseAssignments.length > 0)).toBe(true);
    expect(value.result.stages.findIndex((entry) => entry.stage === "week_allocation"))
      .toBeLessThan(value.result.stages.findIndex((entry) => entry.stage === "candidate_intelligence"));
    expect(value.result.unresolvedFacts).not.toContain("FINAL_DURATION_REQUIRES_PRESCRIPTION_AND_SEQUENCING");
    expect(value.result.projection).toMatchObject({ goal: "strength", mode: "develop", safetyState: "clear" });
    expect(value.result.productShadowCallCount).toBe(0);
    expect(value.result.legacyGenerateProgramCallCount).toBe(0);
  });
});
