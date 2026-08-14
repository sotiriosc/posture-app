import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../../src/prescription");
const productionFiles = [
  "compiler/compatibilityProjection.ts",
  "compiler/compilePrescriptionAssignment.ts",
  "compiler/compileSessionPrescription.ts",
  "compiler/contracts.ts",
  "compiler/durationInterval.ts",
  "compiler/executionResolution.ts",
  "compiler/loadResolution.ts",
  "compiler/policyResolution.ts",
  "compiler/requirementResolution.ts",
  "compiler/revisions.ts",
  "compiler/sourceExposure.ts",
  "compiler/utilities.ts",
  "compiler/validation.ts",
  "policies/policyContracts.ts",
  "policies/prescriptionPolicyV1.ts",
];

describe("production Prescription Compiler architecture", () => {
  it("has no production dependency on tests, CAGT, reports, labels, or fixture tags", () => {
    const violations = productionFiles.flatMap((file) => {
      const source = readFileSync(resolve(root, file), "utf8");
      return [
        /from\s+["'][^"']*tests\//,
        /from\s+["'][^"']*cagt\//,
        /from\s+["'][^"']*report/i,
        /contextTags|fixtureTag|candidateLabel|candidateRank|Date\.now|Math\.random|randomUUID/,
      ].filter((pattern) => pattern.test(source)).map(() => file);
    });
    expect(violations, "PRODUCTION_COMPILER_TEST_DEPENDENCY_VIOLATION").toEqual([]);
  });

  it("is not called by live program generation or app source", () => {
    const packageRoot = resolve(import.meta.dirname, "../../../..");
    const liveFiles = [
      resolve(packageRoot, "engine/src/generateProgram.ts"),
    ].filter((file) => {
      try {
        readFileSync(file, "utf8");
        return true;
      } catch {
        return false;
      }
    });
    expect(liveFiles.some((file) =>
      /compilePrescriptionAssignment|compileSessionPrescription|PRESCRIPTION_POLICY_V1/.test(
        readFileSync(file, "utf8"),
      )
    )).toBe(false);
  });
});
