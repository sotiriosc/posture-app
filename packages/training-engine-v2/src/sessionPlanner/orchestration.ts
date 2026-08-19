import { deriveAlignmentPriorities } from "../alignment";
import {
  buildSessionCandidateResults,
  type SessionCandidateBuildOptions,
} from "../sessionComposer/candidatePools";
import { composeSessionSkeleton } from "../sessionComposer/composeSessionSkeleton";
import type { PlannedAndComposedSession, SessionIntentPlannerInput } from "./contracts";
import { planSessionIntent } from "./planSessionIntent";

export function planAndComposeSessionSkeleton(
  input: SessionIntentPlannerInput,
  options: SessionCandidateBuildOptions = {},
): PlannedAndComposedSession {
  const planning = planSessionIntent(input);
  if (planning.status !== "planned" || !planning.sessionIntent) {
    return { planning, candidateResultsByNeed: null, skeleton: null };
  }
  const candidateResultsByNeed = buildSessionCandidateResults(planning.sessionIntent, {
    athlete: input.athlete,
    assessment: input.assessment,
    alignmentPriorities: deriveAlignmentPriorities(input.assessment).priorities,
    painAndInjury: input.painAndInjury,
    trainingSafety: input.trainingSafety,
    equipment: input.currentEquipment.capabilities,
    history: input.history,
    satisfiedPrerequisiteIds: input.satisfiedPrerequisiteIds,
    evaluationAsOf: input.evaluationAsOf,
  }, options);
  return {
    planning,
    candidateResultsByNeed,
    skeleton: composeSessionSkeleton({ intent: planning.sessionIntent, candidateResultsByNeed }),
  };
}
