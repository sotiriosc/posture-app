import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PRODUCT_TRAINING_GOAL_AUDIT_FINGERPRINTS,
  buildProductTrainingGoalAuditReport } from "../cagt/productTrainingGoalAudit";

const workspaceRoot = process.cwd().endsWith("packages/training-engine-v2") ?
  resolve(process.cwd(), "../..") : process.cwd();
const read = (path: string) => readFileSync(resolve(workspaceRoot, path), "utf8");

function sourceFiles(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name);
    if (entry.isDirectory()) {
      if (child.endsWith("/productGoalArchitecture")) return [];
      return sourceFiles(child);
    }
    return /\.(?:ts|tsx)$/.test(entry.name) ? [child] : [];
  });
}

describe("Product goal architecture activation and behavior guards", () => {
  it("keeps the inert namespace disconnected from every runtime and app source", () => {
    const roots = [
      "packages/training-engine-v2/src",
      "packages/engine/src",
      "apps/consumer/src",
      "apps/gyms/src",
    ];
    const imports = roots.flatMap((root) => sourceFiles(resolve(workspaceRoot, root)))
      .filter((path) => readFileSync(path, "utf8").includes("productGoalArchitecture"));
    expect(imports).toEqual([]);
    expect(read("packages/training-engine-v2/src/index.ts")).not.toContain("productGoalArchitecture");
    expect(JSON.parse(read("packages/training-engine-v2/package.json")).exports)
      .not.toHaveProperty("./product-goal-architecture");
  });

  it("freezes current Product options, mappings, and compiler fallthrough", () => {
    for (const path of [
      "apps/consumer/src/components/QuestionnaireForm.tsx",
      "apps/gyms/src/components/QuestionnaireForm.tsx",
    ]) {
      const options = read(path).match(/const goalOptions = \[([\s\S]*?)\];/)?.[1];
      expect(options?.match(/"[^"]+"/g)).toEqual([
        "\"Improve posture\"", "\"Reduce pain\"", "\"Athletic performance\"", "\"General fitness\"",
      ]);
      expect(options).not.toContain("Build strength");
      expect(options).not.toContain("Build muscle");
    }
    const mappings = read("packages/engine/src/controlledProductShadow/mappings.ts");
    for (const option of ["Improve posture", "Reduce pain", "General fitness", "Athletic performance"]) {
      expect(mappings).toContain(`goal === "${option}"`);
    }
    expect(mappings).not.toContain('goal === "Build strength"');
    expect(mappings).not.toContain('goal === "Build muscle"');
    expect(read("packages/training-engine-v2/src/prescription/compiler/compilePrescriptionAssignment.ts"))
      .toContain('return goal === "hypertrophy" ? "main_hypertrophy" : "main_strength";');
  });

  it("preserves the audited 12-exercise gap and upstream evidence", () => {
    const audit = buildProductTrainingGoalAuditReport();
    expect(audit).toMatchObject({
      productionBehaviorChanged: false,
      productBehaviorChanged: false,
      shadowRolloutChanged: false,
      selectedPolicy: false,
      publicApiChanges: 0,
      productionCodeChanges: 0,
      compilerFallthroughGoalCount: 5,
    });
    expect(audit.affectedExercises).toHaveLength(12);
    expect(PRODUCT_TRAINING_GOAL_AUDIT_FINGERPRINTS.combinedAudit)
      .toBe("0606f9cd19d73e8cf683080c3b71fad1af7eb19d0c873a2361e294cde3be27fb");
  });
});
