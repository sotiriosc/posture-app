import type { CandidateRankingResult, RankedCandidate } from "../candidate";
import { SESSION_SECTIONS, type SessionIntent } from "../domain/session";
import { validateSessionCandidateResults, SessionComposerInputError } from "./candidatePools";
import { deriveCanonicalCompositionFacts } from "./compositionFacts";
import type {
  CanonicalCompositionFact,
  SessionCompositionRequest,
  SessionCompositionTrace,
  SessionExecutionReadiness,
  SessionExerciseAssignment,
  SessionInfeasibilityTrace,
  SessionNeedSatisfaction,
  SessionSearchTrace,
  SessionSkeleton,
} from "./contracts";
import { evaluatePotentialConcentration, evaluateWorkingState, orderedNeeds } from "./evaluation";
import type { WorkingAssignment, WorkingState } from "./internal";
import { evaluateSessionRedundancy } from "./redundancy";
import { searchSessionSkeleton } from "./search";
import {
  buildOrderingConstraints,
  orderingGraphAcyclic,
  validateDependencyGraph,
} from "./validity";

function requirementIds(candidate: RankedCandidate): readonly string[] {
  return candidate.painExecutionReadiness.applicableRequirements.map((requirement) =>
    `${requirement.signalId}:${requirement.requestedAction}`,
  ).sort();
}

function emptySections() {
  return SESSION_SECTIONS.map((section) => ({
    section,
    assignmentExerciseIds: [],
    emptyReasonCode: `no_selected_${section}_need`,
  }));
}

function emptyTrace(): SessionCompositionTrace {
  return {
    selectedReasonCodesByExercise: {},
    omittedNeedReasonCodes: {},
    excludedHighRankedCandidateIds: [],
    emptySectionReasonCodes: Object.fromEntries(
      SESSION_SECTIONS.map((section) => [section, `no_selected_${section}_need`]),
    ) as SessionCompositionTrace["emptySectionReasonCodes"],
  };
}

function noSearchTrace(completeness: SessionSearchTrace["completeness"]): SessionSearchTrace {
  return {
    mode: "exhaustive",
    completeness,
    statesExpanded: 0,
    statesPruned: 0,
    pruningReasons: {},
    frontierPeak: 0,
    limitReached: false,
    completeValidSkeletonFound: false,
    optimalityProven: completeness === "exact_infeasible_proven",
    expandedStateBudget: 0,
    retainedFrontierPerLayer: 0,
  };
}

function candidatePools(results: Readonly<Record<string, CandidateRankingResult>>) {
  return Object.fromEntries(Object.entries(results).map(([needId, result]) => [
    needId,
    result.rankedCandidates.map((entry) => entry.exercise.id),
  ]));
}

function infeasibility(input: {
  readonly intent: SessionIntent;
  readonly results: Readonly<Record<string, CandidateRankingResult>>;
  readonly unsatisfiedRequiredNeedIds?: readonly string[];
  readonly unsatisfiedRequiredDependencyIds?: readonly string[];
  readonly inputErrorCodes?: readonly string[];
  readonly safetyBlockerSignalIds?: readonly string[];
  readonly contradictoryIntent?: boolean;
}): SessionInfeasibilityTrace {
  return {
    unsatisfiedRequiredNeedIds: input.unsatisfiedRequiredNeedIds ?? [],
    unsatisfiedRequiredDependencyIds: input.unsatisfiedRequiredDependencyIds ?? [],
    inputErrorCodes: input.inputErrorCodes ?? [],
    candidatePoolExerciseIdsByNeed: candidatePools(input.results),
    hardRejectionReasonCodes: [...new Set(Object.values(input.results).flatMap((result) =>
      result.hardRejectedCandidates.flatMap((candidate) =>
        candidate.eligibility.rejectionReasons.map((reason) => reason.code),
      ),
    ))].sort(),
    equipmentGapIds: [...new Set(Object.values(input.results).flatMap((result) =>
      result.hardRejectedCandidates.flatMap((candidate) =>
        candidate.eligibility.rejectionReasons
          .filter((reason) => reason.code === "EQUIPMENT_UNAVAILABLE" || reason.code === "SETUP_IMPOSSIBLE")
          .flatMap((reason) => reason.evidence),
      ),
    ))].sort(),
    safetyBlockerSignalIds: input.safetyBlockerSignalIds ?? [],
    contradictoryIntent: input.contradictoryIntent ?? false,
  };
}

function emptyResult(input: {
  readonly intent: SessionIntent;
  readonly results: Readonly<Record<string, CandidateRankingResult>>;
  readonly compositionStatus: SessionSkeleton["compositionStatus"];
  readonly executionReadiness?: SessionExecutionReadiness;
  readonly search: SessionSearchTrace;
  readonly infeasibility: SessionInfeasibilityTrace | null;
}): SessionSkeleton {
  return {
    sessionIntentId: input.intent.id,
    compositionStatus: input.compositionStatus,
    executionReadiness: input.executionReadiness ?? "executable_at_session_scope",
    sections: emptySections(),
    assignments: [],
    needSatisfaction: input.intent.needs.map((need) => ({
      needId: need.id,
      covered: false,
      exerciseId: null,
      coverageKind: "omitted",
      reasonCode: input.compositionStatus === "blocked_by_training_readiness"
        ? "blocked_by_training_readiness"
        : "required_or_active_need_unsatisfied",
    })),
    orderingConstraints: [],
    evaluation: null,
    redundancy: [],
    concentration: [],
    search: input.search,
    trace: emptyTrace(),
    infeasibility: input.infeasibility,
  };
}

function assignmentFromWorking(input: {
  readonly assignment: WorkingAssignment;
  readonly intent: SessionIntent;
}): SessionExerciseAssignment {
  const identity = input.intent.continuityEvidence.identities.find((entry) =>
    entry.exerciseId === input.assignment.exerciseId,
  );
  const reviewIds = input.assignment.coverage.flatMap((coverage) =>
    coverage.candidate.painExecutionReadiness.readiness === "REQUIRES_CANDIDATE_REVIEW"
      ? requirementIds(coverage.candidate)
      : [],
  );
  const prescriptionIds = input.assignment.coverage.flatMap((coverage) =>
    coverage.candidate.painExecutionReadiness.readiness === "REQUIRES_PRESCRIPTION"
      ? requirementIds(coverage.candidate)
      : [],
  );
  const priorities = new Set(input.assignment.coverage.map((entry) => entry.need.priority));
  const reasons = [
    ...(priorities.has("required") ? ["covers_required_need"] : []),
    ...(priorities.has("preferred") ? ["covers_preferred_need"] : []),
    ...(priorities.has("optional") ? ["unique_optional_marginal_value"] : []),
    ...(input.assignment.coverage.length > 1 ? ["truthful_shared_multi_need_coverage"] : []),
    ...(identity?.productive ? ["productive_anchor_retained"] : []),
  ];
  return {
    exerciseId: input.assignment.exerciseId,
    section: input.assignment.section,
    role: input.assignment.role,
    satisfiedNeedIds: input.assignment.coverage.map((entry) => entry.need.id).sort(),
    candidateEvidenceByNeed: input.assignment.coverage.map((coverage) => ({
      needId: coverage.need.id,
      requestId: coverage.requestId,
      candidateRank: coverage.candidate.rank,
      candidateExerciseId: coverage.candidate.exercise.id,
      painReadiness: coverage.candidate.painExecutionReadiness.readiness,
    })).sort((left, right) => left.needId.localeCompare(right.needId)),
    continuityClassification: identity?.observationalClassification ?? "none",
    continuityEvidenceRefs: identity?.responseReceiverTraceRefs ?? [],
    unresolvedCandidateReviewIds: [...new Set(reviewIds)].sort(),
    executionBlockingPrescriptionRequirementIds: [...new Set(prescriptionIds)].sort(),
    routinePrescriptionHandoffId: `${input.intent.id}:${input.assignment.exerciseId}:prescription-handoff`,
    bestExecutableFallbackExerciseId: input.assignment.coverage
      .map((entry) => entry.bestExecutableFallbackExerciseId)
      .find((entry) => entry && entry !== input.assignment.exerciseId) ?? null,
    marginalValueReasonCodes: reasons,
    futureSourceExposureCount: 1,
  };
}

function executionReadiness(assignments: readonly SessionExerciseAssignment[]): SessionExecutionReadiness {
  const review = assignments.some((entry) => entry.unresolvedCandidateReviewIds.length > 0);
  const prescription = assignments.some((entry) =>
    entry.executionBlockingPrescriptionRequirementIds.length > 0,
  );
  if (review && prescription) return "candidate_review_and_prescription_required";
  if (review) return "candidate_review_required";
  if (prescription) return "prescription_resolution_required";
  return "executable_at_session_scope";
}

function needSatisfaction(intent: SessionIntent, state: WorkingState): readonly SessionNeedSatisfaction[] {
  return orderedNeeds(intent).map((need) => {
    const assignment = state.assignments.find((entry) =>
      entry.coverage.some((coverage) => coverage.need.id === need.id),
    );
    if (!assignment) return {
      needId: need.id,
      covered: false,
      exerciseId: null,
      coverageKind: "omitted" as const,
      reasonCode: need.priority === "preferred"
        ? "preferred_omitted_by_structural_or_higher_order_policy"
        : "optional_not_admitted_or_no_positive_marginal_value",
    };
    return {
      needId: need.id,
      covered: true,
      exerciseId: assignment.exerciseId,
      coverageKind: assignment.coverage.length > 1 ? "shared" as const : "standalone" as const,
      reasonCode: assignment.coverage.length > 1
        ? "truthful_shared_multi_need_coverage"
        : "standalone_need_coverage",
    };
  });
}

function requiredStructuralGaps(
  intent: SessionIntent,
  results: Readonly<Record<string, CandidateRankingResult>>,
): readonly string[] {
  return intent.needs
    .filter((need) => need.priority === "required")
    .filter((need) => results[need.id].rankedCandidates.every((candidate) => [
      "URGENT_EXTERNAL_REVIEW",
      "REQUIRES_SESSION_ROLE_SUBSTITUTION",
    ].includes(candidate.painExecutionReadiness.readiness)))
    .map((need) => need.id);
}

export function composeSessionSkeleton(request: SessionCompositionRequest): SessionSkeleton {
  const consistency = validateSessionCandidateResults(request.intent, request.candidateResultsByNeed);
  if (!consistency.valid) throw new SessionComposerInputError(consistency.errorCodes);
  const readiness = Object.values(request.candidateResultsByNeed)[0]?.trainingReadiness;
  if (readiness && !readiness.downstreamTrainingAllowed) {
    return emptyResult({
      intent: request.intent,
      results: request.candidateResultsByNeed,
      compositionStatus: "blocked_by_training_readiness",
      search: noSearchTrace("exact_infeasible_proven"),
      infeasibility: infeasibility({
        intent: request.intent,
        results: request.candidateResultsByNeed,
        safetyBlockerSignalIds: readiness.unresolvedSignalIds,
      }),
    });
  }
  const graph = validateDependencyGraph(request.intent);
  const requiredGaps = requiredStructuralGaps(request.intent, request.candidateResultsByNeed);
  if (!graph.acyclic || requiredGaps.length > 0) {
    return emptyResult({
      intent: request.intent,
      results: request.candidateResultsByNeed,
      compositionStatus: "infeasible",
      search: noSearchTrace("exact_infeasible_proven"),
      infeasibility: infeasibility({
        intent: request.intent,
        results: request.candidateResultsByNeed,
        unsatisfiedRequiredNeedIds: requiredGaps,
        unsatisfiedRequiredDependencyIds: graph.cycleNeedIds,
        contradictoryIntent: !graph.acyclic,
      }),
    });
  }
  const facts = deriveCanonicalCompositionFacts({
    candidateResultsByNeed: request.candidateResultsByNeed,
    continuity: request.intent.continuityEvidence,
  });
  const outcome = searchSessionSkeleton({
    intent: request.intent,
    candidateResultsByNeed: request.candidateResultsByNeed,
    facts,
    policy: request.searchPolicy,
  });
  if (!outcome.bestState) {
    const proven = outcome.trace.completeness === "exact_infeasible_proven";
    return emptyResult({
      intent: request.intent,
      results: request.candidateResultsByNeed,
      compositionStatus: proven ? "infeasible" : "search_inconclusive",
      search: outcome.trace,
      infeasibility: proven ? infeasibility({
        intent: request.intent,
        results: request.candidateResultsByNeed,
        unsatisfiedRequiredNeedIds: request.intent.needs
          .filter((need) => need.priority === "required")
          .map((need) => need.id),
      }) : null,
    });
  }
  return buildValidSkeleton(request.intent, request.candidateResultsByNeed, facts, outcome.bestState, outcome.trace);
}

export function composeSessionSkeletonExhaustive(
  request: Omit<SessionCompositionRequest, "searchPolicy">,
): SessionSkeleton {
  const consistency = validateSessionCandidateResults(request.intent, request.candidateResultsByNeed);
  if (!consistency.valid) throw new SessionComposerInputError(consistency.errorCodes);
  const facts = deriveCanonicalCompositionFacts({
    candidateResultsByNeed: request.candidateResultsByNeed,
    continuity: request.intent.continuityEvidence,
  });
  const outcome = searchSessionSkeleton({
    intent: request.intent,
    candidateResultsByNeed: request.candidateResultsByNeed,
    facts,
    forceMode: "exhaustive",
  });
  if (!outcome.bestState) return emptyResult({
    intent: request.intent,
    results: request.candidateResultsByNeed,
    compositionStatus: "infeasible",
    search: outcome.trace,
    infeasibility: infeasibility({ intent: request.intent, results: request.candidateResultsByNeed }),
  });
  return buildValidSkeleton(request.intent, request.candidateResultsByNeed, facts, outcome.bestState, outcome.trace);
}

function buildValidSkeleton(
  intent: SessionIntent,
  results: Readonly<Record<string, CandidateRankingResult>>,
  facts: ReadonlyMap<string, CanonicalCompositionFact>,
  state: WorkingState,
  search: SessionSearchTrace,
): SessionSkeleton {
  const assignments = state.assignments.map((assignment) => assignmentFromWorking({ assignment, intent }));
  const exerciseIdByNeed = new Map(state.assignments.flatMap((assignment) =>
    assignment.coverage.map((coverage) => [coverage.need.id, assignment.exerciseId] as const),
  ));
  const orderingConstraints = buildOrderingConstraints({ intent, exerciseIdByNeed, facts });
  if (!orderingGraphAcyclic(orderingConstraints)) {
    throw new SessionComposerInputError(["cyclic_assignment_ordering_constraints"]);
  }
  const sections = SESSION_SECTIONS.map((section) => {
    const ids = assignments.filter((entry) => entry.section === section)
      .map((entry) => entry.exerciseId).sort();
    return {
      section,
      assignmentExerciseIds: ids,
      emptyReasonCode: ids.length === 0 ? `no_selected_${section}_need` : null,
    };
  });
  const satisfaction = needSatisfaction(intent, state);
  const selectedIds = new Set(assignments.map((entry) => entry.exerciseId));
  const excludedHighRankedCandidateIds = Object.values(results)
    .flatMap((result) => result.rankedCandidates.slice(0, 1))
    .map((candidate) => candidate.exercise.id)
    .filter((id) => !selectedIds.has(id));
  const omitted = Object.fromEntries(satisfaction.filter((entry) => !entry.covered)
    .map((entry) => [entry.needId, entry.reasonCode]));
  return {
    sessionIntentId: intent.id,
    compositionStatus: "valid",
    executionReadiness: executionReadiness(assignments),
    sections,
    assignments,
    needSatisfaction: satisfaction,
    orderingConstraints,
    evaluation: evaluateWorkingState({ intent, state, facts }),
    redundancy: evaluateSessionRedundancy(state.assignments, facts),
    concentration: evaluatePotentialConcentration(state.assignments, facts),
    search,
    trace: {
      selectedReasonCodesByExercise: Object.fromEntries(assignments.map((assignment) => [
        assignment.exerciseId,
        assignment.marginalValueReasonCodes,
      ])),
      omittedNeedReasonCodes: omitted,
      excludedHighRankedCandidateIds: [...new Set(excludedHighRankedCandidateIds)].sort(),
      emptySectionReasonCodes: Object.fromEntries(sections.map((section) => [
        section.section,
        section.emptyReasonCode,
      ])) as SessionCompositionTrace["emptySectionReasonCodes"],
    },
    infeasibility: null,
  };
}
