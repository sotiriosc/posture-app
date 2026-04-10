import type { Equipment } from "@/lib/equipment";
import type { PostGenerationRepairResult } from "@/lib/program/postGenerationPipeline";
import type {
  WeeklyRuntimeContext,
  WeeklySelectionContextShape,
} from "@/lib/program/weeklyExecution";
import type { RandomFn } from "@/lib/seededRng";
import type { ProgramDay } from "@/lib/types";

export type WeeklyRepairContext<
  TSelectionContext,
  TCapabilityMode extends string = string
> = {
  available: Set<Equipment>;
  selectionContext: TSelectionContext;
  capabilityMode: TCapabilityMode;
  selectionSeed?: string;
  selectionRng?: RandomFn;
  previousWeek?: ProgramDay[];
};

type NormalizeWeekPolicy<TSelectionContext> = (params: {
  week: ProgramDay[];
  available: Set<Equipment>;
  selectionContext: TSelectionContext;
}) => ProgramDay[];

type SubstituteWeekPolicy<TRepairContext> = (params: {
  week: ProgramDay[];
  daysPerWeek: 3 | 4 | 5;
  context: TRepairContext;
}) => ProgramDay[];

type RepairWeekPolicy<TRepairContext> = (params: {
  week: ProgramDay[];
  daysPerWeek: 3 | 4 | 5;
  context: TRepairContext;
}) => PostGenerationRepairResult;

type FeedbackSafetyPolicy<TRepairContext> = (params: {
  week: ProgramDay[];
  daysPerWeek: 3 | 4 | 5;
  context: TRepairContext;
}) => ProgramDay[];

type AttachPrepPolicy<
  TSelectionContext extends WeeklySelectionContextShape,
  TCapabilityMode extends string
> = (params: {
  week: ProgramDay[];
  available: Set<Equipment>;
  capabilityMode: TCapabilityMode;
  painAreas: string[];
  painSeverity: TSelectionContext["painSeverity"];
  goal: string;
  experienceLevel: TSelectionContext["experienceLevel"];
  poseFocusTags: Set<string>;
}) => ProgramDay[];

export const resolveWeeklyRepairContext = <
  TSelectionContext,
  TCapabilityMode extends string
>(params: {
  availableEquipment: Set<Equipment>;
  selectionContext: TSelectionContext;
  capabilityMode: TCapabilityMode;
  selectionSeed?: string;
  selectionRng?: RandomFn;
  previousWeek?: ProgramDay[];
}): WeeklyRepairContext<TSelectionContext, TCapabilityMode> => ({
  available: params.availableEquipment,
  selectionContext: params.selectionContext,
  capabilityMode: params.capabilityMode,
  selectionSeed: params.selectionSeed,
  selectionRng: params.selectionRng,
  previousWeek: params.previousWeek,
});

export const buildWeeklyPipelineCallbacks = <
  TSelectionContext extends WeeklySelectionContextShape,
  TRepairContext,
  TCapabilityMode extends string
>(params: {
  runtimeContext: WeeklyRuntimeContext<TSelectionContext>;
  repairContext: TRepairContext;
  normalizeWeekForSelectionContext: NormalizeWeekPolicy<TSelectionContext>;
  applyFeedbackDrivenSubstitutions: SubstituteWeekPolicy<TRepairContext>;
  applyDayCurriculumConstraints: RepairWeekPolicy<TRepairContext>;
  applyFinalFeedbackSafetyPass: FeedbackSafetyPolicy<TRepairContext>;
  attachStructuredPrepBlocksToWeek: AttachPrepPolicy<
    TSelectionContext,
    TCapabilityMode
  >;
}) => ({
  normalizeWeek: (week: ProgramDay[]) =>
    params.normalizeWeekForSelectionContext({
      week,
      available: params.runtimeContext.availableEquipment,
      selectionContext: params.runtimeContext.selectionContext,
    }),
  substituteWeek: (week: ProgramDay[]) =>
    params.applyFeedbackDrivenSubstitutions({
      week,
      daysPerWeek: params.runtimeContext.normalizedDaysPerWeek,
      context: params.repairContext,
    }),
  repairWeek: (week: ProgramDay[]) =>
    params.applyDayCurriculumConstraints({
      week,
      daysPerWeek: params.runtimeContext.normalizedDaysPerWeek,
      context: params.repairContext,
    }),
  applyFeedbackSafety: (week: ProgramDay[]) =>
    params.applyFinalFeedbackSafetyPass({
      week,
      daysPerWeek: params.runtimeContext.normalizedDaysPerWeek,
      context: params.repairContext,
    }),
  attachPrep: (week: ProgramDay[]) =>
    params.attachStructuredPrepBlocksToWeek({
      week,
      available: params.runtimeContext.availableEquipment,
      capabilityMode:
        params.runtimeContext.capabilityMode as unknown as TCapabilityMode,
      painAreas: params.runtimeContext.selectionContext.painAreas,
      painSeverity: params.runtimeContext.selectionContext.painSeverity,
      goal: params.runtimeContext.selectionContext.goal,
      experienceLevel: params.runtimeContext.selectionContext.experienceLevel,
      poseFocusTags: params.runtimeContext.selectionContext.poseFocusTags,
    }),
});
