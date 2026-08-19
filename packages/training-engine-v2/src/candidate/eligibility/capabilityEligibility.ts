import type { HardEligibilityComponent } from "./types";

export const capabilityEligibility: HardEligibilityComponent = {
  id: "capability_eligibility",
  evaluate(exercise, context) {
    return {
      rejectionReasons: exercise.prerequisites
        .filter((prerequisite) => prerequisite.type !== "required_setup_skill")
        .filter((prerequisite) => !context.satisfiedPrerequisiteIds.includes(prerequisite.id))
        .map((prerequisite) => ({
          code: "CAPABILITY_MISSING" as const,
          message: prerequisite.description,
          source: "assessment" as const,
          evidence: [prerequisite.id],
        })),
      warnings: [],
    };
  },
};
