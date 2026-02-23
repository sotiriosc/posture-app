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
  role: "ohp" | "lateral" | "biceps" | "triceps";
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
          descriptor.includes("pec deck") ||
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

    expect(beginnerMain.length).toBe(4);
    expect(intermediateMain.length).toBe(5);
    expect(advancedMain.length).toBe(6);

    const assertHasAnchors = (mainExercises: Exercise[]) => {
      const categories = mainExercises.map((exercise) => resolveMainCategory(exercise));
      expect(
        categories.filter((category) => category === "ohp").length,
        `categories=${JSON.stringify(categories)}`
      ).toBe(1);
      expect(
        categories.filter((category) => category === "lateral").length,
        `categories=${JSON.stringify(categories)}`
      ).toBe(1);
      expect(categories.filter((category) => category === "biceps").length).toBeGreaterThanOrEqual(
        1
      );
      expect(categories.filter((category) => category === "triceps").length).toBeGreaterThanOrEqual(
        1
      );
    };
    assertHasAnchors(beginnerMain);
    assertHasAnchors(intermediateMain);
    assertHasAnchors(advancedMain);
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
      const byRole = (role: "ohp" | "lateral" | "biceps" | "triceps") =>
        phases.map((mains) => mains.find((exercise) => resolveMainCategory(exercise) === role)?.id);

      (["ohp", "lateral", "biceps", "triceps"] as const).forEach((role) => {
        const alternatives = eligibleRoleAlternatives({
          role,
          questionnaire: scenario.questionnaire,
        });
        const selected = byRole(role).filter((id): id is string => Boolean(id));
        if (alternatives.length > 1) {
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

  test("accessory requirements and family de-dup hold for Day 2", () => {
    const questionnaire = buildQuestionnaire({
      goals: "Improve posture",
      experience: "Intermediate",
      equipment: ["gym"],
    });
    const program = generateWeeklyProgram(questionnaire, "sa-accessory-p2", {
      phaseIndex: 2,
      seed: "sa-accessory-p2",
    });
    const accessories = getAccessoryExercises(program);
    expect(accessories.length).toBeGreaterThanOrEqual(2);
    expect(accessories.some((exercise) => isRearDeltAccessory(exercise))).toBe(true);
    expect(accessories.some((exercise) => isScapExternalAccessory(exercise))).toBe(true);

    const families = accessories.map((exercise) => accessoryFamilyKey(exercise));
    expect(new Set(families).size).toBe(families.length);
  });
});
