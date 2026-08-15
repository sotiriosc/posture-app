import { sameSemanticValue, uniqueSorted } from "../prescription/compiler/utilities";
import type { ProductionAdaptationApplicationLocalityTrace,
  ProductionAdaptationApplicationOrchestrationInput, ProductionAdaptationApplicationOwnerResult } from "./contracts";

export function validateProductionAdaptationApplicationLocality(input: {
  readonly orchestrationInput: ProductionAdaptationApplicationOrchestrationInput;
  readonly ownerResult: ProductionAdaptationApplicationOwnerResult;
  readonly proposedProgramSnapshot: ProductionAdaptationApplicationOwnerResult["proposedProgramSnapshot"];
  readonly proposedWeekPlan: ProductionAdaptationApplicationOwnerResult["proposedWeekPlan"];
}): ProductionAdaptationApplicationLocalityTrace {
  const { currentProgramSnapshot, currentWeekPlan, directive } = input.orchestrationInput;
  const proposed = input.proposedProgramSnapshot;
  const allowed = new Set([directive.targetId, ...input.ownerResult.changedTargetIds,
    ...Object.keys(input.ownerResult.proposedEntityRevisions)]);
  const currentById = new Map(currentProgramSnapshot.entities.map((entity) => [entity.entityId, entity]));
  const proposedById = new Map((proposed?.entities ?? currentProgramSnapshot.entities)
    .map((entity) => [entity.entityId, entity]));
  const changedEntityIds = uniqueSorted([...new Set([...currentById.keys(), ...proposedById.keys()])]
    .filter((id) => !sameSemanticValue(currentById.get(id), proposedById.get(id))));
  const unexplained = changedEntityIds.filter((id) => !allowed.has(id));
  const currentSessions = new Map(currentProgramSnapshot.entities.filter((entity) => entity.kind === "session")
    .map((entity) => [entity.entityId, entity]));
  const proposedSessions = new Map((proposed?.entities ?? currentProgramSnapshot.entities)
    .filter((entity) => entity.kind === "session").map((entity) => [entity.entityId, entity]));
  const changedSessions = [...new Set([...currentSessions.keys(), ...proposedSessions.keys()])]
    .filter((id) => !sameSemanticValue(currentSessions.get(id), proposedSessions.get(id)));
  const allowedSessions = new Set(changedEntityIds.map((id) => currentById.get(id)?.sessionId ??
    proposedById.get(id)?.sessionId).filter((id): id is string => Boolean(id)));
  const unrelatedSessionsUnchanged = changedSessions.every((id) => allowed.has(id) || allowedSessions.has(id));
  const currentAnchors = currentProgramSnapshot.productiveAnchors.filter((anchor) => anchor.productive &&
    anchor.classification === "anchor" && anchor.exerciseId !== directive.targetId);
  const proposedAnchorIds = new Set((proposed?.productiveAnchors ?? currentProgramSnapshot.productiveAnchors)
    .filter((anchor) => anchor.productive && anchor.classification === "anchor").map((anchor) => anchor.exerciseId));
  const productiveAnchorsRetained = currentAnchors.every((anchor) => proposedAnchorIds.has(anchor.exerciseId));
  const warmupActivationDependencyTruthRetained = input.ownerResult.changedTargetIds.length === 0 ?
    sameSemanticValue(currentProgramSnapshot.supportingContinuity,
      proposed?.supportingContinuity ?? currentProgramSnapshot.supportingContinuity) : true;
  const weekChanged = input.proposedWeekPlan !== null && currentWeekPlan !== null &&
    input.proposedWeekPlan.weekPlanRevisionId !== currentWeekPlan.weekPlanRevisionId;
  const weekPermitted = !weekChanged || directive.action === "week_reallocation_review";
  const currentObjectiveIds = new Set(currentWeekPlan?.objectiveSatisfactionStates ?
    Object.keys(currentWeekPlan.objectiveSatisfactionStates) : []);
  const proposedObjectiveIds = new Set(input.proposedWeekPlan?.objectiveSatisfactionStates ?
    Object.keys(input.proposedWeekPlan.objectiveSatisfactionStates) : [...currentObjectiveIds]);
  const objectivesUnchanged = sameSemanticValue([...currentObjectiveIds].sort(), [...proposedObjectiveIds].sort());
  const reasons = uniqueSorted([
    ...(unexplained.length ? ["ADAPTATION_APPLICATION_UNRELATED_TARGET_CHANGED"] : []),
    ...(!unrelatedSessionsUnchanged ? ["ADAPTATION_APPLICATION_UNRELATED_SESSION_CHANGED"] : []),
    ...(!objectivesUnchanged ? ["ADAPTATION_APPLICATION_WEEK_OBJECTIVE_CHANGED"] : []),
    ...(!productiveAnchorsRetained ? ["ADAPTATION_APPLICATION_PRODUCTIVE_ANCHOR_DISPLACED"] : []),
    ...(!warmupActivationDependencyTruthRetained ? ["ADAPTATION_APPLICATION_SUPPORTING_DEPENDENCY_CORRUPTED"] : []),
    ...(!weekPermitted ? ["ADAPTATION_APPLICATION_UNAUTHORIZED_WEEK_CHANGE"] : []),
  ]);
  return Object.freeze({ targetChangedAsAuthorized: !unexplained.length,
    authorizedDimensionsChanged: input.ownerResult.changedDimensions.every((dimension) =>
      directive.implicatedPrescriptionDimensions.includes(dimension)),
    dependentChanges: Object.freeze(changedEntityIds.filter((id) => id !== directive.targetId)),
    unrelatedTargetsUnchanged: unexplained.length === 0, unrelatedSessionsUnchanged,
    unrelatedWeekObjectivesUnchanged: objectivesUnchanged, productiveAnchorsRetained,
    warmupActivationDependencyTruthRetained, currentGoalRetained: true, phaseStateUnapplied: true,
    weekPlanUnchangedUnlessReallocationCandidate: weekPermitted, actualLiveStateUnchanged: true,
    reasonCodes: Object.freeze(reasons) });
}

export function localityTraceValid(trace: ProductionAdaptationApplicationLocalityTrace): boolean {
  return trace.reasonCodes.length === 0 && trace.targetChangedAsAuthorized && trace.authorizedDimensionsChanged &&
    trace.unrelatedTargetsUnchanged && trace.unrelatedSessionsUnchanged && trace.unrelatedWeekObjectivesUnchanged &&
    trace.productiveAnchorsRetained && trace.warmupActivationDependencyTruthRetained && trace.currentGoalRetained &&
    trace.phaseStateUnapplied && trace.weekPlanUnchangedUnlessReallocationCandidate && trace.actualLiveStateUnchanged;
}
