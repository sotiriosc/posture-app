import { exerciseById } from "@/lib/exercises";
import type { Exercise } from "@/lib/exercises";
import type {
  ProgramDayKey,
  ProgramRecentGenerationSummary,
  ProgramVariationOptions,
} from "@/lib/program";
import type { Program } from "@/lib/types";

const DAY_INDEX_TO_PROGRAM_KEY: Record<number, ProgramDayKey> = {
  0: "day1_back_chest",
  1: "day2_shoulders_arms",
  2: "day3_legs_abs",
};

const DAY_TITLE_TO_PROGRAM_KEY: Record<string, ProgramDayKey> = {
  "Back + Chest": "day1_back_chest",
  "Shoulders + Arms": "day2_shoulders_arms",
  "Legs + Abs": "day3_legs_abs",
};

const resolveProgramVariationPhase = (program: Program): 1 | 2 | 3 => {
  const rawPhase = Number(program.phaseIndex ?? program.phase?.phaseIndex ?? 1);
  if (rawPhase >= 3) return 3;
  if (rawPhase <= 1) return 1;
  return 2;
};

const resolveFamilyKey = (exercise: Exercise) => exercise.familyKey ?? exercise.id;

const resolveVariantKey = (exercise: Exercise) =>
  exercise.variantKey ??
  `${exercise.loadType}-${exercise.equipment.slice().sort().join("_") || "none"}`;

const resolveDaySummaryKey = (params: { title: string; dayIndex: number }) =>
  DAY_TITLE_TO_PROGRAM_KEY[params.title] ??
  DAY_INDEX_TO_PROGRAM_KEY[params.dayIndex] ??
  params.title;

export const resolveProgramVariationIndex = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0;

export const buildProgramRecentGenerationSummary = (
  program: Program,
  context: {
    settingsHash: string;
    variationIndex: number;
  }
): ProgramRecentGenerationSummary => {
  const phase = resolveProgramVariationPhase(program);
  const exerciseIds = program.week.flatMap((day) => day.routine.map((item) => item.exerciseId));
  const exercises = exerciseIds
    .map((exerciseId) => exerciseById(exerciseId))
    .filter((exercise): exercise is Exercise => Boolean(exercise));

  const days = Object.fromEntries(
    program.week.map((day) => {
      const routineIds = day.routine
        .filter((item) => item.section === "main")
        .map((item) => item.exerciseId);
      const accessoryIds = day.routine
        .filter((item) => item.section === "accessory")
        .map((item) => item.exerciseId);
      const routineExercises = routineIds
        .map((exerciseId) => exerciseById(exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      const accessoryExercises = accessoryIds
        .map((exerciseId) => exerciseById(exerciseId))
        .filter((exercise): exercise is Exercise => Boolean(exercise));
      const dayExercises = [...routineExercises, ...accessoryExercises];
      return [
        resolveDaySummaryKey({ title: day.title, dayIndex: day.dayIndex }),
        {
          phaseSummaries: [
            {
              phase,
              routineIds,
              accessoryIds,
              routineFamilyKeys: routineExercises.map(resolveFamilyKey),
              accessoryFamilyKeys: accessoryExercises.map(resolveFamilyKey),
              routineVariantKeys: routineExercises.map(resolveVariantKey),
              accessoryVariantKeys: accessoryExercises.map(resolveVariantKey),
            },
          ],
          routineIds,
          accessoryIds,
          familyKeys: dayExercises.map(resolveFamilyKey),
          variantKeys: dayExercises.map(resolveVariantKey),
        },
      ];
    })
  );

  return {
    settingsHash: context.settingsHash,
    variationIndex: context.variationIndex,
    generatedAt: Date.now(),
    phaseIndex: phase,
    days,
    exerciseIds,
    familyKeys: exercises.map(resolveFamilyKey),
    variantKeys: exercises.map(resolveVariantKey),
  };
};

export const buildProgramVariationOptions = (params: {
  settingsHash?: string | null;
  variationIndex?: number | null;
  recentProgram?: Program | null;
  recentSummary?: ProgramRecentGenerationSummary | null;
}): ProgramVariationOptions | undefined => {
  const settingsHash = String(params.settingsHash ?? "").trim();
  const variationIndex = resolveProgramVariationIndex(params.variationIndex);
  const hasRecentSummary = Boolean(params.recentSummary || params.recentProgram);

  if (!settingsHash && variationIndex === 0 && !hasRecentSummary) return undefined;

  const recentGenerationSummary =
    params.recentSummary ??
    (settingsHash && params.recentProgram
      ? buildProgramRecentGenerationSummary(params.recentProgram, {
          settingsHash,
          variationIndex: Math.max(0, variationIndex - 1),
        })
      : undefined);

  return {
    seed: settingsHash || undefined,
    settingsHash: settingsHash || undefined,
    variationIndex,
    index: variationIndex,
    useRecentMemory: true,
    recentGenerationSummary: recentGenerationSummary ?? undefined,
  };
};
