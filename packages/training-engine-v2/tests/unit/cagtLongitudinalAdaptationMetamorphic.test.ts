import { describe, expect, it } from "vitest";
import { runLongitudinalMetamorphicChecks } from "../helpers/longitudinalAdaptationDesignLab";

describe("Gate 16 metamorphic behavior", () => {
  it("is invariant to nonsemantic ordering, provenance, labels, catalog order, and phase labels", () => {
    const result = runLongitudinalMetamorphicChecks();
    expect(result).toMatchObject({ invariantCheckCount: 15, materialResponseCheckCount: 13, failureCount: 0 });
    expect(result.rows.every((row) => row.passed && row.validationReasons.length === 0)).toBe(true);
    expect(new Set(result.materialRows.map((row) => `${row.status}:${row.action}`)).size)
      .toBeGreaterThanOrEqual(7);
  });
});
