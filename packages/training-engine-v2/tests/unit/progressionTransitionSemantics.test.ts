import { describe, expect, it } from "vitest";
import {
  EMPTY_TRAINING_HISTORY,
  REFERENCE_EXERCISES,
  buildExerciseTransitionTraces,
  getControlledCandidateScenario,
  runCandidateRankingLab,
  type CandidateRankingResult,
  type CandidateRequest,
  type ExerciseDefinition,
  type RankedCandidate,
} from "../../src";

function scenario(id: string) {
  const found = getControlledCandidateScenario(id);
  if (!found) {
    throw new Error(`Missing candidate scenario ${id}`);
  }

  return found;
}

function exercise(id: string): ExerciseDefinition {
  const found = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing reference exercise ${id}`);
  }

  return found;
}

function ranked(result: CandidateRankingResult, exerciseId: string): RankedCandidate {
  const found = result.rankedCandidates.find((candidate) => candidate.exercise.id === exerciseId);
  if (!found) {
    throw new Error(`Missing ranked exercise ${exerciseId}`);
  }

  return found;
}

function componentValue(candidate: RankedCandidate, componentId: string): number {
  const found = candidate.components.find((component) => component.id === componentId);
  if (!found) {
    throw new Error(`Missing ${componentId} for ${candidate.exercise.id}`);
  }

  return found.value;
}

function withCandidatePool(
  request: CandidateRequest,
  candidatePool: readonly ExerciseDefinition[],
): CandidateRequest {
  return {
    ...request,
    candidatePool,
  };
}

function syntheticExercise(
  base: ExerciseDefinition,
  input: {
    readonly id: string;
    readonly progressionAxes?: ExerciseDefinition["progression"]["progressionAxes"];
    readonly transitionRelationships?: ExerciseDefinition["progression"]["transitionRelationships"];
  },
): ExerciseDefinition {
  return {
    ...base,
    id: input.id,
    progression: {
      progressionAxes: input.progressionAxes ?? base.progression.progressionAxes,
      transitionRelationships:
        input.transitionRelationships ?? base.progression.transitionRelationships,
    },
  };
}

function rowRequest(): CandidateRequest {
  return scenario("horizontal-pull-gym-neutral").request;
}

describe("progression versus exercise transition semantics", () => {
  it("migrates every reference transition into resolvable structured knowledge", () => {
    const catalogIds = new Set(REFERENCE_EXERCISES.map((candidate) => candidate.id));
    const classificationCounts = new Map<string, number>();
    const unresolvedTargets: string[] = [];

    for (const candidate of REFERENCE_EXERCISES) {
      for (const relationship of candidate.progression.transitionRelationships) {
        classificationCounts.set(
          relationship.classification,
          (classificationCounts.get(relationship.classification) ?? 0) + 1,
        );

        if (!catalogIds.has(relationship.targetExerciseId)) {
          unresolvedTargets.push(`${candidate.id}->${relationship.targetExerciseId}`);
        }
      }
    }

    expect(unresolvedTargets).toEqual([]);
    expect(Object.fromEntries([...classificationCounts].sort())).toEqual({
      context_dependent: 20,
      developmental: 12,
      needs_review: 2,
      questionable: 2,
    });
  });

  it("scores same-exercise progression axes independently from transition edges", () => {
    const base = exercise("machine-row");
    const noAxesWithTransitions = syntheticExercise(base, {
      id: "transition-only-row",
      progressionAxes: [],
      transitionRelationships: base.progression.transitionRelationships,
    });
    const noAxesNoTransitions = syntheticExercise(base, {
      id: "no-progression-row",
      progressionAxes: [],
      transitionRelationships: [],
    });
    const sameExerciseAxes = syntheticExercise(base, {
      id: "same-exercise-axis-row",
      progressionAxes: ["load"],
      transitionRelationships: [],
    });
    const result = runCandidateRankingLab(
      withCandidatePool(rowRequest(), [noAxesWithTransitions, noAxesNoTransitions, sameExerciseAxes]),
    );

    expect(componentValue(ranked(result, "transition-only-row"), "progression_value")).toBe(
      componentValue(ranked(result, "no-progression-row"), "progression_value"),
    );
    expect(componentValue(ranked(result, "same-exercise-axis-row"), "progression_value")).toBeGreaterThan(
      componentValue(ranked(result, "transition-only-row"), "progression_value"),
    );
  });

  it("does not let adding or removing a transition edge change candidate totals directly", () => {
    const base = exercise("machine-row");
    const withTransitions = syntheticExercise(base, {
      id: "row-with-transition-knowledge",
      transitionRelationships: base.progression.transitionRelationships,
    });
    const withoutTransitions = syntheticExercise(base, {
      id: "row-without-transition-knowledge",
      transitionRelationships: [],
    });
    const result = runCandidateRankingLab(
      withCandidatePool(rowRequest(), [withTransitions, withoutTransitions]),
    );

    expect(componentValue(ranked(result, withTransitions.id), "progression_value")).toBe(
      componentValue(ranked(result, withoutTransitions.id), "progression_value"),
    );
    expect(ranked(result, withTransitions.id).total).toBe(ranked(result, withoutTransitions.id).total);
  });

  it("treats ready-to-progress as same-exercise progression readiness, not replacement pressure", () => {
    const request: CandidateRequest = {
      ...rowRequest(),
      id: "ready-to-progress-is-not-replace",
      continuity: {
        ...rowRequest().continuity,
        currentExerciseId: "chest-supported-dumbbell-row",
        productiveExerciseIds: ["chest-supported-dumbbell-row"],
      },
      history: {
        ...rowRequest().history,
        exerciseHistory: {
          ...EMPTY_TRAINING_HISTORY.exerciseHistory,
          stableExerciseIds: ["chest-supported-dumbbell-row"],
          blockedExerciseIds: [],
          events: [],
        },
        progressionState: {
          ...rowRequest().history.progressionState,
          readyToProgressExerciseIds: ["chest-supported-dumbbell-row"],
        },
      },
    };
    const result = runCandidateRankingLab(request);
    const current = ranked(result, "chest-supported-dumbbell-row");
    const transitionTarget = ranked(result, "seated-cable-row");
    const traces = buildExerciseTransitionTraces(exercise("chest-supported-dumbbell-row"), REFERENCE_EXERCISES);

    expect(current.rank).toBeLessThan(transitionTarget.rank);
    expect(componentValue(current, "progression_value")).toBeGreaterThan(
      componentValue(transitionTarget, "progression_value"),
    );
    expect(traces[0]?.automaticSelectionEffect).toBe("none");
  });

  it("keeps contextual, questionable, and needs-review transitions from becoming commands", () => {
    const wallSlideToFacePull = buildExerciseTransitionTraces(
      exercise("serratus-wall-slide"),
      REFERENCE_EXERCISES,
    )[0];
    const facePullToPecDeck = buildExerciseTransitionTraces(
      exercise("band-face-pull"),
      REFERENCE_EXERCISES,
    ).find((trace) => trace.targetExerciseId === "reverse-pec-deck");
    const pallofToDeadBug = buildExerciseTransitionTraces(
      exercise("pallof-press"),
      REFERENCE_EXERCISES,
    )[0];

    expect(wallSlideToFacePull).toEqual(
      expect.objectContaining({
        targetExerciseId: "band-face-pull",
        classification: "context_dependent",
        automaticSelectionEffect: "none",
      }),
    );
    expect(facePullToPecDeck).toEqual(
      expect.objectContaining({
        classification: "questionable",
        automaticSelectionEffect: "none",
      }),
    );
    expect(pallofToDeadBug).toEqual(
      expect.objectContaining({
        targetExerciseId: "dead-bug",
        classification: "needs_review",
        automaticSelectionEffect: "none",
      }),
    );
  });

  it("exposes row, scapular, and trunk structural deltas without ranking transitions", () => {
    const machineToChestSupported = buildExerciseTransitionTraces(
      exercise("machine-row"),
      REFERENCE_EXERCISES,
    ).find((trace) => trace.targetExerciseId === "chest-supported-dumbbell-row");
    const wallSlideToFacePull = buildExerciseTransitionTraces(
      exercise("serratus-wall-slide"),
      REFERENCE_EXERCISES,
    )[0];
    const deadBugToPallof = buildExerciseTransitionTraces(exercise("dead-bug"), REFERENCE_EXERCISES)
      .find((trace) => trace.targetExerciseId === "pallof-press");

    expect(machineToChestSupported?.classification).toBe("context_dependent");
    expect(machineToChestSupported?.structuralDelta.resistancePath.resistancePath).toEqual(
      expect.objectContaining({
        source: "machine_guided",
        target: "free_implement",
      }),
    );
    expect(machineToChestSupported?.structuralDelta.support.contacts).toEqual(
      expect.objectContaining({
        targetOnly: expect.arrayContaining([
          "chest:bench:weight_bearing:side_neutral:primary",
        ]),
      }),
    );
    expect(wallSlideToFacePull?.structuralDelta.assessmentFeatures).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          feature: "serratus_or_protraction_control",
          source: "high",
          target: "low",
          delta: "decrease",
        }),
        expect.objectContaining({
          feature: "retraction_control",
          source: "low",
          target: "high",
          delta: "increase",
        }),
      ]),
    );
    expect(deadBugToPallof?.structuralDelta.sourceOnlyMovementRoles).toContain("anti_extension_core");
    expect(deadBugToPallof?.structuralDelta.targetOnlyMovementRoles).toContain("anti_rotation_core");
  });

  it("keeps eligibility, pain, and deterministic ranking outside transition knowledge", () => {
    const first = runCandidateRankingLab(rowRequest());
    const second = runCandidateRankingLab(rowRequest());
    const lowBack = runCandidateRankingLab(scenario("horizontal-pull-low-back-discomfort").request);
    const noBench = runCandidateRankingLab(scenario("home-dumbbells-no-bench-horizontal-pull").request);

    expect(first.rankedCandidates.map((candidate) => [candidate.exercise.id, candidate.total])).toEqual(
      second.rankedCandidates.map((candidate) => [candidate.exercise.id, candidate.total]),
    );
    expect(ranked(lowBack, "chest-supported-dumbbell-row").rank).toBeLessThan(
      ranked(lowBack, "one-arm-dumbbell-row").rank,
    );
    expect(
      noBench.hardRejectedCandidates
        .find((candidate) => candidate.exercise.id === "chest-supported-dumbbell-row")
        ?.eligibility.rejectionReasons.map((reason) => reason.code),
    ).toContain("EQUIPMENT_UNAVAILABLE");
  });
});
