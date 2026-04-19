import { exerciseById, type Exercise } from "@/lib/exercises";
import type { PostGenerationWarning } from "@/lib/program/postGenerationPipeline";
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

export type WeeklyCoverageAudit = {
  movementPatternsHit: WeeklyCoverageMovementPattern[];
  majorBodyRegionsHit: WeeklyCoverageMajorBodyRegion[];
  missingMustHitCategories: WeeklyCoverageMustHitCategory[];
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

const trainingCoverageSections = new Set<NonNullable<ProgramRoutineItem["section"]>>([
  "activation",
  "main",
  "accessory",
]);

const normalizeCoverageToken = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "");

const hasAnyToken = (tokens: Set<string>, candidates: string[]) =>
  candidates.some((candidate) => tokens.has(candidate));

const tokensFrom = (values: string[] | undefined) =>
  new Set((values ?? []).map(normalizeCoverageToken).filter(Boolean));

const collectMovementPatternHits = (exercise: Exercise) => {
  const movementTokens = tokensFrom(exercise.movementPattern);
  const tagTokens = tokensFrom(exercise.tags);
  const semanticTokens = new Set([...movementTokens, ...tagTokens]);
  const hits = new Set<WeeklyCoverageMovementPattern>();

  if (hasAnyToken(semanticTokens, ["push", "horizontalpush", "verticalpush"])) {
    hits.add("push");
  }
  if (hasAnyToken(semanticTokens, ["pull", "horizontalpull", "verticalpull"])) {
    hits.add("pull");
  }
  if (hasAnyToken(semanticTokens, ["squat", "kneedominant", "lunge"])) {
    hits.add("squat");
  }
  if (hasAnyToken(semanticTokens, ["hinge", "hiphinge", "posteriorchain"])) {
    hits.add("hinge");
  }
  if (hasAnyToken(semanticTokens, ["core", "antirotation", "antiextension", "carry"])) {
    hits.add("core");
  }

  return hits;
};

const collectMajorBodyRegionHits = (exercise: Exercise) => {
  const movementHits = collectMovementPatternHits(exercise);
  const regionTokens = new Set([
    ...tokensFrom(exercise.movementPattern),
    ...tokensFrom(exercise.muscleGroups),
    ...tokensFrom(exercise.tags),
  ]);
  const hits = new Set<WeeklyCoverageMajorBodyRegion>();

  if (
    movementHits.has("push") ||
    movementHits.has("pull") ||
    hasAnyToken(regionTokens, [
      "back",
      "biceps",
      "chest",
      "lats",
      "reardelts",
      "rotatorcuff",
      "scapularstabilizers",
      "serratus",
      "shoulders",
      "traps",
      "triceps",
      "upperback",
      "upperchest",
    ])
  ) {
    hits.add("upper");
  }

  if (
    movementHits.has("squat") ||
    movementHits.has("hinge") ||
    hasAnyToken(regionTokens, [
      "adductors",
      "ankles",
      "calves",
      "glutemed",
      "glutes",
      "hamstrings",
      "hipflexors",
      "hips",
      "lowerback",
      "quads",
      "singleleg",
    ])
  ) {
    hits.add("lower");
  }

  if (
    movementHits.has("core") ||
    hasAnyToken(regionTokens, ["core", "diaphragm", "obliques", "tva"])
  ) {
    hits.add("core");
  }

  return hits;
};

const isTrainingCoverageItem = (item: ProgramRoutineItem) =>
  !item.section || trainingCoverageSections.has(item.section);

const orderedHits = <T extends string>(values: T[], hits: Set<T>) =>
  values.filter((value) => hits.has(value));

// The coverage audit is intentionally observational: it reads final exercise
// metadata after generation/repair and reports holes without mutating the week.
export const auditWeeklyCoverage = (week: ProgramDay[]): WeeklyCoverageAudit => {
  const movementHits = new Set<WeeklyCoverageMovementPattern>();
  const regionHits = new Set<WeeklyCoverageMajorBodyRegion>();

  week.forEach((day) => {
    day.routine.filter(isTrainingCoverageItem).forEach((item) => {
      const exercise = exerciseById(item.exerciseId);
      if (!exercise) return;
      collectMovementPatternHits(exercise).forEach((hit) => movementHits.add(hit));
      collectMajorBodyRegionHits(exercise).forEach((hit) => regionHits.add(hit));
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

  return {
    movementPatternsHit,
    majorBodyRegionsHit,
    missingMustHitCategories,
  };
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
