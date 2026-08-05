import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import {
  BODYWEIGHT_THREE_DAY_TITLES,
  classifyBodyweightMovementRoleTruth,
  looksLikeGymShapedDayTitle,
  resolveBodyweightDayIdentity,
  validateBodyweightProgramContract,
} from "@/lib/program/bodyweightProgramContract";
import { resolvePrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";
import { validateDumbbellProgramContract } from "@/lib/program/dumbbellProgramContract";
import { validateBandProgramContract } from "@/lib/program/bandProgramContract";
import { validateGymProgramContract } from "@/lib/program/gymProgramContract";
import { exerciseById } from "@/lib/exercises";

const baseBodyweightQuestionnaire: QuestionnaireData = {
  goals: "General fitness",
  painAreas: [],
  experience: "Beginner",
  equipment: ["none"],
  daysPerWeek: 3,
};

const generateBodyweight = (
  overrides: Partial<QuestionnaireData>,
  id: string,
  phaseIndex: 1 | 2 | 3 = 1
) => {
  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();
  return generateWeeklyProgram(
    { ...baseBodyweightQuestionnaire, ...overrides },
    id,
    { phaseIndex, seed: `${id}-seed` }
  );
};

describe("bodyweight program contract", () => {
  test("primary bodyweight mode routes to Full Body A/B/C titles", () => {
    expect(resolvePrimaryProgramEquipmentMode(["none"])).toBe("bodyweight");
    expect(BODYWEIGHT_THREE_DAY_TITLES).toEqual([
      "Full Body A — Squat, Push and Trunk",
      "Full Body B — Hinge, Single-Leg and Shoulder",
      "Full Body C — Single-Leg, Push Variation and Back Intent",
    ]);
    const program = generateBodyweight({}, "bw-titles");
    expect(program.week.map((day) => day.title)).toEqual([
      ...BODYWEIGHT_THREE_DAY_TITLES,
    ]);
    program.week.forEach((day) => {
      expect(looksLikeGymShapedDayTitle(day.title)).toBe(false);
      expect(resolveBodyweightDayIdentity(day.title)).not.toBe("unknown");
    });
  });

  test("beginner/intermediate/advanced three-day weeks have zero structural hard failures", () => {
    for (const experience of ["Beginner", "Intermediate", "Advanced"] as const) {
      const program = generateBodyweight(
        { experience },
        `bw-contract-${experience.toLowerCase()}`
      );
      const failures = validateBodyweightProgramContract({
        program,
        persona: `bw-contract-${experience}`,
        equipment: ["none"],
        experience,
      });
      expect(failures, experience).toEqual([]);
    }
  });

  test("four- and five-day bodyweight weeks keep A/B/C foundation without gym titles", () => {
    const four = generateBodyweight(
      { experience: "Intermediate", daysPerWeek: 4 },
      "bw-4d",
      2
    );
    expect(four.week.map((day) => day.title)).toContain("Practice & Restore");
    expect(
      validateBodyweightProgramContract({
        program: four,
        persona: "bw-4d",
        equipment: ["none"],
        experience: "Intermediate",
      })
    ).toEqual([]);

    const five = generateBodyweight(
      { experience: "Advanced", daysPerWeek: 5 },
      "bw-5d",
      3
    );
    expect(five.week.map((day) => day.title)).toEqual(
      expect.arrayContaining([
        "Upper Pattern Practice",
        "Lower & Core Practice",
      ])
    );
    expect(
      validateBodyweightProgramContract({
        program: five,
        persona: "bw-5d",
        equipment: ["none"],
        experience: "Advanced",
      })
    ).toEqual([]);
  });

  test("floor-and-wall programs never schedule unconfirmed furniture or load tools", () => {
    const program = generateBodyweight({}, "bw-floor-wall");
    const work = program.week.flatMap((day) =>
      day.routine.filter(
        (item) => item.section === "main" || item.section === "accessory"
      )
    );
    work.forEach((item) => {
      const exercise = exerciseById(item.exerciseId);
      expect(exercise).toBeTruthy();
      const illegal = ["machines", "cables", "barbell", "kettlebell", "dumbbells", "bands"];
      expect(illegal.some((token) => exercise!.equipment.includes(token))).toBe(
        false
      );
      expect(item.exerciseId).not.toMatch(/countertop|bulgarian|step-up|suspension/i);
    });
  });

  test("without pull-up bar, upper-back work is surrogate not false true-pull", () => {
    const program = generateBodyweight({}, "bw-honest-pull");
    const dayC = program.week.find((day) =>
      day.title.includes("Back Intent")
    );
    expect(dayC).toBeTruthy();
    const upperBack = dayC!.routine.find(
      (item) => item.selectionDebug?.slotKind === "mainUpperBackControl"
    );
    expect(upperBack).toBeTruthy();
    const exercise = exerciseById(upperBack!.exerciseId)!;
    expect(
      classifyBodyweightMovementRoleTruth({
        exercise,
        slotKind: upperBack!.selectionDebug?.slotKind,
        family: "upper_back_control",
      })
    ).toBe("surrogate");
    expect(upperBack!.selectionDebug?.slotKind).not.toMatch(/PullVertical|PullHorizontal/);
  });

  test("confirmed pull-up bar may unlock true vertical pulling on Day C", () => {
    const program = generateBodyweight(
      { equipment: ["none", "pullup_bar"], experience: "Intermediate" },
      "bw-pullup"
    );
    const dayC = program.week.find((day) => day.title.includes("Back Intent"));
    const vertical = dayC?.routine.find(
      (item) => item.selectionDebug?.slotKind === "mainPullVertical"
    );
    expect(vertical).toBeTruthy();
    expect(vertical!.exerciseId).toMatch(/pullup|chinup|scap-pullup/i);
    expect(
      validateBodyweightProgramContract({
        program,
        persona: "bw-pullup",
        equipment: ["none", "pullup_bar"],
        experience: "Intermediate",
      })
    ).toEqual([]);
  });

  test("pain adaptations retain full-body identity without gym titles", () => {
    for (const painAreas of [
      ["Shoulders"],
      ["Lower back"],
      ["Knees"],
    ] as const) {
      const program = generateBodyweight(
        { goals: "Reduce pain", painAreas: [...painAreas] },
        `bw-pain-${painAreas[0].toLowerCase()}`
      );
      expect(program.week.map((day) => day.title)).toEqual([
        ...BODYWEIGHT_THREE_DAY_TITLES,
      ]);
      expect(
        validateBodyweightProgramContract({
          program,
          persona: `bw-pain-${painAreas[0]}`,
          equipment: ["none"],
          experience: "Beginner",
          painAreas: [...painAreas],
        })
      ).toEqual([]);
    }
  });

  test("deterministic repeat generation", () => {
    const a = generateBodyweight({}, "bw-det-a");
    const b = generateBodyweight({}, "bw-det-b");
    // Same seed path via generateBodyweight helper uses id-seed; compare identical call.
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const first = generateWeeklyProgram(
      baseBodyweightQuestionnaire,
      "bw-det",
      { phaseIndex: 1, seed: "bw-det-seed" }
    );
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const second = generateWeeklyProgram(
      baseBodyweightQuestionnaire,
      "bw-det",
      { phaseIndex: 1, seed: "bw-det-seed" }
    );
    expect(
      first.week.map((day) => day.routine.map((item) => item.exerciseId).join(","))
    ).toEqual(
      second.week.map((day) => day.routine.map((item) => item.exerciseId).join(","))
    );
    void a;
    void b;
  });

  test("gym, dumbbell, and band regressions remain clean for representative personas", () => {
    const gym = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        equipment: ["gym"],
        daysPerWeek: 3,
      },
      "bw-reg-gym",
      { phaseIndex: 1, seed: "bw-reg-gym" }
    );
    expect(gym.week.map((day) => day.title)).toEqual([
      "Back + Chest",
      "Shoulders + Arms",
      "Legs + Abs",
    ]);
    expect(resolvePrimaryProgramEquipmentMode(["gym"])).toBe("gym");
    void validateGymProgramContract;

    const dumbbell = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        equipment: ["dumbbells"],
        daysPerWeek: 3,
      },
      "bw-reg-db",
      { phaseIndex: 1, seed: "bw-reg-db" }
    );
    expect(
      validateDumbbellProgramContract({
        program: dumbbell,
        persona: "bw-reg-db",
        equipment: ["dumbbells"],
        experience: "Beginner",
      })
    ).toEqual([]);

    const bands = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        equipment: ["bands"],
        daysPerWeek: 3,
        bandSetup: "long_with_anchor",
      },
      "bw-reg-band",
      { phaseIndex: 1, seed: "bw-reg-band" }
    );
    expect(
      validateBandProgramContract({
        program: bands,
        persona: "bw-reg-band",
        equipment: ["bands"],
        bandSetup: "long_with_anchor",
        experience: "Beginner",
      })
    ).toEqual([]);
  });
});
