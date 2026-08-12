import { describe, expect, it } from "vitest";
import {
  FULL_GYM_EQUIPMENT,
  REFERENCE_EXERCISES,
  THREE_PHASE_FOUNDATION,
  calculateAssessmentRelevanceTraces,
  deriveAlignmentPriorities,
  getControlledCandidateScenario,
  runCandidateRankingLab,
  type AssessmentSignal,
  type AssessmentState,
  type CandidateRequest,
  type ExerciseDefinition,
} from "../../src";
import {
  ASSESSMENT_INFLUENCE_MAX,
  FEATURE_TARGET_FIT_MAX,
  calculateInfluenceBudget,
} from "../../src/candidate/scoring/assessment/influenceBudget";

const FIXED_AS_OF = "2026-08-10T00:00:00.000Z";

function requireExercise(id: string): ExerciseDefinition {
  const found = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing exercise ${id}`);
  }

  return found;
}

function requirePhase(id: "phase_1" | "phase_3") {
  const found = THREE_PHASE_FOUNDATION.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing phase ${id}`);
  }

  return found;
}

function featureSignal(
  overrides: Partial<AssessmentSignal> = {},
): AssessmentSignal {
  return {
    id: "target-fit-serratus",
    type: "control_finding",
    source: "movement_screen",
    confidence: "high",
    priority: "primary",
    region: "shoulder",
    movementRole: "scapular_control",
    muscleGroup: "serratus",
    assessmentFeatures: ["serratus_or_protraction_control"],
    description: "Feature-specific serratus target-fit test signal.",
    ...overrides,
  };
}

function requestWithSignal(
  signal: AssessmentSignal,
  overrides: Partial<CandidateRequest> = {},
): CandidateRequest {
  const scenario = getControlledCandidateScenario("scapular-activation-high-confidence");
  if (!scenario) {
    throw new Error("Missing scapular activation scenario.");
  }

  const assessment: AssessmentState = {
    signals: [signal],
    historicalWeaknesses: [],
  };

  return {
    ...scenario.request,
    id: `target-fit-${signal.id}`,
    equipment: FULL_GYM_EQUIPMENT,
    evaluationContext: { asOf: FIXED_AS_OF },
    assessment,
    alignmentPriorities: deriveAlignmentPriorities(assessment).priorities,
    ...overrides,
  };
}

function traceFor(request: CandidateRequest, exercise: ExerciseDefinition) {
  const trace = calculateAssessmentRelevanceTraces({ request, exercise })[0];
  if (!trace) {
    throw new Error(`Missing assessment trace for ${exercise.id}`);
  }

  return trace;
}

function withSerratusExpression(input: {
  readonly id: string;
  readonly level: "low" | "moderate" | "high" | "unknown";
  readonly reviewStatus: "accepted" | "needs_review";
  readonly profileReviewStatus: "accepted" | "needs_review";
}): ExerciseDefinition {
  const wallSlide = requireExercise("serratus-wall-slide");
  const mechanics = wallSlide.mechanics;
  const scapularMechanics = mechanics?.scapularMechanics;
  if (!mechanics || !scapularMechanics) {
    throw new Error("Serratus wall slide needs mechanics for target-fit tests.");
  }

  return {
    ...wallSlide,
    id: input.id,
    name: input.id,
    mechanics: {
      ...mechanics,
      scapularMechanics: {
        ...scapularMechanics,
        reviewStatus: input.profileReviewStatus,
        serratusContribution: {
          ...scapularMechanics.serratusContribution,
          level: input.level,
          source: input.level === "unknown" ? "unknown" : "reference_catalog",
          reviewStatus: input.reviewStatus,
          notes: `Synthetic ${input.level} serratus expression.`,
        },
      },
    },
  };
}

describe("feature target fit", () => {
  it("preserves reviewed feature-match ordering without inventing negative evidence", () => {
    const request = requestWithSignal(featureSignal());
    const strong = traceFor(request, withSerratusExpression({
      id: "accepted-high-serratus",
      level: "high",
      reviewStatus: "accepted",
      profileReviewStatus: "accepted",
    }));
    const moderate = traceFor(request, requireExercise("serratus-wall-slide"));
    const weak = traceFor(request, withSerratusExpression({
      id: "review-moderate-serratus",
      level: "moderate",
      reviewStatus: "needs_review",
      profileReviewStatus: "needs_review",
    }));
    const low = traceFor(request, withSerratusExpression({
      id: "accepted-low-serratus",
      level: "low",
      reviewStatus: "accepted",
      profileReviewStatus: "accepted",
    }));
    const unknown = traceFor(request, withSerratusExpression({
      id: "unknown-serratus",
      level: "unknown",
      reviewStatus: "needs_review",
      profileReviewStatus: "needs_review",
    }));
    const multiFeature = traceFor(
      requestWithSignal(featureSignal({
        id: "multi-feature-target-fit",
        assessmentFeatures: ["serratus_or_protraction_control", "retraction_control"],
      })),
      requireExercise("serratus-wall-slide"),
    );

    expect(strong.featureMatches[0]?.featureMatch).toBe("strong");
    expect(moderate.featureMatches[0]?.featureMatch).toBe("moderate");
    expect(weak.featureMatches[0]?.featureMatch).toBe("weak");
    expect(low.featureMatches[0]?.featureMatch).toBe("low_expression");
    expect(unknown.featureMatches[0]?.featureMatch).toBe("unknown");
    expect(strong.featureTargetFitInfluence).toBe(FEATURE_TARGET_FIT_MAX);
    expect(moderate.featureTargetFitInfluence).toBe(0.39);
    expect(weak.featureTargetFitInfluence).toBe(0.21);
    expect(low.featureTargetFitInfluence).toBe(0);
    expect(unknown.featureTargetFitInfluence).toBe(0);
    expect(strong.featureTargetFitInfluence).toBeGreaterThan(
      moderate.featureTargetFitInfluence,
    );
    expect(moderate.featureTargetFitInfluence).toBeGreaterThan(
      weak.featureTargetFitInfluence,
    );
    expect(low.featureTargetFit[0]?.influence).toBe(0);
    expect(unknown.featureTargetFit[0]?.influence).toBe(0);
    expect(multiFeature.featureTargetFit).toEqual([
      expect.objectContaining({
        assessmentFeature: "serratus_or_protraction_control",
        relevance: "moderate",
        influence: 0.39,
      }),
      expect.objectContaining({
        assessmentFeature: "retraction_control",
        relevance: "none",
        influence: 0,
      }),
    ]);
    expect(multiFeature.featureTargetFitInfluence).toBe(0.39);
  });

  it("scales target fit by confidence and priority only after relevance is established", () => {
    const wallSlide = requireExercise("serratus-wall-slide");
    const highPrimary = traceFor(
      requestWithSignal(featureSignal({ confidence: "high", priority: "primary" })),
      wallSlide,
    );
    const lowPrimary = traceFor(
      requestWithSignal(featureSignal({ id: "low-target-fit", confidence: "low" })),
      wallSlide,
    );
    const highSecondary = traceFor(
      requestWithSignal(featureSignal({ id: "secondary-target-fit", priority: "secondary" })),
      wallSlide,
    );
    const highContext = traceFor(
      requestWithSignal(featureSignal({ id: "context-target-fit", priority: "context" })),
      wallSlide,
    );

    expect(highPrimary.featureTargetFitInfluence).toBe(0.39);
    expect(lowPrimary.featureTargetFitInfluence).toBe(0.078);
    expect(highSecondary.featureTargetFitInfluence).toBe(0.254);
    expect(highContext.featureTargetFitInfluence).toBe(0.117);
    expect(lowPrimary.featureTargetFitInfluence).toBeLessThan(
      highPrimary.featureTargetFitInfluence,
    );
    expect(highSecondary.featureTargetFitInfluence).toBeLessThan(
      highPrimary.featureTargetFitInfluence,
    );
    expect(highContext.featureTargetFitInfluence).toBeLessThan(
      highPrimary.featureTargetFitInfluence,
    );
  });

  it("keeps target fit independent of severity and feature capability priors", () => {
    const wallSlide = requireExercise("serratus-wall-slide");
    const unknownSeverity = traceFor(requestWithSignal(featureSignal()), wallSlide);
    const mildSeverity = traceFor(
      requestWithSignal(featureSignal({ id: "mild-target-fit", severity: "mild" })),
      wallSlide,
    );
    const moderateSeverity = traceFor(
      requestWithSignal(featureSignal({ id: "moderate-target-fit", severity: "moderate" })),
      wallSlide,
    );
    const phaseOne = traceFor(
      requestWithSignal(featureSignal({ id: "phase-one-target-fit" }), {
        phase: requirePhase("phase_1"),
      }),
      wallSlide,
    );
    const phaseThree = traceFor(
      requestWithSignal(featureSignal({ id: "phase-three-target-fit" }), {
        phase: requirePhase("phase_3"),
      }),
      wallSlide,
    );

    expect([
      unknownSeverity.featureTargetFitInfluence,
      mildSeverity.featureTargetFitInfluence,
      moderateSeverity.featureTargetFitInfluence,
      phaseOne.featureTargetFitInfluence,
      phaseThree.featureTargetFitInfluence,
    ]).toEqual([0.39, 0.39, 0.39, 0.39, 0.39]);
    expect(unknownSeverity.featureDevelopment[0]?.featureCapabilityEstimate).toBeGreaterThan(
      mildSeverity.featureDevelopment[0]?.featureCapabilityEstimate ?? 0,
    );
    expect(mildSeverity.featureDevelopment[0]?.featureCapabilityEstimate).toBeGreaterThan(
      moderateSeverity.featureDevelopment[0]?.featureCapabilityEstimate ?? 0,
    );
    expect(phaseOne.featureDevelopment[0]?.featureCapabilityEstimate).not.toBe(
      phaseThree.featureDevelopment[0]?.featureCapabilityEstimate,
    );
  });

  it("keeps target fit independent of generic scapular task demand", () => {
    const wallSlide = requireExercise("serratus-wall-slide");
    const mechanics = wallSlide.mechanics;
    if (!mechanics) {
      throw new Error("Serratus wall slide needs mechanics for demand independence.");
    }
    const request = requestWithSignal(featureSignal());
    const withDemand = (level: "low" | "high"): ExerciseDefinition => ({
      ...wallSlide,
      id: `wall-slide-${level}-generic-demand`,
      mechanics: {
        ...mechanics,
        demands: {
          ...mechanics.demands,
          scapular_control: {
            ...mechanics.demands.scapular_control,
            level,
          },
        },
      },
    });
    const lowDemand = traceFor(request, withDemand("low"));
    const highDemand = traceFor(request, withDemand("high"));

    expect(lowDemand.demandCapability.candidateDemand).toBe(1);
    expect(highDemand.demandCapability.candidateDemand).toBe(3);
    expect(lowDemand.featureTargetFitInfluence).toBe(0.39);
    expect(highDemand.featureTargetFitInfluence).toBe(0.39);
  });

  it("keeps feature target fit assessment-only and globally bounds combined influence", () => {
    const targetOnly = traceFor(
      requestWithSignal(featureSignal()),
      requireExercise("serratus-wall-slide"),
    );
    const combined = calculateInfluenceBudget({
      signal: featureSignal(),
      relevance: "high",
      relationship: "provides_appropriate_exposure",
      capabilityEvidenceQuality: "strong",
      alignmentEligible: true,
      featureTargetFitInfluence: 99,
    });

    expect(targetOnly.assessmentContribution).toBe(0.39);
    expect(targetOnly.alignmentContribution).toBe(0);
    expect(targetOnly.contributesTo).toEqual(["assessment_fit"]);
    expect(combined.featureTargetFitInfluence).toBe(FEATURE_TARGET_FIT_MAX);
    expect(combined.developmentalChallengeInfluence).toBe(ASSESSMENT_INFLUENCE_MAX);
    expect(combined.boundedInfluence).toBe(ASSESSMENT_INFLUENCE_MAX);
    expect(Number((combined.assessmentContribution + combined.alignmentContribution).toFixed(3)))
      .toBe(ASSESSMENT_INFLUENCE_MAX);
  });

  it("keeps generic signals off the target channel and strong wrong-role candidates rejected", () => {
    const wallSlide = requireExercise("serratus-wall-slide");
    const genericSignal = featureSignal({
      id: "generic-scapular-control",
      muscleGroup: undefined,
      assessmentFeatures: undefined,
    });
    const genericTrace = traceFor(requestWithSignal(genericSignal), wallSlide);
    const acceptedStrong = withSerratusExpression({
      id: "legal-strong-serratus",
      level: "high",
      reviewStatus: "accepted",
      profileReviewStatus: "accepted",
    });
    const wrongRole: ExerciseDefinition = {
      ...acceptedStrong,
      id: "wrong-role-strong-serratus",
      movementRoles: ["squat"],
      trainingRoles: ["primary_strength"],
      muscleContributions: [
        { ...acceptedStrong.muscleContributions[0], muscle: "quads", relationship: "primary_target", notes: "Synthetic wrong-role primary." },
        { ...acceptedStrong.muscleContributions[0], muscle: "glutes", relationship: "key_secondary_target", notes: "Synthetic wrong-role secondary." },
      ],
      primaryMuscles: ["quads"],
      secondaryMuscles: ["glutes"],
      sectionSuitability: {
        main: {
          suitability: "good",
          reason: "Synthetic wrong-role main exercise.",
        },
      },
    };
    const request = requestWithSignal(featureSignal(), {
      candidatePool: [wrongRole, acceptedStrong],
    });
    const result = runCandidateRankingLab(request);
    const rejection = result.hardRejectedCandidates.find(
      (candidate) => candidate.exercise.id === wrongRole.id,
    );
    const wrongRoleTrace = traceFor(request, wrongRole);

    expect(genericTrace.featureTargetFit).toEqual([]);
    expect(genericTrace.featureTargetFitInfluence).toBe(0);
    expect(result.rankedCandidates.map((candidate) => candidate.exercise.id)).toEqual([
      acceptedStrong.id,
    ]);
    expect(rejection?.eligibility.rejectionReasons.map((reason) => reason.code)).toEqual(
      expect.arrayContaining([
        "ROLE_MISMATCH",
        "SECTION_MISMATCH",
        "MOVEMENT_ROLE_MISMATCH",
        "TARGET_MUSCLE_MISMATCH",
      ]),
    );
    expect(wrongRoleTrace.relevance).toBe("none");
    expect(wrongRoleTrace.featureTargetFitInfluence).toBe(0);
  });
});
