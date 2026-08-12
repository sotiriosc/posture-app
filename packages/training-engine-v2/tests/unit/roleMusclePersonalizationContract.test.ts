import { describe, expect, it } from "vitest";
import {
  CONTROLLED_CANDIDATE_SCENARIOS,
  DUMBBELLS_AND_BENCH_EQUIPMENT,
  REFERENCE_EXERCISES,
  candidateGoalConflict,
  deriveAlignmentPriorities,
  getReferenceExercise,
  rankCandidateRequest,
  validateExerciseCatalog,
  validateCandidateRequestOwnership,
  type CandidateRequest,
} from "../../src";
import { buildRoleMusclePersonalizationReviewData } from "../helpers/roleMusclePersonalizationReview";

function scenario(id: string): CandidateRequest {
  const found = CONTROLLED_CANDIDATE_SCENARIOS.find((entry) => entry.id === id);
  if (!found) throw new Error(`Missing scenario ${id}`);
  return found.request;
}

function componentValue(request: CandidateRequest, exerciseId: string, componentId: string): number {
  const result = rankCandidateRequest(request);
  const candidate = result.rankedCandidates.find((entry) => entry.exercise.id === exerciseId);
  const component = candidate?.components.find((entry) => entry.id === componentId);
  if (!component) throw new Error(`Missing ${exerciseId}/${componentId}`);
  return component.rawValue;
}

function outcome(request: CandidateRequest) {
  const result = rankCandidateRequest(request);
  return {
    legal: result.rankedCandidates.map((entry) => entry.exercise.id),
    scores: result.rankedCandidates.map((entry) => [entry.exercise.id, entry.total]),
    readiness: result.trainingReadiness.status,
  };
}

function response(exerciseId: string, kind: "tolerated" | "adverse") {
  return {
    observationId: `${kind}-${exerciseId}`,
    occurredAt: "2026-08-11T10:00:00-04:00",
    exposure: {
      realizationStatus: "partial_historical_report" as const,
      exerciseId,
      realizedStressExposureIds: [],
    },
    tolerance: kind === "tolerated" ? "tolerated" as const : "not_tolerated" as const,
    symptomChange: kind === "tolerated" ? "unchanged" as const : "worsened" as const,
    onset: "during_exposure" as const,
    persistence: "resolved_before_next_relevant_exposure" as const,
    consequence: kind === "tolerated" ? "completed" as const : "stopped_exercise" as const,
    reportedLocations: [],
    provenance: {
      source: "athlete_report" as const,
      sourceRef: `${kind}:${exerciseId}`,
      evidenceBasis: [`Structured ${kind} counterfactual.`],
      reportedBy: "counterfactual-athlete",
      recordedAt: "2026-08-11T10:05:00-04:00",
    },
    notes: [],
  };
}

describe("role, muscle, and actual-user personalization contract", () => {
  it("freezes isolated migration fingerprints and unchanged owners", () => {
    const data = buildRoleMusclePersonalizationReviewData();
    expect(data.productionCount).toBe(37);
    expect(data.uniqueProductionCount).toBe(37);
    expect(data.p0ProposalIds).toHaveLength(8);
    expect(Object.entries(data.invariants).filter(([key]) => key.endsWith("Pre")).every(([key, value]) => value === data.invariants[key.replace(/Pre$/, "Post") as keyof typeof data.invariants])).toBe(true);
    expect(data.fingerprints.safetyResponse).toBe("539dba50cc8d0dda4dcaa28cfc9cc764d15049aba8bddace707bff5b98d2c562");
  });
  it("migrates all 37 rows to one valid canonical muscle source", () => {
    expect(REFERENCE_EXERCISES).toHaveLength(37);
    expect(validateExerciseCatalog(REFERENCE_EXERCISES).filter((finding) => finding.severity === "error")).toEqual([]);
    for (const exercise of REFERENCE_EXERCISES) {
      expect(exercise.primaryMuscles).toEqual(
        exercise.muscleContributions.filter((entry) => entry.relationship === "primary_target").map((entry) => entry.muscle),
      );
      expect(exercise.secondaryMuscles).toEqual(
        exercise.muscleContributions.filter((entry) => entry.relationship === "key_secondary_target").map((entry) => entry.muscle),
      );
    }
  });

  it("applies the nine reviewed role/action corrections", () => {
    const expected = [
      ["dumbbell-curl", "horizontal_pull", "elbow_flexion"],
      ["cable-triceps-pressdown", "horizontal_push", "elbow_extension"],
      ["dumbbell-lateral-raise", "vertical_push", "shoulder_abduction"],
      ["lying-leg-curl", "hinge", "knee_flexion"],
      ["cable-chest-fly", "horizontal_push", "shoulder_horizontal_adduction"],
      ["reverse-pec-deck", "horizontal_pull", "shoulder_horizontal_abduction"],
      ["band-face-pull", "horizontal_pull", "shoulder_external_rotation"],
      ["glute-bridge", "hinge", "hip_extension"],
      ["serratus-wall-slide", "vertical_push", "scapular_upward_rotation"],
    ] as const;
    for (const [id, removedRole, action] of expected) {
      const exercise = getReferenceExercise(id)!;
      expect(exercise.movementRoles).not.toContain(removedRole);
      expect(exercise.actionFunctions.map((entry) => entry.action)).toContain(action);
    }
    expect(getReferenceExercise("reverse-pec-deck")?.actionFunctions.map((entry) => entry.action)).toContain("scapular_retraction");
    expect(getReferenceExercise("band-face-pull")?.actionFunctions.map((entry) => entry.action)).toContain("scapular_retraction");
  });

  it("distinguishes knee dominance from an actual squat pattern", () => {
    expect(getReferenceExercise("leg-press")?.movementRoles).toEqual(["knee_dominant"]);
    expect(getReferenceExercise("goblet-squat")?.movementRoles).toEqual(["squat", "knee_dominant"]);
    expect(getReferenceExercise("bodyweight-box-squat")?.movementRoles).toEqual(["squat", "knee_dominant"]);
    expect(getReferenceExercise("split-squat")?.movementRoles).toEqual(["single_leg", "knee_dominant"]);
    expect(getReferenceExercise("step-up")?.movementRoles).toEqual(["single_leg", "knee_dominant"]);
  });

  it("enforces action and muscle relationship requirements", () => {
    const base = scenario("horizontal-pull-gym-neutral");
    const accessory = {
      ...base,
      candidatePool: REFERENCE_EXERCISES,
      need: {
        ...base.need,
        requestedRole: "hypertrophy_accessory" as const,
        requestedSection: "accessory" as const,
        targetMovementRoles: ["accessory"] as const,
        targetActionFunctions: ["elbow_flexion"] as const,
        targetMuscles: ["biceps"] as const,
        muscleRequirement: "primary_required" as const,
      },
    };
    expect(rankCandidateRequest(accessory).rankedCandidates.map((entry) => entry.exercise.id)).toEqual(["dumbbell-curl"]);

    const bench = getReferenceExercise("dumbbell-bench-press")!;
    const frontDeltNeed = {
      ...base,
      candidatePool: [bench],
      need: { ...base.need, targetMovementRoles: ["horizontal_push"] as const, targetMuscles: ["front_delts"] as const },
    };
    expect(rankCandidateRequest({ ...frontDeltNeed, need: { ...frontDeltNeed.need, muscleRequirement: "primary_preferred" } }).legalCandidateCount).toBe(1);
    expect(rankCandidateRequest({ ...frontDeltNeed, need: { ...frontDeltNeed.need, muscleRequirement: "primary_required" } }).legalCandidateCount).toBe(0);

    const pushUp = getReferenceExercise("push-up")!;
    expect(rankCandidateRequest({
      ...base,
      candidatePool: [pushUp],
      need: {
        ...base.need,
        requestedRole: "secondary_strength",
        targetMovementRoles: ["horizontal_push"],
        targetMuscles: ["trunk"],
        muscleRequirement: "any_meaningful_contributor",
      },
    }).legalCandidateCount).toBe(0);
  });

  it("gives structured preferences a bounded causal consequence while identity and availability stay inert", () => {
    const base = scenario("horizontal-pull-gym-neutral");
    const preferred = {
      ...base,
      athlete: {
        ...base.athlete,
        preferences: { ...base.athlete.preferences, preferredExerciseIds: ["one-arm-dumbbell-row"] },
      },
    };
    expect(componentValue(preferred, "one-arm-dumbbell-row", "continuity_value") - componentValue(base, "one-arm-dumbbell-row", "continuity_value")).toBeCloseTo(0.8);

    const inert = {
      ...base,
      athlete: {
        ...base.athlete,
        id: "different-id",
        label: "Different prose label",
        availability: { ...base.athlete.availability, daysPerWeek: 1, minutesPerSession: 15 },
        preferences: { ...base.athlete.preferences, notes: ["free text must not be inferred"] },
      },
    };
    expect(rankCandidateRequest(inert).rankedCandidates.map((entry) => [entry.exercise.id, entry.total])).toEqual(
      rankCandidateRequest(base).rankedCandidates.map((entry) => [entry.exercise.id, entry.total]),
    );
  });

  it("executes the fixed-shell one-variable counterfactual matrix", () => {
    const base = scenario("horizontal-pull-gym-neutral");
    const baseOutcome = outcome(base);
    const assertChanged = (variant: CandidateRequest, field: keyof ReturnType<typeof outcome>) => {
      expect(outcome(variant)[field], field).not.toEqual(baseOutcome[field]);
    };
    const assertConverged = (variant: CandidateRequest) => {
      expect(outcome(variant)).toEqual(baseOutcome);
    };

    assertChanged({ ...base, goal: "hypertrophy" }, "scores");
    expect(candidateGoalConflict({ ...base, goal: "hypertrophy" })).toContain("overrides");
    expect(validateCandidateRequestOwnership({ ...base, goal: "hypertrophy" })).toEqual([
      expect.objectContaining({ code: "legacy_need_goal_conflict", severity: "warning" }),
    ]);
    assertChanged({
      ...base,
      painAndInjury: {
        ...base.painAndInjury,
        hardContraindications: [{ kind: "hard_contraindication", id: "row-block", exerciseIds: ["machine-row"], reason: "Counterfactual", source: "athlete_report" }],
      },
    }, "legal");
    assertConverged({
      ...base,
      painAndInjury: {
        ...base.painAndInjury,
        currentDiscomforts: [{ kind: "current_discomfort", id: "irrelevant-neck", region: "neck", severity0To10: 1, stressTags: ["high_impact"], effect: "monitor", description: "Irrelevant to this fixed shell." }],
      },
    });

    const assessmentSignal = {
      id: "pull-control",
      type: "control_finding" as const,
      source: "movement_screen" as const,
      confidence: "high" as const,
      priority: "primary" as const,
      movementRole: "horizontal_pull" as const,
      muscleGroup: "mid_back" as const,
      description: "Fixed-shell assessment priority.",
    };
    const assessed = { signals: [assessmentSignal], historicalWeaknesses: [] };
    assertChanged({ ...base, assessment: assessed, alignmentPriorities: deriveAlignmentPriorities(assessed).priorities }, "scores");
    const lowConfidence = { signals: [{ ...assessmentSignal, confidence: "low" as const }], historicalWeaknesses: [] };
    expect(outcome({ ...base, assessment: lowConfidence, alignmentPriorities: deriveAlignmentPriorities(lowConfidence).priorities }).scores)
      .not.toEqual(outcome({ ...base, assessment: assessed, alignmentPriorities: deriveAlignmentPriorities(assessed).priorities }).scores);

    assertChanged({
      ...base,
      trainingSafety: { signals: [{
        signalId: "review-first",
        requestedReviewLevel: "review_required_before_ordinary_training",
        authority: { source: "athlete_report", sourceRef: "counterfactual", evidenceBasis: ["Review required."], reportedBy: "athlete", reportedAt: "2026-08-11T09:00:00-04:00" },
        resolution: { state: "unresolved" },
        notes: [],
      }] },
    }, "readiness");
    assertChanged({ ...base, continuity: { ...base.continuity, productiveExerciseIds: ["one-arm-dumbbell-row"] } }, "scores");
    assertChanged({ ...base, continuity: { ...base.continuity, plateauedExerciseIds: ["one-arm-dumbbell-row"] } }, "scores");
    assertChanged({ ...base, history: { ...base.history, trainingResponseHistory: { observations: [response("one-arm-dumbbell-row", "tolerated")] } } }, "scores");
    assertChanged({ ...base, history: { ...base.history, trainingResponseHistory: { observations: [response("one-arm-dumbbell-row", "adverse")] } } }, "scores");
    assertChanged({
      ...base,
      painAndInjury: { ...base.painAndInjury, personalExerciseBlocks: [{ kind: "personal_exercise_block", id: "personal-block", exerciseIds: ["machine-row"], reason: "Athlete block.", createdBy: "athlete" }] },
    }, "legal");

    assertConverged({ ...base, athlete: { ...base.athlete, id: "changed-id" } });
    assertConverged({ ...base, athlete: { ...base.athlete, label: "Changed label" }, notes: ["Changed prose"] });
    assertConverged({ ...base, athlete: { ...base.athlete, availability: { daysPerWeek: 1, minutesPerSession: 20, preferredTrainingDays: ["Sunday"] } } });
    assertConverged({ ...base, athlete: { ...base.athlete, preferences: { ...base.athlete.preferences, varietyPreference: "high" } } });
    assertChanged({ ...base, equipment: DUMBBELLS_AND_BENCH_EQUIPMENT }, "legal");
  });
});
