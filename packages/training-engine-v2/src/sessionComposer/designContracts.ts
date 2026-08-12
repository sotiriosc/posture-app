/**
 * Design-only Session Composer contracts. These types are intentionally not
 * exported from the package API and authorize no production composition.
 */
import type { CandidateNeed, ContinuityContext, FatigueSignal } from "../candidate/request";
import type { CandidatePainExecutionReadiness } from "../candidate/pain/types";
import type { ExerciseFamily } from "../domain/exercise";
import type { PhaseId } from "../domain/phase";
import type {
  BodyRegion,
  JointStressTag,
  MovementRole,
  MuscleGroup,
  TrainingGoal,
} from "../domain/primitives";
import type { SessionSection, TrainingRole } from "../domain/session";
import type { TrainingReadinessTrace } from "../domain/trainingSafety";

export const SESSION_NEED_PRIORITIES = ["required", "preferred", "optional"] as const;
export type SessionNeedPriority = (typeof SESSION_NEED_PRIORITIES)[number];

export const SESSION_NEED_SOURCE_KINDS = [
  "weekly_intent",
  "session_primary_purpose",
  "direct_muscle_priority",
  "movement_or_action_priority",
  "assessment_priority",
  "explicit_preparation_dependency",
  "pain_response_requirement",
  "continuity_requirement",
  "phase_intent",
  "user_preference",
  "recovery_requirement",
] as const;
export type SessionNeedSourceKind = (typeof SESSION_NEED_SOURCE_KINDS)[number];

export interface SessionNeedSourceEvidence {
  readonly sourceKind: SessionNeedSourceKind;
  readonly sourceId: string;
  readonly evidenceRefs: readonly string[];
}

export interface SessionNeedDependency {
  readonly dependencyId: string;
  readonly targetNeedIds: readonly string[];
  readonly targetExerciseIds: readonly string[];
  readonly movementRoles: readonly MovementRole[];
  readonly actionFunctions: readonly string[];
  readonly bodyRegions: readonly BodyRegion[];
  readonly assessmentSignalIds: readonly string[];
  readonly requiredRangeIds: readonly string[];
  readonly painResponseRequirementIds: readonly string[];
  readonly required: boolean;
}

export interface SessionNeed {
  readonly id: string;
  readonly sourceEvidence: readonly SessionNeedSourceEvidence[];
  readonly priority: SessionNeedPriority;
  readonly intendedSection: SessionSection;
  readonly candidateNeed: CandidateNeed;
  readonly dependencies: readonly SessionNeedDependency[];
  readonly prescriptionResolutionExpected: boolean;
  readonly reasonCode: string;
  /** Non-executable explanation only. */
  readonly explanation: string;
}

export type SessionKind =
  | "ordinary_training"
  | "strength"
  | "hypertrophy"
  | "general_fitness"
  | "posture_and_movement_quality"
  | "pain_aware_return";

export interface SessionIntentSourceTrace {
  readonly plannerId: string;
  readonly sourceRefs: readonly string[];
  readonly unresolvedWeeklyContextIds: readonly string[];
}

export interface NeedsFirstSessionIntent {
  readonly id: string;
  readonly athleteId: string;
  readonly kind: SessionKind;
  readonly phaseId: PhaseId;
  readonly primaryGoal: TrainingGoal;
  readonly needs: readonly SessionNeed[];
  readonly availableMinutes: number;
  readonly assessmentContextIds: readonly string[];
  readonly painResponseContextIds: readonly string[];
  readonly fatigueSignals: readonly FatigueSignal[];
  readonly continuity: ContinuityContext;
  readonly sourceTrace: SessionIntentSourceTrace;
}

export type CandidateCompositionAvailability =
  | "executable"
  | "candidate_review_required"
  | "prescription_required"
  | "session_role_substitution_required"
  | "urgent_external_review";

export type SessionContinuityClassification =
  | "anchor"
  | "stable_supporting"
  | "rotation_eligible"
  | "temporary_substitution"
  | "replacement_consideration"
  | "none";

export interface SessionCandidateEvidence {
  readonly exerciseId: string;
  readonly needId: string;
  readonly legal: boolean;
  readonly candidateRank: number;
  readonly candidateTotal: number;
  readonly painExecutionReadiness: CandidatePainExecutionReadiness;
  readonly compositionAvailability: CandidateCompositionAvailability;
  readonly rejectionReasonCodes: readonly string[];
  readonly equipmentGapIds: readonly string[];
  readonly unresolvedRequirementIds: readonly string[];
}

export interface SessionExerciseCompositionFacts {
  readonly exerciseId: string;
  readonly legalSections: readonly SessionSection[];
  readonly legalTrainingRoles: readonly TrainingRole[];
  readonly movementRoles: readonly MovementRole[];
  readonly actionFunctions: readonly string[];
  readonly primaryMuscles: readonly MuscleGroup[];
  readonly family: ExerciseFamily;
  readonly supportSignature: string;
  readonly resistancePathSignature: string;
  readonly setupSignature: string;
  readonly localFatigue: "low" | "moderate" | "high";
  readonly systemicFatigue: "low" | "moderate" | "high";
  readonly axialLoading: "low" | "moderate" | "high";
  readonly intrinsicStressTags: readonly JointStressTag[];
  readonly potentialStressTags: readonly JointStressTag[];
  readonly gripPotential: "none" | "low" | "moderate" | "high" | "unknown";
  readonly continuityClassification: SessionContinuityClassification;
  readonly continuityReasonCodes: readonly string[];
}

export interface DeterministicSessionSearchPolicy {
  readonly strategy: "exhaustive_controlled_lab";
  readonly evaluation: "strict_lexicographic";
  readonly optionalAdmission: "positive_unique_marginal_value_only";
  readonly tieBreak: "canonical_exercise_id";
  readonly randomization: false;
  readonly repairLoop: false;
  readonly productionBeamWidth: null;
}

export interface SessionCompositionInput {
  readonly intent: NeedsFirstSessionIntent;
  readonly candidateEvidenceByNeed: Readonly<Record<string, readonly SessionCandidateEvidence[]>>;
  readonly exerciseFacts: readonly SessionExerciseCompositionFacts[];
  readonly evaluationAsOf: string;
  readonly trainingReadiness: TrainingReadinessTrace;
  readonly continuityResponseTraceIds: readonly string[];
  readonly searchPolicy: DeterministicSessionSearchPolicy;
}

export const NEED_SATISFACTION_STATUSES = [
  "identity_covered",
  "identity_covered_requires_prescription",
  "covered_by_shared_exercise",
  "optional_not_selected",
  "preferred_not_selected_with_reason",
  "required_unsatisfied",
  "blocked_by_training_readiness",
  "infeasible_candidate_pool",
] as const;
export type NeedSatisfactionStatus = (typeof NEED_SATISFACTION_STATUSES)[number];

export interface NeedSatisfactionTrace {
  readonly needId: string;
  readonly status: NeedSatisfactionStatus;
  readonly exerciseId: string | null;
  readonly reasonCodes: readonly string[];
}

export interface SessionExerciseAssignment {
  readonly exerciseId: string;
  readonly section: SessionSection;
  readonly satisfiedNeedIds: readonly string[];
  readonly candidateEvidenceRefs: readonly string[];
  readonly continuityClassification: SessionContinuityClassification;
  readonly continuityReasonCodes: readonly string[];
  readonly unresolvedPrescriptionRequirementIds: readonly string[];
  readonly unresolvedReviewRequirementIds: readonly string[];
  readonly marginalValueReasonCodes: readonly string[];
  readonly futureSourceExposureCount: 1;
}

export interface SessionSectionPlan {
  readonly section: SessionSection;
  readonly assignmentExerciseIds: readonly string[];
  readonly emptyReasonCode: string | null;
}

export type SessionSkeletonStatus =
  | "valid_session_skeleton"
  | "session_intent_infeasible"
  | "session_blocked_by_training_readiness"
  | "session_requires_prescription_resolution";

export type StructuralTimeFeasibility =
  | "structurally_condensed"
  | "prescription_duration_required"
  | "estimated_with_explicit_prescription"
  | "over_budget"
  | "unknown";

export interface SessionEvaluationVector {
  readonly hardValidity: "valid" | "invalid";
  readonly requiredNeedCoverage: number;
  readonly readinessBurden: number;
  readonly productiveAnchorContinuity: number;
  readonly requiredPreparationCoherence: number;
  readonly dominantPurposeCoverage: number;
  readonly preferredNeedCoverage: number;
  readonly redundancyVerdicts: number;
  readonly fatigueStressConcentrationFlags: number;
  readonly optionalPositiveMarginalValue: number;
  readonly setupTransitionCount: number;
  readonly selectedIdentityCount: number;
  readonly localCandidateRankSumForTieOnly: number;
  readonly deterministicTieBreak: string;
}

export interface SessionMarginalValueTrace {
  readonly exerciseId: string;
  readonly newlyCoveredNeedIds: readonly string[];
  readonly improvedPrimaryTargetNeedIds: readonly string[];
  readonly fulfilledDependencyIds: readonly string[];
  readonly continuityBenefit: boolean;
  readonly redundantNeedIds: readonly string[];
  readonly fatigueStressFlags: readonly string[];
  readonly setupTransitionIntroduced: boolean;
  readonly verdict: "include_positive_marginal_value" | "no_positive_marginal_value";
}

export interface SessionRedundancyTrace {
  readonly leftExerciseId: string;
  readonly rightExerciseId: string;
  readonly overlappingDimensions: readonly string[];
  readonly distinctPurposeNeedIds: readonly string[];
  readonly verdict: "complementary" | "redundant" | "unknown";
}

export interface SessionPotentialConcentrationTrace {
  readonly dimension: string;
  readonly exerciseIds: readonly string[];
  readonly state: "potential_concentration" | "prescription_resolution_required" | "unknown";
}

export interface SessionSetupTransitionTrace {
  readonly setupSignatures: readonly string[];
  readonly transitionCount: number;
  readonly exactTimeKnown: false;
}

export interface SessionOrderingConstraint {
  readonly beforeExerciseId: string;
  readonly afterExerciseId: string;
  readonly dependencyIds: readonly string[];
}

export interface SessionCompositionTrace {
  readonly sessionReasonCodes: readonly string[];
  readonly selectedReasonCodesByExercise: Readonly<Record<string, readonly string[]>>;
  readonly excludedHighRankedCandidates: readonly string[];
  readonly emptySectionReasonCodes: Readonly<Record<SessionSection, string | null>>;
  readonly prunedBranchReasonCodes: readonly string[];
  readonly coherenceReasonCodes: readonly string[];
}

export interface SessionInfeasibilityTrace {
  readonly unsatisfiedRequiredNeedIds: readonly string[];
  readonly candidatePoolExerciseIdsByNeed: Readonly<Record<string, readonly string[]>>;
  readonly hardRejectionReasonCodes: readonly string[];
  readonly equipmentGapIds: readonly string[];
  readonly safetyBlockerSignalIds: readonly string[];
  readonly sessionRoleSubstitutionBlockerIds: readonly string[];
  readonly prescriptionResolutionBlockerIds: readonly string[];
  readonly contradictoryIntent: boolean;
}

export interface PlannedSessionSkeleton {
  readonly sessionIntentId: string;
  readonly status: SessionSkeletonStatus;
  readonly sections: readonly SessionSectionPlan[];
  readonly assignments: readonly SessionExerciseAssignment[];
  readonly needSatisfaction: readonly NeedSatisfactionTrace[];
  readonly preparationDependencyIds: readonly string[];
  readonly unresolvedPrescriptionRequirementIds: readonly string[];
  readonly unresolvedReviewRequirementIds: readonly string[];
  readonly marginalValue: readonly SessionMarginalValueTrace[];
  readonly redundancy: readonly SessionRedundancyTrace[];
  readonly potentialConcentration: readonly SessionPotentialConcentrationTrace[];
  readonly setupTransitions: SessionSetupTransitionTrace;
  readonly structuralTimeFeasibility: StructuralTimeFeasibility;
  readonly orderingConstraints: readonly SessionOrderingConstraint[];
  readonly evaluation: SessionEvaluationVector;
  readonly trace: SessionCompositionTrace;
  readonly infeasibility: SessionInfeasibilityTrace | null;
}
