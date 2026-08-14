import { describe, expect, it } from "vitest";
import {
  runPhaseContinuityMetamorphicSuite,
  runPhaseContinuityMutationSuite,
} from "../helpers/phaseContinuityDesignLab";

describe("Gate 15 semantic mutation and metamorphic behavior", () => {
  it("rejects or rightfully attributes every semantic mutation", () => {
    const mutations = runPhaseContinuityMutationSuite();
    expect(mutations.mutationCount).toBeGreaterThanOrEqual(20);
    expect(mutations.failureCount).toBe(0);
    expect(mutations.passedCount).toBe(mutations.mutationCount);
  });

  it("ignores ordering, prose, provenance order, and week-count-only changes", () => {
    const metamorphic = runPhaseContinuityMetamorphicSuite();
    expect(metamorphic.invariantFailureCount).toBe(0);
    expect(metamorphic.materialResponseCount).toBe(2);
  });
});
