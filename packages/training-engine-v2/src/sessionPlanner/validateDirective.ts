import {
  ALLOCATED_SESSION_OBJECTIVE_KINDS,
  PROGRAMMING_CONTEXT_MODES,
  TRAINING_OUTCOME_GOALS,
  type SessionAllocationDirective,
} from "../domain/sessionPlanningDirective";
import type { SessionIntentPlannerInput, PlannerValidationFinding } from "./contracts";

function explicitTime(value: string): boolean {
  return /(?:Z|[+-]\d{2}:\d{2})$/.test(value) && !Number.isNaN(Date.parse(value));
}

function hasSelectionTruth(directive: SessionAllocationDirective, objectiveIndex: number): boolean {
  const target = directive.allocatedObjectives[objectiveIndex].selectionTarget;
  return target.targetMovementRoles.length > 0 || target.targetActionFunctions.length > 0 ||
    target.targetMuscles.length > 0 || target.targetBodyRegions.length > 0;
}

export function validateSessionAllocationDirective(
  input: SessionIntentPlannerInput,
): readonly PlannerValidationFinding[] {
  const directive = input.directive;
  if (!directive) return [];
  const findings: PlannerValidationFinding[] = [];
  const add = (severity: "error" | "warning", code: string, sourceId: string | null, message: string) => {
    findings.push({ severity, code, sourceId, owner: "session_intent_planner", message });
  };
  if (!directive.id.trim()) add("error", "missing_directive_id", null, "Directive ID is required.");
  if (directive.athleteId !== input.athlete.id) {
    add("error", "directive_athlete_mismatch", directive.id, "Directive and Planner athlete IDs differ.");
  }
  if (directive.sessionType !== "ordinary_training") {
    add("error", "unsupported_session_type", directive.id, "Only ordinary_training is approved.");
  }
  if (!directive.outcomeGoal || !TRAINING_OUTCOME_GOALS.includes(directive.outcomeGoal)) {
    add("error", "UNDER_SPECIFIED_OUTCOME_GOAL", directive.id, "An explicit training outcome goal is required.");
  }
  if (directive.legacyPrimaryGoal === "pain_aware_return" && !directive.outcomeGoal) {
    add("error", "UNDER_SPECIFIED_OUTCOME_GOAL", directive.id, "Pain-aware return is context, not an outcome goal.");
  }
  for (const mode of directive.programmingContextModes) {
    if (!PROGRAMMING_CONTEXT_MODES.includes(mode)) {
      add("error", "unsupported_programming_context", directive.id, `Unsupported context mode: ${mode}.`);
    }
  }
  if (!explicitTime(directive.evaluationAsOf) || directive.evaluationAsOf !== input.evaluationAsOf) {
    add("error", "invalid_or_stale_evaluation_time", directive.id, "One explicit matching evaluation time is required.");
  }
  const orders = new Set<string>();
  const ids = new Set<string>();
  directive.allocatedObjectives.forEach((objective, index) => {
    if (ids.has(objective.id)) add("error", "duplicate_objective_id", objective.id, "Objective IDs must be unique.");
    ids.add(objective.id);
    const orderKey = `${objective.priority}:${objective.priorityOrder}`;
    if (orders.has(orderKey)) add("error", "duplicate_priority_order", objective.id, "Priority order must be unique within a tier.");
    orders.add(orderKey);
    if (!Number.isInteger(objective.priorityOrder) || objective.priorityOrder < 0) {
      add("error", "invalid_priority_order", objective.id, "Priority order must be a non-negative integer.");
    }
    if (!ALLOCATED_SESSION_OBJECTIVE_KINDS.includes(objective.kind)) {
      add("error", "unknown_objective_kind", objective.id, "Objective kind is not approved.");
    }
    if (!hasSelectionTruth(directive, index)) {
      add("error", "objective_without_selection_truth", objective.id, "Objective requires structured selection truth.");
    }
    if (objective.kind === "direct_accessory" && objective.selectionTarget.targetMuscles.length === 0) {
      add("error", "direct_objective_without_target_muscle", objective.id, "Direct accessory work requires a target muscle.");
    }
    if (objective.kind === "recovery" && objective.priority === "required") {
      add("error", "recovery_cannot_be_required_dominant_work", objective.id, "Recovery cannot be required dominant work.");
    }
    if (objective.sourceEvidence.length === 0) {
      add("error", "prose_only_objective", objective.id, "Objective requires structured source evidence.");
    }
  });
  const dominant = directive.allocatedObjectives.filter((objective) =>
    objective.kind === "dominant_main" || objective.kind === "capacity_main",
  );
  if (dominant.length === 0) {
    add("error", "ordinary_session_requires_dominant_main_objective", directive.id, "Ordinary training requires one dominant session responsibility.");
  }
  if (dominant.length > 1) {
    add("error", "contradictory_required_dominant_objectives", directive.id, "Only one dominant session responsibility is permitted.");
  }
  if (dominant.some((objective) => objective.priority !== "required")) {
    add("error", "dominant_main_must_be_required", dominant[0]?.id ?? directive.id, "The dominant session responsibility must be required.");
  }
  const availability = directive.currentSessionAvailability;
  if (availability?.availableMinutes !== null && availability?.availableMinutes !== undefined &&
    (!Number.isFinite(availability.availableMinutes) || availability.availableMinutes < 0)) {
    add("error", "invalid_current_session_minutes", directive.id, "Current-session minutes must be non-negative.");
  }
  if (directive.outcomeGoal && input.athlete.primaryGoal !== directive.outcomeGoal) {
    add("warning", "profile_goal_differs_from_directive", directive.id, "Directive outcome remains authoritative over profile goal.");
  }
  return findings.sort((left, right) => left.code.localeCompare(right.code) ||
    (left.sourceId ?? "").localeCompare(right.sourceId ?? ""));
}
