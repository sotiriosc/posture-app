import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, exercises, type Exercise } from "@/lib/exercises";
import { generateWeeklyProgram } from "@/lib/program";
import { normalizeEquipmentSelection } from "@/lib/equipment";

const toNormalizedExperience = (experience: QuestionnaireData["experience"]) =>
  experience === "Advanced"
    ? "advanced"
    : experience === "Intermediate"
    ? "intermediate"
    : "beginner";

const experienceRank = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
} as const;

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const hasHorizontalPullSignature = (exercise: Exercise) => {
  const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeToken(pattern)));
  if (!patterns.has("pull")) return false;
  if (patterns.has("horizontalpull")) return true;
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return descriptor.includes("row");
};

const hasVerticalPullSignature = (exercise: Exercise) => {
  const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeToken(pattern)));
  if (patterns.has("verticalpull")) return true;
  if (!patterns.has("pull")) return false;
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    descriptor.includes("pulldown") ||
    descriptor.includes("pull-up") ||
    descriptor.includes("pullup") ||
    descriptor.includes("chin-up") ||
    descriptor.includes("chinup")
  );
};

const resolveMainCategory = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeToken(pattern)));
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeToken(tag)));
  if (
    patterns.has("lateralraise") ||
    descriptor.includes("lateral raise") ||
    descriptor.includes("lateral-raise") ||
    tags.has("lateraldelt") ||
    tags.has("lateral_delt")
  ) {
    return "lateral";
  }
  if (
    patterns.has("verticalpush") ||
    descriptor.includes("shoulder press") ||
    descriptor.includes("overhead press") ||
    descriptor.includes("pike push-up") ||
    descriptor.includes("pike-pushup")
  ) {
    return "ohp";
  }
  if (patterns.has("curl") || tags.has("biceps") || descriptor.includes("biceps")) return "biceps";
  if (
    patterns.has("extension") ||
    tags.has("triceps") ||
    descriptor.includes("triceps") ||
    descriptor.includes("pressdown")
  ) {
    return "triceps";
  }
  if (
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("reverse pec deck") ||
    descriptor.includes("reverse-pec-deck")
  ) {
    return "rearDeltMain";
  }
  return "other";
};

const isShouldersArmsPullMain = (exercise: Exercise) =>
  hasHorizontalPullSignature(exercise) ||
  exercise.movementPattern.some((pattern) => normalizeToken(pattern) === "pull");

const isShouldersArmsVerticalPushMain = (exercise: Exercise) =>
  resolveMainCategory(exercise) === "ohp";

const isChestDominantPushMain = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeToken(pattern)));
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeToken(tag)));
  const muscles = new Set((exercise.muscleGroups ?? []).map((muscle) => normalizeToken(muscle)));
  return (
    patterns.has("push") &&
    (descriptor.includes("chest") ||
      descriptor.includes("bench") ||
      tags.has("chest") ||
      muscles.has("chest"))
  );
};

const resolveArmStimulusKey = (exercise: Exercise) => {
  const family = normalizeToken(exercise.familyKey ?? exercise.id);
  const variant = normalizeToken(exercise.variantKey ?? "standard");
  const category = resolveMainCategory(exercise);
  return `${category}::${family}::${variant}::${exercise.loadType}`;
};

const isRearDeltAccessory = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeToken(tag)));
  return (
    descriptor.includes("rear-delt") ||
    descriptor.includes("rear delt") ||
    descriptor.includes("reverse pec deck") ||
    descriptor.includes("reverse-pec-deck") ||
    tags.has("reardelt") ||
    tags.has("rear_delt")
  );
};

const isScapExternalAccessory = (exercise: Exercise) => {
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeToken(pattern)));
  const tags = new Set((exercise.tags ?? []).map((tag) => normalizeToken(tag)));
  return (
    descriptor.includes("face pull") ||
    descriptor.includes("face-pull") ||
    descriptor.includes("external rotation") ||
    descriptor.includes("external-rotation") ||
    descriptor.includes("pull-apart") ||
    descriptor.includes("pull apart") ||
    patterns.has("scapular") ||
    patterns.has("externalrotation") ||
    tags.has("scapular") ||
    tags.has("external_rotation") ||
    tags.has("externalrotation")
  );
};

const accessoryFamilyKey = (exercise: Exercise) => {
  if (exercise.familyKey?.trim()) return normalizeToken(exercise.familyKey);
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  if (descriptor.includes("face pull") || descriptor.includes("face-pull")) return "face_pull";
  if (descriptor.includes("rear delt") || descriptor.includes("rear-delt")) return "rear_delt";
  if (descriptor.includes("external rotation") || descriptor.includes("external-rotation")) {
    return "external_rotation";
  }
  if (descriptor.includes("pull-apart") || descriptor.includes("pull apart")) return "pull_apart";
  return normalizeToken(exercise.id);
};

const getShouldersArmsDay = (program: ReturnType<typeof generateWeeklyProgram>) => {
  const day = program.week.find((entry) => entry.title === "Shoulders + Arms");
  if (!day) throw new Error("Shoulders + Arms day not found");
  return day;
};

const getMainExercises = (program: ReturnType<typeof generateWeeklyProgram>) =>
  getShouldersArmsDay(program).routine
    .filter((item) => item.section === "main")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));

const getAccessoryExercises = (program: ReturnType<typeof generateWeeklyProgram>) =>
  getShouldersArmsDay(program).routine
    .filter((item) => item.section === "accessory")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));

const buildQuestionnaire = (
  overrides: Partial<QuestionnaireData> = {}
): QuestionnaireData => ({
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["gym"],
  daysPerWeek: 3,
  ...overrides,
});

const eligibleRoleAlternatives = (params: {
  role: "ohp" | "lateral" | "rearDeltMain";
  questionnaire: QuestionnaireData;
}) => {
  const { role, questionnaire } = params;
  const experienceLevel = toNormalizedExperience(questionnaire.experience);
  const available = normalizeEquipmentSelection(questionnaire.equipment).available;
  return exercises.filter((exercise) => {
    if (exercise.category !== "main") return false;
    const category = resolveMainCategory(exercise);
    if (category !== role) return false;
    if (!exercise.equipment.some((equip) => available.has(equip))) return false;
    if (!exercise.equipment.length) return false;
    if (exercise.experienceMin) {
      const required = experienceRank[toNormalizedExperience(exercise.experienceMin)];
      const current = experienceRank[experienceLevel];
      if (current < required) return false;
    }
    return true;
  });
};

describe("Shoulders + Arms Day 2 (3-day split) contract", () => {
  test("hard boundary blocks lower/back/chest leakage from routine mains", () => {
    const questionnaire = buildQuestionnaire({
      goals: "General fitness",
      experience: "Advanced",
      equipment: ["gym"],
    });
    const program = generateWeeklyProgram(questionnaire, "sa-boundary-p2", {
      phaseIndex: 2,
      seed: "sa-boundary-p2",
    });
    const mains = getMainExercises(program);

    mains.forEach((exercise) => {
      const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
      const patterns = new Set(exercise.movementPattern.map((pattern) => normalizeToken(pattern)));
      expect(patterns.has("squat")).toBe(false);
      expect(patterns.has("hinge")).toBe(false);
      expect(hasVerticalPullSignature(exercise)).toBe(false);
      if (hasHorizontalPullSignature(exercise)) {
        const category = resolveMainCategory(exercise);
        expect(category).toBe("rearDeltMain");
      }
      expect(
        descriptor.includes("bench press") ||
          descriptor.includes("chest press") ||
          (descriptor.includes("pec deck") && !descriptor.includes("reverse")) ||
          descriptor.includes("chest fly")
      ).toBe(false);
    });
  });

  test("anchor template and extra-main counts are enforced for beginner/intermediate/advanced", () => {
    const beginner = generateWeeklyProgram(
      buildQuestionnaire({ experience: "Beginner", equipment: ["gym"] }),
      "sa-count-beginner",
      { phaseIndex: 1, seed: "sa-count-beginner" }
    );
    const intermediate = generateWeeklyProgram(
      buildQuestionnaire({ experience: "Intermediate", equipment: ["gym"] }),
      "sa-count-intermediate",
      { phaseIndex: 1, seed: "sa-count-intermediate" }
    );
    const advanced = generateWeeklyProgram(
      buildQuestionnaire({ experience: "Advanced", equipment: ["gym"] }),
      "sa-count-advanced",
      { phaseIndex: 1, seed: "sa-count-advanced" }
    );

    const beginnerMain = getMainExercises(beginner);
    const intermediateMain = getMainExercises(intermediate);
    const advancedMain = getMainExercises(advanced);

    expect(beginnerMain.length).toBe(3);
    expect(intermediateMain.length).toBe(4);
    expect(advancedMain.length).toBe(4);

    const assertCoreConstraints = (mainExercises: Exercise[]) => {
      expect(mainExercises.some((exercise) => isShouldersArmsVerticalPushMain(exercise))).toBe(
        true
      );
      expect(
        mainExercises.some((exercise) => resolveMainCategory(exercise) === "lateral")
      ).toBe(true);
      expect(mainExercises.some((exercise) => isShouldersArmsPullMain(exercise))).toBe(true);
      expect(mainExercises.some((exercise) => isChestDominantPushMain(exercise))).toBe(false);
      expect(
        mainExercises.some((exercise) => {
          const category = resolveMainCategory(exercise);
          return category === "biceps" || category === "triceps";
        })
      ).toBe(false);
    };
    assertCoreConstraints(beginnerMain);
    assertCoreConstraints(intermediateMain);
    assertCoreConstraints(advancedMain);
  });

  test("category caps and uniqueness hold on Day 2 mains", () => {
    const questionnaire = buildQuestionnaire({
      goals: "Athletic performance",
      experience: "Advanced",
      equipment: ["gym"],
    });
    const program = generateWeeklyProgram(questionnaire, "sa-caps-p3", {
      phaseIndex: 3,
      seed: "sa-caps-p3",
    });
    const mains = getMainExercises(program);
    const mainIds = mains.map((exercise) => exercise.id);
    expect(new Set(mainIds).size).toBe(mainIds.length);

    const categories = mains.map((exercise) => resolveMainCategory(exercise));
    expect(categories.filter((category) => category === "ohp").length).toBeLessThanOrEqual(1);
    expect(categories.filter((category) => category === "lateral").length).toBeLessThanOrEqual(1);
    expect(categories.filter((category) => category === "biceps").length).toBeLessThanOrEqual(2);
    expect(categories.filter((category) => category === "triceps").length).toBeLessThanOrEqual(2);
    expect(mains.some((exercise) => isShouldersArmsPullMain(exercise))).toBe(true);
    expect(mains.some((exercise) => isShouldersArmsVerticalPushMain(exercise))).toBe(true);

    mains.forEach((exercise) => {
      expect(hasVerticalPullSignature(exercise)).toBe(false);
    });
  });

  test("anchors are globally non-static across phases when alternatives exist (gym and bands)", () => {
    const scenarios: Array<{ label: string; questionnaire: QuestionnaireData }> = [
      {
        label: "gym",
        questionnaire: buildQuestionnaire({
          goals: "Improve posture",
          experience: "Beginner",
          equipment: ["gym"],
        }),
      },
      {
        label: "bands",
        questionnaire: buildQuestionnaire({
          goals: "Improve posture",
          experience: "Beginner",
          equipment: ["bands"],
        }),
      },
    ];

    scenarios.forEach((scenario) => {
      const p1 = generateWeeklyProgram(scenario.questionnaire, `sa-${scenario.label}-p1`, {
        phaseIndex: 1,
        seed: `sa-${scenario.label}-phase-seed`,
      });
      const p2 = generateWeeklyProgram(scenario.questionnaire, `sa-${scenario.label}-p2`, {
        phaseIndex: 2,
        seed: `sa-${scenario.label}-phase-seed`,
      });
      const p3 = generateWeeklyProgram(scenario.questionnaire, `sa-${scenario.label}-p3`, {
        phaseIndex: 3,
        seed: `sa-${scenario.label}-phase-seed`,
      });

      const phases = [p1, p2, p3].map((program) => getMainExercises(program));
      const byRole = (role: "ohp" | "lateral") =>
        phases.map((mains) => mains.find((exercise) => resolveMainCategory(exercise) === role)?.id);

      (["ohp", "lateral"] as const).forEach((role) => {
        const alternatives = eligibleRoleAlternatives({
          role,
          questionnaire: scenario.questionnaire,
        });
        const selected = byRole(role).filter((id): id is string => Boolean(id));
        if (alternatives.length > 1 && selected.length >= 2) {
          expect(
            new Set(selected).size,
            `scenario=${scenario.label}, role=${role}, selected=${JSON.stringify(selected)}, alternatives=${alternatives
              .map((exercise) => exercise.id)
              .join(",")}`
          ).toBeGreaterThan(1);
        }
      });
    });
  });

  test("arm accessory structure follows triceps/biceps layout and advanced variants stay unique", () => {
    const questionnaire = buildQuestionnaire({
      goals: "Athletic performance",
      experience: "Advanced",
      equipment: ["gym"],
    });
    const program = generateWeeklyProgram(questionnaire, "sa-accessory-p2", {
      phaseIndex: 3,
      seed: "sa-accessory-p2",
    });
    const accessories = getAccessoryExercises(program);
    expect(accessories.length).toBe(4);
    const accessoryIds = accessories.map((exercise) => exercise.id);
    expect(resolveMainCategory(accessories[0]), `ids=${JSON.stringify(accessoryIds)}`).toBe(
      "triceps"
    );
    expect(resolveMainCategory(accessories[1]), `ids=${JSON.stringify(accessoryIds)}`).toBe(
      "biceps"
    );
    expect(resolveMainCategory(accessories[2]), `ids=${JSON.stringify(accessoryIds)}`).toBe(
      "triceps"
    );
    expect(resolveMainCategory(accessories[3]), `ids=${JSON.stringify(accessoryIds)}`).toBe(
      "biceps"
    );
    const tricepsStimulus = accessories
      .filter((exercise) => resolveMainCategory(exercise) === "triceps")
      .map((exercise) => resolveArmStimulusKey(exercise));
    const bicepsStimulus = accessories
      .filter((exercise) => resolveMainCategory(exercise) === "biceps")
      .map((exercise) => resolveArmStimulusKey(exercise));
    expect(new Set(tricepsStimulus).size).toBe(tricepsStimulus.length);
    expect(new Set(bicepsStimulus).size).toBe(bicepsStimulus.length);
  });

  test("beginner and intermediate accessory counts remain 2 with triceps then biceps", () => {
    const beginner = generateWeeklyProgram(
      buildQuestionnaire({
        goals: "General fitness",
        experience: "Beginner",
        equipment: ["gym"],
      }),
      "sa-accessory-beginner",
      { phaseIndex: 1, seed: "sa-accessory-beginner" }
    );
    const intermediate = generateWeeklyProgram(
      buildQuestionnaire({
        goals: "General fitness",
        experience: "Intermediate",
        equipment: ["gym"],
      }),
      "sa-accessory-intermediate",
      { phaseIndex: 2, seed: "sa-accessory-intermediate" }
    );
    const beginnerAccessories = getAccessoryExercises(beginner);
    const intermediateAccessories = getAccessoryExercises(intermediate);
    expect(beginnerAccessories.length).toBe(2);
    expect(intermediateAccessories.length).toBe(2);
    expect(resolveMainCategory(beginnerAccessories[0])).toBe("triceps");
    expect(resolveMainCategory(beginnerAccessories[1])).toBe("biceps");
    expect(resolveMainCategory(intermediateAccessories[0])).toBe("triceps");
    expect(resolveMainCategory(intermediateAccessories[1])).toBe("biceps");
  });

  test("same seed remains deterministic for Shoulders + Arms day", () => {
    const questionnaire = buildQuestionnaire({
      goals: "Improve posture",
      experience: "Advanced",
      equipment: ["bands", "dumbbells"],
    });
    const seed = "sa-deterministic";
    const runA = generateWeeklyProgram(questionnaire, "sa-deterministic-a", {
      phaseIndex: 3,
      seed,
    });
    const runB = generateWeeklyProgram(questionnaire, "sa-deterministic-b", {
      phaseIndex: 3,
      seed,
    });
    const dayA = getShouldersArmsDay(runA).routine
      .filter((item) => item.section === "main" || item.section === "accessory")
      .map((item) => `${item.section}:${item.exerciseId}`);
    const dayB = getShouldersArmsDay(runB).routine
      .filter((item) => item.section === "main" || item.section === "accessory")
      .map((item) => `${item.section}:${item.exerciseId}`);
    expect(dayA).toEqual(dayB);
  });
});
