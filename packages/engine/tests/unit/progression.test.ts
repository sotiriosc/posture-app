import { describe, expect, test } from "vitest";
import { getProgressionRecommendation } from "@/lib/progression";
import { exerciseById } from "@/lib/exercises";
import type { ExerciseLog } from "@/lib/types";

const baseLog = (overrides: Partial<ExerciseLog>): ExerciseLog => ({
  id: "log-1",
  userId: null,
  sessionId: "session-1",
  exerciseId: overrides.exerciseId ?? "dumbbell-rows",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  loadType: overrides.loadType ?? "weighted",
  unit: "lb",
  weight: overrides.weight ?? 50,
  reps: overrides.reps ?? 10,
  repsBySet: overrides.repsBySet ?? null,
  setsPlanned: overrides.setsPlanned ?? 3,
  setsCompleted: overrides.setsCompleted ?? 3,
  durationSec: null,
  rpe: null,
  felt: overrides.felt ?? "easy",
  notes: null,
  computedVolume: null,
  source: "local",
  deletedAt: null,
});

describe("progression engine", () => {
  test("weighted easy -> small weight increase", () => {
    const exercise = exerciseById("dumbbell-rows");
    if (!exercise) throw new Error("Missing exercise");
    const log = baseLog({
      weight: 50,
      reps: null,
      repsBySet: [10, 10, 10],
      felt: "easy",
    });
    const rec = getProgressionRecommendation({
      exercise,
      logs: [log],
      feedback: { rating: "easy" },
      prescription: { sets: "3", reps: "8-12" },
    });
    expect(rec?.recommendedNext.weight).toBeGreaterThan(50);
  });

  test("weighted hard -> keep weight and nudge reps", () => {
    const exercise = exerciseById("dumbbell-rows");
    if (!exercise) throw new Error("Missing exercise");
    const log = baseLog({ weight: 50, reps: 8, felt: "hard" });
    const rec = getProgressionRecommendation({
      exercise,
      logs: [log],
      feedback: { rating: "hard" },
      prescription: { sets: "3", reps: "8-12" },
    });
    expect(rec?.recommendedNext.weight).toBe(50);
    expect(rec?.recommendedNext.reps).toBeGreaterThanOrEqual(8);
  });

  test("weighted overshoot -> increase weight and reset near lower target reps", () => {
    const exercise = exerciseById("dumbbell-rows");
    if (!exercise) throw new Error("Missing exercise");
    const log = baseLog({
      weight: 50,
      reps: 10,
      setsPlanned: 3,
      setsCompleted: 3,
      felt: "easy",
    });
    const rec = getProgressionRecommendation({
      exercise,
      logs: [log],
      feedback: { rating: "easy" },
      prescription: { sets: "3", reps: "6-8" },
    });
    expect(rec?.reason.toLowerCase()).toContain("overshot");
    expect((rec?.recommendedNext.weight ?? 0)).toBeGreaterThan(50);
    expect(rec?.recommendedNext.reps).toBe(6);
  });

  test("missed set target -> reason reflects set shortfall", () => {
    const exercise = exerciseById("dumbbell-rows");
    if (!exercise) throw new Error("Missing exercise");
    const log = baseLog({
      weight: 50,
      reps: 10,
      setsPlanned: 3,
      setsCompleted: 2,
      felt: "moderate",
    });
    const rec = getProgressionRecommendation({
      exercise,
      logs: [log],
      feedback: { rating: "moderate" },
      prescription: { sets: "3", reps: "6-8" },
    });
    expect(rec?.reason.toLowerCase()).toContain("completed 2 sets");
  });

  test("bodyweight moderate -> add reps", () => {
    const exercise = exerciseById("pushup");
    if (!exercise) throw new Error("Missing exercise");
    const log = baseLog({
      exerciseId: "pushup",
      loadType: "bodyweight",
      weight: null,
      unit: null,
      reps: null,
      repsBySet: [10, 10, 10],
      felt: "moderate",
    });
    const rec = getProgressionRecommendation({
      exercise,
      logs: [log],
      feedback: { rating: "moderate" },
      prescription: { sets: "3", reps: "8-12" },
    });
    expect(rec?.recommendedNext.reps).toBeGreaterThanOrEqual(10);
  });

  test("pain -> safety flag", () => {
    const exercise = exerciseById("dumbbell-rows");
    if (!exercise) throw new Error("Missing exercise");
    const log = baseLog({ felt: "pain" });
    const rec = getProgressionRecommendation({
      exercise,
      logs: [log],
      feedback: { rating: "pain" },
      prescription: { sets: "3", reps: "8-12" },
    });
    expect(rec?.safetyFlag).toBe(true);
  });

  test("timed moderate -> increase duration slightly", () => {
    const exercise = exerciseById("plank");
    if (!exercise) throw new Error("Missing exercise");
    const log = baseLog({
      exerciseId: "plank",
      loadType: "timed",
      unit: null,
      weight: null,
      reps: null,
      repsBySet: null,
      setsPlanned: 3,
      setsCompleted: 3,
      durationSec: 30,
      felt: "moderate",
    });
    const rec = getProgressionRecommendation({
      exercise,
      logs: [log],
      feedback: { rating: "moderate" },
      prescription: { sets: "3", durationSec: 30 },
    });
    expect(rec?.recommendedNext.durationSeconds).toBeGreaterThanOrEqual(35);
  });
});
