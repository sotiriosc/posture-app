import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import { generateWeeklyProgram } from "@/lib/program";
import {
  WEEKLY_QUOTA_CATEGORY_ORDER,
  resolveWeeklyQuotaTargets,
  type WeeklyQuotaAudit,
  type WeeklyQuotaCategory,
} from "@/lib/program/quotaRegistry";
import {
  rankSelectionCandidatesDeterministically,
  scoreSelectionCandidateDelta,
} from "@/lib/program/selectionScore";

const requireExercise = (exerciseId: string) => {
  const exercise = exerciseById(exerciseId);
  expect(exercise, `${exerciseId} should exist in exercise catalog`).toBeTruthy();
  if (!exercise) {
    throw new Error(`Missing exercise ${exerciseId}`);
  }
  return exercise;
};

const makeQuotaAudit = (
  hitOverrides: Partial<Record<WeeklyQuotaCategory, number>> = {}
): WeeklyQuotaAudit => {
  const targets = resolveWeeklyQuotaTargets({
    daysPerWeek: 3,
    phase: "skill",
    experience: "intermediate",
  });
  const hits = WEEKLY_QUOTA_CATEGORY_ORDER.reduce(
    (accumulator, category) => {
      accumulator[category] = hitOverrides[category] ?? targets[category].min;
      return accumulator;
    },
    {} as Record<WeeklyQuotaCategory, number>
  );
  const audits = WEEKLY_QUOTA_CATEGORY_ORDER.reduce(
    (accumulator, category) => {
      const target = targets[category];
      const hitCount = hits[category];
      const deficit = Math.max(0, target.min - hitCount);
      accumulator[category] = {
        ...target,
        hits: hitCount,
        deficit,
        met: deficit === 0 && (target.max === undefined || hitCount <= target.max),
      };
      return accumulator;
    },
    {} as WeeklyQuotaAudit["audits"]
  );

  return {
    daysPerWeek: 3,
    phase: "skill",
    experience: "intermediate",
    targets,
    hits,
    audits,
    missingMustHitCategories: WEEKLY_QUOTA_CATEGORY_ORDER.filter(
      (category) => audits[category].priority === "must" && audits[category].deficit > 0
    ),
    underHitShouldCategories: WEEKLY_QUOTA_CATEGORY_ORDER.filter(
      (category) => audits[category].priority === "should" && audits[category].deficit > 0
    ),
    optionalOpportunityCategories: WEEKLY_QUOTA_CATEGORY_ORDER.filter(
      (category) => audits[category].priority === "optional" && audits[category].deficit > 0
    ),
  };
};

describe("program selection scoring", () => {
  test("unmet quota categories boost appropriate candidates", () => {
    const quotaAudit = makeQuotaAudit({
      verticalPull: 0,
    });
    const verticalPull = requireExercise("machine-lat-pulldown");
    const horizontalPull = requireExercise("cable-seated-row");

    const verticalPullScore = scoreSelectionCandidateDelta({
      exercise: verticalPull,
      section: "main",
      phase: "skill",
      experience: "intermediate",
      trainingContext: "gym",
      availableEquipment: ["machines", "cables", "dumbbells"],
      dayTitle: "Back + Chest",
      quotaAudit,
      slotRole: "pullVertical",
    });
    const horizontalPullScore = scoreSelectionCandidateDelta({
      exercise: horizontalPull,
      section: "main",
      phase: "skill",
      experience: "intermediate",
      trainingContext: "gym",
      availableEquipment: ["machines", "cables", "dumbbells"],
      dayTitle: "Back + Chest",
      quotaAudit,
      slotRole: "pullHorizontal",
    });

    expect(quotaAudit.audits.verticalPull.deficit).toBeGreaterThan(0);
    expect(quotaAudit.audits.horizontalPull.deficit).toBe(0);
    expect(verticalPullScore.score).toBeGreaterThan(horizontalPullScore.score);
    expect(
      verticalPullScore.decisionTrace.selectedForQuota?.some(
        (entry) => entry.category === "verticalPull"
      )
    ).toBe(true);
  });

  test("recent repeats are penalized when alternatives exist", () => {
    const quotaAudit = makeQuotaAudit();
    const repeatedRow = requireExercise("single-arm-dumbbell-row");
    const novelRow = requireExercise("machine-seated-row");
    const recentExerciseIds = new Set<string>([repeatedRow.id]);

    const repeatedScore = scoreSelectionCandidateDelta({
      exercise: repeatedRow,
      section: "main",
      phase: "skill",
      experience: "intermediate",
      trainingContext: "gym",
      availableEquipment: ["machines", "cables", "dumbbells"],
      dayTitle: "Back + Chest",
      quotaAudit,
      recentExerciseIds,
      slotRole: "pullHorizontal",
    });
    const novelScore = scoreSelectionCandidateDelta({
      exercise: novelRow,
      section: "main",
      phase: "skill",
      experience: "intermediate",
      trainingContext: "gym",
      availableEquipment: ["machines", "cables", "dumbbells"],
      dayTitle: "Back + Chest",
      quotaAudit,
      recentExerciseIds,
      slotRole: "pullHorizontal",
    });

    expect(repeatedScore.decisionTrace.noveltyPenaltyApplied).toBeLessThan(0);
    expect(novelScore.decisionTrace.noveltyPenaltyApplied).toBeUndefined();
    expect(novelScore.score).toBeGreaterThan(repeatedScore.score);
  });

  test("quota-aware repair ranking prefers candidates that fill missing categories", () => {
    const quotaAudit = makeQuotaAudit({
      verticalPull: 0,
    });
    const candidates = rankSelectionCandidatesDeterministically(
      [requireExercise("machine-lat-pulldown"), requireExercise("cable-seated-row")].map(
        (exercise) => {
          const delta = scoreSelectionCandidateDelta({
            exercise,
            section: "main",
            phase: "skill",
            experience: "intermediate",
            trainingContext: "gym",
            availableEquipment: ["machines", "cables", "dumbbells"],
            dayTitle: "Back + Chest",
            quotaAudit,
          });
          return {
            exercise,
            score: delta.score,
            reasons: delta.reasons,
            decisionTrace: delta.decisionTrace,
          };
        }
      )
    );

    expect(candidates[0]?.exercise.id).toBe("machine-lat-pulldown");
    expect(candidates[0]?.decisionTrace.tieBreakRank).toBe(1);
  });

  test("same seed/input stays deterministic with decision traces attached", () => {
    const questionnaire: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["gym"],
      daysPerWeek: 3,
    };
    const options = {
      phaseIndex: 2 as const,
      weekIndex: 1,
      cycleIndex: 1,
      totalWeekIndex: 1,
      seed: "quota-trace-stability",
    };
    const runA = generateWeeklyProgram(questionnaire, "quota-trace-a", options);
    const runB = generateWeeklyProgram(questionnaire, "quota-trace-b", options);
    const traceWeek = (program: typeof runA) =>
      program.week.map((day) =>
        day.routine
          .filter((item) => item.section === "main" || item.section === "accessory")
          .map((item) => ({
            exerciseId: item.exerciseId,
            section: item.section,
            slotKind: item.selectionDebug?.slotKind,
            slotLane: item.selectionDebug?.slotLane,
            decisionTrace: item.selectionDebug?.decisionTrace,
          }))
      );

    const tracedItems = runA.week.flatMap((day) =>
      day.routine.filter((item) => item.section === "main" || item.section === "accessory")
    );

    expect(traceWeek(runA)).toEqual(traceWeek(runB));
    expect(tracedItems.length).toBeGreaterThan(0);
    expect(tracedItems.every((item) => item.selectionDebug?.decisionTrace?.tieBreakRank)).toBe(
      true
    );
  });
});
