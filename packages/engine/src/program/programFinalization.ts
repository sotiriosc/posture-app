import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { UserTrainingState } from "@/lib/phases";
import type { PostGenerationWarning } from "@/lib/program/postGenerationPipeline";
import {
  assembleAdvancedProgressionResult,
  assembleProgram,
  buildProgramConstraintWarnings,
  buildProgramIntelligence,
} from "@/lib/program/programAssembly";
import { attachRoutineItemCoachingMetadata } from "@/lib/program/prescriptionRationale";
import type { ExerciseLog, Program } from "@/lib/types";

export type ProgramConstraintWarning = {
  programId: string;
  phaseName: string | null;
  dayTitle: string;
  kind: "missing" | "violation" | "coverage";
  message: string;
};

const forwardConstraintWarnings = (params: {
  programId: string;
  phaseName: string | null;
  warnings: PostGenerationWarning[];
  pushWarnings: (warnings: ProgramConstraintWarning[]) => void;
}) => {
  const mappedWarnings = buildProgramConstraintWarnings({
    programId: params.programId,
    phaseName: params.phaseName,
    warnings: params.warnings,
  });
  params.pushWarnings(mappedWarnings);
  return mappedWarnings;
};

export const pushConstraintWarningsForProgram = forwardConstraintWarnings;

export const finalizeWeeklyProgramResult = (params: {
  pushWarnings: (warnings: ProgramConstraintWarning[]) => void;
  programId: string;
  phaseName: string | null;
  createdAt: string;
  goalTrack: string | null;
  daysPerWeek: Program["daysPerWeek"];
  phaseIndex: number;
  weekIndex: number;
  totalWeekIndex: number;
  cycleIndex: number;
  nextWeekPlan: NonNullable<Program["nextWeekPlan"]>;
  week: Program["week"];
  questionnaire: QuestionnaireData;
  trainingState: UserTrainingState;
  consistencyRate: number;
  recentLogs?: ExerciseLog[];
  warnings: PostGenerationWarning[];
  templateVersion?: number;
  /** Phase 3: computed ladder state to store in the generated Program. */
  ladderState?: import("@/lib/types").LadderState;
  /** Phase 3.5: computed phase gating state to store in the generated Program. */
  phaseTransitionState?: import("@/lib/types").PhaseTransitionState;
}) => {
  forwardConstraintWarnings({
    programId: params.programId,
    phaseName: params.phaseName,
    warnings: params.warnings,
    pushWarnings: params.pushWarnings,
  });

  const coachedWeek = attachRoutineItemCoachingMetadata({
    week: params.week,
    questionnaire: params.questionnaire,
    phaseIndex: params.phaseIndex,
  });

  const intelligence = buildProgramIntelligence({
    questionnaire: params.questionnaire,
    phaseIndex: params.phaseIndex,
    cycleIndex: params.cycleIndex,
    weekIndex: params.weekIndex,
    week: coachedWeek,
    consistencyRate: params.consistencyRate,
    recentLogs: params.recentLogs,
    trainingState: params.trainingState,
  });

  return assembleProgram({
    programId: params.programId,
    createdAt: params.createdAt,
    goalTrack: params.goalTrack,
    daysPerWeek: params.daysPerWeek,
    phaseIndex: params.phaseIndex,
    weekIndex: params.weekIndex,
    totalWeekIndex: params.totalWeekIndex,
    cycleIndex: params.cycleIndex,
    nextWeekPlan: params.nextWeekPlan,
    week: coachedWeek,
    intelligence,
    templateVersion: params.templateVersion,
    ladderState: params.ladderState,
    phaseTransitionState: params.phaseTransitionState,
  });
};

export const finalizeAdvancedProgressionResult = (params: {
  pushWarnings: (warnings: ProgramConstraintWarning[]) => void;
  warnings: PostGenerationWarning[];
  program: Program;
  questionnaire: QuestionnaireData;
  phaseIndex: number;
  cycleIndex: number;
  weekIndex: number;
  week: Program["week"];
  complianceRate: number;
  painFlag: boolean;
  fatigueFlag: boolean;
  painSeverity: "low" | "medium" | "high";
  trainingState: UserTrainingState;
  recentLogs?: ExerciseLog[];
  optimizerResult: Parameters<typeof assembleAdvancedProgressionResult>[0]["optimizerResult"];
}) => {
  forwardConstraintWarnings({
    programId: params.program.id,
    phaseName: params.program.phaseName ?? null,
    warnings: params.warnings,
    pushWarnings: params.pushWarnings,
  });

  const coachedWeek = attachRoutineItemCoachingMetadata({
    week: params.week,
    questionnaire: params.questionnaire,
    phaseIndex: params.phaseIndex,
  });

  return assembleAdvancedProgressionResult({
    program: params.program,
    questionnaire: params.questionnaire,
    phaseIndex: params.phaseIndex,
    cycleIndex: params.cycleIndex,
    weekIndex: params.weekIndex,
    week: coachedWeek,
    complianceRate: params.complianceRate,
    painFlag: params.painFlag,
    fatigueFlag: params.fatigueFlag,
    painSeverity: params.painSeverity,
    trainingState: params.trainingState,
    recentLogs: params.recentLogs,
    optimizerResult: params.optimizerResult,
  });
};
