import { describe, expect, it } from "vitest";
import {
  calculateAssessmentRelevanceTraces,
  deriveAlignmentPriorities,
  EMPTY_TRAINING_HISTORY,
  FULL_GYM_EQUIPMENT,
  getControlledCandidateScenario,
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  runCandidateRankingLab,
  THREE_PHASE_FOUNDATION,
  type AssessmentSignal,
  type AssessmentState,
  type CandidateRequest,
  type PainAndInjuryState,
  type RankedCandidate,
  type ScoreComponent,
  type TrainingHistory,
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

function withPainAndInjury(
  request: CandidateRequest,
  painAndInjury: PainAndInjuryState,
): CandidateRequest {
  return {
    ...request,
    id: `${request.id}-pain-override`,
    painAndInjury,
  };
}

function withEvaluationAsOf(request: CandidateRequest, asOf?: string): CandidateRequest {
  return {
    ...request,
    id: `${request.id}-as-of-override`,
    evaluationContext: asOf ? { asOf } : undefined,
  };
}

function withTrainingHistory(
  request: CandidateRequest,
  overrides: Partial<TrainingHistory>,
): CandidateRequest {
  return {
    ...request,
    id: `${request.id}-history-override`,
    history: {
      ...EMPTY_TRAINING_HISTORY,
      ...overrides,
      exerciseHistory: {
        ...EMPTY_TRAINING_HISTORY.exerciseHistory,
        ...overrides.exerciseHistory,
      },
      sessionHistory: {
        ...EMPTY_TRAINING_HISTORY.sessionHistory,
        ...overrides.sessionHistory,
      },
      programHistory: {
        ...EMPTY_TRAINING_HISTORY.programHistory,
        ...overrides.programHistory,
      },
      progressionState: {
        ...EMPTY_TRAINING_HISTORY.progressionState,
        ...overrides.progressionState,
      },
      fatigueState: {
        ...EMPTY_TRAINING_HISTORY.fatigueState,
        ...overrides.fatigueState,
        byMovementRole: {
          ...EMPTY_TRAINING_HISTORY.fatigueState.byMovementRole,
          ...overrides.fatigueState?.byMovementRole,
        },
      },
    },
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

function assessmentTrace(
  candidate: RankedCandidate,
  componentId: "assessment_fit" | "alignment_fit" = "assessment_fit",
) {
  const trace = component(candidate, componentId).assessmentRelevance?.[0];
  if (!trace) {
    throw new Error(`Missing assessment trace for ${candidate.exercise.id}`);
  }

  return trace;
}

function assessmentTraceForRequest(request: CandidateRequest, exerciseId: string) {
  return calculateAssessmentRelevanceTraces({
    request,
    exercise: exercise(exerciseId),
  })[0];
}

function rejectedCodes(result: ReturnType<typeof runCandidateRankingLab>, exerciseId: string): readonly string[] {
  return (
    result.hardRejectedCandidates.find((candidate) => candidate.exercise.id === exerciseId)
      ?.eligibility.rejectionReasons.map((reason) => reason.code) ?? []
  );
}

const FIXED_AS_OF = "2026-08-10T00:00:00.000Z";
const LATE_AS_OF = "2027-03-01T00:00:00.000Z";

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

const wristDiscomfort: PainAndInjuryState = {
  ...NO_PAIN_OR_INJURY,
  currentDiscomforts: [
    {
      kind: "current_discomfort",
      id: "mild-wrist-extension-discomfort",
      region: "wrist",
      severity0To10: 2,
      stressTags: ["wrist_extension_loading"],
      effect: "prefer_support",
      description: "Mild wrist extension discomfort.",
    },
  ],
};

const kneeDiscomfort: PainAndInjuryState = {
  ...NO_PAIN_OR_INJURY,
  currentDiscomforts: [
    {
      kind: "current_discomfort",
      id: "mild-knee-flexion-discomfort",
      region: "knee",
      severity0To10: 2,
      stressTags: ["loaded_knee_flexion"],
      effect: "reduce_range",
      description: "Mild knee discomfort with loaded flexion.",
    },
  ],
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

function genericScapularAssessment(
  confidence: AssessmentSignal["confidence"] = "high",
): AssessmentState {
  return {
    signals: [
      {
        id: "synthetic-generic-scapular-control",
        type: "control_finding",
        source: "movement_screen",
        confidence,
        priority: "primary",
        region: "shoulder",
        movementRole: "scapular_control",
        description: "Generic scapular control finding without feature evidence.",
      },
    ],
    historicalWeaknesses: [],
  };
}

function explicitScapularFeatureAssessment(
  feature: NonNullable<AssessmentSignal["assessmentFeatures"]>[number],
  severity?: AssessmentSignal["severity"],
): AssessmentState {
  return {
    signals: [
      {
        id: `synthetic-${feature}`,
        type: "control_finding",
        source: "movement_screen",
        confidence: "high",
        priority: "primary",
        region: "shoulder",
        movementRole: "scapular_control",
        ...(severity ? { severity } : {}),
        assessmentFeatures: [feature],
        description: `Synthetic ${feature} finding.`,
      },
    ],
    historicalWeaknesses: [],
  };
}

function fullGymScapularActivationRequest(assessment: AssessmentState): CandidateRequest {
  const baseRequest = controlledRequest("scapular-activation-high-confidence");

  return withAssessment(
    {
      ...baseRequest,
      id: `${baseRequest.id}-full-gym-feature-contrast`,
      equipment: FULL_GYM_EQUIPMENT,
    },
    assessment,
  );
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
    expect(rejectedCodes(push, "goblet-squat")).toContain("MOVEMENT_ROLE_MISMATCH");
    expect(rejectedCodes(push, "dumbbell-romanian-deadlift")).toContain("MOVEMENT_ROLE_MISMATCH");
    expect(rejectedCodes(pull, "goblet-squat")).toContain("MOVEMENT_ROLE_MISMATCH");
    expect(rejectedCodes(pull, "dumbbell-romanian-deadlift")).toContain("MOVEMENT_ROLE_MISMATCH");
    expect(rejectedCodes(squat, "dumbbell-bench-press")).toContain("MOVEMENT_ROLE_MISMATCH");
    expect(rejectedCodes(squat, "push-up")).toContain("MOVEMENT_ROLE_MISMATCH");
    expect(runCandidateRankingLab(squatOff).rankedCandidates[0].exercise.id).toBe("goblet-squat");
    expect(squat.rankedCandidates[0].exercise.id).toBe("goblet-squat");
  });

  it("does not let activation or accessory suitability satisfy loaded main roles", () => {
    const primaryPull = runCandidateRankingLab(controlledRequest("horizontal-pull-gym-neutral"));
    const primaryPush = runCandidateRankingLab(controlledRequest("horizontal-push-phase-3"));

    expect(rejectedCodes(primaryPull, "band-face-pull")).toContain("ROLE_MISMATCH");
    expect(rejectedCodes(primaryPull, "band-face-pull")).toContain("SECTION_MISMATCH");
    expect(rejectedCodes(primaryPull, "band-face-pull")).toContain("TARGET_MUSCLE_MISMATCH");
    expect(rejectedCodes(primaryPush, "cable-chest-fly")).toContain("ROLE_MISMATCH");
    expect(rejectedCodes(primaryPush, "cable-chest-fly")).toContain("SECTION_MISMATCH");
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
    const low = runCandidateRankingLab(withAssessment(baseRequest, genericScapularAssessment("low")));
    const medium = runCandidateRankingLab(withAssessment(baseRequest, genericScapularAssessment("medium")));
    const high = runCandidateRankingLab(withAssessment(baseRequest, genericScapularAssessment("high")));
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
        relevance: "moderate",
        relationship: "neutral",
        boundedInfluence: 0,
      }),
    );
    expect(facePullTrace).toEqual(
      expect.objectContaining({
        relevance: "none",
        relationship: "neutral",
      }),
    );
    expect(bandRowTrace).toEqual(
      expect.objectContaining({
        relevance: "none",
        relationship: "neutral",
      }),
    );
    expect(wallSlideTrace?.featureMatches[0]).toEqual(
      expect.objectContaining({
        assessmentFeature: "serratus_or_protraction_control",
        assessmentFeatureSource: "normalized_from_signal",
        candidateFeatureLevel: "high",
        featureMatch: "moderate",
      }),
    );
    expect(facePullTrace?.featureMatches[0]).toEqual(
      expect.objectContaining({
        assessmentFeature: "serratus_or_protraction_control",
        candidateFeatureLevel: "low",
        featureMatch: "low_expression",
      }),
    );
    expect(wallSlideTrace?.featureDevelopment[0]).toEqual(
      expect.objectContaining({
        assessmentFeature: "serratus_or_protraction_control",
        featureEmphasisLevel: "high",
        overallTaskDemand: 2,
        featureChallengeDemand: null,
        featureChallengeDemandSource: "not_modeled",
        featureDemandCapabilityMatch: "not_applicable",
      }),
    );
    expect(wallSlideTrace?.assessmentContribution).toBe(0);
    expect(bandRowTrace?.assessmentContribution).toBe(0);
    expect(facePullTrace?.assessmentContribution).toBe(0);
  });

  it("uses serratus/protraction feature matching instead of generic scapular role matching", () => {
    const request = fullGymScapularActivationRequest(scapularAssessment("high"));
    const wallSlide = assessmentTraceForRequest(request, "serratus-wall-slide");
    const facePull = assessmentTraceForRequest(request, "band-face-pull");
    const reversePecDeck = assessmentTraceForRequest(request, "reverse-pec-deck");
    const bandRow = assessmentTraceForRequest(request, "band-row");

    expect(wallSlide).toEqual(
      expect.objectContaining({
        relevance: "moderate",
        relationship: "neutral",
        boundedInfluence: 0,
      }),
    );
    expect(wallSlide.featureMatches[0]).toEqual(
      expect.objectContaining({
        assessmentFeature: "serratus_or_protraction_control",
        assessmentFeatureSource: "normalized_from_signal",
        candidateFeatureLevel: "high",
        candidateFeatureReviewStatus: "needs_review",
        featureMatch: "moderate",
      }),
    );
    [facePull, reversePecDeck, bandRow].forEach((trace) => {
      expect(trace).toEqual(
        expect.objectContaining({
          relevance: "none",
          relationship: "neutral",
          boundedInfluence: 0,
        }),
      );
      expect(trace.featureMatches[0]).toEqual(
        expect.objectContaining({
          assessmentFeature: "serratus_or_protraction_control",
          candidateFeatureLevel: "low",
          featureMatch: "low_expression",
        }),
      );
      expect(trace.featureDevelopment[0]).toEqual(
        expect.objectContaining({
          featureEmphasisLevel: "low",
          featureChallengeDemand: null,
          featureDemandCapabilityMatch: "not_applicable",
        }),
      );
    });
  });

  it("uses upward-rotation feature matching without inferring it from shoulder alone", () => {
    const request = fullGymScapularActivationRequest(
      explicitScapularFeatureAssessment("upward_rotation_control"),
    );
    const wallSlide = assessmentTraceForRequest(request, "serratus-wall-slide");
    const facePull = assessmentTraceForRequest(request, "band-face-pull");
    const reversePecDeck = assessmentTraceForRequest(request, "reverse-pec-deck");
    const bandRow = assessmentTraceForRequest(request, "band-row");

    expect(wallSlide.featureMatches[0]).toEqual(
      expect.objectContaining({
        assessmentFeature: "upward_rotation_control",
        assessmentFeatureSource: "explicit",
        candidateFeatureLevel: "high",
        featureMatch: "moderate",
      }),
    );
    expect(wallSlide.relevance).toBe("moderate");
    [facePull, reversePecDeck, bandRow].forEach((trace) => {
      expect(trace.featureMatches[0]).toEqual(
        expect.objectContaining({
          candidateFeatureLevel: "low",
          featureMatch: "low_expression",
        }),
      );
      expect(trace.relevance).toBe("none");
    });

    const generic = assessmentTraceForRequest(
      fullGymScapularActivationRequest(genericScapularAssessment()),
      "serratus-wall-slide",
    );
    expect(generic.featureMatches).toEqual([]);
  });

  it("makes retraction findings favor current retraction metadata over wall-slide mechanics", () => {
    const request = fullGymScapularActivationRequest(
      explicitScapularFeatureAssessment("retraction_control"),
    );
    const wallSlide = assessmentTraceForRequest(request, "serratus-wall-slide");
    const facePull = assessmentTraceForRequest(request, "band-face-pull");
    const reversePecDeck = assessmentTraceForRequest(request, "reverse-pec-deck");
    const bandRow = assessmentTraceForRequest(request, "band-row");

    expect(facePull.featureMatches[0]).toEqual(
      expect.objectContaining({
        candidateFeatureLevel: "high",
        featureMatch: "moderate",
      }),
    );
    expect(facePull.relevance).toBe("moderate");
    expect(facePull.featureDevelopment[0]).toEqual(
      expect.objectContaining({
        assessmentFeature: "retraction_control",
        featureEmphasisLevel: "high",
        overallTaskDemand: 3,
        featureChallengeDemand: null,
        featureChallengeDemandSource: "not_modeled",
        featureCapabilityEvidenceQuality: "weak",
        featureDemandCapabilityMatch: "not_applicable",
      }),
    );
    expect(facePull.relationship).toBe("neutral");
    expect(facePull.boundedInfluence).toBe(0);
    [reversePecDeck, bandRow].forEach((trace) => {
      expect(trace.featureMatches[0]).toEqual(
        expect.objectContaining({
          candidateFeatureLevel: "moderate",
          featureMatch: "weak",
        }),
      );
      expect(trace.relevance).toBe("low");
    });
    expect(wallSlide.featureMatches[0]).toEqual(
      expect.objectContaining({
        candidateFeatureLevel: "low",
        featureMatch: "low_expression",
      }),
    );
    expect(wallSlide.relevance).toBe("none");
  });

  it("distinguishes cuff/external-rotation findings from explicitly low or unknown cuff metadata", () => {
    const request = fullGymScapularActivationRequest(
      explicitScapularFeatureAssessment("external_rotation_or_cuff_control"),
    );
    const facePull = assessmentTraceForRequest(request, "band-face-pull");
    const wallSlide = assessmentTraceForRequest(request, "serratus-wall-slide");
    const reversePecDeck = assessmentTraceForRequest(request, "reverse-pec-deck");
    const dumbbellBench = assessmentTraceForRequest(request, "dumbbell-bench-press");

    expect(facePull.featureMatches[0]).toEqual(
      expect.objectContaining({
        candidateFeatureLevel: "moderate",
        featureMatch: "weak",
      }),
    );
    expect(facePull.relevance).toBe("low");
    expect(facePull.featureDevelopment[0]).toEqual(
      expect.objectContaining({
        assessmentFeature: "external_rotation_or_cuff_control",
        featureEmphasisLevel: "moderate",
        overallTaskDemand: 3,
        featureChallengeDemand: null,
        featureDemandCapabilityMatch: "not_applicable",
      }),
    );
    expect(facePull.relationship).toBe("neutral");
    expect(facePull.boundedInfluence).toBe(0);
    [wallSlide, reversePecDeck].forEach((trace) => {
      expect(trace.featureMatches[0]).toEqual(
        expect.objectContaining({
          candidateFeatureLevel: "low",
          featureMatch: "low_expression",
        }),
      );
      expect(trace.relevance).toBe("none");
    });
    expect(dumbbellBench.featureMatches[0]).toEqual(
      expect.objectContaining({
        candidateFeatureLevel: "unknown",
        candidateFeatureReviewStatus: "needs_review",
        featureMatch: "unknown",
      }),
    );
    expect(dumbbellBench.relevance).toBe("none");
  });

  it("does not treat preparation and loaded scapular-stability candidates identically", () => {
    const request = fullGymScapularActivationRequest(
      explicitScapularFeatureAssessment("loaded_scapular_stability"),
    );
    const wallSlide = assessmentTraceForRequest(request, "serratus-wall-slide");
    const facePull = assessmentTraceForRequest(request, "band-face-pull");
    const reversePecDeck = assessmentTraceForRequest(request, "reverse-pec-deck");
    const oneArmRow = assessmentTraceForRequest(request, "one-arm-dumbbell-row");

    expect(wallSlide.featureMatches[0]).toEqual(
      expect.objectContaining({
        candidateFeatureLevel: "low",
        featureMatch: "low_expression",
      }),
    );
    expect(wallSlide.relevance).toBe("none");
    expect(wallSlide.featureDevelopment[0]).toEqual(
      expect.objectContaining({
        featureEmphasisLevel: "low",
        featureMatch: "low_expression",
        featureChallengeDemand: null,
        featureDemandCapabilityMatch: "not_applicable",
      }),
    );
    [facePull, reversePecDeck].forEach((trace) => {
      expect(trace.featureMatches[0]).toEqual(
        expect.objectContaining({
          candidateFeatureLevel: "moderate",
          featureMatch: "weak",
        }),
      );
      expect(trace.relevance).toBe("low");
      expect(trace.featureDevelopment[0]).toEqual(
        expect.objectContaining({
          featureChallengeDemand: null,
          featureDemandCapabilityMatch: "not_applicable",
        }),
      );
      expect(trace.relationship).toBe("neutral");
    });
    expect(oneArmRow.featureMatches[0]).toEqual(
      expect.objectContaining({
        candidateFeatureLevel: "high",
        featureMatch: "moderate",
      }),
    );
    expect(oneArmRow.relevance).toBe("none");
  });

  it("keeps generic scapular history out of retraction feature-capability evidence", () => {
    const baseRequest = fullGymScapularActivationRequest(
      explicitScapularFeatureAssessment("retraction_control"),
    );
    const historyRequest = withEvaluationAsOf(
      withTrainingHistory(baseRequest, {
        exerciseHistory: {
          events: [
            {
              id: "generic-scapular-success",
              exerciseId: "serratus-wall-slide",
              type: "too_easy",
              occurredAt: "2026-08-07T00:00:00.000Z",
              movementRole: "scapular_control",
              notes: "Generic scapular-control drill was easy.",
            },
          ],
          stableExerciseIds: [],
          blockedExerciseIds: [],
        },
        progressionState: {
          ...EMPTY_TRAINING_HISTORY.progressionState,
          successfulMovementRoles: ["scapular_control"],
        },
      }),
      FIXED_AS_OF,
    );
    const baseTrace = assessmentTraceForRequest(baseRequest, "band-face-pull");
    const historyTrace = assessmentTraceForRequest(historyRequest, "band-face-pull");

    expect(historyTrace.demandCapability.currentCapability).toBeGreaterThan(
      baseTrace.demandCapability.currentCapability,
    );
    expect(historyTrace.demandCapability.capabilityEstimate.estimateSource).toBe("history_inferred");
    expect(historyTrace.featureDevelopment[0]).toEqual(
      expect.objectContaining({
        assessmentFeature: "retraction_control",
        featureCapabilityEstimate: baseTrace.featureDevelopment[0].featureCapabilityEstimate,
        featureCapabilitySource: "phase_default",
        featureCapabilityEvidenceQuality: "weak",
        featureCapabilityPriorSource: "phase_experience_default",
        featureSpecificEvidenceSources: [],
        featureSpecificHistorySupport: "unavailable_not_modeled",
        featureDemandCapabilityMatch: "not_applicable",
      }),
    );
    expect(historyTrace.featureDevelopment[0].evidence.join(" ")).toContain(
      "Generic movement-role history is not used as feature-specific capability evidence",
    );
  });

  it("does not label unrelated scapular history as serratus feature-specific evidence", () => {
    const request = withEvaluationAsOf(
      withTrainingHistory(fullGymScapularActivationRequest(scapularAssessment("high")), {
        exerciseHistory: {
          events: [
            {
              id: "generic-retraction-history",
              exerciseId: "band-face-pull",
              type: "appropriate_challenge",
              occurredAt: "2026-08-07T00:00:00.000Z",
              movementRole: "scapular_control",
              notes: "Generic scapular-control history from a retraction-emphasis exercise.",
            },
          ],
          stableExerciseIds: [],
          blockedExerciseIds: [],
        },
      }),
      FIXED_AS_OF,
    );
    const wallSlide = assessmentTraceForRequest(request, "serratus-wall-slide");

    expect(wallSlide.relevance).toBe("moderate");
    expect(wallSlide.demandCapability.capabilityEstimate.estimateSource).toBe("history_inferred");
    expect(wallSlide.featureDevelopment[0]).toEqual(
      expect.objectContaining({
        assessmentFeature: "serratus_or_protraction_control",
        featureSpecificEvidenceSources: [],
        featureSpecificHistorySupport: "unavailable_not_modeled",
        featureCapabilityEvidenceQuality: "weak",
        featureDemandCapabilityMatch: "not_applicable",
      }),
    );
  });

  it("keeps generic scapular-control signals broad when no feature evidence exists", () => {
    const request = fullGymScapularActivationRequest(genericScapularAssessment());
    const wallSlide = assessmentTraceForRequest(request, "serratus-wall-slide");
    const facePull = assessmentTraceForRequest(request, "band-face-pull");
    const reversePecDeck = assessmentTraceForRequest(request, "reverse-pec-deck");
    const bandRow = assessmentTraceForRequest(request, "band-row");

    [wallSlide, facePull, reversePecDeck].forEach((trace) => {
      expect(trace.featureMatches).toEqual([]);
      expect(trace.relevance).toBe("high");
    });
    expect(bandRow.featureMatches).toEqual([]);
    expect(bandRow.relevance).toBe("moderate");
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
    expect(lowTrace?.featureDevelopment[0].featureCapabilityEstimate).toBe(
      highTrace?.featureDevelopment[0].featureCapabilityEstimate,
    );
    expect(lowTrace?.boundedInfluence).toBe(0);
    expect(highTrace?.boundedInfluence).toBe(0);
  });

  it("exposes capability provenance without treating default estimates as measured capacity", () => {
    const result = runCandidateRankingLab(controlledRequest("scapular-activation-high-confidence"));
    const wallSlideTrace = assessmentTrace(ranked(result.rankedCandidates, "serratus-wall-slide"));

    expect(wallSlideTrace.demandCapability.capabilityEstimate).toEqual(
      expect.objectContaining({
        estimateSource: "phase_default",
        evidenceQuality: "weak",
      }),
    );
    expect(wallSlideTrace.demandCapability.capabilityEstimate.contributingSources).toContain(
      "phase_default",
    );
    expect(wallSlideTrace.demandCapability.capabilityEstimate.historyEvidence).toEqual(
      expect.objectContaining({
        matchingEventCount: 0,
        evidenceQuality: "unknown",
        adjustment: 0,
      }),
    );
    expect(wallSlideTrace.demandCapability.capabilityEstimate.evidence.join(" ")).toContain(
      "No direct observed capability measurement",
    );
  });

  it("keeps a single matching history success weak and proportional", () => {
    const baseRequest = controlledRequest("scapular-activation-high-confidence");
    const noHistory = runCandidateRankingLab(baseRequest);
    const singleSuccess = runCandidateRankingLab(
      withTrainingHistory(baseRequest, {
        exerciseHistory: {
          events: [
            {
              id: "undated-scapular-success",
              exerciseId: "serratus-wall-slide",
              type: "successful_completion",
              movementRole: "scapular_control",
              notes: "Scapular-control work was completed once.",
            },
          ],
          stableExerciseIds: [],
          blockedExerciseIds: [],
        },
      }),
    );
    const baseTrace = assessmentTrace(ranked(noHistory.rankedCandidates, "serratus-wall-slide"));
    const singleTrace = assessmentTrace(ranked(singleSuccess.rankedCandidates, "serratus-wall-slide"));

    expect(singleTrace.demandCapability.currentCapability).toBeGreaterThan(
      baseTrace.demandCapability.currentCapability,
    );
    expect(singleTrace.demandCapability.capabilityEstimate).toEqual(
      expect.objectContaining({
        estimateSource: "history_inferred",
        evidenceQuality: "weak",
      }),
    );
    expect(singleTrace.demandCapability.capabilityEstimate.historyEvidence).toEqual(
      expect.objectContaining({
        matchingEventCount: 1,
        positiveEvidenceCount: 1,
        negativeEvidenceCount: 0,
        noRecencyEventCount: 1,
        contradiction: false,
        progressionStateCorroborates: false,
        evidenceQuality: "weak",
      }),
    );
    expect(singleTrace.demandCapability.capabilityEstimate.historyEvidence.adjustment).toBeGreaterThan(0);
    expect(singleTrace.demandCapability.capabilityEstimate.historyEvidence.adjustment).toBeLessThan(0.08);
  });

  it("allows multiple consistent recent successes to moderately corroborate capability", () => {
    const baseRequest = controlledRequest("scapular-activation-high-confidence");
    const matchedHistory = runCandidateRankingLab(
      withEvaluationAsOf(
        withTrainingHistory(baseRequest, {
          exerciseHistory: {
            events: [
              {
                id: "recent-scapular-appropriate-challenge",
                exerciseId: "serratus-wall-slide",
                type: "appropriate_challenge",
                occurredAt: "2026-08-03T00:00:00.000Z",
                movementRole: "scapular_control",
                notes: "Scapular-control work was appropriately challenging.",
              },
              {
                id: "recent-scapular-too-easy",
                exerciseId: "serratus-wall-slide",
                type: "too_easy",
                occurredAt: "2026-08-07T00:00:00.000Z",
                movementRole: "scapular_control",
                notes: "Scapular-control work was easy enough to progress.",
              },
            ],
            stableExerciseIds: [],
            blockedExerciseIds: [],
          },
          progressionState: {
            ...EMPTY_TRAINING_HISTORY.progressionState,
            successfulMovementRoles: ["scapular_control"],
          },
        }),
        FIXED_AS_OF,
      ),
    );
    const matchedTrace = assessmentTrace(ranked(matchedHistory.rankedCandidates, "serratus-wall-slide"));

    expect(matchedTrace.demandCapability.capabilityEstimate).toEqual(
      expect.objectContaining({
        estimateSource: "history_inferred",
        evidenceQuality: "moderate",
      }),
    );
    expect(matchedTrace.demandCapability.capabilityEstimate.contributingSources).toContain(
      "history_inferred",
    );
    expect(matchedTrace.demandCapability.capabilityEstimate.historyEvidence).toEqual(
      expect.objectContaining({
        matchingEventCount: 2,
        positiveEvidenceCount: 2,
        negativeEvidenceCount: 0,
        staleEventCount: 0,
        noRecencyEventCount: 0,
        contradiction: false,
        progressionStateCorroborates: true,
        evidenceQuality: "moderate",
      }),
    );
    expect(matchedTrace.demandCapability.capabilityEstimate.historyEvidence.adjustment).toBeGreaterThan(
      0.2,
    );
    expect(matchedTrace.demandCapability.capabilityEstimate.evidence.join(" ")).toContain(
      "Movement-role-matched training exposure history",
    );
  });

  it("produces identical rankings and capability traces for the same request and asOf", () => {
    const request = withEvaluationAsOf(
      withTrainingHistory(controlledRequest("scapular-activation-high-confidence"), {
        exerciseHistory: {
          events: [
            {
              id: "deterministic-scapular-appropriate",
              exerciseId: "serratus-wall-slide",
              type: "appropriate_challenge",
              occurredAt: "2026-08-03T00:00:00.000Z",
              movementRole: "scapular_control",
              notes: "Scapular-control work was appropriately challenging.",
            },
            {
              id: "deterministic-scapular-too-easy",
              exerciseId: "serratus-wall-slide",
              type: "too_easy",
              occurredAt: "2026-08-07T00:00:00.000Z",
              movementRole: "scapular_control",
              notes: "Scapular-control work was ready to progress.",
            },
          ],
          stableExerciseIds: [],
          blockedExerciseIds: [],
        },
        progressionState: {
          ...EMPTY_TRAINING_HISTORY.progressionState,
          successfulMovementRoles: ["scapular_control"],
        },
      }),
      FIXED_AS_OF,
    );
    const first = runCandidateRankingLab(request);
    const second = runCandidateRankingLab(request);
    const firstTrace = assessmentTrace(ranked(first.rankedCandidates, "serratus-wall-slide"));
    const secondTrace = assessmentTrace(ranked(second.rankedCandidates, "serratus-wall-slide"));

    expect(first.rankedCandidates.map((candidate) => [candidate.exercise.id, candidate.total])).toEqual(
      second.rankedCandidates.map((candidate) => [candidate.exercise.id, candidate.total]),
    );
    expect(firstTrace.demandCapability.capabilityEstimate).toEqual(
      secondTrace.demandCapability.capabilityEstimate,
    );
  });

  it("changes recency evidence only when the explicit asOf changes", () => {
    const requestWithHistory = withTrainingHistory(
      controlledRequest("scapular-activation-high-confidence"),
      {
        exerciseHistory: {
          events: [
            {
              id: "as-of-sensitive-scapular-too-easy",
              exerciseId: "serratus-wall-slide",
              type: "too_easy",
              occurredAt: "2026-08-05T00:00:00.000Z",
              movementRole: "scapular_control",
              notes: "Scapular-control work was easy.",
            },
          ],
          stableExerciseIds: [],
          blockedExerciseIds: [],
        },
      },
    );
    const recentResult = runCandidateRankingLab(withEvaluationAsOf(requestWithHistory, FIXED_AS_OF));
    const staleResult = runCandidateRankingLab(withEvaluationAsOf(requestWithHistory, LATE_AS_OF));
    const recentTrace = assessmentTrace(ranked(recentResult.rankedCandidates, "serratus-wall-slide"));
    const staleTrace = assessmentTrace(ranked(staleResult.rankedCandidates, "serratus-wall-slide"));

    expect(recentTrace.demandCapability.capabilityEstimate.historyEvidence).toEqual(
      expect.objectContaining({
        staleEventCount: 0,
        noRecencyEventCount: 0,
      }),
    );
    expect(staleTrace.demandCapability.capabilityEstimate.historyEvidence).toEqual(
      expect.objectContaining({
        staleEventCount: 1,
        noRecencyEventCount: 0,
      }),
    );
    expect(recentTrace.demandCapability.capabilityEstimate.historyEvidence.adjustment).toBeGreaterThan(
      staleTrace.demandCapability.capabilityEstimate.historyEvidence.adjustment,
    );
  });

  it("treats timestamped history as no_recency when no evaluation asOf is supplied", () => {
    const result = runCandidateRankingLab(
      withTrainingHistory(controlledRequest("scapular-activation-high-confidence"), {
        exerciseHistory: {
          events: [
            {
              id: "timestamped-without-as-of",
              exerciseId: "serratus-wall-slide",
              type: "too_easy",
              occurredAt: "2026-08-05T00:00:00.000Z",
              movementRole: "scapular_control",
              notes: "Timestamped event with no explicit evaluation time.",
            },
          ],
          stableExerciseIds: [],
          blockedExerciseIds: [],
        },
      }),
    );
    const trace = assessmentTrace(ranked(result.rankedCandidates, "serratus-wall-slide"));

    expect(trace.demandCapability.capabilityEstimate.historyEvidence).toEqual(
      expect.objectContaining({
        matchingEventCount: 1,
        staleEventCount: 0,
        noRecencyEventCount: 1,
        evidenceQuality: "weak",
      }),
    );
    expect(trace.demandCapability.capabilityEstimate.evidence.join(" ")).toContain(
      "No evaluationContext.asOf was supplied",
    );
  });

  it("dampens contradictory movement-role history instead of treating it as clean evidence", () => {
    const baseRequest = controlledRequest("scapular-activation-high-confidence");
    const singleSuccess = runCandidateRankingLab(
      withEvaluationAsOf(
        withTrainingHistory(baseRequest, {
          exerciseHistory: {
            events: [
              {
                id: "recent-single-scapular-too-easy",
                exerciseId: "serratus-wall-slide",
                type: "too_easy",
                occurredAt: "2026-08-05T00:00:00.000Z",
                movementRole: "scapular_control",
                notes: "Scapular-control work was easy.",
              },
            ],
            stableExerciseIds: [],
            blockedExerciseIds: [],
          },
        }),
        FIXED_AS_OF,
      ),
    );
    const contradiction = runCandidateRankingLab(
      withEvaluationAsOf(
        withTrainingHistory(baseRequest, {
          exerciseHistory: {
            events: [
              {
                id: "recent-scapular-too-easy",
                exerciseId: "serratus-wall-slide",
                type: "too_easy",
                occurredAt: "2026-08-05T00:00:00.000Z",
                movementRole: "scapular_control",
                notes: "Scapular-control work was easy.",
              },
              {
                id: "recent-scapular-too-difficult",
                exerciseId: "band-face-pull",
                type: "too_difficult",
                occurredAt: "2026-08-08T00:00:00.000Z",
                movementRole: "scapular_control",
                notes: "Scapular-control work was too difficult.",
              },
            ],
            stableExerciseIds: [],
            blockedExerciseIds: [],
          },
        }),
        FIXED_AS_OF,
      ),
    );
    const singleTrace = assessmentTrace(ranked(singleSuccess.rankedCandidates, "serratus-wall-slide"));
    const contradictionTrace = assessmentTrace(
      ranked(contradiction.rankedCandidates, "serratus-wall-slide"),
    );

    expect(contradictionTrace.demandCapability.capabilityEstimate.historyEvidence).toEqual(
      expect.objectContaining({
        matchingEventCount: 2,
        positiveEvidenceCount: 1,
        negativeEvidenceCount: 1,
        contradiction: true,
        evidenceQuality: "weak",
      }),
    );
    expect(
      Math.abs(contradictionTrace.demandCapability.capabilityEstimate.historyEvidence.adjustment),
    ).toBeLessThan(singleTrace.demandCapability.capabilityEstimate.historyEvidence.adjustment);
  });

  it("lets repeated failures lower capability while exposing stale and missing recency", () => {
    const baseRequest = controlledRequest("scapular-activation-high-confidence");
    const repeatedFailures = runCandidateRankingLab(
      withEvaluationAsOf(
        withTrainingHistory(baseRequest, {
          exerciseHistory: {
            events: [
              {
                id: "stale-scapular-progression-failure",
                exerciseId: "band-face-pull",
                type: "progression_failure",
                occurredAt: "2020-01-01T00:00:00.000Z",
                movementRole: "scapular_control",
                notes: "Old progression failure.",
              },
              {
                id: "undated-scapular-failed-target",
                exerciseId: "serratus-wall-slide",
                type: "failed_target",
                movementRole: "scapular_control",
                notes: "Failed a target without a recorded date.",
              },
            ],
            stableExerciseIds: [],
            blockedExerciseIds: [],
          },
        }),
        FIXED_AS_OF,
      ),
    );
    const trace = assessmentTrace(ranked(repeatedFailures.rankedCandidates, "serratus-wall-slide"));

    expect(trace.demandCapability.capabilityEstimate.historyEvidence).toEqual(
      expect.objectContaining({
        matchingEventCount: 2,
        positiveEvidenceCount: 0,
        negativeEvidenceCount: 2,
        staleEventCount: 1,
        noRecencyEventCount: 1,
        contradiction: false,
        evidenceQuality: "weak",
      }),
    );
    expect(trace.demandCapability.capabilityEstimate.historyEvidence.adjustment).toBeLessThan(0);
  });

  it("uses only movement-role-matched history as inferred capability evidence", () => {
    const baseRequest = controlledRequest("scapular-activation-high-confidence");
    const noHistory = runCandidateRankingLab(baseRequest);
    const unrelatedHistory = runCandidateRankingLab(
      withTrainingHistory(baseRequest, {
        exerciseHistory: {
          events: [
            {
              id: "recent-horizontal-pull-too-easy",
              exerciseId: "band-row",
              type: "too_easy",
              movementRole: "horizontal_pull",
              notes: "Horizontal pulling was easy, but this is not direct scapular-control evidence.",
            },
          ],
          stableExerciseIds: [],
          blockedExerciseIds: [],
        },
      }),
    );
    const baseTrace = assessmentTrace(ranked(noHistory.rankedCandidates, "serratus-wall-slide"));
    const unrelatedTrace = assessmentTrace(ranked(unrelatedHistory.rankedCandidates, "serratus-wall-slide"));

    expect(baseTrace.demandCapability.capabilityEstimate.historyEvidence).toEqual(
      expect.objectContaining({
        matchingEventCount: 0,
        evidenceQuality: "unknown",
        adjustment: 0,
      }),
    );
    expect(unrelatedTrace.demandCapability.currentCapability).toBe(
      baseTrace.demandCapability.currentCapability,
    );
    expect(unrelatedTrace.demandCapability.capabilityEstimate.historyEvidence).toEqual(
      expect.objectContaining({
        matchingEventCount: 0,
        positiveEvidenceCount: 0,
        negativeEvidenceCount: 0,
        evidenceQuality: "unknown",
        adjustment: 0,
      }),
    );
    expect(unrelatedTrace.demandCapability.capabilityEstimate.contributingSources).not.toContain(
      "history_inferred",
    );
  });

  it("uses only provided feature-specific severity to adjust feature capability", () => {
    const baseRequest = controlledRequest("scapular-activation-high-confidence");
    const noSeverity = runCandidateRankingLab(
      withAssessment(
        baseRequest,
        explicitScapularFeatureAssessment("serratus_or_protraction_control"),
      ),
    );
    const mildSeverity = runCandidateRankingLab(
      withAssessment(
        baseRequest,
        explicitScapularFeatureAssessment("serratus_or_protraction_control", "mild"),
      ),
    );
    const moderateSeverity = runCandidateRankingLab(
      withAssessment(
        baseRequest,
        explicitScapularFeatureAssessment("serratus_or_protraction_control", "moderate"),
      ),
    );
    const noSeverityTrace = component(
      ranked(noSeverity.rankedCandidates, "serratus-wall-slide"),
      "assessment_fit",
    ).assessmentRelevance?.[0];
    const mildTrace = component(
      ranked(mildSeverity.rankedCandidates, "serratus-wall-slide"),
      "assessment_fit",
    ).assessmentRelevance?.[0];
    const moderateTrace = component(
      ranked(moderateSeverity.rankedCandidates, "serratus-wall-slide"),
      "assessment_fit",
    ).assessmentRelevance?.[0];
    const noSeverityFeature = noSeverityTrace?.featureDevelopment[0];
    const mildFeature = mildTrace?.featureDevelopment[0];
    const moderateFeature = moderateTrace?.featureDevelopment[0];

    expect(noSeverityTrace?.signalInterpretation).toEqual(
      expect.objectContaining({
        severity: "unknown",
        severitySource: "default_conservative",
        deficitMagnitude: 0.45,
      }),
    );
    expect(mildTrace?.signalInterpretation).toEqual(
      expect.objectContaining({
        severity: "mild",
        severitySource: "provided",
      }),
    );
    expect(moderateTrace?.signalInterpretation).toEqual(
      expect.objectContaining({
        severity: "moderate",
        severitySource: "provided",
      }),
    );

    expect(noSeverityTrace?.demandCapability.currentCapability).toBe(
      mildTrace?.demandCapability.currentCapability,
    );
    expect(noSeverityTrace?.demandCapability.currentCapability).toBe(
      moderateTrace?.demandCapability.currentCapability,
    );
    expect(noSeverityFeature).toEqual(
      expect.objectContaining({
        featureCapabilityEstimate: 1.5,
        featureCapabilitySource: "phase_default",
        featureCapabilityEvidenceQuality: "weak",
        featureCapabilityPriorSource: "phase_experience_default",
        featureSpecificEvidenceSources: [],
        featureSpecificHistorySupport: "unavailable_not_modeled",
        featureChallengeDemand: null,
        featureChallengeDemandSource: "not_modeled",
        featureDemandCapabilityMatch: "not_applicable",
      }),
    );
    expect(noSeverityFeature?.evidence.join(" ")).toContain(
      "Feature-specific severity adjustment 0.000 because no feature severity was provided.",
    );
    expect(mildFeature).toEqual(
      expect.objectContaining({
        featureCapabilityEstimate: 1.25,
        featureCapabilitySource: "assessment_inferred",
        featureCapabilityEvidenceQuality: "moderate",
        featureCapabilityPriorSource: "phase_experience_default",
        featureSpecificEvidenceSources: ["assessment_severity"],
        featureSpecificHistorySupport: "unavailable_not_modeled",
        featureChallengeDemand: null,
        featureDemandCapabilityMatch: "not_applicable",
      }),
    );
    expect(mildFeature?.evidence.join(" ")).toContain(
      "Feature-specific severity adjustment -0.250 from provided mild severity.",
    );
    expect(moderateFeature).toEqual(
      expect.objectContaining({
        featureCapabilityEstimate: 1,
        featureCapabilitySource: "assessment_inferred",
        featureCapabilityEvidenceQuality: "moderate",
        featureCapabilityPriorSource: "phase_experience_default",
        featureSpecificEvidenceSources: ["assessment_severity"],
        featureSpecificHistorySupport: "unavailable_not_modeled",
        featureChallengeDemand: null,
        featureDemandCapabilityMatch: "not_applicable",
      }),
    );
    expect(moderateFeature?.evidence.join(" ")).toContain(
      "Feature-specific severity adjustment -0.500 from provided moderate severity.",
    );
    expect(noSeverityFeature?.featureCapabilityEstimate).toBeGreaterThan(
      mildFeature?.featureCapabilityEstimate ?? 0,
    );
    expect(mildFeature?.featureCapabilityEstimate).toBeGreaterThan(
      moderateFeature?.featureCapabilityEstimate ?? 0,
    );
    expect(noSeverityTrace?.boundedInfluence).toBe(0);
    expect(mildTrace?.boundedInfluence).toBe(0);
    expect(moderateTrace?.boundedInfluence).toBe(0);
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
    const supportedTrace = assessmentTrace(supported);
    const unsupportedTrace = assessmentTrace(unsupported);

    expect(supportedTrace.relationship).toBe("reduces_excess_demand");
    expect(supportedTrace.demandReductionContext).toEqual(
      expect.objectContaining({
        relevant: true,
        matchedPainConcernIds: ["mild-low-back-discomfort"],
      }),
    );
    expect(unsupportedTrace.relationship).toBe("exceeds_current_capability");
    expect(supported.rank).toBeLessThan(unsupported.rank);
  });

  it("does not let unrelated wrist discomfort convert squat trunk under-demand into reduced demand", () => {
    const result = runCandidateRankingLab(
      withPainAndInjury(
        withAssessment(controlledRequest("lower-squat-phase-3"), trunkControlAssessment),
        wristDiscomfort,
      ),
    );
    const trace = assessmentTrace(ranked(result.rankedCandidates, "goblet-squat"));

    expect(trace.relationship).toBe("under_challenges_development");
    expect(trace.demandReductionContext).toEqual(
      expect.objectContaining({
        relevant: false,
        matchedPainConcernIds: [],
        matchedHistoricalSensitivityIds: [],
        matchedFatigueMovementRoles: [],
      }),
    );
    expect(trace.demandReductionContext.evidence.join(" ")).toContain(
      "No scoped pain, sensitivity, or fatigue context matched",
    );
  });

  it("allows relevant knee discomfort to justify reduced squat demand", () => {
    const result = runCandidateRankingLab(
      withPainAndInjury(
        withAssessment(controlledRequest("lower-squat-phase-3"), highConfidenceKneeAssessment),
        kneeDiscomfort,
      ),
    );
    const trace = assessmentTrace(ranked(result.rankedCandidates, "goblet-squat"));

    expect(trace.relationship).toBe("reduces_excess_demand");
    expect(trace.demandReductionContext).toEqual(
      expect.objectContaining({
        relevant: true,
        matchedPainConcernIds: ["mild-knee-flexion-discomfort"],
      }),
    );
  });

  it("does not let unrelated movement fatigue convert squat trunk under-demand into reduced demand", () => {
    const request = withTrainingHistory(
      withAssessment(controlledRequest("lower-squat-phase-3"), trunkControlAssessment),
      {
        fatigueState: {
          overall: "low",
          byMovementRole: {
            horizontal_pull: "high",
          },
        },
      },
    );
    const result = runCandidateRankingLab({
      ...request,
      id: `${request.id}-local-fatigue`,
      fatigueSignals: ["local_fatigue"],
    });
    const trace = assessmentTrace(ranked(result.rankedCandidates, "goblet-squat"));

    expect(trace.relationship).toBe("under_challenges_development");
    expect(trace.demandReductionContext).toEqual(
      expect.objectContaining({
        relevant: false,
        matchedFatigueMovementRoles: [],
      }),
    );
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
    expect(rejectedCodes(result, "band-face-pull")).toContain("MOVEMENT_ROLE_MISMATCH");
    expect(rejectedCodes(result, "serratus-wall-slide")).toContain("MOVEMENT_ROLE_MISMATCH");
    expect(rejectedCodes(result, "band-row")).toContain("MOVEMENT_ROLE_MISMATCH");
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
