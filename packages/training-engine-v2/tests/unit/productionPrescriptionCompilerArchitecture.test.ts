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
const compilerV1_2Root = resolve(root, "compilerV1_2");
const purposeResolutionRoot = resolve(root, "purposeResolution");
const purposeResolutionV1_1Root = resolve(root, "purposeResolutionV1_1");
const policyRoot = resolve(root, "policies");
const policyV2Root = resolve(root, "policiesV2");
const productionFiles = [
  ...productionTypeScriptFiles(compilerRoot),
  ...productionTypeScriptFiles(compilerV1_1Root),
  ...productionTypeScriptFiles(compilerV1_2Root),
  ...productionTypeScriptFiles(purposeResolutionRoot),
  ...productionTypeScriptFiles(purposeResolutionV1_1Root),
  ...productionTypeScriptFiles(policyRoot),
  ...productionTypeScriptFiles(policyV2Root),
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

  it("is activated only through controlled-owner delivery", () => {
    const excludedRoots = [compilerRoot, compilerV1_1Root, compilerV1_2Root, purposeResolutionRoot,
      purposeResolutionV1_1Root, policyRoot, policyV2Root];
    const ownerDeliveryRoot = resolve(repositoryRoot, "packages/training-engine-v2/src/ownerDelivery");
    const ownerDeliveryFiles = productionTypeScriptFiles(ownerDeliveryRoot);
    const liveFiles = [
      ...productionTypeScriptFiles(resolve(repositoryRoot, "apps")),
      ...productionTypeScriptFiles(resolve(repositoryRoot, "packages/engine/src")),
      ...productionTypeScriptFiles(resolve(repositoryRoot, "packages/training-engine-v2/src")),
    ].filter((file) => !excludedRoots.some((excluded) => file.startsWith(`${excluded}/`)) &&
      !file.startsWith(`${ownerDeliveryRoot}/`));
    const violations = liveFiles.filter((file) =>
      /\b(?:compilePrescriptionAssignment|compileSessionPrescription|PRESCRIPTION_POLICY_V1)\b/.test(
        readFileSync(file, "utf8"),
      )
    ).map((file) => file.slice(repositoryRoot.length + 1));
    const ownerActivation = ownerDeliveryFiles.filter((file) =>
      /\bcompileSessionPrescription\b/.test(readFileSync(file, "utf8")),
    ).map((file) => file.slice(repositoryRoot.length + 1));
    expect(liveFiles.length).toBeGreaterThan(0);
    expect(violations, "PRODUCTION_COMPILER_ACTIVATION_BOUNDARY_VIOLATION").toEqual([]);
    expect(ownerActivation).toEqual([
      "packages/training-engine-v2/src/ownerDelivery/pipeline.ts",
    ]);
  });
});
