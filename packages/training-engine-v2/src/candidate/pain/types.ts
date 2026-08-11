import type {
  AcuteSeverePain,
  CurrentDiscomfort,
  HardContraindication,
  HistoricalSensitivity,
  ModeratePain,
} from "../../domain/painInjury";
import type { BodyRegion, JointStressTag, Side } from "../../domain/primitives";

export type ExerciseStressSource = "joint_stress" | "caution" | "contraindicated";

export interface ExerciseStressFact {
  readonly tag: JointStressTag;
  readonly sources: readonly ExerciseStressSource[];
}

export type CandidatePainSignalKind =
  | HistoricalSensitivity["kind"]
  | CurrentDiscomfort["kind"]
  | ModeratePain["kind"]
  | AcuteSeverePain["kind"]
  | HardContraindication["kind"];

export type PainRequestedAction =
  | NonNullable<HistoricalSensitivity["preferredModification"]>
  | CurrentDiscomfort["effect"]
  | ModeratePain["requiredResponse"]
  | "urgent_review";

export type PainRequestedActionSource =
  | "preferred_modification"
  | "current_discomfort_effect"
  | "moderate_pain_required_response"
  | "acute_review_recommendation"
  | "not_provided";

export interface PainStressMatchFact {
  readonly matchId: string;
  readonly signalId: string;
  readonly signalKind: CandidatePainSignalKind;
  readonly severity: number | null;
  readonly region: BodyRegion | null;
  readonly side: Side | null;
  readonly stressTag: JointStressTag;
  readonly exerciseSources: readonly ExerciseStressSource[];
  readonly requestedAction: PainRequestedAction | null;
  readonly requestedActionSource: PainRequestedActionSource;
}

export interface CandidatePainSignalTrace {
  readonly signalId: string;
  readonly signalKind: CandidatePainSignalKind;
  readonly severity: number | null;
  readonly region: BodyRegion | null;
  readonly side: Side | null;
  readonly inputStressTags: readonly JointStressTag[];
  readonly requestedAction: PainRequestedAction | null;
  readonly requestedActionSource: PainRequestedActionSource;
  readonly matchedStressFacts: readonly PainStressMatchFact[];
  readonly uniqueMatchCount: number;
  readonly invalidatedTrainingRoles: readonly string[];
  readonly hardExerciseIds: readonly string[];
  readonly urgentReviewRecommended: boolean | null;
  readonly hardContraindicationSource: HardContraindication["source"] | null;
  readonly hardContraindicationReason: string | null;
}

export interface CanonicalPainEvidence {
  readonly candidateExerciseId: string;
  readonly exerciseStressFacts: readonly ExerciseStressFact[];
  readonly signalTraces: readonly CandidatePainSignalTrace[];
  readonly signalMatches: readonly PainStressMatchFact[];
  readonly uniqueMatchCount: number;
}

export type PainReceiver =
  | "pain_suitability"
  | "joint_cost"
  | "moderate_warning"
  | "hard_contraindication"
  | "acute_severe_eligibility"
  | "assessment_demand_reduction";

export type PainReceiverExecutionStatus =
  | "applied"
  | "not_applicable"
  | "warning_emitted"
  | "hard_rejected"
  | "legal"
  | "available_for_contextual_evaluation";

export type PainReceiverExclusionReason =
  | "signal_kind_not_owned"
  | "contraindicated_only_not_joint_cost"
  | "caution_only_not_hard_authority"
  | "caution_or_contraindicated_only_not_acute_authority"
  | "monitor_does_not_request_demand_reduction"
  | "no_actionable_modification";

export interface PainReceiverExcludedMatchUnit {
  readonly match: PainStressMatchFact;
  readonly reason: PainReceiverExclusionReason;
}

export interface PainReceiverCriterionTrace {
  readonly kind: "stress_match" | "exercise_id" | "training_role";
  readonly signalId: string;
  readonly signalKind: CandidatePainSignalKind;
  readonly stressTag: JointStressTag | null;
  readonly matchedExerciseSources: readonly ExerciseStressSource[];
  readonly qualifyingExerciseSources: readonly ExerciseStressSource[];
  readonly exerciseId: string | null;
  readonly trainingRole: string | null;
  readonly authoritySource: HardContraindication["source"] | null;
  readonly reason: string;
}

export interface PainReceiverDecisionTrace {
  readonly receiver: PainReceiver;
  readonly countedMatchUnits: readonly PainStressMatchFact[];
  readonly countedMatchUnitCount: number;
  readonly excludedMatchUnits: readonly PainReceiverExcludedMatchUnit[];
  readonly affectedSignalIds: readonly string[];
  readonly criteria: readonly PainReceiverCriterionTrace[];
  readonly reason: string;
  readonly executionStatus: PainReceiverExecutionStatus;
}

export type PainResponseOwner =
  | "observation"
  | "candidate_review"
  | "prescription"
  | "session_intent_or_session_composer"
  | "future_candidate_prescription_or_session"
  | "external_urgent_review";

export type PainResponseExecutionStatus =
  | "observed_no_modification_applied"
  | "policy_unresolved_candidate_review_required"
  | "deferred_unexecutable_at_candidate_layer"
  | "unresolved_urgent_review_required"
  | "not_applicable_no_candidate_stress_match";

export interface PainResponseRequirementTrace {
  readonly signalId: string;
  readonly signalKind: CandidatePainSignalKind;
  readonly requestedAction: PainRequestedAction;
  readonly requestedActionSource: PainRequestedActionSource;
  readonly primaryFutureOwner: PainResponseOwner;
  readonly executionStatus: PainResponseExecutionStatus;
  readonly matchedStressFacts: readonly PainStressMatchFact[];
  readonly evidence: readonly string[];
}

export interface CandidatePainMatchTrace extends CanonicalPainEvidence {
  readonly receiverDecisions: readonly PainReceiverDecisionTrace[];
  readonly responseRequirements: readonly PainResponseRequirementTrace[];
}

export interface PainEligibilityEvidenceTrace {
  readonly receiver: "moderate_warning" | "hard_contraindication" | "acute_severe_eligibility";
  readonly signalId: string;
  readonly signalKind: CandidatePainSignalKind;
  readonly severity: number | null;
  readonly requestedAction: PainRequestedAction | null;
  readonly urgentReviewRecommended: boolean | null;
  readonly authoritySource: HardContraindication["source"] | null;
  readonly matchedStressFacts: readonly PainStressMatchFact[];
  readonly criteria: readonly PainReceiverCriterionTrace[];
  readonly responseRequirement: PainResponseRequirementTrace | null;
}

export interface AssessmentPainContextMatchTrace {
  readonly signalId: string;
  readonly signalKind:
    | HistoricalSensitivity["kind"]
    | CurrentDiscomfort["kind"]
    | ModeratePain["kind"];
  readonly requestedAction: PainRequestedAction | null;
  readonly matchedBy: readonly ("region" | "stress_fact" | "movement_role")[];
  readonly matchedStressFacts: readonly PainStressMatchFact[];
}
