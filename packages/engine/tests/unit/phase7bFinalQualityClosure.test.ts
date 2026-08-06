/**
 * Phase 7B final-quality closure — focused deterministic repros for the
 * four structural safe-generation families (blocks leak, wrong role truth,
 * prep-as-main, mixed-home equipment thrash).
 */
import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  evaluateProgramQuality,
  generateWeeklyProgram,
  recoverAndEvaluateProgramQuality,
} from "@/lib/program";
import type { LogPrefs, Program } from "@/lib/types";

const block = (id: string): LogPrefs["blockedExerciseIds"] => ({
  [id]: {
    reason: "personal_preference",
    blockedAt: { phase: "skill", sessionCount: 3 },
  },
});

const allIds = (program: Program) =>
  program.week.flatMap((d) => d.routine.map((i) => i.exerciseId));

const genGuarded = (
  q: QuestionnaireData,
  id: string,
  seed: string,
  phaseIndex: number,
  blockedExerciseIds?: LogPrefs["blockedExerciseIds"]
) => {
  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();
  const initial = generateWeeklyProgram(q, id, {
    phaseIndex,
    seed,
    skipQualityGate: true,
    blockedExerciseIds,
  });
  return recoverAndEvaluateProgramQuality({
    questionnaire: q,
    programId: id,
    phaseIndex,
    baseSeed: seed,
    initialProgram: initial,
    blockedExerciseIds,
    generate: (questionnaire, programId, opts) =>
      generateWeeklyProgram(questionnaire, programId, {
        ...opts,
        skipQualityGate: true,
        blockedExerciseIds,
      }),
  });
};

describe("Phase 7B final-quality closure families", () => {
  test("gym-fuzz-a4f36846: blocked db-rdl never appears (QUALITY_BLOCKED_EXERCISE_PRESENT)", () => {
    const q: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: [],
      experience: "Advanced",
      equipment: ["gym"],
      daysPerWeek: 4,
    };
    const blockedExerciseIds = block("db-rdl");
    const guarded = genGuarded(
      q,
      "gym-a4f36846",
      "gym-fuzz-a4f36846",
      2,
      blockedExerciseIds
    );
    expect(guarded.ok).toBe(true);
    if (!guarded.ok) return;
    expect(allIds(guarded.program)).not.toContain("db-rdl");
    expect(
      guarded.evaluation.hardFailures.some(
        (f) => f.code === "QUALITY_BLOCKED_EXERCISE_PRESENT"
      )
    ).toBe(false);
  });

  test("gym-fuzz-c6a1ad68: hinge role truth not surrogate (GYM_REQUIRED_ROLE_WRONG_TRUTH)", () => {
    const q: QuestionnaireData = {
      goals: "Athletic performance",
      painAreas: ["Knees"],
      experience: "Beginner",
      equipment: ["gym", "dumbbells"],
      daysPerWeek: 3,
    };
    const blockedExerciseIds = block("db-rdl");
    const guarded = genGuarded(
      q,
      "gym-c6a1ad68",
      "gym-fuzz-c6a1ad68",
      2,
      blockedExerciseIds
    );
    expect(guarded.ok).toBe(true);
    if (!guarded.ok) return;
    expect(
      guarded.evaluation.hardFailures.some(
        (f) => f.code === "GYM_REQUIRED_ROLE_WRONG_TRUTH"
      )
    ).toBe(false);
    const legs = guarded.program.week.find((d) =>
      d.title.toLowerCase().includes("legs")
    );
    const mains = legs?.routine
      .filter((i) => i.section === "main")
      .map((i) => i.exerciseId);
    // Hinge primary (slot index 1) must not be a squat/lunge surrogate.
    expect(mains?.[1]).not.toBe("dumbbell-reverse-lunge");
  });

  test.each([
    {
      seed: "db-fuzz-84efef41",
      q: {
        goals: "Reduce pain",
        painAreas: ["Lower back"],
        experience: "Advanced",
        equipment: ["dumbbells"],
        daysPerWeek: 4,
      } satisfies QuestionnaireData,
      phaseIndex: 1,
    },
    {
      seed: "db-fuzz-7e336699",
      q: {
        goals: "Athletic performance",
        painAreas: ["Upper back"],
        experience: "Beginner",
        equipment: ["dumbbells", "bench", "pullup_bar"],
        daysPerWeek: 5,
      } satisfies QuestionnaireData,
      phaseIndex: 3,
    },
  ])(
    "$seed: goblet-squat block does not yield DUMBBELL_PREP_AS_MAIN",
    ({ seed, q, phaseIndex }) => {
      const blockedExerciseIds = block("goblet-squat");
      const guarded = genGuarded(
        q,
        seed,
        seed,
        phaseIndex,
        blockedExerciseIds
      );
      expect(guarded.ok).toBe(true);
      if (!guarded.ok) return;
      expect(allIds(guarded.program)).not.toContain("goblet-squat");
      expect(
        guarded.evaluation.hardFailures.some(
          (f) => f.code === "DUMBBELL_PREP_AS_MAIN"
        )
      ).toBe(false);
    }
  );

  test.each([
    {
      name: "Beginner P1 4d shoulder",
      seed: "mh-fuzz-3db87c53",
      q: {
        goals: "Athletic performance",
        painAreas: ["Shoulders"],
        experience: "Beginner",
        equipment: ["dumbbells", "bands"],
        daysPerWeek: 4,
        bandSetup: "long_with_anchor",
      } satisfies QuestionnaireData,
      phaseIndex: 1,
    },
    {
      name: "Advanced P1 5d LBP",
      seed: "mh-fuzz-293557bd",
      q: {
        goals: "Improve posture",
        painAreas: ["Lower back"],
        experience: "Advanced",
        equipment: ["bands", "dumbbells"],
        daysPerWeek: 5,
        bandSetup: "long_with_anchor",
      } satisfies QuestionnaireData,
      phaseIndex: 1,
    },
    {
      name: "Advanced 5d hip+LBP",
      seed: "mh-fuzz-676be5e7",
      q: {
        goals: "Improve posture",
        painAreas: ["Lower back", "Hips"],
        experience: "Advanced",
        equipment: ["dumbbells", "bands", "pullup_bar"],
        daysPerWeek: 5,
        bandSetup: "long_with_anchor",
      } satisfies QuestionnaireData,
      phaseIndex: 1,
    },
  ])(
    "mixedHome $name: no MIXED_HOME_RANDOM_EQUIPMENT_MIX",
    ({ seed, q, phaseIndex }) => {
      const guarded = genGuarded(q, seed, seed, phaseIndex);
      expect(guarded.ok).toBe(true);
      if (!guarded.ok) return;
      expect(
        guarded.evaluation.hardFailures.some(
          (f) => f.code === "MIXED_HOME_RANDOM_EQUIPMENT_MIX"
        )
      ).toBe(false);
    }
  );

  test("initial generation also excludes blocked db-rdl (not only recovery)", () => {
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const q: QuestionnaireData = {
      goals: "Reduce pain",
      painAreas: [],
      experience: "Advanced",
      equipment: ["gym"],
      daysPerWeek: 4,
    };
    const blockedExerciseIds = block("db-rdl");
    const program = generateWeeklyProgram(q, "gym-initial-block", {
      phaseIndex: 2,
      seed: "gym-fuzz-a4f36846",
      skipQualityGate: true,
      blockedExerciseIds,
    });
    expect(allIds(program)).not.toContain("db-rdl");
    const evaluation = evaluateProgramQuality({
      program,
      questionnaire: q,
      blockedExerciseIds,
    });
    expect(
      evaluation.hardFailures.some(
        (f) => f.code === "QUALITY_BLOCKED_EXERCISE_PRESENT"
      )
    ).toBe(false);
  });
});
