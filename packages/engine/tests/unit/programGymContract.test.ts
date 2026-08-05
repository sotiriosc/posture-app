import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import {
  buildProgramIntentProfile,
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
  getPainSeverity,
} from "@/lib/program";
import {
  classifyGymMovementRoleTruth,
  GYM_THREE_DAY_TITLES,
  resolveGymDayIdentity,
  validateGymProgramContract,
} from "@/lib/program/gymProgramContract";

const baseGymQuestionnaire: QuestionnaireData = {
  goals: "General fitness",
  painAreas: [],
  experience: "Beginner",
  equipment: ["gym"],
  daysPerWeek: 3,
};

const generateGym = (
  overrides: Partial<QuestionnaireData>,
  id: string,
  phaseIndex: 1 | 2 | 3 = 1
) => {
  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();
  return generateWeeklyProgram(
    { ...baseGymQuestionnaire, ...overrides },
    id,
    { phaseIndex, seed: `${id}-seed` }
  );
};

const legsMainIds = (program: ReturnType<typeof generateWeeklyProgram>) => {
  const day = program.week.find((entry) => entry.title === "Legs + Abs");
  expect(day).toBeTruthy();
  return (day?.routine ?? [])
    .filter((item) => item.section === "main")
    .map((item) => item.exerciseId);
};

const hingePrimaryId = (program: ReturnType<typeof generateWeeklyProgram>) => {
  const day = program.week.find((entry) => entry.title === "Legs + Abs");
  const hinge = day?.routine.find(
    (item) =>
      item.section === "main" &&
      (item.selectionDebug?.slotKind === "mainHingePrimary" ||
        item.selectionDebug?.slotLane === "hinge")
  );
  return hinge?.exerciseId ?? null;
};

describe("gym program contract", () => {
  test("three-day gym titles resolve to established identities including Legs + Abs", () => {
    expect(GYM_THREE_DAY_TITLES).toEqual([
      "Back + Chest",
      "Shoulders + Arms",
      "Legs + Abs",
    ]);
    expect(resolveGymDayIdentity("Back + Chest")).toBe("back_chest");
    expect(resolveGymDayIdentity("Shoulders + Arms")).toBe("shoulders_arms");
    expect(resolveGymDayIdentity("Legs + Abs")).toBe("legs_abs");
  });

  test("pain-free beginner gym week has zero contract hard failures", () => {
    const program = generateGym({}, "gym-contract-pain-free-beginner");
    const failures = validateGymProgramContract({
      program,
      persona: "gym-contract-pain-free-beginner",
      equipment: ["gym"],
      experience: "Beginner",
      painAreas: [],
    });
    expect(failures).toEqual([]);
    expect(hingePrimaryId(program)).toBe("db-rdl");
  });

  test("shoulder/upper-back pain does not treat upper_back as low-back for hinge policy", () => {
    const questionnaire: QuestionnaireData = {
      ...baseGymQuestionnaire,
      goals: "Reduce pain",
      painAreas: ["Shoulders", "Upper back"],
      experience: "Beginner",
    };
    expect(getPainSeverity(questionnaire)).toBe("high");

    const upperIntent = buildProgramIntentProfile({
      questionnaire,
      painSeverity: "high",
      phaseStage: "activation",
      experienceLevel: "beginner",
      capabilityMode: "hasLoad",
    });
    expect(upperIntent.avoidPatterns).not.toContain("heavy_hinge");
    expect(upperIntent.avoidPatterns).toContain("vertical_push_load");

    const lowBackIntent = buildProgramIntentProfile({
      questionnaire: {
        ...questionnaire,
        painAreas: ["Lower back", "Hips"],
      },
      painSeverity: "high",
      phaseStage: "activation",
      experienceLevel: "beginner",
      capabilityMode: "hasLoad",
    });
    expect(lowBackIntent.avoidPatterns).toContain("heavy_hinge");
  });

  test("shoulder/upper-back gym activation keeps a true hinge, not curl-only", () => {
    const program = generateGym(
      {
        goals: "Reduce pain",
        painAreas: ["Shoulders", "Upper back"],
        experience: "Beginner",
      },
      "gym-contract-shoulder-upper-back"
    );
    const hingeId = hingePrimaryId(program);
    expect(hingeId).toBeTruthy();
    expect(hingeId).not.toBe("machine-seated-hamstring-curl");

    const hingeExercise = exerciseById(hingeId!);
    expect(hingeExercise).toBeTruthy();
    expect(classifyGymMovementRoleTruth(hingeExercise!, "hinge")).toBe("true");

    const failures = validateGymProgramContract({
      program,
      persona: "gym-contract-shoulder-upper-back",
      equipment: ["gym"],
      experience: "Beginner",
      painAreas: ["Shoulders", "Upper back"],
    });
    expect(
      failures.filter((failure) => failure.reasonCode === "GYM_HINGE_SATISFIED_BY_CURL_ONLY")
    ).toEqual([]);
    expect(failures.filter((failure) => failure.reasonCode.startsWith("GYM_"))).toEqual([]);
  });

  test("true low-back pain may use pain-aware hinge alternatives without curl-only collapse", () => {
    for (const experience of ["Beginner", "Intermediate", "Advanced"] as const) {
      const program = generateGym(
        {
          goals: "Reduce pain",
          painAreas: ["Lower back", "Hips"],
          experience,
        },
        `gym-contract-low-back-${experience.toLowerCase()}`
      );
      const hingeId = hingePrimaryId(program);
      expect(hingeId).toBeTruthy();
      expect(hingeId).not.toBe("machine-seated-hamstring-curl");
      expect(hingeId).not.toBe("dumbbell-step-up-loaded");

      const failures = validateGymProgramContract({
        program,
        persona: `gym-contract-low-back-${experience.toLowerCase()}`,
        equipment: ["gym"],
        experience,
        painAreas: ["Lower back", "Hips"],
      });
      expect(
        failures.some((failure) => failure.reasonCode === "GYM_HINGE_SATISFIED_BY_CURL_ONLY")
      ).toBe(false);
      expect(
        failures.some((failure) => failure.reasonCode === "GYM_REQUIRED_ROLE_WRONG_TRUTH")
      ).toBe(false);
    }
  });

  test("Back + Chest and Shoulders + Arms keep expected day identities", () => {
    const program = generateGym(
      { experience: "Intermediate" },
      "gym-contract-day-identities"
    );
    expect(program.week.map((day) => day.title)).toEqual([
      "Back + Chest",
      "Shoulders + Arms",
      "Legs + Abs",
    ]);
    const failures = validateGymProgramContract({
      program,
      persona: "gym-contract-day-identities",
      equipment: ["gym"],
      experience: "Intermediate",
      painAreas: [],
    });
    expect(failures).toEqual([]);
  });

  test("hamstring curl alone is not a true hinge role", () => {
    const curl = exerciseById("machine-seated-hamstring-curl");
    expect(curl).toBeTruthy();
    expect(classifyGymMovementRoleTruth(curl!, "hinge")).toBe("supportedVariant");
    expect(classifyGymMovementRoleTruth(exerciseById("db-rdl")!, "hinge")).toBe("true");
  });

  test("legs mains remain filled for pain-free and shoulder-pain gym beginners", () => {
    const painFree = generateGym({}, "gym-contract-legs-count-pain-free");
    const shoulder = generateGym(
      {
        goals: "Reduce pain",
        painAreas: ["Shoulders", "Upper back"],
      },
      "gym-contract-legs-count-shoulder"
    );
    expect(legsMainIds(painFree).length).toBeGreaterThanOrEqual(3);
    expect(legsMainIds(shoulder).length).toBeGreaterThanOrEqual(3);
  });
});
