import type { PhaseId } from "../domain/phase";
import type { TrainingGoal } from "../domain/primitives";

export const PHASE_CONTINUITY_CONTRACT_ID =
  "PHASE_CONTINUITY_GATE_15_CONTRACT" as const;
export const PHASE_CONTINUITY_CONTRACT_VERSION = "1.0.0" as const;
export const PHASE_CONTINUITY_GATE_15_STATUS =
  "PHASE_CONTINUITY_GATE_15_DESIGN_EVIDENCE_NOT_PRODUCT_RUNTIME" as const;

export const PHASE_CONTINUITY_CONTRACT_REFERENCE = Object.freeze({
  contractId: PHASE_CONTINUITY_CONTRACT_ID,
  version: PHASE_CONTINUITY_CONTRACT_VERSION,
});

export type PhaseContinuityContractReference =
  typeof PHASE_CONTINUITY_CONTRACT_REFERENCE;

export type PhaseDevelopmentalEmphasisId =
  | "foundational_control"
  | "recoverable_capacity"
  | "productive_consolidation";

export interface PhaseDevelopmentalEmphasis {
  readonly emphasisId: PhaseDevelopmentalEmphasisId;
  readonly phaseId: PhaseId;
  readonly contextualOutcomeCompatibility: readonly TrainingGoal[];
  readonly createsWeeklyObjective: false;
  readonly createsSessionNeed: false;
  readonly replacesAthleteOutcomeGoal: false;
  readonly description: string;
}

export const PHASE_DEVELOPMENTAL_EMPHASES: Readonly<
  Record<PhaseId, PhaseDevelopmentalEmphasis>
> = Object.freeze({
  phase_1: Object.freeze({
    emphasisId: "foundational_control",
    phaseId: "phase_1",
    contextualOutcomeCompatibility: Object.freeze<TrainingGoal[]>([
      "general_fitness",
      "hypertrophy",
      "pain_aware_return",
      "posture_and_movement_quality",
      "strength",
      "conditioning",
    ]),
    createsWeeklyObjective: false,
    createsSessionNeed: false,
    replacesAthleteOutcomeGoal: false,
    description: "Develop repeatable execution and control within already-owned work.",
  }),
  phase_2: Object.freeze({
    emphasisId: "recoverable_capacity",
    phaseId: "phase_2",
    contextualOutcomeCompatibility: Object.freeze<TrainingGoal[]>([
      "general_fitness",
      "hypertrophy",
      "pain_aware_return",
      "posture_and_movement_quality",
      "strength",
      "conditioning",
    ]),
    createsWeeklyObjective: false,
    createsSessionNeed: false,
    replacesAthleteOutcomeGoal: false,
    description: "Develop recoverable capacity within already-owned work.",
  }),
  phase_3: Object.freeze({
    emphasisId: "productive_consolidation",
    phaseId: "phase_3",
    contextualOutcomeCompatibility: Object.freeze<TrainingGoal[]>([
      "general_fitness",
      "hypertrophy",
      "pain_aware_return",
      "posture_and_movement_quality",
      "strength",
      "conditioning",
    ]),
    createsWeeklyObjective: false,
    createsSessionNeed: false,
    replacesAthleteOutcomeGoal: false,
    description: "Consolidate productive work while preserving viable progression runway.",
  }),
});

export type PhaseCycleStatus = "active" | "held" | "owner_review_required" | "completed";

export interface PhaseCycleIdentity {
  readonly phaseCycleId: string;
  readonly athleteId: string;
  readonly sourceProgramLineageId: string;
  readonly sourceHorizonLineageId: string;
  readonly cycleStatus: PhaseCycleStatus;
  readonly createdAt: string;
  readonly owner: "explicit_phase_cycle_owner" | "design_fixture_owner";
  readonly sourceRef: string;
  readonly provenance: readonly string[];
}

export interface ProductionPhaseStateIdentity {
  readonly phaseStateId: string;
  readonly phaseCycleId: string;
  readonly athleteId: string;
  readonly createdAt: string;
  readonly owner: "phase_state_owner" | "design_fixture_owner";
  readonly provenance: readonly string[];
}

export type PhaseStateRevisionStatus = "current" | "held" | "review" | "completed";

export interface PhaseStateRevision {
  readonly phaseStateIdentity: ProductionPhaseStateIdentity;
  readonly phaseStateRevisionId: string;
  readonly basedOnRevisionId: string | null;
  readonly currentPhaseId: PhaseId;
  readonly status: PhaseStateRevisionStatus;
  readonly reasonCode: string;
  readonly evidenceSnapshotRef: string;
  readonly createdAt: string;
  readonly finalForDecision: boolean;
  readonly weekInPhaseObservation: number | null;
  readonly automaticAdvancementAuthority: false;
  readonly provenance: readonly string[];
}

export const PHASE_TRANSITION_GRAPH = Object.freeze({
  legalStayEdges: Object.freeze([
    "phase_1->phase_1",
    "phase_2->phase_2",
    "phase_3->phase_3",
  ]),
  legalAdjacentAdvancementEdges: Object.freeze([
    "phase_1->phase_2",
    "phase_2->phase_3",
  ]),
  nonAdjacentAdvancementResult: "NON_ADJACENT_PHASE_TRANSITION_NOT_AUTHORIZED",
  backwardMovementResult: "PHASE_REGRESSION_REVIEW_REQUIRED",
  phase3CompletionResult: "PHASE_CYCLE_COMPLETION_OWNER_REVIEW_REQUIRED",
  automaticCycleReset: false,
});

export const PHASE_CRITERION_DOMAINS = [
  "execution_quality",
  "active_objective_realization",
  "tolerance",
  "training_safety",
  "recoverability",
  "progression_evidence",
  "continuity_runway",
  "adherence_or_completion",
  "unresolved_requirement_state",
  "coach_or_owner_review",
] as const;
export type PhaseCriterionDomain = typeof PHASE_CRITERION_DOMAINS[number];

export const PHASE_EVIDENCE_SOURCE_TYPES = [
  "production_performance_summary",
  "completed_session_summary",
  "TrainingResponseReceiver",
  "ProgressionReadinessTrace",
  "TrainingSafety",
  "coach_review",
  "clinician_restriction",
  "explicit_athlete_report",
  "Product_adherence_source",
  "planned_program_truth",
  "unknown",
] as const;
export type PhaseEvidenceSourceType = typeof PHASE_EVIDENCE_SOURCE_TYPES[number];

export type PhaseEvidenceQuality =
  | "validated_completed"
  | "reviewed_structured"
  | "structured_observation"
  | "planned_only"
  | "unknown";

export type PhaseCriterionReviewStatus = "owner_accepted" | "needs_review" | "unknown";

export interface PhaseAdvancementCriterionDefinition {
  readonly criterionId: string;
  readonly currentPhaseId: PhaseId;
  readonly targetPhaseId: PhaseId;
  readonly domain: PhaseCriterionDomain;
  readonly requirementPriority: "required" | "blocking" | "review_only";
  readonly acceptedEvidenceSourceTypes: readonly PhaseEvidenceSourceType[];
  readonly requiredEvidenceQuality: PhaseEvidenceQuality;
  readonly repeatedEvidenceRequirement: "required" | "not_required";
  readonly blockingEvidenceClasses: readonly PhaseCriterionEvidenceClassification[];
  readonly conflictingEvidenceBehavior: "hold_for_review" | "block";
  readonly reviewStatus: PhaseCriterionReviewStatus;
  readonly provenance: readonly string[];
  readonly description: string;
}

export const PHASE_CRITERION_EVIDENCE_CLASSIFICATIONS = [
  "supports_criterion",
  "contradicts_criterion",
  "insufficient_observation",
  "mixed_evidence",
  "not_applicable",
  "invalid_source",
  "unknown",
] as const;
export type PhaseCriterionEvidenceClassification =
  typeof PHASE_CRITERION_EVIDENCE_CLASSIFICATIONS[number];

export const PHASE_REPEATED_EVIDENCE_STATES = [
  "isolated_observation",
  "repeated_consistent_evidence",
  "repeated_mixed_evidence",
  "insufficient_history",
  "unknown",
] as const;
export type PhaseRepeatedEvidenceState = typeof PHASE_REPEATED_EVIDENCE_STATES[number];

export interface PhaseCriterionEvidenceRecord {
  readonly evidenceRecordId: string;
  readonly criterionId: string;
  readonly athleteId: string;
  readonly phaseCycleId: string;
  readonly currentPhaseId: PhaseId;
  readonly sourceOwner: PhaseEvidenceSourceType;
  readonly sourceRecordIds: readonly string[];
  readonly evidenceQuality: PhaseEvidenceQuality;
  readonly evidenceClassification: PhaseCriterionEvidenceClassification;
  readonly repeatedEvidenceState: PhaseRepeatedEvidenceState;
  readonly occurredOrObservedInterval: {
    readonly startsAt: string;
    readonly endsAt: string;
  };
  readonly appliesThrough: string;
  readonly supportsTransition: boolean;
  readonly contradictsTransition: boolean;
  readonly uncertaintyState: "none" | "unknown" | "conflicting";
  readonly provenance: readonly string[];
}

export type PhaseTransitionKind =
  | "stay"
  | "adjacent_advancement"
  | "regression_review"
  | "cycle_completion_review";

export interface PhaseTransitionChangedFact {
  readonly factId: string;
  readonly factOwner:
    | "phase_policy"
    | "explicit_goal_or_week_policy"
    | "equipment"
    | "training_safety"
    | "structured_response_review"
    | "longitudinal"
    | "presentation_only";
  readonly dimension: string;
  readonly material: boolean;
  readonly sourceRef: string;
}

export interface PhaseTransitionEntityMapping {
  readonly entityKind:
    | "weekly_objective"
    | "opportunity"
    | "reservation"
    | "session"
    | "session_need"
    | "assignment"
    | "source_event"
    | "prescription"
    | "sequence_step";
  readonly currentEntityId: string;
  readonly proposedEntityId: string;
  readonly sourceRef: string;
}

export interface PhaseTransitionProposal {
  readonly proposalId: string;
  readonly phaseCycleId: string;
  readonly currentPhaseStateRevisionId: string;
  readonly currentPhaseId: PhaseId;
  readonly proposedTargetPhaseId: PhaseId;
  readonly transitionKind: PhaseTransitionKind;
  readonly criterionDefinitionIds: readonly string[];
  readonly evidenceRecordIds: readonly string[];
  readonly blockingRecordIds: readonly string[];
  readonly proposedNextProgramSnapshotId: string;
  readonly changedFacts: readonly PhaseTransitionChangedFact[];
  readonly explicitEntityMappings: readonly PhaseTransitionEntityMapping[];
  readonly reasonCodes: readonly string[];
  readonly owner: "phase_continuity_proposal_owner" | "design_fixture_owner";
  readonly sourceRef: string;
  readonly evaluationTime: string;
  readonly provenance: readonly string[];
}

export const PHASE_CONTINUITY_POLICY_ID =
  "PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT" as const;
export const PHASE_CONTINUITY_POLICY_VERSION = "1.0.0" as const;
export const PHASE_CONTINUITY_POLICY_REFERENCE = Object.freeze({
  policyId: PHASE_CONTINUITY_POLICY_ID,
  version: PHASE_CONTINUITY_POLICY_VERSION,
});

export const PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT = Object.freeze({
  reference: PHASE_CONTINUITY_POLICY_REFERENCE,
  state: "OWNER_SELECTED_FOR_GATE_15_CAGT_ADMISSION_NOT_PRODUCTION" as const,
  philosophy: Object.freeze([
    "EVIDENCE_BEFORE_TRANSITION",
    "STAY_IS_ALWAYS_LEGAL_WHEN_SAFE",
    "ADJACENT_ADVANCEMENT_ONLY",
    "NO_CALENDAR_TRIGGER",
    "NO_PROGRAM_RESET",
    "KEEP_PRODUCTIVE_ANCHORS",
    "PRESCRIPTION_REVIEW_BEFORE_REPLACEMENT",
    "NO_AUTOMATIC_EXERCISE_PROGRESSION",
    "NO_AUTOMATIC_ROTATION",
    "UNKNOWN_MEANS_HOLD",
    "CONFLICT_MEANS_REVIEW",
  ]),
  automaticAdvancement: false,
  automaticRegression: false,
  automaticCycleReset: false,
  automaticProgression: false,
  automaticReplacement: false,
  automaticRotation: false,
  automaticDeload: false,
});

const required = (
  criterionId: string,
  currentPhaseId: PhaseId,
  targetPhaseId: PhaseId,
  domain: PhaseCriterionDomain,
  acceptedEvidenceSourceTypes: readonly PhaseEvidenceSourceType[],
  requiredEvidenceQuality: PhaseEvidenceQuality,
  repeatedEvidenceRequirement: "required" | "not_required",
  description: string,
): PhaseAdvancementCriterionDefinition => Object.freeze({
  criterionId,
  currentPhaseId,
  targetPhaseId,
  domain,
  requirementPriority: "required",
  acceptedEvidenceSourceTypes: Object.freeze(acceptedEvidenceSourceTypes),
  requiredEvidenceQuality,
  repeatedEvidenceRequirement,
  blockingEvidenceClasses: Object.freeze<PhaseCriterionEvidenceClassification[]>([
    "contradicts_criterion",
    "mixed_evidence",
    "invalid_source",
  ]),
  conflictingEvidenceBehavior: "hold_for_review",
  reviewStatus: "owner_accepted",
  provenance: Object.freeze([
    "owner-policy:PHASE_CONTINUITY_POLICY_V1_STABLE_DEVELOPMENT@1.0.0",
    "design-admission:PHASE_CONTINUITY_GATE_15",
  ]),
  description,
});

export const PHASE_1_TO_2_CRITERIA = Object.freeze([
  required("p1-p2-repeatable-execution", "phase_1", "phase_2", "execution_quality",
    ["production_performance_summary", "completed_session_summary"], "validated_completed", "required",
    "Required active foundational work has repeated completed execution-quality support."),
  required("p1-p2-tolerated-exposure", "phase_1", "phase_2", "tolerance",
    ["TrainingResponseReceiver"], "reviewed_structured", "required",
    "Relevant completed exposure has repeated tolerance support and no unresolved worsening response."),
  required("p1-p2-program-coherence", "phase_1", "phase_2", "active_objective_realization",
    ["planned_program_truth"], "planned_only", "not_required",
    "Current and proposed planned programs retain valid Gate 13 and Gate 14 truth."),
  required("p1-p2-no-unresolved-blocker", "phase_1", "phase_2", "unresolved_requirement_state",
    ["TrainingSafety", "TrainingResponseReceiver"], "reviewed_structured", "not_required",
    "No unresolved safety or required prescription-response blocker remains."),
  required("p1-p2-evidence-sufficiency", "phase_1", "phase_2", "adherence_or_completion",
    ["production_performance_summary", "completed_session_summary", "Product_adherence_source"],
    "validated_completed", "required", "Completed evidence is sufficiently sourced and repeated."),
]);

export const PHASE_2_TO_3_CRITERIA = Object.freeze([
  required("p2-p3-productive-progression", "phase_2", "phase_3", "progression_evidence",
    ["ProgressionReadinessTrace"], "reviewed_structured", "required",
    "Repeated evidence supports productive continuation or progression review without selecting progression."),
  required("p2-p3-recoverability", "phase_2", "phase_3", "recoverability",
    ["TrainingResponseReceiver", "completed_session_summary", "explicit_athlete_report"],
    "reviewed_structured", "required", "Explicit recovery and tolerance evidence supports phase review."),
  required("p2-p3-stable-execution", "phase_2", "phase_3", "execution_quality",
    ["production_performance_summary", "completed_session_summary"], "validated_completed", "required",
    "Required active Phase 2 work retains stable completed execution quality."),
  required("p2-p3-no-unresolved-limiter", "phase_2", "phase_3", "unresolved_requirement_state",
    ["TrainingSafety", "TrainingResponseReceiver", "Product_adherence_source"],
    "reviewed_structured", "not_required", "No unresolved safety, response, prescription, or adherence limiter remains."),
  required("p2-p3-program-continuity", "phase_2", "phase_3", "continuity_runway",
    ["planned_program_truth", "ProgressionReadinessTrace"], "reviewed_structured", "not_required",
    "The proposed Phase 3 program preserves productive active structure unless another owner justifies change."),
]);

export const PHASE_CONTINUITY_V1_CRITERIA = Object.freeze([
  ...PHASE_1_TO_2_CRITERIA,
  ...PHASE_2_TO_3_CRITERIA,
]);
