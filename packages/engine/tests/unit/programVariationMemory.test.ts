import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { Equipment } from "@/lib/equipment";
import { exerciseById } from "@/lib/exercises";
import { generateWeeklyProgram, type ProgramVariationOptions } from "@/lib/program";
import { createProgramVariationMemoryRuntime } from "@/lib/program/programVariationMemory";
import { resolveProgramVariationIndex } from "@/lib/programVariationClient";

const normalizeTagToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const normalizeSlotToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const stableHashToken = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

const clampPhaseIndexToSupportedRange = (phaseIndex: number) =>
  Math.min(3, Math.max(1, Math.floor(phaseIndex)));

const resolveVariationIndexFromOptions = (
  variation?: Pick<ProgramVariationOptions, "variationIndex" | "index">
) => resolveProgramVariationIndex(variation?.variationIndex ?? variation?.index);

const createRuntime = () =>
  createProgramVariationMemoryRuntime({
    exerciseById,
    normalizeSlotToken,
    normalizeTagToken,
    stableHashToken,
    clampPhaseIndexToSupportedRange,
    resolveVariationIndex: resolveVariationIndexFromOptions,
  });

const baseQuestionnaire: QuestionnaireData = {
  goals: "General fitness",
  painAreas: [],
  experience: "Intermediate",
  equipment: ["gym", "bands"],
  daysPerWeek: 3,
};

const availableEquipment = new Set<Equipment>(["gym", "bands"]);

const resolveFamilyKey = (exerciseId: string) => {
  const exercise = exerciseById(exerciseId);
  if (!exercise) throw new Error(`Missing exercise: ${exerciseId}`);
  return exercise.familyKey ?? exercise.id;
};

const resolveVariantKey = (exerciseId: string) => {
  const exercise = exerciseById(exerciseId);
  if (!exercise) throw new Error(`Missing exercise: ${exerciseId}`);
  return (
    exercise.variantKey ??
    `${exercise.loadType}-${exercise.equipment.slice().sort().join("_") || "none"}`
  );
};

describe("programVariationMemory", () => {
  test("same state resolves the same variation memory after identical history", () => {
    const runtime = createRuntime();
    const settingsHash = "memory-settings-profile";
    const variation = {
      seed: "memory-seed",
      settingsHash,
      variationIndex: 4,
      useRecentMemory: true,
    } satisfies ProgramVariationOptions;

    const generated = generateWeeklyProgram(baseQuestionnaire, "variation-memory-seeded", {
      phaseIndex: 2,
      variation,
    });
    const initialState = runtime.resolveProgramVariationState({
      questionnaire: baseQuestionnaire,
      available: availableEquipment,
      daysPerWeek: 3,
      phaseIndex: 2,
      poseFocusTags: ["scapular_control"],
      baseSeed: "weekly-seed",
      variation,
    });

    expect(initialState?.settingsKey).toBe(settingsHash);
    runtime.commitProgramVariationSnapshot(initialState, generated.week);

    const firstResolved = runtime.resolveProgramVariationState({
      questionnaire: baseQuestionnaire,
      available: availableEquipment,
      daysPerWeek: 3,
      phaseIndex: 2,
      poseFocusTags: ["scapular_control"],
      baseSeed: "weekly-seed",
      variation,
    });
    const secondResolved = runtime.resolveProgramVariationState({
      questionnaire: baseQuestionnaire,
      available: availableEquipment,
      daysPerWeek: 3,
      phaseIndex: 2,
      poseFocusTags: ["scapular_control"],
      baseSeed: "weekly-seed",
      variation,
    });

    expect(firstResolved?.settingsKey).toBe(secondResolved?.settingsKey);
    expect(firstResolved?.seedKey).toBe(secondResolved?.seedKey);
    expect([...firstResolved!.memory.recentExerciseIds].sort()).toEqual(
      [...secondResolved!.memory.recentExerciseIds].sort()
    );
    expect([...firstResolved!.memory.recentDayTemplateKeys.keys()].sort()).toEqual(
      [...secondResolved!.memory.recentDayTemplateKeys.keys()].sort()
    );
  });

  test("recent generation summary is applied with day-token normalization and phase-aware memory", () => {
    const runtime = createRuntime();
    const generated = generateWeeklyProgram(baseQuestionnaire, "variation-memory-summary", {
      phaseIndex: 2,
      variation: {
        seed: "summary-seed",
        settingsHash: "summary-settings",
        variationIndex: 1,
        useRecentMemory: false,
      },
    });
    const backChestDay = generated.week.find((day) => day.title === "Back + Chest");
    if (!backChestDay) throw new Error("Missing Back + Chest day");
    const mainIds = backChestDay.routine
      .filter((item) => item.section === "main")
      .map((item) => item.exerciseId);
    const accessoryIds = backChestDay.routine
      .filter((item) => item.section === "accessory")
      .map((item) => item.exerciseId);
    const allIds = [...mainIds, ...accessoryIds];

    const memory = runtime.resolveRecentGenerationMemory({
      memory: runtime.aggregateVariationHistory([]),
      summary: {
        settingsHash: "summary-settings",
        variationIndex: 1,
        phaseIndex: 2,
        dayTemplateKeys: {
          day1_back_chest: "back_chest_template_v2",
        },
        days: {
          day1_back_chest: {
            templateKey: "back_chest_template_v2",
            phaseSummaries: [
              {
                phase: 2,
                routineIds: mainIds,
                accessoryIds,
                routineFamilyKeys: mainIds.map(resolveFamilyKey),
                accessoryFamilyKeys: accessoryIds.map(resolveFamilyKey),
                routineVariantKeys: mainIds.map(resolveVariantKey),
                accessoryVariantKeys: accessoryIds.map(resolveVariantKey),
              },
            ],
            familyKeys: allIds.map(resolveFamilyKey),
            variantKeys: allIds.map(resolveVariantKey),
          },
        },
        exerciseIds: allIds,
        familyKeys: allIds.map(resolveFamilyKey),
        variantKeys: allIds.map(resolveVariantKey),
      },
    });

    expect([...memory.recentExerciseIds].sort()).toEqual([...new Set(allIds)].sort());
    expect(memory.recentDayTemplateKeys.get("back_chest")).toEqual([
      "back_chest_template_v2",
    ]);
    expect(memory.recentDayTemplateKeys.get("back_chest__phase_2")).toEqual([
      "back_chest_template_v2",
    ]);
    expect(memory.recentSlotExerciseIds.get("back_chest-main-1")).toBe(mainIds[0]);
    expect(memory.recentDayMainLayoutSignatures.get("back_chest")?.[0]).toContain("::");
    expect(memory.recentDayMainLayoutSignatures.get("back_chest__phase_2")?.[0]).toContain(
      "::"
    );
  });

  test("variation snapshot preserves the same slot and template shape", () => {
    const runtime = createRuntime();
    const generated = generateWeeklyProgram(baseQuestionnaire, "variation-memory-snapshot", {
      phaseIndex: 2,
      variation: {
        seed: "snapshot-seed",
        settingsHash: "snapshot-settings",
        variationIndex: 2,
        useRecentMemory: false,
      },
    });
    const snapshot = runtime.buildVariationSnapshot(
      generated.week,
      new Map([
        ["back_chest", "back_chest_template_v2"],
        ["shoulders_arms", "shoulders_arms_template_v2"],
      ])
    );
    const backChestDay = generated.week.find((day) => day.title === "Back + Chest");
    const backChestMainIds =
      backChestDay?.routine
        .filter((item) => item.section === "main")
        .map((item) => item.exerciseId) ?? [];

    expect(snapshot.exerciseIds).toEqual(
      generated.week.flatMap((day) => day.routine.map((item) => item.exerciseId))
    );
    expect(snapshot.dayTemplateKeys).toMatchObject({
      back_chest: "back_chest_template_v2",
      shoulders_arms: "shoulders_arms_template_v2",
    });
    expect(snapshot.slotExerciseIds["back_chest-main-1"]).toBe(backChestMainIds[0]);
    expect(snapshot.dayMainLayoutSignatures.back_chest).toContain("::");
    expect(snapshot.dayMainFamilyLayoutSignatures.back_chest).not.toBe("");
  });
});
