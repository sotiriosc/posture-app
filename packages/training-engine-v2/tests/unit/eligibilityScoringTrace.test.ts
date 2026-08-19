import { describe, expect, it } from "vitest";
import {
  BODYWEIGHT_EQUIPMENT,
  DUMBBELLS_NO_BENCH_EQUIPMENT,
  FULL_GYM_EQUIPMENT,
  NO_PAIN_OR_INJURY,
  PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES,
  composeCandidateScore,
  createDecisionTrace,
  evaluateHardEligibility,
  type AthleteProfile,
  type CandidateTrace,
  type PainAndInjuryState,
} from "../../src";

const neutralAssessment = {
  signals: [],
  historicalWeaknesses: [],
};

const athlete: AthleteProfile = {
  id: "trace-athlete",
  label: "Trace athlete",
  experience: "beginner",
  primaryGoal: "strength",
  secondaryGoals: [],
  preferences: {
    preferredExerciseIds: [],
    dislikedExerciseIds: [],
    varietyPreference: "moderate",
    notes: [],
  },
  availability: {
    daysPerWeek: 3,
    minutesPerSession: 45,
    preferredTrainingDays: [],
  },
};

function exercise(id: string) {
  const found = REFERENCE_EXERCISES.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing exercise ${id}`);
  }
  return found;
}

describe("hard eligibility, score contracts, and trace structure", () => {
  it("rejects unavailable equipment without using hidden score penalties", () => {
    const eligibility = evaluateHardEligibility(exercise("dumbbell-bench-press"), {
      equipment: DUMBBELLS_NO_BENCH_EQUIPMENT,
      painAndInjury: NO_PAIN_OR_INJURY,
      assessment: neutralAssessment,
      requestedRole: "primary_strength",
      satisfiedPrerequisiteIds: [],
    });

    expect(eligibility.legal).toBe(false);
    expect(eligibility.rejectionReasons).toContainEqual(
      expect.objectContaining({ code: "EQUIPMENT_UNAVAILABLE" }),
    );
  });

  it("treats personal blocks as hard preference constraints, not medical contraindications", () => {
    const painAndInjury: PainAndInjuryState = {
      ...NO_PAIN_OR_INJURY,
      personalExerciseBlocks: [
        {
          kind: "personal_exercise_block",
          id: "user-blocked-push-up",
          exerciseIds: ["push-up"],
          reason: "The user blocked push-ups.",
          createdBy: "athlete",
        },
      ],
    };

    const eligibility = evaluateHardEligibility(exercise("push-up"), {
      equipment: BODYWEIGHT_EQUIPMENT,
      painAndInjury,
      assessment: neutralAssessment,
      requestedRole: "primary_strength",
      satisfiedPrerequisiteIds: ["push-up-plank-control"],
    });

    expect(eligibility.legal).toBe(false);
    expect(eligibility.rejectionReasons).toContainEqual(
      expect.objectContaining({
        code: "PERSONAL_BLOCK",
        source: "athlete_preference",
      }),
    );
  });

  it("does not use experience as a broad hard gate", () => {
    const eligibility = evaluateHardEligibility(exercise("dumbbell-shoulder-press"), {
      equipment: FULL_GYM_EQUIPMENT,
      painAndInjury: NO_PAIN_OR_INJURY,
      assessment: neutralAssessment,
      requestedRole: "primary_strength",
      satisfiedPrerequisiteIds: ["overhead-control"],
    });

    expect(eligibility.legal).toBe(true);
    expect(eligibility.rejectionReasons.map((reason) => reason.code)).not.toContain(
      "CAPABILITY_MISSING",
    );
  });

  it("models explicit prerequisites as hard capability requirements", () => {
    const eligibility = evaluateHardEligibility(exercise("dumbbell-romanian-deadlift"), {
      equipment: FULL_GYM_EQUIPMENT,
      painAndInjury: NO_PAIN_OR_INJURY,
      assessment: neutralAssessment,
      requestedRole: "primary_strength",
      satisfiedPrerequisiteIds: [],
    });

    expect(eligibility.legal).toBe(false);
    expect(eligibility.rejectionReasons).toContainEqual(
      expect.objectContaining({ code: "CAPABILITY_MISSING" }),
    );
  });

  it("keeps score components inspectable and deterministic", () => {
    const score = composeCandidateScore({
      exerciseId: "chest-supported-dumbbell-row",
      components: [
        {
          id: "b",
          family: "pain_suitability",
          value: 8,
          rawValue: 8,
          weight: 0,
          unnormalizedWeight: 0,
          weightedContribution: 0,
          reason: "Low lumbar stabilization requirement.",
          reasonCode: "ASSESSMENT_PRIORITY_SUPPORTED",
          source: "pain_injury",
        },
        {
          id: "a",
          family: "role_fit",
          value: 9,
          rawValue: 9,
          weight: 0,
          unnormalizedWeight: 0,
          weightedContribution: 0,
          reason: "Direct horizontal-pull role fit.",
          reasonCode: "ALIGNMENT_PRIORITY_SUPPORTED",
          source: "session_intent",
        },
      ],
    });

    expect(score.aggregate.method).toBe("unweighted_mean_foundation_placeholder");
    expect(score.aggregate.value).toBe(8.5);
    expect(score.aggregate.totalWeight).toBe(2);
    expect(score.aggregate.weightNormalization).toBe("equal_component_weight");
    expect(score.components.map((component) => component.id)).toEqual(["a", "b"]);
    expect(score.components.map((component) => component.weightedContribution)).toEqual([4.5, 4]);
  });

  it("provides developer-facing trace structure for candidates and hard rejections", () => {
    const legalEligibility = evaluateHardEligibility(exercise("seated-cable-row"), {
      equipment: FULL_GYM_EQUIPMENT,
      painAndInjury: NO_PAIN_OR_INJURY,
      assessment: neutralAssessment,
      requestedRole: "primary_strength",
      satisfiedPrerequisiteIds: [],
    });
    const rejectedEligibility = evaluateHardEligibility(exercise("dumbbell-bench-press"), {
      equipment: BODYWEIGHT_EQUIPMENT,
      painAndInjury: NO_PAIN_OR_INJURY,
      assessment: neutralAssessment,
      requestedRole: "primary_strength",
      satisfiedPrerequisiteIds: [],
    });
    const candidates: CandidateTrace[] = [
      {
        exerciseId: "seated-cable-row",
        eligibility: legalEligibility,
        score: composeCandidateScore({
          exerciseId: "seated-cable-row",
          components: [
            {
              id: "role",
              family: "role_fit",
              value: 9,
              rawValue: 9,
              weight: 0,
              unnormalizedWeight: 0,
              weightedContribution: 0,
              reason: "Horizontal pull match.",
              reasonCode: "ALIGNMENT_PRIORITY_SUPPORTED",
              source: "session_intent",
            },
          ],
        }),
      },
      {
        exerciseId: "dumbbell-bench-press",
        eligibility: rejectedEligibility,
      },
    ];

    const trace = createDecisionTrace({
      traceId: "trace-1",
      athlete,
      candidates,
      selectedExerciseId: "seated-cable-row",
      whyItWon: "Best legal candidate in this foundation trace.",
    });

    expect(trace.candidateCount).toBe(2);
    expect(trace.hardRejections).toHaveLength(1);
    expect(trace.topCandidateScores[0].exerciseId).toBe("seated-cable-row");
    expect(trace.interpretedAthleteState.primaryGoal).toBe("strength");
  });
});
