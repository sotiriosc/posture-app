import type { SessionNeed, SessionNeedPriority } from "../domain/session";
import type { NormalizedPlannerNeed, PlannerMergedNeedTrace } from "./contracts";

const PRIORITY_RANK: Readonly<Record<SessionNeedPriority, number>> = {
  required: 0,
  preferred: 1,
  optional: 2,
};

function unique<T extends string>(values: readonly T[]): readonly T[] {
  return [...new Set(values)].sort();
}

function equivalenceKey(need: SessionNeed): string {
  return JSON.stringify({
    section: need.section,
    role: need.selection.requestedRole,
    movements: [...need.selection.targetMovementRoles].sort(),
    actions: [...need.selection.targetActionFunctions].sort(),
    muscles: [...need.selection.targetMuscles].sort(),
    muscleRequirement: need.selection.muscleRequirement,
    regions: [...need.selection.targetBodyRegions].sort(),
  });
}

function mergeGroup(group: readonly NormalizedPlannerNeed[]): NormalizedPlannerNeed {
  if (group.length === 1) return group[0];
  const ordered = [...group].sort((left, right) =>
    PRIORITY_RANK[left.need.priority] - PRIORITY_RANK[right.need.priority] ||
    left.need.priorityOrder - right.need.priorityOrder || left.need.id.localeCompare(right.need.id));
  const first = ordered[0];
  const sourceNeedIds = unique(ordered.flatMap((entry) => entry.sourceNeedIds));
  const objectiveIds = unique(ordered.flatMap((entry) => entry.objectiveIds));
  const sourceEvidence = ordered.flatMap((entry) => entry.need.sourceEvidence)
    .filter((entry, index, all) => all.findIndex((candidate) =>
      candidate.sourceKind === entry.sourceKind && candidate.sourceId === entry.sourceId &&
      JSON.stringify(candidate.evidenceRefs) === JSON.stringify(entry.evidenceRefs)) === index);
  const dependencies = ordered.flatMap((entry) => entry.need.dependencies)
    .filter((entry, index, all) => all.findIndex((candidate) => candidate.dependencyId === entry.dependencyId) === index);
  return {
    objectiveIds,
    sourceNeedIds,
    need: {
      ...first.need,
      id: first.need.id,
      sourceEvidence,
      dependencies,
      relevantPainResponseRequirementRefs: unique(ordered.flatMap((entry) =>
        entry.need.relevantPainResponseRequirementRefs ?? [])),
      plannerProvenance: {
        objectiveIds,
        owner: "session_intent_planner_need_merge",
        transformationRuleId: "structured_equivalent_need_truth_merge",
        sourceEvidenceRefs: unique(ordered.flatMap((entry) => entry.need.plannerProvenance?.sourceEvidenceRefs ?? [])),
        assessmentSignalRefs: unique(ordered.flatMap((entry) => entry.need.plannerProvenance?.assessmentSignalRefs ?? [])),
        dependencyRefs: unique(dependencies.map((entry) => entry.dependencyId)),
        mergeHistory: sourceNeedIds,
        priorityOrigin: first.need.plannerProvenance?.priorityOrigin ?? first.need.id,
        sectionRoleMappingOrigin: first.need.plannerProvenance?.sectionRoleMappingOrigin ?? first.need.id,
        standaloneAdmissionOrigin: first.need.plannerProvenance?.standaloneAdmissionOrigin ?? first.need.id,
        unknowns: unique(ordered.flatMap((entry) => entry.need.plannerProvenance?.unknowns ?? [])),
        weeklyExecutionRequirements: ordered.flatMap((entry) =>
          entry.need.plannerProvenance?.weeklyExecutionRequirements ?? [])
          .filter((entry, index, all) => all.findIndex((candidate) =>
            candidate.objectiveId === entry.objectiveId) === index)
          .sort((left, right) => left.objectiveId.localeCompare(right.objectiveId)),
      },
    },
  };
}

export function mergeEquivalentNeeds(entries: readonly NormalizedPlannerNeed[]): {
  readonly needs: readonly SessionNeed[];
  readonly normalizedNeeds: readonly NormalizedPlannerNeed[];
  readonly traces: readonly PlannerMergedNeedTrace[];
} {
  const groups = new Map<string, NormalizedPlannerNeed[]>();
  for (const entry of entries) {
    const key = equivalenceKey(entry.need);
    const group = groups.get(key);
    if (group) group.push(entry);
    else groups.set(key, [entry]);
  }
  const merged = [...groups.entries()].sort(([left], [right]) => left.localeCompare(right))
    .map(([, group]) => mergeGroup(group));
  const ordered = merged.sort((left, right) =>
    PRIORITY_RANK[left.need.priority] - PRIORITY_RANK[right.need.priority] ||
    left.need.priorityOrder - right.need.priorityOrder || left.need.id.localeCompare(right.need.id));
  const tierCounters: Record<SessionNeedPriority, number> = { required: 0, preferred: 0, optional: 0 };
  const normalizedNeeds = ordered.map((entry) => ({
    ...entry,
    need: { ...entry.need, priorityOrder: tierCounters[entry.need.priority]++ },
  }));
  return {
    normalizedNeeds,
    needs: normalizedNeeds.map((entry) => entry.need),
    traces: normalizedNeeds.filter((entry) => entry.sourceNeedIds.length > 1).map((entry) => ({
      needId: entry.need.id,
      mergedNeedIds: entry.sourceNeedIds,
      objectiveIds: entry.objectiveIds,
      reasonCode: "equivalent_need_truth_merged",
    })),
  };
}
