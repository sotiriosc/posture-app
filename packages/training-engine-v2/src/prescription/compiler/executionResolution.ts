import type { ExerciseDefinition } from "../../domain/exercise";
import type { ExerciseDoseMode } from "../dose";
import type {
  ExecutionQualityCriterion,
  ExecutionStandard,
  TempoPrescription,
} from "../executionStandard";
import type { PrescriptionSideBehavior } from "../types";
import type {
  PrescriptionCompilationContextFacts,
  PrescriptionExecutionRequirement,
} from "./contracts";
import { productionProvenance, uniqueSorted } from "./utilities";

export function buildPrescriptionExecutionStandard(input: {
  readonly exercise: ExerciseDefinition;
  readonly blockId: string;
  readonly context: PrescriptionCompilationContextFacts;
  readonly requirements: readonly PrescriptionExecutionRequirement[];
  readonly sideBehavior: PrescriptionSideBehavior | null;
}): ExecutionStandard {
  const painIds = input.requirements
    .filter((requirement) => requirement.sourceOwner === "pain_response")
    .map((requirement) => requirement.requirementId);
  const criteria: ExecutionQualityCriterion[] = [{
    id: `${input.exercise.id}:mechanics-intent-preservation`,
    dimension: "exercise_intent_preservation",
    importance: "required_for_progression",
    source: "exercise_mechanics",
    description: "Preserve the canonical exercise mechanics intent represented by the exercise identity.",
    provenance: {
      source: "exercise_definition",
      sourceRef: `ExerciseDefinition:${input.exercise.id}:mechanics`,
    },
  }];
  criteria.push({
    id: "prescription:v1:quality-limited",
    dimension: "movement_control",
    importance: "required_for_progression",
    source: "policy",
    description: "Execution quality remains the limiting standard for this dose.",
    provenance: productionProvenance("PRESCRIPTION_POLICY_V1:quality-limited"),
  });
  for (const requirement of input.requirements) {
    if (requirement.reviewedResolution?.kind === "range") {
      criteria.push(criterion(requirement, "range_control"));
    } else if (requirement.reviewedResolution?.kind === "support") {
      criteria.push(criterion(requirement, "support_control"));
    } else if (
      requirement.reviewedResolution?.kind === "side" ||
      requirement.reviewedResolution?.kind === "laterality"
    ) {
      criteria.push(criterion(requirement, "side_or_symmetry_control"));
    } else if (requirement.reviewedResolution?.kind === "tempo") {
      criteria.push(criterion(requirement, "tempo_control"));
    }
  }
  return {
    alignmentPriorityIds: uniqueSorted(input.context.alignmentPriorityIds),
    assessmentPriorityIds: uniqueSorted(input.context.assessmentPriorityIds),
    painResponseRequirementIds: uniqueSorted(painIds),
    exerciseMechanicsIntent: `exercise-mechanics-intent:${input.exercise.id}`,
    ...(input.sideBehavior ? { sideBehavior: input.sideBehavior } : {}),
    criteria,
    provenance: productionProvenance(`prescription-compiler:execution-standard:${input.blockId}`),
  };
}

function criterion(
  requirement: PrescriptionExecutionRequirement,
  dimension: ExecutionQualityCriterion["dimension"],
): ExecutionQualityCriterion {
  return {
    id: `execution-criterion:${requirement.requirementId}`,
    dimension,
    importance: "required_for_progression",
    source: requirement.sourceOwner === "pain_response"
      ? "pain_response_requirement"
      : requirement.sourceOwner === "assessment"
        ? "assessment_priority"
        : requirement.sourceOwner === "athlete"
          ? "athlete_report"
          : "coach_review",
    description: `Apply reviewed structured requirement ${requirement.requirementId}.`,
    provenance: requirement.provenance,
  };
}

export function resolvePrescriptionTempo(input: {
  readonly mode: ExerciseDoseMode;
  readonly supportingWork: boolean;
  readonly context: PrescriptionCompilationContextFacts;
  readonly reviewedTempo: TempoPrescription | null;
  readonly hasConflictingPainRequirement: boolean;
}): TempoPrescription | undefined {
  if (input.mode !== "repetition_sets" && input.mode !== "step_sets") return undefined;
  if (input.reviewedTempo) return input.reviewedTempo;
  const provenance = productionProvenance("prescription-compiler:tempo:v1");
  if (
    input.context.explicitPowerObjective &&
    input.context.powerIntentPermittedByExerciseKnowledge &&
    !input.hasConflictingPainRequirement &&
    input.mode === "repetition_sets"
  ) {
    return {
      kind: "intent_only",
      intent: input.context.explicitPowerObjective,
      provenance,
    };
  }
  return {
    kind: "intent_only",
    intent: input.supportingWork
      ? "controlled"
      : input.context.requestedTempoIntent ?? "natural",
    provenance,
  };
}
