import type { AssessmentInfluence } from "./alignment";
import type {
  AssessmentConfidence,
  AssessmentFeature,
  AssessmentFeatureSource,
  AssessmentPriority,
  AssessmentSeverity,
} from "./domain/assessment";
import type {
  ExerciseDemandAnnotationLevel,
  ExerciseDemandDimension,
  ExerciseMechanicsReviewStatus,
} from "./domain/exercise";
import type { ReasonCode } from "./reasonCodes";
import type {
  AssessmentPainContextMatchTrace,
  CandidatePainMatchTrace,
  PainReceiverDecisionTrace,
} from "./candidate/pain";

export type ScoreComponentSource =
  | "athlete_profile"
  | "training_goal"
  | "session_intent"
  | "weekly_intent"
  | "assessment"
  | "alignment"
  | "pain_injury"
  | "equipment"
  | "phase"
  | "history"
  | "exercise_definition"
  | "optimizer_context";

export type ScoreComponentFamily =
  | "role_fit"
  | "goal_fit"
  | "muscle_target_fit"
  | "session_intent"
  | "weekly_need"
  | "assessment_relevance"
  | "alignment_fit"
  | "pain_suitability"
  | "experience_suitability"
  | "phase_suitability"
  | "stability_fit"
  | "skill_fit"
  | "progression_value"
  | "continuity_value"
  | "loadability"
  | "stimulus_potential"
  | "fatigue_cost"
  | "joint_cost"
  | "equipment_practicality"
  | "session_synergy";

export type AssessmentRelevanceLevel = "none" | "low" | "moderate" | "high";

export type AssessmentCandidateRelationship =
  | "supports_control"
  | "reduces_excess_demand"
  | "provides_appropriate_exposure"
  | "develops_priority"
  | "under_challenges_development"
  | "neutral"
  | "conflicts_with_priority"
  | "exceeds_current_capability";

export type AssessmentDemandDimension = ExerciseDemandDimension;
export type AssessmentFeatureMatch =
  | "strong"
  | "moderate"
  | "weak"
  | "low_expression"
  | "conflict"
  | "unknown";

export type DemandCapabilityMatch =
  | "below_current_capability"
  | "matches_current_capability"
  | "appropriate_challenge"
  | "exceeds_current_capability"
  | "not_applicable";

export interface AssessmentSignalInterpretationTrace {
  readonly confidence: string;
  readonly priority: string;
  readonly severity: AssessmentSeverity;
  readonly severitySource: "provided" | "default_conservative" | "not_applicable";
  readonly deficitMagnitude: number;
  readonly evidence: readonly string[];
}

export interface CandidateDemandSourceTrace {
  readonly level: ExerciseDemandAnnotationLevel;
  readonly value: number | null;
  readonly source:
    | "exercise_definition"
    | "existing_loading_profile"
    | "human_review_needed"
    | "unknown";
  readonly reviewStatus: ExerciseMechanicsReviewStatus;
  readonly evidence: readonly string[];
}

export type CapabilityEstimateSource =
  | "observed"
  | "history_inferred"
  | "assessment_inferred"
  | "phase_default"
  | "generic_default";

export type CapabilityEvidenceQuality = "strong" | "moderate" | "weak" | "unknown";

export interface HistoryCapabilityEvidenceTrace {
  readonly matchingEventCount: number;
  readonly positiveEvidenceCount: number;
  readonly negativeEvidenceCount: number;
  readonly staleEventCount: number;
  readonly noRecencyEventCount: number;
  readonly contradiction: boolean;
  readonly progressionStateCorroborates: boolean;
  readonly adjustment: number;
  readonly evidenceQuality: CapabilityEvidenceQuality;
  readonly evidence: readonly string[];
}

export interface AthleteCapabilityEstimateTrace {
  readonly value: number;
  readonly estimateSource: CapabilityEstimateSource;
  readonly contributingSources: readonly CapabilityEstimateSource[];
  readonly evidenceQuality: CapabilityEvidenceQuality;
  readonly historyEvidence: HistoryCapabilityEvidenceTrace;
  readonly evidence: readonly string[];
}

export interface DemandReductionContextTrace {
  readonly relevant: boolean;
  readonly matchedPainConcernIds: readonly string[];
  readonly matchedHistoricalSensitivityIds: readonly string[];
  readonly painContextMatches: readonly AssessmentPainContextMatchTrace[];
  readonly matchedFatigueMovementRoles: readonly string[];
  readonly systemicFatigueUsed: boolean;
  readonly globalPainAwareGoalUsed: boolean;
  readonly evidence: readonly string[];
}

export interface AssessmentDemandCapabilityTrace {
  readonly dimension: AssessmentDemandDimension;
  readonly candidateDemand: number | null;
  readonly candidateDemandSource: CandidateDemandSourceTrace;
  readonly currentCapability: number;
  readonly capabilityEstimate: AthleteCapabilityEstimateTrace;
  readonly phaseIntentDemand: number;
  readonly phaseIntentSource: readonly string[];
  readonly developmentalValue: number;
  readonly match: DemandCapabilityMatch;
  readonly evidence: readonly string[];
}

export interface AssessmentFeatureMatchTrace {
  readonly assessmentFeature: AssessmentFeature;
  readonly assessmentFeatureSource: AssessmentFeatureSource;
  readonly candidateFeature: string;
  readonly candidateFeatureLevel: ExerciseDemandAnnotationLevel;
  readonly candidateFeatureReviewStatus: ExerciseMechanicsReviewStatus;
  readonly candidateFeatureProfileReviewStatus: ExerciseMechanicsReviewStatus | "not_applicable";
  readonly featureMatch: AssessmentFeatureMatch;
  readonly featureReason: string;
}

export type FeatureEmphasisSource = "scapular_mechanics" | "unknown";
export type FeatureChallengeDemandSource = "not_modeled" | "unknown";
export type FeatureCapabilityPriorSource = "phase_experience_default" | "not_applicable";
export type FeatureSpecificEvidenceSource = "assessment_severity";
export type FeatureSpecificHistorySupport = "unavailable_not_modeled";

export interface AssessmentFeatureDevelopmentTrace {
  readonly assessmentFeature: AssessmentFeature;
  readonly featureMatch: AssessmentFeatureMatch;
  readonly featureEmphasisLevel: ExerciseDemandAnnotationLevel;
  readonly featureEmphasisSource: FeatureEmphasisSource;
  readonly featureReviewStatus: ExerciseMechanicsReviewStatus | "not_applicable";
  readonly overallTaskDemand: number | null;
  readonly overallTaskDemandSource: CandidateDemandSourceTrace;
  readonly featureChallengeDemand: number | null;
  readonly featureChallengeDemandSource: FeatureChallengeDemandSource;
  readonly featureCapabilityEstimate: number | null;
  readonly featureCapabilitySource: CapabilityEstimateSource | "not_applicable";
  readonly featureCapabilityEvidenceQuality: CapabilityEvidenceQuality;
  readonly featureCapabilityPriorSource: FeatureCapabilityPriorSource;
  readonly featureSpecificEvidenceSources: readonly FeatureSpecificEvidenceSource[];
  readonly featureSpecificHistorySupport: FeatureSpecificHistorySupport;
  readonly featureDemandCapabilityMatch: DemandCapabilityMatch;
  readonly evidence: readonly string[];
}

export type AssessmentFeatureTargetFitSource = "scapular_feature_match";

export interface AssessmentFeatureTargetFitTrace {
  readonly assessmentFeature: AssessmentFeature;
  readonly assessmentFeatureSource: AssessmentFeatureSource;
  readonly candidateFeature: string;
  readonly candidateFeatureLevel: ExerciseDemandAnnotationLevel;
  readonly candidateFeatureReviewStatus: ExerciseMechanicsReviewStatus;
  readonly candidateFeatureProfileReviewStatus: ExerciseMechanicsReviewStatus | "not_applicable";
  readonly featureMatch: AssessmentFeatureMatch;
  readonly relevance: AssessmentRelevanceLevel;
  readonly confidence: AssessmentConfidence;
  readonly priority: AssessmentPriority;
  readonly influence: number;
  readonly source: AssessmentFeatureTargetFitSource;
  readonly evidence: readonly string[];
}

export interface AssessmentRelevanceTrace {
  readonly signalId: string;
  readonly candidateId: string;
  readonly requestedRole: string;
  readonly relevance: AssessmentRelevanceLevel;
  readonly relevanceReasonCode: ReasonCode;
  readonly relevanceReason: string;
  readonly signalInterpretation: AssessmentSignalInterpretationTrace;
  readonly featureMatches: readonly AssessmentFeatureMatchTrace[];
  readonly featureTargetFit: readonly AssessmentFeatureTargetFitTrace[];
  readonly featureTargetFitInfluence: number;
  readonly featureDevelopment: readonly AssessmentFeatureDevelopmentTrace[];
  readonly developmentalChallengeInfluence: number;
  readonly relationship: AssessmentCandidateRelationship;
  readonly relationshipReason: string;
  readonly demandReductionContext: DemandReductionContextTrace;
  readonly demandCapability: AssessmentDemandCapabilityTrace;
  readonly confidence: string;
  readonly priority: string;
  readonly direction: "supports" | "neutral" | "conflicts";
  readonly boundedInfluence: number;
  readonly assessmentContribution: number;
  readonly alignmentContribution: number;
  readonly contributesTo: readonly ("assessment_fit" | "alignment_fit")[];
}

export interface ScoreComponent {
  readonly id: string;
  readonly family: ScoreComponentFamily;
  readonly value: number;
  readonly rawValue: number;
  readonly weight: number;
  readonly unnormalizedWeight: number;
  readonly weightedContribution: number;
  readonly reason: string;
  readonly reasonCode: ReasonCode;
  readonly source: ScoreComponentSource;
  readonly assessmentInfluence?: AssessmentInfluence;
  readonly assessmentRelevance?: readonly AssessmentRelevanceTrace[];
  readonly painMatchTrace?: CandidatePainMatchTrace;
  readonly painReceiverDecision?: PainReceiverDecisionTrace;
}

export interface CandidateScore {
  readonly exerciseId: string;
  readonly components: readonly ScoreComponent[];
  readonly aggregate: {
    readonly method:
      | "unweighted_mean_foundation_placeholder"
      | "weighted_mean_candidate_intelligence_v0";
    readonly value: number;
    readonly unroundedValue: number;
    readonly totalWeight: number;
    readonly weightNormalization:
      | "equal_component_weight"
      | "component_family_weight_divided_by_total_family_weight";
  };
}

export interface CandidateScoringModel {
  scoreCandidate(input: CandidateScoringInput): CandidateScore;
}

export interface CandidateScoringInput {
  readonly exerciseId: string;
  readonly components: readonly ScoreComponent[];
}

export function composeCandidateScore(input: CandidateScoringInput): CandidateScore {
  const sortedComponents = [...input.components].sort((left, right) => left.id.localeCompare(right.id));
  const componentWeight = sortedComponents.length === 0 ? 0 : 1 / sortedComponents.length;
  const components = sortedComponents.map((component) => ({
    ...component,
    rawValue: component.value,
    weight: Number(componentWeight.toFixed(6)),
    unnormalizedWeight: 1,
    weightedContribution: Number((component.value * componentWeight).toFixed(6)),
  }));
  const unroundedValue = components.reduce(
    (sum, component) => sum + component.weightedContribution,
    0,
  );
  const value = Number(unroundedValue.toFixed(3));

  return {
    exerciseId: input.exerciseId,
    components,
    aggregate: {
      method: "unweighted_mean_foundation_placeholder",
      value,
      unroundedValue: Number(unroundedValue.toFixed(6)),
      totalWeight: sortedComponents.length,
      weightNormalization: "equal_component_weight",
    },
  };
}
