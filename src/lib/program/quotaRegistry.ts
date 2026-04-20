import type { Exercise } from "@/lib/exercises";
import type { ProgramDay, ProgramRoutineItem } from "@/lib/types";

export type WeeklyQuotaCategory =
  | "upperRegion"
  | "lowerRegion"
  | "coreRegion"
  | "chest"
  | "back"
  | "quads"
  | "posteriorChain"
  | "core"
  | "delts"
  | "arms"
  | "calves"
  | "horizontalPull"
  | "horizontalPullTrue"
  | "verticalPull"
  | "verticalPullTrue"
  | "verticalPullSurrogate"
  | "pushCompound"
  | "hinge"
  | "squat"
  | "unilateralLower"
  | "carry"
  | "coreStability"
  | "chestIsolation"
  | "rearDeltIsolation"
  | "adductors"
  | "tibialis"
  | "antiRotation";

export type WeeklyQuotaPriority = "must" | "should" | "optional";

export type WeeklyQuotaTarget = {
  min: number;
  target?: number;
  max?: number;
  priority: WeeklyQuotaPriority;
};

export type WeeklyQuotaAuditEntry = WeeklyQuotaTarget & {
  hits: number;
  deficit: number;
  met: boolean;
};

export type WeeklyQuotaAudit = {
  daysPerWeek: 3 | 4 | 5;
  phase: "activation" | "skill" | "growth";
  experience: "beginner" | "intermediate" | "advanced";
  targets: Record<WeeklyQuotaCategory, WeeklyQuotaTarget>;
  hits: Record<WeeklyQuotaCategory, number>;
  audits: Record<WeeklyQuotaCategory, WeeklyQuotaAuditEntry>;
  missingMustHitCategories: WeeklyQuotaCategory[];
  underHitShouldCategories: WeeklyQuotaCategory[];
  optionalOpportunityCategories: WeeklyQuotaCategory[];
};

export const WEEKLY_QUOTA_CATEGORY_ORDER: WeeklyQuotaCategory[] = [
  "upperRegion",
  "lowerRegion",
  "coreRegion",
  "chest",
  "back",
  "quads",
  "posteriorChain",
  "core",
  "delts",
  "arms",
  "calves",
  "horizontalPull",
  "horizontalPullTrue",
  "verticalPull",
  "verticalPullTrue",
  "verticalPullSurrogate",
  "pushCompound",
  "hinge",
  "squat",
  "unilateralLower",
  "carry",
  "coreStability",
  "chestIsolation",
  "rearDeltIsolation",
  "adductors",
  "tibialis",
  "antiRotation",
];

type WeeklyQuotaResolutionParams = {
  daysPerWeek: 3 | 4 | 5;
  phase: "activation" | "skill" | "growth";
  experience: "beginner" | "intermediate" | "advanced";
};

const trainingQuotaSections = new Set<NonNullable<ProgramRoutineItem["section"]>>([
  "activation",
  "main",
  "accessory",
]);

const createEmptyTargets = () =>
  WEEKLY_QUOTA_CATEGORY_ORDER.reduce(
    (accumulator, category) => {
      accumulator[category] = { min: 0, priority: "optional" };
      return accumulator;
    },
    {} as Record<WeeklyQuotaCategory, WeeklyQuotaTarget>
  );

const createEmptyHits = () =>
  WEEKLY_QUOTA_CATEGORY_ORDER.reduce(
    (accumulator, category) => {
      accumulator[category] = 0;
      return accumulator;
    },
    {} as Record<WeeklyQuotaCategory, number>
  );

const applyThreeDayBaseTargets = (
  targets: Record<WeeklyQuotaCategory, WeeklyQuotaTarget>
) => {
  targets.upperRegion = { min: 2, priority: "must" };
  targets.lowerRegion = { min: 1, priority: "must" };
  targets.coreRegion = { min: 1, priority: "must" };
  targets.chest = { min: 2, target: 3, priority: "must" };
  targets.back = { min: 2, target: 3, priority: "must" };
  targets.quads = { min: 1, target: 2, priority: "must" };
  targets.posteriorChain = { min: 1, target: 2, priority: "must" };
  targets.core = { min: 2, target: 3, priority: "must" };
  targets.delts = { min: 1, target: 2, priority: "should" };
  targets.arms = { min: 1, target: 2, priority: "should" };
  targets.calves = { min: 1, target: 1, priority: "should" };
  targets.horizontalPull = { min: 1, target: 2, priority: "must" };
  targets.verticalPull = { min: 1, target: 1, priority: "must" };
  targets.pushCompound = { min: 1, target: 1, priority: "must" };
  targets.hinge = { min: 1, target: 1, priority: "must" };
  targets.squat = { min: 1, target: 1, priority: "must" };
  targets.unilateralLower = { min: 1, target: 1, priority: "must" };
  targets.carry = { min: 1, target: 1, priority: "optional" };
  targets.coreStability = { min: 1, target: 2, priority: "should" };
  targets.chestIsolation = { min: 1, max: 2, priority: "optional" };
  targets.rearDeltIsolation = { min: 1, max: 2, priority: "optional" };
  targets.adductors = { min: 1, priority: "optional" };
  targets.tibialis = { min: 1, priority: "optional" };
  targets.antiRotation = { min: 1, target: 2, priority: "optional" };
};

export const resolveWeeklyQuotaTargets = (
  params: WeeklyQuotaResolutionParams
): Record<WeeklyQuotaCategory, WeeklyQuotaTarget> => {
  const { daysPerWeek, phase, experience } = params;
  const targets = createEmptyTargets();

  if (daysPerWeek === 3) {
    applyThreeDayBaseTargets(targets);

    if (phase === "activation") {
      targets.chestIsolation = { min: 0, max: 1, priority: "optional" };
      targets.rearDeltIsolation = { min: 1, max: 2, priority: "optional" };
      targets.carry = { min: 1, target: 1, priority: "optional" };
    }

    if (phase === "skill") {
      targets.chestIsolation = { min: 1, max: 2, priority: "optional" };
      targets.rearDeltIsolation = { min: 1, max: 2, priority: "optional" };
      targets.antiRotation = { min: 1, target: 2, priority: "optional" };
    }

    if (phase === "growth") {
      targets.chest = { min: 2, target: 4, priority: "must" };
      targets.back = { min: 2, target: 4, priority: "must" };
      targets.posteriorChain = { min: 1, target: 3, priority: "must" };
      targets.delts = { min: 2, target: 3, priority: "should" };
      targets.arms = { min: 2, target: 3, priority: "should" };
      targets.chestIsolation = { min: 1, max: 2, priority: "optional" };
    }

    if (experience === "beginner") {
      targets.delts = { min: 1, target: 1, priority: "should" };
      targets.arms = { min: 1, target: 1, priority: "should" };
      targets.carry = { min: 1, target: 1, priority: "optional" };
    }

    if (experience === "intermediate") {
      targets.delts = { min: 1, target: 2, priority: "should" };
      targets.arms = { min: 1, target: 2, priority: "should" };
      targets.carry = { min: 1, target: 1, priority: "optional" };
    }

    if (experience === "advanced") {
      targets.delts = { min: 2, target: 3, priority: "should" };
      targets.arms = { min: 2, target: 3, priority: "should" };
      targets.carry = { min: 0, target: 0, priority: "optional" };
    }

    return targets;
  }

  applyThreeDayBaseTargets(targets);
  return targets;
};

const buildWeeklyQuotaAuditEntries = (
  targets: Record<WeeklyQuotaCategory, WeeklyQuotaTarget>,
  hits: Record<WeeklyQuotaCategory, number>
) =>
  WEEKLY_QUOTA_CATEGORY_ORDER.reduce(
    (accumulator, category) => {
      const target = targets[category];
      const hitCount = hits[category];
      const deficit = Math.max(0, target.min - hitCount);
      accumulator[category] = {
        ...target,
        hits: hitCount,
        deficit,
        met: deficit === 0 && (target.max === undefined || hitCount <= target.max),
      };
      return accumulator;
    },
    {} as Record<WeeklyQuotaCategory, WeeklyQuotaAuditEntry>
  );

export const auditWeeklyQuotasFromExercises = (
  selectedExercises: Exercise[],
  params: WeeklyQuotaResolutionParams
): WeeklyQuotaAudit => {
  const targets = resolveWeeklyQuotaTargets(params);
  const hits = createEmptyHits();

  selectedExercises.forEach((exercise) => {
    (exercise.weeklyCoverageTags ?? []).forEach((category) => {
      hits[category] += 1;
    });
  });

  const audits = buildWeeklyQuotaAuditEntries(targets, hits);
  const missingMustHitCategories = WEEKLY_QUOTA_CATEGORY_ORDER.filter(
    (category) => audits[category].priority === "must" && audits[category].deficit > 0
  );
  const underHitShouldCategories = WEEKLY_QUOTA_CATEGORY_ORDER.filter(
    (category) => audits[category].priority === "should" && audits[category].deficit > 0
  );
  const optionalOpportunityCategories = WEEKLY_QUOTA_CATEGORY_ORDER.filter(
    (category) => audits[category].priority === "optional" && audits[category].deficit > 0
  );

  return {
    ...params,
    targets,
    hits,
    audits,
    missingMustHitCategories,
    underHitShouldCategories,
    optionalOpportunityCategories,
  };
};

const isTrainingQuotaItem = (item: ProgramRoutineItem) =>
  !item.section || trainingQuotaSections.has(item.section);

export const auditWeeklyQuotasFromWeek = (
  week: ProgramDay[],
  params: WeeklyQuotaResolutionParams & {
    resolveExerciseById: (exerciseId: string) => Exercise | undefined;
  }
) => {
  const selectedExercises = week.flatMap((day) =>
    day.routine
      .filter(isTrainingQuotaItem)
      .map((item) => params.resolveExerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise))
  );
  return auditWeeklyQuotasFromExercises(selectedExercises, params);
};
