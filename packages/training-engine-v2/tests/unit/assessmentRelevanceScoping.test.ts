import { describe, expect, it } from "vitest";
import {
  calculateAssessmentRelevanceTraces,
  deriveAlignmentPriorities,
  getControlledCandidateScenario,
  REFERENCE_EXERCISES,
  runCandidateRankingLab,
  THREE_PHASE_FOUNDATION,
  type AssessmentSignal,
  type AssessmentState,
  type CandidateRequest,
  type RankedCandidate,
  type ScoreComponent,
} from "../../src";
import { candidateDemandForDimension } from "../../src/candidate/scoring/assessment/candidateDemand";
import { createPosturePhotoCandidateExperimentRequests } from "../fixtures/posture/postureCandidateExperimentFixture";

function exercise(id: string) {
  const found = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing exercise ${id}`);
  }

  return found;
}

function controlledRequest(id: string): CandidateRequest {
  const found = getControlledCandidateScenario(id);
  if (!found) {
    throw new Error(`Missing scenario ${id}`);
  }

  return found.request;
}

function withAssessment(request: CandidateRequest, assessment: AssessmentState): CandidateRequest {
  return {
    ...request,
    id: `${request.id}-assessment-override`,
    assessment,
    alignmentPriorities: deriveAlignmentPriorities(assessment).priorities,
  };
}

function ranked(resultExercise: readonly RankedCandidate[], exerciseId: string): RankedCandidate {
  const found = resultExercise.find((candidate) => candidate.exercise.id === exerciseId);
  if (!found) {
    throw new Error(`Missing ranked candidate ${exerciseId}`);
  }

  return found;
}

function component(candidate: RankedCandidate, id: string): ScoreComponent {
  const found = candidate.components.find((scoreComponent) => scoreComponent.id === id);
  if (!found) {
    throw new Error(`Missing ${id} for ${candidate.exercise.id}`);
  }

  return found;
}

function componentValue(candidate: RankedCandidate, id: string): number {
  return component(candidate, id).value;
}

function rejectedCodes(result: ReturnType<typeof runCandidateRankingLab>, exerciseId: string): readonly string[] {
  return (
    result.hardRejectedCandidates.find((candidate) => candidate.exercise.id === exerciseId)
      ?.eligibility.rejectionReasons.map((reason) => reason.code) ?? []
  );
}

const highConfidenceKneeAssessment: AssessmentState = {
  signals: [
    {
      id: "synthetic-high-knee-alignment",
      type: "control_finding",
      source: "movement_screen",
      confidence: "high",
      priority: "primary",
      region: "knee",
      movementRole: "squat",
      muscleGroup: "glutes",
      description: "High-confidence knee alignment finding.",
    },
  ],
  historicalWeaknesses: [],
};

function scapularAssessment(confidence: AssessmentSignal["confidence"]): AssessmentState {
  return {
    signals: [
      {
        id: `synthetic-${confidence}-scapular-control`,
        type: "control_finding",
        source: "movement_screen",
        confidence,
        priority: "primary",
        region: "shoulder",
        movementRole: "scapular_control",
        muscleGroup: "serratus",
        description: `${confidence} confidence scapular control finding.`,
      },
    ],
    historicalWeaknesses: [],
  };
}

const trunkControlAssessment: AssessmentState = {
  signals: [
    {
      id: "synthetic-trunk-control",
      type: "control_finding",
      source: "movement_screen",
      confidence: "high",
      priority: "primary",
      region: "lumbar_spine",
      movementRole: "anti_extension_core",
      muscleGroup: "trunk",
      description: "High-confidence trunk control finding.",
    },
  ],
  historicalWeaknesses: [],
};

function phase(id: "phase_1" | "phase_2" | "phase_3") {
  const found = THREE_PHASE_FOUNDATION.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing phase ${id}`);
  }

  return found;
}

function trunkActivationRequest(input: {
  readonly baseRequestId: string;
  readonly phaseId: "phase_1" | "phase_2" | "phase_3";
  readonly assessment?: AssessmentState;
}): CandidateRequest {
  const baseRequest = controlledRequest(input.baseRequestId);
  const assessment = input.assessment ?? trunkControlAssessment;

  return {
    ...baseRequest,
    id: `${input.baseRequestId}-trunk-activation-${input.phaseId}`,
    goal: "posture_and_movement_quality",
    phase: phase(input.phaseId),
    need: {
      id: "trunk-activation",
      whyNeeded: "Choose a trunk-control activation drill.",
      requestedRole: "activation",
      requestedSection: "activation",
      targetMovementRoles: ["anti_extension_core", "anti_rotation_core"],
      targetMuscles: ["trunk"],
      targetBodyRegions: ["lumbar_spine", "pelvis"],
      goal: "posture_and_movement_quality",
    },
    assessment,
    alignmentPriorities: deriveAlignmentPriorities(assessment).priorities,
    satisfiedPrerequisiteIds: [],
  };
}

describe("assessment relevance scoping", () => {
  it("keeps role and training-need truth ahead of assessment influence", () => {
    const [pushOff, pullOff, , squatOff] = createPosturePhotoCandidateExperimentRequests({
      assessmentEnabled: false,
    });
    const [pushOn, pullOn, , squatOn] = createPosturePhotoCandidateExperimentRequests({
      assessmentEnabled: true,
    });
    const push = runCandidateRankingLab(pushOn);
    const pull = runCandidateRankingLab(pullOn);
    const squat = runCandidateRankingLab(squatOn);

    expect(runCandidateRankingLab(pushOff).legalCandidateCount).toBe(push.legalCandidateCount);
    expect(runCandidateRankingLab(pullOff).legalCandidateCount).toBe(pull.legalCandidateCount);
    expect(push.rankedCandidates.map((candidate) => candidate.exercise.id)).toEqual([
      "dumbbell-bench-press",
      "push-up",
      "machine-chest-press",
    ]);
    expect(pull.rankedCandidates.map((candidate) => candidate.exercise.id)).toEqual([
      "machine-row",
      "seated-cable-row",
      "chest-supported-dumbbell-row",
      "one-arm-dumbbell-row",
    ]);
    expect(rejectedCodes(push, "goblet-squat")).toContain("TRAINING_NEED_MISMATCH");
    expect(rejectedCodes(push, "dumbbell-romanian-deadlift")).toContain("TRAINING_NEED_MISMATCH");
    expect(rejectedCodes(pull, "goblet-squat")).toContain("TRAINING_NEED_MISMATCH");
    expect(rejectedCodes(pull, "dumbbell-romanian-deadlift")).toContain("TRAINING_NEED_MISMATCH");
    expect(rejectedCodes(squat, "dumbbell-bench-press")).toContain("TRAINING_NEED_MISMATCH");
    expect(rejectedCodes(squat, "push-up")).toContain("TRAINING_NEED_MISMATCH");
    expect(runCandidateRankingLab(squatOff).rankedCandidates[0].exercise.id).toBe("goblet-squat");
    expect(squat.rankedCandidates[0].exercise.id).toBe("goblet-squat");
  });

  it("does not let activation or accessory suitability satisfy loaded main roles", () => {
    const primaryPull = runCandidateRankingLab(controlledRequest("horizontal-pull-gym-neutral"));
    const primaryPush = runCandidateRankingLab(controlledRequest("horizontal-push-phase-3"));

    expect(rejectedCodes(primaryPull, "band-face-pull")).toContain("ROLE_MISMATCH");
    expect(rejectedCodes(primaryPull, "band-face-pull")).toContain("TRAINING_NEED_MISMATCH");
    expect(rejectedCodes(primaryPush, "cable-chest-fly")).toContain("ROLE_MISMATCH");
    expect(rejectedCodes(primaryPush, "cable-chest-fly")).toContain("TRAINING_NEED_MISMATCH");
  });

  it("keeps irrelevant high-confidence regional findings neutral for unrelated roles", () => {
    const request = withAssessment(
      controlledRequest("horizontal-pull-gym-neutral"),
      highConfidenceKneeAssessment,
    );
    const result = runCandidateRankingLab(request);
    const machineRow = ranked(result.rankedCandidates, "machine-row");
    const assessmentFit = component(machineRow, "assessment_fit");
    const alignmentFit = component(machineRow, "alignment_fit");

    expect(result.rankedCandidates.map((candidate) => candidate.exercise.id)).not.toContain("goblet-squat");
    expect(result.rankedCandidates.map((candidate) => candidate.exercise.id)).not.toContain(
      "dumbbell-romanian-deadlift",
    );
    expect(assessmentFit.value).toBe(6);
    expect(alignmentFit.value).toBe(6);
    expect(assessmentFit.assessmentRelevance?.[0]).toEqual(
      expect.objectContaining({
        signalId: "synthetic-high-knee-alignment",
        candidateId: "machine-row",
        relevance: "none",
        relevanceReasonCode: "ASSESSMENT_NOT_RELEVANT",
        boundedInfluence: 0,
      }),
    );
  });

  it("keeps confidence scaling meaningful after relevance is established", () => {
    const baseRequest = controlledRequest("scapular-activation-high-confidence");
    const low = runCandidateRankingLab(withAssessment(baseRequest, scapularAssessment("low")));
    const medium = runCandidateRankingLab(withAssessment(baseRequest, scapularAssessment("medium")));
    const high = runCandidateRankingLab(withAssessment(baseRequest, scapularAssessment("high")));
    const lowWallSlide = ranked(low.rankedCandidates, "serratus-wall-slide");
    const mediumWallSlide = ranked(medium.rankedCandidates, "serratus-wall-slide");
    const highWallSlide = ranked(high.rankedCandidates, "serratus-wall-slide");

    expect(componentValue(lowWallSlide, "assessment_fit")).toBe(6);
    expect(componentValue(mediumWallSlide, "assessment_fit")).toBeGreaterThan(
      componentValue(lowWallSlide, "assessment_fit"),
    );
    expect(componentValue(highWallSlide, "assessment_fit")).toBeGreaterThan(
      componentValue(mediumWallSlide, "assessment_fit"),
    );
    expect(component(mediumWallSlide, "assessment_fit").assessmentRelevance?.[0]).toEqual(
      expect.objectContaining({
        relationship: "provides_appropriate_exposure",
        confidence: "medium",
      }),
    );
  });

  it("makes trunk relevance candidate-specific and requested-role dependent", () => {
    const pushRequest = withAssessment(controlledRequest("horizontal-push-phase-3"), trunkControlAssessment);
    const pullRequest = withAssessment(controlledRequest("horizontal-pull-gym-neutral"), trunkControlAssessment);
    const pushResult = runCandidateRankingLab(pushRequest);
    const pushUp = ranked(pushResult.rankedCandidates, "push-up");
    const machinePress = ranked(pushResult.rankedCandidates, "machine-chest-press");
    const pushUpInPush = calculateAssessmentRelevanceTraces({
      request: pushRequest,
      exercise: exercise("push-up"),
    })[0];
    const pushUpInPull = calculateAssessmentRelevanceTraces({
      request: pullRequest,
      exercise: exercise("push-up"),
    })[0];

    expect(componentValue(pushUp, "assessment_fit")).toBeLessThan(
      componentValue(machinePress, "assessment_fit"),
    );
    expect(pushUpInPush).toEqual(
      expect.objectContaining({
        relevance: "high",
        relationship: "under_challenges_development",
        relevanceReasonCode: "ASSESSMENT_UNDER_CHALLENGES_DEVELOPMENT",
      }),
    );
    expect(pushUpInPull).toEqual(
      expect.objectContaining({
        relevance: "none",
        relevanceReasonCode: "ASSESSMENT_NOT_RELEVANT",
        boundedInfluence: 0,
      }),
    );
  });

  it("splits one bounded assessment budget across assessmentFit and alignmentFit", () => {
    const [, , , , singleLegOn] = createPosturePhotoCandidateExperimentRequests({
      assessmentEnabled: true,
    });
    const result = runCandidateRankingLab(singleLegOn);
    const stepUp = ranked(result.rankedCandidates, "step-up");
    const assessmentFit = component(stepUp, "assessment_fit");
    const alignmentFit = component(stepUp, "alignment_fit");
    const traces = assessmentFit.assessmentRelevance ?? [];
    const positiveTraces = traces.filter((trace) => trace.boundedInfluence > 0);
    const totalBounded = positiveTraces.reduce((sum, trace) => sum + trace.boundedInfluence, 0);
    const totalComponentDelta = assessmentFit.value - 6 + alignmentFit.value - 6;

    expect(positiveTraces.length).toBeGreaterThan(0);
    positiveTraces.forEach((trace) => {
      expect(Number((trace.assessmentContribution + trace.alignmentContribution).toFixed(3))).toBe(
        trace.boundedInfluence,
      );
      expect(trace.contributesTo).toEqual(["assessment_fit", "alignment_fit"]);
    });
    expect(Number(totalComponentDelta.toFixed(3))).toBeLessThanOrEqual(totalBounded);
    expect(assessmentFit.value - 6).toBeLessThanOrEqual(1.2);
    expect(alignmentFit.value - 6).toBeLessThanOrEqual(0.8);
  });

  it("exposes raw values, normalized weights, and weighted contributions for score math", () => {
    const result = runCandidateRankingLab(controlledRequest("horizontal-pull-gym-neutral"));
    const top = result.rankedCandidates[0];
    const contributionSum = top.components.reduce(
      (sum, scoreComponent) => sum + scoreComponent.weightedContribution,
      0,
    );

    expect(top.score.aggregate.weightNormalization).toBe(
      "component_family_weight_divided_by_total_family_weight",
    );
    expect(top.components.every((scoreComponent) => scoreComponent.rawValue === scoreComponent.value)).toBe(
      true,
    );
    expect(top.components.every((scoreComponent) => scoreComponent.weight > 0)).toBe(true);
    expect(top.components.every((scoreComponent) => scoreComponent.unnormalizedWeight > 0)).toBe(true);
    expect(Number(contributionSum.toFixed(3))).toBe(top.total);
  });

  it("distinguishes scapular relationship instead of giving every scapular candidate the same boost", () => {
    const result = runCandidateRankingLab(controlledRequest("scapular-activation-high-confidence"));
    const wallSlideTrace = component(ranked(result.rankedCandidates, "serratus-wall-slide"), "assessment_fit")
      .assessmentRelevance?.[0];
    const facePullTrace = component(ranked(result.rankedCandidates, "band-face-pull"), "assessment_fit")
      .assessmentRelevance?.[0];
    const bandRowTrace = component(ranked(result.rankedCandidates, "band-row"), "assessment_fit")
      .assessmentRelevance?.[0];

    expect(wallSlideTrace).toEqual(
      expect.objectContaining({
        relevance: "high",
        relationship: "provides_appropriate_exposure",
      }),
    );
    expect(facePullTrace).toEqual(
      expect.objectContaining({
        relevance: "high",
        relationship: "exceeds_current_capability",
      }),
    );
    expect(bandRowTrace).toEqual(
      expect.objectContaining({
        relevance: "moderate",
        relationship: "provides_appropriate_exposure",
      }),
    );
    expect(wallSlideTrace?.assessmentContribution).toBeGreaterThan(
      bandRowTrace?.assessmentContribution ?? 0,
    );
    expect(facePullTrace?.assessmentContribution).toBeLessThan(0);
  });

  it("uses developmental context to compare trunk-control demand with current capability", () => {
    const early = runCandidateRankingLab(
      trunkActivationRequest({
        baseRequestId: "horizontal-push-phase-1",
        phaseId: "phase_1",
      }),
    );
    const later = runCandidateRankingLab(
      trunkActivationRequest({
        baseRequestId: "horizontal-push-phase-3",
        phaseId: "phase_3",
      }),
    );
    const earlyDeadBug = ranked(early.rankedCandidates, "dead-bug");
    const earlyPallof = ranked(early.rankedCandidates, "pallof-press");
    const laterDeadBug = ranked(later.rankedCandidates, "dead-bug");
    const laterPallof = ranked(later.rankedCandidates, "pallof-press");
    const earlyDeadBugTrace = component(earlyDeadBug, "assessment_fit").assessmentRelevance?.[0];
    const earlyPallofTrace = component(earlyPallof, "assessment_fit").assessmentRelevance?.[0];
    const laterDeadBugTrace = component(laterDeadBug, "assessment_fit").assessmentRelevance?.[0];
    const laterPallofTrace = component(laterPallof, "assessment_fit").assessmentRelevance?.[0];

    expect(earlyDeadBug.rank).toBeLessThan(earlyPallof.rank);
    expect(earlyDeadBugTrace?.relationship).toBe("provides_appropriate_exposure");
    expect(earlyPallofTrace?.relationship).toBe("exceeds_current_capability");
    expect(laterPallof.rank).toBeLessThan(laterDeadBug.rank);
    expect(laterPallofTrace?.relationship).toBe("provides_appropriate_exposure");
    expect(laterDeadBugTrace?.relationship).toBe("supports_control");
    expect(laterPallofTrace?.demandCapability.candidateDemand).toBeGreaterThan(
      laterDeadBugTrace?.demandCapability.candidateDemand ?? 0,
    );
  });

  it("keeps confidence separate from deficit magnitude in capability estimates", () => {
    const baseRequest = controlledRequest("scapular-activation-high-confidence");
    const low = runCandidateRankingLab(withAssessment(baseRequest, scapularAssessment("low")));
    const high = runCandidateRankingLab(withAssessment(baseRequest, scapularAssessment("high")));
    const lowTrace = component(ranked(low.rankedCandidates, "serratus-wall-slide"), "assessment_fit")
      .assessmentRelevance?.[0];
    const highTrace = component(ranked(high.rankedCandidates, "serratus-wall-slide"), "assessment_fit")
      .assessmentRelevance?.[0];

    expect(lowTrace?.signalInterpretation.confidence).toBe("low");
    expect(highTrace?.signalInterpretation.confidence).toBe("high");
    expect(lowTrace?.signalInterpretation.deficitMagnitude).toBe(
      highTrace?.signalInterpretation.deficitMagnitude,
    );
    expect(lowTrace?.demandCapability.currentCapability).toBe(
      highTrace?.demandCapability.currentCapability,
    );
    expect(Math.abs(highTrace?.boundedInfluence ?? 0)).toBeGreaterThan(
      Math.abs(lowTrace?.boundedInfluence ?? 0),
    );
  });

  it("exposes capability provenance without treating default estimates as measured capacity", () => {
    const result = runCandidateRankingLab(controlledRequest("scapular-activation-high-confidence"));
    const wallSlideTrace = component(ranked(result.rankedCandidates, "serratus-wall-slide"), "assessment_fit")
      .assessmentRelevance?.[0];

    expect(wallSlideTrace?.demandCapability.capabilityEstimate).toEqual(
      expect.objectContaining({
        estimateSource: "phase_default",
        evidenceQuality: "weak",
      }),
    );
    expect(wallSlideTrace?.demandCapability.capabilityEstimate.contributingSources).toContain(
      "phase_default",
    );
    expect(wallSlideTrace?.demandCapability.capabilityEstimate.evidence.join(" ")).toContain(
      "No direct observed capability measurement",
    );
  });

  it("limits exact demand-capability influence when capability evidence quality is weak", () => {
    const baseRequest = controlledRequest("scapular-activation-high-confidence");
    const defaultSeverity = runCandidateRankingLab(withAssessment(baseRequest, scapularAssessment("high")));
    const explicitSeverity = runCandidateRankingLab(
      withAssessment(baseRequest, {
        signals: [
          {
            ...scapularAssessment("high").signals[0],
            id: "synthetic-high-scapular-control-moderate-severity",
            severity: "moderate",
          },
        ],
        historicalWeaknesses: [],
      }),
    );
    const defaultTrace = component(
      ranked(defaultSeverity.rankedCandidates, "serratus-wall-slide"),
      "assessment_fit",
    ).assessmentRelevance?.[0];
    const explicitTrace = component(
      ranked(explicitSeverity.rankedCandidates, "serratus-wall-slide"),
      "assessment_fit",
    ).assessmentRelevance?.[0];

    expect(defaultTrace?.demandCapability.capabilityEstimate.evidenceQuality).toBe("weak");
    expect(explicitTrace?.demandCapability.capabilityEstimate.evidenceQuality).toBe("moderate");
    expect(defaultTrace?.boundedInfluence).toBeLessThan(explicitTrace?.boundedInfluence ?? 0);
  });

  it("uses explicit mechanics metadata instead of prose to determine support and demand", () => {
    const pallof = exercise("pallof-press");
    if (!pallof.mechanics) {
      throw new Error("Pallof press must have explicit mechanics for this test.");
    }

    const proseOnlyClone = {
      ...pallof,
      id: "prose-only-support-clone",
      summary: "Machine supported floor bench wall exercise text should not change demand.",
      mechanics: {
        ...pallof.mechanics,
        support: {
          externalSupport: "none" as const,
          bodySupport: "standing" as const,
          reviewStatus: "accepted" as const,
          notes: "Explicitly standing and unsupported despite prose.",
        },
      },
    };
    const originalDemand = candidateDemandForDimension({
      exercise: pallof,
      dimension: "trunk_control",
    });
    const cloneDemand = candidateDemandForDimension({
      exercise: proseOnlyClone,
      dimension: "trunk_control",
    });

    expect(cloneDemand.value).toBe(originalDemand.value);
    expect(cloneDemand.evidence.join(" ")).not.toContain("Machine supported floor bench wall");
  });

  it("exposes demand dimensions independently in traces", () => {
    const result = runCandidateRankingLab(controlledRequest("scapular-activation-high-confidence"));
    const wallSlideTrace = component(ranked(result.rankedCandidates, "serratus-wall-slide"), "assessment_fit")
      .assessmentRelevance?.[0];

    expect(wallSlideTrace?.demandCapability.dimension).toBe("scapular_control");
    expect(wallSlideTrace?.demandCapability.candidateDemandSource.level).toBe("moderate");
    expect(wallSlideTrace?.demandCapability.candidateDemandSource.source).toBe("exercise_definition");
    expect(wallSlideTrace?.demandCapability.candidateDemandSource.evidence.length).toBeGreaterThan(0);
  });

  it("keeps unknown exercise mechanics neutral and observable instead of treating them as easy", () => {
    const knownDeadBug = exercise("dead-bug");
    const unknownMechanicsClone = {
      ...knownDeadBug,
      id: "dead-bug-unknown-mechanics",
      name: "Dead Bug Unknown Mechanics",
      mechanics: undefined,
    };
    const request = {
      ...trunkActivationRequest({
        baseRequestId: "horizontal-push-phase-1",
        phaseId: "phase_1",
      }),
      candidatePool: [knownDeadBug, unknownMechanicsClone],
    };
    const result = runCandidateRankingLab(request);
    const known = ranked(result.rankedCandidates, "dead-bug");
    const unknown = ranked(result.rankedCandidates, "dead-bug-unknown-mechanics");
    const unknownTrace = component(unknown, "assessment_fit").assessmentRelevance?.[0];

    expect(unknownTrace?.demandCapability.candidateDemand).toBeNull();
    expect(unknownTrace?.demandCapability.candidateDemandSource).toEqual(
      expect.objectContaining({
        level: "unknown",
        value: null,
        source: "unknown",
        reviewStatus: "needs_review",
      }),
    );
    expect(unknownTrace?.demandCapability.match).toBe("not_applicable");
    expect(unknownTrace?.relationship).toBe("neutral");
    expect(unknownTrace?.boundedInfluence).toBe(0);
    expect(componentValue(known, "assessment_fit")).toBeGreaterThan(componentValue(unknown, "assessment_fit"));
    expect(known.rank).toBeLessThan(unknown.rank);
  });

  it("does not reward under-demanding healthy Phase 3 main work without a reduction reason", () => {
    const result = runCandidateRankingLab(
      withAssessment(controlledRequest("horizontal-push-phase-3"), trunkControlAssessment),
    );
    const pushUp = ranked(result.rankedCandidates, "push-up");
    const trace = component(pushUp, "assessment_fit").assessmentRelevance?.[0];

    expect(trace?.relationship).toBe("under_challenges_development");
    expect(trace?.assessmentContribution).toBeLessThan(0);
    expect(trace?.relevanceReasonCode).toBe("ASSESSMENT_UNDER_CHALLENGES_DEVELOPMENT");
  });

  it("can favor reduced demand when pain or regression context justifies it", () => {
    const result = runCandidateRankingLab(controlledRequest("horizontal-pull-low-back-discomfort"));
    const supported = ranked(result.rankedCandidates, "chest-supported-dumbbell-row");
    const unsupported = ranked(result.rankedCandidates, "one-arm-dumbbell-row");
    const supportedTrace = component(supported, "assessment_fit").assessmentRelevance?.[0];
    const unsupportedTrace = component(unsupported, "assessment_fit").assessmentRelevance?.[0];

    expect(supportedTrace?.relationship).toBe("reduces_excess_demand");
    expect(unsupportedTrace?.relationship).toBe("exceeds_current_capability");
    expect(supported.rank).toBeLessThan(unsupported.rank);
  });

  it("uses a legitimate trunk activation request for trunk-control contrast", () => {
    const result = runCandidateRankingLab(
      trunkActivationRequest({
        baseRequestId: "horizontal-push-phase-1",
        phaseId: "phase_1",
      }),
    );

    expect(result.rankedCandidates.map((candidate) => candidate.exercise.id)).toEqual([
      "dead-bug",
      "pallof-press",
    ]);
    expect(rejectedCodes(result, "band-face-pull")).toContain("TRAINING_NEED_MISMATCH");
    expect(rejectedCodes(result, "serratus-wall-slide")).toContain("TRAINING_NEED_MISMATCH");
    expect(rejectedCodes(result, "band-row")).toContain("TRAINING_NEED_MISMATCH");
  });

  it("keeps trunk signals neutral for irrelevant scapular activation candidates", () => {
    const result = runCandidateRankingLab(
      withAssessment(controlledRequest("scapular-activation-high-confidence"), trunkControlAssessment),
    );
    const facePull = ranked(result.rankedCandidates, "band-face-pull");
    const assessmentFit = component(facePull, "assessment_fit");
    const alignmentFit = component(facePull, "alignment_fit");

    expect(assessmentFit.value).toBe(6);
    expect(alignmentFit.value).toBe(6);
    expect(assessmentFit.assessmentRelevance?.[0]).toEqual(
      expect.objectContaining({
        relevance: "none",
        relationship: "neutral",
        boundedInfluence: 0,
      }),
    );
  });
});
