import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  CONTROLLED_CANDIDATE_SCENARIOS,
  REFERENCE_EXERCISES,
  SESSION_SECTIONS,
  buildSessionPrescriptionHandoff,
  buildSessionSequencingInput,
  candidateNeedFromSessionNeed,
  composeSessionSkeleton,
  deriveCanonicalCompositionFacts,
  evaluatePostPrescriptionDuration,
  compareSessionEvaluations,
  exerciseSelectionNeedFromCandidateNeed,
  searchSessionSkeleton,
  validateSessionCandidateResults,
  validateSessionIntent,
  type CandidateRankingResult,
  type SessionIntent,
  type SessionNeed,
} from "../../src";
import {
  BICEPS_NEED,
  BRACING_NEED,
  CARRY_NEED,
  DIRECT_CHEST_NEED,
  FIXED_SHELL_PRODUCTION_USERS,
  HINGE_NEED,
  PRODUCTION_CATALOG_ROWS,
  PULL_NEED,
  PUSH_NEED,
  SESSION_COMPOSER_PRODUCTION_FINGERPRINT_NAMES,
  SQUAT_NEED,
  TRICEPS_NEED,
  buildProductionCalibrationCases,
  buildControlledProductionScenarios,
  buildProductionComposerFingerprints,
  buildResults,
  compactFixture,
  compareBoundedToExhaustive,
  composeCompact,
  productionIntent,
  selection,
  sessionNeed,
  trimResults,
  withReadiness,
} from "../helpers/sessionComposerProduction";

function signature(result: ReturnType<typeof composeSessionSkeleton>) {
  return {
    compositionStatus: result.compositionStatus,
    executionReadiness: result.executionReadiness,
    assignments: result.assignments.map((assignment) => ({
      exerciseId: assignment.exerciseId,
      section: assignment.section,
      role: assignment.role,
      needs: assignment.satisfiedNeedIds,
    })),
  };
}

function composeFixture(
  intent: SessionIntent,
  candidates: Readonly<Record<string, readonly string[]>>,
) {
  const results = trimResults(buildResults(intent), candidates);
  return { results, skeleton: composeSessionSkeleton({ intent, candidateResultsByNeed: results }) };
}

function cycleNeed(need: SessionNeed, targetNeedId: string): SessionNeed {
  return {
    ...need,
    dependencies: [{
      dependencyId: `${need.id}-to-${targetNeedId}`,
      targetNeedIds: [targetNeedId],
      targetExerciseIds: [],
      movementRoles: [],
      actionFunctions: [],
      bodyRegions: [],
      assessmentSignalIds: [],
      requiredRangeIds: [],
      painResponseRequirementIds: [],
      required: true,
    }],
  };
}

describe("production Session Composer kernel", () => {
  it("uses one canonical ExerciseSelectionNeed and a deterministic legacy adapter", () => {
    const candidateNeed = candidateNeedFromSessionNeed(PUSH_NEED, "strength");
    expect(exerciseSelectionNeedFromCandidateNeed(candidateNeed)).toEqual(PUSH_NEED.selection);
    expect(PUSH_NEED.selection).not.toHaveProperty("goal");
    expect(PUSH_NEED.selection).not.toHaveProperty("requestedSection");
    expect(PUSH_NEED.selection).not.toHaveProperty("whyNeeded");
  });

  it("makes needs-first SessionIntent authoritative and validates Planner ordinals", () => {
    const intent = productionIntent();
    expect(intent).not.toHaveProperty("slots");
    expect(intent).not.toHaveProperty("priorityMuscles");
    expect(validateSessionIntent(intent)).toEqual([]);
    const duplicateOrder = productionIntent({ needs: [PUSH_NEED, { ...PULL_NEED, priorityOrder: 0 }] });
    expect(validateSessionIntent(duplicateOrder)).toContain("duplicate_priority_order:required:0");
  });

  it("builds one immutable Candidate Intelligence result per need", () => {
    const intent = productionIntent();
    const results = buildResults(intent);
    expect(Object.keys(results).sort()).toEqual(["main-pull", "main-push"]);
    expect(Object.isFrozen(results)).toBe(true);
    expect(results["main-push"].request.need.requestedSection).toBe("main");
    expect(results["main-push"].request.goal).toBe(intent.primaryGoal);
  });

  it("hard-rejects stale, mismatched, and cross-athlete candidate result sets", () => {
    const fixture = compactFixture();
    const push = fixture.results["main-push"];
    const crossAthlete: CandidateRankingResult = {
      ...push,
      request: { ...push.request, athlete: { ...push.request.athlete, id: "other-athlete" } },
    };
    const invalid = { ...fixture.results, "main-push": crossAthlete };
    expect(validateSessionCandidateResults(fixture.intent, invalid).errorCodes).toContain(
      "candidate_athlete_mismatch:main-push",
    );
    expect(() => composeSessionSkeleton({
      intent: fixture.intent,
      candidateResultsByNeed: invalid,
    })).toThrow(/Invalid Session Composer input/);
  });

  it("accepts candidate and catalog ordering permutations but not catalog membership changes", () => {
    const fixture = compactFixture();
    const permuted = Object.fromEntries(Object.entries(fixture.results).reverse().map(([needId, result]) => [
      needId,
      {
        ...result,
        request: { ...result.request, candidatePool: [...result.request.candidatePool].reverse() },
        rankedCandidates: [...result.rankedCandidates].reverse(),
      },
    ]));
    expect(validateSessionCandidateResults(fixture.intent, permuted).valid).toBe(true);
    expect(signature(composeSessionSkeleton({ intent: fixture.intent, candidateResultsByNeed: permuted }))).toEqual(
      signature(composeSessionSkeleton({ intent: fixture.intent, candidateResultsByNeed: fixture.results })),
    );
    const missingCatalogRow = {
      ...fixture.results,
      "main-push": {
        ...fixture.results["main-push"],
        request: {
          ...fixture.results["main-push"].request,
          candidatePool: fixture.results["main-push"].request.candidatePool.slice(1),
        },
      },
    };
    expect(validateSessionCandidateResults(fixture.intent, missingCatalogRow).valid).toBe(false);
  });

  it("derives canonical composition facts instead of accepting hand-authored facts", () => {
    const fixture = compactFixture();
    const facts = deriveCanonicalCompositionFacts({
      candidateResultsByNeed: fixture.results,
      continuity: fixture.intent.continuityEvidence,
    });
    const bench = facts.get("dumbbell-bench-press")!;
    const canonical = REFERENCE_EXERCISES.find((entry) => entry.id === bench.exerciseId)!;
    expect(bench.movementRoles).toEqual([...canonical.movementRoles].sort());
    expect(bench.primaryMuscles).toEqual([...canonical.primaryMuscles].sort());
  });

  it("shares Bench Press across compatible main push and primary-chest needs once", () => {
    const intent = productionIntent({ needs: [PUSH_NEED, PULL_NEED, DIRECT_CHEST_NEED] });
    const { skeleton } = composeFixture(intent, {
      "main-push": ["dumbbell-bench-press"],
      "main-pull": ["machine-row"],
      "direct-chest": ["dumbbell-bench-press"],
    });
    const bench = skeleton.assignments.find((entry) => entry.exerciseId === "dumbbell-bench-press")!;
    expect(bench.satisfiedNeedIds).toEqual(["direct-chest", "main-push"]);
    expect(bench.section).toBe("main");
    expect(bench.role).toBe("primary_strength");
    expect(bench.futureSourceExposureCount).toBe(1);
    expect(skeleton.assignments.filter((entry) => entry.exerciseId === bench.exerciseId)).toHaveLength(1);
  });

  it("does not merge one identity across incompatible section or role ownership", () => {
    const accessoryChest = sessionNeed({
      id: "accessory-chest",
      section: "accessory",
      priority: "preferred",
      priorityOrder: 0,
      selection: selection({
        requestedRole: "secondary_strength",
        targetMuscles: ["chest"],
      }),
    });
    const intent = productionIntent({ needs: [PUSH_NEED, accessoryChest] });
    const { skeleton } = composeFixture(intent, {
      "main-push": ["dumbbell-bench-press"],
      "accessory-chest": ["dumbbell-bench-press"],
    });
    expect(skeleton.assignments).toHaveLength(1);
    expect(skeleton.assignments[0].satisfiedNeedIds).toEqual(["main-push"]);
    expect(skeleton.needSatisfaction.find((entry) => entry.needId === "accessory-chest")?.covered).toBe(false);
  });

  it("shares Suitcase Carry across carry and loaded-bracing needs once", () => {
    const intent = productionIntent({ needs: [PUSH_NEED, CARRY_NEED, BRACING_NEED] });
    const { skeleton } = composeFixture(intent, {
      "main-push": ["machine-chest-press"],
      carry: ["suitcase-carry"],
      "loaded-bracing": ["suitcase-carry"],
    });
    const carry = skeleton.assignments.find((entry) => entry.exerciseId === "suitcase-carry")!;
    expect(carry.satisfiedNeedIds).toEqual(["carry", "loaded-bracing"]);
    expect(carry.futureSourceExposureCount).toBe(1);
  });

  it("emits every semantic section while keeping unneeded sections empty", () => {
    const skeleton = composeCompact();
    expect(skeleton.sections.map((entry) => entry.section)).toEqual(SESSION_SECTIONS);
    expect(skeleton.sections.filter((entry) => entry.assignmentExerciseIds.length === 0)
      .every((entry) => entry.emptyReasonCode !== null)).toBe(true);
    expect(skeleton.assignments.every((entry) => entry.section === "main")).toBe(true);
  });

  it("raw availableMinutes never changes identity admission for the same structured intent", () => {
    const low = compactFixture({ intent: productionIntent({ availableMinutes: 20 }) });
    const high = compactFixture({ intent: productionIntent({ availableMinutes: 120 }) });
    expect(signature(composeSessionSkeleton({ intent: low.intent, candidateResultsByNeed: low.results }))).toEqual(
      signature(composeSessionSkeleton({ intent: high.intent, candidateResultsByNeed: high.results })),
    );
  });

  it("attributes lower-priority standalone admission to structural capacity and Planner input", () => {
    const candidates = {
      "main-push": ["machine-chest-press"],
      "main-pull": ["machine-row"],
      biceps: ["dumbbell-curl"],
    };
    const condensed = composeFixture(productionIntent({
      needs: [PUSH_NEED, PULL_NEED, BICEPS_NEED], capacity: "condensed",
    }), candidates).skeleton;
    const expanded = composeFixture(productionIntent({
      needs: [PUSH_NEED, PULL_NEED, BICEPS_NEED], capacity: "expanded",
    }), candidates).skeleton;
    expect(condensed.assignments.map((entry) => entry.exerciseId)).not.toContain("dumbbell-curl");
    expect(expanded.assignments.map((entry) => entry.exerciseId)).toContain("dumbbell-curl");
  });

  it("compares same-tier coverage in Planner order rather than by raw count", () => {
    const base = {
      candidateReviewBurden: 0,
      unjustifiedProductiveAnchorDisplacementCount: 0,
      dominantMainPurposeCovered: true,
      nonAnchorPrescriptionResolutionBurden: 0,
      redundancyConflictBurden: 0,
      fatigueStressConcentrationBurden: 0,
      optionalCoverageInPlannerOrder: [],
      selectedIdentityCount: 2,
      setupTransitionCount: 0,
      localCandidateRankVector: [1],
      canonicalIdentityTieBreak: "a",
    };
    const higherPriority = { ...base, preferredCoverageInPlannerOrder: [true, false, false] };
    const twoLowerPriorities = { ...base, preferredCoverageInPlannerOrder: [false, true, true] };
    expect(compareSessionEvaluations(higherPriority, twoLowerPriorities)).toBeLessThan(0);
  });

  it("preserves TrainingSafety authority without executable assignments", () => {
    const fixture = compactFixture();
    const blocked = Object.fromEntries(Object.entries(fixture.results).map(([id, result]) => [id, {
      ...result,
      trainingReadiness: {
        ...result.trainingReadiness,
        status: "REVIEW_REQUIRED_BEFORE_ORDINARY_TRAINING" as const,
        downstreamTrainingAllowed: false,
        reviewRequiredFirst: true,
        unresolvedSignalIds: ["review-first"],
      },
    }]));
    const skeleton = composeSessionSkeleton({ intent: fixture.intent, candidateResultsByNeed: blocked });
    expect(skeleton.compositionStatus).toBe("blocked_by_training_readiness");
    expect(skeleton.assignments).toEqual([]);
    expect(skeleton.infeasibility?.safetyBlockerSignalIds).toEqual(["review-first"]);
  });

  it.each(["URGENT_EXTERNAL_REVIEW", "REQUIRES_SESSION_ROLE_SUBSTITUTION"] as const)(
    "%s is unselectable and proves a thin required pool infeasible",
    (readiness) => {
      const fixture = compactFixture({
        candidates: { "main-push": ["dumbbell-bench-press"], "main-pull": ["machine-row"] },
      });
      const changed = withReadiness({
        results: fixture.results,
        needId: "main-push",
        exerciseId: "dumbbell-bench-press",
        readiness,
      });
      const skeleton = composeSessionSkeleton({ intent: fixture.intent, candidateResultsByNeed: changed });
      expect(skeleton.compositionStatus).toBe("infeasible");
      expect(skeleton.assignments).toEqual([]);
    },
  );

  it("prefers an equivalent executable candidate over candidate-review burden", () => {
    const fixture = compactFixture();
    const changed = withReadiness({
      results: fixture.results,
      needId: "main-push",
      exerciseId: "dumbbell-bench-press",
      readiness: "REQUIRES_CANDIDATE_REVIEW",
    });
    const skeleton = composeSessionSkeleton({ intent: fixture.intent, candidateResultsByNeed: changed });
    expect(skeleton.assignments.map((entry) => entry.exerciseId)).toContain("machine-chest-press");
    expect(skeleton.executionReadiness).toBe("executable_at_session_scope");
  });

  it("retains unique required candidate-review coverage provisionally with fallback visibility", () => {
    const fixture = compactFixture({
      candidates: { "main-push": ["dumbbell-bench-press"], "main-pull": ["machine-row"] },
    });
    const changed = withReadiness({
      results: fixture.results,
      needId: "main-push",
      exerciseId: "dumbbell-bench-press",
      readiness: "REQUIRES_CANDIDATE_REVIEW",
    });
    const withFallback = {
      ...changed,
      "main-push": {
        ...changed["main-push"],
        painExecutionReadiness: {
          ...changed["main-push"].painExecutionReadiness,
          bestExecutableCandidateId: "machine-chest-press",
        },
      },
    };
    const skeleton = composeSessionSkeleton({ intent: fixture.intent, candidateResultsByNeed: withFallback });
    expect(skeleton.compositionStatus).toBe("valid");
    expect(skeleton.executionReadiness).toBe("candidate_review_required");
    const bench = skeleton.assignments.find((entry) => entry.exerciseId === "dumbbell-bench-press")!;
    expect(bench.unresolvedCandidateReviewIds).not.toEqual([]);
    expect(bench.bestExecutableFallbackExerciseId).toBe("machine-chest-press");
  });

  it("keeps a productive anchor provisional under unresolved candidate review", () => {
    const intent = productionIntent({ continuity: { identities: [{
      exerciseId: "dumbbell-bench-press",
      previouslyServedNeedIds: ["main-push"],
      responseReceiverTraceRefs: ["response:bench-review"],
      observationalClassification: "anchor",
      productive: true,
      plateaued: false,
      failedProgression: false,
      equipmentLost: false,
      explicitlyBlocked: false,
      repeatedAdverseEvidence: false,
    }] } });
    const fixture = compactFixture({
      intent,
      candidates: { "main-push": ["dumbbell-bench-press"], "main-pull": ["machine-row"] },
    });
    const changed = withReadiness({
      results: fixture.results,
      needId: "main-push",
      exerciseId: "dumbbell-bench-press",
      readiness: "REQUIRES_CANDIDATE_REVIEW",
    });
    const skeleton = composeSessionSkeleton({ intent, candidateResultsByNeed: changed });
    expect(skeleton.executionReadiness).toBe("candidate_review_required");
    expect(skeleton.assignments.find((entry) => entry.exerciseId === "dumbbell-bench-press")
      ?.continuityClassification).toBe("anchor");
  });

  it("omits review-only preferred standalone work", () => {
    const intent = productionIntent({ needs: [PUSH_NEED, TRICEPS_NEED] });
    const fixture = composeFixture(intent, {
      "main-push": ["machine-chest-press"], triceps: ["cable-triceps-pressdown"],
    });
    const changed = withReadiness({
      results: fixture.results,
      needId: "triceps",
      exerciseId: "cable-triceps-pressdown",
      readiness: "REQUIRES_CANDIDATE_REVIEW",
    });
    const skeleton = composeSessionSkeleton({ intent, candidateResultsByNeed: changed });
    expect(skeleton.assignments.map((entry) => entry.exerciseId)).not.toContain("cable-triceps-pressdown");
    expect(skeleton.trace.omittedNeedReasonCodes.triceps).toBeTruthy();
  });

  it("retains a productive prescription-required anchor before replacement", () => {
    const intent = productionIntent({ continuity: { identities: [{
      exerciseId: "dumbbell-bench-press",
      previouslyServedNeedIds: ["main-push"],
      responseReceiverTraceRefs: ["response:bench"],
      observationalClassification: "anchor",
      productive: true,
      plateaued: false,
      failedProgression: false,
      equipmentLost: false,
      explicitlyBlocked: false,
      repeatedAdverseEvidence: false,
    }] } });
    const fixture = compactFixture({ intent });
    const changed = withReadiness({
      results: fixture.results,
      needId: "main-push",
      exerciseId: "dumbbell-bench-press",
      readiness: "REQUIRES_PRESCRIPTION",
    });
    const skeleton = composeSessionSkeleton({ intent, candidateResultsByNeed: changed });
    const bench = skeleton.assignments.find((entry) => entry.exerciseId === "dumbbell-bench-press")!;
    expect(bench).toBeTruthy();
    expect(bench.executionBlockingPrescriptionRequirementIds).not.toEqual([]);
    expect(skeleton.executionReadiness).toBe("prescription_resolution_required");
    const handoff = buildSessionPrescriptionHandoff({
      intent,
      skeleton,
      candidateResultsByNeed: changed,
    });
    const benchHandoff = handoff.assignments.find((entry) =>
      entry.exerciseId === "dumbbell-bench-press",
    )!;
    expect(benchHandoff.knownRequirements.rangeRequirementIds).toEqual(
      bench.executionBlockingPrescriptionRequirementIds,
    );
    expect(benchHandoff.knownRequirements.loadRequirementIds).toEqual([]);
    expect(benchHandoff).not.toHaveProperty("selectedModificationAxis");
  });

  it("prefers an equivalent executable candidate for a new non-anchor prescription burden", () => {
    const fixture = compactFixture();
    const changed = withReadiness({
      results: fixture.results,
      needId: "main-push",
      exerciseId: "dumbbell-bench-press",
      readiness: "REQUIRES_PRESCRIPTION",
    });
    const skeleton = composeSessionSkeleton({ intent: fixture.intent, candidateResultsByNeed: changed });
    expect(skeleton.assignments.map((entry) => entry.exerciseId)).toContain("machine-chest-press");
    expect(skeleton.executionReadiness).toBe("executable_at_session_scope");
  });

  it("does not add standalone optional work that creates prescription burden", () => {
    const intent = productionIntent({
      needs: [PUSH_NEED, BICEPS_NEED],
      capacity: "expanded",
    });
    const fixture = composeFixture(intent, {
      "main-push": ["machine-chest-press"], biceps: ["dumbbell-curl"],
    });
    const changed = withReadiness({
      results: fixture.results,
      needId: "biceps",
      exerciseId: "dumbbell-curl",
      readiness: "REQUIRES_PRESCRIPTION",
    });
    const skeleton = composeSessionSkeleton({ intent, candidateResultsByNeed: changed });
    expect(skeleton.assignments.map((entry) => entry.exerciseId)).not.toContain("dumbbell-curl");
    expect(skeleton.executionReadiness).toBe("executable_at_session_scope");
  });

  it("preserves multiple productive anchors independently", () => {
    const identity = (exerciseId: string, needId: string) => ({
      exerciseId,
      previouslyServedNeedIds: [needId],
      responseReceiverTraceRefs: [`response:${exerciseId}`],
      observationalClassification: "anchor" as const,
      productive: true,
      plateaued: false,
      failedProgression: false,
      equipmentLost: false,
      explicitlyBlocked: false,
      repeatedAdverseEvidence: false,
    });
    const intent = productionIntent({ continuity: { identities: [
      identity("machine-chest-press", "main-push"),
      identity("machine-row", "main-pull"),
    ] } });
    const { skeleton } = composeFixture(intent, {
      "main-push": ["dumbbell-bench-press", "machine-chest-press"],
      "main-pull": ["chest-supported-dumbbell-row", "machine-row"],
    });
    expect(skeleton.assignments.map((entry) => entry.exerciseId).sort()).toEqual([
      "machine-chest-press", "machine-row",
    ]);
    expect(skeleton.evaluation?.unjustifiedProductiveAnchorDisplacementCount).toBe(0);
  });

  it("preserves productive lower-body anchors and stable supporting continuity independently", () => {
    const identity = (
      exerciseId: string,
      needId: string,
      observationalClassification: "anchor" | "stable_supporting",
    ) => ({
      exerciseId,
      previouslyServedNeedIds: [needId],
      responseReceiverTraceRefs: [`response:${exerciseId}`],
      observationalClassification,
      productive: true,
      plateaued: false,
      failedProgression: false,
      equipmentLost: false,
      explicitlyBlocked: false,
      repeatedAdverseEvidence: false,
    });
    const intent = productionIntent({
      needs: [SQUAT_NEED, HINGE_NEED, BICEPS_NEED],
      capacity: "expanded",
      continuity: { identities: [
        identity("goblet-squat", "main-squat", "anchor"),
        identity("dumbbell-romanian-deadlift", "main-hinge", "anchor"),
        identity("dumbbell-curl", "biceps", "stable_supporting"),
      ] },
    });
    const { skeleton } = composeFixture(intent, {
      "main-squat": ["goblet-squat", "leg-press"],
      "main-hinge": ["dumbbell-romanian-deadlift", "cable-pull-through"],
      biceps: ["dumbbell-curl"],
    });
    expect(skeleton.assignments.map((entry) => [entry.exerciseId, entry.continuityClassification])).toEqual([
      ["dumbbell-curl", "stable_supporting"],
      ["dumbbell-romanian-deadlift", "anchor"],
      ["goblet-squat", "anchor"],
    ]);
    expect(skeleton.evaluation?.unjustifiedProductiveAnchorDisplacementCount).toBe(0);
  });

  it("omits a redundant optional standalone identity before rewarding optional coverage", () => {
    const duplicatePush = sessionNeed({
      id: "optional-push-volume",
      section: "accessory",
      priority: "optional",
      priorityOrder: 0,
      selection: selection({
        requestedRole: "secondary_strength",
        targetMovementRoles: ["horizontal_push"],
        targetMuscles: ["chest"],
      }),
    });
    const intent = productionIntent({ needs: [PUSH_NEED, duplicatePush], capacity: "expanded" });
    const { skeleton } = composeFixture(intent, {
      "main-push": ["dumbbell-bench-press"],
      "optional-push-volume": ["machine-chest-press"],
    });
    expect(skeleton.assignments.map((entry) => entry.exerciseId)).toEqual(["dumbbell-bench-press"]);
    expect(skeleton.trace.omittedNeedReasonCodes["optional-push-volume"]).toBeTruthy();
  });

  it("allows changed need, equipment loss, and explicit block to justify anchor non-retention", () => {
    const intent = productionIntent({ continuity: { identities: [{
      exerciseId: "machine-chest-press",
      previouslyServedNeedIds: ["retired-push-need"],
      responseReceiverTraceRefs: ["response:retired"],
      observationalClassification: "anchor",
      productive: true,
      plateaued: false,
      failedProgression: false,
      equipmentLost: true,
      explicitlyBlocked: true,
      repeatedAdverseEvidence: false,
    }] } });
    const { skeleton } = composeFixture(intent, {
      "main-push": ["dumbbell-bench-press"], "main-pull": ["machine-row"],
    });
    expect(skeleton.assignments.map((entry) => entry.exerciseId)).not.toContain("machine-chest-press");
    expect(skeleton.evaluation?.unjustifiedProductiveAnchorDisplacementCount).toBe(0);
  });

  it("proves required need and dependency omission infeasible", () => {
    const requiredGap = compactFixture({
      candidates: { "main-push": [], "main-pull": ["machine-row"] },
    });
    expect(composeSessionSkeleton({
      intent: requiredGap.intent,
      candidateResultsByNeed: requiredGap.results,
    }).compositionStatus).toBe("infeasible");

    const preparation = sessionNeed({
      id: "press-preparation",
      section: "activation",
      priority: "preferred",
      priorityOrder: 0,
      selection: selection({
        requestedRole: "activation",
        targetMovementRoles: ["scapular_control"],
        targetMuscles: ["serratus"],
      }),
      dependencies: [{
        dependencyId: "prepare-main-push",
        targetNeedIds: ["main-push"],
        targetExerciseIds: [], movementRoles: ["horizontal_push"], actionFunctions: [],
        bodyRegions: ["shoulder"], assessmentSignalIds: [], requiredRangeIds: [],
        painResponseRequirementIds: [], required: true,
      }],
    });
    const intent = productionIntent({ needs: [PUSH_NEED, preparation] });
    const fixture = composeFixture(intent, {
      "main-push": ["machine-chest-press"], "press-preparation": [],
    });
    expect(fixture.skeleton.compositionStatus).toBe("infeasible");
  });

  it("classifies dependency cycles as contradictory intent", () => {
    const push = cycleNeed(PUSH_NEED, "main-pull");
    const pull = cycleNeed(PULL_NEED, "main-push");
    const intent = productionIntent({ needs: [push, pull] });
    const fixture = composeFixture(intent, {
      "main-push": ["machine-chest-press"], "main-pull": ["machine-row"],
    });
    expect(fixture.skeleton.compositionStatus).toBe("infeasible");
    expect(fixture.skeleton.infeasibility?.contradictoryIntent).toBe(true);
  });

  it("keeps routine Prescription handoff distinct from blocking resolution", () => {
    const fixture = compactFixture();
    const skeleton = composeSessionSkeleton({ intent: fixture.intent, candidateResultsByNeed: fixture.results });
    expect(skeleton.executionReadiness).toBe("executable_at_session_scope");
    expect(skeleton.assignments.every((entry) => entry.routinePrescriptionHandoffId.length > 0)).toBe(true);
    const handoff = buildSessionPrescriptionHandoff({
      intent: fixture.intent,
      skeleton,
      candidateResultsByNeed: fixture.results,
    });
    expect(handoff.assignments).toHaveLength(skeleton.assignments.length);
    expect(handoff.assignments.every((entry) => entry.sourceExposureEventExpected)).toBe(true);
  });

  it("evaluates duration only from explicit post-prescription facts", () => {
    expect(evaluatePostPrescriptionDuration({
      availableMinutes: 30,
      expectedExerciseIds: ["a", "b"],
      durationFacts: [{ exerciseId: "a", prescribedExerciseSeconds: 300, explicitRestSeconds: 60, explicitSetupTransitionSeconds: 10 }],
    }).status).toBe("unknown_or_incomplete");
    expect(evaluatePostPrescriptionDuration({
      availableMinutes: 10,
      expectedExerciseIds: ["a"],
      durationFacts: [{ exerciseId: "a", prescribedExerciseSeconds: 600, explicitRestSeconds: 60, explicitSetupTransitionSeconds: 0 }],
    }).status).toBe("over_budget");
  });

  it("emits an acyclic Sequencing handoff without claiming final order", () => {
    const fixture = compactFixture();
    const skeleton = composeSessionSkeleton({ intent: fixture.intent, candidateResultsByNeed: fixture.results });
    const handoff = buildSessionSequencingInput(skeleton);
    expect(handoff.fixedSectionPrecedence).toEqual(SESSION_SECTIONS);
    expect(handoff.graphAcyclic).toBe(true);
    expect(handoff).not.toHaveProperty("finalWithinSectionOrder");
  });

  it("matches the exhaustive oracle across every tractable calibration case", () => {
    const cases = buildProductionCalibrationCases();
    expect(cases.length).toBeGreaterThanOrEqual(6);
    for (const caseItem of cases) {
      const comparison = compareBoundedToExhaustive(caseItem);
      expect(comparison.equivalent, caseItem.id).toBe(true);
    }
  });

  it("returns search_inconclusive rather than infeasible on bounded exhaustion", () => {
    const fixture = compactFixture();
    const skeleton = composeSessionSkeleton({
      intent: fixture.intent,
      candidateResultsByNeed: fixture.results,
      searchPolicy: {
        exactExpandedStateBudget: 0,
        boundedExpandedStateBudget: 1,
        retainedParetoFrontierPerLayer: 1,
      },
    });
    expect(skeleton.compositionStatus).toBe("search_inconclusive");
    expect(skeleton.search.completeness).toBe("search_inconclusive_no_complete_skeleton");
    expect(skeleton.infeasibility).toBeNull();
  });

  it("returns a bounded valid skeleton without claiming optimality when the frontier truncates", () => {
    const fixture = compactFixture();
    const skeleton = composeSessionSkeleton({
      intent: fixture.intent,
      candidateResultsByNeed: fixture.results,
      searchPolicy: {
        exactExpandedStateBudget: 0,
        boundedExpandedStateBudget: 100,
        retainedParetoFrontierPerLayer: 1,
      },
    });
    expect(skeleton.compositionStatus).toBe("valid");
    expect(skeleton.search.completeness).toBe("bounded_optimality_not_proven");
    expect(skeleton.search.optimalityProven).toBe(false);
  });

  it("is inert to reason prose mutations", () => {
    const changedIntent = productionIntent({ needs: [
      { ...PUSH_NEED, explanation: "Completely different trace prose." },
      { ...PULL_NEED, explanation: "More changed non-executable words." },
    ] });
    const baseline = compactFixture();
    const changed = compactFixture({ intent: changedIntent });
    expect(signature(composeSessionSkeleton({ intent: baseline.intent, candidateResultsByNeed: baseline.results }))).toEqual(
      signature(composeSessionSkeleton({ intent: changed.intent, candidateResultsByNeed: changed.results })),
    );
  });

  it("passes a deterministic 10,000-case search/metamorphic matrix", () => {
    const fixture = compactFixture();
    const facts = deriveCanonicalCompositionFacts({
      candidateResultsByNeed: fixture.results,
      continuity: fixture.intent.continuityEvidence,
    });
    const expected = searchSessionSkeleton({
      intent: fixture.intent,
      candidateResultsByNeed: fixture.results,
      facts,
      forceMode: "exhaustive",
    }).bestState;
    const expectedSignature = JSON.stringify(expected);
    for (let index = 0; index < 10_000; index += 1) {
      const intent = {
        ...fixture.intent,
        availableMinutes: 15 + (index % 120),
        needs: index % 2 === 0 ? fixture.intent.needs : [...fixture.intent.needs].reverse(),
      };
      const results = Object.fromEntries(Object.entries(fixture.results)
        .reverse()
        .map(([needId, result]) => [needId, {
          ...result,
          rankedCandidates: index % 3 === 0
            ? [...result.rankedCandidates].reverse()
            : result.rankedCandidates,
        }]));
      const exhaustive = searchSessionSkeleton({
        intent,
        candidateResultsByNeed: results,
        facts,
        forceMode: "exhaustive",
      });
      const bounded = searchSessionSkeleton({
        intent,
        candidateResultsByNeed: results,
        facts,
        policy: {
          exactExpandedStateBudget: 0,
          boundedExpandedStateBudget: 100,
          retainedParetoFrontierPerLayer: 16,
        },
        forceMode: "bounded",
      });
      expect(JSON.stringify(exhaustive.bestState)).toBe(expectedSignature);
      expect(JSON.stringify(bounded.bestState)).toBe(expectedSignature);
    }
  }, 30_000);

  it("preserves the 45-row catalog and creates all 22 production fingerprints", () => {
    expect(PRODUCTION_CATALOG_ROWS).toBe(45);
    expect(createHash("sha256").update(JSON.stringify(REFERENCE_EXERCISES)).digest("hex")).toBe(
      "bfb21d7dc91504de5da8f4cd92850c8bb97ca5a0ce5f65624d2db4971d5e1a91",
    );
    const fingerprints = buildProductionComposerFingerprints();
    expect(Object.keys(fingerprints)).toEqual(SESSION_COMPOSER_PRODUCTION_FINGERPRINT_NAMES);
    expect(Object.values(fingerprints).every((value) => /^[a-f0-9]{64}$/.test(value))).toBe(true);
  });

  it("covers all sixteen named controlled production scenarios", () => {
    const controlled = buildControlledProductionScenarios();
    expect(controlled.map((entry) => entry.id)).toEqual([
      "full-gym-upper-strength",
      "full-gym-upper-hypertrophy",
      "lower-strength",
      "full-body-general-fitness",
      "posture-movement-quality",
      "shoulder-discomfort",
      "low-back-sensitivity",
      "knee-discomfort",
      "grip-sensitive-user",
      "productive-continuity",
      "adverse-response",
      "time-constrained",
      "home-equipment",
      "p0-direct-need",
      "training-safety-blocked",
      "no-cooldown-need",
    ]);
    for (const scenario of controlled) {
      const skeleton = composeSessionSkeleton({
        intent: scenario.intent,
        candidateResultsByNeed: scenario.results,
      });
      expect(skeleton.compositionStatus, scenario.id).toBe(scenario.expectedCompositionStatus);
    }
  });

  it("preserves the eleven-user fixed-shell classification matrix", () => {
    expect(FIXED_SHELL_PRODUCTION_USERS).toHaveLength(11);
    expect(FIXED_SHELL_PRODUCTION_USERS.filter((entry) =>
      entry.classification === "MATERIAL_SESSION_DIFFERENCE")).toHaveLength(3);
    expect(FIXED_SHELL_PRODUCTION_USERS.filter((entry) =>
      entry.classification === "MATERIAL_NEED_DIFFERENCE_SAME_ANCHOR")).toHaveLength(3);
    expect(FIXED_SHELL_PRODUCTION_USERS.filter((entry) =>
      entry.classification === "JUSTIFIED_CONVERGENCE")).toHaveLength(2);
    expect(FIXED_SHELL_PRODUCTION_USERS.filter((entry) =>
      entry.classification === "PRESCRIPTION_DIFFERENCE_REQUIRED")).toHaveLength(3);
  });

  it("does not manufacture warmup, activation, accessory, cooldown, core, carry, or P0 work", () => {
    const skeleton = composeCompact();
    expect(skeleton.assignments).toHaveLength(2);
    expect(skeleton.assignments.every((entry) => entry.section === "main")).toBe(true);
    expect(skeleton.assignments.some((entry) => [
      "suitcase-carry", "standing-calf-raise", "ninety-ninety-breathing",
    ].includes(entry.exerciseId))).toBe(false);
  });

  it("does not manufacture exercise needs from assessment or pain signals", () => {
    const signaledRequest = CONTROLLED_CANDIDATE_SCENARIOS.find((entry) =>
      entry.id === "horizontal-push-shoulder-discomfort",
    )!.request;
    const intent = productionIntent({ contextRequest: signaledRequest });
    const skeleton = composeSessionSkeleton({
      intent,
      candidateResultsByNeed: buildResults(intent, signaledRequest),
    });
    expect(skeleton.assignments.every((entry) => entry.section === "main")).toBe(true);
    expect(skeleton.sections.find((entry) => entry.section === "activation")?.assignmentExerciseIds).toEqual([]);
    expect(skeleton.sections.find((entry) => entry.section === "cooldown")?.assignmentExerciseIds).toEqual([]);
  });
});
