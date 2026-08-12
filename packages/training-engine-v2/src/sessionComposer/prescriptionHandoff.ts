import type { CandidateRankingResult } from "../candidate";
import type { SessionIntent } from "../domain/session";
import type {
  SessionPrescriptionHandoff,
  SessionSkeleton,
} from "./contracts";

export function buildSessionPrescriptionHandoff(input: {
  readonly intent: SessionIntent;
  readonly skeleton: SessionSkeleton;
  readonly candidateResultsByNeed: Readonly<Record<string, CandidateRankingResult>>;
}): SessionPrescriptionHandoff {
  if (input.skeleton.compositionStatus !== "valid") {
    return { sessionIntentId: input.intent.id, assignments: [] };
  }
  return {
    sessionIntentId: input.intent.id,
    assignments: input.skeleton.assignments.map((assignment) => {
      const candidateEvidence = assignment.candidateEvidenceByNeed.map((evidence) => {
        const result = input.candidateResultsByNeed[evidence.needId];
        return result.rankedCandidates.find((candidate) =>
          candidate.exercise.id === assignment.exerciseId,
        );
      }).filter((entry) => entry !== undefined);
      const potentialStressTags = [...new Set(candidateEvidence.flatMap((candidate) =>
        candidate.painMatchTrace.exerciseStressPotentialTraces
          .filter((trace) => trace.requiresPrescriptionResolution)
          .map((trace) => trace.tag),
      ))].sort();
      const explicitRequirementRefs = [...new Set(candidateEvidence.flatMap((candidate) =>
        candidate.painExecutionReadiness.applicableRequirements.flatMap((requirement) => [
          requirement.signalId,
          ...requirement.evidence,
        ]),
      ))].sort();
      return {
        handoffId: assignment.routinePrescriptionHandoffId,
        exerciseId: assignment.exerciseId,
        phaseId: input.intent.phaseIntent.id,
        section: assignment.section,
        role: assignment.role,
        satisfiedNeedIds: assignment.satisfiedNeedIds,
        continuityEvidenceRefs: assignment.continuityEvidenceRefs,
        requiredPrescriptionResolutionIds: assignment.executionBlockingPrescriptionRequirementIds,
        potentialStressTags,
        explicitRequirementRefs,
        orderingConstraints: input.skeleton.orderingConstraints.filter((edge) =>
          edge.beforeExerciseId === assignment.exerciseId || edge.afterExerciseId === assignment.exerciseId,
        ),
        sourceExposureEventExpected: true as const,
      };
    }),
  };
}
