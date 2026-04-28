import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { AssessmentReport } from "@/lib/assessmentEngine";
import type { PoseAnalysis } from "@/lib/poseAnalyzer";
import type {
  ExerciseLog,
  LogPrefs,
  Program,
  ProgramProgress,
  SessionRecord,
} from "@/lib/types";

export type EngineHistory = {
  sessions?: SessionRecord[];
  exerciseLogs?: ExerciseLog[];
  programProgress?: ProgramProgress | null;
};

export type EngineSignals = {
  questionnaire: QuestionnaireData;
  poseAnalysis?: PoseAnalysis | null;
  assessmentReport?: AssessmentReport | null;
  history?: EngineHistory;
  prefs?: LogPrefs | null;
  nowIso: string;
};

export type EngineMode = "weekly" | "nextCycle" | "nextPhase";

export type WeeklyEngineRequest = {
  mode: "weekly";
  signals: EngineSignals;
  nextProgramId: string;
  currentProgram?: Program | null;
  initialVariationSeed?: string | null;
  phaseIndex?: number;
  weekIndex?: number;
  cycleIndex?: number;
  totalWeekIndex?: number;
};

export type NextCycleEngineRequest = {
  mode: "nextCycle";
  signals: EngineSignals;
  currentProgram: Program;
  nextProgramId: string;
};

export type NextPhaseEngineRequest = {
  mode: "nextPhase";
  signals: EngineSignals;
  currentProgram: Program;
  nextProgramId: string;
};

export type EngineRequest =
  | WeeklyEngineRequest
  | NextCycleEngineRequest
  | NextPhaseEngineRequest;

export type EngineTargetState = {
  phaseIndex: number;
  cycleIndex: number;
  weekIndex: number;
  totalWeekIndex: number;
};

export type EngineProgressionSnapshot = {
  complianceRate: number;
  painFlag: boolean;
  fatigueFlag: boolean;
  completedSessionsCount: number;
  completedWeeksCount: number;
  recentLogCount: number;
  recentSessionCount: number;
};

export type EngineDebugInfo = {
  mode: EngineMode;
  seed: string;
  settingsHash: string;
  target: EngineTargetState;
  progression: EngineProgressionSnapshot;
};

export type EngineProgramResult =
  | {
      status: "generated" | "advanced";
      program: Program;
      seed: string;
      debug: EngineDebugInfo;
    }
  | {
      status: "repeat" | "blocked";
      message: string;
      seed: string;
      debug: EngineDebugInfo;
    };

export type EngineGenerator = (request: EngineRequest) => EngineProgramResult;
