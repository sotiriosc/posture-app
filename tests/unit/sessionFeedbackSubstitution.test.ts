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
    expect(result.ok).toBe(true);
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
});
