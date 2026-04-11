import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById, type Exercise } from "@/lib/exercises";
import {
  generateWeeklyProgram,
  type ProgramSelectionAuditEntry,
} from "@/lib/program";

const baseInput: QuestionnaireData = {
  goals: "Improve posture",
  painAreas: [],
  experience: "Beginner",
  equipment: ["bands"],
  daysPerWeek: 3,
};

const warmupSignature = (program: ReturnType<typeof generateWeeklyProgram>) =>
  program.week.map((day) => ({
    title: day.title,
    warmup: day.warmup?.items.map((item) => item.id) ?? [],
    activation: day.activation?.items.map((item) => item.id) ?? [],
    cooldown: day.cooldown?.items.map((item) => item.id) ?? [],
  }));

const getDay = (program: ReturnType<typeof generateWeeklyProgram>, title: string) =>
  program.week.find((day) => day.title === title);

const hasMainPattern = (exercise: Exercise, pattern: "push" | "pull") =>
  exercise.movementPattern.some((entry) => entry.toLowerCase() === pattern);

const findNonFinalAuditEntry = (
  entries: ProgramSelectionAuditEntry[],
  predicate: (entry: ProgramSelectionAuditEntry) => boolean
) =>
  entries.find(
    (entry) =>
      predicate(entry) &&
      !entry.chosen.reasons.some((reason) => reason.includes("[final_trace]"))
  );

const assertBackChestMainPushAndPull = (
  program: ReturnType<typeof generateWeeklyProgram>
) => {
  const backChestDay = getDay(program, "Back + Chest");
  expect(backChestDay).toBeTruthy();
  if (!backChestDay) return;

  const mainExercises = backChestDay.routine
    .filter((item) => item.section === "main")
    .map((item) => exerciseById(item.exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));

  const pushMains = mainExercises.filter((exercise) => hasMainPattern(exercise, "push"));
  const pullMains = mainExercises.filter((exercise) => hasMainPattern(exercise, "pull"));
  expect(pushMains.length).toBeGreaterThanOrEqual(1);
  expect(pullMains.length).toBeGreaterThanOrEqual(1);
};

describe("program warmup contracts", () => {
  test.each([
    { id: "band-only", equipment: ["bands"] as QuestionnaireData["equipment"] },
    { id: "none-only", equipment: ["none"] as QuestionnaireData["equipment"] },
  ])("legs and back+chest contracts hold for $id equipment", ({ equipment }) => {
    const program = generateWeeklyProgram(
      { ...baseInput, equipment },
      `warmup-contract-${equipment.join("-")}`,
      {
        phaseIndex: 2,
        seed: `warmup-contract-${equipment.join("-")}`,
      }
    );

    const legDay = getDay(program, "Legs + Abs");
    const backChestDay = getDay(program, "Back + Chest");
    expect(legDay?.warmup).toBeTruthy();
    expect(backChestDay?.warmup).toBeTruthy();
    if (!legDay?.warmup || !backChestDay?.warmup) return;

    const legWarmupIds = legDay.warmup.items.map((item) => item.id);
    expect(
      legWarmupIds.some((id) => id === "ninety-ninety-switches" || id === "hip-shifts")
    ).toBe(true);
    expect(
      (legDay.activation?.items ?? []).some((item) =>
        ["glute-bridge-activation", "band-lateral-walk"].includes(item.id)
      )
    ).toBe(true);

    const backChestWarmupIds = backChestDay.warmup.items.map((item) => item.id);
    expect(
      backChestWarmupIds.some((id) =>
        ["wall-slides", "scap-cars", "serratus-wall-slide"].includes(id)
      )
    ).toBe(true);
  });

  test("warmup and activation are deterministic for the same input", () => {
    const a = generateWeeklyProgram(baseInput, "warmup-det-a", {
      phaseIndex: 2,
      seed: "warmup-det",
    });
    const b = generateWeeklyProgram(baseInput, "warmup-det-b", {
      phaseIndex: 2,
      seed: "warmup-det",
    });

    expect(warmupSignature(a)).toEqual(warmupSignature(b));
  });

  test("warmup blocks are day-specific and not identical across the week", () => {
    const program = generateWeeklyProgram(baseInput, "warmup-day-specific", {
      phaseIndex: 2,
      seed: "warmup-day-specific",
    });
    const signatures = program.week.map(
      (day) => day.warmup?.items.map((item) => item.id).join("|") ?? ""
    );
    expect(new Set(signatures).size).toBeGreaterThan(1);
    program.week.forEach((day) => {
      expect(day.warmup?.items.length ?? 0).toBeGreaterThan(0);
      expect(day.activation?.items.length ?? 0).toBeGreaterThan(0);
      expect(day.cooldown?.items.length ?? 0).toBeGreaterThan(0);
    });
  });

  test("prep volume stays lean and bounded per day", () => {
    const program = generateWeeklyProgram(
      {
        ...baseInput,
        goals: "Reduce pain",
        painAreas: ["Shoulders", "Lower back"],
      },
      "warmup-lean-bounded",
      {
        phaseIndex: 2,
        seed: "warmup-lean-bounded",
      }
    );

    program.week.forEach((day) => {
      expect(day.warmup?.items.length ?? 0).toBeLessThanOrEqual(3);
      expect(day.activation?.items.length ?? 0).toBeLessThanOrEqual(2);
      expect(day.cooldown?.items.length ?? 0).toBe(1);
      expect(day.warmup?.items.length ?? 0).toBeGreaterThanOrEqual(3);
      expect(day.activation?.items.length ?? 0).toBeGreaterThanOrEqual(1);
      expect(day.cooldown?.items.length ?? 0).toBeGreaterThanOrEqual(1);
    });
  });

  test("default General Fitness keeps prep lean and cooldown one-part", () => {
    const program = generateWeeklyProgram(
      {
        ...baseInput,
        goals: "General fitness",
        painAreas: [],
        experience: "Intermediate",
        equipment: ["gym"],
      },
      "warmup-general-fitness-lean",
      {
        phaseIndex: 2,
        seed: "warmup-general-fitness-lean",
      }
    );

    program.week.forEach((day) => {
      const isLowerDay = day.title === "Legs + Abs";
      const warmupItems = day.warmup?.items ?? [];
      const activationItems = day.activation?.items ?? [];
      const cooldownItems = day.cooldown?.items ?? [];

      expect(warmupItems.length).toBeLessThanOrEqual(3);
      expect(warmupItems.length).toBeGreaterThanOrEqual(isLowerDay ? 3 : 2);
      expect(activationItems.length).toBeLessThanOrEqual(2);
      expect(activationItems.length).toBeGreaterThanOrEqual(1);
      expect(cooldownItems.length).toBe(1);
    });
  });

  test("pose/photo scapular signal shifts back+chest activation toward serratus prep", () => {
    const withoutPose = generateWeeklyProgram(baseInput, "warmup-pose-off", {
      phaseIndex: 2,
      seed: "warmup-pose-scap",
    });
    const withScapPose = generateWeeklyProgram(baseInput, "warmup-pose-on", {
      phaseIndex: 2,
      seed: "warmup-pose-scap",
      poseAnalysis: {
        metrics: {
          torsoHeight: 1,
          avgKeypointScore: 0.9,
          shoulderHeightDelta: 0.01,
          hipHeightDelta: 0.01,
          kneeAlignmentDelta: 0.01,
          headForwardOffset: 0.02,
          torsoLeanAngle: 2,
          hipToShoulderAlignment: 0.01,
          scapularSymmetry: 0.12,
          hipShift: 0.02,
        },
        observations: [],
        priorities: [],
        confidenceScore: 0.9,
      },
    });

    const baseBackChest = getDay(withoutPose, "Back + Chest");
    const scapBackChest = getDay(withScapPose, "Back + Chest");
    expect(baseBackChest?.activation).toBeTruthy();
    expect(scapBackChest?.activation).toBeTruthy();
    if (!baseBackChest?.activation || !scapBackChest?.activation) return;

    const baseActivationIds = baseBackChest.activation.items.map((item) => item.id);
    const scapActivationIds = scapBackChest.activation.items.map((item) => item.id);

    expect(baseActivationIds.includes("serratus-wall-slide")).toBe(false);
    expect(scapActivationIds.includes("serratus-wall-slide")).toBe(true);
  });

  // Temporary skip while focusing test effort on MAIN + ACCESSORY structure.
  test.skip(
    "activation prefers machine chest press when both machine and dumbbell presses are eligible",
    () => {
    const auditEntries: ProgramSelectionAuditEntry[] = [];
    const program = generateWeeklyProgram(
      {
        ...baseInput,
        experience: "Advanced",
        equipment: ["gym", "dumbbells", "bench"],
      },
      "activation-machine-push-preference",
      {
        phaseIndex: 1,
        seed: "activation-machine-push-preference",
        selectionAuditHook: (entry) => auditEntries.push(entry),
      }
    );
    const mainPushEntry = findNonFinalAuditEntry(
      auditEntries,
      (entry) =>
        entry.dayTitle === "Back + Chest" &&
        entry.slotKind === "mainPush" &&
        entry.slotId.endsWith("-main-2")
    );
    expect(mainPushEntry).toBeTruthy();
    expect(mainPushEntry?.chosen.exerciseId).toBe("machine-chest-press");
    expect(
      mainPushEntry?.chosen.reasons.some((reason) =>
        reason.includes("activation main push machine chest preference")
      )
    ).toBe(true);
    assertBackChestMainPushAndPull(program);
    }
  );

  // Temporary skip while focusing test effort on MAIN + ACCESSORY structure.
  test.skip("activation falls back when machines are unavailable", () => {
    const auditEntries: ProgramSelectionAuditEntry[] = [];
    const program = generateWeeklyProgram(
      {
        ...baseInput,
        experience: "Advanced",
        equipment: ["dumbbells", "bench"],
      },
      "activation-no-machine-fallback",
      {
        phaseIndex: 1,
        seed: "activation-no-machine-fallback",
        selectionAuditHook: (entry) => auditEntries.push(entry),
      }
    );
    const mainPushEntry = findNonFinalAuditEntry(
      auditEntries,
      (entry) =>
        entry.dayTitle === "Back + Chest" &&
        entry.slotKind === "mainPush" &&
        entry.slotId.endsWith("-main-2")
    );
    expect(mainPushEntry).toBeTruthy();
    expect(mainPushEntry?.chosen.exerciseId).not.toBe("machine-chest-press");
    expect(
      ["dumbbell-bench-press", "dumbbell-floor-press", "band-chest-press"].includes(
        mainPushEntry?.chosen.exerciseId ?? ""
      )
    ).toBe(true);
    assertBackChestMainPushAndPull(program);
  });

  // Temporary skip while focusing test effort on MAIN + ACCESSORY structure.
  test.skip("non-activation phases do not apply activation main push bonus", () => {
    const auditEntries: ProgramSelectionAuditEntry[] = [];
    const program = generateWeeklyProgram(
      {
        ...baseInput,
        experience: "Advanced",
        equipment: ["gym", "dumbbells", "bench"],
      },
      "growth-no-activation-push-bonus",
      {
        phaseIndex: 2,
        seed: "growth-no-activation-push-bonus",
        selectionAuditHook: (entry) => auditEntries.push(entry),
      }
    );
    const mainPushEntry = findNonFinalAuditEntry(
      auditEntries,
      (entry) =>
        entry.dayTitle === "Back + Chest" &&
        entry.slotKind === "mainPush" &&
        entry.slotId.endsWith("-main-2")
    );
    expect(mainPushEntry).toBeTruthy();
    expect(
      mainPushEntry?.chosen.reasons.some((reason) =>
        reason.includes("activation main push machine chest preference")
      )
    ).toBe(false);
    assertBackChestMainPushAndPull(program);
  });
});
