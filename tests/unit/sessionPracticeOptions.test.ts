import { describe, expect, test } from "vitest";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import {
  deriveSessionPracticeOptions,
  recommendedPracticeModeForRecommendation,
  selectSessionPracticeItems,
} from "@/lib/sessionPracticeOptions";
import type {
  NextSessionRecommendation,
  Program,
  ProgramDay,
  ProgramRoutineItem,
  SessionRecord,
} from "@/lib/types";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

const questionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["dumbbells"],
  daysPerWeek: 3,
};

const item = (
  exerciseId: string,
  section: ProgramRoutineItem["section"],
  loadType: ProgramRoutineItem["loadType"] = "bodyweight",
  targetRPE?: number
): ProgramRoutineItem => ({
  exerciseId,
  section,
  sets: "2",
  reps: "8-10",
  durationSec: null,
  restSec: 60,
  loadType,
  prescription:
    targetRPE === undefined
      ? undefined
      : {
          targetRPE,
        },
});

const practiceDay: ProgramDay = {
  dayIndex: 0,
  title: "Practice Day",
  focusTags: ["upper", "core"],
  routine: [
    item("cat-cow", "warmup"),
    item("dead-bug", "activation"),
    item("dumbbell-rows", "main", "weighted", 8),
    item("plank", "main", "timed", 5),
    item("pallof-press", "accessory", "assisted", 6),
    item("doorway-pec-stretch", "cooldown", "bodyweight"),
  ],
};

const recommendation = (
  mode: NextSessionRecommendation["mode"]
): NextSessionRecommendation => ({
  mode,
  priority: mode === "recover" ? "high" : "medium",
  reasons: ["Recent feedback"],
  message: "Recommendation only.",
  suggestedAdjustments: ["Keep the next session conservative."],
});

const stableProgramProjection = (program: Program) => ({
  goalTrack: program.goalTrack,
  daysPerWeek: program.daysPerWeek,
  phaseIndex: program.phaseIndex,
  phaseName: program.phaseName,
  weekIndex: program.weekIndex,
  totalWeekIndex: program.totalWeekIndex,
  cycleIndex: program.cycleIndex,
  nextWeekPlan: program.nextWeekPlan,
  phaseObjective: program.phaseObjective,
  sessionAdaptation: program.sessionAdaptation,
  week: program.week,
});

describe("session practice options", () => {
  test("old sessions without selectedPracticeMode still work", () => {
    const oldSession: SessionRecord = {
      id: "old-session",
      userId: null,
      startedAt: "2026-02-15T00:00:00.000Z",
      completedAt: "2026-02-15T00:30:00.000Z",
      createdAt: "2026-02-15T00:00:00.000Z",
      updatedAt: "2026-02-15T00:30:00.000Z",
      routineId: "program-1",
      durationSec: 1800,
      notes: "dayIndex:0",
      feedback: null,
      source: "local",
      deletedAt: null,
    };

    expect(oldSession.selectedPracticeMode).toBeUndefined();
    expect(deriveSessionPracticeOptions(practiceDay, null)[0]).toMatchObject({
      mode: "full",
      label: "Full Session",
    });
  });

  test("full mode includes all items", () => {
    expect(selectSessionPracticeItems(practiceDay, "full")).toEqual(
      practiceDay.routine
    );
  });

  test("reduced mode includes fewer items and preserves warmup, corrective, and cooldown", () => {
    const selected = selectSessionPracticeItems(practiceDay, "reduced");
    const ids = selected.map((entry) => entry.exerciseId);

    expect(selected.length).toBeLessThan(practiceDay.routine.length);
    expect(ids).toEqual(
      expect.arrayContaining(["cat-cow", "dead-bug", "doorway-pec-stretch"])
    );
    expect(ids).toEqual(expect.arrayContaining(["dumbbell-rows", "plank"]));
  });

  test("recovery mode excludes main heavy work", () => {
    const selected = selectSessionPracticeItems(practiceDay, "recovery");
    const ids = selected.map((entry) => entry.exerciseId);

    expect(ids).not.toContain("dumbbell-rows");
    expect(ids).not.toContain("plank");
    expect(ids).toEqual(
      expect.arrayContaining(["cat-cow", "dead-bug", "doorway-pec-stretch"])
    );
  });

  test("recommendation mode maps to the expected suggested option", () => {
    expect(recommendedPracticeModeForRecommendation(recommendation("normal"))).toBe(
      "full"
    );
    expect(recommendedPracticeModeForRecommendation(recommendation("repeat"))).toBe(
      "steady"
    );
    expect(recommendedPracticeModeForRecommendation(recommendation("reduce"))).toBe(
      "reduced"
    );
    expect(
      recommendedPracticeModeForRecommendation(recommendation("simplify"))
    ).toBe("simplified");
    expect(recommendedPracticeModeForRecommendation(recommendation("recover"))).toBe(
      "recovery"
    );

    const options = deriveSessionPracticeOptions(
      practiceDay,
      recommendation("reduce")
    );
    expect(options.find((option) => option.isRecommended)?.mode).toBe("reduced");
  });

  test("deriving practice options does not alter seeded program output", () => {
    clearProgramVariationHistory();
    const before = generateWeeklyProgram(questionnaire, "practice-options-noop", {
      phaseIndex: 1,
      seed: "practice-options-noop-seed",
    });

    deriveSessionPracticeOptions(practiceDay, recommendation("recover"));
    selectSessionPracticeItems(practiceDay, "recovery");

    clearProgramVariationHistory();
    const after = generateWeeklyProgram(questionnaire, "practice-options-noop", {
      phaseIndex: 1,
      seed: "practice-options-noop-seed",
    });

    expect(stableProgramProjection(after)).toEqual(
      stableProgramProjection(before)
    );
  });
});
