import { describe, expect, it } from "vitest";
import { productionOutcomeSourceEvidenceSummary } from "../helpers/productionOutcomeSourceEvidence";

describe("production outcome source deterministic evidence", () => {
  it("passes controlled, mutation, metamorphic, holdout, and required pure stress", () => {
    const evidence = productionOutcomeSourceEvidenceSummary();
    expect(evidence.controlled).toMatchObject({ scenarioCount: 180, failureCount: 0 });
    expect(evidence.foundationHoldoutCount).toBe(360);
    expect(evidence.mutations.acceptedMutationCount).toBe(0);
    expect(evidence.mutations.mutationCount).toBeGreaterThanOrEqual(60);
    expect(evidence.metamorphic.failureCount).toBe(0);
    expect(evidence.stress).toMatchObject({ adapterValidations: 10_000, idempotencyComparisons: 10_000,
      dedupComparisons: 10_000, activeRevisionSelections: 10_000, snapshotBuilds: 10_000,
      deterministicReplays: 5_000, failureCount: 0,
      result: "PRODUCTION_OUTCOME_SOURCE_PERSISTENCE_STRESS_PASS" });
  }, 45_000);
});
