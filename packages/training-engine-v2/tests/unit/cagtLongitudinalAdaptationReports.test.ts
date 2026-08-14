import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildLongitudinalAdaptationReports,
  LONGITUDINAL_ADAPTATION_CLASSIFICATION,
  LONGITUDINAL_ADAPTATION_REPORT_FILENAMES,
} from "../cagt/longitudinalAdaptationReport";

describe("Gate 16 reports", () => {
  it("builds and freezes all 32 required artifacts", () => {
    const reports = buildLongitudinalAdaptationReports();
    expect(LONGITUDINAL_ADAPTATION_REPORT_FILENAMES).toHaveLength(32);
    expect(Object.keys(reports).sort()).toEqual([...LONGITUDINAL_ADAPTATION_REPORT_FILENAMES].sort());
    const packageRoot = process.cwd().endsWith("packages/training-engine-v2") ? process.cwd() :
      resolve(process.cwd(), "packages/training-engine-v2");
    for (const filename of LONGITUDINAL_ADAPTATION_REPORT_FILENAMES) {
      expect(readFileSync(resolve(packageRoot, "../../docs/training-engine-v2", filename), "utf8"), filename)
        .toBe(reports[filename]);
    }
  });

  it("states readiness without claiming production runtime", () => {
    expect(LONGITUDINAL_ADAPTATION_CLASSIFICATION)
      .toBe("LONGITUDINAL_ADAPTATION_GATE_16_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION");
    const report = buildLongitudinalAdaptationReports()["LONGITUDINAL_ADAPTATION_IMPLEMENTATION_READINESS.md"];
    expect(report).toContain("OWNER_AUTHORIZATION_FOR_PRODUCTION_LONGITUDINAL_ADAPTATION_KERNEL_IMPLEMENTATION");
    expect(report).toContain("does not implement, export, activate, or wire a production Longitudinal Adaptation kernel");
  });
});
