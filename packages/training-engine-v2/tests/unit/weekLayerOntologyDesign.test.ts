import { describe, expect, it } from "vitest";
import * as publicEngine from "../../src";
import {
  EMPTY_WEEK_CONTINUITY,
  NON_PRODUCTION_WEEKLY_POLICY,
  designWeeklyIntent,
  frequencyIntent,
  weekHorizon,
  weekOpportunity,
  weeklyIntentInput,
  weeklyPriority,
  weeklyTarget,
} from "../helpers/weekComposerDesignLab";

describe("Week-layer design ontology and ownership", () => {
  it("keeps all Week design behavior outside the public package API", () => {
    expect("designWeeklyIntent" in publicEngine).toBe(false);
    expect("designWeekAllocation" in publicEngine).toBe(false);
    expect("materializeReservationDesign" in publicEngine).toBe(false);
  });

  it("models irregular ordered opportunities without weekday or seven-day assumptions", () => {
    const horizon = weekHorizon({ opportunities: [
      weekOpportunity({ id: "night-shift-a", order: 4, equipmentRef: "gym-a", dateRef: "cycle-day-9" }),
      weekOpportunity({ id: "night-shift-b", order: 9, equipmentRef: "home", dateRef: "cycle-day-12" }),
    ] });
    expect(horizon.boundary.kind).toBe("ordered_cycle");
    expect(horizon.opportunities.map((entry) => entry.order)).toEqual([4, 9]);
    expect(horizon.opportunities.every((entry) => entry.constraints[0].kind === "single_session_only")).toBe(true);
  });

  it("requires explicit goal, current opportunities, reviewed policy, and frequency source", () => {
    const missingGoal = weeklyIntentInput();
    expect(designWeeklyIntent({ ...missingGoal, explicitOutcomeGoal: undefined }).status).toBe("weekly_goal_under_specified");
    expect(designWeeklyIntent(weeklyIntentInput({ horizon: weekHorizon({ opportunities: [] }) })).status)
      .toBe("current_week_availability_required");
    expect(designWeeklyIntent(weeklyIntentInput({ policy: null })).status).toBe("weekly_policy_required");
    const noFrequency = weeklyPriority({ id: "no-frequency", purpose: "movement_development" });
    const { frequencyIntent: omittedFrequencyIntent, ...withoutFrequency } = noFrequency;
    expect(omittedFrequencyIntent).toBeDefined();
    expect(designWeeklyIntent(weeklyIntentInput({ priorities: [withoutFrequency] })).status).toBe("weekly_policy_required");
  });

  it("normalizes only explicit structured priorities and merges equivalent truth", () => {
    const first = weeklyPriority({ id: "first", purpose: "movement_development" });
    const second = weeklyPriority({ ...first, id: "second", priority: "preferred", priorityOrder: 0 });
    const result = designWeeklyIntent(weeklyIntentInput({ priorities: [second, first] }));
    expect(result.weeklyIntent?.objectives).toHaveLength(1);
    expect(result.mergedObjectiveTraces).toHaveLength(1);
    expect(result.weeklyIntent?.objectives[0].priority).toBe("required");
  });

  it("separates outcome, ordered secondary goals, and pain-aware context", () => {
    const input = weeklyIntentInput({ outcomeGoal: "strength", contextModes: ["pain_aware_return"] });
    const result = designWeeklyIntent({ ...input, orderedSecondaryGoals: ["posture_and_movement_quality", "conditioning"] });
    expect(result.weeklyIntent).toMatchObject({
      outcomeGoal: "strength",
      orderedSecondaryGoals: ["posture_and_movement_quality", "conditioning"],
      programmingContextModes: ["pain_aware_return"],
    });
  });

  it("keeps phase, assessment, pain, labels, and prose from inventing objectives", () => {
    const base = weeklyIntentInput();
    const changed = {
      ...base,
      athlete: { ...base.athlete, label: "Different label" },
      phaseIntent: { ...base.phaseIntent, primaryGoal: "hypertrophy" as const, priorityMuscles: ["calves" as const],
        developedQualities: ["arbitrary changed prose"] },
      assessment: { signals: [{ id: "assessment", type: "control_finding" as const, source: "movement_screen" as const,
        confidence: "high" as const, priority: "primary" as const, movementRole: "scapular_control" as const,
        description: "Must remain context without explicit weekly allocation." }], historicalWeaknesses: [] },
      painAndInjury: { ...base.painAndInjury, currentDiscomforts: [{ kind: "current_discomfort" as const, id: "pain",
        region: "shoulder" as const, severity0To10: 2 as const, stressTags: ["horizontal_pressing" as const],
        effect: "monitor" as const, description: "Must not create a weekly objective." }] },
    };
    expect(designWeeklyIntent(changed).weeklyIntent?.objectives).toHaveLength(1);
    expect(designWeeklyIntent(changed).weeklyIntent?.objectives[0].selectionTarget)
      .toEqual(designWeeklyIntent(base).weeklyIntent?.objectives[0].selectionTarget);
  });

  it("defines frequency as allocated opportunities rather than dose credit", () => {
    const frequency = frequencyIntent({ minimum: 1, target: 2, softMaximum: 2 });
    const priority = weeklyPriority({ id: "two-opportunities", purpose: "movement_development", frequencyIntent: frequency,
      target: weeklyTarget({ targetMovementRoles: ["horizontal_push"], targetMuscles: ["chest"], targetBodyRegions: ["shoulder"] }) });
    const objective = designWeeklyIntent(weeklyIntentInput({ priorities: [priority] })).weeklyIntent?.objectives[0];
    expect(objective?.frequencyIntent).toEqual(frequency);
    expect(objective?.dosePolicyReference.state).toBe("pending_prescription_policy");
    expect(JSON.stringify(objective)).not.toContain("sets");
    expect(NON_PRODUCTION_WEEKLY_POLICY.sourceType).toBe("NON_PRODUCTION_POLICY_FIXTURE");
    expect(EMPTY_WEEK_CONTINUITY.previousSessionResponsibilitySignatures).toEqual([]);
  });
});
