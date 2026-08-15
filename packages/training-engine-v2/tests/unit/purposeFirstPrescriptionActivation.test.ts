import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PRODUCTION_PRESCRIPTION_COMPILER_VERSION_COMPATIBILITY } from "../../src";
import { runPurposeFirstGoldenPairs } from
  "../cagt/purposeFirstPrescriptionResolverEvidence";

const workspaceRoot = process.cwd().endsWith("packages/training-engine-v2") ?
  resolve(process.cwd(), "../..") : process.cwd();

function source(root: string): string {
  const path = resolve(workspaceRoot, root);
  const visit = (candidate: string): string[] => readdirSync(candidate).flatMap((name) => {
    const child = resolve(candidate, name);
    return statSync(child).isDirectory() ? visit(child) : /\.[cm]?[jt]sx?$/.test(child) ? [child] : [];
  });
  return visit(path).map((file) => readFileSync(file, "utf8")).join("\n");
}

describe("Purpose-first Prescription activation guards", () => {
  it("keeps Product Shadow pinned to V1.0 with no V1.1 or resolver import", () => {
    const shadow = source("packages/training-engine-v2/src/productShadow");
    expect(shadow).not.toMatch(/compilerV1_1|compilePrescriptionAssignmentV1_1|compileSessionPrescriptionV1_1/);
    expect(shadow).not.toMatch(/purposeResolution|purposeFirstPrescriptionResolverV1/);
    expect(PRODUCTION_PRESCRIPTION_COMPILER_VERSION_COMPATIBILITY).toMatchObject({
      v1_0: { productShadowPinned: true, currentBehaviorFrozen: true },
      v1_1: { productShadowCallerCount: 0, activated: false },
      defaultCompilerVersion: null,
      automaticMigrationAllowed: false,
    });
  });

  it("keeps orchestration and app roots free of V1.1 compiler calls", () => {
    const orchestration = source("packages/training-engine-v2/src/applicationOrchestration");
    const apps = source("apps");
    expect(orchestration).not.toMatch(/compilePrescriptionAssignmentV1_1\(|compileSessionPrescriptionV1_1\(/);
    expect(apps).not.toMatch(/compilerV1_1|purposeFirstPrescriptionResolverV1|compileSessionPrescriptionV1_1/);
  });

  it("retains exact supported V1.0 behavior through the shared core", () => {
    expect(runPurposeFirstGoldenPairs().every((pair) => pair.semanticsEqual)).toBe(true);
  });
});
