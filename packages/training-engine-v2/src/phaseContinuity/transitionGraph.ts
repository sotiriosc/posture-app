import type { PhaseId } from "../domain/phase";

export const PRODUCTION_PHASE_TRANSITION_GRAPH = Object.freeze({
  legalStayEdges: Object.freeze(["phase_1->phase_1", "phase_2->phase_2", "phase_3->phase_3"]),
  legalAdjacentAdvancementEdges: Object.freeze(["phase_1->phase_2", "phase_2->phase_3"]),
  nonAdjacentAdvancementResult: "NON_ADJACENT_PHASE_TRANSITION_NOT_AUTHORIZED",
  backwardMovementResult: "PHASE_REGRESSION_REVIEW_REQUIRED",
  phase3CompletionResult: "PHASE_CYCLE_COMPLETION_OWNER_REVIEW_REQUIRED",
  automaticCycleReset: false,
} as const);

const order: Readonly<Record<PhaseId, number>> = Object.freeze({ phase_1: 1, phase_2: 2, phase_3: 3 });

export function classifyProductionPhaseTransition(current: PhaseId, target: PhaseId) {
  if (current === target) return "stay" as const;
  if (order[target] === order[current] + 1) return "adjacent_advancement" as const;
  if (order[target] < order[current]) return "regression_review" as const;
  return "non_adjacent_not_authorized" as const;
}
