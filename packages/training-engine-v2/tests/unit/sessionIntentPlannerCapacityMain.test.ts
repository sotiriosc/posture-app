import { describe, expect, it } from "vitest";
import { planAndComposeSessionSkeleton, planSessionIntent, validateSessionAllocationDirective } from "../../src";
import { plannerDirective, plannerInput, plannerObjective } from "../helpers/sessionIntentPlannerProduction";

describe("Session Intent Planner dominant capacity-main correction", () => {
  it("accepts one explicitly allocated required capacity_main as the dominant responsibility", () => {
    const directive = plannerDirective({ id: "capacity-dominant", outcomeGoal: "general_fitness",
      objectives: [plannerObjective({ id: "loaded-carry-capacity", kind: "capacity_main", selectionTarget: {
        targetMovementRoles: ["carry"], targetActionFunctions: [], targetMuscles: ["trunk"],
        muscleRequirement: "any_meaningful_contributor", targetBodyRegions: ["general", "wrist"],
      } })] });
    const input = plannerInput({ directive });
    expect(validateSessionAllocationDirective(input).filter((entry) => entry.severity === "error")).toEqual([]);
    const result = planSessionIntent(input);
    expect(result.status).toBe("planned");
    expect(result.sessionIntent?.needs).toHaveLength(1);
    expect(result.sessionIntent?.needs[0]).toMatchObject({ priority: "required", section: "main",
      selection: { requestedRole: "capacity" } });
    expect(planAndComposeSessionSkeleton(input).planning.status).toBe("planned");
  });

  it("rejects preferred capacity_main and competing dominant responsibilities", () => {
    const preferred = plannerInput({ directive: plannerDirective({ objectives: [plannerObjective({
      id: "preferred-capacity", kind: "capacity_main", priority: "preferred",
    })] }) });
    expect(validateSessionAllocationDirective(preferred).map((entry) => entry.code)).toContain("dominant_main_must_be_required");

    const competing = plannerInput({ directive: plannerDirective({ objectives: [
      plannerObjective({ id: "strength", kind: "dominant_main", priorityOrder: 0 }),
      plannerObjective({ id: "capacity", kind: "capacity_main", priorityOrder: 1 }),
    ] }) });
    expect(validateSessionAllocationDirective(competing).map((entry) => entry.code))
      .toContain("contradictory_required_dominant_objectives");
    expect(planSessionIntent(competing).status).toBe("contradictory_directive");
  });

  it("does not infer capacity from goal, phase, carry availability, or recovery", () => {
    const base = plannerInput();
    const changed = { ...base, directive: plannerDirective({ outcomeGoal: "conditioning" }),
      phaseIntent: { ...base.phaseIntent, developedQualities: ["capacity prose"], primaryGoal: "conditioning" as const } };
    expect(planSessionIntent(changed).sessionIntent?.needs.map((entry) => entry.selection.requestedRole))
      .toEqual(["primary_strength"]);

    const recovery = plannerInput({ directive: plannerDirective({ objectives: [plannerObjective({
      id: "recovery", kind: "recovery", priority: "required",
    })] }) });
    const codes = validateSessionAllocationDirective(recovery).map((entry) => entry.code);
    expect(codes).toContain("recovery_cannot_be_required_dominant_work");
    expect(codes).toContain("ordinary_session_requires_dominant_main_objective");
  });
});
