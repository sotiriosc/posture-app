import { hasEquipmentCapability } from "../domain/equipment";
import type { AssessmentState } from "../domain/assessment";
import type { AthleteProfile } from "../domain/athlete";
import type { EquipmentCapabilities } from "../domain/equipment";
import type { TrainingHistory } from "../domain/history";
import type { PainAndInjuryState } from "../domain/painInjury";
import type {
  SessionNeed,
  SessionNeedDependency,
  SessionNeedPriority,
  SessionNeedSourceKind,
  StructuralCapacityMode,
} from "../domain/session";
import { buildTrainingReadinessTrace, type TrainingSafetyState } from "../domain/trainingSafety";
import type {
  NormalizedPlannerNeed,
  NormalizedPreparationDependency,
  PlannerAssessmentEnrichmentTrace,
  PlannerPreparationNeedTrace,
} from "./contracts";
import { deriveAssessmentEnrichment } from "./assessmentEnrichment";

const PRIORITY_RANK: Readonly<Record<SessionNeedPriority, number>> = {
  required: 0,
  preferred: 1,
  optional: 2,
};

function unique<T extends string>(values: readonly T[]): readonly T[] {
  return [...new Set(values)].sort();
}

function painBlocksDependency(
  dependency: SessionNeedDependency,
  pain: PainAndInjuryState,
): boolean {
  const regions = dependency.bodyRegions;
  const overlapsRegion = (region: string | undefined): boolean =>
    Boolean(region && regions.includes(region as typeof regions[number]));
  return pain.moderatePain.some((entry) => overlapsRegion(entry.region)) ||
    pain.acuteSeverePain.some((entry) => overlapsRegion(entry.region)) ||
    pain.hardContraindications.some((entry) =>
      overlapsRegion(entry.region) ||
      (entry.exerciseIds ?? []).some((exerciseId) => dependency.targetExerciseIds.includes(exerciseId)),
    );
}

function familiarTargetExercises(input: {
  readonly dependency: SessionNeedDependency;
  readonly athlete: AthleteProfile;
  readonly history: TrainingHistory;
}): boolean {
  if (input.dependency.familiarityPolicy !== "novice_or_unfamiliar") return false;
  if (input.athlete.experience === "novice" || input.athlete.experience === "beginner") return false;
  const completed = new Set([
    ...input.history.exerciseHistory.stableExerciseIds,
    ...input.history.exerciseHistory.events
      .filter((entry) => [
        "successful_completion",
        "appropriate_challenge",
        "progression_success",
      ].includes(entry.type))
      .map((entry) => entry.exerciseId),
  ]);
  return input.dependency.targetExerciseIds.length > 0 &&
    input.dependency.targetExerciseIds.every((exerciseId) => completed.has(exerciseId));
}

function sourceKind(dependency: SessionNeedDependency): SessionNeedSourceKind {
  switch (dependency.provenance?.sourceKind) {
    case "assessment_fact": return "assessment_priority";
    case "known_successful_preparation_history": return "continuity_requirement";
    case "phase_requirement": return "phase_intent";
    default: return "explicit_preparation_dependency";
  }
}

function sharedKey(entry: NormalizedPreparationDependency): string {
  const dependency = entry.dependency;
  if (dependency.ownership !== "shared") {
    return `assignment_local:${entry.objectiveIds.join("|")}:${dependency.dependencyId}`;
  }
  return JSON.stringify({
    section: dependency.intendedSection,
    categories: [...(dependency.requiredPreparationCategories ?? [])].sort(),
    equipment: [...(dependency.requiredEquipmentCapabilities ?? [])].sort(),
    movements: [...dependency.movementRoles].sort(),
    actions: [...dependency.actionFunctions].sort(),
    muscles: [...(dependency.targetMuscles ?? [])].sort(),
    muscleRequirement: dependency.muscleRequirement,
    regions: [...dependency.bodyRegions].sort(),
    assessmentSignals: [...dependency.assessmentSignalIds].sort(),
    rangeRequirements: [...(dependency.rangeRequirements ?? [])]
      .map((requirement) => requirement.requirementId).sort(),
    familiarityPolicy: dependency.familiarityPolicy,
  });
}

function mergeDependencyGroup(
  group: readonly NormalizedPreparationDependency[],
): SessionNeedDependency[] {
  const byId = new Map<string, NormalizedPreparationDependency[]>();
  for (const entry of group) {
    const sameId = byId.get(entry.dependency.dependencyId);
    if (sameId) sameId.push(entry);
    else byId.set(entry.dependency.dependencyId, [entry]);
  }
  return [...byId.entries()].sort(([left], [right]) => left.localeCompare(right))
    .map(([, entries]) => {
      const first = entries[0].dependency;
      return {
        ...first,
        targetNeedIds: unique(entries.flatMap((entry) => entry.dependency.targetNeedIds)),
        targetExerciseIds: unique(entries.flatMap((entry) => entry.dependency.targetExerciseIds)),
        targetObjectiveIds: unique(entries.flatMap((entry) => entry.objectiveIds)),
        assessmentSignalIds: unique(entries.flatMap((entry) => entry.dependency.assessmentSignalIds)),
        painResponseRequirementIds: unique(entries.flatMap((entry) =>
          entry.dependency.painResponseRequirementIds)),
      };
    });
}

function admission(input: {
  readonly priority: SessionNeedPriority;
  readonly capacity: StructuralCapacityMode;
}): SessionNeed["standaloneAdmission"] {
  if (input.priority === "required") return "admitted";
  if (input.capacity === "condensed") return "shared_only";
  if (input.priority === "preferred" || input.capacity === "expanded") return "admitted";
  return "duration_conditional";
}

function explicitNeed(input: {
  readonly directiveId: string;
  readonly capacity: StructuralCapacityMode;
  readonly group: readonly NormalizedPreparationDependency[];
}): NormalizedPlannerNeed {
  const dependencies = mergeDependencyGroup(input.group);
  const first = dependencies[0];
  const priority = dependencies.map((entry) => entry.priority ?? "preferred")
    .sort((left, right) => PRIORITY_RANK[left] - PRIORITY_RANK[right])[0];
  const dependencyIds = dependencies.map((entry) => entry.dependencyId).sort();
  const objectiveIds = unique(input.group.flatMap((entry) => entry.objectiveIds));
  const sourceEvidenceRefs = unique(input.group.flatMap((entry) => entry.sourceEvidenceRefs));
  const assessmentSignalRefs = unique(dependencies.flatMap((entry) => entry.assessmentSignalIds));
  const encodedIdentity = encodeURIComponent([
    ...dependencyIds,
    ...objectiveIds,
    first.intendedSection,
  ].join("|"));
  const needId = `${input.directiveId}:preparation:${encodedIdentity}`;
  const sourceEvidence = dependencies.map((dependency) => ({
    sourceKind: sourceKind(dependency),
    sourceId: dependency.provenance!.sourceId,
    evidenceRefs: [...dependency.provenance!.evidenceRefs].sort(),
  })).filter((entry, index, all) => all.findIndex((candidate) =>
    candidate.sourceKind === entry.sourceKind && candidate.sourceId === entry.sourceId &&
    JSON.stringify(candidate.evidenceRefs) === JSON.stringify(entry.evidenceRefs)) === index);
  return {
    objectiveIds,
    sourceNeedIds: dependencyIds.map((id) => `${input.directiveId}:preparation-source:${id}`),
    need: {
      id: needId,
      section: first.intendedSection!,
      priority,
      priorityOrder: 0,
      standaloneAdmission: admission({ priority, capacity: input.capacity }),
      sourceEvidence,
      dependencies,
      reasonCode: dependencies.length > 1
        ? "shared_causal_preparation_dependency"
        : first.reasonCode!,
      explanation: unique(dependencies.map((entry) => entry.explanation!)).join(" "),
      selection: {
        requestedRole: first.intendedSection === "activation" ? "activation" : "preparation",
        targetMovementRoles: unique(dependencies.flatMap((entry) => entry.movementRoles)),
        targetActionFunctions: unique(dependencies.flatMap((entry) => entry.actionFunctions)),
        targetMuscles: unique(dependencies.flatMap((entry) => entry.targetMuscles ?? [])),
        muscleRequirement: first.muscleRequirement ?? "any_meaningful_contributor",
        targetBodyRegions: unique(dependencies.flatMap((entry) => entry.bodyRegions)),
      },
      plannerProvenance: {
        objectiveIds,
        owner: "session_intent_planner_preparation_need_derivation",
        transformationRuleId: "typed_causal_dependency_to_preparation_need_v1",
        sourceEvidenceRefs,
        assessmentSignalRefs,
        dependencyRefs: dependencyIds,
        mergeHistory: input.group.length > 1 ? dependencyIds : [],
        priorityOrigin: dependencies.map((entry) => `${entry.dependencyId}:${entry.priority}`).join("|"),
        sectionRoleMappingOrigin: `typed_dependency:${first.intendedSection}`,
        standaloneAdmissionOrigin: `capacity_policy:${input.capacity}`,
        unknowns: unique(dependencies.flatMap((entry) =>
          (entry.rangeRequirements ?? [])
            .filter((requirement) => requirement.reviewStatus === "unknown")
            .map((requirement) => requirement.requirementId))),
      },
    },
  };
}

function assessmentBlockedByPain(need: SessionNeed, pain: PainAndInjuryState): boolean {
  return need.dependencies.some((dependency) => painBlocksDependency(dependency, pain));
}

/** Derives causal preparation needs only; exercise identity selection remains downstream. */
export function derivePreparationNeeds(input: {
  readonly assessment: AssessmentState;
  readonly activeNeeds: readonly NormalizedPlannerNeed[];
  readonly explicitDependencies: readonly NormalizedPreparationDependency[];
  readonly athlete: AthleteProfile;
  readonly painAndInjury: PainAndInjuryState;
  readonly trainingSafety: TrainingSafetyState;
  readonly equipment: EquipmentCapabilities;
  readonly history: TrainingHistory;
  readonly availableMinutes: number;
  readonly capacity: StructuralCapacityMode;
  readonly directiveId: string;
}): {
  readonly needs: readonly NormalizedPlannerNeed[];
  readonly assessmentTraces: readonly PlannerAssessmentEnrichmentTrace[];
  readonly traces: readonly PlannerPreparationNeedTrace[];
} {
  const assessment = deriveAssessmentEnrichment({
    assessment: input.assessment,
    activeNeeds: input.activeNeeds,
    capacity: input.capacity,
    directiveId: input.directiveId,
  });
  const readiness = buildTrainingReadinessTrace({
    trainingSafety: input.trainingSafety,
    acuteSeverePain: input.painAndInjury.acuteSeverePain,
  });
  const includedAssessmentNeeds: NormalizedPlannerNeed[] = [];
  const traces: PlannerPreparationNeedTrace[] = [];
  const assessmentDisposition = new Map<string, PlannerAssessmentEnrichmentTrace["disposition"]>();

  for (const entry of assessment.needs) {
    const dependencyIds = entry.need.dependencies.map((dependency) => dependency.dependencyId);
    const targetNeedIds = unique(entry.need.dependencies.flatMap((dependency) => dependency.targetNeedIds));
    let disposition: PlannerPreparationNeedTrace["disposition"] | null = null;
    let assessmentResult: PlannerAssessmentEnrichmentTrace["disposition"] | null = null;
    if (!readiness.downstreamTrainingAllowed) {
      disposition = "blocked_by_training_safety";
      assessmentResult = "blocked_by_training_safety";
    } else if (assessmentBlockedByPain(entry.need, input.painAndInjury)) {
      disposition = "blocked_by_pain_or_contraindication";
      assessmentResult = "blocked_by_pain_or_contraindication";
    } else if (input.availableMinutes === 0 && entry.need.priority !== "required") {
      disposition = "no_time_for_optional_preparation";
      assessmentResult = "no_time_for_optional_preparation";
    }
    if (disposition) {
      assessmentDisposition.set(entry.need.id, assessmentResult!);
      traces.push({ dependencyIds, targetNeedIds, producedNeedId: null, disposition,
        evidenceRefs: entry.need.plannerProvenance?.sourceEvidenceRefs ?? [] });
    } else {
      includedAssessmentNeeds.push(entry);
      traces.push({ dependencyIds, targetNeedIds, producedNeedId: entry.need.id,
        disposition: "need_created", evidenceRefs: entry.need.plannerProvenance?.sourceEvidenceRefs ?? [] });
    }
  }

  const eligibleExplicit: NormalizedPreparationDependency[] = [];
  for (const entry of input.explicitDependencies) {
    const dependency = entry.dependency;
    let disposition: PlannerPreparationNeedTrace["disposition"] | null = null;
    if (!readiness.downstreamTrainingAllowed) disposition = "blocked_by_training_safety";
    else if (painBlocksDependency(dependency, input.painAndInjury)) {
      disposition = "blocked_by_pain_or_contraindication";
    } else if ((dependency.requiredEquipmentCapabilities ?? []).some((capability) =>
      !hasEquipmentCapability(input.equipment, capability))) {
      disposition = "required_equipment_unavailable";
    } else if (familiarTargetExercises({ dependency, athlete: input.athlete, history: input.history })) {
      disposition = "familiar_movement_rehearsal_not_required";
    } else if (input.availableMinutes === 0 && dependency.priority !== "required") {
      disposition = "no_time_for_optional_preparation";
    }
    if (disposition) {
      traces.push({ dependencyIds: [dependency.dependencyId], targetNeedIds: dependency.targetNeedIds,
        producedNeedId: null, disposition, evidenceRefs: entry.sourceEvidenceRefs });
    } else {
      eligibleExplicit.push(entry);
    }
  }

  const groups = new Map<string, NormalizedPreparationDependency[]>();
  for (const entry of eligibleExplicit) {
    const key = sharedKey(entry);
    const group = groups.get(key);
    if (group) group.push(entry);
    else groups.set(key, [entry]);
  }
  const explicitNeeds = [...groups.entries()].sort(([left], [right]) => left.localeCompare(right))
    .map(([, group]) => explicitNeed({ directiveId: input.directiveId, capacity: input.capacity, group }));
  for (const entry of explicitNeeds) {
    traces.push({
      dependencyIds: entry.need.dependencies.map((dependency) => dependency.dependencyId).sort(),
      targetNeedIds: unique(entry.need.dependencies.flatMap((dependency) => dependency.targetNeedIds)),
      producedNeedId: entry.need.id,
      disposition: entry.objectiveIds.length > 1 ? "merged_shared_dependency" : "need_created",
      evidenceRefs: entry.need.plannerProvenance?.sourceEvidenceRefs ?? [],
    });
  }

  return {
    needs: [...includedAssessmentNeeds, ...explicitNeeds],
    assessmentTraces: assessment.traces.map((trace) => trace.producedNeedId && assessmentDisposition.has(trace.producedNeedId)
      ? { ...trace, producedNeedId: null, disposition: assessmentDisposition.get(trace.producedNeedId)! }
      : trace),
    traces: traces.sort((left, right) =>
      left.dependencyIds.join("|").localeCompare(right.dependencyIds.join("|")) ||
      (left.producedNeedId ?? "").localeCompare(right.producedNeedId ?? "")),
  };
}
