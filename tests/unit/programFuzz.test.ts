import { describe, expect, test } from "vitest";
import { generateWeeklyProgram } from "@/lib/program";
import { exerciseById } from "@/lib/exercises";
import { isExerciseEligible, normalizeEquipmentSelection } from "@/lib/equipment";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

const goals: QuestionnaireData["goals"][] = [
  "Improve posture",
  "Reduce pain",
  "Athletic performance",
  "General fitness",
];

const experiences: QuestionnaireData["experience"][] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const painAreasPool = [
  "Neck",
  "Upper back",
  "Lower back",
  "Shoulders",
  "Hips",
  "Knees",
];

const equipmentPool = [
  "none",
  "bands",
  "dumbbells",
  "bench",
  "foam_roller",
  "gym",
];

const expectedMainCount = (experience: string) => {
  if (experience === "Advanced") return 4;
  if (experience === "Intermediate") return 3;
  return 2;
};

const seeded = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
};

const randomSubset = <T,>(
  values: T[],
  rand: () => number,
  maxCount: number
) => {
  const picked = values.filter(() => rand() > 0.5);
  const unique = Array.from(new Set(picked));
  return unique.slice(0, maxCount);
};

describe("program fuzz invariants", () => {
  test("randomized questionnaire combinations preserve structural safety", () => {
    const rand = seeded(42);
    const scenarioCount = 180;

    for (let i = 0; i < scenarioCount; i += 1) {
      const daysPerWeek = ([3, 4, 5] as const)[Math.floor(rand() * 3)];
      const goal = goals[Math.floor(rand() * goals.length)];
      const experience = experiences[Math.floor(rand() * experiences.length)];
      const painAreas = randomSubset(painAreasPool, rand, 3);
      const pickedEquipment = randomSubset(equipmentPool, rand, 4);
      const equipment = pickedEquipment.length ? pickedEquipment : ["none"];

      const input: QuestionnaireData = {
        goals: goal,
        painAreas,
        experience,
        equipment,
        daysPerWeek,
      };

      const program = generateWeeklyProgram(input, `fuzz-${i}`, {
        phaseIndex: 1 + Math.floor(rand() * 3),
        weekIndex: 1 + Math.floor(rand() * 2),
        cycleIndex: 1 + Math.floor(rand() * 3),
      });

      expect(program.week).toHaveLength(daysPerWeek);

      const available = normalizeEquipmentSelection(input.equipment).available;
      program.week.forEach((day) => {
        const ids = day.routine.map((item) => item.exerciseId);
        expect(new Set(ids).size).toBe(ids.length);

        const sections = new Set(day.routine.map((item) => item.section));
        expect(sections.has("warmup")).toBe(true);
        expect(sections.has("main")).toBe(true);
        expect(sections.has("accessory")).toBe(true);
        expect(sections.has("cooldown")).toBe(true);

        const mains = day.routine.filter((item) => item.section === "main");
        expect(mains.length).toBe(expectedMainCount(experience));

        mains.forEach((item) => {
          const exercise = exerciseById(item.exerciseId);
          expect(exercise).toBeDefined();
          expect(exercise?.category).toBe("main");
          expect(isExerciseEligible(exercise!, available)).toBe(true);
        });

        day.routine.forEach((item) => {
          const exercise = exerciseById(item.exerciseId);
          expect(exercise).toBeDefined();
          expect(isExerciseEligible(exercise!, available)).toBe(true);
        });
      });
    }
  });
});
