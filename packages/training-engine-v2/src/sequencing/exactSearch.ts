import type {
  FinalSequencingDiagnosticBestOrder,
  FinalSequencingSearchResourcePolicy,
  FinalSequencingSearchTrace,
  ProductionSequencingAssignmentFact,
  ProductionSequencingTransitionFact,
} from "./contracts";
import type { ProductionSequencingDependencyGraph } from "./dependencyGraph";
import {
  compareFinalSequencingEvaluation,
  evaluateFinalSessionSequenceOrder,
  type FinalSequencingEvaluationVector,
} from "./evaluation";
import { PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE } from "./policies";

export interface ExactFinalSequencingSearchResult {
  readonly status: "exact_optimal" | "search_inconclusive" | "ordering_infeasible";
  readonly order: readonly ProductionSequencingAssignmentFact[] | null;
  readonly diagnosticBestOrder: FinalSequencingDiagnosticBestOrder | null;
  readonly trace: FinalSequencingSearchTrace;
}

export function searchExactFinalSessionSequence(input: {
  readonly facts: readonly ProductionSequencingAssignmentFact[];
  readonly graph: ProductionSequencingDependencyGraph;
  readonly possibleTransitions: readonly ProductionSequencingTransitionFact[];
  readonly resourcePolicy: FinalSequencingSearchResourcePolicy;
}): ExactFinalSequencingSearchResult {
  const byId = new Map(input.facts.map((fact) => [fact.assignmentId, fact]));
  const sectionIndex = new Map(PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE.map((section, index) => [section, index]));
  let statesExpanded = 0;
  let statesPruned = 0;
  let legalCompleteOrdersEvaluated = 0;
  let limitReached = false;
  let bestOrder: readonly ProductionSequencingAssignmentFact[] | null = null;
  let bestEvaluation: FinalSequencingEvaluationVector | null = null;

  const visit = (orderedIds: readonly string[], selected: ReadonlySet<string>): void => {
    if (limitReached) return;
    if (orderedIds.length === input.facts.length) {
      if (legalCompleteOrdersEvaluated >= input.resourcePolicy.maximumLegalCompleteOrdersEvaluated) {
        limitReached = true;
        return;
      }
      legalCompleteOrdersEvaluated += 1;
      const order = orderedIds.map((id) => byId.get(id)!);
      const evaluation = evaluateFinalSessionSequenceOrder({
        order,
        possibleTransitions: input.possibleTransitions,
      });
      if (!bestEvaluation || compareFinalSequencingEvaluation(evaluation, bestEvaluation) < 0) {
        bestOrder = order;
        bestEvaluation = evaluation;
      }
      return;
    }
    if (statesExpanded >= input.resourcePolicy.maximumStatesExpanded) {
      limitReached = true;
      return;
    }
    statesExpanded += 1;
    const remaining = input.facts.filter((fact) => !selected.has(fact.assignmentId));
    const minimumRemainingSection = Math.min(...remaining.map((fact) => sectionIndex.get(fact.section) ?? 99));
    const available = remaining.filter((fact) =>
      (sectionIndex.get(fact.section) ?? 99) === minimumRemainingSection &&
      [...(input.graph.incomingByAssignmentId.get(fact.assignmentId) ?? [])]
        .every((dependencyId) => selected.has(dependencyId))
    ).sort((left, right) => left.assignmentId.localeCompare(right.assignmentId));
    statesPruned += remaining.length - available.length;
    for (const next of available) {
      visit([...orderedIds, next.assignmentId], new Set([...selected, next.assignmentId]));
      if (limitReached) return;
    }
  };

  if (input.graph.acyclic) visit([], new Set());
  const trace: FinalSequencingSearchTrace = {
    mode: "exact_only",
    resourcePolicyRef: {
      policyId: input.resourcePolicy.policyId,
      version: input.resourcePolicy.version,
    },
    statesExpanded,
    statesPruned,
    legalCompleteOrdersEvaluated,
    limitReached,
    optimalityProven: !limitReached && bestOrder !== null,
    pruningReasonCounts: { HARD_SECTION_OR_DEPENDENCY_NOT_AVAILABLE: statesPruned },
    canonicalExpansionOrderApplied: true,
  };
  if (limitReached) {
    return {
      status: "search_inconclusive",
      order: null,
      diagnosticBestOrder: bestOrder ? {
        assignmentIds: (bestOrder as readonly ProductionSequencingAssignmentFact[]).map((fact) => fact.assignmentId),
        executable: false,
        optimalityProven: false,
      } : null,
      trace,
    };
  }
  if (!bestOrder) return { status: "ordering_infeasible", order: null, diagnosticBestOrder: null, trace };
  return { status: "exact_optimal", order: bestOrder, diagnosticBestOrder: null, trace };
}
