import { requireExerciseById } from "@/lib/exerciseCatalog";
import { getProgressionRecommendation } from "@/lib/progression";
import type { ExerciseLog } from "@/lib/types";

const baseLog = (overrides: Partial<ExerciseLog>): ExerciseLog => ({
  id: overrides.id ?? "log",
  userId: null,
  sessionId: overrides.sessionId ?? "session",
  exerciseId: overrides.exerciseId ?? "exercise",
  originalExerciseId: null,
  substitutedExerciseId: null,
  programId: null,
  dayIndex: 0,
  createdAt: overrides.createdAt ?? new Date("2026-01-01T00:00:00.000Z").toISOString(),
  updatedAt: overrides.updatedAt ?? new Date("2026-01-01T00:00:00.000Z").toISOString(),
  loadType: overrides.loadType ?? "bodyweight",
  unit: overrides.unit ?? null,
  weight: overrides.weight ?? null,
  reps: overrides.reps ?? null,
  repsBySet: overrides.repsBySet ?? null,
  setsPlanned: overrides.setsPlanned ?? 3,
  setsCompleted: overrides.setsCompleted ?? 3,
  durationSec: overrides.durationSec ?? null,
  workSecondsUsed: overrides.workSecondsUsed ?? null,
  restSecondsUsed: overrides.restSecondsUsed ?? null,
  rpe: overrides.rpe ?? null,
  felt: overrides.felt ?? "moderate",
  painLocation: overrides.painLocation ?? null,
  feedbackNotes: overrides.feedbackNotes ?? null,
  notes: overrides.notes ?? null,
  computedVolume: overrides.computedVolume ?? null,
  source: "local",
  deletedAt: null,
});

type CaseDef = {
  label: string;
  exerciseId: string;
  logs: ExerciseLog[];
  prescription?: {
    sets?: string | number | null;
    reps?: string | null;
    durationSec?: number | null;
    restSec?: number | null;
  };
};

const cases: CaseDef[] = [
  {
    label: "weighted-hard-hold-load",
    exerciseId: "db-bench-press",
    logs: [
      baseLog({
        id: "w-hard-1",
        exerciseId: "db-bench-press",
        loadType: "weighted",
        unit: "lb",
        weight: 60,
        repsBySet: [10, 10, 9],
        felt: "hard",
        rpe: 8,
      }),
    ],
    prescription: { sets: 3, reps: "8-12", restSec: 90 },
  },
  {
    label: "weighted-pain-regress",
    exerciseId: "db-bench-press",
    logs: [
      baseLog({
        id: "w-pain-1",
        exerciseId: "db-bench-press",
        loadType: "weighted",
        unit: "lb",
        weight: 65,
        repsBySet: [9, 8, 8],
        felt: "pain",
        painLocation: "shoulder",
      }),
    ],
    prescription: { sets: 3, reps: "8-12", restSec: 90 },
  },
  {
    label: "band-gate-not-met",
    exerciseId: "split-stance-row",
    logs: [
      baseLog({
        id: "b-fail-1",
        exerciseId: "split-stance-row",
        loadType: "assisted",
        repsBySet: [12, 12, 12],
        felt: "easy",
      }),
      baseLog({
        id: "b-fail-2",
        exerciseId: "split-stance-row",
        loadType: "assisted",
        repsBySet: [11, 11, 11],
        felt: "moderate",
      }),
    ],
    prescription: { sets: 3, reps: "10-12", restSec: 75 },
  },
  {
    label: "band-gate-met",
    exerciseId: "split-stance-row",
    logs: [
      baseLog({
        id: "b-pass-1",
        exerciseId: "split-stance-row",
        loadType: "assisted",
        repsBySet: [12, 12, 12],
        felt: "easy",
      }),
      baseLog({
        id: "b-pass-2",
        exerciseId: "split-stance-row",
        loadType: "assisted",
        repsBySet: [12, 12, 12],
        felt: "moderate",
      }),
    ],
    prescription: { sets: 3, reps: "10-12", restSec: 75 },
  },
  {
    label: "timed-gate-not-met",
    exerciseId: "plank",
    logs: [
      baseLog({
        id: "t-fail-1",
        exerciseId: "plank",
        loadType: "timed",
        durationSec: 30,
        felt: "moderate",
      }),
      baseLog({
        id: "t-fail-2",
        exerciseId: "plank",
        loadType: "timed",
        durationSec: 25,
        felt: "easy",
      }),
    ],
    prescription: { sets: 3, durationSec: 30, restSec: 60 },
  },
  {
    label: "timed-gate-met",
    exerciseId: "plank",
    logs: [
      baseLog({
        id: "t-pass-1",
        exerciseId: "plank",
        loadType: "timed",
        durationSec: 30,
        felt: "easy",
      }),
      baseLog({
        id: "t-pass-2",
        exerciseId: "plank",
        loadType: "timed",
        durationSec: 30,
        felt: "moderate",
      }),
    ],
    prescription: { sets: 3, durationSec: 30, restSec: 60 },
  },
];

cases.forEach((entry) => {
  const exercise = requireExerciseById(entry.exerciseId);
  const rec = getProgressionRecommendation({
    exercise,
    logs: entry.logs,
    prescription: entry.prescription,
  });

  console.log(`[progressionCoachSmoke] ${entry.label}`);
  if (!rec) {
    console.log("- recommendation: null");
    return;
  }
  console.log(`- exercise: ${exercise.name} (${exercise.loadType})`);
  console.log(`- recommendedNext: ${JSON.stringify(rec.recommendedNext)}`);
  console.log(`- reason: ${rec.reason}`);
  console.log(`- coachNote: ${rec.coachNote ?? "--"}`);
  console.log(`- safetyFlag: ${rec.safetyFlag ? "true" : "false"}`);
});
