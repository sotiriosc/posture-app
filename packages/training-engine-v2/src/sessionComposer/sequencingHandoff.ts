import { SESSION_SECTIONS } from "../domain/session";
import type { SessionSequencingInput, SessionSkeleton } from "./contracts";
import { orderingGraphAcyclic } from "./validity";

export function buildSessionSequencingInput(
  skeleton: SessionSkeleton,
): SessionSequencingInput {
  return {
    assignments: skeleton.assignments,
    fixedSectionPrecedence: SESSION_SECTIONS,
    orderingConstraints: skeleton.orderingConstraints,
    fatigueStressPotential: skeleton.concentration,
    unresolvedExecutionReadiness: skeleton.executionReadiness,
    graphAcyclic: orderingGraphAcyclic(skeleton.orderingConstraints),
  };
}
