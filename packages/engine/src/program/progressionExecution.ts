import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { Equipment } from "@/lib/equipment";
import { normalizeEquipmentSelection } from "@/lib/equipment";
import { computeEquipmentCapability } from "@/lib/engine/equipmentCapability";
import {
  advanceWeekWithProgressionPipeline,
  type PostGenerationRepairResult,
} from "@/lib/program/postGenerationPipeline";
import type { ProgressionTarget } from "@/lib/program/progressionTransition";
import { resolveGeneratedProgramTransitionState } from "@/lib/program/progressionTransition";
import type { ExerciseLog, Program, ProgramDay } from "@/lib/types";

type ProgressionCapabilityMode = "noneOnly" | "bandOnly" | "hasLoad";

export type ProgressionRuntimeContext<TSelectionContext> = {
  availableEquipment: Set<Equipment>;
  capabilityMode: ProgressionCapabilityMode;
  selectionContext: TSelectionContext;
  daysPerWeek: 3 | 4 | 5;
  phaseName: string;
  resolvedTarget: Pick<ProgressionTarget, "phaseIndex" | "cycleIndex" | "weekIndex">;
};

export const resolveProgressionFeedbackInputs = <TFeedbackSummary>(params: {
  currentProgram: Program;
  recentLogs: ExerciseLog[];
  feedbackSummaryByExercise?: TFeedbackSummary;
  summarizeFeedbackFromLogs: (recentLogs: ExerciseLog[]) => TFeedbackSummary;
  buildRecentlyUsedExerciseIdSet: (params?: {
    recentLogs?: ExerciseLog[];
    previousWeek?: ProgramDay[];
  }) => Set<string>;
}) => ({
  resolvedFeedbackSummaryByExercise:
    params.feedbackSummaryByExercise ??
    params.summarizeFeedbackFromLogs(params.recentLogs),
  recentlyUsedExerciseIds: params.buildRecentlyUsedExerciseIdSet({
    recentLogs: params.recentLogs,
    previousWeek: params.currentProgram.week,
  }),
});

export const buildBaseProgressedProgram = <TProgram extends Pick<Program, "week">>(params: {
  currentWeek: ProgramDay[];
  target: ProgressionTarget;
  buildProgramForTarget: (target: ProgressionTarget) => TProgram;
  retryWithCycleIndexOnSameWeek?: number;
}) => {
  const program = params.buildProgramForTarget(params.target);
  if (
    typeof params.retryWithCycleIndexOnSameWeek !== "number" ||
    JSON.stringify(program.week) !== JSON.stringify(params.currentWeek)
  ) {
    return program;
  }

  return params.buildProgramForTarget({
    ...params.target,
    cycleIndex: params.retryWithCycleIndexOnSameWeek,
  });
};

export const resolveProgressionRuntimeContext = <TSelectionContext, TFeedbackSummary>(
  params: {
    questionnaire: QuestionnaireData;
    program: Program;
    target: ProgressionTarget;
    feedbackSummaryByExercise: TFeedbackSummary;
    recentlyUsedExerciseIds: Set<string>;
    buildSelectionContext: (params: {
      phaseIndex: number;
      phaseName: string;
      capabilityMode: ProgressionCapabilityMode;
      feedbackSummaryByExercise: TFeedbackSummary;
      recentlyUsedExerciseIds: Set<string>;
    }) => TSelectionContext;
    getPhaseName: (phaseIndex: number) => string;
    normalizeDaysPerWeek: (daysPerWeek: Program["daysPerWeek"]) => 3 | 4 | 5;
  }
): ProgressionRuntimeContext<TSelectionContext> => {
  const equipmentContext = normalizeEquipmentSelection(params.questionnaire.equipment);
  const capability = computeEquipmentCapability(params.questionnaire.equipment);
  const capabilityMode: ProgressionCapabilityMode = capability.hasLoad
    ? "hasLoad"
    : capability.hasBand
    ? "bandOnly"
    : "noneOnly";
  const resolvedTarget = resolveGeneratedProgramTransitionState({
    program: params.program,
    fallbackTarget: params.target,
  });
  const phaseName =
    params.program.phaseName ?? params.getPhaseName(resolvedTarget.phaseIndex);

  return {
    availableEquipment: equipmentContext.available,
    capabilityMode,
    selectionContext: params.buildSelectionContext({
      phaseIndex: resolvedTarget.phaseIndex,
      phaseName,
      capabilityMode,
      feedbackSummaryByExercise: params.feedbackSummaryByExercise,
      recentlyUsedExerciseIds: params.recentlyUsedExerciseIds,
    }),
    daysPerWeek: params.normalizeDaysPerWeek(params.program.daysPerWeek),
    phaseName,
    resolvedTarget,
  };
};

export const runApprovedProgressionPipeline = <TSelectionContext>(params: {
  currentWeek: ProgramDay[];
  proposedProgram: Program;
  questionnaire: QuestionnaireData;
  runtimeContext: ProgressionRuntimeContext<TSelectionContext>;
  runMaterialWeekChange: (
    currentWeek: ProgramDay[],
    nextWeek: ProgramDay[],
    runtimeContext: ProgressionRuntimeContext<TSelectionContext>
  ) => ProgramDay[];
  runNoveltyRemap: (
    currentWeek: ProgramDay[],
    nextWeek: ProgramDay[],
    runtimeContext: ProgressionRuntimeContext<TSelectionContext>
  ) => ProgramDay[];
  runDemandProgression: (
    previousWeek: ProgramDay[],
    nextWeek: ProgramDay[],
    runtimeContext: ProgressionRuntimeContext<TSelectionContext>
  ) => ProgramDay[];
  dedupeWeek: (
    week: ProgramDay[],
    runtimeContext: ProgressionRuntimeContext<TSelectionContext>
  ) => ProgramDay[];
  repairWeek: (
    week: ProgramDay[],
    runtimeContext: ProgressionRuntimeContext<TSelectionContext>
  ) => PostGenerationRepairResult;
  normalizeWeek: (
    week: ProgramDay[],
    runtimeContext: ProgressionRuntimeContext<TSelectionContext>
  ) => ProgramDay[];
  attachPrep: (
    week: ProgramDay[],
    runtimeContext: ProgressionRuntimeContext<TSelectionContext>
  ) => ProgramDay[];
  extraRepair?: (
    week: ProgramDay[],
    runtimeContext: ProgressionRuntimeContext<TSelectionContext>
  ) => ProgramDay[];
}) =>
  advanceWeekWithProgressionPipeline({
    currentWeek: params.currentWeek,
    proposedWeek: params.proposedProgram.week,
    questionnaire: params.questionnaire,
    availableEquipment: params.runtimeContext.availableEquipment,
    phaseIndex: params.runtimeContext.resolvedTarget.phaseIndex,
    cycleIndex: params.runtimeContext.resolvedTarget.cycleIndex,
    enforceMaterialWeekChange: (currentWeek, nextWeek) =>
      params.runMaterialWeekChange(currentWeek, nextWeek, params.runtimeContext),
    remapWeekForNovelty: (currentWeek, nextWeek) =>
      params.runNoveltyRemap(currentWeek, nextWeek, params.runtimeContext),
    enforceProgressiveDemand: (previousWeek, nextWeek) =>
      params.runDemandProgression(previousWeek, nextWeek, params.runtimeContext),
    dedupeWeek: (week) => params.dedupeWeek(week, params.runtimeContext),
    repairWeek: (week) => params.repairWeek(week, params.runtimeContext),
    normalizeWeek: (week) => params.normalizeWeek(week, params.runtimeContext),
    attachPrep: (week) => params.attachPrep(week, params.runtimeContext),
    extraRepair: params.extraRepair
      ? (week) => params.extraRepair!(week, params.runtimeContext)
      : undefined,
  });
