import { describe, expect, it } from "vitest";
import {
  CANDIDATE_SCORE_COMPONENTS,
  CONTROLLED_CANDIDATE_SCENARIOS,
  DUMBBELLS_AND_BENCH_EQUIPMENT,
  FULL_GYM_EQUIPMENT,
  getControlledCandidateScenario,
  HARD_ELIGIBILITY_COMPONENTS,
  EMPTY_TRAINING_HISTORY,
  REFERENCE_EXERCISES,
  buildHorizontalRowSelectionTrace,
  evaluateHardEligibility,
  runCandidateRankingLab,
  type CandidateRequest,
  type CandidateRankingResult,
  type EquipmentCapabilities,
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

function result(id: string): CandidateRankingResult {
  return runCandidateRankingLab(scenario(id).request);
}

function ranked(resultValue: CandidateRankingResult, exerciseId: string): RankedCandidate {
  const found = resultValue.rankedCandidates.find((candidate) => candidate.exercise.id === exerciseId);
  if (!found) {
    throw new Error(`Missing ranked candidate ${exerciseId}`);
  }

  return found;
}

function componentValue(candidate: RankedCandidate, componentId: string): number {
  const found = candidate.components.find((component) => component.id === componentId);
  if (!found) {
    throw new Error(`Missing component ${componentId} for ${candidate.exercise.id}`);
  }

  return found.value;
}

function component(candidate: RankedCandidate, componentId: string) {
  const found = candidate.components.find((scoreComponent) => scoreComponent.id === componentId);
  if (!found) {
    throw new Error(`Missing component ${componentId} for ${candidate.exercise.id}`);
  }

  return found;
}

function rejectedCodes(resultValue: CandidateRankingResult, exerciseId: string): readonly string[] {
  return (
    resultValue.hardRejectedCandidates.find((candidate) => candidate.exercise.id === exerciseId)
      ?.eligibility.rejectionReasons.map((reason) => reason.code) ?? []
  );
}

function withoutRowMachine(equipment: EquipmentCapabilities): EquipmentCapabilities {
  return {
    ...equipment,
    machines: {
      availableMachineIds: equipment.machines.availableMachineIds.filter(
        (machineId) => machineId !== "row",
      ),
    },
  };
}

function withoutCable(equipment: EquipmentCapabilities): EquipmentCapabilities {
  return {
    ...equipment,
    cables: {
      available: false,
      adjustableHeight: false,
      availableHeights: [],
    },
  };
}

function withMachineRowContinuity(request: CandidateRequest): CandidateRequest {
  return {
    ...request,
    id: `${request.id}-machine-row-continuity`,
    continuity: {
      ...request.continuity,
      currentExerciseId: "machine-row",
      productiveExerciseIds: ["machine-row"],
    },
    history: {
      ...request.history,
      exerciseHistory: {
        ...EMPTY_TRAINING_HISTORY.exerciseHistory,
        events: [
          {
            id: "machine-row-appropriate-challenge",
            exerciseId: "machine-row",
            type: "appropriate_challenge",
            occurredAt: "2026-08-07T00:00:00.000Z",
            movementRole: "horizontal_pull",
            notes: "Machine row was productively challenging.",
          },
        ],
        stableExerciseIds: ["machine-row"],
        blockedExerciseIds: [],
      },
      progressionState: {
        ...request.history.progressionState,
        readyToProgressExerciseIds: ["machine-row"],
      },
    },
  };
}

function referenceExercise(id: string): ExerciseDefinition {
  const found = REFERENCE_EXERCISES.find((exercise) => exercise.id === id);
  if (!found) {
    throw new Error(`Missing reference exercise ${id}`);
  }

  return found;
}

function rowVariant(
  base: ExerciseDefinition,
  input: {
    readonly id: string;
    readonly name?: string;
    readonly summary?: string;
    readonly support?: Partial<NonNullable<ExerciseDefinition["mechanics"]>["support"]>;
    readonly resistancePath?: Partial<
      NonNullable<NonNullable<ExerciseDefinition["mechanics"]>["resistancePath"]>
    >;
  },
): ExerciseDefinition {
  if (!base.mechanics?.resistancePath) {
    throw new Error(`Exercise ${base.id} needs mechanics and resistance path for row variant tests.`);
  }

  return {
    ...base,
    id: input.id,
    name: input.name ?? base.name,
    summary: input.summary ?? base.summary,
    mechanics: {
      ...base.mechanics,
      support: {
        ...base.mechanics.support,
        ...input.support,
      },
      resistancePath: {
        ...base.mechanics.resistancePath,
        ...input.resistancePath,
      },
    },
  };
}

function syntheticRowResult(
  exercises: readonly ExerciseDefinition[],
  request: CandidateRequest = scenario("horizontal-pull-gym-neutral").request,
): CandidateRankingResult {
  const base = result("horizontal-pull-gym-neutral");
  const template = ranked(base, "machine-row");
  const rankedCandidates: readonly RankedCandidate[] = exercises.map((exercise, index) => ({
    ...template,
    rank: index + 1,
    exercise,
    score: {
      ...template.score,
      exerciseId: exercise.id,
    },
    total: template.total,
    components: template.components,
    summary: `Synthetic row trace candidate for ${exercise.id}.`,
  }));

  return {
    ...base,
    request: {
      ...request,
      id: `${request.id}:synthetic-row-trace`,
      candidatePool: exercises,
    },
    hardRejectedCandidates: [],
    legalCandidateCount: rankedCandidates.length,
    rankedCandidates,
  };
}

function tieBetween(resultValue: CandidateRankingResult, leftId: string, rightId: string) {
  return buildHorizontalRowSelectionTrace(resultValue, [leftId, rightId]).tieStatus.find(
    (tie) => tie.exerciseIds.includes(leftId) && tie.exerciseIds.includes(rightId),
  );
}

describe("Candidate Intelligence foundation", () => {
  it("exposes modular hard eligibility and score components", () => {
    expect(HARD_ELIGIBILITY_COMPONENTS.map((component) => component.id)).toEqual([
      "equipment_eligibility",
      "setup_eligibility",
      "personal_block_eligibility",
      "contraindication_eligibility",
      "capability_eligibility",
      "role_eligibility",
      "pain_review_eligibility",
    ]);
    expect(CANDIDATE_SCORE_COMPONENTS.map((component) => component.id)).toEqual([
      "role_fit",
      "goal_fit",
      "session_intent_fit",
      "muscle_target_fit",
      "assessment_fit",
      "alignment_fit",
      "pain_suitability",
      "experience_fit",
      "phase_fit",
      "stability_fit",
      "skill_fit",
      "progression_value",
      "continuity_value",
      "loadability",
      "stimulus_potential",
      "fatigue_cost",
      "joint_cost",
      "equipment_practicality",
    ]);
    expect(REFERENCE_EXERCISES).toHaveLength(37);
    expect(CONTROLLED_CANDIDATE_SCENARIOS.length).toBeGreaterThanOrEqual(20);
  });

  it("ranks deterministically and records candidate-stage trace snapshots", () => {
    const first = result("horizontal-pull-gym-neutral");
    const second = result("horizontal-pull-gym-neutral");

    expect(first.rankedCandidates.map((candidate) => candidate.exercise.id)).toEqual(
      second.rankedCandidates.map((candidate) => candidate.exercise.id),
    );
    expect(first.decisionTrace.candidateCount).toBe(REFERENCE_EXERCISES.length);
    expect(first.decisionTrace.topCandidateScores[0].aggregate.method).toBe(
      "weighted_mean_candidate_intelligence_v0",
    );
    expect(first.pipeline.snapshots.map((snapshot) => snapshot.stage)).toEqual([
      "normalized_athlete_state",
      "interpreted_assessment",
      "alignment_priorities",
      "hard_rejected_candidates",
      "legal_candidate_pool",
      "candidate_score_breakdowns",
    ]);
    expect(first.rankedCandidates[0].components).toHaveLength(CANDIDATE_SCORE_COMPONENTS.length - 1);
    expect(first.rankedCandidates[0].components.some((component) => component.id === "phase_fit"))
      .toBe(false);
  });

  it("prefers supported rows over unsupported rows when low-back discomfort overlaps hinge stress", () => {
    const lowBack = result("horizontal-pull-low-back-discomfort");
    const supported = ranked(lowBack, "chest-supported-dumbbell-row");
    const unsupported = ranked(lowBack, "one-arm-dumbbell-row");

    expect(supported.rank).toBeLessThan(unsupported.rank);
    expect(componentValue(supported, "pain_suitability")).toBe(
      componentValue(unsupported, "pain_suitability"),
    );
    expect(componentValue(supported, "joint_cost")).toBeGreaterThan(
      componentValue(unsupported, "joint_cost"),
    );
  });

  it("models horizontal row path mechanics without making path a generic score bonus", () => {
    const machine = REFERENCE_EXERCISES.find((candidate) => candidate.id === "machine-row");
    const cable = REFERENCE_EXERCISES.find((candidate) => candidate.id === "seated-cable-row");
    const chestSupported = REFERENCE_EXERCISES.find(
      (candidate) => candidate.id === "chest-supported-dumbbell-row",
    );
    const oneArm = REFERENCE_EXERCISES.find((candidate) => candidate.id === "one-arm-dumbbell-row");

    expect(machine?.mechanics?.resistancePath).toEqual(
      expect.objectContaining({
        resistancePath: "machine_guided",
        trajectoryFreedom: "low",
        lineOfPullAdjustability: "unknown",
        laterality: "unknown",
        fitDependency: "machine_geometry",
        reviewStatus: "needs_review",
      }),
    );
    expect(cable?.mechanics?.resistancePath).toEqual(
      expect.objectContaining({
        resistancePath: "cable_anchored",
        trajectoryFreedom: "moderate",
        lineOfPullAdjustability: "moderate",
        laterality: "bilateral_linked",
        fitDependency: "setup_geometry",
        reviewStatus: "needs_review",
      }),
    );
    expect(chestSupported?.mechanics?.resistancePath).toEqual(
      expect.objectContaining({
        resistancePath: "free_implement",
        trajectoryFreedom: "high",
        laterality: "bilateral_independent",
        fitDependency: "setup_geometry",
        reviewStatus: "accepted",
      }),
    );
    expect(oneArm?.mechanics?.resistancePath).toEqual(
      expect.objectContaining({
        resistancePath: "free_implement",
        trajectoryFreedom: "high",
        laterality: "unilateral",
        fitDependency: "setup_geometry",
        reviewStatus: "accepted",
      }),
    );
    expect(CANDIDATE_SCORE_COMPONENTS.map((scoreComponent) => scoreComponent.id)).not.toContain(
      "path_freedom_bonus",
    );
  });

  it("classifies a neutral machine/cable row tie as mechanically distinct and context-required", () => {
    const neutral = result("horizontal-pull-gym-neutral");
    const machine = ranked(neutral, "machine-row");
    const cable = ranked(neutral, "seated-cable-row");
    const trace = buildHorizontalRowSelectionTrace(neutral);
    const tie = trace.tieStatus.find(
      (entry) =>
        entry.exerciseIds.includes("machine-row") &&
        entry.exerciseIds.includes("seated-cable-row"),
    );
    const machineTrace = trace.candidates.find((candidate) => candidate.exerciseId === "machine-row");
    const cableTrace = trace.candidates.find((candidate) => candidate.exerciseId === "seated-cable-row");

    expect(machine.total).toBe(cable.total);
    expect(tie).toEqual(
      expect.objectContaining({
        scoreEquivalent: true,
        mechanicallyDistinct: true,
        statusCodes: [
          "SCORE_EQUIVALENT_BUT_MECHANICALLY_DISTINCT",
          "CONTEXT_REQUIRED_TO_DIFFERENTIATE",
        ],
      }),
    );
    expect(machineTrace?.contextualDifferentiators).toEqual(["none"]);
    expect(cableTrace?.contextualDifferentiators).toEqual(["none"]);
    expect(machineTrace?.resistancePath.resistancePath).toBe("machine_guided");
    expect(cableTrace?.resistancePath.resistancePath).toBe("cable_anchored");
  });

  it("keeps row mechanical equivalence independent from notes, provenance, and review status", () => {
    const base = referenceExercise("machine-row");
    const left = rowVariant(base, {
      id: "semantic-row-left",
      name: "Semantic Row Left",
      support: {
        reviewStatus: "accepted",
        notes: "Different support review wording.",
      },
      resistancePath: {
        reviewStatus: "accepted",
        notes: "Different path review wording.",
        provenance: ["different provenance"],
      },
    });
    const right = rowVariant(base, {
      id: "semantic-row-right",
      name: "Semantic Row Right",
      support: {
        reviewStatus: "needs_review",
        notes: "Another support review note.",
      },
      resistancePath: {
        reviewStatus: "needs_review",
        notes: "Another path review note.",
        provenance: ["another provenance"],
      },
    });
    const trace = buildHorizontalRowSelectionTrace(
      syntheticRowResult([left, right]),
      [left.id, right.id],
    );
    const tie = trace.tieStatus[0];
    const leftTrace = trace.candidates.find((candidate) => candidate.exerciseId === left.id);
    const rightTrace = trace.candidates.find((candidate) => candidate.exerciseId === right.id);

    expect(tie).toEqual(
      expect.objectContaining({
        mechanicallyDistinct: false,
        statusCodes: ["SCORE_EQUIVALENT_AND_KNOWLEDGE_EQUIVALENT"],
      }),
    );
    expect(leftTrace?.mechanicsSignature).toBe(rightTrace?.mechanicsSignature);
    expect(leftTrace?.mechanicsSignature).not.toContain("reviewStatus");
    expect(leftTrace?.mechanicsSignature).not.toContain("provenance");
    expect(leftTrace?.mechanicsSignature).not.toContain("notes");
    expect(leftTrace?.support.reviewStatus).toBe("accepted");
    expect(rightTrace?.resistancePath.provenance).toEqual(["another provenance"]);
  });

  it("treats structured resistance path and trajectory changes as mechanical distinctions", () => {
    const base = referenceExercise("machine-row");
    const guided = rowVariant(base, { id: "guided-row" });
    const anchored = rowVariant(base, {
      id: "anchored-row",
      resistancePath: {
        resistancePath: "cable_anchored",
      },
    });
    const highFreedom = rowVariant(base, {
      id: "high-freedom-row",
      resistancePath: {
        trajectoryFreedom: "high",
      },
    });

    expect(tieBetween(syntheticRowResult([guided, anchored]), guided.id, anchored.id)).toEqual(
      expect.objectContaining({
        mechanicallyDistinct: true,
        statusCodes: [
          "SCORE_EQUIVALENT_BUT_MECHANICALLY_DISTINCT",
          "CONTEXT_REQUIRED_TO_DIFFERENTIATE",
        ],
      }),
    );
    expect(tieBetween(syntheticRowResult([guided, highFreedom]), guided.id, highFreedom.id)).toEqual(
      expect.objectContaining({
        mechanicallyDistinct: true,
        statusCodes: [
          "SCORE_EQUIVALENT_BUT_MECHANICALLY_DISTINCT",
          "CONTEXT_REQUIRED_TO_DIFFERENTIATE",
        ],
      }),
    );
  });

  it("treats structured support changes as mechanical distinctions", () => {
    const base = referenceExercise("machine-row");
    const seated = rowVariant(base, { id: "seated-support-row" });
    const chestSupported = rowVariant(base, {
      id: "structured-support-row",
      support: {
        supportContacts: [
          { bodyRegion: "chest", source: "machine", mode: "weight_bearing", side: "side_neutral", taskRole: "primary" },
        ],
      },
    });

    expect(tieBetween(syntheticRowResult([seated, chestSupported]), seated.id, chestSupported.id)).toEqual(
      expect.objectContaining({
        mechanicallyDistinct: true,
        statusCodes: [
          "SCORE_EQUIVALENT_BUT_MECHANICALLY_DISTINCT",
          "CONTEXT_REQUIRED_TO_DIFFERENTIATE",
        ],
      }),
    );
  });

  it("derives low-back row diagnostics from structured support instead of exercise id or name text", () => {
    const base = referenceExercise("machine-row");
    const lowBackRequest = scenario("horizontal-pull-low-back-discomfort").request;
    const textOnly = rowVariant(base, {
      id: "decoy-chest-supported-name-only",
      name: "Chest Supported Name Decoy",
      support: {
        supportContacts: [
          { bodyRegion: "seat", source: "machine", mode: "weight_bearing", side: "side_neutral", taskRole: "primary" },
        ],
      },
    });
    const structuredSupport = rowVariant(base, {
      id: "opaque-row-structure-only",
      name: "Opaque Row",
      support: {
        supportContacts: [
          { bodyRegion: "chest", source: "machine", mode: "weight_bearing", side: "side_neutral", taskRole: "primary" },
        ],
      },
    });
    const trace = buildHorizontalRowSelectionTrace(
      syntheticRowResult([textOnly, structuredSupport], lowBackRequest),
      [textOnly.id, structuredSupport.id],
    );
    const textOnlyTrace = trace.candidates.find((candidate) => candidate.exerciseId === textOnly.id);
    const structuredTrace = trace.candidates.find(
      (candidate) => candidate.exerciseId === structuredSupport.id,
    );

    expect(textOnlyTrace?.contextualDifferentiators).toEqual(["none"]);
    expect(structuredTrace?.contextualDifferentiators).toContain(
      "structured support: primary chest contact in lumbar-spine context",
    );
    expect(structuredTrace?.contextualDifferentiators.join(" ")).not.toContain(
      structuredSupport.id,
    );
    expect(structuredTrace?.contextualDifferentiators.join(" ")).not.toContain(
      structuredSupport.name,
    );
  });

  it("keeps neutral row totals and order unchanged by row diagnostics", () => {
    const neutral = result("horizontal-pull-gym-neutral");

    expect(
      neutral.rankedCandidates
        .filter((candidate) =>
          [
            "machine-row",
            "seated-cable-row",
            "chest-supported-dumbbell-row",
            "one-arm-dumbbell-row",
          ].includes(candidate.exercise.id),
        )
        .map((candidate) => [candidate.exercise.id, candidate.total]),
    ).toEqual([
      ["machine-row", 8.021],
      ["seated-cable-row", 8.021],
      ["chest-supported-dumbbell-row", 8.017],
      ["one-arm-dumbbell-row", 7.919],
    ]);
  });

  it("treats bench support as a hard equipment fact without eliminating dumbbell rows entirely", () => {
    const noBench = result("home-dumbbells-no-bench-horizontal-pull");

    expect(rejectedCodes(noBench, "chest-supported-dumbbell-row")).toContain("EQUIPMENT_UNAVAILABLE");
    expect(noBench.rankedCandidates[0].exercise.id).toBe("one-arm-dumbbell-row");
  });

  it("keeps row equipment constraints hard and reduces legal comparisons appropriately", () => {
    const baseRequest = scenario("horizontal-pull-gym-neutral").request;
    const noMachine = runCandidateRankingLab({
      ...baseRequest,
      id: "horizontal-pull-no-row-machine",
      equipment: withoutRowMachine(FULL_GYM_EQUIPMENT),
    });
    const noCable = runCandidateRankingLab({
      ...baseRequest,
      id: "horizontal-pull-no-cable",
      equipment: withoutCable(FULL_GYM_EQUIPMENT),
    });
    const dumbbellsAndBenchOnly = runCandidateRankingLab({
      ...baseRequest,
      id: "horizontal-pull-dumbbells-bench-only",
      equipment: DUMBBELLS_AND_BENCH_EQUIPMENT,
    });

    expect(rejectedCodes(noMachine, "machine-row")).toContain("EQUIPMENT_UNAVAILABLE");
    expect(noMachine.rankedCandidates.map((candidate) => candidate.exercise.id)).toContain(
      "seated-cable-row",
    );
    expect(rejectedCodes(noCable, "seated-cable-row")).toContain("EQUIPMENT_UNAVAILABLE");
    expect(noCable.rankedCandidates.map((candidate) => candidate.exercise.id)).toContain(
      "machine-row",
    );
    expect(rejectedCodes(dumbbellsAndBenchOnly, "machine-row")).toContain(
      "EQUIPMENT_UNAVAILABLE",
    );
    expect(rejectedCodes(dumbbellsAndBenchOnly, "seated-cable-row")).toContain(
      "EQUIPMENT_UNAVAILABLE",
    );
    expect(dumbbellsAndBenchOnly.rankedCandidates.map((candidate) => candidate.exercise.id)).toEqual(
      expect.arrayContaining(["chest-supported-dumbbell-row", "one-arm-dumbbell-row"]),
    );
  });

  it("keeps low-confidence assessment visible while confirmed priorities expose relationship semantics", () => {
    const lowConfidence = result("horizontal-pull-low-confidence-scapular");
    const highConfidence = result("scapular-activation-high-confidence");
    const facePull = ranked(highConfidence, "band-face-pull");
    const facePullTrace = component(facePull, "assessment_fit").assessmentRelevance?.[0];

    expect(lowConfidence.alignmentPriorities).toHaveLength(0);
    expect(lowConfidence.assessmentInfluence[0]).toEqual(
      expect.objectContaining({
        relevance: "low",
        direction: "neutral",
      }),
    );
    expect(highConfidence.alignmentPriorities.map((priority) => priority.id)).toContain(
      "alignment-confirmed-scapular-control-priority",
    );
    expect(highConfidence.rankedCandidates[0].exercise.id).toBe("band-face-pull");
    expect(componentValue(facePull, "assessment_fit")).toBe(6);
    expect(componentValue(facePull, "alignment_fit")).toBe(6);
    expect(facePullTrace).toEqual(
      expect.objectContaining({
        relationship: "neutral",
        relevance: "none",
        relevanceReasonCode: "ASSESSMENT_NOT_RELEVANT",
      }),
    );
    expect(facePullTrace?.featureMatches[0]).toEqual(
      expect.objectContaining({
        assessmentFeature: "serratus_or_protraction_control",
        candidateFeatureLevel: "low",
        featureMatch: "low_expression",
      }),
    );
  });

  it("lets contextual phase abstain without assuming beginner means machine-only", () => {
    const phase1 = result("horizontal-push-phase-1");
    const phase3 = result("horizontal-push-phase-3");
    const phase1Bench = ranked(phase1, "dumbbell-bench-press");
    const phase3Bench = ranked(phase3, "dumbbell-bench-press");

    expect(phase1.rankedCandidates[0].exercise.id).toBe("push-up");
    expect(phase3.rankedCandidates[0].exercise.id).toBe("dumbbell-bench-press");
    expect(phase1Bench.components.find((component) => component.id === "phase_fit"))
      .toBeUndefined();
    expect(phase3Bench.components.find((component) => component.id === "phase_fit"))
      .toBeUndefined();
  });

  it("favors productive continuity but supports replacement when progression has stalled", () => {
    const productive = result("horizontal-pull-productive-continuity");
    const plateau = result("horizontal-pull-plateau-replacement");
    const productiveRow = ranked(productive, "chest-supported-dumbbell-row");
    const plateauRow = ranked(plateau, "chest-supported-dumbbell-row");

    expect(productive.rankedCandidates[0].exercise.id).toBe("chest-supported-dumbbell-row");
    expect(plateau.rankedCandidates[0].exercise.id).not.toBe("chest-supported-dumbbell-row");
    expect(componentValue(productiveRow, "continuity_value")).toBeGreaterThan(
      componentValue(plateauRow, "continuity_value"),
    );
  });

  it("allows exercise-specific history to distinguish rows without path generalization", () => {
    const baseRequest = scenario("horizontal-pull-gym-neutral").request;
    const continuity = runCandidateRankingLab(withMachineRowContinuity(baseRequest));
    const machine = ranked(continuity, "machine-row");
    const cable = ranked(continuity, "seated-cable-row");
    const chestSupported = ranked(continuity, "chest-supported-dumbbell-row");
    const trace = buildHorizontalRowSelectionTrace(continuity);
    const machineTrace = trace.candidates.find((candidate) => candidate.exerciseId === "machine-row");
    const cableTrace = trace.candidates.find((candidate) => candidate.exerciseId === "seated-cable-row");

    expect(machine.rank).toBeLessThan(cable.rank);
    expect(componentValue(machine, "continuity_value")).toBeGreaterThan(
      componentValue(cable, "continuity_value"),
    );
    expect(componentValue(chestSupported, "continuity_value")).toBe(
      componentValue(cable, "continuity_value"),
    );
    expect(machineTrace?.contextualDifferentiators).toEqual(
      expect.arrayContaining([
        "exercise-specific continuity: current exercise",
        "exercise-specific continuity: productive",
        "exercise-specific history: stable exercise",
        "exercise-specific history: recorded exposure",
      ]),
    );
    expect(cableTrace?.contextualDifferentiators).toEqual(["none"]);
  });

  it("distinguishes anchored tube bands from bands without an anchor or loop bands only", () => {
    const anchored = result("anchored-bands-horizontal-pull");
    const noAnchor = result("bands-without-anchor-horizontal-pull");
    const loopOnly = result("loop-bands-only-horizontal-pull");

    expect(anchored.rankedCandidates.map((candidate) => candidate.exercise.id)).toContain("band-row");
    expect(rejectedCodes(noAnchor, "band-row")).toContain("EQUIPMENT_UNAVAILABLE");
    expect(rejectedCodes(loopOnly, "band-row")).toContain("EQUIPMENT_UNAVAILABLE");
  });

  it("uses capability as a hard rule and pain as inspectable ranking influence", () => {
    const missingCapability = result("lower-hinge-capability-missing");
    const moderatePain = result("lower-hinge-moderate-low-back-pain");
    const request = scenario("lower-hinge-moderate-low-back-pain").request;
    const rdl = REFERENCE_EXERCISES.find((exercise) => exercise.id === "dumbbell-romanian-deadlift");

    if (!rdl) {
      throw new Error("Missing dumbbell-romanian-deadlift");
    }

    const rdlEligibility = evaluateHardEligibility(rdl, {
      equipment: request.equipment,
      painAndInjury: request.painAndInjury,
      assessment: request.assessment,
      requestedRole: request.need.requestedRole,
      satisfiedPrerequisiteIds: request.satisfiedPrerequisiteIds,
    });
    const cable = ranked(moderatePain, "cable-pull-through");
    const painfulRdl = ranked(moderatePain, "dumbbell-romanian-deadlift");

    expect(rejectedCodes(missingCapability, "dumbbell-romanian-deadlift")).toContain(
      "CAPABILITY_MISSING",
    );
    expect(rdlEligibility.legal).toBe(true);
    expect(rdlEligibility.warnings.map((warning) => warning.code)).toContain("PAIN_REQUIRES_REVIEW");
    expect(painfulRdl.rank).toBeLessThan(cable.rank);
    expect(componentValue(cable, "pain_suitability")).toBe(
      componentValue(painfulRdl, "pain_suitability"),
    );
  });
});
