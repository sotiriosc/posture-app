import { describe, expect, it } from "vitest";
import { PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES } from "../../src/data/referenceExercises";
import { EXERCISE_DOSE_MODES } from "../../src/prescription/dose";
import {
  CONTROLLED_PRODUCT_SHADOW_CONTROLLED_SCENARIOS,
  CONTROLLED_PRODUCT_SHADOW_FIXED_SHELL_COHORT,
  CONTROLLED_PRODUCT_SHADOW_MATERIAL_RESPONSES,
  CONTROLLED_PRODUCT_SHADOW_METAMORPHIC_INVARIANTS,
  CONTROLLED_PRODUCT_SHADOW_MUTATIONS,
  CONTROLLED_PRODUCT_SHADOW_SUBGATE_ORDER,
  CONTROLLED_PRODUCT_SHADOW_V1_HOLDOUT_MANIFEST,
  runControlledProductShadowEvidenceStress,
  summarizeControlledProductShadowHoldout,
} from "../cagt/controlledProductShadowEvidence";

describe("controlled Product shadow CAGT evidence", () => {
  it("covers all controlled subgates and the fixed Product shell", () => {
    expect(CONTROLLED_PRODUCT_SHADOW_CONTROLLED_SCENARIOS.length).toBeGreaterThanOrEqual(260);
    expect(new Set(CONTROLLED_PRODUCT_SHADOW_CONTROLLED_SCENARIOS.map((entry) => entry.subgate)).size)
      .toBe(CONTROLLED_PRODUCT_SHADOW_SUBGATE_ORDER.length);
    expect(CONTROLLED_PRODUCT_SHADOW_FIXED_SHELL_COHORT).toHaveLength(80);
    expect(new Set(CONTROLLED_PRODUCT_SHADOW_FIXED_SHELL_COHORT.map((entry) =>
      entry.productMappingSignature)).size).toBeGreaterThanOrEqual(70);
    expect(CONTROLLED_PRODUCT_SHADOW_FIXED_SHELL_COHORT.every((entry) =>
      entry.fixedOpportunityCount === 4 && entry.fixedEquipment === "dumbbells")).toBe(true);
  });

  it("locks the 520-case Product-shaped holdout at or above every required threshold", () => {
    const summary = summarizeControlledProductShadowHoldout();
    expect(CONTROLLED_PRODUCT_SHADOW_V1_HOLDOUT_MANIFEST).toMatchObject({
      frozenBeforeExecution: true, tuningAfterInspectionAllowed: false,
      correctionPolicy: "V1.1_AND_NEW_LOCKED_HOLDOUT_REQUIRED" });
    expect(summary).toMatchObject({ scenarioCount: 520, authenticatedAllowlistedEvaluationCount: 400,
      offIneligibleAuthCount: 120, fullV2ProgramAttemptCount: 300, completeV2ProgramCount: 180,
      honestIncompleteCount: 120, outcomeMappingCount: 120,
      longitudinalOrchestrationAttemptCount: 100, persistenceReplayCount: 100,
      failureIsolationCount: 100, appSurfaceCoverage: 2, horizonCoverage: 3, intentCoverage: 3,
      phaseCoverage: 3, exerciseCoverage: REFERENCE_EXERCISES.length,
      doseModeCoverage: EXERCISE_DOSE_MODES.length, failures: [] });
    expect(summary.goalCoverage).toBeGreaterThanOrEqual(4);
    expect(summary.equipmentCoverage).toBeGreaterThanOrEqual(5);
    expect(summary.experienceCoverage).toBeGreaterThanOrEqual(3);
    expect(summary.manifestFingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  it("rejects structural mutations without name-based rejection and proves metamorphic scope", () => {
    expect(CONTROLLED_PRODUCT_SHADOW_MUTATIONS.length).toBeGreaterThanOrEqual(120);
    expect(CONTROLLED_PRODUCT_SHADOW_MUTATIONS.every((entry) => entry.actualSemanticStructureChanged &&
      entry.expectedRejected && !entry.rejectedByName)).toBe(true);
    expect(CONTROLLED_PRODUCT_SHADOW_METAMORPHIC_INVARIANTS).toHaveLength(20);
    expect(CONTROLLED_PRODUCT_SHADOW_MATERIAL_RESPONSES).toHaveLength(16);
  });

  it("runs deterministic no-rescue stress with no Product authority leak", () => {
    const first = runControlledProductShadowEvidenceStress();
    const second = runControlledProductShadowEvidenceStress();
    expect(first).toEqual(second);
    expect(first).toMatchObject({ rolloutEligibilityEvaluations: 10_000, triggerValidations: 10_000,
      productSnapshotFingerprintEvaluations: 10_000, productMappingEvaluations: 10_000,
      fullV2ProgramGenerationAttempts: 5_000, gate13Validations: 2_000,
      legacyV2Comparisons: 2_000, counterfactualAttributionValidations: 10_000,
      persistenceTransactions: 1_000, concurrentTriggerPairs: 1_000, supersessionChains: 1_000,
      crossUserAccessAttempts: 1_000, replayComparisons: 1_000, noRescueMutations: 1_000,
      acceptedRescueCount: 0, productMutationCount: 0, applicationCount: 0,
      deliveredToUserCount: 0, shadowPerformanceCreditCount: 0,
      counterfactualOutcomeAttributionCount: 0, failures: [] });
  });
});
