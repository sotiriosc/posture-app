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
});
