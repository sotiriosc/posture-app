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
  sessionFeedback?: "easy" | "moderate" | "hard" | "pain" | null;
  sessionPainLocation?: PainLocation | null;
  sessionFeedbackNotes?: string | null;
  source: "local" | "cloud";
  deletedAt: string | null;
};

export type PainLocation =
  | "neck"
  | "shoulder"
  | "upper back"
  | "lower back"
  | "hips"
  | "knees"
  | "other";

export type ExerciseLog = {
  id: string;
  userId: string | null;
  sessionId: string;
  exerciseId: string;
  originalExerciseId?: string | null;
  substitutedExerciseId?: string | null;
  programId?: string | null;
  dayIndex?: number | null;
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
  felt: "easy" | "moderate" | "hard" | "pain" | null;
  painLocation?: PainLocation | null;
  feedbackNotes?: string | null;
  notes: string | null;
  computedVolume: number | null;
  source: "local" | "cloud";
  deletedAt: string | null;
};

export type ExerciseFeedback = {
  rating: "easy" | "moderate" | "hard" | "pain";
  painLocation?: PainLocation | null;
  notes?: string | null;
};

export type LogPrefs = {
  schemaVersion: number;
  timerPrefs?: { workSeconds: number; restSeconds: number };
  feedbackByExercise?: Record<string, ExerciseFeedback>;
  substitutionByExercise?: Record<string, string>;
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
  phase?: {
    name: string;
    weekIndex: number;
    weekCount: number;
    goal: string;
  };
  nextWeekPlan?: {
    summary: string;
    change: string;
    reason: string;
  };
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
