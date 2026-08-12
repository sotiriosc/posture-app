import { REFERENCE_EXERCISES } from "../data/referenceExercises";
import { evaluateEquipmentRequirement, type EquipmentCapabilities } from "../domain/equipment";
import type { ExerciseDefinition } from "../domain/exercise";
import type { TrainingHistory } from "../domain/history";
import type { PainAndInjuryState } from "../domain/painInjury";
import type { SessionContinuityEvidence, SessionNeed } from "../domain/session";
import type { TrainingResponseHistory } from "../domain/trainingResponse";
import type { PlannerContinuityTrace } from "./contracts";

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}

function intersects(left: readonly string[], right: readonly string[]): boolean {
  return left.some((value) => right.includes(value));
}

function exerciseServesNeed(exercise: ExerciseDefinition, need: SessionNeed): boolean {
  const actions = exercise.actionFunctions.map((entry) => entry.action);
  const muscles = exercise.muscleContributions
    .filter((entry) => entry.relationship === "primary_target" || entry.relationship === "key_secondary_target")
    .map((entry) => entry.muscle);
  return exercise.trainingRoles.includes(need.selection.requestedRole) && (
    intersects(exercise.movementRoles, need.selection.targetMovementRoles) ||
    intersects(actions, need.selection.targetActionFunctions) ||
    intersects(muscles, need.selection.targetMuscles) ||
    intersects(exercise.bodyRegions, need.selection.targetBodyRegions)
  );
}

export function deriveSessionContinuityEvidence(input: {
  readonly activeNeeds: readonly SessionNeed[];
  readonly history: TrainingHistory;
  readonly responses: TrainingResponseHistory;
  readonly equipment: EquipmentCapabilities;
  readonly painAndInjury: PainAndInjuryState;
}): { readonly evidence: SessionContinuityEvidence; readonly traces: readonly PlannerContinuityTrace[] } {
  const exerciseIds = unique([
    ...input.history.exerciseHistory.stableExerciseIds,
    ...input.history.exerciseHistory.blockedExerciseIds,
    ...input.history.exerciseHistory.events.map((event) => event.exerciseId),
    ...input.responses.observations.map((observation) => observation.exposure.exerciseId),
  ]);
  const identities: SessionContinuityEvidence["identities"][number][] = [];
  const traces: PlannerContinuityTrace[] = [];
  for (const exerciseId of exerciseIds) {
    const exercise = REFERENCE_EXERCISES.find((entry) => entry.id === exerciseId);
    const events = input.history.exerciseHistory.events.filter((entry) => entry.exerciseId === exerciseId);
    const responses = input.responses.observations.filter((entry) => entry.exposure.exerciseId === exerciseId);
    const activeNeedIds = exercise
      ? input.activeNeeds.filter((need) => exerciseServesNeed(exercise, need)).map((need) => need.id).sort()
      : unique(events.flatMap((event) => event.movementRole
        ? input.activeNeeds.filter((need) => need.selection.targetMovementRoles.includes(event.movementRole!)).map((need) => need.id)
        : []));
    const refs = unique([
      ...events.map((event) => event.id),
      ...responses.map((observation) => observation.observationId),
      ...(input.history.exerciseHistory.stableExerciseIds.includes(exerciseId) ? [`stable:${exerciseId}`] : []),
      ...(input.history.exerciseHistory.blockedExerciseIds.includes(exerciseId) ? [`blocked:${exerciseId}`] : []),
    ]);
    if (activeNeedIds.length === 0) {
      traces.push({ exerciseId, activeNeedIds: [], sourceEvidenceRefs: refs, disposition: "inactive_history_omitted" });
      continue;
    }
    const plateaued = events.some((event) => event.type === "plateau") || input.history.progressionState.stalledExerciseIds.includes(exerciseId);
    const failedProgression = events.some((event) => event.type === "progression_failure" || event.type === "failed_target");
    const repeatedAdverseEvidence = events.some((event) => event.type === "pain_response") ||
      responses.filter((response) => response.tolerance === "not_tolerated" || response.symptomChange === "worsened").length >= 2;
    const explicitlyBlocked = input.history.exerciseHistory.blockedExerciseIds.includes(exerciseId) ||
      input.painAndInjury.personalExerciseBlocks.some((block) => block.exerciseIds?.includes(exerciseId));
    const equipmentLost = exercise !== undefined && exercise.equipmentRequirements.some((requirement) =>
      !evaluateEquipmentRequirement(input.equipment, requirement).satisfied);
    const positiveEvent = events.some((event) => ["successful_completion", "appropriate_challenge", "progression_success"].includes(event.type));
    const positiveResponse = responses.some((response) => response.tolerance === "tolerated" && response.symptomChange !== "worsened");
    const stable = input.history.exerciseHistory.stableExerciseIds.includes(exerciseId);
    const productive = (positiveEvent || positiveResponse || stable) &&
      !plateaued && !failedProgression && !repeatedAdverseEvidence && !explicitlyBlocked && !equipmentLost;
    identities.push({
      exerciseId,
      previouslyServedNeedIds: activeNeedIds,
      responseReceiverTraceRefs: responses.map((response) => response.observationId).sort(),
      observationalClassification: productive ? "anchor" : stable ? "stable_supporting" : "rotation_eligible",
      productive,
      plateaued,
      failedProgression,
      equipmentLost,
      explicitlyBlocked,
      repeatedAdverseEvidence,
      sourceEvidenceRefs: refs,
    });
    traces.push({ exerciseId, activeNeedIds, sourceEvidenceRefs: refs, disposition: "included" });
  }
  return {
    evidence: { identities: identities.sort((a, b) => a.exerciseId.localeCompare(b.exerciseId)) },
    traces: traces.sort((a, b) => a.exerciseId.localeCompare(b.exerciseId)),
  };
}
