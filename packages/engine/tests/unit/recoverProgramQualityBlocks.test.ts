import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  evaluateProgramQuality,
  generateWeeklyProgram,
  recoverAndEvaluateProgramQuality,
} from "@/lib/program";

const questionnaire: QuestionnaireData = {
  goals: "General fitness",
  painAreas: [],
  experience: "Beginner",
  equipment: ["dumbbells"],
  daysPerWeek: 3,
};

describe("recoverAndEvaluateProgramQuality blockedExerciseIds", () => {
  test("passes blocks into every evaluation stage and returns recoveryTrace", () => {
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const blockedExerciseIds = {
      "db-rdl": {
        reason: "personal_preference" as const,
        blockedAt: { phase: "skill" as const, sessionCount: 1 },
      },
    };

    const initial = generateWeeklyProgram(questionnaire, "rq-blocks-initial", {
      phaseIndex: 1,
      seed: "rq-blocks-seed",
      skipQualityGate: true,
      blockedExerciseIds,
    });

    // Re-insert blocked exercise so quality must reject independently of generation.
    const tainted = {
      ...initial,
      week: initial.week.map((day, dayIndex) =>
        dayIndex === 0
          ? {
              ...day,
              routine: day.routine.map((item, itemIndex) =>
                itemIndex === 0
                  ? { ...item, exerciseId: "db-rdl", section: "main" as const }
                  : item
              ),
            }
          : day
      ),
    };

    const withoutBlocks = evaluateProgramQuality({
      program: tainted,
      questionnaire,
      persona: "rq-no-blocks",
    });
    const withBlocks = evaluateProgramQuality({
      program: tainted,
      questionnaire,
      persona: "rq-with-blocks",
      blockedExerciseIds,
    });
    expect(
      withBlocks.hardFailures.some((f) => f.code.includes("BLOCKED"))
    ).toBe(true);
    // Control: without blocks, the finding is not forced by block policy alone.
    expect(withoutBlocks.hardFailures.some((f) => f.code.includes("BLOCKED"))).toBe(
      false
    );

    const guarded = recoverAndEvaluateProgramQuality({
      questionnaire,
      programId: "rq-blocks",
      phaseIndex: 1,
      baseSeed: "rq-blocks-seed",
      initialProgram: tainted,
      blockedExerciseIds,
      generate: (q, id, opts) =>
        generateWeeklyProgram(q, id, {
          ...opts,
          skipQualityGate: true,
          blockedExerciseIds,
        }),
    });

    expect(guarded.recoveryTrace).toBeDefined();
    expect(guarded.recoveryTrace.initial.hardFailureCodes.length).toBeGreaterThan(0);
    expect(guarded.recoveryTrace.finalProgram).not.toBeNull();

    if (guarded.ok) {
      expect(guarded.recoveryTrace.finalOutcome).toMatch(
        /^(recoveryPass|fallbackPass)$/
      );
      const ids = guarded.program.week.flatMap((d) =>
        d.routine.map((i) => i.exerciseId)
      );
      expect(ids).not.toContain("db-rdl");
      expect(guarded.recoveryTrace.finalProgram).toBe(guarded.program);
    } else {
      expect(guarded.recoveryTrace.finalOutcome).toBe("safeGenerationFailure");
      // Must not substitute the tainted initial when fallback/recovery ran.
      expect(guarded.recoveryTrace.finalProgram).not.toBeNull();
      if (guarded.recoveryTrace.fallback) {
        expect(guarded.recoveryTrace.finalProgram).not.toBe(tainted);
      }
    }
  });

  test("ok:false finalProgram is last attempted program, not initial", () => {
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    // Force a path that cannot pass by using an empty week as initial and a
    // generator that always returns the same illegal empty program.
    const emptyProgram = {
      id: "empty",
      daysPerWeek: 3,
      phaseIndex: 1,
      week: [],
      templateVersion: 18,
    } as unknown as ReturnType<typeof generateWeeklyProgram>;

    const guarded = recoverAndEvaluateProgramQuality({
      questionnaire,
      programId: "rq-empty",
      phaseIndex: 1,
      baseSeed: "rq-empty-seed",
      initialProgram: emptyProgram,
      generate: () => ({
        ...emptyProgram,
        id: "empty-regen",
      }),
    });

    expect(guarded.ok).toBe(false);
    expect(guarded.recoveryTrace.finalOutcome).toBe("safeGenerationFailure");
    expect(guarded.recoveryTrace.finalProgram).not.toBeNull();
    expect(guarded.recoveryTrace.finalProgram?.id).not.toBe("empty");
    if (guarded.recoveryTrace.fallback) {
      expect(guarded.recoveryTrace.finalProgram?.id).toBe("empty-regen");
    }
  });
});
