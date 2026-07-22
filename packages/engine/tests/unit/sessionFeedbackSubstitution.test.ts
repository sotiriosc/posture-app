import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import { computeEquipmentCapability } from "@/lib/engine/equipmentCapability";
import {
  daySatisfiesSpec,
  generateWeeklyProgram,
  resolveDayConstraintSpec,
} from "@/lib/program";
import type { ExerciseFeedbackSummary } from "@/lib/logStore";
import type { ExerciseLog } from "@/lib/types";

const questionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Intermediate",
  equipment: ["gym"],
  daysPerWeek: 4,
};

const toCapabilityMode = (
  value: QuestionnaireData
): "noneOnly" | "bandOnly" | "hasLoad" => {
  const capability = computeEquipmentCapability(value.equipment);
  if (capability.hasLoad) return "hasLoad";
  if (capability.hasBand) return "bandOnly";
  return "noneOnly";
};

const inferMainLane = (exerciseId: string) => {
  const exercise = exerciseById(exerciseId);
  if (!exercise) return null;
  const patterns = new Set(
    exercise.movementPattern.map((pattern) =>
      pattern.trim().toLowerCase().replace(/[\s-]+/g, "")
    )
  );
  if (patterns.has("verticalpush")) return "verticalpush";
  if (patterns.has("push")) return "push";
  if (patterns.has("pull")) return "pull";
  if (patterns.has("squat")) return "squat";
  if (patterns.has("hinge")) return "hinge";
  return null;
};

const assertContractsHold = (
  value: QuestionnaireData,
  week: ReturnType<typeof generateWeeklyProgram>["week"]
) => {
  const capabilityMode = toCapabilityMode(value);
  week.forEach((day) => {
    const spec = resolveDayConstraintSpec({
      day,
      daysPerWeek: value.daysPerWeek,
      capabilityMode,
    });
    if (!spec) return;
    const result = daySatisfiesSpec(day, spec);
    expect(
      result.ok,
      `${day.title} missing=[${result.missing
        .map((rule) => rule.id)
        .join(",")}] violations=[${result.violations
        .map((entry) => `${entry.exerciseId}:${entry.section}`)
        .join(",")}]`
    ).toBe(true);
  });
};

const makeSummaryMap = (entries: ExerciseFeedbackSummary[]) =>
  new Map(entries.map((entry) => [entry.exerciseId, entry] as const));

describe("feedback-driven substitution", () => {
  test("risky main gets same-lane replacement without changing main count", () => {
    const baseline = generateWeeklyProgram(questionnaire, "substitution-baseline", {
      seed: "feedback-substitution-seed",
    });

    const baselineUpperPull = baseline.week.find((day) =>
      day.title.toLowerCase().includes("upper pull")
    );
    expect(baselineUpperPull).toBeTruthy();

    const baselineMainEntries =
      baselineUpperPull?.routine
        .map((item, index) => ({ item, index }))
        .filter((entry) => entry.item.section === "main") ?? [];
    expect(baselineMainEntries.length).toBeGreaterThan(0);

    const riskyEntry = baselineMainEntries[0];
    const riskyExerciseId = riskyEntry.item.exerciseId;
    const riskyLane = inferMainLane(riskyExerciseId);
    expect(riskyLane).toBe("pull");

    const feedbackMap = makeSummaryMap([
      {
        exerciseId: riskyExerciseId,
        pain: "severe",
        difficulty: "failed",
        completionRate: 0.4,
      },
    ]);

    const adjusted = generateWeeklyProgram(questionnaire, "substitution-adjusted", {
      seed: "feedback-substitution-seed",
      feedbackSummaryByExercise: feedbackMap,
    });

    const adjustedUpperPull = adjusted.week.find((day) =>
      day.title.toLowerCase().includes("upper pull")
    );
    expect(adjustedUpperPull).toBeTruthy();

    const adjustedItemAtRiskSlot = adjustedUpperPull?.routine[riskyEntry.index];
    expect(adjustedItemAtRiskSlot?.section).toBe("main");
    expect(adjustedItemAtRiskSlot?.exerciseId).not.toBe(riskyExerciseId);

    const replacementExercise = exerciseById(adjustedItemAtRiskSlot?.exerciseId ?? "");
    expect(replacementExercise?.category).toBe("main");
    expect(inferMainLane(adjustedItemAtRiskSlot?.exerciseId ?? "")).toBe(riskyLane);

    const baselineMainCount =
      baselineUpperPull?.routine.filter((item) => item.section === "main").length ?? 0;
    const adjustedMainCount =
      adjustedUpperPull?.routine.filter((item) => item.section === "main").length ?? 0;
    expect(adjustedMainCount).toBe(baselineMainCount);

    (adjustedUpperPull?.routine ?? [])
      .filter((item) => item.section === "main")
      .forEach((item) => {
        expect(exerciseById(item.exerciseId)?.category).toBe("main");
      });

    assertContractsHold(questionnaire, adjusted.week);
  });

  // Unquarantined in Phase 3.0 — fixed alongside sessionFeedbackInfluence.
  // Hard-block applied across all candidate-iteration paths.
  // See ED-3.0.1 in docs/engine-decisions.md.
  test("next week uses recent logs + guidance to move risky main out of lead while preserving contracts", () => {
    const current = generateWeeklyProgram(questionnaire, "substitution-next-cycle-current", {
      seed: "feedback-next-cycle-seed",
      phaseIndex: 1,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
    });
    const targetDayIndex = current.week.findIndex((day) =>
      day.title.toLowerCase().includes("upper pull")
    );
    expect(targetDayIndex).toBeGreaterThanOrEqual(0);
    const currentDay = current.week[targetDayIndex];
    const currentMainItems = currentDay.routine.filter((item) => item.section === "main");
    expect(currentMainItems.length).toBeGreaterThan(0);
    const riskyExerciseId = currentMainItems[0].exerciseId;

    const recentLogs: ExerciseLog[] = [
      {
        id: "feedback-log-1",
        userId: "local",
        sessionId: "session-1",
        exerciseId: riskyExerciseId,
        originalExerciseId: null,
        substitutedExerciseId: null,
        programId: current.id,
        dayIndex: targetDayIndex,
        createdAt: "2026-02-10T10:00:00.000Z",
        updatedAt: "2026-02-10T10:00:00.000Z",
        loadType: "weighted",
        unit: "lb",
        weight: 50,
        reps: 6,
        repsBySet: [6, 6],
        setsPlanned: 3,
        setsCompleted: 2,
        durationSec: null,
        workSecondsUsed: null,
        restSecondsUsed: null,
        rpe: 9,
        felt: "pain",
        painLevel: "severe",
        painLocation: "shoulder",
        nextTimeGuidance: "Next time: reduce load 5-10% or drop 1 set.",
        feedbackNotes: null,
        notes: null,
        computedVolume: 600,
        source: "local",
        deletedAt: null,
      },
      {
        id: "feedback-log-2",
        userId: "local",
        sessionId: "session-2",
        exerciseId: riskyExerciseId,
        originalExerciseId: null,
        substitutedExerciseId: null,
        programId: current.id,
        dayIndex: targetDayIndex,
        createdAt: "2026-02-12T10:00:00.000Z",
        updatedAt: "2026-02-12T10:00:00.000Z",
        loadType: "weighted",
        unit: "lb",
        weight: 50,
        reps: 7,
        repsBySet: [7, 7],
        setsPlanned: 3,
        setsCompleted: 2,
        durationSec: null,
        workSecondsUsed: null,
        restSecondsUsed: null,
        rpe: 8,
        felt: "hard",
        painLevel: "moderate",
        painLocation: "shoulder",
        nextTimeGuidance: "Next time: reduce range + use lighter load.",
        feedbackNotes: null,
        notes: null,
        computedVolume: 700,
        source: "local",
        deletedAt: null,
      },
    ];

    const nextWeek = generateWeeklyProgram(questionnaire, "substitution-next-week", {
      phaseIndex: current.phaseIndex ?? 1,
      weekIndex: (current.weekIndex ?? 1) + 1,
      cycleIndex: current.cycleIndex ?? 1,
      totalWeekIndex: (current.totalWeekIndex ?? current.weekIndex ?? 1) + 1,
      recentLogs,
      seed: "feedback-next-cycle-seed",
    });

    const nextDay = nextWeek.week[targetDayIndex];
    const nextMainIds = nextDay.routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId);
    expect(nextMainIds.length).toBe(currentMainItems.length);
    expect(nextMainIds[0]).not.toBe(riskyExerciseId);
    expect(new Set(nextMainIds).size).toBe(nextMainIds.length);

    const expectedMainCount = questionnaire.experience === "Beginner" ? 2 : 3;
    nextWeek.week.forEach((day) => {
      const mainIds = day.routine
        .filter((item) => item.section === "main")
        .map((item) => item.exerciseId);
      expect(mainIds.length).toBe(expectedMainCount);
      expect(new Set(day.routine.map((item) => item.exerciseId)).size).toBe(day.routine.length);
      mainIds.forEach((id) => {
        expect(exerciseById(id)?.category).toBe("main");
      });
    });

    assertContractsHold(questionnaire, nextWeek.week);
  });
});
