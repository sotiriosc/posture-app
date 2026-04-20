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

const collectCoverageCategoryHits = (exercise: Exercise) => {
  const movementHits = collectMovementPatternHits(exercise);
  const movementTokens = tokensFrom(exercise.movementPattern);
  const regionTokens = new Set([
    ...movementTokens,
    ...tokensFrom(exercise.muscleGroups),
    ...tokensFrom(exercise.tags),
    ...tokensFrom(exercise.accessoryRoles),
  ]);
  const descriptor = normalizeCoverageToken(
    `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""} ${exercise.variantKey ?? ""}`
  );
  const hits = new Set<WeeklyCoverageCategory>();
  const textHasAny = (...tokens: string[]) =>
    tokens.some((token) => descriptor.includes(normalizeCoverageToken(token)));

  if (
    hasAnyToken(regionTokens, ["chest", "accessorychestisolation"]) ||
    movementTokens.has("horizontalpush") ||
    textHasAny(
      "bench press",
      "chest press",
      "pec deck",
      "pushup",
      "push-up",
      "floor press",
      "chest fly",
      "cable fly"
    )
  ) {
    hits.add("chest");
  }
  if (
    movementHits.has("pull") ||
    hasAnyToken(regionTokens, [
      "back",
      "lats",
      "upperback",
      "accessorybackthickness",
      "accessorybackwidth",
      "accessoryreardelt",
      "accessoryshouldersupport",
    ])
  ) {
    hits.add("back");
  }
  if (
    hasAnyToken(regionTokens, ["quads"]) ||
    hasAnyToken(regionTokens, ["squat", "kneedominant", "lunge"])
  ) {
    hits.add("quads");
  }
  if (
    movementHits.has("hinge") ||
    hasAnyToken(regionTokens, [
      "posteriorchain",
      "glutes",
      "hamstrings",
      "accessoryhamstring",
      "accessoryglute",
    ])
  ) {
    hits.add("posteriorChain");
  }
  if (
    movementHits.has("core") ||
    hasAnyToken(regionTokens, [
      "core",
      "obliques",
      "tva",
      "accessorycorestability",
      "accessorycarry",
    ])
  ) {
    hits.add("core");
  }
  if (
    hasAnyToken(regionTokens, [
      "shoulders",
      "reardelts",
      "lateraldelt",
      "accessoryreardelt",
      "accessorylateraldelt",
      "accessoryshouldersupport",
    ]) ||
    textHasAny("rear delt", "rear-delt", "lateral raise", "lateral-raise", "shoulder press")
  ) {
    hits.add("delts");
  }
  if (
    hasAnyToken(regionTokens, ["biceps", "triceps", "accessorybiceps", "accessorytriceps"]) ||
    textHasAny("biceps", "triceps", "curl", "pressdown", "kickback")
  ) {
    hits.add("arms");
  }
  if (
    hasAnyToken(regionTokens, ["calves", "accessorycalves"]) ||
    textHasAny("calf raise", "calf-raise", "calves")
  ) {
    hits.add("calves");
  }
  if (
    hasAnyToken(regionTokens, ["accessorychestisolation"]) ||
    textHasAny("chest fly", "chest-fly", "pec deck", "pec-deck")
  ) {
    hits.add("chestIsolation");
  }
  if (
    hasAnyToken(regionTokens, ["accessoryreardelt"]) ||
    textHasAny("rear delt", "rear-delt", "reverse pec deck", "reverse-pec-deck")
  ) {
    hits.add("rearDeltIsolation");
  }
  if (hasAnyToken(regionTokens, ["adductors"]) || textHasAny("adductor", "cossack")) {
    hits.add("adductors");
  }
  if (hasAnyToken(regionTokens, ["tibialis"]) || textHasAny("tibialis")) {
    hits.add("tibialis");
  }
  if (hasAnyToken(regionTokens, ["accessorycarry"]) || textHasAny("carry", "suitcase", "farmer")) {
    hits.add("carries");
  }
  if (
    hasAnyToken(regionTokens, ["antirotation", "antirotation"]) ||
    textHasAny("pallof", "woodchop", "anti rotation", "anti-rotation")
  ) {
    hits.add("antiRotation");
  }

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
  selectedExercises: Exercise[]
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
  };
};

// The coverage audit is intentionally observational: it reads final exercise
// metadata after generation/repair and reports holes without mutating the week.
export const auditWeeklyCoverage = (week: ProgramDay[]): WeeklyCoverageAudit => {
  const selectedExercises = week.flatMap((day) =>
    day.routine
      .filter(isTrainingCoverageItem)
      .map((item) => exerciseById(item.exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise))
  );
  return auditWeeklyCoverageFromExercises(selectedExercises);
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
