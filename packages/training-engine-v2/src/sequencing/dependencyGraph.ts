import type {
  FinalSessionSequencingValidationFinding,
  ProductionSequencingAssignmentFact,
} from "./contracts";
import { PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE } from "./policies";

export interface ProductionSequencingDependencyGraph {
  readonly nodes: readonly string[];
  readonly incomingByAssignmentId: ReadonlyMap<string, ReadonlySet<string>>;
  readonly outgoingByAssignmentId: ReadonlyMap<string, ReadonlySet<string>>;
  readonly acyclic: boolean;
  readonly findings: readonly FinalSessionSequencingValidationFinding[];
}

export function buildProductionSequencingDependencyGraph(
  facts: readonly ProductionSequencingAssignmentFact[],
): ProductionSequencingDependencyGraph {
  const nodes = facts.map((fact) => fact.assignmentId).sort();
  const known = new Set(nodes);
  const incoming = new Map(nodes.map((id) => [id, new Set<string>()]));
  const outgoing = new Map(nodes.map((id) => [id, new Set<string>()]));
  const findings: FinalSessionSequencingValidationFinding[] = [];
  const sectionIndex = new Map(PRODUCTION_FINAL_SESSION_SECTION_PRECEDENCE.map((section, index) => [section, index]));
  const factById = new Map(facts.map((fact) => [fact.assignmentId, fact]));
  for (const fact of facts) {
    for (const dependencyId of fact.dependencyAssignmentIds) {
      if (!known.has(dependencyId)) {
        findings.push({ severity: "error", code: "DEPENDENCY_REFERENCES_UNKNOWN_ASSIGNMENT", targetId: dependencyId });
        continue;
      }
      if (dependencyId === fact.assignmentId) {
        findings.push({ severity: "error", code: "SELF_DEPENDENCY", targetId: fact.assignmentId });
        continue;
      }
      incoming.get(fact.assignmentId)!.add(dependencyId);
      outgoing.get(dependencyId)!.add(fact.assignmentId);
      const before = factById.get(dependencyId)!;
      if ((sectionIndex.get(before.section) ?? 99) > (sectionIndex.get(fact.section) ?? -1)) {
        findings.push({ severity: "error", code: "DEPENDENCY_CONTRADICTS_SECTION_PRECEDENCE", targetId: fact.assignmentId });
      }
    }
  }
  const indegree = new Map(nodes.map((id) => [id, incoming.get(id)!.size]));
  const available = nodes.filter((id) => indegree.get(id) === 0);
  let visited = 0;
  while (available.length > 0) {
    const id = available.shift()!;
    visited += 1;
    for (const target of [...outgoing.get(id)!].sort()) {
      const next = (indegree.get(target) ?? 0) - 1;
      indegree.set(target, next);
      if (next === 0) available.push(target);
    }
    available.sort();
  }
  const acyclic = visited === nodes.length;
  if (!acyclic) findings.push({ severity: "error", code: "ORDERING_DEPENDENCY_CYCLE" });
  return {
    nodes,
    incomingByAssignmentId: incoming,
    outgoingByAssignmentId: outgoing,
    acyclic,
    findings,
  };
}
