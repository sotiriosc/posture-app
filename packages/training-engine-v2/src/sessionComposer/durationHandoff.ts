import type {
  SessionDurationFeasibility,
  SessionDurationFeasibilityInput,
} from "./contracts";

export function evaluatePostPrescriptionDuration(
  input: SessionDurationFeasibilityInput,
): SessionDurationFeasibility {
  const byExercise = new Map(input.durationFacts.map((fact) => [fact.exerciseId, fact]));
  const missingExerciseIds = input.expectedExerciseIds.filter((exerciseId) => {
    const fact = byExercise.get(exerciseId);
    return !fact || fact.prescribedExerciseSeconds === undefined ||
      fact.explicitRestSeconds === undefined ||
      fact.explicitSetupTransitionSeconds === undefined;
  }).sort();
  const knownTotalSeconds = input.durationFacts.reduce((total, fact) =>
    total + (fact.prescribedExerciseSeconds ?? 0) + (fact.explicitRestSeconds ?? 0) +
      (fact.explicitSetupTransitionSeconds ?? 0),
  0);
  const availableSeconds = input.availableMinutes * 60;
  return {
    status: missingExerciseIds.length > 0
      ? "unknown_or_incomplete"
      : knownTotalSeconds <= availableSeconds ? "fits" : "over_budget",
    knownTotalSeconds,
    availableSeconds,
    missingExerciseIds,
    durationDeterminability: missingExerciseIds.length > 0
      ? "unknown_or_incomplete"
      : "fully_explicit",
    unknownTempoContribution: true,
    explicitRestSetupDependency: input.durationFacts.some((fact) =>
      fact.explicitRestSeconds !== undefined ||
      fact.explicitSetupTransitionSeconds !== undefined),
    noInventedSessionTime: true,
  };
}
