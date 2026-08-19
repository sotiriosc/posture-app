import { describe, expect, it } from "vitest";
import {
  TRAINING_OUTCOME_GOALS,
  PROGRAMMING_CONTEXT_MODES,
  planSessionIntent,
  validateSessionAllocationDirective,
} from "../../src";
import { behavioralSignature, plannerDirective, plannerInput, plannerObjective } from "../helpers/sessionIntentPlannerProduction";

describe("Session Intent Planner ontology and ownership", () => {
  it("separates outcome goals, context modes, and ordinary session type", () => {
    expect(TRAINING_OUTCOME_GOALS).not.toContain("pain_aware_return");
    expect(PROGRAMMING_CONTEXT_MODES).toEqual(["pain_aware_return"]);
    const result = planSessionIntent(plannerInput({ directive: plannerDirective({ programmingContextModes: ["pain_aware_return"] }) }));
    expect(result.sessionIntent).toMatchObject({ kind: "ordinary_training", outcomeGoal: "strength", programmingContextModes: ["pain_aware_return"] });
  });

  it("requires an allocation and refuses a legacy pain-only goal", () => {
    expect(planSessionIntent(plannerInput({ directive: null })).status).toBe("requires_week_or_explicit_session_allocation");
    const directive = { ...plannerDirective(), outcomeGoal: undefined, legacyPrimaryGoal: "pain_aware_return" as const };
    const result = planSessionIntent(plannerInput({ directive }));
    expect(result.status).toBe("under_specified");
    expect(result.validationFindings.map((entry) => entry.code)).toContain("UNDER_SPECIFIED_OUTCOME_GOAL");
  });

  it("keeps profile and phase goals subordinate to the explicit directive", () => {
    const input = plannerInput({ directive: plannerDirective({ outcomeGoal: "conditioning" }) });
    const result = planSessionIntent({ ...input, phaseIntent: { ...input.phaseIntent, primaryGoal: "posture_and_movement_quality", priorityMuscles: ["calves"] } });
    expect(result.sessionIntent?.outcomeGoal).toBe("conditioning");
    expect(result.sessionIntent?.needs).toHaveLength(1);
    expect(result.validationFindings).toContainEqual(expect.objectContaining({ code: "profile_goal_differs_from_directive", severity: "warning" }));
  });

  it("diagnoses contradictory dominant allocations", () => {
    const objectives = [
      plannerObjective({ id: "one", kind: "dominant_main", priorityOrder: 0 }),
      plannerObjective({ id: "two", kind: "dominant_main", priorityOrder: 1 }),
    ];
    const input = plannerInput({ directive: plannerDirective({ objectives }) });
    expect(validateSessionAllocationDirective(input).map((entry) => entry.code)).toContain("contradictory_required_dominant_objectives");
    expect(planSessionIntent(input).status).toBe("contradictory_directive");
  });

  it("treats prose and profile scheduling fields as behaviorally inert", () => {
    const input = plannerInput();
    const changed = {
      ...input,
      athlete: { ...input.athlete, label: "Changed label", availability: { ...input.athlete.availability, daysPerWeek: 7, preferredTrainingDays: ["whenever"] } },
      phaseIntent: { ...input.phaseIntent, name: "Changed prose", developedQualities: ["invented prose"], priorityMuscles: ["calves" as const] },
    };
    expect(behavioralSignature(planSessionIntent(changed))).toEqual(behavioralSignature(planSessionIntent(input)));
  });
});
