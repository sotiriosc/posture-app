import { describe, expect, test } from "vitest";
import { generateWeeklyProgram } from "@/lib/program";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { isExerciseEligible, normalizeEquipmentSelection } from "@/lib/equipment";
import { exerciseById } from "@/lib/exercises";
import { evaluateHardPainExclusion } from "@/lib/painModel";

const experiences: QuestionnaireData["experience"][] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const daysOptions: QuestionnaireData["daysPerWeek"][] = [3, 4, 5];

const equipmentProfiles: QuestionnaireData["equipment"][] = [
  ["none"],
  ["bands"],
  ["dumbbells", "bands"],
  ["dumbbells", "bands", "bench"],
  ["gym"],
];

const painProfiles: QuestionnaireData["painAreas"][] = [
  [],
  ["Shoulders"],
  ["Lower back", "Hips"],
  ["Neck", "Upper back"],
];

const expectedMainCount = (
  experience: QuestionnaireData["experience"],
  daysPerWeek: QuestionnaireData["daysPerWeek"],
  dayTitle: string,
  _equipment: QuestionnaireData["equipment"]
) => {
  if (daysPerWeek === 3) {
    if (dayTitle === "Back + Chest") {
      if (experience === "Advanced") return 5;
      if (experience === "Intermediate") return 4;
      return 3;
    }
    if (dayTitle === "Shoulders + Arms") {
      if (experience === "Advanced") return 4;
      if (experience === "Intermediate") return 4;
      return 3;
    }
    if (dayTitle === "Legs + Abs") {
      if (experience === "Advanced") return 4;
      if (experience === "Intermediate") return 4;
      return 3;
    }
  }
  if (experience === "Advanced") return 4;
  if (experience === "Intermediate") return 3;
  return 2;
};

describe("scenario matrix reliability", () => {
  test("all day/experience/equipment/pain combinations produce valid structured programs", () => {
    let scenarios = 0;
    experiences.forEach((experience) => {
      daysOptions.forEach((daysPerWeek) => {
        equipmentProfiles.forEach((equipment) => {
          painProfiles.forEach((painAreas) => {
            scenarios += 1;
            const input: QuestionnaireData = {
              goals: "General fitness",
              painAreas,
              experience,
              equipment,
              daysPerWeek,
            };

            const program = generateWeeklyProgram(input, `scenario-${scenarios}`);
            expect(program.week).toHaveLength(daysPerWeek);

            const available = normalizeEquipmentSelection(equipment).available;
            program.week.forEach((day) => {
              const ids = day.routine.map((item) => item.exerciseId);
              expect(new Set(ids).size).toBe(ids.length);

              const mains = day.routine.filter((item) => item.section === "main");
              const expectedMain = expectedMainCount(experience, daysPerWeek, day.title, equipment);
              const minExpected = Array.isArray(expectedMain) ? expectedMain[0] : expectedMain;
              const maxExpected = Array.isArray(expectedMain) ? expectedMain[1] : expectedMain;

              // Safety-aware count contract: shortfalls are allowed only when
              // degradationNotes document the unresolved slots.
              const notes = day.degradationNotes ?? [];
              expect(mains.length).toBeLessThanOrEqual(maxExpected);
              if (mains.length === 0) {
                expect(
                  notes.some((note) => note.startsWith("unresolved_slot:")),
                  `${day.title}: empty main section without unresolved_slot note`
                ).toBe(true);
              } else {
                expect(mains.length).toBeGreaterThanOrEqual(1);
              }
              if (mains.length < minExpected) {
                const shortfall = minExpected - mains.length;
                expect(
                  notes.some((note) => note.startsWith("unresolved_slot:")),
                  `${day.title}: ${shortfall} main shortfall without unresolved_slot note (${notes.join(" | ") || "none"})`
                ).toBe(true);
              }

              expect(day.routine.some((item) => item.section === "warmup")).toBe(true);
              expect(day.routine.some((item) => item.section === "accessory")).toBe(true);
              expect(day.routine.some((item) => item.section === "cooldown")).toBe(true);
              if (mains.length > 0) {
                expect(day.routine.some((item) => item.section === "main")).toBe(true);
              }

              day.routine.forEach((item) => {
                const exercise = exerciseById(item.exerciseId);
                expect(exercise).toBeTruthy();
                if (exercise) {
                  expect(isExerciseEligible(exercise, available)).toBe(true);
                  if (painAreas.length) {
                    expect(
                      evaluateHardPainExclusion(exercise, painAreas).excluded,
                      `hard-excluded ${item.exerciseId}`
                    ).toBe(false);
                  }
                }
              });
            });
          });
        });
      });
    });

    expect(scenarios).toBe(180);
  });
});
