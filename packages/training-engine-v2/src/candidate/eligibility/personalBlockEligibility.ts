import type { HardEligibilityComponent } from "./types";

export const personalBlockEligibility: HardEligibilityComponent = {
  id: "personal_block_eligibility",
  evaluate(exercise, context) {
    return {
      rejectionReasons: context.painAndInjury.personalExerciseBlocks.flatMap((block) => {
        const blocksExercise = block.exerciseIds?.includes(exercise.id) ?? false;
        const blocksFamily = block.exerciseFamilies?.includes(exercise.family) ?? false;
        if (!blocksExercise && !blocksFamily) {
          return [];
        }

        return [
          {
            code: "PERSONAL_BLOCK" as const,
            message: block.reason,
            source: "athlete_preference" as const,
            evidence: [block.id],
          },
        ];
      }),
      warnings: [],
    };
  },
};
