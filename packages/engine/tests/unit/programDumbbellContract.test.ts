import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import {
  DUMBBELL_THREE_DAY_TITLES,
  looksLikeGymShapedDayTitle,
  resolveDumbbellDayIdentity,
  validateDumbbellProgramContract,
} from "@/lib/program/dumbbellProgramContract";
import { resolvePrimaryProgramEquipmentMode } from "@/lib/program/equipmentMode";
import { validateGymProgramContract } from "@/lib/program/gymProgramContract";

const baseDumbbellQuestionnaire: QuestionnaireData = {
  goals: "General fitness",
  painAreas: [],
  experience: "Beginner",
  equipment: ["dumbbells"],
  daysPerWeek: 3,
};

const generateDumbbell = (
  overrides: Partial<QuestionnaireData>,
  id: string,
  phaseIndex: 1 | 2 | 3 = 1
) => {
  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();
  return generateWeeklyProgram(
    { ...baseDumbbellQuestionnaire, ...overrides },
    id,
    { phaseIndex, seed: `${id}-seed` }
  );
};

describe("dumbbell program contract", () => {
  test("primary dumbbell mode routes to Full Body A/B/C titles", () => {
    expect(resolvePrimaryProgramEquipmentMode(["dumbbells"])).toBe("dumbbells");
    expect(DUMBBELL_THREE_DAY_TITLES).toEqual([
      "Full Body A — Squat, Press and Row",
      "Full Body B — Hinge, Overhead and Unilateral",
      "Full Body C — Single-Leg, Press Variation and Lat Intent",
    ]);
    const program = generateDumbbell({}, "db-titles");
    expect(program.week.map((day) => day.title)).toEqual([...DUMBBELL_THREE_DAY_TITLES]);
    program.week.forEach((day) => {
      expect(looksLikeGymShapedDayTitle(day.title)).toBe(false);
      expect(resolveDumbbellDayIdentity(day.title)).not.toBe("unknown");
    });
  });

  test("beginner/intermediate/advanced three-day weeks have zero structural hard failures", () => {
    for (const experience of ["Beginner", "Intermediate", "Advanced"] as const) {
      const program = generateDumbbell(
        { experience },
        `db-contract-${experience.toLowerCase()}`
      );
      const failures = validateDumbbellProgramContract({
        program,
        persona: `db-contract-${experience}`,
        equipment: ["dumbbells"],
        experience,
      });
      expect(failures, experience).toEqual([]);
    }
  });

  test("four- and five-day dumbbell weeks keep A/B/C foundation without gym titles", () => {
    const four = generateDumbbell(
      { experience: "Intermediate", daysPerWeek: 4 },
      "db-4d",
      2
    );
    expect(four.week.map((day) => day.title)).toContain("Practice & Restore");
    expect(
      validateDumbbellProgramContract({
        program: four,
        persona: "db-4d",
        equipment: ["dumbbells"],
        experience: "Intermediate",
      })
    ).toEqual([]);

    const five = generateDumbbell(
      { experience: "Advanced", daysPerWeek: 5 },
      "db-5d",
      3
    );
    expect(five.week.map((day) => day.title)).toEqual(
      expect.arrayContaining([
        "Upper Pattern Practice",
        "Lower & Core Practice",
      ])
    );
    expect(
      validateDumbbellProgramContract({
        program: five,
        persona: "db-5d",
        equipment: ["dumbbells"],
        experience: "Advanced",
      })
    ).toEqual([]);
  });

  test("Full Body A keeps true horizontal pull; pullover is not a vertical-pull slot", () => {
    const program = generateDumbbell({}, "db-pull-honesty");
    const dayA = program.week.find((day) =>
      day.title.startsWith("Full Body A")
    );
    const pull = dayA?.routine.find(
      (item) =>
        item.section === "main" &&
        item.selectionDebug?.slotKind === "mainPullHorizontal"
    );
    expect(pull?.exerciseId).toMatch(/row/);
    const verticalPullSlot = program.week
      .flatMap((day) => day.routine)
      .find(
        (item) =>
          item.section === "main" &&
          normalizeIncludes(item.selectionDebug?.slotKind, "verticalpull")
      );
    expect(verticalPullSlot).toBeUndefined();
  });

  test("Full Body B keeps a true hinge; low-back uses hip-extension surrogate", () => {
    const painFree = generateDumbbell({}, "db-hinge-free");
    const hingeFree = painFree.week
      .find((day) => day.title.startsWith("Full Body B"))
      ?.routine.find(
        (item) =>
          item.section === "main" &&
          item.selectionDebug?.slotKind === "mainHingePrimary"
      )?.exerciseId;
    expect(hingeFree).toMatch(/rdl|deadlift|hip-thrust|glute-bridge/i);

    const lowBack = generateDumbbell(
      { goals: "Reduce pain", painAreas: ["Lower back"] },
      "db-hinge-lb"
    );
    const hingeLb = lowBack.week
      .find((day) => day.title.startsWith("Full Body B"))
      ?.routine.find(
        (item) =>
          item.section === "main" &&
          item.selectionDebug?.slotKind === "mainHingePrimary"
      )?.exerciseId;
    expect(hingeLb).toMatch(/glute-bridge|hip-thrust|rdl/i);
    expect(
      validateDumbbellProgramContract({
        program: lowBack,
        persona: "db-hinge-lb",
        equipment: ["dumbbells"],
        experience: "Beginner",
        painAreas: ["Lower back"],
      })
    ).toEqual([]);
  });

  test("no unconfirmed bench or illegal gym equipment on dumbbell-only week", () => {
    const program = generateDumbbell({}, "db-equipment");
    const failures = validateDumbbellProgramContract({
      program,
      persona: "db-equipment",
      equipment: ["dumbbells"],
      experience: "Beginner",
    });
    expect(
      failures.filter((failure) =>
        [
          "DUMBBELL_UNCONFIRMED_BENCH",
          "DUMBBELL_UNCONFIRMED_SUPPORT",
          "DUMBBELL_ILLEGAL_EQUIPMENT",
        ].includes(failure.reasonCode)
      )
    ).toEqual([]);
    const ids = program.week.flatMap((day) =>
      day.routine.map((item) => item.exerciseId)
    );
    expect(ids.some((id) => id.includes("cable") || id.includes("machine"))).toBe(
      false
    );
    expect(ids.some((id) => id.includes("bulgarian") || id.includes("step-up"))).toBe(
      false
    );
  });

  test("shoulder pain softens overhead while preserving full-body identity", () => {
    const program = generateDumbbell(
      {
        goals: "Reduce pain",
        painAreas: ["Shoulders"],
      },
      "db-shoulder"
    );
    expect(program.week.map((day) => day.title)).toEqual([
      ...DUMBBELL_THREE_DAY_TITLES,
    ]);
    const dayB = program.week.find((day) => day.title.startsWith("Full Body B"));
    const vertical = dayB?.routine.find(
      (item) =>
        item.section === "main" &&
        item.selectionDebug?.slotKind === "mainVerticalPushPrimary"
    );
    expect(vertical?.exerciseId).toMatch(/pike-pushup|landmine/i);
    expect(
      validateDumbbellProgramContract({
        program,
        persona: "db-shoulder",
        equipment: ["dumbbells"],
        experience: "Beginner",
        painAreas: ["Shoulders"],
      })
    ).toEqual([]);
  });

  test("generation is deterministic for the same seed", () => {
    const a = generateDumbbell({}, "db-det");
    const b = generateDumbbell({}, "db-det");
    const sig = (program: ReturnType<typeof generateWeeklyProgram>) =>
      program.week
        .map(
          (day) =>
            `${day.title}:${day.routine.map((item) => item.exerciseId).join(",")}`
        )
        .join("|");
    expect(sig(a)).toBe(sig(b));
  });

  test("gym contract remains green for a pain-free beginner gym week", () => {
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
    const gym = generateWeeklyProgram(
      {
        goals: "General fitness",
        painAreas: [],
        experience: "Beginner",
        equipment: ["gym"],
        daysPerWeek: 3,
      },
      "db-preserve-gym",
      { phaseIndex: 1, seed: "db-preserve-gym-seed" }
    );
    expect(
      validateGymProgramContract({
        program: gym,
        persona: "db-preserve-gym",
        equipment: ["gym"],
        experience: "Beginner",
        painAreas: [],
      })
    ).toEqual([]);
  });

  test("band and bodyweight identities are preserved (not collapsed to dumbbells)", () => {
    expect(resolvePrimaryProgramEquipmentMode(["bands"])).toBe("bands");
    expect(resolvePrimaryProgramEquipmentMode([])).toBe("bodyweight");
    expect(resolvePrimaryProgramEquipmentMode(["dumbbells", "bands"])).toBe(
      "mixedHome"
    );
  });
});

const normalizeIncludes = (value: string | null | undefined, token: string) =>
  (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .includes(token.toLowerCase());
