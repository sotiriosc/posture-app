import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PRODUCT_SHADOW_MAPPING_READINESS_STATES,
  validateProductShadowGoalRealizationMappingBundle,
} from "@praxis/training-engine-v2";
import { projectProductGoalArchitectureImplementationStatus } from
  "../../../training-engine-v2/src/productGoalArchitecture";
import {
  CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4,
  buildControlledProductShadowGoalRealizationMappingBundleV1,
  mapProductEquipmentForRealization,
  mapProductGoalForGoalRealizationProfile,
  mapProductTrainingModeV2,
} from "../../src/controlledProductShadowGoalRealization";
import { buildChunkCMappingInput, calibrationFixtureExtensions, exactFixtureExtensions } from
  "../cagt/controlledProductShadowGoalRealizationEvidence";

describe("controlled Product Shadow goal and realization mapping V1", () => {
  it("maps strength, hypertrophy, and movement labels without creating exercise or dose", () => {
    const cases = [
      ["Get stronger", "strength"],
      ["Build muscle", "hypertrophy"],
      ["Improve posture", "posture_and_movement_quality"],
      ["Improve posture and movement", "posture_and_movement_quality"],
    ] as const;
    for (const [label, primaryOutcome] of cases) {
      const mapping = mapProductGoalForGoalRealizationProfile({ questionnaire: { goals: label },
        fixtureExtensions: exactFixtureExtensions() });
      expect(mapping).toMatchObject({ status: "mapped", primaryOutcome,
        goalCreatesExercises: false, goalCreatesNumericDose: false });
    }
  });

  it("separates legacy pain, general fitness, and athletic follow-up", () => {
    expect(mapProductGoalForGoalRealizationProfile({ questionnaire: { goals: "Reduce pain" } }))
      .toMatchObject({ primaryOutcome: null, programmingContexts: ["pain_aware_return"],
        followUpRequirements: expect.arrayContaining(["PRODUCT_PRIMARY_OUTCOME_GOAL_REQUIRED"]) });
    expect(mapProductGoalForGoalRealizationProfile({ questionnaire: { goals: "General fitness" } }))
      .toMatchObject({ primaryOutcome: "general_fitness", status: "follow_up_required",
        followUpRequirements: expect.arrayContaining(["GENERAL_FITNESS_PURPOSE_BUNDLE_REQUIRED"]) });
    for (const goals of ["Athletic performance", "Improve athletic performance"]) {
      expect(mapProductGoalForGoalRealizationProfile({ questionnaire: { goals } }))
        .toMatchObject({ primaryOutcome: null, status: "follow_up_required",
          followUpRequirements: expect.arrayContaining(["ATHLETIC_PERFORMANCE_FOLLOW_UP_REQUIRED"]) });
    }
  });

  it("admits an explicit general-fitness bundle but fails systemic conditioning closed", () => {
    const bundle = exactFixtureExtensions({ fitnessFocus: "mixed_general_fitness",
      purposeBundle: { required: ["strength_development", "muscular_endurance_development"],
        preferred: ["movement_quality_development"], optional: [] } });
    expect(buildControlledProductShadowGoalRealizationMappingBundleV1(buildChunkCMappingInput({
      goal: "General fitness", fixtureExtensions: bundle })).planningBrief)
      .toMatchObject({ primaryOutcome: "general_fitness", exerciseCreationCount: 0,
        numericDoseCreationCount: 0 });
    expect(mapProductGoalForGoalRealizationProfile({ questionnaire: { goals: "Improve fitness and stamina" },
      fixtureExtensions: exactFixtureExtensions({ fitnessFocus: "systemic_conditioning" }) }))
      .toMatchObject({ status: "follow_up_required",
        followUpRequirements: expect.arrayContaining(["SYSTEMIC_CONDITIONING_POLICY_REQUIRED"]) });
  });

  it("accepts one ordered secondary outcome and rejects duplicate or unsupported values", () => {
    expect(mapProductGoalForGoalRealizationProfile({ questionnaire: { goals: "Get stronger" },
      fixtureExtensions: exactFixtureExtensions({ secondaryOutcome: "hypertrophy" }) }))
      .toMatchObject({ primaryOutcome: "strength", secondaryOutcome: "hypertrophy",
        goalRelationships: ["primary", "secondary"], status: "mapped" });
    expect(mapProductGoalForGoalRealizationProfile({ questionnaire: { goals: "Get stronger" },
      fixtureExtensions: exactFixtureExtensions({ secondaryOutcome: "strength" }) }))
      .toMatchObject({ status: "conflict",
        followUpRequirements: expect.arrayContaining(["PRODUCT_SECONDARY_GOAL_DUPLICATES_PRIMARY"]) });
    expect(mapProductGoalForGoalRealizationProfile({ questionnaire: { goals: "Get stronger" },
      fixtureExtensions: exactFixtureExtensions({ secondaryOutcome: "toning" as never }) }))
      .toMatchObject({ secondaryOutcome: null, status: "conflict",
        followUpRequirements: expect.arrayContaining(["PRODUCT_SECONDARY_GOAL_UNSUPPORTED"]) });
  });

  it("maps training intent separately from outcomes", () => {
    expect(mapProductTrainingModeV2({ trainingIntent: "build" })).toMatchObject({ mode: "develop",
      status: "mapped" });
    expect(mapProductTrainingModeV2({ trainingIntent: "maintain" })).toMatchObject({ mode: "maintain",
      status: "policy_required", reasonCodes: ["MAINTENANCE_WEEK_AND_LONGITUDINAL_POLICY_REQUIRED"] });
    expect(mapProductTrainingModeV2({ trainingIntent: "rehab" })).toMatchObject({ mode: "return_or_rebuild",
      programmingContexts: ["pain_aware_return"], diagnosticInferenceCount: 0 });
  });

  it("keeps current equipment at presence-only truth", () => {
    expect(mapProductEquipmentForRealization({ questionnaire: { equipment: ["none"] } }).capability)
      .toMatchObject({ status: "presence_only",
        knownPresence: ["bodyweight_context_no_external_equipment_selected"] });
    expect(mapProductEquipmentForRealization({ questionnaire: { equipment: ["dumbbells"] } }).capability
      .explicitUnknowns).toEqual(expect.arrayContaining(["bench", "maximum_load", "load_increment"]));
    expect(mapProductEquipmentForRealization({ questionnaire: { equipment: ["bands"] } }).capability
      .explicitUnknowns).toEqual(expect.arrayContaining(["band_type", "band_anchor", "resistance"]));
    expect(mapProductEquipmentForRealization({ questionnaire: { equipment: ["gym"] } }).capability)
      .toMatchObject({ status: "presence_only", universalGymCapabilityInferenceCount: 0,
        legacyProgramEquipmentInferenceCount: 0 });
  });

  it("permits calibration only after exact base capability is supplied", () => {
    const mapping = buildControlledProductShadowGoalRealizationMappingBundleV1(buildChunkCMappingInput({
      fixtureExtensions: calibrationFixtureExtensions(),
    }));
    expect(mapping.equipmentLoadRealizationMapping).toMatchObject({ exactRealizationAvailable: false,
      selfSelectedCalibrationAvailable: true, guessedLoadCount: 0, progressionAuthorityCount: 0 });
    expect(mapping.readiness.primaryState).toBe("complete_with_self_selected_calibration");
    const unknown = buildControlledProductShadowGoalRealizationMappingBundleV1(buildChunkCMappingInput({
      fixtureExtensions: null,
    }));
    expect(unknown.equipmentLoadRealizationMapping.selfSelectedCalibrationAvailable).toBe(false);
  });

  it("keeps coarse experience and legacy history restricted", () => {
    const mapping = buildControlledProductShadowGoalRealizationMappingBundleV1(buildChunkCMappingInput());
    expect(mapping.experienceMapping).toMatchObject({ coarseExperience: "advanced", trainingYears: null,
      recentConsistency: null, exactExerciseFamiliarity: null, exactLoadAuthority: false });
    expect(mapping.legacyHistoryProjection).toMatchObject({
      authority: "restricted_identity_and_continuity_context_only",
      continuityContext: "LEGACY_DELIVERED_PROGRAM_CONTINUITY_CONTEXT",
      athleteAuthoredProgrammingCount: 0, exactRealizationFamiliarityCount: 0,
      completedV2PerformanceCount: 0, progressionAuthorityCount: 0 });
  });

  it("corrects easy, pain, and substitution authority in the new profile", () => {
    const mapping = buildControlledProductShadowGoalRealizationMappingBundleV1(buildChunkCMappingInput({
      preferences: { schemaVersion: 1, feedbackByExercise: { "dead-bug": { rating: "easy" },
        "push-up": { rating: "pain" } }, substitutionByExercise: { "push-up": "dead-bug" } },
    }));
    expect(mapping.preferenceContinuityMapping).toMatchObject({ strongPreferredExerciseIds: [],
      easyChallengeFeedbackExerciseIds: ["dead-bug"], painMarkedContextExerciseIds: ["push-up"],
      permanentFeedbackBlockCount: 0, progressionAuthorityCount: 0, globalSubstitutionAuthorityCount: 0 });
  });

  it("creates ordered opportunities without dates or invented minutes", () => {
    const current = buildControlledProductShadowGoalRealizationMappingBundleV1(buildChunkCMappingInput({
      fixtureExtensions: null, daysPerWeek: 5,
    })).availabilityMapping;
    expect(current).toMatchObject({ opportunityCount: 5, status: "ordered_opportunities",
      calendarReadCount: 0, inventedMinutesCount: 0 });
    expect(current.opportunities.every((entry) => entry.date === null && entry.weekday === null &&
      entry.minutes === null)).toBe(true);
  });

  it("builds a valid explicit profile bundle with closed readiness", () => {
    const mapping = buildControlledProductShadowGoalRealizationMappingBundleV1(buildChunkCMappingInput());
    expect(validateProductShadowGoalRealizationMappingBundle(mapping)).toEqual([]);
    expect(PRODUCT_SHADOW_MAPPING_READINESS_STATES).toContain(mapping.readiness.primaryState);
    expect(mapping).toMatchObject({ counterfactualOnly: true, rawProductPayloadIncluded: false,
      planningBrief: { exerciseCreationCount: 0, numericDoseCreationCount: 0, applied: false } });
    expect(CONTROLLED_PRODUCT_SHADOW_GOAL_REALIZATION_PROFILE_V1_B1_B4).toMatchObject({
      defaultSelected: false, productAuthority: "LEGACY_PRODUCT_OUTPUT_ONLY", activationState: "NOT_ACTIVATED" });
  });

  it("projects B1-B4 as complete while Chunk C is active or closed", () => {
    const workspace = process.cwd().endsWith("packages/engine") ?
      resolve(process.cwd(), "../..") : process.cwd();
    const ledger = readFileSync(resolve(workspace, "docs/training-engine-v2/" +
      "PRAXIS_PRODUCT_GOAL_ARCHITECTURE_LEDGER.md"), "utf8");
    const status = projectProductGoalArchitectureImplementationStatus(ledger);
    expect(status.chunks).toMatchObject({ B1: "completed", B2: "completed", B3: "completed",
      B4: "completed", D: "open", E: "open", F: "open", G: "open", H: "open" });
    expect(["active", "completed"]).toContain(status.chunks.C);
  });
});
