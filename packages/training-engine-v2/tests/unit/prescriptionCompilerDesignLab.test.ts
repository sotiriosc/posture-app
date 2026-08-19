import { describe, expect, it } from "vitest";
import {
  PRESCRIPTION_COMPILATION_ORDER,
  PRESCRIPTION_DOSE_BLOCK_PURPOSES,
  REVIEWED_PRESCRIPTION_POLICY_RULE_KINDS,
} from "../../src";
import {
  FULL_PRESCRIPTION_DESIGN_CLASSIFICATION,
  PRESCRIPTION_CANDIDATE_LATTICE_FINGERPRINT,
  PRESCRIPTION_POLICY_CANDIDATES,
  PRESCRIPTION_POLICY_CANDIDATE_FAMILIES,
  PRESCRIPTION_TEST_CANDIDATE_STATE,
  buildCompilerInputForScenario,
  buildFullPrescriptionDesignData,
  compilePrescriptionDesignFixture,
} from "../helpers/prescriptionCompilerDesignLab";

const data = buildFullPrescriptionDesignData();

describe("full Prescription ontology and design-only compiler lab", () => {
  it("establishes one source exposure event with ordered dose blocks and legacy projection", () => {
    expect(data.classification).toBe(FULL_PRESCRIPTION_DESIGN_CLASSIFICATION);
    expect(data.oneDoseAuditResult).toBe(
      "OPTION_B_ORDERED_DOSE_BLOCKS_WITH_OPTION_D_LEGACY_COMPATIBILITY_PROJECTION",
    );
    expect(data.selectedArchitecture).toBe(
      "ONE_SOURCE_EXPOSURE_EVENT_PER_ASSIGNMENT_WITH_ONE_PRESCRIPTION_PLAN_AND_ONE_OR_MORE_ORDERED_DOSE_BLOCKS",
    );
    expect(data.blockPurposeVocabulary).toEqual(PRESCRIPTION_DOSE_BLOCK_PURPOSES);
    expect(data.sampleCompilation.status).toBe("compiled_non_production_fixture");
    expect(data.sampleCompilation.plan?.compatibilityProjection.status).toBe(
      "ordered_blocks_required",
    );
    expect(data.sampleCompilation.plan?.doseBlocks.map((block) => [
      block.purpose,
      block.dose.mode,
      block.contributionClassification,
    ])).toEqual([
      [
        "preparatory_acclimation",
        "repetition_sets",
        "not_weekly_developmental_credit",
      ],
      [
        "developmental_work",
        "repetition_sets",
        "developmental_credit_candidate",
      ],
      [
        "developmental_work",
        "repetition_sets",
        "developmental_credit_candidate",
      ],
    ]);
    expect(new Set(data.sampleCompilation.plan?.doseBlocks.map((block) =>
      block.sourceExposureEventId,
    ))).toHaveLength(1);
  });

  it("keeps event identity stable across pre-execution revisions", () => {
    const scenario = data.scenarios.find((entry) =>
      entry.scenarioId === "controlled:main-ramp-up",
    ) ?? data.scenarios[0];
    const initial = data.sampleCompilation;
    const revised = compilePrescriptionDesignFixture({
      ...buildCompilerInputForScenario(
        scenario,
        PRESCRIPTION_POLICY_CANDIDATES.find((entry) =>
          entry.family === "preparation" && entry.shape === "balanced",
        ),
      ),
      priorPrescriptionRevision: initial.revisionTrace[0],
    });

    expect(revised.status).toBe("compiled_non_production_fixture");
    expect(revised.sourceExposureEvent?.sourceExposureEventId).toBe(
      initial.sourceExposureEvent?.sourceExposureEventId,
    );
    expect(revised.revisionTrace[0].basedOnRevisionId).toBe(
      initial.revisionTrace[0].prescriptionRevisionId,
    );
    expect(revised.revisionTrace.filter((entry) => entry.finalForExecution)).toHaveLength(1);
  });

  it("freezes a design-only policy lattice and explicit policy-required/conflict behavior", () => {
    expect(PRESCRIPTION_POLICY_CANDIDATE_FAMILIES).toHaveLength(19);
    expect(PRESCRIPTION_POLICY_CANDIDATES).toHaveLength(76);
    expect(PRESCRIPTION_POLICY_CANDIDATES.every((candidate) =>
      candidate.state === PRESCRIPTION_TEST_CANDIDATE_STATE,
    )).toBe(true);
    expect(PRESCRIPTION_CANDIDATE_LATTICE_FINGERPRINT).toBe(
      "8af38098302cd08da5f33bfab663dadd4cf55cbaf43040d950c545df091b18fe",
    );
    expect(data.reviewedPolicyStatus).toBe(
      "TYPED_VERSIONED_DESIGN_ONLY_POLICY_CREATED_NOT_PRODUCTION",
    );
    expect(data.policyRuleVocabulary).toEqual(REVIEWED_PRESCRIPTION_POLICY_RULE_KINDS);
    expect(data.validations.missingPolicyStatus).toBe("prescription_policy_required");
    expect(data.validations.conflictStatus).toBe("prescription_policy_conflict");
    expect(data.consequenceLabResult).toEqual({
      candidateCount: 76,
      missingPolicyResults: 19,
      conflicts: 19,
      noOverallScore: true,
    });
  });

  it("covers full Prescription scenarios, CAGT pairs, and hard failure boundaries", () => {
    expect(data.calibrationScenarioCount).toBe(24);
    expect(data.holdoutScenarioCount).toBe(39);
    expect(data.validations.all45ExercisesCovered).toBe(true);
    expect(data.validations.allDoseModesCovered).toBe(true);
    expect(data.cagtPrescriptionPairResult).toEqual({
      pairCount: 30,
      passCount: 25,
      rejectedMutationCount: 5,
      downstreamRescueAttempts: 0,
    });
    expect(data.sourceEventDuplicationCount).toBe(0);
    expect(data.preparatoryWorkMiscreditCount).toBe(0);
    expect(data.substitutionDoubleCountCount).toBe(0);
    expect(data.underAdaptation).toBe(0);
    expect(data.overAdaptation).toBe(0);
    expect(data.wrongLayerEffects).toBe(0);
    expect(data.downstreamRescueAttempts).toBe(0);
  });

  it("validates the design lab and preserves frozen production fingerprints", () => {
    expect(data.validations.catalogErrors).toEqual([]);
    expect(data.validations.sourceExposureValidation).toEqual([]);
    expect(data.validations.revisionValidation).toEqual([]);
    expect(data.validations.blockValidation).toEqual([]);
    expect(data.validations.planValidation).toEqual([]);
    expect(data.validations.performanceValidation).toEqual([]);
    expect(data.validations.policyValidation).toEqual([]);
    expect(data.validations.cagtGateOrderPreserved).toBe(true);
    expect(data.sampleCompilation.decisionTrace).toEqual([...PRESCRIPTION_COMPILATION_ORDER]);

    expect(data.fuzz.cases).toBe(10_000);
    expect(data.fuzz.completePipelines).toBe(1_000);
    expect(data.fuzz.failures).toEqual([]);
    expect(data.fuzz.digest).toBe(data.fuzz.repeatedRunDigest);

    expect(data.candidateBehaviorInvariance.rankingMatches).toBe(true);
    expect(data.candidateBehaviorInvariance.comprehensiveMatches).toBe(true);
    expect(data.sessionPlannerInvariance.matches).toBe(true);
    expect(data.sessionComposerInvariance.matches).toBe(true);
    expect(data.timingFoundationInvariance.matches).toBe(true);
    expect(data.productionFingerprints).toMatchObject({
      candidateRanking: "d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7",
      candidateComprehensive: "1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e",
      sessionPlanner: "b7faa908aa21262ad6875b846be0fac17139ec490458a26853b58dbe5dd5a8ab",
      sessionComposer: "3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9",
      timingFoundation: "e9882ebfdc5dc577108eec401f9f82cc23aecb8669c47e92589b0347a917a93f",
    });
    expect(data.fullPrescriptionFingerprints.combinedFullPrescriptionDesign).toBe(
      "9c32aa988525f229b8bf9d31574689fd492fc5bd7e9b3756f164c6c9f4a02805",
    );
    expect(Object.values(data.fullPrescriptionFingerprints).every((value) =>
      /^[a-f0-9]{64}$/.test(value),
    )).toBe(true);
  }, 30_000);
});
