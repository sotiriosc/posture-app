import type { AssessmentState } from "../domain/assessment";
import type { AthleteProfile } from "../domain/athlete";
import type { TrainingHistory } from "../domain/history";
import type { PainAndInjuryState } from "../domain/painInjury";
import type { PhaseIntent } from "../domain/phase";
import type {
  CurrentSessionEquipment,
  SessionAllocationDirective,
  UnresolvedPlannerContextObservation,
} from "../domain/sessionPlanningDirective";
import type { SessionIntent, SessionNeed, SessionNeedDependency } from "../domain/session";
import type { TrainingResponseHistory } from "../domain/trainingResponse";
import type { TrainingReadinessTrace, TrainingSafetyState } from "../domain/trainingSafety";
import type { CandidateRankingResult } from "../candidate";
import type { SessionSkeleton } from "../sessionComposer";

export type SessionIntentPlanningStatus =
  | "planned"
  | "requires_week_or_explicit_session_allocation"
  | "under_specified"
  | "contradictory_directive"
  | "requires_week_reallocation"
  | "unsupported_context";

export interface SessionIntentPlannerInput {
  readonly directive?: SessionAllocationDirective;
  readonly athlete: AthleteProfile;
  readonly phaseIntent: PhaseIntent;
  readonly assessment: AssessmentState;
  readonly painAndInjury: PainAndInjuryState;
  readonly trainingSafety: TrainingSafetyState;
  readonly currentEquipment: CurrentSessionEquipment;
  readonly history: TrainingHistory;
  readonly trainingResponseHistory: TrainingResponseHistory;
  readonly satisfiedPrerequisiteIds: readonly string[];
  readonly evaluationAsOf: string;
}

export interface PlannerValidationFinding {
  readonly severity: "error" | "warning";
  readonly code: string;
  readonly sourceId: string | null;
  readonly owner: string;
  readonly message: string;
}

export interface PlannerIncludedNeedTrace {
  readonly needId: string;
  readonly objectiveIds: readonly string[];
  readonly ruleIds: readonly string[];
  readonly sourceEvidenceRefs: readonly string[];
}

export interface PlannerOmittedObjectiveTrace {
  readonly objectiveId: string;
  readonly reasonCode: string;
  readonly evidenceRefs: readonly string[];
}

export interface PlannerMergedNeedTrace {
  readonly needId: string;
  readonly mergedNeedIds: readonly string[];
  readonly objectiveIds: readonly string[];
  readonly reasonCode: "equivalent_need_truth_merged";
}

export interface PlannerAssessmentEnrichmentTrace {
  readonly clusterId: string;
  readonly assessmentSignalIds: readonly string[];
  readonly dependentNeedIds: readonly string[];
  readonly producedNeedId: string | null;
  readonly disposition:
    | "preferred_need_created"
    | "merged_with_existing_need"
    | "context_only_low_confidence"
    | "context_only_medium_confidence"
    | "irrelevant_to_allocated_purpose"
    | "direct_volume_requires_allocation"
    | "insufficient_structured_truth"
    | "blocked_by_training_safety"
    | "blocked_by_pain_or_contraindication"
    | "no_time_for_optional_preparation";
}

export interface NormalizedPreparationDependency {
  readonly dependency: SessionNeedDependency;
  readonly objectiveIds: readonly string[];
  readonly sourceEvidenceRefs: readonly string[];
}

export interface PlannerPreparationNeedTrace {
  readonly dependencyIds: readonly string[];
  readonly targetNeedIds: readonly string[];
  readonly producedNeedId: string | null;
  readonly disposition:
    | "need_created"
    | "merged_shared_dependency"
    | "blocked_by_training_safety"
    | "blocked_by_pain_or_contraindication"
    | "required_equipment_unavailable"
    | "familiar_movement_rehearsal_not_required"
    | "no_time_for_optional_preparation";
  readonly evidenceRefs: readonly string[];
}

export interface PlannerContinuityTrace {
  readonly exerciseId: string;
  readonly activeNeedIds: readonly string[];
  readonly sourceEvidenceRefs: readonly string[];
  readonly disposition: "included" | "inactive_history_omitted";
}

export interface PlannerContextOwnershipFinding {
  readonly factId: string;
  readonly canonicalOwner: string;
  readonly receiver: string;
  readonly consequence: string;
  readonly duplicateConsumption: false;
}

export interface PlannerUnresolvedContextFinding {
  readonly observation: UnresolvedPlannerContextObservation;
  readonly code: "UNOWNED_CONTEXT_REQUIRES_REVIEW";
}

export interface PlannerAvailabilityTrace {
  readonly availableMinutes: number;
  readonly structuralCapacity: SessionIntent["structuralCapacity"];
  readonly provenance: "explicit_today" | "week_allocation" | "profile_default" | "unknown";
  readonly sourceRef: string;
  readonly profileDefaultUsed: boolean;
}

export interface SessionIntentPlannerDecisionTrace {
  readonly plannerId: "session_intent_planner_v1";
  readonly directiveId: string | null;
  readonly evaluationAsOf: string;
  readonly rulesApplied: readonly string[];
  readonly factsConsumed: readonly string[];
  readonly inertProseFields: readonly string[];
  readonly phaseContextOnlyFields: readonly string[];
  readonly legacyFieldsIgnored: readonly string[];
}

export interface SessionIntentPlanningResult {
  readonly status: SessionIntentPlanningStatus;
  readonly trainingReadiness: TrainingReadinessTrace;
  readonly sessionIntent: SessionIntent | null;
  readonly includedNeedTraces: readonly PlannerIncludedNeedTrace[];
  readonly omittedObjectiveTraces: readonly PlannerOmittedObjectiveTrace[];
  readonly mergedNeedTraces: readonly PlannerMergedNeedTrace[];
  readonly assessmentEnrichmentTraces: readonly PlannerAssessmentEnrichmentTrace[];
  readonly preparationNeedTraces: readonly PlannerPreparationNeedTrace[];
  readonly continuityTraces: readonly PlannerContinuityTrace[];
  readonly contextOwnershipFindings: readonly PlannerContextOwnershipFinding[];
  readonly unresolvedContextFindings: readonly PlannerUnresolvedContextFinding[];
  readonly validationFindings: readonly PlannerValidationFinding[];
  readonly availabilityTrace: PlannerAvailabilityTrace | null;
  readonly decisionTrace: SessionIntentPlannerDecisionTrace;
}

export interface PlannedAndComposedSession {
  readonly planning: SessionIntentPlanningResult;
  readonly candidateResultsByNeed: Readonly<Record<string, CandidateRankingResult>> | null;
  readonly skeleton: SessionSkeleton | null;
}

export interface NormalizedPlannerNeed {
  readonly need: SessionNeed;
  readonly objectiveIds: readonly string[];
  readonly sourceNeedIds: readonly string[];
}
