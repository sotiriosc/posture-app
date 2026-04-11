import { describe, expect, test } from "vitest";
import { generateWeeklyProgram } from "@/lib/program";
import { exerciseById, type Exercise } from "@/lib/exercises";
import { isExerciseEligible, normalizeEquipmentSelection } from "@/lib/equipment";
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
  { label: "dumbbells", equipment: ["dumbbells"] },
  { label: "home", equipment: ["bands", "dumbbells"] },
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
  goal: QuestionnaireData["goals"],
  painAreas: QuestionnaireData["painAreas"],
  daysPerWeek: QuestionnaireData["daysPerWeek"],
  dayTitle: string,
  equipment: QuestionnaireData["equipment"]
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
  if (dayTitle === "Arms + Posture + Conditioning") return 2;
  const highPain =
    painAreas.length >= 2 || (goal === "Reduce pain" && experience === "Beginner");
  if (highPain) return 2;
  const lowerHingeDay =
    dayTitle === "Lower (Hinge Emphasis) + Carry/Anti-rotation" ||
    dayTitle === "Lower Hinge + Posterior Chain";
  if (
    daysPerWeek >= 4 &&
    experience === "Advanced" &&
    dayTitle.toLowerCase().includes("lower")
  ) {
    return [2, 4];
  }
  if (
    daysPerWeek >= 4 &&
    lowerHingeDay &&
    experience === "Intermediate"
  ) {
    return [2, 3];
  }
  if (
    daysPerWeek >= 4 &&
    lowerHingeDay &&
    equipment.includes("none") &&
    equipment.length === 1
  ) {
    return [2, 3];
  }
  if (experience === "Advanced" && equipment.includes("none") && equipment.length === 1) {
    return 3;
  }
  if (experience === "Advanced" && (goal === "Improve posture" || painAreas.length > 0)) {
    return 3;
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

const hasPattern = (exercise: Exercise, pattern: string) =>
  exercise.movementPattern.some((entry) => entry.toLowerCase() === pattern.toLowerCase());

const descriptor = (exercise: Exercise) => `${exercise.id} ${exercise.name}`.toLowerCase();

const isCarryOrBraceDrill = (exercise: Exercise) => {
  const text = descriptor(exercise);
  return [
    "carry",
    "suitcase",
    "pallof",
    "woodchop",
    "anti-rotation",
    "anti rotation",
    "hollow body",
    "hollow-body",
    "plank",
    "dead bug",
    "dead-bug",
    "bird dog",
    "bird-dog",
    "march",
  ].some((token) => text.includes(token));
};

const isCoreAccessory = (exercise: Exercise) => {
  const text = descriptor(exercise);
  const tags = new Set((exercise.tags ?? []).map((tag) => tag.toLowerCase()));
  const patterns = new Set(exercise.movementPattern.map((pattern) => pattern.toLowerCase()));
  if (isCarryOrBraceDrill(exercise)) return true;
  const coreOrBrace =
    patterns.has("core") ||
    patterns.has("anti-rotation") ||
    patterns.has("anti_rotation") ||
    patterns.has("anti-extension") ||
    patterns.has("anti_extension") ||
    tags.has("core") ||
    tags.has("tva") ||
    tags.has("anti-rotation") ||
    tags.has("anti_rotation") ||
    ["plank", "dead bug", "dead-bug", "bird dog", "bird-dog", "pallof", "woodchop", "hollow", "brace"].some(
      (token) => text.includes(token)
    );
  const mainPatternLeak = [
    "push",
    "verticalpush",
    "horizontalpush",
    "pull",
    "horizontalpull",
    "verticalpull",
    "squat",
    "hinge",
  ].some((pattern) => patterns.has(pattern));
  return coreOrBrace && !mainPatternLeak;
};

const isAccessoryLanePure = (exercise: Exercise, lane?: string) => {
  const text = descriptor(exercise);
  const tags = new Set((exercise.tags ?? []).map((tag) => tag.toLowerCase()));
  if (lane === "core") return isCoreAccessory(exercise);
  if (lane === "push") {
    return (
      hasPattern(exercise, "push") ||
      hasPattern(exercise, "verticalpush") ||
      tags.has("triceps") ||
      text.includes("triceps") ||
      text.includes("press")
    );
  }
  if (lane === "pull") {
    return (
      hasPattern(exercise, "pull") ||
      tags.has("biceps") ||
      tags.has("scap") ||
      tags.has("upper-back") ||
      tags.has("upper_back") ||
      text.includes("curl") ||
      text.includes("row") ||
      text.includes("pulldown") ||
      text.includes("pull")
    );
  }
  if (lane === "lower") {
    return (
      hasPattern(exercise, "squat") ||
      hasPattern(exercise, "hinge") ||
      hasPattern(exercise, "single-leg") ||
      tags.has("legs") ||
      tags.has("glutes") ||
      tags.has("quads") ||
      tags.has("hamstrings") ||
      tags.has("calves") ||
      text.includes("calf")
    );
  }
  return true;
};

const isForbiddenHingeSlotExercise = (exercise: Exercise) =>
  [
    "goblet-squat",
    "split-squat",
    "heels-elevated-squat",
    "dumbbell-step-up-loaded",
    "farmers-carry",
    "suitcase-carry",
    "suitcase-hold-march",
    "band-suitcase-march",
    "pallof-press",
    "band-woodchop",
    "hollow-body-hold",
    "plank",
    "side-plank",
    "dead-bug",
    "marching-brace-hold",
  ].includes(exercise.id) || isCarryOrBraceDrill(exercise);

const hasTrueHingeAnchor = (exercise: Exercise) =>
  hasPattern(exercise, "hinge") &&
  !/hamstring curl/i.test(exercise.name) &&
  !["bodyweight-good-morning", "back-extension", "back-extension-hold"].includes(exercise.id) &&
  !isForbiddenHingeSlotExercise(exercise);

const hasTrueSquatAnchor = (exercise: Exercise) =>
  hasPattern(exercise, "squat") && !isCarryOrBraceDrill(exercise);

const forbiddenVerticalPushIds = new Set([
  "pushup",
  "tempo-pushup",
  "incline-pushup",
  "close-grip-pushup",
  "band-chest-press",
  "dumbbell-bench-press",
  "dumbbell-floor-press",
  "machine-chest-press",
]);

const hasTruthfulVerticalPressAnchor = (exercise: Exercise) =>
  hasPattern(exercise, "verticalpush") &&
  !forbiddenVerticalPushIds.has(exercise.id) &&
  !descriptor(exercise).includes("fly") &&
  !descriptor(exercise).includes("lateral raise") &&
  !isCarryOrBraceDrill(exercise);

const noEquipmentPrimePullIds = new Set([
  "supine-elbow-drive-row",
  "prone-elbow-row",
  "back-widow",
]);

const noEquipmentLowPriorityPullIds = new Set([
  "prone-swimmer",
  "supine-lat-pulldown-isometric",
  "prone-lat-sweep",
  "reverse-snow-angel",
]);

const isHigherFrequencyLowerDay = (title: string) => {
  const normalized = title.toLowerCase();
  return normalized.includes("lower") || normalized.includes("posterior chain");
};

const expectTruthfulLowerMainSlots = (
  day: ReturnType<typeof generateWeeklyProgram>["week"][number]
) => {
  day.routine
    .filter((item) => item.section === "main")
    .forEach((item) => {
      const exercise = exerciseById(item.exerciseId);
      expect(exercise, `${day.title}: ${item.exerciseId}`).toBeTruthy();
      if (!exercise) return;
      const slotKind = item.selectionDebug?.slotKind;
      const slotLane = item.selectionDebug?.slotLane;
      if (slotKind === "mainHinge" || slotLane === "hinge") {
        expect(isForbiddenHingeSlotExercise(exercise), `${day.title}: ${exercise.id}`).toBe(false);
        expect(hasPattern(exercise, "hinge"), `${day.title}: ${exercise.id}`).toBe(true);
      }
      if (slotKind === "mainSquat" || slotLane === "squat") {
        expect(hasTrueSquatAnchor(exercise), `${day.title}: ${exercise.id}`).toBe(true);
      }
    });
};

const expectTruthfulVerticalPushSlots = (
  day: ReturnType<typeof generateWeeklyProgram>["week"][number]
) => {
  day.routine
    .filter(
      (item) =>
        item.section === "main" &&
        (item.selectionDebug?.slotKind === "mainVerticalPush" ||
          item.selectionDebug?.slotLane === "verticalPush")
    )
    .forEach((item) => {
      const exercise = exerciseById(item.exerciseId);
      expect(exercise, `${day.title}: ${item.exerciseId}`).toBeTruthy();
      if (!exercise) return;
      expect(forbiddenVerticalPushIds.has(exercise.id), `${day.title}: ${exercise.id}`).toBe(
        false
      );
      expect(hasTruthfulVerticalPressAnchor(exercise), `${day.title}: ${exercise.id}`).toBe(true);
    });
};

const expectTruthfulAccessorySlots = (
  day: ReturnType<typeof generateWeeklyProgram>["week"][number]
) => {
  day.routine
    .filter((item) => item.section === "accessory")
    .forEach((item) => {
      const exercise = exerciseById(item.exerciseId);
      expect(exercise, `${day.title}: ${item.exerciseId}`).toBeTruthy();
      if (!exercise) return;
      expect(item.selectionDebug?.slotKind, `${day.title}: ${exercise.id}`).not.toBe(
        "accessoryFinal"
      );
      expect(
        isAccessoryLanePure(exercise, item.selectionDebug?.slotLane),
        `${day.title}: ${exercise.id} in ${item.selectionDebug?.slotLane ?? "unknown"}`
      ).toBe(true);
    });
};

const expectEquipmentEligibleDay = (
  day: ReturnType<typeof generateWeeklyProgram>["week"][number],
  available: ReturnType<typeof normalizeEquipmentSelection>["available"]
) => {
  day.routine.forEach((item) => {
    const exercise = exerciseById(item.exerciseId);
    expect(exercise, `${day.title}: ${item.exerciseId}`).toBeTruthy();
    if (!exercise) return;
    expect(
      isExerciseEligible(exercise, available),
      `${day.title}: ${exercise.id} requires ${exercise.equipment.join(", ")}`
    ).toBe(true);
  });
};

const expectNoEquipmentPullQuality = (
  program: ReturnType<typeof generateWeeklyProgram>
) => {
  const pullDay = program.week.find((day) => day.title === "Upper Pull + Thoracic Posture");
  expect(pullDay).toBeTruthy();
  const pullIds = (pullDay?.routine ?? [])
    .filter(
      (item) =>
        item.section === "main" &&
        (item.selectionDebug?.slotLane === "pull" ||
          item.selectionDebug?.slotKind?.startsWith("mainPull"))
    )
    .map((item) => item.exerciseId);
  expect(pullIds.length).toBeGreaterThan(0);
  expect(noEquipmentPrimePullIds.has(pullIds[0]), pullIds.join(", ")).toBe(true);
  expect(new Set(pullIds).size, pullIds.join(", ")).toBe(pullIds.length);

  const firstPrimeIndex = pullIds.findIndex((id) => noEquipmentPrimePullIds.has(id));
  const firstLowPriorityIndex = pullIds.findIndex((id) =>
    noEquipmentLowPriorityPullIds.has(id)
  );
  expect(firstPrimeIndex).toBeGreaterThanOrEqual(0);
  if (firstLowPriorityIndex >= 0) {
    expect(firstPrimeIndex).toBeLessThan(firstLowPriorityIndex);
  }
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
              const available = normalizeEquipmentSelection(equipment).available;

              expect(program.week).toHaveLength(daysPerWeek);
              program.week.forEach((day) => {
                expect(hasSections(day)).toBe(true);
                expectEquipmentEligibleDay(day, available);

                const ids = day.routine.map((item) => item.exerciseId);
                expect(new Set(ids).size).toBe(ids.length);

                const mains = day.routine.filter((item) => item.section === "main");
                const expectedMain = expectedMainCount(
                  experience,
                  goal,
                  painAreas,
                  daysPerWeek,
                  day.title,
                  equipment
                );
                if (Array.isArray(expectedMain)) {
                  expect(mains.length).toBeGreaterThanOrEqual(expectedMain[0]);
                  expect(mains.length).toBeLessThanOrEqual(expectedMain[1]);
                } else {
                  expect(mains.length).toBe(expectedMain);
                }
                mains.forEach((item) => {
                  expect(exerciseById(item.exerciseId)?.category).toBe("main");
                });
                if (daysPerWeek >= 4 && isHigherFrequencyLowerDay(day.title)) {
                  expectTruthfulLowerMainSlots(day);
                }
                expectTruthfulVerticalPushSlots(day);
                expectTruthfulAccessorySlots(day);

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

  test("no-equipment upper pull prefers row-style mains before low-output posture drills", () => {
    const input: QuestionnaireData = {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["none"],
      daysPerWeek: 4,
    };
    const program = generateWeeklyProgram(input, "matrix-no-equipment-pull-quality", {
      phaseIndex: 1,
      seed: "matrix-no-equipment-pull-quality",
    });

    expectNoEquipmentPullQuality(program);
  });

  test("phase rep intent stays visible for hypertrophy and constrained strength anchors", () => {
    const hypertrophy = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Advanced",
        equipment: ["gym"],
        daysPerWeek: 5,
      },
      "matrix-hypertrophy-reps",
      {
        phaseIndex: 2,
        seed: "matrix-hypertrophy-reps",
      }
    );
    hypertrophy.week
      .flatMap((day) => day.routine.filter((item) => item.section === "main"))
      .forEach((item) => {
        expect(item.reps).toBe("8-12");
      });

    const constrainedStrength = generateWeeklyProgram(
      {
        goals: "Reduce pain",
        painAreas: ["Lower back", "Shoulders"],
        experience: "Beginner",
        equipment: ["bands"],
        daysPerWeek: 5,
      },
      "matrix-constrained-strength-reps",
      {
        phaseIndex: 3,
        seed: "matrix-constrained-strength-reps",
      }
    );
    constrainedStrength.week
      .flatMap((day) => day.routine.filter((item) => item.section === "main"))
      .forEach((item) => {
        expect(item.reps).toBe("4-8");
      });
  });

  test("4-day athletic dumbbell lower slots and phase 2 reps stay truthful", () => {
    const program = generateWeeklyProgram(
      {
        goals: "Athletic performance",
        painAreas: [],
        experience: "Intermediate",
        equipment: ["dumbbells"],
        daysPerWeek: 4,
      },
      "matrix-4day-athletic-db-lower-truth",
      {
        phaseIndex: 2,
        seed: "matrix-4day-athletic-db-lower-truth",
      }
    );

    const lowerDays = program.week.filter((day) => isHigherFrequencyLowerDay(day.title));
    expect(lowerDays).toHaveLength(2);
    lowerDays.forEach(expectTruthfulLowerMainSlots);

    const hingeDay = lowerDays.find((day) => day.title.toLowerCase().includes("hinge"));
    expect(hingeDay).toBeTruthy();
    const hingeMains = (hingeDay?.routine ?? [])
      .filter((item) => item.section === "main")
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
    expect(hingeMains.some(hasTrueHingeAnchor)).toBe(true);

    program.week
      .flatMap((day) =>
        day.routine.filter((item) => item.section === "main" && item.loadType === "weighted")
      )
      .forEach((item) => {
        expect(item.reps).toBe("8-12");
      });
  });
});
