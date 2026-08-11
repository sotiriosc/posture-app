import { describe, expect, it } from "vitest";
import {
  CANDIDATE_PAIN_SCORING_COEFFICIENTS,
  NO_PAIN_OR_INJURY,
  REFERENCE_EXERCISES,
  getControlledCandidateScenario,
  runCandidateRankingLab,
  type CandidateRankingResult,
  type CandidateRequest,
  type ExerciseDefinition,
  type JointStressTag,
  type ModeratePain,
  type PainAndInjuryState,
  type RankedCandidate,
} from "../../src";

const FIXED_AS_OF = "2026-08-10T00:00:00.000Z";

function exercise(id: string): ExerciseDefinition {
  const found = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing exercise ${id}.`);
  }

  return found;
}

function squatRequest(input: {
  readonly id: string;
  readonly candidatePool: readonly ExerciseDefinition[];
  readonly painAndInjury: PainAndInjuryState;
}): CandidateRequest {
  const scenario = getControlledCandidateScenario("lower-squat-phase-1");
  if (!scenario) {
    throw new Error("Missing lower-squat-phase-1 scenario.");
  }

  return {
    ...scenario.request,
    id: input.id,
    evaluationContext: { asOf: FIXED_AS_OF },
    candidatePool: input.candidatePool,
    painAndInjury: input.painAndInjury,
  };
}

function stressVariant(input: {
  readonly id: string;
  readonly stressTags?: readonly JointStressTag[];
}): ExerciseDefinition {
  const base = exercise("goblet-squat");

  return {
    ...base,
    id: input.id,
    name: input.id,
    loading: {
      ...base.loading,
      jointStressTags: input.stressTags ?? [],
    },
    cautionStressTags: [],
    contraindicatedStressTags: [],
  };
}

function moderatePain(input: {
  readonly id?: string;
  readonly severity?: ModeratePain["severity0To10"];
  readonly response: ModeratePain["requiredResponse"];
  readonly stressTags?: readonly JointStressTag[];
}): ModeratePain {
  return {
    kind: "moderate_pain",
    id: input.id ?? `moderate-${input.response}`,
    region: "knee",
    severity0To10: input.severity ?? 4,
    stressTags: input.stressTags ?? ["loaded_knee_flexion"],
    requiredResponse: input.response,
    description: "Deterministic moderate-pain execution-readiness probe.",
  };
}

function painState(
  overrides: Partial<PainAndInjuryState>,
): PainAndInjuryState {
  return {
    ...NO_PAIN_OR_INJURY,
    ...overrides,
  };
}

function ranked(result: CandidateRankingResult, id: string): RankedCandidate {
  const found = result.rankedCandidates.find((candidate) => candidate.exercise.id === id);
  if (!found) {
    throw new Error(`Missing ranked candidate ${id}.`);
  }

  return found;
}

function component(candidate: RankedCandidate, id: string): number {
  const found = candidate.components.find((candidateComponent) => candidateComponent.id === id);
  if (!found) {
    throw new Error(`Missing ${id} for ${candidate.exercise.id}.`);
  }

  return found.rawValue;
}

function scoreSnapshot(result: CandidateRankingResult) {
  return result.rankedCandidates.map((candidate) => ({
    id: candidate.exercise.id,
    rank: candidate.rank,
    total: candidate.total,
    pain: component(candidate, "pain_suitability"),
    joint: component(candidate, "joint_cost"),
  }));
}

describe("response-led moderate-pain execution readiness", () => {
  it("classifies a mixed pool per legal candidate instead of poisoning the whole result", () => {
    const candidateA = stressVariant({ id: "a-executable" });
    const candidateB = stressVariant({
      id: "b-role-substitution",
      stressTags: ["loaded_knee_flexion"],
    });
    const candidateC = stressVariant({
      id: "c-hard-rejected-with-requirement",
      stressTags: ["loaded_knee_flexion"],
    });
    const result = runCandidateRankingLab(squatRequest({
      id: "mixed-candidate-readiness",
      candidatePool: [candidateA, candidateB, candidateC],
      painAndInjury: painState({
        moderatePain: [moderatePain({ response: "substitute_role" })],
        personalExerciseBlocks: [{
          kind: "personal_exercise_block",
          id: "block-candidate-c",
          exerciseIds: [candidateC.id],
          reason: "Mixed-pool hard-rejection probe.",
          createdBy: "athlete",
        }],
      }),
    }));

    expect(ranked(result, candidateA.id).painExecutionReadiness).toEqual(
      expect.objectContaining({
        readiness: "EXECUTABLE_AT_CANDIDATE_SCOPE",
        applicableRequirements: [],
        ignoredNotApplicableRequirements: [
          expect.objectContaining({
            executionStatus: "not_applicable_no_candidate_stress_match",
          }),
        ],
      }),
    );
    expect(ranked(result, candidateB.id).painExecutionReadiness.readiness).toBe(
      "REQUIRES_SESSION_ROLE_SUBSTITUTION",
    );
    expect(result.hardRejectedCandidates.map((candidate) => candidate.exercise.id)).toEqual([
      candidateC.id,
    ]);
    expect(
      result.decisionTrace.candidatePainSummaries.find(
        (summary) => summary.candidateExerciseId === candidateC.id,
      )?.executionReadiness.readiness,
    ).toBe("REQUIRES_SESSION_ROLE_SUBSTITUTION");
    expect(result.painExecutionReadiness).toEqual({
      selectedCandidateId: candidateA.id,
      selectedCandidatePainReadiness: "EXECUTABLE_AT_CANDIDATE_SCOPE",
      executableCandidateIds: [candidateA.id],
      bestExecutableCandidateId: candidateA.id,
      hasExecutableCandidate: true,
      urgentReviewSignalIds: [],
    });
    expect(result.decisionTrace.painExecutionReadiness).toEqual(
      result.painExecutionReadiness,
    );
  });

  it("keeps a prescription-required winner selected while exposing the best executable alternative", () => {
    const bodyweightBoxSquat = exercise("bodyweight-box-squat");
    const executableAlternative: ExerciseDefinition = {
      ...bodyweightBoxSquat,
      id: "bodyweight-box-squat-primary-strength-probe",
      trainingRoles: ["primary_strength", ...bodyweightBoxSquat.trainingRoles],
      sectionSuitability: {
        ...bodyweightBoxSquat.sectionSuitability,
        main: {
          suitability: "possible",
          reason: "Deliberately weak but legal main-section fit for readiness ordering.",
        },
      },
      phaseSuitability: {
        ...bodyweightBoxSquat.phaseSuitability,
        phase_1: {
          suitability: "poor",
          reason: "Deliberately weak but legal phase fit for readiness ordering.",
        },
      },
    };
    const request = squatRequest({
      id: "selected-requires-prescription",
      candidatePool: [exercise("leg-press"), executableAlternative],
      painAndInjury: painState({
        moderatePain: [moderatePain({
          response: "reduce_load_and_range",
          stressTags: ["loaded_knee_flexion"],
        })],
      }),
    });
    const result = runCandidateRankingLab(request);

    expect(result.rankedCandidates.map((candidate) => candidate.exercise.id)).toEqual([
      "leg-press",
      executableAlternative.id,
    ]);
    expect(result.painExecutionReadiness).toEqual({
      selectedCandidateId: "leg-press",
      selectedCandidatePainReadiness: "REQUIRES_PRESCRIPTION",
      executableCandidateIds: [executableAlternative.id],
      bestExecutableCandidateId: executableAlternative.id,
      hasExecutableCandidate: true,
      urgentReviewSignalIds: [],
    });
  });

  it("reports no executable candidate when every legal candidate has an applicable response", () => {
    const result = runCandidateRankingLab(squatRequest({
      id: "all-candidates-require-prescription",
      candidatePool: [exercise("goblet-squat"), exercise("leg-press")],
      painAndInjury: painState({
        moderatePain: [moderatePain({ response: "reduce_load_and_range" })],
      }),
    }));

    expect(result.rankedCandidates).toHaveLength(2);
    expect(result.rankedCandidates.every(
      (candidate) => candidate.painExecutionReadiness.readiness === "REQUIRES_PRESCRIPTION",
    )).toBe(true);
    expect(result.painExecutionReadiness.hasExecutableCandidate).toBe(false);
    expect(result.painExecutionReadiness.executableCandidateIds).toEqual([]);
    expect(result.painExecutionReadiness.bestExecutableCandidateId).toBeNull();
  });

  it("preserves explicit acute urgency globally without requiring a stress match", () => {
    const result = runCandidateRankingLab(squatRequest({
      id: "explicit-global-urgent-review",
      candidatePool: [stressVariant({ id: "urgent-no-match-candidate" })],
      painAndInjury: painState({
        acuteSeverePain: [{
          kind: "acute_severe_pain",
          id: "explicit-urgent-signal",
          region: "shoulder",
          severity0To10: 7,
          stressTags: ["overhead_pressing"],
          invalidatesTrainingRoles: [],
          urgentReviewRecommended: true,
          description: "Explicit urgency without candidate stress overlap.",
        }],
      }),
    }));

    expect(result.rankedCandidates).toHaveLength(1);
    expect(result.rankedCandidates[0]?.painExecutionReadiness).toEqual(
      expect.objectContaining({
        readiness: "URGENT_EXTERNAL_REVIEW",
        urgencySignals: [expect.objectContaining({ signalId: "explicit-urgent-signal" })],
      }),
    );
    expect(result.painExecutionReadiness.urgentReviewSignalIds).toEqual([
      "explicit-urgent-signal",
    ]);
    expect(result.painExecutionReadiness.selectedCandidatePainReadiness).toBe(
      "URGENT_EXTERNAL_REVIEW",
    );
  });

  it("uses the required candidate-readiness precedence", () => {
    const candidate = stressVariant({
      id: "readiness-precedence-candidate",
      stressTags: ["loaded_knee_flexion"],
    });
    const result = runCandidateRankingLab(squatRequest({
      id: "readiness-precedence",
      candidatePool: [candidate],
      painAndInjury: painState({
        moderatePain: [
          moderatePain({ id: "review", response: "avoid_aggravator" }),
          moderatePain({ id: "prescription", response: "reduce_load_and_range" }),
          moderatePain({ id: "role", response: "substitute_role" }),
        ],
        acuteSeverePain: [{
          kind: "acute_severe_pain",
          id: "urgent",
          region: "shoulder",
          severity0To10: 7,
          stressTags: [],
          invalidatesTrainingRoles: [],
          urgentReviewRecommended: true,
          description: "Precedence probe.",
        }],
      }),
    }));

    expect(result.rankedCandidates[0]?.painExecutionReadiness.readiness).toBe(
      "URGENT_EXTERNAL_REVIEW",
    );
  });

  it("keeps severities 3 through 6 numerically and legally flat while changing review urgency", () => {
    const candidatePool = [exercise("goblet-squat"), exercise("leg-press")];
    const results = ([3, 4, 5, 6] as const).map((severity) =>
      runCandidateRankingLab(squatRequest({
        id: `flat-moderate-severity-${severity}`,
        candidatePool,
        painAndInjury: painState({
          moderatePain: [moderatePain({
            severity,
            response: "avoid_aggravator",
          })],
        }),
      })),
    );

    expect(results.map(scoreSnapshot)).toEqual([
      scoreSnapshot(results[0]!),
      scoreSnapshot(results[0]!),
      scoreSnapshot(results[0]!),
      scoreSnapshot(results[0]!),
    ]);
    expect(results.every((result) => result.hardRejectedCandidates.length === 0)).toBe(true);
    expect(results.map((result) =>
      result.rankedCandidates[0]?.painMatchTrace.signalTraces[0]?.moderateReviewUrgency
    )).toEqual([
      "standard_moderate_review",
      "standard_moderate_review",
      "elevated_moderate_review_non_hard",
      "elevated_moderate_review_non_hard",
    ]);
    expect(results.map((result) =>
      result.rankedCandidates[0]?.eligibility.warnings[0]?.painEvidence?.moderateReviewUrgency
    )).toEqual([
      "standard_moderate_review",
      "standard_moderate_review",
      "elevated_moderate_review_non_hard",
      "elevated_moderate_review_non_hard",
    ]);
    expect(results.map((result) =>
      result.decisionTrace.candidatePainSummaries[0]?.moderateReviewUrgencies[0]?.urgency
    )).toEqual([
      "standard_moderate_review",
      "standard_moderate_review",
      "elevated_moderate_review_non_hard",
      "elevated_moderate_review_non_hard",
    ]);
  });

  it("keeps requiredResponse numerically neutral", () => {
    const responses = [
      "avoid_aggravator",
      "reduce_load_and_range",
      "substitute_role",
    ] as const;
    const results = responses.map((response) =>
      runCandidateRankingLab(squatRequest({
        id: `numeric-neutral-response-${response}`,
        candidatePool: [exercise("goblet-squat"), exercise("leg-press")],
        painAndInjury: painState({
          moderatePain: [moderatePain({ severity: 6, response })],
        }),
      })),
    );

    expect(results.map(scoreSnapshot)).toEqual([
      scoreSnapshot(results[0]!),
      scoreSnapshot(results[0]!),
      scoreSnapshot(results[0]!),
    ]);
    expect(results.map((result) =>
      result.painExecutionReadiness.selectedCandidatePainReadiness
    )).toEqual([
      "REQUIRES_CANDIDATE_REVIEW",
      "REQUIRES_PRESCRIPTION",
      "REQUIRES_SESSION_ROLE_SUBSTITUTION",
    ]);
  });

  it("preserves the existing canonical overlap deductions exactly", () => {
    const candidate = stressVariant({
      id: "one-overlap-unit",
      stressTags: ["loaded_knee_flexion"],
    });
    const noPain = runCandidateRankingLab(squatRequest({
      id: "overlap-baseline",
      candidatePool: [candidate],
      painAndInjury: NO_PAIN_OR_INJURY,
    }));
    const moderate = runCandidateRankingLab(squatRequest({
      id: "overlap-moderate",
      candidatePool: [candidate],
      painAndInjury: painState({
        moderatePain: [moderatePain({ response: "avoid_aggravator" })],
      }),
    }));
    const baselineCandidate = ranked(noPain, candidate.id);
    const moderateCandidate = ranked(moderate, candidate.id);

    expect(component(baselineCandidate, "pain_suitability") - component(moderateCandidate, "pain_suitability"))
      .toBeCloseTo(CANDIDATE_PAIN_SCORING_COEFFICIENTS.painSuitability.moderatePain, 12);
    expect(component(baselineCandidate, "joint_cost") - component(moderateCandidate, "joint_cost"))
      .toBeCloseTo(CANDIDATE_PAIN_SCORING_COEFFICIENTS.jointCost.moderatePain, 12);
  });
});
