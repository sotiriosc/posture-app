import { describe, expect, it } from "vitest";
import {
  REFERENCE_EXERCISES,
  buildExerciseTransitionTrace,
  buildExerciseTransitionTraces,
  getControlledCandidateScenario,
  runCandidateRankingLab,
  type CandidateRankingResult,
  type CandidateRequest,
  type ExerciseDefinition,
  type ExerciseTransitionPurpose,
  type ExerciseTransitionRelationship,
  type ExerciseTransitionTrace,
} from "../../src";

const FIXED_AS_OF = "2026-08-10T00:00:00.000Z";

function exercise(id: string): ExerciseDefinition {
  const found = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing reference exercise ${id}`);
  }

  return found;
}

function transition(sourceId: string, targetId: string): ExerciseTransitionTrace {
  const found = buildExerciseTransitionTraces(
    exercise(sourceId),
    REFERENCE_EXERCISES,
  ).find((trace) => trace.targetExerciseId === targetId);
  if (!found) {
    throw new Error(`Missing transition ${sourceId}->${targetId}`);
  }

  return found;
}

function purposeEvidence(trace: ExerciseTransitionTrace, purpose: ExerciseTransitionPurpose) {
  const found = trace.purposeEvidence.find((entry) => entry.purpose === purpose);
  if (!found) {
    throw new Error(`Missing ${purpose} evidence for ${trace.sourceExerciseId}->${trace.targetExerciseId}`);
  }

  return found;
}

function syntheticRelationship(input: {
  readonly targetExerciseId: string;
  readonly purpose: ExerciseTransitionPurpose;
  readonly notes: string;
}): ExerciseTransitionRelationship {
  return {
    targetExerciseId: input.targetExerciseId,
    direction: "progression",
    classification: "context_dependent",
    purposes: [input.purpose],
    reviewStatus: "accepted",
    notes: input.notes,
    provenance: ["focused transition-purpose test"],
  };
}

function allTransitionTraces(): readonly ExerciseTransitionTrace[] {
  return REFERENCE_EXERCISES.flatMap((source) =>
    buildExerciseTransitionTraces(source, REFERENCE_EXERCISES),
  );
}

function controlledRequest(): CandidateRequest {
  const found = getControlledCandidateScenario("horizontal-pull-gym-neutral");
  if (!found) {
    throw new Error("Missing horizontal-pull-gym-neutral scenario");
  }

  return {
    ...found.request,
    evaluationContext: { asOf: FIXED_AS_OF },
  };
}

function withMachineRowPurposes(
  purposes: readonly ExerciseTransitionPurpose[],
): readonly ExerciseDefinition[] {
  return REFERENCE_EXERCISES.map((candidate) => {
    if (candidate.id !== "machine-row") {
      return candidate;
    }

    return {
      ...candidate,
      progression: {
        ...candidate.progression,
        transitionRelationships: candidate.progression.transitionRelationships.map(
          (relationship) => ({ ...relationship, purposes }),
        ),
      },
    };
  });
}

function rankingSnapshot(result: CandidateRankingResult) {
  return {
    legalCandidateCount: result.legalCandidateCount,
    ranked: result.rankedCandidates.map((candidate) => ({
      id: candidate.exercise.id,
      rank: candidate.rank,
      total: candidate.total,
      components: candidate.components.map((component) => ({
        id: component.id,
        rawValue: component.rawValue,
        value: component.value,
        weightedContribution: component.weightedContribution,
        reasonCode: component.reasonCode,
      })),
    })),
    rejected: result.hardRejectedCandidates.map((candidate) => ({
      id: candidate.exercise.id,
      reasons: candidate.eligibility.rejectionReasons.map((reason) => reason.code),
    })),
  };
}

describe("transition purpose evidence truth", () => {
  it("structurally confirms known increase and decrease deltas", () => {
    const increase = purposeEvidence(
      transition("dead-bug", "pallof-press"),
      "increase_loadability",
    );
    const decrease = purposeEvidence(
      transition("pallof-press", "dead-bug"),
      "reduce_loadability",
    );

    expect(increase).toEqual({
      purpose: "increase_loadability",
      status: "structurally_confirmed",
      evidence: "loadability: limited -> moderate (increase); expected increase",
    });
    expect(decrease).toEqual({
      purpose: "reduce_loadability",
      status: "structurally_confirmed",
      evidence: "loadability: moderate -> limited (decrease); expected decrease",
    });
  });

  it.each([
    ["increase_stability_demand", "ninety-ninety-breathing", "dead-bug"],
    ["reduce_coordination_demand", "dead-bug", "ninety-ninety-breathing"],
    ["change_resistance_path", "machine-row", "chest-supported-dumbbell-row"],
    ["equipment_transition", "band-face-pull", "serratus-wall-slide"],
    ["feature_shift", "band-face-pull", "serratus-wall-slide"],
  ] as const)(
    "structurally confirms known %s evidence",
    (purpose, sourceId, targetId) => {
      expect(purposeEvidence(transition(sourceId, targetId), purpose).status).toBe(
        "structurally_confirmed",
      );
    },
  );

  it.each([
    [
      "increase_stability_demand" as const,
      "dead-bug",
      "pallof-press",
      "stability demand: moderate -> moderate (same); expected increase",
    ],
    [
      "reduce_coordination_demand" as const,
      "push-up",
      "machine-chest-press",
      "coordination demand: low -> low (same); expected decrease",
    ],
  ])("marks a known same-value %s claim as contradicted", (purpose, sourceId, targetId, evidence) => {
    const relationship = syntheticRelationship({
      targetExerciseId: targetId,
      purpose,
      notes: `Reviewed note claims ${purpose}.`,
    });
    const trace = buildExerciseTransitionTrace({
      source: exercise(sourceId),
      target: exercise(targetId),
      relationship,
    });

    expect(trace.purposeEvidence).toEqual([
      { purpose, status: "contradicted", evidence },
    ]);
  });

  it("keeps missing resistance-path mechanics unknown", () => {
    const evidence = purposeEvidence(
      transition("dead-bug", "pallof-press"),
      "change_resistance_path",
    );

    expect(evidence).toEqual({
      purpose: "change_resistance_path",
      status: "unknown_metadata",
      evidence: "source and/or target resistance-path profile is not modeled",
    });
  });

  it("keeps programming and support purposes contextual", () => {
    const movement = purposeEvidence(
      transition("dead-bug", "pallof-press"),
      "movement_pattern_development",
    );
    const support = purposeEvidence(
      transition("push-up", "machine-chest-press"),
      "increase_support",
    );

    expect(movement.status).toBe("contextual_intent");
    expect(movement.evidence).toContain(
      "movement roles: source=[anti_extension_core] -> target=[anti_rotation_core]",
    );
    expect(movement.evidence).toContain("review=accepted");
    expect(support.status).toBe("contextual_intent");
    expect(support.evidence).toContain("base position: prone -> seated");
    expect(support.evidence).toContain(
      "hand:floor:weight_bearing:bilateral:primary",
    );
    expect(support.evidence).toContain(
      "seat:machine:weight_bearing:side_neutral:primary",
    );
  });

  it("does not let transition notes confirm contradictory mechanics", () => {
    const relationship = syntheticRelationship({
      targetExerciseId: "machine-chest-press",
      purpose: "reduce_coordination_demand",
      notes: "This note emphatically claims that coordination demand is reduced.",
    });
    const trace = buildExerciseTransitionTrace({
      source: exercise("push-up"),
      target: exercise("machine-chest-press"),
      relationship,
    });

    expect(trace.notes).toContain("emphatically claims");
    expect(trace.purposeEvidence[0]).toEqual({
      purpose: "reduce_coordination_demand",
      status: "contradicted",
      evidence: "coordination demand: low -> low (same); expected decrease",
    });
  });

  it("does not derive direct-purpose truth from identity or prose fields", () => {
    const relationship = syntheticRelationship({
      targetExerciseId: "machine-chest-press",
      purpose: "reduce_coordination_demand",
      notes: "Context note retained without becoming structural evidence.",
    });
    const baseline = buildExerciseTransitionTrace({
      source: exercise("push-up"),
      target: exercise("machine-chest-press"),
      relationship,
    });
    const relabeledSource: ExerciseDefinition = {
      ...exercise("push-up"),
      id: "prose-claims-high-coordination",
      name: "Prose Claims High Coordination",
      summary: "A renamed exercise summary that claims a large coordination reduction.",
      coachingFocus: ["Claim reduced coordination in a cue"],
    };
    const relabeledTarget: ExerciseDefinition = {
      ...exercise("machine-chest-press"),
      id: "prose-claims-low-coordination",
      name: "Prose Claims Low Coordination",
      summary: "Another renamed summary with a directional mechanics claim.",
      coachingFocus: ["Repeat the unsupported direction"],
    };
    const relabeled = buildExerciseTransitionTrace({
      source: relabeledSource,
      target: relabeledTarget,
      relationship: {
        ...relationship,
        targetExerciseId: relabeledTarget.id,
      },
    });

    expect(relabeled.purposeEvidence).toEqual(baseline.purposeEvidence);
    expect(relabeled.purposeEvidence[0]?.status).toBe("contradicted");
  });

  it("audits all reference purposes with zero contradictions", () => {
    const traces = allTransitionTraces();
    const findings = traces.flatMap((trace) => trace.purposeEvidence);
    const count = (status: (typeof findings)[number]["status"]) =>
      findings.filter((finding) => finding.status === status).length;

    expect(traces).toHaveLength(47);
    expect(findings).toHaveLength(140);
    expect({
      structurally_confirmed: count("structurally_confirmed"),
      contextual_intent: count("contextual_intent"),
      unknown_metadata: count("unknown_metadata"),
      contradicted: count("contradicted"),
    }).toEqual({
      structurally_confirmed: 69,
      contextual_intent: 53,
      unknown_metadata: 18,
      contradicted: 0,
    });
  });

  it.each([
    [
      "dead-bug",
      "pallof-press",
      "progression",
      "context_dependent",
      ["movement_pattern_development", "change_resistance_path", "increase_loadability"],
    ],
    [
      "push-up",
      "machine-chest-press",
      "regression",
      "context_dependent",
      ["increase_support", "reduce_stability_demand", "pain_or_tolerance_regression"],
    ],
    [
      "band-face-pull",
      "serratus-wall-slide",
      "lateral",
      "context_dependent",
      ["feature_shift", "equipment_transition"],
    ],
    [
      "pallof-press",
      "dead-bug",
      "regression",
      "needs_review",
      ["reduce_loadability", "movement_pattern_development", "pain_or_tolerance_regression"],
    ],
  ] as const)(
    "keeps the corrected %s -> %s relationship truthful",
    (sourceId, targetId, direction, classification, purposes) => {
      const trace = transition(sourceId, targetId);

      expect(trace).toEqual(
        expect.objectContaining({
          direction,
          classification,
          purposes,
          automaticSelectionEffect: "none",
        }),
      );
    },
  );

  it("preserves questionable and needs-review relationship qualification", () => {
    const pecDeckToFacePull = transition("reverse-pec-deck", "band-face-pull");
    const facePullToPecDeck = transition("band-face-pull", "reverse-pec-deck");
    const pallofToDeadBug = transition("pallof-press", "dead-bug");

    expect(pecDeckToFacePull).toEqual(
      expect.objectContaining({ classification: "questionable", reviewStatus: "needs_review" }),
    );
    expect(facePullToPecDeck).toEqual(
      expect.objectContaining({ classification: "questionable", reviewStatus: "needs_review" }),
    );
    expect(pallofToDeadBug).toEqual(
      expect.objectContaining({ classification: "needs_review", reviewStatus: "needs_review" }),
    );
    expect(transition("band-face-pull", "serratus-wall-slide").notes).toContain(
      "Neither exercise is a universal progression or regression of the other.",
    );
  });

  it("keeps every transition observational", () => {
    expect(
      allTransitionTraces().every((trace) => trace.automaticSelectionEffect === "none"),
    ).toBe(true);
  });

  it("keeps scores, totals, and ranking invariant when only purposes change", () => {
    const request = controlledRequest();
    const original = runCandidateRankingLab(request);
    const removed = runCandidateRankingLab({
      ...request,
      candidatePool: withMachineRowPurposes([]),
    });
    const changed = runCandidateRankingLab({
      ...request,
      candidatePool: withMachineRowPurposes(["pain_or_tolerance_regression"]),
    });

    expect(rankingSnapshot(removed)).toEqual(rankingSnapshot(original));
    expect(rankingSnapshot(changed)).toEqual(rankingSnapshot(original));
  });

  it("builds deterministic purpose-evidence traces", () => {
    const first = allTransitionTraces();
    const second = allTransitionTraces();

    expect(second).toEqual(first);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });
});
