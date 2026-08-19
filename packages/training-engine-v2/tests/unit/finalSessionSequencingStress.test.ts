import { describe, expect, it } from "vitest";
import { buildFinalSessionSequencingAdmissionReport } from "../helpers/sessionSequencingDesignLab";

describe("Final Session Sequencing V1 deterministic stress", () => {
  it("covers the fixed-seed comparison and genuine-search floors", () => {
    const stress = buildFinalSessionSequencingAdmissionReport().stress;
    expect(stress.policySessionComparisonCount).toBeGreaterThanOrEqual(10_000);
    expect(stress.genuineCompleteSessionSearchCount).toBeGreaterThanOrEqual(1_000);
    expect(stress.deterministicMismatchCount).toBe(0);
    expect(stress.blockMutationRejectionCount).toBeGreaterThan(0);
    expect(stress.sourceMutationRejectionCount).toBeGreaterThan(0);
    expect(stress.pairingMutationRejectionCount).toBeGreaterThan(0);
    expect(stress.randomOrderRejectionCount).toBeGreaterThan(0);
    expect(stress.result).toBe("DETERMINISTIC_STRESS_PASSED");
  });
});
