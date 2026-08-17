import { uniqueSorted } from "../prescription/compiler/utilities";
import type {
  SessionPracticeAssignmentFacts,
  SessionPracticeDependencyDisposition,
} from "./contracts";

export interface SessionPracticeDependencyPruningResult {
  readonly retainedAssignmentIds: readonly string[];
  readonly prunedAssignmentIds: readonly string[];
  readonly dispositions: readonly SessionPracticeDependencyDisposition[];
  readonly requiredDependencyViolationIds: readonly string[];
}

export function pruneOrphanSessionPracticeDependencies(input: {
  readonly facts: readonly SessionPracticeAssignmentFacts[];
  readonly initiallyRetainedAssignmentIds: readonly string[];
}): SessionPracticeDependencyPruningResult {
  const retained = new Set(input.initiallyRetainedAssignmentIds);
  const factById = new Map(input.facts.map((fact) => [fact.assignmentId, fact]));
  const pruned = new Set<string>();
  let changed = true;

  while (changed) {
    changed = false;
    for (const fact of input.facts) {
      if (!retained.has(fact.assignmentId) ||
          !["warmup", "activation"].includes(fact.assignment.section) ||
          fact.independentlyActiveSupport) continue;
      const retainedDependents = fact.dependentAssignmentIds.filter((id) => retained.has(id));
      if (fact.dependentAssignmentIds.length > 0 && retainedDependents.length === 0) {
        retained.delete(fact.assignmentId);
        pruned.add(fact.assignmentId);
        changed = true;
      }
    }
  }

  const violations: string[] = [];
  for (const assignmentId of retained) {
    const fact = factById.get(assignmentId);
    for (const dependencyId of fact?.dependencyAssignmentIds ?? []) {
      if (!retained.has(dependencyId)) violations.push(`${assignmentId}:${dependencyId}`);
    }
  }

  const dispositions = input.facts
    .filter((fact) => fact.dependentAssignmentIds.length > 0 ||
      ["warmup", "activation"].includes(fact.assignment.section))
    .map((fact): SessionPracticeDependencyDisposition => {
      const retainedDependents = fact.dependentAssignmentIds.filter((id) => retained.has(id));
      const state = pruned.has(fact.assignmentId) ? "pruned_orphan" :
        retained.has(fact.assignmentId) && retainedDependents.length > 0 ? "retained_required" :
          retained.has(fact.assignmentId) && fact.independentlyActiveSupport ? "retained_independent" :
            "not_applicable";
      return Object.freeze({
        dependencyAssignmentId: fact.assignmentId,
        dependentAssignmentIds: Object.freeze(uniqueSorted(fact.dependentAssignmentIds)),
        state,
        reasonCodes: Object.freeze([state === "pruned_orphan" ? "ORPHAN_DEPENDENCY_PRUNED" :
          state === "retained_required" ? "DEPENDENCY_REQUIRED_BY_RETAINED_ASSIGNMENT" :
            state === "retained_independent" ? "SUPPORT_HAS_INDEPENDENT_ACTIVE_NEED" :
              "ASSIGNMENT_NOT_ACTIVE_DEPENDENCY"]),
      });
    });

  return Object.freeze({
    retainedAssignmentIds: Object.freeze([...retained].sort()),
    prunedAssignmentIds: Object.freeze([...pruned].sort()),
    dispositions: Object.freeze(dispositions),
    requiredDependencyViolationIds: Object.freeze(uniqueSorted(violations)),
  });
}
