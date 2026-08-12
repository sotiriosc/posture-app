import { describe, expect, it } from "vitest";
import {
  BODYWEIGHT_EQUIPMENT,
  DUMBBELLS_NO_BENCH_EQUIPMENT,
  EMPTY_TRAINING_HISTORY,
  FULL_GYM_EQUIPMENT,
  LOOP_BANDS_ONLY_EQUIPMENT,
  REFERENCE_EXERCISES,
  evaluateHardEligibility,
  getReferenceExercise,
  hasEquipmentCapability,
  rankCandidateRequest,
  validateExerciseCatalog,
  type CandidateNeed,
  type CandidateRequest,
  type EquipmentCapabilities,
  type ExerciseDefinition,
  type TrainingResponseObservation,
} from "../../src";
import {
  CANDIDATE_GRADUATION_CLASSIFICATION,
  P0_PRODUCTION_CLASSIFICATION,
  P0_PRODUCTION_IDS,
  buildP0WholeBodyProductionData,
  candidateOutcome,
  p0Request,
} from "../helpers/p0WholeBodyProduction";

function need(input: Partial<CandidateNeed> & Pick<CandidateNeed, "id" | "requestedRole">): CandidateNeed {
  return {
    whyNeeded: "Owner-reviewed P0 fixed-shell need.",
    requestedSection: "accessory",
    targetMovementRoles: [],
    targetActionFunctions: [],
    targetMuscles: [],
    muscleRequirement: "primary_preferred",
    targetBodyRegions: [],
    goal: "general_fitness",
    ...input,
  };
}

function ids(request: CandidateRequest): readonly string[] {
  return rankCandidateRequest(request).rankedCandidates.map((entry) => entry.exercise.id);
}

function p0Ids(request: CandidateRequest): readonly string[] {
  return ids(request).filter((id) => P0_PRODUCTION_IDS.includes(id as typeof P0_PRODUCTION_IDS[number]));
}

function exercise(id: typeof P0_PRODUCTION_IDS[number]): ExerciseDefinition {
  const row = getReferenceExercise(id);
  if (!row) throw new Error(`Missing ${id}`);
  return row;
}

function response(
  exerciseId: string,
  tolerance: "tolerated" | "not_tolerated",
  occurredAt: string,
): TrainingResponseObservation {
  return {
    observationId: `${tolerance}-${occurredAt}`,
    occurredAt,
    exposure: {
      realizationStatus: "partial_historical_report",
      exerciseId,
      realizedStressExposureIds: [],
    },
    tolerance,
    symptomChange: tolerance === "tolerated" ? "improved" : "worsened",
    onset: "during_exposure",
    persistence: "resolved_before_next_relevant_exposure",
    consequence: tolerance === "tolerated" ? "completed" : "stopped_exercise",
    reportedLocations: [],
    provenance: {
      source: "athlete_report",
      sourceRef: `p0:${exerciseId}:${occurredAt}`,
      evidenceBasis: ["Structured P0 response regression."],
      reportedBy: "p0-fixed-shell-athlete",
      recordedAt: occurredAt,
    },
    notes: [],
  };
}

const DIRECT_CASES = [
  ["standing-calf-raise", need({ id: "direct-calf", requestedRole: "hypertrophy_accessory", targetMovementRoles: ["accessory"], targetActionFunctions: ["ankle_plantar_flexion"], targetMuscles: ["calves"], muscleRequirement: "primary_required" }), BODYWEIGHT_EQUIPMENT],
  ["side-lying-hip-adduction", need({ id: "direct-adduction", requestedRole: "hypertrophy_accessory", targetMovementRoles: ["accessory"], targetActionFunctions: ["hip_adduction"], targetMuscles: ["hip_adductors"], muscleRequirement: "primary_required" }), BODYWEIGHT_EQUIPMENT],
  ["loop-band-lateral-walk", need({ id: "direct-abduction", requestedRole: "hypertrophy_accessory", targetMovementRoles: ["accessory"], targetActionFunctions: ["hip_abduction"], targetMuscles: ["hip_abductors"], muscleRequirement: "primary_required" }), LOOP_BANDS_ONLY_EQUIPMENT],
  ["side-lying-dumbbell-external-rotation", need({ id: "direct-cuff", requestedRole: "hypertrophy_accessory", targetMovementRoles: ["accessory"], targetActionFunctions: ["shoulder_external_rotation"], targetMuscles: ["rotator_cuff"], muscleRequirement: "primary_required" }), DUMBBELLS_NO_BENCH_EQUIPMENT],
  ["supine-hamstring-walkout", need({ id: "home-knee-flexion", requestedRole: "hypertrophy_accessory", targetMovementRoles: ["accessory"], targetActionFunctions: ["knee_flexion"], targetMuscles: ["hamstrings"], muscleRequirement: "primary_required" }), BODYWEIGHT_EQUIPMENT],
  ["wall-ankle-dorsiflexion-rock", need({ id: "ankle-preparation", requestedRole: "preparation", requestedSection: "warmup", targetMovementRoles: ["mobility"], targetActionFunctions: ["ankle_dorsiflexion"], targetBodyRegions: ["ankle"] }), BODYWEIGHT_EQUIPMENT],
  ["bodyweight-hip-hinge-rehearsal", need({ id: "hinge-preparation", requestedRole: "preparation", requestedSection: "warmup", targetMovementRoles: ["hinge"], targetActionFunctions: ["hip_extension"] }), BODYWEIGHT_EQUIPMENT],
  ["single-leg-balance-rehearsal", need({ id: "single-leg-preparation", requestedRole: "preparation", requestedSection: "warmup", targetMovementRoles: ["single_leg"], targetActionFunctions: ["single_leg_stance_control"] }), BODYWEIGHT_EQUIPMENT],
] as const;

describe("P0 whole-body production admission", () => {
  it("admits exactly eight unique rows into one valid 45-row catalog", () => {
    const data = buildP0WholeBodyProductionData();
    expect(data.classification).toBe(P0_PRODUCTION_CLASSIFICATION);
    expect(data.catalogBefore).toBe(37);
    expect(data.catalogAfter).toBe(45);
    expect(data.uniqueCatalogAfter).toBe(45);
    expect(REFERENCE_EXERCISES.filter((row) => P0_PRODUCTION_IDS.includes(row.id as typeof P0_PRODUCTION_IDS[number])).map((row) => row.id)).toEqual(P0_PRODUCTION_IDS);
    expect(getReferenceExercise("supported-single-leg-balance-rehearsal")).toBeUndefined();
    expect(validateExerciseCatalog(REFERENCE_EXERCISES).filter((finding) => finding.severity === "error")).toEqual([]);
  });

  it("implements exact role, action, training-role, section, and family contracts", () => {
    const expected = {
      "standing-calf-raise": ["calf_accessory", ["accessory"], ["ankle_plantar_flexion"], ["hypertrophy_accessory"], ["accessory"]],
      "side-lying-hip-adduction": ["hip_accessory", ["accessory"], ["hip_adduction"], ["activation", "hypertrophy_accessory"], ["activation", "accessory"]],
      "loop-band-lateral-walk": ["hip_accessory", ["accessory"], ["hip_abduction"], ["activation", "hypertrophy_accessory"], ["activation", "accessory"]],
      "side-lying-dumbbell-external-rotation": ["cuff_control", ["accessory"], ["shoulder_external_rotation"], ["activation", "hypertrophy_accessory"], ["activation", "accessory"]],
      "supine-hamstring-walkout": ["glute_hamstring", ["accessory"], ["knee_flexion", "hip_extension"], ["activation", "hypertrophy_accessory"], ["activation", "accessory"]],
      "wall-ankle-dorsiflexion-rock": ["mobility_preparation", ["mobility"], ["ankle_dorsiflexion"], ["preparation"], ["warmup"]],
      "bodyweight-hip-hinge-rehearsal": ["hinge_pattern", ["hinge"], ["hip_extension"], ["preparation", "activation"], ["warmup", "activation"]],
      "single-leg-balance-rehearsal": ["single_leg_pattern", ["single_leg"], ["single_leg_stance_control"], ["preparation", "activation"], ["warmup", "activation"]],
    } as const;
    for (const id of P0_PRODUCTION_IDS) {
      const row = exercise(id);
      expect([row.family, row.movementRoles, row.actionFunctions.map((entry) => entry.action), row.trainingRoles, Object.keys(row.sectionSuitability)]).toEqual(expected[id]);
      expect(row.phaseSuitabilityAnnotations).toEqual([]);
      expect(row.coachingFocus.length).toBeLessThanOrEqual(2);
    }
  });

  it("uses exact canonical contribution relationships and derived projections", () => {
    const expected = {
      "standing-calf-raise": [["calves", "primary_target"], ["trunk", "stabilizer_or_contextual_contributor"]],
      "side-lying-hip-adduction": [["hip_adductors", "primary_target"], ["trunk", "stabilizer_or_contextual_contributor"]],
      "loop-band-lateral-walk": [["hip_abductors", "primary_target"], ["glutes", "key_secondary_target"], ["quads", "incidental_contributor"], ["trunk", "stabilizer_or_contextual_contributor"]],
      "side-lying-dumbbell-external-rotation": [["rotator_cuff", "primary_target"], ["rear_delts", "incidental_contributor"]],
      "supine-hamstring-walkout": [["hamstrings", "primary_target"], ["glutes", "key_secondary_target"], ["trunk", "stabilizer_or_contextual_contributor"]],
      "wall-ankle-dorsiflexion-rock": [["calves", "stabilizer_or_contextual_contributor"]],
      "bodyweight-hip-hinge-rehearsal": [["glutes", "key_secondary_target"], ["hamstrings", "key_secondary_target"], ["trunk", "stabilizer_or_contextual_contributor"]],
      "single-leg-balance-rehearsal": [["hip_abductors", "key_secondary_target"], ["calves", "incidental_contributor"], ["trunk", "stabilizer_or_contextual_contributor"]],
    } as const;
    for (const id of P0_PRODUCTION_IDS) {
      const row = exercise(id);
      expect(row.muscleContributions.map((entry) => [entry.muscle, entry.relationship])).toEqual(expected[id]);
      expect(row.primaryMuscles).toEqual(row.muscleContributions.filter((entry) => entry.relationship === "primary_target").map((entry) => entry.muscle));
      expect(row.secondaryMuscles).toEqual(row.muscleContributions.filter((entry) => entry.relationship === "key_secondary_target").map((entry) => entry.muscle));
    }
  });

  it("derives stable support only from explicit support surfaces and preserves equipment boundaries", () => {
    const noExplicitSupport: EquipmentCapabilities = {
      ...FULL_GYM_EQUIPMENT,
      bodyweight: { ...FULL_GYM_EQUIPMENT.bodyweight, wallAvailable: false },
      supportSurfaces: [],
    };
    expect(hasEquipmentCapability(noExplicitSupport, "stable_support_surface")).toBe(false);
    expect(hasEquipmentCapability({ ...noExplicitSupport, supportSurfaces: ["chair"] }, "stable_support_surface")).toBe(true);
    expect(evaluateHardEligibility(exercise("loop-band-lateral-walk"), { equipment: LOOP_BANDS_ONLY_EQUIPMENT, painAndInjury: p0Request(DIRECT_CASES[2][1], LOOP_BANDS_ONLY_EQUIPMENT).painAndInjury, assessment: { signals: [], historicalWeaknesses: [] }, satisfiedPrerequisiteIds: [] }).legal).toBe(true);
    expect(evaluateHardEligibility(exercise("loop-band-lateral-walk"), { equipment: BODYWEIGHT_EQUIPMENT, painAndInjury: p0Request(DIRECT_CASES[2][1], BODYWEIGHT_EQUIPMENT).painAndInjury, assessment: { signals: [], historicalWeaknesses: [] }, satisfiedPrerequisiteIds: [] }).legal).toBe(false);
    expect(evaluateHardEligibility(exercise("side-lying-dumbbell-external-rotation"), { equipment: DUMBBELLS_NO_BENCH_EQUIPMENT, painAndInjury: p0Request(DIRECT_CASES[3][1], DUMBBELLS_NO_BENCH_EQUIPMENT).painAndInjury, assessment: { signals: [], historicalWeaknesses: [] }, satisfiedPrerequisiteIds: [] }).legal).toBe(true);
  });

  it("proves each P0 identity is relevant only to its truthful fixed-shell need", () => {
    for (const [expectedId, directNeed, equipment] of DIRECT_CASES) {
      expect(p0Ids(p0Request(directNeed, equipment))).toContain(expectedId);
    }
    const unrelated = p0Request(need({ id: "unrelated-squat", requestedRole: "primary_strength", requestedSection: "main", targetMovementRoles: ["squat"], targetMuscles: ["quads"], muscleRequirement: "primary_required", goal: "strength" }), FULL_GYM_EQUIPMENT);
    expect(p0Ids(unrelated)).toEqual([]);
    expect(ids(p0Request(DIRECT_CASES[1][1], BODYWEIGHT_EQUIPMENT))).not.toContain("split-squat");
    expect(ids(p0Request(DIRECT_CASES[3][1], FULL_GYM_EQUIPMENT))).not.toContain("band-face-pull");
  });

  it("keeps preparation rows out of loaded strength and unrelated accessory pools", () => {
    const loadedHinge = p0Request(need({ id: "loaded-hinge", requestedRole: "primary_strength", requestedSection: "main", targetMovementRoles: ["hinge"], targetMuscles: ["hamstrings"], muscleRequirement: "primary_required", goal: "strength" }), FULL_GYM_EQUIPMENT);
    expect(ids(loadedHinge)).not.toContain("bodyweight-hip-hinge-rehearsal");
    const loadedSingleLeg = p0Request(need({ id: "loaded-single-leg", requestedRole: "secondary_strength", requestedSection: "accessory", targetMovementRoles: ["single_leg"], targetMuscles: ["quads"], muscleRequirement: "primary_required", goal: "strength" }), FULL_GYM_EQUIPMENT);
    expect(ids(loadedSingleLeg)).not.toContain("single-leg-balance-rehearsal");
  });

  it("proves anti-bloat: no direct need activates unrelated P0 rows", () => {
    for (const [expectedId, directNeed, equipment] of DIRECT_CASES) {
      expect(p0Ids(p0Request(directNeed, equipment))).toEqual([expectedId]);
    }
  });

  it("preserves pain, safety, response, block, and prose boundaries", () => {
    const base = p0Request(DIRECT_CASES[0][1], BODYWEIGHT_EQUIPMENT);
    const regionOnly: CandidateRequest = { ...base, painAndInjury: { ...base.painAndInjury, currentDiscomforts: [{ kind: "current_discomfort", id: "ankle-region-only", region: "ankle", severity0To10: 1, stressTags: [], effect: "monitor", description: "Region alone." }] } };
    expect(candidateOutcome(regionOnly)).toEqual(candidateOutcome(base));

    const blocked = { ...base, painAndInjury: { ...base.painAndInjury, personalExerciseBlocks: [{ kind: "personal_exercise_block" as const, id: "block-calf", exerciseIds: ["standing-calf-raise"], reason: "Explicit athlete block.", createdBy: "athlete" as const }] } };
    expect(ids(blocked)).not.toContain("standing-calf-raise");

    const safety = { ...base, trainingSafety: { signals: [{ signalId: "review-first", requestedReviewLevel: "review_required_before_ordinary_training" as const, authority: { source: "athlete_report" as const, sourceRef: "p0-safety", evidenceBasis: ["Review required."], reportedBy: "athlete", reportedAt: "2026-08-12T09:00:00-04:00" }, resolution: { state: "unresolved" as const }, notes: [] }] } };
    expect(candidateOutcome(safety).scores).toEqual(candidateOutcome(base).scores);
    expect(candidateOutcome(safety).readiness).not.toBe(candidateOutcome(base).readiness);

    const adverse = response("standing-calf-raise", "not_tolerated", "2026-08-11T10:00:00-04:00");
    const tolerated = response("standing-calf-raise", "tolerated", "2026-08-12T10:00:00-04:00");
    const withResponses = { ...base, history: { ...EMPTY_TRAINING_HISTORY, trainingResponseHistory: { observations: [adverse, tolerated] } } };
    expect(ids(withResponses)).toContain("standing-calf-raise");
    expect(candidateOutcome(withResponses).scores).not.toEqual(candidateOutcome(base).scores);

    const prose = { ...base, notes: ["Do something completely different."], athlete: { ...base.athlete, label: "Changed prose", preferences: { ...base.athlete.preferences, notes: ["Rotate everything."] } } };
    expect(candidateOutcome(prose)).toEqual(candidateOutcome(base));
  });

  it("keeps action metadata separate from stress and phase votes", () => {
    for (const id of P0_PRODUCTION_IDS) {
      const row = exercise(id);
      expect(row.phaseSuitabilityAnnotations).toEqual([]);
      expect(row.cautionStressTags).toEqual([]);
      expect(row.contraindicatedStressTags).toEqual([]);
      expect((row.stressAnnotations ?? []).every((entry) => entry.source === "joint_stress")).toBe(true);
    }
    expect(exercise("standing-calf-raise").stressAnnotations).toEqual([expect.objectContaining({ tag: "grip_loading", exposureScope: "dose_created" })]);
    for (const id of P0_PRODUCTION_IDS.filter((candidate) => candidate !== "standing-calf-raise")) {
      expect(exercise(id).stressAnnotations ?? []).toEqual([]);
    }
  });

  it("graduates Candidate Intelligence while preserving explicit thin-pool truth", () => {
    const data = buildP0WholeBodyProductionData();
    expect(data.graduation).toBe(CANDIDATE_GRADUATION_CLASSIFICATION);
    expect(Object.values(data.fingerprints).every((value) => typeof value === "string" && value.length === 64)).toBe(true);
  });
});
