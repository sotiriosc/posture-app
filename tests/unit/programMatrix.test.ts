import { describe, expect, test } from "vitest";
import { generateWeeklyProgram } from "@/lib/program";
import { exerciseById } from "@/lib/exercises";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

const experiences: QuestionnaireData["experience"][] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const goals: QuestionnaireData["goals"][] = [
  "Improve posture",
  "Reduce pain",
  "Athletic performance",
  "General fitness",
];

const daysOptions: QuestionnaireData["daysPerWeek"][] = [3, 4, 5];

const equipmentProfiles: Array<{
  label: string;
  equipment: QuestionnaireData["equipment"];
}> = [
  { label: "none", equipment: ["none"] },
  { label: "bands", equipment: ["bands"] },
  { label: "home", equipment: ["bands", "dumbbells", "bench"] },
  { label: "gym", equipment: ["gym"] },
];

const painProfiles: Array<{
  label: string;
  painAreas: QuestionnaireData["painAreas"];
}> = [
  { label: "no-pain", painAreas: [] },
  { label: "shoulders-upper-back", painAreas: ["Shoulders", "Upper back"] },
  { label: "lower-back-hips", painAreas: ["Lower back", "Hips"] },
];

const expectedMainCount = (
  experience: QuestionnaireData["experience"],
  daysPerWeek: QuestionnaireData["daysPerWeek"],
  dayTitle: string
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

const hasSections = (day: ReturnType<typeof generateWeeklyProgram>["week"][number]) => {
  const sections = new Set(day.routine.map((item) => item.section));
  return (
    sections.has("warmup") &&
    sections.has("main") &&
    sections.has("accessory") &&
    sections.has("cooldown")
  );
};

describe("program matrix quality", () => {
  test("core structure invariants hold across scenario matrix", () => {
    let scenarioCount = 0;

    experiences.forEach((experience) => {
      goals.forEach((goal) => {
        daysOptions.forEach((daysPerWeek) => {
          equipmentProfiles.forEach(({ equipment }) => {
            painProfiles.forEach(({ painAreas }) => {
              scenarioCount += 1;
              const input: QuestionnaireData = {
                goals: goal,
                painAreas,
                experience,
                equipment,
                daysPerWeek,
              };
              const id = `matrix-${scenarioCount}`;
              const program = generateWeeklyProgram(input, id);

              expect(program.week).toHaveLength(daysPerWeek);
              program.week.forEach((day) => {
                expect(hasSections(day)).toBe(true);

                const ids = day.routine.map((item) => item.exerciseId);
                expect(new Set(ids).size).toBe(ids.length);

                const mains = day.routine.filter((item) => item.section === "main");
                expect(mains.length).toBe(
                  expectedMainCount(experience, daysPerWeek, day.title)
                );
                mains.forEach((item) => {
                  expect(exerciseById(item.exerciseId)?.category).toBe("main");
                });

                if (equipment.includes("none") && equipment.length === 1) {
                  day.routine.forEach((item) => {
                    const exercise = exerciseById(item.exerciseId);
                    expect(exercise?.equipment.includes("none")).toBe(true);
                  });
                }
              });
            });
          });
        });
      });
    });

    expect(scenarioCount).toBeGreaterThanOrEqual(100);
  });

  test("phase change is not static across matrix anchors", () => {
    const anchors: QuestionnaireData[] = [
      {
        goals: "Improve posture",
        painAreas: [],
        experience: "Beginner",
        equipment: ["none"],
        daysPerWeek: 3,
      },
      {
        goals: "Reduce pain",
        painAreas: ["Shoulders", "Upper back"],
        experience: "Intermediate",
        equipment: ["bands"],
        daysPerWeek: 4,
      },
      {
        goals: "Athletic performance",
        painAreas: [],
        experience: "Advanced",
        equipment: ["bands", "dumbbells", "bench"],
        daysPerWeek: 5,
      },
    ];

    anchors.forEach((input, index) => {
      const phase1 = generateWeeklyProgram(input, `anchor-p1-${index}`, {
        phaseIndex: 1,
        weekIndex: 1,
      });
      const phase2 = generateWeeklyProgram(input, `anchor-p2-${index}`, {
        phaseIndex: 2,
        weekIndex: 1,
      });
      expect(phase1.week).not.toEqual(phase2.week);
    });
  });
});
