import { describe, expect, test } from "vitest";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import { normalizeEquipmentSelection, isExerciseEligible } from "@/lib/equipment";
import { generateWeeklyProgram } from "@/lib/program";
import { generateNextTimeGuidance } from "@/lib/progression";

type MainPattern = "push" | "verticalPush" | "pull" | "squat" | "hinge";

type CompetitiveScore = {
  design: number;
  safety: number;
  progression: number;
  coaching: number;
  total: number;
};

const normalizePattern = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const expectedMainCount = (experience: QuestionnaireData["experience"]) => {
  if (experience === "Advanced") return 4;
  if (experience === "Intermediate") return 3;
  return 2;
};

const hasMainPattern = (
  day: ReturnType<typeof generateWeeklyProgram>["week"][number],
  required: MainPattern
) => {
  const requiredToken = normalizePattern(required);
  return day.routine
    .filter((item) => item.section === "main")
    .some((item) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return false;
      const patternMatch = exercise.movementPattern.some(
        (pattern) => normalizePattern(pattern) === requiredToken
      );
      if (patternMatch) return true;
      if (required !== "verticalPush") return false;
      const tagTokens = new Set((exercise.tags ?? []).map(normalizePattern));
      const muscleTokens = new Set((exercise.muscleGroups ?? []).map(normalizePattern));
      return (
        (tagTokens.has("shoulders") || tagTokens.has("vertical")) &&
        muscleTokens.has("shoulders")
      );
    });
};

const expectedPatternsForDayTitle = (title: string): MainPattern[] => {
  const normalized = title.toLowerCase();
  if (normalized.includes("back + chest")) return ["pull", "push"];
  if (normalized.includes("shoulders + arms")) return ["verticalPush", "pull"];
  if (normalized.includes("legs + abs")) return ["squat", "hinge"];
  if (normalized.includes("upper push")) return ["push"];
  if (normalized.includes("upper pull")) return ["pull"];
  if (normalized.includes("lower squat") || normalized.includes("(squat")) return ["squat"];
  if (normalized.includes("lower hinge") || normalized.includes("(hinge")) return ["hinge"];
  return [];
};

const mainDemandScore = (exerciseId: string) => {
  const exercise = exerciseById(exerciseId);
  if (!exercise) return 0;
  let score = 0;
  if (exercise.loadType === "weighted") score += 4;
  else if (exercise.loadType === "assisted") score += 3;
  else if (exercise.loadType === "bodyweight") score += 2;
  else score += 1;
  if (exercise.tags.includes("advanced")) score += 1;
  if (exercise.movementPattern.includes("single-leg")) score += 1;
  return score;
};

const isChestDominantMain = (exerciseId: string) => {
  const exercise = exerciseById(exerciseId);
  if (!exercise) return false;
  const patterns = new Set((exercise.movementPattern ?? []).map(normalizePattern));
  if (!patterns.has("push")) return false;
  const tags = new Set((exercise.tags ?? []).map(normalizePattern));
  const muscles = new Set((exercise.muscleGroups ?? []).map(normalizePattern));
  const descriptor = `${exercise.id} ${exercise.name}`.toLowerCase();
  return (
    tags.has("chest") ||
    muscles.has("chest") ||
    descriptor.includes("chest") ||
    descriptor.includes("bench") ||
    descriptor.includes("floor press") ||
    descriptor.includes("floor-press")
  );
};

const contraindicationHit = (exerciseId: string, painAreas: string[]) => {
  const exercise = exerciseById(exerciseId);
  if (!exercise?.contraindications?.length || !painAreas.length) return false;
  const text = exercise.contraindications.join(" ").toLowerCase();
  return painAreas.some((area) => text.includes(area.toLowerCase()));
};

const scoreCompetitiveBenchmark = (input: QuestionnaireData): CompetitiveScore => {
  const scenarioSeed = `competitive-${input.goals}-${input.experience}-${input.daysPerWeek}-${input.equipment.join(
    "-"
  )}-${input.painAreas.join("-")}`;
  const phase1 = generateWeeklyProgram(input, `${scenarioSeed}-p1`, {
    phaseIndex: 1,
    cycleIndex: 1,
    seed: scenarioSeed,
  });
  const phase2 = generateWeeklyProgram(input, `${scenarioSeed}-p2`, {
    phaseIndex: 2,
    cycleIndex: 2,
    seed: scenarioSeed,
  });
  const phase3 = generateWeeklyProgram(input, `${scenarioSeed}-p3`, {
    phaseIndex: 3,
    cycleIndex: 3,
    seed: scenarioSeed,
  });

  let design = 0;
  let safety = 0;
  let progression = 0;
  let coaching = 0;

  const expectedMain = expectedMainCount(input.experience);
  const available = normalizeEquipmentSelection(input.equipment).available;
  const painAreas = input.painAreas.map((area) => area.toLowerCase());

  const allDaysHaveCoreSections = phase1.week.every((day) => {
    const sections = new Set(day.routine.map((item) => item.section));
    return (
      sections.has("warmup") &&
      sections.has("main") &&
      sections.has("accessory") &&
      sections.has("cooldown")
    );
  });
  if (allDaysHaveCoreSections) design += 8;

  const allMainCountsCorrect = phase1.week.every(
    (day) => day.routine.filter((item) => item.section === "main").length === expectedMain
  );
  if (allMainCountsCorrect) design += 6;

  const allMainCategoriesCorrect = phase1.week.every((day) =>
    day.routine
      .filter((item) => item.section === "main")
      .every((item) => exerciseById(item.exerciseId)?.category === "main")
  );
  if (allMainCategoriesCorrect) design += 4;

  const noDupesPerDay = phase1.week.every((day) => {
    const ids = day.routine.map((item) => item.exerciseId);
    return new Set(ids).size === ids.length;
  });
  if (noDupesPerDay) design += 4;

  const equipmentFit = phase1.week.every((day) =>
    day.routine.every((item) => {
      const exercise = exerciseById(item.exerciseId);
      return Boolean(exercise && isExerciseEligible(exercise, available));
    })
  );
  if (equipmentFit) design += 4;

  const hasActionableCues = phase1.week.every((day) =>
    day.routine
      .filter((item) => item.section === "main" || item.section === "accessory")
      .every((item) => Array.isArray(item.cues) && item.cues.length > 0)
  );
  if (hasActionableCues) design += 4;

  const patternContracts = phase1.week
    .flatMap((day) => {
      const expectedPatterns = expectedPatternsForDayTitle(day.title);
      return expectedPatterns.map((pattern) => hasMainPattern(day, pattern));
    });
  if (!patternContracts.length) {
    safety += 8;
  } else {
    const matched = patternContracts.filter(Boolean).length;
    safety += Math.round((matched / patternContracts.length) * 8);
  }

  const contraindicationHits = phase1.week
    .flatMap((day) => day.routine.map((item) => item.exerciseId))
    .filter((exerciseId) => contraindicationHit(exerciseId, painAreas)).length;
  if (contraindicationHits === 0) safety += 8;
  else if (contraindicationHits <= 1) safety += 4;

  const shoulderDays = phase1.week.filter((day) =>
    day.title.toLowerCase().includes("shoulders + arms")
  );
  if (!shoulderDays.length) {
    safety += 5;
  } else {
    const shoulderDaysSafe = shoulderDays.every((day) => {
      const mainIds = day.routine
        .filter((item) => item.section === "main")
        .map((item) => item.exerciseId);
      return !mainIds.some((exerciseId) => isChestDominantMain(exerciseId));
    });
    if (shoulderDaysSafe) safety += 5;
  }

  const repsFirstMainAccessory = phase1.week.every((day) =>
    day.routine
      .filter((item) => item.section === "main" || item.section === "accessory")
      .every((item) => {
        if (item.loadType === "timed") return typeof item.durationSec === "number";
        return Boolean(item.reps) && (item.durationSec ?? null) === null;
      })
  );
  if (repsFirstMainAccessory) safety += 4;

  const phaseChanged12 = JSON.stringify(phase1.week) !== JSON.stringify(phase2.week);
  const phaseChanged23 = JSON.stringify(phase2.week) !== JSON.stringify(phase3.week);
  if (phaseChanged12) progression += 4;
  if (phaseChanged23) progression += 4;

  const phase1MainIds = phase1.week.flatMap((day) =>
    day.routine.filter((item) => item.section === "main").map((item) => item.exerciseId)
  );
  const phase2MainIds = phase2.week.flatMap((day) =>
    day.routine.filter((item) => item.section === "main").map((item) => item.exerciseId)
  );
  const phase3MainIds = phase3.week.flatMap((day) =>
    day.routine.filter((item) => item.section === "main").map((item) => item.exerciseId)
  );

  const demand1 = phase1MainIds.reduce((sum, id) => sum + mainDemandScore(id), 0);
  const demand2 = phase2MainIds.reduce((sum, id) => sum + mainDemandScore(id), 0);
  const demand3 = phase3MainIds.reduce((sum, id) => sum + mainDemandScore(id), 0);

  if (demand2 >= demand1) progression += 4;
  if (demand3 >= demand2) progression += 4;

  const changedPhase13Slots = phase1MainIds.filter(
    (id, index) => phase3MainIds[index] && phase3MainIds[index] !== id
  ).length;
  const changedPhase13Ratio =
    phase1MainIds.length > 0 ? changedPhase13Slots / phase1MainIds.length : 0;
  progression += Math.min(5, Math.round(changedPhase13Ratio * 5));

  const weightedMainsPhase1 = phase1MainIds.filter(
    (id) => exerciseById(id)?.loadType === "weighted"
  ).length;
  const weightedMainsPhase3 = phase3MainIds.filter(
    (id) => exerciseById(id)?.loadType === "weighted"
  ).length;
  if (weightedMainsPhase3 >= weightedMainsPhase1) progression += 4;

  const guidanceCases = [
    generateNextTimeGuidance({
      loadType: "weighted",
      prescribedSets: 3,
      prescribedRepsPerSet: 10,
      actualSets: 3,
      actualRepsPerSet: 10,
      difficulty: "easy",
      painLevel: "severe",
    }) === "Next time: reduce range + use lighter load.",
    generateNextTimeGuidance({
      loadType: "weighted",
      prescribedSets: 3,
      prescribedRepsPerSet: 8,
      actualSets: 2,
      actualRepsPerSet: 7,
      difficulty: "failed",
      painLevel: "none",
    }) === "Next time: reduce load 5-10% or drop 1 set.",
    generateNextTimeGuidance({
      loadType: "bodyweight",
      prescribedSets: 3,
      prescribedRepsPerSet: 10,
      actualSets: 3,
      actualRepsPerSet: 8,
      difficulty: "moderate",
      painLevel: "none",
    }) === "Next time: keep load, aim for +2 reps total.",
    generateNextTimeGuidance({
      loadType: "weighted",
      prescribedSets: 3,
      prescribedRepsPerSet: 8,
      actualSets: 3,
      actualRepsPerSet: 30,
      difficulty: "moderate",
      painLevel: "none",
    }) === "Next time: add 20% weight and work in the 8-10 rep range.",
    generateNextTimeGuidance({
      loadType: "weighted",
      prescribedSets: 3,
      prescribedRepsPerSet: 10,
      actualSets: 3,
      actualRepsPerSet: 10,
      difficulty: "easy",
      painLevel: "none",
    }) === "Next time: add small load or reps.",
  ];
  coaching += guidanceCases.filter(Boolean).length * 4;

  const total = design + safety + progression + coaching;
  return { design, safety, progression, coaching, total };
};

describe("competitive benchmark scorecard", () => {
  const scenarios: QuestionnaireData[] = [
    {
      goals: "Improve posture",
      painAreas: [],
      experience: "Beginner",
      equipment: ["none"],
      daysPerWeek: 3,
    },
    {
      goals: "Reduce pain",
      painAreas: ["Shoulders", "Upper back"],
      experience: "Beginner",
      equipment: ["dumbbells", "bands", "machines"],
      daysPerWeek: 3,
    },
    {
      goals: "General fitness",
      painAreas: [],
      experience: "Intermediate",
      equipment: ["dumbbells", "bands"],
      daysPerWeek: 4,
    },
    {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Advanced",
      equipment: ["gym"],
      daysPerWeek: 5,
    },
    {
      goals: "Athletic performance",
      painAreas: ["Lower back", "Hips"],
      experience: "Advanced",
      equipment: ["dumbbells", "bands", "bench"],
      daysPerWeek: 5,
    },
  ];

  test("each anchor scenario clears competitive baseline", () => {
    scenarios.forEach((scenario, index) => {
      const score = scoreCompetitiveBenchmark(scenario);
      if (score.total < 84) {
        throw new Error(
          `Competitive scenario ${index} scored ${score.total}. Breakdown=${JSON.stringify(
            score
          )}`
        );
      }
      expect(score.total).toBeGreaterThanOrEqual(84);
    });
  });

  test("overall average remains best-in-class target", () => {
    const scores = scenarios.map((scenario) => scoreCompetitiveBenchmark(scenario));
    const average = scores.reduce((sum, item) => sum + item.total, 0) / scores.length;
    if (average < 88) {
      throw new Error(`Competitive average ${average.toFixed(1)} below target.`);
    }
    expect(average).toBeGreaterThanOrEqual(88);
  });
});
