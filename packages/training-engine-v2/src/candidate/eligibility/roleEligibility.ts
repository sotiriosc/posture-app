import type { HardEligibilityComponent } from "./types";
import { meaningfulTargetMuscles, musclesWithRelationships } from "../../domain/exercise";

function overlaps<T extends string>(left: readonly T[], right: readonly T[]): boolean {
  return left.some((value) => right.includes(value));
}

export const roleEligibility: HardEligibilityComponent = {
  id: "role_eligibility",
  evaluate(exercise, context) {
    const rejectionReasons = [];

    if (context.requestedRole && !exercise.trainingRoles.includes(context.requestedRole)) {
      rejectionReasons.push({
        code: "ROLE_MISMATCH" as const,
        message: `${exercise.name} is not defined for ${context.requestedRole}.`,
        source: "exercise_schema" as const,
        evidence: [`roles: ${exercise.trainingRoles.join(", ")}`],
      });
    }

    if (context.requestedSection) {
      const sectionSuitability = exercise.sectionSuitability[context.requestedSection]?.suitability;
      if (!sectionSuitability || sectionSuitability === "poor") {
        rejectionReasons.push({
          code: "SECTION_MISMATCH" as const,
          message: `${exercise.name} is not suitable for the requested ${context.requestedSection} section.`,
          source: "session_intent" as const,
          evidence: [`section: ${context.requestedSection}`, `defined sections: ${Object.keys(exercise.sectionSuitability).join(", ") || "none"}`],
        });
      }
    }

    if (
      context.targetMovementRoles?.length &&
      !overlaps(exercise.movementRoles, context.targetMovementRoles)
    ) {
      rejectionReasons.push({
        code: "MOVEMENT_ROLE_MISMATCH" as const,
        message: `${exercise.name} does not match the requested movement role(s).`,
        source: "session_intent" as const,
        evidence: [
          `requested movement roles: ${context.targetMovementRoles.join(", ")}`,
          `candidate movement roles: ${exercise.movementRoles.join(", ")}`,
        ],
      });
    }

    if (
      context.targetActionFunctions?.length &&
      !overlaps(
        exercise.actionFunctions.map((annotation) => annotation.action),
        context.targetActionFunctions,
      )
    ) {
      rejectionReasons.push({
        code: "TRAINING_NEED_MISMATCH" as const,
        message: `${exercise.name} does not satisfy the required action/function.`,
        source: "session_intent" as const,
        evidence: [
          `requested actions: ${context.targetActionFunctions.join(", ")}`,
          `candidate actions: ${exercise.actionFunctions.map((entry) => entry.action).join(", ") || "none"}`,
        ],
      });
    }

    const legalMuscles = context.muscleRequirement === "primary_required"
      ? musclesWithRelationships(exercise, ["primary_target"])
      : meaningfulTargetMuscles(exercise);

    if (
      context.targetMuscles?.length &&
      !overlaps(legalMuscles, context.targetMuscles)
    ) {
      rejectionReasons.push({
        code: "TARGET_MUSCLE_MISMATCH" as const,
        message: `${exercise.name} does not train the requested target muscle(s).`,
        source: "session_intent" as const,
        evidence: [
          `requested muscles: ${context.targetMuscles.join(", ")}`,
          `required relationship: ${context.muscleRequirement ?? "any_meaningful_contributor"}`,
          `candidate legal muscles: ${legalMuscles.join(", ")}`,
        ],
      });
    }

    return {
      rejectionReasons,
      warnings: [],
    };
  },
};
