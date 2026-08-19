import type {
  FinalSessionSequenceCompatibilityProjection,
  FinalSequencedSessionDurationInterval,
  ProductionSequencedAssignmentStep,
  ProductionSequencingTransitionFact,
} from "./contracts";

export function buildFinalSessionSequenceCompatibilityProjection(input: {
  readonly steps: readonly ProductionSequencedAssignmentStep[];
  readonly transitions: readonly ProductionSequencingTransitionFact[];
  readonly duration: FinalSequencedSessionDurationInterval;
}): FinalSessionSequenceCompatibilityProjection {
  return {
    orderedExerciseIds: input.steps.map((step) => step.exerciseId),
    orderedExerciseIdsBySection: {
      warmup: input.steps.filter((step) => step.section === "warmup").map((step) => step.exerciseId),
      activation: input.steps.filter((step) => step.section === "activation").map((step) => step.exerciseId),
      main: input.steps.filter((step) => step.section === "main").map((step) => step.exerciseId),
      accessory: input.steps.filter((step) => step.section === "accessory").map((step) => step.exerciseId),
      cooldown: input.steps.filter((step) => step.section === "cooldown").map((step) => step.exerciseId),
    },
    executionMode: "SEQUENTIAL_ASSIGNMENT_EXECUTION_ONLY",
    pairing: false,
    unresolvedTransitionFactIds: input.transitions
      .filter((transition) => transition.unknownTimingComponents.length > 0)
      .map((transition) => transition.transitionFactId),
    durationStatus: input.duration.status,
    nonCanonical: true,
  };
}
