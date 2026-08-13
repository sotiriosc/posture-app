import type { CagtGateId } from "./contracts";

export const WEEK_POLICY_TOURNAMENT_VERSION = "1.0.0";
export const WEEK_POLICY_TOURNAMENT_AS_OF = "2026-08-12T21:27:00-04:00";
export const WEEK_POLICY_TOURNAMENT_SEED = 0x086712;
export const TEST_CANDIDATE_STATE = "CAGT_TEST_CANDIDATE_NOT_PRODUCTION" as const;

export type PolicyFamily = "strength" | "muscle" | "direct" | "assessment" | "capacity" |
  "participation" | "spacing";
export type ObjectivePriority = "required" | "preferred" | "optional";
export type ObjectivePolicyFamily = Exclude<PolicyFamily, "participation" | "spacing">;

export interface FrequencyBand {
  readonly minimum: number;
  readonly target: number;
  readonly softMaximum: number;
}

export interface AtomicPolicyCandidate {
  readonly id: string;
  readonly version: typeof WEEK_POLICY_TOURNAMENT_VERSION;
  readonly state: typeof TEST_CANDIDATE_STATE;
  readonly family: PolicyFamily;
  readonly scope: string;
  readonly priority: ObjectivePriority | "advisory" | "allocation_preference";
  readonly band: FrequencyBand | null;
  readonly executable: boolean;
  readonly ownerLeading: boolean;
  readonly stressOnly: boolean;
  readonly prescriptionDependent: boolean;
  readonly ruleRefs: readonly string[];
}

export interface CompositePolicyCandidate {
  readonly id: string;
  readonly version: typeof WEEK_POLICY_TOURNAMENT_VERSION;
  readonly state: typeof TEST_CANDIDATE_STATE;
  readonly family: "composite";
  readonly atomicCandidateIds: Readonly<Record<PolicyFamily, string>> | null;
  readonly noPolicyControl: boolean;
  readonly ownerLeading: boolean;
  readonly stressOnly: boolean;
}

export interface TournamentObjectiveFixture {
  readonly id: string;
  readonly family: ObjectivePolicyFamily;
  readonly priority: ObjectivePriority;
  readonly priorityOrder: number;
  readonly explicit: true;
  readonly uniqueMarginalValue: boolean;
  readonly assessmentRepeatAuthorized?: boolean;
}

export interface TournamentScenario {
  readonly id: string;
  readonly cohort: "calibration" | "holdout";
  readonly locked: boolean;
  readonly opportunityCount: number;
  readonly condensedOpportunityOrders: readonly number[];
  readonly cancelledOpportunityOrders: readonly number[];
  readonly bodyweightOpportunityOrders: readonly number[];
  readonly unknownEquipmentOpportunityOrders: readonly number[];
  readonly consecutive: boolean;
  readonly context: "ordinary" | "pain_aware" | "productive_continuity" | "adverse_response" | "travel";
  readonly objectives: readonly TournamentObjectiveFixture[];
  readonly expectedConvergence: boolean;
  readonly materialAdaptiveDifference: boolean;
}

export type TournamentGateState = "PASS" | "FAIL_STOP" | "NOT_REACHED" | "NOT_IMPLEMENTED";
export interface TournamentGateResult {
  readonly gate: CagtGateId;
  readonly state: TournamentGateState;
  readonly reasonCode: string;
  readonly actualEvidenceRefs: readonly string[];
}

export interface PolicyResolution {
  readonly candidateId: string;
  readonly valid: boolean;
  readonly failures: readonly string[];
  readonly bandsByObjectiveId: Readonly<Record<string, FrequencyBand>>;
  readonly spacingState: "R0" | "R1" | "R2";
  readonly participationState: "P0" | "P1" | "P2";
  readonly productionActivation: false;
}

export interface TournamentScenarioResult {
  readonly candidateId: string;
  readonly scenarioId: string;
  readonly cohort: TournamentScenario["cohort"];
  readonly resolution: PolicyResolution;
  readonly weeklyIntentStatus: string;
  readonly allocationStatus: string;
  readonly reservationCount: number;
  readonly objectiveAllocationCounts: Readonly<Record<string, number>>;
  readonly objectiveSatisfactionStates: Readonly<Record<string, string>>;
  readonly searchStatesExpanded: number;
  readonly searchCompleteness: string;
  readonly downstreamPipelineCount: number;
  readonly downstreamStatuses: readonly string[];
  readonly frameworkSignature: string;
  readonly adaptiveSignature: string;
  readonly reservationSignature: string;
  readonly sessionIntentSignature: string;
  readonly sessionSkeletonSignature: string;
  readonly requiredMinimumCovered: number;
  readonly requiredMinimumTotal: number;
  readonly requiredBelowMinimumExplicit: number;
  readonly targetCovered: number;
  readonly softMaximumReviews: number;
  readonly unauthorizedAssessmentRecurrence: number;
  readonly optionalAssignments: number;
  readonly zeroMarginalValueAssignments: number;
  readonly directRecurrence: number;
  readonly exactReservationRecurrence: number;
  readonly averageObjectivesPerReservation: number;
  readonly constrainedOverload: number;
  readonly prescriptionBurden: number;
  readonly candidateReviewBurden: number;
  readonly sessionInfeasibility: number;
  readonly searchInconclusive: number;
  readonly gates: readonly TournamentGateResult[];
  readonly firstFailingGate: CagtGateId | null;
  readonly productionActivation: false;
}

export type FamilyClassification = "CAGT_RECOMMENDED_FOR_OWNER_ADMISSION" |
  "PARETO_FRONTIER_OWNER_DECISION_REQUIRED" | "REJECTED_BY_HARD_GATE" |
  "REJECTED_FOR_OVER_ADAPTATION" | "REJECTED_FOR_UNDER_ADAPTATION" |
  "REJECTED_FOR_BLOAT_OR_DUPLICATION" | "PRESCRIPTION_DEPENDENT_NOT_ADMISSIBLE" |
  "ADVISORY_ONLY_NOT_EXECUTABLE" | "INSUFFICIENT_EVIDENCE";

export interface CandidateTournamentResult {
  readonly candidateId: string;
  readonly family: PolicyFamily | "composite";
  readonly classification: FamilyClassification;
  readonly calibrationPass: boolean;
  readonly holdoutPass: boolean;
  readonly hardGateFailures: number;
  readonly wrongLayerEffects: number;
  readonly downstreamRescue: number;
  readonly underAdaptation: number;
  readonly overAdaptation: number;
  readonly requiredCoverageRate: number;
  readonly requiredBelowMinimumUnresolvedRate: number;
  readonly targetAllocationRate: number;
  readonly softMaximumReviewRate: number;
  readonly constrainedWeekOverload: number;
  readonly frameworkCollision: number;
  readonly adaptiveContentCollision: number;
  readonly expectedConvergence: number;
  readonly justifiedConvergence: number;
  readonly suspiciousConvergence: number;
  readonly reservationCount: number;
  readonly averageObjectivesPerReservation: number;
  readonly exactReservationRecurrence: number;
  readonly directAccessoryRecurrence: number;
  readonly assessmentRecurrence: number;
  readonly optionalRecurrence: number;
  readonly zeroMarginalValueCount: number;
  readonly validSkeletonRate: number;
  readonly candidateReviewBurden: number;
  readonly prescriptionResolutionBurden: number;
  readonly sessionInfeasibility: number;
  readonly searchInconclusiveRate: number;
  readonly ruleCount: number;
  readonly scopeCount: number;
  readonly overrideCount: number;
  readonly unresolvedStates: number;
  readonly searchStatesExpanded: number;
  readonly scenarioResults: readonly TournamentScenarioResult[];
}
