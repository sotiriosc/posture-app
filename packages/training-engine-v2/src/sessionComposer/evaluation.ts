import type { SessionIntent, SessionNeed } from "../domain/session";
import { SESSION_SECTIONS } from "../domain/session";
import type {
  CanonicalCompositionFact,
  SessionConcentrationTrace,
  SessionEvaluationVector,
} from "./contracts";
import type { WorkingAssignment, WorkingState } from "./internal";
import { evaluateSessionRedundancy } from "./redundancy";

const priorityWeight = { required: 0, preferred: 1, optional: 2 } as const;

export function orderedNeeds(intent: SessionIntent): readonly SessionNeed[] {
  return [...intent.needs].sort((left, right) =>
    priorityWeight[left.priority] - priorityWeight[right.priority] ||
    left.priorityOrder - right.priorityOrder ||
    left.id.localeCompare(right.id),
  );
}

function readiness(assignment: WorkingAssignment): readonly string[] {
  return assignment.coverage.map((entry) => entry.candidate.painExecutionReadiness.readiness);
}

function selectedNeedIds(state: WorkingState): Set<string> {
  return new Set(state.assignments.flatMap((assignment) =>
    assignment.coverage.map((coverage) => coverage.need.id),
  ));
}

export function evaluatePotentialConcentration(
  assignments: readonly WorkingAssignment[],
  facts: ReadonlyMap<string, CanonicalCompositionFact>,
): readonly SessionConcentrationTrace[] {
  const traces: SessionConcentrationTrace[] = [];
  const dimensions: readonly [string, (fact: CanonicalCompositionFact) => boolean][] = [
    ["high_local_fatigue", (fact) => fact.localFatigue === "high"],
    ["high_systemic_fatigue", (fact) => fact.systemicFatigue === "high"],
    ["high_axial_loading", (fact) => fact.axialLoading === "high"],
  ];
  for (const [dimension, predicate] of dimensions) {
    const exerciseIds = assignments
      .map((assignment) => assignment.exerciseId)
      .filter((id) => predicate(facts.get(id)!));
    if (exerciseIds.length > 1) traces.push({ dimension, exerciseIds: exerciseIds.sort() });
  }
  const stressIds = new Map<string, string[]>();
  for (const assignment of assignments) {
    const fact = facts.get(assignment.exerciseId)!;
    for (const tag of [...fact.intrinsicStressTags, ...fact.potentialStressTags]) {
      stressIds.set(tag, [...(stressIds.get(tag) ?? []), assignment.exerciseId]);
    }
  }
  for (const [tag, exerciseIds] of stressIds) {
    if (exerciseIds.length > 1) traces.push({ dimension: `stress:${tag}`, exerciseIds: exerciseIds.sort() });
  }
  return traces.sort((left, right) => left.dimension.localeCompare(right.dimension));
}

function unjustifiedDisplacementCount(input: {
  readonly intent: SessionIntent;
  readonly state: WorkingState;
}): number {
  const selectedIds = new Set(input.state.assignments.map((entry) => entry.exerciseId));
  const activeNeedIds = new Set(input.intent.needs.map((entry) => entry.id));
  let count = 0;
  for (const identity of input.intent.continuityEvidence.identities) {
    const stillActive = identity.previouslyServedNeedIds.some((id) => activeNeedIds.has(id));
    if (!identity.productive || !stillActive || selectedIds.has(identity.exerciseId)) continue;
    const justified = identity.equipmentLost || identity.explicitlyBlocked ||
      identity.repeatedAdverseEvidence || identity.failedProgression;
    if (justified) continue;
    const replacement = input.state.assignments.some((assignment) =>
      assignment.coverage.some((coverage) =>
        identity.previouslyServedNeedIds.includes(coverage.need.id),
      ),
    );
    if (replacement) count += 1;
  }
  return count;
}

function setupTransitions(
  assignments: readonly WorkingAssignment[],
  facts: ReadonlyMap<string, CanonicalCompositionFact>,
): number {
  const sectionIndex = new Map(SESSION_SECTIONS.map((section, index) => [section, index]));
  const signatures = [...assignments]
    .sort((left, right) =>
      (sectionIndex.get(left.section) ?? 0) - (sectionIndex.get(right.section) ?? 0) ||
      left.exerciseId.localeCompare(right.exerciseId),
    )
    .map((assignment) => facts.get(assignment.exerciseId)!.setupSignature);
  return signatures.slice(1).filter((signature, index) => signature !== signatures[index]).length;
}

export function evaluateWorkingState(input: {
  readonly intent: SessionIntent;
  readonly state: WorkingState;
  readonly facts: ReadonlyMap<string, CanonicalCompositionFact>;
}): SessionEvaluationVector {
  const selected = selectedNeedIds(input.state);
  const preferred = orderedNeeds(input.intent).filter((need) => need.priority === "preferred");
  const optional = orderedNeeds(input.intent).filter((need) => need.priority === "optional");
  const redundancy = evaluateSessionRedundancy(input.state.assignments, input.facts);
  const concentration = evaluatePotentialConcentration(input.state.assignments, input.facts);
  const reviewBurden = input.state.assignments.reduce((sum, assignment) =>
    sum + readiness(assignment).filter((entry) => entry === "REQUIRES_CANDIDATE_REVIEW").length,
  0);
  const nonAnchorPrescription = input.state.assignments.reduce((sum, assignment) => {
    const anchor = input.intent.continuityEvidence.identities.some((identity) =>
      identity.productive && identity.exerciseId === assignment.exerciseId,
    );
    return sum + (anchor ? 0 : readiness(assignment).filter((entry) => entry === "REQUIRES_PRESCRIPTION").length);
  }, 0);
  const rankVector = orderedNeeds(input.intent)
    .flatMap((need) => input.state.assignments.flatMap((assignment) =>
      assignment.coverage.filter((coverage) => coverage.need.id === need.id)
        .map((coverage) => coverage.candidate.rank),
    ));
  return {
    candidateReviewBurden: reviewBurden,
    unjustifiedProductiveAnchorDisplacementCount: unjustifiedDisplacementCount(input),
    dominantMainPurposeCovered: input.state.assignments.some((assignment) =>
      assignment.section === "main" && assignment.coverage.some((entry) => entry.need.priority === "required"),
    ),
    nonAnchorPrescriptionResolutionBurden: nonAnchorPrescription,
    preferredCoverageInPlannerOrder: preferred.map((need) => selected.has(need.id)),
    redundancyConflictBurden: redundancy.filter((entry) => entry.verdict === "redundant").length,
    fatigueStressConcentrationBurden: concentration.length,
    optionalCoverageInPlannerOrder: optional.map((need) => selected.has(need.id)),
    selectedIdentityCount: input.state.assignments.length,
    setupTransitionCount: setupTransitions(input.state.assignments, input.facts),
    localCandidateRankVector: rankVector,
    canonicalIdentityTieBreak: input.state.assignments.map((entry) => entry.exerciseId).sort().join("|"),
  };
}

function compareBooleanVectors(left: readonly boolean[], right: readonly boolean[]): number {
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    if ((left[index] ?? false) !== (right[index] ?? false)) return left[index] ? -1 : 1;
  }
  return 0;
}

function compareNumberVectors(left: readonly number[], right: readonly number[]): number {
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (left[index] ?? Number.MAX_SAFE_INTEGER) -
      (right[index] ?? Number.MAX_SAFE_INTEGER);
    if (difference !== 0) return difference;
  }
  return 0;
}

/** Negative means left is the owner-approved lexicographic winner. */
export function compareSessionEvaluations(
  left: SessionEvaluationVector,
  right: SessionEvaluationVector,
): number {
  return left.candidateReviewBurden - right.candidateReviewBurden ||
    left.unjustifiedProductiveAnchorDisplacementCount - right.unjustifiedProductiveAnchorDisplacementCount ||
    Number(right.dominantMainPurposeCovered) - Number(left.dominantMainPurposeCovered) ||
    left.nonAnchorPrescriptionResolutionBurden - right.nonAnchorPrescriptionResolutionBurden ||
    compareBooleanVectors(left.preferredCoverageInPlannerOrder, right.preferredCoverageInPlannerOrder) ||
    left.redundancyConflictBurden - right.redundancyConflictBurden ||
    left.fatigueStressConcentrationBurden - right.fatigueStressConcentrationBurden ||
    compareBooleanVectors(left.optionalCoverageInPlannerOrder, right.optionalCoverageInPlannerOrder) ||
    left.selectedIdentityCount - right.selectedIdentityCount ||
    left.setupTransitionCount - right.setupTransitionCount ||
    compareNumberVectors(left.localCandidateRankVector, right.localCandidateRankVector) ||
    left.canonicalIdentityTieBreak.localeCompare(right.canonicalIdentityTieBreak);
}
