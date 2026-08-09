import type { HardEligibilityComponent } from "./types";

export const setupEligibility: HardEligibilityComponent = {
  id: "setup_eligibility",
  evaluate(exercise, context) {
    return {
      rejectionReasons: exercise.prerequisites
        .filter((prerequisite) => prerequisite.type === "required_setup_skill")
        .filter((prerequisite) => !context.satisfiedPrerequisiteIds.includes(prerequisite.id))
        .map((prerequisite) => ({
          code: "SETUP_IMPOSSIBLE" as const,
          message: prerequisite.description,
          source: "setup" as const,
          evidence: [prerequisite.id],
        })),
      warnings: [],
    };
  },
};
