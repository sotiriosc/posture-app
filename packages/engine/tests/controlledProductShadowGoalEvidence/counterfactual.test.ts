import { describe, expect, it } from "vitest";
import { compareGoalSpecificFullPrograms } from
  "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/comparisons";
import { GOAL_SPECIFIC_CAUSAL_PAIR_MATRIX } from
  "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/pairManifest";
import { GOAL_SPECIFIC_CONTROLLED_SCENARIOS } from
  "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/scenarioManifest";
import { createGoalSpecificArtifactStore, runGoalSpecificScenario } from "./runner";

describe("Goal-specific controlled counterfactuals", () => {
  it("proves one representative from every causal family with Gate 14", async () => {
    for (const pair of GOAL_SPECIFIC_CAUSAL_PAIR_MATRIX.slice(0, 8)) {
      const baseline = GOAL_SPECIFIC_CONTROLLED_SCENARIOS.find((entry) =>
        entry.contract.scenarioId === pair.baselineScenarioId)!;
      const counterfactual = GOAL_SPECIFIC_CONTROLLED_SCENARIOS.find((entry) =>
        entry.contract.scenarioId === pair.counterfactualScenarioId)!;
      const left = await runGoalSpecificScenario({ declaration: baseline,
        store: createGoalSpecificArtifactStore() });
      const right = await runGoalSpecificScenario({ declaration: counterfactual,
        store: createGoalSpecificArtifactStore() });
      expect(left.state?.fullProgramSnapshot).toBeDefined();
      expect(right.state?.fullProgramSnapshot).toBeDefined();
      const comparison = compareGoalSpecificFullPrograms({ pair,
        baseline: left.state!.fullProgramSnapshot!,
        counterfactual: right.state!.fullProgramSnapshot! });
      expect(comparison.validationFailures).toEqual([]);
      expect(comparison.result.firstFailingSubgate).toBeNull();
      expect(comparison.result.finalClassification).toMatch(
        /^PROGRAM_(MATERIAL_ADAPTATION_PRESERVED|EXPECTED_CONVERGENCE|JUSTIFIED_CONVERGENCE)$/);
    }
  });
});
