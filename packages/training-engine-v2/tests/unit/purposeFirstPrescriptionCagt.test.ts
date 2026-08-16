import { describe, expect, it } from "vitest";
import { PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES } from "../../src";
import { buildPurposeFirstMetamorphicEvidence, PURPOSE_FIRST_MUTATION_IDS,
  runPurposeFirstMutations, runPurposeFirstStress } from
  "../cagt/purposeFirstPrescriptionResolverAdversarial";
import { buildPurposeFirstFallthroughMatrix, buildPurposeFirstHoldoutManifest,
  runPurposeFirstControlledScenarios, runPurposeFirstHoldout } from
  "../cagt/purposeFirstPrescriptionResolverEvidence";

describe("Purpose-first Prescription CAGT evidence", () => {
  it("passes 241 controlled scenarios across all 45 exercises", () => {
    const results = runPurposeFirstControlledScenarios();
    expect(results).toHaveLength(241);
    expect(new Set(results.map((entry) => entry.exerciseId)).size).toBe(REFERENCE_EXERCISES.length);
    expect(results.every((entry) => entry.passed)).toBe(true);
  });

  it("preserves V1.0 and corrects all 60 audited V1.1 fallthrough cells", () => {
    const matrix = buildPurposeFirstFallthroughMatrix();
    expect(matrix).toHaveLength(60);
    expect(matrix.every((entry) => entry.corrected && entry.v1UseCase === "main_strength" &&
      entry.v1_1UseCase === null)).toBe(true);
  });

  it("freezes and passes the 380-case holdout before execution", () => {
    const manifest = buildPurposeFirstHoldoutManifest();
    const result = runPurposeFirstHoldout(manifest);
    expect(manifest).toMatchObject({ scenarioCount: 380,
      genuineV1_1CompilerScenarioCount: 370, goldenPairCount: 100 });
    expect(result).toMatchObject({ scenarioCount: 380, passedCount: 380,
      genuineV1_1CompilerScenarioCount: 370, goldenPairCount: 100,
      productFreezeCount: 10, failedScenarioIds: [] });
  });

  it("rejects 50 semantic mutations and passes 16 plus 11 metamorphic checks", () => {
    const mutations = runPurposeFirstMutations();
    const metamorphic = buildPurposeFirstMetamorphicEvidence();
    expect(PURPOSE_FIRST_MUTATION_IDS).toHaveLength(50);
    expect(mutations.every((entry) => entry.result === "REJECTED" && entry.issueCount > 0)).toBe(true);
    expect(metamorphic.invariants).toHaveLength(16);
    expect(metamorphic.materialResponses).toHaveLength(11);
    expect(metamorphic).toMatchObject({ invariantFailureCount: 0, materialResponseFailureCount: 0 });
  });

  it("passes every deterministic stress minimum without downstream rescue", () => {
    const stress = runPurposeFirstStress();
    expect(stress.failureCount).toBe(0);
    expect(stress.deterministicReplay).toBe(true);
    expect(stress.counts).toMatchObject({ snapshotBuilds: 10_000, lineageValidations: 10_000,
      purposeResolutions: 10_000, roleSectionEvaluations: 10_000, purposeModeEvaluations: 10_000,
      supportedGoldenComparisons: 5_000, unsupportedPurposeEvaluations: 5_000,
      sharedAssignmentEvaluations: 2_000, multiGoalEvaluations: 2_000,
      equalPrimaryConflictEvaluations: 1_000, noRescueMutations: 1_000,
      v1CompatibilityReplays: 1_000 });
  }, 30_000);
});
