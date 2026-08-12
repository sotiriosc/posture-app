import type { CandidateRankingResult } from "../candidate";
import type { SessionIntent } from "../domain/session";
import type {
  SessionPrescriptionKnownRequirements,
  SessionPrescriptionHandoff,
  SessionSkeleton,
} from "./contracts";

function knownRequirements(
  candidates: readonly NonNullable<ReturnType<typeof findCandidate>>[],
): SessionPrescriptionKnownRequirements {
  const requirements = candidates.flatMap((candidate) =>
    candidate.painExecutionReadiness.applicableRequirements.map((requirement) => ({
      ...requirement,
      requirementId: `${requirement.signalId}:${requirement.requestedAction}`,
    })),
  );
  const signalSides = new Map(candidates.flatMap((candidate) => {
    const pain = candidate.painMatchTrace.signalTraces;
    return pain.filter((signal) => signal.side !== null)
      .map((signal) => [signal.signalId, signal.side] as const);
  }));
  const idsFor = (actions: readonly string[]) => [...new Set(requirements
    .filter((requirement) => actions.includes(requirement.requestedAction))
    .map((requirement) => requirement.requirementId))].sort();
  const classifiedActions = new Set([
    "increase_support", "prefer_support", "reduce_range", "reduce_load",
    "reduce_load_and_range",
  ]);
  return {
    sideRequirements: requirements.flatMap((requirement) => {
      const side = signalSides.get(requirement.signalId);
      return side ? [{ requirementId: requirement.requirementId, side }] : [];
    }).sort((left, right) => left.requirementId.localeCompare(right.requirementId)),
    supportRequirementIds: idsFor(["increase_support", "prefer_support"]),
    rangeRequirementIds: idsFor(["reduce_range", "reduce_load_and_range"]),
    loadRequirementIds: idsFor(["reduce_load", "reduce_load_and_range"]),
    leverRequirementIds: [],
    durationRequirementIds: [],
    distanceRequirementIds: [],
    stepRequirementIds: [],
    unclassifiedRequirementIds: [...new Set(requirements
      .filter((requirement) => !classifiedActions.has(requirement.requestedAction))
      .map((requirement) => requirement.requirementId))].sort(),
  };
}

function findCandidate(
  result: CandidateRankingResult,
  exerciseId: string,
) {
  return result.rankedCandidates.find((candidate) => candidate.exercise.id === exerciseId);
}

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
        return findCandidate(result, assignment.exerciseId);
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
        knownRequirements: knownRequirements(candidateEvidence),
        orderingConstraints: input.skeleton.orderingConstraints.filter((edge) =>
          edge.beforeExerciseId === assignment.exerciseId || edge.afterExerciseId === assignment.exerciseId,
        ),
        sourceExposureEventExpected: true as const,
      };
    }),
  };
}
