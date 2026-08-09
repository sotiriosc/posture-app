import type { HardEligibilityComponent } from "./types";

export const contraindicationEligibility: HardEligibilityComponent = {
  id: "contraindication_eligibility",
  evaluate(exercise, context) {
    const contraindicationReasons = context.painAndInjury.hardContraindications.flatMap((contraindication) => {
      const blocksExercise = contraindication.exerciseIds?.includes(exercise.id) ?? false;
      const blocksStress =
        contraindication.stressTags?.some(
          (tag) =>
            exercise.loading.jointStressTags.includes(tag) ||
            exercise.contraindicatedStressTags.includes(tag),
        ) ?? false;

      if (!blocksExercise && !blocksStress) {
        return [];
      }

      return [
        {
          code: "HARD_CONTRAINDICATION" as const,
          message: contraindication.reason,
          source: "pain_injury" as const,
          evidence: [contraindication.id],
        },
      ];
    });

    const acutePainReasons = context.painAndInjury.acuteSeverePain.flatMap((pain) => {
      const invalidatesRole =
        context.requestedRole && pain.invalidatesTrainingRoles.includes(context.requestedRole);
      const overlapsStress = pain.stressTags.some((tag) =>
        exercise.loading.jointStressTags.includes(tag),
      );

      if (!invalidatesRole && !overlapsStress) {
        return [];
      }

      return [
        {
          code: "HARD_CONTRAINDICATION" as const,
          message: pain.description,
          source: "pain_injury" as const,
          evidence: [pain.id],
        },
      ];
    });

    return {
      rejectionReasons: [...contraindicationReasons, ...acutePainReasons],
      warnings: [],
    };
  },
};
