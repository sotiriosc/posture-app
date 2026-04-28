import { beforeEach, describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";
import type { Program, ProgramRoutineItem } from "@/lib/types";

const baseQuestionnaire: QuestionnaireData = {
  goals: "General fitness",
  painAreas: [],
  experience: "Beginner",
  equipment: ["gym"],
  daysPerWeek: 3,
};

const allRoutineItems = (program: Program) => program.week.flatMap((day) => day.routine);

const mainItems = (program: Program) =>
  allRoutineItems(program).filter((item) => item.section === "main");

const accessoryItems = (program: Program) =>
  allRoutineItems(program).filter((item) => item.section === "accessory");

const isHingeSlot = (item: ProgramRoutineItem) => {
  const markers = [
    item.selectionDebug?.slotKind,
    item.selectionDebug?.slotLane,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return markers.includes("hinge");
};

const internalJargon =
  /\b(slotkind|slotlane|selectiondebug|decisiontrace|quota|mainpush|mainpull|mainhinge|accessorypush|accessorypull)\b/i;

describe("program prescription and rationale metadata", () => {
  beforeEach(() => {
    clearProgramVariationHistory();
    clearProgramConstraintWarningBuffer();
  });

  test("generated main exercises receive structured prescriptions", () => {
    const program = generateWeeklyProgram(baseQuestionnaire, "prescription-main", {
      phaseIndex: 1,
      seed: "prescription-main",
    });

    const mains = mainItems(program);
    expect(mains.length).toBeGreaterThan(0);
    mains.forEach((item) => {
      expect(item.prescription?.sets).toBeGreaterThan(0);
      expect(item.prescription?.reps).toBeTruthy();
      expect(item.prescription?.tempo).toBeTruthy();
      expect(item.prescription?.restSeconds).toBeGreaterThan(0);
      expect(item.prescription?.targetRPE).toBeGreaterThanOrEqual(4);
      expect(item.prescription?.progressionRule).toBeTruthy();
      expect(item.prescription?.regressionRule).toBeTruthy();
    });
  });

  test("prescriptions differ semantically by phase", () => {
    const phase1 = generateWeeklyProgram(baseQuestionnaire, "prescription-phase-1", {
      phaseIndex: 1,
      seed: "prescription-phase",
    });
    const phase2 = generateWeeklyProgram(baseQuestionnaire, "prescription-phase-2", {
      phaseIndex: 2,
      seed: "prescription-phase",
    });
    const phase3 = generateWeeklyProgram(baseQuestionnaire, "prescription-phase-3", {
      phaseIndex: 3,
      seed: "prescription-phase",
    });

    const phase1Main = mainItems(phase1)[0];
    const phase2Main = mainItems(phase2)[0];
    const phase3Main = mainItems(phase3)[0];

    expect(phase1Main.prescription?.tempo).toMatch(/3-1-2|controlled/i);
    expect(phase2Main.prescription?.tempo).toMatch(/2-0-2|steady/i);
    expect(phase3Main.prescription?.progressionRule).toMatch(/load|difficulty/i);
    expect(phase3Main.prescription?.targetRPE ?? 0).toBeGreaterThan(
      phase1Main.prescription?.targetRPE ?? 0
    );
  });

  test("lower-back pain hinge slots get conservative stop and regression rules", () => {
    const program = generateWeeklyProgram(
      {
        ...baseQuestionnaire,
        goals: "Reduce pain",
        painAreas: ["Lower back"],
      },
      "prescription-lower-back",
      {
        phaseIndex: 2,
        seed: "prescription-lower-back",
      }
    );

    const hingeMains = mainItems(program).filter(isHingeSlot);
    expect(hingeMains.length).toBeGreaterThan(0);
    hingeMains.forEach((item) => {
      expect(item.prescription?.targetRPE ?? 99).toBeLessThanOrEqual(7);
      expect(item.prescription?.tempo).toMatch(/controlled/i);
      expect(item.prescription?.regressionRule).toMatch(/range|tempo|hip-extension/i);
      expect(item.prescription?.stopRule).toMatch(/lower-back pain|brace|travels/i);
      expect(item.rationale?.whyThisExercise).toMatch(/lower-back sensitivity|conservative hinge/i);
    });
  });

  test("correctives and cooldowns avoid heavy prescription values", () => {
    const program = generateWeeklyProgram(baseQuestionnaire, "prescription-prep-cooldown", {
      phaseIndex: 3,
      seed: "prescription-prep-cooldown",
    });

    const prepAndCooldown = allRoutineItems(program).filter((item) =>
      item.section === "warmup" || item.section === "activation" || item.section === "cooldown"
    );
    expect(prepAndCooldown.length).toBeGreaterThan(0);
    prepAndCooldown.forEach((item) => {
      expect(item.prescription?.targetRPE).toBeUndefined();
      expect(item.prescription?.progressionRule).toBeUndefined();
      expect(item.prescription?.restSeconds ?? 0).toBeLessThanOrEqual(60);
    });
  });

  test("rationale exists for main and accessory items without exposing internal jargon", () => {
    const program = generateWeeklyProgram(baseQuestionnaire, "prescription-rationale", {
      phaseIndex: 1,
      seed: "prescription-rationale",
    });

    const targets = [...mainItems(program), ...accessoryItems(program)];
    expect(targets.length).toBeGreaterThan(0);
    targets.forEach((item) => {
      const rationaleText = [
        item.rationale?.whyThisExercise,
        item.rationale?.mainCue,
        item.rationale?.commonMistake,
      ]
        .filter(Boolean)
        .join(" ");
      expect(item.rationale?.whyThisExercise).toBeTruthy();
      expect(item.rationale?.mainCue).toBeTruthy();
      expect(rationaleText).not.toMatch(internalJargon);
    });

    const pullMain = mainItems(program).find(
      (item) => item.selectionDebug?.slotLane?.toLowerCase() === "pull"
    );
    expect(pullMain?.rationale?.whyThisExercise).toMatch(/pulling|pressing/i);

    const hingeMain = mainItems(program).find(isHingeSlot);
    expect(hingeMain?.rationale?.whyThisExercise).toMatch(/hinge|posterior chain/i);
  });

  test("legacy routine items remain valid without metadata", () => {
    const legacyItem: ProgramRoutineItem = {
      exerciseId: "pushup",
      section: "main",
      sets: 2,
      reps: "8-10",
      durationSec: null,
      restSec: 60,
      loadType: "bodyweight",
      notes: null,
      cues: null,
    };

    expect(legacyItem.prescription).toBeUndefined();
    expect(legacyItem.rationale).toBeUndefined();
    expect(legacyItem.prescription?.reps ?? legacyItem.reps).toBe("8-10");
  });
});
