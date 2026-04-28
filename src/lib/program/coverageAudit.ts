import { exerciseById, type Exercise } from "@/lib/exercises";
import type { PostGenerationWarning } from "@/lib/program/postGenerationPipeline";
import {
  auditWeeklyQuotasFromExercises,
  type WeeklyQuotaCategory,
  type WeeklyQuotaAudit,
} from "@/lib/program/quotaRegistry";
import type { ProgramDay, ProgramRoutineItem } from "@/lib/types";

export type WeeklyCoverageMovementPattern =
  | "push"
  | "pull"
  | "squat"
  | "hinge"
  | "core";

export type WeeklyCoverageMajorBodyRegion = "upper" | "lower" | "core";

export type WeeklyCoverageMustHitCategory =
  | `movement:${WeeklyCoverageMovementPattern}`
  | `region:${WeeklyCoverageMajorBodyRegion}`;

export type WeeklyCoverageCategory =
  | "chest"
  | "back"
  | "quads"
  | "posteriorChain"
  | "core"
  | "delts"
  | "arms"
  | "calves"
  | "chestIsolation"
  | "rearDeltIsolation"
  | "adductors"
  | "tibialis"
  | "carries"
  | "antiRotation";

export type WeeklyCoveragePriority = "must" | "should" | "optional";

export type WeeklyCoverageTarget = {
  min: number;
  max?: number;
  priority: WeeklyCoveragePriority;
};

export type WeeklyCoverageCategoryAudit = WeeklyCoverageTarget & {
  hits: number;
  deficit: number;
  met: boolean;
};

export type WeeklyCoverageAudit = {
  movementPatternsHit: WeeklyCoverageMovementPattern[];
  majorBodyRegionsHit: WeeklyCoverageMajorBodyRegion[];
  missingMustHitCategories: WeeklyCoverageMustHitCategory[];
  categoryHits: Record<WeeklyCoverageCategory, number>;
  categoryAudits: Record<WeeklyCoverageCategory, WeeklyCoverageCategoryAudit>;
  missingMustHitCoverage: WeeklyCoverageCategory[];
  underHitShouldCoverage: WeeklyCoverageCategory[];
  optionalCoverageOpportunities: WeeklyCoverageCategory[];
  quotaAudit?: WeeklyQuotaAudit;
};

const movementPatternOrder: WeeklyCoverageMovementPattern[] = [
  "push",
  "pull",
  "squat",
  "hinge",
  "core",
];

const majorBodyRegionOrder: WeeklyCoverageMajorBodyRegion[] = [
  "upper",
  "lower",
  "core",
];

const coverageCategoryOrder: WeeklyCoverageCategory[] = [
  "chest",
  "back",
  "quads",
  "posteriorChain",
  "core",
  "delts",
  "arms",
  "calves",
  "chestIsolation",
  "rearDeltIsolation",
  "adductors",
  "tibialis",
  "carries",
  "antiRotation",
];

export const WEEKLY_COVERAGE_TARGETS: Record<WeeklyCoverageCategory, WeeklyCoverageTarget> = {
  chest: { min: 2, priority: "must" },
  back: { min: 2, priority: "must" },
  quads: { min: 1, priority: "must" },
  posteriorChain: { min: 1, priority: "must" },
  core: { min: 2, priority: "must" },
  delts: { min: 1, priority: "should" },
  arms: { min: 1, priority: "should" },
  calves: { min: 1, priority: "should" },
  chestIsolation: { min: 1, max: 2, priority: "optional" },
  rearDeltIsolation: { min: 1, max: 2, priority: "optional" },
  adductors: { min: 1, priority: "optional" },
  tibialis: { min: 1, priority: "optional" },
  carries: { min: 1, priority: "optional" },
  antiRotation: { min: 1, priority: "optional" },
};

const trainingCoverageSections = new Set<NonNullable<ProgramRoutineItem["section"]>>([
  "activation",
  "main",
  "accessory",
]);

const coverageTagsFrom = (exercise: Exercise) => new Set(exercise.weeklyCoverageTags ?? []);

const movementPatternByQuotaTag: Partial<
  Record<WeeklyQuotaCategory, WeeklyCoverageMovementPattern>
> = {
  chest: "push",
  chestIsolation: "push",
  pushCompound: "push",
  back: "pull",
  horizontalPull: "pull",
  horizontalPullTrue: "pull",
  verticalPull: "pull",
  verticalPullTrue: "pull",
  verticalPullSurrogate: "pull",
  rearDeltIsolation: "pull",
  squat: "squat",
  quads: "squat",
  unilateralLower: "squat",
  hinge: "hinge",
  posteriorChain: "hinge",
  core: "core",
  coreStability: "core",
  carry: "core",
  antiRotation: "core",
};

const majorRegionByQuotaTag: Partial<
  Record<WeeklyQuotaCategory, WeeklyCoverageMajorBodyRegion>
> = {
  upperRegion: "upper",
  chest: "upper",
  back: "upper",
  delts: "upper",
  arms: "upper",
  horizontalPull: "upper",
  horizontalPullTrue: "upper",
  verticalPull: "upper",
  verticalPullTrue: "upper",
  verticalPullSurrogate: "upper",
  pushCompound: "upper",
  lowerRegion: "lower",
  quads: "lower",
  posteriorChain: "lower",
  calves: "lower",
  squat: "lower",
  hinge: "lower",
  unilateralLower: "lower",
  coreRegion: "core",
  core: "core",
  carry: "core",
  coreStability: "core",
  antiRotation: "core",
};

const coverageCategoryByQuotaTag: Partial<Record<WeeklyQuotaCategory, WeeklyCoverageCategory>> = {
  chest: "chest",
  back: "back",
  quads: "quads",
  posteriorChain: "posteriorChain",
  core: "core",
  delts: "delts",
  arms: "arms",
  calves: "calves",
  chestIsolation: "chestIsolation",
  rearDeltIsolation: "rearDeltIsolation",
  adductors: "adductors",
  tibialis: "tibialis",
  carry: "carries",
  antiRotation: "antiRotation",
};

const collectMovementPatternHits = (exercise: Exercise) => {
  const hits = new Set<WeeklyCoverageMovementPattern>();
  coverageTagsFrom(exercise).forEach((tag) => {
    const mapped = movementPatternByQuotaTag[tag];
    if (mapped) hits.add(mapped);
  });

  return hits;
};

const collectMajorBodyRegionHits = (exercise: Exercise) => {
  const hits = new Set<WeeklyCoverageMajorBodyRegion>();
  coverageTagsFrom(exercise).forEach((tag) => {
    const mapped = majorRegionByQuotaTag[tag];
    if (mapped) hits.add(mapped);
  });

  return hits;
};

const collectCoverageCategoryHits = (exercise: Exercise) => {
  const hits = new Set<WeeklyCoverageCategory>();
  coverageTagsFrom(exercise).forEach((tag) => {
    const mapped = coverageCategoryByQuotaTag[tag];
    if (mapped) hits.add(mapped);
  });

  return hits;
};

const isTrainingCoverageItem = (item: ProgramRoutineItem) =>
  !item.section || trainingCoverageSections.has(item.section);

const orderedHits = <T extends string>(values: T[], hits: Set<T>) =>
  values.filter((value) => hits.has(value));

const createEmptyCategoryHitMap = () =>
  coverageCategoryOrder.reduce(
    (acc, category) => {
      acc[category] = 0;
      return acc;
    },
    {} as Record<WeeklyCoverageCategory, number>
  );

export const auditWeeklyCoverageFromExercises = (
  selectedExercises: Exercise[],
  options?: {
    daysPerWeek?: 3 | 4 | 5;
    phase?: "activation" | "skill" | "growth";
    experience?: "beginner" | "intermediate" | "advanced";
  }
): WeeklyCoverageAudit => {
  const movementHits = new Set<WeeklyCoverageMovementPattern>();
  const regionHits = new Set<WeeklyCoverageMajorBodyRegion>();
  const categoryHits = createEmptyCategoryHitMap();

  selectedExercises.forEach((exercise) => {
    collectMovementPatternHits(exercise).forEach((hit) => movementHits.add(hit));
    collectMajorBodyRegionHits(exercise).forEach((hit) => regionHits.add(hit));
    collectCoverageCategoryHits(exercise).forEach((hit) => {
      categoryHits[hit] += 1;
    });
  });

  const movementPatternsHit = orderedHits(movementPatternOrder, movementHits);
  const majorBodyRegionsHit = orderedHits(majorBodyRegionOrder, regionHits);
  const missingMustHitCategories: WeeklyCoverageMustHitCategory[] = [
    ...movementPatternOrder
      .filter((pattern) => !movementHits.has(pattern))
      .map((pattern) => `movement:${pattern}` as const),
    ...majorBodyRegionOrder
      .filter((region) => !regionHits.has(region))
      .map((region) => `region:${region}` as const),
  ];
  const categoryAudits = coverageCategoryOrder.reduce(
    (acc, category) => {
      const target = WEEKLY_COVERAGE_TARGETS[category];
      const hits = categoryHits[category];
      const deficit = Math.max(0, target.min - hits);
      acc[category] = {
        ...target,
        hits,
        deficit,
        met: deficit === 0,
      };
      return acc;
    },
    {} as Record<WeeklyCoverageCategory, WeeklyCoverageCategoryAudit>
  );
  const missingMustHitCoverage = coverageCategoryOrder.filter(
    (category) =>
      categoryAudits[category].priority === "must" && categoryAudits[category].deficit > 0
  );
  const underHitShouldCoverage = coverageCategoryOrder.filter(
    (category) =>
      categoryAudits[category].priority === "should" && categoryAudits[category].deficit > 0
  );
  const optionalCoverageOpportunities = coverageCategoryOrder.filter(
    (category) =>
      categoryAudits[category].priority === "optional" && categoryAudits[category].deficit > 0
  );

  return {
    movementPatternsHit,
    majorBodyRegionsHit,
    missingMustHitCategories,
    categoryHits,
    categoryAudits,
    missingMustHitCoverage,
    underHitShouldCoverage,
    optionalCoverageOpportunities,
    ...(options
      ? {
          quotaAudit: auditWeeklyQuotasFromExercises(selectedExercises, {
            daysPerWeek: options.daysPerWeek ?? 3,
            phase: options.phase ?? "skill",
            experience: options.experience ?? "beginner",
          }),
        }
      : {}),
  };
};

// The coverage audit is intentionally observational: it reads final exercise
// metadata after generation/repair and reports holes without mutating the week.
export const auditWeeklyCoverage = (
  week: ProgramDay[],
  options?: {
    daysPerWeek?: 3 | 4 | 5;
    phase?: "activation" | "skill" | "growth";
    experience?: "beginner" | "intermediate" | "advanced";
  }
): WeeklyCoverageAudit => {
  const selectedExercises = week.flatMap((day) =>
    day.routine
      .filter(isTrainingCoverageItem)
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise))
  );
  return auditWeeklyCoverageFromExercises(selectedExercises, options);
};

export const buildWeeklyCoverageAuditWarnings = (
  audit: WeeklyCoverageAudit
): PostGenerationWarning[] => {
  if (!audit.missingMustHitCategories.length) return [];
  return [
    {
      dayTitle: "Weekly Coverage",
      kind: "coverage",
      message: `Weekly coverage audit missing must-hit categories: ${audit.missingMustHitCategories.join(
        ", "
      )}.`,
    },
  ];
};
