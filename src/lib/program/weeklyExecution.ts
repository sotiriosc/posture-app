import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { Equipment } from "@/lib/equipment";
import { normalizeEquipmentSelection } from "@/lib/equipment";
import { computeEquipmentCapability } from "@/lib/engine/equipmentCapability";
import {
  finalizeGeneratedWeek,
  type PostGenerationRepairResult,
} from "@/lib/program/postGenerationPipeline";
import { composeSelectionRngSeedToken } from "@/lib/program/variationRuntime";
import { createSeededRng, type RandomFn } from "@/lib/seededRng";
import type { ExerciseLog, Program, ProgramDay } from "@/lib/types";

type WeeklyCapabilityMode = "noneOnly" | "bandOnly" | "hasLoad";

export type WeeklyVariationStateShape = {
  enabled: boolean;
  seedKey: string;
} | null;

export type WeeklySelectionContextShape = {
  painAreas: string[];
  painSeverity: "low" | "medium" | "high";
  goal: string;
  experienceLevel: string;
  poseFocusTags: Set<string>;
  variationState: WeeklyVariationStateShape;
};

export type WeeklyRuntimeContext<
  TSelectionContext extends WeeklySelectionContextShape,
  TExperienceProfile = unknown,
  TTrainingState = unknown,
  TNextWeekPlan = unknown,
  TVariationState extends WeeklyVariationStateShape = TSelectionContext["variationState"]
> = {
  normalizedDaysPerWeek: 3 | 4 | 5;
  availableEquipment: Set<Equipment>;
  capabilityMode: WeeklyCapabilityMode;
  phaseIndex: number;
  weekIndex: number;
  totalWeekIndex: number;
  cycleIndex: number;
  phaseName: string;
  experienceProfile: TExperienceProfile;
  trainingState: TTrainingState;
  nextWeekPlan: TNextWeekPlan;
  selectionContext: TSelectionContext;
  variationState: TVariationState;
  selectionRng?: RandomFn;
};

export const resolveWeeklyFeedbackInputs = <TFeedbackSummary>(params: {
  recentLogs?: ExerciseLog[];
  previousWeek?: ProgramDay[];
  feedbackSummaryByExercise?: TFeedbackSummary;
  summarizeFeedbackFromLogs: (recentLogs: ExerciseLog[]) => TFeedbackSummary;
  buildRecentlyUsedExerciseIdSet: (params?: {
    recentLogs?: ExerciseLog[];
    previousWeek?: ProgramDay[];
  }) => Set<string>;
}) => {
  const recentLogs = params.recentLogs ?? [];
  return {
    resolvedFeedbackSummaryByExercise:
      params.feedbackSummaryByExercise ??
      params.summarizeFeedbackFromLogs(recentLogs),
    recentlyUsedExerciseIds: params.buildRecentlyUsedExerciseIdSet({
      recentLogs,
      previousWeek: params.previousWeek,
    }),
  };
};

export const resolveWeeklyRuntimeContext = <
  TSelectionContext extends WeeklySelectionContextShape,
  TFeedbackSummary,
  TVariationOptions,
  TVariationState extends WeeklyVariationStateShape,
  TExperienceProfile,
  TTrainingState,
  TNextWeekPlan
>(params: {
  questionnaire: QuestionnaireData;
  feedbackSummaryByExercise: TFeedbackSummary;
  recentlyUsedExerciseIds: Set<string>;
  poseFocusTagsForVariation: string[];
  phaseIndex?: number;
  weekIndex?: number;
  totalWeekIndex?: number;
  cycleIndex?: number;
  seed?: string;
  variation?: TVariationOptions;
  trainingState?: TTrainingState;
  normalizeDaysPerWeek: (daysPerWeek: Program["daysPerWeek"]) => 3 | 4 | 5;
  resolveVariationState: (params: {
    questionnaire: QuestionnaireData;
    available: Set<Equipment>;
    daysPerWeek: 3 | 4 | 5;
    phaseIndex: number;
    poseFocusTags: string[];
    baseSeed?: string;
    variation?: TVariationOptions;
  }) => TVariationState;
  getExperienceProfile: (
    experience: QuestionnaireData["experience"],
    goal: string,
    phaseIndex: number
  ) => TExperienceProfile;
  getPhaseName: (phaseIndex: number) => string;
  buildSelectionContext: (params: {
    phaseIndex: number;
    capabilityMode: WeeklyCapabilityMode;
    phaseName: string;
    feedbackSummaryByExercise: TFeedbackSummary;
    recentlyUsedExerciseIds: Set<string>;
    variationState: TVariationState;
  }) => TSelectionContext;
  createTrainingState: (phaseIndex: number) => TTrainingState;
  buildNextWeekPlan: (params: {
    phaseName: string;
    trainingState: TTrainingState;
    painSeverity: TSelectionContext["painSeverity"];
    complianceRate: number;
    painFlag: boolean;
    fatigueFlag: boolean;
  }) => TNextWeekPlan;
}): WeeklyRuntimeContext<
  TSelectionContext,
  TExperienceProfile,
  TTrainingState,
  TNextWeekPlan,
  TVariationState
> => {
  const normalizedDaysPerWeek = params.normalizeDaysPerWeek(
    params.questionnaire.daysPerWeek
  );
  const equipmentContext = normalizeEquipmentSelection(
    params.questionnaire.equipment
  );
  const capability = computeEquipmentCapability(params.questionnaire.equipment);
  const capabilityMode: WeeklyCapabilityMode = capability.hasLoad
    ? "hasLoad"
    : capability.hasBand
    ? "bandOnly"
    : "noneOnly";
  const phaseIndex = params.phaseIndex ?? 1;
  const weekIndex = params.weekIndex ?? 1;
  const totalWeekIndex = params.totalWeekIndex ?? 1;
  const cycleIndex = params.cycleIndex ?? 1;
  const phaseName = params.getPhaseName(phaseIndex);
  const variationState = params.resolveVariationState({
    questionnaire: params.questionnaire,
    available: equipmentContext.available,
    daysPerWeek: normalizedDaysPerWeek,
    phaseIndex,
    poseFocusTags: params.poseFocusTagsForVariation,
    baseSeed: params.seed,
    variation: params.variation,
  });
  const selectionContext = params.buildSelectionContext({
    phaseIndex,
    capabilityMode,
    phaseName,
    feedbackSummaryByExercise: params.feedbackSummaryByExercise,
    recentlyUsedExerciseIds: params.recentlyUsedExerciseIds,
    variationState,
  });
  const composedSelectionSeed = composeSelectionRngSeedToken({
    baseSeed: params.seed,
    variationState,
  });
  const selectionRng = composedSelectionSeed
    ? createSeededRng(composedSelectionSeed)
    : undefined;
  const trainingState =
    params.trainingState ?? params.createTrainingState(phaseIndex);

  return {
    normalizedDaysPerWeek,
    availableEquipment: equipmentContext.available,
    capabilityMode,
    phaseIndex,
    weekIndex,
    totalWeekIndex,
    cycleIndex,
    phaseName,
    experienceProfile: params.getExperienceProfile(
      params.questionnaire.experience,
      params.questionnaire.goals ?? "Improve posture",
      phaseIndex
    ),
    trainingState,
    nextWeekPlan: params.buildNextWeekPlan({
      phaseName,
      trainingState,
      painSeverity: selectionContext.painSeverity,
      complianceRate: 0,
      painFlag: params.questionnaire.painAreas.length > 0,
      fatigueFlag: false,
    }),
    selectionContext,
    variationState,
    selectionRng,
  };
};

export const runWeeklyGenerationPipeline = (params: {
  initialWeek: ProgramDay[];
  normalizeWeek: (week: ProgramDay[]) => ProgramDay[];
  substituteWeek: (week: ProgramDay[]) => ProgramDay[];
  repairWeek: (week: ProgramDay[]) => PostGenerationRepairResult;
  applyFeedbackSafety: (week: ProgramDay[]) => ProgramDay[];
  attachPrep: (week: ProgramDay[]) => ProgramDay[];
}) =>
  finalizeGeneratedWeek({
    week: params.initialWeek,
    normalizeWeek: params.normalizeWeek,
    substituteWeek: params.substituteWeek,
    repairWeek: params.repairWeek,
    applyFeedbackSafety: params.applyFeedbackSafety,
    attachPrep: params.attachPrep,
  });
