import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { buildMovementProfile } from "@/lib/movementProfile";
import { buildPhaseObjective } from "@/lib/phaseObjectives";
import {
  buildNextWeekPlan,
  getPhaseMetaByIndex,
  getPhaseProfile,
  type UserTrainingState,
} from "@/lib/phases";
import { buildSessionAdaptation } from "@/lib/sessionAdaptation";
import type { ExerciseLog, Program, ProgramDay } from "@/lib/types";
import type { PostGenerationWarning } from "@/lib/program/postGenerationPipeline";

type PainSeverity = "low" | "medium" | "high";

type ProgramOptimizerSummary = {
  summary: string;
  priorities: string[];
  changedSlots: number;
  totalSlots: number;
  exerciseReasons: Record<string, string[]>;
};

type ProgramOptimizerUsageSummary = Pick<
  ProgramOptimizerSummary,
  "changedSlots" | "totalSlots"
>;

const HIGH_PAIN_SUMMARY_CLAUSE =
  "This plan prioritizes comfortable range of motion and control to restore movement before growth.";

const applyHighPainSummaryClause = (
  plan: NonNullable<Program["nextWeekPlan"]>,
  painSeverity: PainSeverity
) => {
  if (painSeverity !== "high") return plan;
  if (plan.summary.includes(HIGH_PAIN_SUMMARY_CLAUSE)) return plan;
  return {
    ...plan,
    summary: `${plan.summary} ${HIGH_PAIN_SUMMARY_CLAUSE}`.trim(),
  };
};

export const buildProgramPhaseMetadata = (params: {
  phaseIndex: number;
  cycleIndex: number;
  weekIndex: number;
}) => {
  const phaseMeta = getPhaseMetaByIndex(params.phaseIndex);
  const profile = getPhaseProfile(params.phaseIndex);

  return {
    phaseMeta,
    phase: {
      name: phaseMeta.phaseName,
      phaseIndex: params.phaseIndex,
      cycleIndex: params.cycleIndex,
      weekIndex: params.weekIndex,
      weekCount: params.weekIndex,
      goal: profile.description,
    },
  };
};

export const buildProgramNextWeekPlan = (params: {
  complianceRate: number;
  painFlag: boolean;
  fatigueFlag: boolean;
  phaseName: string;
  trainingState: UserTrainingState;
  painSeverity: PainSeverity;
  optimizerSummary?: string;
}) => {
  const nextWeekPlan = buildNextWeekPlan({
    complianceRate: params.complianceRate,
    painFlag: params.painFlag,
    fatigueFlag: params.fatigueFlag,
    phaseName: params.phaseName,
    trainingState: params.trainingState,
  });

  return applyHighPainSummaryClause(
    params.optimizerSummary
      ? {
          ...nextWeekPlan,
          change: `${nextWeekPlan.change} ${params.optimizerSummary}`,
        }
      : nextWeekPlan,
    params.painSeverity
  );
};

export const buildProgramIntelligence = (params: {
  questionnaire: QuestionnaireData;
  phaseIndex: number;
  cycleIndex: number;
  weekIndex: number;
  week: ProgramDay[];
  consistencyRate: number;
  recentLogs?: ExerciseLog[];
  trainingState?: UserTrainingState;
  optimizerReport?: ProgramOptimizerUsageSummary;
}) => {
  const {
    questionnaire,
    phaseIndex,
    cycleIndex,
    weekIndex,
    week,
    consistencyRate,
    recentLogs = [],
    trainingState,
    optimizerReport,
  } = params;

  const movementProfile = buildMovementProfile({
    questionnaire,
    recentLogs,
    consistencyRate,
  });
  const phaseObjective = buildPhaseObjective({
    phaseIndex,
    cycleIndex,
    weekIndex,
    movementProfile,
  });
  const sessionAdaptation = buildSessionAdaptation({
    movementProfile,
    trainingState,
    changedSlots: optimizerReport?.changedSlots ?? 0,
    totalSlots: optimizerReport?.totalSlots ?? 0,
    week,
  });

  return {
    movementProfile,
    phaseObjective,
    sessionAdaptation,
  } satisfies Pick<Program, "movementProfile" | "phaseObjective" | "sessionAdaptation">;
};

export const buildPhaseOptimizerReport = (
  optimizerResult: ProgramOptimizerSummary
) => ({
  summary: optimizerResult.summary,
  priorities: optimizerResult.priorities,
  changedSlots: optimizerResult.changedSlots,
  totalSlots: optimizerResult.totalSlots,
  exerciseReasons: optimizerResult.exerciseReasons,
});

export const buildProgramConstraintWarnings = (params: {
  programId: string;
  phaseName: string | null;
  warnings: PostGenerationWarning[];
}) =>
  params.warnings.map((warning) => ({
    programId: params.programId,
    phaseName: params.phaseName,
    dayTitle: warning.dayTitle,
    kind: warning.kind,
    message: warning.message,
  }));

export const assembleProgram = (params: {
  programId: string;
  createdAt: string;
  updatedAt?: string;
  goalTrack: string | null;
  daysPerWeek: Program["daysPerWeek"];
  phaseIndex: number;
  weekIndex: number;
  totalWeekIndex: number;
  cycleIndex: number;
  nextWeekPlan: NonNullable<Program["nextWeekPlan"]>;
  week: ProgramDay[];
  intelligence: Pick<Program, "movementProfile" | "phaseObjective" | "sessionAdaptation">;
  templateVersion?: number;
  estimatedSessionMinutesRange?: Program["estimatedSessionMinutesRange"];
  userId?: string | null;
  source?: Program["source"];
  deletedAt?: string | null;
  /** Phase 3: computed ladder state to persist on the Program. */
  ladderState?: import("@/lib/types").LadderState;
  /** Phase 3.5: computed phase gating state to persist on the Program. */
  phaseTransitionState?: import("@/lib/types").PhaseTransitionState;
  /** Phase 4: assessment snapshots to persist on the Program. */
  assessmentHistory?: import("@/lib/types").AssessmentSnapshot[];
  /** Phase 4: per-tag lifecycle state to persist on the Program. */
  focusTagLifecycle?: Record<string, import("@/lib/types").FocusTagLifecycleState>;
  /** Phase 5: phase transition history to persist on the Program. */
  phaseHistory?: import("@/lib/types").PhaseTransitionRecord[];
}) => {
  const { phaseMeta, phase } = buildProgramPhaseMetadata({
    phaseIndex: params.phaseIndex,
    cycleIndex: params.cycleIndex,
    weekIndex: params.weekIndex,
  });

  return {
    id: params.programId,
    userId: params.userId ?? null,
    createdAt: params.createdAt,
    updatedAt: params.updatedAt ?? params.createdAt,
    templateVersion: params.templateVersion,
    goalTrack: params.goalTrack,
    daysPerWeek: params.daysPerWeek,
    estimatedSessionMinutesRange: params.estimatedSessionMinutesRange ?? {
      min: 45,
      max: 60,
    },
    phaseIndex: phaseMeta.phaseIndex,
    phaseName: phaseMeta.phaseName,
    weekIndex: params.weekIndex,
    totalWeekIndex: params.totalWeekIndex,
    cycleIndex: params.cycleIndex,
    phase,
    nextWeekPlan: params.nextWeekPlan,
    ...params.intelligence,
    week: params.week,
    ...(params.ladderState ? { ladderState: params.ladderState } : {}),
    ...(params.phaseTransitionState ? { phaseTransitionState: params.phaseTransitionState } : {}),
    ...(params.assessmentHistory ? { assessmentHistory: params.assessmentHistory } : {}),
    ...(params.focusTagLifecycle ? { focusTagLifecycle: params.focusTagLifecycle } : {}),
    ...(params.phaseHistory ? { phaseHistory: params.phaseHistory } : {}),
    source: params.source ?? "local",
    deletedAt: params.deletedAt ?? null,
  } satisfies Program;
};

export const assembleAdvancedProgressionResult = (params: {
  program: Program;
  questionnaire: QuestionnaireData;
  phaseIndex: number;
  cycleIndex: number;
  weekIndex: number;
  week: ProgramDay[];
  complianceRate: number;
  painFlag: boolean;
  fatigueFlag: boolean;
  painSeverity: PainSeverity;
  trainingState: UserTrainingState;
  recentLogs?: ExerciseLog[];
  optimizerResult: ProgramOptimizerSummary;
}) => {
  const { phaseMeta } = buildProgramPhaseMetadata({
    phaseIndex: params.phaseIndex,
    cycleIndex: params.cycleIndex,
    weekIndex: params.weekIndex,
  });
  const nextWeekPlan = buildProgramNextWeekPlan({
    complianceRate: params.complianceRate,
    painFlag: params.painFlag,
    fatigueFlag: params.fatigueFlag,
    phaseName: phaseMeta.phaseName,
    trainingState: params.trainingState,
    painSeverity: params.painSeverity,
    optimizerSummary: params.optimizerResult.summary,
  });
  const intelligence = buildProgramIntelligence({
    questionnaire: params.questionnaire,
    phaseIndex: params.phaseIndex,
    cycleIndex: params.cycleIndex,
    weekIndex: params.weekIndex,
    week: params.week,
    consistencyRate: params.complianceRate,
    recentLogs: params.recentLogs,
    trainingState: params.trainingState,
    optimizerReport: {
      changedSlots: params.optimizerResult.changedSlots,
      totalSlots: params.optimizerResult.totalSlots,
    },
  });

  return {
    status: "advanced" as const,
    program: {
      ...params.program,
      week: params.week,
      nextWeekPlan,
      ...intelligence,
      phaseOptimizerReport: buildPhaseOptimizerReport(params.optimizerResult),
    },
  };
};
