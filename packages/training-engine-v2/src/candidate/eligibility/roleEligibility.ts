import type { HardEligibilityComponent } from "./types";

export const roleEligibility: HardEligibilityComponent = {
  id: "role_eligibility",
  evaluate(exercise, context) {
    if (!context.requestedRole || exercise.trainingRoles.includes(context.requestedRole)) {
      return { rejectionReasons: [], warnings: [] };
    }

    return {
      rejectionReasons: [
        {
          code: "ROLE_MISMATCH" as const,
          message: `${exercise.name} is not defined for ${context.requestedRole}.`,
          source: "exercise_schema" as const,
          evidence: [`roles: ${exercise.trainingRoles.join(", ")}`],
        },
      ],
      warnings: [],
    };
  },
};
