import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { CHUNK_E_STARTING_COMMIT, fingerprint } from "../productGoalContextDesign/contracts";
import {
  activationGuards,
  chunkEReadiness,
  consumerGymsParity,
  copyMatrix,
  currentOwnership,
  currentRenderBaseline,
  designEvidence,
  designOptions,
  driftAudit,
  fHandoff,
  goalOptionPolicy,
  informationArchitecture,
  legacyCompatibility,
  ownerScreenshotCorpus,
  painContextDesign,
  productProfileV2Design,
  signatureV2Design,
  stateMachine,
} from "../productGoalContextDesign/evidence";
import {
  chunkEFingerprints,
  chunkEJsonReports,
  chunkEMarkdownReports,
  reportCorpusFingerprint,
} from "../productGoalContextDesign/reports";
import {
  designMetamorphicResults,
  designMutationResults,
  validateChunkEDesignEvidence,
  validationSummary,
} from "../productGoalContextDesign/validation";

const repositoryRoot = resolve(import.meta.dirname, "../../../..");
const ledgerPath = resolve(repositoryRoot, "docs/training-engine-v2/PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md");

describe("screenshot-guided Product goal and context input design", () => {
  it("validates the complete design evidence and preserves the one-surface boundary", () => {
    expect(validateChunkEDesignEvidence()).toEqual([]);
    expect(validationSummary.designErrors).toEqual([]);
    expect(informationArchitecture.selectedSurface).toEqual(expect.objectContaining({
      app: "consumer",
      route: "/questionnaire",
      component: "apps/consumer/src/components/QuestionnaireForm.tsx",
    }));
    expect(informationArchitecture.multiPageWizard).toBe(false);
    expect(informationArchitecture.ordinarySupportedPathTargetSeconds).toBeLessThanOrEqual(60);
    expect(designOptions.selected).toBe("A");
    expect(chunkEReadiness.classification).toBe(
      "SCREENSHOT_GUIDED_PRODUCT_GOAL_AND_CONTEXT_INPUT_DESIGN_V1_READY_FOR_ONE_INACTIVE_PRODUCT_GOAL_OPTION_AUTHORIZATION"
    );
  });

  it("records sanitized screenshot evidence without committing image or personal payloads", () => {
    expect(ownerScreenshotCorpus.reference).toEqual({
      contractId: "OWNER_SUPPLIED_PRODUCT_SCREENSHOT_OBSERVATION_CORPUS",
      contractVersion: "1.0.0",
    });
    expect(ownerScreenshotCorpus.declaredLogicalImageCount).toBe(13);
    expect(ownerScreenshotCorpus.locallyObservedBinaryCount).toBe(8);
    expect(ownerScreenshotCorpus.locallyVerifiedProductCompositeCount).toBe(5);
    expect(ownerScreenshotCorpus.screenshotBinariesCommitted).toBe(0);
    expect(ownerScreenshotCorpus.personalDataCommitted).toBe(0);
    const reportText = Object.values(chunkEMarkdownReports).join("\n");
    expect(reportText).not.toMatch(/[A-Z0-9._%+-]+@(?!1\.0\.0)[A-Z0-9.-]+\.[A-Z]{2,}/i);
    expect(reportText).not.toContain("Screenshot (102");
    const trackedOwnerImages = execFileSync("git", ["ls-files", "packages/training-engine-v2/docs"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    }).split("\n").filter((path) => /\.(png|jpe?g|webp)$/i.test(path));
    expect(trackedOwnerImages).toEqual([]);
  });

  it("covers consumer and gyms current renders across the required responsive matrix", () => {
    expect(currentRenderBaseline.entries).toHaveLength(22);
    for (const width of [320, 360, 390, 1024, 1440]) {
      expect(currentRenderBaseline.entries.some((entry) => entry.viewport.width === width)).toBe(true);
    }
    expect(currentRenderBaseline.entries.every((entry) =>
      !entry.horizontalOverflow && !entry.fixedControlOverlap)).toBe(true);
    expect(currentRenderBaseline.entries.some((entry) =>
      entry.syntheticState === "active_session_warning")).toBe(true);
    expect(currentRenderBaseline.entries.some((entry) =>
      entry.syntheticState === "buyer_demo_locked_equipment")).toBe(true);
  });

  it("keeps screenshot, branch, render, and consumer/gyms drift explicit", () => {
    const knees = driftAudit.rows.find((row) => row.id === "knees_pain_choice");
    const bands = driftAudit.rows.find((row) => row.id === "resistance_band_detail");
    expect(knees?.classifications).toContain("screenshot_matches_deployed_but_not_branch");
    expect(bands?.classifications).toContain("owner_observation_unverified");
    expect(currentOwnership.auditAnswers.kneesPresentInBranchQuestionnaire).toBe(false);
    expect(currentOwnership.auditAnswers.reportedBandSubtypePresentInBranch).toBe(false);
    expect(currentOwnership.auditAnswers.trainingIntentParticipatesInChangeIdentity).toBe(false);
    expect(currentOwnership.auditAnswers.legacyGymOverstatesCapability).toBe(true);
    expect(consumerGymsParity.trainingModeVisibility).toEqual({ consumer: true, gyms: false });
  });

  it("defines the closed goal policy, copy matrix, profile design, and legacy compatibility", () => {
    expect(goalOptionPolicy.stateVocabulary).toHaveLength(9);
    const getStronger = goalOptionPolicy.options.find((option) => option.id === "get_stronger");
    expect(getStronger).toEqual(expect.objectContaining({
      displayLabel: "Get stronger",
      canonicalOutcome: "strength",
      submissionBehavior: "preview_only_fail_closed",
    }));
    expect(getStronger?.states).toContain("future_inactive_internal");
    expect(copyMatrix.map((row) => row.fieldId)).toEqual(expect.arrayContaining([
      "primary_goal", "fitness_focus", "performance_focus", "pain_context", "reduce_pain_migration",
      "training_mode", "days_per_week", "session_minutes", "experience", "equipment_environment",
      "band_detail", "submit",
    ]));
    expect(signatureV2Design.implemented).toBe(false);
    expect(signatureV2Design.currentTrainingIntentAbsentFromV1Signature).toBe(true);
    expect(productProfileV2Design.runtimeExportCount).toBe(0);
    expect(legacyCompatibility).toEqual(expect.objectContaining({
      oldProfilesLoad: true,
      migrationOnReadCount: 0,
      regenerationOnReadCount: 0,
    }));
  });

  it("keeps pain contextual and makes the inactive F preview unable to generate or persist", () => {
    expect(painContextDesign).toEqual(expect.objectContaining({
      diagnosisInferenceCount: 0,
      genericCorrectiveCircuitCount: 0,
      permanentExerciseBlockCount: 0,
    }));
    expect(fHandoff.visibility).toEqual({ consumerOrdinary: false, gymsOrdinary: false, buyerDemo: false });
    expect(fHandoff.behavior).toEqual(expect.objectContaining({
      persist: false,
      generateProgram: false,
      currentRouteShadow: false,
      returnV2Output: false,
      nonPreviewSubmit: "fail_closed",
    }));
    expect(stateMachine.previewReachesLegacyGeneration).toBe(false);
    expect(stateMachine.unsupportedReachesGeneration).toBe(false);
    expect(stateMachine.cancelRestoresExactCommittedState).toBe(true);
  });

  it("rejects every semantic design mutation", () => {
    expect(designMutationResults.totalCount).toBe(29);
    expect(designMutationResults.rejectedCount).toBe(29);
    expect(designMutationResults.mutations.every((mutation) =>
      mutation.rejected && mutation.reasonCodes.length > 0)).toBe(true);
  });

  it("passes all invariant and material-response metamorphic relations", () => {
    expect(designMetamorphicResults.invariance).toHaveLength(12);
    expect(designMetamorphicResults.materialResponse).toHaveLength(9);
    expect([...designMetamorphicResults.invariance,
      ...designMetamorphicResults.materialResponse].every((entry) => entry.passed)).toBe(true);
    expect(validationSummary.metamorphicPassed).toBe(21);
  });

  it("generates the complete deterministic report corpus and fingerprint set", () => {
    expect(Object.keys(chunkEMarkdownReports)).toHaveLength(31);
    expect(Object.keys(chunkEJsonReports)).toHaveLength(15);
    expect(Object.values(chunkEJsonReports).every((report) => {
      JSON.parse(report);
      return report.endsWith("\n");
    })).toBe(true);
    expect(fingerprint(designEvidence)).toBe(validationSummary.evidenceFingerprint);
    expect(reportCorpusFingerprint).toBe(fingerprint({
      markdown: chunkEMarkdownReports,
      json: chunkEJsonReports,
      designEvidence,
    }));
    expect(chunkEFingerprints.upstream).toEqual(expect.objectContaining({
      historicalProductShadow: "fee0ffe0d586123cfd903f01a347f59aa92a8825342d0ec62b86a2235d376e2c",
      chunkC: "01f3a6a9b1eb6ef28d33876c5cb00d3b01948cad90cf7939ac1d072ffa071a9d",
      chunkD: "dcedd35ec88a929420036dee8f34f909af2a043f3e5133edca40fe76efa89464",
      postChunkDMaintenance: "39f761ac75423c549a889c4559b50e2bbf6e608c709ddb8616b5347c32c211bb",
    }));
  });

  it("has no production import, Product runtime diff, output, or activation", () => {
    const changed = execFileSync("git", ["diff", "--name-only", CHUNK_E_STARTING_COMMIT], {
      cwd: repositoryRoot,
      encoding: "utf8",
    }).trim().split("\n").filter(Boolean);
    const authorizedChunkFConsumerPaths = new Set([
      "apps/consumer/src/components/QuestionnaireForm.tsx",
      "apps/consumer/src/components/questionnaire/InactiveProductGoalPreview.tsx",
      "apps/consumer/src/components/questionnaire/inactiveProductGoalContracts.ts",
      "apps/consumer/src/components/questionnaire/productGoalOptionRegistry.ts",
    ]);
    const authorizedPackageRTrainingPaths = new Set([
      "packages/training-engine-v2/src/candidate/homeComfort/contracts.ts",
      "packages/training-engine-v2/src/candidate/homeComfort/index.ts",
      "packages/training-engine-v2/src/candidate/homeComfort/policy.ts",
      "packages/training-engine-v2/src/candidate/homeComfort/profiles.ts",
      "packages/training-engine-v2/src/candidate/index.ts",
      "packages/training-engine-v2/src/candidate/ranking/rankCandidates.ts",
      "packages/training-engine-v2/src/candidate/standardGymComfort/contracts.ts",
      "packages/training-engine-v2/src/candidate/standardGymComfort/index.ts",
      "packages/training-engine-v2/src/candidate/standardGymComfort/policy.ts",
      "packages/training-engine-v2/src/candidate/standardGymComfort/profiles.ts",
      "packages/training-engine-v2/src/data/candidateScenarios.ts",
      "packages/training-engine-v2/src/data/generatedExerciseCoachingFallbacks.ts",
      "packages/training-engine-v2/src/data/referenceExercises.ts",
      "packages/training-engine-v2/src/domain/equipment.ts",
      "packages/training-engine-v2/src/domain/exercise.ts",
      "packages/training-engine-v2/src/domain/assistanceRealization.ts",
      "packages/training-engine-v2/src/domain/pressAngleRealization.ts",
      "packages/training-engine-v2/src/index.ts",
      "packages/training-engine-v2/src/sessionComposer/candidatePools.ts",
      "packages/training-engine-v2/src/sessionPlanner/orchestration.ts",
    ]);
    expect(changed.some((path) =>
      (path.startsWith("apps/consumer/src/") && !authorizedChunkFConsumerPaths.has(path)) ||
      path.startsWith("apps/gyms/src/") ||
      (path.startsWith("packages/engine/src/") &&
        !path.startsWith("packages/engine/src/sessionPracticeV2/")) ||
      (path.startsWith("packages/training-engine-v2/src/") && !authorizedPackageRTrainingPaths.has(path) &&
        !path.startsWith("packages/training-engine-v2/src/sessionPractice/")))).toBe(false);
    let productionReferences = "";
    try {
      productionReferences = execFileSync("git", ["grep", "-n", "productGoalContextDesign", "--",
        "apps/consumer/src", "apps/gyms/src", "packages/engine/src", "packages/training-engine-v2/src"], {
        cwd: repositoryRoot,
        encoding: "utf8",
      }).trim();
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status !== 1) throw error;
    }
    expect(productionReferences).toBe("");
    expect(activationGuards).toEqual(expect.objectContaining({
      productOptionChanges: 0,
      generateProgramChanges: 0,
      productPersistenceChanges: 0,
      productShadowCurrentRouteCalls: 0,
      v2OutputsReturned: 0,
      productMutations: 0,
      productActivations: 0,
      fImplementationCount: 0,
    }));
  });

  it("preserves the canonical ledger state while allowing only E closure", () => {
    const ledger = readFileSync(ledgerPath, "utf8");
    expect(ledger.match(/\*\*Current state:\*\* `INCOMPLETE_FUTURE_WORK_REMAINS`/g)).toHaveLength(1);
    expect(ledger).toContain("## Chunk E - Screenshot-guided Product design".replace(" - ", " — "));
    expect(ledger).toContain("## Chunk F — Add one inactive Product option");
    expect(ledger).toContain("## Chunk G — Controlled owner-account delivery");
    expect(ledger).toContain("## Chunk H — Broader Product activation");
    expect(ledger).not.toContain("## Final Completion Note\n\n**Current state:** `COMPLETED`");
  });
});
