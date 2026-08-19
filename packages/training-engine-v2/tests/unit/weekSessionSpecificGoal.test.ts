import { describe, expect, it } from "vitest";
import { NO_TRAINING_SAFETY_SIGNALS, planAndComposeSessionSkeleton } from "../../src";
import {
  WEEK_DESIGN_AS_OF,
  allocationInput,
  designWeekAllocation,
  designWeeklyIntent,
  materializeReservationDesign,
  resolveSessionOutcomeGoal,
  weekHorizon,
  weeklyIntentInput,
  weeklyPriority,
  weeklyTarget,
} from "../helpers/weekComposerDesignLab";
import { plannerInput } from "../helpers/sessionIntentPlannerProduction";

describe("Week reservation session-specific outcome goals", () => {
  const conditioningPriority = weeklyPriority({
    id: "capacity-priority",
    purpose: "capacity_development",
    target: weeklyTarget({ targetMovementRoles: ["carry"], targetActionFunctions: [], targetMuscles: ["trunk"],
      muscleRequirement: "any_meaningful_contributor", targetBodyRegions: ["general"] }),
    goalRelationships: [{ goal: "conditioning", relationship: "secondary_weekly_goal",
      sourceEvidenceRefs: ["explicit-secondary-conditioning-goal"] }],
  });

  it("reserves a secondary-goal capacity session without copying the primary Week goal", () => {
    const horizon = weekHorizon({ opportunities: undefined });
    const intent = designWeeklyIntent(weeklyIntentInput({ outcomeGoal: "strength", secondaryGoals: ["conditioning"],
      priorities: [conditioningPriority], horizon })).weeklyIntent!;
    const plan = designWeekAllocation(allocationInput({ intent, horizon }));
    expect(plan.status).toBe("allocation_designed");
    expect(plan.reservations[0]).toMatchObject({ weeklyPrimaryOutcomeGoal: "strength",
      weeklySecondaryOutcomeGoals: ["conditioning"], sessionOutcomeGoal: "conditioning" });
    expect(plan.reservations[0].allocatedObjectives[0]).toMatchObject({ purpose: "capacity_main", priority: "required" });
  });

  it("materializes and propagates the session goal through Planner and Candidate requests", () => {
    const horizon = weekHorizon();
    const intent = designWeeklyIntent(weeklyIntentInput({ outcomeGoal: "strength", secondaryGoals: ["conditioning"],
      priorities: [conditioningPriority], horizon })).weeklyIntent!;
    const reservation = designWeekAllocation(allocationInput({ intent, horizon })).reservations[0];
    const equipment = reservation.expectedEquipment.kind === "capability_snapshot" ? reservation.expectedEquipment.capabilities : null;
    expect(equipment).not.toBeNull();
    const materialized = materializeReservationDesign({ reservation,
      actualCurrentAvailability: { availableMinutes: 50, structuralCapacity: reservation.expectedStructuralCapacity,
        provenance: "explicit_today", sourceRef: "today" },
      actualCurrentEquipment: { capabilities: equipment!, provenance: "explicit_today", sourceRef: "today-equipment" },
      actualEvaluationTime: WEEK_DESIGN_AS_OF, actualSafetyState: NO_TRAINING_SAFETY_SIGNALS,
      actualUnresolvedContext: [], explicitProductUserUpdateRefs: [] });
    expect(materialized.directive?.outcomeGoal).toBe("conditioning");
    const input = plannerInput({ directive: materialized.directive!, equipment: materialized.plannerCurrentEquipment! });
    const integrated = planAndComposeSessionSkeleton({ ...input, evaluationAsOf: WEEK_DESIGN_AS_OF });
    expect(integrated.planning.sessionIntent?.outcomeGoal).toBe("conditioning");
    expect(Object.values(integrated.candidateResultsByNeed ?? {}).every((entry) => entry.request.goal === "conditioning")).toBe(true);
  });

  it("keeps unrelated strength objectives attached to strength", () => {
    const strength = weeklyPriority({ id: "strength-pull", purpose: "movement_development",
      goalRelationships: [{ goal: "strength", relationship: "primary_weekly_goal", sourceEvidenceRefs: ["strength-goal"] }] });
    const objective = designWeeklyIntent(weeklyIntentInput({ priorities: [strength] })).weeklyIntent!.objectives;
    expect(resolveSessionOutcomeGoal(objective, "strength")).toMatchObject({ status: "session_goal_resolved", goal: "strength" });
  });

  it("does not duplicate an objective that supports more than one goal", () => {
    const crossGoal = weeklyPriority({ ...conditioningPriority, id: "cross-goal", goalRelationships: [
      { goal: "strength", relationship: "primary_weekly_goal", sourceEvidenceRefs: ["strength"] },
      { goal: "conditioning", relationship: "cross_goal_support", sourceEvidenceRefs: ["conditioning"] },
    ] });
    const intent = designWeeklyIntent(weeklyIntentInput({ secondaryGoals: ["conditioning"], priorities: [crossGoal] })).weeklyIntent!;
    expect(intent.objectives).toHaveLength(1);
    expect(resolveSessionOutcomeGoal(intent.objectives, "strength")).toMatchObject({ goal: "strength" });
  });

  it("returns an explicit conflict for competing dominant-goal evidence", () => {
    const conflict = weeklyPriority({ ...conditioningPriority, id: "goal-conflict", goalRelationships: [
      { goal: "strength", relationship: "primary_weekly_goal", sourceEvidenceRefs: ["strength"] },
      { goal: "conditioning", relationship: "secondary_weekly_goal", sourceEvidenceRefs: ["conditioning"] },
    ] });
    const objectives = designWeeklyIntent(weeklyIntentInput({ secondaryGoals: ["conditioning"], priorities: [conflict] })).weeklyIntent!.objectives;
    expect(resolveSessionOutcomeGoal(objectives, "strength")).toMatchObject({ status: "SESSION_GOAL_CONFLICT", goal: null });
  });
});
