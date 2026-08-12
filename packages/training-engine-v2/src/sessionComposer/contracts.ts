export const SESSION_NEED_KINDS = [
  "training_stimulus",
  "preparation",
  "capacity",
  "recovery",
] as const;

export type SessionNeedKind = (typeof SESSION_NEED_KINDS)[number];
export type SessionNeedPriority = "required" | "optional";

export interface SessionNeed {
  readonly id: string;
  readonly kind: SessionNeedKind;
  readonly priority: SessionNeedPriority;
  readonly rationale: string;
  readonly sequenceBeforeNeedIds: readonly string[];
  readonly preparesForNeedIds: readonly string[];
}

export interface SessionCompositionConstraints {
  readonly maxExercises: number;
  readonly maxDurationUnits: number;
}

export interface NeedsFirstSessionIntent {
  readonly id: string;
  readonly athleteId: string;
  readonly needs: readonly SessionNeed[];
  readonly constraints: SessionCompositionConstraints;
}

export type SessionContinuityValue =
  | "productive"
  | "neutral"
  | "change_justified";

export interface SessionExerciseOption {
  readonly exerciseId: string;
  readonly durationUnits: number;
  readonly fatigueCost: number;
  readonly setupKey: string;
  readonly redundancyKeys: readonly string[];
  readonly continuity: SessionContinuityValue;
}

export interface SessionNeedCandidate {
  readonly exerciseId: string;
  readonly candidateRank: number;
  readonly candidateValue: number;
  readonly compositionAvailability:
    | "available"
    | "prescription_resolution_required"
    | "deferred_for_review";
}

/**
 * A read-only handoff from Candidate Intelligence. Every listed candidate is
 * already legal for its exact need; composition may not repair or widen pools.
 */
export interface CandidateIntelligenceSnapshot {
  readonly trainingAvailability: "available" | "deferred_for_review";
  readonly requestIdsByNeed: Readonly<Record<string, string>>;
  readonly exercises: readonly SessionExerciseOption[];
  readonly legalCandidatesByNeed: Readonly<
    Record<string, readonly SessionNeedCandidate[]>
  >;
}

export interface SessionCompositionLabInput {
  readonly intent: NeedsFirstSessionIntent;
  readonly candidateIntelligence: CandidateIntelligenceSnapshot;
}

export interface SessionCompositionMetrics {
  readonly selectedExerciseCount: number;
  readonly optionalNeedsCovered: number;
  readonly productiveContinuityCount: number;
  readonly redundancyPairCount: number;
  readonly totalFatigueCost: number;
  readonly setupCount: number;
  readonly requiredCandidateRankSum: number;
  readonly requiredCandidateValueSum: number;
  readonly durationUnits: number;
}

export interface SessionCompositionSelection {
  readonly exerciseId: string;
  readonly coveredNeedIds: readonly string[];
  readonly indispensableForRequiredNeedIds: readonly string[];
}

export interface SessionCompositionTraceEntry {
  readonly code: string;
  readonly message: string;
  readonly exerciseIds: readonly string[];
  readonly needIds: readonly string[];
}

export interface ComposedSessionLabResult {
  readonly status: "composed";
  readonly intentId: string;
  readonly selections: readonly SessionCompositionSelection[];
  readonly coveredRequiredNeedIds: readonly string[];
  readonly coveredOptionalNeedIds: readonly string[];
  readonly prescriptionResolutionExerciseIds: readonly string[];
  readonly metrics: SessionCompositionMetrics;
  readonly trace: readonly SessionCompositionTraceEntry[];
}

export interface InfeasibleSessionLabResult {
  readonly status: "infeasible";
  readonly intentId: string;
  readonly uncoveredRequiredNeedIds: readonly string[];
  readonly trace: readonly SessionCompositionTraceEntry[];
}

export type SessionCompositionLabResult =
  | ComposedSessionLabResult
  | InfeasibleSessionLabResult;

export interface SessionSequenceEdge {
  readonly beforeExerciseId: string;
  readonly afterExerciseId: string;
  readonly reasonNeedIds: readonly string[];
}

export interface SequencedSessionLabResult {
  readonly status: "sequenced";
  readonly orderedExerciseIds: readonly string[];
  readonly setupTransitionCount: number;
  readonly precedenceEdges: readonly SessionSequenceEdge[];
}

export interface InfeasibleSessionSequenceLabResult {
  readonly status: "infeasible";
  readonly reason: "cyclic_precedence";
  readonly precedenceEdges: readonly SessionSequenceEdge[];
}

export type SessionSequenceLabResult =
  | SequencedSessionLabResult
  | InfeasibleSessionSequenceLabResult;

export interface SessionComposerBoundaryContract {
  readonly sessionIntentOwns: readonly string[];
  readonly candidateIntelligenceOwns: readonly string[];
  readonly sessionCompositionOwns: readonly string[];
  readonly sequencingOwns: readonly string[];
  readonly prescriptionOwns: readonly string[];
  readonly forbiddenCompositionBehaviors: readonly string[];
}

export const SESSION_COMPOSER_BOUNDARY_CONTRACT: SessionComposerBoundaryContract = {
  sessionIntentOwns: [
    "actual session needs and rationale",
    "need priority",
    "time and exercise-count constraints",
  ],
  candidateIntelligenceOwns: [
    "exact per-need candidate requests",
    "hard legality",
    "candidate rank, value, readiness, and trace",
  ],
  sessionCompositionOwns: [
    "smallest coherent covering exercise set",
    "cross-need overlap",
    "redundancy, fatigue, setup, continuity, and duration tradeoffs",
  ],
  sequencingOwns: [
    "dependency-preserving exercise order",
    "setup-transition minimization within legal orders",
  ],
  prescriptionOwns: [
    "sets, reps, load, range, support, tempo, effort, rest, and side",
    "realized stress exposure",
  ],
  forbiddenCompositionBehaviors: [
    "creating or widening a candidate pool",
    "selecting an illegal candidate",
    "requiring one exercise per display section",
    "inventing exercise coverage from prose or identity",
    "choosing dose, progression, replacement, or phase advancement",
  ],
};
