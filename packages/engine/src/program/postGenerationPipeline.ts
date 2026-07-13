import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { Equipment } from "@/lib/equipment";
import { optimizePhaseWeek } from "@/lib/phaseOptimizer";
import type { ProgramDay, ProgramRoutineItem } from "@/lib/types";

export type PostGenerationWarning = {
  dayTitle: string;
  kind: "missing" | "violation" | "coverage";
  message: string;
};

export type PostGenerationRepairResult = {
  week: ProgramDay[];
  warnings: PostGenerationWarning[];
};

export const normalizeWeekForProgramConstraints = <TSelectionContext>(params: {
  week: ProgramDay[];
  available: Set<Equipment>;
  selectionContext: TSelectionContext;
  resolveEligibilityAvailabilityForDay: (
    dayTitle: string,
    available: Set<Equipment>
  ) => Set<Equipment>;
  ensureEligibleItem: (
    item: ProgramRoutineItem,
    available: Set<Equipment>,
    selectionContext: TSelectionContext,
    dayTitle?: string
  ) => ProgramRoutineItem;
  ensureDistinctRoutine: (
    day: ProgramDay,
    available: Set<Equipment>,
    selectionContext: TSelectionContext
  ) => ProgramDay;
}) =>
  params.week
    .map((day) => {
      const availableForDay = params.resolveEligibilityAvailabilityForDay(
        day.title,
        params.available
      );
      return {
        ...day,
        routine: day.routine.map((item) =>
          params.ensureEligibleItem(
            item,
            availableForDay,
            params.selectionContext,
            day.title
          )
        ),
      };
    })
    .map((day) =>
      params.ensureDistinctRoutine(day, params.available, params.selectionContext)
    );

export const finalizeGeneratedWeek = (params: {
  week: ProgramDay[];
  normalizeWeek: (week: ProgramDay[]) => ProgramDay[];
  substituteWeek: (week: ProgramDay[]) => ProgramDay[];
  repairWeek: (week: ProgramDay[]) => PostGenerationRepairResult;
  applyFeedbackSafety: (week: ProgramDay[]) => ProgramDay[];
  attachPrep: (week: ProgramDay[]) => ProgramDay[];
}) => {
  const feedbackSubstitutedWeek = params.substituteWeek(params.week);
  const eligibleWeek = params.normalizeWeek(feedbackSubstitutedWeek);
  const constraintAdjusted = params.repairWeek(eligibleWeek);
  const repairedWeek = params.normalizeWeek(constraintAdjusted.week);
  const feedbackSafetyWeek = params.normalizeWeek(
    params.applyFeedbackSafety(repairedWeek)
  );
  const stabilizedWeek = params.repairWeek(feedbackSafetyWeek);

  return {
    week: params.attachPrep(params.normalizeWeek(stabilizedWeek.week)),
    warnings: [...constraintAdjusted.warnings, ...stabilizedWeek.warnings],
  };
};

export const advanceWeekWithProgressionPipeline = (params: {
  currentWeek: ProgramDay[];
  proposedWeek: ProgramDay[];
  questionnaire: QuestionnaireData;
  availableEquipment: Set<Equipment>;
  phaseIndex: number;
  cycleIndex: number;
  enforceMaterialWeekChange: (
    currentWeek: ProgramDay[],
    nextWeek: ProgramDay[]
  ) => ProgramDay[];
  remapWeekForNovelty: (
    currentWeek: ProgramDay[],
    nextWeek: ProgramDay[]
  ) => ProgramDay[];
  enforceProgressiveDemand: (
    previousWeek: ProgramDay[],
    nextWeek: ProgramDay[]
  ) => ProgramDay[];
  dedupeWeek: (week: ProgramDay[]) => ProgramDay[];
  repairWeek: (week: ProgramDay[]) => PostGenerationRepairResult;
  normalizeWeek: (week: ProgramDay[]) => ProgramDay[];
  attachPrep: (week: ProgramDay[]) => ProgramDay[];
  extraRepair?: (week: ProgramDay[]) => ProgramDay[];
}) => {
  const materiallyChangedWeek = params.enforceMaterialWeekChange(
    params.currentWeek,
    params.proposedWeek
  );
  const remappedWeek = params.remapWeekForNovelty(
    params.currentWeek,
    materiallyChangedWeek
  );
  const optimizerResult = optimizePhaseWeek({
    proposedWeek: remappedWeek,
    previousWeek: params.currentWeek,
    questionnaire: params.questionnaire,
    availableEquipment: params.availableEquipment,
    phaseIndex: params.phaseIndex,
    cycleIndex: params.cycleIndex,
  });
  const progressedWeek = params.enforceProgressiveDemand(
    params.currentWeek,
    optimizerResult.week
  );
  const distinctWeek = params.dedupeWeek(progressedWeek);
  const constrainedWeek = params.repairWeek(distinctWeek);
  const repairedWeek = params.normalizeWeek(constrainedWeek.week);
  const extraRepairedWeek = params.extraRepair
    ? params.extraRepair(repairedWeek)
    : repairedWeek;

  return {
    week: params.attachPrep(extraRepairedWeek),
    warnings: constrainedWeek.warnings,
    optimizerResult,
  };
};
