import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16,
  validateCagtEffectiveAuthorityRegistryV16,
} from "../../../training-engine-v2/tests/cagt/goalSpecificProductShadowEvidence/cagt";
import {
  GOAL_SPECIFIC_PRODUCT_SHADOW_JSON_FILENAMES,
  GOAL_SPECIFIC_PRODUCT_SHADOW_MARKDOWN_FILENAMES,
  buildGoalSpecificProductShadowMarkdownReports,
} from "./reportAssembly";
import { runGoalSpecificProductShadowEvidenceSuite } from "./evidenceSuite";

const workspaceRoot = resolve(process.cwd().endsWith("packages/engine") ? process.cwd() :
  resolve(process.cwd(), "packages/engine"), "../..");
const docsRoot = resolve(workspaceRoot, "docs/training-engine-v2");

describe("Goal-specific controlled Product Shadow pipeline evidence", () => {
  it("executes the complete corpus through genuine kernels and hard causal thresholds", async () => {
    const result = await runGoalSpecificProductShadowEvidenceSuite();
    expect(result.failures).toEqual([]);
    expect(result.classification).toBe(
      "GOAL_SPECIFIC_CONTROLLED_PRODUCT_SHADOW_EVIDENCE_V1_READY_FOR_SCREENSHOT_GUIDED_PRODUCT_GOAL_INPUT_DESIGN_AUTHORIZATION");
    expect(result.controlledScenarioCount).toBe(600);
    expect(result.fixedShellCount).toBe(160);
    expect(result.causalPairCount).toBe(260);
    expect(result.holdoutCount).toBe(850);
    expect(result.genuinePipelineExecutionCount).toBeGreaterThanOrEqual(450);
    expect(result.fullProgramSnapshotCount).toBeGreaterThanOrEqual(520);
    expect(result.honestIncompleteCount).toBeGreaterThanOrEqual(250);
    expect(result.gate14ComparisonCount).toBe(260);
    expect(result.observedMetrics.wrongLayerCount).toBe(0);
    expect(result.observedMetrics.overAdaptationCount).toBe(0);
    expect(result.observedMetrics.underAdaptationCount).toBe(0);
    expect(result.observedMetrics.acceptedDownstreamRescueCount).toBe(0);
    expect(result.stageAuthenticity.genuineStageCount).toBe(11);
    expect(result.stageAuthenticity.scriptedStageIncludedAsGenuineCount).toBe(0);
    expect(Object.values(result.activationGuards).every((value) => value === 0)).toBe(true);
  });

  it("publishes deterministic complete report sets and a 178-field readiness ledger", async () => {
    const markdown = await buildGoalSpecificProductShadowMarkdownReports(workspaceRoot);
    expect(Object.keys(markdown)).toEqual([...GOAL_SPECIFIC_PRODUCT_SHADOW_MARKDOWN_FILENAMES]);
    expect(GOAL_SPECIFIC_PRODUCT_SHADOW_JSON_FILENAMES).toHaveLength(17);
    for (const filename of [...GOAL_SPECIFIC_PRODUCT_SHADOW_MARKDOWN_FILENAMES,
      ...GOAL_SPECIFIC_PRODUCT_SHADOW_JSON_FILENAMES]) {
      expect(() => readFileSync(resolve(docsRoot, filename), "utf8")).not.toThrow();
    }
    const readiness = markdown["GOAL_SPECIFIC_PRODUCT_SHADOW_EVIDENCE_READINESS.md"];
    const items = [...readiness.matchAll(/^(\d+)\. /gm)].map((match) => Number(match[1]));
    expect(items).toEqual(Array.from({ length: 178 }, (_, index) => index + 1));
    expect(readiness).toContain(`178. exact next dependency: ` +
      "SCREENSHOT_GUIDED_PRODUCT_GOAL_AND_CONTEXT_INPUT_DESIGN_V1_AUTHORIZATION");
  });

  it("registers evidence authority in V16 without a production import", () => {
    expect(validateCagtEffectiveAuthorityRegistryV16()).toEqual([]);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16.productionImportCount).toBe(0);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V16.productActivationAuthority).toBe("NOT_AUTHORIZED");
  });
});
