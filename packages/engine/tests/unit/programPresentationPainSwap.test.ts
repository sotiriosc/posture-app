/**
 * Phase 7B — Pain / swap / block presentation honesty + canonical role truth.
 */

import { describe, expect, it, beforeEach } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
  previewPainSubstitutionChoices,
} from "@/lib/program";
import { classifyGymMovementRoleTruth } from "@/lib/program/gymProgramContract";
import {
  containsForbiddenInternalUiLanguage,
  resolveNoValidSwapMessage,
  resolvePainAdaptationSummary,
} from "@/lib/program/presentation";

beforeEach(() => {
  clearProgramVariationHistory();
});

/** Pain-free gym kit so true-role alternatives remain eligible. */
const gymQuestionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Intermediate",
  daysPerWeek: 3,
  equipment: ["gym", "dumbbells", "barbell", "bench", "machines", "cables"],
};

const ROLE_CASES: Array<{
  exerciseId: string;
  family: string;
  label: string;
  section?: "main" | "accessory";
}> = [
  { exerciseId: "db-rdl", family: "hinge", label: "primary hinge" },
  { exerciseId: "goblet-squat", family: "squat", label: "squat" },
  {
    exerciseId: "machine-chest-press",
    family: "horizontal_press",
    label: "horizontal push",
  },
  {
    exerciseId: "dumbbell-rows",
    family: "horizontal_pull",
    label: "horizontal pull",
  },
  {
    exerciseId: "machine-lat-pulldown",
    family: "vertical_pull",
    label: "vertical pull",
  },
  {
    exerciseId: "dumbbell-shoulder-press",
    family: "vertical_push",
    label: "vertical push",
  },
  {
    exerciseId: "split-squat",
    family: "unilateral",
    label: "unilateral lower",
  },
  {
    exerciseId: "plank",
    family: "core",
    label: "core stability",
    section: "accessory",
  },
];

const assertSwapRoleTruth = (params: {
  family: string;
  choiceId: string;
}) => {
  const candidate = exerciseById(params.choiceId);
  expect(candidate).toBeTruthy();
  expect(candidate!.supportOnly).not.toBe(true);
  expect(["warmup", "activation", "cooldown"]).not.toContain(
    candidate!.category
  );

  if (params.family === "core") {
    expect(candidate!.supportOnly).not.toBe(true);
    return;
  }

  const truth = classifyGymMovementRoleTruth(candidate!, params.family);
  expect(truth).toBe("true");
  expect(truth).not.toBe("preparationOnly");
  expect(truth).not.toBe("surrogate");
};

describe("Phase 7B pain/swap presentation", () => {
  it("surfaces questionnaire pain in adaptation summary copy", () => {
    const msg = resolvePainAdaptationSummary({
      painAreas: ["Lower back", "Shoulders"],
    });
    expect(msg).toBeTruthy();
    expect(msg!.text.toLowerCase()).toContain("discomfort");
    expect(msg!.text.toLowerCase()).toContain("lower back");
    expect(containsForbiddenInternalUiLanguage(msg!.text)).toBe(false);
  });

  it("excludes blocked exercises from pain-swap previews", () => {
    const unblocked = previewPainSubstitutionChoices({
      questionnaire: gymQuestionnaire,
      exerciseId: "goblet-squat",
      section: "main",
      limit: 8,
    });
    expect(unblocked.length).toBeGreaterThan(0);

    const topId = unblocked[0]!.exerciseId;
    const blocked = previewPainSubstitutionChoices({
      questionnaire: gymQuestionnaire,
      exerciseId: "goblet-squat",
      section: "main",
      limit: 8,
      blockedExerciseIds: {
        [topId]: {
          reason: "personal_preference",
          blockedAt: { phase: "skill", sessionCount: 2 },
        },
      },
    });

    expect(blocked.every((c) => c.exerciseId !== topId)).toBe(true);
    expect(blocked.every((c) => c.exerciseId !== "goblet-squat")).toBe(true);
  });

  it.each(ROLE_CASES)(
    "keeps canonical role-truth for $label swaps ($exerciseId)",
    ({ exerciseId, family, section }) => {
      expect(exerciseById(exerciseId)).toBeTruthy();

      const choices = previewPainSubstitutionChoices({
        questionnaire: gymQuestionnaire,
        exerciseId,
        section: section ?? "main",
        limit: 6,
      });

      // Empty is acceptable when no legal true-role swap exists.
      for (const choice of choices) {
        assertSwapRoleTruth({ family, choiceId: choice.exerciseId });
      }
    }
  );

  it("rejects preparation-only and unrelated posterior as hinge role truth", () => {
    const curl = exerciseById("machine-seated-hamstring-curl");
    const prep = exerciseById("dead-bug");
    expect(curl).toBeTruthy();
    expect(classifyGymMovementRoleTruth(curl!, "hinge")).not.toBe("true");
    expect(classifyGymMovementRoleTruth(exerciseById("db-rdl")!, "hinge")).toBe(
      "true"
    );
    if (prep) {
      expect(classifyGymMovementRoleTruth(prep, "hinge")).not.toBe("true");
    }

    const choices = previewPainSubstitutionChoices({
      questionnaire: gymQuestionnaire,
      exerciseId: "db-rdl",
      section: "main",
      limit: 8,
    });
    expect(choices.length).toBeGreaterThan(0);
    for (const choice of choices) {
      assertSwapRoleTruth({ family: "hinge", choiceId: choice.exerciseId });
      expect(choice.exerciseId).not.toBe("machine-seated-hamstring-curl");
      expect(choice.exerciseId).not.toBe("assisted-hamstring-curl");
      expect(classifyGymMovementRoleTruth(exerciseById(choice.exerciseId)!, "hinge")).toBe(
        "true"
      );
    }
  });

  it("never offers preparation-only movements for main roles", () => {
    const prepIds = ["dead-bug", "cable-face-pull", "cable-external-rotation"];
    for (const id of prepIds) {
      const ex = exerciseById(id);
      if (!ex) continue;
      expect(classifyGymMovementRoleTruth(ex, "hinge")).not.toBe("true");
      expect(classifyGymMovementRoleTruth(ex, "vertical_pull")).not.toBe("true");
    }

    let prepOffered = 0;
    let surrogatePull = 0;
    for (const roleCase of ROLE_CASES.filter((c) => c.family !== "core")) {
      const choices = previewPainSubstitutionChoices({
        questionnaire: gymQuestionnaire,
        exerciseId: roleCase.exerciseId,
        section: "main",
        limit: 8,
      });
      for (const choice of choices) {
        const ex = exerciseById(choice.exerciseId)!;
        const truth = classifyGymMovementRoleTruth(ex, roleCase.family);
        if (truth === "preparationOnly" || ex.supportOnly) prepOffered += 1;
        if (
          (roleCase.family === "vertical_pull" ||
            roleCase.family === "horizontal_pull") &&
          truth === "surrogate"
        ) {
          surrogatePull += 1;
        }
      }
    }
    expect(prepOffered).toBe(0);
    expect(surrogatePull).toBe(0);
  });

  it("provides safe no-valid-swap presentation without empty-picker language", () => {
    const msg = resolveNoValidSwapMessage();
    expect(msg.severity).toBe("safety");
    expect(msg.text.toLowerCase()).toMatch(/skip|stop/);
    expect(msg.text.toLowerCase()).not.toContain("no options");
    expect(containsForbiddenInternalUiLanguage(msg.text)).toBe(false);
  });

  it("blocks remain excluded from generated programs used by presentation chain", () => {
    const blockedId = "db-rdl";
    const program = generateWeeklyProgram(
      gymQuestionnaire,
      "p7b-pain-swap-block",
      {
        seed: "p7b-pain-swap-block",
        // Isolated unit coverage of block exclusion may bypass release gate.
        skipQualityGate: true,
        blockedExerciseIds: {
          [blockedId]: {
            reason: "personal_preference",
            blockedAt: { phase: "skill", sessionCount: 1 },
          },
        },
      }
    );
    const ids = program.week.flatMap((d) =>
      d.routine.map((item) => item.exerciseId)
    );
    expect(ids).not.toContain(blockedId);
  });
});
