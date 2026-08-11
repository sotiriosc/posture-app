import type { ExerciseDefinition } from "../../domain/exercise";
import type { PainAndInjuryState } from "../../domain/painInjury";
import { buildCanonicalPainEvidence } from "./painMatch";
import { buildPainReceiverDecisions } from "./receiverPolicies";
import { buildPainResponseRequirements } from "./responseRequirements";
import type { CandidatePainMatchTrace } from "./types";

export function buildCandidatePainMatchTrace(input: {
  readonly exercise: ExerciseDefinition;
  readonly painAndInjury: PainAndInjuryState;
  readonly requestedRole?: string;
}): CandidatePainMatchTrace {
  const evidence = buildCanonicalPainEvidence(input);

  return {
    ...evidence,
    receiverDecisions: buildPainReceiverDecisions({
      evidence,
      requestedRole: input.requestedRole,
    }),
    responseRequirements: buildPainResponseRequirements(evidence.signalTraces),
  };
}
