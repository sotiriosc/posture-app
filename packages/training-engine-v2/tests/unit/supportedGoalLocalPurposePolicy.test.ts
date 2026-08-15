import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_1,
  PRESCRIPTION_POLICY_V1,
  PRESCRIPTION_POLICY_V2,
  PRESCRIPTION_POLICY_V2_NEW_RULES,
  PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1,
  PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_1_CONTRACT_REFERENCE,
  PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE,
  PRODUCTION_PRESCRIPTION_COMPILER_VERSION_COMPATIBILITY_V1_2,
  PRODUCTION_WEEK_POLICY_V1,
  PRODUCTION_WEEK_POLICY_V2,
  SUPPORTED_GOAL_AND_LOCAL_PURPOSE_POLICY_V1,
  SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_CLASSIFICATION,
  SUPPORTED_GOAL_LOCAL_PURPOSE_NEXT_DEPENDENCY,
  WEEK_V2_FREQUENCY_CANDIDATES,
  compilePrescriptionAssignmentV1_2,
  evaluatePurposeContributionsV1_1,
  validateGoalLocalPurposeCompatibility,
  validatePrescriptionCompilationResultV1_2,
  validatePostPrescriptionWeek,
  validatePostPrescriptionWeekV1_1,
  validatePrescriptionPurposeResolverPolicyV1_1,
  validateProductionPrescriptionPolicyV2,
  validateProductionWeekPolicyV2,
} from "../../src";
import { buildProductionPostPrescriptionWeekBaseInput } from
  "../helpers/productionPostPrescriptionWeekValidationLab";
import { CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13,
  validateEffectiveAuthorityRegistryV13 } from "../cagt/effectiveAuthorityRegistryV13";
import { buildSupportedPurposeCompilerInput, purposeEvent, runSupportedGoalLocalPurposeEvidence,
  runWeekPurposePath } from "../cagt/supportedGoalLocalPurposeEvidence";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : path.endsWith(".ts") ? [path] : [];
  });
}

describe("B3 supported goal and local-purpose policy", () => {
  it("publishes only explicit future versions and leaves activation off", () => {
    expect(SUPPORTED_GOAL_AND_LOCAL_PURPOSE_POLICY_V1).toMatchObject({
      reference: { policyId: "SUPPORTED_GOAL_AND_LOCAL_PURPOSE_POLICY", version: "1.0.0" },
      goalCreatesPurpose: false, onePrimaryPurposePerAssignment: true,
      blendedNumericPrescriptionAllowed: false, duplicateSourceEventsAllowed: false,
      productActivationAuthorized: false,
    });
    expect(PRODUCTION_PRESCRIPTION_COMPILER_V1_2_CONTRACT_REFERENCE.contractVersion).toBe("1.2.0");
    expect(PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_1_CONTRACT_REFERENCE.contractVersion).toBe("1.1.0");
    expect(PRODUCTION_PRESCRIPTION_COMPILER_VERSION_COMPATIBILITY_V1_2).toMatchObject({
      defaultCompilerVersion: null, automaticMigration: false, productCallerCount: 0,
      productShadowCallerCount: 0, orchestrationCallerCount: 0, activated: false,
    });
    expect(SUPPORTED_GOAL_LOCAL_PURPOSE_POLICY_CLASSIFICATION).toBe(
      "SUPPORTED_GOAL_AND_LOCAL_PURPOSE_PRESCRIPTION_POLICY_V1_READY_FOR_EQUIPMENT_EXPERIENCE_CONTEXT_REALIZATION_AUTHORIZATION");
    expect(SUPPORTED_GOAL_LOCAL_PURPOSE_NEXT_DEPENDENCY).toBe(
      "EQUIPMENT_EXPERIENCE_AND_CONTEXT_SPECIFIC_PRESCRIPTION_REALIZATION_V1_AUTHORIZATION");
  });

  it("retains every V1 numeric rule by reference and adds only SH1, MQ1, and ME1", () => {
    expect(validateProductionPrescriptionPolicyV2(PRESCRIPTION_POLICY_V2)).toEqual([]);
    expect(PRESCRIPTION_POLICY_V2.rules.slice(0, PRESCRIPTION_POLICY_V1.rules.length))
      .toEqual(PRESCRIPTION_POLICY_V1.rules);
    PRESCRIPTION_POLICY_V1.rules.forEach((rule, index) =>
      expect(PRESCRIPTION_POLICY_V2.rules[index]).toBe(rule));
    expect(PRESCRIPTION_POLICY_V2_NEW_RULES).toHaveLength(7);
    expect(PRESCRIPTION_POLICY_V2_NEW_RULES.map((rule) => rule.ruleId)).toEqual([
      "PRESCRIPTION_POLICY_V2:secondary_hypertrophy.SH1",
      "PRESCRIPTION_POLICY_V2:movement_quality_main.MQ1.standard",
      "PRESCRIPTION_POLICY_V2:movement_quality_main.MQ1.regression",
      "PRESCRIPTION_POLICY_V2:movement_quality_accessory.MQ1",
      "PRESCRIPTION_POLICY_V2:muscular_endurance_main.ME1.standard",
      "PRESCRIPTION_POLICY_V2:muscular_endurance_main.ME1.regression",
      "PRESCRIPTION_POLICY_V2:muscular_endurance_accessory.ME1",
    ]);
  });

  it("validates goals without creating purpose and keeps unsupported lanes typed", () => {
    expect(validateGoalLocalPurposeCompatibility({ outcomeGoal: "general_fitness", localPurpose: null,
      purposeAuthority: "unknown", goalRelationship: "cross_goal_support",
      programmingContextModes: [], requestedSystemicScope: false }).reasonCodes)
      .toContain("GENERAL_FITNESS_PURPOSE_BUNDLE_REQUIRED");
    expect(validateGoalLocalPurposeCompatibility({ outcomeGoal: "conditioning",
      localPurpose: "muscular_endurance_development", purposeAuthority: "primary_local_purpose",
      goalRelationship: "primary_weekly_goal", programmingContextModes: [],
      requestedSystemicScope: true }).reasonCodes).toContain("SYSTEMIC_CONDITIONING_POLICY_REQUIRED");
    expect(validateGoalLocalPurposeCompatibility({ outcomeGoal: "strength",
      localPurpose: "power_development", purposeAuthority: "primary_local_purpose",
      goalRelationship: "primary_weekly_goal", programmingContextModes: [],
      requestedSystemicScope: false }).reasonCodes).toContain("POWER_DEVELOPMENT_POLICY_REQUIRED");
  });

  it("preserves Week V1 rules and propagates new local purposes exactly", () => {
    expect(validateProductionWeekPolicyV2(PRODUCTION_WEEK_POLICY_V2)).toEqual([]);
    PRODUCTION_WEEK_POLICY_V1.frequencyRules.forEach((rule, index) =>
      expect(PRODUCTION_WEEK_POLICY_V2.frequencyRules[index]).toBe(rule));
    expect(WEEK_V2_FREQUENCY_CANDIDATES.filter((candidate) => candidate.ownerPreferred)
      .map((candidate) => candidate.candidateId)).toEqual(["MQF2", "MEF2"]);
    for (const family of ["movement_quality", "muscular_endurance"] as const) {
      const path = runWeekPurposePath(family, 4);
      expect(path.intent.objectives[0]!.frequencyIntent).toMatchObject({
        minimumAllocatedSessions: 1, targetAllocatedSessions: 2, softMaximumAllocatedSessions: 3,
      });
      expect(path.plan.optionalBloatCount).toBe(0);
      expect(path.materialized.every((item) => item.localPrescriptionPurpose ===
        item.plannerProvenance.localPrescriptionPurpose)).toBe(true);
    }
  });

  it("compiles distinct secondary-hypertrophy, movement-quality, and local-endurance plans", () => {
    const cases = [
      ["hypertrophy_development", "secondary_hypertrophy", "hypertrophy_development_candidate"],
      ["movement_quality_development", "movement_quality_main", "movement_quality_practice_candidate"],
      ["muscular_endurance_development", "muscular_endurance_main", "muscular_endurance_development_candidate"],
    ] as const;
    for (const [purpose, useCase, lane] of cases) {
      const result = compilePrescriptionAssignmentV1_2(buildSupportedPurposeCompilerInput({ purpose }));
      expect(result).toMatchObject({ status: "compiled", selectedPurpose: purpose,
        selectedUseCase: useCase, fallbackApplied: false });
      expect(validatePrescriptionCompilationResultV1_2(result)).toEqual([]);
      expect(result.plan!.purposeContributions[0]!.primaryLane).toBe(lane);
    }
  });

  it("fails closed for power, systemic conditioning, maintenance, and return/rebuild", () => {
    const results = [
      compilePrescriptionAssignmentV1_2(buildSupportedPurposeCompilerInput({ purpose: "power_development" })),
      compilePrescriptionAssignmentV1_2(buildSupportedPurposeCompilerInput({
        purpose: "systemic_conditioning_development", requestedSystemicScope: true })),
      compilePrescriptionAssignmentV1_2(buildSupportedPurposeCompilerInput({
        purpose: "strength_development", trainingMode: "maintain" })),
      compilePrescriptionAssignmentV1_2(buildSupportedPurposeCompilerInput({
        purpose: "strength_development", trainingMode: "return_or_rebuild" })),
    ];
    expect(results.map((result) => result.status)).toEqual([
      "power_development_policy_required", "systemic_conditioning_policy_required",
      "maintenance_week_and_longitudinal_policy_required",
      "return_or_rebuild_realization_policy_required",
    ]);
    expect(results.every((result) => result.plan === null && !result.fallbackApplied)).toBe(true);
    expect(validatePrescriptionPurposeResolverPolicyV1_1(PRESCRIPTION_PURPOSE_RESOLVER_POLICY_V1_1)).toEqual([]);
  });

  it("accepts one-dose multi-view traces and rejects miscredit or duplicate dose", () => {
    const valid = evaluatePurposeContributionsV1_1(purposeEvent({ purpose: "movement_quality_development" }));
    const miscredit = evaluatePurposeContributionsV1_1(purposeEvent({
      purpose: "movement_quality_development", mutation: "miscredit" }));
    const duplicate = evaluatePurposeContributionsV1_1(purposeEvent({
      purpose: "muscular_endurance_development", mutation: "duplicate_dose" }));
    expect(valid).toMatchObject({ status: "validated_supported_purpose_scope", noDoubleCredit: true,
      noSystemicConditioningInference: true, creditedObjectiveIds: ["b3:objective:1"],
      traceOnlyObjectiveIds: ["b3:objective:cross"] });
    expect(miscredit.reasonCodes).toContain("OBJECTIVE_PURPOSE_MISCREDIT:b3:objective:1");
    expect(duplicate.reasonCodes).toContain("DUPLICATE_SOURCE_EVENT_DOSE:b3:source-event:1");
    expect(POST_PRESCRIPTION_WEEK_VALIDATION_POLICY_V1_1).toMatchObject({
      onePrimaryLanePerBlock: true, duplicateDoseAllowed: false,
      systemicConditioningInferenceAllowed: false, productionActivation: false,
    });
  });

  it("runs Gate 13 V1.1 over exact V1.0 validation and verifies event, block, and objective lineage", () => {
    const baseValidationInput = buildProductionPostPrescriptionWeekBaseInput(2);
    const base = validatePostPrescriptionWeek(baseValidationInput);
    const source = base.sourceExposureLedger.find((event) => event.weeklyObjectiveIds.length > 0 &&
      event.blockPurposeViews.some((block) => block.purpose === "developmental_work"))!;
    const block = source.blockPurposeViews.find((entry) => entry.purpose === "developmental_work")!;
    const contribution = {
      sourceExposureEventId: source.sourceExposureEventId,
      blockId: block.blockId,
      blockPurpose: block.purpose,
      localPurpose: "strength_development" as const,
      primaryLane: "strength_development_candidate" as const,
      objectiveViews: [{ objectiveId: source.weeklyObjectiveIds[0]!,
        localPurpose: "strength_development" as const,
        relationship: "primary_weekly_goal" as const, creditRequested: true }],
      doseFingerprint: `v1_1:${source.sourceExposureEventId}:${block.blockId}`,
      duplicateDoseCreated: false as const,
      systemicConditioningClaimed: false as const,
      completedPerformanceClaimed: false as const,
      adaptationClaimed: false as const,
    };
    const result = validatePostPrescriptionWeekV1_1({
      validatorContract: PRODUCTION_POST_PRESCRIPTION_WEEK_VALIDATOR_V1_1_CONTRACT_REFERENCE,
      baseValidationInput,
      purposeContributionEvents: [contribution],
    });
    expect(result).toMatchObject({ status: "validated_supported_purpose_scope",
      authority: "PRODUCTION_KERNEL_AUTHORITY_NOT_PRODUCT_RUNTIME",
      productionActivationStatus: "NOT_ACTIVATED" });
    expect(result.baseValidation).toEqual(base);
  });

  it("passes the locked holdout and deterministic stress requirements", () => {
    const evidence = runSupportedGoalLocalPurposeEvidence();
    expect(evidence.failures).toEqual([]);
    expect(evidence).toMatchObject({ controlledScenarioCount: 315, fixedShellCohortCount: 84,
      historicalGoldenCount: 120, goldenEquivalent: true, weekPurposePropagationExact: true });
    expect(evidence.holdout).toMatchObject({ scenarioCount: 540, genuineCompilerV1_2Count: 380,
      weekV2Count: 180, gate13V1_1Count: 180, historicalGoldenCount: 120,
      lockedBeforeEvaluation: true, tuningAfterInspectionPermitted: false });
    expect(evidence.stress).toMatchObject({ goalPurposeCompatibility: 10_000,
      weekFamilyFrequency: 10_000, purposeResolutions: 10_000, numericRuleResolutions: 10_000,
      compilerV1_2: 8_000, gate13V1_1: 5_000, movementQuality: 3_000,
      muscularEndurance: 3_000, secondaryHypertrophy: 2_000, noRescueMutations: 1_000 });
  });

  it("registers V13 without changing historical gate authority", () => {
    expect(validateEffectiveAuthorityRegistryV13()).toEqual([]);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V13).toMatchObject({
      reference: { version: "13.0.0" }, historicalRegistriesPreserved: true,
      ProductShadowCompilerAuthority: "HISTORICAL_COMPATIBILITY_V1_0_PINNED",
      ProductActivationAuthority: "NOT_AUTHORIZED", productionImportsCagt: false,
      productRuntimeActive: false, supportedPurposeCompilerActivated: false,
    });
  });

  it("keeps Product Shadow and application orchestration free of B3 runtime imports", () => {
    const roots = [resolve(process.cwd(), "src/productShadow"),
      resolve(process.cwd(), "src/applicationOrchestration")];
    const forbidden = ["compilerV1_2", "purposeResolutionV1_1", "policiesV2",
      "weekPlanningV1_1", "weekValidationV1_1"];
    const content = roots.flatMap(sourceFiles).map((path) => readFileSync(path, "utf8")).join("\n");
    for (const token of forbidden) expect(content).not.toContain(token);
  });
});
