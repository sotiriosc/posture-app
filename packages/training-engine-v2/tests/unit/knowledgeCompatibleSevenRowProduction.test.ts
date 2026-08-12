import { describe, expect, it } from "vitest";
import {
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  buildCandidatePainMatchTrace,
  buildExerciseStressProfile,
  CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY,
  validateExerciseDefinition,
  type CurrentDiscomfort,
  type ExerciseDefinition,
} from "../../src";
import {
  SEVEN_PRODUCTION_EXERCISE_IDS,
  buildKnowledgeCompatibleSevenRowProductionData,
} from "../helpers/knowledgeCompatibleSevenRowProduction";

const data = buildKnowledgeCompatibleSevenRowProductionData();
const sevenIds = new Set<string>(SEVEN_PRODUCTION_EXERCISE_IDS);

function exercise(id: string): ExerciseDefinition {
  const found = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`Missing production exercise ${id}.`);
  return found;
}

function pain(stressTags: CurrentDiscomfort["stressTags"]) {
  return {
    ...NO_PAIN_OR_INJURY,
    currentDiscomforts: [{
      kind: "current_discomfort" as const,
      id: "seven-row-lumbar",
      region: "lumbar_spine" as const,
      severity0To10: 2 as const,
      stressTags,
      effect: "reduce_load" as const,
      description: "Exact structured-stress regression fixture.",
    }],
  };
}

function phaseAnnotations(rows: readonly ExerciseDefinition[]) {
  return rows.flatMap((candidate) => candidate.phaseSuitabilityAnnotations ?? []);
}

describe("knowledge-compatible seven-row production implementation", () => {
  it("adds exactly seven valid canonical rows with compact fallback coaching", () => {
    const rows = REFERENCE_EXERCISES.filter((candidate) => sevenIds.has(candidate.id));

    expect(REFERENCE_EXERCISES).toHaveLength(37);
    expect(rows.map((candidate) => candidate.id)).toEqual([...SEVEN_PRODUCTION_EXERCISE_IDS]);
    expect(new Set(REFERENCE_EXERCISES.map((candidate) => candidate.id)).size).toBe(37);
    for (const candidate of rows) {
      expect(validateExerciseDefinition(candidate).filter((finding) => finding.severity === "error"))
        .toEqual([]);
      expect(candidate.coachingFocus.length).toBeGreaterThanOrEqual(1);
      expect(candidate.coachingFocus.length).toBeLessThanOrEqual(2);
      expect(candidate.coachingFocus.every((cue) => cue.length <= 80)).toBe(true);
    }
  });

  it("keeps role, section, equipment, and one-event identity boundaries truthful", () => {
    expect(exercise("forearm-plank")).toEqual(expect.objectContaining({
      movementRoles: ["anti_extension_core"],
      trainingRoles: ["activation", "hypertrophy_accessory"],
    }));
    expect(Object.keys(exercise("forearm-plank").sectionSuitability)).toEqual(["activation", "accessory"]);
    expect(exercise("forearm-side-plank").movementRoles).toEqual(["anti_lateral_flexion_core"]);
    expect(exercise("machine-abdominal-crunch").movementRoles).toEqual(["trunk_flexion"]);
    expect(Object.keys(exercise("machine-abdominal-crunch").sectionSuitability)).toEqual(["accessory"]);
    expect(exercise("half-kneeling-high-to-low-cable-chop").movementRoles).toEqual(["trunk_rotation"]);
    expect(exercise("farmer-carry").movementRoles).toEqual(["carry", "loaded_bracing"]);
    expect(exercise("suitcase-carry").movementRoles).toEqual([
      "carry", "anti_lateral_flexion_core", "loaded_bracing",
    ]);
    expect(exercise("wall-supported-suitcase-march").movementRoles).toEqual(["loaded_bracing"]);
    expect(exercise("wall-supported-suitcase-march").trainingRoles).toEqual(["activation", "capacity"]);
    expect(Object.keys(exercise("wall-supported-suitcase-march").sectionSuitability))
      .toEqual(["activation", "accessory"]);
    expect(exercise("wall-supported-suitcase-march").progression.progressionAxes)
      .not.toContain("distance");
    expect(exercise("half-kneeling-high-to-low-cable-chop").movementRoles)
      .not.toContain("anti_rotation_core");
    expect(exercise("machine-abdominal-crunch").movementRoles)
      .not.toContain("anti_extension_core");
  });

  it("applies the exact contextual owner decisions and retains the activated scorer", () => {
    const current = REFERENCE_EXERCISES.filter((candidate) => !sevenIds.has(candidate.id));
    const currentAnnotations = phaseAnnotations(current);
    const sevenAnnotations = phaseAnnotations(REFERENCE_EXERCISES.filter((candidate) => sevenIds.has(candidate.id)));

    expect(currentAnnotations.filter((annotation) => annotation.reviewStatus === "accepted")).toHaveLength(11);
    expect(currentAnnotations.filter((annotation) => annotation.reviewStatus === "needs_review")).toHaveLength(1);
    expect(currentAnnotations.filter((annotation) => annotation.reviewStatus === "unknown")).toHaveLength(6);
    expect(sevenAnnotations.filter((annotation) => annotation.reviewStatus === "accepted")).toHaveLength(6);
    expect(sevenAnnotations.filter((annotation) => annotation.reviewStatus === "needs_review")).toHaveLength(7);
    expect(sevenAnnotations.filter((annotation) => annotation.reviewStatus === "unknown")).toHaveLength(7);

    for (const annotation of [...currentAnnotations, ...sevenAnnotations].filter(
      (candidate) => candidate.reviewStatus === "accepted",
    )) {
      expect(annotation.provenance).toEqual(expect.objectContaining({
        sourceType: "owner_decision",
        reviewerId: "sotiriosc",
        reviewedAt: "2026-08-12T00:00:00-04:00",
      }));
      expect(annotation.provenance.sourceRef).toContain("PHASE_AND_STRESS_OWNER_DECISIONS.md#");
    }

    expect(CONTEXTUAL_ANNOTATION_ONLY_LOW_CHURN_POLICY.activation)
      .toBe("PRODUCTION_AUTHORITY_REVISED_SEMANTIC_GATE_PASSED");
    expect(data.productionContextualPhaseActivated).toBe(true);
    expect(data.activationFailures).toEqual([]);
    expect(data.continuityComparisons.filter((row) => row.winnerChanged)).toEqual([]);
    expect(data.continuityComparisons.filter((row) => row.orderChanged).map((row) => row.id))
      .toEqual(["continuity:phase_3"]);
  });

  it("counts only accepted intrinsic stress and keeps potential exposure non-realized", () => {
    expect(buildExerciseStressProfile(exercise("forearm-plank")).map((fact) => fact.tag))
      .toEqual(["upper_limb_support_loading"]);
    expect(buildExerciseStressProfile(exercise("forearm-side-plank")).map((fact) => fact.tag))
      .toEqual(["lateral_trunk_loading", "upper_limb_support_loading"]);
    expect(buildExerciseStressProfile(exercise("machine-abdominal-crunch")).map((fact) => fact.tag))
      .toEqual(["loaded_spinal_flexion"]);
    expect(buildExerciseStressProfile(exercise("half-kneeling-high-to-low-cable-chop")).map((fact) => fact.tag))
      .toEqual(["loaded_trunk_rotation"]);
    expect(buildExerciseStressProfile(exercise("farmer-carry")).map((fact) => fact.tag))
      .toEqual(["grip_loading", "loaded_gait"]);
    expect(buildExerciseStressProfile(exercise("suitcase-carry")).map((fact) => fact.tag))
      .toEqual(["grip_loading", "lateral_trunk_loading", "loaded_gait"]);
    expect(buildExerciseStressProfile(exercise("wall-supported-suitcase-march")).map((fact) => fact.tag))
      .toEqual(["grip_loading", "loaded_march"]);

    const lumbarOnly = buildCandidatePainMatchTrace({
      exercise: exercise("machine-abdominal-crunch"),
      painAndInjury: pain([]),
    });
    const flexion = buildCandidatePainMatchTrace({
      exercise: exercise("machine-abdominal-crunch"),
      painAndInjury: pain(["loaded_spinal_flexion"]),
    });
    const potential = buildCandidatePainMatchTrace({
      exercise: exercise("forearm-plank"),
      painAndInjury: pain(["long_lever_core"]),
    });
    const heavyCarry = buildCandidatePainMatchTrace({
      exercise: exercise("farmer-carry"),
      painAndInjury: pain(["grip_intensive", "heavy_axial_loading"]),
    });

    expect(lumbarOnly.uniqueMatchCount).toBe(0);
    expect(flexion.uniqueMatchCount).toBe(1);
    expect(flexion.receiverDecisions.find((receiver) => receiver.receiver === "hard_contraindication"))
      .toEqual(expect.objectContaining({ executionStatus: "legal", criteria: [] }));
    expect(potential.uniqueMatchCount).toBe(0);
    expect(heavyCarry.uniqueMatchCount).toBe(0);
  });

  it("applies every approved current-row stress correction explicitly", () => {
    expect(buildExerciseStressProfile(exercise("one-arm-dumbbell-row")).map((fact) => fact.tag))
      .toEqual(["grip_intensive"]);
    expect(exercise("one-arm-dumbbell-row").stressAnnotations).toEqual([
      expect.objectContaining({ tag: "loaded_hinge", exposureScope: "variant_dependent", sideScope: "prescription_side", reviewStatus: "needs_review" }),
    ]);
    expect(buildExerciseStressProfile(exercise("dumbbell-romanian-deadlift")).map((fact) => fact.tag))
      .toEqual(["grip_intensive", "loaded_hinge"]);
    expect(buildExerciseStressProfile(exercise("cable-pull-through")).map((fact) => fact.tag))
      .toEqual(["loaded_hinge"]);
    expect(buildExerciseStressProfile(exercise("dumbbell-shoulder-press")).map((fact) => fact.tag))
      .toEqual(["overhead_pressing"]);
    expect(buildExerciseStressProfile(exercise("glute-bridge"))).toEqual([]);
    expect(buildExerciseStressProfile(exercise("dead-bug"))).toEqual([]);
    expect(buildExerciseStressProfile(exercise("push-up")).map((fact) => fact.tag))
      .toEqual(["horizontal_pressing", "wrist_extension_loading"]);
    expect(buildExerciseStressProfile(exercise("pallof-press"))).toEqual([]);
    expect(exercise("dumbbell-shoulder-press").stressAnnotations)
      .toEqual(expect.arrayContaining([expect.objectContaining({ tag: "heavy_axial_loading", exposureScope: "dose_created" })]));
  });

  it("freezes isolated migration and compatibility fingerprints", () => {
    expect(data.productionRankingBefore).toBe("d6a6452537e1436c3ecbbc035d9ea7a3126e772961012e4141b3302919f11782");
    expect(data.productionRankingAfter).toBe("f9e22a86a99361f6fa4cd36d663a8b448ec6f25a10301cc413ecdec31c9c206c");
    expect(data.comprehensiveBefore).toBe("216ec8c86ffc4bdf2310b6a88c03d10eca982f311df4f05fcf02485daa9c72b9");
    expect(data.comprehensiveAfter).toBe("3a52602bd3ebcaf116a3289ff329e54c2374539a92974aca2bec33dec0b0de1f");
    expect(data.phaseFingerprint).toBe("e50c8a96fae906665021deeab240efbe798c6dfcd0e20b0d35b55b4af2590155");
    expect(data.stressMigrationFingerprint).toBe("5de2302d5427dce372e9826a4b3c670fed01a101c16a72b0fb143bd383e15504");
    expect(data.longLeverMigrationFingerprint).toBe("9b8f06c32d71bafe7b1d3d78c1bd56c180faad0c7e1b6e6e6de6e3e150f70646");
    expect(data.sevenRowCatalogFingerprint).toBe("5f785e769222d08e073382d264831196799c7e7dc258ec3a8dccc9617c93597e");
    expect(data.supportStanceFingerprint).toBe("fce834f056dbb6383b3576d1f8c33419cfe19cde213784474b4f5f72fc9d3bfd");
    expect(data.roleCandidatePoolFingerprint).toBe("3107254d1a9a349a898a0f8f39ea4d823264b861161e75df08bde3e6dd372d6c");
    expect(data.knowledgeCompatibilityFingerprint).toBe("4ae9b04a475f5243b387932d1e24da70cdaa044260156a4c17b9a346106009cf");
    expect(data.knowledgePayload).toEqual(expect.objectContaining({
      canonicalCatalogCount: 37,
      canonicalCatalogCountOfSevenIds: 7,
      libraryImplemented: false,
      knowledgeLayerImplemented: false,
      secondCatalogCreated: false,
      coachingRailImplemented: false,
      uiImplemented: false,
      engineKnowledgeDependency: false,
      canonicalIdentitySeam: "ExerciseDefinition.id",
    }));
  });
});
