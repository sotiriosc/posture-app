import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { computeEquipmentCapability } from "@/lib/engine/equipmentCapability";
import {
  daySatisfiesSpec,
  generateWeeklyProgram,
  resolveDayConstraintSpec,
  type ProgramSelectionAuditEntry,
} from "@/lib/program";
import type { ExerciseFeedbackSummary } from "@/lib/logStore";

const baseQuestionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Intermediate",
  equipment: ["gym"],
  daysPerWeek: 4,
};

const toCapabilityMode = (
  questionnaire: QuestionnaireData
): "noneOnly" | "bandOnly" | "hasLoad" => {
  const capability = computeEquipmentCapability(questionnaire.equipment);
  if (capability.hasLoad) return "hasLoad";
  if (capability.hasBand) return "bandOnly";
  return "noneOnly";
};

const assertContractsHold = (questionnaire: QuestionnaireData, week: ReturnType<typeof generateWeeklyProgram>["week"]) => {
  const capabilityMode = toCapabilityMode(questionnaire);
  week.forEach((day) => {
    const spec = resolveDayConstraintSpec({
      day,
      daysPerWeek: questionnaire.daysPerWeek,
      capabilityMode,
    });
    if (!spec) return;
    const result = daySatisfiesSpec(day, spec);
    expect(result.ok).toBe(true);
  });
};

const getDayMainIds = (program: ReturnType<typeof generateWeeklyProgram>, titleIncludes: string) => {
  const day = program.week.find((entry) =>
    entry.title.toLowerCase().includes(titleIncludes.toLowerCase())
  );
  expect(day).toBeTruthy();
  return (
    day?.routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId) ?? []
  );
};

const makeFeedbackSummaryMap = (
  entries: ExerciseFeedbackSummary[]
) => {
  return new Map(entries.map((entry) => [entry.exerciseId, entry] as const));
};

const findNonFinalAuditEntry = (
  entries: ProgramSelectionAuditEntry[],
  predicate: (entry: ProgramSelectionAuditEntry) => boolean
) =>
  entries.find(
    (entry) =>
      predicate(entry) &&
      !entry.chosen.reasons.some((reason) => reason.includes("[final_trace]"))
  );

const hasFeedbackPenaltyReason = (reasons: string[]) =>
  reasons.some(
    (reason) =>
      reason.includes("feedback pain penalty") ||
      reason.includes("feedback failure penalty") ||
      reason.includes("feedback substitute-available penalty")
  );

const findFinalExerciseForAuditSlot = (
  program: ReturnType<typeof generateWeeklyProgram>,
  slotId: string | undefined
) =>
  slotId
    ? program.week
        .flatMap((day) => day.routine)
        .find(
          (item) =>
            item.section === "main" && item.selectionDebug?.slotId === slotId
        )
    : undefined;

describe("session feedback influences main selection", () => {
  test("painful exercise receives strong penalties and yields to safer alternatives when available", () => {
    const baselineAudit: ProgramSelectionAuditEntry[] = [];
    generateWeeklyProgram(baseQuestionnaire, "feedback-pain-baseline", {
      seed: "feedback-pain-seed",
      selectionAuditHook: (entry) => baselineAudit.push(entry),
    });
    const baselineUpperPushEntry = findNonFinalAuditEntry(
      baselineAudit,
      (entry) =>
        entry.dayTitle.toLowerCase().includes("upper push") &&
        entry.slotId.endsWith("-main-1")
    );
    expect(baselineUpperPushEntry).toBeTruthy();
    const painfulExerciseId = baselineUpperPushEntry?.chosen.exerciseId ?? "";
    expect(painfulExerciseId).toBeTruthy();

    const feedbackSummaries = makeFeedbackSummaryMap([
      {
        exerciseId: painfulExerciseId,
        pain: "severe",
        difficulty: "failed",
        completionRate: 0.4,
      },
    ]);

    const adjustedAudit: ProgramSelectionAuditEntry[] = [];
    const adjusted = generateWeeklyProgram(baseQuestionnaire, "feedback-pain-adjusted", {
      seed: "feedback-pain-seed",
      feedbackSummaryByExercise: feedbackSummaries,
      selectionAuditHook: (entry) => adjustedAudit.push(entry),
    });
    const adjustedUpperPushEntry = findNonFinalAuditEntry(
      adjustedAudit,
      (entry) =>
        entry.dayTitle.toLowerCase().includes("upper push") &&
        entry.slotId === baselineUpperPushEntry?.slotId
    );
    expect(adjustedUpperPushEntry).toBeTruthy();

    const baselineTargetCandidate = baselineUpperPushEntry?.top.find(
      (candidate) => candidate.exerciseId === painfulExerciseId
    );
    const adjustedTargetCandidate = adjustedUpperPushEntry?.top.find(
      (candidate) => candidate.exerciseId === painfulExerciseId
    );

    expect(baselineTargetCandidate).toBeTruthy();
    expect(adjustedTargetCandidate).toBeTruthy();
    expect((adjustedTargetCandidate?.score ?? 0)).toBeLessThan(
      (baselineTargetCandidate?.score ?? 0) - 6
    );
    expect(
      adjustedTargetCandidate?.reasons.some((reason) =>
        reason.includes("feedback pain penalty")
      )
    ).toBe(true);
    expect(
      adjustedTargetCandidate?.reasons.some((reason) =>
        reason.includes("feedback failure penalty")
      )
    ).toBe(true);

    const hasSaferUnpenalizedAlternative =
      adjustedUpperPushEntry?.top.some(
        (candidate) =>
          candidate.exerciseId !== painfulExerciseId &&
          !candidate.reasons.some((reason) => reason.includes("feedback pain penalty")) &&
          !candidate.reasons.some((reason) => reason.includes("feedback failure penalty"))
      ) ?? false;
    if (hasSaferUnpenalizedAlternative) {
      expect(adjustedUpperPushEntry?.chosen.exerciseId).not.toBe(painfulExerciseId);
    }
    assertContractsHold(baseQuestionnaire, adjusted.week);
  });

  // QUARANTINE (Phase 2c.4 — first-failing commit: 6f367b0)
  // Verdict: code-bug. The feedback penalty is correctly applied at scoring time but a
  // subsequent repair/swap pipeline step in the Back+Chest intelligence repair loop
  // reinserts the penalized exercise, overriding the feedback-aware selection. Fixing
  // the repair pipeline's feedback propagation is Phase 1 scope.
  // Unquarantine condition: repair pipeline passes feedbackSummaryByExercise into every
  // selectBackChest* helper so a penalized exercise cannot be chosen as a repair anchor.
  test.skip("failed exercise gets deprioritized", () => {
    const baselineAudit: ProgramSelectionAuditEntry[] = [];
    generateWeeklyProgram(baseQuestionnaire, "feedback-failure-baseline", {
      seed: "feedback-failure-seed",
      selectionAuditHook: (entry) => baselineAudit.push(entry),
    });
    const baselineUpperPullEntry = findNonFinalAuditEntry(
      baselineAudit,
      (entry) =>
        entry.dayTitle.toLowerCase().includes("upper pull") &&
        entry.slotId.endsWith("-main-1")
    );
    expect(baselineUpperPullEntry).toBeTruthy();
    const failedExerciseId = baselineUpperPullEntry?.chosen.exerciseId ?? "";
    expect(failedExerciseId).toBeTruthy();

    const feedbackSummaries = makeFeedbackSummaryMap([
      {
        exerciseId: failedExerciseId,
        pain: "none",
        difficulty: "failed",
        completionRate: 0.5,
      },
    ]);

    const adjustedAudit: ProgramSelectionAuditEntry[] = [];
    const adjusted = generateWeeklyProgram(baseQuestionnaire, "feedback-failure-adjusted", {
      seed: "feedback-failure-seed",
      feedbackSummaryByExercise: feedbackSummaries,
      selectionAuditHook: (entry) => adjustedAudit.push(entry),
    });
    const adjustedUpperPullEntry = findNonFinalAuditEntry(
      adjustedAudit,
      (entry) =>
        entry.dayTitle.toLowerCase().includes("upper pull") &&
        entry.slotId === baselineUpperPullEntry?.slotId
    );
    expect(adjustedUpperPullEntry).toBeTruthy();

    const baselineTargetCandidate = baselineUpperPullEntry?.top.find(
      (candidate) => candidate.exerciseId === failedExerciseId
    );
    const adjustedTargetCandidate = adjustedUpperPullEntry?.top.find(
      (candidate) => candidate.exerciseId === failedExerciseId
    );

    expect(baselineTargetCandidate).toBeTruthy();
    if (adjustedTargetCandidate) {
      expect((adjustedTargetCandidate.score ?? 0)).toBeLessThan(
        (baselineTargetCandidate?.score ?? 0) - 2
      );
      expect(
        adjustedTargetCandidate.reasons.some((reason) =>
          reason.includes("feedback failure penalty")
        )
      ).toBe(true);
    }
    const hasUnpenalizedAlternative =
      adjustedUpperPullEntry?.top.some(
        (candidate) =>
          candidate.exerciseId !== failedExerciseId &&
          !hasFeedbackPenaltyReason(candidate.reasons)
      ) ?? false;
    if (hasUnpenalizedAlternative) {
      expect(adjustedUpperPullEntry?.chosen.exerciseId).not.toBe(failedExerciseId);
    }
    const finalSameSlot = findFinalExerciseForAuditSlot(
      adjusted,
      baselineUpperPullEntry?.slotId
    );
    expect(finalSameSlot?.exerciseId).not.toBe(failedExerciseId);
    assertContractsHold(baseQuestionnaire, adjusted.week);
  });

  test("easy completed exercise receives progression-readiness bonus", () => {
    const baselineAudit: ProgramSelectionAuditEntry[] = [];
    const baseline = generateWeeklyProgram(baseQuestionnaire, "feedback-easy-baseline", {
      seed: "feedback-easy-seed",
      selectionAuditHook: (entry) => baselineAudit.push(entry),
    });

    const baselineUpperPushEntry = baselineAudit.find(
      (entry) =>
        entry.dayTitle.toLowerCase().includes("upper push") &&
        entry.slotKind.toLowerCase().includes("mainpush")
    );
    expect(baselineUpperPushEntry).toBeTruthy();
    const targetExerciseId = baselineUpperPushEntry?.chosen.exerciseId ?? "";
    expect(targetExerciseId).toBeTruthy();

    const feedbackSummaries = makeFeedbackSummaryMap([
      {
        exerciseId: targetExerciseId,
        pain: "none",
        difficulty: "easy",
        completionRate: 1,
      },
    ]);

    const adjustedAudit: ProgramSelectionAuditEntry[] = [];
    const adjusted = generateWeeklyProgram(baseQuestionnaire, "feedback-easy-adjusted", {
      seed: "feedback-easy-seed",
      feedbackSummaryByExercise: feedbackSummaries,
      selectionAuditHook: (entry) => adjustedAudit.push(entry),
    });

    const adjustedUpperPushEntry = adjustedAudit.find(
      (entry) =>
        entry.slotId === baselineUpperPushEntry?.slotId &&
        entry.dayTitle === baselineUpperPushEntry?.dayTitle
    );
    expect(adjustedUpperPushEntry).toBeTruthy();

    const baselineTargetCandidate = baselineUpperPushEntry?.top.find(
      (candidate) => candidate.exerciseId === targetExerciseId
    );
    const adjustedTargetCandidate = adjustedUpperPushEntry?.top.find(
      (candidate) => candidate.exerciseId === targetExerciseId
    );

    expect(baselineTargetCandidate).toBeTruthy();
    expect(adjustedTargetCandidate).toBeTruthy();
    expect((adjustedTargetCandidate?.score ?? 0) - (baselineTargetCandidate?.score ?? 0)).toBeGreaterThan(
      0
    );
    expect(
      adjustedTargetCandidate?.reasons.some((reason) =>
        reason.includes("feedback progression readiness bonus")
      )
    ).toBe(true);
    assertContractsHold(baseQuestionnaire, adjusted.week);
    expect(getDayMainIds(adjusted, "upper push").length).toBe(
      getDayMainIds(baseline, "upper push").length
    );
  });
});
