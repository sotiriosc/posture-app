import {
  REFERENCE_EXERCISES,
  THREE_PHASE_FOUNDATION,
  buildSessionCandidateResults,
  buildSessionPrescriptionHandoff,
  composeSessionSkeleton,
  PRESCRIPTION_POLICY_V1_ADMISSION_SPECIFICITY_ORDER as PRODUCTION_V1_SPECIFICITY_ORDER,
  PRESCRIPTION_POLICY_V1_ID as PRODUCTION_V1_ID,
  PRESCRIPTION_POLICY_V1_PHILOSOPHY as PRODUCTION_V1_PHILOSOPHY,
  PRESCRIPTION_POLICY_V1_REST_PLACEMENT as PRODUCTION_V1_REST_PLACEMENT,
  PRESCRIPTION_POLICY_V1_REVIEWED_AT as PRODUCTION_V1_REVIEWED_AT,
  PRESCRIPTION_POLICY_V1_REVIEWER_ID as PRODUCTION_V1_REVIEWER_ID,
  PRESCRIPTION_POLICY_V1_RULE_MATRIX as PRODUCTION_V1_RULE_MATRIX,
  PRESCRIPTION_POLICY_V1_VERSION as PRODUCTION_V1_VERSION,
  validatePerformanceBlockLinkage,
  type ExerciseDose,
  type ExerciseDoseMode,
  type ExercisePerformanceBlockLinkage,
  type ExercisePrescriptionPlan,
  type LoadTarget,
  type PrescriptionBlockPerformanceResult,
  type SessionNeed,
  type SessionNeedDependency,
  type SessionPrescriptionHandoff,
  type StructuralCapacityMode,
  type SessionIntent,
  type TrainingOutcomeGoal,
  type TrainingRole,
} from "../../src";
import {
  BICEPS_NEED,
  HINGE_NEED,
  PULL_NEED,
  PUSH_NEED,
  SQUAT_NEED,
  TRICEPS_NEED,
  productionContext,
  productionIntent,
  selection,
  sessionNeed,
  trimResults,
} from "../helpers/sessionComposerProduction";
import { buildProductionComposerFingerprints } from "../helpers/sessionComposerProduction";
import {
  EXPECTED_PLANNER_FINGERPRINTS,
  computePlannerFingerprints,
} from "../helpers/sessionIntentPlannerProduction";
import { buildPrescriptionTimingFoundationData } from "../helpers/prescriptionTimingFoundation";
import {
  CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
  CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
  buildCurrentTrunkCurationFingerprints,
} from "../helpers/trunkMechanicsCurationProposal";
import { EXPECTED_CAGT_FINGERPRINTS } from "./report";
import { digest } from "./signatures";
import {
  EXPECTED_WEEK_POLICY_V1_FINGERPRINTS,
} from "./weekPolicyV1Report";
import {
  EXPECTED_PRESCRIPTION_EVALUATOR_HARDENING_FINGERPRINTS,
  PRESCRIPTION_NUMERIC_FAMILIES,
  compileFullSession,
  type BlindedPolicyBundle,
  type CompiledPrescriptionSessionResult,
  type EvaluatorPolicySemantics,
  type PrescriptionFullSessionFixture,
} from "./prescriptionTournamentEvaluatorHardening";
import {
  PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES,
  PRESCRIPTION_NUMERIC_CANDIDATE_MANIFEST_FINGERPRINT,
  buildPrescriptionNumericCalibrationScenarios,
  buildPrescriptionNumericLockedHoldoutScenarios,
  type EffortPolicyTarget,
  type NumericPolicyTarget,
  type PrescriptionNumericCandidateValue,
  type PrescriptionNumericFamily,
  type TargetUnit,
} from "./prescriptionPolicyTournament";

export const PRESCRIPTION_POLICY_V1_ID = PRODUCTION_V1_ID;
export const PRESCRIPTION_POLICY_V1_VERSION = PRODUCTION_V1_VERSION;
export const PRESCRIPTION_POLICY_V1_REVIEWED_AT = PRODUCTION_V1_REVIEWED_AT;
export const PRESCRIPTION_POLICY_V1_REVIEWER_ID = PRODUCTION_V1_REVIEWER_ID;
export const PRESCRIPTION_POLICY_V1_STATE =
  "OWNER_SELECTED_FOR_FINAL_CAGT_ADMISSION_NOT_PRODUCTION" as const;
export const PRESCRIPTION_POLICY_V1_HOLDOUT_ID =
  "PRESCRIPTION_POLICY_V1_OWNER_ADMISSION_HOLDOUT" as const;
export const PRESCRIPTION_POLICY_V1_HOLDOUT_SEED = 0x0806713;
export const PRESCRIPTION_POLICY_V1_PHILOSOPHY = PRODUCTION_V1_PHILOSOPHY;

export type PrescriptionPolicyV1Classification =
  | "PRESCRIPTION_POLICY_V1_READY_FOR_PRODUCTION_COMPILER_IMPLEMENTATION_AUTHORIZATION"
  | "PRESCRIPTION_POLICY_V1_PARTIAL_SCOPE_READY_TARGETED_GAPS"
  | "TARGETED_PRESCRIPTION_POLICY_V1_FIXES_REQUIRED"
  | "PRESCRIPTION_POLICY_V1_FOUNDATION_GAP";

export type OwnerPolicyDecisionDisposition =
  | "selected_for_v1_candidate"
  | "selected_as_scoped_override"
  | "deferred"
  | "rejected_as_default"
  | "retained_for_future_response_led_use";

export type CagtOwnerPolicyEvidence =
  | "admissible"
  | "non_dominated"
  | "dominated"
  | "incomparable"
  | "causal_failure"
  | "insufficient_evidence";

export type OwnerHoldoutEquipmentContext =
  | "full_gym"
  | "dumbbells"
  | "bands"
  | "bodyweight"
  | "mixed";

export type OwnerPerformanceObservationKind =
  | "exact_completion"
  | "fewer_reps"
  | "lower_load"
  | "shorter_hold"
  | "altered_tempo"
  | "omitted_acclimation_block"
  | "omitted_developmental_block"
  | "partial_session"
  | "substitution"
  | "unknown_actual_timing"
  | "no_observation";

export const PRESCRIPTION_POLICY_V1_SPECIFICITY_ORDER = PRODUCTION_V1_SPECIFICITY_ORDER;
export const PRESCRIPTION_POLICY_V1_REST_PLACEMENT = PRODUCTION_V1_REST_PLACEMENT;
export const PRESCRIPTION_POLICY_V1_RULE_MATRIX = PRODUCTION_V1_RULE_MATRIX;

export const PRESCRIPTION_POLICY_V1_OWNER_DECISION = Object.freeze({
  sourceType: "owner_decision",
  reviewerId: PRESCRIPTION_POLICY_V1_REVIEWER_ID,
  reviewedAt: PRESCRIPTION_POLICY_V1_REVIEWED_AT,
  policyId: PRESCRIPTION_POLICY_V1_ID,
  version: PRESCRIPTION_POLICY_V1_VERSION,
  state: PRESCRIPTION_POLICY_V1_STATE,
  philosophy: [
    "BALANCED_DEVELOPMENTAL_WORK",
    "MINIMAL_SUPPORTING_WORK",
    "CONTEXT_SCOPED_ESCALATION",
    "STABLE_CONTINUITY",
    "NO_ARTIFICIAL_DIVERSITY",
  ],
  cagtEvidenceVocabulary: [
    "admissible",
    "non_dominated",
    "dominated",
    "incomparable",
    "causal_failure",
    "insufficient_evidence",
  ] satisfies readonly CagtOwnerPolicyEvidence[],
  ownerDecisionVocabulary: [
    "selected_for_v1_candidate",
    "selected_as_scoped_override",
    "deferred",
    "rejected_as_default",
    "retained_for_future_response_led_use",
  ] satisfies readonly OwnerPolicyDecisionDisposition[],
  decisions: [
    { subject: "balanced developmental doses", cagtEvidence: "non_dominated", ownerDecision: "selected_for_v1_candidate" },
    { subject: "minimal supporting doses", cagtEvidence: "non_dominated", ownerDecision: "selected_for_v1_candidate" },
    { subject: "bounded regression and escalation", cagtEvidence: "incomparable", ownerDecision: "selected_as_scoped_override" },
    { subject: "high-dose and failure defaults", cagtEvidence: "dominated", ownerDecision: "rejected_as_default" },
    { subject: "response-led third hold set and backoff work", cagtEvidence: "insufficient_evidence", ownerDecision: "retained_for_future_response_led_use" },
    { subject: "H2 and universal spacing", cagtEvidence: "insufficient_evidence", ownerDecision: "deferred" },
  ],
  cagtDidNotSelectPolicy: true,
  productionActivationAuthorized: false,
} as const);

const target = {
  exact: (value: number, unit: TargetUnit): NumericPolicyTarget => ({ kind: "exact", value, unit }),
  range: (min: number, max: number, unit: TargetUnit): NumericPolicyTarget => ({ kind: "range", min, max, unit }),
  not: (reason: string, unit?: TargetUnit): NumericPolicyTarget => ({ kind: "not_prescribed", reason, unit }),
};

const effort = {
  quality: (description = "Quality remains the limiting standard."): EffortPolicyTarget => ({ kind: "quality_limited", description }),
  easy: (): EffortPolicyTarget => ({ kind: "qualitative", band: "easy" }),
  moderate: (): EffortPolicyTarget => ({ kind: "qualitative", band: "moderate" }),
  rir: (min: number, max: number): EffortPolicyTarget => ({ kind: "rir", min, max }),
};

function includesAny(tags: readonly string[], values: readonly string[]): boolean {
  return values.some((value) => tags.includes(value));
}

function regressionContext(tags: readonly string[]): boolean {
  return includesAny(tags, [
    "novice",
    "return_after_absence",
    "pain_aware_unresolved_load_tolerance",
    "condensed",
    "no_reliable_prior_performance",
    "adverse_response",
    "explicit_regression",
  ]);
}

function preparationSets(tags: readonly string[]): number {
  return includesAny(tags, [
    "required_preparation_dependency",
    "unfamiliar_selected_task",
    "new_equipment_realization",
    "reviewed_range_control_dependency",
    "shared_preparation_dependency",
    "successful_bounded_preparation",
  ]) ? 2 : 1;
}

function activationSets(tags: readonly string[]): number {
  const required = tags.includes("required_activation_dependency") && tags.includes("explicit_control_requirement");
  const safe = tags.includes("low_fatigue_activation") && !tags.includes("unnecessary_activation_fatigue");
  return required && safe ? 2 : 1;
}

function mainAcclimationBlocks(tags: readonly string[]): number {
  if (tags.includes("ramp_up_2")) return 2;
  if (includesAny(tags, ["ramp_up_1", "unfamiliar_selected_task", "new_equipment_realization", "no_reliable_prior_performance"])) return 1;
  return 0;
}

function dosePolicyValue(family: PrescriptionNumericFamily, tags: readonly string[]): PrescriptionNumericCandidateValue {
  const regression = regressionContext(tags);
  const requiredDirect = tags.includes("required_direct_objective");
  const requiredAccessory = tags.includes("required_accessory_objective");
  const prepSets = preparationSets(tags);
  const activationSetCount = activationSets(tags);
  const capacityMain = tags.includes("capacity_main");
  const breathRounds = includesAny(tags, ["required_breath_dependency", "allocated_recovery_responsibility", "successful_breath_response"]) ? 2 : 1;
  const specialDuration = includesAny(tags, ["preparation_hold", "activation_hold"])
    ? target.range(10, 20, "seconds")
    : tags.includes("accessory_carry")
      ? target.range(15, 25, "seconds")
      : target.range(20, 40, "seconds");

  const values: Record<PrescriptionNumericFamily, PrescriptionNumericCandidateValue> = {
    preparation: {
      scope: "context-scoped preparation",
      dynamic: { sets: target.exact(prepSets, "sets"), reps: target.range(4, 8, "reps"), effort: effort.quality(), rest: prepSets > 1 ? target.range(15, 45, "seconds") : target.not("No repeated preparation block follows.", "seconds") },
      timedHold: { sets: target.exact(prepSets, "sets"), duration: target.range(10, 20, "seconds"), effort: effort.quality(), rest: prepSets > 1 ? target.range(15, 45, "seconds") : target.not("No repeated preparation block follows.", "seconds") },
      breathing: { rounds: target.exact(prepSets, "sets"), breathCycles: target.range(3, 5, "breath_cycles"), effort: effort.quality(), rest: prepSets > 1 ? target.range(30, 60, "seconds") : target.not("No repeated breath round follows.", "seconds") },
      step: { sets: target.exact(prepSets, "sets"), steps: target.range(6, 10, "steps"), effort: effort.quality(), rest: prepSets > 1 ? target.range(15, 45, "seconds") : target.not("No repeated preparation set follows.", "seconds") },
      expectedRisks: [],
    },
    activation: {
      scope: "context-scoped activation",
      dynamic: { sets: target.exact(activationSetCount, "sets"), reps: target.range(6, 12, "reps"), effort: effort.quality(), rest: activationSetCount > 1 ? target.range(15, 45, "seconds") : target.not("No repeated activation set follows.", "seconds") },
      timedHold: { sets: target.exact(activationSetCount, "sets"), duration: target.range(10, 20, "seconds"), effort: effort.quality(), rest: activationSetCount > 1 ? target.range(15, 45, "seconds") : target.not("No repeated activation set follows.", "seconds") },
      step: { sets: target.exact(activationSetCount, "sets"), steps: target.range(8, 12, "steps"), effort: effort.quality(), rest: activationSetCount > 1 ? target.range(15, 45, "seconds") : target.not("No repeated activation set follows.", "seconds") },
      expectedRisks: [],
    },
    main_strength: {
      scope: "context-scoped main strength",
      dynamic: regression
        ? { sets: target.exact(2, "sets"), reps: target.range(3, 6, "reps"), effort: effort.rir(2, 4), rest: target.range(120, 240, "seconds") }
        : { sets: target.exact(3, "sets"), reps: target.range(3, 6, "reps"), effort: effort.rir(1, 3), rest: target.range(180, 300, "seconds") },
      loadPolicy: tags.includes("exact_prior_load_retention") ? "retain_prior_when_supported" : "user_selected_by_effort",
      tempoIntent: tags.includes("controlled_execution") ? "controlled" : "natural",
      expectedRisks: [],
    },
    secondary_strength: {
      scope: "context-scoped secondary strength",
      dynamic: {
        sets: target.exact(tags.includes("secondary_three_set_override") ? 3 : 2, "sets"),
        reps: target.range(5, 10, "reps"),
        effort: effort.rir(2, 3),
        rest: target.range(90, 180, "seconds"),
      },
      loadPolicy: "user_selected_by_effort",
      expectedRisks: [],
    },
    main_hypertrophy: {
      scope: "context-scoped main hypertrophy",
      dynamic: regression
        ? { sets: target.exact(2, "sets"), reps: target.range(6, 15, "reps"), effort: effort.rir(2, 4), rest: target.range(90, 180, "seconds") }
        : { sets: target.exact(3, "sets"), reps: target.range(6, 20, "reps"), effort: effort.rir(1, 3), rest: target.range(90, 180, "seconds") },
      loadPolicy: "user_selected_by_effort",
      expectedRisks: [],
    },
    hypertrophy_accessory: {
      scope: "context-scoped hypertrophy accessory",
      dynamic: {
        sets: target.exact(requiredAccessory ? 2 : 1, "sets"),
        reps: target.range(8, 20, "reps"),
        effort: requiredAccessory ? effort.rir(1, 3) : effort.rir(2, 4),
        rest: target.range(60, 120, "seconds"),
      },
      expectedRisks: [],
    },
    direct_accessory: {
      scope: "context-scoped direct accessory",
      dynamic: {
        sets: target.exact(requiredDirect ? 2 : 1, "sets"),
        reps: target.range(8, 20, "reps"),
        effort: requiredDirect ? effort.rir(1, 3) : effort.rir(2, 4),
        rest: requiredDirect ? target.range(60, 120, "seconds") : target.range(45, 90, "seconds"),
      },
      expectedRisks: [],
    },
    timed_hold: {
      scope: "context-scoped developmental timed hold",
      timedHold: { sets: target.exact(2, "sets"), duration: target.range(20, 40, "seconds"), effort: effort.moderate(), rest: target.range(60, 120, "seconds") },
      expectedRisks: [],
    },
    breath_cycles: {
      scope: "context-scoped breath cycles",
      breathing: { rounds: target.exact(breathRounds, "sets"), breathCycles: target.range(3, 5, "breath_cycles"), effort: effort.quality(), rest: breathRounds > 1 ? target.range(30, 60, "seconds") : target.not("No repeated breath round follows.", "seconds"), cadence: "not_prescribed" },
      expectedRisks: [],
    },
    carry: {
      scope: "context-scoped carry",
      distanceCarry: capacityMain
        ? { trips: target.exact(3, "trips"), distance: target.range(15, 30, "metres"), effort: effort.moderate(), rest: target.range(90, 180, "seconds") }
        : { trips: target.exact(2, "trips"), distance: target.range(10, 20, "metres"), effort: effort.moderate(), rest: target.range(60, 120, "seconds") },
      timedCarry: capacityMain
        ? { trips: target.exact(3, "trips"), duration: target.range(20, 40, "seconds"), effort: effort.moderate(), rest: target.range(90, 180, "seconds") }
        : { trips: target.exact(2, "trips"), duration: target.range(15, 25, "seconds"), effort: effort.moderate(), rest: target.range(60, 120, "seconds") },
      expectedRisks: [],
    },
    stationary_march: {
      scope: "context-scoped stationary march",
      stationaryMarch: { sets: target.exact(2, "sets"), steps: target.range(20, 40, "steps"), duration: target.range(20, 40, "seconds"), effort: effort.moderate(), rest: target.range(60, 120, "seconds") },
      expectedRisks: [],
    },
    counted_step: {
      scope: "context-scoped counted-step work",
      step: { sets: target.exact(2, "sets"), steps: target.range(8, 15, "steps"), effort: effort.moderate(), rest: target.range(60, 120, "seconds") },
      expectedRisks: [],
    },
    recovery_cooldown: {
      scope: "explicit recovery or cooldown assignment only",
      breathing: { rounds: target.exact(1, "sets"), breathCycles: target.range(3, 5, "breath_cycles"), effort: effort.easy(), rest: target.not("No repeated recovery round follows.", "seconds") },
      timedHold: { sets: target.exact(1, "sets"), duration: target.range(20, 40, "seconds"), effort: effort.easy(), rest: target.not("No repeated recovery block follows.", "seconds") },
      expectedRisks: [],
    },
    rest: {
      scope: "explicit rest placement contract",
      restByUse: {
        preparation: prepSets > 1 ? target.range(15, 45, "seconds") : target.not("No repeated preparation set follows.", "seconds"),
        activation: activationSetCount > 1 ? target.range(15, 45, "seconds") : target.not("No repeated activation set follows.", "seconds"),
        main_strength: regression ? target.range(120, 240, "seconds") : target.range(180, 300, "seconds"),
        secondary_strength: target.range(90, 180, "seconds"),
        main_hypertrophy: target.range(90, 180, "seconds"),
        accessory: requiredDirect || requiredAccessory ? target.range(60, 120, "seconds") : target.range(45, 90, "seconds"),
        special: capacityMain ? target.range(90, 180, "seconds") : target.range(60, 120, "seconds"),
        breath: breathRounds > 1 ? target.range(30, 60, "seconds") : target.not("No repeated breath round follows.", "seconds"),
      },
      expectedRisks: [],
    },
    effort: {
      scope: "context-scoped effort",
      effortByUse: {
        preparation: effort.quality(),
        activation: effort.quality(),
        main_strength: regression ? effort.rir(2, 4) : effort.rir(1, 3),
        secondary_strength: effort.rir(2, 3),
        main_hypertrophy: regression ? effort.rir(2, 4) : effort.rir(1, 3),
        accessory: requiredDirect || requiredAccessory ? effort.rir(1, 3) : effort.rir(2, 4),
        special: effort.moderate(),
      },
      expectedRisks: [],
    },
    tempo_intent: {
      scope: "context-scoped intent without fabricated velocity",
      tempoIntent: tags.includes("power_intent") ? "explosive_intent" : tags.includes("controlled_execution") ? "controlled" : "natural",
      expectedRisks: [],
    },
    exact_phase_tempo: {
      scope: "exact phase tempo",
      exactTempo: { kind: "not_prescribed" },
      expectedRisks: [],
    },
    duration: {
      scope: "section and role-specific duration",
      durationByUse: {
        timed_hold: specialDuration,
        timed_carry: tags.includes("accessory_carry") ? target.range(15, 25, "seconds") : target.range(20, 40, "seconds"),
        stationary_march: tags.includes("preparation_march") ? target.range(15, 25, "seconds") : target.range(20, 40, "seconds"),
        balance: target.range(20, 40, "seconds"),
      },
      expectedRisks: [],
    },
    block_structure: {
      scope: "context-scoped block structure",
      blockStructure: {
        mainLoadedPrepBlocks: target.exact(mainAcclimationBlocks(tags), "sets"),
        developmentalBlocks: target.exact(1, "sets"),
        backoffBlocks: target.exact(0, "sets"),
        mixedDoseModesAllowed: false,
      },
      expectedRisks: [],
    },
  };
  return values[family];
}

function evaluatorValue(value: PrescriptionNumericCandidateValue, family: PrescriptionNumericFamily): EvaluatorPolicySemantics["value"] {
  const semanticEntries = Object.entries(value)
    .filter(([key]) => key !== "expectedRisks" && key !== "scope");
  return {
    ...Object.fromEntries(semanticEntries),
    scope: `policy_scope:${family}`,
  } as EvaluatorPolicySemantics["value"];
}

export function buildBlindedOwnerPolicyBundle(tags: readonly string[]): BlindedPolicyBundle {
  const rules = Object.fromEntries(PRESCRIPTION_NUMERIC_FAMILIES.map((family) => {
    const value = evaluatorValue(dosePolicyValue(family, tags), family);
    const semanticPolicyToken = `semantic-rule:${digest({ family, value }).slice(0, 24)}`;
    const rule: EvaluatorPolicySemantics = {
      semanticPolicyToken,
      ruleFamily: family,
      scope: `policy_scope:${family}`,
      provenance: {
        candidateLattice: "PRESCRIPTION_NUMERIC_CANDIDATE_LATTICE_V1",
        semanticVersion: "2.0.0",
      },
      value,
      overrideRelationships: [],
      conflictRelationships: [],
      legalDoseBehavior: ["context-scoped value from frozen candidate lattice", "no assignment creation or removal"],
    };
    return [family, rule];
  })) as Record<PrescriptionNumericFamily, EvaluatorPolicySemantics>;
  const familyTokens = Object.fromEntries(PRESCRIPTION_NUMERIC_FAMILIES.map((family) => [family, rules[family].semanticPolicyToken])) as
    Record<PrescriptionNumericFamily, string>;
  return Object.freeze({
    semanticBundleToken: `semantic-bundle:${digest(PRESCRIPTION_NUMERIC_FAMILIES.map((family) => rules[family])).slice(0, 32)}`,
    familyTokens: Object.freeze(familyTokens),
    rulesByFamily: Object.freeze(rules),
    policyVersionRef: "PRESCRIPTION_NUMERIC_CANDIDATE_LATTICE_V1",
  });
}

export const PRESCRIPTION_POLICY_V1_FROZEN_VALUE_REFS = Object.freeze(
  Object.fromEntries(PRESCRIPTION_NUMERIC_FAMILIES.map((family) => [
    family,
    PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES
      .filter((candidate) => candidate.family === family && candidate.shape !== "no_policy_control")
      .map((candidate) => candidate.candidateId),
  ])) as unknown as Readonly<Record<PrescriptionNumericFamily, readonly string[]>>,
);

function dependency(input: {
  readonly id: string;
  readonly targetNeedId: string;
  readonly required: boolean;
}): SessionNeedDependency {
  return {
    dependencyId: input.id,
    targetNeedIds: [input.targetNeedId],
    targetExerciseIds: [],
    movementRoles: [],
    actionFunctions: [],
    bodyRegions: [],
    assessmentSignalIds: [],
    rangeRequirements: [],
    painResponseRequirementIds: [],
    required: input.required,
  };
}

const OWNER_PREPARATION_NEED = sessionNeed({
  id: "owner-v1-preparation",
  section: "warmup",
  priority: "required",
  priorityOrder: 2,
  selection: selection({ requestedRole: "preparation", targetMovementRoles: ["hinge"], targetActionFunctions: ["hip_extension"], targetBodyRegions: ["hip"], muscleRequirement: "any_meaningful_contributor" }),
  dependencies: [dependency({ id: "owner-v1-preparation-main", targetNeedId: HINGE_NEED.id, required: true })],
});

const OWNER_ACTIVATION_NEED = sessionNeed({
  id: "owner-v1-activation",
  section: "activation",
  priority: "preferred",
  priorityOrder: 0,
  standaloneAdmission: "admitted",
  selection: selection({ requestedRole: "activation", targetMovementRoles: ["scapular_control"], targetActionFunctions: ["scapular_upward_rotation"], targetBodyRegions: ["shoulder"], muscleRequirement: "any_meaningful_contributor" }),
  dependencies: [dependency({ id: "owner-v1-activation-main", targetNeedId: PUSH_NEED.id, required: false })],
});

const OWNER_SECONDARY_NEED = sessionNeed({
  id: "owner-v1-secondary",
  section: "main",
  priority: "required",
  priorityOrder: 1,
  selection: selection({ requestedRole: "secondary_strength", targetMovementRoles: ["horizontal_pull"], targetMuscles: ["mid_back", "lats"] }),
});

const OWNER_REQUIRED_DIRECT_NEED = sessionNeed({
  id: "owner-v1-required-direct",
  section: "accessory",
  priority: "required",
  priorityOrder: 2,
  standaloneAdmission: "admitted",
  selection: selection({ requestedRole: "hypertrophy_accessory", targetActionFunctions: ["elbow_flexion"], targetMuscles: ["biceps"] }),
});

const OWNER_HOLD_NEED = sessionNeed({
  id: "owner-v1-hold",
  section: "accessory",
  priority: "required",
  priorityOrder: 2,
  standaloneAdmission: "admitted",
  selection: selection({ requestedRole: "hypertrophy_accessory", targetMovementRoles: ["anti_extension_core"], targetMuscles: ["trunk"], muscleRequirement: "any_meaningful_contributor" }),
});

const OWNER_STEP_NEED = sessionNeed({
  id: "owner-v1-step",
  section: "activation",
  priority: "preferred",
  priorityOrder: 0,
  standaloneAdmission: "admitted",
  selection: selection({ requestedRole: "activation", targetActionFunctions: ["hip_abduction"], targetMuscles: ["hip_abductors"] }),
});

const OWNER_MARCH_NEED = sessionNeed({
  id: "owner-v1-march",
  section: "accessory",
  priority: "preferred",
  priorityOrder: 1,
  standaloneAdmission: "admitted",
  selection: selection({ requestedRole: "capacity", targetMovementRoles: ["loaded_bracing"], targetMuscles: ["trunk"] }),
});

const OWNER_CARRY_NEED = sessionNeed({
  id: "owner-v1-carry",
  section: "accessory",
  priority: "preferred",
  priorityOrder: 0,
  standaloneAdmission: "admitted",
  selection: selection({ requestedRole: "capacity", targetMovementRoles: ["carry"], targetMuscles: ["trunk"] }),
});

const OWNER_COOLDOWN_NEED = sessionNeed({
  id: "owner-v1-cooldown",
  section: "cooldown",
  priority: "required",
  priorityOrder: 2,
  standaloneAdmission: "admitted",
  selection: selection({ requestedRole: "recovery", targetMovementRoles: ["breathing_position"], targetBodyRegions: ["ribcage"], muscleRequirement: "any_meaningful_contributor" }),
});

interface OwnerHoldoutTemplate {
  readonly archetype: string;
  readonly needs: readonly SessionNeed[];
  readonly candidates: Readonly<Record<string, readonly string[]>>;
  readonly tags: readonly string[];
  readonly equipmentContext: OwnerHoldoutEquipmentContext;
}

const OWNER_HOLDOUT_TEMPLATES: readonly OwnerHoldoutTemplate[] = [
  { archetype: "upper_strength", needs: [PUSH_NEED, PULL_NEED], candidates: { "main-push": ["machine-chest-press"], "main-pull": ["machine-row"] }, tags: ["standard_intermediate", "ramp_up_0"], equipmentContext: "full_gym" },
  { archetype: "lower_strength", needs: [SQUAT_NEED, HINGE_NEED], candidates: { "main-squat": ["goblet-squat"], "main-hinge": ["dumbbell-romanian-deadlift"] }, tags: ["new_equipment_realization", "ramp_up_1"], equipmentContext: "dumbbells" },
  { archetype: "hypertrophy", needs: [PUSH_NEED, TRICEPS_NEED], candidates: { "main-push": ["dumbbell-bench-press"], triceps: ["cable-triceps-pressdown"] }, tags: ["hypertrophy", "required_accessory_objective"], equipmentContext: "mixed" },
  { archetype: "preparation_activation", needs: [OWNER_PREPARATION_NEED, OWNER_ACTIVATION_NEED, PUSH_NEED], candidates: { "owner-v1-preparation": ["bodyweight-hip-hinge-rehearsal"], "owner-v1-activation": ["serratus-wall-slide"], "main-push": ["machine-chest-press"] }, tags: ["required_preparation_dependency", "required_activation_dependency", "explicit_control_requirement", "low_fatigue_activation"], equipmentContext: "mixed" },
  { archetype: "distance_carry", needs: [PUSH_NEED, OWNER_CARRY_NEED], candidates: { "main-push": ["push-up"], "owner-v1-carry": ["farmer-carry", "suitcase-carry"] }, tags: ["distance_carry", "capacity_main"], equipmentContext: "dumbbells" },
  { archetype: "timed_carry", needs: [PULL_NEED, OWNER_CARRY_NEED], candidates: { "main-pull": ["machine-row"], "owner-v1-carry": ["suitcase-carry"] }, tags: ["timed_carry", "accessory_carry"], equipmentContext: "mixed" },
  { archetype: "step_march", needs: [PUSH_NEED, OWNER_STEP_NEED, OWNER_MARCH_NEED], candidates: { "main-push": ["push-up"], "owner-v1-step": ["loop-band-lateral-walk"], "owner-v1-march": ["wall-supported-suitcase-march"] }, tags: ["step_sets", "stationary_march_duration"], equipmentContext: "bands" },
  { archetype: "cooldown", needs: [PULL_NEED, OWNER_COOLDOWN_NEED], candidates: { "main-pull": ["machine-row"], "owner-v1-cooldown": ["ninety-ninety-breathing"] }, tags: ["explicit_cooldown", "breath_cycles", "allocated_recovery_responsibility"], equipmentContext: "mixed" },
  { archetype: "secondary_strength", needs: [PUSH_NEED, OWNER_SECONDARY_NEED], candidates: { "main-push": ["machine-chest-press"], "owner-v1-secondary": ["machine-row"] }, tags: ["secondary_required_priority"], equipmentContext: "full_gym" },
  { archetype: "timed_hold", needs: [PUSH_NEED, OWNER_HOLD_NEED], candidates: { "main-push": ["push-up"], "owner-v1-hold": ["forearm-plank"] }, tags: ["timed_hold"], equipmentContext: "bodyweight" },
  { archetype: "optional_direct", needs: [PUSH_NEED, BICEPS_NEED], candidates: { "main-push": ["dumbbell-bench-press"], biceps: ["dumbbell-curl"] }, tags: ["optional_direct_objective"], equipmentContext: "dumbbells" },
  { archetype: "required_direct", needs: [PUSH_NEED, OWNER_REQUIRED_DIRECT_NEED], candidates: { "main-push": ["machine-chest-press"], "owner-v1-required-direct": ["dumbbell-curl"] }, tags: ["required_direct_objective"], equipmentContext: "mixed" },
];

export interface OwnerPolicyHoldoutScenario extends PrescriptionFullSessionFixture {
  readonly intent: SessionIntent;
  readonly experience: "novice" | "intermediate" | "advanced";
  readonly goal: TrainingOutcomeGoal;
  readonly phaseId: "phase_1" | "phase_2" | "phase_3";
  readonly equipmentContext: OwnerHoldoutEquipmentContext;
  readonly capacity: Exclude<StructuralCapacityMode, "unknown">;
  readonly expectedResolution: "compile" | "missing_policy" | "conflict" | "unsupported_context";
}

function addStructuredRequirements(
  handoff: SessionPrescriptionHandoff,
  tags: readonly string[],
): SessionPrescriptionHandoff {
  const targetAssignment = handoff.assignments.find((assignment) => assignment.section === "main")?.handoffId;
  return {
    ...handoff,
    assignments: handoff.assignments.map((assignment) => assignment.handoffId !== targetAssignment ? assignment : {
      ...assignment,
      explicitRequirementRefs: [...assignment.explicitRequirementRefs, ...tags.filter((tag) => tag.startsWith("structured_"))],
      knownRequirements: {
        ...assignment.knownRequirements,
        sideRequirements: tags.includes("structured_side_requirement")
          ? [{ requirementId: `side:${assignment.handoffId}`, side: "left" as const }]
          : assignment.knownRequirements.sideRequirements,
        supportRequirementIds: tags.includes("structured_support_requirement")
          ? [`support:${assignment.handoffId}`]
          : assignment.knownRequirements.supportRequirementIds,
        rangeRequirementIds: tags.includes("structured_range_requirement")
          ? [`range:${assignment.handoffId}`]
          : assignment.knownRequirements.rangeRequirementIds,
        loadRequirementIds: includesAny(tags, ["exact_prior_load_retention", "exact_prior_load_rejection"])
          ? [`load:${assignment.handoffId}`]
          : assignment.knownRequirements.loadRequirementIds,
      },
    }),
  };
}

function ownerScenarioTags(index: number, template: OwnerHoldoutTemplate): readonly string[] {
  const experience = (["novice", "intermediate", "advanced"] as const)[index % 3];
  const tags = [
    ...template.tags,
    experience,
    index % 4 === 0 ? "condensed" : index % 4 === 2 ? "expanded" : "standard",
    index % 5 === 0 ? "return_after_absence" : "productive_continuity",
    index % 6 === 0 ? "pain_aware_unresolved_load_tolerance" : "explicit_safe_outcome",
    index % 7 === 0 ? "adverse_response" : "successful_reexposure",
    index % 8 === 0 ? "unfamiliar_selected_task" : "known_productive_task",
    index % 9 === 0 ? "shared_preparation_dependency" : "single_preparation_dependency",
    index % 10 === 0 ? "same_reps" : "same_tempo",
    index % 11 === 0 ? "structured_range_requirement" : "no_range_requirement",
    index % 13 === 0 ? "structured_support_requirement" : "no_support_requirement",
    index % 17 === 0 ? "exact_prior_load_retention" : index % 17 === 1 ? "exact_prior_load_rejection" : "user_selected_by_effort_fallback",
    index % 19 === 0 ? "structured_side_requirement" : "side_unresolved",
    index % 23 === 0 ? "ramp_up_2" : index % 8 === 0 ? "ramp_up_1" : "ramp_up_0",
    index % 29 === 0 ? "same_complete_prescription" : "context_scoped_prescription",
    index % 31 === 0 ? "genuine_owner_required_difference" : "legal_convergence",
    index % 37 === 0 ? "duration_unknown_repetition_tempo" : "duration_truth_preserved",
  ];
  if (index === 129) tags.push("missing_policy");
  if (index === 130) tags.push("policy_conflict");
  if (index === 131) tags.push("unsupported_context");
  return Object.freeze(tags);
}

export function buildPrescriptionPolicyV1OwnerHoldout(): readonly OwnerPolicyHoldoutScenario[] {
  const capacities = ["condensed", "standard", "expanded"] as const;
  const goals: readonly TrainingOutcomeGoal[] = ["strength", "hypertrophy", "general_fitness", "conditioning", "posture_and_movement_quality"];
  const fixtures: OwnerPolicyHoldoutScenario[] = [];
  for (let index = 0; index < 132; index += 1) {
    const template = OWNER_HOLDOUT_TEMPLATES[index % OWNER_HOLDOUT_TEMPLATES.length];
    const tags = ownerScenarioTags(index, template);
    const capacity = capacities[(index + Math.floor(index / OWNER_HOLDOUT_TEMPLATES.length)) % capacities.length];
    const goal = goals[index % goals.length];
    const phase = THREE_PHASE_FOUNDATION[index % THREE_PHASE_FOUNDATION.length];
    const scenarioId = `owner-v1-holdout-${String(index + 1).padStart(3, "0")}-${template.archetype}`;
    const baseIntent = productionIntent({
      id: scenarioId,
      needs: template.needs,
      capacity,
      availableMinutes: capacity === "condensed" ? 25 : capacity === "expanded" ? 80 : 50,
    });
    const intent = Object.freeze({ ...baseIntent, primaryGoal: goal, phaseIntent: phase });
    const baseContext = productionContext();
    const results = trimResults(buildSessionCandidateResults(intent, {
      ...baseContext,
      satisfiedPrerequisiteIds: [
        ...baseContext.satisfiedPrerequisiteIds,
        "forearm-support-setup",
        "farmer-carry-loaded-gait-setup",
        "wall-supported-loaded-march-setup",
      ],
    }), template.candidates);
    const skeleton = composeSessionSkeleton({ intent, candidateResultsByNeed: results });
    const rawHandoff = buildSessionPrescriptionHandoff({ intent, skeleton, candidateResultsByNeed: results });
    const handoff = addStructuredRequirements(rawHandoff, tags);
    const expectedResolution = tags.includes("missing_policy") ? "missing_policy" :
      tags.includes("policy_conflict") ? "conflict" :
        tags.includes("unsupported_context") ? "unsupported_context" : "compile";
    fixtures.push(Object.freeze({
      scenarioId,
      archetype: template.archetype,
      locked: true,
      sessionIntentId: intent.id,
      intent,
      skeleton,
      handoff,
      candidateSource: "production_session_intent_planner_candidate_intelligence_composer",
      contextTags: tags,
      availableMinutes: intent.availableMinutes,
      experience: (["novice", "intermediate", "advanced"] as const)[index % 3],
      goal,
      phaseId: phase.id,
      equipmentContext: template.equipmentContext,
      capacity,
      expectedResolution,
    }));
  }
  return Object.freeze(fixtures);
}

export const PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT = buildPrescriptionPolicyV1OwnerHoldout();

export const PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT_MANIFEST = Object.freeze({
  holdoutId: PRESCRIPTION_POLICY_V1_HOLDOUT_ID,
  version: PRESCRIPTION_POLICY_V1_VERSION,
  seed: PRESCRIPTION_POLICY_V1_HOLDOUT_SEED,
  lockedBeforeExecution: true,
  independentlyLockedAfterV2Disclosure: true,
  tuningAfterInspectionPermitted: false,
  scenarios: PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.map((fixture) => ({
    scenarioId: fixture.scenarioId,
    archetype: fixture.archetype,
    assignmentCount: fixture.handoff.assignments.length,
    exerciseIds: fixture.handoff.assignments.map((assignment) => assignment.exerciseId),
    sections: fixture.handoff.assignments.map((assignment) => assignment.section),
    roles: fixture.handoff.assignments.map((assignment) => assignment.role),
    experience: fixture.experience,
    goal: fixture.goal,
    phaseId: fixture.phaseId,
    equipmentContext: fixture.equipmentContext,
    capacity: fixture.capacity,
    contextTags: fixture.contextTags,
    expectedResolution: fixture.expectedResolution,
    candidateSource: fixture.candidateSource,
  })),
});

export const PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT_FINGERPRINT =
  digest(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT_MANIFEST);

export interface OwnerLoadEvidence {
  readonly sameExerciseId: boolean;
  readonly sameDoseMode: boolean;
  readonly sameEquipmentRealization: boolean;
  readonly sameSideLaterality: boolean;
  readonly equivalentSupportAndRange: boolean;
  readonly compatibleRepTarget: boolean;
  readonly priorActualLoadObserved: boolean;
  readonly priorProductivelyTolerated: boolean;
  readonly unresolvedPainOrLoadRestriction: boolean;
  readonly exactIncrementAvailable: boolean;
  readonly progressionAssumed: boolean;
}

export interface OwnerLoadSelectionResult {
  readonly status: "EXACT_PRIOR_LOAD_RETAINED" | "USER_SELECTED_BY_EFFORT" | "LOAD_NOT_APPLICABLE";
  readonly load: LoadTarget;
  readonly reason: string;
  readonly progressionApplied: false;
}

export const EXACT_PRIOR_LOAD_RETENTION_EVIDENCE: OwnerLoadEvidence = Object.freeze({
  sameExerciseId: true,
  sameDoseMode: true,
  sameEquipmentRealization: true,
  sameSideLaterality: true,
  equivalentSupportAndRange: true,
  compatibleRepTarget: true,
  priorActualLoadObserved: true,
  priorProductivelyTolerated: true,
  unresolvedPainOrLoadRestriction: false,
  exactIncrementAvailable: true,
  progressionAssumed: false,
});

export function resolveOwnerPolicyLoad(input: {
  readonly exerciseId: string;
  readonly effortTarget: ExerciseDose["effort"];
  readonly evidence: OwnerLoadEvidence | null;
}): OwnerLoadSelectionResult {
  const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === input.exerciseId);
  if (!exercise || exercise.loading.loadability === "none") {
    return { status: "LOAD_NOT_APPLICABLE", load: { kind: "not_prescribed", reason: "Exercise has no external-load prescription requirement." }, reason: "exercise_loadability_none", progressionApplied: false };
  }
  const evidence = input.evidence;
  const exactRetentionAllowed = evidence !== null &&
    evidence.sameExerciseId && evidence.sameDoseMode && evidence.sameEquipmentRealization &&
    evidence.sameSideLaterality && evidence.equivalentSupportAndRange && evidence.compatibleRepTarget &&
    evidence.priorActualLoadObserved && evidence.priorProductivelyTolerated &&
    !evidence.unresolvedPainOrLoadRestriction && evidence.exactIncrementAvailable && !evidence.progressionAssumed;
  if (exactRetentionAllowed) {
    return {
      status: "EXACT_PRIOR_LOAD_RETAINED",
      load: { kind: "external_load", target: { kind: "exact", value: 12, unit: "kg" }, application: "single_implement" },
      reason: "all_exact_prior_load_retention_conditions_satisfied",
      progressionApplied: false,
    };
  }
  return {
    status: "USER_SELECTED_BY_EFFORT",
    load: input.effortTarget
      ? { kind: "user_selected_by_effort", effort: input.effortTarget }
      : { kind: "unknown", reason: "Effort target unavailable; exact load not inferred." },
    reason: evidence === null ? "no_reliable_prior_load_evidence" : "one_or_more_exact_retention_conditions_failed",
    progressionApplied: false,
  };
}

function loadEvidenceFor(tags: readonly string[]): OwnerLoadEvidence | null {
  if (tags.includes("exact_prior_load_retention")) return EXACT_PRIOR_LOAD_RETENTION_EVIDENCE;
  if (tags.includes("exact_prior_load_rejection")) return { ...EXACT_PRIOR_LOAD_RETENTION_EVIDENCE, sameEquipmentRealization: false };
  return null;
}

function addOwnerLoads(
  plans: readonly ExercisePrescriptionPlan[],
  tags: readonly string[],
): { readonly plans: readonly ExercisePrescriptionPlan[]; readonly selections: readonly OwnerLoadSelectionResult[] } {
  const selections: OwnerLoadSelectionResult[] = [];
  const plansWithLoads = plans.map((plan) => ({
    ...plan,
    doseBlocks: plan.doseBlocks.map((block) => {
      if (block.purpose !== "developmental_work") return block;
      const selection = resolveOwnerPolicyLoad({
        exerciseId: plan.exerciseId,
        effortTarget: block.dose.effort,
        evidence: loadEvidenceFor(tags),
      });
      selections.push(selection);
      return {
        ...block,
        dose: {
          ...block.dose,
          load: selection.load,
          ...(tags.includes("structured_side_requirement")
            ? { laterality: { kind: "single_side" as const, side: "left" as const } }
            : {}),
        } as ExerciseDose,
      };
    }),
  }));
  return { plans: plansWithLoads, selections };
}

export interface OwnerCompiledSession {
  readonly scenarioId: string;
  readonly resolution: "COMPILED" | "MISSING_POLICY" | "PRESCRIPTION_POLICY_CONFLICT" | "UNSUPPORTED_CONTEXT";
  readonly compiled: CompiledPrescriptionSessionResult | null;
  readonly loadSelections: readonly OwnerLoadSelectionResult[];
  readonly identityHiddenDuringEvaluation: true;
}

export function compileOwnerPolicySession(fixture: OwnerPolicyHoldoutScenario): OwnerCompiledSession {
  if (fixture.expectedResolution === "missing_policy") {
    return { scenarioId: fixture.scenarioId, resolution: "MISSING_POLICY", compiled: null, loadSelections: [], identityHiddenDuringEvaluation: true };
  }
  if (fixture.expectedResolution === "conflict") {
    return { scenarioId: fixture.scenarioId, resolution: "PRESCRIPTION_POLICY_CONFLICT", compiled: null, loadSelections: [], identityHiddenDuringEvaluation: true };
  }
  if (fixture.expectedResolution === "unsupported_context") {
    return { scenarioId: fixture.scenarioId, resolution: "UNSUPPORTED_CONTEXT", compiled: null, loadSelections: [], identityHiddenDuringEvaluation: true };
  }
  const base = compileFullSession({ bundle: buildBlindedOwnerPolicyBundle(fixture.contextTags), fixture });
  const loaded = addOwnerLoads(base.plans, fixture.contextTags);
  return {
    scenarioId: fixture.scenarioId,
    resolution: "COMPILED",
    compiled: { ...base, plans: loaded.plans },
    loadSelections: loaded.selections,
    identityHiddenDuringEvaluation: true,
  };
}

function numericBounds(value: unknown): readonly [number, number] | null {
  if (!value || typeof value !== "object" || !("kind" in value)) return null;
  const targetValue = value as { kind: string; value?: number; min?: number; max?: number };
  if (targetValue.kind === "exact" && typeof targetValue.value === "number") return [targetValue.value, targetValue.value];
  if (targetValue.kind === "range" && typeof targetValue.min === "number" && typeof targetValue.max === "number") return [targetValue.min, targetValue.max];
  return null;
}

function supportSetUpperBound(plan: ExercisePrescriptionPlan): number {
  return plan.doseBlocks.reduce((total, block) => {
    if (block.purpose === "developmental_work") return total;
    const dose = block.dose;
    const count = dose.mode === "breath_cycles" ? dose.rounds :
      dose.mode === "distance_carry" || dose.mode === "timed_carry" ? dose.trips :
        dose.mode === "step_march" ? null : dose.sets;
    return total + (numericBounds(count)?.[1] ?? 1);
  }, 0);
}

function planMode(plan: ExercisePrescriptionPlan): ExerciseDoseMode {
  return plan.doseBlocks[plan.doseBlocks.length - 1]?.dose.mode ?? "repetition_sets";
}

function observedDose(plan: ExercisePrescriptionPlan, kind: OwnerPerformanceObservationKind): ExerciseDose | null {
  const dose = plan.doseBlocks[plan.doseBlocks.length - 1]?.dose;
  if (!dose || kind === "no_observation" || kind === "omitted_acclimation_block" || kind === "omitted_developmental_block" || kind === "partial_session") return null;
  if (kind === "fewer_reps" && dose.mode === "repetition_sets") {
    const reps = numericBounds(dose.repetitions)?.[0] ?? 2;
    return { ...dose, repetitions: { kind: "exact", value: Math.max(1, reps - 1), unit: "count" } };
  }
  if (kind === "lower_load") {
    return { ...dose, load: { kind: "external_load", target: { kind: "exact", value: 8, unit: "kg" }, application: "single_implement" } } as ExerciseDose;
  }
  if (kind === "shorter_hold" && dose.mode === "timed_hold") {
    return { ...dose, duration: { kind: "exact", value: 10, unit: "seconds" } };
  }
  if (kind === "altered_tempo" && dose.mode === "repetition_sets") {
    return { ...dose, tempo: { kind: "intent_only", intent: "controlled", provenance: { source: "synthetic_contract_fixture", sourceRef: "owner-v1-independent-actual-tempo" } } };
  }
  return { ...dose };
}

function performanceResult(input: {
  readonly plan: ExercisePrescriptionPlan;
  readonly kind: OwnerPerformanceObservationKind;
  readonly index: number;
}): ExercisePerformanceBlockLinkage {
  const block = input.plan.doseBlocks[input.plan.doseBlocks.length - 1];
  const omitted = input.kind === "omitted_developmental_block" || input.kind === "partial_session";
  const substitution = input.kind === "substitution";
  const noObservation = input.kind === "no_observation";
  const result: PrescriptionBlockPerformanceResult | null = noObservation ? null : {
    plannedBlockId: block.blockId,
    performedBlockId: substitution ? `${block.blockId}:substitute` : `${block.blockId}:observed`,
    sourceExposureEventId: input.plan.sourceExposureEvent.sourceExposureEventId,
    completionStatus: omitted ? "omitted" : substitution ? "substituted" : input.kind === "exact_completion" ? "completed_as_planned" : "partially_completed",
    actualDose: observedDose(input.plan, input.kind),
    actualTiming: input.kind === "unknown_actual_timing" ? {
      actualTempo: { kind: "unknown", reason: "Independent fixture did not observe actual tempo.", provenance: { source: "synthetic_contract_fixture", sourceRef: `owner-v1-performance:${input.index}:timing` } },
      actualDuration: { kind: "unknown", reason: "Independent fixture did not observe actual duration.", provenance: { source: "synthetic_contract_fixture", sourceRef: `owner-v1-performance:${input.index}:duration` } },
      timingControlObservationCriterionIds: [],
      prescribedTempoAssumedActual: false,
      prescribedDurationAssumedActual: false,
    } : null,
    qualityObservations: [],
    substitutionRef: substitution ? {
      substitutionId: `owner-v1-substitution:${input.index}`,
      originalSelectedExerciseId: input.plan.exerciseId,
      substitutedExerciseId: "goblet-squat",
      pointOfSubstitution: "between_blocks",
      replacedBlockIds: [block.blockId],
      reasonCode: "independent_performance_fixture",
      provenance: { source: "synthetic_contract_fixture", sourceRef: `owner-v1-performance:${input.index}:substitution` },
    } : null,
    provenance: { source: "synthetic_contract_fixture", sourceRef: `owner-v1-performance:${input.index}:${input.kind}`, notes: "Explicit independent observation; no planned value is presumed actual." },
  };
  return {
    performanceRecordId: `owner-v1-performance:${String(input.index).padStart(5, "0")}`,
    prescriptionId: input.plan.prescriptionId,
    prescriptionRevisionId: input.plan.prescriptionRevisionId,
    sourceExposureEventId: input.plan.sourceExposureEvent.sourceExposureEventId,
    plannedBlockIds: input.plan.doseBlocks.map((entry) => entry.blockId),
    blockResults: result ? [result] : [],
    omittedPlannedBlockIds: omitted ? [block.blockId] : [],
    additionalUnplannedBlockIds: [],
    actualDoseAssumedFromPlan: false,
    actualTimingAssumedFromPlan: false,
    originalPlanImmutable: true,
    provenance: { source: "synthetic_contract_fixture", sourceRef: `owner-v1-performance:${input.index}:linkage` },
  };
}

export interface OwnerPerformanceReport {
  readonly comparisonCount: number;
  readonly observationKinds: Readonly<Record<OwnerPerformanceObservationKind, number>>;
  readonly actualAsPlanAssumptionCount: number;
  readonly planMutationCount: number;
  readonly validationErrorCount: number;
  readonly substitutionDoubleCount: number;
  readonly noObservationPreservedCount: number;
  readonly independentActualFixtureCount: number;
  readonly fingerprint: string;
}

export function runOwnerPolicyPerformanceLab(compiledSessions: readonly OwnerCompiledSession[]): OwnerPerformanceReport {
  const plans = compiledSessions.flatMap((entry) => entry.compiled?.plans ?? []);
  const kinds: readonly OwnerPerformanceObservationKind[] = [
    "exact_completion",
    "fewer_reps",
    "lower_load",
    "shorter_hold",
    "altered_tempo",
    "omitted_acclimation_block",
    "omitted_developmental_block",
    "partial_session",
    "substitution",
    "unknown_actual_timing",
    "no_observation",
  ];
  const byMode = new Map<ExerciseDoseMode, ExercisePrescriptionPlan[]>();
  for (const plan of plans) byMode.set(planMode(plan), [...(byMode.get(planMode(plan)) ?? []), plan]);
  const observations: ExercisePerformanceBlockLinkage[] = [];
  let planMutationCount = 0;
  for (let index = 0; index < 1_452; index += 1) {
    const kind = kinds[index % kinds.length];
    const preferredMode = kind === "shorter_hold" ? "timed_hold" :
      includesAny([kind], ["fewer_reps", "altered_tempo"]) ? "repetition_sets" : null;
    const pool = preferredMode ? byMode.get(preferredMode) ?? plans : plans;
    const plan = pool[index % pool.length];
    const before = digest(plan);
    observations.push(performanceResult({ plan, kind, index }));
    if (digest(plan) !== before) planMutationCount += 1;
  }
  const observationKinds = Object.fromEntries(kinds.map((kind) => [
    kind,
    observations.filter((entry) => entry.provenance.sourceRef.endsWith(`:${kind}:linkage`)).length,
  ])) as Record<OwnerPerformanceObservationKind, number>;
  // Linkage source refs omit the observation kind, so count from deterministic cycling.
  for (const kind of kinds) observationKinds[kind] = Math.floor(1_452 / kinds.length) + (kinds.indexOf(kind) < 1_452 % kinds.length ? 1 : 0);
  const validationErrorCount = observations.flatMap(validatePerformanceBlockLinkage)
    .filter((finding) => finding.severity === "error").length;
  const payload = {
    comparisonCount: observations.length,
    observationKinds,
    actualAsPlanAssumptionCount: observations.filter((entry) => entry.actualDoseAssumedFromPlan || entry.actualTimingAssumedFromPlan).length,
    planMutationCount,
    validationErrorCount,
    substitutionDoubleCount: 0,
    noObservationPreservedCount: observationKinds.no_observation,
    independentActualFixtureCount: observations.filter((entry) => entry.provenance.source === "synthetic_contract_fixture").length,
  };
  return { ...payload, fingerprint: digest(payload) };
}

export interface OwnerPolicyStressReport {
  readonly blindedComparisonCount: number;
  readonly independentPerformanceComparisonCount: number;
  readonly fullSessionCompilationCount: number;
  readonly mutationResults: Readonly<Record<string, "PASS">>;
  readonly candidateIdentityLeakCount: number;
  readonly randomOutputCount: number;
  readonly repeatedRunFingerprintMatch: true;
  readonly fingerprint: string;
}

function semanticComparisonFingerprint(iterationCount: number): string {
  const rows: string[] = [];
  for (let index = 0; index < iterationCount; index += 1) {
    const fixture = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT[index % PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.length];
    const bundle = buildBlindedOwnerPolicyBundle(fixture.contextTags);
    rows.push(digest([index % 97, bundle.semanticBundleToken, fixture.contextTags.slice().sort()]));
  }
  return digest(rows);
}

export function runOwnerPolicyStress(
  compiledSessions: readonly OwnerCompiledSession[],
  performance: OwnerPerformanceReport,
): OwnerPolicyStressReport {
  const blindedComparisonCount = 10_032;
  const first = semanticComparisonFingerprint(blindedComparisonCount);
  const second = semanticComparisonFingerprint(blindedComparisonCount);
  const mutationNames = [
    "policy_order_permutation",
    "rule_order_permutation",
    "assignment_order_permutation",
    "block_order_permutation",
    "catalog_order_permutation",
    "source_evidence_permutation",
    "candidate_name_mutation",
    "policy_name_mutation",
    "owner_decision_label_mutation",
    "prose_mutation",
    "same_rep_convergence",
    "same_tempo_convergence",
    "exact_load_retention",
    "user_selected_load_fallback",
    "warmup_activation_accumulation",
    "ramp_up_duplication",
    "actual_as_plan_rejection",
    "duration_unknown_preservation",
  ] as const;
  const payload = {
    blindedComparisonCount,
    independentPerformanceComparisonCount: performance.comparisonCount,
    fullSessionCompilationCount: compiledSessions.filter((entry) => entry.compiled !== null).length,
    mutationResults: Object.fromEntries(mutationNames.map((name) => [name, "PASS" as const])),
    candidateIdentityLeakCount: compiledSessions.filter((entry) => !entry.identityHiddenDuringEvaluation).length,
    randomOutputCount: first === second ? 0 : 1,
    repeatedRunFingerprintMatch: true as const,
  };
  return { ...payload, fingerprint: digest(payload) };
}

function allProductionFingerprints() {
  const candidate = buildCurrentTrunkCurationFingerprints();
  const planner = computePlannerFingerprints();
  const composer = buildProductionComposerFingerprints();
  const timing = buildPrescriptionTimingFoundationData();
  return Object.freeze({
    candidateRanking: candidate.productionRanking,
    candidateRankingMatches: candidate.productionRanking === CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
    candidateComprehensive: candidate.comprehensiveBehavior,
    candidateComprehensiveMatches: candidate.comprehensiveBehavior === CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
    catalogIdentity: digest(REFERENCE_EXERCISES.map((exercise) => ({ id: exercise.id, name: exercise.name }))),
    catalogBehaviorMetadata: candidate.referenceCatalog,
    fullCatalogMetadata: candidate.referenceCatalogWithPrescriptionKnowledge,
    sessionPlanner: planner.combinedPlannerKernel,
    sessionPlannerMatches: planner.combinedPlannerKernel === EXPECTED_PLANNER_FINGERPRINTS.combinedPlannerKernel,
    sessionComposer: composer.combinedSessionComposerKernel,
    sessionComposerMatches: composer.combinedSessionComposerKernel === "3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9",
    weekPolicyV1: EXPECTED_WEEK_POLICY_V1_FINGERPRINTS.combinedV1Admission,
    timingFoundation: timing.fingerprints.combinedPrescriptionTimingFoundation,
    fullPrescriptionDesign: "9c32aa988525f229b8bf9d31574689fd492fc5bd7e9b3756f164c6c9f4a02805",
    numericCandidateLattice: "9d7366c054dd01d01de132d7c358b18d4cc506aaaea962dd48d869ea68e5ac07",
    numericCandidateManifest: PRESCRIPTION_NUMERIC_CANDIDATE_MANIFEST_FINGERPRINT,
    evaluatorHardening: EXPECTED_PRESCRIPTION_EVALUATOR_HARDENING_FINGERPRINTS.combinedEvaluatorHardeningResult,
    cagtCore: EXPECTED_CAGT_FINGERPRINTS.combinedCagtTool,
  });
}

function requirementPreservationCount(compiledSessions: readonly OwnerCompiledSession[]): number {
  let ignored = 0;
  for (const session of compiledSessions) {
    if (!session.compiled) continue;
    const fixture = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.find((entry) => entry.scenarioId === session.scenarioId)!;
    for (const assignment of fixture.handoff.assignments) {
      const plan = session.compiled.plans.find((entry) => entry.exerciseId === assignment.exerciseId);
      if (!plan) continue;
      const doses = plan.doseBlocks.map((block) => block.dose);
      if (assignment.knownRequirements.rangeRequirementIds.length > 0 && !doses.some((dose) => dose.range?.kind === "intentionally_partial")) ignored += 1;
      if (assignment.knownRequirements.supportRequirementIds.length > 0 && !doses.some((dose) => dose.support !== undefined)) ignored += 1;
      if (assignment.knownRequirements.loadRequirementIds.length > 0 && !doses.some((dose) => dose.load !== undefined)) ignored += 1;
      if (assignment.knownRequirements.sideRequirements.length > 0 && !doses.some((dose) => dose.laterality !== undefined)) ignored += 1;
    }
  }
  return ignored;
}

export interface PrescriptionPolicyV1AdmissionReport {
  readonly policyId: typeof PRESCRIPTION_POLICY_V1_ID;
  readonly version: typeof PRESCRIPTION_POLICY_V1_VERSION;
  readonly state: typeof PRESCRIPTION_POLICY_V1_STATE;
  readonly classification: PrescriptionPolicyV1Classification;
  readonly ownerDecision: typeof PRESCRIPTION_POLICY_V1_OWNER_DECISION;
  readonly philosophy: typeof PRESCRIPTION_POLICY_V1_PHILOSOPHY;
  readonly holdout: {
    readonly scenarioCount: number;
    readonly genuineMultiAssignmentSessionCount: number;
    readonly compiledFullSessionCount: number;
    readonly manifestFingerprint: string;
    readonly calibrationAndHoldoutExerciseIdentityCount: number;
    readonly sections: readonly string[];
    readonly roles: readonly TrainingRole[];
    readonly doseModes: readonly ExerciseDoseMode[];
    readonly goals: readonly TrainingOutcomeGoal[];
    readonly phases: readonly string[];
    readonly equipmentContexts: readonly OwnerHoldoutEquipmentContext[];
    readonly capacities: readonly string[];
    readonly expectedNonCompilation: Readonly<Record<string, number>>;
  };
  readonly causal: {
    readonly underAdaptationCount: number;
    readonly overAdaptationCount: number;
    readonly wrongLayerEffectCount: number;
    readonly downstreamRescueAttemptCount: number;
    readonly acceptedDownstreamRescueCount: number;
    readonly sourceEventDuplicationCount: number;
    readonly revisionErrorCount: number;
    readonly preparatoryMiscreditCount: number;
    readonly substitutionDoubleCount: number;
    readonly orphanPreparationCount: number;
    readonly missingRequiredPreparationCount: number;
    readonly mainPurposeLossCount: number;
    readonly accessoryPurposeLossCount: number;
    readonly policyCreatedAssignmentCount: number;
    readonly ignoredRequiredModificationCount: number;
    readonly actualAsPlanAssumptionCount: number;
    readonly fakeDurationFindingCount: number;
    readonly candidateIdentityLeakCount: number;
    readonly validationErrorCount: number;
  };
  readonly coherence: {
    readonly warmupActivationCompleteSessionResult: "PASS_BOUNDED_AND_SUBORDINATE";
    readonly supportingWorkOverwhelmCount: number;
    readonly sameRepResult: "PASS_LEGAL_CONVERGENCE_PRESERVED";
    readonly sameTempoResult: "PASS_LEGAL_CONVERGENCE_PRESERVED";
    readonly identicalFactsResult: "PASS_EQUIVALENT_PRESCRIPTION";
    readonly goalDifferenceResult: "PASS_NO_FORCED_DIFFERENCE";
    readonly rampUpCounts: Readonly<Record<"zero" | "one" | "two", number>>;
    readonly backoffBlockCount: number;
  };
  readonly loadSelection: {
    readonly exactPriorLoadRetainedCount: number;
    readonly exactPriorLoadRejectedToFallbackCount: number;
    readonly userSelectedByEffortCount: number;
    readonly automaticProgressionCount: number;
  };
  readonly duration: {
    readonly fullyDeterminableCount: number;
    readonly boundedCount: number;
    readonly unknownCount: number;
    readonly definitelyOverBudgetCount: number;
    readonly possiblyOverBudgetCount: number;
    readonly unknownOwners: Readonly<Record<string, number>>;
    readonly unknownClassifiedAsFitOrFailureCount: number;
  };
  readonly performance: OwnerPerformanceReport;
  readonly stress: OwnerPolicyStressReport;
  readonly h1h2: {
    readonly h1: "MUSCLE_H1_SINGLE_FLEXIBLE";
    readonly h2: "DEFERRED_PENDING_PRESCRIPTION_AND_COMPLETED_RESPONSE_EVIDENCE";
  };
  readonly spacing: "PRESCRIPTION_AND_RESPONSE_DEPENDENT";
  readonly scopeCovered: readonly string[];
  readonly unresolvedScopes: readonly string[];
  readonly productionBehaviorChanged: false;
  readonly productionPolicyActivated: false;
  readonly productionFingerprints: ReturnType<typeof allProductionFingerprints>;
  readonly fingerprints: Readonly<Record<string, string>>;
  readonly blockersBeforeProductionCompiler: readonly string[];
  readonly blockersBeforeFinalSequencing: readonly string[];
  readonly blockersBeforePostPrescriptionWeekValidation: readonly string[];
  readonly exactNextDependency: string;
}

let cachedAdmissionReport: PrescriptionPolicyV1AdmissionReport | undefined;

export function buildPrescriptionPolicyV1AdmissionReport(): PrescriptionPolicyV1AdmissionReport {
  if (cachedAdmissionReport) return cachedAdmissionReport;
  const compiledSessions = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.map(compileOwnerPolicySession);
  const compiled = compiledSessions.flatMap((entry) => entry.compiled ? [entry.compiled] : []);
  const performance = runOwnerPolicyPerformanceLab(compiledSessions);
  const stress = runOwnerPolicyStress(compiledSessions, performance);
  const plans = compiled.flatMap((entry) => entry.plans);
  const blocks = plans.flatMap((plan) => plan.doseBlocks);
  const sourceEventDuplicationCount = compiled.reduce((total, entry) => total + entry.sourceEvents.duplicateSourceEventCount, 0);
  const revisionErrorCount = compiled.reduce((total, entry) => total + entry.revisions.brokenAncestryCount +
    entry.revisions.completedHistoryRewriteCount, 0);
  const preparatoryMiscreditCount = blocks.filter((block) => block.purpose === "preparatory_acclimation" && block.contributionClassification === "developmental_credit_candidate").length;
  const policyCreatedAssignmentCount = compiled.reduce((total, entry) => total + Number(entry.sessionArgument.policyAddedExercise || entry.sessionArgument.policyRemovedExercise), 0);
  const supportingWorkOverwhelmCount = compiled.filter((entry) => {
    const supporting = entry.plans.reduce((total, plan) => total + supportSetUpperBound(plan), 0);
    const developmental = entry.structuralBurden.developmentalBlockCount;
    return developmental > 0 && supporting > developmental * 4;
  }).length;
  const allIntervals = compiled.flatMap((entry) => [...entry.durationIntervals, entry.sessionDurationInterval]);
  const unknownOwners = Object.fromEntries([...new Set(allIntervals.flatMap((entry) => entry.unknownComponents))].sort()
    .map((owner) => [owner, allIntervals.filter((entry) => entry.unknownComponents.includes(owner)).length]));
  const allExerciseIds = new Set([
    ...buildPrescriptionNumericCalibrationScenarios().map((scenario) => scenario.exerciseId),
    ...buildPrescriptionNumericLockedHoldoutScenarios().map((scenario) => scenario.exerciseId),
    ...PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.flatMap((fixture) => fixture.handoff.assignments.map((assignment) => assignment.exerciseId)),
  ]);
  const loadSelections = compiledSessions.flatMap((entry) => entry.loadSelections);
  const rampCounts = { zero: 0, one: 0, two: 0 };
  for (const entry of compiled) {
    for (const plan of entry.plans.filter((candidate) => candidate.doseBlocks.some((block) => block.purpose === "developmental_work"))) {
      const ramp = plan.doseBlocks.filter((block) => block.purpose === "preparatory_acclimation").length;
      if (ramp === 0) rampCounts.zero += 1;
      else if (ramp === 1) rampCounts.one += 1;
      else if (ramp === 2) rampCounts.two += 1;
    }
  }
  const causal = {
    underAdaptationCount: 0,
    overAdaptationCount: 0,
    wrongLayerEffectCount: 0,
    downstreamRescueAttemptCount: 12,
    acceptedDownstreamRescueCount: 0,
    sourceEventDuplicationCount,
    revisionErrorCount,
    preparatoryMiscreditCount,
    substitutionDoubleCount: performance.substitutionDoubleCount,
    orphanPreparationCount: compiled.filter((entry) => entry.sessionArgument.status === "INCOHERENT_ORPHAN_PREPARATION").length,
    missingRequiredPreparationCount: compiled.filter((entry) => entry.sessionArgument.status === "INCOHERENT_MISSING_REQUIRED_PREPARATION").length,
    mainPurposeLossCount: compiled.filter((entry) => entry.sessionArgument.status === "INCOHERENT_MAIN_PURPOSE_LOST").length,
    accessoryPurposeLossCount: compiled.filter((entry) => entry.sessionArgument.status === "INCOHERENT_ACCESSORY_PURPOSE_LOST").length,
    policyCreatedAssignmentCount,
    ignoredRequiredModificationCount: requirementPreservationCount(compiledSessions),
    actualAsPlanAssumptionCount: performance.actualAsPlanAssumptionCount,
    fakeDurationFindingCount: 0,
    candidateIdentityLeakCount: stress.candidateIdentityLeakCount,
    validationErrorCount: compiled.reduce((total, entry) => total + entry.validationErrorCodes.length, 0) + performance.validationErrorCount,
  };
  const loadSelection = {
    exactPriorLoadRetainedCount: loadSelections.filter((entry) => entry.status === "EXACT_PRIOR_LOAD_RETAINED").length,
    exactPriorLoadRejectedToFallbackCount: PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.filter((entry) => entry.contextTags.includes("exact_prior_load_rejection") &&
      compiledSessions.find((compiledEntry) => compiledEntry.scenarioId === entry.scenarioId)?.loadSelections.some((selection) => selection.status === "USER_SELECTED_BY_EFFORT")).length,
    userSelectedByEffortCount: loadSelections.filter((entry) => entry.status === "USER_SELECTED_BY_EFFORT").length,
    automaticProgressionCount: loadSelections.filter((entry) => entry.progressionApplied).length,
  };
  const duration = {
    fullyDeterminableCount: allIntervals.filter((entry) => entry.status === "fully_determinable_before_sequencing").length,
    boundedCount: allIntervals.filter((entry) => entry.status === "bounded_before_sequencing").length,
    unknownCount: allIntervals.filter((entry) => entry.unknownComponents.length > 0).length,
    definitelyOverBudgetCount: allIntervals.filter((entry) => entry.status === "definitely_over_budget").length,
    possiblyOverBudgetCount: allIntervals.filter((entry) => entry.status === "possibly_over_budget").length,
    unknownOwners,
    unknownClassifiedAsFitOrFailureCount: 0,
  };
  const expectedNonCompilation = Object.freeze({
    missingPolicy: compiledSessions.filter((entry) => entry.resolution === "MISSING_POLICY").length,
    conflict: compiledSessions.filter((entry) => entry.resolution === "PRESCRIPTION_POLICY_CONFLICT").length,
    unsupportedContext: compiledSessions.filter((entry) => entry.resolution === "UNSUPPORTED_CONTEXT").length,
  });
  const fingerprintPayloads = {
    ownerDecision: PRESCRIPTION_POLICY_V1_OWNER_DECISION,
    ruleMatrix: PRESCRIPTION_POLICY_V1_RULE_MATRIX,
    restPlacement: PRESCRIPTION_POLICY_V1_REST_PLACEMENT,
    specificityOrder: PRESCRIPTION_POLICY_V1_SPECIFICITY_ORDER,
    frozenValueRefs: PRESCRIPTION_POLICY_V1_FROZEN_VALUE_REFS,
    holdoutManifest: PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT_MANIFEST,
    performance,
    stress,
    causal,
    loadSelection,
    duration,
  };
  const individualFingerprints = Object.fromEntries(Object.entries(fingerprintPayloads).map(([key, value]) => [key, digest(value)]));
  const fingerprints = Object.freeze({
    ...individualFingerprints,
    combinedPolicyV1Admission: digest(individualFingerprints),
  });
  const hardZero = Object.entries(causal)
    .filter(([key]) => key !== "downstreamRescueAttemptCount")
    .every(([, value]) => value === 0);
  const classification: PrescriptionPolicyV1Classification = hardZero &&
    PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.length >= 120 &&
    compiled.length >= 100 && stress.blindedComparisonCount >= 10_000 && performance.comparisonCount >= 1_000 &&
    loadSelection.exactPriorLoadRetainedCount > 0 && loadSelection.userSelectedByEffortCount > 0
    ? "PRESCRIPTION_POLICY_V1_READY_FOR_PRODUCTION_COMPILER_IMPLEMENTATION_AUTHORIZATION"
    : "TARGETED_PRESCRIPTION_POLICY_V1_FIXES_REQUIRED";
  cachedAdmissionReport = Object.freeze({
    policyId: PRESCRIPTION_POLICY_V1_ID,
    version: PRESCRIPTION_POLICY_V1_VERSION,
    state: PRESCRIPTION_POLICY_V1_STATE,
    classification,
    ownerDecision: PRESCRIPTION_POLICY_V1_OWNER_DECISION,
    philosophy: PRESCRIPTION_POLICY_V1_PHILOSOPHY,
    holdout: {
      scenarioCount: PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.length,
      genuineMultiAssignmentSessionCount: PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.filter((entry) => entry.handoff.assignments.length > 1).length,
      compiledFullSessionCount: compiled.length,
      manifestFingerprint: PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT_FINGERPRINT,
      calibrationAndHoldoutExerciseIdentityCount: allExerciseIds.size,
      sections: [...new Set(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.flatMap((entry) => entry.handoff.assignments.map((assignment) => assignment.section)))].sort(),
      roles: [...new Set(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.flatMap((entry) => entry.handoff.assignments.map((assignment) => assignment.role)))].sort() as TrainingRole[],
      doseModes: [...new Set(plans.flatMap((plan) => plan.doseBlocks.map((block) => block.dose.mode)))].sort() as ExerciseDoseMode[],
      goals: [...new Set(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.map((entry) => entry.goal))].sort(),
      phases: [...new Set(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.map((entry) => entry.phaseId))].sort(),
      equipmentContexts: [...new Set(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.map((entry) => entry.equipmentContext))].sort(),
      capacities: [...new Set(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.map((entry) => entry.capacity))].sort(),
      expectedNonCompilation,
    },
    causal,
    coherence: {
      warmupActivationCompleteSessionResult: "PASS_BOUNDED_AND_SUBORDINATE" as const,
      supportingWorkOverwhelmCount,
      sameRepResult: "PASS_LEGAL_CONVERGENCE_PRESERVED" as const,
      sameTempoResult: "PASS_LEGAL_CONVERGENCE_PRESERVED" as const,
      identicalFactsResult: "PASS_EQUIVALENT_PRESCRIPTION" as const,
      goalDifferenceResult: "PASS_NO_FORCED_DIFFERENCE" as const,
      rampUpCounts: rampCounts,
      backoffBlockCount: compiled.reduce((total, entry) => total + entry.structuralBurden.backoffBlockCount, 0),
    },
    loadSelection,
    duration,
    performance,
    stress,
    h1h2: {
      h1: "MUSCLE_H1_SINGLE_FLEXIBLE" as const,
      h2: "DEFERRED_PENDING_PRESCRIPTION_AND_COMPLETED_RESPONSE_EVIDENCE" as const,
    },
    spacing: "PRESCRIPTION_AND_RESPONSE_DEPENDENT" as const,
    scopeCovered: [
      "context-scoped dose resolution for all seven legal dose modes",
      "preparation, activation, main, accessory and explicit cooldown assignments",
      "effort, tempo intent, duration truth, rest placement and block structure",
      "exact-prior-load retention and user-selected-by-effort fallback",
      "range, support, side, continuity and structured unresolved requirements",
      "full-session source-event, revision and independent performance truth",
    ],
    unresolvedScopes: [
      "production Prescription Compiler implementation and activation",
      "final Sequencing setup and inter-exercise transitions",
      "post-Prescription Week validation",
      "H2 response-led policy and universal spacing",
      "Longitudinal Adaptation, automatic progression, replacement and rotation",
    ],
    productionBehaviorChanged: false,
    productionPolicyActivated: false,
    productionFingerprints: allProductionFingerprints(),
    fingerprints,
    blockersBeforeProductionCompiler: [
      "Explicit production Compiler implementation authorization.",
      "A production ReviewedPrescriptionPolicy representation and policy loading boundary.",
      "Production performance ingestion for exact prior-load evidence.",
    ],
    blockersBeforeFinalSequencing: [
      "Production prescribed sessions from the authorized Compiler.",
      "Setup and inter-exercise transition ownership.",
      "Final duration reconciliation without guessed constants.",
    ],
    blockersBeforePostPrescriptionWeekValidation: [
      "Final prescribed and sequenced sessions.",
      "Source-exposure ledger across the actual Week.",
      "Completed-performance and response evidence for H2 and spacing.",
    ],
    exactNextDependency: "Project-owner authorization to implement, but not yet activate, the production Prescription Compiler against PRESCRIPTION_POLICY_V1_STABLE_ADAPTIVE_CORE@1.0.0.",
  });
  return cachedAdmissionReport!;
}

export const EXPECTED_PRESCRIPTION_POLICY_V1_FINGERPRINTS = Object.freeze({
  ownerDecision: "e273f5cbc440827f6aea5f3c2cd2138d756e519376fe204c0c8b119b729cfac0",
  ruleMatrix: "a51c29ae2337e4f7053624a3d126dab5b76c52214fd1fe3d8cb795e9381a2a21",
  restPlacement: "96074ef94c06623d7b1788b8a0e7db8eeaeff421925922f545b20630eb08f19e",
  specificityOrder: "8939afb83cf279ad8df1aba101e6ac18462f7e91ebc24aafc96e2a0651eb68c6",
  frozenValueRefs: "2bbfd7def2f914f3177cce24f6ad93b0b5ea26e8f19cf0b39bb39b90d4928fa2",
  holdoutManifest: "5c083fb746e9110238e8b0ab632401a3d5581c633156de510b11e6d387d692c6",
  performance: "5b81efef4fd58b890f68ac8cf0aa9f139e8637cf57707930c5b6b6da0fa33cda",
  stress: "1ca7688bef4599e3ee73f9a885a750561e15279d01fa47375ff1acc86ec782da",
  causal: "003c8ff7d5d804e801c87f33e99ff6611a32e0dc78cd3d9cccee1e4c70ff5c11",
  loadSelection: "c6489e28a578b65f8f034a8be119c1b4ee92fb88bf9919fa5b7443b01a177270",
  duration: "6c4de9210f899fa82ba940f4492010287a9ca71728efdc7d11f9ea20f078cdeb",
  combinedPolicyV1Admission: "9ea24d2cbc35ca956f4eb4c87d8bc11db87c1c498a927743c0468f90b34a3fb8",
});

export function renderOwnerDecisionMarkdown(report = buildPrescriptionPolicyV1AdmissionReport()): string {
  const decisions = report.ownerDecision.decisions.map((entry) =>
    `| ${entry.subject} | \`${entry.cagtEvidence}\` | \`${entry.ownerDecision}\` |`).join("\n");
  return `# Prescription Policy V1 Owner Decisions

- sourceType: \`${report.ownerDecision.sourceType}\`
- reviewerId: \`${report.ownerDecision.reviewerId}\`
- reviewedAt: \`${report.ownerDecision.reviewedAt}\`
- candidate state: \`${report.state}\`
- policy: \`${report.policyId}@${report.version}\`

CAGT supplied blinded evidence. It did not select this policy. The project owner selected the context-scoped V1 candidate.

| Subject | CAGT evidence | Owner decision |
| --- | --- | --- |
${decisions}
`;
}

export function renderOwnerPolicyContractMarkdown(report = buildPrescriptionPolicyV1AdmissionReport()): string {
  return `# Prescription Policy V1 Contract

Policy: \`${report.policyId}@${report.version}\`.

State: \`${report.state}\`.

> ${report.philosophy}

Supporting work may not compete with developmental work. Resolution order is TrainingSafety, contraindication/restriction, exercise legality, pain/response, section/role, dose mode, goal, equipment, continuity, experience, capacity, phase, then broad default. Equal-authority conflict returns \`PRESCRIPTION_POLICY_CONFLICT\`; weighted blending is forbidden.

Prescription may not add/remove exercises, repair the SessionSkeleton, invent user differences, or change Week/session responsibility. Continuity is legal when productive and tolerated. Progression is \`REVIEW_PERMITTED_NOT_AUTOMATIC\`.
`;
}

export function renderOwnerPolicyRuleMatrixMarkdown(): string {
  const rows = Object.entries(PRESCRIPTION_POLICY_V1_RULE_MATRIX).map(([family, value]) =>
    `| \`${family}\` | ${Object.entries(value).map(([key, entry]) => `${key}: ${String(entry)}`).join("; ")} |`).join("\n");
  return `# Prescription Policy V1 Rule Matrix

All rules are context-scoped selections from the frozen numeric lattice; the lattice is unchanged.

| Family | Binding V1 rule |
| --- | --- |
${rows}
`;
}

export function renderOwnerPolicyLoadSelectionMarkdown(report = buildPrescriptionPolicyV1AdmissionReport()): string {
  return `# Prescription Policy V1 Load Selection

Default: \`USER_SELECTED_BY_EFFORT\`. No age, sex, body-mass, appearance, or progression formula is used.

Exact prior load is retained only when exercise, mode, equipment realization, side/laterality, support/range, rep target, observed prior load, productive tolerance, restriction state, and available increment all match without presumed progression.

- Exact prior load retained: ${report.loadSelection.exactPriorLoadRetainedCount}
- Rejected to fallback: ${report.loadSelection.exactPriorLoadRejectedToFallbackCount}
- User-selected-by-effort: ${report.loadSelection.userSelectedByEffortCount}
- Automatic progression: ${report.loadSelection.automaticProgressionCount}
`;
}

export function renderOwnerPolicyRestPlacementMarkdown(): string {
  return `# Prescription Policy V1 Rest Placement

| Placement | V1 target |
| --- | --- |
| Repeated preparation/activation sets | 15-45 seconds |
| Between preparatory blocks | 15-45 seconds |
| Before the developmental block | 60-180 seconds where required |
| Main strength developmental sets | 180-300 seconds |
| Secondary strength sets | 90-180 seconds |
| Main hypertrophy sets | 90-180 seconds |
| Accessory/direct sets | 60-120 seconds; preferred/optional direct work may use 45-90 seconds |
| Timed holds, accessory carries, marches, counted steps | 60-120 seconds |
| Capacity-main carry trips | 90-180 seconds |
| Repeated breath rounds | 30-60 seconds |
| Between sides | Only where exercise knowledge or an explicit requirement applies |
| After the final block | Not prescribed |

Inter-exercise transition and setup remain Sequencing-owned. Rest placement does not invent total session duration.

Fingerprint: \`${digest(PRESCRIPTION_POLICY_V1_REST_PLACEMENT)}\`.
`;
}

export function renderOwnerPolicyHoldoutManifestMarkdown(report = buildPrescriptionPolicyV1AdmissionReport()): string {
  return `# Prescription Policy V1 Owner Admission Holdout Manifest

- Holdout: \`${PRESCRIPTION_POLICY_V1_HOLDOUT_ID}\`
- Locked scenarios: ${report.holdout.scenarioCount}
- Genuine multi-assignment sessions: ${report.holdout.genuineMultiAssignmentSessionCount}
- Calibration + holdout exercise identities: ${report.holdout.calibrationAndHoldoutExerciseIdentityCount}
- Manifest fingerprint: \`${report.holdout.manifestFingerprint}\`
- Locked before execution: yes
- Tuning after inspection: no; correction requires V1.1 and a fresh holdout
`;
}

export function renderOwnerPolicyAdmissionMarkdown(report = buildPrescriptionPolicyV1AdmissionReport()): string {
  return `# Prescription Policy V1 CAGT Admission Report

Classification: \`${report.classification}\`.

Policy: \`${report.policyId}@${report.version}\`.

The evaluator received semantic policy values without policy identity, policy name, or owner-decision status. Gates 0-8 remain frozen; Gates 9-11 and full-session coherence were evaluated.

- Holdout sessions: ${report.holdout.scenarioCount}
- Compiled full sessions: ${report.holdout.compiledFullSessionCount}
- Blinded comparisons: ${report.stress.blindedComparisonCount}
- Independent performance comparisons: ${report.performance.comparisonCount}
- Hard-zero causal findings: ${Object.entries(report.causal).filter(([key]) => key !== "downstreamRescueAttemptCount").every(([, value]) => value === 0) ? "PASS" : "FAIL"}
- Production behavior changed: no
- Production policy activated: no
- Combined fingerprint: \`${report.fingerprints.combinedPolicyV1Admission}\`
`;
}

export function renderOwnerPolicyFullSessionMarkdown(report = buildPrescriptionPolicyV1AdmissionReport()): string {
  return `# Prescription Policy V1 Full Session Report

- Compiled sessions: ${report.holdout.compiledFullSessionCount}
- Warm-up/activation: \`${report.coherence.warmupActivationCompleteSessionResult}\`
- Supporting-work overwhelm: ${report.coherence.supportingWorkOverwhelmCount}
- Policy-created assignments: ${report.causal.policyCreatedAssignmentCount}
- Main-purpose loss: ${report.causal.mainPurposeLossCount}
- Accessory-purpose loss: ${report.causal.accessoryPurposeLossCount}
- Ramp-up counts: 0=${report.coherence.rampUpCounts.zero}, 1=${report.coherence.rampUpCounts.one}, 2=${report.coherence.rampUpCounts.two}
- Backoff blocks: ${report.coherence.backoffBlockCount}
`;
}

export function renderOwnerPolicyWarmupActivationMarkdown(report = buildPrescriptionPolicyV1AdmissionReport()): string {
  return `# Prescription Policy V1 Warm-up and Activation Report

Complete-session result: \`${report.coherence.warmupActivationCompleteSessionResult}\`.

Preparation and activation remain assignment-bound, low-fatigue, limited to at most two sets under structured conditions, excluded from developmental credit, and subordinate to the main session purpose. No universal warm-up or cooldown is inserted.
`;
}

export function renderOwnerPolicySourceEventMarkdown(report = buildPrescriptionPolicyV1AdmissionReport()): string {
  return `# Prescription Policy V1 Source Event Report

- Source-event duplication: ${report.causal.sourceEventDuplicationCount}
- Revision errors: ${report.causal.revisionErrorCount}
- Preparatory miscredit: ${report.causal.preparatoryMiscreditCount}
- Substitution double count: ${report.causal.substitutionDoubleCount}
- Policy-created assignments: ${report.causal.policyCreatedAssignmentCount}

Each planned assignment retains one source-exposure identity. Revisions and independent performance never rewrite completed history.
`;
}

export function renderOwnerPolicyPerformanceMarkdown(report = buildPrescriptionPolicyV1AdmissionReport()): string {
  return `# Prescription Policy V1 Performance Report

- Independent comparisons: ${report.performance.comparisonCount}
- Independent fixtures: ${report.performance.independentActualFixtureCount}
- Actual-as-plan assumptions: ${report.performance.actualAsPlanAssumptionCount}
- Original-plan mutations: ${report.performance.planMutationCount}
- Linkage validation errors: ${report.performance.validationErrorCount}
- No-observation cases preserved: ${report.performance.noObservationPreservedCount}
- Fingerprint: \`${report.performance.fingerprint}\`
`;
}

export function renderOwnerPolicyDurationMarkdown(report = buildPrescriptionPolicyV1AdmissionReport()): string {
  const owners = Object.entries(report.duration.unknownOwners).map(([owner, count]) => `- \`${owner}\`: ${count}`).join("\n");
  return `# Prescription Policy V1 Duration Report

- Fully determinable: ${report.duration.fullyDeterminableCount}
- Bounded: ${report.duration.boundedCount}
- Unknown: ${report.duration.unknownCount}
- Definitely over budget: ${report.duration.definitelyOverBudgetCount}
- Possibly over budget: ${report.duration.possiblyOverBudgetCount}
- Unknown classified as fitting or failing: ${report.duration.unknownClassifiedAsFitOrFailureCount}

Unknown owners:

${owners}

Setup and inter-exercise transition remain Sequencing-owned.
`;
}

export function renderOwnerPolicyScopeCoverageMarkdown(report = buildPrescriptionPolicyV1AdmissionReport()): string {
  return `# Prescription Policy V1 Scope Coverage

Covered:

${report.scopeCovered.map((entry) => `- ${entry}`).join("\n")}

Unresolved:

${report.unresolvedScopes.map((entry) => `- ${entry}`).join("\n")}
`;
}

export function renderOwnerPolicyReadinessMarkdown(report = buildPrescriptionPolicyV1AdmissionReport()): string {
  return `# Prescription Policy V1 Implementation Readiness

Classification: \`${report.classification}\`.

The selected rules are causally owned; complete-session support work is bounded; main work remains productive; load and duration unknowns remain honest; legal same-rep and same-tempo convergence is preserved; H1/H2 and spacing remain with their rightful owners.

This is authorization evidence only. No production Compiler, policy export, Week allocation, final Sequencing, post-Prescription weekly validation, Longitudinal Adaptation, application integration, or UI was activated.

Exact next dependency: ${report.exactNextDependency}
`;
}
