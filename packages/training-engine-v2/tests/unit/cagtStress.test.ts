import { describe, expect, it } from "vitest";
import { computeCagtFingerprints, EXPECTED_CAGT_FINGERPRINTS } from "../cagt/report";
import { runCagtCounterfactualStress, runCagtExecutablePipelineStress, runCagtMetamorphicMutations } from "../cagt/stress";

describe("CAGT deterministic stress", () => {
  it("runs 10,000 one-variable pairs deterministically", () => {
    const result = runCagtCounterfactualStress();
    expect(result).toMatchObject({ cases: 10_000, failures: [] });
    expect(result.digest).toMatch(/^[a-f0-9]{64}$/);
  }, 30_000);

  it("runs 1,000 currently executable gated pipelines", () => {
    expect(runCagtExecutablePipelineStress()).toEqual(expect.objectContaining({ cases: 1_000, failures: [] }));
  });

  it("survives order, reason, source, catalog, label, threshold, shadow, and inconclusive mutations", () => {
    expect(Object.values(runCagtMetamorphicMutations()).every(Boolean)).toBe(true);
  });

  it("creates all 22 named fingerprints plus the combined tool fingerprint", () => {
    const fingerprints = computeCagtFingerprints();
    expect(Object.keys(fingerprints)).toHaveLength(23);
    expect(Object.values(fingerprints).every((value) => /^[a-f0-9]{64}$/.test(value))).toBe(true);
    expect(fingerprints).toEqual(EXPECTED_CAGT_FINGERPRINTS);
  }, 60_000);
});
