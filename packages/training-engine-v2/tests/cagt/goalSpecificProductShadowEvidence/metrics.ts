import { createHash } from "node:crypto";
import type { FullPrescribedProgramCagtResult } from "../fullProgramContracts";

export interface GoalSpecificPairObservation {
  readonly pairId: string;
  readonly family: string;
  readonly materiality: "material" | "inert";
  readonly classification: FullPrescribedProgramCagtResult["finalClassification"];
  readonly firstMaterialGate: string | null;
  readonly frameworkSame: boolean;
  readonly adaptiveSame: boolean;
  readonly exactProgramSame: boolean;
  readonly exerciseSame: boolean;
  readonly assignmentSame: boolean;
  readonly repsSame: boolean;
  readonly restSame: boolean;
  readonly tempoSame: boolean;
  readonly orderSame: boolean;
  readonly wrongLayer: boolean;
  readonly overAdaptation: boolean;
  readonly underAdaptation: boolean;
  readonly downstreamRescueAccepted: false;
}

function rate(values: readonly boolean[]): number {
  return values.length === 0 ? 0 : Number((values.filter(Boolean).length / values.length).toFixed(6));
}

export function observeGoalSpecificPair(input: {
  readonly pairId: string;
  readonly family: string;
  readonly materiality: "material" | "inert";
  readonly result: FullPrescribedProgramCagtResult;
}): GoalSpecificPairObservation {
  const changed = new Set(input.result.structuredDifferences.map((entry) => entry.dimension));
  return Object.freeze({
    pairId: input.pairId,
    family: input.family,
    materiality: input.materiality,
    classification: input.result.finalClassification,
    firstMaterialGate: input.result.firstMeaningfulDifference.actualFirstMaterialDifferenceGate,
    frameworkSame: input.result.frameworkRelationshipResult === "same",
    adaptiveSame: input.result.adaptiveContentRelationshipResult === "same",
    exactProgramSame: input.result.baselineSignatures.completeAdaptiveProgram.fingerprint ===
      input.result.counterfactualSignatures.completeAdaptiveProgram.fingerprint,
    exerciseSame: !changed.has("exercise_identity_distribution"),
    assignmentSame: !changed.has("selected_assignment_distribution"),
    repsSame: !changed.has("reps_distribution"),
    restSame: !changed.has("rest_distribution"),
    tempoSame: !changed.has("tempo_distribution"),
    orderSame: !changed.has("final_sequence_distribution"),
    wrongLayer: input.result.wrongLayerResult === "detected",
    overAdaptation: input.result.overAdaptationResult === "detected",
    underAdaptation: input.result.underAdaptationResult === "detected",
    downstreamRescueAccepted: false,
  });
}

export function buildGoalSpecificObservedMetrics(observations: readonly GoalSpecificPairObservation[]) {
  const firstMaterialDifferenceDistribution = Object.freeze(Object.fromEntries(
    [...new Set(observations.map((entry) => entry.firstMaterialGate ?? "none"))].sort()
      .map((gate) => [gate, observations.filter((entry) => (entry.firstMaterialGate ?? "none") === gate).length]),
  ));
  const semantic = Object.freeze({
    comparisonCount: observations.length,
    frameworkCollisionRate: rate(observations.map((entry) => entry.frameworkSame)),
    adaptiveCollisionRate: rate(observations.map((entry) => entry.adaptiveSame)),
    exactProgramCollisionRate: rate(observations.map((entry) => entry.exactProgramSame)),
    sameExerciseRate: rate(observations.map((entry) => entry.exerciseSame)),
    sameAssignmentRate: rate(observations.map((entry) => entry.assignmentSame)),
    sameRepsRate: rate(observations.map((entry) => entry.repsSame)),
    sameRestRate: rate(observations.map((entry) => entry.restSame)),
    sameTempoRate: rate(observations.map((entry) => entry.tempoSame)),
    sameOrderRate: rate(observations.map((entry) => entry.orderSame)),
    firstMaterialDifferenceDistribution,
    wrongLayerCount: observations.filter((entry) => entry.wrongLayer).length,
    overAdaptationCount: observations.filter((entry) => entry.overAdaptation).length,
    underAdaptationCount: observations.filter((entry) => entry.underAdaptation).length,
    acceptedDownstreamRescueCount: observations.filter((entry) => entry.downstreamRescueAccepted).length,
  });
  return Object.freeze({ ...semantic, fingerprint: createHash("sha256")
    .update(JSON.stringify(semantic)).digest("hex") });
}
