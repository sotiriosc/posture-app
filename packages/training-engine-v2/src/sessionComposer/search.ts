import type { CandidateRankingResult, RankedCandidate } from "../candidate";
import type { SessionIntent, SessionNeed } from "../domain/session";
import type { CanonicalCompositionFact, SessionComposerSearchPolicy, SessionSearchTrace } from "./contracts";
import { compareSessionEvaluations, evaluateWorkingState, orderedNeeds } from "./evaluation";
import type { WorkingCoverage, WorkingState } from "./internal";
import { candidateTruthfullyCoversNeed, dependencyTargetExerciseIds } from "./validity";

export const PRODUCTION_SESSION_SEARCH_POLICY: SessionComposerSearchPolicy = {
  exactExpandedStateBudget: 350,
  boundedExpandedStateBudget: 48,
  retainedParetoFrontierPerLayer: 4,
};

export interface SessionSearchOutcome {
  readonly bestState: WorkingState | null;
  readonly trace: SessionSearchTrace;
}

function candidateSelectable(candidate: RankedCandidate): boolean {
  return ![
    "URGENT_EXTERNAL_REVIEW",
    "REQUIRES_SESSION_ROLE_SUBSTITUTION",
  ].includes(candidate.painExecutionReadiness.readiness);
}

function standaloneAllowed(intent: SessionIntent, need: SessionNeed): boolean {
  if (need.priority === "required") return true;
  if (need.standaloneAdmission === "shared_only") return false;
  if (need.priority === "preferred") {
    return intent.structuralCapacity !== "condensed" || need.standaloneAdmission === "admitted";
  }
  return intent.structuralCapacity === "expanded";
}

function addCandidate(input: {
  readonly state: WorkingState;
  readonly intent: SessionIntent;
  readonly need: SessionNeed;
  readonly candidate: RankedCandidate;
  readonly result: CandidateRankingResult;
  readonly fact: CanonicalCompositionFact;
}): WorkingState | null {
  if (!candidateSelectable(input.candidate)) return null;
  if (!candidateTruthfullyCoversNeed({
    candidate: input.candidate,
    fact: input.fact,
    need: input.need,
    result: input.result,
  })) return null;
  const existing = input.state.assignments.find((entry) => entry.exerciseId === input.candidate.exercise.id);
  if (existing && (existing.section !== input.need.section || existing.role !== input.need.selection.requestedRole)) {
    return null;
  }
  const readiness = input.candidate.painExecutionReadiness.readiness;
  if (!existing && !standaloneAllowed(input.intent, input.need)) return null;
  if (
    !existing && input.need.priority !== "required" &&
    ["REQUIRES_CANDIDATE_REVIEW", "REQUIRES_PRESCRIPTION"].includes(readiness)
  ) return null;

  const coverage: WorkingCoverage = {
    need: input.need,
    candidate: input.candidate,
    requestId: input.result.request.id,
    bestExecutableFallbackExerciseId: input.result.painExecutionReadiness.bestExecutableCandidateId,
  };
  const assignments = existing
    ? input.state.assignments.map((assignment) => assignment.exerciseId === existing.exerciseId
      ? { ...assignment, coverage: [...assignment.coverage, coverage] }
      : assignment)
    : [...input.state.assignments, {
      exerciseId: input.candidate.exercise.id,
      section: input.need.section,
      role: input.need.selection.requestedRole,
      coverage: [coverage],
    }];
  return {
    assignments: assignments.sort((left, right) => left.exerciseId.localeCompare(right.exerciseId)),
    omittedNeedIds: input.state.omittedNeedIds,
  };
}

function omitNeed(state: WorkingState, need: SessionNeed): WorkingState | null {
  if (need.priority === "required") return null;
  return {
    assignments: state.assignments,
    omittedNeedIds: [...state.omittedNeedIds, need.id].sort(),
  };
}

function stateSignature(state: WorkingState): string {
  return state.assignments.map((assignment) =>
    `${assignment.exerciseId}@${assignment.section}:${assignment.role}[${
      assignment.coverage.map((entry) =>
        `${entry.need.id}#${entry.candidate.rank}:${entry.candidate.painExecutionReadiness.readiness}`,
      ).sort().join(",")
    }]`,
  ).sort().join("|") + `;omit=${[...state.omittedNeedIds].sort().join(",")}`;
}

function futureInteractionSignature(state: WorkingState): string {
  return state.assignments.map((assignment) =>
    `${assignment.exerciseId}@${assignment.section}:${assignment.role}[${
      assignment.coverage.map((entry) => entry.need.id).sort().join(",")
    }]`,
  ).sort().join("|") + `;omit=${[...state.omittedNeedIds].sort().join(",")}`;
}

function paretoDominates(input: {
  readonly intent: SessionIntent;
  readonly facts: ReadonlyMap<string, CanonicalCompositionFact>;
  readonly left: WorkingState;
  readonly right: WorkingState;
}): boolean {
  if (futureInteractionSignature(input.left) !== futureInteractionSignature(input.right)) return false;
  const left = evaluateWorkingState({ intent: input.intent, state: input.left, facts: input.facts });
  const right = evaluateWorkingState({ intent: input.intent, state: input.right, facts: input.facts });
  const comparisons = [
    left.candidateReviewBurden - right.candidateReviewBurden,
    left.unjustifiedProductiveAnchorDisplacementCount - right.unjustifiedProductiveAnchorDisplacementCount,
    Number(right.dominantMainPurposeCovered) - Number(left.dominantMainPurposeCovered),
    left.nonAnchorPrescriptionResolutionBurden - right.nonAnchorPrescriptionResolutionBurden,
    ...left.preferredCoverageInPlannerOrder.map((covered, index) =>
      Number(right.preferredCoverageInPlannerOrder[index] ?? false) - Number(covered)),
    left.redundancyConflictBurden - right.redundancyConflictBurden,
    left.fatigueStressConcentrationBurden - right.fatigueStressConcentrationBurden,
    ...left.optionalCoverageInPlannerOrder.map((covered, index) =>
      Number(right.optionalCoverageInPlannerOrder[index] ?? false) - Number(covered)),
    left.selectedIdentityCount - right.selectedIdentityCount,
    left.setupTransitionCount - right.setupTransitionCount,
    ...left.localCandidateRankVector.map((rank, index) =>
      rank - (right.localCandidateRankVector[index] ?? Number.MAX_SAFE_INTEGER)),
    left.canonicalIdentityTieBreak.localeCompare(right.canonicalIdentityTieBreak),
  ];
  return comparisons.every((comparison) => comparison <= 0) &&
    comparisons.some((comparison) => comparison < 0);
}

function completeAndValid(
  intent: SessionIntent,
  state: WorkingState,
  facts: ReadonlyMap<string, CanonicalCompositionFact>,
): boolean {
  const covered = new Set(state.assignments.flatMap((assignment) =>
    assignment.coverage.map((entry) => entry.need.id),
  ));
  if (intent.needs.some((need) => need.priority === "required" && !covered.has(need.id))) return false;
  const exerciseIdByNeed = new Map(state.assignments.flatMap((assignment) =>
    assignment.coverage.map((coverage) => [coverage.need.id, assignment.exerciseId] as const),
  ));
  for (const need of intent.needs) {
    for (const dependency of need.dependencies) {
      if (!dependency.required) continue;
      const activeTargets = dependencyTargetExerciseIds({ dependency, intent, exerciseIdByNeed, facts });
      if (activeTargets.length > 0 && !covered.has(need.id)) return false;
    }
  }
  return intent.kind !== "ordinary_training" || state.assignments.some((assignment) =>
    assignment.section === "main" && assignment.coverage.some((entry) => entry.need.priority === "required"),
  );
}

function estimateStateCount(
  intent: SessionIntent,
  results: Readonly<Record<string, CandidateRankingResult>>,
): number {
  let layerStates = 1;
  let estimate = 0;
  for (const need of orderedNeeds(intent)) {
    const selectableCount = results[need.id].rankedCandidates.filter(candidateSelectable).length;
    layerStates *= selectableCount + (need.priority === "required" ? 0 : 1);
    estimate += layerStates;
    if (!Number.isSafeInteger(estimate)) return Number.MAX_SAFE_INTEGER;
  }
  return estimate;
}

function partialOrder(
  intent: SessionIntent,
  facts: ReadonlyMap<string, CanonicalCompositionFact>,
  left: WorkingState,
  right: WorkingState,
): number {
  const leftCovered = new Set(left.assignments.flatMap((entry) => entry.coverage.map((coverage) => coverage.need.id)));
  const rightCovered = new Set(right.assignments.flatMap((entry) => entry.coverage.map((coverage) => coverage.need.id)));
  const ordered = orderedNeeds(intent);
  for (const need of ordered) {
    if (leftCovered.has(need.id) !== rightCovered.has(need.id)) return leftCovered.has(need.id) ? -1 : 1;
  }
  return compareSessionEvaluations(
    evaluateWorkingState({ intent, state: left, facts }),
    evaluateWorkingState({ intent, state: right, facts }),
  );
}

export function searchSessionSkeleton(input: {
  readonly intent: SessionIntent;
  readonly candidateResultsByNeed: Readonly<Record<string, CandidateRankingResult>>;
  readonly facts: ReadonlyMap<string, CanonicalCompositionFact>;
  readonly policy?: SessionComposerSearchPolicy;
  readonly forceMode?: "exhaustive" | "bounded";
}): SessionSearchOutcome {
  const policy = input.policy ?? PRODUCTION_SESSION_SEARCH_POLICY;
  const estimate = estimateStateCount(input.intent, input.candidateResultsByNeed);
  const mode = input.forceMode ?? (estimate <= policy.exactExpandedStateBudget ? "exhaustive" : "bounded");
  const stateBudget = mode === "exhaustive"
    ? Math.max(policy.exactExpandedStateBudget, estimate)
    : policy.boundedExpandedStateBudget;
  let frontier: readonly WorkingState[] = [{ assignments: [], omittedNeedIds: [] }];
  let statesExpanded = 0;
  let statesPruned = 0;
  let frontierPeak = 1;
  let limitReached = false;
  const pruningReasons: Record<string, number> = {};
  const prune = (reason: string, count = 1): void => {
    statesPruned += count;
    pruningReasons[reason] = (pruningReasons[reason] ?? 0) + count;
  };

  const needs = orderedNeeds(input.intent);
  let completedAllLayers = true;
  for (const [needIndex, need] of needs.entries()) {
    const result = input.candidateResultsByNeed[need.id];
    const candidates = [...result.rankedCandidates]
      .sort((left, right) => left.rank - right.rank || left.exercise.id.localeCompare(right.exercise.id));
    const next: WorkingState[] = [];
    layer: for (const state of frontier) {
      if (statesExpanded >= stateBudget) {
        limitReached = true;
        completedAllLayers = false;
        break layer;
      }
      const omitted = omitNeed(state, need);
      if (omitted) {
        statesExpanded += 1;
        next.push(omitted);
      }
      for (const candidate of candidates) {
        if (statesExpanded >= stateBudget) {
          limitReached = true;
          completedAllLayers = false;
          break layer;
        }
        statesExpanded += 1;
        const fact = input.facts.get(candidate.exercise.id);
        const added = fact ? addCandidate({ state, intent: input.intent, need, candidate, result, fact }) : null;
        if (added) next.push(added);
        else prune("hard_invalid_or_admission_pruned");
      }
    }
    const deduplicated = new Map<string, WorkingState>();
    for (const state of next) {
      const signature = stateSignature(state);
      if (deduplicated.has(signature)) prune("exact_dominance_duplicate");
      else deduplicated.set(signature, state);
    }
    let retained = [...deduplicated.values()].sort((left, right) =>
      partialOrder(input.intent, input.facts, left, right) || stateSignature(left).localeCompare(stateSignature(right)),
    );
    retained = retained.filter((state, index, states) => {
      const dominated = states.some((other, otherIndex) => otherIndex !== index && paretoDominates({
        intent: input.intent,
        facts: input.facts,
        left: other,
        right: state,
      }));
      if (dominated) prune("exact_pareto_dominance");
      return !dominated;
    });
    if (mode === "bounded" && retained.length > policy.retainedParetoFrontierPerLayer) {
      const removed = retained.length - policy.retainedParetoFrontierPerLayer;
      retained = retained.slice(0, policy.retainedParetoFrontierPerLayer);
      prune("bounded_frontier_limit", removed);
      limitReached = true;
    }
    frontier = retained;
    frontierPeak = Math.max(frontierPeak, frontier.length);
    if ((!completedAllLayers && needIndex < needs.length - 1) || frontier.length === 0) break;
  }

  const reachedFinalLayer = completedAllLayers || (limitReached && frontier.some((state) =>
    state.assignments.flatMap((entry) => entry.coverage).some((entry) => entry.need.id === needs.at(-1)?.id),
  ));
  const complete = reachedFinalLayer
    ? frontier.filter((state) => completeAndValid(input.intent, state, input.facts))
    : [];
  const bestState = complete.sort((left, right) => compareSessionEvaluations(
    evaluateWorkingState({ intent: input.intent, state: left, facts: input.facts }),
    evaluateWorkingState({ intent: input.intent, state: right, facts: input.facts }),
  ))[0] ?? null;
  const optimalityProven = completedAllLayers && !limitReached;
  const completeness = bestState
    ? (optimalityProven ? "exact_optimal" : "bounded_optimality_not_proven")
    : (optimalityProven ? "exact_infeasible_proven" : "search_inconclusive_no_complete_skeleton");
  return {
    bestState,
    trace: {
      mode,
      completeness,
      statesExpanded,
      statesPruned,
      pruningReasons,
      frontierPeak,
      limitReached,
      completeValidSkeletonFound: bestState !== null,
      optimalityProven,
      expandedStateBudget: stateBudget,
      retainedFrontierPerLayer: policy.retainedParetoFrontierPerLayer,
    },
  };
}
