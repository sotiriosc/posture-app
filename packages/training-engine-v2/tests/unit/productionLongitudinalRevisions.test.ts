import { describe, expect, it } from "vitest";
import {
  evaluateLongitudinalAdaptation,
  validateProductionLongitudinalAdaptationResult,
  validateProductionLongitudinalDecisionRevisionLedger,
  validateProductionLongitudinalStateRevisionLedger,
} from "../../src/longitudinalAdaptation";
import { LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS } from
  "../cagt/longitudinalAdaptationCohorts";
import { buildProductionLongitudinalAdaptationInput } from
  "../helpers/productionLongitudinalAdaptationLab";

describe("production Longitudinal identities and revisions", () => {
  const input = buildProductionLongitudinalAdaptationInput(
    LONGITUDINAL_ADAPTATION_GATE_16_V1_HOLDOUT_DESCRIPTORS[85]);

  it("keeps stable thread/state/decision identities and exactly one final revision", () => {
    const first = evaluateLongitudinalAdaptation(input);
    const second = evaluateLongitudinalAdaptation(input);
    expect(first.threadId).toBe(second.threadId);
    expect(first.stateId).toBe(second.stateId);
    expect(first.decisionId).toBe(second.decisionId);
    expect(first.decisionRevisionId).toBe(second.decisionRevisionId);
    expect(validateProductionLongitudinalStateRevisionLedger(input.stateRevisionLedger)).toEqual([]);
    expect(validateProductionLongitudinalDecisionRevisionLedger(first.decisionRevisionLedger)).toEqual([]);
    expect(first.decisionRevisionLedger.revisions.filter((revision) => revision.final)).toHaveLength(1);
    expect(validateProductionLongitudinalAdaptationResult(first)).toEqual([]);
  });

  it("rejects rewritten final-state identity and downstream rescue", () => {
    const state = structuredClone(input.stateRevisionLedger);
    (state.revisions as unknown[]).push(state.revisions[0]);
    expect(validateProductionLongitudinalStateRevisionLedger(state)).toEqual(expect.arrayContaining([
      "DUPLICATE_LONGITUDINAL_STATE_REVISION_ID", "EXACTLY_ONE_FINAL_LONGITUDINAL_STATE_REVISION_REQUIRED",
    ]));
    const failed = structuredClone(input);
    (failed.upstreamAuthority as { currentProgramTruthValid: boolean }).currentProgramTruthValid = false;
    const result = evaluateLongitudinalAdaptation(failed);
    const failureIndex = result.subgateTrace.findIndex((entry) => entry.subgate === result.firstFailingSubgate);
    expect(result.subgateTrace.slice(failureIndex + 1).every((entry) => !entry.scored)).toBe(true);
  });
});
