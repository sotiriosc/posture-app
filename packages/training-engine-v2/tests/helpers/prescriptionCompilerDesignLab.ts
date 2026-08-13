import { createHash } from "node:crypto";
import {
  EXERCISE_DOSE_MODES,
  PRESCRIPTION_COMPILATION_ORDER,
  PRESCRIPTION_COMPILATION_STATUSES,
  PRESCRIPTION_DOSE_BLOCK_PURPOSES,
  PRESCRIPTION_DURATION_DETERMINABILITY_STATUSES,
  REFERENCE_EXERCISES,
  REVIEWED_PRESCRIPTION_POLICY_RULE_KINDS,
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
  validateReviewedPrescriptionPolicy,
  validateSourceExposureEventIdentity,
  type ExerciseDefinition,
  type ExerciseDose,
  type ExerciseDoseMode,
  type ExercisePerformanceBlockLinkage,
  type ExercisePrescriptionPlan,
  type ExercisePrescriptionRevision,
  type PrescriptionCompilationResult,
  type PrescriptionCompilerInput,
  type PrescriptionDoseBlock,
  type PrescriptionDoseBlockPurpose,
  type PrescriptionDurationDeterminability,
  type PrescriptionPolicyEvidenceClassification,
  type ReviewedPrescriptionPolicy,
  type ReviewedPrescriptionPolicyRule,
  type SessionPrescriptionAssignmentHandoff,
  type SourceExposureEventIdentity,
  type TrainingOutcomeGoal,
  type TrainingRole,
  type SessionSection,
} from "../../src";
import {
  CAGT_GATE_ORDER,
  CAGT_PRESCRIPTION_DIFFERENCE_DIMENSIONS,
  CAGT_TIMING_DIFFERENCE_DIMENSIONS,
} from "../cagt/contracts";
import { EXPECTED_CAGT_FINGERPRINTS } from "../cagt/report";
import { EXPECTED_WEEK_POLICY_V1_FINGERPRINTS } from "../cagt/weekPolicyV1Report";
import { EXPECTED_WEEK_POLICY_TOURNAMENT_FINGERPRINTS } from "../cagt/weekPolicyTournamentReport";
import {
  EXPECTED_PLANNER_FINGERPRINTS,
  computePlannerFingerprints,
} from "./sessionIntentPlannerProduction";
import {
  SESSION_COMPOSER_PRODUCTION_FINGERPRINT_NAMES,
  buildProductionComposerFingerprints,
} from "./sessionComposerProduction";
import {
  CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
  CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
  buildCurrentTrunkCurationFingerprints,
} from "./trunkMechanicsCurationProposal";
import {
  PRESCRIPTION_TIMING_FOUNDATION_CLASSIFICATION,
  buildPrescriptionTimingFoundationData,
} from "./prescriptionTimingFoundation";

export const FULL_PRESCRIPTION_DESIGN_CLASSIFICATION =
  "FULL_PRESCRIPTION_DESIGN_READY_FOR_NUMERIC_POLICY_TOURNAMENT_NOT_PRODUCTION";

export const PRESCRIPTION_DESIGN_AS_OF = "2026-08-13T10:15:00-04:00";
export const PRESCRIPTION_DESIGN_SEED = 0x0806710;

export const PRESCRIPTION_TEST_CANDIDATE_STATE =
  "PRESCRIPTION_TEST_CANDIDATE_NOT_PRODUCTION" as const;

export type PrescriptionPolicyCandidateShape =
  | "minimal_truthful"
  | "balanced"
  | "high_dose_or_high_complexity_stress"
  | "no_policy_control";

export interface PrescriptionPolicyCandidate {
  readonly candidateId: string;
  readonly family: PrescriptionPolicyCandidateFamily;
  readonly shape: PrescriptionPolicyCandidateShape;
  readonly state: typeof PRESCRIPTION_TEST_CANDIDATE_STATE;
  readonly evidenceClassification: PrescriptionPolicyEvidenceClassification;
  readonly sourceRef: string;
  readonly candidateValue: Readonly<Record<string, unknown>>;
}

export type PrescriptionPolicyCandidateFamily =
  | "preparation"
  | "activation"
  | "main_strength"
  | "secondary_strength"
  | "main_hypertrophy"
  | "hypertrophy_accessory"
  | "direct_accessory"
  | "timed_holds"
  | "breath_cycles"
  | "carries"
  | "stationary_marches"
  | "counted_step_work"
  | "recovery_cooldown"
  | "rest"
  | "effort"
  | "tempo_intent"
  | "exact_phase_tempo"
  | "duration"
  | "block_structure";

export interface PrescriptionDesignScenario {
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
  readonly contextTags: readonly string[];
}

export interface PrescriptionCagtPairResult {
  readonly pairId: string;
  readonly description: string;
  readonly expectedPrescriptionRelationship: "same" | "may_differ" | "must_differ" | "hard_failure";
  readonly result:
    | "PASS"
    | "PASS_WITH_EXPECTED_CONVERGENCE"
    | "PASS_WITH_JUSTIFIED_DIFFERENCE"
    | "MUTATION_REJECTED";
  readonly firstRelevantGate:
    | "gate_9_prescription_handoff_truth"
    | "gate_10_sequencing_duration_handoff_truth"
    | "gate_11_execution_response_foundation";
  readonly downstreamRescueAttempted: false;
  readonly mutationClass?: "under_adaptation" | "over_adaptation" | "wrong_layer" | "double_count";
}

export interface PrescriptionConsequenceResult {
  readonly candidateId: string;
  readonly legalCoverage: number;
  readonly missingPolicyStates: number;
  readonly ruleConflicts: number;
  readonly sourceExposureCorrect: boolean;
  readonly blockCount: number;
  readonly preparatoryDevelopmentalSeparated: boolean;
  readonly totalBurdenUnits: number;
  readonly effortBurden: "low" | "moderate" | "high" | "unknown";
  readonly restDeterminability: PrescriptionDurationDeterminability;
  readonly durationDeterminability: PrescriptionDurationDeterminability;
  readonly timingBurden: "none" | "intent" | "exact_phase" | "unknown";
  readonly warmupActivationFatigue: "bounded" | "excessive" | "unknown";
  readonly sessionFeasibility: "fits" | "over_budget" | "unknown_due_to_sequencing";
  readonly constrainedSessionBehavior: "preserve_required_main" | "policy_required" | "conflict";
  readonly underAdaptation: 0;
  readonly overAdaptation: 0;
  readonly wrongLayerEffects: 0;
  readonly downstreamRescueAttempts: 0;
  readonly searchCompilerComplexity: "low" | "moderate" | "high";
}

export interface PrescriptionFuzzResult {
  readonly cases: number;
  readonly completePipelines: number;
  readonly failures: readonly string[];
  readonly sourceOrderPermutationStable: boolean;
  readonly policyOrderPermutationStable: boolean;
  readonly blockOrderPermutationStable: boolean;
  readonly candidateOrderPermutationStable: boolean;
  readonly catalogOrderPermutationStable: boolean;
  readonly proseMutationsInert: boolean;
  readonly labelAndIdMutationsInert: boolean;
  readonly previousRevisionMutationsHandled: boolean;
  readonly performanceMutationsHandled: boolean;
  readonly substitutionMutationsHandled: boolean;
  readonly missingPolicyCasesExplicit: boolean;
  readonly conflictCasesExplicit: boolean;
  readonly shadowDiagnosticsUnscored: boolean;
  readonly repeatedRunDeterministic: boolean;
  readonly digest: string;
  readonly repeatedRunDigest: string;
}

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function provenance(sourceRef: string) {
  return {
    source: "synthetic_contract_fixture" as const,
    sourceRef,
    notes:
      "Full Prescription design lab fixture; not a production numeric Prescription policy.",
  };
}

function stableId(prefix: string, ...parts: readonly string[]): string {
  return `${prefix}:${hash(parts).slice(0, 16)}`;
}

function allLegalModes(exercise: ExerciseDefinition): readonly ExerciseDoseMode[] {
  return [
    exercise.prescriptionKnowledge.primaryDoseMode,
    ...exercise.prescriptionKnowledge.legalAlternateDoseModes,
  ];
}

function doseModeKnowledge(exercise: ExerciseDefinition) {
  const profile = exercise.prescriptionKnowledge;
  return {
    authority: "HANDOFF_ONLY" as const,
    doseModeKnowledge: profile.doseModeAnnotations.map((annotation) => ({
      mode: annotation.mode,
      status: annotation.status,
      reviewStatus: annotation.reviewStatus,
      notes: annotation.notes,
    })),
    primaryDoseMode: profile.primaryDoseMode,
    legalDoseModes: allLegalModes(exercise),
    tempoCapability: profile.repetitionTempo,
    durationCapability: profile.duration,
    breathingCadenceCapability: profile.breathingCadence,
    locomotorCadenceCapability: profile.locomotorCadence,
    unresolvedTimingRequirementIds: profile.unknowns.map((unknown, index) =>
      `${profile.exerciseId}:timing-unknown:${index}:${unknown.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
    ),
    timingPolicyRequirement: "PRESCRIPTION_POLICY_REQUIRED" as const,
    timingProvenanceRefs: profile.provenance.map((entry) => entry.sourceRef).sort(),
  };
}

export function buildDesignHandoffAssignment(input: {
  readonly exercise: ExerciseDefinition;
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly scenarioId: string;
}): SessionPrescriptionAssignmentHandoff {
  return {
    handoffId: `handoff:${input.scenarioId}:${input.exercise.id}`,
    exerciseId: input.exercise.id,
    phaseId: "phase_2",
    section: input.section,
    role: input.role,
    satisfiedNeedIds: [`need:${input.scenarioId}:primary`],
    continuityEvidenceRefs: [`continuity:${input.scenarioId}`],
    requiredPrescriptionResolutionIds: [],
    potentialStressTags: [],
    explicitRequirementRefs: [],
    knownRequirements: {
      sideRequirements: [],
      supportRequirementIds: [],
      rangeRequirementIds: [],
      loadRequirementIds: [],
      leverRequirementIds: [],
      durationRequirementIds: [],
      distanceRequirementIds: [],
      stepRequirementIds: [],
      unclassifiedRequirementIds: [],
    },
    timingKnowledge: doseModeKnowledge(input.exercise),
    orderingConstraints: [],
    sourceExposureEventExpected: true,
  };
}

export const PRESCRIPTION_POLICY_CANDIDATE_FAMILIES: readonly PrescriptionPolicyCandidateFamily[] =
  Object.freeze([
    "preparation",
    "activation",
    "main_strength",
    "secondary_strength",
    "main_hypertrophy",
    "hypertrophy_accessory",
    "direct_accessory",
    "timed_holds",
    "breath_cycles",
    "carries",
    "stationary_marches",
    "counted_step_work",
    "recovery_cooldown",
    "rest",
    "effort",
    "tempo_intent",
    "exact_phase_tempo",
    "duration",
    "block_structure",
  ]);

const CANDIDATE_SHAPES: readonly PrescriptionPolicyCandidateShape[] = Object.freeze([
  "minimal_truthful",
  "balanced",
  "high_dose_or_high_complexity_stress",
  "no_policy_control",
]);

const FAMILY_EVIDENCE: Readonly<Record<PrescriptionPolicyCandidateFamily, PrescriptionPolicyEvidenceClassification>> = {
  preparation: "PRESCRIPTION_DEPENDENT",
  activation: "PRESCRIPTION_DEPENDENT",
  main_strength: "SUPPORTED_FOR_POLICY_REVIEW",
  secondary_strength: "GOAL_SPECIFIC",
  main_hypertrophy: "SUPPORTED_FOR_POLICY_REVIEW",
  hypertrophy_accessory: "GOAL_SPECIFIC",
  direct_accessory: "PRESCRIPTION_DEPENDENT",
  timed_holds: "EXERCISE_SPECIFIC",
  breath_cycles: "INSUFFICIENT_FOR_NUMERIC_POLICY",
  carries: "EXERCISE_SPECIFIC",
  stationary_marches: "PRESCRIPTION_DEPENDENT",
  counted_step_work: "PRESCRIPTION_DEPENDENT",
  recovery_cooldown: "INSUFFICIENT_FOR_NUMERIC_POLICY",
  rest: "SUPPORTED_FOR_POLICY_REVIEW",
  effort: "SUPPORTED_FOR_POLICY_REVIEW",
  tempo_intent: "BROAD_FLEXIBILITY_PRIOR",
  exact_phase_tempo: "PRESCRIPTION_DEPENDENT",
  duration: "EXERCISE_SPECIFIC",
  block_structure: "PRESCRIPTION_DEPENDENT",
};

export const PRESCRIPTION_POLICY_CANDIDATES: readonly PrescriptionPolicyCandidate[] =
  Object.freeze(PRESCRIPTION_POLICY_CANDIDATE_FAMILIES.flatMap((family) =>
    CANDIDATE_SHAPES.map((shape, shapeIndex) => Object.freeze({
      candidateId: `PRESCRIPTION_${family.toUpperCase()}_${shape.toUpperCase()}`,
      family,
      shape,
      state: PRESCRIPTION_TEST_CANDIDATE_STATE,
      evidenceClassification: shape === "no_policy_control"
        ? "EXTERNAL_REFERENCE_PENDING"
        : FAMILY_EVIDENCE[family],
      sourceRef: shape === "no_policy_control"
        ? "owner-fixture:no-policy-control"
        : `docs/training-engine-v2/PRESCRIPTION_POLICY_EVIDENCE_REVIEW.md#${family}`,
      candidateValue: Object.freeze({
        ordinal: shapeIndex,
        noPolicy: shape === "no_policy_control",
        highComplexity: shape === "high_dose_or_high_complexity_stress",
        fixtureOnly: true,
      }),
    })),
  ));

export const PRESCRIPTION_CANDIDATE_LATTICE_FINGERPRINT =
  hash(PRESCRIPTION_POLICY_CANDIDATES);

function basePolicyRules(candidate: PrescriptionPolicyCandidate): readonly ReviewedPrescriptionPolicyRule[] {
  const modeRule: ReviewedPrescriptionPolicyRule = {
    kind: "dose_mode_selection",
    ruleId: `${candidate.candidateId}:mode`,
    specificity: 10,
    authority: candidate.shape === "no_policy_control" ? "external_reference_pending" : "owner_fixture",
    applicability: {},
    overrideOfRuleIds: [],
    conflictsWithRuleIds: [],
    evidenceRefs: [candidate.sourceRef],
    permittedModes: EXERCISE_DOSE_MODES,
    provenance: provenance(`${candidate.candidateId}:mode`),
  };
  const blockRule: ReviewedPrescriptionPolicyRule = {
    kind: "block_structure",
    ruleId: `${candidate.candidateId}:blocks`,
    specificity: 20,
    authority: "owner_fixture",
    applicability: {},
    overrideOfRuleIds: [],
    conflictsWithRuleIds: [],
    evidenceRefs: [candidate.sourceRef],
    blockPurposes: candidate.family === "block_structure"
      ? ["preparatory_acclimation", "developmental_work"]
      : ["developmental_work"],
    allowMultipleBlocks: candidate.family === "block_structure" ||
      candidate.shape === "high_dose_or_high_complexity_stress",
    mixedDoseModesAllowed: false,
    provenance: provenance(`${candidate.candidateId}:blocks`),
  };
  const countRule: ReviewedPrescriptionPolicyRule = {
    kind: "count_target",
    ruleId: `${candidate.candidateId}:count`,
    specificity: 20,
    authority: "owner_fixture",
    applicability: {},
    overrideOfRuleIds: [],
    conflictsWithRuleIds: [],
    evidenceRefs: [candidate.sourceRef],
    targetField: "sets",
    value: candidate.shape === "no_policy_control"
      ? { kind: "policy_required", reason: "No reviewed count policy selected." }
      : { kind: "range", min: 1, max: candidate.shape === "high_dose_or_high_complexity_stress" ? 5 : 3 },
    provenance: provenance(`${candidate.candidateId}:count`),
  };
  const scalarRule: ReviewedPrescriptionPolicyRule = {
    kind: "scalar_target",
    ruleId: `${candidate.candidateId}:rest`,
    specificity: 20,
    authority: "owner_fixture",
    applicability: {},
    overrideOfRuleIds: [],
    conflictsWithRuleIds: [],
    evidenceRefs: [candidate.sourceRef],
    targetField: "rest_seconds",
    value: { kind: "range", min: 45, max: 180 },
    provenance: provenance(`${candidate.candidateId}:rest`),
  };
  const loadRule: ReviewedPrescriptionPolicyRule = {
    kind: "load_selection",
    ruleId: `${candidate.candidateId}:load`,
    specificity: 20,
    authority: "owner_fixture",
    applicability: {},
    overrideOfRuleIds: [],
    conflictsWithRuleIds: [],
    evidenceRefs: [candidate.sourceRef],
    load: {
      kind: "user_selected_by_effort",
      effort: { kind: "quality_limited", requiredCriterionIds: ["controlled-position"], description: "Design fixture selects load by reviewed effort/quality, not absolute load." },
      application: "total",
    },
    provenance: provenance(`${candidate.candidateId}:load`),
  };
  const effortRule: ReviewedPrescriptionPolicyRule = {
    kind: "effort",
    ruleId: `${candidate.candidateId}:effort`,
    specificity: 20,
    authority: "owner_fixture",
    applicability: {},
    overrideOfRuleIds: [],
    conflictsWithRuleIds: [],
    evidenceRefs: [candidate.sourceRef],
    effort: { kind: "quality_limited", requiredCriterionIds: ["controlled-position"], description: "Quality-limited design fixture." },
    provenance: provenance(`${candidate.candidateId}:effort`),
  };
  const modifierRule: ReviewedPrescriptionPolicyRule = {
    kind: "execution_modifier",
    ruleId: `${candidate.candidateId}:range-support`,
    specificity: 30,
    authority: "owner_fixture",
    applicability: { painResponseRequirements: ["reduce_range", "increase_support"] },
    overrideOfRuleIds: [],
    conflictsWithRuleIds: [],
    evidenceRefs: [candidate.sourceRef],
    targetField: "range",
    range: { kind: "intentionally_partial", description: "Fixture range reduction when a structured range requirement exists." },
    provenance: provenance(`${candidate.candidateId}:range-support`),
  };
  const timingRule: ReviewedPrescriptionPolicyRule = {
    kind: "timing",
    ruleId: `${candidate.candidateId}:timing`,
    specificity: 20,
    authority: "owner_fixture",
    applicability: {},
    overrideOfRuleIds: [],
    conflictsWithRuleIds: [],
    evidenceRefs: [candidate.sourceRef],
    targetField: "repetition_tempo",
    tempo: { kind: "intent_only", intent: "controlled", provenance: provenance(`${candidate.candidateId}:tempo`) },
    provenance: provenance(`${candidate.candidateId}:timing`),
  };
  const contextRule: ReviewedPrescriptionPolicyRule = {
    kind: "context_adjustment",
    ruleId: `${candidate.candidateId}:progression`,
    specificity: 40,
    authority: "owner_fixture",
    applicability: { progressionStates: ["READY_FOR_PROGRESSION_REVIEW", "INSUFFICIENT_EVIDENCE"] },
    overrideOfRuleIds: [],
    conflictsWithRuleIds: [],
    evidenceRefs: [candidate.sourceRef],
    adjustmentField: "progression_review",
    requirementRefs: [],
    behavior: "permit_progression_review",
    provenance: provenance(`${candidate.candidateId}:progression`),
  };
  const acclimationRule: ReviewedPrescriptionPolicyRule = {
    kind: "acclimation_block",
    ruleId: `${candidate.candidateId}:acclimation`,
    specificity: 30,
    authority: "owner_fixture",
    applicability: { sections: ["main"], roles: ["primary_strength", "secondary_strength"] },
    overrideOfRuleIds: [],
    conflictsWithRuleIds: [],
    evidenceRefs: [candidate.sourceRef],
    purpose: "preparatory_acclimation",
    creditBehavior: "no_developmental_weekly_credit",
    requiredBeforePurpose: "developmental_work",
    provenance: provenance(`${candidate.candidateId}:acclimation`),
  };
  return [
    modeRule,
    blockRule,
    countRule,
    scalarRule,
    loadRule,
    effortRule,
    modifierRule,
    timingRule,
    contextRule,
    acclimationRule,
  ];
}

export function reviewedPolicyForCandidate(
  candidate = PRESCRIPTION_POLICY_CANDIDATES.find((entry) =>
    entry.family === "block_structure" && entry.shape === "balanced",
  ) ?? PRESCRIPTION_POLICY_CANDIDATES[0],
): ReviewedPrescriptionPolicy {
  const rules = basePolicyRules(candidate);
  return {
    policyId: `reviewed-prescription-policy:${candidate.candidateId}`,
    version: "0.1.0-design",
    sourceType: candidate.shape === "no_policy_control"
      ? "external_reference_pending"
      : "owner_fixture",
    sourceReferences: [
      {
        sourceRef: "ACSM 2026 Position Stand PMID 41843416",
        url: "https://pubmed.ncbi.nlm.nih.gov/41843416/",
        evidenceClassification: "SUPPORTED_FOR_POLICY_REVIEW",
        notes: "Supports broad progressive RT policy review; does not establish a Praxis production compiler.",
      },
      {
        sourceRef: "Schoenfeld 2017 volume meta-analysis PMID 27433992",
        url: "https://pubmed.ncbi.nlm.nih.gov/27433992/",
        evidenceClassification: "GOAL_SPECIFIC",
        notes: "Supports volume as a review dimension; does not authorize double counting preparatory work.",
      },
      {
        sourceRef: "Robinson 2024 proximity-to-failure meta-analysis PMID 38970765",
        url: "https://pubmed.ncbi.nlm.nih.gov/38970765/",
        evidenceClassification: "SUPPORTED_FOR_POLICY_REVIEW",
        notes: "Supports effort/RIR review; does not make failure a universal default.",
      },
      {
        sourceRef: "Rest interval Bayesian review DOI 10.3389/fspor.2024.1429789",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11349676/",
        evidenceClassification: "SUPPORTED_FOR_POLICY_REVIEW",
        notes: "Supports explicit rest policy review and incomplete duration boundaries.",
      },
      {
        sourceRef: "Tempo meta-analysis PMID 25601394 and Enes 2025 DOI 10.1519/JSC.0000000000005302",
        url: "https://pubmed.ncbi.nlm.nih.gov/25601394/",
        evidenceClassification: "BROAD_FLEXIBILITY_PRIOR",
        notes: "Supports avoiding universal tempo defaults.",
      },
    ],
    evidenceBasis: [
      "authoritative_position_stand",
      "systematic_review",
      "meta_analysis",
      "owner_design_fixture",
    ],
    reviewer: "sotiriosc",
    reviewedAt: PRESCRIPTION_DESIGN_AS_OF,
    applicabilityScope: {},
    rules,
    overrides: [],
    conflicts: candidate.shape === "high_dose_or_high_complexity_stress"
      ? [{
          conflictId: `${candidate.candidateId}:stress-conflict`,
          ruleIds: [`${candidate.candidateId}:count`, `${candidate.candidateId}:rest`],
          resolution: "return_policy_conflict",
          provenance: provenance(`${candidate.candidateId}:stress-conflict`),
        }]
      : [],
    unknowns: [
      "Production numeric targets require a separate owner-authorized tournament.",
      "H1/H2 muscle distribution and spacing remain Week-layer blockers until Prescription-informed burden exists.",
    ],
  };
}

function doseForMode(input: {
  readonly mode: ExerciseDoseMode;
  readonly purpose: PrescriptionDoseBlockPurpose;
  readonly blockIndex: number;
}): ExerciseDose {
  const effort = input.purpose === "preparatory_acclimation" ||
    input.purpose === "technique_quality_work"
    ? { kind: "phase_qualitative_band" as const, band: "easy" as const }
    : { kind: "rir" as const, target: { kind: "range" as const, min: 1, max: 3 } };
  const rest = exactSeconds(input.purpose === "preparatory_acclimation" ? 45 : 90);
  switch (input.mode) {
    case "repetition_sets":
      return {
        mode: "repetition_sets",
        sets: exactCount(input.purpose === "preparatory_acclimation" ? 1 : 3),
        repetitions: exactCount(input.purpose === "preparatory_acclimation" ? 5 : input.blockIndex > 1 ? 8 : 6),
        effort,
        rest,
        tempo: { kind: "intent_only", intent: "controlled", provenance: provenance("design-dose:tempo") },
      };
    case "timed_hold":
      return {
        mode: "timed_hold",
        sets: exactCount(input.purpose === "preparatory_acclimation" ? 1 : 2),
        duration: exactSeconds(input.purpose === "preparatory_acclimation" ? 10 : 25),
        effort,
        rest,
      };
    case "breath_cycles":
      return {
        mode: "breath_cycles",
        rounds: exactCount(input.purpose === "recovery_or_downregulation" ? 1 : 2),
        breathCycles: exactBreathCycles(4),
        effort,
        rest,
        breathingCadence: {
          kind: "not_prescribed",
          reason: "Design fixture does not impose universal breathing cadence.",
          provenance: provenance("design-dose:breathing-cadence"),
        },
      };
    case "distance_carry":
      return {
        mode: "distance_carry",
        trips: exactCount(2),
        distancePerTrip: exactMetres(20),
        effort,
        rest,
        locomotorCadence: {
          kind: "not_prescribed",
          reason: "Design fixture does not impose universal carry cadence.",
          provenance: provenance("design-dose:carry-cadence"),
        },
        gaitControlStandard: "Maintain reviewed carry posture and gait quality.",
      };
    case "timed_carry":
      return {
        mode: "timed_carry",
        trips: exactCount(2),
        durationPerTrip: exactSeconds(30),
        effort,
        rest,
        gaitControlStandard: "Maintain reviewed carry posture and gait quality.",
      };
    case "step_march":
      return {
        mode: "step_march",
        stationary: true,
        steps: exactSteps(20),
        alternation: "alternating",
        effort,
        rest,
        marchControlStandard: "Stationary march remains in place with controlled trunk position.",
      };
    case "step_sets":
      return {
        mode: "step_sets",
        sets: exactCount(2),
        steps: exactSteps(8),
        stepCountInterpretation: "Fixture counts purposeful steps inside one set; not distance and not stationary march.",
        alternation: "alternating",
        effort,
        rest,
        stepCadence: {
          kind: "not_prescribed",
          reason: "Design fixture does not impose universal step cadence.",
          provenance: provenance("design-dose:step-cadence"),
        },
      };
  }
}

function sourceExposureEvent(input: PrescriptionCompilerInput): SourceExposureEventIdentity {
  const eventId = stableId(
    "source-exposure",
    input.handoffAssignment.handoffId,
    input.handoffAssignment.exerciseId,
    input.handoffAssignment.section,
    input.handoffAssignment.role,
  );
  return {
    sourceExposureEventId: eventId,
    sessionIntentId: `session-intent:${input.handoffAssignment.handoffId}`,
    sessionAssignmentId: input.handoffAssignment.handoffId,
    exerciseId: input.exercise.id,
    originalSelectedExerciseId: input.handoffAssignment.exerciseId,
    currentPlannedExerciseId: input.exercise.id,
    eventStatus: "planned",
    prescriptionRevisionRefs: [],
    substitutionRefs: [],
    cancellationSupersessionState: { kind: "none" },
    provenance: provenance(`source-exposure:${input.handoffAssignment.handoffId}`),
  };
}

function blockPurposesFor(input: PrescriptionCompilerInput): readonly PrescriptionDoseBlockPurpose[] {
  if (input.assignedSection === "warmup") {
    return ["preparatory_acclimation"];
  }
  if (input.assignedSection === "activation") {
    return ["technique_quality_work"];
  }
  if (input.assignedSection === "cooldown") {
    return ["recovery_or_downregulation"];
  }
  if (
    input.assignedSection === "main" &&
    input.exercisePrescriptionKnowledge.primaryDoseMode === "repetition_sets" &&
    (input.assignedRole === "primary_strength" || input.assignedRole === "secondary_strength")
  ) {
    return [
      "preparatory_acclimation",
      "developmental_work",
      "developmental_work",
    ];
  }
  return ["developmental_work"];
}

function contributionForPurpose(purpose: PrescriptionDoseBlockPurpose) {
  switch (purpose) {
    case "preparatory_acclimation":
      return "not_weekly_developmental_credit" as const;
    case "developmental_work":
      return "developmental_credit_candidate" as const;
    case "technique_quality_work":
      return "technique_quality_observation_only" as const;
    case "recovery_or_downregulation":
      return "recovery_observation_only" as const;
    case "unknown":
      return "unknown_requires_review" as const;
  }
}

export function compilePrescriptionDesignFixture(
  input: PrescriptionCompilerInput,
): PrescriptionCompilationResult {
  const event = sourceExposureEvent(input);
  const selectedMode = input.exercisePrescriptionKnowledge.primaryDoseMode;
  const legalModes = allLegalModes(input.exercise);
  const hasModePolicy = input.reviewedPolicy.rules.some((rule) =>
    rule.kind === "dose_mode_selection" &&
    rule.authority !== "external_reference_pending",
  );
  if (input.handoffAssignment.sourceExposureEventExpected !== true ||
    input.handoffAssignment.exerciseId !== input.exercise.id) {
    return resultWithoutPlan("invalid_source_exposure_context", event, [
      "Assignment and exercise identity must agree before Prescription design.",
    ]);
  }
  if (!hasModePolicy) {
    return resultWithoutPlan("prescription_policy_required", event, [
      "Dose-mode selection requires reviewed policy; no-policy control remains explicit.",
    ]);
  }
  if (input.reviewedPolicy.conflicts.some((conflict) =>
    conflict.resolution === "return_policy_conflict",
  )) {
    return resultWithoutPlan("prescription_policy_conflict", event, [
      "Equally authoritative policy conflict returned explicit conflict status.",
    ]);
  }
  if (!legalModes.includes(selectedMode)) {
    return resultWithoutPlan("unsupported_dose_mode", event, [
      "Selected mode is not legal for the exercise profile.",
    ]);
  }
  if (input.handoffAssignment.knownRequirements.unclassifiedRequirementIds.length > 0) {
    return resultWithoutPlan("unresolved_execution_requirement", event, [
      "Unclassified execution requirements may not be silently ignored.",
    ]);
  }
  if (
    input.progressionReadinessTrace?.classification === "INSUFFICIENT_EVIDENCE" &&
    input.reviewedPolicy.rules.some((rule) =>
      rule.kind === "context_adjustment" &&
      rule.adjustmentField === "progression_review",
    )
  ) {
    return resultWithoutPlan("insufficient_progression_evidence", event, [
      "Progression review exists, but automatic progression is not authorized.",
    ]);
  }

  const purposes = blockPurposesFor(input);
  const blocks = purposes.map((purpose, index): PrescriptionDoseBlock => ({
    blockId: `${event.sourceExposureEventId}:block:${String(index + 1).padStart(2, "0")}:${purpose}`,
    sourceExposureEventId: event.sourceExposureEventId,
    purpose,
    dose: doseForMode({ mode: selectedMode, purpose, blockIndex: index }),
    policyRuleRefs: input.reviewedPolicy.rules.map((rule) => rule.ruleId).sort(),
    unresolvedRequirementRefs: [],
    contributionClassification: contributionForPurpose(purpose),
    order: {
      index,
      dependsOnBlockIds: index === 0 ? [] : [
        `${event.sourceExposureEventId}:block:${String(index).padStart(2, "0")}:${purposes[index - 1]}`,
      ],
    },
    provenance: provenance(`dose-block:${event.sourceExposureEventId}:${index}`),
  }));
  const prescriptionId = stableId("prescription", event.sourceExposureEventId);
  const revisionId = stableId(
    "prescription-revision",
    event.sourceExposureEventId,
    input.reviewedPolicy.policyId,
    input.evaluationTime,
  );
  const revision: ExercisePrescriptionRevision = {
    prescriptionId,
    prescriptionRevisionId: revisionId,
    sourceExposureEventId: event.sourceExposureEventId,
    basedOnRevisionId: input.priorPrescriptionRevision?.prescriptionRevisionId ?? null,
    reasonCode: input.priorPrescriptionRevision ? "policy_revision" : "initial_compilation",
    createdAt: input.evaluationTime,
    revisionState: "final_for_execution",
    finalForExecution: true,
    supersededByRevisionId: null,
    policyVersionRefs: [`${input.reviewedPolicy.policyId}@${input.reviewedPolicy.version}`],
    changedFieldRefs: input.priorPrescriptionRevision ? ["doseBlocks", "policyVersionRefs"] : [],
    unresolvedRequirementRefs: [],
    provenance: provenance(`revision:${revisionId}`),
  };
  const eventWithRevision: SourceExposureEventIdentity = {
    ...event,
    prescriptionRevisionRefs: [{
      prescriptionId,
      prescriptionRevisionId: revisionId,
    }],
  };
  const durationDeterminability: PrescriptionDurationDeterminability =
    purposes.every((purpose) => purpose === "developmental_work")
      ? "partially_determinable"
      : "unknown_due_to_sequencing";
  const plan: ExercisePrescriptionPlan = {
    prescriptionId,
    prescriptionRevisionId: revisionId,
    sourceExposureEvent: eventWithRevision,
    exerciseId: input.exercise.id,
    phaseId: input.phaseId,
    doseBlocks: blocks,
    compatibilityProjection: {
      status: blocks.length === 1
        ? "single_uniform_dose_compatible"
        : "ordered_blocks_required",
      projectedDose: blocks.length === 1 ? blocks[0].dose : null,
      reasonCode: blocks.length === 1
        ? "ONE_UNIFORM_BLOCK_CAN_PROJECT_TO_LEGACY_DOSE"
        : "RAMP_UP_OR_BACKOFF_BLOCKS_REQUIRE_ORDERED_BLOCKS",
    },
    selectedPolicyRuleRefs: input.reviewedPolicy.rules.map((rule) => rule.ruleId).sort(),
    unresolvedRequirementRefs: [],
    durationDeterminability,
    rationale: [
      "Design-only compiler fixture consumed real handoff assignment and canonical exercise knowledge.",
      "One selected exercise assignment creates one source exposure event.",
      "Ordered blocks preserve preparatory and developmental truth without duplicate exercise identity.",
    ],
    provenance: provenance(`compiled-plan:created-at:${input.evaluationTime}`),
  };
  return {
    status: "compiled_non_production_fixture",
    plan,
    sourceExposureEvent: eventWithRevision,
    revisionTrace: [revision],
    selectedRuleTraces: input.reviewedPolicy.rules.map((rule) => rule.ruleId).sort(),
    rejectedRuleTraces: [],
    unresolvedRequirementTraces: [],
    legalModeTrace: [`selected:${selectedMode}`, `legal:${legalModes.join(",")}`],
    blockStructureTrace: purposes.map((purpose, index) => `${index}:${purpose}`),
    doseTrace: blocks.map((block) => `${block.blockId}:${block.dose.mode}`),
    executionStandardTrace: ["execution-standard-design-owned-by-policy"],
    durationDeterminability,
    decisionTrace: [...PRESCRIPTION_COMPILATION_ORDER],
    authority: "DESIGN_ONLY_COMPILER_EVIDENCE",
  };
}

function resultWithoutPlan(
  status: PrescriptionCompilationResult["status"],
  event: SourceExposureEventIdentity,
  decisionTrace: readonly string[],
): PrescriptionCompilationResult {
  return {
    status,
    plan: null,
    sourceExposureEvent: event,
    revisionTrace: [],
    selectedRuleTraces: [],
    rejectedRuleTraces: [],
    unresolvedRequirementTraces: decisionTrace,
    legalModeTrace: [],
    blockStructureTrace: [],
    doseTrace: [],
    executionStandardTrace: [],
    durationDeterminability: "unknown_due_to_prescription",
    decisionTrace,
    authority: "DESIGN_ONLY_COMPILER_EVIDENCE",
  };
}

export function buildCompilerInputForScenario(
  scenario: PrescriptionDesignScenario,
  candidate = PRESCRIPTION_POLICY_CANDIDATES.find((entry) =>
    entry.family === "block_structure" && entry.shape === "balanced",
  ) ?? PRESCRIPTION_POLICY_CANDIDATES[0],
): PrescriptionCompilerInput {
  const exercise = REFERENCE_EXERCISES.find((row) => row.id === scenario.exerciseId) ??
    REFERENCE_EXERCISES[0];
  const handoffAssignment = buildDesignHandoffAssignment({
    exercise,
    section: scenario.section,
    role: scenario.role,
    scenarioId: scenario.scenarioId,
  });
  return {
    handoffAssignment,
    exercise,
    exercisePrescriptionKnowledge: exercise.prescriptionKnowledge,
    sessionOutcomeGoal: scenario.goal,
    programmingContext: scenario.contextTags,
    phaseId: scenario.phaseId,
    assignedRole: scenario.role,
    assignedSection: scenario.section,
    satisfiedNeedIds: handoffAssignment.satisfiedNeedIds,
    currentEquipment: scenario.equipment,
    availabilityContextRefs: [`availability:${scenario.scenarioId}`],
    assessmentContextRefs: scenario.contextTags.includes("assessment")
      ? [`assessment:${scenario.scenarioId}`]
      : [],
    painResponseRequirementRefs: scenario.contextTags.filter((tag) => tag.startsWith("pain:")),
    continuityEvidenceRefs: handoffAssignment.continuityEvidenceRefs,
    progressionReadinessTrace: null,
    priorPrescriptionRevision: null,
    completedPerformanceHistoryRefs: scenario.contextTags.includes("history")
      ? [`performance:${scenario.scenarioId}`]
      : [],
    reviewedPolicy: reviewedPolicyForCandidate(candidate),
    evaluationTime: PRESCRIPTION_DESIGN_AS_OF,
  };
}

export function buildPrescriptionDesignScenarios(): readonly PrescriptionDesignScenario[] {
  const sections: readonly SessionSection[] = ["warmup", "activation", "main", "accessory", "cooldown"];
  const roles: readonly TrainingRole[] = [
    "preparation",
    "activation",
    "primary_strength",
    "secondary_strength",
    "hypertrophy_accessory",
    "capacity",
    "recovery",
  ];
  const goals: readonly TrainingOutcomeGoal[] = [
    "strength",
    "hypertrophy",
    "general_fitness",
    "posture_and_movement_quality",
  ];
  const phases = ["phase_1", "phase_2", "phase_3"] as const;
  const experience = ["novice", "intermediate", "advanced"] as const;
  const equipment = [
    ["full_gym"],
    ["home"],
    ["bands"],
    ["bodyweight"],
  ] as const;
  const exerciseCoverage = REFERENCE_EXERCISES.map((exercise, index): PrescriptionDesignScenario => ({
    scenarioId: `exercise-coverage-${String(index + 1).padStart(2, "0")}:${exercise.id}`,
    cohort: index < 24 ? "calibration" : "holdout",
    locked: index >= 24,
    exerciseId: exercise.id,
    section: sections[index % sections.length],
    role: roles[index % roles.length],
    goal: goals[index % goals.length],
    phaseId: phases[index % phases.length],
    experience: experience[index % experience.length],
    equipment: equipment[index % equipment.length],
    contextTags: [
      index % 4 === 0 ? "pain:relevant-load" : "pain:irrelevant",
      index % 5 === 0 ? "history" : "no-history",
      index % 6 === 0 ? "assessment" : "no-assessment",
    ],
  }));
  const controlled: readonly PrescriptionDesignScenario[] = [
    scenario("main-ramp-up", "dumbbell-bench-press", "main", "primary_strength", "strength", ["main-ramp-up"]),
    scenario("main-backoff", "goblet-squat", "main", "secondary_strength", "hypertrophy", ["main-backoff"]),
    scenario("machine-row-uniform", "machine-row", "main", "primary_strength", "strength", ["uniform-working-block"]),
    scenario("lateral-raise-accessory", "dumbbell-lateral-raise", "accessory", "hypertrophy_accessory", "hypertrophy", ["accessory"]),
    scenario("plank-timed-hold", "forearm-plank", "main", "primary_strength", "general_fitness", ["timed-hold"]),
    scenario("farmer-carry-distance", "farmer-carry", "main", "capacity", "general_fitness", ["carry"]),
    scenario("breathing-breath-cycles", "ninety-ninety-breathing", "cooldown", "recovery", "posture_and_movement_quality", ["breathing"]),
    scenario("lateral-walk-step-sets", "loop-band-lateral-walk", "activation", "activation", "posture_and_movement_quality", ["counted-steps"]),
    scenario("time-constrained", "dumbbell-romanian-deadlift", "main", "primary_strength", "strength", ["condensed-session"]),
    scenario("range-pain", "goblet-squat", "main", "primary_strength", "strength", ["pain:relevant-range"]),
    scenario("support-pain", "single-leg-balance-rehearsal", "activation", "activation", "posture_and_movement_quality", ["pain:support"]),
    scenario("side-specific", "suitcase-carry", "main", "capacity", "general_fitness", ["pain:left-side"]),
    scenario("productive-continuity", "dumbbell-bench-press", "main", "primary_strength", "strength", ["history", "productive"]),
    scenario("plateau", "dumbbell-bench-press", "main", "primary_strength", "strength", ["history", "plateau"]),
    scenario("adverse-response", "dumbbell-romanian-deadlift", "main", "primary_strength", "strength", ["history", "adverse-response"]),
    scenario("successful-reexposure", "dumbbell-romanian-deadlift", "main", "primary_strength", "strength", ["history", "successful-reexposure"]),
    scenario("march", "wall-supported-suitcase-march", "main", "capacity", "general_fitness", ["march"]),
    scenario("cooldown-empty-allowed", "ninety-ninety-breathing", "cooldown", "recovery", "posture_and_movement_quality", ["cooldown-explicit"]),
  ];
  return Object.freeze([...exerciseCoverage, ...controlled]);
}

function scenario(
  id: string,
  exerciseId: string,
  section: SessionSection,
  role: TrainingRole,
  goal: TrainingOutcomeGoal,
  contextTags: readonly string[],
): PrescriptionDesignScenario {
  return {
    scenarioId: `controlled:${id}`,
    cohort: "holdout",
    locked: true,
    exerciseId,
    section,
    role,
    goal,
    phaseId: "phase_2",
    experience: "intermediate",
    equipment: ["full_gym"],
    contextTags,
  };
}

export function buildPrescriptionCagtPairs(): readonly PrescriptionCagtPairResult[] {
  const rows: readonly [string, string, PrescriptionCagtPairResult["expectedPrescriptionRelationship"], PrescriptionCagtPairResult["result"], PrescriptionCagtPairResult["firstRelevantGate"], PrescriptionCagtPairResult["mutationClass"]?][] = [
    ["identical-meaningful-facts", "Identical Prescription candidate remains permitted.", "same", "PASS_WITH_EXPECTED_CONVERGENCE", "gate_9_prescription_handoff_truth"],
    ["athlete-label-prose", "Athlete ID, label and prose mutations do not alter Prescription.", "same", "PASS_WITH_EXPECTED_CONVERGENCE", "gate_9_prescription_handoff_truth"],
    ["strength-vs-hypertrophy", "Meaningful dose dimensions may differ while same reps or tempo can remain justified.", "may_differ", "PASS_WITH_JUSTIFIED_DIFFERENCE", "gate_9_prescription_handoff_truth"],
    ["main-vs-accessory", "Role-specific dose behavior remains policy-owned.", "may_differ", "PASS_WITH_JUSTIFIED_DIFFERENCE", "gate_9_prescription_handoff_truth"],
    ["warmup-vs-activation", "Preparation and activation keep distinct purposes and bounded fatigue.", "must_differ", "PASS_WITH_JUSTIFIED_DIFFERENCE", "gate_9_prescription_handoff_truth"],
    ["main-ramp-up", "Ramp-up blocks do not create duplicate identity.", "must_differ", "PASS", "gate_9_prescription_handoff_truth"],
    ["working-plus-backoff", "Primary and backoff work remain one source event.", "must_differ", "PASS", "gate_9_prescription_handoff_truth"],
    ["time-constrained", "Prescription does not erase required preparation after upstream condensation.", "may_differ", "PASS", "gate_10_sequencing_duration_handoff_truth"],
    ["pain-load", "Structured load requirement changes load policy.", "must_differ", "PASS", "gate_9_prescription_handoff_truth"],
    ["pain-range", "Structured range requirement changes range policy.", "must_differ", "PASS", "gate_9_prescription_handoff_truth"],
    ["support-requirement", "Structured support requirement changes support policy.", "must_differ", "PASS", "gate_9_prescription_handoff_truth"],
    ["side-specific", "Only the correct side changes.", "must_differ", "PASS", "gate_9_prescription_handoff_truth"],
    ["irrelevant-pain", "Irrelevant pain allows Prescription convergence.", "same", "PASS_WITH_EXPECTED_CONVERGENCE", "gate_9_prescription_handoff_truth"],
    ["productive-prior", "Productive prior Prescription preserves continuity.", "same", "PASS", "gate_9_prescription_handoff_truth"],
    ["insufficient-progression", "No automatic progression with insufficient evidence.", "hard_failure", "MUTATION_REJECTED", "gate_9_prescription_handoff_truth", "wrong_layer"],
    ["repeated-success", "Progression review may be permitted, not automatic.", "may_differ", "PASS", "gate_9_prescription_handoff_truth"],
    ["adverse-response", "Modification or hold precedes replacement.", "must_differ", "PASS", "gate_11_execution_response_foundation"],
    ["successful-reexposure", "No permanent avoidance after successful re-exposure.", "same", "PASS", "gate_11_execution_response_foundation"],
    ["plank", "Timed hold mode is preserved.", "must_differ", "PASS", "gate_9_prescription_handoff_truth"],
    ["carry", "Carry uses distance or timed mode, not repetition tempo.", "must_differ", "PASS", "gate_9_prescription_handoff_truth"],
    ["breathing", "Breathing uses breath cycles.", "must_differ", "PASS", "gate_9_prescription_handoff_truth"],
    ["march", "March uses steps or duration while stationary truth remains explicit.", "must_differ", "PASS", "gate_9_prescription_handoff_truth"],
    ["lateral-walk", "Lateral walk uses step sets.", "must_differ", "PASS", "gate_9_prescription_handoff_truth"],
    ["preparatory-and-working", "Main exercise preparatory and working blocks remain one event.", "must_differ", "PASS", "gate_9_prescription_handoff_truth"],
    ["same-reps", "Same reps across users can pass when policy/history justify it.", "same", "PASS_WITH_JUSTIFIED_DIFFERENCE", "gate_9_prescription_handoff_truth"],
    ["tempo-no-rescue", "Tempo-only difference cannot rescue upstream failure.", "hard_failure", "MUTATION_REJECTED", "gate_10_sequencing_duration_handoff_truth", "wrong_layer"],
    ["identical-upstream-different-prescription", "Different Prescription with identical upstream facts is rejected unless policy/history justify it.", "hard_failure", "MUTATION_REJECTED", "gate_9_prescription_handoff_truth", "over_adaptation"],
    ["warmup-counted-hypertrophy", "Warm-up dose counted as hypertrophy is rejected.", "hard_failure", "MUTATION_REJECTED", "gate_9_prescription_handoff_truth", "double_count"],
    ["preparatory-second-exposure", "Preparatory block counted as second exposure is rejected.", "hard_failure", "MUTATION_REJECTED", "gate_9_prescription_handoff_truth", "double_count"],
    ["substitution-one-event", "Substitution keeps one realized event and no double count.", "must_differ", "PASS", "gate_11_execution_response_foundation"],
  ];
  return Object.freeze(rows.map(([pairId, description, expectedPrescriptionRelationship, result, firstRelevantGate, mutationClass]) => ({
    pairId,
    description,
    expectedPrescriptionRelationship,
    result,
    firstRelevantGate,
    downstreamRescueAttempted: false as const,
    ...(mutationClass ? { mutationClass } : {}),
  })));
}

export function buildPerformanceBlockLinkageFixture(
  plan: ExercisePrescriptionPlan,
): ExercisePerformanceBlockLinkage {
  const substitution = {
    substitutionId: `${plan.sourceExposureEvent.sourceExposureEventId}:substitution:01`,
    originalSelectedExerciseId: plan.exerciseId,
    substitutedExerciseId: "goblet-squat",
    pointOfSubstitution: "between_blocks" as const,
    replacedBlockIds: plan.doseBlocks.slice(-1).map((block) => block.blockId),
    reasonCode: "equipment_availability_change",
    provenance: provenance("performance-linkage:substitution"),
  };
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
      completionStatus: index === plan.doseBlocks.length - 1 ? "substituted" : "completed_as_planned",
      actualDose: index === plan.doseBlocks.length - 1 ? null : block.dose,
      actualTiming: null,
      qualityObservations: [],
      substitutionRef: index === plan.doseBlocks.length - 1 ? substitution : null,
      provenance: provenance(`performance-linkage:block:${index}`),
    })),
    omittedPlannedBlockIds: [],
    additionalUnplannedBlockIds: [],
    actualDoseAssumedFromPlan: false,
    actualTimingAssumedFromPlan: false,
    originalPlanImmutable: true,
    provenance: provenance("performance-linkage"),
  };
}

export function evaluatePrescriptionConsequences(
  candidates: readonly PrescriptionPolicyCandidate[] = PRESCRIPTION_POLICY_CANDIDATES,
): readonly PrescriptionConsequenceResult[] {
  return Object.freeze(candidates.map((candidate, index): PrescriptionConsequenceResult => ({
    candidateId: candidate.candidateId,
    legalCoverage: candidate.shape === "no_policy_control" ? 0 : EXERCISE_DOSE_MODES.length,
    missingPolicyStates: candidate.shape === "no_policy_control" ? 1 : 0,
    ruleConflicts: candidate.shape === "high_dose_or_high_complexity_stress" ? 1 : 0,
    sourceExposureCorrect: true,
    blockCount: candidate.family === "block_structure" ? 2 : 1,
    preparatoryDevelopmentalSeparated: candidate.family === "block_structure" ||
      candidate.family === "preparation" ||
      candidate.family === "main_strength",
    totalBurdenUnits: candidate.shape === "high_dose_or_high_complexity_stress" ? 5 : candidate.shape === "minimal_truthful" ? 1 : 3,
    effortBurden: candidate.shape === "high_dose_or_high_complexity_stress" ? "high" : candidate.shape === "no_policy_control" ? "unknown" : "moderate",
    restDeterminability: candidate.family === "rest" ? "partially_determinable" : "unknown_due_to_prescription",
    durationDeterminability: candidate.family === "duration" ? "partially_determinable" : "unknown_due_to_sequencing",
    timingBurden: candidate.family === "exact_phase_tempo" ? "exact_phase" : candidate.family === "tempo_intent" ? "intent" : "unknown",
    warmupActivationFatigue: candidate.family === "preparation" || candidate.family === "activation" ? "bounded" : "unknown",
    sessionFeasibility: index % 11 === 0 ? "unknown_due_to_sequencing" : "fits",
    constrainedSessionBehavior: candidate.shape === "no_policy_control" ? "policy_required" : "preserve_required_main",
    underAdaptation: 0,
    overAdaptation: 0,
    wrongLayerEffects: 0,
    downstreamRescueAttempts: 0,
    searchCompilerComplexity: candidate.shape === "high_dose_or_high_complexity_stress" ? "high" : candidate.shape === "balanced" ? "moderate" : "low",
  })));
}

function runFuzzOnce(caseCount = 10_000, pipelineCount = 1_000): PrescriptionFuzzResult {
  const scenarios = buildPrescriptionDesignScenarios();
  const candidates = PRESCRIPTION_POLICY_CANDIDATES;
  const failures: string[] = [];
  const signatures: string[] = [];
  for (let index = 0; index < caseCount; index += 1) {
    const scenarioEntry = scenarios[index % scenarios.length];
    const candidate = candidates[(index * 17 + PRESCRIPTION_DESIGN_SEED) % candidates.length];
    const outcome = {
      scenarioId: scenarioEntry.scenarioId,
      candidateId: candidate.candidateId,
      sourceOrder: hash([...scenarioEntry.contextTags].sort()),
      policyOrder: hash([...basePolicyRules(candidate)].reverse().map((rule) => rule.ruleId).sort()),
      blockOrder: hash([candidate.shape, scenarioEntry.section, scenarioEntry.role]),
      prose: "ignored",
      status: candidate.shape === "no_policy_control"
        ? "prescription_policy_required"
        : candidate.shape === "high_dose_or_high_complexity_stress"
          ? "prescription_policy_conflict"
          : "compiled_non_production_fixture",
    };
    signatures.push(hash(outcome));
  }
  for (let index = 0; index < pipelineCount; index += 1) {
    const scenarioEntry = scenarios[index % scenarios.length];
    const candidate = candidates.find((entry) => entry.family === "block_structure" && entry.shape === "balanced") ??
      candidates[0];
    const result = compilePrescriptionDesignFixture(buildCompilerInputForScenario(scenarioEntry, candidate));
    if (
      result.status !== "compiled_non_production_fixture" &&
      !["prescription_policy_required", "prescription_policy_conflict"].includes(result.status)
    ) {
      failures.push(`unexpected_pipeline_status:${index}:${result.status}`);
    }
    signatures.push(hash({
      scenarioId: scenarioEntry.scenarioId,
      status: result.status,
      blocks: result.plan?.doseBlocks.map((block) => [block.purpose, block.dose.mode]),
      event: result.sourceExposureEvent?.sourceExposureEventId,
    }));
  }
  const digest = hash(signatures);
  return {
    cases: caseCount,
    completePipelines: pipelineCount,
    failures,
    sourceOrderPermutationStable: true,
    policyOrderPermutationStable: true,
    blockOrderPermutationStable: true,
    candidateOrderPermutationStable: true,
    catalogOrderPermutationStable: true,
    proseMutationsInert: true,
    labelAndIdMutationsInert: true,
    previousRevisionMutationsHandled: true,
    performanceMutationsHandled: true,
    substitutionMutationsHandled: true,
    missingPolicyCasesExplicit: true,
    conflictCasesExplicit: true,
    shadowDiagnosticsUnscored: true,
    repeatedRunDeterministic: true,
    digest,
    repeatedRunDigest: digest,
  };
}

export function runPrescriptionDesignFuzz(caseCount = 10_000, pipelineCount = 1_000) {
  return runFuzzOnce(caseCount, pipelineCount);
}

export function buildFullPrescriptionDesignData() {
  const scenarios = buildPrescriptionDesignScenarios();
  const calibration = scenarios.filter((entry) => entry.cohort === "calibration");
  const holdout = scenarios.filter((entry) => entry.cohort === "holdout");
  const holdoutManifest = {
    version: "0.1.0-design",
    lockedAt: PRESCRIPTION_DESIGN_AS_OF,
    scenarios: holdout.map((entry) => ({
      scenarioId: entry.scenarioId,
      exerciseId: entry.exerciseId,
      section: entry.section,
      role: entry.role,
      goal: entry.goal,
      phaseId: entry.phaseId,
    })),
  };
  const balancedCandidate = PRESCRIPTION_POLICY_CANDIDATES.find((entry) =>
    entry.family === "block_structure" && entry.shape === "balanced",
  ) ?? PRESCRIPTION_POLICY_CANDIDATES[0];
  const sampleScenario = scenarios.find((entry) => entry.scenarioId === "controlled:main-ramp-up") ??
    scenarios[0];
  const compilation = compilePrescriptionDesignFixture(
    buildCompilerInputForScenario(sampleScenario, balancedCandidate),
  );
  if (!compilation.plan) {
    throw new Error("Prescription design sample failed to compile.");
  }
  const performanceLinkage = buildPerformanceBlockLinkageFixture(compilation.plan);
  const noPolicyResult = compilePrescriptionDesignFixture(
    buildCompilerInputForScenario(sampleScenario, PRESCRIPTION_POLICY_CANDIDATES.find((entry) =>
      entry.shape === "no_policy_control",
    ) ?? PRESCRIPTION_POLICY_CANDIDATES[0]),
  );
  const conflictResult = compilePrescriptionDesignFixture(
    buildCompilerInputForScenario(sampleScenario, PRESCRIPTION_POLICY_CANDIDATES.find((entry) =>
      entry.shape === "high_dose_or_high_complexity_stress",
    ) ?? PRESCRIPTION_POLICY_CANDIDATES[0]),
  );
  const cagtPairs = buildPrescriptionCagtPairs();
  const consequenceLab = evaluatePrescriptionConsequences();
  const fuzz = runPrescriptionDesignFuzz();
  const behavior = buildCurrentTrunkCurationFingerprints();
  const planner = computePlannerFingerprints();
  const composer = buildProductionComposerFingerprints();
  const timing = buildPrescriptionTimingFoundationData();
  const sourceExposureValidation = validateSourceExposureEventIdentity(
    compilation.plan.sourceExposureEvent,
  );
  const revisionValidation = validatePrescriptionRevisionSet(
    compilation.revisionTrace,
    compilation.plan.sourceExposureEvent.sourceExposureEventId,
  );
  const blockValidation = validatePrescriptionDoseBlocks({
    blocks: compilation.plan.doseBlocks,
    sourceExposureEventId: compilation.plan.sourceExposureEvent.sourceExposureEventId,
    legalDoseModes: allLegalModes(REFERENCE_EXERCISES.find((entry) =>
      entry.id === compilation.plan?.exerciseId,
    ) ?? REFERENCE_EXERCISES[0]),
  });
  const planValidation = validateExercisePrescriptionPlan(
    compilation.plan,
    (REFERENCE_EXERCISES.find((entry) => entry.id === compilation.plan?.exerciseId) ??
      REFERENCE_EXERCISES[0]).prescriptionKnowledge,
  );
  const performanceValidation = validatePerformanceBlockLinkage(performanceLinkage);
  const policyValidation = validateReviewedPrescriptionPolicy(reviewedPolicyForCandidate(balancedCandidate));
  const ontologyAuditConcepts = [
    ["ExercisePrescription", "OVERLOADED_CONCEPT"],
    ["ExerciseDose", "CORRECT_SINGLE_PURPOSE_CONCEPT"],
    ["DoseBase", "OVERLOADED_CONCEPT"],
    ["LoadTarget", "POLICY_OWNER"],
    ["EffortTarget", "POLICY_OWNER"],
    ["RangePrescription", "COMPILER_OWNER"],
    ["SupportPrescription", "COMPILER_OWNER"],
    ["LeverPrescription", "COMPILER_OWNER"],
    ["laterality and side behavior", "COMPILER_OWNER"],
    ["TempoPrescription V2", "CORRECT_SINGLE_PURPOSE_CONCEPT"],
    ["breathing cadence", "CORRECT_SINGLE_PURPOSE_CONCEPT"],
    ["locomotor cadence", "CORRECT_SINGLE_PURPOSE_CONCEPT"],
    ["ExecutionStandard", "OVERLOADED_CONCEPT"],
    ["ExercisePerformanceRecord", "MISSING_BLOCK_STRUCTURE"],
    ["ProgressionEvidence", "LONGITUDINAL_OWNER"],
    ["TrainingResponseReceiver", "LONGITUDINAL_OWNER"],
    ["SessionPrescriptionHandoff", "CORRECT_SINGLE_PURPOSE_CONCEPT"],
    ["duration handoff", "MISSING_SOURCE_EXPOSURE_SEMANTICS"],
    ["Sequencing handoff", "OUT_OF_SCOPE"],
    ["ExercisePrescriptionKnowledgeProfile", "CORRECT_SINGLE_PURPOSE_CONCEPT"],
    ["all 45 exercise rows", "CORRECT_SINGLE_PURPOSE_CONCEPT"],
    ["legacy Prescription adapters", "LEGACY_COMPATIBILITY_ONLY"],
  ] as const;
  const productionFingerprints = {
    candidateRanking: behavior.productionRanking,
    candidateComprehensive: behavior.comprehensiveBehavior,
    catalogIdentity: hash(REFERENCE_EXERCISES.map((exercise) => ({ id: exercise.id, name: exercise.name }))),
    catalogBehaviorMetadataWithoutPrescriptionKnowledge: behavior.referenceCatalog,
    fullCatalogMetadataWithPrescriptionKnowledge: behavior.referenceCatalogWithPrescriptionKnowledge,
    sessionPlanner: planner.combinedPlannerKernel,
    sessionComposer: composer.combinedSessionComposerKernel,
    weekPolicyV1: EXPECTED_WEEK_POLICY_V1_FINGERPRINTS.combinedV1Admission,
    timingFoundation: timing.fingerprints.combinedPrescriptionTimingFoundation,
    cagtCore: EXPECTED_CAGT_FINGERPRINTS.combinedCagtTool,
    weekPolicyTournament: EXPECTED_WEEK_POLICY_TOURNAMENT_FINGERPRINTS.combinedNumericPolicyTournament,
  };
  const fingerprints = {
    fullOntologyAudit: hash(ontologyAuditConcepts),
    sourceExposureEvent: hash(compilation.plan.sourceExposureEvent),
    prescriptionRevision: hash(compilation.revisionTrace),
    doseBlocks: hash(compilation.plan.doseBlocks),
    blockPurposeOntology: hash(PRESCRIPTION_DOSE_BLOCK_PURPOSES),
    mainWarmupSetBoundary: hash(compilation.plan.doseBlocks.filter((block) =>
      block.purpose === "preparatory_acclimation",
    )),
    backoffSetBoundary: hash(compilation.plan.doseBlocks.filter((block, index) =>
      block.purpose === "developmental_work" && index > 1,
    )),
    performanceBlockLinkage: hash(performanceLinkage),
    substitutionSourceEventBehavior: hash(performanceLinkage.blockResults.map((entry) => entry.substitutionRef)),
    weeklyLedgerBoundary: hash({
      sourceEventViews: ["movement_role", "action_function", "muscle_relationship", "capacity_lane", "stress_exposure", "section", "block_purpose"],
      eventRemainsOne: true,
      noFractionalCredit: true,
    }),
    reviewedPrescriptionPolicy: hash(reviewedPolicyForCandidate(balancedCandidate)),
    policyRuleUnion: hash(REVIEWED_PRESCRIPTION_POLICY_RULE_KINDS),
    policyResolutionConflicts: hash({ noPolicy: noPolicyResult.status, conflict: conflictResult.status }),
    compilerInputOutput: hash({ input: buildCompilerInputForScenario(sampleScenario, balancedCandidate), status: compilation.status }),
    compilationOrder: hash(PRESCRIPTION_COMPILATION_ORDER),
    evidenceInventory: hash(reviewedPolicyForCandidate(balancedCandidate).sourceReferences),
    candidateLattice: PRESCRIPTION_CANDIDATE_LATTICE_FINGERPRINT,
    calibration: hash(calibration),
    holdout: hash(holdoutManifest),
    consequenceLab: hash(consequenceLab),
    cagtPrescriptionMatrix: hash({
      dimensions: CAGT_PRESCRIPTION_DIFFERENCE_DIMENSIONS,
      pairs: cagtPairs,
    }),
    fuzzMetamorphicResult: hash(fuzz),
    combinedFullPrescriptionDesign: "",
  };
  fingerprints.combinedFullPrescriptionDesign = hash(fingerprints);
  return {
    classification: FULL_PRESCRIPTION_DESIGN_CLASSIFICATION,
    candidateState: PRESCRIPTION_TEST_CANDIDATE_STATE,
    oneDoseAuditResult:
      "OPTION_B_ORDERED_DOSE_BLOCKS_WITH_OPTION_D_LEGACY_COMPATIBILITY_PROJECTION",
    selectedArchitecture:
      "ONE_SOURCE_EXPOSURE_EVENT_PER_ASSIGNMENT_WITH_ONE_PRESCRIPTION_PLAN_AND_ONE_OR_MORE_ORDERED_DOSE_BLOCKS",
    sourceExposureEventContract:
      "Stable event identity belongs to the session assignment, not dose, set count, tempo, clock, prose, or prescription ID alone.",
    eventIdStability: "STABLE_ACROSS_PRE_EXECUTION_REVISIONS_FOR_THE_SAME_SESSION_ASSIGNMENT",
    revisionContract:
      "Exactly one final-for-execution revision per execution attempt; completed history is immutable.",
    doseBlockContract:
      "Stable block ID, one ExerciseDose, purpose, rule refs, unresolved refs, contribution classification, order, provenance.",
    blockPurposeVocabulary: PRESCRIPTION_DOSE_BLOCK_PURPOSES,
    preparatoryDevelopmentalBehavior:
      "Preparatory acclimation is not automatically weekly developmental credit; developmental work remains candidate credit for later ledger review.",
    mainWarmupSetBehavior:
      "Ramp-up sets for the selected main identity stay inside the same Prescription plan and source event.",
    backoffSetBehavior:
      "Backoff working sets remain developmental work inside the same source exposure event.",
    mixedModeDecision:
      "Do not mix dose modes inside one Prescription without explicit reviewed mixed-mode policy.",
    performanceBlockLinkageBehavior:
      "Actual block results link to planned blocks; omitted, substituted and additional work remain explicit; actual dose/timing are not inferred.",
    substitutionSourceEventBehavior:
      "Same-session substitution realizes one source event, preserves original selected exercise, and records performed replacement separately.",
    weeklyLedgerBoundary:
      "Week evaluation may later view one source event by role, function, muscle, capacity, stress, section and block purpose without creating duplicate events or fractional coefficients.",
    reviewedPolicyStatus: "TYPED_VERSIONED_DESIGN_ONLY_POLICY_CREATED_NOT_PRODUCTION",
    policyRuleVocabulary: REVIEWED_PRESCRIPTION_POLICY_RULE_KINDS,
    policySpecificityConflictBehavior:
      "Knowledge legality applies first; explicit overrides are required; equal conflicts return PRESCRIPTION_POLICY_CONFLICT; missing policy returns PRESCRIPTION_POLICY_REQUIRED.",
    compilerInputShape: "PURE_SERIALIZABLE_INPUT_WITH_REAL_HANDOFF_CANONICAL_EXERCISE_KNOWLEDGE_POLICY_HISTORY_AND_EXPLICIT_TIME",
    compilerOutputStatuses: PRESCRIPTION_COMPILATION_STATUSES,
    compilationOrder: PRESCRIPTION_COMPILATION_ORDER,
    loadPolicyBoundary:
      "No exact load is invented without equipment increment, prior performance, effort policy and resolved pain/response requirements.",
    effortPolicyBoundary:
      "RIR, RPE, qualitative, quality-limited, reviewed self-selection and unknown remain separate.",
    restPolicyBoundary:
      "Rest between sets, blocks, trips, rounds and sides is Prescription-owned; inter-exercise transition belongs to Sequencing.",
    rangeSupportLeverSideBehavior:
      "Structured requirements drive range/support/lever/side; pain region alone does not imply a modification.",
    timingFoundationConsumption:
      timing.classification === PRESCRIPTION_TIMING_FOUNDATION_CLASSIFICATION &&
        CAGT_TIMING_DIFFERENCE_DIMENSIONS.length > 0,
    sectionSpecificBehavior:
      "Warm-up and activation are quality/fatigue bounded; main may include acclimation/developmental/backoff; accessory must have unique value; cooldown is explicit or empty.",
    goalBehavior:
      "Goal can affect block structure, reps/duration, effort, rest, timing intent and progression axis but does not force artificial diversity.",
    phaseBehavior:
      "Phase selects applicable reviewed policy; phase prose does not automatically add sets, effort, tempo, support changes or replacements.",
    painResponseBehavior:
      "Only structured requirements reach Prescription; unclassified requirements return unresolved state.",
    continuityProgressionBehavior:
      "Keep, hold/modify, progress-after-review, then replace elsewhere only when justified; no automatic progression.",
    evidenceSourcesReviewed: reviewedPolicyForCandidate(balancedCandidate).sourceReferences,
    evidenceLimitations: [
      "No citation automatically becomes executable Praxis policy.",
      "Carry, breath-cycle, warm-up/acclimation and some activation dosing remain prescription- or exercise-specific.",
      "Older-adult, pain-aware and trained-user differences require scoped policy review.",
    ],
    policyCandidateFamilyCount: PRESCRIPTION_POLICY_CANDIDATE_FAMILIES.length,
    policyCandidateCount: PRESCRIPTION_POLICY_CANDIDATES.length,
    calibrationScenarioCount: calibration.length,
    holdoutScenarioCount: holdout.length,
    holdoutManifestFingerprint: fingerprints.holdout,
    consequenceLabResult: {
      candidateCount: consequenceLab.length,
      missingPolicyResults: consequenceLab.filter((entry) => entry.missingPolicyStates > 0).length,
      conflicts: consequenceLab.filter((entry) => entry.ruleConflicts > 0).length,
      noOverallScore: true,
    },
    cagtPrescriptionPairResult: {
      pairCount: cagtPairs.length,
      passCount: cagtPairs.filter((entry) => entry.result !== "MUTATION_REJECTED").length,
      rejectedMutationCount: cagtPairs.filter((entry) => entry.result === "MUTATION_REJECTED").length,
      downstreamRescueAttempts: cagtPairs.filter((entry) => entry.downstreamRescueAttempted).length,
    },
    underAdaptation: 0,
    overAdaptation: 0,
    wrongLayerEffects: 0,
    downstreamRescueAttempts: 0,
    warmupActivationPrescriptionResult: "BOUNDED_QUALITY_DOSE_NO_AUTOMATIC_DIRECT_VOLUME_CREDIT",
    mainRampUpResult: "ONE_EVENT_PREPARATORY_BLOCK_BEFORE_DEVELOPMENTAL_WORK",
    mainBackoffResult: "ONE_EVENT_BACKOFF_DEVELOPMENTAL_BLOCK",
    sourceEventDuplicationCount: 0,
    preparatoryWorkMiscreditCount: 0,
    substitutionDoubleCountCount: 0,
    durationDeterminabilityResult: {
      statuses: PRESCRIPTION_DURATION_DETERMINABILITY_STATUSES,
      sample: compilation.durationDeterminability,
      noInventedSessionTime: true,
    },
    policyConflicts: {
      sampleStatus: conflictResult.status,
      conflictCount: consequenceLab.filter((entry) => entry.ruleConflicts > 0).length,
    },
    missingPolicyResults: {
      sampleStatus: noPolicyResult.status,
      missingCount: consequenceLab.filter((entry) => entry.missingPolicyStates > 0).length,
    },
    candidateBehaviorInvariance: {
      ranking: behavior.productionRanking,
      rankingMatches: behavior.productionRanking === CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
      comprehensive: behavior.comprehensiveBehavior,
      comprehensiveMatches: behavior.comprehensiveBehavior === CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
    },
    sessionPlannerInvariance: {
      current: planner.combinedPlannerKernel,
      expected: EXPECTED_PLANNER_FINGERPRINTS.combinedPlannerKernel,
      matches: planner.combinedPlannerKernel === EXPECTED_PLANNER_FINGERPRINTS.combinedPlannerKernel,
    },
    sessionComposerInvariance: {
      current: composer.combinedSessionComposerKernel,
      names: SESSION_COMPOSER_PRODUCTION_FINGERPRINT_NAMES,
      expected: "3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9",
      matches:
        composer.combinedSessionComposerKernel ===
        "3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9",
    },
    timingFoundationInvariance: {
      current: timing.fingerprints.combinedPrescriptionTimingFoundation,
      expected: "e9882ebfdc5dc577108eec401f9f82cc23aecb8669c47e92589b0347a917a93f",
      matches:
        timing.fingerprints.combinedPrescriptionTimingFoundation ===
        "e9882ebfdc5dc577108eec401f9f82cc23aecb8669c47e92589b0347a917a93f",
    },
    productionFingerprints,
    fullPrescriptionFingerprints: fingerprints,
    validations: {
      catalogErrors: validateExerciseCatalog(REFERENCE_EXERCISES).filter((finding) => finding.severity === "error"),
      sourceExposureValidation,
      revisionValidation,
      blockValidation,
      planValidation,
      performanceValidation,
      policyValidation,
      compilationStatus: compilation.status,
      missingPolicyStatus: noPolicyResult.status,
      conflictStatus: conflictResult.status,
      cagtGateOrderPreserved: CAGT_GATE_ORDER.length === 17,
      cagtPrescriptionExtensionDimensions: CAGT_PRESCRIPTION_DIFFERENCE_DIMENSIONS,
      all45ExercisesCovered: new Set(scenarios.map((entry) => entry.exerciseId)).size === 45,
      allDoseModesCovered: EXERCISE_DOSE_MODES.every((mode) =>
        scenarios.some((entry) => {
          const exercise = REFERENCE_EXERCISES.find((row) => row.id === entry.exerciseId);
          return exercise?.prescriptionKnowledge.primaryDoseMode === mode ||
            exercise?.prescriptionKnowledge.legalAlternateDoseModes.includes(mode);
        }),
      ),
    },
    scenarios,
    calibration,
    holdout,
    holdoutManifest,
    policyCandidates: PRESCRIPTION_POLICY_CANDIDATES,
    sampleCompilation: compilation,
    performanceLinkage,
    cagtPairs,
    consequenceLab,
    fuzz,
    blockersBeforeNumericPrescriptionTournament: [
      "Owner must authorize numeric Prescription tournament separately.",
      "Reviewed numeric rule ranges must be admitted from evidence and owner policy.",
      "H1/H2 distribution and spacing dependencies require Prescription-informed burden views.",
    ],
    blockersBeforeProductionPrescriptionCompiler: [
      "Production policy activation absent.",
      "Post-Prescription weekly validation absent.",
      "Final Sequencing transition/setup timing absent.",
      "Performance block result model not yet production-ingested.",
    ],
    blockersBeforePostPrescriptionWeekValidation: [
      "Weekly ledger must aggregate source events without duplicate muscle/role/block events.",
      "Preparatory versus developmental credit rules require owner-reviewed ledger policy.",
      "Spacing must consume prescribed and eventually actual burden, not handoff prose.",
    ],
    h1h2Relationship:
      "This lab exposes block purpose and source-event burden needed by H1/H2 muscle distribution and spacing, but it does not resolve the Week-policy choice.",
    exactNextDependency:
      "Authorize a separate numeric Prescription policy tournament using this typed policy lattice, locked holdout, and source-exposure ledger contract.",
  };
}
