import { describe, expect, it } from "vitest";
import {
  REFERENCE_EXERCISES,
  continuityValueComponent,
  getControlledCandidateScenario,
  runCandidateRankingLab,
  type CandidateRequest,
  type RankedCandidate,
} from "../../src";

const EXERCISE_ID = "chest-supported-dumbbell-row";
const FIXED_AS_OF = "2026-08-10T00:00:00.000Z";

interface ContinuityEvidence {
  readonly current?: boolean;
  readonly previous?: boolean;
  readonly productive?: boolean;
  readonly stable?: boolean;
  readonly plateaued?: boolean;
  readonly failedProgression?: boolean;
  readonly painResponse?: boolean;
  readonly blocked?: boolean;
  readonly readyToProgress?: boolean;
  readonly stalled?: boolean;
}

function baseRequest(): CandidateRequest {
  const scenario = getControlledCandidateScenario("horizontal-pull-gym-neutral");
  if (!scenario) {
    throw new Error("Missing horizontal-pull-gym-neutral scenario");
  }

  return {
    ...scenario.request,
    evaluationContext: { asOf: FIXED_AS_OF },
  };
}

function requestWithEvidence(id: string, evidence: ContinuityEvidence): CandidateRequest {
  const request = baseRequest();

  return {
    ...request,
    id,
    continuity: {
      currentExerciseId: evidence.current ? EXERCISE_ID : undefined,
      previousExerciseId: evidence.previous ? EXERCISE_ID : undefined,
      productiveExerciseIds: evidence.productive ? [EXERCISE_ID] : [],
      plateauedExerciseIds: evidence.plateaued ? [EXERCISE_ID] : [],
      failedProgressionExerciseIds: evidence.failedProgression ? [EXERCISE_ID] : [],
      painResponseExerciseIds: evidence.painResponse ? [EXERCISE_ID] : [],
    },
    history: {
      ...request.history,
      exerciseHistory: {
        ...request.history.exerciseHistory,
        events: [],
        stableExerciseIds: evidence.stable ? [EXERCISE_ID] : [],
        blockedExerciseIds: evidence.blocked ? [EXERCISE_ID] : [],
      },
      progressionState: {
        ...request.history.progressionState,
        readyToProgressExerciseIds: evidence.readyToProgress ? [EXERCISE_ID] : [],
        stalledExerciseIds: evidence.stalled ? [EXERCISE_ID] : [],
      },
    },
  };
}

function exercise() {
  const found = REFERENCE_EXERCISES.find((candidate) => candidate.id === EXERCISE_ID);
  if (!found) {
    throw new Error(`Missing ${EXERCISE_ID}`);
  }

  return found;
}

function continuityComponent(evidence: ContinuityEvidence) {
  return continuityValueComponent.score({
    request: requestWithEvidence("continuity-component-test", evidence),
    exercise: exercise(),
  });
}

function rankedCandidate(request: CandidateRequest): RankedCandidate {
  const candidate = runCandidateRankingLab(request).rankedCandidates.find(
    (ranked) => ranked.exercise.id === EXERCISE_ID,
  );
  if (!candidate) {
    throw new Error(`Missing ranked candidate ${EXERCISE_ID}`);
  }

  return candidate;
}

function rankedContinuity(candidate: RankedCandidate) {
  const component = candidate.components.find((entry) => entry.id === "continuity_value");
  if (!component) {
    throw new Error(`Missing continuity_value for ${candidate.exercise.id}`);
  }

  return component;
}

describe("continuity reason-code truth", () => {
  it("reports SCORE_NEUTRAL when no continuity evidence exists", () => {
    const component = continuityComponent({});

    expect(component.rawValue).toBe(5.6);
    expect(component.reasonCode).toBe("SCORE_NEUTRAL");
    expect(component.reason).toContain("retention=[none]");
    expect(component.reason).toContain("reconsideration=[none]");
  });

  it.each([
    ["current only", { current: true }, 6.7, "retention=[current]"],
    ["previous only", { previous: true }, 6.2, "retention=[previous]"],
    [
      "productive and stable",
      { productive: true, stable: true },
      7.6,
      "retention=[productive, stable]",
    ],
  ] as const)("reports CONTINUITY_FAVORED for %s", (_label, evidence, value, reason) => {
    const component = continuityComponent(evidence);

    expect(component.rawValue).toBe(value);
    expect(component.reasonCode).toBe("CONTINUITY_FAVORED");
    expect(component.reason).toContain(reason);
    expect(component.reason).toContain("reconsideration=[none]");
  });

  it.each([
    [
      "current + productive + plateau",
      { current: true, productive: true, plateaued: true },
      6.5,
      "retention=[current, productive]",
      "reconsideration=[plateaued]",
    ],
    [
      "previous + failed progression",
      { previous: true, failedProgression: true },
      5,
      "retention=[previous]",
      "reconsideration=[failed_progression]",
    ],
    [
      "stable + pain response",
      { stable: true, painResponse: true },
      4.1,
      "retention=[stable]",
      "reconsideration=[pain_response]",
    ],
    [
      "productive + blocked history",
      { productive: true, blocked: true },
      4.5,
      "retention=[productive]",
      "reconsideration=[blocked]",
    ],
  ] as const)(
    "gives reconsideration precedence for %s",
    (_label, evidence, value, retentionReason, reconsiderationReason) => {
      const component = continuityComponent(evidence);

      expect(component.rawValue).toBe(value);
      expect(component.reasonCode).toBe("REPLACEMENT_JUSTIFIED");
      expect(component.reason).toContain(retentionReason);
      expect(component.reason).toContain(reconsiderationReason);
      expect(component.reason).toContain("does not replace the exercise automatically");
    },
  );

  it("exposes every active retention and reconsideration fact in mixed evidence", () => {
    const component = continuityComponent({
      current: true,
      previous: true,
      productive: true,
      stable: true,
      plateaued: true,
      failedProgression: true,
      painResponse: true,
      blocked: true,
    });

    expect(component.reasonCode).toBe("REPLACEMENT_JUSTIFIED");
    expect(component.reason).toContain("retention=[current, previous, productive, stable]");
    expect(component.reason).toContain(
      "reconsideration=[plateaued, failed_progression, pain_response, blocked]",
    );
  });

  it.each([
    ["base", {}, 5.6],
    ["current", { current: true }, 6.7],
    ["previous", { previous: true }, 6.2],
    ["productive", { productive: true }, 6.9],
    ["stable", { stable: true }, 6.3],
    ["plateaued", { plateaued: true }, 4.1],
    ["failed progression", { failedProgression: true }, 4.4],
    ["pain response", { painResponse: true }, 3.4],
    ["blocked", { blocked: true }, 3.2],
    [
      "all evidence",
      {
        current: true,
        previous: true,
        productive: true,
        stable: true,
        plateaued: true,
        failedProgression: true,
        painResponse: true,
        blocked: true,
      },
      2,
    ],
  ] as const)("preserves the existing %s continuity raw value", (_label, evidence, value) => {
    expect(continuityComponent(evidence).rawValue).toBe(value);
  });

  it("keeps the previous-only total and rank while correcting its reason code", () => {
    const candidate = rankedCandidate(
      requestWithEvidence("continuity-previous-only-ranking", { previous: true }),
    );

    expect(rankedContinuity(candidate)).toEqual(
      expect.objectContaining({
        rawValue: 6.2,
        reasonCode: "CONTINUITY_FAVORED",
      }),
    );
    expect(candidate.total).toBe(8.053);
    expect(candidate.rank).toBe(1);
  });

  it.each([
    [
      "no history",
      {},
      5.6,
      "SCORE_NEUTRAL",
      8.017,
      3,
      ["machine-row", "seated-cable-row", EXERCISE_ID, "one-arm-dumbbell-row"],
    ],
    [
      "productive + stable",
      { current: true, productive: true, stable: true },
      8.7,
      "CONTINUITY_FAVORED",
      8.201,
      1,
      [EXERCISE_ID, "machine-row", "seated-cable-row", "one-arm-dumbbell-row"],
    ],
    [
      "readyToProgress + productive",
      { current: true, productive: true, readyToProgress: true },
      8,
      "CONTINUITY_FAVORED",
      8.218,
      1,
      [EXERCISE_ID, "machine-row", "seated-cable-row", "one-arm-dumbbell-row"],
    ],
    [
      "plateau + failed progression",
      { current: true, plateaued: true, failedProgression: true, stalled: true },
      4,
      "REPLACEMENT_JUSTIFIED",
      7.792,
      4,
      ["machine-row", "seated-cable-row", "one-arm-dumbbell-row", EXERCISE_ID],
    ],
    [
      "pain response + blocked",
      { current: true, painResponse: true, blocked: true },
      2.1,
      "REPLACEMENT_JUSTIFIED",
      7.81,
      4,
      ["machine-row", "seated-cable-row", "one-arm-dumbbell-row", EXERCISE_ID],
    ],
  ] as const)(
    "preserves representative totals and ranks for %s",
    (_label, evidence, rawValue, reasonCode, total, rank, ranking) => {
      const request = requestWithEvidence(`continuity-ranking-${_label}`, evidence);
      const result = runCandidateRankingLab(request);
      const candidate = result.rankedCandidates.find(
        (ranked) => ranked.exercise.id === EXERCISE_ID,
      );
      if (!candidate) {
        throw new Error(`Missing ranked candidate ${EXERCISE_ID}`);
      }

      expect(rankedContinuity(candidate)).toEqual(
        expect.objectContaining({ rawValue, reasonCode }),
      );
      expect(candidate.total).toBe(total);
      expect(candidate.rank).toBe(rank);
      expect(result.rankedCandidates.map((ranked) => ranked.exercise.id)).toEqual(ranking);
    },
  );
});
