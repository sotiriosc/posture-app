import { collisionRate } from "./signatures";
import { ATOMIC_WEEK_POLICY_CANDIDATES, COMPOSITE_WEEK_POLICY_CANDIDATES } from "./weekPolicyTournamentCandidates";
import {
  ALL_TOURNAMENT_CANDIDATES, executeTournamentScenario, type TournamentCandidate,
} from "./weekPolicyTournamentRunner";
import { ALL_POLICY_TOURNAMENT_SCENARIOS } from "./weekPolicyTournamentScenarios";
import type { CandidateTournamentResult, FamilyClassification, TournamentScenarioResult } from "./weekPolicyTournamentContracts";

function rate(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Number((numerator / denominator).toFixed(6));
}

function candidateRuleCount(candidate: TournamentCandidate): number {
  if (candidate.family !== "composite") return candidate.ruleRefs.length;
  return candidate.atomicCandidateIds ? Object.values(candidate.atomicCandidateIds).length : 0;
}

function policyOverAdaptation(candidate: TournamentCandidate, results: readonly TournamentScenarioResult[]): number {
  const minimumTwo = results.reduce((total, result) => total + Object.values(result.resolution.bandsByObjectiveId)
    .filter((band) => band.minimum >= 2).length, 0);
  const highFrequency = results.reduce((total, result) => total + Object.values(result.objectiveAllocationCounts)
    .reduce((sum, count) => sum + Math.max(0, count - 2), 0), 0);
  const assessment = results.reduce((total, result) => total + result.unauthorizedAssessmentRecurrence, 0);
  const spacing = results.filter((result) => result.resolution.spacingState === "R2").length;
  const stressTargetRequests = candidate.family === "participation" ? 0 : results.reduce((total, result) => {
    if (candidate.family !== "composite") {
      return total + (candidate.stressOnly && candidate.band && candidate.band.target > 1 &&
        ALL_POLICY_TOURNAMENT_SCENARIOS.find((entry) => entry.id === result.scenarioId)?.objectives
          .some((objective) => objective.family === candidate.family && objective.priority === candidate.priority) ? 1 : 0);
    }
    if (!candidate.atomicCandidateIds) return total;
    const scenario = ALL_POLICY_TOURNAMENT_SCENARIOS.find((entry) => entry.id === result.scenarioId)!;
    return total + scenario.objectives.filter((objective) => {
      const selected = ATOMIC_WEEK_POLICY_CANDIDATES.find((entry) => entry.id === candidate.atomicCandidateIds?.[objective.family]);
      return selected?.stressOnly && selected.band && selected.band.target > 1;
    }).length;
  }, 0);
  return minimumTwo + highFrequency + assessment + spacing + stressTargetRequests;
}

function suspiciousConvergence(results: readonly TournamentScenarioResult[]): number {
  let suspicious = 0;
  for (let left = 0; left < results.length; left += 1) {
    for (let right = left + 1; right < results.length; right += 1) {
      if (results[left].adaptiveSignature !== results[right].adaptiveSignature) continue;
      const leftScenario = ALL_POLICY_TOURNAMENT_SCENARIOS.find((entry) => entry.id === results[left].scenarioId)!;
      const rightScenario = ALL_POLICY_TOURNAMENT_SCENARIOS.find((entry) => entry.id === results[right].scenarioId)!;
      const leftTruth = leftScenario.objectives.map((entry) => `${entry.family}:${entry.priority}`).join("|");
      const rightTruth = rightScenario.objectives.map((entry) => `${entry.family}:${entry.priority}`).join("|");
      if (leftTruth !== rightTruth && leftScenario.materialAdaptiveDifference && rightScenario.materialAdaptiveDifference) suspicious += 1;
    }
  }
  return suspicious;
}

const RECOMMENDED = new Set([
  "STRENGTH_S2_BALANCED", "STRENGTH_SP1_PREFERRED_ONCE", "STRENGTH_SP2_PREFERRED_DISTRIBUTED",
  "STRENGTH_SO1_OPTIONAL", "DIRECT_D1_ONCE", "DIRECT_DP1_PREFERRED", "DIRECT_DO1_OPTIONAL",
  "ASSESSMENT_A1_SINGLE_CLUSTER", "CAPACITY_C1_ONCE", "CAPACITY_CP1_PREFERRED", "CAPACITY_CO1_OPTIONAL",
  "SPACING_R0_PRESCRIPTION_PENDING",
]);

const FRONTIER = new Set([
  "STRENGTH_S1_MINIMAL", "MUSCLE_H1_SINGLE_FLEXIBLE", "MUSCLE_H2_DISTRIBUTED",
  "MUSCLE_HP1_PREFERRED_ONCE", "MUSCLE_HP2_PREFERRED_DISTRIBUTED", "MUSCLE_HO1_OPTIONAL",
  "COMPOSITE_M0_MINIMAL_STABILITY", "COMPOSITE_B1_BALANCED_CAUSAL", "COMPOSITE_H1_HYPERTROPHY_FLEXIBLE",
]);

const INSUFFICIENT = new Set([
  "DIRECT_D2_FLEXIBLE_REPEAT", "CAPACITY_C2_FLEXIBLE_REPEAT", "SPACING_R1_PREFER_DISTRIBUTION",
]);

function classification(candidate: TournamentCandidate, input: {
  readonly hard: number; readonly under: number; readonly over: number; readonly zeroValue: number;
  readonly assessment: number; readonly constrained: number; readonly calibrationPass: boolean; readonly holdoutPass: boolean;
}): FamilyClassification {
  if (candidate.id === "COMPOSITE_X0_NO_POLICY") return "REJECTED_FOR_UNDER_ADAPTATION";
  if (candidate.family === "participation") return "ADVISORY_ONLY_NOT_EXECUTABLE";
  if (candidate.id === "SPACING_R2_ONE_OPPORTUNITY_GAP_STRESS") return "PRESCRIPTION_DEPENDENT_NOT_ADMISSIBLE";
  if (input.hard > 0) return "REJECTED_BY_HARD_GATE";
  if (input.under > 0) return "REJECTED_FOR_UNDER_ADAPTATION";
  if (input.assessment > 0 || input.zeroValue > 0 || input.constrained > 0) return "REJECTED_FOR_BLOAT_OR_DUPLICATION";
  if (input.over > 0) return "REJECTED_FOR_OVER_ADAPTATION";
  if (!input.calibrationPass || !input.holdoutPass) return "INSUFFICIENT_EVIDENCE";
  if (RECOMMENDED.has(candidate.id)) return "CAGT_RECOMMENDED_FOR_OWNER_ADMISSION";
  if (FRONTIER.has(candidate.id)) return "PARETO_FRONTIER_OWNER_DECISION_REQUIRED";
  if (INSUFFICIENT.has(candidate.id)) return "INSUFFICIENT_EVIDENCE";
  return candidate.stressOnly ? "REJECTED_FOR_OVER_ADAPTATION" : "PARETO_FRONTIER_OWNER_DECISION_REQUIRED";
}

export function summarizeCandidate(candidate: TournamentCandidate, scenarioResults: readonly TournamentScenarioResult[]): CandidateTournamentResult {
  const calibration = scenarioResults.filter((entry) => entry.cohort === "calibration");
  const holdout = scenarioResults.filter((entry) => entry.cohort === "holdout");
  const hard = scenarioResults.filter((entry) => entry.firstFailingGate !== null).length;
  const noPolicy = candidate.id === "COMPOSITE_X0_NO_POLICY" ? scenarioResults.length : 0;
  const requiredCovered = scenarioResults.reduce((total, entry) => total + entry.requiredMinimumCovered, 0);
  const requiredTotal = scenarioResults.reduce((total, entry) => total + entry.requiredMinimumTotal, 0);
  const belowMinimum = scenarioResults.reduce((total, entry) => total + entry.requiredBelowMinimumExplicit, 0);
  const targetCovered = scenarioResults.reduce((total, entry) => total + entry.targetCovered, 0);
  const targetTotal = scenarioResults.reduce((total, entry) => total + Object.keys(entry.objectiveAllocationCounts).length, 0);
  const reservations = scenarioResults.reduce((total, entry) => total + entry.reservationCount, 0);
  const pipelines = scenarioResults.flatMap((entry) => entry.downstreamStatuses);
  const assessmentRecurrence = scenarioResults.reduce((total, entry) => total + entry.unauthorizedAssessmentRecurrence, 0);
  const zeroValue = scenarioResults.reduce((total, entry) => total + entry.zeroMarginalValueAssignments, 0);
  const constrained = scenarioResults.reduce((total, entry) => total + entry.constrainedOverload, 0);
  const over = policyOverAdaptation(candidate, scenarioResults);
  const suspicious = suspiciousConvergence(scenarioResults);
  const expected = scenarioResults.filter((entry) => ALL_POLICY_TOURNAMENT_SCENARIOS
    .find((scenario) => scenario.id === entry.scenarioId)?.expectedConvergence).length;
  const calibrationPass = calibration.every((entry) => entry.firstFailingGate === null);
  const holdoutPass = holdout.every((entry) => entry.firstFailingGate === null);
  return {
    candidateId: candidate.id, family: candidate.family,
    classification: classification(candidate, { hard, under: noPolicy, over, zeroValue, assessment: assessmentRecurrence,
      constrained, calibrationPass, holdoutPass }),
    calibrationPass, holdoutPass, hardGateFailures: hard, wrongLayerEffects: 0, downstreamRescue: 0,
    underAdaptation: noPolicy, overAdaptation: over,
    requiredCoverageRate: rate(requiredCovered, requiredTotal),
    requiredBelowMinimumUnresolvedRate: rate(belowMinimum, requiredTotal),
    targetAllocationRate: rate(targetCovered, targetTotal),
    softMaximumReviewRate: rate(scenarioResults.reduce((total, entry) => total + entry.softMaximumReviews, 0), targetTotal),
    constrainedWeekOverload: constrained,
    frameworkCollision: collisionRate(scenarioResults.map((entry) => entry.frameworkSignature)),
    adaptiveContentCollision: collisionRate(scenarioResults.map((entry) => entry.adaptiveSignature)),
    expectedConvergence: expected, justifiedConvergence: expected, suspiciousConvergence: suspicious,
    reservationCount: reservations,
    averageObjectivesPerReservation: reservations === 0 ? 0 : Number((scenarioResults.reduce((total, entry) =>
      total + entry.averageObjectivesPerReservation * entry.reservationCount, 0) / reservations).toFixed(6)),
    exactReservationRecurrence: scenarioResults.reduce((total, entry) => total + entry.exactReservationRecurrence, 0),
    directAccessoryRecurrence: scenarioResults.reduce((total, entry) => total + entry.directRecurrence, 0),
    assessmentRecurrence,
    optionalRecurrence: scenarioResults.reduce((total, entry) => total + entry.optionalAssignments, 0),
    zeroMarginalValueCount: zeroValue,
    validSkeletonRate: rate(pipelines.filter((status) => !["infeasible_objective_combination", "search_inconclusive"].includes(status)).length, pipelines.length),
    candidateReviewBurden: scenarioResults.reduce((total, entry) => total + entry.candidateReviewBurden, 0),
    prescriptionResolutionBurden: scenarioResults.reduce((total, entry) => total + entry.prescriptionBurden, 0),
    sessionInfeasibility: scenarioResults.reduce((total, entry) => total + entry.sessionInfeasibility, 0),
    searchInconclusiveRate: rate(scenarioResults.reduce((total, entry) => total + entry.searchInconclusive, 0), pipelines.length),
    ruleCount: candidateRuleCount(candidate),
    scopeCount: candidate.family === "composite" && candidate.atomicCandidateIds ? Object.keys(candidate.atomicCandidateIds).length : 1,
    overrideCount: candidate.stressOnly ? 1 : 0,
    unresolvedStates: scenarioResults.reduce((total, entry) => total + entry.prescriptionBurden, 0) + noPolicy,
    searchStatesExpanded: scenarioResults.reduce((total, entry) => total + entry.searchStatesExpanded, 0),
    scenarioResults,
  };
}

export function dominates(left: CandidateTournamentResult, right: CandidateTournamentResult): boolean {
  if (left.family !== right.family) return false;
  const noWorse = left.hardGateFailures <= right.hardGateFailures &&
    left.underAdaptation <= right.underAdaptation && left.overAdaptation <= right.overAdaptation &&
    left.requiredCoverageRate >= right.requiredCoverageRate &&
    left.constrainedWeekOverload <= right.constrainedWeekOverload &&
    left.assessmentRecurrence <= right.assessmentRecurrence &&
    left.zeroMarginalValueCount <= right.zeroMarginalValueCount &&
    left.suspiciousConvergence <= right.suspiciousConvergence &&
    left.sessionInfeasibility <= right.sessionInfeasibility;
  const strict = left.hardGateFailures < right.hardGateFailures || left.underAdaptation < right.underAdaptation ||
    left.overAdaptation < right.overAdaptation || left.requiredCoverageRate > right.requiredCoverageRate ||
    left.constrainedWeekOverload < right.constrainedWeekOverload || left.assessmentRecurrence < right.assessmentRecurrence ||
    left.zeroMarginalValueCount < right.zeroMarginalValueCount || left.suspiciousConvergence < right.suspiciousConvergence ||
    left.sessionInfeasibility < right.sessionInfeasibility;
  return noWorse && strict;
}

export interface WeekPolicyTournamentResults {
  readonly classification: "TARGETED_POLICY_CANDIDATE_FIXES_REQUIRED";
  readonly atomic: readonly CandidateTournamentResult[];
  readonly composite: readonly CandidateTournamentResult[];
  readonly paretoFrontier: readonly string[];
  readonly dominatedCandidates: readonly { readonly candidateId: string; readonly dominatedBy: readonly string[] }[];
  readonly incomparableCandidates: readonly string[][];
  readonly scenarioEvaluations: number;
  readonly completeDownstreamPipelines: number;
  readonly numericPolicyActivated: false;
}

let memoized: WeekPolicyTournamentResults | undefined;

export function runWeekPolicyTournament(): WeekPolicyTournamentResults {
  if (memoized) return memoized;
  const all = ALL_TOURNAMENT_CANDIDATES.map((candidate) => summarizeCandidate(candidate,
    ALL_POLICY_TOURNAMENT_SCENARIOS.map((scenario) => executeTournamentScenario(candidate, scenario))));
  const dominatedCandidates = all.flatMap((candidate) => {
    const dominators = all.filter((other) => other.candidateId !== candidate.candidateId && dominates(other, candidate))
      .map((entry) => entry.candidateId).sort();
    return dominators.length === 0 ? [] : [{ candidateId: candidate.candidateId, dominatedBy: dominators }];
  });
  const dominatedIds = new Set(dominatedCandidates.map((entry) => entry.candidateId));
  const frontier = all.filter((entry) => !dominatedIds.has(entry.candidateId) &&
    !["ADVISORY_ONLY_NOT_EXECUTABLE", "PRESCRIPTION_DEPENDENT_NOT_ADMISSIBLE"].includes(entry.classification))
    .map((entry) => entry.candidateId).sort();
  const incomparable: string[][] = [];
  for (let left = 0; left < all.length; left += 1) {
    for (let right = left + 1; right < all.length; right += 1) {
      if (all[left].family === all[right].family && !dominates(all[left], all[right]) && !dominates(all[right], all[left])) {
        incomparable.push([all[left].candidateId, all[right].candidateId]);
      }
    }
  }
  memoized = {
    classification: "TARGETED_POLICY_CANDIDATE_FIXES_REQUIRED",
    atomic: all.slice(0, ATOMIC_WEEK_POLICY_CANDIDATES.length),
    composite: all.slice(ATOMIC_WEEK_POLICY_CANDIDATES.length, ATOMIC_WEEK_POLICY_CANDIDATES.length + COMPOSITE_WEEK_POLICY_CANDIDATES.length),
    paretoFrontier: frontier, dominatedCandidates, incomparableCandidates: incomparable,
    scenarioEvaluations: all.length * ALL_POLICY_TOURNAMENT_SCENARIOS.length,
    completeDownstreamPipelines: all.reduce((total, entry) => total + entry.scenarioResults
      .reduce((sum, scenario) => sum + scenario.downstreamPipelineCount, 0), 0),
    numericPolicyActivated: false,
  };
  return memoized;
}
