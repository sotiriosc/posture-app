import { describe, expect, it } from "vitest";
import {
  CONTROLLED_CANDIDATE_SCENARIOS,
  DUMBBELLS_NO_BENCH_EQUIPMENT,
  EMPTY_TRAINING_HISTORY,
  FULL_GYM_EQUIPMENT,
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  buildExerciseTransitionTraces,
  deriveAlignmentPriorities,
  getControlledCandidateScenario,
  runCandidateRankingLab,
  type AssessmentState,
  type CandidateRequest,
  type CandidateRankingResult,
  type ExerciseDefinition,
  type PainAndInjuryState,
} from "../../src";

function scenario(id: string): CandidateRequest {
  const found = getControlledCandidateScenario(id);
  if (!found) {
    throw new Error(`Missing scenario ${id}`);
  }

  return {
    ...found.request,
    evaluationContext: {
      asOf: "2026-08-10T00:00:00.000Z",
    },
  };
}

function exercise(id: string): ExerciseDefinition {
  const found = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing exercise ${id}`);
  }

  return found;
}

function rankedSignature(result: CandidateRankingResult) {
  return result.rankedCandidates.map((candidate) => ({
    exerciseId: candidate.exercise.id,
    rank: candidate.rank,
    total: candidate.total,
    components: candidate.components.map((component) => ({
      id: component.id,
      value: component.value,
      rawValue: component.rawValue,
      weight: component.weight,
      weightedContribution: component.weightedContribution,
      reasonCode: component.reasonCode,
      source: component.source,
    })),
  }));
}

function rejectedCodes(result: CandidateRankingResult, exerciseId: string): readonly string[] {
  return (
    result.hardRejectedCandidates.find((candidate) => candidate.exercise.id === exerciseId)
      ?.eligibility.rejectionReasons.map((reason) => reason.code) ?? []
  );
}

function component(result: CandidateRankingResult, exerciseId: string, componentId: string) {
  const ranked = result.rankedCandidates.find((candidate) => candidate.exercise.id === exerciseId);
  const found = ranked?.components.find((candidateComponent) => candidateComponent.id === componentId);

  if (!found) {
    throw new Error(`Missing ${componentId} for ${exerciseId}`);
  }

  return found;
}

function withAssessment(request: CandidateRequest, assessment: AssessmentState): CandidateRequest {
  return {
    ...request,
    id: `${request.id}-assessment-final-invariant`,
    assessment,
    alignmentPriorities: deriveAlignmentPriorities(assessment).priorities,
  };
}

function withPain(request: CandidateRequest, painAndInjury: PainAndInjuryState): CandidateRequest {
  return {
    ...request,
    id: `${request.id}-pain-final-invariant`,
    painAndInjury,
  };
}

describe("final Candidate Intelligence readiness invariants", () => {
  it("keeps identical CandidateRequests byte-equivalent across ranking, components, and trace stage semantics", () => {
    const request = scenario("horizontal-pull-gym-neutral");
    const first = runCandidateRankingLab(request);
    const second = runCandidateRankingLab(request);

    expect(rankedSignature(first)).toEqual(rankedSignature(second));
    expect(
      first.pipeline.snapshots.map((snapshot) => ({
        stage: snapshot.stage,
        localizationStage: snapshot.localizationStage,
        componentId: snapshot.componentId,
        reasonCodes: snapshot.reasonCodes,
      })),
    ).toEqual(
      second.pipeline.snapshots.map((snapshot) => ({
        stage: snapshot.stage,
        localizationStage: snapshot.localizationStage,
        componentId: snapshot.componentId,
        reasonCodes: snapshot.reasonCodes,
      })),
    );
  });

  it("keeps hard eligibility truth ahead of scoring and assessment influence", () => {
    const noBench = runCandidateRankingLab({
      ...scenario("horizontal-pull-gym-neutral"),
      id: "final-no-bench-invariant",
      equipment: DUMBBELLS_NO_BENCH_EQUIPMENT,
    });
    const hardContraindication = runCandidateRankingLab(
      withPain(scenario("horizontal-push-phase-3"), {
        ...NO_PAIN_OR_INJURY,
        hardContraindications: [
          {
            kind: "hard_contraindication",
            id: "final-push-up-contraindication",
            exerciseIds: ["push-up"],
            reason: "Final invariant explicit push-up contraindication.",
            source: "clinician",
          },
        ],
      }),
    );
    const personalBlock = runCandidateRankingLab(scenario("bodyweight-personal-block-push-up"));

    expect(rejectedCodes(noBench, "chest-supported-dumbbell-row")).toContain("EQUIPMENT_UNAVAILABLE");
    expect(rejectedCodes(hardContraindication, "push-up")).toContain("HARD_CONTRAINDICATION");
    expect(rejectedCodes(personalBlock, "push-up")).toContain("PERSONAL_BLOCK");
    expect(noBench.rankedCandidates.map((candidate) => candidate.exercise.id)).not.toContain(
      "chest-supported-dumbbell-row",
    );
    expect(hardContraindication.rankedCandidates.map((candidate) => candidate.exercise.id)).not.toContain("push-up");
    expect(personalBlock.rankedCandidates.map((candidate) => candidate.exercise.id)).not.toContain("push-up");
  });

  it("keeps wrong-role candidates rejected even under high-confidence assessment relevance", () => {
    const scapularAssessment: AssessmentState = {
      signals: [
        {
          id: "final-high-confidence-scapular",
          type: "control_finding",
          source: "movement_screen",
          confidence: "high",
          priority: "primary",
          region: "shoulder",
          movementRole: "scapular_control",
          muscleGroup: "serratus",
          assessmentFeatures: ["serratus_or_protraction_control"],
          description: "High-confidence scapular finding should not legalize wrong-role lower-body work.",
        },
      ],
      historicalWeaknesses: [],
    };
    const result = runCandidateRankingLab(withAssessment(scenario("horizontal-push-phase-3"), scapularAssessment));

    expect(rejectedCodes(result, "goblet-squat")).toContain("MOVEMENT_ROLE_MISMATCH");
    expect(rejectedCodes(result, "goblet-squat")).toContain("TARGET_MUSCLE_MISMATCH");
    expect(result.rankedCandidates.map((candidate) => candidate.exercise.id)).not.toContain("goblet-squat");
  });

  it("keeps feature-specific scapular relevance observable without inventing feature challenge demand", () => {
    const serratusAssessment: AssessmentState = {
      signals: [
        {
          id: "final-serratus-feature",
          type: "control_finding",
          source: "movement_screen",
          confidence: "high",
          priority: "primary",
          region: "shoulder",
          movementRole: "scapular_control",
          muscleGroup: "serratus",
          assessmentFeatures: ["serratus_or_protraction_control"],
          description: "Feature-specific serratus/protraction finding.",
        },
      ],
      historicalWeaknesses: [],
    };
    const result = runCandidateRankingLab(withAssessment(scenario("scapular-activation-high-confidence"), serratusAssessment));
    const trace = component(result, "serratus-wall-slide", "assessment_fit").assessmentRelevance?.[0];

    expect(trace).toEqual(
      expect.objectContaining({
        relevance: "moderate",
        relationship: "neutral",
        featureTargetFitInfluence: 0.39,
        developmentalChallengeInfluence: 0,
        boundedInfluence: 0.39,
        assessmentContribution: 0.39,
        alignmentContribution: 0,
      }),
    );
    expect(trace?.featureDevelopment[0]).toEqual(
      expect.objectContaining({
        featureChallengeDemand: null,
        featureChallengeDemandSource: "not_modeled",
        featureDemandCapabilityMatch: "not_applicable",
      }),
    );
  });

  it("keeps transition knowledge out of direct scoring and automatic selection", () => {
    const base = exercise("machine-row");
    const withTransitions: ExerciseDefinition = {
      ...base,
      id: "machine-row-with-transition-knowledge",
      progression: {
        ...base.progression,
        transitionRelationships: base.progression.transitionRelationships,
      },
    };
    const withoutTransitions: ExerciseDefinition = {
      ...base,
      id: "machine-row-without-transition-knowledge",
      progression: {
        ...base.progression,
        transitionRelationships: [],
      },
    };
    const result = runCandidateRankingLab({
      ...scenario("horizontal-pull-gym-neutral"),
      id: "final-transition-score-invariant",
      candidatePool: [withTransitions, withoutTransitions],
    });

    expect(component(result, withTransitions.id, "progression_value").value).toBe(
      component(result, withoutTransitions.id, "progression_value").value,
    );
    expect(result.rankedCandidates.find((candidate) => candidate.exercise.id === withTransitions.id)?.total).toBe(
      result.rankedCandidates.find((candidate) => candidate.exercise.id === withoutTransitions.id)?.total,
    );
    expect(buildExerciseTransitionTraces(base, REFERENCE_EXERCISES).every((trace) => trace.automaticSelectionEffect === "none")).toBe(true);
  });

  it("keeps existing scenario corpus and source catalog stable for final audit coverage", () => {
    expect(CONTROLLED_CANDIDATE_SCENARIOS).toHaveLength(22);
    expect(REFERENCE_EXERCISES).toHaveLength(30);
    expect(
      REFERENCE_EXERCISES.reduce(
        (sum, candidate) => sum + candidate.progression.transitionRelationships.length,
        0,
      ),
    ).toBe(36);
    expect(
      REFERENCE_EXERCISES.filter(
        (candidate) =>
          candidate.progression.progressionAxes.length === 0 &&
          candidate.progression.transitionRelationships.length > 0,
      ),
    ).toEqual([]);
  });

  it("keeps history recency explicit through CandidateRequest.evaluationContext.asOf", () => {
    const baseRequest: CandidateRequest = {
      ...scenario("scapular-activation-high-confidence"),
      history: {
        ...EMPTY_TRAINING_HISTORY,
        exerciseHistory: {
          ...EMPTY_TRAINING_HISTORY.exerciseHistory,
          events: [
            {
              id: "final-history-recency",
              exerciseId: "band-face-pull",
              type: "appropriate_challenge",
              movementRole: "scapular_control",
              occurredAt: "2026-08-01T00:00:00.000Z",
              notes: "Recent relative to the explicit audit asOf.",
            },
          ],
        },
      },
    };
    const sameA = runCandidateRankingLab({
      ...baseRequest,
      evaluationContext: { asOf: "2026-08-10T00:00:00.000Z" },
    });
    const sameB = runCandidateRankingLab({
      ...baseRequest,
      evaluationContext: { asOf: "2026-08-10T00:00:00.000Z" },
    });
    const later = runCandidateRankingLab({
      ...baseRequest,
      evaluationContext: { asOf: "2027-08-10T00:00:00.000Z" },
    });
    const sameTrace = component(sameA, "serratus-wall-slide", "assessment_fit").assessmentRelevance?.[0];
    const sameAgainTrace = component(sameB, "serratus-wall-slide", "assessment_fit").assessmentRelevance?.[0];
    const laterTrace = component(later, "serratus-wall-slide", "assessment_fit").assessmentRelevance?.[0];

    expect(rankedSignature(sameA)).toEqual(rankedSignature(sameB));
    expect(sameTrace?.demandCapability.capabilityEstimate).toEqual(
      sameAgainTrace?.demandCapability.capabilityEstimate,
    );
    expect(sameTrace?.demandCapability.capabilityEstimate.historyEvidence).toEqual(
      expect.objectContaining({
        staleEventCount: 0,
        noRecencyEventCount: 0,
      }),
    );
    expect(laterTrace?.demandCapability.capabilityEstimate.historyEvidence).toEqual(
      expect.objectContaining({
        staleEventCount: 1,
        noRecencyEventCount: 0,
      }),
    );
  });

  it("keeps neutral unknown mechanics from producing positive assessment evidence", () => {
    const unknownDeadBug: ExerciseDefinition = {
      ...exercise("dead-bug"),
      id: "unknown-mechanics-dead-bug-final",
      mechanics: undefined,
    };
    const assessment: AssessmentState = {
      signals: [
        {
          id: "final-trunk-signal",
          type: "control_finding",
          source: "movement_screen",
          confidence: "high",
          priority: "primary",
          region: "lumbar_spine",
          movementRole: "anti_extension_core",
          description: "Trunk-control signal for unknown mechanics invariant.",
        },
      ],
      historicalWeaknesses: [],
    };
    const result = runCandidateRankingLab({
      ...withAssessment(scenario("scapular-activation-high-confidence"), assessment),
      id: "final-unknown-mechanics-invariant",
      need: {
        id: "final-unknown-mechanics-trunk-activation",
        whyNeeded: "Trunk activation invariant.",
        requestedRole: "activation",
        requestedSection: "activation",
        targetMovementRoles: ["anti_extension_core"],
        targetMuscles: ["trunk"],
        targetBodyRegions: ["lumbar_spine"],
        goal: "posture_and_movement_quality",
      },
      equipment: FULL_GYM_EQUIPMENT,
      candidatePool: [unknownDeadBug],
    });
    const trace = component(result, unknownDeadBug.id, "assessment_fit").assessmentRelevance?.[0];

    expect(trace?.demandCapability).toEqual(
      expect.objectContaining({
        candidateDemand: null,
        match: "not_applicable",
      }),
    );
    expect(trace?.boundedInfluence).toBe(0);
  });
});
