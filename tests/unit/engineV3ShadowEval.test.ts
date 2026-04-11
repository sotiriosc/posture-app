import { describe, expect, test } from "vitest";

import {
  SHADOW_EVAL_DEFAULTS,
  SHADOW_EVAL_SCENARIOS,
  evaluateShadowMatrix,
  evaluateShadowScenario,
  renderShadowEvaluationJson,
  renderShadowEvaluationMarkdown,
  type ShadowScenario,
} from "@/lib/engine_v3_eval";

describe("engine_v3 shadow evaluation", () => {
  test("evaluator is deterministic for the same scenario subset", () => {
    const scenarios = SHADOW_EVAL_SCENARIOS.slice(0, 2);

    const first = evaluateShadowMatrix({
      scenarios,
      ...SHADOW_EVAL_DEFAULTS,
    });
    const second = evaluateShadowMatrix({
      scenarios,
      ...SHADOW_EVAL_DEFAULTS,
    });

    expect(renderShadowEvaluationJson(first)).toBe(renderShadowEvaluationJson(second));
  });

  test("evaluator catches missing family coverage and missing slots", () => {
    const scenario: ShadowScenario = {
      ...SHADOW_EVAL_SCENARIOS[0],
      id: "forced-gap",
      label: "Forced V3 gap",
      v3CapabilityProfile: {
        availableEquipment: ["none"],
        blockedFamilies: ["vert_push", "vert_pull", "hinge"],
        allowOverheadLoading: false,
        allowUnsupportedHinge: false,
      },
    };

    const report = evaluateShadowScenario({
      scenario,
      nowIso: SHADOW_EVAL_DEFAULTS.nowIso,
    });

    expect(report.v3.repairMetrics.missingSlots).toBeGreaterThan(0);
    expect(report.v3.blockMetrics.missingFamilies.length).toBeGreaterThan(0);
  });

  test("evaluator records measurable gym experience-bias differences", () => {
    const scenarios = SHADOW_EVAL_SCENARIOS.filter((scenario) =>
      ["gym-beginner-general-none", "gym-intermediate-general-none", "gym-advanced-general-none"].includes(
        scenario.id
      )
    );

    const report = evaluateShadowMatrix({
      scenarios,
      ...SHADOW_EVAL_DEFAULTS,
    });
    const v3GymBias = report.summary.experienceBias.v3.find(
      (check) => check.equipment === "gym"
    );

    expect(v3GymBias?.measurable).toBe(true);
    expect(v3GymBias?.beginnerStability).not.toBeNull();
    expect(v3GymBias?.advancedComplexity).not.toBeNull();
  });

  test("evaluator produces a stable report shape and markdown sections", () => {
    const report = evaluateShadowMatrix({
      scenarios: SHADOW_EVAL_SCENARIOS.slice(0, 1),
      ...SHADOW_EVAL_DEFAULTS,
    });
    const markdown = renderShadowEvaluationMarkdown(report);

    expect(report.evaluationVersion).toBe("engine_v3_shadow_eval_v1");
    expect(report.summary.verdict).toBeTruthy();
    expect(report.scenarios[0]?.scenario.id).toBe("none-beginner-general-none");
    expect(markdown).toContain("# Engine V3 Shadow Evaluation");
    expect(markdown).toContain("## Verdict");
    expect(markdown).toContain("## Scenario Matrix");
  });
});
