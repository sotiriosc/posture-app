import type { CandidateRankingResult, RankedCandidate } from "../candidate";
import type { ExerciseSelectionNeed } from "../domain/exerciseSelectionNeed";
import type { SessionIntent, SessionNeed, SessionNeedDependency } from "../domain/session";
import type { CanonicalCompositionFact, SessionOrderingConstraint } from "./contracts";

export function candidateTruthfullyCoversNeed(input: {
  readonly candidate: RankedCandidate;
  readonly fact: CanonicalCompositionFact;
  readonly need: SessionNeed;
  readonly result: CandidateRankingResult;
}): boolean {
  const { candidate, fact, need, result } = input;
  if (!candidate.eligibility.legal || candidate.exercise.id !== fact.exerciseId) return false;
  if (result.request.need.id !== need.id) return false;
  if (result.request.need.requestedSection !== need.section) return false;
  if (result.request.need.requestedRole !== need.selection.requestedRole) return false;
  if (!fact.legalSections.includes(need.section)) return false;
  if (!fact.legalRoles.includes(need.selection.requestedRole)) return false;
  if (
    need.selection.targetMovementRoles.length > 0 &&
    !need.selection.targetMovementRoles.some((role) => fact.movementRoles.includes(role))
  ) return false;
  if (
    need.selection.targetActionFunctions.length > 0 &&
    !need.selection.targetActionFunctions.some((action) => fact.actionFunctions.includes(action))
  ) return false;
  if (!muscleTruthMatches(need.selection, candidate)) return false;
  return true;
}

function muscleTruthMatches(
  selection: ExerciseSelectionNeed,
  candidate: RankedCandidate,
): boolean {
  if (selection.targetMuscles.length === 0) return true;
  const primary = new Set(candidate.exercise.primaryMuscles);
  const meaningful = new Set(candidate.exercise.muscleContributions
    .filter((entry) => ["primary_target", "key_secondary_target"].includes(entry.relationship))
    .map((entry) => entry.muscle));
  if (selection.muscleRequirement === "primary_required") {
    return selection.targetMuscles.some((muscle) => primary.has(muscle));
  }
  if (selection.muscleRequirement === "primary_preferred") {
    return selection.targetMuscles.some((muscle) => primary.has(muscle)) ||
      selection.targetMuscles.some((muscle) => meaningful.has(muscle));
  }
  return selection.targetMuscles.some((muscle) => meaningful.has(muscle));
}

export function validateDependencyGraph(intent: SessionIntent): {
  readonly acyclic: boolean;
  readonly cycleNeedIds: readonly string[];
} {
  const edges = new Map<string, Set<string>>();
  for (const need of intent.needs) {
    edges.set(need.id, new Set(need.dependencies.flatMap((dependency) => dependency.targetNeedIds)));
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const cycle = new Set<string>();
  const walk = (id: string): void => {
    if (visiting.has(id)) {
      cycle.add(id);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const next of edges.get(id) ?? []) {
      if (edges.has(next)) walk(next);
      if (cycle.has(next)) cycle.add(id);
    }
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of edges.keys()) walk(id);
  return { acyclic: cycle.size === 0, cycleNeedIds: [...cycle].sort() };
}

export function buildOrderingConstraints(input: {
  readonly intent: SessionIntent;
  readonly exerciseIdByNeed: ReadonlyMap<string, string>;
  readonly facts: ReadonlyMap<string, CanonicalCompositionFact>;
}): readonly SessionOrderingConstraint[] {
  const constraints = new Map<string, SessionOrderingConstraint>();
  for (const need of input.intent.needs) {
    const beforeExerciseId = input.exerciseIdByNeed.get(need.id);
    if (!beforeExerciseId) continue;
    for (const dependency of need.dependencies) {
      for (const afterExerciseId of dependencyTargetExerciseIds({
        dependency,
        intent: input.intent,
        exerciseIdByNeed: input.exerciseIdByNeed,
        facts: input.facts,
      })) {
        if (!afterExerciseId || afterExerciseId === beforeExerciseId) continue;
        const key = `${beforeExerciseId}>${afterExerciseId}`;
        const prior = constraints.get(key);
        constraints.set(key, {
          beforeExerciseId,
          afterExerciseId,
          dependencyIds: [...new Set([...(prior?.dependencyIds ?? []), dependency.dependencyId])].sort(),
        });
      }
    }
  }
  return [...constraints.values()].sort((left, right) =>
    left.beforeExerciseId.localeCompare(right.beforeExerciseId) ||
    left.afterExerciseId.localeCompare(right.afterExerciseId),
  );
}

function overlaps(left: readonly string[], right: readonly string[]): boolean {
  const rightSet = new Set(right);
  return left.some((entry) => rightSet.has(entry));
}

export function dependencyTargetExerciseIds(input: {
  readonly dependency: SessionNeedDependency;
  readonly intent: SessionIntent;
  readonly exerciseIdByNeed: ReadonlyMap<string, string>;
  readonly facts: ReadonlyMap<string, CanonicalCompositionFact>;
}): readonly string[] {
  const selectedExerciseIds = [...new Set(input.exerciseIdByNeed.values())];
  const targets = new Set(input.dependency.targetNeedIds
    .map((needId) => input.exerciseIdByNeed.get(needId))
    .filter((exerciseId): exerciseId is string => Boolean(exerciseId)));
  for (const exerciseId of selectedExerciseIds) {
    if (input.dependency.targetExerciseIds.includes(exerciseId)) targets.add(exerciseId);
  }
  const hasIdentityTarget = input.dependency.targetNeedIds.length > 0 ||
    input.dependency.targetExerciseIds.length > 0;
  if (!hasIdentityTarget) {
    for (const exerciseId of selectedExerciseIds) {
      const fact = input.facts.get(exerciseId);
      if (!fact) continue;
      if (overlaps(input.dependency.movementRoles, fact.movementRoles) ||
        overlaps(input.dependency.actionFunctions, fact.actionFunctions) ||
        overlaps(input.dependency.bodyRegions, fact.bodyRegions)) {
        targets.add(exerciseId);
      }
    }
  }
  const contextualTargetActive =
    overlaps(input.dependency.assessmentSignalIds, input.intent.assessmentContextRefs) ||
    overlaps(input.dependency.painResponseRequirementIds, input.intent.painResponseContextRefs) ||
    (input.dependency.rangeRequirements?.length ?? 0) > 0 ||
    (input.dependency.requiredRangeIds?.length ?? 0) > 0;
  if (!hasIdentityTarget && targets.size === 0 && contextualTargetActive) {
    for (const exerciseId of selectedExerciseIds) targets.add(exerciseId);
  }
  return [...targets].sort();
}

export function orderingGraphAcyclic(
  constraints: readonly SessionOrderingConstraint[],
): boolean {
  const edges = new Map<string, Set<string>>();
  for (const edge of constraints) {
    if (!edges.has(edge.beforeExerciseId)) edges.set(edge.beforeExerciseId, new Set());
    edges.get(edge.beforeExerciseId)!.add(edge.afterExerciseId);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const walk = (id: string): boolean => {
    if (visiting.has(id)) return false;
    if (visited.has(id)) return true;
    visiting.add(id);
    for (const next of edges.get(id) ?? []) if (!walk(next)) return false;
    visiting.delete(id);
    visited.add(id);
    return true;
  };
  return [...edges.keys()].every(walk);
}
