import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function recursiveSource(root: string): string {
  return readdirSync(root).sort().flatMap((name) => {
    const path = resolve(root, name);
    return statSync(path).isDirectory() ? [recursiveSource(path)] : /\.(ts|tsx|js|jsx)$/.test(name)
      ? [readFileSync(path, "utf8")] : [];
  }).join("\n");
}

describe("production post-Prescription Week activation guards", () => {
  it("exports an inert API without wiring any current runtime consumer", () => {
    const workspace = resolve(process.cwd(), "../..");
    const appSource = recursiveSource(resolve(workspace, "apps"));
    const productionSource = recursiveSource(resolve(process.cwd(), "src"));
    const weekValidationSource = recursiveSource(resolve(process.cwd(), "src/weekValidation"));
    const orchestrationSource = readdirSync(resolve(process.cwd(), "src"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory() &&
        entry.name !== "weekValidation" && entry.name !== "weekValidationV1_1")
      .map((entry) => recursiveSource(resolve(process.cwd(), "src", entry.name))).join("\n");
    const rootIndex = readFileSync(resolve(process.cwd(), "src/index.ts"), "utf8");
    const weekIndex = readFileSync(resolve(process.cwd(), "src/weekValidation/index.ts"), "utf8");
    expect(rootIndex).toContain('export * from "./weekValidation"');
    expect(weekIndex).not.toContain("designContracts");
    expect(appSource).not.toContain("validatePostPrescriptionWeek");
    expect(appSource).not.toContain("POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_SUPPORTED_CORE");
    expect(orchestrationSource).not.toContain("validatePostPrescriptionWeek");
    expect(orchestrationSource).not.toContain("postPrescriptionWeekDesignAdapter");
    expect(productionSource).not.toContain("tests/helpers");
    expect(productionSource).not.toContain("tests/cagt");
    expect(productionSource).not.toContain("process.env.POST_PRESCRIPTION_WEEK");
    expect(weekValidationSource).not.toContain("PerformanceResult");
    expect(weekValidationSource).not.toContain("LongitudinalAdaptation");
  });
});
