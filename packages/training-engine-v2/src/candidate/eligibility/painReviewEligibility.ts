import type { HardEligibilityComponent } from "./types";

export const painReviewEligibility: HardEligibilityComponent = {
  id: "pain_review_eligibility",
  evaluate(exercise, context) {
    return {
      rejectionReasons: [],
      warnings: context.painAndInjury.moderatePain.flatMap((pain) => {
        const overlapsStress = pain.stressTags.some((tag) => exercise.cautionStressTags.includes(tag));
        if (!overlapsStress) {
          return [];
        }

        return [
          {
            code: "PAIN_REQUIRES_REVIEW" as const,
            message: `Moderate pain requires prescription review: ${pain.description}`,
            source: "pain_injury" as const,
            evidence: [pain.id],
          },
        ];
      }),
    };
  },
};
