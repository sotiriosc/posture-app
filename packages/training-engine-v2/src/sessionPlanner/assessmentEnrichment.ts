import type { AssessmentFeature, AssessmentSignal, AssessmentState } from "../domain/assessment";
import type { ExerciseActionFunction } from "../domain/exercise";
import type { BodyRegion, MovementRole } from "../domain/primitives";
import type { SessionNeed, SessionRangeRequirement, StructuralCapacityMode } from "../domain/session";
import type { NormalizedPlannerNeed, PlannerAssessmentEnrichmentTrace } from "./contracts";

const FEATURE_MOVEMENTS: Readonly<Record<AssessmentFeature, MovementRole>> = {
  serratus_or_protraction_control: "scapular_control",
  upward_rotation_control: "scapular_control",
  retraction_control: "scapular_control",
  external_rotation_or_cuff_control: "scapular_control",
  loaded_scapular_stability: "scapular_control",
};

const FEATURE_ACTIONS: Partial<Readonly<Record<AssessmentFeature, ExerciseActionFunction>>> = {
  upward_rotation_control: "scapular_upward_rotation",
  retraction_control: "scapular_retraction",
  external_rotation_or_cuff_control: "shoulder_external_rotation",
};

function unique<T extends string>(values: readonly T[]): readonly T[] {
  return [...new Set(values)].sort();
}

function structuredTruth(signal: AssessmentSignal): {
  readonly movements: readonly MovementRole[];
  readonly actions: readonly ExerciseActionFunction[];
  readonly regions: readonly BodyRegion[];
} {
  return {
    movements: unique([
      ...(signal.movementRole ? [signal.movementRole] : []),
      ...(signal.assessmentFeatures ?? []).map((feature) => FEATURE_MOVEMENTS[feature]),
    ]),
    actions: unique([
      ...(signal.actionFunctions ?? []),
      ...(signal.assessmentFeatures ?? []).flatMap((feature) => {
        const action = FEATURE_ACTIONS[feature];
        return action ? [action] : [];
      }),
    ]),
    regions: signal.region ? [signal.region] : [],
  };
}

function intersects(left: readonly string[], right: readonly string[]): boolean {
  return left.some((value) => right.includes(value));
}

function relevantNeed(signal: AssessmentSignal, needs: readonly NormalizedPlannerNeed[]): NormalizedPlannerNeed | undefined {
  const truth = structuredTruth(signal);
  return needs.find(({ need }) =>
    intersects(truth.movements, need.selection.targetMovementRoles) ||
    intersects(truth.actions, need.selection.targetActionFunctions) ||
    (signal.muscleGroup !== undefined && need.selection.targetMuscles.includes(signal.muscleGroup)) ||
    intersects(truth.regions, need.selection.targetBodyRegions));
}

function rangeRequirement(signal: AssessmentSignal, action: ExerciseActionFunction | undefined): SessionRangeRequirement | undefined {
  if (!signal.region || (signal.type !== "mobility_finding" && signal.type !== "movement_limitation")) return undefined;
  return {
    requirementId: `assessment-range:${signal.id}`,
    sourceAssessmentSignalId: signal.id,
    bodyRegion: signal.region,
    ...(action ? { actionFunction: action } : {}),
    ...(signal.side ? { side: signal.side } : {}),
    provenance: `AssessmentSignal:${signal.id}`,
    reviewStatus: action ? "accepted" : "unknown",
    explanation: signal.description,
  };
}

export function deriveAssessmentEnrichment(input: {
  readonly assessment: AssessmentState;
  readonly activeNeeds: readonly NormalizedPlannerNeed[];
  readonly capacity: StructuralCapacityMode;
  readonly directiveId: string;
}): {
  readonly needs: readonly NormalizedPlannerNeed[];
  readonly traces: readonly PlannerAssessmentEnrichmentTrace[];
} {
  const needs: NormalizedPlannerNeed[] = [];
  const traces: PlannerAssessmentEnrichmentTrace[] = [];
  const clusters = new Map<string, { signals: AssessmentSignal[]; target: NormalizedPlannerNeed; section: "warmup" | "activation" }>();

  for (const signal of [...input.assessment.signals].sort((a, b) => a.id.localeCompare(b.id))) {
    const target = relevantNeed(signal, input.activeNeeds);
    const clusterId = `assessment-cluster:${signal.id}`;
    if (signal.confidence !== "high") {
      traces.push({ clusterId, assessmentSignalIds: [signal.id], dependentNeedIds: target ? [target.need.id] : [], producedNeedId: null,
        disposition: signal.confidence === "low" ? "context_only_low_confidence" : "context_only_medium_confidence" });
      continue;
    }
    if (signal.priority !== "primary" && signal.priority !== "blocking") {
      traces.push({ clusterId, assessmentSignalIds: [signal.id], dependentNeedIds: target ? [target.need.id] : [], producedNeedId: null,
        disposition: "irrelevant_to_allocated_purpose" });
      continue;
    }
    if (signal.type === "weakness_development_priority") {
      traces.push({ clusterId, assessmentSignalIds: [signal.id], dependentNeedIds: target ? [target.need.id] : [], producedNeedId: null,
        disposition: "direct_volume_requires_allocation" });
      continue;
    }
    const truth = structuredTruth(signal);
    if (!target) {
      traces.push({ clusterId, assessmentSignalIds: [signal.id], dependentNeedIds: [], producedNeedId: null,
        disposition: truth.movements.length || truth.actions.length || truth.regions.length ? "irrelevant_to_allocated_purpose" : "insufficient_structured_truth" });
      continue;
    }
    const section = signal.type === "mobility_finding" || signal.type === "movement_limitation" ? "warmup" : "activation";
    const key = [target.need.id, section, ...truth.movements, ...truth.actions, ...truth.regions, signal.side ?? "none"].join("|");
    const cluster = clusters.get(key);
    if (cluster) cluster.signals.push(signal);
    else clusters.set(key, { signals: [signal], target, section });
  }

  for (const [key, cluster] of [...clusters.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const signals = cluster.signals.sort((a, b) => a.id.localeCompare(b.id));
    const movements = unique(signals.flatMap((signal) => structuredTruth(signal).movements));
    const actions = unique(signals.flatMap((signal) => structuredTruth(signal).actions));
    const regions = unique(signals.flatMap((signal) => structuredTruth(signal).regions));
    const signalIds = signals.map((signal) => signal.id);
    const needId = `${input.directiveId}:assessment:${encodeURIComponent(key)}`;
    const requirements = signals.flatMap((signal) => {
      const requirement = rangeRequirement(signal, structuredTruth(signal).actions[0]);
      return requirement ? [requirement] : [];
    });
    const dependencyId = `${needId}:dependency`;
    const need: SessionNeed = {
      id: needId,
      section: cluster.section,
      priority: "preferred",
      priorityOrder: 0,
      standaloneAdmission: input.capacity === "condensed" ? "shared_only" : "admitted",
      sourceEvidence: [{ sourceKind: "assessment_priority", sourceId: signalIds[0], evidenceRefs: signalIds }],
      dependencies: [{
        dependencyId,
        targetNeedIds: [cluster.target.need.id],
        targetExerciseIds: [],
        movementRoles: movements,
        actionFunctions: actions,
        bodyRegions: regions,
        assessmentSignalIds: signalIds,
        rangeRequirements: requirements,
        painResponseRequirementIds: [],
        required: false,
      }],
      reasonCode: `assessment_${cluster.section}_enrichment`,
      explanation: signals.map((signal) => signal.description).join(" "),
      selection: {
        requestedRole: cluster.section === "warmup" ? "preparation" : "activation",
        targetMovementRoles: movements,
        targetActionFunctions: actions,
        targetMuscles: unique(signals.flatMap((signal) => signal.muscleGroup ? [signal.muscleGroup] : [])),
        muscleRequirement: "any_meaningful_contributor",
        targetBodyRegions: regions,
      },
      plannerProvenance: {
        objectiveIds: cluster.target.objectiveIds,
        owner: "session_intent_planner_assessment_enrichment",
        transformationRuleId: "high_confidence_primary_or_blocking_relevant_cluster",
        sourceEvidenceRefs: signalIds,
        assessmentSignalRefs: signalIds,
        dependencyRefs: [dependencyId],
        mergeHistory: [],
        priorityOrigin: "assessment_enrichment_policy:preferred",
        sectionRoleMappingOrigin: `assessment_type:${cluster.section}`,
        standaloneAdmissionOrigin: `capacity_policy:${input.capacity}`,
        unknowns: requirements.filter((entry) => entry.reviewStatus === "unknown").map((entry) => entry.requirementId),
      },
    };
    needs.push({ need, objectiveIds: cluster.target.objectiveIds, sourceNeedIds: [needId] });
    traces.push({ clusterId: key, assessmentSignalIds: signalIds, dependentNeedIds: [cluster.target.need.id], producedNeedId: needId,
      disposition: "preferred_need_created" });
  }

  return { needs, traces: traces.sort((a, b) => a.clusterId.localeCompare(b.clusterId)) };
}
