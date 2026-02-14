import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { AssessmentReport } from "@/lib/assessmentEngine";
import type { PoseAnalysis } from "@/lib/poseAnalyzer";
import type {
  ExerciseLog,
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
  poseAnalysis?: PoseAnalysis;
  assessmentReport?: AssessmentReport;
  history?: EngineHistory;
  prefs?: Record<string, unknown>;
  nowIso: string;
};

export type EngineGenerator = (signals: EngineSignals) => Program;
