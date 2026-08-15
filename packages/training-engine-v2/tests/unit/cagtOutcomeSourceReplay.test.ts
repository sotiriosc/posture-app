import { describe, expect, it } from "vitest";
import { LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS } from
  "../cagt/longitudinalAdaptationCohorts";
import { replayOutcomeSourceHistory, runOutcomeSourceReplayEvidence } from "../cagt/outcomeSourceReplay";
import { buildProductionLongitudinalAdaptationInput } from "../helpers/productionLongitudinalAdaptationLab";
import { runOutcomeSourceGoldenEquivalence } from "../helpers/outcomeSourceDesignLab";

describe("deterministic outcome source replay and golden equivalence", () => {
  it("rebuilds one history independently of immutable event order without application", () => {
    const replay = replayOutcomeSourceHistory(buildProductionLongitudinalAdaptationInput(
      LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS[0]));
    expect(replay).toMatchObject({ byteEquivalentSnapshot: true, byteEquivalentDecision: true,
      duplicateDecisionCount: 0, directiveApplicationCount: 0, hiddenClockReadCount: 0,
      randomIdCount: 0, environmentDependentCount: 0 });
  });

  it("freezes at least 240 complete replay histories", () => {
    expect(runOutcomeSourceReplayEvidence()).toMatchObject({ replayHistoryCount: 240,
      duplicateDecisionCount: 0, applicationCount: 0, failureCount: 0 });
  });

  it("matches every admitted Production Longitudinal controlled/shell/holdout case", () => {
    expect(runOutcomeSourceGoldenEquivalence()).toMatchObject({ comparisonCount: 530,
      controlledCount: 130, fixedShellCount: 40, holdoutCount: 360, semanticMismatchCount: 0,
      result: "OUTCOME_SOURCE_LONGITUDINAL_GOLDEN_EQUIVALENCE_PASS" });
  });
});
