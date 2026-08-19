import { describe, expect, it } from "vitest";
import { GOAL_SPECIFIC_CONTROLLED_SCENARIOS } from
  "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/scenarioManifest";
import { createGoalSpecificArtifactStore, runGoalSpecificScenario } from
  "../controlledProductShadowGoalEvidence/runner";

describe("Goal-specific controlled Product Shadow evidence", () => {
  it("executes a complete fixture through genuine B1-B4 kernels", async () => {
    const declaration = GOAL_SPECIFIC_CONTROLLED_SCENARIOS.find((entry) =>
      entry.fixture.goal === "Get stronger" && entry.fixture.equipmentDetail === "gym_exact")!;
    const store = createGoalSpecificArtifactStore();
    const result = await runGoalSpecificScenario({ declaration, store });
    expect(result.summary.pipelineStatus).toMatch(/^shadow_program_complete/);
    expect(result.summary.terminalClass).toBe("calibration_complete");
    expect(result.summary.completedStages).toHaveLength(13);
    expect(result.summary.fullProgramSnapshotId).not.toBeNull();
    expect(result.state?.gate13V12?.status).toMatch(/^validated_/);
    expect(result.state?.phaseSnapshot?.completedEvidenceInferred).toBe(false);
    expect(result.summary.longitudinalStatus).toBe("restricted_insufficient_evidence");
    expect(result.summary.orchestrationStatus).toBe("no_action_no_application");
    expect(result.summary.deliveredToUser).toBe(false);
    expect(store.index().latestFallbackCount).toBe(0);
  });
});
