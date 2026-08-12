import type { CandidateRankingResult } from "../candidate";
import type { JointStressTag } from "../domain/primitives";
import type {
  SessionIntent,
  SessionSection,
  SessionContinuityIdentityEvidence,
  TrainingRole,
} from "../domain/session";

export type SessionCompositionStatus =
  | "valid"
  | "infeasible"
  | "blocked_by_training_readiness"
  | "search_inconclusive";

export type SessionExecutionReadiness =
  | "executable_at_session_scope"
  | "candidate_review_required"
  | "prescription_resolution_required"
  | "candidate_review_and_prescription_required";

export type SessionSearchCompleteness =
  | "exact_optimal"
  | "exact_infeasible_proven"
  | "bounded_optimality_not_proven"
  | "search_inconclusive_no_complete_skeleton";

export interface SessionCandidateEvidenceReference {
  readonly needId: string;
  readonly requestId: string;
  readonly candidateRank: number;
  readonly candidateExerciseId: string;
  readonly painReadiness: string;
}

export type SessionContinuityClassification =
  | "anchor"
  | "stable_supporting"
  | "rotation_eligible"
  | "none";

export interface SessionExerciseAssignment {
  readonly exerciseId: string;
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly satisfiedNeedIds: readonly string[];
  readonly candidateEvidenceByNeed: readonly SessionCandidateEvidenceReference[];
  readonly continuityClassification: SessionContinuityClassification;
  readonly continuityEvidenceRefs: readonly string[];
  readonly unresolvedCandidateReviewIds: readonly string[];
  readonly executionBlockingPrescriptionRequirementIds: readonly string[];
  readonly routinePrescriptionHandoffId: string;
  readonly bestExecutableFallbackExerciseId: string | null;
  readonly marginalValueReasonCodes: readonly string[];
  readonly futureSourceExposureCount: 1;
}

export interface SessionSectionSkeleton {
  readonly section: SessionSection;
  readonly assignmentExerciseIds: readonly string[];
  readonly emptyReasonCode: string | null;
}

export interface SessionOrderingConstraint {
  readonly beforeExerciseId: string;
  readonly afterExerciseId: string;
  readonly dependencyIds: readonly string[];
}

export interface SessionNeedSatisfaction {
  readonly needId: string;
  readonly covered: boolean;
  readonly exerciseId: string | null;
  readonly coverageKind: "standalone" | "shared" | "omitted";
  readonly reasonCode: string;
}

export interface SessionRedundancyTrace {
  readonly leftExerciseId: string;
  readonly rightExerciseId: string;
  readonly overlappingDimensions: readonly string[];
  readonly verdict: "complementary" | "redundant";
}

export interface SessionConcentrationTrace {
  readonly dimension: string;
  readonly exerciseIds: readonly string[];
}

export interface SessionEvaluationVector {
  readonly candidateReviewBurden: number;
  readonly unjustifiedProductiveAnchorDisplacementCount: number;
  readonly dominantMainPurposeCovered: boolean;
  readonly nonAnchorPrescriptionResolutionBurden: number;
  readonly preferredCoverageInPlannerOrder: readonly boolean[];
  readonly redundancyConflictBurden: number;
  readonly fatigueStressConcentrationBurden: number;
  readonly optionalCoverageInPlannerOrder: readonly boolean[];
  readonly selectedIdentityCount: number;
  readonly setupTransitionCount: number;
  readonly localCandidateRankVector: readonly number[];
  readonly canonicalIdentityTieBreak: string;
}

export interface SessionSearchTrace {
  readonly mode: "exhaustive" | "bounded";
  readonly completeness: SessionSearchCompleteness;
  readonly statesExpanded: number;
  readonly statesPruned: number;
  readonly pruningReasons: Readonly<Record<string, number>>;
  readonly frontierPeak: number;
  readonly limitReached: boolean;
  readonly completeValidSkeletonFound: boolean;
  readonly optimalityProven: boolean;
  readonly expandedStateBudget: number;
  readonly retainedFrontierPerLayer: number;
}

export interface SessionInfeasibilityTrace {
  readonly unsatisfiedRequiredNeedIds: readonly string[];
  readonly unsatisfiedRequiredDependencyIds: readonly string[];
  readonly inputErrorCodes: readonly string[];
  readonly candidatePoolExerciseIdsByNeed: Readonly<Record<string, readonly string[]>>;
  readonly hardRejectionReasonCodes: readonly string[];
  readonly equipmentGapIds: readonly string[];
  readonly safetyBlockerSignalIds: readonly string[];
  readonly contradictoryIntent: boolean;
}

export interface SessionCompositionTrace {
  readonly selectedReasonCodesByExercise: Readonly<Record<string, readonly string[]>>;
  readonly omittedNeedReasonCodes: Readonly<Record<string, string>>;
  readonly excludedHighRankedCandidateIds: readonly string[];
  readonly emptySectionReasonCodes: Readonly<Record<SessionSection, string | null>>;
}

export interface SessionSkeleton {
  readonly sessionIntentId: string;
  readonly compositionStatus: SessionCompositionStatus;
  readonly executionReadiness: SessionExecutionReadiness;
  readonly sections: readonly SessionSectionSkeleton[];
  readonly assignments: readonly SessionExerciseAssignment[];
  readonly needSatisfaction: readonly SessionNeedSatisfaction[];
  readonly orderingConstraints: readonly SessionOrderingConstraint[];
  readonly evaluation: SessionEvaluationVector | null;
  readonly redundancy: readonly SessionRedundancyTrace[];
  readonly concentration: readonly SessionConcentrationTrace[];
  readonly search: SessionSearchTrace;
  readonly trace: SessionCompositionTrace;
  readonly infeasibility: SessionInfeasibilityTrace | null;
}

export interface SessionComposerSearchPolicy {
  readonly exactExpandedStateBudget: number;
  readonly boundedExpandedStateBudget: number;
  readonly retainedParetoFrontierPerLayer: number;
}

export interface SessionCompositionRequest {
  readonly intent: SessionIntent;
  readonly candidateResultsByNeed: Readonly<Record<string, CandidateRankingResult>>;
  readonly searchPolicy?: SessionComposerSearchPolicy;
}

export interface SessionPrescriptionAssignmentHandoff {
  readonly handoffId: string;
  readonly exerciseId: string;
  readonly phaseId: string;
  readonly section: SessionSection;
  readonly role: TrainingRole;
  readonly satisfiedNeedIds: readonly string[];
  readonly continuityEvidenceRefs: readonly string[];
  readonly requiredPrescriptionResolutionIds: readonly string[];
  readonly potentialStressTags: readonly JointStressTag[];
  readonly explicitRequirementRefs: readonly string[];
  readonly orderingConstraints: readonly SessionOrderingConstraint[];
  readonly sourceExposureEventExpected: true;
}

export interface SessionPrescriptionHandoff {
  readonly sessionIntentId: string;
  readonly assignments: readonly SessionPrescriptionAssignmentHandoff[];
}

export interface PrescribedDurationFact {
  readonly exerciseId: string;
  readonly prescribedExerciseSeconds?: number;
  readonly explicitRestSeconds?: number;
  readonly explicitSetupTransitionSeconds?: number;
}

export interface SessionDurationFeasibilityInput {
  readonly availableMinutes: number;
  readonly durationFacts: readonly PrescribedDurationFact[];
  readonly expectedExerciseIds: readonly string[];
}

export interface SessionDurationFeasibility {
  readonly status: "fits" | "over_budget" | "unknown_or_incomplete";
  readonly knownTotalSeconds: number;
  readonly availableSeconds: number;
  readonly missingExerciseIds: readonly string[];
}

export interface SessionSequencingInput {
  readonly assignments: readonly SessionExerciseAssignment[];
  readonly fixedSectionPrecedence: readonly SessionSection[];
  readonly orderingConstraints: readonly SessionOrderingConstraint[];
  readonly fatigueStressPotential: readonly SessionConcentrationTrace[];
  readonly unresolvedExecutionReadiness: SessionExecutionReadiness;
  readonly graphAcyclic: boolean;
}

export interface SessionCandidateResultConsistency {
  readonly valid: boolean;
  readonly errorCodes: readonly string[];
  readonly catalogFingerprint: string;
}

export interface CanonicalCompositionFact {
  readonly exerciseId: string;
  readonly legalSections: readonly SessionSection[];
  readonly legalRoles: readonly TrainingRole[];
  readonly movementRoles: readonly string[];
  readonly actionFunctions: readonly string[];
  readonly primaryMuscles: readonly string[];
  readonly bodyRegions: readonly string[];
  readonly family: string;
  readonly supportSignature: string;
  readonly resistancePathSignature: string;
  readonly setupSignature: string;
  readonly localFatigue: string;
  readonly systemicFatigue: string;
  readonly axialLoading: string;
  readonly intrinsicStressTags: readonly JointStressTag[];
  readonly potentialStressTags: readonly JointStressTag[];
  readonly continuityEvidence: SessionContinuityIdentityEvidence | null;
}
