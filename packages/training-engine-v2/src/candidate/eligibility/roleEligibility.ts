import type { HardEligibilityComponent } from "./types";

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
      context.targetMuscles?.length &&
      !overlaps([...exercise.primaryMuscles, ...exercise.secondaryMuscles], context.targetMuscles)
    ) {
      rejectionReasons.push({
        code: "TARGET_MUSCLE_MISMATCH" as const,
        message: `${exercise.name} does not train the requested target muscle(s).`,
        source: "session_intent" as const,
        evidence: [
          `requested muscles: ${context.targetMuscles.join(", ")}`,
          `candidate muscles: ${[...exercise.primaryMuscles, ...exercise.secondaryMuscles].join(", ")}`,
        ],
      });
    }

    return {
      rejectionReasons,
      warnings: [],
    };
  },
};
