import {
  buildCandidatePainMatchTrace,
  painEligibilityEvidence,
  receiverDecision,
} from "../pain";
import type { HardEligibilityComponent } from "./types";

export const contraindicationEligibility: HardEligibilityComponent = {
  id: "contraindication_eligibility",
  evaluate(exercise, context) {
    const trace = context.painMatchTrace ?? buildCandidatePainMatchTrace({
      exercise,
      painAndInjury: context.painAndInjury,
      requestedRole: context.requestedRole,
    });
    const hardDecision = receiverDecision(trace, "hard_contraindication");
    const acuteDecision = receiverDecision(trace, "acute_severe_eligibility");
    const contraindicationReasons = context.painAndInjury.hardContraindications.flatMap(
      (contraindication) => {
        if (!hardDecision.affectedSignalIds.includes(contraindication.id)) {
          return [];
        }

        return [{
          code: "HARD_CONTRAINDICATION" as const,
          message: contraindication.reason,
          source: "pain_injury" as const,
          evidence: [contraindication.id],
          painEvidence: painEligibilityEvidence({
            trace,
            receiver: "hard_contraindication",
            signalId: contraindication.id,
          }),
        }];
      },
    );
    const acutePainReasons = context.painAndInjury.acuteSeverePain.flatMap((pain) => {
      if (!acuteDecision.affectedSignalIds.includes(pain.id)) {
        return [];
      }

      return [{
        code: "HARD_CONTRAINDICATION" as const,
        message: pain.description,
        source: "pain_injury" as const,
        evidence: [pain.id],
        painEvidence: painEligibilityEvidence({
          trace,
          receiver: "acute_severe_eligibility",
          signalId: pain.id,
        }),
      }];
    });

    return {
      rejectionReasons: [...contraindicationReasons, ...acutePainReasons],
      warnings: [],
    };
  },
};
