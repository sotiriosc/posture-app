import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { Program, ProgramDay, ProgramRoutineItem } from "@/lib/types";
import type { Exercise, ExerciseCategory } from "@/lib/exercises";
import { exerciseById, exercises } from "@/lib/exercises";
import type { Equipment } from "@/lib/equipment";
import { isExerciseEligible, normalizeEquipmentSelection } from "@/lib/equipment";
import { buildNextWeekPlan, getPhaseForWeekIndex } from "@/lib/phases";

const nowIso = () => new Date().toISOString();

const pickFallbackExercise = (
  category: ExerciseCategory,
  loadType: ProgramRoutineItem["loadType"],
  available: Set<Equipment>
) => {
  const eligible = exercises.filter(
    (exercise) => exercise.category === category && isExerciseEligible(exercise, available)
  );
  const loadTypeMatch = eligible.filter((exercise) => exercise.loadType === loadType);
  if (loadTypeMatch.length) return loadTypeMatch[0];
  if (eligible.length) return eligible[0];
  const noneFallback = exercises.filter(
    (exercise) =>
      exercise.category === category && exercise.equipment.includes("none")
  );
  return noneFallback[0] ?? exercises.find((exercise) => exercise.category === category) ?? null;
};

const ensureEligibleItem = (
  item: ProgramRoutineItem,
  available: Set<Equipment>
) => {
  const exercise = exerciseById(item.exerciseId);
  if (!exercise) return item;
  if (isExerciseEligible(exercise, available)) return item;
  const fallback = pickFallbackExercise(exercise.category, exercise.loadType, available);
  if (!fallback) return item;
  return {
    ...item,
    exerciseId: fallback.id,
    loadType: fallback.loadType,
    cues: fallback.cues ?? null,
  };
};

const patternPriority = [
  "squat",
  "hinge",
  "push",
  "pull",
  "core",
  "mobility",
];

const defaultPrescriptionByPattern = (pattern: string) => {
  if (pattern === "mobility") return { sets: "2", reps: "6-8", duration: 60 };
  if (pattern === "core") return { sets: "2-3", reps: "8-12", duration: 60 };
  return { sets: "3", reps: "8-12", duration: 75 };
};

const chooseExerciseForPattern = (
  pattern: string,
  available: Set<Equipment>,
  preferBands: boolean,
  usedIds: Set<string>
) => {
  const eligible = exercises.filter(
    (exercise) =>
      exercise.movementPattern.includes(pattern) &&
      isExerciseEligible(exercise, available) &&
      !usedIds.has(exercise.id)
  );

  if (preferBands && ["pull", "push", "core"].includes(pattern)) {
    const bandFirst = eligible.filter((exercise) =>
      exercise.equipment.includes("bands")
    );
    if (bandFirst.length) return bandFirst[0];
  }

  if (eligible.length) return eligible[0];

  const noneFallback = exercises.filter(
    (exercise) =>
      exercise.movementPattern.includes(pattern) &&
      exercise.equipment.includes("none") &&
      !usedIds.has(exercise.id)
  );
  return noneFallback[0] ?? null;
};

const ensureSlotCoverage = (
  day: ProgramDay,
  available: Set<Equipment>,
  preferBands: boolean
) => {
  const usedIds = new Set(day.routine.map((item) => item.exerciseId));
  const existingPatterns = new Set<string>();

  day.routine.forEach((item) => {
    const exercise = exerciseById(item.exerciseId);
    exercise?.movementPattern.forEach((pattern) =>
      existingPatterns.add(pattern)
    );
  });

  const missing = patternPriority.filter(
    (pattern) => !existingPatterns.has(pattern)
  );

  if (!missing.length) return day;

  const additions: ProgramRoutineItem[] = [];
  missing.forEach((pattern) => {
    const exercise = chooseExerciseForPattern(
      pattern,
      available,
      preferBands,
      usedIds
    );
    if (!exercise) return;
    usedIds.add(exercise.id);
    const defaultRx = defaultPrescriptionByPattern(pattern);
    additions.push(
      makeItem(exercise.id, defaultRx.sets, defaultRx.reps, defaultRx.duration, 60)
    );
  });

  return {
    ...day,
    routine: [...day.routine, ...additions],
  };
};

const makeItem = (
  exerciseId: string,
  sets: string | number,
  reps?: string,
  durationSec?: number,
  restSec?: number
): ProgramRoutineItem => {
  const exercise = exerciseById(exerciseId);
  return {
    exerciseId,
    sets,
    reps: reps ?? null,
    durationSec: durationSec ?? null,
    restSec: restSec ?? 60,
    loadType: exercise?.loadType ?? "bodyweight",
    notes: null,
    cues: exercise?.cues ?? null,
  };
};

const fullBodyA = (intensity: string) => ({
  title: "Full Body A",
  focusTags: ["strength", "posture", "upper"],
  routine: [
    makeItem("cat-cow", "2", "6-8", 60, 30),
    makeItem("wall-slides", "2", "8-10", 60, 30),
    makeItem("dumbbell-rows", intensity, "8-12", 90, 75),
    makeItem("pallof-press", intensity, "8-10 per side", 90, 60),
    makeItem("glute-bridges", "3", "10-12", 75, 60),
    makeItem("hip-flexor-stretch", "2", "30 sec per side", 60, 30),
  ],
});

const fullBodyB = (intensity: string) => ({
  title: "Full Body B",
  focusTags: ["mobility", "core", "lower"],
  routine: [
    makeItem("thoracic-rotation", "2", "6-8 per side", 60, 30),
    makeItem("bird-dog", "2-3", "6-8 per side", 75, 45),
    makeItem("face-pull", intensity, "10-12", 90, 60),
    makeItem("dead-bug", "3", "6-8 per side", 75, 60),
    makeItem("hamstring-stretch", "2", "30 sec per side", 60, 30),
  ],
});

const fullBodyC = (intensity: string) => ({
  title: "Full Body C",
  focusTags: ["strength", "upper", "core"],
  routine: [
    makeItem("cat-cow", "2", "6-8", 60, 30),
    makeItem("wall-angel-hold", "2", "20-30 sec", 60, 30),
    makeItem("prone-ytw", intensity, "6-8 each", 90, 60),
    makeItem("band-pull-aparts", intensity, "10-12", 75, 60),
    makeItem("thread-the-needle", "2", "5-6 per side", 60, 30),
  ],
});

const upperA = (intensity: string) => ({
  title: "Upper A",
  focusTags: ["upper", "scap", "strength"],
  routine: [
    makeItem("wall-slides", "2", "8-10", 60, 30),
    makeItem("dumbbell-rows", intensity, "8-12", 90, 75),
    makeItem("face-pull", intensity, "10-12", 90, 60),
    makeItem("prone-ytw", "3", "6-8 each", 90, 60),
  ],
});

const lowerA = (intensity: string) => ({
  title: "Lower A",
  focusTags: ["lower", "core", "hips"],
  routine: [
    makeItem("glute-bridges", intensity, "10-12", 75, 60),
    makeItem("bird-dog", "2-3", "6-8 per side", 75, 45),
    makeItem("pallof-press", "3", "8-10 per side", 90, 60),
    makeItem("hip-flexor-stretch", "2", "30 sec per side", 60, 30),
  ],
});

const upperB = (intensity: string) => ({
  title: "Upper B",
  focusTags: ["upper", "posture", "pull"],
  routine: [
    makeItem("cat-cow", "2", "6-8", 60, 30),
    makeItem("band-pull-aparts", intensity, "10-12", 75, 60),
    makeItem("dumbbell-rows", intensity, "8-12", 90, 75),
    makeItem("chin-tucks", "2", "8-10", 60, 30),
  ],
});

const lowerB = (intensity: string) => ({
  title: "Lower B",
  focusTags: ["lower", "mobility", "core"],
  routine: [
    makeItem("dead-bug", "3", "6-8 per side", 75, 60),
    makeItem("hamstring-stretch", "2", "30 sec per side", 60, 30),
    makeItem("thread-the-needle", "2", "5-6 per side", 60, 30),
  ],
});

const upper = (intensity: string) => ({
  title: "Upper",
  focusTags: ["upper", "strength"],
  routine: [
    makeItem("wall-slides", "2", "8-10", 60, 30),
    makeItem("dumbbell-rows", intensity, "8-12", 90, 75),
    makeItem("face-pull", intensity, "10-12", 90, 60),
  ],
});

const lower = (intensity: string) => ({
  title: "Lower",
  focusTags: ["lower", "core"],
  routine: [
    makeItem("glute-bridges", intensity, "10-12", 75, 60),
    makeItem("pallof-press", "3", "8-10 per side", 90, 60),
  ],
});

const push = (intensity: string) => ({
  title: "Push",
  focusTags: ["upper", "push"],
  routine: [
    makeItem("wall-angel-hold", "2", "20-30 sec", 60, 30),
    makeItem("band-pull-aparts", intensity, "10-12", 75, 60),
  ],
});

const pull = (intensity: string) => ({
  title: "Pull",
  focusTags: ["upper", "pull"],
  routine: [
    makeItem("dumbbell-rows", intensity, "8-12", 90, 75),
    makeItem("prone-ytw", "3", "6-8 each", 90, 60),
  ],
});

const legsCore = (intensity: string) => ({
  title: "Legs + Core",
  focusTags: ["lower", "core"],
  routine: [
    makeItem("glute-bridges", intensity, "10-12", 75, 60),
    makeItem("dead-bug", "3", "6-8 per side", 75, 60),
    makeItem("hip-flexor-stretch", "2", "30 sec per side", 60, 30),
  ],
});

export const generateWeeklyProgram = (
  data: QuestionnaireData,
  programId: string
): Program => {
  const equipmentContext = normalizeEquipmentSelection(data.equipment);
  const preferBands = equipmentContext.available.has("bands");
  const intensity =
    data.goals === "Reduce pain"
      ? "2-3"
      : data.experience === "Advanced"
      ? "4-5"
      : "3-4";

  let days: ProgramDay[] = [];

  if (data.daysPerWeek === 3) {
    days = [
      { dayIndex: 0, ...fullBodyA(intensity) },
      { dayIndex: 1, ...fullBodyB(intensity) },
      { dayIndex: 2, ...fullBodyC(intensity) },
    ];
  } else if (data.daysPerWeek === 4) {
    days = [
      { dayIndex: 0, ...upperA(intensity) },
      { dayIndex: 1, ...lowerA(intensity) },
      { dayIndex: 2, ...upperB(intensity) },
      { dayIndex: 3, ...lowerB(intensity) },
    ];
  } else {
    days = [
      { dayIndex: 0, ...upper(intensity) },
      { dayIndex: 1, ...lower(intensity) },
      { dayIndex: 2, ...push(intensity) },
      { dayIndex: 3, ...pull(intensity) },
      { dayIndex: 4, ...legsCore(intensity) },
    ];
  }

  const eligibleDays = days
    .map((day) => ({
      ...day,
      routine: day.routine.map((item) =>
        ensureEligibleItem(item, equipmentContext.available)
      ),
    }))
    .map((day) => {
      if (
        equipmentContext.available.has("none") ||
        equipmentContext.available.has("bands")
      ) {
        return ensureSlotCoverage(day, equipmentContext.available, preferBands);
      }
      return day;
    });

  const timestamp = nowIso();
  const phase = getPhaseForWeekIndex(1, data.goals ?? "Improve posture");
  const nextWeekPlan = buildNextWeekPlan({
    complianceRate: 0,
    painFlag: data.painAreas.length > 0,
    fatigueFlag: false,
    phaseName: phase.name,
  });
  return {
    id: programId,
    userId: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    goalTrack: data.goals ?? null,
    daysPerWeek: data.daysPerWeek,
    estimatedSessionMinutesRange: { min: 45, max: 60 },
    phase,
    nextWeekPlan,
    week: eligibleDays,
    source: "local",
    deletedAt: null,
  };
};
