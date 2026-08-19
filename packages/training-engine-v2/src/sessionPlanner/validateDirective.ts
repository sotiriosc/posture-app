import {
  ALLOCATED_SESSION_OBJECTIVE_KINDS,
  PREPARATION_DEPENDENCY_SOURCE_KINDS,
  PROGRAMMING_CONTEXT_MODES,
  TRAINING_OUTCOME_GOALS,
  type AllocatedPreparationDependency,
  type SessionAllocationDirective,
} from "../domain/sessionPlanningDirective";
import { EQUIPMENT_CAPABILITY_KEYS } from "../domain/equipment";
import { SESSION_NEED_PRIORITIES } from "../domain/session";
import { PREPARATION_CATEGORIES } from "../preparation/contracts";
import { PREPARATION_TAXONOMY } from "../preparation/evidence";
import type { SessionIntentPlannerInput, PlannerValidationFinding } from "./contracts";

function explicitTime(value: string): boolean {
  return /(?:Z|[+-]\d{2}:\d{2})$/.test(value) && !Number.isNaN(Date.parse(value));
}

function hasSelectionTruth(directive: SessionAllocationDirective, objectiveIndex: number): boolean {
  const target = directive.allocatedObjectives[objectiveIndex].selectionTarget;
  return target.targetMovementRoles.length > 0 || target.targetActionFunctions.length > 0 ||
    target.targetMuscles.length > 0 || target.targetBodyRegions.length > 0;
}

function dependencyHasSelectionTruth(dependency: AllocatedPreparationDependency): boolean {
  const target = dependency.selectionTarget;
  return target.targetMovementRoles.length > 0 || target.targetActionFunctions.length > 0 ||
    target.targetMuscles.length > 0 || target.targetBodyRegions.length > 0;
}

function stableDependencyTruth(dependency: AllocatedPreparationDependency): string {
  return JSON.stringify({
    ...dependency,
    requiredPreparationCategories: [...dependency.requiredPreparationCategories].sort(),
    sourceAssessmentFactIds: [...dependency.sourceAssessmentFactIds].sort(),
    requiredEquipmentCapabilities: [...dependency.requiredEquipmentCapabilities].sort(),
    targetExerciseIds: [...dependency.targetExerciseIds].sort(),
    rangeRequirements: [...dependency.rangeRequirements].sort((left, right) =>
      left.requirementId.localeCompare(right.requirementId)),
    selectionTarget: {
      ...dependency.selectionTarget,
      targetMovementRoles: [...dependency.selectionTarget.targetMovementRoles].sort(),
      targetActionFunctions: [...dependency.selectionTarget.targetActionFunctions].sort(),
      targetMuscles: [...dependency.selectionTarget.targetMuscles].sort(),
      targetBodyRegions: [...dependency.selectionTarget.targetBodyRegions].sort(),
    },
    provenance: {
      ...dependency.provenance,
      evidenceRefs: [...dependency.provenance.evidenceRefs].sort(),
    },
  });
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
  const dependencyById = new Map<string, AllocatedPreparationDependency>();
  const assessmentSignalIds = new Set(input.assessment.signals.map((signal) => signal.id));
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
    for (const dependency of objective.preparationDependencies ?? []) {
      const sourceId = dependency.id || objective.id;
      if (!dependency.id.trim()) {
        add("error", "missing_preparation_dependency_id", objective.id, "Preparation dependency ID is required.");
      }
      const prior = dependencyById.get(dependency.id);
      if (prior) {
        if (dependency.ownership !== "shared" || prior.ownership !== "shared") {
          add("error", "duplicate_assignment_local_preparation_dependency", sourceId,
            "Only identical shared dependencies may serve more than one objective.");
        } else if (stableDependencyTruth(prior) !== stableDependencyTruth(dependency)) {
          add("error", "conflicting_shared_preparation_dependency", sourceId,
            "A shared dependency ID must retain identical causal truth across objectives.");
        }
      } else {
        dependencyById.set(dependency.id, dependency);
      }
      if (!dependencyHasSelectionTruth(dependency)) {
        add("error", "preparation_dependency_without_selection_truth", sourceId,
          "Preparation dependency requires structured movement, action, muscle, or region truth.");
      }
      if (dependency.requiredPreparationCategories.length === 0 ||
          dependency.requiredPreparationCategories.some((category) => !PREPARATION_CATEGORIES.includes(category))) {
        add("error", "invalid_preparation_dependency_category", sourceId,
          "Preparation dependency requires approved typed categories.");
      }
      if (dependency.requiredPreparationCategories.includes("exercise_acclimation")) {
        add("error", "exercise_acclimation_requires_assignment_local_prescription", sourceId,
          "Exercise acclimation remains local to Prescription and cannot be emitted as a separate preparation need.");
      }
      if (dependency.requiredPreparationCategories.includes("cooldown_downshift")) {
        add("error", "cooldown_requires_explicit_cooldown_ownership", sourceId,
          "Cooldown ownership is not a warmup or activation dependency.");
      }
      for (const category of dependency.requiredPreparationCategories) {
        const taxonomy = PREPARATION_TAXONOMY.find((entry) => entry.category === category);
        if (taxonomy && !taxonomy.intendedSections.includes(dependency.intendedSection)) {
          add("error", "preparation_category_section_mismatch", sourceId,
            `Preparation category ${category} is not legal in ${dependency.intendedSection}.`);
        }
      }
      if (!SESSION_NEED_PRIORITIES.includes(dependency.priority)) {
        add("error", "invalid_preparation_dependency_priority", sourceId,
          "Preparation dependency priority is invalid.");
      }
      if (dependency.requiredEquipmentCapabilities.some((capability) =>
        !EQUIPMENT_CAPABILITY_KEYS.includes(capability))) {
        add("error", "invalid_preparation_equipment_capability", sourceId,
          "Preparation dependency contains an unknown equipment capability.");
      }
      if (!PREPARATION_DEPENDENCY_SOURCE_KINDS.includes(dependency.provenance.sourceKind) ||
          !dependency.provenance.sourceId.trim() ||
          !dependency.provenance.transformationRuleId.trim() ||
          dependency.provenance.evidenceRefs.length === 0 ||
          dependency.provenance.evidenceRefs.some((entry) => !entry.trim())) {
        add("error", "incomplete_preparation_dependency_provenance", sourceId,
          "Preparation dependency requires typed source, rule, and evidence provenance.");
      }
      if (dependency.sourceAssessmentFactIds.some((signalId) => !assessmentSignalIds.has(signalId)) ||
          dependency.rangeRequirements.some((requirement) =>
            !assessmentSignalIds.has(requirement.sourceAssessmentSignalId))) {
        add("error", "unknown_preparation_assessment_fact", sourceId,
          "Preparation dependencies may reference only assessment facts present in this planner input.");
      }
      if (dependency.provenance.sourceKind === "assessment_fact" &&
          dependency.sourceAssessmentFactIds.length === 0) {
        add("error", "assessment_preparation_dependency_without_fact", sourceId,
          "Assessment-owned preparation requires an explicit source assessment fact.");
      }
      if (dependency.provenance.sourceKind === "selected_exercise_mechanics" &&
          dependency.targetExerciseIds.length === 0) {
        add("error", "mechanics_preparation_dependency_without_exercise", sourceId,
          "Selected-exercise mechanics preparation requires an exact target exercise ID.");
      }
      if (dependency.familiarityPolicy === "novice_or_unfamiliar" &&
          (!dependency.requiredPreparationCategories.includes("movement_rehearsal") ||
           dependency.targetExerciseIds.length === 0)) {
        add("error", "invalid_preparation_familiarity_policy", sourceId,
          "Familiarity gating is legal only for exercise-targeted movement rehearsal.");
      }
      if (!dependency.reasonCode.trim() || !dependency.explanation.trim()) {
        add("error", "incomplete_preparation_dependency_explanation", sourceId,
          "Preparation dependency requires a reason code and explanation trace.");
      }
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
