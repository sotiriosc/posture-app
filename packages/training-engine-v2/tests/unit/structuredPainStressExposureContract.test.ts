import { describe, expect, it } from "vitest";
import {
  CANDIDATE_PAIN_SCORING_COEFFICIENTS,
  JOINT_STRESS_TAGS,
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  buildCandidatePainExecutionReadinessTrace,
  buildCandidatePainMatchTrace,
  buildExerciseStressProfile,
  buildPrescriptionStressExposureTrace,
  exactCount,
  exactSteps,
  receiverDecision,
  validateExerciseStressAnnotation,
  type CurrentDiscomfort,
  type ExerciseDefinition,
  type ExercisePrescription,
  type ExerciseStressAnnotation,
  type JointStressTag,
  type PainAndInjuryState,
} from "../../src";

const OWNER_PROVENANCE = [{
  source: "owner_decision",
  sourceRef: "TRUNK-CARRY-PAIN-STRESS-OWNER-2026-08-12",
  evidenceBasis: ["Owner-approved generic structured pain-stress contract."],
}] as const;

const APPROVED_TAGS = [
  "upper_limb_support_loading",
  "loaded_trunk_rotation",
  "lateral_trunk_loading",
  "loaded_gait",
  "loaded_march",
  "grip_loading",
] as const;

const REJECTED_TAGS = [
  "sustained_upper_limb_support_loading",
  "loaded_gait_or_march",
  "core_stress",
  "carry_stress",
  "bad_posture",
  "spinal_instability",
  "unsafe_rotation",
  "weak_core",
  "poor_alignment",
  "bracing_stress",
  "hard_exercise",
] as const;

function baseExercise(id: string, annotations: readonly ExerciseStressAnnotation[] = []): ExerciseDefinition {
  const base = REFERENCE_EXERCISES[0];
  if (!base) {
    throw new Error("Missing reference exercise fixture.");
  }

  return {
    ...base,
    id,
    name: id,
    summary: "Synthetic structured pain-stress contract fixture.",
    bodyRegions: ["shoulder", "lumbar_spine", "hip"],
    movementRoles: ["horizontal_push"],
    loading: {
      ...base.loading,
      jointStressTags: [],
    },
    stressAnnotations: annotations,
    cautionStressTags: [],
    contraindicatedStressTags: [],
  };
}

function annotation(input: {
  readonly tag: JointStressTag;
  readonly exposureScope: ExerciseStressAnnotation["exposureScope"];
  readonly sideScope?: ExerciseStressAnnotation["sideScope"];
  readonly reviewStatus?: ExerciseStressAnnotation["reviewStatus"];
}): ExerciseStressAnnotation {
  return {
    tag: input.tag,
    source: "joint_stress",
    exposureScope: input.exposureScope,
    sideScope: input.sideScope ?? "side_neutral",
    reviewStatus: input.reviewStatus ?? "accepted",
    provenance: OWNER_PROVENANCE,
    notes: "Synthetic annotation with explicit owner provenance.",
  };
}

function painState(signal: CurrentDiscomfort): PainAndInjuryState {
  return {
    ...NO_PAIN_OR_INJURY,
    currentDiscomforts: [signal],
  };
}

function discomfort(input: {
  readonly id?: string;
  readonly stressTags: readonly JointStressTag[];
  readonly side?: CurrentDiscomfort["side"];
}): CurrentDiscomfort {
  return {
    kind: "current_discomfort",
    id: input.id ?? "current",
    region: "lumbar_spine",
    side: input.side,
    severity0To10: 2,
    stressTags: input.stressTags,
    effect: "reduce_load",
    description: "Synthetic current discomfort.",
  };
}

function stepMarchPrescription(): ExercisePrescription {
  return {
    prescriptionId: "rx-wall-march",
    sourceExposureEventId: "source-wall-march-event",
    exerciseId: "wall-supported-suitcase-march",
    phaseId: "phase_1",
    createdAt: "2026-08-12T00:00:00.000Z",
    dose: {
      mode: "step_march",
      stationary: true,
      steps: exactSteps(24),
      alternation: "alternating",
      marchControlStandard: "Stationary alternating march.",
      load: {
        kind: "external_load",
        target: { kind: "exact", value: 10, unit: "kg" },
        application: "single_implement",
        side: "left",
      },
      support: {
        level: "light_touch",
        surface: "wall",
        side: "right",
      },
      sideBehavior: {
        movementSide: { kind: "alternating" },
        loadSide: "left",
        supportSide: "right",
        sideRelationship: "opposite_side",
        alternates: true,
      },
    },
    executionStandard: {
      alignmentPriorityIds: [],
      assessmentPriorityIds: [],
      painResponseRequirementIds: [],
      exerciseMechanicsIntent: "Stationary wall-supported suitcase march.",
      criteria: [],
      provenance: {
        source: "synthetic_contract_fixture",
        sourceRef: "structured-pain-stress-test",
      },
    },
    rationale: ["Synthetic wall march prescription trace."],
    intendedProgressionAxes: [],
    provenance: {
      source: "synthetic_contract_fixture",
      sourceRef: "structured-pain-stress-test",
    },
  };
}

describe("structured pain-stress exposure contract", () => {
  it("adds only the six approved stress tags and excludes rejected vocabulary", () => {
    expect(JOINT_STRESS_TAGS).toEqual(expect.arrayContaining([...APPROVED_TAGS]));
    expect(JOINT_STRESS_TAGS).not.toEqual(expect.arrayContaining([...REJECTED_TAGS]));
  });

  it("validates generic annotations without making the contract trunk-specific", () => {
    const valid = annotation({
      tag: "upper_limb_support_loading",
      exposureScope: "intrinsic",
      sideScope: "prescription_side",
    });
    const invalid = {
      ...valid,
      source: "reference_catalog",
      exposureScope: "always_bad",
      reviewStatus: "accepted",
      provenance: [{
        source: "legacy_unscoped",
        sourceRef: "",
        evidenceBasis: [],
      }],
    } as unknown as ExerciseStressAnnotation;

    expect(validateExerciseStressAnnotation(valid)).toEqual([]);
    expect(validateExerciseStressAnnotation(invalid).map((finding) => finding.code))
      .toEqual(expect.arrayContaining([
        "invalid_source",
        "invalid_exposure_scope",
        "missing_provenance_source_ref",
        "missing_evidence_basis",
        "accepted_provenance_not_authoritative",
      ]));
    expect(baseExercise("upper-limb-support", [valid]).bodyRegions).toEqual([
      "shoulder",
      "lumbar_spine",
      "hip",
    ]);
  });

  it("preserves legacy stress behavior and admits only accepted intrinsic structured facts", () => {
    const legacy: ExerciseDefinition = {
      ...baseExercise("legacy"),
      loading: {
        ...baseExercise("legacy").loading,
        jointStressTags: ["loaded_knee_flexion"] as const,
      },
    };
    const structured = baseExercise("structured-intrinsic", [
      annotation({ tag: "loaded_trunk_rotation", exposureScope: "intrinsic" }),
      annotation({ tag: "lateral_trunk_loading", exposureScope: "variant_dependent" }),
      annotation({ tag: "grip_loading", exposureScope: "intrinsic", reviewStatus: "needs_review" }),
    ]);

    expect(buildExerciseStressProfile(legacy)).toEqual([{
      tag: "loaded_knee_flexion",
      sources: ["joint_stress"],
    }]);
    expect(buildExerciseStressProfile(structured)).toEqual([{
      tag: "loaded_trunk_rotation",
      sources: ["joint_stress"],
    }]);
  });

  it("keeps potential structured stress out of candidate match units while exposing prescription resolution", () => {
    const exercise = baseExercise("potential-lateral-trunk", [
      annotation({
        tag: "lateral_trunk_loading",
        exposureScope: "prescription_modifiable",
        sideScope: "prescription_side",
      }),
    ]);
    const trace = buildCandidatePainMatchTrace({
      exercise,
      painAndInjury: painState(discomfort({
        stressTags: ["lateral_trunk_loading"],
        side: "right",
      })),
    });
    const readiness = buildCandidatePainExecutionReadinessTrace(trace);

    expect(trace.exerciseStressFacts).toEqual([]);
    expect(trace.uniqueMatchCount).toBe(0);
    expect(receiverDecision(trace, "pain_suitability").countedMatchUnitCount).toBe(0);
    expect(receiverDecision(trace, "joint_cost").countedMatchUnitCount).toBe(0);
    expect(receiverDecision(trace, "hard_contraindication").criteria).toEqual([]);
    expect(receiverDecision(trace, "acute_severe_eligibility").criteria).toEqual([]);
    expect(trace.signalTraces[0]?.side).toBe("right");
    expect(trace.exerciseStressPotentialTraces[0]).toEqual(expect.objectContaining({
      tag: "lateral_trunk_loading",
      matchedPainSignalIds: ["current"],
      candidateReceiverEligibility: "candidate_potential_only",
      requiresPrescriptionResolution: true,
    }));
    expect(trace.responseRequirements[0]).toEqual(expect.objectContaining({
      primaryFutureOwner: "prescription",
      executionStatus: "potential_stress_requires_prescription_resolution",
      matchedStressFacts: [],
    }));
    expect(trace.responseRequirements[0]?.potentialStressEvidence?.[0]?.tag)
      .toBe("lateral_trunk_loading");
    expect(readiness.readiness).toBe("REQUIRES_PRESCRIPTION");
  });

  it("preserves missing side as null and keeps stress tags side-neutral", () => {
    const exercise = baseExercise("intrinsic-loaded-march", [
      annotation({ tag: "loaded_march", exposureScope: "intrinsic" }),
    ]);
    const trace = buildCandidatePainMatchTrace({
      exercise,
      painAndInjury: painState(discomfort({ stressTags: ["loaded_march"] })),
    });

    expect(trace.signalTraces[0]?.side).toBeNull();
    expect(trace.signalMatches[0]?.side).toBeNull();
    expect(APPROVED_TAGS.every((tag) => !tag.includes("left") && !tag.includes("right")))
      .toBe(true);
  });

  it("does not turn potential hard or acute matches into candidate rejection authority", () => {
    const exercise = baseExercise("dose-created-grip", [
      annotation({ tag: "grip_loading", exposureScope: "dose_created" }),
    ]);
    const trace = buildCandidatePainMatchTrace({
      exercise,
      painAndInjury: {
        ...NO_PAIN_OR_INJURY,
        acuteSeverePain: [{
          kind: "acute_severe_pain",
          id: "acute-potential",
          region: "wrist",
          severity0To10: 8,
          stressTags: ["grip_loading"],
          invalidatesTrainingRoles: [],
          urgentReviewRecommended: false,
          description: "Potential-only acute stress match.",
        }],
        hardContraindications: [{
          kind: "hard_contraindication",
          id: "hard-potential",
          stressTags: ["grip_loading"],
          reason: "Potential-only hard stress match.",
          source: "clinician",
        }],
      },
    });

    expect(trace.uniqueMatchCount).toBe(0);
    expect(receiverDecision(trace, "hard_contraindication").executionStatus).toBe("legal");
    expect(receiverDecision(trace, "acute_severe_eligibility").executionStatus).toBe("legal");
  });

  it("preserves one prescription source exposure event and unresolved dose states", () => {
    const prescription = stepMarchPrescription();
    const march = buildPrescriptionStressExposureTrace({
      prescription,
      stressTag: "loaded_march",
      exercisePotentialScope: "intrinsic",
      realizationStatus: "present_under_prescription",
      side: "bilateral",
      provenance: OWNER_PROVENANCE,
      reason: "Wall march is stationary loaded marching, not loaded gait.",
    });
    const lateral = buildPrescriptionStressExposureTrace({
      prescription,
      stressTag: "lateral_trunk_loading",
      exercisePotentialScope: "prescription_modifiable",
      realizationStatus: "dose_not_yet_classified",
      side: "left",
      provenance: OWNER_PROVENANCE,
      reason: "Wall support/load relationship requires reviewed classification.",
    });

    expect(march.sourceExposureEventId).toBe("source-wall-march-event");
    expect(lateral.sourceExposureEventId).toBe(march.sourceExposureEventId);
    expect(march.distance).toBeNull();
    expect(march.steps).toEqual(exactSteps(24));
    expect(march.support?.surface).toBe("wall");
    expect(lateral.receiverEligibility).toBe("not_receiver_eligible_unresolved");
    expect(lateral.reason).toContain("requires reviewed classification");
  });

  it("keeps no-pain, moderate coefficients, dose-created grip, and prose-sniffing invariants stable", () => {
    const noPainTrace = buildCandidatePainMatchTrace({
      exercise: baseExercise("no-pain-new-tag", [
        annotation({ tag: "upper_limb_support_loading", exposureScope: "intrinsic" }),
      ]),
      painAndInjury: NO_PAIN_OR_INJURY,
    });
    const suitcase = baseExercise("suitcase-carry", [
      annotation({ tag: "loaded_gait", exposureScope: "intrinsic" }),
      annotation({ tag: "grip_loading", exposureScope: "intrinsic" }),
      annotation({ tag: "grip_intensive", exposureScope: "dose_created" }),
      annotation({ tag: "heavy_axial_loading", exposureScope: "dose_created" }),
    ]);
    const suitcaseTrace = buildCandidatePainMatchTrace({
      exercise: suitcase,
      painAndInjury: painState(discomfort({
        stressTags: ["grip_loading", "grip_intensive", "heavy_axial_loading"],
      })),
    });
    const proseOnly = {
      ...baseExercise("loaded-gait-in-name-only"),
      name: "Loaded gait lateral trunk grip loading prose bait",
      summary: "loaded_gait loaded_march grip_loading lateral_trunk_loading",
    };

    expect(noPainTrace.uniqueMatchCount).toBe(0);
    expect(noPainTrace.responseRequirements).toEqual([]);
    expect(CANDIDATE_PAIN_SCORING_COEFFICIENTS.painSuitability.moderatePain).toBe(1.8);
    expect(CANDIDATE_PAIN_SCORING_COEFFICIENTS.jointCost.moderatePain).toBe(1.4);
    expect(buildExerciseStressProfile(suitcase).map((fact) => fact.tag)).toEqual([
      "grip_loading",
      "loaded_gait",
    ]);
    expect(suitcaseTrace.uniqueMatchCount).toBe(1);
    expect(suitcaseTrace.exerciseStressPotentialTraces
      .filter((trace) => trace.exposureScope === "dose_created")
      .map((trace) => trace.tag)
      .sort()).toEqual(["grip_intensive", "heavy_axial_loading"]);
    expect(buildCandidatePainMatchTrace({
      exercise: proseOnly,
      painAndInjury: painState(discomfort({ stressTags: ["loaded_gait"] })),
    }).uniqueMatchCount).toBe(0);
  });

  it("models wall march as loaded march without walking distance or loaded gait", () => {
    const wallMarch = baseExercise("wall-supported-suitcase-march", [
      annotation({ tag: "loaded_march", exposureScope: "intrinsic" }),
      annotation({ tag: "grip_loading", exposureScope: "intrinsic" }),
      annotation({ tag: "lateral_trunk_loading", exposureScope: "prescription_modifiable" }),
    ]);

    expect(buildExerciseStressProfile(wallMarch).map((fact) => fact.tag)).toEqual([
      "grip_loading",
      "loaded_march",
    ]);
    expect(buildExerciseStressProfile(wallMarch).map((fact) => fact.tag))
      .not.toContain("loaded_gait");
    expect(stepMarchPrescription().dose.mode).toBe("step_march");
    expect(buildPrescriptionStressExposureTrace({
      prescription: stepMarchPrescription(),
      stressTag: "loaded_march",
      exercisePotentialScope: "intrinsic",
      realizationStatus: "present_under_prescription",
      provenance: OWNER_PROVENANCE,
      reason: "Stationary march has no walking distance.",
    }).distance).toBeNull();
  });
});
