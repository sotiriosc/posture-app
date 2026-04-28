import type { UserTrainingState } from "@/lib/phases";
import type { PostGenerationRepairResult } from "@/lib/program/postGenerationPipeline";
import type { ProgressionRuntimeContext } from "@/lib/program/progressionExecution";
import type { ProgramDay } from "@/lib/types";

type ProgressionSelectionContextShape = {
  painAreas: string[];
  painSeverity: "low" | "medium" | "high";
  goal: string;
  experienceLevel: string;
  poseFocusTags: Set<string>;
};

type MaterialWeekChangePolicy<TSelectionContext> = (params: {
  currentWeek: ProgramDay[];
  nextWeek: ProgramDay[];
  cycleIndex: number;
  available: ProgressionRuntimeContext<TSelectionContext>["availableEquipment"];
  selectionContext: TSelectionContext;
}) => ProgramDay[];

type NoveltyRemapPolicy<TSelectionContext> = (params: {
  currentWeek: ProgramDay[];
  nextWeek: ProgramDay[];
  available: ProgressionRuntimeContext<TSelectionContext>["availableEquipment"];
  cycleIndex: number;
  phaseIndex: number;
  painAreas: string[];
  selectionContext: TSelectionContext;
}) => ProgramDay[];

type DemandProgressionPolicy<TSelectionContext, TExperienceLevel extends string> = (params: {
  previousWeek: ProgramDay[];
  nextWeek: ProgramDay[];
  available: ProgressionRuntimeContext<TSelectionContext>["availableEquipment"];
  phaseIndex: number;
  cycleIndex: number;
  experienceLevel: TExperienceLevel;
  trainingState: UserTrainingState;
  selectionContext: TSelectionContext;
}) => ProgramDay[];

type DedupeWeekPolicy<TSelectionContext> = (params: {
  week: ProgramDay[];
  available: ProgressionRuntimeContext<TSelectionContext>["availableEquipment"];
  selectionContext: TSelectionContext;
}) => ProgramDay[];

type RepairWeekPolicy<TSelectionContext> = (params: {
  week: ProgramDay[];
  daysPerWeek: ProgressionRuntimeContext<TSelectionContext>["daysPerWeek"];
  context: {
    available: ProgressionRuntimeContext<TSelectionContext>["availableEquipment"];
    selectionContext: TSelectionContext;
    capabilityMode: ProgressionRuntimeContext<TSelectionContext>["capabilityMode"];
    previousWeek: ProgramDay[];
  };
}) => PostGenerationRepairResult;

type NormalizeWeekPolicy<TSelectionContext> = (params: {
  week: ProgramDay[];
  available: ProgressionRuntimeContext<TSelectionContext>["availableEquipment"];
  selectionContext: TSelectionContext;
}) => ProgramDay[];

type AttachPrepPolicy<TSelectionContext extends ProgressionSelectionContextShape> = (params: {
  week: ProgramDay[];
  available: ProgressionRuntimeContext<TSelectionContext>["availableEquipment"];
  capabilityMode: ProgressionRuntimeContext<TSelectionContext>["capabilityMode"];
  painAreas: string[];
  painSeverity: TSelectionContext["painSeverity"];
  goal: string;
  experienceLevel: TSelectionContext["experienceLevel"];
  poseFocusTags: Set<string>;
}) => ProgramDay[];

type ExtraRepairPolicy<TSelectionContext> = (params: {
  week: ProgramDay[];
  daysPerWeek: ProgressionRuntimeContext<TSelectionContext>["daysPerWeek"];
  available: ProgressionRuntimeContext<TSelectionContext>["availableEquipment"];
  selectionContext: TSelectionContext;
  capabilityMode: ProgressionRuntimeContext<TSelectionContext>["capabilityMode"];
  phaseIndex: number;
}) => ProgramDay[];

export const buildProgressionPipelineCallbacks = <
  TSelectionContext extends ProgressionSelectionContextShape,
  TExperienceLevel extends string
>(params: {
  questionnairePainAreas: string[];
  previousWeek: ProgramDay[];
  trainingState: UserTrainingState;
  experienceLevel: TExperienceLevel;
  enforceMaterialWeekChange: MaterialWeekChangePolicy<TSelectionContext>;
  remapWeekForProgressiveNovelty: NoveltyRemapPolicy<TSelectionContext>;
  enforceProgressiveDemand: DemandProgressionPolicy<
    TSelectionContext,
    TExperienceLevel
  >;
  dedupeWeekForSelectionContext: DedupeWeekPolicy<TSelectionContext>;
  applyDayCurriculumConstraints: RepairWeekPolicy<TSelectionContext>;
  normalizeWeekForSelectionContext: NormalizeWeekPolicy<TSelectionContext>;
  attachStructuredPrepBlocksToWeek: AttachPrepPolicy<TSelectionContext>;
  extraRepair?: ExtraRepairPolicy<TSelectionContext>;
}) => ({
  runMaterialWeekChange: (
    currentWeek: ProgramDay[],
    nextWeek: ProgramDay[],
    runtimeContext: ProgressionRuntimeContext<TSelectionContext>
  ) =>
    params.enforceMaterialWeekChange({
      currentWeek,
      nextWeek,
      cycleIndex: runtimeContext.resolvedTarget.cycleIndex,
      available: runtimeContext.availableEquipment,
      selectionContext: runtimeContext.selectionContext,
    }),
  runNoveltyRemap: (
    currentWeek: ProgramDay[],
    nextWeek: ProgramDay[],
    runtimeContext: ProgressionRuntimeContext<TSelectionContext>
  ) =>
    params.remapWeekForProgressiveNovelty({
      currentWeek,
      nextWeek,
      available: runtimeContext.availableEquipment,
      cycleIndex: runtimeContext.resolvedTarget.cycleIndex,
      phaseIndex: runtimeContext.resolvedTarget.phaseIndex,
      painAreas: params.questionnairePainAreas,
      selectionContext: runtimeContext.selectionContext,
    }),
  runDemandProgression: (
    previousWeek: ProgramDay[],
    nextWeek: ProgramDay[],
    runtimeContext: ProgressionRuntimeContext<TSelectionContext>
  ) =>
    params.enforceProgressiveDemand({
      previousWeek,
      nextWeek,
      available: runtimeContext.availableEquipment,
      phaseIndex: runtimeContext.resolvedTarget.phaseIndex,
      cycleIndex: runtimeContext.resolvedTarget.cycleIndex,
      experienceLevel: params.experienceLevel,
      trainingState: params.trainingState,
      selectionContext: runtimeContext.selectionContext,
    }),
  dedupeWeek: (
    week: ProgramDay[],
    runtimeContext: ProgressionRuntimeContext<TSelectionContext>
  ) =>
    params.dedupeWeekForSelectionContext({
      week,
      available: runtimeContext.availableEquipment,
      selectionContext: runtimeContext.selectionContext,
    }),
  repairWeek: (
    week: ProgramDay[],
    runtimeContext: ProgressionRuntimeContext<TSelectionContext>
  ) =>
    params.applyDayCurriculumConstraints({
      week,
      daysPerWeek: runtimeContext.daysPerWeek,
      context: {
        available: runtimeContext.availableEquipment,
        selectionContext: runtimeContext.selectionContext,
        capabilityMode: runtimeContext.capabilityMode,
        previousWeek: params.previousWeek,
      },
    }),
  normalizeWeek: (
    week: ProgramDay[],
    runtimeContext: ProgressionRuntimeContext<TSelectionContext>
  ) =>
    params.normalizeWeekForSelectionContext({
      week,
      available: runtimeContext.availableEquipment,
      selectionContext: runtimeContext.selectionContext,
    }),
  attachPrep: (
    week: ProgramDay[],
    runtimeContext: ProgressionRuntimeContext<TSelectionContext>
  ) =>
    params.attachStructuredPrepBlocksToWeek({
      week,
      available: runtimeContext.availableEquipment,
      capabilityMode: runtimeContext.capabilityMode,
      painAreas: runtimeContext.selectionContext.painAreas,
      painSeverity: runtimeContext.selectionContext.painSeverity,
      goal: runtimeContext.selectionContext.goal,
      experienceLevel: runtimeContext.selectionContext.experienceLevel,
      poseFocusTags: runtimeContext.selectionContext.poseFocusTags,
    }),
  extraRepair: params.extraRepair
    ? (
        week: ProgramDay[],
        runtimeContext: ProgressionRuntimeContext<TSelectionContext>
      ) =>
        params.extraRepair!({
          week,
          daysPerWeek: runtimeContext.daysPerWeek,
          available: runtimeContext.availableEquipment,
          selectionContext: runtimeContext.selectionContext,
          capabilityMode: runtimeContext.capabilityMode,
          phaseIndex: runtimeContext.resolvedTarget.phaseIndex,
        })
    : undefined,
});
