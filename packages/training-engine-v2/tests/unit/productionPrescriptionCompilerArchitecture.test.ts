import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../../src/prescription");
const repositoryRoot = resolve(import.meta.dirname, "../../../..");

function productionTypeScriptFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return productionTypeScriptFiles(path);
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  }).sort();
}

const compilerRoot = resolve(root, "compiler");
const compilerV1_1Root = resolve(root, "compilerV1_1");
const purposeResolutionRoot = resolve(root, "purposeResolution");
const policyRoot = resolve(root, "policies");
const productionFiles = [
  ...productionTypeScriptFiles(compilerRoot),
  ...productionTypeScriptFiles(compilerV1_1Root),
  ...productionTypeScriptFiles(purposeResolutionRoot),
  ...productionTypeScriptFiles(policyRoot),
];

describe("production Prescription Compiler architecture", () => {
  it("has no production dependency on tests, CAGT, reports, labels, or fixture tags", () => {
    const violations = productionFiles.flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return [
        /from\s+["'][^"']*tests\//,
        /from\s+["'][^"']*cagt\//,
        /from\s+["'][^"']*report/i,
        /contextTags|fixtureTag|candidateLabel|candidateRank|Date\.now|Math\.random|randomUUID/,
      ].filter((pattern) => pattern.test(source)).map(() =>
        file.slice(repositoryRoot.length + 1)
      );
    });
    expect(productionFiles.length).toBeGreaterThan(0);
    expect(violations, "PRODUCTION_COMPILER_TEST_DEPENDENCY_VIOLATION").toEqual([]);
  });

  it("is not called by live program generation or app source", () => {
    const excludedRoots = [compilerRoot, compilerV1_1Root, purposeResolutionRoot, policyRoot];
    const liveFiles = [
      ...productionTypeScriptFiles(resolve(repositoryRoot, "apps")),
      ...productionTypeScriptFiles(resolve(repositoryRoot, "packages/engine/src")),
      ...productionTypeScriptFiles(resolve(repositoryRoot, "packages/training-engine-v2/src")),
    ].filter((file) => !excludedRoots.some((excluded) => file.startsWith(`${excluded}/`)));
    const violations = liveFiles.filter((file) =>
      /\b(?:compilePrescriptionAssignment|compileSessionPrescription|PRESCRIPTION_POLICY_V1)\b/.test(
        readFileSync(file, "utf8"),
      )
    ).map((file) => file.slice(repositoryRoot.length + 1));
    expect(liveFiles.length).toBeGreaterThan(0);
    expect(violations, "PRODUCTION_COMPILER_ACTIVATION_BOUNDARY_VIOLATION").toEqual([]);
  });
});
