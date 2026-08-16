import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14,
} from "../cagt/effectiveAuthorityRegistryV14";

const workspace = resolve(process.cwd(), "../..");

function source(relativeRoot: string): string {
  const root = resolve(workspace, relativeRoot);
  const visit = (candidate: string): string[] => readdirSync(candidate).flatMap((name) => {
    const child = resolve(candidate, name);
    return statSync(child).isDirectory() ? visit(child) : /\.[cm]?[jt]sx?$/.test(child) ? [child] : [];
  });
  return visit(root).map((file) => readFileSync(file, "utf8")).join("\n");
}

describe("B4 activation guards", () => {
  it("keeps Product Shadow pinned to V1.0 and free of B4 imports", () => {
    const shadow = source("packages/training-engine-v2/src/productShadow");
    expect(shadow).not.toMatch(/compilerV1_3|compilePrescriptionAssignmentV1_3/);
    expect(shadow).not.toMatch(/realizationContext|weekValidationV1_2/);
    expect(shadow).not.toMatch(/ATHLETE_TRAINING_EXPERIENCE_PROFILE|EQUIPMENT_LOAD_REALIZATION_PROFILE/);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14.ProductShadowCompilerAuthority)
      .toBe("HISTORICAL_COMPATIBILITY_V1_0_PINNED");
  });

  it("keeps orchestration and applications free of future-only B4 calls", () => {
    const orchestration = source("packages/training-engine-v2/src/applicationOrchestration");
    const apps = source("apps");
    const forbidden = /compilePrescriptionAssignmentV1_3|evaluateRealizationContextEventsV1_2|realizationContext/;
    expect(orchestration).not.toMatch(forbidden);
    expect(apps).not.toMatch(forbidden);
  });

  it("exposes no latest alias or automatic migration authority", () => {
    const packageManifest = JSON.parse(readFileSync(resolve(
      workspace,
      "packages/training-engine-v2/package.json",
    ), "utf8"));
    expect(packageManifest.exports).not.toHaveProperty("./realization-context");
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14).toMatchObject({
      ProductActivationAuthority: "NOT_AUTHORIZED",
      compilerV1_3Activated: false,
      validatorV1_2Activated: false,
    });
  });
});
