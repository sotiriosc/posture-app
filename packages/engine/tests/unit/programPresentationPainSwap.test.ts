/**
 * Phase 7B — Pain / swap / block presentation honesty.
 */

import { describe, expect, it, beforeEach } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import {
  clearProgramVariationHistory,
  generateWeeklyProgram,
  previewPainSubstitutionChoices,
} from "@/lib/program";
import {
  containsForbiddenInternalUiLanguage,
  resolveNoValidSwapMessage,
  resolvePainAdaptationSummary,
} from "@/lib/program/presentation";

beforeEach(() => {
  clearProgramVariationHistory();
});

const gymQuestionnaire: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: ["Lower back"],
  experience: "Intermediate",
  daysPerWeek: 3,
  equipment: ["gym", "dumbbells", "barbell", "bench"],
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
      exerciseId: "db-rdl",
      section: "main",
      limit: 8,
    });
    expect(unblocked.length).toBeGreaterThan(0);

    const topId = unblocked[0]!.exerciseId;
    const blocked = previewPainSubstitutionChoices({
      questionnaire: gymQuestionnaire,
      exerciseId: "db-rdl",
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
    expect(blocked.every((c) => c.exerciseId !== "db-rdl")).toBe(true);
  });

  it("keeps role-truth (hinge pattern) in offered swaps for db-rdl", () => {
    const choices = previewPainSubstitutionChoices({
      questionnaire: gymQuestionnaire,
      exerciseId: "db-rdl",
      section: "main",
      limit: 6,
    });
    expect(choices.length).toBeGreaterThan(0);
    for (const choice of choices) {
      const ex = exerciseById(choice.exerciseId);
      expect(ex).toBeTruthy();
      // Hinge swaps should stay hinge / posterior-chain adjacent, not random push.
      const pattern = (ex!.pattern ?? "").toLowerCase();
      const focus = (ex!.focusTags ?? []).map((t) => t.toLowerCase());
      const muscles = (ex!.muscleGroups ?? []).map((t) => t.toLowerCase());
      const roleOk =
        pattern.includes("hinge") ||
        focus.some((t) => t.includes("hinge") || t.includes("posterior")) ||
        muscles.some((t) => t.includes("hamstring") || t.includes("glute"));
      expect(roleOk).toBe(true);
    }
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
