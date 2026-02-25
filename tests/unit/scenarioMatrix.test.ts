import { describe, expect, test } from "vitest";
import { generateWeeklyProgram } from "@/lib/program";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { isExerciseEligible, normalizeEquipmentSelection } from "@/lib/equipment";
import { exerciseById } from "@/lib/exercises";

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
  equipment: QuestionnaireData["equipment"]
) => {
  const hasTrainingImplement = equipment.some((item) => ["gym", "bands", "dumbbells", "barbell", "kettlebell", "cables", "machines", "pullup_bar"].includes(item));
  const constrainedShouldersArmsEnvironment = !hasTrainingImplement;
  if (daysPerWeek === 3) {
    if (dayTitle === "Back + Chest") {
      if (experience === "Advanced") return 5;
      if (experience === "Intermediate") return 4;
      return 3;
    }
    if (dayTitle === "Shoulders + Arms") {
      if (constrainedShouldersArmsEnvironment) return 3;
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
              expect(mains.length).toBe(
                expectedMainCount(experience, daysPerWeek, day.title, equipment)
              );

              day.routine.forEach((item) => {
                const exercise = exerciseById(item.exerciseId);
                expect(exercise).toBeTruthy();
                if (exercise) {
                  expect(isExerciseEligible(exercise, available)).toBe(true);
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
