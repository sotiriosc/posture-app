export type SessionRecord = {
  id: string;
  userId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  routineId: string | null;
  durationSec: number | null;
  notes: string | null;
  source: "local" | "cloud";
  deletedAt: string | null;
};

export type ExerciseLog = {
  id: string;
  userId: string | null;
  sessionId: string;
  exerciseId: string;
  createdAt: string;
  updatedAt: string;
  loadType: "weighted" | "bodyweight" | "timed" | "assisted";
  unit: "lb" | "kg" | null;
  weight: number | null;
  reps: number | null;
  repsBySet: number[] | null;
  setsPlanned: number | null;
  setsCompleted: number | null;
  durationSec: number | null;
  rpe: number | null;
  felt: "easy" | "good" | "hard" | null;
  notes: string | null;
  computedVolume: number | null;
  source: "local" | "cloud";
  deletedAt: string | null;
};

export type LogPrefs = {
  schemaVersion: number;
  timerPrefs?: { workSeconds: number; restSeconds: number };
  feedbackByExercise?: Record<string, "easy" | "good" | "hard">;
};

export type ProgramRoutineItem = {
  exerciseId: string;
  sets: string | number | null;
  reps?: string | null;
  durationSec?: number | null;
  restSec?: number | null;
  loadType: "weighted" | "bodyweight" | "timed" | "assisted";
  notes?: string | null;
  cues?: string[] | null;
};

export type ProgramDay = {
  dayIndex: number;
  title: string;
  focusTags: string[];
  routine: ProgramRoutineItem[];
};

export type Program = {
  id: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  goalTrack: string | null;
  daysPerWeek: 3 | 4 | 5;
  estimatedSessionMinutesRange: { min: 45; max: 60 };
  week: ProgramDay[];
  source: "local" | "cloud";
  deletedAt: string | null;
};

export type ProgramProgress = {
  programId: string;
  lastCompletedDayIndex: number | null;
  nextDayIndex: number;
  completedDayIndices: number[];
  updatedAt: string;
};
