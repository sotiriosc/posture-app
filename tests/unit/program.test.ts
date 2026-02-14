import { describe, expect, test } from "vitest";
import { generateWeeklyProgram } from "@/lib/program";
import { exerciseById } from "@/lib/exercises";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";

const getPatterns = (exerciseIds: string[]) => {
  const patterns = new Set<string>();
  exerciseIds.forEach((id) => {
    const exercise = exerciseById(id);
    exercise?.movementPattern.forEach((pattern) => patterns.add(pattern));
  });
  return patterns;
};

const hasMainMovement = (exerciseIds: string[]) =>
  exerciseIds.some((id) => exerciseById(id)?.category === "main");

const hasStructuredSections = (
  day: ReturnType<typeof generateWeeklyProgram>["week"][number]
) => {
  const sections = new Set(day.routine.map((item) => item.section));
  return (
    sections.has("warmup") &&
    (sections.has("activation") || sections.has("accessory")) &&
    sections.has("main") &&
    sections.has("cooldown")
  );
};

const baseData: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["none"],
  daysPerWeek: 3,
};

const parseMinSet = (sets: string | number | null) => {
  if (!sets) return 0;
  if (typeof sets === "number") return sets;
  const first = Number(sets.split("-")[0].trim());
  return Number.isFinite(first) ? first : 0;
};

const parseMaxSet = (sets: string | number | null) => {
  if (!sets) return 0;
  if (typeof sets === "number") return sets;
  const cleaned = sets.replace("–", "-");
  const parts = cleaned.split("-").map((part) => Number(part.trim()));
  if (parts.length >= 2 && Number.isFinite(parts[1])) return parts[1];
  if (parts.length >= 1 && Number.isFinite(parts[0])) return parts[0];
  return 0;
};

describe("program generation slot coverage", () => {
  test("none equipment provides structured day coverage", () => {
    const program = generateWeeklyProgram(baseData, "test-program");
    program.week.forEach((day) => {
      const ids = day.routine.map((item) => item.exerciseId);
      expect(ids.length).toBeGreaterThanOrEqual(5);
      expect(hasMainMovement(ids)).toBe(true);
      expect(hasStructuredSections(day)).toBe(true);
      expect(getPatterns(ids).has("mobility")).toBe(true);
    });
  });

  test("bands equipment provides structured day coverage", () => {
    const program = generateWeeklyProgram(
      { ...baseData, equipment: ["bands"] },
      "test-program"
    );
    program.week.forEach((day) => {
      const ids = day.routine.map((item) => item.exerciseId);
      expect(ids.length).toBeGreaterThanOrEqual(5);
      expect(hasMainMovement(ids)).toBe(true);
      expect(hasStructuredSections(day)).toBe(true);
      expect(getPatterns(ids).has("mobility")).toBe(true);
    });
  });

  test("4-day split generates 4 program days", () => {
    const program = generateWeeklyProgram(
      { ...baseData, daysPerWeek: 4 },
      "test-program-4"
    );
    expect(program.daysPerWeek).toBe(4);
    expect(program.week).toHaveLength(4);
    expect(program.week.map((day) => day.title)).toEqual([
      "Upper Push + Scapular Control",
      "Lower (Squat Emphasis) + Core",
      "Upper Pull + Thoracic Posture",
      "Lower (Hinge Emphasis) + Carry/Anti-rotation",
    ]);
  });

  test("3-day split uses targeted day structure", () => {
    const program = generateWeeklyProgram(
      { ...baseData, daysPerWeek: 3 },
      "test-program-3"
    );
    expect(program.daysPerWeek).toBe(3);
    expect(program.week).toHaveLength(3);
    expect(program.week.map((day) => day.title)).toEqual([
      "Back + Chest",
      "Shoulders + Arms",
      "Legs + Abs",
    ]);
  });

  test("5-day split generates 5 program days with distinct split titles", () => {
    const program = generateWeeklyProgram(
      { ...baseData, daysPerWeek: 5 },
      "test-program-5"
    );
    expect(program.daysPerWeek).toBe(5);
    expect(program.week).toHaveLength(5);
    expect(program.week.map((day) => day.title)).toEqual([
      "Upper Push",
      "Lower Squat",
      "Upper Pull",
      "Lower Hinge + Posterior Chain",
      "Arms + Posture + Conditioning",
    ]);
  });

  test("each day has distinct exercises (no duplicates)", () => {
    const program = generateWeeklyProgram(
      { ...baseData, daysPerWeek: 5, equipment: ["none", "bands"] },
      "distinct-program"
    );
    program.week.forEach((day) => {
      const ids = day.routine.map((item) => item.exerciseId);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  test("each day includes a dedicated activation block", () => {
    const program = generateWeeklyProgram(
      { ...baseData, daysPerWeek: 5, equipment: ["none", "bands", "dumbbells"] },
      "activation-coverage"
    );
    program.week.forEach((day) => {
      const hasActivation = day.routine.some((item) => item.section === "activation");
      expect(hasActivation).toBe(true);
    });
  });

  test("weekly plan keeps global movement balance while splitting focus days", () => {
    const program = generateWeeklyProgram(
      { ...baseData, daysPerWeek: 5, equipment: ["none", "bands", "dumbbells"] },
      "weekly-movement-balance"
    );
    const weekIds = program.week.flatMap((day) => day.routine.map((item) => item.exerciseId));
    const patterns = getPatterns(weekIds);
    ["push", "pull", "squat", "hinge", "core"].forEach((pattern) => {
      expect(patterns.has(pattern)).toBe(true);
    });
  });

  test("experience level scales session capacity and demand", () => {
    const beginner = generateWeeklyProgram(
      { ...baseData, experience: "Beginner", equipment: ["dumbbells", "bench", "bands"] },
      "beginner-program"
    );
    const advanced = generateWeeklyProgram(
      { ...baseData, experience: "Advanced", equipment: ["dumbbells", "bench", "bands"] },
      "advanced-program"
    );
    const beginnerDay = beginner.week[0];
    const advancedDay = advanced.week[0];

    const beginnerMain = beginnerDay.routine.filter((item) => item.section === "main");
    const advancedMain = advancedDay.routine.filter((item) => item.section === "main");
    const beginnerAccessory = beginnerDay.routine.filter(
      (item) => item.section === "accessory"
    );
    const advancedAccessory = advancedDay.routine.filter(
      (item) => item.section === "accessory"
    );

    expect(advancedDay.routine.length).toBeGreaterThanOrEqual(beginnerDay.routine.length);
    expect(advancedMain.length).toBeGreaterThanOrEqual(beginnerMain.length);
    expect(advancedAccessory.length).toBeGreaterThanOrEqual(beginnerAccessory.length);
    expect(parseMinSet(advancedMain[0]?.sets ?? null)).toBeGreaterThanOrEqual(
      parseMinSet(beginnerMain[0]?.sets ?? null)
    );
    expect((advancedMain[0]?.restSec ?? 0)).toBeGreaterThanOrEqual(
      beginnerMain[0]?.restSec ?? 0
    );
  });

  test("main lift count matches experience level", () => {
    const equip = { ...baseData, equipment: ["dumbbells", "bench", "bands"] };
    const beginner = generateWeeklyProgram(
      { ...equip, experience: "Beginner" },
      "beginner-main-count"
    );
    const intermediate = generateWeeklyProgram(
      { ...equip, experience: "Intermediate" },
      "intermediate-main-count"
    );
    const advanced = generateWeeklyProgram(
      { ...equip, experience: "Advanced" },
      "advanced-main-count"
    );

    const countMain = (program: ReturnType<typeof generateWeeklyProgram>) =>
      program.week[0].routine.filter((item) => item.section === "main").length;

    expect(countMain(beginner)).toBe(2);
    expect(countMain(intermediate)).toBe(3);
    expect(countMain(advanced)).toBe(4);
  });

  test("main section never receives non-main exercises", () => {
    const program = generateWeeklyProgram(
      { ...baseData, experience: "Advanced", equipment: ["none", "bands", "dumbbells", "bench"] },
      "main-category-integrity"
    );
    program.week.forEach((day) => {
      day.routine
        .filter((item) => item.section === "main")
        .forEach((item) => {
          const category = exerciseById(item.exerciseId)?.category;
          if (category !== "main") {
            throw new Error(
              `Non-main exercise in main section: ${item.exerciseId} (${category ?? "unknown"})`
            );
          }
          expect(category).toBe("main");
        });
    });
  });

  test("exercise library includes back extension", () => {
    expect(exerciseById("back-extension")).toBeDefined();
  });

  test("advanced no-equipment includes higher-skill options", () => {
    const program = generateWeeklyProgram(
      {
        ...baseData,
        experience: "Advanced",
        equipment: ["none"],
        goals: "Athletic performance",
      },
      "advanced-no-equipment"
    );
    const ids = program.week.flatMap((day) => day.routine.map((item) => item.exerciseId));
    expect(
      ids.some((id) =>
        [
          "archer-pushup",
          "pseudo-planche-pushup",
          "shrimp-squat",
          "cossack-squat",
          "single-leg-hip-thrust",
          "prone-swimmer",
          "back-widow",
          "hollow-body-hold",
          "side-plank-star",
        ].includes(id)
      )
    ).toBe(true);
  });

  test("advanced no-equipment keeps day exercises unique", () => {
    const program = generateWeeklyProgram(
      {
        ...baseData,
        experience: "Advanced",
        equipment: ["none"],
        goals: "Athletic performance",
      },
      "advanced-none-unique"
    );

    program.week.forEach((day) => {
      const ids = day.routine.map((item) => item.exerciseId);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  test("dumbbells + bands without bench still includes dumbbell mains", () => {
    const program = generateWeeklyProgram(
      {
        ...baseData,
        experience: "Intermediate",
        equipment: ["dumbbells", "bands"],
        goals: "General fitness",
      },
      "db-bands-no-bench"
    );

    program.week.forEach((day) => {
      const mains = day.routine.filter((item) => item.section === "main");
      expect(
        mains.some((item) =>
          exerciseById(item.exerciseId)?.equipment.includes("dumbbells")
        )
      ).toBe(true);
    });
  });

  test("beginner progression stays conservative when readiness is low", () => {
    const beginner = generateWeeklyProgram(
      {
        ...baseData,
        experience: "Beginner",
        goals: "General fitness",
        equipment: ["none", "bands"],
      },
      "beginner-conservative-progression",
      {
        phaseIndex: 3,
        cycleIndex: 2,
        trainingState: {
          stage: "build",
          readiness: 0.4,
          consistency: 0.9,
          painRisk: 0.55,
          fatigueRisk: 0.2,
          movementQuality: 0.5,
          capacity: 0.5,
          confidence: 0.5,
          trend: "flat",
          reason: "test",
        },
      }
    );

    beginner.week.forEach((day) => {
      day.routine
        .filter((item) => item.section === "main")
        .forEach((item) => {
          expect(parseMaxSet(item.sets ?? null)).toBeLessThanOrEqual(3);
          expect(item.restSec ?? 0).toBeGreaterThanOrEqual(50);
        });
    });
  });

  test("advanced progression can push volume and density when readiness is high", () => {
    const advanced = generateWeeklyProgram(
      {
        ...baseData,
        experience: "Advanced",
        goals: "Athletic performance",
        equipment: ["dumbbells", "bench", "bands"],
      },
      "advanced-aggressive-progression",
      {
        phaseIndex: 3,
        cycleIndex: 2,
        trainingState: {
          stage: "push",
          readiness: 0.86,
          consistency: 0.95,
          painRisk: 0.1,
          fatigueRisk: 0.2,
          movementQuality: 0.85,
          capacity: 0.85,
          confidence: 0.85,
          trend: "up",
          reason: "test",
        },
      }
    );

    const anyHighVolumeMain = advanced.week.some((day) =>
      day.routine
        .filter((item) => item.section === "main")
        .some((item) => parseMaxSet(item.sets ?? null) >= 5)
    );
    expect(anyHighVolumeMain).toBe(true);
  });

  test("pain areas influence exercise selection priorities", () => {
    const noPain = generateWeeklyProgram(
      { ...baseData, experience: "Intermediate", equipment: ["none", "bands"] },
      "no-pain-priority"
    );
    const shoulderPain = generateWeeklyProgram(
      {
        ...baseData,
        experience: "Intermediate",
        equipment: ["none", "bands"],
        painAreas: ["Shoulders", "Upper back"],
      },
      "shoulder-pain-priority"
    );

    const scoredTags = new Set(["scap", "upper-back", "t-spine", "core"]);
    const scoreProgram = (program: ReturnType<typeof generateWeeklyProgram>) =>
      program.week
        .flatMap((day) => day.routine.map((item) => exerciseById(item.exerciseId)))
        .filter(Boolean)
        .reduce(
          (sum, exercise) =>
            sum + exercise!.tags.reduce((n, tag) => (scoredTags.has(tag) ? n + 1 : n), 0),
          0
        );

    expect(scoreProgram(shoulderPain)).toBeGreaterThanOrEqual(scoreProgram(noPain));
  });

  test("reduce-pain shoulder plan deprioritizes advanced options", () => {
    const base = generateWeeklyProgram(
      { ...baseData, experience: "Advanced", equipment: ["none"] },
      "base-advanced-none"
    );
    const reducePain = generateWeeklyProgram(
      {
        ...baseData,
        experience: "Advanced",
        equipment: ["none"],
        painAreas: ["Shoulders"],
        goals: "Reduce pain",
      },
      "reduce-pain-advanced-none"
    );

    const advancedTagCount = (program: ReturnType<typeof generateWeeklyProgram>) =>
      program.week
        .flatMap((day) => day.routine.map((item) => exerciseById(item.exerciseId)))
        .filter(Boolean)
        .reduce(
          (sum, exercise) => sum + (exercise!.tags.includes("advanced") ? 1 : 0),
          0
        );

    expect(advancedTagCount(reducePain)).toBeLessThanOrEqual(advancedTagCount(base));
  });
});
