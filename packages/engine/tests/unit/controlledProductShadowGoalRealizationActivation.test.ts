import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V15 } from "../cagt/effectiveAuthorityRegistryV15";

const workspace = process.cwd().endsWith("packages/engine") ?
  resolve(process.cwd(), "../..") : process.cwd();
const CHUNK_F_STARTING_COMMIT = "560f8640661a37c8ffe548967a3de1e827eeab29";

function source(relativeRoot: string): string {
  const root = resolve(workspace, relativeRoot);
  if (!statSync(root).isDirectory()) return readFileSync(root, "utf8");
  const visit = (candidate: string): string[] => readdirSync(candidate).flatMap((name) => {
    const child = resolve(candidate, name);
    return statSync(child).isDirectory() ? visit(child) : /\.[cm]?[jt]sx?$/.test(child) ? [child] : [];
  });
  return visit(root).sort().map((file) => readFileSync(file, "utf8")).join("\n");
}

function historicalBoundaryFingerprint(): string {
  const paths = ["packages/engine/src/controlledProductShadow", "packages/training-engine-v2/src/productShadow",
    "apps/consumer/src/components/QuestionnaireForm.tsx", "apps/gyms/src/components/QuestionnaireForm.tsx",
    "packages/engine/src/program.ts", "packages/engine/src/trainingSyncClient.ts"];
  const files = paths.flatMap((relativePath) => {
    const absolute = resolve(workspace, relativePath);
    if (!statSync(absolute).isDirectory()) return [absolute];
    const visit = (candidate: string): string[] => readdirSync(candidate).flatMap((name) => {
      const child = resolve(candidate, name);
      return statSync(child).isDirectory() ? visit(child) : [child];
    });
    return visit(absolute);
  }).sort();
  const inner = files.map((file) => {
    const relativePath = relative(workspace, file);
    const content = relativePath === "apps/consumer/src/components/QuestionnaireForm.tsx"
      ? execFileSync("git", ["show", `${CHUNK_F_STARTING_COMMIT}:${relativePath}`], {
        cwd: workspace,
      })
      : readFileSync(file);
    return `${createHash("sha256").update(content).digest("hex")}  ${relativePath}\n`;
  }).join("");
  return createHash("sha256").update(inner).digest("hex");
}

describe("Chunk C activation guards", () => {
  it("keeps the historical V1 implementation and Product boundary byte exact", () => {
    expect(historicalBoundaryFingerprint()).toBe("90d18a89ae8de3e31a32f34d81cc7f0e740a561419d19c198746038b6459f362");
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V15.historicalProductShadowFingerprint)
      .toBe("fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c");
  });

  it("has zero current-route or client-trigger calls to the new profile", () => {
    const routesAndTrigger = ["packages/engine/src/controlledProductShadow/routeHandler.ts",
      "packages/engine/src/controlledProductShadow/triggerClient.ts", "apps"].map(source).join("\n");
    expect(routesAndTrigger).not.toMatch(/createControlledProductShadowGoalRealizationServiceV1|PROFILE_V1_B1_B4/);
  });

  it("keeps the B4 challenge entirely outside runtime Product mapping", () => {
    const runtime = source("packages/engine/src/controlledProductShadowGoalRealization");
    expect(runtime).not.toMatch(/advancedBodybuilderChallenge|ADVANCED_BODYBUILDER|20_PLUS_YEARS/);
  });

  it("retains explicit-only authority with no CAGT production import", () => {
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V15).toMatchObject({
      historicalProductShadowV1Authority: "CONTROLLED_PRODUCT_RUNTIME_OBSERVATION_AUTHORITY_DEFAULT_OFF",
      goalRealizationMappingProfileAuthority: "CONTROLLED_SHADOW_MAPPING_AUTHORITY_NOT_PRODUCT_DECISION",
      B1B4PipelineProfileAuthority: "CONTROLLED_SHADOW_PIPELINE_AUTHORITY_EXPLICIT_ONLY",
      ProductDecisionAuthority: "LEGACY_PRODUCT_OUTPUT_ONLY", ProductActivationAuthority: "NOT_AUTHORIZED",
      ShadowPerformanceAuthority: "NONE_COUNTERFACTUAL_ONLY", productionImportAuthorized: false,
    });
    expect(source("packages/engine/src")).not.toContain("effectiveAuthorityRegistryV15");
  });
});
