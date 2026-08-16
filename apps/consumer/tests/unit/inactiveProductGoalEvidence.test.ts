import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import {
  ACTIVATION_GUARDS,
  CONTROLLED_SCENARIOS,
  F_CLASSIFICATION,
  F_NEXT_DEPENDENCY,
  HOLDOUT_MANIFEST,
  METAMORPHIC_RESULTS,
  MUTATIONS,
  buildEvidenceModel,
  runStressEvidence,
} from "../inactiveProductGoalOption/evidence";
import { buildInactiveProductGoalReportFiles } from "../inactiveProductGoalOption/reports";

const repositoryRoot = path.resolve(__dirname, "../../../..");
const preG1Marker = /\n*<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:START -->[\s\S]*?<!-- PRE_G1_EXERCISE_CATALOG_HOME_COMFORT_CURATION:END -->\n?/;

describe("inactive Product goal evidence", () => {
  test("meets controlled, locked holdout, mutation, and metamorphic minimums", () => {
    expect(CONTROLLED_SCENARIOS.length).toBeGreaterThanOrEqual(120);
    expect(CONTROLLED_SCENARIOS.every((scenario) => scenario.observed === "pass")).toBe(true);
    expect(HOLDOUT_MANIFEST.frozen).toBe(true);
    expect(HOLDOUT_MANIFEST.cases).toHaveLength(240);
    expect(HOLDOUT_MANIFEST.partitions).toEqual({
      registry_contracts: 80,
      preview_selection_submission: 80,
      route_app_invariance: 80,
    });
    expect(MUTATIONS.length).toBeGreaterThanOrEqual(45);
    expect(MUTATIONS.every((mutation) => mutation.semanticDelta && mutation.observed === "rejected")).toBe(true);
    expect(METAMORPHIC_RESULTS.invariant).toHaveLength(14);
    expect(METAMORPHIC_RESULTS.material).toHaveLength(8);
  });

  test("runs every deterministic stress minimum twice with zero side effects", () => {
    const first = runStressEvidence();
    const second = runStressEvidence();
    expect(first).toEqual(second);
    expect(first.allMinimumsMet).toBe(true);
    expect(first.sideEffectsObserved).toBe(0);
    expect(first.hiddenClockReads).toBe(0);
    expect(first.productionRandomReads).toBe(0);
    expect(first.counts).toEqual({
      registryValidations: 10_000,
      previewInputValidations: 10_000,
      previewStateTransitions: 10_000,
      blockedSubmitAttempts: 5_000,
      legacyReturnTransitions: 5_000,
      hydrationResetTransitions: 2_000,
      activeSessionPreviewAttempts: 2_000,
      persistenceNetworkAttacks: 2_000,
      generationNavigationAttacks: 2_000,
      currentRouteComparisons: 1_000,
      gymsBuyerDemoComparisons: 1_000,
      productShadowV2Attacks: 1_000,
      accessibilityEvaluations: 1_000,
      noRescueMutations: 1_000,
    });
  });

  test("keeps app boundaries and current legacy goals source-visible", () => {
    const consumerPage = readFileSync(
      path.join(repositoryRoot, "apps/consumer/src/app/questionnaire/page.tsx"),
      "utf8"
    );
    const consumerForm = readFileSync(
      path.join(repositoryRoot, "apps/consumer/src/components/QuestionnaireForm.tsx"),
      "utf8"
    );
    const gymsSource = readFileSync(
      path.join(repositoryRoot, "apps/gyms/src/components/QuestionnaireForm.tsx"),
      "utf8"
    );
    expect(consumerPage).toContain("<QuestionnaireForm />");
    expect(consumerPage).not.toContain("inactiveGoalPreview");
    expect(consumerForm).toContain('"Improve posture"');
    expect(consumerForm).toContain('"Reduce pain"');
    expect(consumerForm).toContain('"Athletic performance"');
    expect(consumerForm).toContain('"General fitness"');
    expect(gymsSource).not.toContain("inactiveProductGoal");
    expect(gymsSource).not.toContain("get_stronger");
    expect(gymsSource).not.toContain("Get stronger");
  });

  test("keeps all activation counters at zero and G as the exact dependency", () => {
    expect(Object.values(ACTIVATION_GUARDS).every((count) => count === 0)).toBe(true);
    const model = buildEvidenceModel();
    expect(model.classification).toBe(F_CLASSIFICATION);
    expect(model.nextDependency).toBe(F_NEXT_DEPENDENCY);
    expect(model.fingerprints.upstream).toEqual({
      chunkE: "5822ccde91f41387886dd57d92015956f10035a23f78596040033d4a8fcf559f",
      chunkEReportCorpus: "4b59ed72f987e9f1a6668734052e6d0651fd5e7953529f33f9f7760095ab0bae",
      historicalProductShadow: "fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c",
      chunkC: "01f3a6a9b1eb6ef28d33876c5cb00d3b01948cad90cf7939ac1d072ffa071a9d",
      chunkD: "dcedd35ec88a929420036dee8f34f909af2a043f3e5133edca40fe76efa89464",
      postChunkDMaintenance: "39f761ac75423c549a889c4559b50e2bbf6e608c709ddb8616b5347c32c211bb",
    });
  });

  test("generated report corpus is exact", () => {
    const files = buildInactiveProductGoalReportFiles();
    expect(files.size).toBe(27);
    for (const [name, expected] of files) {
      const actual = readFileSync(
        path.join(repositoryRoot, "docs/training-engine-v2", name),
        "utf8"
      );
      expect(actual.replace(preG1Marker, "\n"), name).toBe(expected);
    }
  });
});
