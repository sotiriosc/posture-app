import {
  buildCandidatePainMatchTrace,
  painEligibilityEvidence,
  receiverDecision,
} from "../pain";
import type { HardEligibilityComponent } from "./types";

export const painReviewEligibility: HardEligibilityComponent = {
  id: "pain_review_eligibility",
  evaluate(exercise, context) {
    const trace = context.painMatchTrace ?? buildCandidatePainMatchTrace({
      exercise,
      painAndInjury: context.painAndInjury,
      requestedRole: context.requestedRole,
    });
    const warningDecision = receiverDecision(trace, "moderate_warning");

    return {
      rejectionReasons: [],
      warnings: context.painAndInjury.moderatePain.flatMap((pain) => {
        if (!warningDecision.affectedSignalIds.includes(pain.id)) {
          return [];
        }

        return [{
          code: "PAIN_REQUIRES_REVIEW" as const,
          message: `Moderate pain requires candidate review: ${pain.description}`,
          source: "pain_injury" as const,
          evidence: [pain.id],
          painEvidence: painEligibilityEvidence({
            trace,
            receiver: "moderate_warning",
            signalId: pain.id,
          }),
        }];
      }),
    };
  },
};
