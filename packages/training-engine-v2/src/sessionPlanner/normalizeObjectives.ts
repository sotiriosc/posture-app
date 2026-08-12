import type {
  AllocatedSessionObjective,
  SessionObjectiveSourceKind,
} from "../domain/sessionPlanningDirective";
import type {
  SessionNeedSourceKind,
  StandaloneAdmission,
  StructuralCapacityMode,
  TrainingRole,
} from "../domain/session";
import type { NormalizedPlannerNeed, PlannerIncludedNeedTrace } from "./contracts";

const OBJECTIVE_PLACEMENT: Readonly<Record<AllocatedSessionObjective["kind"], {
  readonly section: "warmup" | "activation" | "main" | "accessory" | "cooldown";
  readonly role: TrainingRole;
}>> = {
  dominant_main: { section: "main", role: "primary_strength" },
  secondary_main: { section: "main", role: "secondary_strength" },
  secondary_accessory: { section: "accessory", role: "secondary_strength" },
  direct_accessory: { section: "accessory", role: "hypertrophy_accessory" },
  capacity_main: { section: "main", role: "capacity" },
  capacity_accessory: { section: "accessory", role: "capacity" },
  explicit_preparation: { section: "warmup", role: "preparation" },
  activation: { section: "activation", role: "activation" },
  recovery: { section: "cooldown", role: "recovery" },
};

const SOURCE_KIND: Readonly<Record<SessionObjectiveSourceKind, SessionNeedSourceKind>> = {
  future_week_allocation: "weekly_intent",
  standalone_session_brief: "session_primary_purpose",
  user_explicit_session_request: "user_explicit_session_request",
  assessment_enrichment: "assessment_priority",
  typed_dependency: "explicit_preparation_dependency",
};

function policyAdmission(
  objective: AllocatedSessionObjective,
  capacity: StructuralCapacityMode,
): StandaloneAdmission {
  if (objective.standaloneAdmissionDirection !== "policy_default") {
    return objective.standaloneAdmissionDirection;
  }
  if (objective.priority === "required") return "admitted";
  if (capacity === "condensed") return "shared_only";
  if (objective.priority === "preferred") return "admitted";
  if (capacity === "expanded") return "admitted";
  return "duration_conditional";
}

export function normalizeAllocatedObjectives(input: {
  readonly directiveId: string;
  readonly objectives: readonly AllocatedSessionObjective[];
  readonly capacity: StructuralCapacityMode;
}): {
  readonly needs: readonly NormalizedPlannerNeed[];
  readonly traces: readonly PlannerIncludedNeedTrace[];
} {
  const normalized = [...input.objectives]
    .sort((left, right) => left.priority.localeCompare(right.priority) ||
      left.priorityOrder - right.priorityOrder || left.id.localeCompare(right.id))
    .map((objective): NormalizedPlannerNeed => {
      const placement = OBJECTIVE_PLACEMENT[objective.kind];
      const sourceEvidenceRefs = objective.sourceEvidence
        .flatMap((source) => [source.sourceId, ...source.evidenceRefs])
        .sort();
      const needId = `${input.directiveId}:objective:${objective.id}`;
      return {
        objectiveIds: [objective.id],
        sourceNeedIds: [needId],
        need: {
          id: needId,
          section: placement.section,
          priority: objective.priority,
          priorityOrder: objective.priorityOrder,
          standaloneAdmission: policyAdmission(objective, input.capacity),
          sourceEvidence: [...objective.sourceEvidence]
            .sort((left, right) => left.sourceKind.localeCompare(right.sourceKind) ||
              left.sourceId.localeCompare(right.sourceId))
            .map((source) => ({
              sourceKind: SOURCE_KIND[source.sourceKind],
              sourceId: source.sourceId,
              evidenceRefs: [...source.evidenceRefs].sort(),
            })),
          dependencies: [],
          reasonCode: objective.reasonCode,
          explanation: objective.explanation,
          selection: {
            requestedRole: placement.role,
            targetMovementRoles: [...objective.selectionTarget.targetMovementRoles].sort(),
            targetActionFunctions: [...objective.selectionTarget.targetActionFunctions].sort(),
            targetMuscles: [...objective.selectionTarget.targetMuscles].sort(),
            muscleRequirement: objective.selectionTarget.muscleRequirement,
            targetBodyRegions: [...objective.selectionTarget.targetBodyRegions].sort(),
          },
          plannerProvenance: {
            objectiveIds: [objective.id],
            owner: "session_allocation_directive",
            transformationRuleId: `objective_kind_mapping:${objective.kind}`,
            sourceEvidenceRefs,
            assessmentSignalRefs: [],
            dependencyRefs: [],
            mergeHistory: [],
            priorityOrigin: `${objective.id}:priority`,
            sectionRoleMappingOrigin: `fixed_objective_mapping:${objective.kind}`,
            standaloneAdmissionOrigin: objective.standaloneAdmissionDirection === "policy_default"
              ? `capacity_policy:${input.capacity}`
              : `explicit_direction:${objective.standaloneAdmissionDirection}`,
            unknowns: [],
          },
        },
      };
    });
  return {
    needs: normalized,
    traces: normalized.map((entry) => ({
      needId: entry.need.id,
      objectiveIds: entry.objectiveIds,
      ruleIds: [entry.need.plannerProvenance!.transformationRuleId],
      sourceEvidenceRefs: entry.need.plannerProvenance!.sourceEvidenceRefs,
    })),
  };
}
