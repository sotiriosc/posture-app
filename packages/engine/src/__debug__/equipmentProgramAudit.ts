/**
 * Equipment-program audit (Phase 1 comparison writer).
 * Read-only generation inspection. Does not overwrite Phase 0 baseline artifacts.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { computeEquipmentCapability } from "@/lib/engine/equipmentCapability";
import { exerciseById, type Exercise } from "@/lib/exercises";
import {
  isExerciseEligible,
  normalizeEquipmentSelection,
  normalizeEquipmentSelectionValues,
  type Equipment,
} from "@/lib/equipment";
import {
  deriveProgramCapabilities,
  inferExerciseSupportRequirements,
  isSupportConfirmedByCapabilities,
  type ProgramCapabilities,
} from "@/lib/program/equipmentCapabilities";
import {
  deriveLegacyHasLoadIntentEquipmentMode,
  resolvePrimaryProgramEquipmentMode,
  type PrimaryProgramEquipmentMode,
} from "@/lib/program/equipmentMode";
import {
  buildProgramIntentProfile,
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
  getProgramConstraintWarningBuffer,
  getWeeklyCoverageContract,
  summarizeWeekCoverage,
  type EquipmentCapabilityMode,
} from "@/lib/program";
import type { Program, ProgramDay, ProgramRoutineItem } from "@/lib/types";

type PrimaryMode = PrimaryProgramEquipmentMode;
type ProblemCategory =
  | "structural"
  | "equipment_legality"
  | "slot_truth"
  | "complexity"
  | "coaching"
  | "progression"
  | "ui_comprehension";

type AuditCase = {
  id: string;
  label: string;
  primaryMode: PrimaryMode;
  questionnaire: QuestionnaireData;
  phaseIndex: 1 | 2 | 3;
  seed: string;
  goldenManualReview?: boolean;
};

type ExerciseAuditRow = {
  exerciseId: string;
  name: string;
  section: ProgramRoutineItem["section"] | null;
  slotKind: string | null;
  slotLane: string | null;
  selectionSource: string | null;
  slotRoleMatch: string | null;
  catalogSlotRoles: string[];
  catalogAccessoryRoles: string[];
  equipment: Equipment[];
  movementPatterns: string[];
  movementRole: string;
  truthLevel: "true" | "surrogate" | "support_only" | "unknown";
  requiredSupports: string[];
  complexity: {
    difficulty?: number;
    difficultyTier?: string;
    experienceMin?: string;
    tier?: number;
    phaseMin?: string;
  };
  coachingGaps: string[];
  demoGap: boolean;
  progressionLinks: {
    progressionOf?: string;
    regressionOf?: string;
  };
  eligible: boolean;
  notes: string | null;
};

type DayAudit = {
  title: string;
  focusTags: string[];
  exerciseCount: number;
  mainCount: number;
  accessoryCount: number;
  duplicateExerciseIds: string[];
  exercises: ExerciseAuditRow[];
  degradationNotes: string[];
};

type CaseAudit = {
  id: string;
  label: string;
  /** Expected mode from the audit matrix case definition. */
  primaryMode: PrimaryMode;
  /** Canonical resolver output from questionnaire equipment. */
  resolvedPrimaryMode: PrimaryProgramEquipmentMode;
  questionnaire: QuestionnaireData;
  phaseIndex: number;
  phaseName: string | null;
  capabilityMode: EquipmentCapabilityMode;
  /** Intent profile equipment identity after Phase 1 (should match resolvedPrimaryMode). */
  intentProfileEquipment: PrimaryProgramEquipmentMode;
  /** Phase 0 legacy hasLoad→gym mapping retained for comparison only. */
  legacyIntentEquipmentMode: "gym" | "bands" | "none";
  programCapabilities: ProgramCapabilities;
  normalizedEquipment: string[];
  availableEquipment: string[];
  dayTitles: string[];
  templateIdentityMismatch: boolean;
  unconfirmedSupports: string[];
  truthfulMainCount: number;
  surrogateMainCount: number;
  supportOnlyMainCount: number;
  days: DayAudit[];
  weeklyCoverage: ReturnType<typeof summarizeWeekCoverage>;
  weeklyCoverageContract: ReturnType<typeof getWeeklyCoverageContract>;
  weeklyCoverageGaps: string[];
  duplicateExerciseIdsAcrossWeek: string[];
  coachingDemoGapCount: number;
  ineligibleExerciseIds: string[];
  requiredSupportsObserved: string[];
  warnings: Array<{ kind: string; dayTitle: string; message: string }>;
  problemFlags: Array<{ category: ProblemCategory; detail: string }>;
  goldenManualReview: boolean;
};

const OUT_DIR = path.resolve(process.cwd(), "docs/dev-reports");
/** Phase 1 comparison artifacts only — never overwrite Phase 0 baselines. */
const JSON_OUT = path.join(OUT_DIR, "equipment-program-audit-phase1.json");
const MD_OUT = path.join(OUT_DIR, "equipment-program-audit-phase1.md");
const GOLDEN_MD_OUT = path.join(OUT_DIR, "equipment-program-audit-phase1-twelve-personas.md");
const COMPARISON_MD_OUT = path.join(
  OUT_DIR,
  "equipment-program-audit-phase1-vs-phase0.md"
);

const EXPERIENCES = ["Beginner", "Intermediate", "Advanced"] as const;
const DAYS = [3, 4, 5] as const;
const PHASES = [1, 2, 3] as const;
const GOALS = [
  "General fitness",
  "Improve posture",
  "Reduce pain",
  "Athletic performance",
] as const;

const EQUIPMENT_MODES: Array<{ primaryMode: PrimaryMode; values: string[] }> = [
  { primaryMode: "gym", values: ["gym"] },
  { primaryMode: "dumbbells", values: ["dumbbells"] },
  { primaryMode: "bands", values: ["bands"] },
  { primaryMode: "bodyweight", values: ["none"] },
  { primaryMode: "mixedHome", values: ["dumbbells", "bands"] },
];

const PAIN_PROFILES: Array<{ key: string; painAreas: string[] }> = [
  { key: "no_pain", painAreas: [] },
  { key: "shoulder_upper_back", painAreas: ["Shoulders", "Upper back"] },
  { key: "low_back_hip", painAreas: ["Lower back", "Hips"] },
];

const deriveCapabilityMode = (equipment: string[]): EquipmentCapabilityMode => {
  const capability = computeEquipmentCapability(equipment);
  if (capability.hasLoad) return "hasLoad";
  if (capability.hasBand) return "bandOnly";
  return "noneOnly";
};

const looksGymShapedTemplate = (dayTitles: string[]) =>
  dayTitles.some((title) =>
    /back\s*\+\s*chest|shoulders\s*\+\s*arms|legs\s*\+\s*abs/i.test(title)
  );

const normalizeToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const inferRequiredSupports = (exercise: Exercise): string[] =>
  inferExerciseSupportRequirements({
    exerciseId: exercise.id,
    name: exercise.name,
    equipment: exercise.equipment,
    cues: exercise.cues,
    mistakes: exercise.mistakes,
    tags: exercise.tags,
    variantKey: exercise.variantKey,
  });

const deriveMovementRole = (exercise: Exercise, item: ProgramRoutineItem): string => {
  const slotKind = item.selectionDebug?.slotKind;
  if (slotKind) return slotKind;
  if (exercise.slotRoles?.length) return exercise.slotRoles.join("+");
  if (exercise.accessoryRoles?.length) return exercise.accessoryRoles.join("+");
  if (exercise.movementPattern.length) return exercise.movementPattern.join("+");
  return exercise.category;
};

const deriveTruthLevel = (
  exercise: Exercise,
  item: ProgramRoutineItem
): ExerciseAuditRow["truthLevel"] => {
  if (exercise.supportOnly) return "support_only";
  const tags = new Set((exercise.weeklyCoverageTags ?? []).map(normalizeToken));
  const patterns = new Set(exercise.movementPattern.map(normalizeToken));
  const blob = `${exercise.id} ${exercise.name} ${exercise.familyKey ?? ""}`.toLowerCase();
  const slot = normalizeToken(item.selectionDebug?.slotKind ?? "");

  if (
    tags.has("verticalpullsurrogate") ||
    blob.includes("pullover") ||
    blob.includes("lat sweep") ||
    blob.includes("supine lat")
  ) {
    return "surrogate";
  }

  if (slot.includes("vertical") && slot.includes("pull")) {
    const truthful =
      exercise.slotRoles?.includes("pullVertical") ||
      patterns.has("verticalpull") ||
      blob.includes("pulldown") ||
      blob.includes("pull-up") ||
      blob.includes("pullup") ||
      blob.includes("chin-up") ||
      blob.includes("chinup");
    return truthful ? "true" : "surrogate";
  }

  if (slot.includes("hinge") || slot.includes("squat") || slot.includes("push") || slot.includes("pull")) {
    return "true";
  }

  if (exercise.slotRoles?.length || exercise.accessoryRoles?.length) return "true";
  return "unknown";
};

const coachingGapsFor = (exercise: Exercise): string[] => {
  const gaps: string[] = [];
  if (!exercise.cues?.length) gaps.push("missing_cues");
  if (!exercise.mistakes?.length) gaps.push("missing_mistakes");
  if (!exercise.durationOrReps) gaps.push("missing_duration_or_reps");
  if (!exercise.painContraindications?.length && !exercise.contraindications?.length) {
    gaps.push("missing_contraindications");
  }
  return gaps;
};

const hasDemoGap = (exercise: Exercise): boolean => {
  if (exercise.demoStatus === "url") return false;
  if (exercise.videoUrl) return false;
  return true;
};

const estimateComplexityScore = (exercise: Exercise): number => {
  const difficulty = exercise.difficulty ?? 0;
  const tier = exercise.tier ?? 0;
  const tierMap = { easy: 1, moderate: 2, hard: 3 } as const;
  const difficultyTier = exercise.difficultyTier ? tierMap[exercise.difficultyTier] : 0;
  const experienceMap = { Beginner: 1, Intermediate: 2, Advanced: 3 } as const;
  const experienceMin = exercise.experienceMin ? experienceMap[exercise.experienceMin] : 0;
  return Math.max(difficulty, tier, difficultyTier, experienceMin);
};

const buildExerciseRow = (
  item: ProgramRoutineItem,
  available: Set<Equipment>
): ExerciseAuditRow => {
  const exercise = exerciseById(item.exerciseId);
  if (!exercise) {
    return {
      exerciseId: item.exerciseId,
      name: "(missing catalog entry)",
      section: item.section ?? null,
      slotKind: item.selectionDebug?.slotKind ?? null,
      slotLane: item.selectionDebug?.slotLane ?? null,
      selectionSource: item.selectionDebug?.source ?? null,
      slotRoleMatch: item.selectionDebug?.decisionTrace?.slotRoleMatch ?? null,
      catalogSlotRoles: [],
      catalogAccessoryRoles: [],
      equipment: [],
      movementPatterns: [],
      movementRole: item.selectionDebug?.slotKind ?? "unknown",
      truthLevel: "unknown",
      requiredSupports: [],
      complexity: {},
      coachingGaps: ["missing_catalog_entry"],
      demoGap: true,
      progressionLinks: {},
      eligible: false,
      notes: item.notes ?? null,
    };
  }

  return {
    exerciseId: exercise.id,
    name: exercise.name,
    section: item.section ?? null,
    slotKind: item.selectionDebug?.slotKind ?? null,
    slotLane: item.selectionDebug?.slotLane ?? null,
    selectionSource: item.selectionDebug?.source ?? null,
    slotRoleMatch: item.selectionDebug?.decisionTrace?.slotRoleMatch ?? null,
    catalogSlotRoles: [...(exercise.slotRoles ?? [])],
    catalogAccessoryRoles: [...(exercise.accessoryRoles ?? [])],
    equipment: [...exercise.equipment],
    movementPatterns: [...exercise.movementPattern],
    movementRole: deriveMovementRole(exercise, item),
    truthLevel: deriveTruthLevel(exercise, item),
    requiredSupports: inferRequiredSupports(exercise),
    complexity: {
      difficulty: exercise.difficulty,
      difficultyTier: exercise.difficultyTier,
      experienceMin: exercise.experienceMin,
      tier: exercise.tier,
      phaseMin: exercise.phaseMin,
    },
    coachingGaps: coachingGapsFor(exercise),
    demoGap: hasDemoGap(exercise),
    progressionLinks: {
      progressionOf: exercise.progressionOf,
      regressionOf: exercise.regressionOf,
    },
    eligible: isExerciseEligible(exercise, available),
    notes: item.notes ?? null,
  };
};

const findDayDuplicates = (day: ProgramDay): string[] => {
  const seen = new Map<string, number>();
  day.routine.forEach((item) => {
    seen.set(item.exerciseId, (seen.get(item.exerciseId) ?? 0) + 1);
  });
  return Array.from(seen.entries())
    .filter(([, count]) => count > 1)
    .map(([id]) => id)
    .sort();
};

const findWeekDuplicates = (program: Program): string[] => {
  const seen = new Map<string, number>();
  program.week.forEach((day) => {
    day.routine.forEach((item) => {
      seen.set(item.exerciseId, (seen.get(item.exerciseId) ?? 0) + 1);
    });
  });
  return Array.from(seen.entries())
    .filter(([, count]) => count > 1)
    .map(([id]) => id)
    .sort();
};

const collectProblemFlags = (caseAudit: Omit<CaseAudit, "problemFlags">): CaseAudit["problemFlags"] => {
  const flags: CaseAudit["problemFlags"] = [];

  if (caseAudit.resolvedPrimaryMode !== caseAudit.primaryMode) {
    flags.push({
      category: "structural",
      detail: `case expected ${caseAudit.primaryMode} but resolver returned ${caseAudit.resolvedPrimaryMode}`,
    });
  }

  if (caseAudit.intentProfileEquipment !== caseAudit.resolvedPrimaryMode) {
    flags.push({
      category: "structural",
      detail: `intent profile equipment=${caseAudit.intentProfileEquipment} mismatches resolved primary mode=${caseAudit.resolvedPrimaryMode}`,
    });
  }

  if (
    (caseAudit.resolvedPrimaryMode === "dumbbells" ||
      caseAudit.resolvedPrimaryMode === "mixedHome") &&
    caseAudit.intentProfileEquipment === "gym"
  ) {
    flags.push({
      category: "structural",
      detail: `${caseAudit.resolvedPrimaryMode} still collapses to intent profile gym identity`,
    });
  }

  if (
    caseAudit.resolvedPrimaryMode !== "gym" &&
    caseAudit.legacyIntentEquipmentMode === "gym" &&
    caseAudit.intentProfileEquipment !== "gym"
  ) {
    // Informational comparison only — legacy mapping still exists for audits.
  }

  if (
    caseAudit.templateIdentityMismatch &&
    caseAudit.questionnaire.daysPerWeek === 3
  ) {
    flags.push({
      category: "structural",
      detail: `primaryMode=${caseAudit.resolvedPrimaryMode} still uses legacy gym-shaped day titles: ${caseAudit.dayTitles.join(", ")} (Phase 2–5 template work)`,
    });
  }

  if (caseAudit.ineligibleExerciseIds.length) {
    flags.push({
      category: "equipment_legality",
      detail: `ineligible exercises: ${caseAudit.ineligibleExerciseIds.join(", ")}`,
    });
  }

  if (caseAudit.unconfirmedSupports.length) {
    flags.push({
      category: "equipment_legality",
      detail: `required supports observed without confirmed capability: ${caseAudit.unconfirmedSupports.join(", ")}`,
    });
  }

  const untruthfulPullMains = caseAudit.days.flatMap((day) =>
    day.exercises.filter((row) => {
      if (row.section !== "main") return false;
      const slot = normalizeToken(row.slotKind ?? "");
      if (!slot.includes("pull")) return false;
      return row.truthLevel === "surrogate" || row.truthLevel === "support_only";
    })
  );
  if (untruthfulPullMains.length) {
    flags.push({
      category: "slot_truth",
      detail: `untruthful/support pull mains: ${untruthfulPullMains
        .map((row) => `${row.exerciseId}@${row.slotKind}:${row.truthLevel}`)
        .join(", ")}`,
    });
  }

  const experience = caseAudit.questionnaire.experience;
  const overComplex = caseAudit.days.flatMap((day) =>
    day.exercises.filter((row) => {
      if (experience === "Beginner" && estimateComplexityScore(exerciseById(row.exerciseId) ?? ({ difficulty: 0 } as Exercise)) >= 4) {
        return true;
      }
      if (
        experience === "Beginner" &&
        (row.complexity.experienceMin === "Advanced" || row.complexity.experienceMin === "Intermediate")
      ) {
        return true;
      }
      if (experience === "Intermediate" && row.complexity.experienceMin === "Advanced") {
        return true;
      }
      return false;
    })
  );
  if (overComplex.length) {
    flags.push({
      category: "complexity",
      detail: `experience-mismatched complexity: ${overComplex
        .slice(0, 8)
        .map((row) => row.exerciseId)
        .join(", ")}`,
    });
  }

  if (caseAudit.coachingDemoGapCount > 0) {
    flags.push({
      category: "coaching",
      detail: `${caseAudit.coachingDemoGapCount} exercise placements lack demo URL and/or core coaching fields`,
    });
  }

  const missingProgression = caseAudit.days.flatMap((day) =>
    day.exercises.filter(
      (row) =>
        (row.section === "main" || row.section === "accessory") &&
        !row.progressionLinks.progressionOf &&
        !row.progressionLinks.regressionOf
    )
  );
  if (missingProgression.length >= 3) {
    flags.push({
      category: "progression",
      detail: `${missingProgression.length} loaded/main-or-accessory placements have no progressionOf/regressionOf links`,
    });
  }

  const opaqueTitles = caseAudit.dayTitles.filter((title) => title.trim().length < 3);
  if (opaqueTitles.length) {
    flags.push({
      category: "ui_comprehension",
      detail: `opaque day titles: ${opaqueTitles.join(", ") || "(blank)"}`,
    });
  }

  if (caseAudit.primaryMode === "bodyweight") {
    const loadedPullLanguage = caseAudit.days.flatMap((day) =>
      day.exercises.filter((row) => {
        const slot = normalizeToken(row.slotKind ?? "");
        return (
          row.section === "main" &&
          (slot.includes("pullvertical") || slot.includes("pull_horizontal") || slot.includes("pullhorizontal")) &&
          row.truthLevel !== "true"
        );
      })
    );
    if (loadedPullLanguage.length) {
      flags.push({
        category: "ui_comprehension",
        detail: `bodyweight plan presents pull slots without truthful pull stimulus: ${loadedPullLanguage
          .map((row) => row.exerciseId)
          .join(", ")}`,
      });
    }
  }

  return flags;
};

const buildCases = (): AuditCase[] => {
  const cases: AuditCase[] = [];

  // Core matrix: mode × experience × days × phase (General fitness, no pain)
  EQUIPMENT_MODES.forEach((mode) => {
    EXPERIENCES.forEach((experience) => {
      DAYS.forEach((daysPerWeek) => {
        PHASES.forEach((phaseIndex) => {
          const id = [
            "core",
            mode.primaryMode,
            experience.toLowerCase(),
            `${daysPerWeek}d`,
            `p${phaseIndex}`,
            "general_fitness",
            "no_pain",
          ].join("__");
          cases.push({
            id,
            label: `${mode.primaryMode} / ${experience} / ${daysPerWeek}d / phase ${phaseIndex} / General fitness / no pain`,
            primaryMode: mode.primaryMode,
            questionnaire: {
              goals: "General fitness",
              painAreas: [],
              experience,
              equipment: [...mode.values],
              daysPerWeek,
            },
            phaseIndex,
            seed: `equipment-audit-${id}`,
          });
        });
      });
    });
  });

  // Pain coverage: each mode × 3-day × Beginner × phase 1 × pain profiles (excl no_pain)
  EQUIPMENT_MODES.forEach((mode) => {
    PAIN_PROFILES.filter((profile) => profile.key !== "no_pain").forEach((profile) => {
      const id = [
        "pain",
        mode.primaryMode,
        "beginner",
        "3d",
        "p1",
        "reduce_pain",
        profile.key,
      ].join("__");
      cases.push({
        id,
        label: `${mode.primaryMode} / Beginner / 3d / phase 1 / Reduce pain / ${profile.key}`,
        primaryMode: mode.primaryMode,
        questionnaire: {
          goals: "Reduce pain",
          painAreas: [...profile.painAreas],
          experience: "Beginner",
          equipment: [...mode.values],
          daysPerWeek: 3,
        },
        phaseIndex: 1,
        seed: `equipment-audit-${id}`,
      });
    });
  });

  // Goal coverage: each mode × 3-day × Intermediate × phase 1 × non-default goals
  EQUIPMENT_MODES.forEach((mode) => {
    GOALS.filter((goal) => goal !== "General fitness").forEach((goal) => {
      const id = [
        "goal",
        mode.primaryMode,
        "intermediate",
        "3d",
        "p1",
        normalizeToken(goal),
        "no_pain",
      ].join("__");
      cases.push({
        id,
        label: `${mode.primaryMode} / Intermediate / 3d / phase 1 / ${goal} / no pain`,
        primaryMode: mode.primaryMode,
        questionnaire: {
          goals: goal,
          painAreas: [],
          experience: "Intermediate",
          equipment: [...mode.values],
          daysPerWeek: 3,
        },
        phaseIndex: 1,
        seed: `equipment-audit-${id}`,
      });
    });
  });

  // Twelve three-day golden personas for manual review (3 per primary mode)
  const goldenSpecs: Array<{
    primaryMode: Exclude<PrimaryMode, "mixedHome">;
    experience: QuestionnaireData["experience"];
    goals: string;
    painAreas: string[];
    labelSuffix: string;
  }> = [
    {
      primaryMode: "gym",
      experience: "Beginner",
      goals: "General fitness",
      painAreas: [],
      labelSuffix: "beginner_no_pain",
    },
    {
      primaryMode: "gym",
      experience: "Intermediate",
      goals: "Improve posture",
      painAreas: [],
      labelSuffix: "intermediate_posture",
    },
    {
      primaryMode: "gym",
      experience: "Beginner",
      goals: "Reduce pain",
      painAreas: ["Shoulders", "Upper back"],
      labelSuffix: "beginner_shoulder_upper_back",
    },
    {
      primaryMode: "dumbbells",
      experience: "Beginner",
      goals: "General fitness",
      painAreas: [],
      labelSuffix: "beginner_no_pain",
    },
    {
      primaryMode: "dumbbells",
      experience: "Intermediate",
      goals: "Athletic performance",
      painAreas: [],
      labelSuffix: "intermediate_athletic",
    },
    {
      primaryMode: "dumbbells",
      experience: "Beginner",
      goals: "Reduce pain",
      painAreas: ["Lower back", "Hips"],
      labelSuffix: "beginner_low_back_hip",
    },
    {
      primaryMode: "bands",
      experience: "Beginner",
      goals: "General fitness",
      painAreas: [],
      labelSuffix: "beginner_no_pain",
    },
    {
      primaryMode: "bands",
      experience: "Intermediate",
      goals: "Improve posture",
      painAreas: [],
      labelSuffix: "intermediate_posture",
    },
    {
      primaryMode: "bands",
      experience: "Beginner",
      goals: "Reduce pain",
      painAreas: ["Shoulders", "Upper back"],
      labelSuffix: "beginner_shoulder_upper_back",
    },
    {
      primaryMode: "bodyweight",
      experience: "Beginner",
      goals: "General fitness",
      painAreas: [],
      labelSuffix: "beginner_no_pain",
    },
    {
      primaryMode: "bodyweight",
      experience: "Intermediate",
      goals: "Improve posture",
      painAreas: [],
      labelSuffix: "intermediate_posture",
    },
    {
      primaryMode: "bodyweight",
      experience: "Beginner",
      goals: "Reduce pain",
      painAreas: ["Lower back", "Hips"],
      labelSuffix: "beginner_low_back_hip",
    },
  ];

  goldenSpecs.forEach((spec) => {
    const modeValues =
      EQUIPMENT_MODES.find((mode) => mode.primaryMode === spec.primaryMode)?.values ?? ["none"];
    const id = `golden__${spec.primaryMode}__${spec.labelSuffix}`;
    const already = cases.find((entry) => {
      return (
        entry.primaryMode === spec.primaryMode &&
        entry.questionnaire.experience === spec.experience &&
        entry.questionnaire.goals === spec.goals &&
        entry.questionnaire.daysPerWeek === 3 &&
        entry.phaseIndex === 1 &&
        entry.questionnaire.painAreas.join("|") === spec.painAreas.join("|") &&
        entry.questionnaire.equipment.join("|") === modeValues.join("|")
      );
    });
    if (already) {
      already.goldenManualReview = true;
      already.id = id;
      already.label = `GOLDEN ${spec.primaryMode} / ${spec.experience} / 3d / phase 1 / ${spec.goals} / ${
        spec.painAreas.join(", ") || "no pain"
      }`;
      already.seed = `equipment-audit-${id}`;
      return;
    }
    cases.push({
      id,
      label: `GOLDEN ${spec.primaryMode} / ${spec.experience} / 3d / phase 1 / ${spec.goals} / ${
        spec.painAreas.join(", ") || "no pain"
      }`,
      primaryMode: spec.primaryMode,
      questionnaire: {
        goals: spec.goals,
        painAreas: [...spec.painAreas],
        experience: spec.experience,
        equipment: [...modeValues],
        daysPerWeek: 3,
      },
      phaseIndex: 1,
      seed: `equipment-audit-${id}`,
      goldenManualReview: true,
    });
  });

  return cases;
};

const auditCase = (auditCaseDef: AuditCase): CaseAudit => {
  clearProgramVariationHistory();
  clearProgramConstraintWarningBuffer();

  const capabilityMode = deriveCapabilityMode(auditCaseDef.questionnaire.equipment);
  const resolvedPrimaryMode = resolvePrimaryProgramEquipmentMode(
    auditCaseDef.questionnaire.equipment
  );
  const programCapabilities = deriveProgramCapabilities(
    auditCaseDef.questionnaire.equipment
  );
  const legacyIntentEquipmentMode =
    deriveLegacyHasLoadIntentEquipmentMode(capabilityMode);
  const intentProfile = buildProgramIntentProfile({
    questionnaire: auditCaseDef.questionnaire,
    painSeverity: auditCaseDef.questionnaire.painAreas.length ? "medium" : "low",
    phaseStage:
      auditCaseDef.phaseIndex <= 1
        ? "activation"
        : auditCaseDef.phaseIndex === 2
        ? "skill"
        : "growth",
    experienceLevel:
      auditCaseDef.questionnaire.experience === "Advanced"
        ? "advanced"
        : auditCaseDef.questionnaire.experience === "Intermediate"
        ? "intermediate"
        : "beginner",
    capabilityMode,
  });
  const normalizedEquipment = normalizeEquipmentSelectionValues(
    auditCaseDef.questionnaire.equipment
  );
  const available = normalizeEquipmentSelection(auditCaseDef.questionnaire.equipment).available;

  const program = generateWeeklyProgram(
    auditCaseDef.questionnaire,
    `equipment-audit-${auditCaseDef.id}`,
    {
      phaseIndex: auditCaseDef.phaseIndex,
      seed: auditCaseDef.seed,
    }
  );

  const warnings = getProgramConstraintWarningBuffer()
    .filter((warning) => warning.programId === program.id)
    .map((warning) => ({
      kind: warning.kind,
      dayTitle: warning.dayTitle,
      message: warning.message,
    }));

  const days: DayAudit[] = program.week.map((day) => {
    const exercises = day.routine.map((item) => buildExerciseRow(item, available));
    return {
      title: day.title,
      focusTags: [...(day.focusTags ?? [])],
      exerciseCount: day.routine.length,
      mainCount: day.routine.filter((item) => item.section === "main").length,
      accessoryCount: day.routine.filter((item) => item.section === "accessory").length,
      duplicateExerciseIds: findDayDuplicates(day),
      exercises,
      degradationNotes: [...(day.degradationNotes ?? [])],
    };
  });

  const weeklyCoverage = summarizeWeekCoverage(program.week);
  const weeklyCoverageContract = getWeeklyCoverageContract(
    auditCaseDef.questionnaire.daysPerWeek
  );
  const weeklyCoverageGaps = (
    Object.keys(weeklyCoverageContract) as Array<keyof typeof weeklyCoverageContract>
  )
    .filter((metric) => weeklyCoverage[metric] < weeklyCoverageContract[metric])
    .map((metric) => `${metric} ${weeklyCoverage[metric]}/${weeklyCoverageContract[metric]}`);

  const allRows = days.flatMap((day) => day.exercises);
  const mainRows = allRows.filter((row) => row.section === "main");
  const ineligibleExerciseIds = Array.from(
    new Set(allRows.filter((row) => !row.eligible).map((row) => row.exerciseId))
  ).sort();
  const requiredSupportsObserved = Array.from(
    new Set(allRows.flatMap((row) => row.requiredSupports))
  ).sort();
  const unconfirmedSupports = requiredSupportsObserved.filter(
    (support) => !isSupportConfirmedByCapabilities(support, programCapabilities)
  );
  const coachingDemoGapCount = allRows.filter(
    (row) => row.demoGap || row.coachingGaps.length > 0
  ).length;
  const dayTitles = program.week.map((day) => day.title);
  const templateIdentityMismatch =
    resolvedPrimaryMode !== "gym" && looksGymShapedTemplate(dayTitles);

  const partial: Omit<CaseAudit, "problemFlags"> = {
    id: auditCaseDef.id,
    label: auditCaseDef.label,
    primaryMode: auditCaseDef.primaryMode,
    resolvedPrimaryMode,
    questionnaire: auditCaseDef.questionnaire,
    phaseIndex: auditCaseDef.phaseIndex,
    phaseName: program.phaseName ?? null,
    capabilityMode,
    intentProfileEquipment: intentProfile.equipment,
    legacyIntentEquipmentMode,
    programCapabilities,
    normalizedEquipment,
    availableEquipment: Array.from(available).sort(),
    dayTitles,
    templateIdentityMismatch,
    unconfirmedSupports,
    truthfulMainCount: mainRows.filter((row) => row.truthLevel === "true").length,
    surrogateMainCount: mainRows.filter((row) => row.truthLevel === "surrogate").length,
    supportOnlyMainCount: mainRows.filter((row) => row.truthLevel === "support_only").length,
    days,
    weeklyCoverage,
    weeklyCoverageContract,
    weeklyCoverageGaps,
    duplicateExerciseIdsAcrossWeek: findWeekDuplicates(program),
    coachingDemoGapCount,
    ineligibleExerciseIds,
    requiredSupportsObserved,
    warnings,
    goldenManualReview: Boolean(auditCaseDef.goldenManualReview),
  };

  return {
    ...partial,
    problemFlags: collectProblemFlags(partial),
  };
};

const summarizeCategories = (caseAudits: CaseAudit[]) => {
  const counts: Record<ProblemCategory, number> = {
    structural: 0,
    equipment_legality: 0,
    slot_truth: 0,
    complexity: 0,
    coaching: 0,
    progression: 0,
    ui_comprehension: 0,
  };
  const examples: Record<ProblemCategory, string[]> = {
    structural: [],
    equipment_legality: [],
    slot_truth: [],
    complexity: [],
    coaching: [],
    progression: [],
    ui_comprehension: [],
  };

  caseAudits.forEach((entry) => {
    const seen = new Set<ProblemCategory>();
    entry.problemFlags.forEach((flag) => {
      if (!seen.has(flag.category)) {
        counts[flag.category] += 1;
        seen.add(flag.category);
      }
      if (examples[flag.category].length < 8) {
        examples[flag.category].push(`${entry.id}: ${flag.detail}`);
      }
    });
  });

  return { counts, examples };
};

const renderGoldenMarkdown = (golden: CaseAudit[]): string => {
  const lines: string[] = [
    "# Phase 1 — Twelve Three-Day Golden Personas",
    "",
    "Comparison snapshots after first-class equipment identity. Phase 0 baselines were not overwritten.",
    "",
  ];

  golden.forEach((entry) => {
    lines.push(`## ${entry.label}`);
    lines.push("");
    lines.push(`- Case id: \`${entry.id}\``);
    lines.push(`- Primary mode (audit label): ${entry.primaryMode}`);
    lines.push(`- Resolved primary mode: ${entry.resolvedPrimaryMode}`);
    lines.push(`- Intent profile equipment: ${entry.intentProfileEquipment}`);
    lines.push(`- Legacy hasLoad intent (comparison only): ${entry.legacyIntentEquipmentMode}`);
    lines.push(`- Capability mode (physical bucket): ${entry.capabilityMode}`);
    lines.push(
      `- Capabilities: dumbbells=${entry.programCapabilities.hasDumbbells}, bands=${entry.programCapabilities.hasBands}, bench=${entry.programCapabilities.hasBench}, pullup=${entry.programCapabilities.hasPullupBar}, cables=${entry.programCapabilities.hasCables}, machines=${entry.programCapabilities.hasMachines}, highAnchor=${entry.programCapabilities.hasHighAnchor}, gymAccess=${entry.programCapabilities.hasGymAccess}`
    );
    lines.push(`- Experience: ${entry.questionnaire.experience}`);
    lines.push(`- Goals: ${entry.questionnaire.goals}`);
    lines.push(`- Pain: ${entry.questionnaire.painAreas.join(", ") || "none"}`);
    lines.push(`- Equipment input: ${entry.questionnaire.equipment.join(", ")}`);
    lines.push(`- Normalized selected equipment: ${entry.normalizedEquipment.join(", ")}`);
    lines.push(`- Available after normalize: ${entry.availableEquipment.join(", ")}`);
    lines.push(`- Phase: ${entry.phaseName ?? entry.phaseIndex}`);
    lines.push(`- Day titles: ${entry.dayTitles.join(" | ")}`);
    lines.push(
      `- Template identity mismatch: ${entry.templateIdentityMismatch ? "yes (legacy gym-shaped titles)" : "no"}`
    );
    lines.push(
      `- Main truth mix: true=${entry.truthfulMainCount}, surrogate=${entry.surrogateMainCount}, support_only=${entry.supportOnlyMainCount}`
    );
    lines.push(
      `- Unconfirmed supports: ${entry.unconfirmedSupports.join(", ") || "none"}`
    );
    lines.push(
      `- Weekly coverage gaps: ${entry.weeklyCoverageGaps.join(", ") || "none"}`
    );
    lines.push(
      `- Problem flags: ${
        entry.problemFlags.length
          ? entry.problemFlags.map((flag) => `[${flag.category}] ${flag.detail}`).join(" · ")
          : "none"
      }`
    );
    lines.push("");

    entry.days.forEach((day) => {
      lines.push(`### ${day.title}`);
      lines.push(
        `- Counts: total=${day.exerciseCount}, main=${day.mainCount}, accessory=${day.accessoryCount}`
      );
      if (day.duplicateExerciseIds.length) {
        lines.push(`- Day duplicates: ${day.duplicateExerciseIds.join(", ")}`);
      }
      ["warmup", "activation", "main", "accessory", "cooldown"].forEach((section) => {
        const rows = day.exercises.filter((row) => row.section === section);
        if (!rows.length) return;
        lines.push(`- ${section}:`);
        rows.forEach((row) => {
          lines.push(
            `  - \`${row.exerciseId}\` ${row.name} | slot=${row.slotKind ?? "n/a"} | role=${row.movementRole} | truth=${row.truthLevel} | equip=${row.equipment.join("+") || "n/a"} | supports=${row.requiredSupports.join("+") || "none"} | source=${row.selectionSource ?? "n/a"} | demoGap=${row.demoGap} | coachingGaps=${row.coachingGaps.join(",") || "none"} | complexity=${row.complexity.difficulty ?? row.complexity.difficultyTier ?? row.complexity.experienceMin ?? "n/a"}`
          );
        });
      });
      lines.push("");
    });
  });

  return `${lines.join("\n").trim()}\n`;
};

const renderSummaryMarkdown = (
  caseAudits: CaseAudit[],
  categorySummary: ReturnType<typeof summarizeCategories>,
  elapsedMs: number
): string => {
  const golden = caseAudits.filter((entry) => entry.goldenManualReview);
  const byMode = EQUIPMENT_MODES.map((mode) => {
    const rows = caseAudits.filter((entry) => entry.primaryMode === mode.primaryMode);
    const structural = rows.filter((entry) =>
      entry.problemFlags.some((flag) => flag.category === "structural")
    ).length;
    const legality = rows.filter((entry) =>
      entry.problemFlags.some((flag) => flag.category === "equipment_legality")
    ).length;
    const slotTruth = rows.filter((entry) =>
      entry.problemFlags.some((flag) => flag.category === "slot_truth")
    ).length;
    return {
      mode: mode.primaryMode,
      cases: rows.length,
      structural,
      legality,
      slotTruth,
      identityCorrect: rows.filter(
        (entry) => entry.intentProfileEquipment === entry.resolvedPrimaryMode
      ).length,
      legacyWouldBeGym: rows.filter((entry) => entry.legacyIntentEquipmentMode === "gym")
        .length,
      templateMismatch: rows.filter((entry) => entry.templateIdentityMismatch).length,
      meanCoachingGaps:
        rows.reduce((sum, entry) => sum + entry.coachingDemoGapCount, 0) / Math.max(rows.length, 1),
    };
  });

  const lines: string[] = [
    "# Phase 1 — Equipment Program Identity Audit",
    "",
    "Comparison audit after first-class `PrimaryProgramEquipmentMode`. Phase 0 Markdown/JSON baselines were preserved.",
    "",
    "## Matrix coverage",
    "",
    `- Total cases: ${caseAudits.length}`,
    `- Golden manual-review personas: ${golden.length}`,
    `- Elapsed: ${(elapsedMs / 1000).toFixed(1)}s`,
    "",
    "Covered dimensions:",
    "",
    "- Primary modes: gym, dumbbells, bands, bodyweight, mixedHome",
    "- Experience: Beginner, Intermediate, Advanced",
    "- Days/week: 3, 4, 5",
    "- Phases: activation (1), skill (2), growth (3)",
    "- Pain: none (core matrix), shoulder/upper-back, low-back/hip",
    "- Goals: General fitness (core), Improve posture, Reduce pain, Athletic performance",
    "",
    "## Mode rollup",
    "",
    "| Mode | Cases | Intent identity correct | Legacy hasLoad→gym | Template mismatch | Structural | Legality | Slot-truth | Mean coaching/demo gaps |",
    "|---|---:|---:|---:|---:|---:|---:|---:|---:|",
  ];

  byMode.forEach((row) => {
    lines.push(
      `| ${row.mode} | ${row.cases} | ${row.identityCorrect} | ${row.legacyWouldBeGym} | ${row.templateMismatch} | ${row.structural} | ${row.legality} | ${row.slotTruth} | ${row.meanCoachingGaps.toFixed(1)} |`
    );
  });

  lines.push("");
  lines.push("## Problem categories (cases with ≥1 flag)");
  lines.push("");
  (Object.keys(categorySummary.counts) as ProblemCategory[]).forEach((category) => {
    lines.push(`### ${category} — ${categorySummary.counts[category]} cases`);
    lines.push("");
    if (!categorySummary.examples[category].length) {
      lines.push("- (no flags in this baseline matrix)");
    } else {
      categorySummary.examples[category].forEach((example) => {
        lines.push(`- ${example}`);
      });
    }
    lines.push("");
  });

  const identityCollapseRemaining = caseAudits.filter(
    (entry) =>
      (entry.resolvedPrimaryMode === "dumbbells" ||
        entry.resolvedPrimaryMode === "mixedHome") &&
      entry.intentProfileEquipment === "gym"
  ).length;
  const templateMismatchCount = caseAudits.filter(
    (entry) => entry.templateIdentityMismatch
  ).length;
  const unconfirmedSupportCases = caseAudits.filter(
    (entry) => entry.unconfirmedSupports.length > 0
  ).length;

  lines.push("## Phase 1 identity findings");
  lines.push("");
  lines.push(
    `- Dumbbell/mixedHome intent collapse to gym remaining: **${identityCollapseRemaining}** (target 0).`
  );
  lines.push(
    `- Cases with primary-mode vs gym-shaped template mismatch: **${templateMismatchCount}** (expected until Phase 2–5).`
  );
  lines.push(
    `- Cases with unconfirmed support requirements: **${unconfirmedSupportCases}**.`
  );
  lines.push(
    "- Physical bucket `hasLoad` remains for eligibility/load heuristics, but no longer sets program identity."
  );
  lines.push(
    "- Band anchor / loop / long-band capabilities stay false until questionnaire confirms them."
  );
  lines.push("");
  lines.push("## Artifact paths");
  lines.push("");
  lines.push(`- JSON: \`${path.relative(process.cwd(), JSON_OUT)}\``);
  lines.push(`- Markdown summary: \`${path.relative(process.cwd(), MD_OUT)}\``);
  lines.push(`- Twelve personas: \`${path.relative(process.cwd(), GOLDEN_MD_OUT)}\``);
  lines.push(`- vs Phase 0: \`${path.relative(process.cwd(), COMPARISON_MD_OUT)}\``);
  lines.push(
    "- Preserved Phase 0 baselines: `equipment-program-audit-phase0.json`, `.md`, `-twelve-personas.md`"
  );
  lines.push("");
  lines.push("## Twelve golden persona IDs");
  lines.push("");
  golden.forEach((entry) => {
    lines.push(
      `- \`${entry.id}\` — mode=${entry.resolvedPrimaryMode} / intent=${entry.intentProfileEquipment} / legacy=${entry.legacyIntentEquipmentMode} — ${entry.dayTitles.join(" / ")} — flags=${entry.problemFlags.length}`
    );
  });
  lines.push("");

  return `${lines.join("\n").trim()}\n`;
};

const renderPhaseComparisonMarkdown = (caseAudits: CaseAudit[]): string => {
  const dumbbellRows = caseAudits.filter((entry) => entry.primaryMode === "dumbbells");
  const mixedRows = caseAudits.filter((entry) => entry.primaryMode === "mixedHome");
  const lines = [
    "# Phase 1 vs Phase 0 — Equipment Identity Comparison",
    "",
    "Phase 0 artifacts were not rewritten. This file summarizes the intentional Phase 1 identity change.",
    "",
    "## Intentional behavior changes",
    "",
    "- Added `PrimaryProgramEquipmentMode` and deterministic `resolvePrimaryProgramEquipmentMode`.",
    "- Added `ProgramCapabilities` via `deriveProgramCapabilities` (unknown anchors remain false).",
    "- `ProgramIntentProfile.equipment` now stores the first-class primary mode.",
    "- Selection context carries `primaryEquipmentMode` and `programCapabilities`.",
    "- `hasLoad` no longer maps dumbbells/mixedHome to gym program identity.",
    "",
    "## Identity proof points",
    "",
    `| Slice | Cases | Intent=resolved | Legacy would be gym | Template mismatch |`,
    `|---|---:|---:|---:|---:|`,
    `| dumbbells | ${dumbbellRows.length} | ${dumbbellRows.filter((e) => e.intentProfileEquipment === "dumbbells").length} | ${dumbbellRows.filter((e) => e.legacyIntentEquipmentMode === "gym").length} | ${dumbbellRows.filter((e) => e.templateIdentityMismatch).length} |`,
    `| mixedHome | ${mixedRows.length} | ${mixedRows.filter((e) => e.intentProfileEquipment === "mixedHome").length} | ${mixedRows.filter((e) => e.legacyIntentEquipmentMode === "gym").length} | ${mixedRows.filter((e) => e.templateIdentityMismatch).length} |`,
    "",
    "## Remaining Phase 2–5 work (not repaired here)",
    "",
    "- Legacy gym-shaped 3-day titles still appear for non-gym modes.",
    "- Band pulldowns still schedule without confirmed high-anchor capability.",
    "- Surrogate/support-only vertical-pull mains remain in home modes.",
    "- Pre-existing coverage-matrix / phase-matrix FAIL cases remain untouched.",
    "",
  ];
  return `${lines.join("\n").trim()}\n`;
};

const main = () => {
  const started = Date.now();
  const cases = buildCases();
  const caseAudits = cases.map((entry, index) => {
    if ((index + 1) % 25 === 0 || index === 0) {
      console.error(`[equipmentProgramAudit] ${index + 1}/${cases.length}…`);
    }
    return auditCase(entry);
  });
  const elapsedMs = Date.now() - started;
  const categorySummary = summarizeCategories(caseAudits);
  const golden = caseAudits.filter((entry) => entry.goldenManualReview);

  mkdirSync(OUT_DIR, { recursive: true });

  const jsonPayload = {
    generatedAt: new Date().toISOString(),
    phase: 1,
    objective: "First-class equipment identity comparison audit",
    preservesPhase0Baselines: [
      "docs/dev-reports/equipment-program-audit-phase0.json",
      "docs/dev-reports/equipment-program-audit-phase0.md",
      "docs/dev-reports/equipment-program-audit-phase0-twelve-personas.md",
    ],
    totalCases: caseAudits.length,
    elapsedMs,
    categoryCounts: categorySummary.counts,
    categoryExamples: categorySummary.examples,
    goldenPersonaIds: golden.map((entry) => entry.id),
    identityCollapseRemaining: caseAudits.filter(
      (entry) =>
        (entry.resolvedPrimaryMode === "dumbbells" ||
          entry.resolvedPrimaryMode === "mixedHome") &&
        entry.intentProfileEquipment === "gym"
    ).length,
    templateIdentityMismatchCount: caseAudits.filter(
      (entry) => entry.templateIdentityMismatch
    ).length,
    cases: caseAudits,
  };

  writeFileSync(JSON_OUT, `${JSON.stringify(jsonPayload, null, 2)}\n`, "utf8");
  writeFileSync(MD_OUT, renderSummaryMarkdown(caseAudits, categorySummary, elapsedMs), "utf8");
  writeFileSync(GOLDEN_MD_OUT, renderGoldenMarkdown(golden), "utf8");
  writeFileSync(COMPARISON_MD_OUT, renderPhaseComparisonMarkdown(caseAudits), "utf8");

  console.log(
    JSON.stringify(
      {
        ok: true,
        phase: 1,
        totalCases: caseAudits.length,
        goldenPersonas: golden.length,
        elapsedMs,
        identityCollapseRemaining: jsonPayload.identityCollapseRemaining,
        templateIdentityMismatchCount: jsonPayload.templateIdentityMismatchCount,
        categoryCounts: categorySummary.counts,
        outputs: [
          path.relative(process.cwd(), JSON_OUT),
          path.relative(process.cwd(), MD_OUT),
          path.relative(process.cwd(), GOLDEN_MD_OUT),
          path.relative(process.cwd(), COMPARISON_MD_OUT),
        ],
        preservedPhase0: jsonPayload.preservesPhase0Baselines,
      },
      null,
      2
    )
  );
};

main();
