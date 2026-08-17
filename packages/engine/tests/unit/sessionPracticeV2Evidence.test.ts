import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runSessionPracticeV2Evidence } from "../sessionPracticeV2Evidence/evidence";

function fileSha(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

describe("Session Practice Options V2 locked evidence", () => {
  it("meets controlled, cohort, holdout, catalog, mutation, metamorphic, and stress minima", async () => {
    const evidence = await runSessionPracticeV2Evidence();
    expect(evidence.classification).toBe(
      "SESSION_PRACTICE_OPTIONS_FULL_LIGHTER_RECOVERY_V2_BRIDGE_READY_FOR_CONTROLLED_OWNER_ACCOUNT_GET_STRONGER_DELIVERY_DESIGN_AUTHORIZATION");
    expect(evidence.ontologyClassification).toBe("SESSION_PRACTICE_OPTIONS_V2_ONTOLOGY_READY");
    expect(evidence.controlledScenarios.length).toBeGreaterThanOrEqual(650);
    expect(Object.values(evidence.cohortCounts).reduce((sum, count) => sum + count, 0)).toBeGreaterThanOrEqual(1030);
    expect(evidence.cohortCounts).toMatchObject({ full: 120, lighter: 150, recovery: 120, purpose: 100,
      dependency: 100, completion: 100, lifecycle: 80, recommendation: 80, currentRoute: 80 });
    expect(evidence.holdout.length).toBeGreaterThanOrEqual(1000);
    expect(evidence.holdout.filter((entry) => entry.mode === "full")).toHaveLength(400);
    expect(evidence.holdout.filter((entry) => entry.mode === "lighter")).toHaveLength(400);
    expect(evidence.holdout.filter((entry) => entry.mode === "recovery")).toHaveLength(400);
    expect(evidence.holdout.filter((entry) => entry.historicalV1Golden).length).toBeGreaterThanOrEqual(200);
    expect(evidence.genuineV2RealizationCount).toBeGreaterThanOrEqual(500);
    expect(evidence.gate13PracticeValidationCount).toBeGreaterThanOrEqual(250);
    expect(evidence.persistenceReplayCount).toBeGreaterThanOrEqual(200);
    expect(evidence.catalog).toMatchObject({ count: 64, uniqueCount: 64, knowledgeCount: 64 });
    expect(evidence.catalog.doseModes).toHaveLength(7);
    expect(evidence.catalog.sections).toHaveLength(5);
    expect(evidence.mutations.length).toBeGreaterThanOrEqual(60);
    expect(evidence.mutations.every((entry) => entry.rejected && entry.semanticChange &&
      !entry.downstreamRescueAccepted)).toBe(true);
    expect(evidence.metamorphic.invariants).toHaveLength(11);
    expect(evidence.metamorphic.materialResponses).toHaveLength(10);
    expect(evidence.stress).toMatchObject({ requestValidation: 15_000, sourceSession: 15_000,
      availability: 15_000, full: 15_000, lighter: 20_000, recovery: 15_000,
      dependencyPruning: 10_000, prescriptionRevision: 10_000, sequencing: 8_000, gate13: 8_000,
      completionDisposition: 5_000, persistenceReplay: 5_000, lifecycleLock: 3_000,
      strengthSession: 3_000, hypertrophySession: 3_000, timeConstrained: 2_000, painContext: 2_000,
      recommendationSelection: 2_000, historicalV1Replay: 1_000, currentRouteInvariance: 1_000,
      productShadowInvariance: 1_000, noRescue: 1_000, result: "PASS" });
    expect(Object.values(evidence.activationGuards).every((count) => count === 0)).toBe(true);
    expect(Object.values(evidence.fingerprints).filter((value) => value !== "pending-report-assembly")
      .every((value) => /^[a-f0-9]{64}$/.test(value))).toBe(true);
  }, 30_000);

  it("preserves byte-exact V1 source and current SessionClient with no V2 import", () => {
    const repositoryRoot = fileURLToPath(new URL("../../../../", import.meta.url));
    const v1 = `${repositoryRoot}packages/engine/src/sessionPracticeOptions.ts`;
    const sessionClient = `${repositoryRoot}apps/consumer/src/app/session/SessionClient.tsx`;
    expect(fileSha(v1)).toBe("988c8e62bc0975662d6b505d2080d00bacc16494f3f87fe4ebf7f14b05f23e6c");
    expect(fileSha(sessionClient)).toBe("35107e225e8e2b5f572677d55dbaa4c00957d317990d6cf4b96467c0cb7d41fa");
    const currentClientSource = readFileSync(sessionClient, "utf8");
    expect(currentClientSource).not.toMatch(/sessionPracticeV2|session-practice-v2|SESSION_PRACTICE_OPTIONS_V2/);
  });
});
