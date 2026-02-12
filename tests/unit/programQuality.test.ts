import { describe, expect, test } from "vitest";
import { generateWeeklyProgram } from "@/lib/program";
import { exerciseById } from "@/lib/exercises";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { normalizeEquipmentSelection, isExerciseEligible } from "@/lib/equipment";

type ScoreBreakdown = {
  structure: number;
  progression: number;
  specificity: number;
  variety: number;
  practicalFit: number;
  total: number;
};

const expectedMainCount = (experience: string) => {
  if (experience === "Advanced") return 4;
  if (experience === "Intermediate") return 3;
  return 2;
};

const mainDemandScore = (id: string) => {
  const exercise = exerciseById(id);
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

const contraindicationHit = (id: string, painAreas: string[]) => {
  const exercise = exerciseById(id);
  if (!exercise?.contraindications?.length || !painAreas.length) return false;
  const text = exercise.contraindications.join(" ").toLowerCase();
  return painAreas.some((area) => text.includes(area.toLowerCase()));
};

const preferredTagsByPain: Record<string, string[]> = {
  shoulders: ["scap", "upper-back", "core", "t-spine"],
  "upper back": ["upper-back", "scap", "t-spine"],
  "lower back": ["core", "tva", "posterior", "hinge"],
  hips: ["hips", "glutes", "mobility", "balance"],
  knees: ["glutes", "hinge", "balance", "core"],
  neck: ["t-spine", "scap", "breath", "core"],
};

const scoreProgramQuality = (input: QuestionnaireData): ScoreBreakdown => {
  const phase1 = generateWeeklyProgram(input, "quality-p1", {
    phaseIndex: 1,
    weekIndex: 1,
    cycleIndex: 1,
  });
  const phase2 = generateWeeklyProgram(input, "quality-p2", {
    phaseIndex: 2,
    weekIndex: 1,
    cycleIndex: 2,
  });

  let structure = 0;
  let progression = 0;
  let specificity = 0;
  let variety = 0;
  let practicalFit = 0;

  const expectedMain = expectedMainCount(input.experience);
  const available = normalizeEquipmentSelection(input.equipment).available;

  const allDaysHaveSections = phase1.week.every((day) => {
    const sections = new Set(day.routine.map((item) => item.section));
    return (
      sections.has("warmup") &&
      sections.has("main") &&
      sections.has("accessory") &&
      sections.has("cooldown")
    );
  });
  if (allDaysHaveSections) structure += 8;

  const allMainCountsCorrect = phase1.week.every(
    (day) => day.routine.filter((item) => item.section === "main").length === expectedMain
  );
  if (allMainCountsCorrect) structure += 7;

  const allMainCategoriesCorrect = phase1.week.every((day) =>
    day.routine
      .filter((item) => item.section === "main")
      .every((item) => exerciseById(item.exerciseId)?.category === "main")
  );
  if (allMainCategoriesCorrect) structure += 5;

  const allDaysUnique = phase1.week.every((day) => {
    const ids = day.routine.map((item) => item.exerciseId);
    return new Set(ids).size === ids.length;
  });
  if (allDaysUnique) {
    structure += 5;
    variety += 8;
  }

  const phaseChanged = JSON.stringify(phase1.week) !== JSON.stringify(phase2.week);
  if (phaseChanged) progression += 8;

  const phase1MainIds = phase1.week.flatMap((day) =>
    day.routine.filter((item) => item.section === "main").map((item) => item.exerciseId)
  );
  const phase2MainIds = phase2.week.flatMap((day) =>
    day.routine.filter((item) => item.section === "main").map((item) => item.exerciseId)
  );
  const changedMainSlots = phase1MainIds.filter(
    (id, idx) => phase2MainIds[idx] && phase2MainIds[idx] !== id
  ).length;
  const changedRatio =
    phase1MainIds.length > 0 ? changedMainSlots / phase1MainIds.length : 0;
  progression += Math.min(10, Math.round(changedRatio * 10));

  const phase1Demand = phase1MainIds.reduce((sum, id) => sum + mainDemandScore(id), 0);
  const phase2Demand = phase2MainIds.reduce((sum, id) => sum + mainDemandScore(id), 0);
  if (phase2Demand >= phase1Demand) progression += 7;

  const allEligible = phase1.week.every((day) =>
    day.routine.every((item) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return false;
      return isExerciseEligible(exercise, available);
    })
  );
  if (allEligible) practicalFit += 8;

  if (available.has("dumbbells") && available.has("bands")) {
    const dumbbellMainsPerDay = phase1.week.every((day) =>
      day.routine
        .filter((item) => item.section === "main")
        .some((item) => exerciseById(item.exerciseId)?.equipment.includes("dumbbells"))
    );
    if (dumbbellMainsPerDay) practicalFit += 7;
  } else {
    practicalFit += 7;
  }

  const painAreas = input.painAreas.map((area) => area.toLowerCase());
  if (!painAreas.length) {
    specificity += 20;
  } else {
    const preferredTags = new Set(
      painAreas.flatMap((area) => preferredTagsByPain[area] ?? [])
    );
    const chosenExercises = phase1.week.flatMap((day) => day.routine.map((item) => item.exerciseId));
    const tagHits = chosenExercises.reduce((sum, id) => {
      const exercise = exerciseById(id);
      if (!exercise) return sum;
      return (
        sum +
        exercise.tags.reduce((n, tag) => (preferredTags.has(tag) ? n + 1 : n), 0)
      );
    }, 0);
    const contraindicationHits = chosenExercises.filter((id) =>
      contraindicationHit(id, painAreas)
    ).length;
    if (tagHits > 0) specificity += 12;
    if (contraindicationHits === 0) specificity += 8;
  }

  const weekCounts = new Map<string, number>();
  phase1.week
    .flatMap((day) => day.routine.map((item) => item.exerciseId))
    .forEach((id) => weekCounts.set(id, (weekCounts.get(id) ?? 0) + 1));
  const maxRepeat = Math.max(...Array.from(weekCounts.values()));
  if (maxRepeat <= 2) variety += 7;
  else if (maxRepeat <= 3) variety += 5;
  else variety += 2;

  const total = structure + progression + specificity + variety + practicalFit;
  return { structure, progression, specificity, variety, practicalFit, total };
};

describe("program quality scorecard", () => {
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
      experience: "Intermediate",
      equipment: ["bands"],
      daysPerWeek: 4,
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
      equipment: ["none"],
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

  test("each anchor scenario clears minimum quality bar", () => {
    scenarios.forEach((scenario, index) => {
      const score = scoreProgramQuality(scenario);
      if (score.total < 80) {
        throw new Error(
          `Scenario ${index} scored ${score.total}. Breakdown: ${JSON.stringify(score)}`
        );
      }
      expect(score.total).toBeGreaterThanOrEqual(80);
    });
  });

  test("overall average quality remains high", () => {
    const scores = scenarios.map((scenario) => scoreProgramQuality(scenario));
    const avg = scores.reduce((sum, item) => sum + item.total, 0) / scores.length;
    if (avg < 85) {
      throw new Error(`Average quality ${avg.toFixed(1)} below threshold.`);
    }
    expect(avg).toBeGreaterThanOrEqual(85);
  });
});
