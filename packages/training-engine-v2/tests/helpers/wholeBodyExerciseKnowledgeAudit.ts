import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  ANCHORED_BANDS_EQUIPMENT,
  BANDS_WITHOUT_ANCHOR_EQUIPMENT,
  BODYWEIGHT_EQUIPMENT,
  DUMBBELLS_AND_BENCH_EQUIPMENT,
  DUMBBELLS_NO_BENCH_EQUIPMENT,
  FULL_GYM_EQUIPMENT,
  LOOP_BANDS_ONLY_EQUIPMENT,
  MIXED_HOME_EQUIPMENT,
  MUSCLE_GROUPS,
  PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES,
  evaluateEquipmentRequirement,
  type EquipmentCapabilities,
  type ExerciseDefinition,
  type ExerciseActionFunction,
  type MovementRole,
  type MuscleGroup,
  type SessionSection,
  type TrainingRole,
} from "../../src";
import { buildContextualPhaseActivationRootCauseData } from "./contextualPhaseActivationRootCause";
import { buildStableAdaptiveProgrammingPolicyData } from "./stableAdaptiveProgrammingPolicy";
import { buildTrainingSafetyAndResponseFoundationData } from "./trainingSafetyAndResponseFoundation";

export const WHOLE_BODY_AUDIT_AS_OF = "2026-08-12";
export const PRODUCTION_RANKING_FINGERPRINT =
  "d218c647c71af0fc6ae86ad9032065d37aa3006239c6dfce959483f9ebecf7f7";
export const COMPREHENSIVE_BEHAVIOR_FINGERPRINT =
  "1e9abd5713469223636ead6edfdd3a7a5725027529e58a33b476ac9a0753bd1e";

export type RolePurityClassification =
  | "SELECTION_ROLE_TRUTHFUL"
  | "MECHANICALLY_RELATED_BUT_NOT_SLOT_TRUTH"
  | "MUSCLE_ASSOCIATION_WRONG_OWNER"
  | "AMBIGUOUS_ROLE_SEMANTICS"
  | "ROLE_REVIEW_NOT_REQUIRED";

export type RowStatus =
  | "READY_AS_CURRENT_CANDIDATE"
  | "READY_WITH_NONBLOCKING_UNKNOWNS"
  | "TARGETED_METADATA_CURATION_REQUIRED"
  | "ROLE_OWNERSHIP_FIX_REQUIRED"
  | "MUSCLE_RELATIONSHIP_FIX_REQUIRED"
  | "IDENTITY_BOUNDARY_REVIEW_REQUIRED"
  | "STRESS_OR_MECHANICS_REVIEW_REQUIRED"
  | "DUPLICATE_OR_LOW_MARGINAL_VALUE_REVIEW"
  | "MATERIAL_CANDIDATE_INTELLIGENCE_GAP";

export type PoolClassification =
  | "SUFFICIENT_AND_DISTINCT"
  | "SUFFICIENT_BUT_METADATA_THIN"
  | "THIN_BUT_USABLE"
  | "SINGLE_CANDIDATE_DEPENDENCY"
  | "BOOTSTRAP_CANDIDATE_REQUIRED"
  | "DOMAIN_MODEL_BLOCKS_TRUTHFUL_POOL"
  | "NOT_REQUIRED_IN_THIS_CONTEXT";

type ArchetypeKind = "major_pattern" | "direct_accessory" | "preparation" | "capacity_recovery";

interface NeedArchetype {
  readonly id: string;
  readonly label: string;
  readonly kind: ArchetypeKind;
  readonly requestedRole: TrainingRole;
  readonly requestedSection: SessionSection;
  readonly movementRoles: readonly MovementRole[];
  readonly muscles: readonly MuscleGroup[];
  readonly primaryRequired?: boolean;
  readonly exactIdentityIds?: readonly string[];
  readonly actionRequirement?: ExerciseActionFunction;
  readonly contexts: readonly string[];
  readonly notRequiredIn?: readonly string[];
}

interface EnvironmentFixture {
  readonly id: string;
  readonly label: string;
  readonly equipment: EquipmentCapabilities;
}

interface ProposedConcept {
  readonly priority: "P0" | "P1";
  readonly id: string;
  readonly identity: string;
  readonly identityBoundary: string;
  readonly family: string;
  readonly movementRoles: readonly string[];
  readonly trainingRoles: readonly string[];
  readonly sections: readonly string[];
  readonly primaryMuscles: readonly string[];
  readonly secondaryMuscles: readonly string[];
  readonly incidentalContributors: readonly string[];
  readonly bodyRegions: readonly string[];
  readonly equipment: readonly string[];
  readonly optionalEquipment: readonly string[];
  readonly prerequisites: readonly string[];
  readonly supportStance: string;
  readonly resistancePath: string;
  readonly genericDemands: string;
  readonly scapularMechanics: string;
  readonly trunkMechanics: string;
  readonly stressScope: string;
  readonly loadabilityFatigue: string;
  readonly progressionAxes: readonly string[];
  readonly progressionRunway: string;
  readonly transitions: string;
  readonly phaseEvidence: string;
  readonly candidatePoolEffect: string;
  readonly equipmentModeEffect: string;
  readonly painSupportValue: string;
  readonly responseModifications: string;
  readonly stabilityClass: string;
  readonly knowledgeCompatibility: string;
  readonly evidenceStatus: string;
  readonly ownerQuestions: string;
  readonly newSlotWhen: string;
  readonly doNotAddWhen: string;
  readonly whyCurrentCannotSolve: string;
}

const hash = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

const LIMITED_WALKING_SPACE: EquipmentCapabilities = {
  ...FULL_GYM_EQUIPMENT,
  trainingSpace: {
    stableLoadedStandingSpace: true,
    loadedGait: { available: false },
  },
};

const FULL_LOADED_GAIT_SPACE: EquipmentCapabilities = {
  ...FULL_GYM_EQUIPMENT,
  trainingSpace: {
    stableLoadedStandingSpace: true,
    loadedGait: {
      available: true,
      straightLineMeters: 20,
      turningAvailable: true,
      overheadClearance: true,
    },
  },
};

export const WHOLE_BODY_ENVIRONMENTS: readonly EnvironmentFixture[] = [
  { id: "full-commercial-gym", label: "Full commercial gym", equipment: FULL_GYM_EQUIPMENT },
  { id: "dumbbells-plus-bench", label: "Dumbbells plus bench", equipment: DUMBBELLS_AND_BENCH_EQUIPMENT },
  { id: "dumbbells-no-bench", label: "Dumbbells without bench", equipment: DUMBBELLS_NO_BENCH_EQUIPMENT },
  { id: "mixed-home", label: "Mixed home", equipment: MIXED_HOME_EQUIPMENT },
  { id: "anchored-bands", label: "Anchored bands", equipment: ANCHORED_BANDS_EQUIPMENT },
  { id: "bands-no-anchor", label: "Bands without anchor", equipment: BANDS_WITHOUT_ANCHOR_EQUIPMENT },
  { id: "loop-only", label: "Loop/mini-loop only", equipment: LOOP_BANDS_ONLY_EQUIPMENT },
  { id: "bodyweight", label: "Bodyweight", equipment: BODYWEIGHT_EQUIPMENT },
  { id: "limited-walking-space", label: "Limited walking space", equipment: LIMITED_WALKING_SPACE },
  { id: "full-loaded-gait-space", label: "Full loaded-gait space", equipment: FULL_LOADED_GAIT_SPACE },
] as const;

const major = (input: Omit<NeedArchetype, "kind">): NeedArchetype => ({ ...input, kind: "major_pattern" });
const direct = (input: Omit<NeedArchetype, "kind" | "requestedRole" | "requestedSection">): NeedArchetype => ({
  ...input,
  kind: "direct_accessory",
  requestedRole: "hypertrophy_accessory",
  requestedSection: "accessory",
});
const prep = (input: Omit<NeedArchetype, "kind">): NeedArchetype => ({ ...input, kind: "preparation" });
const capacity = (input: Omit<NeedArchetype, "kind">): NeedArchetype => ({ ...input, kind: "capacity_recovery" });

export const WHOLE_BODY_NEED_ARCHETYPES: readonly NeedArchetype[] = [
  major({ id: "horizontal-push", label: "Horizontal push", requestedRole: "secondary_strength", requestedSection: "accessory", movementRoles: ["horizontal_push"], muscles: [], contexts: ["novice", "advanced", "strength", "hypertrophy", "phase_1", "phase_3", "continuity"] }),
  major({ id: "vertical-push", label: "Vertical push", requestedRole: "secondary_strength", requestedSection: "accessory", movementRoles: ["vertical_push"], muscles: [], contexts: ["beginner", "advanced", "strength", "shoulder-context"] }),
  major({ id: "horizontal-pull", label: "Horizontal pull", requestedRole: "secondary_strength", requestedSection: "accessory", movementRoles: ["horizontal_pull"], muscles: [], contexts: ["novice", "advanced", "strength", "lumbar-context", "grip-context"] }),
  major({ id: "vertical-pull", label: "Vertical pull", requestedRole: "secondary_strength", requestedSection: "accessory", movementRoles: ["vertical_pull"], muscles: [], contexts: ["beginner", "advanced", "strength", "grip-context"] }),
  major({ id: "knee-dominant", label: "Knee-dominant lower body", requestedRole: "secondary_strength", requestedSection: "accessory", movementRoles: ["knee_dominant"], muscles: [], contexts: ["novice", "advanced", "strength", "knee-context", "phase_1"] }),
  major({ id: "hip-dominant", label: "Hinge or hip-dominant lower body", requestedRole: "secondary_strength", requestedSection: "accessory", movementRoles: ["hinge"], muscles: [], contexts: ["beginner", "advanced", "strength", "lumbar-context"] }),
  major({ id: "single-leg-loaded", label: "Single-leg loaded work", requestedRole: "secondary_strength", requestedSection: "main", movementRoles: ["single_leg"], muscles: [], contexts: ["general_fitness", "hypertrophy", "unilateral-response"] }),
  major({ id: "carry", label: "Carry", requestedRole: "capacity", requestedSection: "main", movementRoles: ["carry"], muscles: [], contexts: ["conditioning", "grip-context", "limited-space"], notRequiredIn: ["limited-walking-space", "bodyweight", "bands-no-anchor", "loop-only"] }),
  major({ id: "loaded-bracing", label: "Loaded bracing", requestedRole: "secondary_strength", requestedSection: "main", movementRoles: ["loaded_bracing"], muscles: [], contexts: ["strength", "capacity", "time-constrained"] }),

  direct({ id: "direct-chest", label: "Direct chest", movementRoles: [], muscles: ["chest"], primaryRequired: true, contexts: ["hypertrophy", "time-constrained"] }),
  direct({ id: "direct-lats", label: "Direct lats", movementRoles: [], muscles: ["lats"], primaryRequired: true, contexts: ["hypertrophy", "grip-context"] }),
  direct({ id: "direct-mid-upper-back", label: "Direct mid/upper back", movementRoles: [], muscles: ["mid_back", "upper_back"], primaryRequired: true, contexts: ["hypertrophy", "posture"] }),
  { id: "direct-front-delts", label: "Primary-target front delts", kind: "direct_accessory", requestedRole: "secondary_strength", requestedSection: "accessory", movementRoles: [], muscles: ["front_delts"], primaryRequired: true, contexts: ["hypertrophy", "time-constrained"] },
  direct({ id: "direct-side-delts", label: "Direct side delts", movementRoles: [], muscles: ["side_delts"], primaryRequired: true, contexts: ["hypertrophy"] }),
  direct({ id: "direct-rear-delts", label: "Direct rear delts", movementRoles: [], muscles: ["rear_delts"], primaryRequired: true, contexts: ["hypertrophy", "posture"] }),
  direct({ id: "direct-biceps", label: "Direct biceps", movementRoles: [], muscles: ["biceps"], primaryRequired: true, exactIdentityIds: ["dumbbell-curl"], contexts: ["hypertrophy", "weak-point"] }),
  direct({ id: "direct-triceps", label: "Direct triceps", movementRoles: [], muscles: ["triceps"], primaryRequired: true, exactIdentityIds: ["cable-triceps-pressdown"], contexts: ["hypertrophy", "weak-point"] }),
  direct({ id: "direct-quads", label: "Direct quads", movementRoles: [], muscles: ["quads"], primaryRequired: true, contexts: ["hypertrophy", "knee-context"] }),
  direct({ id: "hamstring-knee-flexion", label: "Hamstrings through knee flexion", movementRoles: [], muscles: ["hamstrings"], primaryRequired: true, exactIdentityIds: ["lying-leg-curl", "supine-hamstring-walkout"], actionRequirement: "knee_flexion", contexts: ["hypertrophy", "home"] }),
  direct({ id: "direct-glutes", label: "Direct glutes", movementRoles: [], muscles: ["glutes"], primaryRequired: true, contexts: ["hypertrophy", "lumbar-context"] }),
  direct({ id: "direct-calves", label: "Direct calves", movementRoles: [], muscles: ["calves"], primaryRequired: true, actionRequirement: "ankle_plantar_flexion", contexts: ["hypertrophy", "general_fitness"] }),
  direct({ id: "direct-hip-abductors", label: "Direct hip abductors", movementRoles: [], muscles: ["hip_abductors"], primaryRequired: true, actionRequirement: "hip_abduction", contexts: ["hypertrophy", "unilateral-response"] }),
  direct({ id: "direct-hip-adductors", label: "Direct hip adductors", movementRoles: [], muscles: ["hip_adductors"], primaryRequired: true, actionRequirement: "hip_adduction", contexts: ["hypertrophy", "unilateral-response"] }),
  { id: "direct-serratus", label: "Primary-target serratus", kind: "direct_accessory", requestedRole: "activation", requestedSection: "activation", movementRoles: [], muscles: ["serratus"], primaryRequired: true, contexts: ["posture", "shoulder-context"] },
  direct({ id: "direct-rotator-cuff", label: "Direct rotator cuff", movementRoles: [], muscles: ["rotator_cuff"], primaryRequired: true, actionRequirement: "shoulder_external_rotation", contexts: ["posture", "shoulder-context"] }),
  direct({ id: "trunk-anti-extension", label: "Trunk anti-extension", movementRoles: ["anti_extension_core"], muscles: ["trunk"], primaryRequired: true, contexts: ["general_fitness", "lumbar-context"] }),
  direct({ id: "trunk-anti-rotation", label: "Trunk anti-rotation", movementRoles: ["anti_rotation_core"], muscles: ["trunk"], primaryRequired: true, contexts: ["general_fitness", "unilateral-response"] }),
  direct({ id: "trunk-anti-lateral", label: "Trunk anti-lateral flexion", movementRoles: ["anti_lateral_flexion_core"], muscles: ["trunk"], primaryRequired: true, contexts: ["general_fitness", "capacity"] }),
  direct({ id: "trunk-flexion", label: "Controlled trunk flexion", movementRoles: ["trunk_flexion"], muscles: ["trunk"], primaryRequired: true, contexts: ["hypertrophy", "lumbar-context"] }),
  direct({ id: "trunk-rotation", label: "Controlled trunk rotation", movementRoles: ["trunk_rotation"], muscles: ["trunk"], primaryRequired: true, contexts: ["general_fitness", "lumbar-context"] }),

  prep({ id: "prep-breathing", label: "Breathing/position preparation", requestedRole: "preparation", requestedSection: "warmup", movementRoles: ["breathing_position"], muscles: [], contexts: ["phase_1", "pain-aware-return"] }),
  prep({ id: "prep-mobility", label: "Mobility/range preparation", requestedRole: "preparation", requestedSection: "warmup", movementRoles: ["mobility"], muscles: [], contexts: ["range-limited", "loaded-session"] }),
  prep({ id: "prep-scapular", label: "Scapular preparation", requestedRole: "preparation", requestedSection: "warmup", movementRoles: ["scapular_control"], muscles: [], contexts: ["upper-session", "shoulder-context"] }),
  prep({ id: "prep-serratus", label: "Serratus/upward rotation", requestedRole: "activation", requestedSection: "activation", movementRoles: ["scapular_control"], muscles: ["serratus"], contexts: ["vertical-push-session"] }),
  prep({ id: "prep-cuff", label: "Cuff control", requestedRole: "activation", requestedSection: "activation", movementRoles: ["accessory"], muscles: ["rotator_cuff"], primaryRequired: true, actionRequirement: "shoulder_external_rotation", contexts: ["upper-session", "shoulder-context"] }),
  prep({ id: "prep-trunk", label: "Trunk control", requestedRole: "activation", requestedSection: "activation", movementRoles: ["anti_extension_core", "anti_rotation_core"], muscles: ["trunk"], contexts: ["loaded-session", "lumbar-context"] }),
  prep({ id: "prep-glute-hip", label: "Glute/hip preparation", requestedRole: "activation", requestedSection: "activation", movementRoles: [], muscles: ["glutes"], contexts: ["lower-session", "hinge-session"] }),
  prep({ id: "prep-squat", label: "Squat rehearsal", requestedRole: "preparation", requestedSection: "warmup", movementRoles: ["squat"], muscles: [], contexts: ["squat-session", "phase_1"] }),
  prep({ id: "prep-hinge", label: "Hinge rehearsal", requestedRole: "preparation", requestedSection: "warmup", movementRoles: ["hinge"], muscles: [], contexts: ["hinge-session", "phase_1"] }),
  prep({ id: "prep-single-leg", label: "Single-leg preparation", requestedRole: "activation", requestedSection: "activation", movementRoles: ["single_leg"], muscles: [], contexts: ["single-leg-session", "unilateral-response"] }),

  capacity({ id: "capacity-loaded-gait", label: "Loaded gait/carry capacity", requestedRole: "capacity", requestedSection: "main", movementRoles: ["carry"], muscles: [], contexts: ["conditioning", "full-duration"], notRequiredIn: ["limited-walking-space", "bodyweight", "bands-no-anchor", "loop-only"] }),
  capacity({ id: "capacity-supported-march", label: "Supported loaded march", requestedRole: "capacity", requestedSection: "accessory", movementRoles: ["loaded_bracing"], muscles: [], contexts: ["limited-space", "pain-aware-return"] }),
  capacity({ id: "recovery-down-regulation", label: "Recovery/down-regulation", requestedRole: "recovery", requestedSection: "cooldown", movementRoles: ["breathing_position"], muscles: [], contexts: ["recovery", "full-duration"] }),
  capacity({ id: "recovery-pattern-relevant", label: "Pattern-relevant cooldown/mobility", requestedRole: "recovery", requestedSection: "cooldown", movementRoles: ["mobility"], muscles: [], contexts: ["loaded-session", "range-limited"] }),
] as const;

const ROLE_PROBLEMS: Readonly<Record<string, { classification: RolePurityClassification; finding: string }>> = {
  "dumbbell-curl": { classification: "MUSCLE_ASSOCIATION_WRONG_OWNER", finding: "Elbow flexion/biceps work does not satisfy horizontal-pull pattern coverage." },
  "cable-triceps-pressdown": { classification: "MUSCLE_ASSOCIATION_WRONG_OWNER", finding: "Elbow extension/triceps work does not satisfy horizontal-push pattern coverage." },
  "dumbbell-lateral-raise": { classification: "MUSCLE_ASSOCIATION_WRONG_OWNER", finding: "Shoulder abduction does not satisfy loaded vertical-press coverage." },
  "lying-leg-curl": { classification: "MECHANICALLY_RELATED_BUT_NOT_SLOT_TRUTH", finding: "Knee flexion trains hamstrings but does not rehearse or satisfy a hip hinge." },
  "cable-chest-fly": { classification: "MECHANICALLY_RELATED_BUT_NOT_SLOT_TRUTH", finding: "Chest isolation is not a horizontal pressing pattern exposure." },
  "reverse-pec-deck": { classification: "MECHANICALLY_RELATED_BUT_NOT_SLOT_TRUTH", finding: "Rear-delt/retraction work is not a horizontal pulling pattern exposure." },
  "band-face-pull": { classification: "MECHANICALLY_RELATED_BUT_NOT_SLOT_TRUTH", finding: "Scapular/cuff preparation is not a horizontal pulling pattern exposure." },
  "glute-bridge": { classification: "MECHANICALLY_RELATED_BUT_NOT_SLOT_TRUTH", finding: "Supine hip extension is useful glute work but not loaded hinge-pattern practice." },
  "serratus-wall-slide": { classification: "MECHANICALLY_RELATED_BUT_NOT_SLOT_TRUTH", finding: "Upward-rotation preparation is not loaded vertical pressing." },
  "leg-press": { classification: "AMBIGUOUS_ROLE_SEMANTICS", finding: "It truthfully supplies knee-dominant strength but should not automatically count as coordinated squat-pattern practice." },
};

const TARGETED_METADATA_IDS = new Set([
  "dumbbell-bench-press", "machine-chest-press", "band-row", "dumbbell-shoulder-press",
  "lat-pulldown", "band-lat-pulldown", "bodyweight-box-squat", "cable-pull-through",
]);
const READY_CURRENT_IDS = new Set([
  "chest-supported-dumbbell-row", "one-arm-dumbbell-row", "machine-row", "seated-cable-row",
  "dumbbell-romanian-deadlift", "forearm-plank", "forearm-side-plank",
  "machine-abdominal-crunch", "half-kneeling-high-to-low-cable-chop", "farmer-carry",
  "suitcase-carry", "wall-supported-suitcase-march",
]);

function rowStatus(exercise: ExerciseDefinition): RowStatus {
  if (TARGETED_METADATA_IDS.has(exercise.id)) return "TARGETED_METADATA_CURATION_REQUIRED";
  if (READY_CURRENT_IDS.has(exercise.id)) return "READY_AS_CURRENT_CANDIDATE";
  return "READY_WITH_NONBLOCKING_UNKNOWNS";
}

function equipmentLegal(exercise: ExerciseDefinition, equipment: EquipmentCapabilities): boolean {
  return exercise.equipmentRequirements.every(
    (requirement) => evaluateEquipmentRequirement(equipment, requirement).satisfied,
  );
}

function productionRejectReasons(
  exercise: ExerciseDefinition,
  archetype: NeedArchetype,
  equipment: EquipmentCapabilities,
): readonly string[] {
  const reasons: string[] = [];
  if (!exercise.trainingRoles.includes(archetype.requestedRole)) reasons.push("ROLE_MISMATCH");
  const section = exercise.sectionSuitability[archetype.requestedSection]?.suitability;
  if (!section || section === "poor") reasons.push("SECTION_MISMATCH");
  if (archetype.movementRoles.length > 0 && !exercise.movementRoles.some((role) => archetype.movementRoles.includes(role))) {
    reasons.push("MOVEMENT_ROLE_MISMATCH");
  }
  if (archetype.actionRequirement && !exercise.actionFunctions.some((entry) => entry.action === archetype.actionRequirement)) {
    reasons.push("TRAINING_NEED_MISMATCH");
  }
  const allMuscles = exercise.muscleContributions
    .filter((entry) => archetype.primaryRequired
      ? entry.relationship === "primary_target"
      : entry.relationship === "primary_target" || entry.relationship === "key_secondary_target")
    .map((entry) => entry.muscle);
  if (archetype.muscles.length > 0 && !allMuscles.some((muscle) => archetype.muscles.includes(muscle))) {
    reasons.push("TARGET_MUSCLE_MISMATCH");
  }
  if (!equipmentLegal(exercise, equipment)) reasons.push("EQUIPMENT_UNAVAILABLE");
  return reasons;
}

function auditTruthAllows(exercise: ExerciseDefinition, archetype: NeedArchetype): boolean {
  if (archetype.exactIdentityIds && !archetype.exactIdentityIds.includes(exercise.id)) return false;
  if (archetype.primaryRequired && !exercise.primaryMuscles.some((muscle) => archetype.muscles.includes(muscle))) return false;
  return true;
}

function diversity(exercises: readonly ExerciseDefinition[]) {
  const values = (selector: (exercise: ExerciseDefinition) => string) =>
    [...new Set(exercises.map(selector))].sort();
  return {
    support: values((exercise) => exercise.mechanics?.support.supportAmount ?? "unknown"),
    resistancePath: values((exercise) => exercise.mechanics?.resistancePath?.resistancePath ?? "unknown"),
    loadability: values((exercise) => exercise.loading.loadability),
    progressionRunway: values((exercise) => exercise.progression.progressionAxes.length >= 4 ? "broad" : exercise.progression.progressionAxes.length >= 2 ? "usable" : "thin"),
  };
}

function classifyPool(input: {
  readonly archetype: NeedArchetype;
  readonly environmentId: string;
  readonly truthful: readonly ExerciseDefinition[];
}): PoolClassification {
  if (input.archetype.notRequiredIn?.includes(input.environmentId)) return "NOT_REQUIRED_IN_THIS_CONTEXT";
  if (input.truthful.length === 0) return "BOOTSTRAP_CANDIDATE_REQUIRED";
  if (input.truthful.length === 1) return "SINGLE_CANDIDATE_DEPENDENCY";
  const d = diversity(input.truthful);
  const knownPaths = d.resistancePath.filter((value) => value !== "unknown");
  if (new Set([...d.support, ...knownPaths, ...d.loadability]).size >= 4) return "SUFFICIENT_AND_DISTINCT";
  if (knownPaths.length === 0) return "SUFFICIENT_BUT_METADATA_THIN";
  return "THIN_BUT_USABLE";
}

function buildMatrixRows() {
  return WHOLE_BODY_NEED_ARCHETYPES.flatMap((archetype) =>
    WHOLE_BODY_ENVIRONMENTS.map((environment) => {
      const evaluated = REFERENCE_EXERCISES.map((exercise) => ({
        exercise,
        reasons: productionRejectReasons(exercise, archetype, environment.equipment),
      }));
      const productionLegal = evaluated.filter((row) => row.reasons.length === 0).map((row) => row.exercise);
      const truthful = productionLegal.filter((exercise) => auditTruthAllows(exercise, archetype));
      const hardRejected = evaluated.filter((row) => row.reasons.length > 0);
      const primary = truthful.filter((exercise) => exercise.primaryMuscles.some((muscle) => archetype.muscles.includes(muscle)));
      const secondary = truthful.filter((exercise) => !primary.includes(exercise) && exercise.secondaryMuscles.some((muscle) => archetype.muscles.includes(muscle)));
      const supported = truthful.filter((exercise) => {
        const amount = exercise.mechanics?.support.supportAmount;
        return amount && amount !== "none" && amount !== "unknown";
      });
      return {
        archetypeId: archetype.id,
        archetypeLabel: archetype.label,
        kind: archetype.kind,
        contexts: archetype.contexts,
        environmentId: environment.id,
        environmentLabel: environment.label,
        productionLegalIds: productionLegal.map((exercise) => exercise.id),
        truthfulLegalIds: truthful.map((exercise) => exercise.id),
        excludedByAuditTruthIds: productionLegal.filter((exercise) => !truthful.includes(exercise)).map((exercise) => exercise.id),
        hardRejected: hardRejected.map((row) => ({ id: row.exercise.id, reasons: row.reasons })),
        primaryTargetIds: primary.map((exercise) => exercise.id),
        secondaryContributorIds: secondary.map((exercise) => exercise.id),
        supportedIds: supported.map((exercise) => exercise.id),
        unsupportedIds: truthful.filter((exercise) => !supported.includes(exercise)).map((exercise) => exercise.id),
        diversity: diversity(truthful),
        phaseEvidence: {
          accepted: truthful.filter((exercise) => exercise.phaseSuitabilityAnnotations?.some((row) => row.reviewStatus === "accepted")).map((exercise) => exercise.id),
          abstainsOrReview: truthful.filter((exercise) => !exercise.phaseSuitabilityAnnotations?.some((row) => row.reviewStatus === "accepted")).map((exercise) => exercise.id),
        },
        stressAlternativeIds: truthful.filter((exercise) => (exercise.stressAnnotations ?? []).filter((row) => row.reviewStatus === "accepted").length === 0).map((exercise) => exercise.id),
        equipmentLimitation: truthful.length === 0 ? "No truthful candidate under explicit capabilities." : "Explicit capability checks passed; environment label added no facts.",
        actionRequirement: archetype.actionRequirement ?? null,
        classification: classifyPool({ archetype, environmentId: environment.id, truthful }),
      };
    }),
  );
}

function buildRoleAudit() {
  return REFERENCE_EXERCISES.map((exercise) => {
    const problem = ROLE_PROBLEMS[exercise.id];
    return {
      exerciseId: exercise.id,
      movementRoles: exercise.movementRoles,
      classification: "SELECTION_ROLE_TRUTHFUL" as RolePurityClassification,
      macroPatternSatisfied: !problem,
      accessoryNeedWithoutMacroRole: exercise.trainingRoles.includes("hypertrophy_accessory") && exercise.primaryMuscles.length > 0,
      futureCoverageDistortion: false,
      sectionGateIsSufficient: true,
      finding: problem
        ? `RESOLVED: ${problem.finding}`
        : "Current role is a defensible selection purpose at catalog scope.",
    };
  });
}

function buildMuscleAudit() {
  return MUSCLE_GROUPS.map((muscle) => {
    const primary = REFERENCE_EXERCISES.filter((exercise) => exercise.primaryMuscles.includes(muscle));
    const secondary = REFERENCE_EXERCISES.filter((exercise) => exercise.secondaryMuscles.includes(muscle));
    const directSelectable = primary.some((exercise) => exercise.trainingRoles.includes("hypertrophy_accessory"));
    return {
      muscle,
      primaryIds: primary.map((exercise) => exercise.id),
      secondaryIds: secondary.map((exercise) => exercise.id),
      equipmentCoverage: [...new Set(primary.flatMap((exercise) => exercise.equipmentRequirements.map((requirement) => requirement.label)))].sort(),
      trainingRoleCoverage: [...new Set(primary.flatMap((exercise) => exercise.trainingRoles))].sort(),
      loadabilityRange: [...new Set(primary.map((exercise) => exercise.loading.loadability))].sort(),
      progressionRunway: primary.length === 0 ? "absent" : primary.every((exercise) => exercise.progression.progressionAxes.length >= 3) ? "broad" : "mixed_or_thin",
      supportDiversity: [...new Set(primary.map((exercise) => exercise.mechanics?.support.supportAmount ?? "unknown"))].sort(),
      directSelectable,
      poolMeaning: primary.length === 0 ? "NOMINAL_ONLY_NO_PRIMARY" : directSelectable ? "MEANINGFUL_AT_LEAST_ONE_DIRECT" : "COMPOUND_OR_NON_ACCESSORY_ONLY",
    };
  });
}

function proposal(input: ProposedConcept): ProposedConcept {
  return input;
}

export const PROPOSED_CONCEPTS: readonly ProposedConcept[] = [
  proposal({ priority: "P0", id: "standing-calf-raise", identity: "Standing Calf Raise", identityBoundary: "Equipment-neutral standing bilateral plantar-flexion identity; external load and wall support are prescription/equipment realizations.", family: "calf_accessory", movementRoles: ["accessory"], trainingRoles: ["hypertrophy_accessory"], sections: ["accessory"], primaryMuscles: ["calves"], secondaryMuscles: [], incidentalContributors: ["trunk"], bodyRegions: ["ankle"], equipment: ["stable_loaded_standing_space"], optionalEquipment: ["dumbbells", "wall"], prerequisites: ["standing tolerance"], supportStance: "standing, bilateral, none or light-touch wall support", resistancePath: "bodyweight_or_external_load", genericDemands: "low skill; moderate balance and ankle range", scapularMechanics: "not relevant", trunkMechanics: "incidental upright stabilization only", stressScope: "ankle loading; grip only when load creates it; bilateral unless prescribed otherwise", loadabilityFatigue: "limited to moderate loadability; local calf fatigue; low systemic fatigue", progressionAxes: ["load", "reps", "sets", "range", "tempo"], progressionRunway: "Broad enough for bootstrap direct calf work within available loading.", transitions: "Machine/seated calf concepts remain observational and unapproved.", phaseEvidence: "EXTERNAL_REFERENCE_PENDING; contextual phase annotation unknown", candidatePoolEffect: "Creates the missing direct-calf primary pool.", equipmentModeEffect: "Equipment-neutral identity permits bodyweight or reviewed external-load realizations.", painSupportValue: "Wall support can change balance demand without a new identity; no safety inference.", responseModifications: "Adjust load, range, support, and unilateral realization after response review.", stabilityClass: "STABLE_SUPPORTING_WORK; possible BOUNDED_ROTATION_ELIGIBLE", knowledgeCompatibility: "Stable ID resolves future education with no engine dependency.", evidenceStatus: "Mechanically definitional owner review required; no superiority claim.", ownerQuestions: "Approve equipment-neutral identity and wall support as a prescription variant?", newSlotWhen: "Direct calf development is a real program need.", doNotAddWhen: "Compound/locomotor exposure is sufficient or time pressure removes direct work.", whyCurrentCannotSolve: "No current row has calves as a primary target." }),
  proposal({ priority: "P0", id: "side-lying-hip-adduction", identity: "Side-Lying Hip Adduction", identityBoundary: "Floor-supported direct hip-adduction exercise; Copenhagen-style support loading is a separate identity.", family: "hip_accessory", movementRoles: [], trainingRoles: ["activation", "hypertrophy_accessory"], sections: ["activation", "accessory"], primaryMuscles: ["hip_adductors"], secondaryMuscles: [], incidentalContributors: ["trunk"], bodyRegions: ["hip", "pelvis"], equipment: ["bodyweight", "floor_space"], optionalEquipment: ["loop_band"], prerequisites: ["side-lying floor tolerance"], supportStance: "side-lying, substantial floor support", resistancePath: "bodyweight or optional band", genericDemands: "low skill; moderate local control", scapularMechanics: "not relevant", trunkMechanics: "low contextual lateral-position control", stressScope: "hip adduction; side scope prescription-dependent", loadabilityFatigue: "limited to moderate; local fatigue; low systemic fatigue", progressionAxes: ["reps", "sets", "tempo", "range", "load"], progressionRunway: "Usable bootstrap runway; external loading detail needs review.", transitions: "Cable/machine adduction is an equipment transition, never automatic.", phaseEvidence: "EXTERNAL_REFERENCE_PENDING", candidatePoolEffect: "Creates missing direct-adductor primary work.", equipmentModeEffect: "Bodyweight and home compatible.", painSupportValue: "Floor support lowers balance demand; region alone does not imply suitability.", responseModifications: "Range, lever, band, and side can vary under prescription/response authority.", stabilityClass: "STABLE_SUPPORTING_WORK", knowledgeCompatibility: "Stable ID compatible.", evidenceStatus: "Mechanically definitional owner review required.", ownerQuestions: "Approve exact top-leg setup boundary and optional-band realization?", newSlotWhen: "Direct adductor development or reviewed preparation is needed.", doNotAddWhen: "Indirect exposure is sufficient or no direct need exists.", whyCurrentCannotSolve: "Adductors are secondary only on current rows." }),
  proposal({ priority: "P0", id: "loop-band-lateral-walk", identity: "Loop-Band Lateral Walk", identityBoundary: "Standing stepping hip-abduction capacity exercise; side-lying abduction is a distinct support/task identity.", family: "hip_accessory", movementRoles: [], trainingRoles: ["activation", "hypertrophy_accessory"], sections: ["activation", "accessory"], primaryMuscles: ["hip_abductors"], secondaryMuscles: ["glutes"], incidentalContributors: ["trunk", "quads"], bodyRegions: ["hip", "pelvis", "knee"], equipment: ["loop_band", "stable_loaded_standing_space"], optionalEquipment: ["wall"], prerequisites: ["standing and lateral-step tolerance"], supportStance: "standing bilateral-to-alternating, optional light wall support", resistancePath: "loop_band", genericDemands: "moderate coordination and frontal-plane control", scapularMechanics: "not relevant", trunkMechanics: "contextual upright control", stressScope: "hip/knee exposure; alternating side scope", loadabilityFatigue: "limited loadability; local hip fatigue; low systemic fatigue", progressionAxes: ["steps", "sets", "band_resistance", "range", "tempo"], progressionRunway: "Bounded; enough for preparation/direct accessory, not a main anchor.", transitions: "Cable abduction may be an equipment/loadability transition after review.", phaseEvidence: "EXTERNAL_REFERENCE_PENDING", candidatePoolEffect: "Creates direct abductor and standing hip-preparation coverage.", equipmentModeEffect: "Uses an existing loop-band capability.", painSupportValue: "Optional support changes balance, not identity; exact response remains required.", responseModifications: "Band position, step range, support, and volume are prescription variables.", stabilityClass: "TEMPORARY_CONTEXTUAL_TOOL or STABLE_SUPPORTING_WORK", knowledgeCompatibility: "Stable ID compatible.", evidenceStatus: "Mechanically definitional owner review required.", ownerQuestions: "Approve action profile and band-position prescription boundary?", newSlotWhen: "A direct abductor or loaded lateral-control need is explicit.", doNotAddWhen: "It would be generic activation filler.", whyCurrentCannotSolve: "Abductors are secondary only and no current exercise directly owns hip abduction." }),
  proposal({ priority: "P0", id: "side-lying-dumbbell-external-rotation", identity: "Side-Lying Dumbbell External Rotation", identityBoundary: "Floor-supported direct shoulder external rotation with a small dumbbell; face pulls remain a multi-joint scapular preparation identity.", family: "cuff_control", movementRoles: [], trainingRoles: ["activation", "hypertrophy_accessory"], sections: ["activation", "accessory"], primaryMuscles: ["rotator_cuff"], secondaryMuscles: ["rear_delts"], incidentalContributors: [], bodyRegions: ["shoulder"], equipment: ["dumbbells", "floor_space"], optionalEquipment: ["towel support"], prerequisites: ["side-lying and shoulder-range tolerance", "appropriately light dumbbell"], supportStance: "side-lying with substantial floor support", resistancePath: "free_implement", genericDemands: "low systemic demand; precise shoulder control", scapularMechanics: "direct external-rotation contribution; low loaded scapular demand", trunkMechanics: "minimal", stressScope: "shoulder rotation exposure; prescription side", loadabilityFatigue: "limited; local cuff fatigue; negligible systemic fatigue", progressionAxes: ["reps", "sets", "tempo", "range", "load"], progressionRunway: "Bounded preparation/accessory runway.", transitions: "No universal progression to face pull or press.", phaseEvidence: "EXTERNAL_REFERENCE_PENDING", candidatePoolEffect: "Creates missing direct cuff-control pool without abusing horizontal pull.", equipmentModeEffect: "Dumbbell gym/home coverage; bodyweight and band-only modes remain explicitly absent.", painSupportValue: "Supported setup offers a low-balance option, not a safety claim.", responseModifications: "Range, load, side, and volume respond to exact realization history.", stabilityClass: "TEMPORARY_CONTEXTUAL_TOOL or STABLE_SUPPORTING_WORK", knowledgeCompatibility: "Stable ID compatible.", evidenceStatus: "Identity and mechanics review pending; external reference pending.", ownerQuestions: "Approve the small-dumbbell identity boundary and optional action vocabulary.", newSlotWhen: "Direct cuff control is explicitly needed.", doNotAddWhen: "Pressing/pulling already meets the session purpose and no cuff slot is needed.", whyCurrentCannotSolve: "Cuff is secondary only; face pull cannot prove direct external-rotation intent." }),
  proposal({ priority: "P0", id: "supine-hamstring-walkout", identity: "Supine Hamstring Walkout", identityBoundary: "Bodyweight bridge-position heel walkout emphasizing knee-flexion leverage; not a loaded hip hinge or machine leg curl.", family: "glute_hamstring", movementRoles: [], trainingRoles: ["activation", "hypertrophy_accessory"], sections: ["activation", "accessory"], primaryMuscles: ["hamstrings"], secondaryMuscles: ["glutes"], incidentalContributors: ["trunk"], bodyRegions: ["knee", "hip", "pelvis"], equipment: ["bodyweight", "floor_space"], optionalEquipment: [], prerequisites: ["supine bridge tolerance"], supportStance: "supine floor support, bilateral or alternating prescription", resistancePath: "bodyweight", genericDemands: "moderate posterior-chain endurance and pelvic control", scapularMechanics: "not relevant", trunkMechanics: "contextual anti-extension/position control only", stressScope: "knee-flexion/hip-extension exposure; side scope prescription-dependent", loadabilityFatigue: "limited; local hamstring fatigue; low systemic fatigue", progressionAxes: ["reps", "steps", "range", "tempo", "duration"], progressionRunway: "Bounded but materially extends home knee-flexion coverage.", transitions: "Machine leg curl is an equipment/loadability transition, not same-exercise progression.", phaseEvidence: "EXTERNAL_REFERENCE_PENDING", candidatePoolEffect: "Creates home-compatible hamstring knee-flexion candidate.", equipmentModeEffect: "Bodyweight/home environments.", painSupportValue: "Floor support reduces standing balance and grip needs; exact stress review pending.", responseModifications: "Walkout distance, bridge height, bilateral/alternating mode, and volume vary by response.", stabilityClass: "STABLE_SUPPORTING_WORK", knowledgeCompatibility: "Stable ID compatible.", evidenceStatus: "Mechanics and stress review pending.", ownerQuestions: "Approve exact identity boundary versus sliders/curls and action profile?", newSlotWhen: "Knee-flexion hamstring work is required without a leg-curl machine.", doNotAddWhen: "A legal tolerated leg curl already serves the direct need or hinge contribution is sufficient.", whyCurrentCannotSolve: "Current home rows cannot express direct hamstring knee-flexion truth." }),
  proposal({ priority: "P0", id: "wall-ankle-dorsiflexion-rock", identity: "Wall Ankle Dorsiflexion Rock", identityBoundary: "Wall-supported ankle-range preparation, not loaded calf training.", family: "mobility_preparation", movementRoles: ["mobility"], trainingRoles: ["preparation"], sections: ["warmup"], primaryMuscles: [], secondaryMuscles: ["calves"], incidentalContributors: [], bodyRegions: ["ankle", "knee"], equipment: ["wall", "floor_space"], optionalEquipment: [], prerequisites: ["supported standing tolerance"], supportStance: "split stance, partial wall support", resistancePath: "bodyweight", genericDemands: "low load; ankle range and joint control", scapularMechanics: "not relevant", trunkMechanics: "minimal", stressScope: "ankle dorsiflexion and knee translation; prescription side", loadabilityFatigue: "none; negligible fatigue", progressionAxes: ["range", "reps", "tempo"], progressionRunway: "Preparation-only bounded runway.", transitions: "No automatic transition to squat or calf exercise.", phaseEvidence: "EXTERNAL_REFERENCE_PENDING", candidatePoolEffect: "Creates first truthful mobility-role candidate for ankle/squat preparation.", equipmentModeEffect: "Wall-capable environments.", painSupportValue: "Range is prescriptive; no diagnosis or danger inference.", responseModifications: "Range, distance, side, and reps vary by response.", stabilityClass: "TEMPORARY_CONTEXTUAL_TOOL", knowledgeCompatibility: "Stable ID compatible.", evidenceStatus: "Mechanically definitional review pending.", ownerQuestions: "Approve body-region and exact range-preparation identity?", newSlotWhen: "Ankle range is a real dependency for today's loaded task.", doNotAddWhen: "No ankle-range dependency exists.", whyCurrentCannotSolve: "The catalog has no mobility role candidate." }),
  proposal({ priority: "P0", id: "bodyweight-hip-hinge-rehearsal", identity: "Bodyweight Hip Hinge Rehearsal", identityBoundary: "Unloaded standing hinge-pattern rehearsal; not glute isolation and not a loaded strength exercise.", family: "mobility_preparation", movementRoles: ["hinge"], trainingRoles: ["preparation", "activation"], sections: ["warmup", "activation"], primaryMuscles: ["glutes", "hamstrings"], secondaryMuscles: ["trunk"], incidentalContributors: [], bodyRegions: ["hip", "pelvis", "lumbar_spine"], equipment: ["bodyweight", "stable_loaded_standing_space"], optionalEquipment: ["wall"], prerequisites: ["standing tolerance"], supportStance: "standing bilateral, optional wall target", resistancePath: "bodyweight", genericDemands: "low load; moderate pattern coordination", scapularMechanics: "not relevant", trunkMechanics: "position/bracing rehearsal without direct trunk slot", stressScope: "hinge pattern; no accepted loaded-hinge stress until dose creates it", loadabilityFatigue: "none to limited; low fatigue", progressionAxes: ["range", "reps", "tempo", "support_reduction"], progressionRunway: "Preparation runway only.", transitions: "Loaded RDL/pull-through are separate identities and require selection.", phaseEvidence: "EXTERNAL_REFERENCE_PENDING", candidatePoolEffect: "Creates truthful hinge preparation instead of using bridge as hinge practice.", equipmentModeEffect: "Standing-space environments.", painSupportValue: "Wall target can bound range; no lumbar intolerance inferred.", responseModifications: "Range, wall distance, tempo, and repetition count vary.", stabilityClass: "TEMPORARY_CONTEXTUAL_TOOL", knowledgeCompatibility: "Stable ID compatible.", evidenceStatus: "Mechanically definitional owner review required.", ownerQuestions: "Approve wall-target variant within identity?", newSlotWhen: "Today's loaded hinge has a real rehearsal dependency.", doNotAddWhen: "The person is prepared through loaded warm-up sets or no hinge is programmed.", whyCurrentCannotSolve: "No current preparation-role row truthfully rehearses a hinge." }),
  proposal({ priority: "P0", id: "single-leg-balance-rehearsal", identity: "Single-Leg Balance Rehearsal", identityBoundary: "Low-load supported single-leg preparation; not split squat or step-up strength work.", family: "single_leg_pattern", movementRoles: ["single_leg"], trainingRoles: ["activation", "preparation"], sections: ["warmup", "activation"], primaryMuscles: [], secondaryMuscles: ["hip_abductors", "glutes", "trunk"], incidentalContributors: ["calves"], bodyRegions: ["hip", "knee", "ankle"], equipment: ["stable_loaded_standing_space"], optionalEquipment: ["stable_support_surface"], prerequisites: [], supportStance: "single-leg with prescription-modifiable stable support", resistancePath: "bodyweight", genericDemands: "low load; scalable balance and joint control", scapularMechanics: "not relevant", trunkMechanics: "contextual upright control", stressScope: "single-leg stance; prescription side", loadabilityFatigue: "none to limited; low fatigue", progressionAxes: ["duration", "support_reduction", "coordination_demand"], progressionRunway: "Preparation-only bounded runway.", transitions: "Split squat/step-up are separate loaded identities.", phaseEvidence: "ABSTAIN_PENDING_CALIBRATION", candidatePoolEffect: "Creates missing single-leg preparation pool.", equipmentModeEffect: "Standing-space environments; wall, box, chair, or stable table may derive optional support.", painSupportValue: "Support is explicit and modifiable; side-specific response remains visible.", responseModifications: "Support, duration, side, and coordination vary by response.", stabilityClass: "PRODUCTION_CONTEXTUAL_TOOL", knowledgeCompatibility: "Stable ID compatible.", evidenceStatus: "Production identity contract reviewed.", ownerQuestions: "None for P0 admission.", newSlotWhen: "A loaded unilateral task has a real preparation dependency.", doNotAddWhen: "No single-leg task or assessed dependency exists.", whyCurrentCannotSolve: "Prior single-leg rows are loaded accessory/strength identities, not preparation-role warm-ups." }),

  proposal({ priority: "P1", id: "machine-shoulder-press", identity: "Machine Shoulder Press", identityBoundary: "Selectorized guided vertical press; machine geometry remains setup-specific.", family: "upper_push", movementRoles: ["vertical_push"], trainingRoles: ["primary_strength", "secondary_strength"], sections: ["main", "accessory"], primaryMuscles: ["front_delts", "triceps"], secondaryMuscles: ["side_delts"], incidentalContributors: [], bodyRegions: ["shoulder", "elbow"], equipment: ["selectorized_machine:shoulder_press"], optionalEquipment: [], prerequisites: ["machine fit", "overhead range tolerance"], supportStance: "seated with substantial machine support", resistancePath: "machine_guided", genericDemands: "low stability; moderate range/joint control", scapularMechanics: "loaded upward-rotation behavior requires machine-specific review", trunkMechanics: "low with seat/back support", stressScope: "overhead_pressing; dose-created axial loading review", loadabilityFatigue: "high loadability; local shoulder/triceps; moderate systemic", progressionAxes: ["load", "reps", "sets", "range"], progressionRunway: "Broad if machine increments/fit are suitable.", transitions: "Dumbbell press is a resistance/support transition, not universal progression.", phaseEvidence: "EXTERNAL_REFERENCE_PENDING", candidatePoolEffect: "Adds support/path diversity to a one-candidate vertical press pool.", equipmentModeEffect: "Uses existing shoulder_press machine capability.", painSupportValue: "Support can reduce trunk demand but does not prove shoulder suitability.", responseModifications: "Load, range, seat setup, and volume vary.", stabilityClass: "ANCHOR_CAPABLE or STABLE_SUPPORTING_WORK", knowledgeCompatibility: "Stable ID compatible.", evidenceStatus: "Machine identity/mechanics owner review pending.", ownerQuestions: "Approve generic machine boundary despite geometry variability?", newSlotWhen: "Supported guided vertical pressing materially changes fit.", doNotAddWhen: "Dumbbell press is legal, tolerated, and support/path does not matter.", whyCurrentCannotSolve: "Only one true loaded vertical press exists." }),
  proposal({ priority: "P1", id: "assisted-pull-up", identity: "Assisted Pull-Up", identityBoundary: "Vertical body pull with explicit assistance; unassisted pull-up and pulldown remain distinct load paths.", family: "upper_pull", movementRoles: ["vertical_pull"], trainingRoles: ["primary_strength", "secondary_strength"], sections: ["main", "accessory"], primaryMuscles: ["lats"], secondaryMuscles: ["biceps", "mid_back"], incidentalContributors: ["trunk", "grip"], bodyRegions: ["shoulder", "elbow", "wrist"], equipment: ["pull_up_bar", "assistance_capability_pending"], optionalEquipment: [], prerequisites: ["hanging tolerance", "grip capacity", "assistance truth"], supportStance: "suspended with assistance", resistancePath: "bodyweight_assisted", genericDemands: "moderate-high skill, grip, and shoulder range", scapularMechanics: "loaded vertical scapular control", trunkMechanics: "contextual suspended control", stressScope: "grip and upper-limb loading; assistance/dose dependent", loadabilityFatigue: "moderate-high; local pull/grip; moderate systemic", progressionAxes: ["assistance_reduction", "reps", "sets", "range", "tempo"], progressionRunway: "Broad when assistance can be quantified.", transitions: "Pulldown/pull-up transitions remain contextual.", phaseEvidence: "EXTERNAL_REFERENCE_PENDING", candidatePoolEffect: "Adds vertical-pull path and progression diversity.", equipmentModeEffect: "Requires explicit pull-up and assistance capabilities; labels cannot manufacture either.", painSupportValue: "No shoulder/grip safety inference.", responseModifications: "Assistance, range, grip, and volume vary after response review.", stabilityClass: "ANCHOR_CAPABLE", knowledgeCompatibility: "Stable ID compatible.", evidenceStatus: "Equipment and mechanics contract pending.", ownerQuestions: "Define assistance capability and identity boundary first.", newSlotWhen: "Suspended vertical-pull progression is a real goal/capability fit.", doNotAddWhen: "Pulldown already meets the need or hanging/grip setup is unsuitable.", whyCurrentCannotSolve: "Current vertical pulls are pulldown paths only." }),
  proposal({ priority: "P1", id: "machine-leg-extension", identity: "Machine Leg Extension", identityBoundary: "Selectorized open-chain knee extension; not squat-pattern exposure.", family: "quad_accessory", movementRoles: [], trainingRoles: ["hypertrophy_accessory"], sections: ["accessory"], primaryMuscles: ["quads"], secondaryMuscles: [], incidentalContributors: [], bodyRegions: ["knee"], equipment: ["selectorized_machine:knee_extension_pending"], optionalEquipment: [], prerequisites: ["machine fit", "knee-extension tolerance"], supportStance: "seated substantial machine support", resistancePath: "machine_guided", genericDemands: "low skill/stability; direct knee extension", scapularMechanics: "not relevant", trunkMechanics: "minimal", stressScope: "loaded knee extension; bilateral or unilateral machine realization", loadabilityFatigue: "high local loadability; low systemic fatigue", progressionAxes: ["load", "reps", "sets", "range", "tempo"], progressionRunway: "Broad direct-quad accessory runway.", transitions: "Leg press/squat transitions are stimulus shifts, not progression.", phaseEvidence: "EXTERNAL_REFERENCE_PENDING", candidatePoolEffect: "Adds direct quad isolation without contaminating squat coverage.", equipmentModeEffect: "Requires a new reviewed machine capability ID.", painSupportValue: "Supported setup changes systemic/trunk cost; no knee safety claim.", responseModifications: "Load, range, side, and volume vary.", stabilityClass: "STABLE_SUPPORTING_WORK", knowledgeCompatibility: "Stable ID compatible.", evidenceStatus: "Equipment identity and stress review pending.", ownerQuestions: "Approve new machine ID and generic machine boundary?", newSlotWhen: "Direct quad volume is required beyond compound exposure.", doNotAddWhen: "Compound knee-dominant work sufficiently serves the goal/time budget.", whyCurrentCannotSolve: "Current quads are compound primary targets only." }),
  proposal({ priority: "P1", id: "incline-dumbbell-bench-press", identity: "Incline Dumbbell Bench Press", identityBoundary: "Adjustable-bench inclined press with angle as bounded setup; not a generic chest-region synonym.", family: "upper_push", movementRoles: ["horizontal_push"], trainingRoles: ["primary_strength", "secondary_strength"], sections: ["main", "accessory"], primaryMuscles: ["chest"], secondaryMuscles: ["front_delts", "triceps"], incidentalContributors: [], bodyRegions: ["shoulder", "elbow"], equipment: ["dumbbells", "adjustable_bench"], optionalEquipment: [], prerequisites: ["incline setup and pressing tolerance"], supportStance: "supine/inclined substantial bench support", resistancePath: "free_implement", genericDemands: "moderate stability and pressing range", scapularMechanics: "loaded pressing mechanics require review", trunkMechanics: "low with bench support", stressScope: "horizontal/angled pressing; angle-dependent overhead exposure review", loadabilityFatigue: "high; local chest/delts/triceps; moderate systemic", progressionAxes: ["load", "reps", "sets", "tempo", "bench_angle_bounded"], progressionRunway: "Broad.", transitions: "Flat press is a contextual emphasis/setup shift.", phaseEvidence: "EXTERNAL_REFERENCE_PENDING", candidatePoolEffect: "Potential regional/emphasis diversity, not required baseline coverage.", equipmentModeEffect: "Adjustable-bench environments only.", painSupportValue: "Angle may change response but cannot be presumed preferable.", responseModifications: "Load, range, angle, tempo, and volume vary.", stabilityClass: "ANCHOR_CAPABLE or BOUNDED_ROTATION_ELIGIBLE", knowledgeCompatibility: "Stable ID compatible.", evidenceStatus: "Marginal-value and regional-emphasis owner review pending.", ownerQuestions: "Does chest-region emphasis have a real Composer receiver before adding identity?", newSlotWhen: "Reviewed regional emphasis or response makes incline materially distinct.", doNotAddWhen: "It merely duplicates flat pressing.", whyCurrentCannotSolve: "Current schema cannot express reviewed chest-region emphasis; flat presses cover general chest." }),
  proposal({ priority: "P1", id: "suspension-row", identity: "Suspension Row", identityBoundary: "Body-angle horizontal body pull using a rated suspension anchor; not an improvised table row.", family: "upper_pull", movementRoles: ["horizontal_pull"], trainingRoles: ["primary_strength", "secondary_strength", "hypertrophy_accessory"], sections: ["main", "accessory"], primaryMuscles: ["mid_back", "lats"], secondaryMuscles: ["biceps", "rear_delts"], incidentalContributors: ["trunk", "grip"], bodyRegions: ["shoulder", "elbow", "wrist"], equipment: ["suspension_trainer_and_rated_anchor_pending"], optionalEquipment: [], prerequisites: ["rated anchor", "grip and plank/body-angle control"], supportStance: "feet supported, suspended hand support", resistancePath: "bodyweight", genericDemands: "body-angle-scaled stability, grip, and coordination", scapularMechanics: "loaded retraction/protraction control", trunkMechanics: "contextual anti-extension contribution", stressScope: "grip and upper-limb support; body-angle dependent", loadabilityFatigue: "moderate; pull/grip local; low-moderate systemic", progressionAxes: ["body_angle", "reps", "sets", "tempo", "range"], progressionRunway: "Useful home runway with rated equipment.", transitions: "Band/cable/free rows are equipment/path shifts.", phaseEvidence: "EXTERNAL_REFERENCE_PENDING", candidatePoolEffect: "Addresses home horizontal pulling where a rated anchor exists.", equipmentModeEffect: "Requires new explicit suspension capability; no environment-label inference.", painSupportValue: "Body angle scales demand; no universal lumbar/shoulder claim.", responseModifications: "Angle, range, grip, and volume vary.", stabilityClass: "ANCHOR_CAPABLE or STABLE_SUPPORTING_WORK", knowledgeCompatibility: "Stable ID compatible.", evidenceStatus: "Equipment/safety boundary and mechanics review pending.", ownerQuestions: "Approve suspension capability before catalog addition?", newSlotWhen: "Home horizontal pull lacks cable/band/dumbbell support but rated suspension exists.", doNotAddWhen: "No rated anchor exists or current rows already provide the needed pull.", whyCurrentCannotSolve: "Anchor-free/bodyweight profiles currently have no horizontal pull." }),
  proposal({ priority: "P1", id: "half-kneeling-hip-flexor-mobility", identity: "Half-Kneeling Hip Flexor Mobility", identityBoundary: "Half-kneeling hip-range preparation; not direct hip-flexor strengthening.", family: "mobility_preparation", movementRoles: ["mobility"], trainingRoles: ["preparation", "recovery"], sections: ["warmup", "cooldown"], primaryMuscles: [], secondaryMuscles: ["glutes"], incidentalContributors: ["trunk"], bodyRegions: ["hip", "pelvis"], equipment: ["floor_space"], optionalEquipment: ["wall"], prerequisites: ["kneeling tolerance"], supportStance: "half-kneeling, optional wall support", resistancePath: "bodyweight", genericDemands: "low load; hip range and pelvic control", scapularMechanics: "not relevant", trunkMechanics: "breathing/position contribution only", stressScope: "hip extension range; prescription side", loadabilityFatigue: "none; negligible fatigue", progressionAxes: ["range", "duration", "reps", "tempo"], progressionRunway: "Preparation/recovery only.", transitions: "No automatic transition to loaded lower-body work.", phaseEvidence: "EXTERNAL_REFERENCE_PENDING", candidatePoolEffect: "Adds hip-range preparation/cooldown option.", equipmentModeEffect: "Floor-space environments.", painSupportValue: "Kneeling and range tolerance must be explicit.", responseModifications: "Range, support, duration, and side vary.", stabilityClass: "TEMPORARY_CONTEXTUAL_TOOL", knowledgeCompatibility: "Stable ID compatible.", evidenceStatus: "Need and identity review pending.", ownerQuestions: "Is hip-range preparation a frequent enough receiver for P1?", newSlotWhen: "A reviewed hip-range dependency relates to today's loaded work.", doNotAddWhen: "It would be generic mobility filler.", whyCurrentCannotSolve: "No current mobility-role hip preparation exists." }),
  proposal({ priority: "P1", id: "side-lying-thoracic-rotation", identity: "Side-Lying Thoracic Rotation", identityBoundary: "Supported thoracic rotation mobility drill; not loaded trunk rotation.", family: "mobility_preparation", movementRoles: ["mobility"], trainingRoles: ["preparation", "recovery"], sections: ["warmup", "cooldown"], primaryMuscles: [], secondaryMuscles: ["trunk"], incidentalContributors: [], bodyRegions: ["thoracic_spine", "ribcage", "shoulder"], equipment: ["floor_space"], optionalEquipment: [], prerequisites: ["side-lying and shoulder-range tolerance"], supportStance: "side-lying with substantial floor support", resistancePath: "bodyweight", genericDemands: "low load; controlled thoracic/shoulder range", scapularMechanics: "low-load reach only", trunkMechanics: "controlled rotation contribution without loaded-rotation role", stressScope: "unloaded rotation; prescription side", loadabilityFatigue: "none; negligible fatigue", progressionAxes: ["range", "reps", "tempo", "duration"], progressionRunway: "Preparation/recovery only.", transitions: "Cable chop is separate loaded rotation identity.", phaseEvidence: "EXTERNAL_REFERENCE_PENDING", candidatePoolEffect: "Adds thoracic movement preparation when relevant.", equipmentModeEffect: "Bodyweight/floor environments.", painSupportValue: "Range remains bounded by response; no diagnostic inference.", responseModifications: "Range, side, breath timing, and reps vary.", stabilityClass: "TEMPORARY_CONTEXTUAL_TOOL", knowledgeCompatibility: "Stable ID compatible.", evidenceStatus: "Need/identity review pending.", ownerQuestions: "Approve thoracic-range receiver and boundary from shoulder mobility?", newSlotWhen: "Thoracic range is a reviewed dependency for the session.", doNotAddWhen: "It is unrelated generic cooldown content.", whyCurrentCannotSolve: "No current mobility-role thoracic candidate exists." }),
  proposal({ priority: "P1", id: "cable-hip-adduction", identity: "Cable Hip Adduction", identityBoundary: "Standing cable-resisted hip adduction; not the floor-supported P0 identity.", family: "hip_accessory", movementRoles: [], trainingRoles: ["hypertrophy_accessory"], sections: ["accessory"], primaryMuscles: ["hip_adductors"], secondaryMuscles: [], incidentalContributors: ["trunk", "hip_abductors"], bodyRegions: ["hip", "pelvis"], equipment: ["cable_stack", "cable_anchor_low", "stable_loaded_standing_space"], optionalEquipment: ["wall"], prerequisites: ["ankle cuff", "standing tolerance"], supportStance: "standing unilateral with optional wall support", resistancePath: "cable_anchored", genericDemands: "moderate balance and frontal-plane control", scapularMechanics: "not relevant", trunkMechanics: "contextual upright control", stressScope: "hip adduction; prescription side", loadabilityFatigue: "moderate-high local; low systemic", progressionAxes: ["load", "reps", "sets", "range", "tempo", "support_reduction"], progressionRunway: "Broad direct-accessory runway.", transitions: "Floor adduction is support/equipment shift.", phaseEvidence: "EXTERNAL_REFERENCE_PENDING", candidatePoolEffect: "Adds loadability/path diversity after direct-adductor bootstrap.", equipmentModeEffect: "Low cable and cuff required.", painSupportValue: "Support can reduce balance cost; no suitability inference.", responseModifications: "Load, range, support, side, and volume vary.", stabilityClass: "STABLE_SUPPORTING_WORK or BOUNDED_ROTATION_ELIGIBLE", knowledgeCompatibility: "Stable ID compatible.", evidenceStatus: "P1 identity/equipment review pending.", ownerQuestions: "Model ankle-cuff prerequisite/equipment explicitly?", newSlotWhen: "Higher-load direct adduction is needed and legal.", doNotAddWhen: "Floor-supported P0 work is sufficient.", whyCurrentCannotSolve: "No current direct adductor row; P0 adds only limited floor loadability." }),
  proposal({ priority: "P1", id: "cable-hip-abduction", identity: "Cable Hip Abduction", identityBoundary: "Standing cable-resisted hip abduction; distinct from loop-band lateral stepping.", family: "hip_accessory", movementRoles: [], trainingRoles: ["hypertrophy_accessory"], sections: ["accessory"], primaryMuscles: ["hip_abductors"], secondaryMuscles: ["glutes"], incidentalContributors: ["trunk", "hip_adductors"], bodyRegions: ["hip", "pelvis"], equipment: ["cable_stack", "cable_anchor_low", "stable_loaded_standing_space"], optionalEquipment: ["wall"], prerequisites: ["ankle cuff", "standing tolerance"], supportStance: "standing unilateral with optional wall support", resistancePath: "cable_anchored", genericDemands: "moderate balance and hip control", scapularMechanics: "not relevant", trunkMechanics: "contextual upright control", stressScope: "hip abduction; prescription side", loadabilityFatigue: "moderate-high local; low systemic", progressionAxes: ["load", "reps", "sets", "range", "tempo", "support_reduction"], progressionRunway: "Broad direct-accessory runway.", transitions: "Loop-band walk is a task/equipment shift.", phaseEvidence: "EXTERNAL_REFERENCE_PENDING", candidatePoolEffect: "Adds direct-abductor path/loadability diversity.", equipmentModeEffect: "Low cable and cuff required.", painSupportValue: "Support changes balance; no safety inference.", responseModifications: "Load, range, support, side, and volume vary.", stabilityClass: "STABLE_SUPPORTING_WORK or BOUNDED_ROTATION_ELIGIBLE", knowledgeCompatibility: "Stable ID compatible.", evidenceStatus: "P1 identity/equipment review pending.", ownerQuestions: "Model ankle-cuff prerequisite/equipment explicitly?", newSlotWhen: "Higher-load isolated abduction has marginal value.", doNotAddWhen: "Loop-band or compound exposure is sufficient.", whyCurrentCannotSolve: "No current direct abductor row; P0 has limited loadability and a stepping task." }),
];

const P2_DEFERRED = [
  "barbell-back-squat", "barbell-deadlift", "barbell-bench-press", "unassisted-pull-up",
  "seated-calf-raise", "slider-leg-curl", "landmine-press", "hanging-knee-raise",
] as const;
const REJECTED_CONCEPTS = [
  "preacher-curl (near-duplicate arm slot)", "rope-triceps-pressdown (attachment-only duplicate)",
  "seated-lateral-raise (support variant before support receiver)", "wide-grip-lat-pulldown (grip variant only)",
  "machine-chest-fly (current cable fly already owns direct chest isolation)",
] as const;

function inventoryRow(exercise: ExerciseDefinition) {
  const acceptedStress = (exercise.stressAnnotations ?? []).filter((row) => row.reviewStatus === "accepted");
  const acceptedPhase = (exercise.phaseSuitabilityAnnotations ?? []).filter((row) => row.reviewStatus === "accepted");
  return {
    id: exercise.id,
    name: exercise.name,
    family: exercise.family,
    movementRoles: exercise.movementRoles,
    actionFunctions: exercise.actionFunctions,
    trainingRoles: exercise.trainingRoles,
    sections: Object.keys(exercise.sectionSuitability),
    primaryMuscles: exercise.primaryMuscles,
    secondaryMuscles: exercise.secondaryMuscles,
    muscleContributions: exercise.muscleContributions,
    bodyRegions: exercise.bodyRegions,
    equipment: exercise.equipmentRequirements.map((row) => ({ id: row.id, allOf: row.allOf ?? [], oneOf: row.oneOf ?? [], machineIds: row.machineIds ?? [] })),
    optionalEquipment: exercise.optionalEquipment.map((row) => row.id),
    prerequisites: exercise.prerequisites.map((row) => row.id),
    contextualPhase: { accepted: acceptedPhase.length, reviewOrUnknown: (exercise.phaseSuitabilityAnnotations ?? []).length - acceptedPhase.length },
    loading: exercise.loading,
    support: exercise.mechanics?.support ?? null,
    resistancePath: exercise.mechanics?.resistancePath ?? null,
    demands: exercise.mechanics?.demands ?? null,
    scapularMechanics: exercise.mechanics?.scapularMechanics ?? null,
    trunkMechanics: exercise.mechanics?.trunkMechanics ?? null,
    structuredStress: acceptedStress,
    legacyStress: { caution: exercise.cautionStressTags, contraindicated: exercise.contraindicatedStressTags },
    progressionAxes: exercise.progression.progressionAxes,
    transitions: exercise.progression.transitionRelationships,
    coachingFocus: exercise.coachingFocus,
    knowledgeCompatibility: { stableId: true, compactFallback: exercise.coachingFocus.length <= 2, dependency: false },
    status: rowStatus(exercise),
  };
}

function buildSourceConsistency(inventoryFingerprint: string, sourceCatalogFingerprint: string) {
  return {
    source: "src/data/referenceExercises.ts#REFERENCE_EXERCISES",
    sourceCatalogFingerprint,
    reportInventoryFingerprint: inventoryFingerprint,
    currentReportConsistency: "PASS_REGENERATED_FROM_CANONICAL_SOURCE",
    staleFields: [],
    regeneratedReport: "docs/training-engine-v2/REFERENCE_EXERCISE_KNOWLEDGE_REVIEW.md",
    regenerationOwner: "packages/training-engine-v2/tests/helpers/candidateIntelligenceReviewReport.ts",
    historicalDocuments: [
      "PHASE_SUITABILITY_CALIBRATION_REVIEW.md retains an explicitly superseded pre-activation laboratory snapshot.",
      "PHASE_ANNOTATION_CONTEXT_REVIEW.md retains an explicitly superseded pre-activation laboratory snapshot.",
    ],
  };
}

export function buildWholeBodyExerciseKnowledgeAuditData() {
  const inventory = REFERENCE_EXERCISES.map(inventoryRow);
  const roleAudit = buildRoleAudit();
  const muscleAudit = buildMuscleAudit();
  const matrix = buildMatrixRows();
  const phase = buildContextualPhaseActivationRootCauseData();
  const safety = buildTrainingSafetyAndResponseFoundationData();
  const adaptive = buildStableAdaptiveProgrammingPolicyData();
  const rowStatusCounts = Object.fromEntries(
    [...new Set(inventory.map((row) => row.status))].sort().map((status) => [status, inventory.filter((row) => row.status === status).length]),
  );
  const fingerprints = {
    catalogInventory: hash(inventory),
    rolePurity: hash(roleAudit),
    muscleTargetExposure: hash(muscleAudit),
    candidatePoolMatrix: hash(matrix),
    equipmentModeCoverage: hash(matrix.map((row) => ({ archetypeId: row.archetypeId, environmentId: row.environmentId, truthfulLegalIds: row.truthfulLegalIds, classification: row.classification }))),
    painAwareCoverage: hash({ safety: safety.combinedFingerprint, stressAlternatives: matrix.map((row) => [row.archetypeId, row.environmentId, row.stressAlternativeIds]) }),
    progressionContinuity: hash(inventory.map((row) => ({ id: row.id, axes: row.progressionAxes, transitions: row.transitions }))),
    minimalExpansionProposal: hash(PROPOSED_CONCEPTS),
    knowledgeCompatibility: hash(inventory.map((row) => ({ id: row.id, coachingFocus: row.coachingFocus, stableId: row.knowledgeCompatibility.stableId, compactFallback: row.knowledgeCompatibility.compactFallback, dependency: row.knowledgeCompatibility.dependency }))),
  };
  const combinedWholeBodyAudit = hash({ fingerprints, rowStatusCounts });
  return {
    asOf: WHOLE_BODY_AUDIT_AS_OF,
    classification: "P0_WHOLE_BODY_PRODUCTION_ADMITTED" as const,
    graduationVerdict: "CANDIDATE_INTELLIGENCE_READY_FOR_SESSION_COMPOSER_DESIGN" as const,
    productionBehaviorChanged: true,
    catalogCount: REFERENCE_EXERCISES.length,
    uniqueCatalogCount: new Set(REFERENCE_EXERCISES.map((exercise) => exercise.id)).size,
    productionRankingFingerprint: phase.productionRankingAfter,
    comprehensiveBehaviorFingerprint: phase.comprehensiveAfter,
    contextualPhaseFingerprint: phase.contextualPhaseFingerprint,
    safetyResponseFingerprint: safety.combinedFingerprint,
    stableAdaptiveFingerprint: adaptive.combinedFingerprint,
    movementRoleFinding: "MovementRole is authoritative broad selection-purpose truth. Historical muscle/action proxies are removed; exact actions now use the reviewed actionFunctions receiver.",
    recommendedDomainOption: "OPTION_D_HYBRID_MACRO_SELECTION_ROLES_PLUS_OPTIONAL_ACTION_FUNCTION_PROFILE" as const,
    directMuscleOnlyFinding: "Direct accessory requests can combine broad accessory role, exact action/function, and primary-required muscle ownership.",
    primarySecondaryFinding: "Hard eligibility honors any-meaningful, primary-preferred, and primary-required relationship semantics from canonical muscle contributions.",
    weeklyExposureContract: "Before Week Composer, add a reviewed contribution relationship of primary target, key secondary target, incidental contributor, stabilizer/contextual contributor, or unknown. Keep one exercise/set event singular and do not invent set-equivalence coefficients.",
    taxonomyDecisions: [
      "Keep trunk as the approved umbrella.",
      "Do not add chest-region or abdominal subdivisions until a programming receiver exists; use optional emphasis metadata if later approved.",
      "Decide whether forearms/grip requires first-class target ownership before Week Composer; current stress/carry metadata is not developmental credit.",
      "Defer hip flexors and spinal erectors as first-class MuscleGroup values until direct-volume or assessment receivers exist.",
      "Calves, hip adductors, hip abductors, and rotator cuff now have truthful primary candidates in the production catalog.",
    ],
    roleAudit,
    roleProblemIds: Object.keys(ROLE_PROBLEMS),
    muscleAudit,
    inventory,
    rowStatusCounts,
    matrix,
    proposedConcepts: PROPOSED_CONCEPTS,
    p2Deferred: P2_DEFERRED,
    rejectedConcepts: REJECTED_CONCEPTS,
    sourceConsistency: buildSourceConsistency(fingerprints.catalogInventory, phase.catalogFingerprint),
    evidence: {
      reviewedAt: WHOLE_BODY_AUDIT_AS_OF,
      sources: [
        { id: "ACSM_2026_POSITION_STAND", url: "https://acsm.org/resistance-training-guidelines-update-2026/", use: "Consistency, goal-specific prescription, and equipment-mode non-superiority context." },
        { id: "KASSIANO_2022_VARIATION_REVIEW", url: "https://pubmed.ncbi.nlm.nih.gov/35438660/", use: "Systematic rather than random variation and avoidance of redundant exercise rotation." },
        { id: "SCHOENFELD_2017_VOLUME_REVIEW", url: "https://pubmed.ncbi.nlm.nih.gov/27433992/", use: "Weekly-volume relevance only; no exercise-specific set credits inferred." },
        { id: "BARBALHO_2019_MULTI_SINGLE_JOINT_REVIEW", url: "https://pubmed.ncbi.nlm.nih.gov/31336594/", use: "Supports preserving direct-versus-compound contribution as a review question; no coefficients adopted." },
      ],
      conceptStatus: "Exactly eight owner-curated P0 identities are now production knowledge; the retained concept rows are historical admission evidence.",
    },
    areaClassifications: {
      movementRole: "DOMAIN_CONTRACT_IMPLEMENTED",
      muscleContribution: "DOMAIN_CONTRACT_IMPLEMENTED",
      currentCatalog: "P0_WHOLE_BODY_PRODUCTION_ADMITTED",
      sessionCoordination: "DEFER_TO_SESSION_COMPOSER",
      weeklyExposure: "DEFER_TO_WEEK_COMPOSER",
      prescription: "DEFER_TO_PRESCRIPTION",
      responseAdaptation: "DEFER_TO_LONGITUDINAL_ADAPTATION",
      educationalContent: "DEFER_TO_KNOWLEDGE_LAYER",
    },
    blockersBeforeCatalogImplementation: [],
    blockersBeforeSessionComposer: [
      "Obtain separate owner authorization for Session Composer design.",
      "Accept the documented Composer signatures and ownership boundary in that separate scope.",
    ],
    nextDependency: "SEPARATE_OWNER_AUTHORIZATION_FOR_SESSION_COMPOSER_DESIGN",
    fingerprints: { ...fingerprints, combinedWholeBodyAudit },
  } as const;
}

function list(values: readonly unknown[]): string {
  return values.length === 0 ? "none" : values.join(", ");
}

function table(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  const escape = (value: unknown) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escape).join(" | ")} |`),
  ].join("\n");
}

export function renderWholeBodyExerciseKnowledgeAudit(data = buildWholeBodyExerciseKnowledgeAuditData()): string {
  const fullGymRows = data.matrix.filter((row) => row.environmentId === "full-commercial-gym");
  return [
    "# Whole-Body Exercise Knowledge and Candidate-Pool Audit",
    "",
    `As of: ${data.asOf}. Classification: **${data.classification}**. Graduation: **${data.graduationVerdict}**.`,
    "",
    `Canonical source: \`${data.sourceConsistency.source}\`; ${data.catalogCount} rows / ${data.uniqueCatalogCount} stable IDs. Production behavior changed: **${data.productionBehaviorChanged}**.`,
    "",
    "## Graduation Verdict",
    "",
    "Candidate Intelligence now exposes truthful broad roles, exact actions, and requestable muscle-contribution ownership across one 45-row production catalog. The eight approved P0 identities resolve the reviewed direct and home/preparation gaps.",
    "",
    "The role/action, contributor, and P0 production contracts are implemented. Session/Week composition, set-credit math, and automatic adaptation remain separate owners.",
    "",
    "## Authoritative Domain Findings",
    "",
    `- MovementRole: ${data.movementRoleFinding}`,
    `- Implemented model: **${data.recommendedDomainOption}**. Macro selection roles are clean and optional action/function requirements serve exact receivers such as knee flexion and cuff control.`,
    `- Muscle-only slots: ${data.directMuscleOnlyFinding}`,
    `- Primary versus secondary: ${data.primarySecondaryFinding}`,
    `- Weekly exposure: ${data.weeklyExposureContract}`,
    "- Leg Press may own knee-dominant strength but must not silently prove coordinated squat rehearsal. Lying Leg Curl and Glute Bridge must not prove hinge-pattern exposure.",
    "- One exercise remains one candidate and one exposure event even when it has several roles, muscles, mechanics, or stress descriptors.",
    "",
    "## Role Purity",
    "",
    table(["Exercise", "Classification", "Macro truth", "Section gate sufficient", "Finding"], data.roleAudit.map((row) => [row.exerciseId, row.classification, row.macroPatternSatisfied, row.sectionGateIsSufficient, row.finding])),
    "",
    "## Muscle Taxonomy",
    "",
    table(["Muscle", "Primary", "Secondary", "Equipment", "Roles", "Loadability", "Direct", "Pool"], data.muscleAudit.map((row) => [row.muscle, `${row.primaryIds.length}: ${list(row.primaryIds)}`, `${row.secondaryIds.length}: ${list(row.secondaryIds)}`, list(row.equipmentCoverage), list(row.trainingRoleCoverage), list(row.loadabilityRange), row.directSelectable, row.poolMeaning])),
    "",
    "Taxonomy decisions:",
    ...data.taxonomyDecisions.map((decision) => `- ${decision}`),
    "",
    "## Complete 45-Row Audit",
    "",
    table(["ID", "Family", "Movement roles", "Training roles/sections", "Primary / secondary", "Equipment", "Phase accepted/review", "Support / path", "Stress accepted", "Progression axes/transitions", "Status"], data.inventory.map((row) => [row.id, row.family, list(row.movementRoles), `${list(row.trainingRoles)} / ${list(row.sections)}`, `${list(row.primaryMuscles)} / ${list(row.secondaryMuscles)}`, list(row.equipment.map((value) => value.id)), `${row.contextualPhase.accepted}/${row.contextualPhase.reviewOrUnknown}`, `${row.support?.supportAmount ?? "unknown"} / ${row.resistancePath?.resistancePath ?? "unknown"}`, list(row.structuredStress.map((value) => value.tag)), `${list(row.progressionAxes)} / ${row.transitions.length}`, row.status])),
    "",
    "Row status counts: " + Object.entries(data.rowStatusCounts).map(([status, count]) => `${status}=${count}`).join("; ") + ".",
    "",
    "## Full-Gym Pool Summary",
    "",
    table(["Archetype", "Contexts", "Production legal", "Truthful legal", "Excluded by audit", "Primary", "Secondary", "Support", "Path/load/runway", "Phase accepted", "Stress alternatives", "Classification"], fullGymRows.map((row) => [row.archetypeId, list(row.contexts), list(row.productionLegalIds), list(row.truthfulLegalIds), list(row.excludedByAuditTruthIds), list(row.primaryTargetIds), list(row.secondaryContributorIds), `${list(row.supportedIds)} / unsupported=${list(row.unsupportedIds)}`, `${list(row.diversity.resistancePath)} / ${list(row.diversity.loadability)} / ${list(row.diversity.progressionRunway)}`, list(row.phaseEvidence.accepted), list(row.stressAlternativeIds), row.classification])),
    "",
    "The complete ten-environment legal/rejected matrix is generated in `WHOLE_BODY_CANDIDATE_POOL_MATRIX.md`. Counts are not the sufficiency rule: one excellent candidate can pass, while redundant rows or false roles cannot.",
    "",
    "## Whole-Body Readiness Answers",
    "",
    "1. Strength: gym bootstrap **yes**, environment-complete **no**; vertical press, home pulling, and role purity remain thin.",
    "2. Hypertrophy: **truthful bootstrap coverage is present** for direct calves/adductors/abductors/cuff and home knee flexion; several pools remain thin rather than empty.",
    "3. General fitness: **conditionally yes** in gym/dumbbell environments, with explicit omissions elsewhere.",
    "4. Posture/movement quality: **truthful bootstrap coverage is present** for ankle mobility, hinge rehearsal, and single-leg stance preparation; breadth remains intentionally bounded.",
    "5. Pain-aware complete training: **conditionally yes in richer environments**. Stress matching and support alternatives work, but some pattern/environment combinations have a single dependency.",
    "6. Equipment environments: **no**. Bands without anchors, loop-only, and bodyweight cannot manufacture pulling; barbell/pull-up capabilities have little or no catalog use.",
    "7. Stable adaptive base: **yes for current productive rows**; progression axes and response history preserve KEEP -> PROGRESS -> REPLACE WHEN JUSTIFIED.",
    "8. Time constrained: **candidate value can be identified**, but coordination/removal belongs to Session Composer.",
    "9. Direct accessories contaminate compound coverage: **no**; the ten reviewed rows now have truthful broad roles and exact actions.",
    "10. Week muscle contribution: canonical relationship truth exists, but Week set-credit policy remains unowned and unimplemented.",
    "11. Exact next dependency: separate owner authorization for Session Composer design.",
    "12. Safe to wait: exact set-credit policy, composition ordering, P1/P2 variations, long-form Knowledge content, and longitudinal replacement logic.",
    "",
    "## Pain, Support, Progression, and Churn",
    "",
    `Safety/response regression fingerprint: \`${data.safetyResponseFingerprint}\`; stable-adaptive fingerprint: \`${data.stableAdaptiveFingerprint}\`. Region alone creates no intolerance; explicit matched stress remains required; one adverse realization does not ban identity; tolerated re-exposure remains visible; explicit TrainingSafety gates execution downstream without rewriting diagnostic rank.`,
    "",
    "Support is a necessary candidate distinction when it materially changes setup/task identity (for example chest-supported row versus unsupported row), a prescription variant when amount can change within identity (split squat, step-up, wall march), and not a reason to clone every support amount. Current row, machine, floor, wall, seated, standing, and box options are useful but uneven.",
    "",
    "Progression runway is strongest in loaded compounds and the reviewed trunk/carry tranche; preparation rows are intentionally bounded. Exercises with zero reviewed cross-exercise transitions remain usable through same-exercise axes. Transition observations never authorize replacement.",
    "",
    "Review classifications: loaded presses, rows, squats, hinges, and loaded carries can be `ANCHOR_CAPABLE` by role/context; direct arms/delts/trunk and machine isolation can be `STABLE_SUPPORTING_WORK` or `BOUNDED_ROTATION_ELIGIBLE`; preparation/recovery rows are usually `TEMPORARY_CONTEXTUAL_TOOL`. These labels are observational only.",
    "",
    "Redundancy clusters: four horizontal rows, three horizontal presses, two vertical pulldowns, and overlapping scapular/rear-delt accessories. Diversity is useful only where support, path, equipment, response, or loadability changes selection. Under time constraint, generic/redundant accessories leave before productive anchors; multi-tag exercises still receive one slot/event.",
    "",
    "## Source Consistency",
    "",
    `Source catalog fingerprint: \`${data.sourceConsistency.sourceCatalogFingerprint}\`. Inventory report fingerprint: \`${data.sourceConsistency.reportInventoryFingerprint}\`. Result: **${data.sourceConsistency.currentReportConsistency}**.`,
    "",
    `Stale current-source fields: ${list(data.sourceConsistency.staleFields)}. Regeneration owner: \`${data.sourceConsistency.regenerationOwner}\`. Historical pre-activation laboratories remain historical rather than current production inventories.`,
    "",
    "## Evidence Boundary",
    "",
    ...data.evidence.sources.map((source) => `- [${source.id}](${source.url}) (${data.evidence.reviewedAt}): ${source.use}`),
    `- Proposed concepts: **${data.evidence.conceptStatus}**`,
    "",
    "## Fingerprints",
    "",
    table(["Contract", "Fingerprint"], Object.entries(data.fingerprints)),
    "",
    `Production ranking: \`${data.productionRankingFingerprint}\`. Comprehensive behavior: \`${data.comprehensiveBehaviorFingerprint}\`. Contextual phase: \`${data.contextualPhaseFingerprint}\`.`,
    "",
    "Production roles, action functions, canonical muscle relationships, affected candidate pools, bounded personalization, and the catalog count from 37 to 45 changed intentionally. Phase votes, pain tags beyond one dose-created calf grip tag, safety/response behavior, Composer, automatic transitions, Knowledge Layer, routes, and UI remain unchanged.",
    "",
  ].join("\n");
}

export function renderWholeBodyCandidatePoolMatrix(data = buildWholeBodyExerciseKnowledgeAuditData()): string {
  return [
    "# Whole-Body Candidate-Pool Matrix",
    "",
    `Generated from the canonical ${data.catalogCount}-row catalog on ${data.asOf}. Matrix fingerprint: \`${data.fingerprints.candidatePoolMatrix}\`.`,
    "",
    "`Production legal` applies current hard role/section/movement/action/muscle-relationship/equipment truth. `Truthful legal` additionally applies any exact identity boundary used by this audit. `Rejected` reports exact deterministic reason codes.",
    "",
    table(["Archetype", "Context tags", "Environment", "Production legal", "Truthful legal", "Primary", "Secondary", "Supported / unsupported", "Rejected (reason codes)", "Equipment", "Classification"], data.matrix.map((row) => [row.archetypeId, list(row.contexts), row.environmentId, list(row.productionLegalIds), list(row.truthfulLegalIds), list(row.primaryTargetIds), list(row.secondaryContributorIds), `${list(row.supportedIds)} / ${list(row.unsupportedIds)}`, list(row.hardRejected.map((item) => `${item.id}(${item.reasons.join("+")})`)), row.equipmentLimitation, row.classification])),
    "",
    "Environment labels are never capability facts. Barbell and pull-up-bar capabilities exist in the domain, but the current catalog has no barbell row and no pull-up identity. Machine capability exists for shoulder press without a production exercise; knee-extension, hip machines, suspension, sliders, and assistance require explicit capability contracts before use.",
    "",
  ].join("\n");
}

function renderConcept(concept: ProposedConcept): string {
  return [
    `## ${concept.priority}: ${concept.id}`,
    "",
    `- Identity: **${concept.identity}**. Boundary: ${concept.identityBoundary}`,
    `- Family/roles/sections: ${concept.family}; movement=${list(concept.movementRoles)}; training=${list(concept.trainingRoles)}; sections=${list(concept.sections)}.`,
    `- Muscles/regions: primary=${list(concept.primaryMuscles)}; secondary=${list(concept.secondaryMuscles)}; incidental=${list(concept.incidentalContributors)}; regions=${list(concept.bodyRegions)}.`,
    `- Equipment/setup: required=${list(concept.equipment)}; optional=${list(concept.optionalEquipment)}; prerequisites=${list(concept.prerequisites)}; ${concept.supportStance}; path=${concept.resistancePath}.`,
    `- Mechanics/stress: ${concept.genericDemands}; scapular=${concept.scapularMechanics}; trunk=${concept.trunkMechanics}; stress=${concept.stressScope}.`,
    `- Loading/progression: ${concept.loadabilityFatigue}; axes=${list(concept.progressionAxes)}; runway=${concept.progressionRunway}; transitions=${concept.transitions}.`,
    `- Phase/evidence: ${concept.phaseEvidence}; ${concept.evidenceStatus}`,
    `- Pool/environment: ${concept.candidatePoolEffect} ${concept.equipmentModeEffect}`,
    `- Pain/response: ${concept.painSupportValue} ${concept.responseModifications}`,
    `- Stable-adaptive review: ${concept.stabilityClass}. ${concept.knowledgeCompatibility}`,
    `- NEW_SLOT_WHEN: ${concept.newSlotWhen}`,
    `- DO_NOT_ADD_WHEN: ${concept.doNotAddWhen}`,
    `- WHY_CURRENT_CATALOG_CANNOT_ALREADY_SOLVE_THIS: ${concept.whyCurrentCannotSolve}`,
    `- Owner decision: ${concept.ownerQuestions}`,
    "",
  ].join("\n");
}

export function renderWholeBodyMinimalCatalogExpansionProposal(data = buildWholeBodyExerciseKnowledgeAuditData()): string {
  return [
    "# Whole-Body Minimal Catalog Expansion Proposal",
    "",
    `Admission-evidence fingerprint: \`${data.fingerprints.minimalExpansionProposal}\`. Exactly eight P0 concepts are now production data; these retained rows document their admission rationale. P1 concepts remain unimplemented review input only.`,
    "",
    `P0 (${data.proposedConcepts.filter((row) => row.priority === "P0").length}): ${list(data.proposedConcepts.filter((row) => row.priority === "P0").map((row) => row.id))}.`,
    "",
    `P1 (${data.proposedConcepts.filter((row) => row.priority === "P1").length}): ${list(data.proposedConcepts.filter((row) => row.priority === "P1").map((row) => row.id))}.`,
    "",
    `P2/deferred: ${list(data.p2Deferred)}.`,
    "",
    `Reject/defer as duplicate or low marginal value: ${list(data.rejectedConcepts)}.`,
    "",
    "Legacy concepts are `REUSE_AS_DATA` only for stable definitional facts, `KEEP_AS_TEST_ORACLE` for observed behavior, `REIMPLEMENT_FROM_PRINCIPLE` for domain contracts, `NEEDS_REVIEW` for exercise-science judgments, and `DO_NOT_PORT` for global phase labels, automatic ladders, prose-derived mechanics, and near-duplicate variations.",
    "",
    ...data.proposedConcepts.map(renderConcept),
    "## Implementation Gates",
    "",
    ...data.blockersBeforeCatalogImplementation.map((value) => `- ${value}`),
    "",
    "The eight P0 identities are production knowledge. Any remaining P1 proposal-to-production admission is separately authorized and must not begin Session Composer, Week Composer, automatic rotation/replacement/progression, or Knowledge UI work.",
    "",
  ].join("\n");
}

export function writeWholeBodyExerciseKnowledgeAudit(rootDir = process.cwd()) {
  const data = buildWholeBodyExerciseKnowledgeAuditData();
  const docsDir = join(rootDir, "../../docs/training-engine-v2");
  const paths = {
    audit: join(docsDir, "WHOLE_BODY_EXERCISE_KNOWLEDGE_AND_CANDIDATE_POOL_AUDIT.md"),
    matrix: join(docsDir, "WHOLE_BODY_CANDIDATE_POOL_MATRIX.md"),
    proposal: join(docsDir, "WHOLE_BODY_MINIMAL_CATALOG_EXPANSION_PROPOSAL.md"),
  };
  writeFileSync(paths.audit, renderWholeBodyExerciseKnowledgeAudit(data));
  writeFileSync(paths.matrix, renderWholeBodyCandidatePoolMatrix(data));
  writeFileSync(paths.proposal, renderWholeBodyMinimalCatalogExpansionProposal(data));
  return { data, paths };
}

if (process.argv[1]?.endsWith("wholeBodyExerciseKnowledgeAudit.ts")) {
  const result = writeWholeBodyExerciseKnowledgeAudit();
  console.log(JSON.stringify({ paths: result.paths, fingerprints: result.data.fingerprints }, null, 2));
}
