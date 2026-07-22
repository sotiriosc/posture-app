import { describe, expect, test } from "vitest";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import {
  deriveSessionPracticeOptions,
  normalizePracticeMode,
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
      label: "Full",
    });
  });

  test("exactly three options are offered: full, lighter, recovery", () => {
    const options = deriveSessionPracticeOptions(practiceDay, null);
    expect(options.map((option) => option.mode)).toEqual([
      "full",
      "lighter",
      "recovery",
    ]);
  });

  test("full mode includes all items", () => {
    expect(selectSessionPracticeItems(practiceDay, "full")).toEqual(
      practiceDay.routine
    );
  });

  const mainWorkVolume = (items: ProgramRoutineItem[]) =>
    items
      .filter((entry) => (entry.section ?? "main") === "main")
      .reduce((sum, entry) => sum + Number.parseInt(String(entry.sets), 10), 0);

  const mainIds = (items: ProgramRoutineItem[]) =>
    items
      .filter((entry) => (entry.section ?? "main") === "main")
      .map((entry) => entry.exerciseId)
      .sort();

  test("lighter mode keeps the same movement patterns with demonstrably less work", () => {
    const full = selectSessionPracticeItems(practiceDay, "full");
    const lighter = selectSessionPracticeItems(practiceDay, "lighter");

    // Same main movement patterns as the full session.
    expect(mainIds(lighter)).toEqual(mainIds(full));
    // But strictly less main-slot work volume.
    expect(mainWorkVolume(lighter)).toBeLessThan(mainWorkVolume(full));
    // Warmup/corrective prep is preserved.
    expect(lighter.map((entry) => entry.exerciseId)).toEqual(
      expect.arrayContaining(["cat-cow", "dead-bug"])
    );
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

  test("legacy stored modes migrate to the canonical three on read", () => {
    expect(normalizePracticeMode("steady")).toBe("full");
    expect(normalizePracticeMode("reduced")).toBe("lighter");
    expect(normalizePracticeMode("simplified")).toBe("lighter");
    expect(normalizePracticeMode("recovery")).toBe("recovery");
    expect(normalizePracticeMode("full")).toBe("full");
    expect(normalizePracticeMode("lighter")).toBe("lighter");
    expect(normalizePracticeMode(undefined)).toBe("full");

    // A legacy value fed to the read path resolves exactly like its new mode.
    expect(selectSessionPracticeItems(practiceDay, "steady")).toEqual(
      selectSessionPracticeItems(practiceDay, "full")
    );
    expect(selectSessionPracticeItems(practiceDay, "reduced")).toEqual(
      selectSessionPracticeItems(practiceDay, "lighter")
    );
    expect(selectSessionPracticeItems(practiceDay, "simplified")).toEqual(
      selectSessionPracticeItems(practiceDay, "lighter")
    );
  });

  test("recommendation mode maps to the expected suggested option", () => {
    expect(recommendedPracticeModeForRecommendation(recommendation("normal"))).toBe(
      "full"
    );
    expect(recommendedPracticeModeForRecommendation(recommendation("repeat"))).toBe(
      "full"
    );
    expect(recommendedPracticeModeForRecommendation(recommendation("reduce"))).toBe(
      "lighter"
    );
    expect(
      recommendedPracticeModeForRecommendation(recommendation("simplify"))
    ).toBe("lighter");
    expect(recommendedPracticeModeForRecommendation(recommendation("recover"))).toBe(
      "recovery"
    );

    const options = deriveSessionPracticeOptions(
      practiceDay,
      recommendation("reduce")
    );
    expect(options.find((option) => option.isRecommended)?.mode).toBe("lighter");
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

  test("real generated persona: lighter is strictly lighter than full, same patterns (anchor)", () => {
    clearProgramVariationHistory();
    const program = generateWeeklyProgram(questionnaire, "lighter-anchor", {
      phaseIndex: 1,
      seed: "lighter-anchor-seed",
    });

    const fullTotal = program.week.reduce(
      (sum, day) => sum + mainWorkVolume(selectSessionPracticeItems(day, "full")),
      0
    );
    const lighterTotal = program.week.reduce(
      (sum, day) => sum + mainWorkVolume(selectSessionPracticeItems(day, "lighter")),
      0
    );

    // Demonstrably lighter total main-slot work volume across the week.
    expect(lighterTotal).toBeLessThan(fullTotal);

    // Every day keeps the same main movement patterns under "lighter".
    program.week.forEach((day) => {
      expect(mainIds(selectSessionPracticeItems(day, "lighter"))).toEqual(
        mainIds(selectSessionPracticeItems(day, "full"))
      );
    });
  });
});
