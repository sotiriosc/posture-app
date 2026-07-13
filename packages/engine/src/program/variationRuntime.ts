import type { ProgramDay } from "@/lib/types";
import type { WeeklyVariationStateShape } from "@/lib/program/weeklyExecution";

export const resolveVariationPoseFocusTags = <TPoseAnalysis, TAssessmentReport>(params: {
  poseAnalysis?: TPoseAnalysis | null;
  assessmentReport?: TAssessmentReport | null;
  resolvePoseAnalysisFromSources: (params: {
    poseAnalysis?: TPoseAnalysis | null;
    assessmentReport?: TAssessmentReport | null;
  }) => TPoseAnalysis | null | undefined;
  derivePoseFocus: (poseAnalysis: TPoseAnalysis | null | undefined) => {
    focusTags: string[];
  };
  normalizeTagToken: (value: string) => string;
}) => {
  const resolvedPoseAnalysis = params.resolvePoseAnalysisFromSources({
    poseAnalysis: params.poseAnalysis,
    assessmentReport: params.assessmentReport,
  });

  return params.derivePoseFocus(resolvedPoseAnalysis).focusTags
    .map((tag) => params.normalizeTagToken(tag))
    .sort();
};

export const composeSelectionRngSeedToken = <
  TVariationState extends WeeklyVariationStateShape
>(params: {
  baseSeed?: string;
  variationState: TVariationState;
}) =>
  [params.baseSeed, params.variationState?.seedKey]
    .filter((value): value is string => Boolean(value))
    .join("|");

export const composeWeeklyDeterministicSelectionSeedBase = (params: {
  baseSeed?: string;
  phaseIndex: number;
  cycleIndex: number;
  weekIndex: number;
  totalWeekIndex: number;
  daysPerWeek: 3 | 4 | 5;
  goal?: string;
  experience: string;
  availableEquipment: Set<string>;
  painAreas?: string[];
  normalizeTagToken: (value: string) => string;
  normalizeExperienceLevel: (value: string) => string;
}) =>
  params.baseSeed ??
  [
    "weekly",
    String(params.phaseIndex),
    String(params.cycleIndex),
    String(params.weekIndex),
    String(params.totalWeekIndex),
    String(params.daysPerWeek),
    params.normalizeTagToken(params.goal ?? ""),
    params.normalizeExperienceLevel(params.experience),
    [...params.availableEquipment].sort().join(","),
    [...(params.painAreas ?? [])]
      .map((area) => params.normalizeTagToken(area))
      .sort()
      .join(","),
  ].join("|");

export const composeWeeklyDeterministicSelectionSeed = <
  TVariationState extends WeeklyVariationStateShape
>(params: {
  baseSeed: string;
  variationState: TVariationState;
}) =>
  params.variationState?.enabled
    ? `${params.baseSeed}|variation:${params.variationState.seedKey}`
    : params.baseSeed;

export const finalizeGenerationVariationSnapshot = <
  TVariationState extends WeeklyVariationStateShape
>(params: {
  variationState: TVariationState;
  week: ProgramDay[];
  commitVariationSnapshot: (
    variationState: TVariationState,
    week: ProgramDay[]
  ) => void;
}) => {
  params.commitVariationSnapshot(params.variationState, params.week);
};
