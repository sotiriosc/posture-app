import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildControlledProductShadowImplementationReport } from
  "../cagt/controlledProductShadowReport";

const root = process.cwd().endsWith("packages/training-engine-v2") ? resolve(process.cwd(), "../..") : process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("controlled Product shadow activation guards", () => {
  it("has exactly one shared post-sync call and two thin routes", () => {
    const sync = read("packages/engine/src/trainingSyncClient.ts");
    expect(sync.match(/notifyControlledProductShadowAfterSuccessfulSync\(\{ patch \}\)/g)).toHaveLength(1);
    for (const app of ["consumer", "gyms"]) {
      const route = read(`apps/${app}/src/app/api/training/v2-shadow/route.ts`);
      expect(route).toContain("handleControlledProductShadowPost");
      expect(route).not.toMatch(/generateProgram|saveProgram|ProgramProgress|applicationApplied/);
    }
  });

  it("keeps CAGT and Product mutation out of production shadow code", () => {
    const production = ["comparison.ts", "contracts.ts", "identities.ts", "legacyProgramProjection.ts",
      "mappings.ts", "migrations.ts", "observability.ts", "postgresRepository.ts",
      "productSnapshotAdapter.ts", "replay.ts", "repository.ts", "rolloutConfig.ts", "routeHandler.ts",
      "service.ts", "triggerClient.ts", "v2Pipeline.ts"].map((filename) =>
      read(`packages/engine/src/controlledProductShadow/${filename}`)).join("\n");
    expect(production).not.toMatch(/tests\/cagt|effectiveAuthorityRegistry/);
    expect(production).not.toMatch(/applicationApplied:\s*true|productMutationApplied:\s*true|performed:\s*true/);
    expect(buildControlledProductShadowImplementationReport().activationGuards).toMatchObject({
      v2ProgramReturnedToUserCount: 0, v2ExerciseRenderedCount: 0, v2PrescriptionRenderedCount: 0,
      productProgramMutationCount: 0, programProgressMutationCount: 0, productSessionMutationCount: 0,
      productPhaseMutationCount: 0, shadowPerformanceCreditCount: 0,
      counterfactualOutcomeAttributionCount: 0, uiComponentCount: 0, backgroundQueueCount: 0,
      cronCount: 0, webhookCount: 0, automaticMigrationCount: 0, importTimeV2ExecutionCount: 0 });
  });
});
