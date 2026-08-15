import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildProductTrainingGoalAuditReport } from "../cagt/productTrainingGoalAudit";

const workspaceRoot = process.cwd().endsWith("packages/training-engine-v2") ?
  resolve(process.cwd(), "../..") : process.cwd();
const read = (path: string) => readFileSync(resolve(workspaceRoot, path), "utf8");

describe("Product training goal activation guards", () => {
  it("keeps both Product goal surfaces on the four-option baseline", () => {
    for (const path of [
      "apps/consumer/src/components/QuestionnaireForm.tsx",
      "apps/gyms/src/components/QuestionnaireForm.tsx",
    ]) {
      const source = read(path);
      const options = source.match(/const goalOptions = \[([\s\S]*?)\];/)?.[1];
      expect(options).toBeDefined();
      expect(options?.match(/"[^"]+"/g)).toEqual([
        "\"Improve posture\"", "\"Reduce pain\"", "\"Athletic performance\"", "\"General fitness\"",
      ]);
      expect(options).not.toContain("Build strength");
      expect(options).not.toContain("Build muscle");
    }
  });

  it("keeps the observed compiler branch and shadow mappings unchanged", () => {
    const compiler = read("packages/training-engine-v2/src/prescription/compiler/compilePrescriptionAssignment.ts");
    expect(compiler).toContain(
      "return goal === \"hypertrophy\" ? \"main_hypertrophy\" : \"main_strength\";");
    const mappings = read("packages/engine/src/controlledProductShadow/mappings.ts");
    expect(mappings).toContain('goal === "Improve posture"');
    expect(mappings).toContain('goal === "Reduce pain"');
    expect(mappings).toContain('goal === "General fitness"');
    expect(mappings).toContain('goal === "Athletic performance"');
    expect(mappings).not.toContain('goal === "Build strength"');
    expect(mappings).not.toContain('goal === "Build muscle"');
  });

  it("records zero runtime, API, rollout, policy-selection, and activation changes", () => {
    expect(buildProductTrainingGoalAuditReport()).toMatchObject({
      productionBehaviorChanged: false,
      productBehaviorChanged: false,
      shadowRolloutChanged: false,
      selectedPolicy: false,
      publicApiChanges: 0,
      productionCodeChanges: 0,
    });
  });
});
