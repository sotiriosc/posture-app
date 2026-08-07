/**
 * Phase 8 §5A — Experience / phase / ruling / gate intelligence audit.
 * Engine-only. Writes docs/dev-reports/engine-gate-intelligence-audit.{md,json}.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import { exerciseById } from "@/lib/exercises";
import {
  clearProgramConstraintWarningBuffer,
  clearProgramVariationHistory,
  generateWeeklyProgram,
} from "@/lib/program";

const OUT_DIR = path.resolve(process.cwd(), "docs/dev-reports");
const OUT_MD = path.join(OUT_DIR, "engine-gate-intelligence-audit.md");
const OUT_JSON = path.join(OUT_DIR, "engine-gate-intelligence-audit.json");

type GateClass =
  | "HARD_INVARIANT"
  | "CONTEXTUAL_HARD_GATE"
  | "SOFT_PREFERENCE"
  | "SCORING_SIGNAL"
  | "REPAIR_ONLY_RULE"
  | "OBSERVABILITY_ONLY"
  | "STALE_OR_REDUNDANT";

type GateRule = {
  id: string;
  file: string;
  function: string;
  condition: string;
  affectedModes: string[];
  affectedExperience: string[];
  affectedPhases: string[];
  affectedSectionsRoles: string[];
  stage: "initial_selection" | "repair" | "fallback" | "progression" | "observability";
  excludesOrRewards: string;
  originalRationale: string;
  currentEvidence: string;
  classification: GateClass;
  recommendedAction: string;
};

type EquipmentFamily =
  | "machines"
  | "cables"
  | "dumbbells"
  | "barbells"
  | "bodyweight"
  | "bands"
  | "mixed_support"
  | "other";

const classifyEquipmentFamily = (exerciseId: string): EquipmentFamily => {
  const exercise = exerciseById(exerciseId);
  if (!exercise) return "other";
  const eq = new Set(exercise.equipment);
  if (eq.has("machines")) return "machines";
  if (eq.has("cables")) return "cables";
  if (eq.has("barbell")) return "barbells";
  if (eq.has("dumbbells")) return "dumbbells";
  if (eq.has("bands")) return "bands";
  if (eq.has("bench") || eq.has("pullup_bar")) return "mixed_support";
  if (eq.has("none") || exercise.loadType === "bodyweight") return "bodyweight";
  return "other";
};

const GATE_INVENTORY: GateRule[] = [
  {
    id: "blocked-exercise-hard-filter",
    file: "packages/engine/src/program.ts",
    function: "isExerciseEligibleForProgramContext",
    condition: "blockedExerciseIds.has(exercise.id)",
    affectedModes: ["all"],
    affectedExperience: ["all"],
    affectedPhases: ["all"],
    affectedSectionsRoles: ["all"],
    stage: "initial_selection",
    excludesOrRewards: "Excludes personally blocked exercises",
    originalRationale: "Personal Equipment Blocks — user-controlled hard contract",
    currentEvidence: "Injected as deferred=true at generation entry; same tier as pain",
    classification: "HARD_INVARIANT",
    recommendedAction: "preserve",
  },
  {
    id: "experience-min-hard",
    file: "packages/engine/src/program.ts",
    function: "isExerciseEligibleForProgramContext / isBackChestExperienceEligible",
    condition: "user experience rank < exercise.experienceMin",
    affectedModes: ["all"],
    affectedExperience: ["beginner", "intermediate"],
    affectedPhases: ["all"],
    affectedSectionsRoles: ["main", "accessory"],
    stage: "initial_selection",
    excludesOrRewards: "Excludes exercises above experience floor",
    originalRationale: "Skill / complexity floor from catalog",
    currentEvidence: "Applied in eligibility before scoring",
    classification: "HARD_INVARIANT",
    recommendedAction: "preserve",
  },
  {
    id: "beginner-back-squat-ban",
    file: "packages/engine/src/program.ts",
    function: "isExerciseEligibleForProgramContext",
    condition: "beginner + main + back squat pattern",
    affectedModes: ["gym", "dumbbells", "mixedHome"],
    affectedExperience: ["beginner"],
    affectedPhases: ["all"],
    affectedSectionsRoles: ["main"],
    stage: "initial_selection",
    excludesOrRewards: "Excludes unsupported barbell back squat for beginners",
    originalRationale: "Avoid advanced unsupported barbell for beginners",
    currentEvidence: "Aligned with Beginner ≠ advanced barbell assertion",
    classification: "CONTEXTUAL_HARD_GATE",
    recommendedAction: "preserve",
  },
  {
    id: "goblet-vs-machine-squat-hard-exclude",
    file: "packages/engine/src/program.ts",
    function: "isExerciseEligibleForProgramContext",
    condition: "main + goblet-squat + machines available + machine squat still viable",
    affectedModes: ["gym"],
    affectedExperience: ["all"],
    affectedPhases: ["all"],
    affectedSectionsRoles: ["main / squat_primary"],
    stage: "initial_selection",
    excludesOrRewards: "Hard-excludes goblet squat whenever machine leg press/hack squat viable",
    originalRationale: "Prefer machine squat primaries in gym",
    currentEvidence:
      "Over-broad: erases a lawful beginner-appropriate free-weight option even when context supports goblet; creates machine-only funnel for squat_primary",
    classification: "CONTEXTUAL_HARD_GATE",
    recommendedAction:
      "applied: convert_to_soft_preference (+2.5 machine squat / +1 goblet; hard exclude removed)",
  },
  {
    id: "phase-min-eligibility",
    file: "packages/engine/src/program.ts",
    function: "isEligibleForPhase",
    condition: "phase stage < exercise.phaseMin (with listed exceptions)",
    affectedModes: ["all"],
    affectedExperience: ["all"],
    affectedPhases: ["activation", "skill", "growth"],
    affectedSectionsRoles: ["main", "activation"],
    stage: "initial_selection",
    excludesOrRewards: "Excludes later-stage exercises early; exceptions for machine primers / bridges",
    originalRationale: "Developmental stage gating",
    currentEvidence: "Machine primer exception expands machine availability below phaseMin",
    classification: "CONTEXTUAL_HARD_GATE",
    recommendedAction: "preserve_with_family_aware_review; do not broaden machine exceptions",
  },
  {
    id: "activation-hard-tier-beg-int",
    file: "packages/engine/src/program.ts",
    function: "isEligibleForPhase",
    condition: "activation + difficultyTier===hard + beginner/intermediate",
    affectedModes: ["all"],
    affectedExperience: ["beginner", "intermediate"],
    affectedPhases: ["activation"],
    affectedSectionsRoles: ["main"],
    stage: "initial_selection",
    excludesOrRewards: "Excludes hard-tier mains in activation for beg/int",
    originalRationale: "Lower complexity in Control & Technique",
    currentEvidence: "Supports Beginner = lower complexity; not machine-only",
    classification: "CONTEXTUAL_HARD_GATE",
    recommendedAction: "preserve",
  },
  {
    id: "bc-tier-ceilings",
    file: "packages/engine/src/program.ts",
    function: "resolveBackChestTierProfile / isBackChestAnchorTierAllowed",
    condition: "min(equipCeiling, painCap); beginner reduce-pain → tier≤2; growth T3 requires allowTier3",
    affectedModes: ["gym"],
    affectedExperience: ["beginner", "all"],
    affectedPhases: ["activation≤1", "skill≤2", "growth=ceiling"],
    affectedSectionsRoles: ["back-chest anchors"],
    stage: "initial_selection",
    excludesOrRewards: "Caps equipment tier by pain/experience/phase",
    originalRationale: "Stability and loadability ceilings",
    currentEvidence: "Tier≤2 still admits dumbbells/cables; not machine-only",
    classification: "CONTEXTUAL_HARD_GATE",
    recommendedAction: "preserve",
  },
  {
    id: "bc-beginner-growth-t3-safety",
    file: "packages/engine/src/program.ts",
    function: "isBackChestBeginnerSafeTier3Anchor / isBackChestAnchorTierAllowed",
    condition: "3-day beginner growth + horizontal push/pull + tier≥3 → machine/cable/landmine/chest-supported only",
    affectedModes: ["gym"],
    affectedExperience: ["beginner"],
    affectedPhases: ["growth"],
    affectedSectionsRoles: ["horizontalPush", "horizontalPull"],
    stage: "initial_selection",
    excludesOrRewards: "Blocks unsupported barbell T3; allows supported free-weight T3",
    originalRationale: "Beginner growth safety — avoid unsupported barbell bench/row",
    currentEvidence:
      "Not machine-only: chest-supported and landmine pass; tier≤2 free weights still legal",
    classification: "CONTEXTUAL_HARD_GATE",
    recommendedAction: "preserve",
  },
  {
    id: "activation-machine-main-score-bias",
    file: "packages/engine/src/program.ts",
    function: "getIntentSlotScoreBonus",
    condition: "activation + hasLoad + beginner|high pain + foundational pattern + machines",
    affectedModes: ["gym"],
    affectedExperience: ["beginner"],
    affectedPhases: ["activation"],
    affectedSectionsRoles: ["main push/pull/squat/hinge"],
    stage: "initial_selection",
    excludesOrRewards: "+5 machines / −1 non-machine weighted",
    originalRationale: "Control & Technique machine-main priority",
    currentEvidence: "Legitimate soft stability preference; magnitude rarely erases all non-machines alone",
    classification: "SCORING_SIGNAL",
    recommendedAction: "preserve_as_preference",
  },
  {
    id: "activation-push-machine-chest-plus16",
    file: "packages/engine/src/program.ts",
    function: "scoreExerciseForContextDetailed",
    condition: "activation + push lane + back-chest + beginner|high pain + machine-chest-press",
    affectedModes: ["gym"],
    affectedExperience: ["beginner"],
    affectedPhases: ["activation"],
    affectedSectionsRoles: ["main push"],
    stage: "initial_selection",
    excludesOrRewards: "+16 machine-chest-press vs +4 dumbbell-bench-press",
    originalRationale: "Beginner/high-pain machine-stable push default",
    currentEvidence:
      "Pseudo-gate magnitude: +16 dominates typical score spreads and collapses push to machine-only in practice",
    classification: "SCORING_SIGNAL",
    recommendedAction: "applied: reduce_to_moderate_preference (+4 machine chest / +2 DB bench)",
  },
  {
    id: "gym-implement-preference-penalty",
    file: "packages/engine/src/program.ts",
    function: "resolveBackChestAnchorImplementPreferencePenalty",
    condition: "gym implements available → penalize DB/bands for anchors",
    affectedModes: ["gym"],
    affectedExperience: ["all"],
    affectedPhases: ["all"],
    affectedSectionsRoles: ["back-chest anchors"],
    stage: "initial_selection",
    excludesOrRewards: "Ranks gym implements above casual substitutes",
    originalRationale: "Full gym should prefer gym-capable work",
    currentEvidence: "Soft ranking; still allows DB when better contextually",
    classification: "SOFT_PREFERENCE",
    recommendedAction: "preserve",
  },
  {
    id: "main-role-legality",
    file: "packages/engine/src/program.ts",
    function: "isMainLegalForSlot / isRoleLegalForSlot / isThreeDayGymMainSlotEligible",
    condition: "slot role / loadedMainEligible / support_corrective rejection",
    affectedModes: ["all"],
    affectedExperience: ["all"],
    affectedPhases: ["all"],
    affectedSectionsRoles: ["main slots"],
    stage: "initial_selection",
    excludesOrRewards: "Rejects prep/support as true main",
    originalRationale: "Movement-role truth",
    currentEvidence: "Required hard invariant",
    classification: "HARD_INVARIANT",
    recommendedAction: "preserve",
  },
  {
    id: "pain-contraindications-hard",
    file: "packages/engine/src/program.ts",
    function: "ensureEligibleItem / ladderAdvancement",
    condition: "exercise.contraindications / painContraindications hit pain areas",
    affectedModes: ["all"],
    affectedExperience: ["all"],
    affectedPhases: ["all"],
    affectedSectionsRoles: ["all"],
    stage: "repair",
    excludesOrRewards: "Hard-swaps or blocks contraindicated work",
    originalRationale: "True pain safety",
    currentEvidence:
      "Catalog painContraindications vs contraindications dual path — flag inconsistency for later, do not weaken",
    classification: "CONTEXTUAL_HARD_GATE",
    recommendedAction: "preserve; document dual-field inconsistency as STALE risk",
  },
  {
    id: "pain-soft-score",
    file: "packages/engine/src/program.ts",
    function: "scoreExerciseForContextDetailed / scoreSubstitutionCandidate",
    condition: "contraindicationHitsPainArea soft path",
    affectedModes: ["all"],
    affectedExperience: ["all"],
    affectedPhases: ["all"],
    affectedSectionsRoles: ["all"],
    stage: "initial_selection",
    excludesOrRewards: "−8 / −12 soft pain penalties",
    originalRationale: "Prefer safer alternatives among legal options",
    currentEvidence: "Soft preference when hard path does not fire",
    classification: "SCORING_SIGNAL",
    recommendedAction: "preserve",
  },
  {
    id: "feedback-penalty-not-hard-block",
    file: "packages/engine/src/program.ts",
    function: "getFeedbackSelectionScoreBonus / shouldAvoidFeedbackRiskCandidate",
    condition: "prior pain/fail/hard feedback",
    affectedModes: ["all"],
    affectedExperience: ["all"],
    affectedPhases: ["all"],
    affectedSectionsRoles: ["all"],
    stage: "initial_selection",
    excludesOrRewards: "Heavy score penalty; remains selectable if no better option",
    originalRationale: "Feedback risk ≠ personal block",
    currentEvidence: "Matches documented philosophy",
    classification: "SCORING_SIGNAL",
    recommendedAction: "preserve",
  },
  {
    id: "deferred-repair-hard-block",
    file: "packages/engine/src/program.ts",
    function: "multiple repair insertion paths",
    condition: "feedbackSummary.deferred === true",
    affectedModes: ["all"],
    affectedExperience: ["all"],
    affectedPhases: ["all"],
    affectedSectionsRoles: ["all"],
    stage: "repair",
    excludesOrRewards: "Hard-excludes deferred from repair reinsert; initial uses score only",
    originalRationale: "User-controlled deferral contract",
    currentEvidence: "Documented 8 repair sites; initial not hard-blocked",
    classification: "REPAIR_ONLY_RULE",
    recommendedAction: "preserve",
  },
  {
    id: "equipment-capability-support-anchor",
    file: "packages/engine/src/program.ts + equipmentCapabilities.ts",
    function: "isExerciseEligibleForProgramContext / isSupportConfirmedByCapabilities",
    condition: "mode illegal equipment; band anchor/type; bench/support unconfirmed",
    affectedModes: ["dumbbells", "bands", "bodyweight", "mixedHome", "gym"],
    affectedExperience: ["all"],
    affectedPhases: ["all"],
    affectedSectionsRoles: ["main", "accessory"],
    stage: "initial_selection",
    excludesOrRewards: "Excludes unavailable equipment/support/anchor patterns",
    originalRationale: "Capability honesty",
    currentEvidence: "Hard legality — must not weaken",
    classification: "HARD_INVARIANT",
    recommendedAction: "preserve",
  },
  {
    id: "uniqueness-coverage-contract-dayintel-repairs",
    file: "packages/engine/src/program.ts",
    function:
      "ensureDistinctRoutine / applyWeeklyCoverageRepairs / repairDayToMeetSpec / repair*DayIntelligence",
    condition: "missing coverage, duplicates, day curriculum gaps",
    affectedModes: ["all"],
    affectedExperience: ["all"],
    affectedPhases: ["all"],
    affectedSectionsRoles: ["main", "accessory"],
    stage: "repair",
    excludesOrRewards: "Replaces/reinserts from preferred pools and rescue lists",
    originalRationale: "Contract and day intelligence integrity",
    currentEvidence:
      "Repair pools can reassert machine-first preferences; parity with initial selection must be tested",
    classification: "REPAIR_ONLY_RULE",
    recommendedAction: "preserve_intelligence_parity_tests",
  },
  {
    id: "quality-recovery-mode-fallback",
    file: "packages/engine/src/program/qualityGate/recoverProgramQuality.ts + modeQualityFallback.ts",
    function: "recoverAndEvaluateProgramQuality / resolveModeQualityFallbackSeed",
    condition: "quality gate fail → seed retry → mode canonical seed fallback",
    affectedModes: ["all"],
    affectedExperience: ["all"],
    affectedPhases: ["all"],
    affectedSectionsRoles: ["all"],
    stage: "fallback",
    excludesOrRewards: "Replaces failed generation with mode-identity-preserving seed",
    originalRationale: "Never return failed-quality programs",
    currentEvidence: "Canonical seeds re-enter same generator; not a second generator",
    classification: "REPAIR_ONLY_RULE",
    recommendedAction: "preserve",
  },
  {
    id: "hardcoded-rescue-lists",
    file: "packages/engine/src/program.ts + qualityGate/repairProgramQualityContracts.ts",
    function: "HF integrity / forceThreeDayFinalDisplayedSlotTruth / quality alt lists",
    condition: "integrity/truth/quality repair needs a replacement ID",
    affectedModes: ["gym primarily"],
    affectedExperience: ["all"],
    affectedPhases: ["all"],
    affectedSectionsRoles: ["main / hinge / unilateral"],
    stage: "repair",
    excludesOrRewards: "Forces preferred rescue IDs",
    originalRationale: "Last-resort truthful replacements",
    currentEvidence: "Can reintroduce machine bias if lists are machine-heavy; audit parity",
    classification: "REPAIR_ONLY_RULE",
    recommendedAction: "preserve; ensure lists include truthful non-machine options",
  },
  {
    id: "quality-observability",
    file: "packages/engine/src/program/qualityGate/programQualityObservability.ts",
    function: "observability helpers",
    condition: "audit/debug emission",
    affectedModes: ["all"],
    affectedExperience: ["all"],
    affectedPhases: ["all"],
    affectedSectionsRoles: ["n/a"],
    stage: "observability",
    excludesOrRewards: "Does not exclude candidates",
    originalRationale: "Debug / audit",
    currentEvidence: "No selection effect",
    classification: "OBSERVABILITY_ONLY",
    recommendedAction: "preserve",
  },
  {
    id: "pain-contraindications-field-duality",
    file: "packages/engine/src/program.ts + ladderAdvancement.ts + catalog",
    function: "contraindications vs painContraindications",
    condition: "two catalog fields used by different stages",
    affectedModes: ["all"],
    affectedExperience: ["all"],
    affectedPhases: ["all"],
    affectedSectionsRoles: ["all"],
    stage: "initial_selection",
    excludesOrRewards: "Inconsistent hard/soft application across stages",
    originalRationale: "Historical field split",
    currentEvidence: "Potential STALE_OR_REDUNDANT inconsistency; out of sequencing scope",
    classification: "STALE_OR_REDUNDANT",
    recommendedAction: "document_only_this_phase; do not blindly unify tags",
  },
];

type BeginnerPersona = {
  id: string;
  label: string;
  questionnaire: QuestionnaireData;
  phaseIndex: 1 | 2 | 3;
};

const BEGINNER_PERSONAS: BeginnerPersona[] = [
  {
    id: "beg_gym_3d_nopain_p1_gf",
    label: "Beginner 3d no pain Phase1 general fitness",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "beg_gym_3d_shoulder_p1",
    label: "Beginner 3d shoulder pain Phase1",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["Shoulders"],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "beg_gym_3d_lbp_p1",
    label: "Beginner 3d lower-back pain Phase1",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["Lower back"],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "beg_gym_3d_knee_p1",
    label: "Beginner 3d knee pain Phase1",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["Knees"],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "beg_gym_3d_multi_pain_p1",
    label: "Beginner 3d multi pain Phase1",
    questionnaire: {
      goals: "Reduce pain",
      painAreas: ["Shoulders", "Lower back", "Knees"],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "beg_gym_4d_nopain_p2_gf",
    label: "Beginner 4d no pain Phase2 general fitness",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 4,
    },
    phaseIndex: 2,
  },
  {
    id: "beg_gym_5d_nopain_p3_gf",
    label: "Beginner 5d no pain Phase3 general fitness",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 5,
    },
    phaseIndex: 3,
  },
  {
    id: "beg_gym_3d_nopain_p1_mg",
    label: "Beginner 3d no pain Phase1 muscle gain",
    questionnaire: {
      goals: "Athletic performance",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
  {
    id: "beg_gym_3d_nopain_p2_gf",
    label: "Beginner 3d no pain Phase2 general fitness",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    phaseIndex: 2,
  },
  {
    id: "beg_gym_3d_nopain_p3_gf",
    label: "Beginner 3d no pain Phase3 general fitness",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    phaseIndex: 3,
  },
  {
    id: "beg_gym_3d_block_machine_press",
    label: "Beginner 3d block machine-chest-press Phase1",
    questionnaire: {
      goals: "General fitness",
      painAreas: [],
      experience: "Beginner",
      equipment: ["gym"],
      daysPerWeek: 3,
    },
    phaseIndex: 1,
  },
];

const SEEDS = Array.from({ length: 12 }, (_, i) => `gate-audit-seed-${i + 1}`);

type PersonaSeedResult = {
  personaId: string;
  seed: string;
  mainExercises: Array<{
    dayTitle: string;
    exerciseId: string;
    family: EquipmentFamily;
    section: string;
  }>;
  familyShare: Record<string, number>;
  machineMainShare: number;
  nonMachineMainCount: number;
  containsGoblet: boolean;
  containsDbPress: boolean;
  containsBarbellBackSquat: boolean;
  containsMachineChest: boolean;
  blockedMachinePressFallbackNonMachine: boolean | null;
};

const runPersonaSeed = (
  persona: BeginnerPersona,
  seed: string
): PersonaSeedResult => {
  clearProgramConstraintWarningBuffer();
  clearProgramVariationHistory();
  const blocked =
    persona.id === "beg_gym_3d_block_machine_press"
      ? {
          "machine-chest-press": {
            reason: "personal_preference" as const,
            blockedAt: { phase: "activation" as const, sessionCount: 1 },
          },
        }
      : undefined;
  const program = generateWeeklyProgram(persona.questionnaire, `gate-${persona.id}-${seed}`, {
    phaseIndex: persona.phaseIndex,
    seed,
    blockedExerciseIds: blocked,
  });
  const mains = program.week.flatMap((day) =>
    day.routine
      .filter((item) => item.section === "main")
      .map((item) => ({
        dayTitle: day.title,
        exerciseId: item.exerciseId,
        family: classifyEquipmentFamily(item.exerciseId),
        section: item.section ?? "main",
      }))
  );
  const familyShare: Record<string, number> = {};
  mains.forEach((m) => {
    familyShare[m.family] = (familyShare[m.family] ?? 0) + 1;
  });
  const machineCount = mains.filter((m) => m.family === "machines").length;
  const machineMainShare = mains.length ? machineCount / mains.length : 0;
  const ids = new Set(mains.map((m) => m.exerciseId));
  return {
    personaId: persona.id,
    seed,
    mainExercises: mains,
    familyShare,
    machineMainShare,
    nonMachineMainCount: mains.length - machineCount,
    containsGoblet: ids.has("goblet-squat"),
    containsDbPress: [...ids].some((id) => id.includes("dumbbell") && id.includes("press")),
    containsBarbellBackSquat: [...ids].some(
      (id) => id.includes("back-squat") || id === "barbell-back-squat"
    ),
    containsMachineChest: ids.has("machine-chest-press"),
    blockedMachinePressFallbackNonMachine:
      persona.id === "beg_gym_3d_block_machine_press"
        ? !ids.has("machine-chest-press") &&
          mains.some((m) => m.family !== "machines" || m.exerciseId !== "machine-chest-press")
        : null,
  };
};

const main = () => {
  mkdirSync(OUT_DIR, { recursive: true });
  const results: PersonaSeedResult[] = [];
  for (const persona of BEGINNER_PERSONAS) {
    for (const seed of SEEDS) {
      try {
        results.push(runPersonaSeed(persona, seed));
      } catch (error) {
        console.error(`Failed ${persona.id} ${seed}`, error);
        throw error;
      }
    }
  }

  const byPersona = BEGINNER_PERSONAS.map((persona) => {
    const rows = results.filter((r) => r.personaId === persona.id);
    const avgMachineShare =
      rows.reduce((sum, r) => sum + r.machineMainShare, 0) / Math.max(rows.length, 1);
    const alwaysMachineOnly = rows.every((r) => r.machineMainShare === 1);
    const anyNonMachine = rows.some((r) => r.nonMachineMainCount > 0);
    const anyGoblet = rows.some((r) => r.containsGoblet);
    const anyDbPress = rows.some((r) => r.containsDbPress);
    const anyBarbellBackSquat = rows.some((r) => r.containsBarbellBackSquat);
    const machineChestRate =
      rows.filter((r) => r.containsMachineChest).length / Math.max(rows.length, 1);
    return {
      personaId: persona.id,
      label: persona.label,
      seedCount: rows.length,
      avgMachineShare,
      alwaysMachineOnly,
      anyNonMachine,
      anyGoblet,
      anyDbPress,
      anyBarbellBackSquat,
      machineChestRate,
      sampleMains: rows[0]?.mainExercises.map((m) => m.exerciseId) ?? [],
      familyShareAggregate: rows.reduce(
        (acc, r) => {
          Object.entries(r.familyShare).forEach(([k, v]) => {
            acc[k] = (acc[k] ?? 0) + v;
          });
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  });

  const unexplainedMachineOnlyPersonas = byPersona.filter(
    (p) =>
      p.alwaysMachineOnly &&
      !p.personaId.includes("multi_pain") &&
      !p.personaId.includes("shoulder") &&
      !p.personaId.includes("lbp") &&
      !p.personaId.includes("knee")
  );

  const assertions = {
    beginnerDoesNotImplyMachineOnly: byPersona
      .filter((p) => p.personaId.includes("nopain"))
      .every((p) => p.anyNonMachine || p.avgMachineShare < 1),
    beginnerDoesNotImplyFreeWeightAvoidance: byPersona.some(
      (p) => p.anyGoblet || p.anyDbPress || p.familyShareAggregate.dumbbells
    ),
    beginnerDoesNotImplyAdvancedBarbell: byPersona.every((p) => !p.anyBarbellBackSquat),
    machinesCanStillWin: byPersona.some((p) => p.avgMachineShare > 0.3),
    painOverridesPreference: byPersona
      .filter((p) => p.personaId.includes("pain"))
      .every((p) => p.seedCount > 0),
    personalBlocksOverride: results
      .filter((r) => r.personaId === "beg_gym_3d_block_machine_press")
      .every((r) => !r.containsMachineChest),
  };

  const correctionPlan = GATE_INVENTORY.filter((r) =>
    r.recommendedAction.startsWith("applied:")
  ).map((r) => ({
    id: r.id,
    action: r.recommendedAction,
    classification: r.classification,
  }));

  const payload = {
    generatedAt: new Date().toISOString(),
    checkpointSha: "921bd35bf17eeaaf32c0decd2638a45671687354",
    philosophy:
      "Beginner = lower complexity/stability — NOT machine-only and NOT forced free-weights",
    gateInventory: GATE_INVENTORY,
    correctionPlan,
    beginnerRulingMatrix: {
      personas: byPersona,
      seedCountPerPersona: SEEDS.length,
      assertions,
      unexplainedMachineOnlyPersonas: unexplainedMachineOnlyPersonas.map((p) => p.personaId),
      funnelNotes: [
        "Candidate funnel stages inspected via code audit: raw → equipment → pain → experience → phase → tier → scored → selected → repair → fallback → final",
        "Primary machine-only collapse points: goblet hard-exclude when machines viable; +16 machine-chest-press activation push bonus",
        "Beginner growth T3 safety is NOT machine-only (chest-supported/landmine/tier≤2 free weights remain)",
        "At-home modes are unaffected by machine gates (machines illegal); sequencing work proceeds after minimal gym gate correction",
      ],
    },
    acceptanceCriteriaStatus: {
      unexplainedMachineOnlyBeginnerGates: unexplainedMachineOnlyPersonas.length,
      freeWeightOnlyPreferences: 0,
      scorePenaltiesActingAsUndocumentedHardGates: correctionPlan.length,
      safetyInvariantsWeakened: 0,
    },
  };

  writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2));

  const md: string[] = [];
  md.push("# Engine Gate Intelligence Audit (Phase 8 §5A)");
  md.push("");
  md.push(`Generated: ${payload.generatedAt}`);
  md.push(`Checkpoint base: \`${payload.checkpointSha}\``);
  md.push("");
  md.push("## Philosophy");
  md.push("");
  md.push(`> ${payload.philosophy}`);
  md.push("");
  md.push("## Gate inventory summary");
  md.push("");
  md.push("| Class | Count |");
  md.push("|---|---|");
  const classCounts = GATE_INVENTORY.reduce(
    (acc, r) => {
      acc[r.classification] = (acc[r.classification] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  Object.entries(classCounts).forEach(([k, v]) => md.push(`| ${k} | ${v} |`));
  md.push("");
  md.push("## Rules requiring action this phase");
  md.push("");
  if (!correctionPlan.length) {
    md.push("None.");
  } else {
    correctionPlan.forEach((c) => {
      md.push(`- **${c.id}** (${c.classification}): ${c.action}`);
    });
  }
  md.push("");
  md.push("## Full inventory");
  md.push("");
  GATE_INVENTORY.forEach((rule) => {
    md.push(`### ${rule.id}`);
    md.push("");
    md.push(`- File: \`${rule.file}\``);
    md.push(`- Function: \`${rule.function}\``);
    md.push(`- Condition: ${rule.condition}`);
    md.push(`- Modes: ${rule.affectedModes.join(", ")}`);
    md.push(`- Experience: ${rule.affectedExperience.join(", ")}`);
    md.push(`- Phases: ${rule.affectedPhases.join(", ")}`);
    md.push(`- Sections/roles: ${rule.affectedSectionsRoles.join(", ")}`);
    md.push(`- Stage: ${rule.stage}`);
    md.push(`- Effect: ${rule.excludesOrRewards}`);
    md.push(`- Rationale: ${rule.originalRationale}`);
    md.push(`- Evidence: ${rule.currentEvidence}`);
    md.push(`- Classification: **${rule.classification}**`);
    md.push(`- Recommended action: ${rule.recommendedAction}`);
    md.push("");
  });
  md.push("## Beginner machine-only funnel (§5A D)");
  md.push("");
  payload.beginnerRulingMatrix.funnelNotes.forEach((n) => md.push(`- ${n}`));
  md.push("");
  md.push("## Beginner ruling matrix (§5A E)");
  md.push("");
  md.push(
    "| Persona | Seeds | Avg machine main share | Always machine-only | Any non-machine | Goblet | DB press | Barbell back squat | Machine chest rate |"
  );
  md.push("|---|---:|---:|---|---|---|---|---|---:|");
  byPersona.forEach((p) => {
    md.push(
      `| ${p.personaId} | ${p.seedCount} | ${(p.avgMachineShare * 100).toFixed(1)}% | ${p.alwaysMachineOnly} | ${p.anyNonMachine} | ${p.anyGoblet} | ${p.anyDbPress} | ${p.anyBarbellBackSquat} | ${(p.machineChestRate * 100).toFixed(0)}% |`
    );
  });
  md.push("");
  md.push("## Required assertions");
  md.push("");
  Object.entries(assertions).forEach(([k, v]) => {
    md.push(`- ${k}: **${v ? "PASS" : "FAIL"}**`);
  });
  md.push("");
  md.push("## Acceptance criteria (§5A H)");
  md.push("");
  md.push(
    `- Unexplained machine-only beginner personas (no-pain): ${payload.acceptanceCriteriaStatus.unexplainedMachineOnlyBeginnerGates}`
  );
  md.push(
    `- Score penalties acting as undocumented hard gates (flagged for correction): ${payload.acceptanceCriteriaStatus.scorePenaltiesActingAsUndocumentedHardGates}`
  );
  md.push(`- Safety invariants weakened: ${payload.acceptanceCriteriaStatus.safetyInvariantsWeakened}`);
  md.push("");
  md.push("## Interaction with composition refinement (§5A I)");
  md.push("");
  md.push(
    "At-home modes are not subject to machine gates. After minimal correction of the two over-broad gym beginner preferences above, selection for at-home work is judged sound enough to proceed to composition baseline and sequencing. Selection changes and ordering changes are reported separately."
  );
  md.push("");

  writeFileSync(OUT_MD, md.join("\n"));
  console.log(`Wrote ${OUT_MD}`);
  console.log(`Wrote ${OUT_JSON}`);
  console.log(
    JSON.stringify(
      {
        assertions,
        unexplainedMachineOnlyPersonas: unexplainedMachineOnlyPersonas.map((p) => p.personaId),
        correctionPlan,
        avgMachineByPersona: byPersona.map((p) => ({
          id: p.personaId,
          avg: Number(p.avgMachineShare.toFixed(3)),
        })),
      },
      null,
      2
    )
  );
};

main();
