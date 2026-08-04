import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import { evaluateHardPainExclusion } from "@/lib/painModel";
import {
  ensureEligibleItemForQuestionnaire,
  generateWeeklyProgram,
  previewPainSubstitutionChoices,
} from "@/lib/program";
import { QUESTIONNAIRE_PAIN_DISPLAY_LABELS } from "@/lib/painModel";

const kneesQ = (overrides: Partial<QuestionnaireData> = {}): QuestionnaireData => ({
  goals: "General fitness",
  painAreas: ["Knees"],
  experience: "Beginner",
  equipment: ["gym", "dumbbells", "machines"],
  daysPerWeek: 3,
  ...overrides,
});

describe("manual acceptance — PR #75 pain safety", () => {
  test("Knees remains a questionnaire display label (consumer/gyms shared)", () => {
    expect(QUESTIONNAIRE_PAIN_DISPLAY_LABELS).toContain("Knees");
  });

  test("generated Knees program excludes hard knee contraindications and stays coherent", () => {
    const program = generateWeeklyProgram(kneesQ(), "manual-knees", {
      phaseIndex: 1,
      seed: "manual-knees",
    });
    expect(program.week.length).toBe(3);
    const ids = program.week.flatMap((d) => d.routine.map((i) => i.exerciseId));
    expect(ids).not.toContain("machine-leg-press");
    for (const id of ids) {
      const ex = exerciseById(id);
      if (!ex) continue;
      expect(evaluateHardPainExclusion(ex, ["Knees"]).excluded).toBe(false);
    }
    const lower = program.week.find((d) => d.title.toLowerCase().includes("leg"));
    expect(lower).toBeTruthy();
    expect(lower!.routine.some((i) => i.section === "main")).toBe(true);
    expect(lower!.routine.some((i) => i.section === "accessory")).toBe(true);
  });

  test("empty safe pool omits with degradation note", () => {
    const hardOnly = {
      id: "synth-only-hard",
      name: "Synth",
      category: "main" as const,
      equipment: ["none" as const],
      movementPattern: ["squat"],
      muscleGroups: ["quads"],
      loadType: "weighted" as const,
      durationOrReps: "8",
      cues: ["Brace"],
      mistakes: [],
      painContraindications: ["knees"],
      tags: ["lower"],
    };
    const result = ensureEligibleItemForQuestionnaire({
      item: {
        exerciseId: "synth-only-hard",
        section: "main",
        sets: 3,
        reps: "8-12",
        loadType: "weighted",
        cues: ["Brace"],
      },
      questionnaire: kneesQ({ equipment: ["none"] }),
      dayTitle: "Legs + Abs",
      catalog: [hardOnly],
    });
    expect(result.item).toBeNull();
    expect(result.omitReason).toMatch(/unresolved_slot:no_pain_safe_candidate:knees/);
  });

  test("session knee substitution cannot select hard-excluded same-risk exercise", () => {
    const choices = previewPainSubstitutionChoices({
      questionnaire: kneesQ(),
      exerciseId: "bodyweight-squat",
      section: "main",
      limit: 20,
    });
    for (const choice of choices) {
      const ex = exerciseById(choice.exerciseId)!;
      expect(evaluateHardPainExclusion(ex, ["Knees"]).excluded).toBe(false);
    }
    expect(choices.map((c) => c.exerciseId)).not.toContain("machine-leg-press");
  });

  test("reload/regeneration preserves Knees hard-exclusion determinism", () => {
    const a = generateWeeklyProgram(kneesQ(), "manual-reload-a", {
      phaseIndex: 1,
      seed: "manual-reload-shared",
    });
    const b = generateWeeklyProgram(kneesQ(), "manual-reload-b", {
      phaseIndex: 1,
      seed: "manual-reload-shared",
    });
    const ids = (p: typeof a) =>
      p.week.flatMap((d) => d.routine.map((i) => i.exerciseId));
    expect(ids(a)).toEqual(ids(b));
    for (const id of ids(a)) {
      const ex = exerciseById(id);
      if (!ex) continue;
      expect(evaluateHardPainExclusion(ex, ["Knees"]).excluded).toBe(false);
    }
  });
});
