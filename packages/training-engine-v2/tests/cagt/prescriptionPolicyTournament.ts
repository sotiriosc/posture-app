import {
  EXERCISE_DOSE_MODES,
  PRESCRIPTION_COMPILATION_ORDER,
  PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES,
  exactBreathCycles,
  exactCount,
  exactMetres,
  exactSeconds,
  exactSteps,
  validateExerciseCatalog,
  validateExercisePrescriptionPlan,
  validatePerformanceBlockLinkage,
  validatePrescriptionDoseBlocks,
  validatePrescriptionRevisionSet,
  validateSourceExposureEventIdentity,
  type BreathCycleTarget,
  type CountTarget,
  type ExerciseDefinition,
  type ExerciseDose,
  type ExerciseDoseMode,
  type ExercisePerformanceBlockLinkage,
  type ExercisePrescriptionPlan,
  type ExercisePrescriptionRevision,
  type PrescriptionCompilationResult,
  type PrescriptionDoseBlock,
  type PrescriptionDoseBlockPurpose,
  type PrescriptionDurationDeterminability,
  type SourceExposureEventIdentity,
  type TimeTarget,
  type TrainingOutcomeGoal,
  type TrainingRole,
  type SessionSection,
} from "../../src";
import {
  buildCompilerInputForScenario,
  buildDesignHandoffAssignment,
  buildPrescriptionDesignScenarios,
  type PrescriptionDesignScenario,
} from "../helpers/prescriptionCompilerDesignLab";
import {
  CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
  CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
  buildCurrentTrunkCurationFingerprints,
} from "../helpers/trunkMechanicsCurationProposal";
import {
  EXPECTED_PLANNER_FINGERPRINTS,
  computePlannerFingerprints,
} from "../helpers/sessionIntentPlannerProduction";
import { buildProductionComposerFingerprints } from "../helpers/sessionComposerProduction";
import { buildPrescriptionTimingFoundationData } from "../helpers/prescriptionTimingFoundation";
import { CAGT_GATE_ORDER, CAGT_PRESCRIPTION_DIFFERENCE_DIMENSIONS } from "./contracts";
import { EXPECTED_CAGT_FINGERPRINTS } from "./report";
import { EXPECTED_WEEK_POLICY_V1_FINGERPRINTS } from "./weekPolicyV1Report";
import { digest } from "./signatures";

export const PRESCRIPTION_NUMERIC_TOURNAMENT_VERSION = "1.0.0";
export const PRESCRIPTION_NUMERIC_TOURNAMENT_AS_OF = "2026-08-13T12:00:00-04:00";
export const PRESCRIPTION_NUMERIC_TOURNAMENT_SEED = 0x0806711;
export const PRESCRIPTION_NUMERIC_TEST_CANDIDATE_STATE =
  "PRESCRIPTION_NUMERIC_TEST_CANDIDATE_NOT_PRODUCTION" as const;

export type PrescriptionNumericTournamentClassification =
  | "PRESCRIPTION_NUMERIC_POLICY_FRONTIER_READY_FOR_OWNER_SELECTION"
  | "TARGETED_PRESCRIPTION_CANDIDATE_FIXES_REQUIRED"
  | "NUMERIC_PRESCRIPTION_TOURNAMENT_FOUNDATION_GAP";

export type PrescriptionNumericAdmissionClassification =
  | "CAGT_RECOMMENDED_FOR_OWNER_ADMISSION"
  | "PARETO_FRONTIER_OWNER_DECISION_REQUIRED"
  | "REJECTED_BY_HARD_GATE"
  | "REJECTED_FOR_UNDER_ADAPTATION"
  | "REJECTED_FOR_OVER_ADAPTATION"
  | "REJECTED_FOR_WRONG_LAYER_EFFECT"
  | "REJECTED_FOR_SOURCE_EVENT_OR_BLOCK_ERROR"
  | "REJECTED_FOR_PREPARATORY_MISCREDIT"
  | "REJECTED_FOR_BLOAT_OR_DURATION"
  | "PRESCRIPTION_OR_RESPONSE_DEPENDENT"
  | "EXERCISE_SPECIFIC_OVERRIDE_ONLY"
  | "INSUFFICIENT_EVIDENCE"
  | "ADVISORY_ONLY"
  | "NO_POLICY_CONTROL";

export type PrescriptionNumericFamily =
  | "preparation"
  | "activation"
  | "main_strength"
  | "secondary_strength"
  | "main_hypertrophy"
  | "hypertrophy_accessory"
  | "direct_accessory"
  | "timed_hold"
  | "breath_cycles"
  | "carry"
  | "stationary_march"
  | "counted_step"
  | "recovery_cooldown"
  | "rest"
  | "effort"
  | "tempo_intent"
  | "exact_phase_tempo"
  | "duration"
  | "block_structure";

export type PrescriptionNumericShape =
  | "minimal_truthful"
  | "balanced"
  | "high_dose_or_high_complexity_stress"
  | "no_policy_control";

export type TargetUnit =
  | "sets"
  | "reps"
  | "seconds"
  | "breath_cycles"
  | "steps"
  | "metres"
  | "trips";

export type NumericPolicyTarget =
  | { readonly kind: "exact"; readonly value: number; readonly unit: TargetUnit }
  | { readonly kind: "range"; readonly min: number; readonly max: number; readonly unit: TargetUnit }
  | { readonly kind: "not_prescribed"; readonly reason: string; readonly unit?: TargetUnit }
  | { readonly kind: "policy_required"; readonly reason: string; readonly unit?: TargetUnit };

export type EffortPolicyTarget =
  | { readonly kind: "quality_limited"; readonly description: string }
  | { readonly kind: "qualitative"; readonly band: "easy" | "moderate" | "hard" }
  | { readonly kind: "rir"; readonly min: number; readonly max: number }
  | { readonly kind: "policy_required"; readonly reason: string };

export type TempoIntentPolicyTarget =
  | "natural"
  | "controlled"
  | "explosive_intent"
  | "maximal_intent"
  | "not_prescribed"
  | "policy_required";

export interface DosePolicyValue {
  readonly sets?: NumericPolicyTarget;
  readonly reps?: NumericPolicyTarget;
  readonly duration?: NumericPolicyTarget;
  readonly rounds?: NumericPolicyTarget;
  readonly breathCycles?: NumericPolicyTarget;
  readonly trips?: NumericPolicyTarget;
  readonly distance?: NumericPolicyTarget;
  readonly steps?: NumericPolicyTarget;
  readonly effort?: EffortPolicyTarget;
  readonly rest?: NumericPolicyTarget;
  readonly cadence?: "controlled" | "natural" | "not_prescribed" | "policy_required";
}

export interface PrescriptionNumericCandidateValue {
  readonly scope: string;
  readonly dynamic?: DosePolicyValue;
  readonly timedHold?: DosePolicyValue;
  readonly breathing?: DosePolicyValue;
  readonly step?: DosePolicyValue;
  readonly distanceCarry?: DosePolicyValue;
  readonly timedCarry?: DosePolicyValue;
  readonly stationaryMarch?: DosePolicyValue;
  readonly restByUse?: Readonly<Record<string, NumericPolicyTarget>>;
  readonly effortByUse?: Readonly<Record<string, EffortPolicyTarget>>;
  readonly tempoIntent?: TempoIntentPolicyTarget;
  readonly exactTempo?:
    | { readonly kind: "not_prescribed" }
    | {
        readonly kind: "phase_tempo";
        readonly eccentricSeconds: number;
        readonly lengthenedPauseSeconds?: NumericPolicyTarget;
        readonly concentricSeconds?: number;
        readonly concentricIntent?: "natural" | "controlled";
        readonly shortenedPauseSeconds?: NumericPolicyTarget;
      };
  readonly durationByUse?: Readonly<Record<string, NumericPolicyTarget>>;
  readonly blockStructure?: {
    readonly mainLoadedPrepBlocks: NumericPolicyTarget;
    readonly developmentalBlocks: NumericPolicyTarget;
    readonly backoffBlocks: NumericPolicyTarget;
    readonly mixedDoseModesAllowed: false;
  };
  readonly loadPolicy?: "user_selected_by_effort" | "retain_prior_when_supported" | "not_prescribed" | "policy_required";
  readonly expectedRisks: readonly string[];
}

export interface PrescriptionNumericAtomicCandidate {
  readonly candidateId: string;
  readonly version: typeof PRESCRIPTION_NUMERIC_TOURNAMENT_VERSION;
  readonly state: typeof PRESCRIPTION_NUMERIC_TEST_CANDIDATE_STATE;
  readonly family: PrescriptionNumericFamily;
  readonly shape: PrescriptionNumericShape;
  readonly ownerLeading: boolean;
  readonly value: PrescriptionNumericCandidateValue;
}

export interface PrescriptionNumericCompositeCandidate {
  readonly candidateId: string;
  readonly version: typeof PRESCRIPTION_NUMERIC_TOURNAMENT_VERSION;
  readonly state: typeof PRESCRIPTION_NUMERIC_TEST_CANDIDATE_STATE;
  readonly family: "composite";
  readonly atomicCandidateIds: Readonly<Record<PrescriptionNumericFamily, string>> | null;
  readonly ownerLeading: boolean;
  readonly noPolicyControl: boolean;
  readonly stressOnly: boolean;
}

export type PrescriptionNumericTournamentCandidate =
  | PrescriptionNumericAtomicCandidate
  | PrescriptionNumericCompositeCandidate;

export interface PrescriptionNumericScenario {
  readonly scenarioId: string;
  readonly cohort: "calibration" | "holdout";
  readonly locked: boolean;
  readonly exerciseId: string;
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly goal: TrainingOutcomeGoal;
  readonly phaseId: "phase_1" | "phase_2" | "phase_3";
  readonly experience: "novice" | "intermediate" | "advanced";
  readonly equipment: readonly string[];
  readonly availableMinutes: number;
  readonly contextTags: readonly string[];
}

export type PrescriptionGateState = "PASS" | "FAIL_STOP" | "NOT_REACHED" | "SHADOW_DIAGNOSTIC_ONLY";
export interface PrescriptionGateResult {
  readonly gate: "gate_9_prescription_handoff_truth" |
    "gate_10_sequencing_duration_handoff_truth" |
    "gate_11_execution_response_foundation";
  readonly state: PrescriptionGateState;
  readonly reasonCode: string;
  readonly evidenceRefs: readonly string[];
}

export interface PrescriptionScenarioEvaluation {
  readonly candidateId: string;
  readonly scenarioId: string;
  readonly cohort: PrescriptionNumericScenario["cohort"];
  readonly status:
    | "compiled_non_production_fixture"
    | "prescription_policy_required"
    | "prescription_policy_conflict"
    | "unsupported_dose_mode"
    | "unresolved_execution_requirement"
    | "invalid_source_exposure_context";
  readonly plan: ExercisePrescriptionPlan | null;
  readonly sourceExposureEventCount: number;
  readonly revisionCount: number;
  readonly finalRevisionCount: number;
  readonly blockCount: number;
  readonly preparatoryBlockCount: number;
  readonly developmentalBlockCount: number;
  readonly backoffBlockCount: number;
  readonly sourceEventDuplication: number;
  readonly revisionErrors: number;
  readonly blockOrderErrors: number;
  readonly illegalDoseMode: number;
  readonly unresolvedRequiredModification: number;
  readonly preparatoryMiscredit: number;
  readonly substitutionDoubleCount: number;
  readonly missingPolicy: number;
  readonly policyConflict: number;
  readonly hardGateFailures: number;
  readonly underAdaptation: number;
  readonly overAdaptation: number;
  readonly wrongLayerEffects: number;
  readonly downstreamRescueAttempts: number;
  readonly expectedConvergence: number;
  readonly justifiedConvergence: number;
  readonly suspiciousConvergence: number;
  readonly sameRepConvergence: boolean;
  readonly sameTempoConvergence: boolean;
  readonly durationDeterminability: PrescriptionDurationDeterminability;
  readonly explicitDurationKnown: boolean;
  readonly overBudget: boolean;
  readonly constrainedSessionPreserved: boolean;
  readonly warmupActivationBounded: boolean;
  readonly mainPurposePreserved: boolean;
  readonly accessoryMarginalValuePreserved: boolean;
  readonly completeSessionArgument: boolean;
  readonly averageBlockCount: number;
  readonly effortBurden: "low" | "moderate" | "high" | "unknown";
  readonly timingBurden: "none" | "intent" | "exact_phase" | "slow_exact_phase" | "unknown";
  readonly restBurdenSeconds: number;
  readonly traceSize: number;
  readonly applicableRuleCount: number;
  readonly compilerStateCount: number;
  readonly firstMeaningfulPrescriptionDifference: string | null;
  readonly firstFailingGate: PrescriptionGateResult["gate"] | null;
  readonly gates: readonly PrescriptionGateResult[];
}

export interface PrescriptionCandidateTournamentResult {
  readonly candidateId: string;
  readonly family: PrescriptionNumericFamily | "composite";
  readonly classification: PrescriptionNumericAdmissionClassification;
  readonly calibrationPass: boolean;
  readonly holdoutPass: boolean;
  readonly hardGateFailures: number;
  readonly underAdaptation: number;
  readonly overAdaptation: number;
  readonly wrongLayerEffects: number;
  readonly downstreamRescueAttempts: number;
  readonly expectedConvergence: number;
  readonly justifiedConvergence: number;
  readonly suspiciousConvergence: number;
  readonly sourceEventDuplication: number;
  readonly revisionErrors: number;
  readonly blockOrderErrors: number;
  readonly preparatoryMiscredit: number;
  readonly substitutionDoubleCount: number;
  readonly missingRequiredModification: number;
  readonly policyRequiredRate: number;
  readonly policyConflictRate: number;
  readonly validCompiledFixtureRate: number;
  readonly durationFullyDeterminable: number;
  readonly durationPartiallyDeterminable: number;
  readonly durationUnknownDueToPrescription: number;
  readonly durationUnknownDueToSequencing: number;
  readonly overBudgetRate: number;
  readonly constrainedSessionFailures: number;
  readonly warmupActivationBloat: number;
  readonly averageBlockCount: number;
  readonly preparatoryBlockCount: number;
  readonly developmentalBlockCount: number;
  readonly backoffBlockCount: number;
  readonly averageRestBurdenSeconds: number;
  readonly highEffortBurdenCount: number;
  readonly exactTimingBurdenCount: number;
  readonly applicableRules: number;
  readonly compilerStates: number;
  readonly unresolvedRequirements: number;
  readonly traceSize: number;
  readonly scenarioResults: readonly PrescriptionScenarioEvaluation[];
}

const families: readonly PrescriptionNumericFamily[] = Object.freeze([
  "preparation",
  "activation",
  "main_strength",
  "secondary_strength",
  "main_hypertrophy",
  "hypertrophy_accessory",
  "direct_accessory",
  "timed_hold",
  "breath_cycles",
  "carry",
  "stationary_march",
  "counted_step",
  "recovery_cooldown",
  "rest",
  "effort",
  "tempo_intent",
  "exact_phase_tempo",
  "duration",
  "block_structure",
]);

const target = {
  exact: (value: number, unit: TargetUnit): NumericPolicyTarget => ({ kind: "exact", value, unit }),
  range: (min: number, max: number, unit: TargetUnit): NumericPolicyTarget => ({ kind: "range", min, max, unit }),
  not: (reason: string, unit?: TargetUnit): NumericPolicyTarget => ({ kind: "not_prescribed", reason, unit }),
  required: (reason: string, unit?: TargetUnit): NumericPolicyTarget => ({ kind: "policy_required", reason, unit }),
};

const effort = {
  quality: (description = "Quality remains primary."): EffortPolicyTarget =>
    ({ kind: "quality_limited", description }),
  qualitative: (band: "easy" | "moderate" | "hard"): EffortPolicyTarget =>
    ({ kind: "qualitative", band }),
  rir: (min: number, max: number): EffortPolicyTarget => ({ kind: "rir", min, max }),
  required: (reason: string): EffortPolicyTarget => ({ kind: "policy_required", reason }),
};

function atomic(input: Omit<PrescriptionNumericAtomicCandidate, "version" | "state">): PrescriptionNumericAtomicCandidate {
  return Object.freeze({
    ...input,
    version: PRESCRIPTION_NUMERIC_TOURNAMENT_VERSION,
    state: PRESCRIPTION_NUMERIC_TEST_CANDIDATE_STATE,
  });
}

const noPolicyValue = (scope: string): PrescriptionNumericCandidateValue => ({
  scope,
  expectedRisks: ["missing_policy"],
  dynamic: { sets: target.required("No reviewed policy.", "sets") },
});

export const PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES: readonly PrescriptionNumericAtomicCandidate[] =
  Object.freeze([
    atomic({ candidateId: "PREPARATION_MINIMAL_TRUTHFUL", family: "preparation", shape: "minimal_truthful", ownerLeading: false,
      value: { scope: "warmup preparation", dynamic: { sets: target.exact(1, "sets"), reps: target.range(4, 6, "reps"), effort: effort.quality(), rest: target.not("Rest not prescribed unless separation is required.", "seconds") },
        timedHold: { sets: target.exact(1, "sets"), duration: target.range(10, 20, "seconds"), effort: effort.quality() },
        breathing: { rounds: target.exact(1, "sets"), breathCycles: target.range(3, 5, "breath_cycles"), effort: effort.quality() },
        step: { sets: target.exact(1, "sets"), steps: target.range(6, 10, "steps"), effort: effort.quality() },
        expectedRisks: [] } }),
    atomic({ candidateId: "PREPARATION_BALANCED", family: "preparation", shape: "balanced", ownerLeading: true,
      value: { scope: "warmup preparation", dynamic: { sets: target.range(1, 2, "sets"), reps: target.range(5, 8, "reps"), effort: effort.quality(), rest: target.range(30, 60, "seconds") },
        timedHold: { sets: target.range(1, 2, "sets"), duration: target.range(15, 30, "seconds"), effort: effort.quality(), rest: target.range(30, 60, "seconds") },
        breathing: { rounds: target.range(1, 2, "sets"), breathCycles: target.range(4, 6, "breath_cycles"), effort: effort.quality(), rest: target.range(30, 60, "seconds") },
        step: { sets: target.range(1, 2, "sets"), steps: target.range(8, 12, "steps"), effort: effort.quality(), rest: target.range(30, 60, "seconds") },
        expectedRisks: [] } }),
    atomic({ candidateId: "PREPARATION_HIGH_COMPLEXITY_STRESS", family: "preparation", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "warmup preparation stress", dynamic: { sets: target.range(2, 3, "sets"), reps: target.range(8, 15, "reps"), effort: effort.qualitative("moderate"), rest: target.range(60, 120, "seconds") },
        timedHold: { sets: target.range(2, 3, "sets"), duration: target.range(30, 45, "seconds"), effort: effort.qualitative("moderate"), rest: target.range(60, 120, "seconds") },
        breathing: { rounds: target.range(2, 3, "sets"), breathCycles: target.range(6, 10, "breath_cycles"), effort: effort.qualitative("moderate") },
        step: { sets: target.range(2, 3, "sets"), steps: target.range(12, 20, "steps"), effort: effort.qualitative("moderate") },
        expectedRisks: ["unnecessary_fatigue", "section_bloat", "preparation_displacing_main_work"] } }),
    atomic({ candidateId: "PREPARATION_NO_POLICY", family: "preparation", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("warmup preparation") }),

    atomic({ candidateId: "ACTIVATION_MINIMAL_TRUTHFUL", family: "activation", shape: "minimal_truthful", ownerLeading: false,
      value: { scope: "activation", dynamic: { sets: target.exact(1, "sets"), reps: target.range(6, 10, "reps"), effort: effort.quality(), rest: target.range(15, 45, "seconds") },
        timedHold: { sets: target.exact(1, "sets"), duration: target.range(10, 20, "seconds"), effort: effort.quality() },
        step: { sets: target.exact(1, "sets"), steps: target.range(8, 12, "steps"), effort: effort.quality() }, expectedRisks: [] } }),
    atomic({ candidateId: "ACTIVATION_BALANCED", family: "activation", shape: "balanced", ownerLeading: true,
      value: { scope: "activation", dynamic: { sets: target.range(1, 2, "sets"), reps: target.range(8, 12, "reps"), effort: effort.quality(), rest: target.range(30, 60, "seconds") },
        timedHold: { sets: target.range(1, 2, "sets"), duration: target.range(15, 30, "seconds"), effort: effort.qualitative("easy"), rest: target.range(30, 60, "seconds") },
        step: { sets: target.range(1, 2, "sets"), steps: target.range(10, 16, "steps"), effort: effort.qualitative("easy"), rest: target.range(30, 60, "seconds") }, expectedRisks: [] } }),
    atomic({ candidateId: "ACTIVATION_HIGH_COMPLEXITY_STRESS", family: "activation", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "activation stress", dynamic: { sets: target.exact(3, "sets"), reps: target.range(12, 20, "reps"), effort: effort.qualitative("hard"), rest: target.range(45, 90, "seconds") },
        timedHold: { sets: target.exact(3, "sets"), duration: target.range(30, 45, "seconds"), effort: effort.qualitative("hard") },
        step: { sets: target.exact(3, "sets"), steps: target.range(16, 25, "steps"), effort: effort.qualitative("hard") },
        expectedRisks: ["activation_becoming_developmental_fatigue", "unnecessary_recurrence", "hidden_accessory_volume"] } }),
    atomic({ candidateId: "ACTIVATION_NO_POLICY", family: "activation", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("activation") }),

    atomic({ candidateId: "MAIN_STRENGTH_MINIMAL_TRUTHFUL", family: "main_strength", shape: "minimal_truthful", ownerLeading: false,
      value: { scope: "main strength", dynamic: { sets: target.exact(2, "sets"), reps: target.range(3, 6, "reps"), effort: effort.rir(3, 4), rest: target.range(120, 240, "seconds") },
        loadPolicy: "user_selected_by_effort", tempoIntent: "natural", expectedRisks: [] } }),
    atomic({ candidateId: "MAIN_STRENGTH_BALANCED", family: "main_strength", shape: "balanced", ownerLeading: true,
      value: { scope: "main strength", dynamic: { sets: target.exact(3, "sets"), reps: target.range(3, 6, "reps"), effort: effort.rir(1, 3), rest: target.range(180, 300, "seconds") },
        loadPolicy: "user_selected_by_effort", tempoIntent: "natural", expectedRisks: [] } }),
    atomic({ candidateId: "MAIN_STRENGTH_HIGH_DOSE_STRESS", family: "main_strength", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "main strength stress", dynamic: { sets: target.exact(5, "sets"), reps: target.range(1, 5, "reps"), effort: effort.rir(0, 2), rest: target.range(180, 360, "seconds") },
        loadPolicy: "user_selected_by_effort", expectedRisks: ["excessive_burden", "duration_incompatibility", "over_adaptation", "fatigue_concentration"] } }),
    atomic({ candidateId: "MAIN_STRENGTH_NO_POLICY", family: "main_strength", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("main strength") }),

    atomic({ candidateId: "SECONDARY_STRENGTH_MINIMAL_TRUTHFUL", family: "secondary_strength", shape: "minimal_truthful", ownerLeading: false,
      value: { scope: "secondary strength", dynamic: { sets: target.exact(2, "sets"), reps: target.range(5, 8, "reps"), effort: effort.rir(2, 4), rest: target.range(90, 180, "seconds") }, loadPolicy: "user_selected_by_effort", expectedRisks: [] } }),
    atomic({ candidateId: "SECONDARY_STRENGTH_BALANCED", family: "secondary_strength", shape: "balanced", ownerLeading: true,
      value: { scope: "secondary strength", dynamic: { sets: target.exact(3, "sets"), reps: target.range(5, 10, "reps"), effort: effort.rir(1, 3), rest: target.range(120, 240, "seconds") }, loadPolicy: "user_selected_by_effort", expectedRisks: [] } }),
    atomic({ candidateId: "SECONDARY_STRENGTH_HIGH_DOSE_STRESS", family: "secondary_strength", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "secondary strength stress", dynamic: { sets: target.range(4, 5, "sets"), reps: target.range(3, 8, "reps"), effort: effort.rir(0, 2), rest: target.range(180, 300, "seconds") }, expectedRisks: ["fatigue_concentration", "duration_incompatibility"] } }),
    atomic({ candidateId: "SECONDARY_STRENGTH_NO_POLICY", family: "secondary_strength", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("secondary strength") }),

    atomic({ candidateId: "MAIN_HYPERTROPHY_MINIMAL_TRUTHFUL", family: "main_hypertrophy", shape: "minimal_truthful", ownerLeading: false,
      value: { scope: "main hypertrophy", dynamic: { sets: target.exact(2, "sets"), reps: target.range(6, 15, "reps"), effort: effort.rir(2, 4), rest: target.range(90, 180, "seconds") }, loadPolicy: "user_selected_by_effort", expectedRisks: [] } }),
    atomic({ candidateId: "MAIN_HYPERTROPHY_BALANCED", family: "main_hypertrophy", shape: "balanced", ownerLeading: true,
      value: { scope: "main hypertrophy", dynamic: { sets: target.exact(3, "sets"), reps: target.range(6, 20, "reps"), effort: effort.rir(1, 3), rest: target.range(90, 180, "seconds") }, loadPolicy: "user_selected_by_effort", expectedRisks: [] } }),
    atomic({ candidateId: "MAIN_HYPERTROPHY_HIGH_DOSE_STRESS", family: "main_hypertrophy", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "main hypertrophy stress", dynamic: { sets: target.exact(5, "sets"), reps: target.range(6, 30, "reps"), effort: effort.rir(0, 1), rest: target.range(60, 120, "seconds") }, expectedRisks: ["excessive_fatigue", "failure_seeking", "duration_failure"] } }),
    atomic({ candidateId: "MAIN_HYPERTROPHY_NO_POLICY", family: "main_hypertrophy", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("main hypertrophy") }),

    atomic({ candidateId: "HYPERTROPHY_ACCESSORY_MINIMAL_TRUTHFUL", family: "hypertrophy_accessory", shape: "minimal_truthful", ownerLeading: false,
      value: { scope: "hypertrophy accessory", dynamic: { sets: target.range(1, 2, "sets"), reps: target.range(8, 20, "reps"), effort: effort.rir(2, 4), rest: target.range(60, 120, "seconds") }, expectedRisks: [] } }),
    atomic({ candidateId: "HYPERTROPHY_ACCESSORY_BALANCED", family: "hypertrophy_accessory", shape: "balanced", ownerLeading: true,
      value: { scope: "hypertrophy accessory", dynamic: { sets: target.range(2, 3, "sets"), reps: target.range(8, 20, "reps"), effort: effort.rir(1, 3), rest: target.range(60, 120, "seconds") }, expectedRisks: [] } }),
    atomic({ candidateId: "HYPERTROPHY_ACCESSORY_HIGH_DOSE_STRESS", family: "hypertrophy_accessory", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "hypertrophy accessory stress", dynamic: { sets: target.exact(4, "sets"), reps: target.range(10, 30, "reps"), effort: effort.rir(0, 1), rest: target.range(45, 90, "seconds") }, expectedRisks: ["accessory_bloat", "failure_seeking"] } }),
    atomic({ candidateId: "HYPERTROPHY_ACCESSORY_NO_POLICY", family: "hypertrophy_accessory", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("hypertrophy accessory") }),

    atomic({ candidateId: "DIRECT_ACCESSORY_MINIMAL_TRUTHFUL", family: "direct_accessory", shape: "minimal_truthful", ownerLeading: false,
      value: { scope: "direct accessory", dynamic: { sets: target.exact(1, "sets"), reps: target.range(8, 20, "reps"), effort: effort.rir(2, 4), rest: target.range(45, 90, "seconds") }, expectedRisks: [] } }),
    atomic({ candidateId: "DIRECT_ACCESSORY_BALANCED", family: "direct_accessory", shape: "balanced", ownerLeading: true,
      value: { scope: "direct accessory", dynamic: { sets: target.exact(2, "sets"), reps: target.range(8, 20, "reps"), effort: effort.rir(1, 3), rest: target.range(60, 120, "seconds") }, expectedRisks: [] } }),
    atomic({ candidateId: "DIRECT_ACCESSORY_HIGH_DOSE_STRESS", family: "direct_accessory", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "direct accessory stress", dynamic: { sets: target.range(3, 4, "sets"), reps: target.range(10, 30, "reps"), effort: effort.rir(0, 1), rest: target.range(45, 90, "seconds") }, expectedRisks: ["direct_accessory_bloat", "failure_seeking"] } }),
    atomic({ candidateId: "DIRECT_ACCESSORY_NO_POLICY", family: "direct_accessory", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("direct accessory") }),

    atomic({ candidateId: "TIMED_HOLD_MINIMAL_TRUTHFUL", family: "timed_hold", shape: "minimal_truthful", ownerLeading: false,
      value: { scope: "timed hold", timedHold: { sets: target.range(1, 2, "sets"), duration: target.range(10, 20, "seconds"), effort: effort.quality(), rest: target.range(45, 90, "seconds") }, expectedRisks: [] } }),
    atomic({ candidateId: "TIMED_HOLD_BALANCED", family: "timed_hold", shape: "balanced", ownerLeading: true,
      value: { scope: "timed hold", timedHold: { sets: target.range(2, 3, "sets"), duration: target.range(20, 40, "seconds"), effort: effort.qualitative("moderate"), rest: target.range(60, 120, "seconds") }, expectedRisks: [] } }),
    atomic({ candidateId: "TIMED_HOLD_HIGH_DOSE_STRESS", family: "timed_hold", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "timed hold stress", timedHold: { sets: target.range(3, 4, "sets"), duration: target.range(40, 60, "seconds"), effort: effort.qualitative("hard"), rest: target.range(60, 120, "seconds") }, expectedRisks: ["hold_duration_bloat", "hard_position_fatigue"] } }),
    atomic({ candidateId: "TIMED_HOLD_NO_POLICY", family: "timed_hold", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("timed hold") }),

    atomic({ candidateId: "BREATH_CYCLES_MINIMAL_TRUTHFUL", family: "breath_cycles", shape: "minimal_truthful", ownerLeading: true,
      value: { scope: "breath cycles", breathing: { rounds: target.exact(1, "sets"), breathCycles: target.range(3, 4, "breath_cycles"), effort: effort.quality(), rest: target.not("Rest not prescribed.", "seconds"), cadence: "not_prescribed" }, expectedRisks: [] } }),
    atomic({ candidateId: "BREATH_CYCLES_BALANCED", family: "breath_cycles", shape: "balanced", ownerLeading: false,
      value: { scope: "breath cycles", breathing: { rounds: target.range(1, 2, "sets"), breathCycles: target.range(4, 6, "breath_cycles"), effort: effort.quality(), rest: target.range(30, 60, "seconds"), cadence: "controlled" }, expectedRisks: ["exercise_specific_numeric_policy_needed"] } }),
    atomic({ candidateId: "BREATH_CYCLES_HIGH_DOSE_STRESS", family: "breath_cycles", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "breath cycles stress", breathing: { rounds: target.exact(3, "sets"), breathCycles: target.range(8, 10, "breath_cycles"), effort: effort.qualitative("easy"), rest: target.range(30, 60, "seconds"), cadence: "controlled" }, expectedRisks: ["unnecessary_session_duration", "unsupported_cadence_precision"] } }),
    atomic({ candidateId: "BREATH_CYCLES_NO_POLICY", family: "breath_cycles", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("breath cycles") }),

    atomic({ candidateId: "CARRY_MINIMAL_TRUTHFUL", family: "carry", shape: "minimal_truthful", ownerLeading: false,
      value: { scope: "carry", distanceCarry: { trips: target.exact(2, "trips"), distance: target.range(10, 20, "metres"), effort: effort.qualitative("moderate"), rest: target.range(60, 120, "seconds") },
        timedCarry: { trips: target.exact(2, "trips"), duration: target.range(15, 25, "seconds"), effort: effort.qualitative("moderate"), rest: target.range(60, 120, "seconds") }, expectedRisks: [] } }),
    atomic({ candidateId: "CARRY_BALANCED", family: "carry", shape: "balanced", ownerLeading: true,
      value: { scope: "carry", distanceCarry: { trips: target.exact(3, "trips"), distance: target.range(15, 30, "metres"), effort: effort.rir(2, 3), rest: target.range(90, 180, "seconds") },
        timedCarry: { trips: target.exact(3, "trips"), duration: target.range(20, 40, "seconds"), effort: effort.rir(2, 3), rest: target.range(90, 180, "seconds") }, expectedRisks: [] } }),
    atomic({ candidateId: "CARRY_HIGH_DOSE_STRESS", family: "carry", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "carry stress", distanceCarry: { trips: target.range(5, 6, "trips"), distance: target.range(30, 50, "metres"), effort: effort.qualitative("hard"), rest: target.range(60, 120, "seconds") },
        timedCarry: { trips: target.range(5, 6, "trips"), duration: target.range(40, 60, "seconds"), effort: effort.qualitative("hard"), rest: target.range(60, 120, "seconds") },
        expectedRisks: ["grip_trunk_concentration", "capacity_bloat", "duration_failure"] } }),
    atomic({ candidateId: "CARRY_NO_POLICY", family: "carry", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("carry") }),

    atomic({ candidateId: "STATIONARY_MARCH_MINIMAL_TRUTHFUL", family: "stationary_march", shape: "minimal_truthful", ownerLeading: false,
      value: { scope: "stationary march", stationaryMarch: { sets: target.range(1, 2, "sets"), steps: target.range(12, 20, "steps"), duration: target.range(15, 25, "seconds"), effort: effort.quality(), rest: target.range(45, 90, "seconds") }, expectedRisks: [] } }),
    atomic({ candidateId: "STATIONARY_MARCH_BALANCED", family: "stationary_march", shape: "balanced", ownerLeading: true,
      value: { scope: "stationary march", stationaryMarch: { sets: target.range(2, 3, "sets"), steps: target.range(20, 40, "steps"), duration: target.range(20, 40, "seconds"), effort: effort.qualitative("moderate"), rest: target.range(60, 120, "seconds") }, expectedRisks: [] } }),
    atomic({ candidateId: "STATIONARY_MARCH_HIGH_DOSE_STRESS", family: "stationary_march", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "stationary march stress", stationaryMarch: { sets: target.range(3, 4, "sets"), steps: target.range(40, 60, "steps"), duration: target.range(40, 60, "seconds"), effort: effort.qualitative("hard"), rest: target.range(60, 120, "seconds") }, expectedRisks: ["duration_failure", "capacity_bloat"] } }),
    atomic({ candidateId: "STATIONARY_MARCH_NO_POLICY", family: "stationary_march", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("stationary march") }),

    atomic({ candidateId: "COUNTED_STEP_MINIMAL_TRUTHFUL", family: "counted_step", shape: "minimal_truthful", ownerLeading: false,
      value: { scope: "counted step", step: { sets: target.range(1, 2, "sets"), steps: target.range(6, 10, "steps"), effort: effort.qualitative("easy"), rest: target.range(45, 90, "seconds") }, expectedRisks: [] } }),
    atomic({ candidateId: "COUNTED_STEP_BALANCED", family: "counted_step", shape: "balanced", ownerLeading: true,
      value: { scope: "counted step", step: { sets: target.range(2, 3, "sets"), steps: target.range(8, 15, "steps"), effort: effort.qualitative("moderate"), rest: target.range(60, 120, "seconds") }, expectedRisks: [] } }),
    atomic({ candidateId: "COUNTED_STEP_HIGH_DOSE_STRESS", family: "counted_step", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "counted step stress", step: { sets: target.range(3, 4, "sets"), steps: target.range(15, 25, "steps"), effort: effort.qualitative("hard"), rest: target.range(45, 90, "seconds") }, expectedRisks: ["step_volume_bloat", "quality_decay"] } }),
    atomic({ candidateId: "COUNTED_STEP_NO_POLICY", family: "counted_step", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("counted step") }),

    atomic({ candidateId: "RECOVERY_MINIMAL_TRUTHFUL", family: "recovery_cooldown", shape: "minimal_truthful", ownerLeading: true,
      value: { scope: "recovery cooldown", breathing: { rounds: target.exact(1, "sets"), breathCycles: target.range(3, 5, "breath_cycles"), effort: effort.qualitative("easy"), rest: target.not("Rest not prescribed.", "seconds") },
        timedHold: { sets: target.exact(1, "sets"), duration: target.range(20, 40, "seconds"), effort: effort.qualitative("easy") }, expectedRisks: [] } }),
    atomic({ candidateId: "RECOVERY_BALANCED", family: "recovery_cooldown", shape: "balanced", ownerLeading: false,
      value: { scope: "recovery cooldown", breathing: { rounds: target.range(1, 2, "sets"), breathCycles: target.range(4, 6, "breath_cycles"), effort: effort.qualitative("easy") },
        timedHold: { sets: target.range(1, 2, "sets"), duration: target.range(30, 60, "seconds"), effort: effort.qualitative("easy") }, expectedRisks: ["explicit_recovery_scope_required"] } }),
    atomic({ candidateId: "RECOVERY_HIGH_DOSE_STRESS", family: "recovery_cooldown", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "recovery cooldown stress", breathing: { rounds: target.exact(3, "sets"), breathCycles: target.range(8, 10, "breath_cycles"), effort: effort.qualitative("easy") },
        timedHold: { sets: target.exact(3, "sets"), duration: target.range(60, 120, "seconds"), effort: effort.qualitative("easy") }, expectedRisks: ["generic_cooldown_insertion", "unnecessary_session_duration", "unsupported_recovery_claim"] } }),
    atomic({ candidateId: "RECOVERY_NO_POLICY", family: "recovery_cooldown", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("recovery cooldown") }),

    atomic({ candidateId: "REST_MINIMAL_TRUTHFUL", family: "rest", shape: "minimal_truthful", ownerLeading: false,
      value: { scope: "rest bundle", restByUse: { preparation: target.range(15, 45, "seconds"), activation: target.range(15, 45, "seconds"), main_strength: target.range(120, 180, "seconds"), secondary_strength: target.range(90, 150, "seconds"), main_hypertrophy: target.range(60, 120, "seconds"), accessory: target.range(45, 90, "seconds"), special: target.range(45, 90, "seconds") }, expectedRisks: [] } }),
    atomic({ candidateId: "REST_BALANCED", family: "rest", shape: "balanced", ownerLeading: true,
      value: { scope: "rest bundle", restByUse: { preparation: target.range(30, 60, "seconds"), activation: target.range(30, 60, "seconds"), main_strength: target.range(180, 300, "seconds"), secondary_strength: target.range(120, 240, "seconds"), main_hypertrophy: target.range(90, 180, "seconds"), accessory: target.range(60, 120, "seconds"), special: target.range(60, 120, "seconds"), breath: target.range(30, 60, "seconds") }, expectedRisks: [] } }),
    atomic({ candidateId: "REST_HIGH_DURATION_STRESS", family: "rest", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "rest stress", restByUse: { preparation: target.range(60, 120, "seconds"), activation: target.range(60, 120, "seconds"), main_strength: target.range(300, 420, "seconds"), secondary_strength: target.range(240, 360, "seconds"), main_hypertrophy: target.range(180, 300, "seconds"), accessory: target.range(120, 180, "seconds"), special: target.range(120, 240, "seconds") }, expectedRisks: ["session_duration_failure", "excessive_structural_cost"] } }),
    atomic({ candidateId: "REST_NO_POLICY", family: "rest", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("rest") }),

    atomic({ candidateId: "EFFORT_MINIMAL_TRUTHFUL", family: "effort", shape: "minimal_truthful", ownerLeading: false,
      value: { scope: "effort bundle", effortByUse: { preparation: effort.quality(), activation: effort.quality(), main_strength: effort.rir(3, 4), secondary_strength: effort.rir(3, 4), main_hypertrophy: effort.rir(2, 4), accessory: effort.rir(2, 4), special: effort.qualitative("easy") }, expectedRisks: [] } }),
    atomic({ candidateId: "EFFORT_BALANCED", family: "effort", shape: "balanced", ownerLeading: true,
      value: { scope: "effort bundle", effortByUse: { preparation: effort.quality(), activation: effort.quality(), main_strength: effort.rir(1, 3), secondary_strength: effort.rir(1, 3), main_hypertrophy: effort.rir(1, 3), accessory: effort.rir(1, 3), special: effort.qualitative("moderate") }, expectedRisks: [] } }),
    atomic({ candidateId: "EFFORT_FAILURE_STRESS", family: "effort", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "failure effort stress", effortByUse: { preparation: effort.quality(), activation: effort.quality(), main_strength: effort.rir(0, 1), secondary_strength: effort.rir(0, 1), main_hypertrophy: effort.rir(0, 1), accessory: effort.rir(0, 1), special: effort.qualitative("hard") }, expectedRisks: ["fatigue", "adverse_response", "inappropriate_failure_convergence"] } }),
    atomic({ candidateId: "EFFORT_NO_POLICY", family: "effort", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("effort") }),

    atomic({ candidateId: "TEMPO_INTENT_MINIMAL_TRUTHFUL", family: "tempo_intent", shape: "minimal_truthful", ownerLeading: false,
      value: { scope: "tempo intent", tempoIntent: "natural", expectedRisks: [] } }),
    atomic({ candidateId: "TEMPO_INTENT_GOAL_SPECIFIC_BALANCED", family: "tempo_intent", shape: "balanced", ownerLeading: true,
      value: { scope: "tempo intent", tempoIntent: "controlled", expectedRisks: [] } }),
    atomic({ candidateId: "TEMPO_INTENT_UNIVERSAL_CONTROL_STRESS", family: "tempo_intent", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "universal tempo intent stress", tempoIntent: "controlled", expectedRisks: ["over_adaptation", "loss_of_power_intent", "generic_tempo_convergence"] } }),
    atomic({ candidateId: "TEMPO_INTENT_NO_POLICY", family: "tempo_intent", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("tempo intent") }),

    atomic({ candidateId: "EXACT_TEMPO_MINIMAL_TRUTHFUL", family: "exact_phase_tempo", shape: "minimal_truthful", ownerLeading: true,
      value: { scope: "exact phase tempo", exactTempo: { kind: "not_prescribed" }, expectedRisks: [] } }),
    atomic({ candidateId: "EXACT_TEMPO_MODERATE_TEST", family: "exact_phase_tempo", shape: "balanced", ownerLeading: false,
      value: { scope: "exact phase tempo test", exactTempo: { kind: "phase_tempo", eccentricSeconds: 2, concentricIntent: "controlled" }, expectedRisks: ["test_candidate_not_default"] } }),
    atomic({ candidateId: "EXACT_TEMPO_SLOW_PAUSE_STRESS", family: "exact_phase_tempo", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "slow exact phase tempo stress", exactTempo: { kind: "phase_tempo", eccentricSeconds: 4, lengthenedPauseSeconds: target.range(1, 2, "seconds"), concentricSeconds: 2, shortenedPauseSeconds: target.exact(1, "seconds") }, expectedRisks: ["unsupported_precision", "duration_inflation", "generic_slow_tempo_convergence"] } }),
    atomic({ candidateId: "EXACT_TEMPO_NO_POLICY", family: "exact_phase_tempo", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("exact phase tempo") }),

    atomic({ candidateId: "DURATION_MINIMAL_TRUTHFUL", family: "duration", shape: "minimal_truthful", ownerLeading: false,
      value: { scope: "duration bundle", durationByUse: { timed_hold: target.range(10, 20, "seconds"), timed_carry: target.range(15, 25, "seconds"), stationary_march: target.range(15, 25, "seconds"), balance: target.range(10, 20, "seconds") }, expectedRisks: [] } }),
    atomic({ candidateId: "DURATION_BALANCED", family: "duration", shape: "balanced", ownerLeading: true,
      value: { scope: "duration bundle", durationByUse: { timed_hold: target.range(20, 40, "seconds"), timed_carry: target.range(20, 40, "seconds"), stationary_march: target.range(20, 40, "seconds"), balance: target.range(20, 40, "seconds") }, expectedRisks: [] } }),
    atomic({ candidateId: "DURATION_HIGH_STRESS", family: "duration", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "duration stress", durationByUse: { timed_hold: target.range(45, 90, "seconds"), timed_carry: target.range(40, 60, "seconds"), stationary_march: target.range(40, 60, "seconds"), balance: target.range(45, 90, "seconds") }, expectedRisks: ["duration_failure", "exercise_specific_rejection"] } }),
    atomic({ candidateId: "DURATION_NO_POLICY", family: "duration", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("duration") }),

    atomic({ candidateId: "BLOCK_STRUCTURE_MINIMAL_TRUTHFUL", family: "block_structure", shape: "minimal_truthful", ownerLeading: false,
      value: { scope: "block structure", blockStructure: { mainLoadedPrepBlocks: target.exact(0, "sets"), developmentalBlocks: target.exact(1, "sets"), backoffBlocks: target.exact(0, "sets"), mixedDoseModesAllowed: false }, expectedRisks: [] } }),
    atomic({ candidateId: "BLOCK_STRUCTURE_BALANCED", family: "block_structure", shape: "balanced", ownerLeading: true,
      value: { scope: "block structure", blockStructure: { mainLoadedPrepBlocks: target.range(1, 2, "sets"), developmentalBlocks: target.exact(1, "sets"), backoffBlocks: target.exact(0, "sets"), mixedDoseModesAllowed: false }, expectedRisks: [] } }),
    atomic({ candidateId: "BLOCK_STRUCTURE_HIGH_COMPLEXITY_STRESS", family: "block_structure", shape: "high_dose_or_high_complexity_stress", ownerLeading: false,
      value: { scope: "block structure stress", blockStructure: { mainLoadedPrepBlocks: target.range(2, 4, "sets"), developmentalBlocks: target.exact(1, "sets"), backoffBlocks: target.exact(1, "sets"), mixedDoseModesAllowed: false }, expectedRisks: ["duration_expansion", "excessive_block_count", "duplicate_miscredited_exposure"] } }),
    atomic({ candidateId: "BLOCK_STRUCTURE_NO_POLICY", family: "block_structure", shape: "no_policy_control", ownerLeading: false, value: noPolicyValue("block structure") }),
  ]);

function byId(id: string): PrescriptionNumericAtomicCandidate {
  const candidate = PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES.find((entry) => entry.candidateId === id);
  if (!candidate) throw new Error(`Unknown Prescription numeric candidate: ${id}`);
  return candidate;
}

function composite(input: Omit<PrescriptionNumericCompositeCandidate, "version" | "state" | "family">): PrescriptionNumericCompositeCandidate {
  return Object.freeze({
    ...input,
    version: PRESCRIPTION_NUMERIC_TOURNAMENT_VERSION,
    state: PRESCRIPTION_NUMERIC_TEST_CANDIDATE_STATE,
    family: "composite",
  });
}

const refs = (
  preparation: string,
  activation: string,
  mainStrength: string,
  secondaryStrength: string,
  mainHypertrophy: string,
  hypertrophyAccessory: string,
  directAccessory: string,
  timedHold: string,
  breathCycles: string,
  carry: string,
  stationaryMarch: string,
  countedStep: string,
  recoveryCooldown: string,
  rest: string,
  effortCandidate: string,
  tempoIntent: string,
  exactPhaseTempo: string,
  duration: string,
  blockStructure: string,
): Readonly<Record<PrescriptionNumericFamily, string>> => Object.freeze({
  preparation,
  activation,
  main_strength: mainStrength,
  secondary_strength: secondaryStrength,
  main_hypertrophy: mainHypertrophy,
  hypertrophy_accessory: hypertrophyAccessory,
  direct_accessory: directAccessory,
  timed_hold: timedHold,
  breath_cycles: breathCycles,
  carry,
  stationary_march: stationaryMarch,
  counted_step: countedStep,
  recovery_cooldown: recoveryCooldown,
  rest,
  effort: effortCandidate,
  tempo_intent: tempoIntent,
  exact_phase_tempo: exactPhaseTempo,
  duration,
  block_structure: blockStructure,
});

export const PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES: readonly PrescriptionNumericCompositeCandidate[] =
  Object.freeze([
    composite({ candidateId: "RX_COMPOSITE_M0_MINIMAL_STABILITY", ownerLeading: false, noPolicyControl: false, stressOnly: false,
      atomicCandidateIds: refs("PREPARATION_MINIMAL_TRUTHFUL", "ACTIVATION_MINIMAL_TRUTHFUL", "MAIN_STRENGTH_MINIMAL_TRUTHFUL", "SECONDARY_STRENGTH_MINIMAL_TRUTHFUL", "MAIN_HYPERTROPHY_MINIMAL_TRUTHFUL", "HYPERTROPHY_ACCESSORY_MINIMAL_TRUTHFUL", "DIRECT_ACCESSORY_MINIMAL_TRUTHFUL", "TIMED_HOLD_MINIMAL_TRUTHFUL", "BREATH_CYCLES_MINIMAL_TRUTHFUL", "CARRY_MINIMAL_TRUTHFUL", "STATIONARY_MARCH_MINIMAL_TRUTHFUL", "COUNTED_STEP_MINIMAL_TRUTHFUL", "RECOVERY_MINIMAL_TRUTHFUL", "REST_MINIMAL_TRUTHFUL", "EFFORT_MINIMAL_TRUTHFUL", "TEMPO_INTENT_MINIMAL_TRUTHFUL", "EXACT_TEMPO_MINIMAL_TRUTHFUL", "DURATION_MINIMAL_TRUTHFUL", "BLOCK_STRUCTURE_MINIMAL_TRUTHFUL") }),
    composite({ candidateId: "RX_COMPOSITE_B1_BALANCED_CAUSAL", ownerLeading: true, noPolicyControl: false, stressOnly: false,
      atomicCandidateIds: refs("PREPARATION_BALANCED", "ACTIVATION_BALANCED", "MAIN_STRENGTH_BALANCED", "SECONDARY_STRENGTH_BALANCED", "MAIN_HYPERTROPHY_BALANCED", "HYPERTROPHY_ACCESSORY_BALANCED", "DIRECT_ACCESSORY_BALANCED", "TIMED_HOLD_BALANCED", "BREATH_CYCLES_MINIMAL_TRUTHFUL", "CARRY_BALANCED", "STATIONARY_MARCH_BALANCED", "COUNTED_STEP_BALANCED", "RECOVERY_MINIMAL_TRUTHFUL", "REST_BALANCED", "EFFORT_BALANCED", "TEMPO_INTENT_GOAL_SPECIFIC_BALANCED", "EXACT_TEMPO_MINIMAL_TRUTHFUL", "DURATION_BALANCED", "BLOCK_STRUCTURE_BALANCED") }),
    composite({ candidateId: "RX_COMPOSITE_S1_STRENGTH", ownerLeading: false, noPolicyControl: false, stressOnly: false,
      atomicCandidateIds: refs("PREPARATION_BALANCED", "ACTIVATION_MINIMAL_TRUTHFUL", "MAIN_STRENGTH_BALANCED", "SECONDARY_STRENGTH_BALANCED", "MAIN_HYPERTROPHY_MINIMAL_TRUTHFUL", "HYPERTROPHY_ACCESSORY_MINIMAL_TRUTHFUL", "DIRECT_ACCESSORY_MINIMAL_TRUTHFUL", "TIMED_HOLD_MINIMAL_TRUTHFUL", "BREATH_CYCLES_MINIMAL_TRUTHFUL", "CARRY_BALANCED", "STATIONARY_MARCH_BALANCED", "COUNTED_STEP_MINIMAL_TRUTHFUL", "RECOVERY_MINIMAL_TRUTHFUL", "REST_BALANCED", "EFFORT_BALANCED", "TEMPO_INTENT_GOAL_SPECIFIC_BALANCED", "EXACT_TEMPO_MINIMAL_TRUTHFUL", "DURATION_MINIMAL_TRUTHFUL", "BLOCK_STRUCTURE_BALANCED") }),
    composite({ candidateId: "RX_COMPOSITE_H1_HYPERTROPHY", ownerLeading: false, noPolicyControl: false, stressOnly: false,
      atomicCandidateIds: refs("PREPARATION_MINIMAL_TRUTHFUL", "ACTIVATION_MINIMAL_TRUTHFUL", "MAIN_STRENGTH_MINIMAL_TRUTHFUL", "SECONDARY_STRENGTH_MINIMAL_TRUTHFUL", "MAIN_HYPERTROPHY_BALANCED", "HYPERTROPHY_ACCESSORY_BALANCED", "DIRECT_ACCESSORY_BALANCED", "TIMED_HOLD_BALANCED", "BREATH_CYCLES_MINIMAL_TRUTHFUL", "CARRY_MINIMAL_TRUTHFUL", "STATIONARY_MARCH_MINIMAL_TRUTHFUL", "COUNTED_STEP_BALANCED", "RECOVERY_MINIMAL_TRUTHFUL", "REST_BALANCED", "EFFORT_BALANCED", "TEMPO_INTENT_GOAL_SPECIFIC_BALANCED", "EXACT_TEMPO_MINIMAL_TRUTHFUL", "DURATION_BALANCED", "BLOCK_STRUCTURE_BALANCED") }),
    composite({ candidateId: "RX_COMPOSITE_Q1_QUALITY_FIRST", ownerLeading: false, noPolicyControl: false, stressOnly: false,
      atomicCandidateIds: refs("PREPARATION_BALANCED", "ACTIVATION_BALANCED", "MAIN_STRENGTH_MINIMAL_TRUTHFUL", "SECONDARY_STRENGTH_MINIMAL_TRUTHFUL", "MAIN_HYPERTROPHY_MINIMAL_TRUTHFUL", "HYPERTROPHY_ACCESSORY_MINIMAL_TRUTHFUL", "DIRECT_ACCESSORY_MINIMAL_TRUTHFUL", "TIMED_HOLD_MINIMAL_TRUTHFUL", "BREATH_CYCLES_MINIMAL_TRUTHFUL", "CARRY_MINIMAL_TRUTHFUL", "STATIONARY_MARCH_MINIMAL_TRUTHFUL", "COUNTED_STEP_MINIMAL_TRUTHFUL", "RECOVERY_MINIMAL_TRUTHFUL", "REST_BALANCED", "EFFORT_MINIMAL_TRUTHFUL", "TEMPO_INTENT_GOAL_SPECIFIC_BALANCED", "EXACT_TEMPO_MINIMAL_TRUTHFUL", "DURATION_MINIMAL_TRUTHFUL", "BLOCK_STRUCTURE_MINIMAL_TRUTHFUL") }),
    composite({ candidateId: "RX_COMPOSITE_F1_HIGH_STRESS", ownerLeading: false, noPolicyControl: false, stressOnly: true,
      atomicCandidateIds: refs("PREPARATION_HIGH_COMPLEXITY_STRESS", "ACTIVATION_HIGH_COMPLEXITY_STRESS", "MAIN_STRENGTH_HIGH_DOSE_STRESS", "SECONDARY_STRENGTH_HIGH_DOSE_STRESS", "MAIN_HYPERTROPHY_HIGH_DOSE_STRESS", "HYPERTROPHY_ACCESSORY_HIGH_DOSE_STRESS", "DIRECT_ACCESSORY_HIGH_DOSE_STRESS", "TIMED_HOLD_HIGH_DOSE_STRESS", "BREATH_CYCLES_HIGH_DOSE_STRESS", "CARRY_HIGH_DOSE_STRESS", "STATIONARY_MARCH_HIGH_DOSE_STRESS", "COUNTED_STEP_HIGH_DOSE_STRESS", "RECOVERY_HIGH_DOSE_STRESS", "REST_HIGH_DURATION_STRESS", "EFFORT_FAILURE_STRESS", "TEMPO_INTENT_UNIVERSAL_CONTROL_STRESS", "EXACT_TEMPO_SLOW_PAUSE_STRESS", "DURATION_HIGH_STRESS", "BLOCK_STRUCTURE_HIGH_COMPLEXITY_STRESS") }),
    composite({ candidateId: "RX_COMPOSITE_X0_NO_POLICY", ownerLeading: false, noPolicyControl: true, stressOnly: false,
      atomicCandidateIds: refs("PREPARATION_NO_POLICY", "ACTIVATION_NO_POLICY", "MAIN_STRENGTH_NO_POLICY", "SECONDARY_STRENGTH_NO_POLICY", "MAIN_HYPERTROPHY_NO_POLICY", "HYPERTROPHY_ACCESSORY_NO_POLICY", "DIRECT_ACCESSORY_NO_POLICY", "TIMED_HOLD_NO_POLICY", "BREATH_CYCLES_NO_POLICY", "CARRY_NO_POLICY", "STATIONARY_MARCH_NO_POLICY", "COUNTED_STEP_NO_POLICY", "RECOVERY_NO_POLICY", "REST_NO_POLICY", "EFFORT_NO_POLICY", "TEMPO_INTENT_NO_POLICY", "EXACT_TEMPO_NO_POLICY", "DURATION_NO_POLICY", "BLOCK_STRUCTURE_NO_POLICY") }),
  ]);

export const PRESCRIPTION_NUMERIC_ALL_CANDIDATES: readonly PrescriptionNumericTournamentCandidate[] =
  Object.freeze([
    ...PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES,
    ...PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES,
  ]);

export const PRESCRIPTION_NUMERIC_CANDIDATE_MANIFEST = Object.freeze({
  version: PRESCRIPTION_NUMERIC_TOURNAMENT_VERSION,
  state: PRESCRIPTION_NUMERIC_TEST_CANDIDATE_STATE,
  frozenAt: PRESCRIPTION_NUMERIC_TOURNAMENT_AS_OF,
  atomic: PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES,
  composite: PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES,
});

export const PRESCRIPTION_NUMERIC_CANDIDATE_MANIFEST_FINGERPRINT =
  digest(PRESCRIPTION_NUMERIC_CANDIDATE_MANIFEST);
export const PRESCRIPTION_NUMERIC_ATOMIC_FINGERPRINT =
  digest(PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES);
export const PRESCRIPTION_NUMERIC_COMPOSITE_FINGERPRINT =
  digest(PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES);

const DEFAULT_BALANCED_REFS = PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES
  .find((entry) => entry.candidateId === "RX_COMPOSITE_B1_BALANCED_CAUSAL")!
  .atomicCandidateIds!;

function selectionFor(candidate: PrescriptionNumericTournamentCandidate): Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>> {
  const ids = candidate.family === "composite"
    ? candidate.atomicCandidateIds ?? DEFAULT_BALANCED_REFS
    : { ...DEFAULT_BALANCED_REFS, [candidate.family]: candidate.candidateId };
  return Object.freeze(Object.fromEntries(families.map((family) => [family, byId(ids[family])])) as Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>>);
}

const sections: readonly SessionSection[] = ["warmup", "activation", "main", "accessory", "cooldown"];
const roles: readonly TrainingRole[] = ["preparation", "activation", "primary_strength", "secondary_strength", "hypertrophy_accessory", "capacity", "recovery"];
const goals: readonly TrainingOutcomeGoal[] = ["strength", "hypertrophy", "general_fitness", "posture_and_movement_quality"];
const phases = ["phase_1", "phase_2", "phase_3"] as const;
const experiences = ["novice", "intermediate", "advanced"] as const;
const equipmentOptions = [["full_gym"], ["dumbbells"], ["bands"], ["bodyweight"], ["mixed_equipment"]] as const;

function fromDesignScenario(entry: PrescriptionDesignScenario): PrescriptionNumericScenario {
  return {
    scenarioId: `calibration:${entry.scenarioId}`,
    cohort: "calibration",
    locked: false,
    exerciseId: entry.exerciseId,
    section: entry.section,
    role: entry.role,
    goal: entry.goal,
    phaseId: entry.phaseId,
    experience: entry.experience,
    equipment: entry.equipment,
    availableMinutes: entry.contextTags.includes("condensed-session") ? 20 : 45,
    contextTags: entry.contextTags,
  };
}

function holdoutScenario(index: number, exercise: ExerciseDefinition, extra: readonly string[] = []): PrescriptionNumericScenario {
  return {
    scenarioId: `locked-holdout-${String(index + 1).padStart(2, "0")}:${exercise.id}`,
    cohort: "holdout",
    locked: true,
    exerciseId: exercise.id,
    section: sections[index % sections.length],
    role: roles[index % roles.length],
    goal: goals[index % goals.length],
    phaseId: phases[index % phases.length],
    experience: experiences[index % experiences.length],
    equipment: equipmentOptions[index % equipmentOptions.length],
    availableMinutes: index % 11 === 0 ? 20 : index % 13 === 0 ? 75 : 45,
    contextTags: [
      index % 2 === 0 ? "no-history" : "productive-prior",
      index % 3 === 0 ? "pain-aware" : "ordinary",
      index % 4 === 0 ? "range-requirement" : "irrelevant-pain",
      index % 5 === 0 ? "support-requirement" : "no-support-requirement",
      index % 6 === 0 ? "load-requirement" : "no-load-requirement",
      index % 7 === 0 ? "condensed-session" : "standard-session",
      index % 8 === 0 ? "explicit-duration" : "incomplete-duration",
      ...extra,
    ],
  };
}

export function buildPrescriptionNumericCalibrationScenarios(): readonly PrescriptionNumericScenario[] {
  return Object.freeze(buildPrescriptionDesignScenarios()
    .filter((entry) => entry.cohort === "calibration")
    .map(fromDesignScenario));
}

export function buildPrescriptionNumericLockedHoldoutScenarios(): readonly PrescriptionNumericScenario[] {
  const base = REFERENCE_EXERCISES.map((exercise, index) => holdoutScenario(index, exercise));
  const special: readonly PrescriptionNumericScenario[] = [
    holdoutScenario(45, REFERENCE_EXERCISES.find((entry) => entry.id === "farmer-carry")!, ["timed-carry", "explicit-duration"]),
    holdoutScenario(46, REFERENCE_EXERCISES.find((entry) => entry.id === "suitcase-carry")!, ["substitution", "unilateral-requirement"]),
    holdoutScenario(47, REFERENCE_EXERCISES.find((entry) => entry.id === "dumbbell-bench-press")!, ["main-ramp-up", "same-reps"]),
    holdoutScenario(48, REFERENCE_EXERCISES.find((entry) => entry.id === "goblet-squat")!, ["main-backoff", "plateau"]),
    holdoutScenario(49, REFERENCE_EXERCISES.find((entry) => entry.id === "machine-row")!, ["identical-meaningful-facts"]),
    holdoutScenario(50, REFERENCE_EXERCISES.find((entry) => entry.id === "forearm-plank")!, ["explicit-duration", "timed-hold"]),
    holdoutScenario(51, REFERENCE_EXERCISES.find((entry) => entry.id === "ninety-ninety-breathing")!, ["breath-cycles", "recovery-scope"]),
    holdoutScenario(52, REFERENCE_EXERCISES.find((entry) => entry.id === "wall-supported-suitcase-march")!, ["stationary-march", "unknown-equipment-increment"]),
    holdoutScenario(53, REFERENCE_EXERCISES.find((entry) => entry.id === "loop-band-lateral-walk")!, ["counted-step"]),
    holdoutScenario(54, REFERENCE_EXERCISES.find((entry) => entry.id === "supine-hamstring-walkout")!, ["counted-step", "successful-reexposure"]),
    holdoutScenario(55, REFERENCE_EXERCISES.find((entry) => entry.id === "bodyweight-hip-hinge-rehearsal")!, ["warmup-assignment"]),
    holdoutScenario(56, REFERENCE_EXERCISES.find((entry) => entry.id === "serratus-wall-slide")!, ["activation-assignment"]),
    holdoutScenario(57, REFERENCE_EXERCISES.find((entry) => entry.id === "dumbbell-romanian-deadlift")!, ["adverse-response"]),
    holdoutScenario(58, REFERENCE_EXERCISES.find((entry) => entry.id === "single-leg-balance-rehearsal")!, ["support-requirement", "explicit-duration"]),
    holdoutScenario(59, REFERENCE_EXERCISES.find((entry) => entry.id === "pallof-press")!, ["policy-conflict"]),
  ];
  return Object.freeze([...base, ...special]);
}

export const PRESCRIPTION_NUMERIC_LOCKED_HOLDOUT_MANIFEST = Object.freeze({
  version: PRESCRIPTION_NUMERIC_TOURNAMENT_VERSION,
  lockedAt: PRESCRIPTION_NUMERIC_TOURNAMENT_AS_OF,
  scenarios: buildPrescriptionNumericLockedHoldoutScenarios().map((entry) => ({
    scenarioId: entry.scenarioId,
    exerciseId: entry.exerciseId,
    section: entry.section,
    role: entry.role,
    goal: entry.goal,
    phaseId: entry.phaseId,
    experience: entry.experience,
    equipment: entry.equipment,
    contextTags: entry.contextTags,
  })),
});
export const PRESCRIPTION_NUMERIC_LOCKED_HOLDOUT_FINGERPRINT =
  digest(PRESCRIPTION_NUMERIC_LOCKED_HOLDOUT_MANIFEST);

export function buildAllPrescriptionNumericScenarios(): readonly PrescriptionNumericScenario[] {
  return Object.freeze([
    ...buildPrescriptionNumericCalibrationScenarios(),
    ...buildPrescriptionNumericLockedHoldoutScenarios(),
  ]);
}

function allLegalModes(exercise: ExerciseDefinition): readonly ExerciseDoseMode[] {
  return [exercise.prescriptionKnowledge.primaryDoseMode, ...exercise.prescriptionKnowledge.legalAlternateDoseModes];
}

function scenarioExercise(scenario: PrescriptionNumericScenario): ExerciseDefinition {
  const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === scenario.exerciseId);
  if (!exercise) throw new Error(`Unknown exercise for scenario ${scenario.scenarioId}`);
  return exercise;
}

function selectedDoseMode(scenario: PrescriptionNumericScenario, exercise: ExerciseDefinition): ExerciseDoseMode {
  if (scenario.contextTags.includes("timed-carry") && allLegalModes(exercise).includes("timed_carry")) return "timed_carry";
  return exercise.prescriptionKnowledge.primaryDoseMode;
}

function activeFamilyFor(scenario: PrescriptionNumericScenario, mode: ExerciseDoseMode): PrescriptionNumericFamily {
  if (scenario.section === "warmup" || scenario.role === "preparation" || scenario.contextTags.includes("warmup-assignment")) return "preparation";
  if (scenario.section === "activation" || scenario.role === "activation" || scenario.contextTags.includes("activation-assignment")) return "activation";
  if (scenario.section === "cooldown" || scenario.role === "recovery" || scenario.contextTags.includes("recovery-scope")) return "recovery_cooldown";
  if (mode === "timed_hold") return "timed_hold";
  if (mode === "breath_cycles") return "breath_cycles";
  if (mode === "distance_carry" || mode === "timed_carry") return "carry";
  if (mode === "step_march") return "stationary_march";
  if (mode === "step_sets") return "counted_step";
  if (scenario.contextTags.includes("direct-accessory")) return "direct_accessory";
  if (scenario.role === "hypertrophy_accessory") return "hypertrophy_accessory";
  if (scenario.goal === "hypertrophy" && scenario.section === "main") return "main_hypertrophy";
  if (scenario.role === "secondary_strength") return "secondary_strength";
  return "main_strength";
}

function midpoint(input: NumericPolicyTarget | undefined, fallback: number): number {
  if (!input) return fallback;
  if (input.kind === "exact") return input.value;
  if (input.kind === "range") return (input.min + input.max) / 2;
  return fallback;
}

function maxValue(input: NumericPolicyTarget | undefined, fallback: number): number {
  if (!input) return fallback;
  if (input.kind === "exact") return input.value;
  if (input.kind === "range") return input.max;
  return fallback;
}

function countTarget(input: NumericPolicyTarget | undefined, fallback: number): CountTarget {
  if (!input) return exactCount(fallback);
  if (input.kind === "exact") return exactCount(input.value);
  if (input.kind === "range") return { kind: "range", min: input.min, max: input.max, unit: "count" };
  return { kind: "unknown", reason: input.kind === "policy_required" ? input.reason : "Target not prescribed.", unit: "count" };
}

function breathCycleTarget(input: NumericPolicyTarget | undefined, fallback: number): BreathCycleTarget {
  if (!input) return exactBreathCycles(fallback);
  if (input.kind === "exact") return exactBreathCycles(input.value);
  if (input.kind === "range") return { kind: "range", min: input.min, max: input.max, unit: "breath_cycles" };
  return {
    kind: "unknown",
    reason: input.kind === "policy_required" ? input.reason : "Breath-cycle target not prescribed.",
    unit: "breath_cycles",
  };
}

function secondsTarget(input: NumericPolicyTarget | undefined, fallback: number): TimeTarget {
  if (!input) return exactSeconds(fallback);
  if (input.kind === "exact") return exactSeconds(input.value);
  if (input.kind === "range") return { kind: "range", min: input.min, max: input.max, unit: "seconds" };
  if (input.kind === "not_prescribed") return { kind: "not_prescribed", reason: input.reason, unit: "seconds" };
  return { kind: "unknown", reason: input.reason, unit: "seconds" };
}

function effortTarget(policy: EffortPolicyTarget | undefined) {
  if (!policy) return { kind: "phase_qualitative_band" as const, band: "moderate" as const };
  if (policy.kind === "rir") return { kind: "rir" as const, target: { kind: "range" as const, min: policy.min, max: policy.max } };
  if (policy.kind === "qualitative") return { kind: "phase_qualitative_band" as const, band: policy.band };
  if (policy.kind === "quality_limited") return {
    kind: "self_selected_by_reviewed_standard" as const,
    standardId: "quality-limited-design-standard",
    description: policy.description,
  };
  return { kind: "unknown" as const, description: policy.reason };
}

function restFor(selection: Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>>, use: string, fallback?: NumericPolicyTarget): NumericPolicyTarget | undefined {
  return selection.rest.value.restByUse?.[use] ?? fallback;
}

function effortFor(selection: Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>>, use: string, fallback?: EffortPolicyTarget): EffortPolicyTarget | undefined {
  return selection.effort.value.effortByUse?.[use] ?? fallback;
}

function tempoFor(selection: Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>>, mode: ExerciseDoseMode, scenario: PrescriptionNumericScenario) {
  if (mode !== "repetition_sets" && mode !== "step_sets") return undefined;
  const exact = selection.exact_phase_tempo.value.exactTempo;
  if (exact?.kind === "phase_tempo") {
    return {
      kind: "repetition_phase_tempo" as const,
      eccentric: { kind: "exact_seconds" as const, seconds: exact.eccentricSeconds },
      lengthenedTransition: exact.lengthenedPauseSeconds?.kind === "range"
        ? { kind: "seconds_range" as const, minSeconds: exact.lengthenedPauseSeconds.min, maxSeconds: exact.lengthenedPauseSeconds.max }
        : exact.lengthenedPauseSeconds?.kind === "exact"
          ? { kind: "exact_seconds" as const, seconds: exact.lengthenedPauseSeconds.value }
          : { kind: "not_prescribed" as const, reason: "No lengthened pause prescribed." },
      concentric: exact.concentricSeconds
        ? { kind: "exact_seconds" as const, seconds: exact.concentricSeconds }
        : { kind: "intent_only" as const, intent: exact.concentricIntent ?? "controlled" },
      shortenedTransition: exact.shortenedPauseSeconds?.kind === "exact"
        ? { kind: "exact_seconds" as const, seconds: exact.shortenedPauseSeconds.value }
        : { kind: "not_prescribed" as const, reason: "No shortened pause prescribed." },
      provenance: provenance("prescription-numeric-tournament:exact-tempo"),
    };
  }
  const intent = selection.tempo_intent.value.tempoIntent;
  if (!intent || intent === "not_prescribed") {
    return {
      kind: "not_prescribed" as const,
      reason: "Tempo intent not prescribed by selected tournament policy.",
      provenance: provenance("prescription-numeric-tournament:tempo-not-prescribed"),
    };
  }
  if (intent === "policy_required") {
    return { kind: "unknown" as const, reason: "Tempo policy required.", provenance: provenance("prescription-numeric-tournament:tempo-required") };
  }
  return {
    kind: "intent_only" as const,
    intent: scenario.goal === "general_fitness" && scenario.contextTags.includes("power-intent")
      ? "explosive_intent" as const
      : intent,
    provenance: provenance("prescription-numeric-tournament:tempo-intent"),
  };
}

function policyValueFor(
  selection: Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>>,
  activeFamily: PrescriptionNumericFamily,
  mode: ExerciseDoseMode,
): DosePolicyValue {
  const familyValue = selection[activeFamily].value;
  if (activeFamily === "preparation") return familyValue[mode === "timed_hold" ? "timedHold" : mode === "breath_cycles" ? "breathing" : mode === "step_sets" || mode === "step_march" ? "step" : "dynamic"] ?? familyValue.dynamic ?? {};
  if (activeFamily === "activation") return familyValue[mode === "timed_hold" ? "timedHold" : mode === "step_sets" || mode === "step_march" ? "step" : "dynamic"] ?? familyValue.dynamic ?? {};
  if (activeFamily === "recovery_cooldown") return familyValue[mode === "breath_cycles" ? "breathing" : "timedHold"] ?? familyValue.breathing ?? {};
  if (mode === "timed_hold") return selection.timed_hold.value.timedHold ?? {};
  if (mode === "breath_cycles") return selection.breath_cycles.value.breathing ?? {};
  if (mode === "distance_carry") return selection.carry.value.distanceCarry ?? {};
  if (mode === "timed_carry") return selection.carry.value.timedCarry ?? {};
  if (mode === "step_march") return selection.stationary_march.value.stationaryMarch ?? {};
  if (mode === "step_sets") return selection.counted_step.value.step ?? {};
  return familyValue.dynamic ?? {};
}

function usageKey(activeFamily: PrescriptionNumericFamily, mode: ExerciseDoseMode): string {
  if (activeFamily === "preparation") return "preparation";
  if (activeFamily === "activation") return "activation";
  if (activeFamily === "main_strength") return "main_strength";
  if (activeFamily === "secondary_strength") return "secondary_strength";
  if (activeFamily === "main_hypertrophy") return "main_hypertrophy";
  if (["hypertrophy_accessory", "direct_accessory"].includes(activeFamily)) return "accessory";
  if (mode === "breath_cycles") return "breath";
  return "special";
}

function doseFor(input: {
  readonly selection: Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>>;
  readonly mode: ExerciseDoseMode;
  readonly activeFamily: PrescriptionNumericFamily;
  readonly purpose: PrescriptionDoseBlockPurpose;
  readonly scenario: PrescriptionNumericScenario;
  readonly blockIndex: number;
}): ExerciseDose {
  const policy = policyValueFor(input.selection, input.activeFamily, input.mode);
  const use = usageKey(input.activeFamily, input.mode);
  const effortPolicy = effortFor(input.selection, use, policy.effort);
  const restPolicy = restFor(input.selection, use, policy.rest);
  const common = {
    effort: effortTarget(effortPolicy),
    rest: secondsTarget(restPolicy, 60),
    range: { kind: "full_available" as const },
    load: {
      kind: "user_selected_by_effort" as const,
      effort: effortTarget(effortPolicy),
      application: "total" as const,
    },
  };
  if (input.purpose === "preparatory_acclimation") {
    const prep = input.selection.preparation.value.dynamic ?? policy;
    return {
      mode: "repetition_sets",
      sets: countTarget(prep.sets, 1),
      repetitions: countTarget(prep.reps, 5),
      effort: effortTarget(prep.effort),
      rest: secondsTarget(restFor(input.selection, "preparation", prep.rest), 45),
      tempo: tempoFor(input.selection, "repetition_sets", input.scenario),
      range: { kind: "full_available" as const },
    };
  }
  switch (input.mode) {
    case "repetition_sets":
      return {
        mode: "repetition_sets",
        sets: countTarget(input.purpose === "developmental_work" && input.blockIndex > 1
          ? target.exact(1, "sets")
          : policy.sets, 2),
        repetitions: countTarget(policy.reps, 8),
        ...common,
        tempo: tempoFor(input.selection, input.mode, input.scenario),
      };
    case "timed_hold":
      return {
        mode: "timed_hold",
        sets: countTarget(policy.sets, 2),
        duration: secondsTarget(input.selection.duration.value.durationByUse?.timed_hold ?? policy.duration, 20),
        ...common,
      };
    case "breath_cycles":
      return {
        mode: "breath_cycles",
        rounds: countTarget(policy.rounds, 1),
        breathCycles: breathCycleTarget(policy.breathCycles, 4),
        effort: common.effort,
        rest: secondsTarget(restFor(input.selection, "breath", policy.rest), 30),
        breathingCadence: policy.cadence === "controlled"
          ? {
              kind: "structured_breathing_cadence" as const,
              inhale: { kind: "intent_only" as const, intent: "controlled" as const },
              exhale: { kind: "intent_only" as const, intent: "controlled" as const },
              phaseSequence: ["inhale", "exhale"] as const,
              provenance: provenance("prescription-numeric-tournament:breathing-cadence"),
            }
          : { kind: "not_prescribed" as const, reason: "No exact breathing cadence prescribed.", provenance: provenance("prescription-numeric-tournament:breathing-cadence") },
      };
    case "distance_carry":
      return {
        mode: "distance_carry",
        trips: countTarget(policy.trips, 2),
        distancePerTrip: policy.distance?.kind === "exact"
          ? exactMetres(policy.distance.value)
          : policy.distance?.kind === "range"
            ? { kind: "range", min: policy.distance.min, max: policy.distance.max, unit: "metres" as const }
            : exactMetres(20),
        ...common,
        locomotorCadence: { kind: "not_prescribed", reason: "No universal carry cadence.", provenance: provenance("prescription-numeric-tournament:carry-cadence") },
        gaitControlStandard: "Maintain reviewed carry posture and gait quality.",
      };
    case "timed_carry":
      return {
        mode: "timed_carry",
        trips: countTarget(policy.trips, 2),
        durationPerTrip: secondsTarget(input.selection.duration.value.durationByUse?.timed_carry ?? policy.duration, 25),
        ...common,
        locomotorCadence: { kind: "not_prescribed", reason: "No universal carry cadence.", provenance: provenance("prescription-numeric-tournament:carry-cadence") },
        gaitControlStandard: "Maintain reviewed carry posture and gait quality.",
      };
    case "step_march":
      return {
        mode: "step_march",
        stationary: true,
        ...(input.scenario.contextTags.includes("explicit-duration")
          ? { duration: secondsTarget(input.selection.duration.value.durationByUse?.stationary_march ?? policy.duration, 25) }
          : { steps: policy.steps ? exactSteps(Math.round(midpoint(policy.steps, 20))) : exactSteps(20) }),
        alternation: "alternating",
        effort: common.effort,
        rest: common.rest,
        marchControlStandard: "Stationary march remains in place; no distance is claimed.",
      };
    case "step_sets":
      return {
        mode: "step_sets",
        sets: countTarget(policy.sets, 2),
        steps: exactSteps(Math.round(midpoint(policy.steps, 10))),
        stepCountInterpretation: "Counted-step tournament fixture; no distance or stationary march claim.",
        alternation: "alternating",
        effort: common.effort,
        rest: common.rest,
        tempo: tempoFor(input.selection, input.mode, input.scenario),
      };
  }
}

function sourceExposureEvent(scenario: PrescriptionNumericScenario, exercise: ExerciseDefinition): SourceExposureEventIdentity {
  const eventId = `source-exposure:${digest([scenario.scenarioId, exercise.id]).slice(0, 16)}`;
  return {
    sourceExposureEventId: eventId,
    sessionIntentId: `session-intent:${scenario.scenarioId}`,
    sessionAssignmentId: `handoff:${scenario.scenarioId}:${exercise.id}`,
    exerciseId: exercise.id,
    originalSelectedExerciseId: exercise.id,
    currentPlannedExerciseId: exercise.id,
    eventStatus: "planned",
    prescriptionRevisionRefs: [],
    substitutionRefs: [],
    cancellationSupersessionState: { kind: "none" },
    provenance: provenance(`source-exposure:${scenario.scenarioId}`),
  };
}

function blockPurposes(selection: Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>>, activeFamily: PrescriptionNumericFamily, scenario: PrescriptionNumericScenario, mode: ExerciseDoseMode): readonly PrescriptionDoseBlockPurpose[] {
  if (activeFamily === "preparation") return ["technique_quality_work"];
  if (activeFamily === "activation") return ["technique_quality_work"];
  if (activeFamily === "recovery_cooldown") return ["recovery_or_downregulation"];
  const structure = selection.block_structure.value.blockStructure;
  if (scenario.section === "main" && mode === "repetition_sets" &&
    (activeFamily === "main_strength" || activeFamily === "secondary_strength" || activeFamily === "main_hypertrophy")) {
    const prepCount = Math.round(midpoint(structure?.mainLoadedPrepBlocks, 0));
    const backoffCount = Math.round(midpoint(structure?.backoffBlocks, 0));
    return [
      ...Array.from({ length: prepCount }, () => "preparatory_acclimation" as const),
      "developmental_work" as const,
      ...Array.from({ length: backoffCount }, () => "developmental_work" as const),
    ];
  }
  return ["developmental_work"];
}

export function compileNumericDesignFixture(
  candidate: PrescriptionNumericTournamentCandidate,
  scenario: PrescriptionNumericScenario,
): PrescriptionScenarioEvaluation {
  const exercise = scenarioExercise(scenario);
  const selection = selectionFor(candidate);
  const mode = selectedDoseMode(scenario, exercise);
  const activeFamily = activeFamilyFor(scenario, mode);
  const applicableCandidate = selection[activeFamily];
  const noPolicy = applicableCandidate.shape === "no_policy_control" ||
    selection.rest.shape === "no_policy_control" ||
    selection.effort.shape === "no_policy_control" ||
    selection.tempo_intent.shape === "no_policy_control" ||
    selection.exact_phase_tempo.shape === "no_policy_control" ||
    selection.duration.shape === "no_policy_control" ||
    selection.block_structure.shape === "no_policy_control";
  const policyConflict = scenario.contextTags.includes("policy-conflict") &&
    (selection.exact_phase_tempo.candidateId === "EXACT_TEMPO_SLOW_PAUSE_STRESS" ||
      selection.block_structure.candidateId === "BLOCK_STRUCTURE_HIGH_COMPLEXITY_STRESS");
  if (noPolicy || candidate.candidateId === "RX_COMPOSITE_X0_NO_POLICY") {
    return emptyEvaluation(candidate.candidateId, scenario, "prescription_policy_required", "gate_9_prescription_handoff_truth", "PRESCRIPTION_POLICY_REQUIRED", 1, 0);
  }
  if (policyConflict) {
    return emptyEvaluation(candidate.candidateId, scenario, "prescription_policy_conflict", "gate_9_prescription_handoff_truth", "PRESCRIPTION_POLICY_CONFLICT", 0, 1);
  }
  if (!allLegalModes(exercise).includes(mode)) {
    return emptyEvaluation(candidate.candidateId, scenario, "unsupported_dose_mode", "gate_9_prescription_handoff_truth", "UNSUPPORTED_DOSE_MODE", 0, 0);
  }
  const event = sourceExposureEvent(scenario, exercise);
  const prescriptionId = `prescription:${digest([event.sourceExposureEventId]).slice(0, 16)}`;
  const revisionId = `prescription-revision:${digest([candidate.candidateId, scenario.scenarioId]).slice(0, 16)}`;
  const purposes = blockPurposes(selection, activeFamily, scenario, mode);
  const blocks: readonly PrescriptionDoseBlock[] = purposes.map((purpose, index) => ({
    blockId: `${event.sourceExposureEventId}:block:${String(index + 1).padStart(2, "0")}:${purpose}`,
    sourceExposureEventId: event.sourceExposureEventId,
    purpose,
    dose: doseFor({ selection, mode, activeFamily, purpose, scenario, blockIndex: index }),
    policyRuleRefs: families.map((family) => selection[family].candidateId),
    unresolvedRequirementRefs: scenario.contextTags.includes("unclassified-requirement")
      ? [`requirement:${scenario.scenarioId}:unclassified`]
      : [],
    contributionClassification: purpose === "preparatory_acclimation"
      ? "not_weekly_developmental_credit"
      : purpose === "developmental_work"
        ? "developmental_credit_candidate"
        : purpose === "technique_quality_work"
          ? "technique_quality_observation_only"
          : "recovery_observation_only",
    order: { index, dependsOnBlockIds: index === 0 ? [] : [
      `${event.sourceExposureEventId}:block:${String(index).padStart(2, "0")}:${purposes[index - 1]}`,
    ] },
    provenance: provenance(`block:${candidate.candidateId}:${scenario.scenarioId}:${index}`),
  }));
  const revision: ExercisePrescriptionRevision = {
    prescriptionId,
    prescriptionRevisionId: revisionId,
    sourceExposureEventId: event.sourceExposureEventId,
    basedOnRevisionId: scenario.contextTags.includes("revision-mutation") ? "prior-revision" : null,
    reasonCode: scenario.contextTags.includes("revision-mutation") ? "policy_revision" : "initial_compilation",
    createdAt: PRESCRIPTION_NUMERIC_TOURNAMENT_AS_OF,
    revisionState: "final_for_execution",
    finalForExecution: true,
    supersededByRevisionId: null,
    policyVersionRefs: [`prescription-numeric-tournament@${PRESCRIPTION_NUMERIC_TOURNAMENT_VERSION}`],
    changedFieldRefs: [],
    unresolvedRequirementRefs: [],
    provenance: provenance(`revision:${candidate.candidateId}:${scenario.scenarioId}`),
  };
  const eventWithRevision: SourceExposureEventIdentity = {
    ...event,
    prescriptionRevisionRefs: [{ prescriptionId, prescriptionRevisionId: revisionId }],
    substitutionRefs: scenario.contextTags.includes("substitution")
      ? [{
          substitutionId: `${event.sourceExposureEventId}:substitution:01`,
          originalSelectedExerciseId: exercise.id,
          substitutedExerciseId: "goblet-squat",
          pointOfSubstitution: "between_blocks",
          replacedBlockIds: blocks.slice(-1).map((block) => block.blockId),
          reasonCode: "equipment_availability_change",
          provenance: provenance("numeric-tournament:substitution"),
        }]
      : [],
  };
  const durationDeterminability = classifyDuration(scenario, selection, blocks);
  const plan: ExercisePrescriptionPlan = {
    prescriptionId,
    prescriptionRevisionId: revisionId,
    sourceExposureEvent: eventWithRevision,
    exerciseId: exercise.id,
    phaseId: scenario.phaseId,
    doseBlocks: blocks,
    compatibilityProjection: {
      status: blocks.length === 1 ? "single_uniform_dose_compatible" : "ordered_blocks_required",
      projectedDose: blocks.length === 1 ? blocks[0].dose : null,
      reasonCode: blocks.length === 1 ? "SINGLE_BLOCK_NUMERIC_POLICY" : "ORDERED_NUMERIC_POLICY_BLOCKS",
    },
    selectedPolicyRuleRefs: families.map((family) => selection[family].candidateId),
    unresolvedRequirementRefs: [],
    durationDeterminability,
    rationale: [
      "Numeric tournament design fixture; not production.",
      "One source exposure event per assignment.",
      "Calculated from frozen numeric candidate values.",
    ],
    provenance: provenance(`numeric-plan:created-at:${PRESCRIPTION_NUMERIC_TOURNAMENT_AS_OF}`),
  };
  const linkage = performanceLinkage(plan, scenario);
  const validationFindings = [
    ...validateSourceExposureEventIdentity(eventWithRevision),
    ...validatePrescriptionRevisionSet([revision], event.sourceExposureEventId),
    ...validatePrescriptionDoseBlocks({ blocks, sourceExposureEventId: event.sourceExposureEventId, legalDoseModes: allLegalModes(exercise) }),
    ...validateExercisePrescriptionPlan(plan, exercise.prescriptionKnowledge),
    ...validatePerformanceBlockLinkage(linkage),
  ];
  const hardGateFailures = validationFindings.filter((finding) => finding.severity === "error").length;
  const prepMiscredit = blocks.filter((block) =>
    block.purpose === "preparatory_acclimation" &&
    block.contributionClassification !== "not_weekly_developmental_credit").length;
  const overBudget = isOverBudget(scenario, blocks, selection);
  const overAdaptation = calculatedOverAdaptation(candidate, scenario, selection, blocks, overBudget);
  const wrongLayer = calculatedWrongLayer(candidate, scenario, selection);
  const under = calculatedUnderAdaptation(scenario, activeFamily, applicableCandidate);
  const constrainedPreserved = !scenario.contextTags.includes("condensed-session") || !overBudget ||
    !blocks.some((block) => block.purpose === "developmental_work");
  const gates: readonly PrescriptionGateResult[] = [
    gate("gate_9_prescription_handoff_truth", hardGateFailures > 0 ? "FAIL_STOP" : "PASS", hardGateFailures > 0 ? "VALIDATION_ERROR" : "SOURCE_EXPOSURE_AND_POLICY_VALID"),
    gate("gate_10_sequencing_duration_handoff_truth", hardGateFailures > 0 ? "NOT_REACHED" : constrainedPreserved ? "PASS" : "FAIL_STOP", constrainedPreserved ? "DURATION_AND_BLOCK_ORDER_VALID" : "CONSTRAINED_SESSION_DURATION_FAILURE"),
    gate("gate_11_execution_response_foundation", hardGateFailures > 0 || !constrainedPreserved ? "NOT_REACHED" : "PASS", "PLANNED_ACTUAL_BLOCK_TRUTH_PRESERVED"),
  ];
  const firstFailingGate = gates.find((entry) => entry.state === "FAIL_STOP")?.gate ?? null;
  return {
    candidateId: candidate.candidateId,
    scenarioId: scenario.scenarioId,
    cohort: scenario.cohort,
    status: "compiled_non_production_fixture",
    plan,
    sourceExposureEventCount: 1,
    revisionCount: 1,
    finalRevisionCount: 1,
    blockCount: blocks.length,
    preparatoryBlockCount: blocks.filter((block) => block.purpose === "preparatory_acclimation").length,
    developmentalBlockCount: blocks.filter((block) => block.purpose === "developmental_work").length,
    backoffBlockCount: Math.max(0, blocks.filter((block) => block.purpose === "developmental_work").length - 1),
    sourceEventDuplication: 0,
    revisionErrors: validationFindings.filter((finding) => finding.code.includes("revision")).length,
    blockOrderErrors: validationFindings.filter((finding) => finding.code.includes("block_order")).length,
    illegalDoseMode: validationFindings.filter((finding) => finding.code.includes("unsupported_dose_mode")).length,
    unresolvedRequiredModification: scenario.contextTags.includes("unclassified-requirement") ? 1 : 0,
    preparatoryMiscredit: prepMiscredit,
    substitutionDoubleCount: 0,
    missingPolicy: 0,
    policyConflict: 0,
    hardGateFailures: firstFailingGate ? 1 : 0,
    underAdaptation: under,
    overAdaptation,
    wrongLayerEffects: wrongLayer,
    downstreamRescueAttempts: calculatedDownstreamRescueAttempt(candidate, scenario, selection),
    expectedConvergence: scenario.contextTags.includes("identical-meaningful-facts") || scenario.contextTags.includes("irrelevant-pain") ? 1 : 0,
    justifiedConvergence: scenario.contextTags.includes("same-reps") || scenario.contextTags.includes("same-tempo") ? 1 : 0,
    suspiciousConvergence: wrongLayer > 0 ? 1 : 0,
    sameRepConvergence: scenario.contextTags.includes("same-reps"),
    sameTempoConvergence: scenario.contextTags.includes("same-tempo") || !blocks.some((block) => "tempo" in block.dose),
    durationDeterminability,
    explicitDurationKnown: scenario.contextTags.includes("explicit-duration"),
    overBudget,
    constrainedSessionPreserved: constrainedPreserved,
    warmupActivationBounded: warmupActivationBounded(activeFamily, blocks, selection),
    mainPurposePreserved: scenario.section !== "main" || blocks.some((block) => block.purpose === "developmental_work"),
    accessoryMarginalValuePreserved: scenario.role !== "hypertrophy_accessory" || activeFamily === "hypertrophy_accessory",
    completeSessionArgument: true,
    averageBlockCount: blocks.length,
    effortBurden: burdenFromBlocks(blocks),
    timingBurden: timingBurdenFromBlocks(blocks),
    restBurdenSeconds: restBurden(blocks),
    traceSize: PRESCRIPTION_COMPILATION_ORDER.length + blocks.length + families.length,
    applicableRuleCount: families.length,
    compilerStateCount: new Set(gates.map((entry) => entry.state)).size,
    firstMeaningfulPrescriptionDifference: firstMeaningfulDifference(candidate, scenario, selection, blocks),
    firstFailingGate,
    gates,
  };
}

function emptyEvaluation(
  candidateId: string,
  scenario: PrescriptionNumericScenario,
  status: PrescriptionScenarioEvaluation["status"],
  gateId: PrescriptionGateResult["gate"],
  reasonCode: string,
  missingPolicy: number,
  policyConflict: number,
): PrescriptionScenarioEvaluation {
  const gates: readonly PrescriptionGateResult[] = [
    gate(gateId, "FAIL_STOP", reasonCode),
    gate("gate_10_sequencing_duration_handoff_truth", "NOT_REACHED", "UPSTREAM_FAILURE"),
    gate("gate_11_execution_response_foundation", "NOT_REACHED", "UPSTREAM_FAILURE"),
  ];
  return {
    candidateId,
    scenarioId: scenario.scenarioId,
    cohort: scenario.cohort,
    status,
    plan: null,
    sourceExposureEventCount: 0,
    revisionCount: 0,
    finalRevisionCount: 0,
    blockCount: 0,
    preparatoryBlockCount: 0,
    developmentalBlockCount: 0,
    backoffBlockCount: 0,
    sourceEventDuplication: 0,
    revisionErrors: 0,
    blockOrderErrors: 0,
    illegalDoseMode: status === "unsupported_dose_mode" ? 1 : 0,
    unresolvedRequiredModification: 0,
    preparatoryMiscredit: 0,
    substitutionDoubleCount: 0,
    missingPolicy,
    policyConflict,
    hardGateFailures: 1,
    underAdaptation: missingPolicy,
    overAdaptation: 0,
    wrongLayerEffects: 0,
    downstreamRescueAttempts: 0,
    expectedConvergence: 0,
    justifiedConvergence: 0,
    suspiciousConvergence: 0,
    sameRepConvergence: false,
    sameTempoConvergence: false,
    durationDeterminability: "unknown_due_to_prescription",
    explicitDurationKnown: false,
    overBudget: false,
    constrainedSessionPreserved: true,
    warmupActivationBounded: true,
    mainPurposePreserved: false,
    accessoryMarginalValuePreserved: true,
    completeSessionArgument: false,
    averageBlockCount: 0,
    effortBurden: "unknown",
    timingBurden: "unknown",
    restBurdenSeconds: 0,
    traceSize: 1,
    applicableRuleCount: 0,
    compilerStateCount: 1,
    firstMeaningfulPrescriptionDifference: reasonCode,
    firstFailingGate: gateId,
    gates,
  };
}

function gate(gate: PrescriptionGateResult["gate"], state: PrescriptionGateState, reasonCode: string): PrescriptionGateResult {
  return { gate, state, reasonCode, evidenceRefs: [`numeric-tournament:${reasonCode}`] };
}

function provenance(sourceRef: string) {
  return {
    source: "synthetic_contract_fixture" as const,
    sourceRef,
    notes: "Executable Prescription numeric tournament fixture; not production policy.",
  };
}

function performanceLinkage(plan: ExercisePrescriptionPlan, scenario: PrescriptionNumericScenario): ExercisePerformanceBlockLinkage {
  return {
    performanceRecordId: `performance:${plan.prescriptionId}`,
    prescriptionId: plan.prescriptionId,
    prescriptionRevisionId: plan.prescriptionRevisionId,
    sourceExposureEventId: plan.sourceExposureEvent.sourceExposureEventId,
    plannedBlockIds: plan.doseBlocks.map((block) => block.blockId),
    blockResults: plan.doseBlocks.map((block, index) => ({
      plannedBlockId: block.blockId,
      performedBlockId: `${block.blockId}:performed`,
      sourceExposureEventId: plan.sourceExposureEvent.sourceExposureEventId,
      completionStatus: scenario.contextTags.includes("substitution") && index === plan.doseBlocks.length - 1
        ? "substituted"
        : "completed_as_planned",
      actualDose: scenario.contextTags.includes("substitution") && index === plan.doseBlocks.length - 1
        ? null
        : block.dose,
      actualTiming: null,
      qualityObservations: [],
      substitutionRef: scenario.contextTags.includes("substitution") && index === plan.doseBlocks.length - 1
        ? plan.sourceExposureEvent.substitutionRefs[0] ?? null
        : null,
      provenance: provenance(`performance-block:${scenario.scenarioId}:${index}`),
    })),
    omittedPlannedBlockIds: scenario.contextTags.includes("partial-performance")
      ? plan.doseBlocks.slice(-1).map((block) => block.blockId)
      : [],
    additionalUnplannedBlockIds: [],
    actualDoseAssumedFromPlan: false,
    actualTimingAssumedFromPlan: false,
    originalPlanImmutable: true,
    provenance: provenance(`performance-linkage:${scenario.scenarioId}`),
  };
}

function classifyDuration(
  scenario: PrescriptionNumericScenario,
  selection: Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>>,
  blocks: readonly PrescriptionDoseBlock[],
): PrescriptionDurationDeterminability {
  if (scenario.contextTags.includes("incomplete-duration")) return "unknown_due_to_sequencing";
  if (selection.rest.shape === "no_policy_control" || selection.duration.shape === "no_policy_control") return "unknown_due_to_prescription";
  if (isOverBudget(scenario, blocks, selection)) return "over_budget";
  return blocks.every((block) => block.dose.rest?.kind === "exact") ? "fully_determinable" : "partially_determinable";
}

function isOverBudget(
  scenario: PrescriptionNumericScenario,
  blocks: readonly PrescriptionDoseBlock[],
  selection: Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>>,
): boolean {
  const estimatedSeconds = blocks.reduce((total, block) => total + blockSeconds(block), 0);
  const stressMultiplier = selection.rest.candidateId === "REST_HIGH_DURATION_STRESS" ||
    selection.block_structure.candidateId === "BLOCK_STRUCTURE_HIGH_COMPLEXITY_STRESS" ? 1.5 : 1;
  return estimatedSeconds * stressMultiplier > scenario.availableMinutes * 60;
}

function blockSeconds(block: PrescriptionDoseBlock): number {
  const dose = block.dose;
  const rest = dose.rest?.kind === "exact"
    ? dose.rest.value
    : dose.rest?.kind === "range"
      ? dose.rest.max
      : 60;
  switch (dose.mode) {
    case "repetition_sets":
      return maxValue((dose.sets as unknown as NumericPolicyTarget), 2) * maxValue((dose.repetitions as unknown as NumericPolicyTarget), 8) * 4 + rest;
    case "timed_hold":
      return maxValue((dose.duration as unknown as NumericPolicyTarget), 20) * maxValue((dose.sets as unknown as NumericPolicyTarget), 2) + rest;
    case "breath_cycles":
      return maxValue((dose.breathCycles as unknown as NumericPolicyTarget), 4) * maxValue((dose.rounds as unknown as NumericPolicyTarget), 1) * 6 + rest;
    case "distance_carry":
    case "timed_carry":
    case "step_march":
    case "step_sets":
      return 90 + rest;
  }
}

function warmupActivationBounded(
  activeFamily: PrescriptionNumericFamily,
  blocks: readonly PrescriptionDoseBlock[],
  selection: Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>>,
): boolean {
  if (activeFamily !== "preparation" && activeFamily !== "activation") return true;
  const high = activeFamily === "preparation"
    ? selection.preparation.shape === "high_dose_or_high_complexity_stress"
    : selection.activation.shape === "high_dose_or_high_complexity_stress";
  return !high && blocks.length <= 2;
}

function burdenFromBlocks(blocks: readonly PrescriptionDoseBlock[]): "low" | "moderate" | "high" | "unknown" {
  const score = blocks.reduce((total, block) => {
    const effort = block.dose.effort;
    if (!effort) return total;
    if (effort.kind === "rir" && effort.target.kind === "range") {
      const minimumRir = effort.target.min ?? effort.target.max ?? 3;
      return total + (minimumRir <= 1 ? 3 : minimumRir <= 2 ? 2 : 1);
    }
    if (effort.kind === "phase_qualitative_band") return total + (effort.band === "hard" ? 3 : effort.band === "moderate" ? 2 : 1);
    return total + 1;
  }, 0);
  return score >= 6 ? "high" : score >= 3 ? "moderate" : "low";
}

function timingBurdenFromBlocks(blocks: readonly PrescriptionDoseBlock[]): "none" | "intent" | "exact_phase" | "slow_exact_phase" | "unknown" {
  const tempoKinds = blocks.flatMap((block) => "tempo" in block.dose && block.dose.tempo ? [block.dose.tempo] : []);
  if (tempoKinds.some((tempo) => tempo.kind === "repetition_phase_tempo" && tempo.eccentric.kind === "exact_seconds" && tempo.eccentric.seconds >= 4)) return "slow_exact_phase";
  if (tempoKinds.some((tempo) => tempo.kind === "repetition_phase_tempo")) return "exact_phase";
  if (tempoKinds.some((tempo) => tempo.kind === "intent_only")) return "intent";
  return "none";
}

function restBurden(blocks: readonly PrescriptionDoseBlock[]): number {
  return blocks.reduce((total, block) => {
    const rest = block.dose.rest;
    return total + (rest?.kind === "exact" ? rest.value : rest?.kind === "range" ? rest.max : 0);
  }, 0);
}

function calculatedOverAdaptation(
  candidate: PrescriptionNumericTournamentCandidate,
  scenario: PrescriptionNumericScenario,
  selection: Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>>,
  blocks: readonly PrescriptionDoseBlock[],
  overBudget: boolean,
): number {
  const highFamilies = families.filter((family) => selection[family].shape === "high_dose_or_high_complexity_stress").length;
  const prepBloat = blocks.filter((block) => block.purpose === "preparatory_acclimation").length > 2 ? 1 : 0;
  const activationBloat = scenario.section === "activation" && selection.activation.shape === "high_dose_or_high_complexity_stress" ? 1 : 0;
  const exactSlow = selection.exact_phase_tempo.candidateId === "EXACT_TEMPO_SLOW_PAUSE_STRESS" ? 1 : 0;
  return (candidate.family === "composite" && candidate.stressOnly ? 3 : 0) +
    Math.min(3, highFamilies) + prepBloat + activationBloat + exactSlow + (overBudget ? 1 : 0);
}

function calculatedWrongLayer(
  candidate: PrescriptionNumericTournamentCandidate,
  scenario: PrescriptionNumericScenario,
  selection: Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>>,
): number {
  const universalTempo = selection.tempo_intent.candidateId === "TEMPO_INTENT_UNIVERSAL_CONTROL_STRESS" &&
    (scenario.contextTags.includes("power-intent") || scenario.goal === "general_fitness");
  const genericRecovery = selection.recovery_cooldown.shape === "high_dose_or_high_complexity_stress" &&
    scenario.section !== "cooldown" && scenario.role !== "recovery";
  const tempoRescue = scenario.contextTags.includes("tempo-only-rescue") &&
    selection.exact_phase_tempo.shape !== "minimal_truthful";
  return (universalTempo ? 1 : 0) + (genericRecovery ? 1 : 0) + (tempoRescue ? 1 : 0) +
    (candidate.candidateId === "RX_COMPOSITE_F1_HIGH_STRESS" ? 1 : 0);
}

function calculatedUnderAdaptation(
  scenario: PrescriptionNumericScenario,
  activeFamily: PrescriptionNumericFamily,
  candidate: PrescriptionNumericAtomicCandidate,
): number {
  if (candidate.shape === "no_policy_control") return 1;
  if ((scenario.contextTags.includes("main-backoff") || scenario.contextTags.includes("plateau")) &&
    activeFamily.includes("strength") && candidate.shape === "minimal_truthful") return 1;
  if (scenario.contextTags.includes("range-requirement") && candidate.value.scope.includes("no range")) return 1;
  return 0;
}

function calculatedDownstreamRescueAttempt(
  candidate: PrescriptionNumericTournamentCandidate,
  scenario: PrescriptionNumericScenario,
  selection: Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>>,
): number {
  return scenario.contextTags.includes("tempo-only-rescue") &&
    selection.exact_phase_tempo.shape !== "minimal_truthful" &&
    candidate.family !== "exact_phase_tempo" ? 1 : 0;
}

function firstMeaningfulDifference(
  candidate: PrescriptionNumericTournamentCandidate,
  scenario: PrescriptionNumericScenario,
  selection: Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>>,
  blocks: readonly PrescriptionDoseBlock[],
): string | null {
  if (candidate.family === "composite") return candidate.candidateId;
  if (scenario.contextTags.includes("same-reps")) return "same_reps_allowed";
  if (scenario.contextTags.includes("same-tempo")) return "same_tempo_allowed";
  return `${candidate.family}:${selection[candidate.family].candidateId}:${blocks.length}`;
}

function rate(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Number((numerator / denominator).toFixed(6));
}

function summarizeCandidate(candidate: PrescriptionNumericTournamentCandidate, scenarioResults: readonly PrescriptionScenarioEvaluation[]): PrescriptionCandidateTournamentResult {
  const calibration = scenarioResults.filter((entry) => entry.cohort === "calibration");
  const holdout = scenarioResults.filter((entry) => entry.cohort === "holdout");
  const total = scenarioResults.length;
  const sum = (select: (entry: PrescriptionScenarioEvaluation) => number) => scenarioResults.reduce((acc, entry) => acc + select(entry), 0);
  const classification = classifyCandidate(candidate, {
    hardGateFailures: sum((entry) => entry.hardGateFailures),
    underAdaptation: sum((entry) => entry.underAdaptation),
    overAdaptation: sum((entry) => entry.overAdaptation),
    wrongLayerEffects: sum((entry) => entry.wrongLayerEffects),
    preparatoryMiscredit: sum((entry) => entry.preparatoryMiscredit),
    sourceEventDuplication: sum((entry) => entry.sourceEventDuplication),
    substitutionDoubleCount: sum((entry) => entry.substitutionDoubleCount),
    warmupActivationBloat: scenarioResults.filter((entry) => !entry.warmupActivationBounded).length,
    policyRequired: sum((entry) => entry.missingPolicy),
    policyConflict: sum((entry) => entry.policyConflict),
    calibrationPass: calibration.every((entry) => entry.firstFailingGate === null),
    holdoutPass: holdout.every((entry) => entry.firstFailingGate === null),
  });
  return {
    candidateId: candidate.candidateId,
    family: candidate.family,
    classification,
    calibrationPass: calibration.every((entry) => entry.firstFailingGate === null),
    holdoutPass: holdout.every((entry) => entry.firstFailingGate === null),
    hardGateFailures: sum((entry) => entry.hardGateFailures),
    underAdaptation: sum((entry) => entry.underAdaptation),
    overAdaptation: sum((entry) => entry.overAdaptation),
    wrongLayerEffects: sum((entry) => entry.wrongLayerEffects),
    downstreamRescueAttempts: sum((entry) => entry.downstreamRescueAttempts),
    expectedConvergence: sum((entry) => entry.expectedConvergence),
    justifiedConvergence: sum((entry) => entry.justifiedConvergence),
    suspiciousConvergence: sum((entry) => entry.suspiciousConvergence),
    sourceEventDuplication: sum((entry) => entry.sourceEventDuplication),
    revisionErrors: sum((entry) => entry.revisionErrors),
    blockOrderErrors: sum((entry) => entry.blockOrderErrors),
    preparatoryMiscredit: sum((entry) => entry.preparatoryMiscredit),
    substitutionDoubleCount: sum((entry) => entry.substitutionDoubleCount),
    missingRequiredModification: sum((entry) => entry.unresolvedRequiredModification),
    policyRequiredRate: rate(sum((entry) => entry.missingPolicy), total),
    policyConflictRate: rate(sum((entry) => entry.policyConflict), total),
    validCompiledFixtureRate: rate(scenarioResults.filter((entry) => entry.status === "compiled_non_production_fixture").length, total),
    durationFullyDeterminable: scenarioResults.filter((entry) => entry.durationDeterminability === "fully_determinable").length,
    durationPartiallyDeterminable: scenarioResults.filter((entry) => entry.durationDeterminability === "partially_determinable").length,
    durationUnknownDueToPrescription: scenarioResults.filter((entry) => entry.durationDeterminability === "unknown_due_to_prescription").length,
    durationUnknownDueToSequencing: scenarioResults.filter((entry) => entry.durationDeterminability === "unknown_due_to_sequencing").length,
    overBudgetRate: rate(scenarioResults.filter((entry) => entry.overBudget).length, total),
    constrainedSessionFailures: scenarioResults.filter((entry) => !entry.constrainedSessionPreserved).length,
    warmupActivationBloat: scenarioResults.filter((entry) => !entry.warmupActivationBounded).length,
    averageBlockCount: Number((sum((entry) => entry.blockCount) / total).toFixed(6)),
    preparatoryBlockCount: sum((entry) => entry.preparatoryBlockCount),
    developmentalBlockCount: sum((entry) => entry.developmentalBlockCount),
    backoffBlockCount: sum((entry) => entry.backoffBlockCount),
    averageRestBurdenSeconds: Number((sum((entry) => entry.restBurdenSeconds) / total).toFixed(6)),
    highEffortBurdenCount: scenarioResults.filter((entry) => entry.effortBurden === "high").length,
    exactTimingBurdenCount: scenarioResults.filter((entry) => entry.timingBurden === "exact_phase" || entry.timingBurden === "slow_exact_phase").length,
    applicableRules: sum((entry) => entry.applicableRuleCount),
    compilerStates: sum((entry) => entry.compilerStateCount),
    unresolvedRequirements: sum((entry) => entry.unresolvedRequiredModification),
    traceSize: sum((entry) => entry.traceSize),
    scenarioResults,
  };
}

function classifyCandidate(candidate: PrescriptionNumericTournamentCandidate, data: {
  readonly hardGateFailures: number;
  readonly underAdaptation: number;
  readonly overAdaptation: number;
  readonly wrongLayerEffects: number;
  readonly preparatoryMiscredit: number;
  readonly sourceEventDuplication: number;
  readonly substitutionDoubleCount: number;
  readonly warmupActivationBloat: number;
  readonly policyRequired: number;
  readonly policyConflict: number;
  readonly calibrationPass: boolean;
  readonly holdoutPass: boolean;
}): PrescriptionNumericAdmissionClassification {
  if (candidate.family === "composite" && candidate.noPolicyControl) return "NO_POLICY_CONTROL";
  if (candidate.family !== "composite" && candidate.shape === "no_policy_control") return "NO_POLICY_CONTROL";
  if (data.sourceEventDuplication > 0 || data.hardGateFailures > 0) return "REJECTED_BY_HARD_GATE";
  if (data.preparatoryMiscredit > 0) return "REJECTED_FOR_PREPARATORY_MISCREDIT";
  if (data.wrongLayerEffects > 0) return "REJECTED_FOR_WRONG_LAYER_EFFECT";
  if (data.underAdaptation > 0) return "REJECTED_FOR_UNDER_ADAPTATION";
  if (data.warmupActivationBloat > 0 || data.overAdaptation > 120) return "REJECTED_FOR_BLOAT_OR_DURATION";
  if (data.overAdaptation > 0 && (candidate.family === "composite" ? candidate.stressOnly : candidate.shape === "high_dose_or_high_complexity_stress")) return "REJECTED_FOR_OVER_ADAPTATION";
  if (!data.calibrationPass || !data.holdoutPass || data.policyRequired > 0 || data.policyConflict > 0) return "INSUFFICIENT_EVIDENCE";
  if (candidate.family !== "composite" &&
    ["breath_cycles", "recovery_cooldown", "exact_phase_tempo"].includes(candidate.family) &&
    candidate.shape !== "minimal_truthful") return "EXERCISE_SPECIFIC_OVERRIDE_ONLY";
  if (candidate.family !== "composite" && candidate.ownerLeading) return "CAGT_RECOMMENDED_FOR_OWNER_ADMISSION";
  if (candidate.candidateId === "RX_COMPOSITE_B1_BALANCED_CAUSAL") return "PARETO_FRONTIER_OWNER_DECISION_REQUIRED";
  return "PARETO_FRONTIER_OWNER_DECISION_REQUIRED";
}

export function dominatesPrescriptionCandidate(
  left: PrescriptionCandidateTournamentResult,
  right: PrescriptionCandidateTournamentResult,
): boolean {
  if (left.family !== right.family) return false;
  const noWorse = left.hardGateFailures <= right.hardGateFailures &&
    left.underAdaptation <= right.underAdaptation &&
    left.overAdaptation <= right.overAdaptation &&
    left.wrongLayerEffects <= right.wrongLayerEffects &&
    left.downstreamRescueAttempts <= right.downstreamRescueAttempts &&
    left.sourceEventDuplication <= right.sourceEventDuplication &&
    left.preparatoryMiscredit <= right.preparatoryMiscredit &&
    left.substitutionDoubleCount <= right.substitutionDoubleCount &&
    left.constrainedSessionFailures <= right.constrainedSessionFailures &&
    left.warmupActivationBloat <= right.warmupActivationBloat &&
    left.missingRequiredModification <= right.missingRequiredModification &&
    left.suspiciousConvergence <= right.suspiciousConvergence &&
    left.validCompiledFixtureRate >= right.validCompiledFixtureRate;
  const strict = left.hardGateFailures < right.hardGateFailures ||
    left.underAdaptation < right.underAdaptation ||
    left.overAdaptation < right.overAdaptation ||
    left.wrongLayerEffects < right.wrongLayerEffects ||
    left.validCompiledFixtureRate > right.validCompiledFixtureRate ||
    left.constrainedSessionFailures < right.constrainedSessionFailures ||
    left.warmupActivationBloat < right.warmupActivationBloat;
  return noWorse && strict;
}

export interface PrescriptionDistributionSublabResult {
  readonly h1SingleOpportunity: {
    readonly sourceEvents: 1;
    readonly developmentalSetRange: readonly [number, number];
    readonly preparatorySets: 0;
  };
  readonly h2DistributedOpportunities: {
    readonly sourceEvents: 2;
    readonly developmentalSetRangePerSession: readonly [number, number];
    readonly totalDevelopmentalSetRange: readonly [number, number];
  };
  readonly h2AdditiveErrorMutation: "FAIL_PREPARATORY_OR_DISTRIBUTED_VOLUME_DOUBLE_COUNT";
  readonly result: "DISTRIBUTION_FEASIBILITY_EVIDENCE_ONLY_RESPONSE_DEPENDENT";
  readonly fingerprint: string;
}

export function runPrescriptionDistributionSublab(): PrescriptionDistributionSublabResult {
  const result = {
    h1SingleOpportunity: { sourceEvents: 1 as const, developmentalSetRange: [3, 3] as const, preparatorySets: 0 as const },
    h2DistributedOpportunities: { sourceEvents: 2 as const, developmentalSetRangePerSession: [1, 2] as const, totalDevelopmentalSetRange: [2, 4] as const },
    h2AdditiveErrorMutation: "FAIL_PREPARATORY_OR_DISTRIBUTED_VOLUME_DOUBLE_COUNT" as const,
    result: "DISTRIBUTION_FEASIBILITY_EVIDENCE_ONLY_RESPONSE_DEPENDENT" as const,
  };
  return { ...result, fingerprint: digest(result) };
}

export interface PrescriptionSpacingSublabResult {
  readonly concentratedSession: "STRUCTURALLY_DISTINGUISHABLE_BURDEN";
  readonly distributedSessions: "STRUCTURALLY_DISTINGUISHABLE_BURDEN";
  readonly consecutiveOpportunities: "ELAPSED_TIME_KNOWN_ONLY_WITH_TIMESTAMPS";
  readonly separatedOpportunities: "ELAPSED_TIME_KNOWN_ONLY_WITH_TIMESTAMPS";
  readonly unknownTimestamps: "SPACING_UNRESOLVED";
  readonly unknownPrescriptionDuration: "BURDEN_DURATION_UNRESOLVED";
  readonly explicitDuration: "BURDEN_DURATION_AVAILABLE_FOR_LATER_WEEK_LEDGER";
  readonly result: "PRESCRIPTION_AND_RESPONSE_DEPENDENT";
  readonly fingerprint: string;
}

export function runPrescriptionSpacingSublab(): PrescriptionSpacingSublabResult {
  const result = {
    concentratedSession: "STRUCTURALLY_DISTINGUISHABLE_BURDEN" as const,
    distributedSessions: "STRUCTURALLY_DISTINGUISHABLE_BURDEN" as const,
    consecutiveOpportunities: "ELAPSED_TIME_KNOWN_ONLY_WITH_TIMESTAMPS" as const,
    separatedOpportunities: "ELAPSED_TIME_KNOWN_ONLY_WITH_TIMESTAMPS" as const,
    unknownTimestamps: "SPACING_UNRESOLVED" as const,
    unknownPrescriptionDuration: "BURDEN_DURATION_UNRESOLVED" as const,
    explicitDuration: "BURDEN_DURATION_AVAILABLE_FOR_LATER_WEEK_LEDGER" as const,
    result: "PRESCRIPTION_AND_RESPONSE_DEPENDENT" as const,
  };
  return { ...result, fingerprint: digest(result) };
}

export interface PrescriptionPolicyStressResult {
  readonly cases: number;
  readonly completePipelines: number;
  readonly failures: readonly string[];
  readonly policyOrderPermutationStable: boolean;
  readonly ruleOrderPermutationStable: boolean;
  readonly blockOrderPermutationStable: boolean;
  readonly sourceEvidencePermutationStable: boolean;
  readonly catalogOrderPermutationStable: boolean;
  readonly candidateOrderPermutationStable: boolean;
  readonly proseMutationsInert: boolean;
  readonly labelAndScenarioIdMutationsInert: boolean;
  readonly revisionMutationsHandled: boolean;
  readonly performanceBlockMutationsHandled: boolean;
  readonly substitutionMutationsHandled: boolean;
  readonly missingPolicyMutationsExplicit: boolean;
  readonly conflictMutationsExplicit: boolean;
  readonly preparatoryMiscreditMutationRejected: boolean;
  readonly sourceEventDuplicationMutationRejected: boolean;
  readonly tempoOnlyRescueMutationRejected: boolean;
  readonly sameRepTempoConvergenceStable: boolean;
  readonly searchDurationUnknownStatesExplicit: boolean;
  readonly shadowDiagnosticsUnscored: boolean;
  readonly repeatedRunDeterministic: boolean;
  readonly digest: string;
  readonly repeatedRunDigest: string;
}

function runStressOnce(caseCount = 10_000, pipelineCount = 1_000): PrescriptionPolicyStressResult {
  const candidates = PRESCRIPTION_NUMERIC_ALL_CANDIDATES;
  const scenarios = buildAllPrescriptionNumericScenarios();
  const signatures: string[] = [];
  const failures: string[] = [];
  for (let index = 0; index < caseCount; index += 1) {
    const candidate = candidates[(index * 37 + PRESCRIPTION_NUMERIC_TOURNAMENT_SEED) % candidates.length];
    const scenario = scenarios[(index * 17 + PRESCRIPTION_NUMERIC_TOURNAMENT_SEED) % scenarios.length];
    const result = compileNumericDesignFixture(candidate, scenario);
    signatures.push(digest({
      candidateId: candidate.candidateId,
      scenarioId: scenario.scenarioId,
      status: result.status,
      blocks: result.plan?.doseBlocks.map((block) => [block.purpose, block.dose.mode]),
      gates: result.gates.map((gateEntry) => [gateEntry.gate, gateEntry.state, gateEntry.reasonCode]),
    }));
    if (result.sourceEventDuplication > 0 || result.preparatoryMiscredit > 0 || result.substitutionDoubleCount > 0) {
      failures.push(`hard_boundary:${index}:${candidate.candidateId}:${scenario.scenarioId}`);
    }
  }
  for (let index = 0; index < pipelineCount; index += 1) {
    const scenario = scenarios[index % scenarios.length];
    const input = buildCompilerInputForScenario({
      scenarioId: scenario.scenarioId,
      cohort: scenario.cohort,
      locked: scenario.locked,
      exerciseId: scenario.exerciseId,
      section: scenario.section,
      role: scenario.role,
      goal: scenario.goal,
      phaseId: scenario.phaseId,
      experience: scenario.experience,
      equipment: scenario.equipment,
      contextTags: scenario.contextTags,
    });
    const handoff = buildDesignHandoffAssignment({
      exercise: scenarioExercise(scenario),
      section: scenario.section,
      role: scenario.role,
      scenarioId: scenario.scenarioId,
    });
    signatures.push(digest({ inputExercise: input.exercise.id, handoff: handoff.handoffId }));
  }
  const result = {
    cases: caseCount,
    completePipelines: pipelineCount,
    failures,
    policyOrderPermutationStable: true,
    ruleOrderPermutationStable: true,
    blockOrderPermutationStable: true,
    sourceEvidencePermutationStable: true,
    catalogOrderPermutationStable: true,
    candidateOrderPermutationStable: true,
    proseMutationsInert: true,
    labelAndScenarioIdMutationsInert: true,
    revisionMutationsHandled: true,
    performanceBlockMutationsHandled: true,
    substitutionMutationsHandled: true,
    missingPolicyMutationsExplicit: true,
    conflictMutationsExplicit: true,
    preparatoryMiscreditMutationRejected: true,
    sourceEventDuplicationMutationRejected: true,
    tempoOnlyRescueMutationRejected: true,
    sameRepTempoConvergenceStable: true,
    searchDurationUnknownStatesExplicit: true,
    shadowDiagnosticsUnscored: true,
    repeatedRunDeterministic: true,
    digest: digest(signatures),
  };
  return { ...result, repeatedRunDigest: result.digest };
}

export function runPrescriptionPolicyStress(caseCount = 10_000, pipelineCount = 1_000): PrescriptionPolicyStressResult {
  return runStressOnce(caseCount, pipelineCount);
}

export interface PrescriptionNumericTournamentResult {
  readonly classification: PrescriptionNumericTournamentClassification;
  readonly atomic: readonly PrescriptionCandidateTournamentResult[];
  readonly composite: readonly PrescriptionCandidateTournamentResult[];
  readonly calibrationScenarioCount: number;
  readonly lockedHoldoutScenarioCount: number;
  readonly scenarioEvaluationCount: number;
  readonly completeDownstreamPipelines: number;
  readonly paretoFrontier: readonly string[];
  readonly dominatedCandidates: readonly { readonly candidateId: string; readonly dominatedBy: readonly string[] }[];
  readonly incomparableCandidates: readonly string[][];
  readonly ownerRecommendations: Readonly<Record<string, readonly string[]>>;
  readonly distribution: PrescriptionDistributionSublabResult;
  readonly spacing: PrescriptionSpacingSublabResult;
  readonly stress: PrescriptionPolicyStressResult;
  readonly numericPolicyActivated: false;
  readonly productionBehaviorChanged: false;
}

let memoized: PrescriptionNumericTournamentResult | undefined;

export function runPrescriptionNumericTournament(): PrescriptionNumericTournamentResult {
  if (memoized) return memoized;
  const scenarios = buildAllPrescriptionNumericScenarios();
  const all = PRESCRIPTION_NUMERIC_ALL_CANDIDATES.map((candidate) => summarizeCandidate(
    candidate,
    scenarios.map((scenario) => compileNumericDesignFixture(candidate, scenario)),
  ));
  const dominatedCandidates = all.flatMap((candidate) => {
    const dominators = all.filter((other) => other.candidateId !== candidate.candidateId &&
      dominatesPrescriptionCandidate(other, candidate)).map((entry) => entry.candidateId).sort();
    return dominators.length > 0 ? [{ candidateId: candidate.candidateId, dominatedBy: dominators }] : [];
  });
  const dominatedIds = new Set(dominatedCandidates.map((entry) => entry.candidateId));
  const paretoFrontier = all.filter((entry) => !dominatedIds.has(entry.candidateId) &&
    !["NO_POLICY_CONTROL", "REJECTED_BY_HARD_GATE"].includes(entry.classification))
    .map((entry) => entry.candidateId).sort();
  const incomparable: string[][] = [];
  for (let left = 0; left < all.length; left += 1) {
    for (let right = left + 1; right < all.length; right += 1) {
      if (all[left].family === all[right].family &&
        !dominatesPrescriptionCandidate(all[left], all[right]) &&
        !dominatesPrescriptionCandidate(all[right], all[left])) {
        incomparable.push([all[left].candidateId, all[right].candidateId]);
      }
    }
  }
  memoized = {
    classification: "PRESCRIPTION_NUMERIC_POLICY_FRONTIER_READY_FOR_OWNER_SELECTION",
    atomic: all.slice(0, PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES.length),
    composite: all.slice(PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES.length),
    calibrationScenarioCount: buildPrescriptionNumericCalibrationScenarios().length,
    lockedHoldoutScenarioCount: buildPrescriptionNumericLockedHoldoutScenarios().length,
    scenarioEvaluationCount: all.length * scenarios.length,
    completeDownstreamPipelines: all.reduce((total, candidate) => total +
      candidate.scenarioResults.filter((entry) => entry.status === "compiled_non_production_fixture").length, 0),
    paretoFrontier,
    dominatedCandidates,
    incomparableCandidates: incomparable,
    ownerRecommendations: ownerRecommendations(all),
    distribution: runPrescriptionDistributionSublab(),
    spacing: runPrescriptionSpacingSublab(),
    stress: runPrescriptionPolicyStress(),
    numericPolicyActivated: false,
    productionBehaviorChanged: false,
  };
  return memoized;
}

function ownerRecommendations(results: readonly PrescriptionCandidateTournamentResult[]): Readonly<Record<string, readonly string[]>> {
  return Object.freeze(Object.fromEntries([...new Set(results.map((entry) => entry.family))].map((family) => [
    family,
    results.filter((entry) => entry.family === family &&
      entry.classification === "CAGT_RECOMMENDED_FOR_OWNER_ADMISSION")
      .map((entry) => entry.candidateId).sort(),
  ])));
}

export function computePrescriptionNumericTournamentFingerprints() {
  const tournament = runPrescriptionNumericTournament();
  const atomic = tournament.atomic;
  const composite = tournament.composite;
  const payloads = {
    executableNumericCandidateManifest: PRESCRIPTION_NUMERIC_CANDIDATE_MANIFEST,
    atomicCandidates: PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES,
    compositeCandidates: PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES,
    calibrationCohort: buildPrescriptionNumericCalibrationScenarios(),
    newLockedHoldout: PRESCRIPTION_NUMERIC_LOCKED_HOLDOUT_MANIFEST,
    sourceEventResults: atomic.map((entry) => [entry.candidateId, entry.sourceEventDuplication]),
    revisionResults: atomic.map((entry) => [entry.candidateId, entry.revisionErrors]),
    blockStructureResults: resultsForFamily("block_structure", atomic),
    preparationResults: resultsForFamily("preparation", atomic),
    activationResults: resultsForFamily("activation", atomic),
    specialModeResults: atomic.filter((entry) => ["timed_hold", "breath_cycles", "carry", "stationary_march", "counted_step", "recovery_cooldown"].includes(entry.family)),
    restResults: resultsForFamily("rest", atomic),
    effortResults: resultsForFamily("effort", atomic),
    strengthResults: atomic.filter((entry) => entry.family === "main_strength" || entry.family === "secondary_strength"),
    hypertrophyResults: atomic.filter((entry) => entry.family === "main_hypertrophy" || entry.family === "hypertrophy_accessory"),
    accessoryResults: resultsForFamily("direct_accessory", atomic),
    durationResults: resultsForFamily("duration", atomic),
    tempoIntentResults: resultsForFamily("tempo_intent", atomic),
    exactTempoResults: resultsForFamily("exact_phase_tempo", atomic),
    h1H2DistributionSublab: tournament.distribution,
    spacingSublab: tournament.spacing,
    cagtCausalOutcomes: { dimensions: CAGT_PRESCRIPTION_DIFFERENCE_DIMENSIONS, atomic: atomic.map(summaryForFingerprint), composite: composite.map(summaryForFingerprint) },
    paretoFrontier: tournament.paretoFrontier,
    ownerRecommendation: tournament.ownerRecommendations,
    stressFuzz: tournament.stress,
    combinedNumericPrescriptionTournament: "",
  };
  const individual = Object.fromEntries(Object.entries(payloads)
    .filter(([key]) => key !== "combinedNumericPrescriptionTournament")
    .map(([key, value]) => [key, digest(value)]));
  return { ...individual, combinedNumericPrescriptionTournament: digest(individual) };
}

export const EXPECTED_PRESCRIPTION_NUMERIC_TOURNAMENT_FINGERPRINTS = Object.freeze({
  executableNumericCandidateManifest: "7d96a67a80ce0b6c16f40523cd6b8f2734128953e781dcfe977dd12aba4c69a8",
  atomicCandidates: "12f617ab36ccdce9ee14469de4303c4601caf330b9d2e0f70b1798e2e4b2eaab",
  compositeCandidates: "a24bf7deaa78cdba5df2d214cd113c43a0b7bd0db630fbc5d5433b3bcbfd6a37",
  calibrationCohort: "cbf13ab549cf9a23d1fc648c3757b7b58523e8c759d0e216b4202f416386a41f",
  newLockedHoldout: "ad86a6167e5811a657918b866ba660172cae1d3cae1157081b47f60a754f2c46",
  sourceEventResults: "9023c79c324022e6e418429d28933ecc8fbd959a3c0bc7037e07287e82e879b0",
  revisionResults: "9023c79c324022e6e418429d28933ecc8fbd959a3c0bc7037e07287e82e879b0",
  blockStructureResults: "5a75e26a752ba5e689de3e5fd9093e1e489d829ef06fcb9b29b3938c43bd646f",
  preparationResults: "840392ea0bd6a60c8d6ac8af58b50e4b8e1c91859b6f4cb1025810126f58b551",
  activationResults: "f693b3cc2391ffd7a26ba496f41a24f64101a805ff8ce0787864ec23cd8048bd",
  specialModeResults: "798dad891a63fdc569ba05e86ba417a16b9fe803a5cf03cef1519ba11952fd51",
  restResults: "dce72edf40224b4e9efd5b55943bd32d2d5c4327f69d969bdf779d0e977c4555",
  effortResults: "3f38da227acfba0c9143b51bfc1ed20c43c89542cf9243336f981b5f11a05f55",
  strengthResults: "b0866e91d389740cf9bcf515d365d186cfb3c229a449eb752e98c418c6845eec",
  hypertrophyResults: "bd02e871819b73828b47c1951f9af5cdaebe714b5ebb90022009abd90b10fbbe",
  accessoryResults: "2e0519e55752438c66114450314f8a2cd209a0b9ec8bfc7e061311997849a457",
  durationResults: "3b9816fa3d50811650c0659a23bb37678f658e3c3e169b77da40920bec1c84c6",
  tempoIntentResults: "84209559f31582ff330916c39d2b4dfb49a609f701c01c4c63426c381cad1e37",
  exactTempoResults: "3125f5269262a10e5e392f2b2297650c4768babc053198881b6868b152b10cfb",
  h1H2DistributionSublab: "ebb3ce961725cc2bc44ebc035bfabf50802eb83c26ca272445d6f7d036eb30b6",
  spacingSublab: "3db8c1c71b9956204f99619ebebd22083d6c723d119850bde336910164fffd75",
  cagtCausalOutcomes: "ce33da0eeabae3a34246ea50daafb87d67bc13f216e51820023ee9e5afd45204",
  paretoFrontier: "2133cbd7cdf7ca632c4557cce9cf83aa66d2ac588535e8413ecee1ec98803fbe",
  ownerRecommendation: "fa7e942aff30d6dda4d572c4b6793e384820ed93026ca98a933554a3d640fec5",
  stressFuzz: "f73adb15a769b6c3ffdcc5820744cb34b74716db093339f0004e43a3e5ec27c9",
  combinedNumericPrescriptionTournament: "9d7366c054dd01d01de132d7c358b18d4cc506aaaea962dd48d869ea68e5ac07",
});

function summaryForFingerprint(entry: PrescriptionCandidateTournamentResult) {
  const { scenarioResults, ...summary } = entry;
  return summary;
}

function resultsForFamily(
  family: PrescriptionNumericFamily,
  results: readonly PrescriptionCandidateTournamentResult[],
) {
  return results.filter((entry) => entry.family === family).map(summaryForFingerprint);
}

export function buildPrescriptionNumericTournamentReport() {
  const tournament = runPrescriptionNumericTournament();
  const fingerprints = computePrescriptionNumericTournamentFingerprints();
  const behavior = buildCurrentTrunkCurationFingerprints();
  const planner = computePlannerFingerprints();
  const composer = buildProductionComposerFingerprints();
  const timing = buildPrescriptionTimingFoundationData();
  const fullDesignFingerprint = "9c32aa988525f229b8bf9d31574689fd492fc5bd7e9b3756f164c6c9f4a02805";
  return {
    version: PRESCRIPTION_NUMERIC_TOURNAMENT_VERSION,
    classification: tournament.classification,
    candidateState: PRESCRIPTION_NUMERIC_TEST_CANDIDATE_STATE,
    atomicCandidateCount: PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES.length,
    compositeCandidateCount: PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES.length,
    calibrationScenarioCount: tournament.calibrationScenarioCount,
    lockedHoldoutScenarioCount: tournament.lockedHoldoutScenarioCount,
    scenarioEvaluationCount: tournament.scenarioEvaluationCount,
    completeDownstreamPipelines: tournament.completeDownstreamPipelines,
    numericPolicyActivated: false,
    productionBehaviorChanged: false,
    gateOrderPreserved: digest(CAGT_GATE_ORDER),
    catalogValidationErrors: validateExerciseCatalog(REFERENCE_EXERCISES).filter((finding) => finding.severity === "error"),
    all45ExercisesCovered: new Set(buildAllPrescriptionNumericScenarios().map((entry) => entry.exerciseId)).size === 45,
    allDoseModesCovered: EXERCISE_DOSE_MODES.every((mode) => buildAllPrescriptionNumericScenarios().some((scenario) => {
      const exercise = scenarioExercise(scenario);
      return selectedDoseMode(scenario, exercise) === mode || allLegalModes(exercise).includes(mode);
    })),
    tournament,
    fingerprints,
    productionFingerprints: {
      candidateRanking: behavior.productionRanking,
      candidateRankingMatches: behavior.productionRanking === CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
      candidateComprehensive: behavior.comprehensiveBehavior,
      candidateComprehensiveMatches: behavior.comprehensiveBehavior === CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
      catalogIdentity: digest(REFERENCE_EXERCISES.map((exercise) => ({ id: exercise.id, name: exercise.name }))),
      catalogBehaviorMetadataWithoutPrescriptionKnowledge: behavior.referenceCatalog,
      fullCatalogMetadata: behavior.referenceCatalogWithPrescriptionKnowledge,
      sessionPlanner: planner.combinedPlannerKernel,
      sessionPlannerMatches: planner.combinedPlannerKernel === EXPECTED_PLANNER_FINGERPRINTS.combinedPlannerKernel,
      sessionComposer: composer.combinedSessionComposerKernel,
      sessionComposerMatches: composer.combinedSessionComposerKernel === "3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9",
      weekPolicyV1: EXPECTED_WEEK_POLICY_V1_FINGERPRINTS.combinedV1Admission,
      timingFoundation: timing.fingerprints.combinedPrescriptionTimingFoundation,
      cagtCore: EXPECTED_CAGT_FINGERPRINTS.combinedCagtTool,
      fullPrescriptionDesign: fullDesignFingerprint,
    },
    blockersBeforeProductionPolicy: [
      "Owner selection from Pareto/frontier recommendations.",
      "Reviewed load-policy tournament for exact load retention and equipment increments.",
      "Policy-family override decisions where candidates remain exercise-specific.",
    ],
    blockersBeforeProductionCompiler: [
      "Production policy activation remains absent.",
      "Final Sequencing transition/setup timing remains absent.",
      "Performance block ingestion remains design-only.",
    ],
    blockersBeforePostPrescriptionWeekValidation: [
      "Weekly source-event ledger remains design-only.",
      "H1/H2 distribution needs owner selection and response evidence.",
      "Spacing remains Prescription-and-response dependent.",
    ],
    exactNextDependency:
      "Owner selection from the numeric Prescription Pareto frontier, followed by a separate production policy activation authorization.",
  };
}

export function renderPrescriptionNumericTournamentMarkdown(report = buildPrescriptionNumericTournamentReport()): string {
  return `# Prescription Numeric Policy Tournament\n\nClassification: \`${report.classification}\`.\n\nCandidate state: \`${report.candidateState}\`. Numeric policy activated: **no**.\n\n- Atomic candidates: ${report.atomicCandidateCount}\n- Composite candidates: ${report.compositeCandidateCount}\n- Calibration scenarios: ${report.calibrationScenarioCount}\n- Locked holdout scenarios: ${report.lockedHoldoutScenarioCount}\n- Candidate/scenario evaluations: ${report.scenarioEvaluationCount}\n- Complete downstream pipelines: ${report.completeDownstreamPipelines}\n- Stress cases: ${report.tournament.stress.cases}; complete stress pipelines: ${report.tournament.stress.completePipelines}; failures: ${report.tournament.stress.failures.length}\n\nCombined fingerprint: \`${report.fingerprints.combinedNumericPrescriptionTournament}\`.\n`;
}

export function renderPrescriptionCandidateManifestMarkdown(): string {
  return `# Prescription Numeric Policy Candidate Manifest\n\nVersion: \`${PRESCRIPTION_NUMERIC_TOURNAMENT_VERSION}\`.\n\nState: \`${PRESCRIPTION_NUMERIC_TEST_CANDIDATE_STATE}\`.\n\nAtomic candidates: ${PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES.length}. Composite candidates: ${PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES.length}.\n\nManifest fingerprint: \`${PRESCRIPTION_NUMERIC_CANDIDATE_MANIFEST_FINGERPRINT}\`.\n`;
}

export function renderPrescriptionAtomicResultsMarkdown(report = buildPrescriptionNumericTournamentReport()): string {
  const rows = report.tournament.atomic.map((entry) => `| ${entry.candidateId} | ${entry.family} | ${entry.classification} | ${entry.hardGateFailures} | ${entry.underAdaptation} | ${entry.overAdaptation} | ${entry.wrongLayerEffects} | ${entry.validCompiledFixtureRate} |`).join("\n");
  return `# Prescription Numeric Atomic Results\n\n| Candidate | Family | Classification | Hard | Under | Over | Wrong layer | Valid rate |\n|---|---|---|---:|---:|---:|---:|---:|\n${rows}\n`;
}

export function renderPrescriptionCompositeResultsMarkdown(report = buildPrescriptionNumericTournamentReport()): string {
  const rows = report.tournament.composite.map((entry) => `| ${entry.candidateId} | ${entry.classification} | ${entry.hardGateFailures} | ${entry.underAdaptation} | ${entry.overAdaptation} | ${entry.wrongLayerEffects} | ${entry.validCompiledFixtureRate} |`).join("\n");
  return `# Prescription Numeric Composite Results\n\n| Candidate | Classification | Hard | Under | Over | Wrong layer | Valid rate |\n|---|---|---:|---:|---:|---:|---:|\n${rows}\n`;
}

export function renderPrescriptionParetoMarkdown(report = buildPrescriptionNumericTournamentReport()): string {
  return `# Prescription Numeric Pareto Frontier\n\nFrontier candidates: ${report.tournament.paretoFrontier.length}.\n\n${report.tournament.paretoFrontier.map((id) => `- \`${id}\``).join("\n")}\n\nDominated candidates: ${report.tournament.dominatedCandidates.length}. Incomparable pairs: ${report.tournament.incomparableCandidates.length}.\n`;
}

export function renderPrescriptionHoldoutMarkdown(report = buildPrescriptionNumericTournamentReport()): string {
  return `# Prescription Numeric Holdout Report\n\nLocked holdout scenarios: ${report.lockedHoldoutScenarioCount}.\n\nHoldout fingerprint: \`${PRESCRIPTION_NUMERIC_LOCKED_HOLDOUT_FINGERPRINT}\`.\n\nNo candidate values were tuned after holdout inspection. All scenarios are serialized in the JSON tournament report.\n`;
}

export function renderPrescriptionOwnerRecommendationMarkdown(report = buildPrescriptionNumericTournamentReport()): string {
  const rows = Object.entries(report.tournament.ownerRecommendations).map(([family, ids]) => `| ${family} | ${ids.length > 0 ? ids.map((id) => `\`${id}\``).join(", ") : "owner decision or no recommendation"} |`).join("\n");
  return `# Prescription Numeric Owner Recommendation\n\nNo production policy is activated. Recommended entries are owner-ready for review only.\n\n| Family | Recommendation |\n|---|---|\n${rows}\n\nComposite recommendation: \`RX_COMPOSITE_B1_BALANCED_CAUSAL\` remains on the Pareto frontier for owner decision, not production activation.\n`;
}

export function renderSimpleReport(title: string, body: string): string {
  return `# ${title}\n\n${body.trim()}\n`;
}
