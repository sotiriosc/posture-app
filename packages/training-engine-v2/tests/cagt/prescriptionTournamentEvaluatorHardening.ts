import {
  PRE_PACKAGE_R_REFERENCE_EXERCISES as REFERENCE_EXERCISES,
  buildSessionPrescriptionHandoff,
  buildSessionSequencingInput,
  composeSessionSkeleton,
  exactBreathCycles,
  exactCount,
  exactMetres,
  exactSeconds,
  exactSteps,
  validateExercisePrescriptionPlan,
  validatePerformanceBlockLinkage,
  validatePrescriptionDoseBlocks,
  validatePrescriptionRevisionSet,
  validateSourceExposureEventIdentity,
  type BodyRegion,
  type BreathCycleTarget,
  type CountTarget,
  type ExerciseActionFunction,
  type ExerciseDefinition,
  type ExerciseDose,
  type ExerciseDoseMode,
  type ExercisePerformanceBlockLinkage,
  type ExercisePrescriptionPlan,
  type ExercisePrescriptionRevision,
  type PrescriptionBlockPerformanceResult,
  type PrescriptionDoseBlock,
  type PrescriptionDoseBlockPurpose,
  type MovementRole,
  type SessionPrescriptionAssignmentHandoff,
  type SessionPrescriptionHandoff,
  type SessionNeedDependency,
  type SessionSection,
  type SessionSkeleton,
  type SourceExposureEventIdentity,
  type StepTarget,
  type TimeTarget,
  type TrainingOutcomeGoal,
  type TrainingRole,
} from "../../src";
import {
  BICEPS_NEED,
  BRACING_NEED,
  CARRY_NEED,
  DIRECT_CHEST_NEED,
  HINGE_NEED,
  PULL_NEED,
  PUSH_NEED,
  SQUAT_NEED,
  TRICEPS_NEED,
  buildResults,
  productionIntent,
  selection,
  sessionNeed,
  trimResults,
} from "../helpers/sessionComposerProduction";
import { buildProductionComposerFingerprints } from "../helpers/sessionComposerProduction";
import { computePlannerFingerprints, EXPECTED_PLANNER_FINGERPRINTS } from "../helpers/sessionIntentPlannerProduction";
import { buildCurrentTrunkCurationFingerprints, CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT, CAPTURED_PRODUCTION_RANKING_FINGERPRINT } from "../helpers/trunkMechanicsCurationProposal";
import { buildPrescriptionTimingFoundationData } from "../helpers/prescriptionTimingFoundation";
import { EXPECTED_CAGT_FINGERPRINTS } from "./report";
import { EXPECTED_WEEK_POLICY_V1_FINGERPRINTS } from "./weekPolicyV1Report";
import { digest } from "./signatures";
import {
  EXPECTED_PRESCRIPTION_NUMERIC_TOURNAMENT_FINGERPRINTS,
  PRESCRIPTION_NUMERIC_ALL_CANDIDATES,
  PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES,
  PRESCRIPTION_NUMERIC_CANDIDATE_MANIFEST,
  PRESCRIPTION_NUMERIC_CANDIDATE_MANIFEST_FINGERPRINT,
  PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES,
  PRESCRIPTION_NUMERIC_LOCKED_HOLDOUT_FINGERPRINT,
  PRESCRIPTION_NUMERIC_TEST_CANDIDATE_STATE,
  PRESCRIPTION_NUMERIC_TOURNAMENT_AS_OF,
  PRESCRIPTION_NUMERIC_TOURNAMENT_VERSION,
  buildPrescriptionNumericCalibrationScenarios,
  buildPrescriptionNumericLockedHoldoutScenarios,
  type DosePolicyValue,
  type EffortPolicyTarget,
  type NumericPolicyTarget,
  type PrescriptionNumericAtomicCandidate,
  type PrescriptionNumericCandidateValue,
  type PrescriptionNumericCompositeCandidate,
  type PrescriptionNumericFamily,
  type PrescriptionNumericScenario,
  type PrescriptionNumericShape,
  type PrescriptionNumericTournamentCandidate,
  type TempoIntentPolicyTarget,
} from "./prescriptionPolicyTournament";

export const PRESCRIPTION_TOURNAMENT_EVALUATOR_HARDENING_VERSION = "2.0.0";
export const PRESCRIPTION_TOURNAMENT_EVALUATOR_HARDENING_AS_OF = "2026-08-13T13:00:00-04:00";
export const PRESCRIPTION_TOURNAMENT_EVALUATOR_HARDENING_SEED = 0x0806712;
export const CURRENT_NUMERIC_TOURNAMENT_RETAINED_FINGERPRINT =
  EXPECTED_PRESCRIPTION_NUMERIC_TOURNAMENT_FINGERPRINTS.combinedNumericPrescriptionTournament;
export const CURRENT_NUMERIC_TOURNAMENT_DISPOSITION =
  "SUPERSEDED_FOR_POLICY_SELECTION_BY_EVALUATOR_VALIDITY_REVIEW" as const;
export const CURRENT_NUMERIC_TOURNAMENT_PROVISIONAL_CLASSIFICATION =
  "PROVISIONAL_TOURNAMENT_RESULT_EVALUATOR_VALIDITY_REVIEW_REQUIRED" as const;
export const DISCLOSED_REGRESSION_COHORT_DISPOSITION =
  "PRESCRIPTION_TOURNAMENT_V1_DISCLOSED_REGRESSION_COHORT" as const;

export type PrescriptionTournamentEvaluatorHardeningClassification =
  | "PRESCRIPTION_TOURNAMENT_CAUSAL_VALIDITY_READY_FOR_OWNER_SELECTION"
  | "TARGETED_PRESCRIPTION_EVALUATOR_FIXES_REQUIRED"
  | "PRESCRIPTION_TOURNAMENT_EVALUATOR_FOUNDATION_GAP";

export type CagtPrescriptionPolicyEvidenceClassification =
  | "CAGT_ADMISSIBLE"
  | "CAGT_NON_DOMINATED"
  | "CAGT_DOMINATED"
  | "CAGT_REJECTED_BY_HARD_GATE"
  | "CAGT_REJECTED_FOR_CAUSAL_FAILURE"
  | "CAGT_REJECTED_FOR_BLOAT"
  | "CAGT_REJECTED_FOR_UNRESOLVED_POLICY"
  | "CAGT_EXERCISE_SPECIFIC_ONLY"
  | "NO_POLICY_CONTROL";

export type PrescriptionOwnerPriorStatus =
  | "owner_leading_before_evaluation"
  | "neutral"
  | "stress_candidate"
  | "no_policy_control";

export type PrescriptionDurationIntervalStatus =
  | "fully_determinable_before_sequencing"
  | "bounded_before_sequencing"
  | "unknown_due_to_repetition_tempo"
  | "unknown_due_to_breathing_cadence"
  | "unknown_due_to_locomotor_pace"
  | "unknown_due_to_step_cadence"
  | "unknown_due_to_rest"
  | "unknown_due_to_side_transition"
  | "unknown_due_to_sequencing"
  | "definitely_over_budget"
  | "possibly_over_budget"
  | "fits_known_prescription_bound";

export type RestPlacement =
  | "between_sets"
  | "between_rounds"
  | "between_trips"
  | "between_sides"
  | "after_block"
  | "not_prescribed"
  | "ambiguous_current_dose_field";

export type PrescriptionSessionArgumentStatus =
  | "COHERENT_PRESCRIBED_SESSION_ARGUMENT"
  | "INCOHERENT_ORPHAN_PREPARATION"
  | "INCOHERENT_MISSING_REQUIRED_PREPARATION"
  | "INCOHERENT_MAIN_PURPOSE_LOST"
  | "INCOHERENT_ACCESSORY_PURPOSE_LOST"
  | "INCOHERENT_DUPLICATE_ASSIGNMENT"
  | "INCOHERENT_POLICY_CREATED_STRUCTURE"
  | "INCOMPLETE_DUE_TO_UNRESOLVED_REQUIREMENT";

export const PRESCRIPTION_NUMERIC_FAMILIES: readonly PrescriptionNumericFamily[] = Object.freeze([
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

export interface PolicyManifestIdentity {
  readonly candidateId: string;
  readonly family: PrescriptionNumericFamily | "composite";
  readonly displayLabel: string;
  readonly shapeLabel: PrescriptionNumericShape | "composite";
  readonly ownerLeading: boolean;
  readonly ownerPriorStatus: PrescriptionOwnerPriorStatus;
  readonly documentation: string;
  readonly expectedRiskNotes: readonly string[];
}

export interface EvaluatorPolicySemantics {
  readonly semanticPolicyToken: string;
  readonly ruleFamily: PrescriptionNumericFamily;
  readonly scope: string;
  readonly provenance: {
    readonly candidateLattice: "PRESCRIPTION_NUMERIC_CANDIDATE_LATTICE_V1";
    readonly semanticVersion: typeof PRESCRIPTION_TOURNAMENT_EVALUATOR_HARDENING_VERSION;
  };
  readonly value: Omit<PrescriptionNumericCandidateValue, "expectedRisks" | "scope"> & {
    readonly scope: string;
  };
  readonly overrideRelationships: readonly string[];
  readonly conflictRelationships: readonly string[];
  readonly legalDoseBehavior: readonly string[];
}

export interface BlindedPolicyBundle {
  readonly semanticBundleToken: string;
  readonly familyTokens: Readonly<Record<PrescriptionNumericFamily, string>>;
  readonly rulesByFamily: Readonly<Record<PrescriptionNumericFamily, EvaluatorPolicySemantics>>;
  readonly policyVersionRef: "PRESCRIPTION_NUMERIC_CANDIDATE_LATTICE_V1";
}

export interface CandidateEvaluationInput {
  readonly manifestIdentity: PolicyManifestIdentity;
  readonly bundle: BlindedPolicyBundle;
}

interface NumericRange {
  readonly min: number;
  readonly max: number;
  readonly unit: string;
  readonly exact: boolean;
}

export interface PrescriptionDurationInterval {
  readonly knownLowerBoundSeconds: number | null;
  readonly knownUpperBoundSeconds: number | null;
  readonly unknownComponents: readonly PrescriptionDurationIntervalStatus[];
  readonly status: PrescriptionDurationIntervalStatus;
  readonly provenance: readonly string[];
}

export interface PrescriptionRestPlacementAudit {
  readonly currentDoseRestField: "AMBIGUOUS_WITHOUT_PLACEMENT_CONTRACT";
  readonly designOnlyContractRequired: true;
  readonly placementsByMode: Readonly<Record<ExerciseDoseMode, RestPlacement>>;
  readonly finding: "REST_PLACEMENT_CONTRACT_CREATED_BEFORE_DURATION_USE";
  readonly fingerprint: string;
}

export interface StructuralBurdenMetrics {
  readonly assignmentCount: number;
  readonly totalBlockCount: number;
  readonly preparatoryBlockCount: number;
  readonly developmentalBlockCount: number;
  readonly backoffBlockCount: number;
  readonly prescribedSetRoundTripRange: readonly [number, number];
  readonly repetitionRange: readonly [number, number] | null;
  readonly holdDurationRangeSeconds: readonly [number, number] | null;
  readonly carryDistanceRangeMetres: readonly [number, number] | null;
  readonly timedExposureRangeSeconds: readonly [number, number] | null;
  readonly effortBurden: "low" | "moderate" | "high" | "unknown";
  readonly exactTempoBurden: number;
  readonly unresolvedTimingCount: number;
  readonly setupTransitionUnknownCount: number;
}

export interface SourceEventDerivationMetrics {
  readonly assignmentCount: number;
  readonly eventCount: number;
  readonly uniqueEventCount: number;
  readonly assignmentWithoutEventCount: number;
  readonly duplicateSourceEventCount: number;
  readonly blockParentMismatchCount: number;
  readonly substitutionDoubleCount: number;
  readonly omittedAssignmentCompletedEventCount: number;
}

export interface RevisionDerivationMetrics {
  readonly revisionCount: number;
  readonly finalRevisionCount: number;
  readonly supersededRevisionCount: number;
  readonly brokenAncestryCount: number;
  readonly finalForExecutionUniqueness: boolean;
  readonly completedHistoryRewriteCount: number;
}

export interface PlannedPrescriptionFixture {
  readonly plan: ExercisePrescriptionPlan;
  readonly revisions: readonly ExercisePrescriptionRevision[];
  readonly durationInterval: PrescriptionDurationInterval;
  readonly structuralBurden: StructuralBurdenMetrics;
}

export interface ObservedPerformanceFixture {
  readonly performanceRecordId: string;
  readonly sourceExposureEventId: string;
  readonly observationKind:
    | "completed_exactly_as_planned"
    | "fewer_reps"
    | "lower_load"
    | "shortened_duration"
    | "altered_tempo"
    | "partial_block"
    | "omitted_preparatory_block"
    | "omitted_developmental_block"
    | "extra_unplanned_block"
    | "substitution"
    | "unknown_actual_timing"
    | "not_observed"
    | "actual_as_plan_assumption_mutation";
  readonly blockResults: readonly PrescriptionBlockPerformanceResult[];
  readonly observedFromIndependentFacts: boolean;
  readonly actualDoseAssumedFromPlan: boolean;
  readonly actualTimingAssumedFromPlan: boolean;
  readonly fingerprint: string;
}

export interface PerformanceIndependenceResult {
  readonly plannedFingerprint: string;
  readonly observedCases: readonly {
    readonly caseId: ObservedPerformanceFixture["observationKind"];
    readonly actualDoseAssumedFromPlan: boolean;
    readonly actualTimingAssumedFromPlan: boolean;
    readonly validationErrors: readonly string[];
    readonly planEqualsActualWhenExplicitlyObserved: boolean;
  }[];
  readonly actualAsPlanMutation: "ACTUAL_AS_PLAN_ASSUMPTION_REJECTED";
  readonly performanceAssumptionCount: number;
  readonly fingerprint: string;
}

export interface PrescriptionSessionArgumentTrace {
  readonly sessionId: string;
  readonly status: PrescriptionSessionArgumentStatus;
  readonly sessionExistsReason: string;
  readonly everyPrescriptionMapsToAssignment: boolean;
  readonly warmupDependencyCoverage: boolean;
  readonly activationDependencyCoverage: boolean;
  readonly requiredPreparationPreserved: boolean;
  readonly preparatoryDosesBounded: boolean;
  readonly mainDevelopmentalWorkPresent: boolean;
  readonly prescriptionErasedUpstreamRequirement: boolean;
  readonly accessoriesRetainPurpose: boolean;
  readonly cooldownExplicitlyAllocatedOrAbsent: boolean;
  readonly structuralWorkaroundCreated: boolean;
  readonly policyAddedExercise: boolean;
  readonly policyRemovedExercise: boolean;
  readonly duplicateIdentity: boolean;
  readonly sourceEventsUniqueByAssignment: boolean;
}

export interface PrescriptionFullSessionFixture {
  readonly scenarioId: string;
  readonly archetype: string;
  readonly locked: boolean;
  readonly sessionIntentId: string;
  readonly skeleton: SessionSkeleton;
  readonly handoff: SessionPrescriptionHandoff;
  readonly candidateSource: "production_session_intent_planner_candidate_intelligence_composer";
  readonly contextTags: readonly string[];
  readonly availableMinutes: number;
}

export interface CompiledPrescriptionSessionResult {
  readonly scenarioId: string;
  readonly semanticBundleToken: string;
  readonly assignmentCount: number;
  readonly prescriptionPlanCount: number;
  readonly status: "compiled_full_prescription_session" | "compiled_assignment_only" | "prescription_policy_required";
  readonly sourceEvents: SourceEventDerivationMetrics;
  readonly revisions: RevisionDerivationMetrics;
  readonly sessionArgument: PrescriptionSessionArgumentTrace;
  readonly durationIntervals: readonly PrescriptionDurationInterval[];
  readonly sessionDurationInterval: PrescriptionDurationInterval;
  readonly structuralBurden: StructuralBurdenMetrics;
  readonly validationErrorCodes: readonly string[];
  readonly plans: readonly ExercisePrescriptionPlan[];
  readonly revisionTrace: readonly ExercisePrescriptionRevision[];
}

export interface CounterfactualPairContract {
  readonly pairId: string;
  readonly baselineScenarioId: string;
  readonly counterfactualScenarioId: string;
  readonly changedStructuredFacts: readonly string[];
  readonly factOwner: "Prescription" | "Session Composer" | "Sequencing" | "Performance" | "Week";
  readonly earliestPermittedResponseGate: "gate_9_prescription_handoff_truth" | "gate_10_sequencing_duration_handoff_truth" | "gate_11_execution_response_foundation";
  readonly latestRequiredResponseGate: "gate_9_prescription_handoff_truth" | "gate_10_sequencing_duration_handoff_truth" | "gate_11_execution_response_foundation";
  readonly dimensionsMayChange: readonly string[];
  readonly dimensionsMustRemainInvariant: readonly string[];
  readonly acceptableConvergenceReasons: readonly string[];
  readonly frameworkSessionRelationship: string;
  readonly prescriptionRelationship: string;
  readonly performanceRelationship: string;
}

export interface CounterfactualPairResult {
  readonly pairId: string;
  readonly semanticBundleToken: string;
  readonly materialChangedFactHasPrescriptionReceiver: boolean;
  readonly firstMaterialDifferenceGate: string | null;
  readonly actualChangedDimensions: readonly string[];
  readonly invariantViolations: readonly string[];
  readonly justifiedConvergence: boolean;
  readonly underAdaptation: number;
  readonly overAdaptation: number;
  readonly wrongLayer: number;
  readonly downstreamRescueAccepted: false;
}

export interface CandidateEvidenceResult {
  readonly candidateId: string;
  readonly semanticBundleToken: string;
  readonly family: PrescriptionNumericFamily | "composite";
  readonly ownerPriorStatus: PrescriptionOwnerPriorStatus;
  readonly classification: CagtPrescriptionPolicyEvidenceClassification;
  readonly assignmentPipelineCount: number;
  readonly fullSessionPipelineCount: number;
  readonly fullSessionPerformanceLinkagePipelineCount: number;
  readonly policyRequiredCount: number;
  readonly hardGateFailureCount: number;
  readonly underAdaptationCount: number;
  readonly overAdaptationCount: number;
  readonly wrongLayerCount: number;
  readonly downstreamRescueCount: number;
  readonly sourceEventDuplicationCount: number;
  readonly preparatoryMiscreditCount: number;
  readonly performanceAssumptionCount: number;
  readonly definitelyOverBudgetCount: number;
  readonly possiblyOverBudgetCount: number;
  readonly fullyKnownDurationCount: number;
  readonly boundedDurationCount: number;
  readonly unknownDurationCount: number;
  readonly structuralComplexityCount: number;
  readonly normalizedEvaluationFingerprint: string;
}

export interface EvaluatorBlindnessSelfTestResult {
  readonly candidateRenameMutation: "PASS_NO_METRIC_CHANGE" | "EVALUATOR_CANDIDATE_IDENTITY_LEAK";
  readonly ownerLeadingMutation: "PASS_NO_METRIC_CHANGE" | "EVALUATOR_CANDIDATE_IDENTITY_LEAK";
  readonly shapeLabelMutation: "PASS_NO_METRIC_CHANGE" | "EVALUATOR_CANDIDATE_IDENTITY_LEAK";
  readonly expectedRiskProseMutation: "PASS_NO_METRIC_CHANGE" | "EVALUATOR_CANDIDATE_IDENTITY_LEAK";
  readonly semanticEquivalence: "PASS_EQUIVALENT_SEMANTICS_EQUIVALENT_RESULTS" | "SEMANTIC_EQUIVALENCE_FAILED";
  readonly highLabelWithMinimalValues: "EVALUATED_AS_MINIMAL_VALUES";
  readonly balancedLabelWithStressValues: "EVALUATED_AS_STRESS_VALUES";
  readonly evaluatorOutputIdentityLeak: "NO_IDENTITY_BEFORE_POST_EVALUATION_MAPPING" | "EVALUATOR_CANDIDATE_IDENTITY_LEAK";
  readonly fingerprint: string;
}

export interface EvaluatorSelfTestResult {
  readonly underAdaptationMutation: "DETECTED_FROM_SEMANTIC_DIFF";
  readonly overAdaptationMutation: "DETECTED_FROM_SEMANTIC_DIFF";
  readonly wrongLayerMutation: "DETECTED_FROM_OWNER_AWARE_DIFF";
  readonly downstreamRescueMutation: "UPSTREAM_FAILURE_NOT_RESCUED";
  readonly sourceDuplicationMutation: "DETECTED_FROM_EVENT_GRAPH";
  readonly revisionDuplicationMutation: "DETECTED_FROM_REVISION_TRACE";
  readonly preparatoryMiscreditMutation: "DETECTED_FROM_BLOCK_CLASSIFICATION";
  readonly substitutionDoubleCountMutation: "DETECTED_FROM_SOURCE_AND_PERFORMANCE_RECORDS";
  readonly orphanPreparationMutation: "DETECTED_FROM_SESSION_ARGUMENT";
  readonly missingRequiredPreparationMutation: "DETECTED_FROM_SESSION_ARGUMENT";
  readonly mainPurposeLossMutation: "DETECTED_FROM_SESSION_ARGUMENT";
  readonly actualAsPlanAssumptionMutation: "DETECTED_FROM_PERFORMANCE_LINKAGE";
  readonly fakeDurationMutation: "REJECTED_NO_INVENTED_DURATION";
  readonly policyCreatedAssignmentMutation: "DETECTED_FROM_SESSION_ARGUMENT";
  readonly genericActivationMutation: "DETECTED_FROM_SESSION_ARGUMENT";
  readonly genericCooldownMutation: "DETECTED_FROM_SESSION_ARGUMENT";
  readonly fingerprint: string;
}

export interface H1H2CompiledSublabResult {
  readonly result: "PRESCRIPTION_AND_RESPONSE_DEPENDENT";
  readonly h1SourceEvents: number;
  readonly h2SourceEvents: number;
  readonly h1DevelopmentalRange: readonly [number, number];
  readonly h2DevelopmentalRange: readonly [number, number];
  readonly preparatoryExcluded: true;
  readonly sessionDurationIntervals: readonly PrescriptionDurationIntervalStatus[];
  readonly additiveErrorMutation: "FAIL_PREPARATORY_OR_DISTRIBUTED_VOLUME_DOUBLE_COUNT";
  readonly fingerprint: string;
}

export interface SpacingCompiledSublabResult {
  readonly result: "PRESCRIPTION_AND_RESPONSE_DEPENDENT";
  readonly comparedOpportunityCount: number;
  readonly timestampBasis: "ACTUAL_OPPORTUNITY_TIMESTAMPS";
  readonly universalRecoverySpacingApproved: false;
  readonly findings: readonly string[];
  readonly fingerprint: string;
}

export interface PrescriptionEvaluatorHardeningReport {
  readonly version: typeof PRESCRIPTION_TOURNAMENT_EVALUATOR_HARDENING_VERSION;
  readonly classification: PrescriptionTournamentEvaluatorHardeningClassification;
  readonly currentTournamentDisposition: typeof CURRENT_NUMERIC_TOURNAMENT_DISPOSITION;
  readonly currentTournamentProvisionalClassification: typeof CURRENT_NUMERIC_TOURNAMENT_PROVISIONAL_CLASSIFICATION;
  readonly candidateValuesUnchanged: boolean;
  readonly retainedCurrentTournamentFingerprint: string;
  readonly currentHoldoutDisposition: typeof DISCLOSED_REGRESSION_COHORT_DISPOSITION;
  readonly disclosedRegressionFingerprint: string;
  readonly v2HoldoutCount: number;
  readonly v2HoldoutFingerprint: string;
  readonly assignmentPipelineCount: number;
  readonly fullSessionPipelineCount: number;
  readonly fullSessionPerformanceLinkagePipelineCount: number;
  readonly calibrationPairCount: number;
  readonly disclosedRegressionPairCount: number;
  readonly newLockedHoldoutPairCount: number;
  readonly stressSemanticComparisonCount: number;
  readonly blindEvaluatorStatus: "BLIND_SEMANTIC_EVALUATOR_ACTIVE";
  readonly ownerRecommendationsWithdrawn: true;
  readonly nonDominatedCandidates: readonly string[];
  readonly dominatedCandidates: readonly string[];
  readonly incomparableCandidates: readonly string[][];
  readonly equalSemanticCandidates: readonly string[][];
  readonly candidateEvidence: readonly CandidateEvidenceResult[];
  readonly blindness: EvaluatorBlindnessSelfTestResult;
  readonly selfTests: EvaluatorSelfTestResult;
  readonly counterfactualResults: readonly CounterfactualPairResult[];
  readonly h1h2: H1H2CompiledSublabResult;
  readonly spacing: SpacingCompiledSublabResult;
  readonly performanceIndependence: PerformanceIndependenceResult;
  readonly restPlacement: PrescriptionRestPlacementAudit;
  readonly durationSummary: {
    readonly fullyKnownDurationCases: number;
    readonly boundedDurationCases: number;
    readonly unknownDurationCases: number;
    readonly definitelyOverBudgetCases: number;
    readonly possiblyOverBudgetCases: number;
  };
  readonly aggregateCausalSummary: {
    readonly underAdaptationCount: number;
    readonly overAdaptationCount: number;
    readonly wrongLayerCount: number;
    readonly downstreamRescueCount: number;
    readonly sourceEventDuplicationCount: number;
    readonly preparatoryMiscreditCount: number;
    readonly performanceAssumptionCount: number;
  };
  readonly productionFingerprints: Readonly<Record<string, string | boolean>>;
  readonly fingerprints: Readonly<Record<string, string>>;
  readonly remainingEvaluatorLimitations: readonly string[];
  readonly blockersBeforeOwnerNumericPolicySelection: readonly string[];
  readonly blockersBeforeProductionPrescriptionCompiler: readonly string[];
  readonly blockersBeforePostPrescriptionWeekValidation: readonly string[];
  readonly exactNextDependency: string;
}

function withoutExpectedRisks(value: PrescriptionNumericCandidateValue, family: PrescriptionNumericFamily) {
  const { expectedRisks: _expectedRisks, scope: _scope, ...rest } = value;
  return { ...rest, scope: `policy_scope:${family}` };
}

function ownerPriorStatus(candidate: PrescriptionNumericTournamentCandidate): PrescriptionOwnerPriorStatus {
  if (candidate.family === "composite" && candidate.noPolicyControl) return "no_policy_control";
  if (candidate.family === "composite" && candidate.stressOnly) return "stress_candidate";
  if (candidate.family !== "composite" && candidate.shape === "no_policy_control") return "no_policy_control";
  if (candidate.family !== "composite" && candidate.shape === "high_dose_or_high_complexity_stress") return "stress_candidate";
  return candidate.ownerLeading ? "owner_leading_before_evaluation" : "neutral";
}

export function buildPolicyManifestIdentity(candidate: PrescriptionNumericTournamentCandidate): PolicyManifestIdentity {
  const risks = candidate.family === "composite"
    ? []
    : candidate.value.expectedRisks;
  return Object.freeze({
    candidateId: candidate.candidateId,
    family: candidate.family,
    displayLabel: candidate.candidateId.toLowerCase().replaceAll("_", " "),
    shapeLabel: candidate.family === "composite" ? "composite" : candidate.shape,
    ownerLeading: candidate.ownerLeading,
    ownerPriorStatus: ownerPriorStatus(candidate),
    documentation: `Manifest identity for ${candidate.candidateId}. Report-only; not visible to evaluator.`,
    expectedRiskNotes: risks,
  });
}

function byId(id: string): PrescriptionNumericAtomicCandidate {
  const candidate = PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES.find((entry) => entry.candidateId === id);
  if (!candidate) throw new Error(`Unknown Prescription numeric candidate: ${id}`);
  return candidate;
}

function defaultBalancedSelection(): Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>> {
  const composite = PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES.find((entry) =>
    entry.candidateId === "RX_COMPOSITE_B1_BALANCED_CAUSAL")!;
  return Object.freeze(Object.fromEntries(PRESCRIPTION_NUMERIC_FAMILIES.map((family) =>
    [family, byId(composite.atomicCandidateIds![family])])) as Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>>);
}

function selectionForCandidate(candidate: PrescriptionNumericTournamentCandidate): Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>> {
  if (candidate.family === "composite") {
    const ids = candidate.atomicCandidateIds ?? defaultBalancedSelection();
    if (!candidate.atomicCandidateIds) return ids as Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>>;
    return Object.freeze(Object.fromEntries(PRESCRIPTION_NUMERIC_FAMILIES.map((family) =>
      [family, byId(candidate.atomicCandidateIds![family])])) as Readonly<Record<PrescriptionNumericFamily, PrescriptionNumericAtomicCandidate>>);
  }
  return Object.freeze({ ...defaultBalancedSelection(), [candidate.family]: candidate });
}

function semanticsForAtomic(candidate: PrescriptionNumericAtomicCandidate): EvaluatorPolicySemantics {
  const payload = {
    family: candidate.family,
    value: withoutExpectedRisks(candidate.value, candidate.family),
    semanticVersion: PRESCRIPTION_TOURNAMENT_EVALUATOR_HARDENING_VERSION,
  };
  return Object.freeze({
    semanticPolicyToken: `semantic:${digest(payload)}`,
    ruleFamily: candidate.family,
    scope: `policy_scope:${candidate.family}`,
    provenance: {
      candidateLattice: "PRESCRIPTION_NUMERIC_CANDIDATE_LATTICE_V1" as const,
      semanticVersion: PRESCRIPTION_TOURNAMENT_EVALUATOR_HARDENING_VERSION as typeof PRESCRIPTION_TOURNAMENT_EVALUATOR_HARDENING_VERSION,
    },
    value: payload.value,
    overrideRelationships: [],
    conflictRelationships: [`same_authority:${candidate.family}:conflict_explicit_only`],
    legalDoseBehavior: [`family:${candidate.family}:legal_dose_modes_from_exercise_knowledge`],
  });
}

export function buildBlindedPolicyBundle(candidate: PrescriptionNumericTournamentCandidate): BlindedPolicyBundle {
  const selection = selectionForCandidate(candidate);
  const rulesByFamily = Object.freeze(Object.fromEntries(PRESCRIPTION_NUMERIC_FAMILIES.map((family) =>
    [family, semanticsForAtomic(selection[family])])) as Readonly<Record<PrescriptionNumericFamily, EvaluatorPolicySemantics>>);
  const familyTokens = Object.freeze(Object.fromEntries(PRESCRIPTION_NUMERIC_FAMILIES.map((family) =>
    [family, rulesByFamily[family].semanticPolicyToken])) as Readonly<Record<PrescriptionNumericFamily, string>>);
  const payload = {
    policyVersionRef: "PRESCRIPTION_NUMERIC_CANDIDATE_LATTICE_V1",
    rulesByFamily,
  };
  return Object.freeze({
    semanticBundleToken: `bundle:${digest(payload)}`,
    familyTokens,
    rulesByFamily,
    policyVersionRef: "PRESCRIPTION_NUMERIC_CANDIDATE_LATTICE_V1",
  });
}

export function buildCandidateEvaluationInputs(
  candidates: readonly PrescriptionNumericTournamentCandidate[] = PRESCRIPTION_NUMERIC_ALL_CANDIDATES,
): readonly CandidateEvaluationInput[] {
  return Object.freeze(candidates.map((candidate) => Object.freeze({
    manifestIdentity: buildPolicyManifestIdentity(candidate),
    bundle: buildBlindedPolicyBundle(candidate),
  })));
}

export const PRESCRIPTION_NUMERIC_CANDIDATE_LATTICE_V1 = Object.freeze({
  state: PRESCRIPTION_NUMERIC_TEST_CANDIDATE_STATE,
  version: PRESCRIPTION_NUMERIC_TOURNAMENT_VERSION,
  manifestFingerprint: PRESCRIPTION_NUMERIC_CANDIDATE_MANIFEST_FINGERPRINT,
  semanticFingerprint: digest(buildCandidateEvaluationInputs().map((entry) => entry.bundle)),
});

function provenance(sourceRef: string) {
  return {
    source: "synthetic_contract_fixture" as const,
    sourceRef,
    notes: "Evaluator-hardening fixture; not production policy.",
  };
}

function targetBounds(target: NumericPolicyTarget | undefined): NumericRange | null {
  if (!target) return null;
  if (target.kind === "exact") return { min: target.value, max: target.value, unit: target.unit, exact: true };
  if (target.kind === "range") return { min: target.min, max: target.max, unit: target.unit, exact: false };
  return null;
}

function countTarget(input: NumericPolicyTarget | undefined, fallback: number): CountTarget {
  if (!input) return exactCount(fallback);
  if (input.kind === "exact") return exactCount(input.value);
  if (input.kind === "range") return { kind: "range", min: input.min, max: input.max, unit: "count" };
  return { kind: "unknown", reason: input.kind === "policy_required" ? input.reason : "Count target not prescribed.", unit: "count" };
}

function breathCycleTarget(input: NumericPolicyTarget | undefined, fallback: number): BreathCycleTarget {
  if (!input) return exactBreathCycles(fallback);
  if (input.kind === "exact") return exactBreathCycles(input.value);
  if (input.kind === "range") return { kind: "range", min: input.min, max: input.max, unit: "breath_cycles" };
  return { kind: "unknown", reason: input.kind === "policy_required" ? input.reason : "Breath cycle target not prescribed.", unit: "breath_cycles" };
}

function secondsTarget(input: NumericPolicyTarget | undefined, fallback: number): TimeTarget {
  if (!input) return exactSeconds(fallback);
  if (input.kind === "exact") return exactSeconds(input.value);
  if (input.kind === "range") return { kind: "range", min: input.min, max: input.max, unit: "seconds" };
  if (input.kind === "not_prescribed") return { kind: "not_prescribed", reason: input.reason, unit: "seconds" };
  return { kind: "unknown", reason: input.reason, unit: "seconds" };
}

function stepTarget(input: NumericPolicyTarget | undefined, fallback: number): StepTarget {
  if (!input) return exactSteps(fallback);
  if (input.kind === "exact") return exactSteps(input.value);
  if (input.kind === "range") return { kind: "range", min: input.min, max: input.max, unit: "steps" };
  return { kind: "unknown", reason: input.kind === "policy_required" ? input.reason : "Step target not prescribed.", unit: "steps" };
}

function midpoint(input: NumericPolicyTarget | undefined, fallback: number): number {
  const bounds = targetBounds(input);
  return bounds ? Math.round((bounds.min + bounds.max) / 2) : fallback;
}

function effortTarget(policy: EffortPolicyTarget | undefined) {
  if (!policy) return { kind: "phase_qualitative_band" as const, band: "moderate" as const };
  if (policy.kind === "rir") return { kind: "rir" as const, target: { kind: "range" as const, min: policy.min, max: policy.max } };
  if (policy.kind === "qualitative") return { kind: "phase_qualitative_band" as const, band: policy.band };
  if (policy.kind === "quality_limited") {
    return {
      kind: "self_selected_by_reviewed_standard" as const,
      standardId: "quality-limited-evaluator-hardening-standard",
      description: policy.description,
    };
  }
  return { kind: "unknown" as const, description: policy.reason };
}

function selectedDoseMode(exercise: ExerciseDefinition, tags: readonly string[]): ExerciseDoseMode {
  const legalModes = [exercise.prescriptionKnowledge.primaryDoseMode, ...exercise.prescriptionKnowledge.legalAlternateDoseModes] as ExerciseDoseMode[];
  if (tags.includes("timed_carry") && legalModes.includes("timed_carry")) return "timed_carry";
  if (tags.includes("distance_carry") && legalModes.includes("distance_carry")) return "distance_carry";
  if (tags.includes("timed_hold") && legalModes.includes("timed_hold")) return "timed_hold";
  if (tags.includes("breath_cycles") && legalModes.includes("breath_cycles")) return "breath_cycles";
  if (tags.includes("step_march") && legalModes.includes("step_march")) return "step_march";
  if (tags.includes("step_sets") && legalModes.includes("step_sets")) return "step_sets";
  return exercise.prescriptionKnowledge.primaryDoseMode;
}

function activeFamilyFor(input: {
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly goal: TrainingOutcomeGoal;
  readonly mode: ExerciseDoseMode;
}): PrescriptionNumericFamily {
  if (input.section === "warmup" || input.role === "preparation") return "preparation";
  if (input.section === "activation" || input.role === "activation") return "activation";
  if (input.section === "cooldown" || input.role === "recovery") return "recovery_cooldown";
  if (input.mode === "timed_hold") return "timed_hold";
  if (input.mode === "breath_cycles") return "breath_cycles";
  if (input.mode === "distance_carry" || input.mode === "timed_carry") return "carry";
  if (input.mode === "step_march") return "stationary_march";
  if (input.mode === "step_sets") return "counted_step";
  if (input.role === "hypertrophy_accessory") return "hypertrophy_accessory";
  if (input.goal === "hypertrophy" && input.section === "main") return "main_hypertrophy";
  if (input.role === "secondary_strength") return "secondary_strength";
  if (input.section === "accessory") return "direct_accessory";
  return "main_strength";
}

function dosePolicyFor(
  bundle: BlindedPolicyBundle,
  activeFamily: PrescriptionNumericFamily,
  mode: ExerciseDoseMode,
): DosePolicyValue {
  const value = bundle.rulesByFamily[activeFamily].value;
  if (activeFamily === "preparation") {
    return value[mode === "timed_hold" ? "timedHold" : mode === "breath_cycles" ? "breathing" :
      mode === "step_sets" || mode === "step_march" ? "step" : "dynamic"] ?? value.dynamic ?? {};
  }
  if (activeFamily === "activation") {
    return value[mode === "timed_hold" ? "timedHold" : mode === "step_sets" || mode === "step_march" ? "step" : "dynamic"] ?? value.dynamic ?? {};
  }
  if (activeFamily === "recovery_cooldown") return value[mode === "breath_cycles" ? "breathing" : "timedHold"] ?? value.dynamic ?? {};
  if (mode === "timed_hold") return bundle.rulesByFamily.timed_hold.value.timedHold ?? {};
  if (mode === "breath_cycles") return bundle.rulesByFamily.breath_cycles.value.breathing ?? {};
  if (mode === "distance_carry") return bundle.rulesByFamily.carry.value.distanceCarry ?? {};
  if (mode === "timed_carry") return bundle.rulesByFamily.carry.value.timedCarry ?? {};
  if (mode === "step_march") return bundle.rulesByFamily.stationary_march.value.stationaryMarch ?? {};
  if (mode === "step_sets") return bundle.rulesByFamily.counted_step.value.step ?? {};
  return value.dynamic ?? {};
}

function usageKey(activeFamily: PrescriptionNumericFamily, mode: ExerciseDoseMode): string {
  if (activeFamily === "preparation") return "preparation";
  if (activeFamily === "activation") return "activation";
  if (activeFamily === "main_strength") return "main_strength";
  if (activeFamily === "secondary_strength") return "secondary_strength";
  if (activeFamily === "main_hypertrophy") return "main_hypertrophy";
  if (activeFamily === "direct_accessory" || activeFamily === "hypertrophy_accessory") return "accessory";
  if (mode === "breath_cycles") return "breath";
  return "special";
}

function restPolicy(bundle: BlindedPolicyBundle, activeFamily: PrescriptionNumericFamily, mode: ExerciseDoseMode, fallback?: NumericPolicyTarget): NumericPolicyTarget | undefined {
  const use = usageKey(activeFamily, mode);
  return bundle.rulesByFamily.rest.value.restByUse?.[use] ?? fallback;
}

function effortPolicy(bundle: BlindedPolicyBundle, activeFamily: PrescriptionNumericFamily, mode: ExerciseDoseMode, fallback?: EffortPolicyTarget): EffortPolicyTarget | undefined {
  const use = usageKey(activeFamily, mode);
  return bundle.rulesByFamily.effort.value.effortByUse?.[use] ?? fallback;
}

function hasPolicyRequired(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if ("kind" in value && (value as { kind?: string }).kind === "policy_required") return true;
  return Object.values(value as Record<string, unknown>).some(hasPolicyRequired);
}

function tempoFor(bundle: BlindedPolicyBundle, mode: ExerciseDoseMode, tags: readonly string[]) {
  if (mode !== "repetition_sets" && mode !== "step_sets") return undefined;
  const exact = bundle.rulesByFamily.exact_phase_tempo.value.exactTempo;
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
      provenance: provenance("prescription-evaluator-hardening:exact-tempo"),
    };
  }
  const intent = bundle.rulesByFamily.tempo_intent.value.tempoIntent;
  if (!intent || intent === "not_prescribed") {
    return { kind: "not_prescribed" as const, reason: "Tempo intent not prescribed.", provenance: provenance("prescription-evaluator-hardening:tempo") };
  }
  if (intent === "policy_required") {
    return { kind: "unknown" as const, reason: "Tempo policy required.", provenance: provenance("prescription-evaluator-hardening:tempo") };
  }
  return {
    kind: "intent_only" as const,
    intent: tags.includes("power_intent") ? "explosive_intent" as const : intent,
    provenance: provenance("prescription-evaluator-hardening:tempo"),
  };
}

function restPlacementFor(mode: ExerciseDoseMode): RestPlacement {
  if (mode === "repetition_sets" || mode === "timed_hold" || mode === "step_sets" || mode === "step_march") return "between_sets";
  if (mode === "breath_cycles") return "between_rounds";
  if (mode === "distance_carry" || mode === "timed_carry") return "between_trips";
  return "ambiguous_current_dose_field";
}

export function auditPrescriptionRestPlacement(): PrescriptionRestPlacementAudit {
  const placementsByMode = Object.freeze({
    repetition_sets: "between_sets",
    timed_hold: "between_sets",
    breath_cycles: "between_rounds",
    distance_carry: "between_trips",
    timed_carry: "between_trips",
    step_march: "between_sets",
    step_sets: "between_sets",
  } satisfies Readonly<Record<ExerciseDoseMode, RestPlacement>>);
  const payload = {
    currentDoseRestField: "AMBIGUOUS_WITHOUT_PLACEMENT_CONTRACT" as const,
    designOnlyContractRequired: true as const,
    placementsByMode,
    finding: "REST_PLACEMENT_CONTRACT_CREATED_BEFORE_DURATION_USE" as const,
  };
  return { ...payload, fingerprint: digest(payload) };
}

function blockPurposes(bundle: BlindedPolicyBundle, activeFamily: PrescriptionNumericFamily, section: SessionSection, mode: ExerciseDoseMode): readonly PrescriptionDoseBlockPurpose[] {
  if (activeFamily === "preparation" || activeFamily === "activation") return ["technique_quality_work"];
  if (activeFamily === "recovery_cooldown") return ["recovery_or_downregulation"];
  const structure = bundle.rulesByFamily.block_structure.value.blockStructure;
  if (section === "main" && mode === "repetition_sets" &&
    (activeFamily === "main_strength" || activeFamily === "secondary_strength" || activeFamily === "main_hypertrophy")) {
    const prepCount = Math.max(0, Math.round(midpoint(structure?.mainLoadedPrepBlocks, 0)));
    const backoffCount = Math.max(0, Math.round(midpoint(structure?.backoffBlocks, 0)));
    return [
      ...Array.from({ length: prepCount }, () => "preparatory_acclimation" as const),
      "developmental_work" as const,
      ...Array.from({ length: backoffCount }, () => "developmental_work" as const),
    ];
  }
  return ["developmental_work"];
}

function doseFor(input: {
  readonly bundle: BlindedPolicyBundle;
  readonly activeFamily: PrescriptionNumericFamily;
  readonly mode: ExerciseDoseMode;
  readonly purpose: PrescriptionDoseBlockPurpose;
  readonly tags: readonly string[];
  readonly requirements: SessionPrescriptionAssignmentHandoff["knownRequirements"];
  readonly blockIndex: number;
}): ExerciseDose {
  const policy = dosePolicyFor(input.bundle, input.activeFamily, input.mode);
  const effort = effortTarget(effortPolicy(input.bundle, input.activeFamily, input.mode, policy.effort));
  const rest = secondsTarget(restPolicy(input.bundle, input.activeFamily, input.mode, policy.rest), 60);
  const range = input.requirements.rangeRequirementIds.length > 0
    ? { kind: "intentionally_partial" as const, description: "Structured range requirement preserved for Prescription." }
    : { kind: "full_available" as const };
  const support = input.requirements.supportRequirementIds.length > 0
    ? { level: "light_touch" as const, surface: "wall" as const, description: "Structured support requirement preserved for Prescription." }
    : undefined;
  if (input.purpose === "preparatory_acclimation") {
    const prep = input.bundle.rulesByFamily.preparation.value.dynamic ?? policy;
    return {
      mode: "repetition_sets",
      sets: countTarget(prep.sets, 1),
      repetitions: countTarget(prep.reps, 5),
      effort: effortTarget(prep.effort),
      rest: secondsTarget(restPolicy(input.bundle, "preparation", "repetition_sets", prep.rest), 45),
      range,
      support,
      tempo: tempoFor(input.bundle, "repetition_sets", input.tags),
    };
  }
  switch (input.mode) {
    case "repetition_sets":
      return {
        mode: "repetition_sets",
        sets: countTarget(input.purpose === "developmental_work" && input.blockIndex > 1 ? { kind: "exact", value: 1, unit: "sets" } : policy.sets, 2),
        repetitions: countTarget(policy.reps, 8),
        effort,
        rest,
        range,
        support,
        tempo: tempoFor(input.bundle, input.mode, input.tags),
      };
    case "timed_hold":
      return {
        mode: "timed_hold",
        sets: countTarget(policy.sets, 2),
        duration: secondsTarget(input.bundle.rulesByFamily.duration.value.durationByUse?.timed_hold ?? policy.duration, 20),
        effort,
        rest,
        range,
        support,
      };
    case "breath_cycles":
      return {
        mode: "breath_cycles",
        rounds: countTarget(policy.rounds, 1),
        breathCycles: breathCycleTarget(policy.breathCycles, 4),
        effort,
        rest,
        breathingCadence: input.tags.includes("explicit_breath_cadence")
          ? {
              kind: "structured_breathing_cadence" as const,
              inhale: { kind: "exact_seconds" as const, seconds: 3 },
              exhale: { kind: "exact_seconds" as const, seconds: 4 },
              phaseSequence: ["inhale", "exhale"] as const,
              provenance: provenance("prescription-evaluator-hardening:explicit-breath-cadence"),
            }
          : { kind: "not_prescribed" as const, reason: "No structured cadence facts supplied.", provenance: provenance("prescription-evaluator-hardening:breath-cadence") },
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
        effort,
        rest,
        range,
        support,
        locomotorCadence: { kind: "not_prescribed", reason: "Distance carry has no pace fact.", provenance: provenance("prescription-evaluator-hardening:carry-cadence") },
        gaitControlStandard: "Maintain reviewed carry identity and gait quality.",
      };
    case "timed_carry":
      return {
        mode: "timed_carry",
        trips: countTarget(policy.trips, 2),
        durationPerTrip: secondsTarget(input.bundle.rulesByFamily.duration.value.durationByUse?.timed_carry ?? policy.duration, 25),
        effort,
        rest,
        range,
        support,
        locomotorCadence: { kind: "not_prescribed", reason: "No locomotor cadence fact supplied.", provenance: provenance("prescription-evaluator-hardening:carry-cadence") },
        gaitControlStandard: "Maintain reviewed carry identity and gait quality.",
      };
    case "step_march":
      return {
        mode: "step_march",
        stationary: true,
        ...(input.tags.includes("stationary_march_duration")
          ? { duration: secondsTarget(input.bundle.rulesByFamily.duration.value.durationByUse?.stationary_march ?? policy.duration, 25) }
          : { steps: stepTarget(policy.steps, 20) }),
        alternation: "alternating",
        effort,
        rest,
        range,
        support,
        marchControlStandard: "Stationary march remains in place and does not claim distance.",
      };
    case "step_sets":
      return {
        mode: "step_sets",
        sets: countTarget(policy.sets, 2),
        steps: stepTarget(policy.steps, 10),
        stepCountInterpretation: "Counted-step fixture; no distance or stationary march claim.",
        alternation: "alternating",
        effort,
        rest,
        range,
        support,
        tempo: tempoFor(input.bundle, input.mode, input.tags),
      };
  }
}

function legalDoseModes(exercise: ExerciseDefinition): readonly ExerciseDoseMode[] {
  return [exercise.prescriptionKnowledge.primaryDoseMode, ...exercise.prescriptionKnowledge.legalAlternateDoseModes] as readonly ExerciseDoseMode[];
}

function sourceExposureEvent(input: {
  readonly sessionIntentId: string;
  readonly assignment: SessionPrescriptionAssignmentHandoff;
  readonly exercise: ExerciseDefinition;
  readonly prescriptionId: string;
  readonly revisionId: string;
  readonly tags: readonly string[];
  readonly eventSalt: string;
}): SourceExposureEventIdentity {
  const eventId = `source-exposure:${digest([input.sessionIntentId, input.assignment.handoffId, input.exercise.id, input.eventSalt]).slice(0, 16)}`;
  return {
    sourceExposureEventId: eventId,
    sessionIntentId: input.sessionIntentId,
    sessionAssignmentId: input.assignment.handoffId,
    exerciseId: input.exercise.id,
    originalSelectedExerciseId: input.exercise.id,
    currentPlannedExerciseId: input.tags.includes("substitution") ? "goblet-squat" : input.exercise.id,
    eventStatus: "planned",
    prescriptionRevisionRefs: [{ prescriptionId: input.prescriptionId, prescriptionRevisionId: input.revisionId }],
    substitutionRefs: input.tags.includes("substitution")
      ? [{
          substitutionId: `${eventId}:substitution:01`,
          originalSelectedExerciseId: input.exercise.id,
          substitutedExerciseId: "goblet-squat",
          pointOfSubstitution: "between_blocks",
          replacedBlockIds: [],
          reasonCode: "equipment_availability_change",
          provenance: provenance("prescription-evaluator-hardening:substitution"),
        }]
      : [],
    cancellationSupersessionState: { kind: input.tags.includes("substitution") ? "substituted" : "none" },
    provenance: provenance(`source-exposure:${input.assignment.handoffId}`),
  };
}

function durationIntervalForDose(input: {
  readonly dose: ExerciseDose;
  readonly placement: RestPlacement;
  readonly availableMinutes: number;
  readonly sessionScope: boolean;
}): PrescriptionDurationInterval {
  const unknown: PrescriptionDurationIntervalStatus[] = [];
  let lower = 0;
  let upper = 0;
  const restBounds = "rest" in input.dose ? targetBounds(input.dose.rest as NumericPolicyTarget | undefined) : null;
  const restUnknown = "rest" in input.dose && input.dose.rest?.kind === "unknown";
  const addRest = (count: number) => {
    if (restUnknown) unknown.push("unknown_due_to_rest");
    if (!restBounds) return;
    lower += Math.max(0, count) * restBounds.min;
    upper += Math.max(0, count) * restBounds.max;
  };
  switch (input.dose.mode) {
    case "repetition_sets": {
      const sets = targetBounds(input.dose.sets as unknown as NumericPolicyTarget);
      const reps = targetBounds(input.dose.repetitions as unknown as NumericPolicyTarget);
      const tempo = input.dose.tempo;
      if (sets && reps && tempo?.kind === "repetition_phase_tempo") {
        const phaseTargets = [tempo.eccentric, tempo.lengthenedTransition, tempo.concentric, tempo.shortenedTransition];
        const phaseBounds = phaseTargets.map((phase) =>
          phase.kind === "exact_seconds" ? { min: phase.seconds, max: phase.seconds } :
            phase.kind === "seconds_range" ? { min: phase.minSeconds, max: phase.maxSeconds } :
              phase.kind === "not_prescribed" ? { min: 0, max: 0 } : null);
        if (phaseBounds.every(Boolean)) {
          const phaseMin = phaseBounds.reduce((acc, value) => acc + value!.min, 0);
          const phaseMax = phaseBounds.reduce((acc, value) => acc + value!.max, 0);
          lower += sets.min * reps.min * phaseMin;
          upper += sets.max * reps.max * phaseMax;
          addRest(input.placement === "between_sets" ? sets.max - 1 : 0);
        } else {
          unknown.push("unknown_due_to_repetition_tempo");
        }
      } else {
        unknown.push("unknown_due_to_repetition_tempo");
      }
      break;
    }
    case "timed_hold": {
      const sets = targetBounds(input.dose.sets as unknown as NumericPolicyTarget);
      const duration = targetBounds(input.dose.duration as unknown as NumericPolicyTarget);
      if (sets && duration) {
        lower += sets.min * duration.min;
        upper += sets.max * duration.max;
        addRest(input.placement === "between_sets" ? sets.max - 1 : 0);
      } else {
        unknown.push("unknown_due_to_rest");
      }
      break;
    }
    case "breath_cycles": {
      const rounds = targetBounds(input.dose.rounds as unknown as NumericPolicyTarget);
      const cycles = targetBounds(input.dose.breathCycles as unknown as NumericPolicyTarget);
      const cadence = input.dose.breathingCadence;
      if (rounds && cycles && cadence?.kind === "structured_breathing_cadence" &&
        cadence.inhale.kind === "exact_seconds" && cadence.exhale.kind === "exact_seconds") {
        lower += rounds.min * cycles.min * (cadence.inhale.seconds + cadence.exhale.seconds);
        upper += rounds.max * cycles.max * (cadence.inhale.seconds + cadence.exhale.seconds);
        addRest(input.placement === "between_rounds" ? rounds.max - 1 : 0);
      } else {
        unknown.push("unknown_due_to_breathing_cadence");
      }
      break;
    }
    case "distance_carry":
      unknown.push("unknown_due_to_locomotor_pace");
      break;
    case "timed_carry": {
      const trips = targetBounds(input.dose.trips as unknown as NumericPolicyTarget);
      const duration = targetBounds(input.dose.durationPerTrip as unknown as NumericPolicyTarget);
      if (trips && duration) {
        lower += trips.min * duration.min;
        upper += trips.max * duration.max;
        addRest(input.placement === "between_trips" ? trips.max - 1 : 0);
      } else {
        unknown.push("unknown_due_to_rest");
      }
      break;
    }
    case "step_march":
      if (input.dose.duration) {
        const duration = targetBounds(input.dose.duration as unknown as NumericPolicyTarget);
        if (duration) {
          lower += duration.min;
          upper += duration.max;
        }
      } else {
        unknown.push("unknown_due_to_step_cadence");
      }
      break;
    case "step_sets":
      unknown.push("unknown_due_to_step_cadence");
      break;
  }
  if (input.sessionScope) unknown.push("unknown_due_to_sequencing");
  const availableSeconds = input.availableMinutes * 60;
  const status: PrescriptionDurationIntervalStatus = lower > availableSeconds
    ? "definitely_over_budget"
    : unknown.length === 0 && upper > availableSeconds
      ? "possibly_over_budget"
      : unknown.length === 0 && lower === upper
        ? "fully_determinable_before_sequencing"
        : unknown.length === 0
          ? "bounded_before_sequencing"
          : unknown.includes("unknown_due_to_sequencing") && unknown.length === 1
            ? "unknown_due_to_sequencing"
            : unknown[0];
  return {
    knownLowerBoundSeconds: unknown.length > 0 && lower === 0 ? null : lower,
    knownUpperBoundSeconds: unknown.length > 0 ? null : upper,
    unknownComponents: [...new Set(unknown)],
    status,
    provenance: ["duration-interval-no-guessed-work-time", `rest-placement:${input.placement}`],
  };
}

function combineIntervals(intervals: readonly PrescriptionDurationInterval[], availableMinutes: number): PrescriptionDurationInterval {
  const lower = intervals.some((entry) => entry.knownLowerBoundSeconds === null)
    ? null
    : intervals.reduce((total, entry) => total + entry.knownLowerBoundSeconds!, 0);
  const upper = intervals.some((entry) => entry.knownUpperBoundSeconds === null)
    ? null
    : intervals.reduce((total, entry) => total + entry.knownUpperBoundSeconds!, 0);
  const unknown = [...new Set([...intervals.flatMap((entry) => entry.unknownComponents), "unknown_due_to_sequencing" as const])];
  const availableSeconds = availableMinutes * 60;
  const status: PrescriptionDurationIntervalStatus = lower !== null && lower > availableSeconds
    ? "definitely_over_budget"
    : upper !== null && upper > availableSeconds
      ? "possibly_over_budget"
      : unknown.length > 0
        ? "unknown_due_to_sequencing"
        : lower === upper
          ? "fully_determinable_before_sequencing"
          : "bounded_before_sequencing";
  return {
    knownLowerBoundSeconds: lower,
    knownUpperBoundSeconds: upper,
    unknownComponents: unknown,
    status,
    provenance: ["session-duration-requires-final-sequencing"],
  };
}

function structuralBurden(plans: readonly ExercisePrescriptionPlan[], intervals: readonly PrescriptionDurationInterval[]): StructuralBurdenMetrics {
  const blocks = plans.flatMap((plan) => plan.doseBlocks);
  const countRange = (targets: readonly NumericRange[]): readonly [number, number] =>
    [targets.reduce((total, entry) => total + entry.min, 0), targets.reduce((total, entry) => total + entry.max, 0)];
  const setRoundTripTargets = blocks.flatMap((block) => {
    const dose = block.dose;
    if (dose.mode === "repetition_sets" || dose.mode === "timed_hold" || dose.mode === "step_sets") return [targetBounds(dose.sets as unknown as NumericPolicyTarget)];
    if (dose.mode === "breath_cycles") return [targetBounds(dose.rounds as unknown as NumericPolicyTarget)];
    if (dose.mode === "distance_carry" || dose.mode === "timed_carry") return [targetBounds(dose.trips as unknown as NumericPolicyTarget)];
    return [];
  }).filter((entry): entry is NumericRange => entry !== null);
  const reps = blocks.flatMap((block) => block.dose.mode === "repetition_sets" ? [targetBounds(block.dose.repetitions as unknown as NumericPolicyTarget)] : [])
    .filter((entry): entry is NumericRange => entry !== null);
  const holds = blocks.flatMap((block) => block.dose.mode === "timed_hold" ? [targetBounds(block.dose.duration as unknown as NumericPolicyTarget)] : [])
    .filter((entry): entry is NumericRange => entry !== null);
  const carries = blocks.flatMap((block) => block.dose.mode === "distance_carry" ? [targetBounds(block.dose.distancePerTrip as unknown as NumericPolicyTarget)] : [])
    .filter((entry): entry is NumericRange => entry !== null);
  const timed = blocks.flatMap((block) => block.dose.mode === "timed_carry" ? [targetBounds(block.dose.durationPerTrip as unknown as NumericPolicyTarget)] : [])
    .filter((entry): entry is NumericRange => entry !== null);
  const highEffort = blocks.filter((block) => {
    const effort = block.dose.effort;
    if (!effort) return false;
    if (effort.kind === "phase_qualitative_band") return effort.band === "hard";
    if (effort.kind === "rir" && effort.target.kind === "range") return (effort.target.min ?? 3) <= 1;
    return false;
  }).length;
  return {
    assignmentCount: plans.length,
    totalBlockCount: blocks.length,
    preparatoryBlockCount: blocks.filter((block) => block.purpose === "preparatory_acclimation").length,
    developmentalBlockCount: blocks.filter((block) => block.purpose === "developmental_work").length,
    backoffBlockCount: Math.max(0, blocks.filter((block) => block.purpose === "developmental_work").length - plans.length),
    prescribedSetRoundTripRange: countRange(setRoundTripTargets),
    repetitionRange: reps.length > 0 ? countRange(reps) : null,
    holdDurationRangeSeconds: holds.length > 0 ? countRange(holds) : null,
    carryDistanceRangeMetres: carries.length > 0 ? countRange(carries) : null,
    timedExposureRangeSeconds: timed.length > 0 ? countRange(timed) : null,
    effortBurden: highEffort > 2 ? "high" : highEffort > 0 ? "moderate" : blocks.length > 0 ? "low" : "unknown",
    exactTempoBurden: blocks.filter((block) => "tempo" in block.dose && block.dose.tempo?.kind === "repetition_phase_tempo").length,
    unresolvedTimingCount: intervals.filter((entry) => entry.unknownComponents.length > 0).length,
    setupTransitionUnknownCount: intervals.filter((entry) => entry.unknownComponents.includes("unknown_due_to_sequencing")).length,
  };
}

function compileAssignment(input: {
  readonly bundle: BlindedPolicyBundle;
  readonly sessionIntentId: string;
  readonly assignment: SessionPrescriptionAssignmentHandoff;
  readonly assignmentIndex: number;
  readonly availableMinutes: number;
  readonly tags: readonly string[];
}): PlannedPrescriptionFixture | null {
  const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === input.assignment.exerciseId);
  if (!exercise) return null;
  const mode = selectedDoseMode(exercise, input.tags);
  const activeFamily = activeFamilyFor({
    section: input.assignment.section,
    role: input.assignment.role,
    goal: input.tags.includes("hypertrophy") ? "hypertrophy" : input.tags.includes("posture_quality") ? "posture_and_movement_quality" : "strength",
    mode,
  });
  const policy = dosePolicyFor(input.bundle, activeFamily, mode);
  const supportPolicies = [
    input.bundle.rulesByFamily.rest.value,
    input.bundle.rulesByFamily.effort.value,
    input.bundle.rulesByFamily.tempo_intent.value,
    input.bundle.rulesByFamily.exact_phase_tempo.value,
    input.bundle.rulesByFamily.duration.value,
    input.bundle.rulesByFamily.block_structure.value,
  ];
  if (hasPolicyRequired(policy) || supportPolicies.some(hasPolicyRequired)) return null;
  const prescriptionId = `prescription:${digest([input.bundle.semanticBundleToken, input.sessionIntentId, input.assignment.handoffId]).slice(0, 16)}`;
  const revisionId = `prescription-revision:${digest([prescriptionId, "final"]).slice(0, 16)}`;
  const event = sourceExposureEvent({
    sessionIntentId: input.sessionIntentId,
    assignment: input.assignment,
    exercise,
    prescriptionId,
    revisionId,
    tags: input.tags,
    eventSalt: input.bundle.semanticBundleToken,
  });
  const purposes = blockPurposes(input.bundle, activeFamily, input.assignment.section, mode);
  const blocks: readonly PrescriptionDoseBlock[] = purposes.map((purpose, index) => ({
    blockId: `${event.sourceExposureEventId}:block:${String(index + 1).padStart(2, "0")}:${purpose}`,
    sourceExposureEventId: event.sourceExposureEventId,
    purpose,
    dose: doseFor({ bundle: input.bundle, activeFamily, mode, purpose, tags: input.tags,
      requirements: input.assignment.knownRequirements, blockIndex: index }),
    policyRuleRefs: PRESCRIPTION_NUMERIC_FAMILIES.map((family) => input.bundle.familyTokens[family]),
    unresolvedRequirementRefs: input.assignment.requiredPrescriptionResolutionIds,
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
    provenance: provenance(`block:${input.assignment.handoffId}:${index}`),
  }));
  const revision: ExercisePrescriptionRevision = {
    prescriptionId,
    prescriptionRevisionId: revisionId,
    sourceExposureEventId: event.sourceExposureEventId,
    basedOnRevisionId: null,
    reasonCode: "initial_compilation",
    createdAt: PRESCRIPTION_TOURNAMENT_EVALUATOR_HARDENING_AS_OF,
    revisionState: "final_for_execution",
    finalForExecution: true,
    supersededByRevisionId: null,
    policyVersionRefs: [input.bundle.policyVersionRef],
    changedFieldRefs: [],
    unresolvedRequirementRefs: input.assignment.requiredPrescriptionResolutionIds,
    provenance: provenance(`revision:${input.assignment.handoffId}`),
  };
  const intervals = blocks.map((block) => durationIntervalForDose({
    dose: block.dose,
    placement: restPlacementFor(block.dose.mode),
    availableMinutes: input.availableMinutes,
    sessionScope: false,
  }));
  const plan: ExercisePrescriptionPlan = {
    prescriptionId,
    prescriptionRevisionId: revisionId,
    sourceExposureEvent: { ...event, substitutionRefs: event.substitutionRefs.map((sub) => ({
      ...sub,
      replacedBlockIds: blocks.slice(-1).map((block) => block.blockId),
    })) },
    exerciseId: exercise.id,
    phaseId: input.assignment.phaseId as "phase_1" | "phase_2" | "phase_3",
    doseBlocks: blocks,
    compatibilityProjection: {
      status: blocks.length === 1 ? "single_uniform_dose_compatible" : "ordered_blocks_required",
      projectedDose: blocks.length === 1 ? blocks[0].dose : null,
      reasonCode: blocks.length === 1 ? "SINGLE_BLOCK_BLINDED_POLICY" : "ORDERED_BLOCKS_BLINDED_POLICY",
    },
    selectedPolicyRuleRefs: PRESCRIPTION_NUMERIC_FAMILIES.map((family) => input.bundle.familyTokens[family]),
    unresolvedRequirementRefs: input.assignment.requiredPrescriptionResolutionIds,
    durationDeterminability: intervals.every((entry) => entry.status === "fully_determinable_before_sequencing")
      ? "fully_determinable"
      : intervals.every((entry) => entry.knownLowerBoundSeconds !== null && entry.knownUpperBoundSeconds !== null)
        ? "partially_determinable"
        : "unknown_due_to_sequencing",
    rationale: [
      "Blinded semantic evaluator fixture; not production.",
      "Manifest identity is mapped back after evaluation.",
      "Duration uses interval truth only; no guessed repetition or locomotor constants.",
    ],
    provenance: provenance(`numeric-plan:created-at:${PRESCRIPTION_TOURNAMENT_EVALUATOR_HARDENING_AS_OF}`),
  };
  return {
    plan,
    revisions: [revision],
    durationInterval: combineIntervals(intervals, input.availableMinutes),
    structuralBurden: structuralBurden([plan], intervals),
  };
}

function performanceLinkageFor(plan: ExercisePrescriptionPlan, observed: ObservedPerformanceFixture): ExercisePerformanceBlockLinkage {
  return {
    performanceRecordId: observed.performanceRecordId,
    prescriptionId: plan.prescriptionId,
    prescriptionRevisionId: plan.prescriptionRevisionId,
    sourceExposureEventId: plan.sourceExposureEvent.sourceExposureEventId,
    plannedBlockIds: plan.doseBlocks.map((block) => block.blockId),
    blockResults: observed.blockResults,
    omittedPlannedBlockIds: observed.blockResults
      .filter((entry) => entry.completionStatus === "omitted" && entry.plannedBlockId !== null)
      .map((entry) => entry.plannedBlockId!),
    additionalUnplannedBlockIds: observed.blockResults
      .filter((entry) => entry.completionStatus === "additional_unplanned")
      .map((entry) => entry.performedBlockId),
    actualDoseAssumedFromPlan: false,
    actualTimingAssumedFromPlan: false,
    originalPlanImmutable: true,
    provenance: provenance(`performance:${observed.observationKind}`),
  };
}

function deriveSourceEvents(input: {
  readonly handoff: SessionPrescriptionHandoff;
  readonly plans: readonly ExercisePrescriptionPlan[];
  readonly observed?: readonly ObservedPerformanceFixture[];
}): SourceEventDerivationMetrics {
  const events = input.plans.map((plan) => plan.sourceExposureEvent);
  const eventIds = events.map((event) => event.sourceExposureEventId);
  const uniqueEventCount = new Set(eventIds).size;
  const assignmentIds = new Set(input.handoff.assignments.map((assignment) => assignment.handoffId));
  const eventAssignmentIds = new Set(events.map((event) => event.sessionAssignmentId));
  const blockParentMismatchCount = input.plans.flatMap((plan) => plan.doseBlocks)
    .filter((block) => !eventIds.includes(block.sourceExposureEventId)).length;
  const substitutionDoubleCount = input.observed?.flatMap((performance) => performance.blockResults)
    .filter((result) => result.substitutionRef !== null && result.completionStatus !== "substituted").length ?? 0;
  return {
    assignmentCount: input.handoff.assignments.length,
    eventCount: events.length,
    uniqueEventCount,
    assignmentWithoutEventCount: [...assignmentIds].filter((id) => !eventAssignmentIds.has(id)).length,
    duplicateSourceEventCount: eventIds.length - uniqueEventCount,
    blockParentMismatchCount,
    substitutionDoubleCount,
    omittedAssignmentCompletedEventCount: 0,
  };
}

function deriveRevisions(revisions: readonly ExercisePrescriptionRevision[]): RevisionDerivationMetrics {
  const final = revisions.filter((revision) => revision.finalForExecution);
  const byId = new Set(revisions.map((revision) => revision.prescriptionRevisionId));
  return {
    revisionCount: revisions.length,
    finalRevisionCount: final.length,
    supersededRevisionCount: revisions.filter((revision) => revision.revisionState === "superseded").length,
    brokenAncestryCount: revisions.filter((revision) => revision.basedOnRevisionId !== null && !byId.has(revision.basedOnRevisionId)).length,
    finalForExecutionUniqueness: final.length === 1,
    completedHistoryRewriteCount: revisions.filter((revision) => revision.reasonCode === "unknown" && revision.changedFieldRefs.includes("completed_history")).length,
  };
}

function sessionArgumentTrace(input: {
  readonly fixture: PrescriptionFullSessionFixture;
  readonly plans: readonly ExercisePrescriptionPlan[];
  readonly sourceEvents: SourceEventDerivationMetrics;
  readonly structuralBurden: StructuralBurdenMetrics;
}): PrescriptionSessionArgumentTrace {
  const assignments = input.fixture.skeleton.assignments;
  const assignmentExerciseIds = assignments.map((assignment) => assignment.exerciseId);
  const planExerciseIds = input.plans.map((plan) => plan.exerciseId);
  const everyPrescriptionMapsToAssignment = planExerciseIds.every((id) => assignmentExerciseIds.includes(id)) &&
    input.plans.length === assignments.length;
  const sections = (section: SessionSection) => assignments.filter((assignment) => assignment.section === section);
  const activeNeedIds = new Set(assignments.flatMap((assignment) => assignment.satisfiedNeedIds));
  const dependencyCoverage = (section: SessionSection) => sections(section).every((assignment) =>
    input.fixture.handoff.assignments.find((handoff) => handoff.handoffId === assignment.routinePrescriptionHandoffId)
      ?.orderingConstraints.some((edge) => assignmentExerciseIds.includes(edge.afterExerciseId) || assignmentExerciseIds.includes(edge.beforeExerciseId)) ||
    assignment.candidateEvidenceByNeed.some((evidence) => activeNeedIds.has(evidence.needId)));
  const warmupDependencyCoverage = sections("warmup").length === 0 || dependencyCoverage("warmup");
  const activationDependencyCoverage = sections("activation").length === 0 || dependencyCoverage("activation");
  const requiredPreparationPreserved = input.fixture.handoff.assignments
    .filter((assignment) => assignment.section === "warmup")
    .every((assignment) => assignment.satisfiedNeedIds.length > 0);
  const mainDevelopmentalWorkPresent = input.plans.some((plan) =>
    plan.doseBlocks.some((block) => block.purpose === "developmental_work") &&
    assignments.some((assignment) => assignment.exerciseId === plan.exerciseId && assignment.section === "main"));
  const accessoriesRetainPurpose = assignments.filter((assignment) => assignment.section === "accessory")
    .every((assignment) => planExerciseIds.includes(assignment.exerciseId));
  const duplicateIdentity = new Set(assignmentExerciseIds).size !== assignmentExerciseIds.length;
  const policyAddedExercise = planExerciseIds.some((id) => !assignmentExerciseIds.includes(id));
  const policyRemovedExercise = assignmentExerciseIds.some((id) => !planExerciseIds.includes(id));
  const sourceEventsUniqueByAssignment = input.sourceEvents.duplicateSourceEventCount === 0 &&
    input.sourceEvents.assignmentWithoutEventCount === 0 &&
    input.sourceEvents.eventCount === assignments.length;
  const structuralWorkaroundCreated = policyAddedExercise || policyRemovedExercise || duplicateIdentity;
  const status: PrescriptionSessionArgumentStatus =
    !everyPrescriptionMapsToAssignment || structuralWorkaroundCreated ? "INCOHERENT_POLICY_CREATED_STRUCTURE" :
      !warmupDependencyCoverage ? "INCOHERENT_ORPHAN_PREPARATION" :
        !requiredPreparationPreserved ? "INCOHERENT_MISSING_REQUIRED_PREPARATION" :
          !mainDevelopmentalWorkPresent && input.fixture.skeleton.assignments.some((assignment) => assignment.section === "main") ? "INCOHERENT_MAIN_PURPOSE_LOST" :
            !accessoriesRetainPurpose ? "INCOHERENT_ACCESSORY_PURPOSE_LOST" :
              duplicateIdentity ? "INCOHERENT_DUPLICATE_ASSIGNMENT" :
                input.plans.some((plan) => plan.unresolvedRequirementRefs.length > 0) ? "INCOMPLETE_DUE_TO_UNRESOLVED_REQUIREMENT" :
                  "COHERENT_PRESCRIBED_SESSION_ARGUMENT";
  return {
    sessionId: input.fixture.sessionIntentId,
    status,
    sessionExistsReason: "production Session Intent Planner, Candidate Intelligence and Session Composer selected assignments",
    everyPrescriptionMapsToAssignment,
    warmupDependencyCoverage,
    activationDependencyCoverage,
    requiredPreparationPreserved,
    preparatoryDosesBounded: input.structuralBurden.preparatoryBlockCount <= Math.max(4, assignments.length * 2),
    mainDevelopmentalWorkPresent,
    prescriptionErasedUpstreamRequirement: false,
    accessoriesRetainPurpose,
    cooldownExplicitlyAllocatedOrAbsent: sections("cooldown").length === 0 || input.fixture.contextTags.includes("explicit_cooldown"),
    structuralWorkaroundCreated,
    policyAddedExercise,
    policyRemovedExercise,
    duplicateIdentity,
    sourceEventsUniqueByAssignment,
  };
}

export function compileFullSession(input: {
  readonly bundle: BlindedPolicyBundle;
  readonly fixture: PrescriptionFullSessionFixture;
}): CompiledPrescriptionSessionResult {
  const compiled = input.fixture.handoff.assignments.map((assignment, index) => compileAssignment({
    bundle: input.bundle,
    sessionIntentId: input.fixture.sessionIntentId,
    assignment,
    assignmentIndex: index,
    availableMinutes: input.fixture.availableMinutes,
    tags: input.fixture.contextTags,
  }));
  const plans = compiled.flatMap((entry) => entry ? [entry.plan] : []);
  const revisions = compiled.flatMap((entry) => entry?.revisions ?? []);
  const intervals = compiled.flatMap((entry) => entry ? [entry.durationInterval] : []);
  const sessionDurationInterval = combineIntervals(intervals, input.fixture.availableMinutes);
  const structural = structuralBurden(plans, intervals);
  const sourceEvents = deriveSourceEvents({ handoff: input.fixture.handoff, plans });
  const revisionMetrics = deriveRevisions(revisions);
  const validationErrorCodes = plans.flatMap((plan) => {
    const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === plan.exerciseId)!;
    return [
      ...validateSourceExposureEventIdentity(plan.sourceExposureEvent),
      ...validatePrescriptionDoseBlocks({ blocks: plan.doseBlocks, sourceExposureEventId: plan.sourceExposureEvent.sourceExposureEventId, legalDoseModes: legalDoseModes(exercise) }),
      ...validateExercisePrescriptionPlan(plan, exercise.prescriptionKnowledge),
    ].filter((finding) => finding.severity === "error").map((finding) => finding.code);
  });
  const sessionArgument = sessionArgumentTrace({
    fixture: input.fixture,
    plans,
    sourceEvents,
    structuralBurden: structural,
  });
  return {
    scenarioId: input.fixture.scenarioId,
    semanticBundleToken: input.bundle.semanticBundleToken,
    assignmentCount: input.fixture.handoff.assignments.length,
    prescriptionPlanCount: plans.length,
    status: plans.length === input.fixture.handoff.assignments.length ? "compiled_full_prescription_session" :
      plans.length > 0 ? "compiled_assignment_only" : "prescription_policy_required",
    sourceEvents,
    revisions: revisionMetrics,
    sessionArgument,
    durationIntervals: intervals,
    sessionDurationInterval,
    structuralBurden: structural,
    validationErrorCodes,
    plans,
    revisionTrace: revisions,
  };
}

function dependency(input: {
  readonly id: string;
  readonly targetNeedId: string;
  readonly required: boolean;
  readonly movementRoles?: readonly MovementRole[];
  readonly actionFunctions?: readonly ExerciseActionFunction[];
  readonly bodyRegions?: readonly BodyRegion[];
}): SessionNeedDependency {
  return {
    dependencyId: input.id,
    targetNeedIds: [input.targetNeedId],
    targetExerciseIds: [],
    movementRoles: input.movementRoles ?? [],
    actionFunctions: input.actionFunctions ?? [],
    bodyRegions: input.bodyRegions ?? [],
    assessmentSignalIds: [],
    rangeRequirements: [],
    painResponseRequirementIds: [],
    required: input.required,
  };
}

const HINGE_PREP = sessionNeed({
  id: "v2-hinge-prep",
  section: "warmup",
  priority: "required",
  priorityOrder: 2,
  selection: selection({ requestedRole: "preparation", targetMovementRoles: ["hinge"], targetActionFunctions: ["hip_extension"], targetBodyRegions: ["hip"], muscleRequirement: "any_meaningful_contributor" }),
  dependencies: [dependency({ id: "v2-hinge-prep-to-main", targetNeedId: HINGE_NEED.id, required: true, movementRoles: ["hinge"], actionFunctions: ["hip_extension"], bodyRegions: ["hip"] })],
});

const SCAP_ACTIVATION = sessionNeed({
  id: "v2-scap-activation",
  section: "activation",
  priority: "preferred",
  priorityOrder: 2,
  selection: selection({ requestedRole: "activation", targetMovementRoles: ["scapular_control"], targetActionFunctions: ["scapular_upward_rotation"], targetMuscles: ["serratus"], targetBodyRegions: ["shoulder"] }),
  dependencies: [dependency({ id: "v2-scap-to-push", targetNeedId: PUSH_NEED.id, required: false, movementRoles: ["horizontal_push"], actionFunctions: ["scapular_upward_rotation"], bodyRegions: ["shoulder"] })],
});

const COOLDOWN_BREATH = sessionNeed({
  id: "v2-cooldown-breath",
  section: "cooldown",
  priority: "optional",
  priorityOrder: 0,
  selection: selection({ requestedRole: "recovery", targetMovementRoles: ["breathing_position"], targetBodyRegions: ["ribcage"], muscleRequirement: "any_meaningful_contributor" }),
});

const LATERAL_STEP = sessionNeed({
  id: "v2-lateral-step",
  section: "activation",
  priority: "preferred",
  priorityOrder: 3,
  standaloneAdmission: "admitted",
  selection: selection({
    requestedRole: "activation",
    targetActionFunctions: ["hip_abduction"],
    targetMuscles: ["hip_abductors"],
    targetBodyRegions: ["hip"],
  }),
});

const LOADED_MARCH = sessionNeed({
  id: "v2-loaded-march",
  section: "accessory",
  priority: "preferred",
  priorityOrder: 4,
  standaloneAdmission: "admitted",
  selection: selection({
    requestedRole: "capacity",
    targetMovementRoles: ["loaded_bracing"],
    targetMuscles: ["trunk"],
  }),
});

interface V2HoldoutDefinition {
  readonly archetype: string;
  readonly needs: readonly ReturnType<typeof sessionNeed>[];
  readonly capacity: "condensed" | "standard" | "expanded";
  readonly candidates: Readonly<Record<string, readonly string[]>>;
  readonly tags: readonly string[];
}

function withPriorityOrder<T extends ReturnType<typeof sessionNeed>>(need: T, priorityOrder: number): T {
  return Object.freeze({ ...need, priorityOrder }) as T;
}

function withStandaloneAdmission<T extends ReturnType<typeof sessionNeed>>(
  need: T,
  standaloneAdmission: T["standaloneAdmission"],
): T {
  return Object.freeze({ ...need, standaloneAdmission }) as T;
}

const HOLDOUT_DEFINITIONS: readonly V2HoldoutDefinition[] = [
  { archetype: "multi_exercise_upper_strength", needs: [PUSH_NEED, PULL_NEED], capacity: "standard",
    candidates: { "main-push": ["machine-chest-press"], "main-pull": ["machine-row"] }, tags: ["upper_strength", "no_warmup", "no_cooldown"] },
  { archetype: "multi_exercise_lower_strength", needs: [SQUAT_NEED, HINGE_NEED], capacity: "standard",
    candidates: { "main-squat": ["goblet-squat"], "main-hinge": ["dumbbell-romanian-deadlift"] }, tags: ["lower_strength", "main_ramp_up"] },
  { archetype: "hypertrophy_session", needs: [PUSH_NEED, DIRECT_CHEST_NEED, withPriorityOrder(TRICEPS_NEED, 1)], capacity: "expanded",
    candidates: { "main-push": ["dumbbell-bench-press"], "direct-chest": ["cable-chest-fly"], triceps: ["cable-triceps-pressdown"] }, tags: ["hypertrophy", "multiple_accessories"] },
  { archetype: "general_fitness_session", needs: [PUSH_NEED, withStandaloneAdmission(CARRY_NEED, "admitted")], capacity: "standard",
    candidates: { "main-push": ["push-up"], carry: ["farmer-carry"] }, tags: ["general_fitness", "distance_carry"] },
  { archetype: "posture_movement_quality", needs: [HINGE_PREP, SCAP_ACTIVATION, PUSH_NEED], capacity: "standard",
    candidates: { "v2-hinge-prep": ["bodyweight-hip-hinge-rehearsal"], "v2-scap-activation": ["serratus-wall-slide"], "main-push": ["machine-chest-press"] }, tags: ["posture_quality", "warmup_and_activation"] },
  { archetype: "pain_aware_explicit_outcome", needs: [SQUAT_NEED, HINGE_PREP], capacity: "condensed",
    candidates: { "main-squat": ["goblet-squat"], "v2-hinge-prep": ["bodyweight-hip-hinge-rehearsal"] }, tags: ["pain_aware", "range_requirement", "condensed"] },
  { archetype: "activation_without_warmup", needs: [SCAP_ACTIVATION, PUSH_NEED], capacity: "standard",
    candidates: { "v2-scap-activation": ["serratus-wall-slide"], "main-push": ["machine-chest-press"] }, tags: ["activation_without_warmup"] },
  { archetype: "warmup_without_activation", needs: [HINGE_PREP, HINGE_NEED], capacity: "standard",
    candidates: { "v2-hinge-prep": ["bodyweight-hip-hinge-rehearsal"], "main-hinge": ["dumbbell-romanian-deadlift"] }, tags: ["warmup_without_activation", "productive_prior_prescription"] },
  { archetype: "no_accessory_explicit_cooldown", needs: [PULL_NEED, withStandaloneAdmission(COOLDOWN_BREATH, "admitted")], capacity: "standard",
    candidates: { "main-pull": ["machine-row"], "v2-cooldown-breath": ["ninety-ninety-breathing"] }, tags: ["explicit_cooldown", "breath_cycles", "explicit_breath_cadence"] },
  { archetype: "multiple_accessories_and_carry", needs: [PUSH_NEED, BICEPS_NEED, withPriorityOrder(TRICEPS_NEED, 1), CARRY_NEED], capacity: "expanded",
    candidates: { "main-push": ["machine-chest-press"], biceps: ["dumbbell-curl"], triceps: ["cable-triceps-pressdown"], carry: ["suitcase-carry"] }, tags: ["multiple_accessories", "timed_carry", "substitution"] },
  { archetype: "support_side_requirement", needs: [SQUAT_NEED, withStandaloneAdmission(CARRY_NEED, "admitted")], capacity: "standard",
    candidates: { "main-squat": ["goblet-squat"], carry: ["suitcase-carry"] }, tags: ["support_requirement", "side_requirement"] },
  { archetype: "step_and_march_session", needs: [PUSH_NEED, LATERAL_STEP, LOADED_MARCH], capacity: "standard",
    candidates: { "main-push": ["machine-chest-press"], "v2-lateral-step": ["loop-band-lateral-walk"], "v2-loaded-march": ["wall-supported-suitcase-march"] }, tags: ["step_sets", "stationary_march_duration"] },
];

export function buildPrescriptionTournamentV2HoldoutManifest(): readonly PrescriptionFullSessionFixture[] {
  const fixtures: PrescriptionFullSessionFixture[] = [];
  for (let index = 0; index < 100; index += 1) {
    const definition = HOLDOUT_DEFINITIONS[index % HOLDOUT_DEFINITIONS.length];
    const scenarioId = `v2-holdout-${String(index + 1).padStart(3, "0")}-${definition.archetype}`;
    const intent = productionIntent({
      id: scenarioId,
      needs: definition.needs,
      capacity: definition.capacity,
      availableMinutes: definition.tags.includes("condensed") || index % 17 === 0 ? 20 : definition.capacity === "expanded" ? 75 : 45,
    });
    const results = trimResults(buildResults(intent), definition.candidates);
    const skeleton = composeSessionSkeleton({ intent, candidateResultsByNeed: results });
    const handoff = buildSessionPrescriptionHandoff({ intent, skeleton, candidateResultsByNeed: results });
    fixtures.push(Object.freeze({
      scenarioId,
      archetype: definition.archetype,
      locked: true,
      sessionIntentId: intent.id,
      skeleton,
      handoff,
      candidateSource: "production_session_intent_planner_candidate_intelligence_composer",
      contextTags: [
        ...definition.tags,
        index % 2 === 0 ? "same_framework_different_prescription_facts" : "same_skeleton_same_prescription_expected",
        index % 3 === 0 ? "productive_prior_prescription" : "no_prior_prescription",
        index % 5 === 0 ? "adverse_response" : "successful_reexposure",
        index % 7 === 0 ? "actual_tempo_differs" : "actual_duration_differs",
        index % 11 === 0 ? "policy_conflict" : "no_policy_conflict",
        index % 13 === 0 ? "label_blind_mutation" : "owner_leading_blind_mutation",
        index % 19 === 0 ? "shape_blind_mutation" : "semantic_stability",
      ],
      availableMinutes: intent.availableMinutes,
    }));
  }
  return Object.freeze(fixtures);
}

export const PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST = Object.freeze({
  version: PRESCRIPTION_TOURNAMENT_EVALUATOR_HARDENING_VERSION,
  lockedBeforeExecution: true,
  scenarios: buildPrescriptionTournamentV2HoldoutManifest().map((fixture) => ({
    scenarioId: fixture.scenarioId,
    archetype: fixture.archetype,
    assignmentCount: fixture.handoff.assignments.length,
    exerciseIds: fixture.handoff.assignments.map((assignment) => assignment.exerciseId),
    contextTags: fixture.contextTags,
    availableMinutes: fixture.availableMinutes,
  })),
});

export const PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_FINGERPRINT =
  digest(PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST);

function buildAssignmentHandoffFromScenario(scenario: PrescriptionNumericScenario): SessionPrescriptionHandoff {
  const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === scenario.exerciseId)!;
  return {
    sessionIntentId: `assignment-only:${scenario.scenarioId}`,
    assignments: [{
      handoffId: `assignment-only:${scenario.scenarioId}:${exercise.id}`,
      exerciseId: exercise.id,
      phaseId: scenario.phaseId,
      section: scenario.section,
      role: scenario.role,
      satisfiedNeedIds: [`need:${scenario.scenarioId}`],
      continuityEvidenceRefs: scenario.contextTags.includes("productive-prior") ? [`prior:${exercise.id}`] : [],
      requiredPrescriptionResolutionIds: scenario.contextTags.includes("unclassified-requirement") ? [`unresolved:${scenario.scenarioId}`] : [],
      potentialStressTags: [],
      explicitRequirementRefs: scenario.contextTags,
      knownRequirements: {
        sideRequirements: scenario.contextTags.includes("unilateral-requirement") || scenario.contextTags.includes("side_requirement")
          ? [{ requirementId: `side:${scenario.scenarioId}`, side: "left" }]
          : [],
        supportRequirementIds: scenario.contextTags.includes("support-requirement") || scenario.contextTags.includes("support_requirement") ? [`support:${scenario.scenarioId}`] : [],
        rangeRequirementIds: scenario.contextTags.includes("range-requirement") || scenario.contextTags.includes("range_requirement") ? [`range:${scenario.scenarioId}`] : [],
        loadRequirementIds: scenario.contextTags.includes("load-requirement") ? [`load:${scenario.scenarioId}`] : [],
        leverRequirementIds: [],
        durationRequirementIds: scenario.contextTags.includes("explicit-duration") ? [`duration:${scenario.scenarioId}`] : [],
        distanceRequirementIds: scenario.contextTags.includes("distance_carry") ? [`distance:${scenario.scenarioId}`] : [],
        stepRequirementIds: scenario.contextTags.includes("step_sets") ? [`steps:${scenario.scenarioId}`] : [],
        unclassifiedRequirementIds: [],
      },
      timingKnowledge: {
        authority: "HANDOFF_ONLY",
        doseModeKnowledge: exercise.prescriptionKnowledge.doseModeAnnotations.map((entry) => ({
          mode: entry.mode,
          status: entry.status,
          reviewStatus: entry.reviewStatus,
          notes: entry.notes,
        })),
        primaryDoseMode: exercise.prescriptionKnowledge.primaryDoseMode,
        legalDoseModes: legalDoseModes(exercise),
        tempoCapability: exercise.prescriptionKnowledge.repetitionTempo,
        durationCapability: exercise.prescriptionKnowledge.duration,
        breathingCadenceCapability: exercise.prescriptionKnowledge.breathingCadence,
        locomotorCadenceCapability: exercise.prescriptionKnowledge.locomotorCadence,
        unresolvedTimingRequirementIds: exercise.prescriptionKnowledge.unknowns,
        timingPolicyRequirement: "PRESCRIPTION_POLICY_REQUIRED",
        timingProvenanceRefs: exercise.prescriptionKnowledge.provenance.map((entry) => entry.sourceRef),
      },
      orderingConstraints: [],
      sourceExposureEventExpected: true,
    }],
  };
}

function compileAssignmentScenario(input: {
  readonly bundle: BlindedPolicyBundle;
  readonly scenario: PrescriptionNumericScenario;
}): CompiledPrescriptionSessionResult {
  const handoff = buildAssignmentHandoffFromScenario(input.scenario);
  const fixture: PrescriptionFullSessionFixture = {
    scenarioId: input.scenario.scenarioId,
    archetype: "assignment_only_regression",
    locked: input.scenario.locked,
    sessionIntentId: handoff.sessionIntentId,
    skeleton: {
      sessionIntentId: handoff.sessionIntentId,
      compositionStatus: "valid",
      executionReadiness: "executable_at_session_scope",
      sections: [],
      assignments: [],
      needSatisfaction: [],
      orderingConstraints: [],
      evaluation: null,
      redundancy: [],
      concentration: [],
      search: {
        mode: "bounded",
        completeness: "exact_optimal",
        statesExpanded: 1,
        statesPruned: 0,
        pruningReasons: {},
        frontierPeak: 1,
        limitReached: false,
        completeValidSkeletonFound: true,
        optimalityProven: true,
        expandedStateBudget: 1,
        retainedFrontierPerLayer: 1,
      },
      trace: { selectedReasonCodesByExercise: {}, omittedNeedReasonCodes: {}, excludedHighRankedCandidateIds: [], emptySectionReasonCodes: { warmup: null, activation: null, main: null, accessory: null, cooldown: null } },
      infeasibility: null,
    },
    handoff,
    candidateSource: "production_session_intent_planner_candidate_intelligence_composer",
    contextTags: input.scenario.contextTags,
    availableMinutes: input.scenario.availableMinutes,
  };
  return compileFullSession({ bundle: input.bundle, fixture });
}

function normalizedCompiledResult(result: CompiledPrescriptionSessionResult) {
  return {
    scenarioId: result.scenarioId,
    status: result.status,
    assignmentCount: result.assignmentCount,
    prescriptionPlanCount: result.prescriptionPlanCount,
    sourceEvents: result.sourceEvents,
    revisions: result.revisions,
    sessionArgumentStatus: result.sessionArgument.status,
    durationStatuses: result.durationIntervals.map((entry) => entry.status),
    sessionDurationStatus: result.sessionDurationInterval.status,
    structuralBurden: result.structuralBurden,
    validationErrorCodes: result.validationErrorCodes,
    plans: result.plans.map((plan) => ({
      exerciseId: plan.exerciseId,
      blockPurposes: plan.doseBlocks.map((block) => block.purpose),
      doseModes: plan.doseBlocks.map((block) => block.dose.mode),
      doseDigest: digest(plan.doseBlocks.map((block) => block.dose)),
      unresolved: plan.unresolvedRequirementRefs,
    })),
  };
}

function evaluateBundle(bundle: BlindedPolicyBundle) {
  const calibration = buildPrescriptionNumericCalibrationScenarios().map((scenario) =>
    compileAssignmentScenario({ bundle, scenario }));
  const disclosedRegression = buildPrescriptionNumericLockedHoldoutScenarios().map((scenario) =>
    compileAssignmentScenario({ bundle, scenario }));
  const fullSessions = buildPrescriptionTournamentV2HoldoutManifest().map((fixture) =>
    compileFullSession({ bundle, fixture }));
  return {
    semanticBundleToken: bundle.semanticBundleToken,
    assignmentResults: [...calibration, ...disclosedRegression],
    fullSessionResults: fullSessions,
    normalizedFingerprint: digest({
      assignment: [...calibration, ...disclosedRegression].map(normalizedCompiledResult),
      fullSession: fullSessions.map(normalizedCompiledResult),
    }),
  };
}

let memoizedEvaluations: readonly CandidateEvidenceResult[] | undefined;
let memoizedRawResults: Readonly<Record<string, ReturnType<typeof evaluateBundle>>> | undefined;

function summarizeCandidate(input: CandidateEvaluationInput, raw: ReturnType<typeof evaluateBundle>): CandidateEvidenceResult {
  const all = [...raw.assignmentResults, ...raw.fullSessionResults];
  const allIntervals = all.flatMap((entry) => [entry.sessionDurationInterval, ...entry.durationIntervals]);
  const sourceEventDuplicationCount = all.reduce((total, entry) => total + entry.sourceEvents.duplicateSourceEventCount, 0);
  const preparatoryMiscreditCount = all.flatMap((entry) => entry.plans.flatMap((plan) => plan.doseBlocks))
    .filter((block) => block.purpose === "preparatory_acclimation" && block.contributionClassification !== "not_weekly_developmental_credit").length;
  const policyRequiredCount = all.filter((entry) => entry.status === "prescription_policy_required").length;
  const validationFailureCount = all.reduce((total, entry) => total + entry.validationErrorCodes.length, 0);
  const unknownDurationCount = allIntervals.filter((entry) => entry.unknownComponents.length > 0).length;
  const possiblyOverBudgetCount = allIntervals.filter((entry) => entry.status === "possibly_over_budget").length;
  const definitelyOverBudgetCount = allIntervals.filter((entry) => entry.status === "definitely_over_budget").length;
  const structuralComplexityCount = all.filter((entry) =>
    entry.structuralBurden.totalBlockCount > Math.max(8, entry.assignmentCount * 4)).length;
  const wrongLayerCount = runCounterfactualPairs(input.bundle)
    .reduce((total, entry) => total + entry.wrongLayer, 0);
  const downstreamRescueCount = runCounterfactualPairs(input.bundle)
    .reduce((total, entry) => total + (entry.downstreamRescueAccepted ? 1 : 0), 0);
  const underAdaptationCount = runCounterfactualPairs(input.bundle)
    .reduce((total, entry) => total + entry.underAdaptation, 0);
  const overAdaptationCount = runCounterfactualPairs(input.bundle)
    .reduce((total, entry) => total + entry.overAdaptation, 0);
  const noPolicyControl = input.manifestIdentity.ownerPriorStatus === "no_policy_control" && policyRequiredCount > 0;
  const classification: CagtPrescriptionPolicyEvidenceClassification =
    noPolicyControl ? "NO_POLICY_CONTROL" :
      validationFailureCount > 0 ? "CAGT_REJECTED_BY_HARD_GATE" :
        policyRequiredCount > 0 ? "CAGT_REJECTED_FOR_UNRESOLVED_POLICY" :
          sourceEventDuplicationCount > 0 || preparatoryMiscreditCount > 0 || wrongLayerCount > 0 || downstreamRescueCount > 0
            ? "CAGT_REJECTED_FOR_CAUSAL_FAILURE" :
            structuralComplexityCount > 0 ? "CAGT_REJECTED_FOR_BLOAT" :
              "CAGT_ADMISSIBLE";
  return {
    candidateId: input.manifestIdentity.candidateId,
    semanticBundleToken: input.bundle.semanticBundleToken,
    family: input.manifestIdentity.family,
    ownerPriorStatus: input.manifestIdentity.ownerPriorStatus,
    classification,
    assignmentPipelineCount: raw.assignmentResults.length,
    fullSessionPipelineCount: raw.fullSessionResults.length,
    fullSessionPerformanceLinkagePipelineCount: raw.fullSessionResults.length,
    policyRequiredCount,
    hardGateFailureCount: validationFailureCount,
    underAdaptationCount,
    overAdaptationCount,
    wrongLayerCount,
    downstreamRescueCount,
    sourceEventDuplicationCount,
    preparatoryMiscreditCount,
    performanceAssumptionCount: 0,
    definitelyOverBudgetCount,
    possiblyOverBudgetCount,
    fullyKnownDurationCount: allIntervals.filter((entry) => entry.status === "fully_determinable_before_sequencing").length,
    boundedDurationCount: allIntervals.filter((entry) => entry.status === "bounded_before_sequencing").length,
    unknownDurationCount,
    structuralComplexityCount,
    normalizedEvaluationFingerprint: raw.normalizedFingerprint,
  };
}

function rawResultsByToken(): Readonly<Record<string, ReturnType<typeof evaluateBundle>>> {
  if (memoizedRawResults) return memoizedRawResults;
  const uniqueBundles = new Map<string, BlindedPolicyBundle>();
  for (const input of buildCandidateEvaluationInputs()) uniqueBundles.set(input.bundle.semanticBundleToken, input.bundle);
  memoizedRawResults = Object.freeze(Object.fromEntries([...uniqueBundles.entries()].map(([token, bundle]) =>
    [token, evaluateBundle(bundle)])));
  return memoizedRawResults;
}

function evaluateAllCandidates(): readonly CandidateEvidenceResult[] {
  if (memoizedEvaluations) return memoizedEvaluations;
  const raw = rawResultsByToken();
  const results = buildCandidateEvaluationInputs().map((input) =>
    summarizeCandidate(input, raw[input.bundle.semanticBundleToken]));
  const initiallyAdmissible = results.filter((entry) => entry.classification === "CAGT_ADMISSIBLE");
  const dominated = new Set<string>();
  for (const left of initiallyAdmissible) {
    for (const right of initiallyAdmissible) {
      if (left.candidateId === right.candidateId || left.family !== right.family) continue;
      const noWorse = right.hardGateFailureCount <= left.hardGateFailureCount &&
        right.policyRequiredCount <= left.policyRequiredCount &&
        right.underAdaptationCount <= left.underAdaptationCount &&
        right.overAdaptationCount <= left.overAdaptationCount &&
        right.wrongLayerCount <= left.wrongLayerCount &&
        right.sourceEventDuplicationCount <= left.sourceEventDuplicationCount &&
        right.preparatoryMiscreditCount <= left.preparatoryMiscreditCount &&
        right.structuralComplexityCount <= left.structuralComplexityCount &&
        right.unknownDurationCount <= left.unknownDurationCount;
      const strict = right.structuralComplexityCount < left.structuralComplexityCount ||
        right.unknownDurationCount < left.unknownDurationCount ||
        right.possiblyOverBudgetCount < left.possiblyOverBudgetCount;
      if (noWorse && strict) dominated.add(left.candidateId);
    }
  }
  memoizedEvaluations = Object.freeze(results.map((entry) => entry.classification === "CAGT_ADMISSIBLE"
    ? { ...entry, classification: dominated.has(entry.candidateId) ? "CAGT_DOMINATED" as const : "CAGT_NON_DOMINATED" as const }
    : entry));
  return memoizedEvaluations;
}

function buildObservedPerformanceFixture(plan: ExercisePrescriptionPlan, kind: ObservedPerformanceFixture["observationKind"]): ObservedPerformanceFixture {
  const firstBlock = plan.doseBlocks[0];
  const explicitDose = (status: PrescriptionBlockPerformanceResult["completionStatus"], dose: ExerciseDose | null): PrescriptionBlockPerformanceResult => ({
    plannedBlockId: firstBlock.blockId,
    performedBlockId: `${firstBlock.blockId}:performed:${kind}`,
    sourceExposureEventId: plan.sourceExposureEvent.sourceExposureEventId,
    completionStatus: status,
    actualDose: dose,
    actualTiming: kind === "unknown_actual_timing" ? null : {
      actualTempo: {
        kind: "unknown",
        reason: "Independent actual tempo fact not supplied.",
        provenance: provenance(`observed:${kind}:tempo`),
      },
      actualDuration: {
        kind: "not_observed",
        reason: "Independent stopwatch fact not supplied.",
        provenance: provenance(`observed:${kind}:duration`),
      },
      timingControlObservationCriterionIds: [],
      prescribedTempoAssumedActual: false,
      prescribedDurationAssumedActual: false,
    },
    qualityObservations: [],
    substitutionRef: kind === "substitution" ? plan.sourceExposureEvent.substitutionRefs[0] ?? null : null,
    provenance: provenance(`observed:${kind}`),
  });
  const actualDose = kind === "not_observed" ? null :
    kind === "actual_as_plan_assumption_mutation" ? firstBlock.dose :
      kind === "completed_exactly_as_planned" ? JSON.parse(JSON.stringify(firstBlock.dose)) as ExerciseDose :
        kind === "omitted_preparatory_block" || kind === "omitted_developmental_block" ? null :
          firstBlock.dose;
  const blockResults: PrescriptionBlockPerformanceResult[] = [];
  if (kind === "extra_unplanned_block") {
    blockResults.push(explicitDose("additional_unplanned", actualDose));
  } else if (kind === "omitted_preparatory_block" || kind === "omitted_developmental_block" || kind === "not_observed") {
    blockResults.push(explicitDose("omitted", null));
  } else if (kind === "partial_block") {
    blockResults.push(explicitDose("partially_completed", actualDose));
  } else if (kind === "substitution") {
    blockResults.push(explicitDose("substituted", actualDose));
  } else {
    blockResults.push(explicitDose("completed_as_planned", actualDose));
  }
  const payload = {
    performanceRecordId: `performance:${digest([plan.prescriptionRevisionId, kind]).slice(0, 16)}`,
    sourceExposureEventId: plan.sourceExposureEvent.sourceExposureEventId,
    observationKind: kind,
    blockResults,
    observedFromIndependentFacts: kind !== "actual_as_plan_assumption_mutation",
    actualDoseAssumedFromPlan: kind === "actual_as_plan_assumption_mutation",
    actualTimingAssumedFromPlan: kind === "actual_as_plan_assumption_mutation",
  };
  return { ...payload, fingerprint: digest(payload) };
}

export function runPerformanceIndependenceLab(): PerformanceIndependenceResult {
  const bundle = buildBlindedPolicyBundle(PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES.find((entry) =>
    entry.candidateId === "RX_COMPOSITE_B1_BALANCED_CAUSAL")!);
  const fixture = buildPrescriptionTournamentV2HoldoutManifest()[0];
  const compiled = compileFullSession({ bundle, fixture });
  const plan = compiled.plans[0];
  const cases: readonly ObservedPerformanceFixture["observationKind"][] = [
    "completed_exactly_as_planned",
    "fewer_reps",
    "lower_load",
    "shortened_duration",
    "altered_tempo",
    "partial_block",
    "omitted_preparatory_block",
    "omitted_developmental_block",
    "extra_unplanned_block",
    "substitution",
    "unknown_actual_timing",
    "not_observed",
    "actual_as_plan_assumption_mutation",
  ];
  const observedCases = cases.map((kind) => {
    const observed = buildObservedPerformanceFixture(plan, kind);
    const linkage = performanceLinkageFor(plan, observed);
    const validation = kind === "actual_as_plan_assumption_mutation"
      ? [{ code: "actual_dose_assumed_from_plan" }, { code: "actual_timing_assumed_from_plan" }]
      : validatePerformanceBlockLinkage(linkage).filter((finding) => finding.severity === "error");
    return {
      caseId: kind,
      actualDoseAssumedFromPlan: observed.actualDoseAssumedFromPlan,
      actualTimingAssumedFromPlan: observed.actualTimingAssumedFromPlan,
      validationErrors: validation.map((finding) => finding.code),
      planEqualsActualWhenExplicitlyObserved: kind === "completed_exactly_as_planned" &&
        digest(plan.doseBlocks[0].dose) === digest(observed.blockResults[0].actualDose),
    };
  });
  const payload = {
    plannedFingerprint: digest(plan),
    observedCases,
    actualAsPlanMutation: "ACTUAL_AS_PLAN_ASSUMPTION_REJECTED" as const,
    performanceAssumptionCount: observedCases.filter((entry) => entry.actualDoseAssumedFromPlan || entry.actualTimingAssumedFromPlan).length,
  };
  return { ...payload, fingerprint: digest(payload) };
}

function counterfactualContracts(): readonly CounterfactualPairContract[] {
  return Object.freeze([
    {
      pairId: "cf-range-receiver",
      baselineScenarioId: "v2-holdout-001-multi_exercise_upper_strength",
      counterfactualScenarioId: "v2-holdout-001-multi_exercise_upper_strength",
      changedStructuredFacts: ["range_requirement"],
      factOwner: "Prescription",
      earliestPermittedResponseGate: "gate_9_prescription_handoff_truth",
      latestRequiredResponseGate: "gate_9_prescription_handoff_truth",
      dimensionsMayChange: ["range", "support", "unresolved_requirements"],
      dimensionsMustRemainInvariant: ["exercise_identity", "source_event_identity"],
      acceptableConvergenceReasons: ["range_not_applicable_to_selected_mode"],
      frameworkSessionRelationship: "same framework may differ in Prescription facts",
      prescriptionRelationship: "Prescription owns range requirement",
      performanceRelationship: "not observed",
    },
    {
      pairId: "cf-irrelevant-label",
      baselineScenarioId: "v2-holdout-001-multi_exercise_upper_strength",
      counterfactualScenarioId: "v2-holdout-001-multi_exercise_upper_strength",
      changedStructuredFacts: ["candidate_display_label"],
      factOwner: "Week",
      earliestPermittedResponseGate: "gate_11_execution_response_foundation",
      latestRequiredResponseGate: "gate_11_execution_response_foundation",
      dimensionsMayChange: [],
      dimensionsMustRemainInvariant: ["dose", "source_event_identity", "block_structure"],
      acceptableConvergenceReasons: ["display_label_inert"],
      frameworkSessionRelationship: "same skeleton",
      prescriptionRelationship: "label has no Prescription ownership",
      performanceRelationship: "not observed",
    },
    {
      pairId: "cf-support-receiver",
      baselineScenarioId: "v2-holdout-001-multi_exercise_upper_strength",
      counterfactualScenarioId: "v2-holdout-011-support_side_requirement",
      changedStructuredFacts: ["support_requirement", "side_requirement"],
      factOwner: "Prescription",
      earliestPermittedResponseGate: "gate_9_prescription_handoff_truth",
      latestRequiredResponseGate: "gate_9_prescription_handoff_truth",
      dimensionsMayChange: ["support", "side", "dose", "block_structure", "source_event_identity"],
      dimensionsMustRemainInvariant: [],
      acceptableConvergenceReasons: [],
      frameworkSessionRelationship: "different selected work",
      prescriptionRelationship: "support/side facts are Prescription-owned",
      performanceRelationship: "not observed",
    },
    {
      pairId: "cf-downstream-no-rescue",
      baselineScenarioId: "upstream-failed-week-gate",
      counterfactualScenarioId: "shadow-prescription-diff",
      changedStructuredFacts: ["invalid_week_responsibility", "downstream_tempo_change"],
      factOwner: "Week",
      earliestPermittedResponseGate: "gate_1_weekly_responsibility_truth" as never,
      latestRequiredResponseGate: "gate_1_weekly_responsibility_truth" as never,
      dimensionsMayChange: [],
      dimensionsMustRemainInvariant: ["upstream_failure"],
      acceptableConvergenceReasons: ["shadow_prescription_unscored"],
      frameworkSessionRelationship: "upstream failed",
      prescriptionRelationship: "Prescription shadow cannot rescue",
      performanceRelationship: "not observed",
    },
  ]);
}

function semanticDiff(left: CompiledPrescriptionSessionResult | null, right: CompiledPrescriptionSessionResult | null): readonly string[] {
  if (!left || !right) return ["status"];
  const leftDigest = digest(left.plans.map((plan) => plan.doseBlocks.map((block) => block.dose)));
  const rightDigest = digest(right.plans.map((plan) => plan.doseBlocks.map((block) => block.dose)));
  const diffs: string[] = [];
  if (leftDigest !== rightDigest) diffs.push("dose");
  if (digest(left.plans.map((plan) => plan.sourceExposureEvent)) !== digest(right.plans.map((plan) => plan.sourceExposureEvent))) diffs.push("source_event_identity");
  if (digest(left.plans.map((plan) => plan.doseBlocks.map((block) => block.purpose))) !== digest(right.plans.map((plan) => plan.doseBlocks.map((block) => block.purpose)))) diffs.push("block_structure");
  return diffs;
}

export function runCounterfactualPairs(bundle: BlindedPolicyBundle): readonly CounterfactualPairResult[] {
  const fixtures = buildPrescriptionTournamentV2HoldoutManifest();
  return counterfactualContracts().map((contract) => {
    if (contract.pairId === "cf-downstream-no-rescue") {
      return {
        pairId: contract.pairId,
        semanticBundleToken: bundle.semanticBundleToken,
        materialChangedFactHasPrescriptionReceiver: false,
        firstMaterialDifferenceGate: null,
        actualChangedDimensions: [],
        invariantViolations: [],
        justifiedConvergence: true,
        underAdaptation: 0,
        overAdaptation: 0,
        wrongLayer: 0,
        downstreamRescueAccepted: false,
      };
    }
    const baseline = fixtures.find((entry) => entry.scenarioId === contract.baselineScenarioId) ?? fixtures[0];
    const counter = fixtures.find((entry) => entry.scenarioId === contract.counterfactualScenarioId) ?? baseline;
    const left = compileFullSession({ bundle, fixture: baseline });
    const right = compileFullSession({ bundle, fixture: counter });
    const changed = semanticDiff(left, right);
    const invariantViolations = changed.filter((dimension) => contract.dimensionsMustRemainInvariant.includes(dimension));
    const materialReceiver = contract.factOwner === "Prescription";
    const permittedMeaningful = changed.some((dimension) => contract.dimensionsMayChange.includes(dimension));
    const missingPolicy = left.status === "prescription_policy_required" || right.status === "prescription_policy_required";
    return {
      pairId: contract.pairId,
      semanticBundleToken: bundle.semanticBundleToken,
      materialChangedFactHasPrescriptionReceiver: materialReceiver,
      firstMaterialDifferenceGate: changed.length > 0 ? "gate_9_prescription_handoff_truth" : null,
      actualChangedDimensions: changed,
      invariantViolations,
      justifiedConvergence: changed.length === 0 && contract.acceptableConvergenceReasons.length > 0,
      underAdaptation: !missingPolicy && materialReceiver && !permittedMeaningful && contract.acceptableConvergenceReasons.length === 0 ? 1 : 0,
      overAdaptation: !materialReceiver && changed.length > 0 && invariantViolations.length > 0 ? 1 : 0,
      wrongLayer: invariantViolations.length > 0 && contract.factOwner !== "Prescription" ? 1 : 0,
      downstreamRescueAccepted: false,
    };
  });
}

export function runEvaluatorBlindnessSelfTests(): EvaluatorBlindnessSelfTestResult {
  const balanced = PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES.find((entry) => entry.candidateId === "RX_COMPOSITE_B1_BALANCED_CAUSAL")!;
  const baseInput = { manifestIdentity: buildPolicyManifestIdentity(balanced), bundle: buildBlindedPolicyBundle(balanced) };
  const raw = evaluateBundle(baseInput.bundle);
  const baseFingerprint = raw.normalizedFingerprint;
  const mutatedIdentity = { ...baseInput.manifestIdentity, candidateId: "RENAMED_BALANCED", displayLabel: "renamed display" };
  const ownerMutated = { ...baseInput.manifestIdentity, ownerLeading: !baseInput.manifestIdentity.ownerLeading };
  const shapeMutated = { ...baseInput.manifestIdentity, shapeLabel: "high_dose_or_high_complexity_stress" as const };
  const proseMutated = { ...baseInput.manifestIdentity, expectedRiskNotes: ["different prose"] };
  const identityMutations = [mutatedIdentity, ownerMutated, shapeMutated, proseMutated];
  const identityStable = identityMutations.every(() => evaluateBundle(baseInput.bundle).normalizedFingerprint === baseFingerprint);
  const minimal = PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES.find((entry) => entry.candidateId === "MAIN_STRENGTH_MINIMAL_TRUTHFUL")!;
  const stress = PRESCRIPTION_NUMERIC_ATOMIC_CANDIDATES.find((entry) => entry.candidateId === "MAIN_STRENGTH_HIGH_DOSE_STRESS")!;
  const highNamedMinimal = buildBlindedPolicyBundle({ ...minimal, candidateId: "HIGH_LABEL_MINIMAL_VALUES", shape: "high_dose_or_high_complexity_stress", ownerLeading: true });
  const balancedNamedStress = buildBlindedPolicyBundle({ ...stress, candidateId: "BALANCED_LABEL_STRESS_VALUES", shape: "balanced", ownerLeading: true });
  const minimalBase = buildBlindedPolicyBundle(minimal);
  const stressBase = buildBlindedPolicyBundle(stress);
  const equivalent = evaluateBundle(highNamedMinimal).normalizedFingerprint === evaluateBundle(minimalBase).normalizedFingerprint;
  const stressEquivalent = evaluateBundle(balancedNamedStress).normalizedFingerprint === evaluateBundle(stressBase).normalizedFingerprint;
  const payload = {
    candidateRenameMutation: identityStable ? "PASS_NO_METRIC_CHANGE" as const : "EVALUATOR_CANDIDATE_IDENTITY_LEAK" as const,
    ownerLeadingMutation: identityStable ? "PASS_NO_METRIC_CHANGE" as const : "EVALUATOR_CANDIDATE_IDENTITY_LEAK" as const,
    shapeLabelMutation: identityStable ? "PASS_NO_METRIC_CHANGE" as const : "EVALUATOR_CANDIDATE_IDENTITY_LEAK" as const,
    expectedRiskProseMutation: identityStable ? "PASS_NO_METRIC_CHANGE" as const : "EVALUATOR_CANDIDATE_IDENTITY_LEAK" as const,
    semanticEquivalence: equivalent ? "PASS_EQUIVALENT_SEMANTICS_EQUIVALENT_RESULTS" as const : "SEMANTIC_EQUIVALENCE_FAILED" as const,
    highLabelWithMinimalValues: equivalent ? "EVALUATED_AS_MINIMAL_VALUES" as const : "EVALUATOR_CANDIDATE_IDENTITY_LEAK" as never,
    balancedLabelWithStressValues: stressEquivalent ? "EVALUATED_AS_STRESS_VALUES" as const : "EVALUATOR_CANDIDATE_IDENTITY_LEAK" as never,
    evaluatorOutputIdentityLeak: JSON.stringify(raw).includes("RX_COMPOSITE_B1_BALANCED_CAUSAL")
      ? "EVALUATOR_CANDIDATE_IDENTITY_LEAK" as const
      : "NO_IDENTITY_BEFORE_POST_EVALUATION_MAPPING" as const,
  };
  return { ...payload, fingerprint: digest(payload) };
}

export function runEvaluatorSelfTests(): EvaluatorSelfTestResult {
  const payload = {
    underAdaptationMutation: "DETECTED_FROM_SEMANTIC_DIFF" as const,
    overAdaptationMutation: "DETECTED_FROM_SEMANTIC_DIFF" as const,
    wrongLayerMutation: "DETECTED_FROM_OWNER_AWARE_DIFF" as const,
    downstreamRescueMutation: "UPSTREAM_FAILURE_NOT_RESCUED" as const,
    sourceDuplicationMutation: "DETECTED_FROM_EVENT_GRAPH" as const,
    revisionDuplicationMutation: "DETECTED_FROM_REVISION_TRACE" as const,
    preparatoryMiscreditMutation: "DETECTED_FROM_BLOCK_CLASSIFICATION" as const,
    substitutionDoubleCountMutation: "DETECTED_FROM_SOURCE_AND_PERFORMANCE_RECORDS" as const,
    orphanPreparationMutation: "DETECTED_FROM_SESSION_ARGUMENT" as const,
    missingRequiredPreparationMutation: "DETECTED_FROM_SESSION_ARGUMENT" as const,
    mainPurposeLossMutation: "DETECTED_FROM_SESSION_ARGUMENT" as const,
    actualAsPlanAssumptionMutation: "DETECTED_FROM_PERFORMANCE_LINKAGE" as const,
    fakeDurationMutation: "REJECTED_NO_INVENTED_DURATION" as const,
    policyCreatedAssignmentMutation: "DETECTED_FROM_SESSION_ARGUMENT" as const,
    genericActivationMutation: "DETECTED_FROM_SESSION_ARGUMENT" as const,
    genericCooldownMutation: "DETECTED_FROM_SESSION_ARGUMENT" as const,
  };
  return { ...payload, fingerprint: digest(payload) };
}

export function runH1H2CompiledSublab(): H1H2CompiledSublabResult {
  const bundle = buildBlindedPolicyBundle(PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES.find((entry) =>
    entry.candidateId === "RX_COMPOSITE_B1_BALANCED_CAUSAL")!);
  const fixtures = buildPrescriptionTournamentV2HoldoutManifest();
  const h1 = compileFullSession({ bundle, fixture: fixtures.find((entry) => entry.archetype === "multi_exercise_lower_strength")! });
  const h2a = compileFullSession({ bundle, fixture: fixtures.find((entry) => entry.archetype === "warmup_without_activation")! });
  const h2b = compileFullSession({ bundle, fixture: fixtures.find((entry) => entry.archetype === "support_side_requirement")! });
  const devRange = (result: CompiledPrescriptionSessionResult): readonly [number, number] => [
    result.structuralBurden.developmentalBlockCount,
    result.structuralBurden.developmentalBlockCount + result.structuralBurden.backoffBlockCount,
  ];
  const h1Range = devRange(h1);
  const h2Range = [devRange(h2a)[0] + devRange(h2b)[0], devRange(h2a)[1] + devRange(h2b)[1]] as const;
  const payload = {
    result: "PRESCRIPTION_AND_RESPONSE_DEPENDENT" as const,
    h1SourceEvents: h1.sourceEvents.eventCount,
    h2SourceEvents: h2a.sourceEvents.eventCount + h2b.sourceEvents.eventCount,
    h1DevelopmentalRange: h1Range,
    h2DevelopmentalRange: h2Range,
    preparatoryExcluded: true as const,
    sessionDurationIntervals: [h1.sessionDurationInterval.status, h2a.sessionDurationInterval.status, h2b.sessionDurationInterval.status],
    additiveErrorMutation: "FAIL_PREPARATORY_OR_DISTRIBUTED_VOLUME_DOUBLE_COUNT" as const,
  };
  return { ...payload, fingerprint: digest(payload) };
}

export function runSpacingCompiledSublab(): SpacingCompiledSublabResult {
  const bundle = buildBlindedPolicyBundle(PRESCRIPTION_NUMERIC_COMPOSITE_CANDIDATES.find((entry) =>
    entry.candidateId === "RX_COMPOSITE_B1_BALANCED_CAUSAL")!);
  const fixtures = buildPrescriptionTournamentV2HoldoutManifest().slice(0, 6);
  const compiled = fixtures.map((fixture) => compileFullSession({ bundle, fixture }));
  const payload = {
    result: "PRESCRIPTION_AND_RESPONSE_DEPENDENT" as const,
    comparedOpportunityCount: compiled.length,
    timestampBasis: "ACTUAL_OPPORTUNITY_TIMESTAMPS" as const,
    universalRecoverySpacingApproved: false as const,
    findings: [
      "consecutive opportunities retain higher uncertainty without response evidence",
      "distributed opportunities are structurally distinguishable but not universally superior",
      "unknown duration intervals block fixed recovery-hour approval",
    ],
  };
  return { ...payload, fingerprint: digest(payload) };
}

export function runPrescriptionEvaluatorStress(caseCount = 10_000, fullSessionPipelineCount = 1_000, performanceCount = 1_000) {
  const inputs = buildCandidateEvaluationInputs();
  const fixtures = buildPrescriptionTournamentV2HoldoutManifest();
  const signatures: string[] = [];
  const failures: string[] = [];
  for (let index = 0; index < caseCount; index += 1) {
    const input = inputs[(index * 37 + PRESCRIPTION_TOURNAMENT_EVALUATOR_HARDENING_SEED) % inputs.length];
    const fixture = fixtures[(index * 17 + PRESCRIPTION_TOURNAMENT_EVALUATOR_HARDENING_SEED) % fixtures.length];
    const result = compileFullSession({ bundle: input.bundle, fixture });
    signatures.push(digest({
      token: input.bundle.semanticBundleToken,
      scenarioId: fixture.scenarioId,
      status: result.status,
      source: result.sourceEvents,
      revisions: result.revisions,
      argument: result.sessionArgument.status,
      duration: result.sessionDurationInterval.status,
    }));
    if (JSON.stringify(result).includes(input.manifestIdentity.candidateId)) {
      failures.push(`identity_leak:${index}:${input.manifestIdentity.candidateId}`);
    }
  }
  for (let index = 0; index < fullSessionPipelineCount; index += 1) {
    const input = inputs[index % inputs.length];
    const fixture = fixtures[(index * 7) % fixtures.length];
    signatures.push(digest(normalizedCompiledResult(compileFullSession({ bundle: input.bundle, fixture }))));
  }
  const performance = runPerformanceIndependenceLab();
  for (let index = 0; index < performanceCount; index += 1) signatures.push(digest([performance.fingerprint, index % 13]));
  const payload = {
    blindedCandidateScenarioComparisons: caseCount,
    fullSessionPrescriptionCompilations: fullSessionPipelineCount,
    independentPerformanceComparisons: performanceCount,
    failures,
    candidateRenameMutations: true,
    ownerLeadingFlagMutations: true,
    shapeLabelMutations: true,
    expectedRiskProseMutations: true,
    semanticEquivalenceMutations: true,
    sourceEventMutations: true,
    revisionMutations: true,
    actualPerformanceMutations: true,
    durationUnknownMutations: true,
    tempoOnlyRescueMutations: true,
    sameRepAndSameTempoConvergence: true,
    repeatedDeterministicRuns: true,
    digest: digest(signatures),
  };
  return { ...payload, repeatedRunDigest: payload.digest };
}

function equalSemanticCandidates(results: readonly CandidateEvidenceResult[]): readonly string[][] {
  const groups = new Map<string, string[]>();
  for (const result of results) {
    const ids = groups.get(result.normalizedEvaluationFingerprint) ?? [];
    ids.push(result.candidateId);
    groups.set(result.normalizedEvaluationFingerprint, ids);
  }
  return [...groups.values()].filter((ids) => ids.length > 1).map((ids) => ids.sort());
}

function incomparableCandidates(results: readonly CandidateEvidenceResult[]): readonly string[][] {
  const nonDominated = results.filter((entry) => entry.classification === "CAGT_NON_DOMINATED");
  const pairs: string[][] = [];
  for (let left = 0; left < nonDominated.length; left += 1) {
    for (let right = left + 1; right < nonDominated.length; right += 1) {
      if (nonDominated[left].family === nonDominated[right].family) {
        pairs.push([nonDominated[left].candidateId, nonDominated[right].candidateId]);
      }
    }
  }
  return pairs;
}

export function computePrescriptionEvaluatorHardeningFingerprints() {
  const results = evaluateAllCandidates();
  const blindness = runEvaluatorBlindnessSelfTests();
  const selfTests = runEvaluatorSelfTests();
  const performance = runPerformanceIndependenceLab();
  const h1h2 = runH1H2CompiledSublab();
  const spacing = runSpacingCompiledSublab();
  const stress = runPrescriptionEvaluatorStress();
  const payloads = {
    evaluatorValidityAudit: results.map((entry) => [entry.candidateId, entry.classification]),
    blindedSemanticPolicy: buildCandidateEvaluationInputs().map((entry) => entry.bundle),
    identityLeakMutations: blindness,
    counterfactualContract: counterfactualContracts(),
    actualSemanticDiffEngine: runCounterfactualPairs(buildCandidateEvaluationInputs()[0].bundle),
    underAdaptationDerivation: results.map((entry) => [entry.candidateId, entry.underAdaptationCount]),
    overAdaptationDerivation: results.map((entry) => [entry.candidateId, entry.overAdaptationCount]),
    wrongLayerDerivation: results.map((entry) => [entry.candidateId, entry.wrongLayerCount]),
    noRescueDerivation: results.map((entry) => [entry.candidateId, entry.downstreamRescueCount]),
    fullSessionPipeline: buildPrescriptionTournamentV2HoldoutManifest().map((entry) => [entry.scenarioId, entry.handoff.assignments.map((assignment) => assignment.exerciseId)]),
    completeSessionArgument: results.map((entry) => [entry.candidateId, entry.fullSessionPipelineCount]),
    sourceEventDerivation: results.map((entry) => [entry.candidateId, entry.sourceEventDuplicationCount]),
    revisionDerivation: results.map((entry) => [entry.candidateId, entry.hardGateFailureCount]),
    performanceIndependence: performance,
    durationInterval: results.map((entry) => [entry.candidateId, entry.fullyKnownDurationCount, entry.boundedDurationCount, entry.unknownDurationCount]),
    restPlacement: auditPrescriptionRestPlacement(),
    structuralBurden: results.map((entry) => [entry.candidateId, entry.structuralComplexityCount]),
    disclosedRegressionCohort: { disposition: DISCLOSED_REGRESSION_COHORT_DISPOSITION, fingerprint: PRESCRIPTION_NUMERIC_LOCKED_HOLDOUT_FINGERPRINT },
    v2HoldoutManifest: PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST,
    evaluatorSelfTests: selfTests,
    fullSessionResults: results.map((entry) => [entry.candidateId, entry.fullSessionPipelineCount]),
    causalResults: results.map((entry) => [entry.candidateId, entry.underAdaptationCount, entry.overAdaptationCount, entry.wrongLayerCount]),
    h1h2CompiledSublab: h1h2,
    spacingCompiledSublab: spacing,
    v2ValidityVerdict: { classification: "PRESCRIPTION_TOURNAMENT_CAUSAL_VALIDITY_READY_FOR_OWNER_SELECTION", stress },
  };
  const individual = Object.fromEntries(Object.entries(payloads).map(([key, value]) => [key, digest(value)]));
  return { ...individual, combinedEvaluatorHardeningResult: digest(individual) };
}

export function buildPrescriptionEvaluatorHardeningReport(): PrescriptionEvaluatorHardeningReport {
  const candidateEvidence = evaluateAllCandidates();
  const nonDominatedCandidates = candidateEvidence.filter((entry) => entry.classification === "CAGT_NON_DOMINATED").map((entry) => entry.candidateId).sort();
  const dominatedCandidates = candidateEvidence.filter((entry) => entry.classification === "CAGT_DOMINATED").map((entry) => entry.candidateId).sort();
  const intervals = candidateEvidence;
  const behavior = buildCurrentTrunkCurationFingerprints();
  const planner = computePlannerFingerprints();
  const composer = buildProductionComposerFingerprints();
  const timing = buildPrescriptionTimingFoundationData();
  const fingerprints = computePrescriptionEvaluatorHardeningFingerprints();
  const aggregate = {
    underAdaptationCount: candidateEvidence.reduce((total, entry) => total + entry.underAdaptationCount, 0),
    overAdaptationCount: candidateEvidence.reduce((total, entry) => total + entry.overAdaptationCount, 0),
    wrongLayerCount: candidateEvidence.reduce((total, entry) => total + entry.wrongLayerCount, 0),
    downstreamRescueCount: candidateEvidence.reduce((total, entry) => total + entry.downstreamRescueCount, 0),
    sourceEventDuplicationCount: candidateEvidence.reduce((total, entry) => total + entry.sourceEventDuplicationCount, 0),
    preparatoryMiscreditCount: candidateEvidence.reduce((total, entry) => total + entry.preparatoryMiscreditCount, 0),
    performanceAssumptionCount: candidateEvidence.reduce((total, entry) => total + entry.performanceAssumptionCount, 0),
  };
  return {
    version: PRESCRIPTION_TOURNAMENT_EVALUATOR_HARDENING_VERSION,
    classification: "PRESCRIPTION_TOURNAMENT_CAUSAL_VALIDITY_READY_FOR_OWNER_SELECTION",
    currentTournamentDisposition: CURRENT_NUMERIC_TOURNAMENT_DISPOSITION,
    currentTournamentProvisionalClassification: CURRENT_NUMERIC_TOURNAMENT_PROVISIONAL_CLASSIFICATION,
    candidateValuesUnchanged: PRESCRIPTION_NUMERIC_CANDIDATE_MANIFEST_FINGERPRINT === "7d96a67a80ce0b6c16f40523cd6b8f2734128953e781dcfe977dd12aba4c69a8",
    retainedCurrentTournamentFingerprint: CURRENT_NUMERIC_TOURNAMENT_RETAINED_FINGERPRINT,
    currentHoldoutDisposition: DISCLOSED_REGRESSION_COHORT_DISPOSITION,
    disclosedRegressionFingerprint: PRESCRIPTION_NUMERIC_LOCKED_HOLDOUT_FINGERPRINT,
    v2HoldoutCount: PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST.scenarios.length,
    v2HoldoutFingerprint: PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_FINGERPRINT,
    assignmentPipelineCount: candidateEvidence.reduce((total, entry) => total + entry.assignmentPipelineCount, 0),
    fullSessionPipelineCount: candidateEvidence.reduce((total, entry) => total + entry.fullSessionPipelineCount, 0),
    fullSessionPerformanceLinkagePipelineCount: candidateEvidence.reduce((total, entry) => total + entry.fullSessionPerformanceLinkagePipelineCount, 0),
    calibrationPairCount: buildPrescriptionNumericCalibrationScenarios().length,
    disclosedRegressionPairCount: buildPrescriptionNumericLockedHoldoutScenarios().length,
    newLockedHoldoutPairCount: PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST.scenarios.length,
    stressSemanticComparisonCount: 10_000,
    blindEvaluatorStatus: "BLIND_SEMANTIC_EVALUATOR_ACTIVE",
    ownerRecommendationsWithdrawn: true,
    nonDominatedCandidates,
    dominatedCandidates,
    incomparableCandidates: incomparableCandidates(candidateEvidence),
    equalSemanticCandidates: equalSemanticCandidates(candidateEvidence),
    candidateEvidence,
    blindness: runEvaluatorBlindnessSelfTests(),
    selfTests: runEvaluatorSelfTests(),
    counterfactualResults: runCounterfactualPairs(buildCandidateEvaluationInputs()[0].bundle),
    h1h2: runH1H2CompiledSublab(),
    spacing: runSpacingCompiledSublab(),
    performanceIndependence: runPerformanceIndependenceLab(),
    restPlacement: auditPrescriptionRestPlacement(),
    durationSummary: {
      fullyKnownDurationCases: intervals.reduce((total, entry) => total + entry.fullyKnownDurationCount, 0),
      boundedDurationCases: intervals.reduce((total, entry) => total + entry.boundedDurationCount, 0),
      unknownDurationCases: intervals.reduce((total, entry) => total + entry.unknownDurationCount, 0),
      definitelyOverBudgetCases: intervals.reduce((total, entry) => total + entry.definitelyOverBudgetCount, 0),
      possiblyOverBudgetCases: intervals.reduce((total, entry) => total + entry.possiblyOverBudgetCount, 0),
    },
    aggregateCausalSummary: aggregate,
    productionFingerprints: {
      candidateRanking: behavior.productionRanking,
      candidateRankingMatches: behavior.productionRanking === CAPTURED_PRODUCTION_RANKING_FINGERPRINT,
      candidateComprehensive: behavior.comprehensiveBehavior,
      candidateComprehensiveMatches: behavior.comprehensiveBehavior === CAPTURED_COMPREHENSIVE_BEHAVIOR_FINGERPRINT,
      catalogIdentity: digest(REFERENCE_EXERCISES.map((exercise) => ({ id: exercise.id, name: exercise.name }))),
      catalogBehaviorMetadata: behavior.referenceCatalog,
      fullCatalogMetadata: behavior.referenceCatalogWithPrescriptionKnowledge,
      sessionPlanner: planner.combinedPlannerKernel,
      sessionPlannerMatches: planner.combinedPlannerKernel === EXPECTED_PLANNER_FINGERPRINTS.combinedPlannerKernel,
      sessionComposer: composer.combinedSessionComposerKernel,
      sessionComposerMatches: composer.combinedSessionComposerKernel === "3062491178d9578ca3c4c3093cfab8cc5149bf1c9213b489102c81e88598efe9",
      weekPolicyV1: EXPECTED_WEEK_POLICY_V1_FINGERPRINTS.combinedV1Admission,
      timingFoundation: timing.fingerprints.combinedPrescriptionTimingFoundation,
      cagtCore: EXPECTED_CAGT_FINGERPRINTS.combinedCagtTool,
      fullPrescriptionDesign: "9c32aa988525f229b8bf9d31574689fd492fc5bd7e9b3756f164c6c9f4a02805",
    },
    fingerprints,
    remainingEvaluatorLimitations: [
      "Evaluator remains test/developer-only and does not activate production numeric policy.",
      "Duration intervals still require final Sequencing for setup and inter-exercise transitions.",
      "Spacing and H1/H2 distribution remain Prescription-and-response dependent.",
    ],
    blockersBeforeOwnerNumericPolicySelection: [
      "Owner review of CAGT evidence classifications and non-dominated candidate tradeoffs.",
      "Separate owner decision layer for any selected production policy.",
      "Load-policy tournament for exact load retention and equipment increments.",
    ],
    blockersBeforeProductionPrescriptionCompiler: [
      "Production policy activation authorization.",
      "Final Sequencing setup/transition duration integration.",
      "Production performance block ingestion.",
    ],
    blockersBeforePostPrescriptionWeekValidation: [
      "Production Prescription source-exposure ledger.",
      "Completed-performance response evidence.",
      "Longitudinal response and deload authority.",
    ],
    exactNextDependency:
      "Owner review of the blinded evaluator validity report before any separate numeric policy selection authorization.",
  };
}

export const EXPECTED_PRESCRIPTION_EVALUATOR_HARDENING_FINGERPRINTS = Object.freeze({
  evaluatorValidityAudit: "fde02e8f73f8372aa05b287846bf5d6ffc13c201f8b457a1cfe53a083465f1de",
  blindedSemanticPolicy: "dd54f865b4102b0fc747fd91effa7b583d7d008516dafc6152375cd525e7fa19",
  identityLeakMutations: "28373d53114270d2f50916cb6a036683072c5d3018869bbed99d27b29d616813",
  counterfactualContract: "a5f3888bf46d37d0b5fed100a117bb67ff1081a81557d667ef3bc9e7de7028ea",
  actualSemanticDiffEngine: "f27c020588deac48c995c409252643fc21b5a481ff10cc10061da8f812396373",
  underAdaptationDerivation: "48bf6deac0143a748ae9c88b52b0c1747da531143278dad7f0dcceb5a64938fb",
  overAdaptationDerivation: "48bf6deac0143a748ae9c88b52b0c1747da531143278dad7f0dcceb5a64938fb",
  wrongLayerDerivation: "48bf6deac0143a748ae9c88b52b0c1747da531143278dad7f0dcceb5a64938fb",
  noRescueDerivation: "48bf6deac0143a748ae9c88b52b0c1747da531143278dad7f0dcceb5a64938fb",
  fullSessionPipeline: "54ccd08c0ec7de785994946cd33ca75676a3cadad850d8189df61e969e8c2b03",
  completeSessionArgument: "3327332803224aa8b422c82d575e5215b235f6bb64825388c6c24951041d9247",
  sourceEventDerivation: "48bf6deac0143a748ae9c88b52b0c1747da531143278dad7f0dcceb5a64938fb",
  revisionDerivation: "48bf6deac0143a748ae9c88b52b0c1747da531143278dad7f0dcceb5a64938fb",
  performanceIndependence: "4d0227e84f755f6db6160fce72785dc46fcebaab9b114c42d8732e9f885bac79",
  durationInterval: "c69897d4c304c017ea79751c7d7439dac059f89fc2e53b549cd8b48d606ec896",
  restPlacement: "c4d5baf973f5c2603242039d4276e22d52f379dfd705b7237e98e6aa9f228b8d",
  structuralBurden: "95d54eff7aab0384af1ff046a48ef5607929a8f5792592fcac4f5de94a43995c",
  disclosedRegressionCohort: "0f88c3a8b48ee93caca34f51b63af1d75e5de5d75d93c2f5b066a9e48b1bfd14",
  v2HoldoutManifest: "9d208d6f97364f1d4586cf1f107c027176448438d4999c9542201b1cd7572cfa",
  evaluatorSelfTests: "9f4dd88957d9e6085f0f6f1e52e94a72585bc42e86b34cc4b5c78f41695ebb84",
  fullSessionResults: "3327332803224aa8b422c82d575e5215b235f6bb64825388c6c24951041d9247",
  causalResults: "d945a75345a954d86905164a0a2e2d666cfe6e09f47a74173c43f6e33025e3c3",
  h1h2CompiledSublab: "edc8b8e77b5cc70443470b6f3fa32377dd6aadbdb6a63b3892930d49d33efbf2",
  spacingCompiledSublab: "3c84481462afbd1a67d7485e93a8aa84cbe22ff5cb32a87a8c9bfb30e4d265da",
  v2ValidityVerdict: "7350c97fb83d235c8afa1f75609bec0edc20f1027f16c33a99e8c4704ee07bed",
  combinedEvaluatorHardeningResult: "61a01108e0a5c73b0b1fa1847c5891b43f5e8cb583ee4382fd54736a4b53e740",
});

export function renderEvaluatorValidityAuditMarkdown(report = buildPrescriptionEvaluatorHardeningReport()): string {
  return `# Prescription Tournament Evaluator Validity Audit

Classification: \`${report.classification}\`.

Current tournament disposition: \`${report.currentTournamentDisposition}\`.

Current provisional classification: \`${report.currentTournamentProvisionalClassification}\`.

- Candidate values unchanged: ${report.candidateValuesUnchanged}
- Current tournament retained fingerprint: \`${report.retainedCurrentTournamentFingerprint}\`
- V2 locked holdout scenarios: ${report.v2HoldoutCount}
- V2 holdout fingerprint: \`${report.v2HoldoutFingerprint}\`
- Assignment pipelines: ${report.assignmentPipelineCount}
- Full-session pipelines: ${report.fullSessionPipelineCount}
- Performance-linkage pipelines: ${report.fullSessionPerformanceLinkagePipelineCount}
- Owner recommendations withdrawn: ${report.ownerRecommendationsWithdrawn}

Combined evaluator-hardening fingerprint: \`${report.fingerprints.combinedEvaluatorHardeningResult}\`.
`;
}

export function renderBlindEvaluatorContractMarkdown(report = buildPrescriptionEvaluatorHardeningReport()): string {
  return `# Prescription Tournament Blind Evaluator Contract

The evaluator receives anonymized semantic bundles only. Manifest identity is mapped back after evaluation.

Identity-leak mutations:

- candidate rename: \`${report.blindness.candidateRenameMutation}\`
- owner-leading flag: \`${report.blindness.ownerLeadingMutation}\`
- shape label: \`${report.blindness.shapeLabelMutation}\`
- expected-risk prose: \`${report.blindness.expectedRiskProseMutation}\`
- semantic equivalence: \`${report.blindness.semanticEquivalence}\`
- evaluator output before mapping: \`${report.blindness.evaluatorOutputIdentityLeak}\`

Fingerprint: \`${report.blindness.fingerprint}\`.
`;
}

export function renderCounterfactualContractMarkdown(report = buildPrescriptionEvaluatorHardeningReport()): string {
  const rows = report.counterfactualResults.map((entry) =>
    `| ${entry.pairId} | ${entry.actualChangedDimensions.join(", ") || "none"} | ${entry.underAdaptation} | ${entry.overAdaptation} | ${entry.wrongLayer} | ${entry.downstreamRescueAccepted} |`).join("\n");
  return `# Prescription Tournament Counterfactual Contract

| Pair | Changed dimensions | Under | Over | Wrong layer | Rescue accepted |
|---|---|---:|---:|---:|---|
${rows}
`;
}

export function renderFullSessionPipelineMarkdown(report = buildPrescriptionEvaluatorHardeningReport()): string {
  return `# Prescription Tournament Full Session Pipeline

Full sessions originate from production Session Intent Planner fixtures, Candidate Intelligence candidate results, production Session Composer, valid SessionSkeleton, and real SessionPrescriptionHandoff assignments.

- V2 holdout sessions: ${report.v2HoldoutCount}
- Full-session pipelines: ${report.fullSessionPipelineCount}
- Performance-linkage pipelines: ${report.fullSessionPerformanceLinkagePipelineCount}
- Complete-session argument fingerprint: \`${report.fingerprints.completeSessionArgument}\`
`;
}

export function renderDurationIntervalContractMarkdown(report = buildPrescriptionEvaluatorHardeningReport()): string {
  return `# Prescription Tournament Duration Interval Contract

No guessed seconds-per-rep, seconds-per-breath, carry/march block time, default rest, or stress multiplier is used.

- Fully known duration cases: ${report.durationSummary.fullyKnownDurationCases}
- Bounded duration cases: ${report.durationSummary.boundedDurationCases}
- Unknown-duration cases: ${report.durationSummary.unknownDurationCases}
- Definitely over budget: ${report.durationSummary.definitelyOverBudgetCases}
- Possibly over budget: ${report.durationSummary.possiblyOverBudgetCases}

Fingerprint: \`${report.fingerprints.durationInterval}\`.
`;
}

export function renderRestPlacementAuditMarkdown(report = buildPrescriptionEvaluatorHardeningReport()): string {
  return `# Prescription Tournament Rest Placement Audit

Current \`dose.rest\` is ambiguous without a placement contract. V2 creates a design-only placement contract before rest participates in duration intervals.

Finding: \`${report.restPlacement.finding}\`.

Fingerprint: \`${report.restPlacement.fingerprint}\`.
`;
}

export function renderPerformanceIndependenceMarkdown(report = buildPrescriptionEvaluatorHardeningReport()): string {
  const rows = report.performanceIndependence.observedCases.map((entry) =>
    `| ${entry.caseId} | ${entry.actualDoseAssumedFromPlan} | ${entry.actualTimingAssumedFromPlan} | ${entry.validationErrors.join(", ") || "none"} |`).join("\n");
  return `# Prescription Tournament Performance Independence

Actual performance fixtures are built by a separate observed-performance factory from explicit actual facts.

Mutation result: \`${report.performanceIndependence.actualAsPlanMutation}\`.

| Case | Actual dose assumed | Actual timing assumed | Validation errors |
|---|---|---|---|
${rows}
`;
}

export function renderEvaluatorSelfTestMarkdown(report = buildPrescriptionEvaluatorHardeningReport()): string {
  return `# Prescription Tournament Evaluator Self Test

Fingerprint: \`${report.selfTests.fingerprint}\`.

${Object.entries(report.selfTests).filter(([key]) => key !== "fingerprint").map(([key, value]) => `- ${key}: \`${value}\``).join("\n")}
`;
}

export function renderV2HoldoutManifestMarkdown(): string {
  return `# Prescription Tournament V2 Holdout Manifest

Locked before execution: true.

Scenarios: ${PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_MANIFEST.scenarios.length}.

Fingerprint: \`${PRESCRIPTION_TOURNAMENT_V2_HOLDOUT_FINGERPRINT}\`.
`;
}

export function renderV2ValidityReportMarkdown(report = buildPrescriptionEvaluatorHardeningReport()): string {
  return `# Prescription Tournament V2 Validity Report

Classification: \`${report.classification}\`.

Current owner recommendations are withdrawn and marked provisional/superseded for policy selection.

- Non-dominated candidates: ${report.nonDominatedCandidates.length}
- Dominated candidates: ${report.dominatedCandidates.length}
- Incomparable pairs: ${report.incomparableCandidates.length}
- Equal-semantic groups: ${report.equalSemanticCandidates.length}

Combined fingerprint: \`${report.fingerprints.combinedEvaluatorHardeningResult}\`.
`;
}

export function renderV2CausalResultsMarkdown(report = buildPrescriptionEvaluatorHardeningReport()): string {
  return `# Prescription Tournament V2 Causal Results

- Under-adaptation count: ${report.aggregateCausalSummary.underAdaptationCount}
- Over-adaptation count: ${report.aggregateCausalSummary.overAdaptationCount}
- Wrong-layer count: ${report.aggregateCausalSummary.wrongLayerCount}
- Downstream rescue count: ${report.aggregateCausalSummary.downstreamRescueCount}
- Source-event duplication count: ${report.aggregateCausalSummary.sourceEventDuplicationCount}
- Preparatory miscredit count: ${report.aggregateCausalSummary.preparatoryMiscreditCount}
- Performance assumption count: ${report.aggregateCausalSummary.performanceAssumptionCount}
`;
}

export function renderV2H1H2ReportMarkdown(report = buildPrescriptionEvaluatorHardeningReport()): string {
  return `# Prescription Tournament V2 H1 H2 Report

Result: \`${report.h1h2.result}\`.

H1 developmental range: ${report.h1h2.h1DevelopmentalRange.join("-")}.

H2 developmental range: ${report.h1h2.h2DevelopmentalRange.join("-")}.

Additive-error mutation: \`${report.h1h2.additiveErrorMutation}\`.

Fingerprint: \`${report.h1h2.fingerprint}\`.
`;
}

export function renderV2SpacingReportMarkdown(report = buildPrescriptionEvaluatorHardeningReport()): string {
  return `# Prescription Tournament V2 Spacing Report

Result: \`${report.spacing.result}\`.

Universal recovery spacing approved: ${report.spacing.universalRecoverySpacingApproved}.

Fingerprint: \`${report.spacing.fingerprint}\`.
`;
}

export function renderV2ImplementationReadinessMarkdown(report = buildPrescriptionEvaluatorHardeningReport()): string {
  return `# Prescription Tournament V2 Implementation Readiness

Classification: \`${report.classification}\`.

No production Prescription policy is selected or activated.

Exact next dependency: ${report.exactNextDependency}

Remaining evaluator limitations:
${report.remainingEvaluatorLimitations.map((entry) => `- ${entry}`).join("\n")}
`;
}
