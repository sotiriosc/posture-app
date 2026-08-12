import { describe, expect, it } from "vitest";
import { planSessionIntent } from "../../src";
import { behavioralSignature, plannerDirective, plannerInput, plannerObjective } from "../helpers/sessionIntentPlannerProduction";

describe("Session Intent Planner boundaries", () => {
  it("maps all objective kinds to their fixed section and role", () => {
    const kinds = [
      ["dominant_main", "main", "primary_strength", "required"],
      ["secondary_main", "main", "secondary_strength", "preferred"],
      ["secondary_accessory", "accessory", "secondary_strength", "preferred"],
      ["direct_accessory", "accessory", "hypertrophy_accessory", "preferred"],
      ["capacity_main", "main", "capacity", "preferred"],
      ["capacity_accessory", "accessory", "capacity", "preferred"],
      ["explicit_preparation", "warmup", "preparation", "preferred"],
      ["activation", "activation", "activation", "preferred"],
      ["recovery", "cooldown", "recovery", "preferred"],
    ] as const;
    const objectives = kinds.map(([kind, , , priority], index) => plannerObjective({
      id: kind,
      kind,
      priority,
      priorityOrder: kind === "dominant_main" ? 0 : index - 1,
      selectionTarget: kind === "direct_accessory"
        ? { targetMovementRoles: ["accessory"], targetActionFunctions: ["elbow_flexion"], targetMuscles: ["biceps"], muscleRequirement: "primary_required", targetBodyRegions: ["elbow"] }
        : undefined,
    }));
    const result = planSessionIntent(plannerInput({ directive: plannerDirective({ objectives }) }));
    expect(result.status).toBe("planned");
    for (const [kind, section, role] of kinds) {
      const need = result.sessionIntent?.needs.find((entry) => entry.id.endsWith(`:${kind}`));
      expect(need).toMatchObject({ section, selection: { requestedRole: role } });
    }
  });

  it("creates at most one preferred enrichment per coherent high-confidence cluster", () => {
    const assessment = { signals: [
      { id: "a", type: "control_finding" as const, source: "movement_screen" as const, confidence: "high" as const, priority: "primary" as const,
        region: "shoulder" as const, movementRole: "horizontal_pull" as const, actionFunctions: ["scapular_retraction" as const], side: "bilateral" as const, description: "first" },
      { id: "b", type: "control_finding" as const, source: "coach_review" as const, confidence: "high" as const, priority: "blocking" as const,
        region: "shoulder" as const, movementRole: "horizontal_pull" as const, actionFunctions: ["scapular_retraction" as const], side: "bilateral" as const, description: "second" },
    ], historicalWeaknesses: [] };
    const result = planSessionIntent(plannerInput({ assessment }));
    const enrichment = result.sessionIntent?.needs.filter((need) => need.plannerProvenance?.owner === "session_intent_planner_assessment_enrichment") ?? [];
    expect(enrichment).toHaveLength(1);
    expect(enrichment[0]).toMatchObject({ priority: "preferred", section: "activation" });
    expect(enrichment[0].dependencies[0].actionFunctions).toContain("scapular_retraction");
  });

  it("carries structured mobility truth through a typed range dependency", () => {
    const assessment = { signals: [{ id: "range", type: "mobility_finding" as const, source: "movement_screen" as const,
      confidence: "high" as const, priority: "primary" as const, region: "shoulder" as const,
      movementRole: "horizontal_pull" as const, actionFunctions: ["scapular_retraction" as const], side: "left" as const,
      description: "Structured range finding." }], historicalWeaknesses: [] };
    const result = planSessionIntent(plannerInput({ assessment }));
    const requirement = result.sessionIntent?.needs.flatMap((need) => need.dependencies)
      .flatMap((dependency) => dependency.rangeRequirements ?? [])[0];
    expect(requirement).toMatchObject({ sourceAssessmentSignalId: "range", bodyRegion: "shoulder",
      actionFunction: "scapular_retraction", side: "left", reviewStatus: "accepted" });
  });

  it("does not create standalone needs from low confidence, direct weakness, pain, phase, or missed sessions", () => {
    const base = plannerInput();
    const assessment = { signals: [
      { id: "low", type: "control_finding" as const, source: "movement_screen" as const, confidence: "low" as const, priority: "primary" as const, movementRole: "horizontal_pull" as const, description: "low" },
      { id: "weak", type: "weakness_development_priority" as const, source: "coach_review" as const, confidence: "high" as const, priority: "primary" as const, muscleGroup: "biceps" as const, description: "weak" },
    ], historicalWeaknesses: [] };
    const changed = { ...base, assessment, history: { ...base.history, sessionHistory: { ...base.history.sessionHistory, missedSessionIds: ["missed"] } },
      phaseIntent: { ...base.phaseIntent, priorityMuscles: ["trunk" as const] }, painAndInjury: { ...base.painAndInjury,
        currentDiscomforts: [{ kind: "current_discomfort" as const, id: "pain", region: "shoulder" as const, severity0To10: 2 as const,
          stressTags: ["horizontal_pressing" as const], effect: "reduce_range" as const, description: "pain" }] } };
    expect(changed.assessment.signals).toHaveLength(2);
    expect(planSessionIntent(changed).sessionIntent?.needs).toHaveLength(1);
  });

  it("merges structurally equivalent allocated needs and retains provenance", () => {
    const objectives = [plannerObjective({ id: "main", kind: "dominant_main", priorityOrder: 0,
      selectionTarget: { targetMovementRoles: ["horizontal_push"], targetActionFunctions: [], targetMuscles: ["chest"], muscleRequirement: "primary_required", targetBodyRegions: ["shoulder"] } }),
      plannerObjective({ id: "secondary", kind: "secondary_main", priority: "preferred", priorityOrder: 0 }),
      plannerObjective({ id: "duplicate", kind: "secondary_main", priority: "preferred", priorityOrder: 1 })];
    const result = planSessionIntent(plannerInput({ directive: plannerDirective({ objectives }) }));
    expect(result.sessionIntent?.needs).toHaveLength(2);
    expect(result.mergedNeedTraces).toHaveLength(1);
    expect(result.sessionIntent?.needs.find((need) => need.selection.requestedRole === "secondary_strength")?.plannerProvenance?.objectiveIds)
      .toEqual(["duplicate", "secondary"]);
  });

  it("surfaces unresolved prose without parsing it and routes week changes outward", () => {
    const unresolved = { observationId: "sleep", source: "user prose", contextCategory: "recovery_readiness" as const,
      proposedOwner: "future_readiness_adapter", resolutionState: "requires_typed_input" as const, blocksPlanning: false, description: "Slept badly." };
    const result = planSessionIntent(plannerInput({ directive: plannerDirective({ unresolved: [unresolved] }) }));
    expect(result.status).toBe("planned");
    expect(result.unresolvedContextFindings).toEqual([{ observation: unresolved, code: "UNOWNED_CONTEXT_REQUIRES_REVIEW" }]);
    const reroute = planSessionIntent(plannerInput({ directive: plannerDirective({ weekReallocationEvidenceRefs: ["availability-changed"] }) }));
    expect(reroute.status).toBe("requires_week_reallocation");
  });

  it("keeps raw minutes from changing priorities while capacity changes admission", () => {
    const objectives = [plannerObjective({ id: "main", kind: "dominant_main" }),
      plannerObjective({ id: "calves", kind: "direct_accessory", priority: "optional", priorityOrder: 0,
        selectionTarget: { targetMovementRoles: ["accessory"], targetActionFunctions: ["ankle_plantar_flexion"], targetMuscles: ["calves"], muscleRequirement: "primary_required", targetBodyRegions: ["ankle"] } })];
    const short = planSessionIntent(plannerInput({ directive: plannerDirective({ id: "same", objectives, minutes: 10 }) }));
    const long = planSessionIntent(plannerInput({ directive: plannerDirective({ id: "same", objectives, minutes: 180 }) }));
    expect(behavioralSignature(short)).toEqual(behavioralSignature(long));
    const condensed = planSessionIntent(plannerInput({ directive: plannerDirective({ id: "same", objectives, capacity: "condensed" }) }));
    expect(condensed.sessionIntent?.needs.find((need) => need.priority === "optional")?.standaloneAdmission).toBe("shared_only");
  });
});
