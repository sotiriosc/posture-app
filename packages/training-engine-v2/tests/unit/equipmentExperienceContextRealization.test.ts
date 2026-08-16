import { describe, expect, it } from "vitest";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14,
} from "../cagt/effectiveAuthorityRegistryV14";
import {
  ADVANCED_BODYBUILDER_20_PLUS_YEARS_REALIZATION_CHALLENGE,
  ADVANCED_CHALLENGE_APPROXIMATE_WORK_SET_COUNT,
} from "../cagt/advancedBodybuilderChallenge";
import {
  buildB4CompilerInput,
  runB4Evidence,
} from "../cagt/equipmentExperienceContextEvidence";
import {
  compilePrescriptionAssignmentV1_3,
  evaluateRealizationContextEventsV1_2,
  resolveEquipmentLoadRealization,
  resolvePrescriptionRampUp,
} from "../../src";

describe("B4 equipment, experience, and context realization", () => {
  it("keeps training age contextual while retaining exact productive load in V1.3", () => {
    const result = compilePrescriptionAssignmentV1_3(buildB4CompilerInput({
      experienceYears: 20,
      exactLoad: 30,
    }));

    expect(result.status).toBe("exact_productive_realization_retained");
    expect(result.plan?.startingPoint).toMatchObject({
      status: "exact_prior_load_retained",
      automaticProgressionApplied: false,
      exactLoadGuessed: false,
    });
    const developmentalLoads = result.plan?.doseBlocks
      .filter((block) => block.purpose === "developmental_work")
      .map((block) => block.dose.load);
    expect(developmentalLoads).toEqual([{
      kind: "external_load",
      target: { kind: "exact", value: 30, unit: "kg" },
      application: "per_hand",
    }]);
    expect(result.progressionApplied).toBe(false);
  });

  it("calibrates missing exact load without downgrading an experienced athlete", () => {
    const advanced = compilePrescriptionAssignmentV1_3(buildB4CompilerInput({ experienceYears: 20 }));
    const noviceWithExactEvidence = compilePrescriptionAssignmentV1_3(buildB4CompilerInput({
      coarseExperience: "novice",
      realizationState: "exact_current_productive",
      exactLoad: 12,
    }));

    expect(advanced.status).toBe("self_selected_calibration_required");
    expect(advanced.startingPoint).toMatchObject({
      status: "self_selected_effort_calibration",
      selectedLoad: null,
      exactLoadGuessed: false,
    });
    expect(noviceWithExactEvidence.status).toBe("exact_productive_realization_retained");
  });

  it("exposes ceilings and increments without downstream rescue", () => {
    const ceiling = compilePrescriptionAssignmentV1_3(buildB4CompilerInput({
      exactLoad: 30,
      equipmentMaximum: 30,
      loadCeilingInsufficient: true,
    }));
    expect(ceiling).toMatchObject({
      status: "load_ceiling_recomposition_required",
      plan: null,
      progressionApplied: false,
    });
    expect(ceiling.equipmentLoadRealization).toMatchObject({
      loadCeilingVisible: true,
      candidateRecompositionRequired: true,
      exactLoadGuessed: false,
    });

    const input = buildB4CompilerInput();
    const increment = resolveEquipmentLoadRealization({
      profile: input.equipmentLoadProfile,
      requestedLoad: { kind: "external_load", target: { kind: "exact", value: 31, unit: "kg" },
        application: "per_hand" },
      currentExactLoad: null,
      loadCeilingInsufficientForPurpose: false,
    });
    expect(increment).toMatchObject({
      status: "load_increment_unavailable",
      nextExactLoad: 32,
      selectedLoad: null,
      exactLoadGuessed: false,
    });
  });

  it("rejects cross-person context and leaves maintenance deferred", () => {
    const mismatchInput = buildB4CompilerInput({ exactLoad: 20 });
    const mismatch = compilePrescriptionAssignmentV1_3({
      ...mismatchInput,
      identityFamiliarityProfile: {
        ...mismatchInput.identityFamiliarityProfile,
        athleteId: "b4:other-athlete",
      },
    });
    const maintenance = compilePrescriptionAssignmentV1_3(buildB4CompilerInput({
      trainingMode: "maintain",
      exactLoad: 20,
    }));

    expect(mismatch.status).toBe("context_realization_conflict");
    expect(mismatch.realizationStatusTrace).toContain("REALIZATION_CONTEXT_ATHLETE_MISMATCH");
    expect(maintenance).toMatchObject({ status: "base_compilation_failed", plan: null,
      progressionApplied: false });
    expect(maintenance.realizationStatusTrace)
      .toContain("MAINTENANCE_WEEK_AND_LONGITUDINAL_POLICY_REQUIRED");
  });

  it("keeps band and bodyweight realization truthful", () => {
    const input = buildB4CompilerInput();
    const band = resolveEquipmentLoadRealization({
      profile: { ...input.equipmentLoadProfile, implementKind: "band", paired: null,
        fixedOrAdjustable: "adjustable", loadMagnitude: { unit: "band_level", minimum: null,
          maximum: null, smallestIncrement: null, exactAvailableValues: null },
        bandType: "loop", bandAnchor: "stable_mid", bandConfiguration: "single",
        bandResistanceMeasured: false },
      requestedLoad: null,
      currentExactLoad: null,
      loadCeilingInsufficientForPurpose: false,
    });
    const bodyweight = resolveEquipmentLoadRealization({
      profile: { ...input.equipmentLoadProfile, implementKind: "bodyweight", paired: null,
        fixedOrAdjustable: "not_applicable", loadMagnitude: { unit: "not_applicable", minimum: null,
          maximum: null, smallestIncrement: null, exactAvailableValues: null },
        assistanceAvailable: true, externalLoadingAvailable: true },
      requestedLoad: null,
      currentExactLoad: null,
      loadCeilingInsufficientForPurpose: false,
    });

    expect(band).toMatchObject({ status: "effort_calibration_available",
      bandKilogramInferenceApplied: false, exactLoadGuessed: false });
    expect(bodyweight).toMatchObject({ status: "assistance_realization_available",
      selectedLoad: { kind: "bodyweight" } });
  });

  it("bounds ramp blocks inside one source event with zero developmental credit", () => {
    const ramp = resolvePrescriptionRampUp({
      exerciseId: "dumbbell-bench-press",
      sourceExposureEventId: "b4:test:event",
      familiarity: "identity_only",
      loadDelta: "large",
      workingLoadKnown: true,
      exactRampLoads: [],
      mainDevelopmentalWork: true,
      rampAppropriateForMode: true,
      currentReadinessAllowsTraining: true,
      sessionMinutesKnown: true,
      reviewedRampBlockCount: 4,
      athletePreferredRampBlockCount: null,
    });

    expect(ramp.blocks).toHaveLength(4);
    expect(new Set(ramp.blocks.map((block) => block.sourceExposureEventId))).toEqual(
      new Set(["b4:test:event"]),
    );
    expect(ramp.developmentalCreditCount).toBe(0);
    expect(ramp.blocks.every((block) => !block.developmentalCredit)).toBe(true);
  });

  it("fails closed on advanced techniques and validates the evidence corpus", () => {
    const technique = compilePrescriptionAssignmentV1_3(buildB4CompilerInput({
      intensityTechnique: true,
    }));
    const evidence = runB4Evidence();

    expect(technique.status).toBe("advanced_intensity_technique_policy_required");
    expect(technique.plan).toBeNull();
    expect(evidence.failures).toEqual([]);
    expect(evidence).toMatchObject({ controlledScenarioCount: 460, fixedShellCohortCount: 120 });
    expect(evidence.holdout).toMatchObject({ scenarioCount: 720,
      genuineCompilerV1_3Count: 500, gate13V1_2Count: 240, historicalGoldenCount: 180 });
  });

  it("preserves the sanitized real-user challenge and explicit future authorities", () => {
    expect(ADVANCED_CHALLENGE_APPROXIMATE_WORK_SET_COUNT).toBe(146);
    expect(ADVANCED_BODYBUILDER_20_PLUS_YEARS_REALIZATION_CHALLENGE).toMatchObject({
      authority: {
        completedPerformance: false,
        productRuntimeInput: false,
      },
    });
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V14).toMatchObject({
      reference: { registryId: "CAGT_EFFECTIVE_AUTHORITY_REGISTRY", version: "14.0.0" },
      ProductShadowCompilerAuthority: "HISTORICAL_COMPATIBILITY_V1_0_PINNED",
      ProductActivationAuthority: "NOT_AUTHORIZED",
    });
    expect(evaluateRealizationContextEventsV1_2([]).status).toBe("validated_context_realization_scope");
  });
});
