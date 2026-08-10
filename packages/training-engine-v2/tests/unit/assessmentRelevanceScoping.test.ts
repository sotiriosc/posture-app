import { describe, expect, it } from "vitest";
import {
  calculateAssessmentRelevanceTraces,
  deriveAlignmentPriorities,
  getControlledCandidateScenario,
  REFERENCE_EXERCISES,
  runCandidateRankingLab,
  type AssessmentSignal,
  type AssessmentState,
  type CandidateRequest,
  type RankedCandidate,
  type ScoreComponent,
} from "../../src";
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
      "chest-supported-dumbbell-row",
      "machine-row",
      "seated-cable-row",
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
    const lowFacePull = ranked(low.rankedCandidates, "band-face-pull");
    const mediumFacePull = ranked(medium.rankedCandidates, "band-face-pull");
    const highFacePull = ranked(high.rankedCandidates, "band-face-pull");

    expect(componentValue(lowFacePull, "assessment_fit")).toBe(6);
    expect(componentValue(mediumFacePull, "assessment_fit")).toBeGreaterThan(
      componentValue(lowFacePull, "assessment_fit"),
    );
    expect(componentValue(highFacePull, "assessment_fit")).toBeGreaterThan(
      componentValue(mediumFacePull, "assessment_fit"),
    );
    expect(component(mediumFacePull, "assessment_fit").assessmentRelevance?.[0]).toEqual(
      expect.objectContaining({
        relevanceReasonCode: "ASSESSMENT_MOVEMENT_RELEVANT",
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

    expect(componentValue(pushUp, "assessment_fit")).toBeGreaterThan(
      componentValue(machinePress, "assessment_fit"),
    );
    expect(pushUpInPush).toEqual(
      expect.objectContaining({
        relevance: "moderate",
        relevanceReasonCode: "ASSESSMENT_STABILITY_RELEVANT",
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
    expect(totalComponentDelta).toBeLessThanOrEqual(totalBounded);
    expect(assessmentFit.value - 6).toBeLessThanOrEqual(1.2);
    expect(alignmentFit.value - 6).toBeLessThanOrEqual(0.8);
  });
});
