import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { Exercise } from "@/lib/exercises";
import { exerciseById } from "@/lib/exercises";
import {
  evaluateHardPainExclusion,
  isPainEligibleAgainstAvoidList,
} from "@/lib/painModel";
import {
  clearProgramConstraintWarningBuffer,
  ensureEligibleItemForQuestionnaire,
  generateWeeklyProgram,
  previewPainSubstitutionChoices,
} from "@/lib/program";
import { normalizeWeekForProgramConstraints } from "@/lib/program/postGenerationPipeline";
import type { ProgramDay, ProgramRoutineItem } from "@/lib/types";
import { normalizeEquipmentSelection } from "@/lib/equipment";

const baseQ = (painAreas: string[]): QuestionnaireData => ({
  goals: "General fitness",
  painAreas,
  experience: "Beginner",
  equipment: ["gym", "dumbbells", "machines", "bands", "bench", "none"],
  daysPerWeek: 3,
});

const stubExercise = (overrides: Partial<Exercise> & Pick<Exercise, "id">): Exercise => ({
  id: overrides.id,
  name: overrides.name ?? overrides.id,
  category: overrides.category ?? "main",
  equipment: overrides.equipment ?? ["dumbbells", "none"],
  movementPattern: overrides.movementPattern ?? ["squat"],
  muscleGroups: overrides.muscleGroups ?? ["quads"],
  loadType: overrides.loadType ?? "weighted",
  durationOrReps: overrides.durationOrReps ?? "8-12 reps",
  cues: overrides.cues ?? ["Brace"],
  mistakes: overrides.mistakes ?? ["Round back"],
  painContraindications: overrides.painContraindications,
  contraindications: overrides.contraindications ?? [],
  tags: overrides.tags ?? ["lower"],
  swapOptions: overrides.swapOptions,
  ...overrides,
});

const routineItem = (
  exerciseId: string,
  section: ProgramRoutineItem["section"] = "main"
): ProgramRoutineItem => ({
  exerciseId,
  section,
  sets: 3,
  reps: "8-12",
  loadType: "weighted",
  cues: ["Brace"],
});

const allRoutineIds = (week: ProgramDay[]) =>
  week.flatMap((day) => day.routine.map((item) => item.exerciseId));

describe("pain safety monotonicity — ensureEligibleItem", () => {
  test("hard-excluded original is never returned unchanged when category pool is empty", () => {
    clearProgramConstraintWarningBuffer();
    const excludedA = stubExercise({
      id: "synth-hard-a",
      category: "main",
      movementPattern: ["squat"],
      painContraindications: ["knees"],
    });
    const excludedB = stubExercise({
      id: "synth-hard-b",
      category: "main",
      movementPattern: ["squat"],
      painContraindications: ["knees"],
      swapOptions: ["synth-hard-a"],
    });
    const catalog = [excludedA, excludedB];

    const result = ensureEligibleItemForQuestionnaire({
      item: routineItem("synth-hard-a"),
      questionnaire: baseQ(["Knees"]),
      dayTitle: "Legs + Abs",
      catalog,
    });

    expect(result.item).toBeNull();
    expect(result.omitReason).toMatch(
      /^unresolved_slot:no_pain_safe_candidate:knees/
    );
    expect(result.omitReason).toContain("synth-hard-a");
  });

  test("widens to a pain-safe candidate when every peer with overlapping patterns is hard-excluded", () => {
    const hard = stubExercise({
      id: "synth-hard-squat",
      category: "main",
      movementPattern: ["squat"],
      painContraindications: ["knees"],
      swapOptions: ["synth-hard-squat-2"],
    });
    const hardPeer = stubExercise({
      id: "synth-hard-squat-2",
      category: "main",
      movementPattern: ["squat"],
      painContraindications: ["knees"],
    });
    const safeHinge = stubExercise({
      id: "synth-safe-hinge",
      category: "main",
      movementPattern: ["hinge"],
      muscleGroups: ["glutes"],
      painContraindications: ["acute shoulders"],
      tags: ["hinge", "lower"],
    });
    const result = ensureEligibleItemForQuestionnaire({
      item: routineItem("synth-hard-squat"),
      questionnaire: baseQ(["Knees"]),
      dayTitle: "Legs + Abs",
      catalog: [hard, hardPeer, safeHinge],
    });
    expect(result.item?.exerciseId).toBe("synth-safe-hinge");
    expect(result.item?.exerciseId).not.toBe("synth-hard-squat");
    expect(result.item?.notes).toMatch(
      /pain_safe_(substitution|category_widen|role_widen):/
    );
  });

  test("final normalize cannot preserve an unresolved contraindicated item", () => {
    const program = generateWeeklyProgram(baseQ(["Knees"]), "pain-normalize-inject", {
      phaseIndex: 1,
      seed: "pain-normalize-inject",
    });
    const available = normalizeEquipmentSelection(baseQ(["Knees"]).equipment).available;
    const injected: ProgramDay[] = program.week.map((day, index) =>
      index === 0
        ? {
            ...day,
            routine: [
              ...day.routine,
              routineItem("machine-leg-press"),
            ],
          }
        : day
    );

    const normalized = normalizeWeekForProgramConstraints({
      week: injected,
      available,
      selectionContext: { painAreas: ["Knees"] } as never,
      resolveEligibilityAvailabilityForDay: () => available,
      ensureEligibleItem: (item, _available, _ctx, dayTitle) =>
        ensureEligibleItemForQuestionnaire({
          item,
          questionnaire: baseQ(["Knees"]),
          dayTitle,
        }),
      ensureDistinctRoutine: (day) => day,
    });

    expect(allRoutineIds(normalized)).not.toContain("machine-leg-press");
    for (const id of allRoutineIds(normalized)) {
      const ex = exerciseById(id);
      if (!ex) continue;
      expect(evaluateHardPainExclusion(ex, ["Knees"]).excluded).toBe(false);
    }
  });

  test("empty safe candidate pool records explicit degradation warning on the day", () => {
    const hardOnly = [
      stubExercise({
        id: "synth-only-hard",
        painContraindications: ["knees"],
        movementPattern: ["squat"],
      }),
    ];
    const week: ProgramDay[] = [
      {
        dayIndex: 0,
        title: "Legs + Abs",
        focusTags: [],
        routine: [routineItem("synth-only-hard")],
      },
    ];
    const available = normalizeEquipmentSelection(baseQ(["Knees"]).equipment).available;
    const normalized = normalizeWeekForProgramConstraints({
      week,
      available,
      selectionContext: { painAreas: ["Knees"] } as never,
      resolveEligibilityAvailabilityForDay: () => available,
      ensureEligibleItem: (item, _a, _c, dayTitle) =>
        ensureEligibleItemForQuestionnaire({
          item,
          questionnaire: baseQ(["Knees"]),
          dayTitle,
          catalog: hardOnly,
        }),
      ensureDistinctRoutine: (day) => day,
    });

    expect(normalized[0].routine).toHaveLength(0);
    expect(normalized[0].degradationNotes?.some((note) =>
      note.startsWith("unresolved_slot:no_pain_safe_candidate:knees")
    )).toBe(true);
  });
});

describe("pain safety monotonicity — substitution hard-drop", () => {
  test("hard-excluded substitution candidates never appear even with superior soft score traits", () => {
    const current = stubExercise({
      id: "synth-current",
      category: "main",
      movementPattern: ["squat", "knee_dominant"],
      painContraindications: ["acute knees"],
      swapOptions: ["synth-contra-best", "synth-safe-weak"],
      tags: ["squat"],
    });
    // Would win on movement overlap + preferred tags if scoring alone decided.
    const contraindicatedBest = stubExercise({
      id: "synth-contra-best",
      category: "main",
      movementPattern: ["squat", "knee_dominant"],
      painContraindications: ["knees"],
      tags: ["squat", "knee_friendly_false"],
      focusTags: ["motor_control", "stability"],
    });
    const safeWeak = stubExercise({
      id: "synth-safe-weak",
      category: "main",
      movementPattern: ["squat"],
      painContraindications: ["acute shoulders"],
      tags: ["squat"],
    });

    const choices = previewPainSubstitutionChoices({
      questionnaire: baseQ(["Knees"]),
      exerciseId: "synth-current",
      section: "main",
      catalog: [current, contraindicatedBest, safeWeak],
      limit: 10,
    });

    expect(choices.map((c) => c.exerciseId)).not.toContain("synth-contra-best");
    expect(choices.some((c) => c.exerciseId === "synth-safe-weak")).toBe(true);
  });

  test("only contraindicated substitutions available → empty safe pool", () => {
    const current = stubExercise({
      id: "synth-current-2",
      category: "main",
      movementPattern: ["hinge"],
      painContraindications: [],
      swapOptions: ["synth-hard-1", "synth-hard-2"],
    });
    const hard1 = stubExercise({
      id: "synth-hard-1",
      category: "main",
      movementPattern: ["hinge"],
      painContraindications: ["low back"],
    });
    const hard2 = stubExercise({
      id: "synth-hard-2",
      category: "main",
      movementPattern: ["hinge"],
      painContraindications: ["low back"],
    });

    const choices = previewPainSubstitutionChoices({
      questionnaire: baseQ(["Lower back"]),
      exerciseId: "synth-current-2",
      section: "main",
      catalog: [current, hard1, hard2],
      limit: 10,
    });
    expect(choices).toEqual([]);
  });

  test("same-risk session replacement never selects hard-excluded candidate", () => {
    const current = stubExercise({
      id: "synth-session-current",
      category: "main",
      movementPattern: ["push", "verticalpush"],
      painContraindications: ["acute shoulders"],
      swapOptions: ["synth-session-hard", "synth-session-safe"],
    });
    const hard = stubExercise({
      id: "synth-session-hard",
      category: "main",
      movementPattern: ["push", "verticalpush"],
      painContraindications: ["shoulders"],
    });
    const safe = stubExercise({
      id: "synth-session-safe",
      category: "main",
      movementPattern: ["push"],
      painContraindications: ["acute neck"],
    });

    const choices = previewPainSubstitutionChoices({
      questionnaire: baseQ(["Shoulders"]),
      exerciseId: "synth-session-current",
      section: "main",
      catalog: [current, hard, safe],
    });
    expect(choices.map((c) => c.exerciseId)).not.toContain("synth-session-hard");
    for (const choice of choices) {
      const ex = [current, hard, safe].find((e) => e.id === choice.exerciseId)!;
      expect(evaluateHardPainExclusion(ex, ["Shoulders"]).excluded).toBe(false);
    }
  });

  test("real catalog: hard-excluded candidate is never selected for Knees", () => {
    const choices = previewPainSubstitutionChoices({
      questionnaire: baseQ(["Knees"]),
      exerciseId: "bodyweight-squat",
      section: "main",
      limit: 20,
    });
    for (const choice of choices) {
      const ex = exerciseById(choice.exerciseId);
      expect(ex).toBeTruthy();
      expect(evaluateHardPainExclusion(ex!, ["Knees"]).excluded).toBe(false);
    }
    expect(choices.map((c) => c.exerciseId)).not.toContain("machine-leg-press");
  });
});

describe("pain safety — acute consistency (warmup vs planning)", () => {
  test("questionnaire planning: acute_* is soft; warmup avoid lists treat acute as hard", () => {
    const planning = evaluateHardPainExclusion(
      { painContraindications: ["acute knees"], contraindications: [] },
      ["Knees"]
    );
    expect(planning.excluded).toBe(false);

    // Warmup default: treatAcuteAsHard true
    expect(
      isPainEligibleAgainstAvoidList(["acute knees"], ["Knees"], {
        treatAcuteAsHard: true,
      })
    ).toBe(false);

    // Opt-out matches planning soft caution
    expect(
      isPainEligibleAgainstAvoidList(["acute knees"], ["Knees"], {
        treatAcuteAsHard: false,
      })
    ).toBe(true);
  });

  test("warmup avoid list default (no options) treats acute_* as hard", () => {
    expect(isPainEligibleAgainstAvoidList(["acute shoulders"], ["Shoulders"])).toBe(
      false
    );
    expect(isPainEligibleAgainstAvoidList(["shoulders"], ["Shoulders"])).toBe(false);
    expect(isPainEligibleAgainstAvoidList(["acute shoulders"], ["Knees"])).toBe(true);
  });
});

describe("pain safety — multi-area scarce pools", () => {
  test("Shoulders + Knees + Lower back generation never keeps hard-excluded items", () => {
    const areas = ["Shoulders", "Knees", "Lower back"];
    const program = generateWeeklyProgram(baseQ(areas), "pain-scarce-multi", {
      phaseIndex: 1,
      seed: "pain-scarce-multi",
    });
    for (const id of allRoutineIds(program.week)) {
      const ex = exerciseById(id);
      if (!ex) continue;
      expect(
        evaluateHardPainExclusion(ex, areas).excluded,
        `hard-excluded ${id} survived multi-area generation`
      ).toBe(false);
    }
    const notes = program.week.flatMap((d) => d.degradationNotes ?? []);
    for (const note of notes) {
      if (note.startsWith("unresolved_slot:no_pain_safe_candidate:")) {
        expect(note).toMatch(/unresolved_slot:no_pain_safe_candidate:\w+/);
      }
    }
  });

  test("catalog demotions: acute shoulders exercises remain eligible under questionnaire Shoulders", () => {
    const demotedIds = [
      "dumbbell-shoulder-press",
      "band-lateral-raise",
      "prone-y-raise",
      "machine-shoulder-press",
    ];
    for (const id of demotedIds) {
      const ex = exerciseById(id);
      expect(ex, id).toBeTruthy();
      expect(ex!.painContraindications?.some((t) => t === "acute shoulders")).toBe(
        true
      );
      expect(evaluateHardPainExclusion(ex!, ["Shoulders"]).excluded).toBe(false);
      expect(
        evaluateHardPainExclusion(ex!, ["Shoulders"], { treatAcuteAsHard: true })
          .excluded
      ).toBe(true);
    }
  });
});
