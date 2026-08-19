import type { SessionIntent, SessionNeed, SessionSection } from "../domain/session";
import type { PrescriptionSessionCompilationResult } from "../prescription/compiler/contracts";
import type { SessionExerciseAssignment, SessionSkeleton } from "../sessionComposer";
import type { FinalSequencedSessionDurationInterval } from "./contracts";

export const DURATION_RECOMPOSITION_STATUSES = [
  "duration_unknown",
  "duration_within_capacity",
  "duration_over_capacity_recomposable",
  "duration_over_capacity_required_work",
  "duration_recomposition_exhausted",
  "invalid_duration_recomposition_input",
] as const;

export type DurationRecompositionStatus =
  (typeof DURATION_RECOMPOSITION_STATUSES)[number];

export interface DurationRecompositionRemoval {
  readonly assignmentId: string;
  readonly exerciseId: string;
  readonly section: SessionSection;
  readonly removedNeedIds: readonly string[];
  readonly priority: "preferred" | "optional";
  readonly reasonCode: "REMOVE_SESSION_LOCAL_LOWER_PRIORITY_WORK_FIRST";
}

export interface DurationRecompositionDecision {
  readonly status: DurationRecompositionStatus;
  readonly sessionIntentId: string;
  readonly availableSeconds: number;
  readonly calculatedLowerBoundSeconds: number;
  readonly calculatedUpperBoundSeconds: number | null;
  readonly calculatedDurationStatus: string;
  readonly calculatedDurationDistinctFromAvailable: true;
  readonly accountedAssignmentIds: readonly string[];
  readonly accountedAssignmentIdsBySection: Readonly<Record<SessionSection, readonly string[]>>;
  readonly nextRemoval: DurationRecompositionRemoval | null;
  readonly protectedAssignmentIds: readonly string[];
  readonly unresolvedDurationComponents: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly noInventedTime: true;
}

export interface DurationRecompositionLoopBuild<TArtifact> {
  readonly skeleton: SessionSkeleton;
  readonly prescription: PrescriptionSessionCompilationResult;
  readonly finalDuration: FinalSequencedSessionDurationInterval;
  readonly artifact: TArtifact;
}

export interface DurationRecompositionLoopResult<TArtifact> {
  readonly status: Exclude<DurationRecompositionStatus, "duration_over_capacity_recomposable">;
  readonly finalIntent: SessionIntent;
  readonly finalBuild: DurationRecompositionLoopBuild<TArtifact>;
  readonly rebuildCount: number;
  readonly structuralIterationBound: number;
  readonly intentStateFingerprints: readonly string[];
  readonly decisions: readonly DurationRecompositionDecision[];
  readonly reasonCodes: readonly string[];
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort();
}

function isUpstreamOwned(need: SessionNeed): boolean {
  return need.sourceEvidence.some((source) => [
    "weekly_intent",
    "session_primary_purpose",
    "user_explicit_session_request",
  ].includes(source.sourceKind));
}

function assignmentNeeds(input: {
  readonly intent: SessionIntent;
  readonly assignment: SessionExerciseAssignment;
}): readonly SessionNeed[] {
  return input.intent.needs.filter((need) => input.assignment.satisfiedNeedIds.includes(need.id));
}

function canRemoveAssignment(input: {
  readonly intent: SessionIntent;
  readonly assignment: SessionExerciseAssignment;
}): boolean {
  const needs = assignmentNeeds(input);
  if (needs.length === 0 || input.assignment.section === "main") return false;
  if (needs.some((need) => need.priority === "required" || isUpstreamOwned(need))) return false;
  if (needs.some((need) => need.dependencies.some((dependency) => dependency.required))) return false;
  const needIds = new Set(needs.map((need) => need.id));
  const retainedDependencyTargetsRemovedNeed = input.intent.needs
    .filter((need) => !needIds.has(need.id))
    .some((need) => need.dependencies.some((dependency) =>
      dependency.required && dependency.targetNeedIds.some((id) => needIds.has(id))));
  return !retainedDependencyTargetsRemovedNeed;
}

const SECTION_REMOVAL_RANK: Readonly<Record<SessionSection, number>> = {
  cooldown: 0,
  accessory: 1,
  warmup: 2,
  activation: 3,
  main: 4,
};

function removalCandidate(input: {
  readonly intent: SessionIntent;
  readonly skeleton: SessionSkeleton;
}): DurationRecompositionRemoval | null {
  const candidates = input.skeleton.assignments.filter((assignment) =>
    canRemoveAssignment({ intent: input.intent, assignment }));
  const ordered = candidates.sort((left, right) => {
    const leftNeeds = assignmentNeeds({ intent: input.intent, assignment: left });
    const rightNeeds = assignmentNeeds({ intent: input.intent, assignment: right });
    const leftPriority = leftNeeds.every((need) => need.priority === "optional") ? 0 : 1;
    const rightPriority = rightNeeds.every((need) => need.priority === "optional") ? 0 : 1;
    return leftPriority - rightPriority ||
      SECTION_REMOVAL_RANK[left.section] - SECTION_REMOVAL_RANK[right.section] ||
      Math.max(...rightNeeds.map((need) => need.priorityOrder)) -
        Math.max(...leftNeeds.map((need) => need.priorityOrder)) ||
      left.routinePrescriptionHandoffId.localeCompare(right.routinePrescriptionHandoffId);
  });
  const selected = ordered[0];
  if (!selected) return null;
  const needs = assignmentNeeds({ intent: input.intent, assignment: selected });
  return {
    assignmentId: selected.routinePrescriptionHandoffId,
    exerciseId: selected.exerciseId,
    section: selected.section,
    removedNeedIds: needs.map((need) => need.id).sort(),
    priority: needs.every((need) => need.priority === "optional") ? "optional" : "preferred",
    reasonCode: "REMOVE_SESSION_LOCAL_LOWER_PRIORITY_WORK_FIRST",
  };
}

export function legallyRemovableDurationAssignmentIds(input: {
  readonly intent: SessionIntent;
  readonly skeleton: SessionSkeleton;
}): readonly string[] {
  return input.skeleton.assignments
    .filter((assignment) => canRemoveAssignment({ intent: input.intent, assignment }))
    .map((assignment) => assignment.routinePrescriptionHandoffId)
    .sort();
}

export function durationRecompositionStructuralBound(input: {
  readonly intent: SessionIntent;
  readonly skeleton: SessionSkeleton;
}): number {
  return legallyRemovableDurationAssignmentIds(input).length;
}

function prescriptionDuration(input: PrescriptionSessionCompilationResult): {
  readonly lower: number;
  readonly upper: number | null;
  readonly unknowns: readonly string[];
} {
  const intervals = input.plans.map((plan) => plan.durationInterval);
  const upperKnown = intervals.every((interval) => interval.knownUpperBoundSeconds !== null);
  return {
    lower: intervals.reduce((sum, interval) => sum + interval.knownLowerBoundSeconds, 0),
    upper: upperKnown
      ? intervals.reduce((sum, interval) => sum + interval.knownUpperBoundSeconds!, 0)
      : null,
    unknowns: unique(intervals.flatMap((interval) => interval.unknownComponents)),
  };
}

/** Plans one safe recomposition step. The caller must rebuild Composer and Prescription artifacts. */
export function planDurationAwareRecomposition(input: {
  readonly intent: SessionIntent;
  readonly skeleton: SessionSkeleton;
  readonly prescription: PrescriptionSessionCompilationResult;
  readonly finalDuration?: FinalSequencedSessionDurationInterval;
}): DurationRecompositionDecision {
  const assignmentIds = input.skeleton.assignments
    .map((assignment) => assignment.routinePrescriptionHandoffId).sort();
  const planAssignmentIds = input.prescription.plans
    .map((plan) => plan.sourceExposureEvent.sessionAssignmentId).sort();
  const assignmentsIn = (section: SessionSection): readonly string[] =>
    input.skeleton.assignments
      .filter((assignment) => assignment.section === section)
      .map((assignment) => assignment.routinePrescriptionHandoffId).sort();
  const bySection: Readonly<Record<SessionSection, readonly string[]>> = {
    warmup: assignmentsIn("warmup"),
    activation: assignmentsIn("activation"),
    main: assignmentsIn("main"),
    accessory: assignmentsIn("accessory"),
    cooldown: assignmentsIn("cooldown"),
  };
  const prescription = prescriptionDuration(input.prescription);
  const lower = input.finalDuration?.knownLowerBoundSeconds ?? prescription.lower;
  const upper = input.finalDuration?.knownUpperBoundSeconds ?? prescription.upper;
  const availableSeconds = input.finalDuration?.availableSeconds ?? input.intent.availableMinutes * 60;
  const unknowns = unique([
    ...prescription.unknowns,
    ...(input.finalDuration?.unknownComponents ?? []),
  ]);
  const invalid = input.prescription.status !== "compiled" ||
    assignmentIds.length !== planAssignmentIds.length ||
    assignmentIds.some((id, index) => id !== planAssignmentIds[index]) ||
    input.intent.id !== input.skeleton.sessionIntentId;
  const capacityKnown = input.finalDuration?.availableCapacityStatus !== "unknown";
  const overKnownBound = capacityKnown &&
    (lower > availableSeconds || (upper !== null && upper > availableSeconds));
  const candidate = overKnownBound
    ? removalCandidate({ intent: input.intent, skeleton: input.skeleton })
    : null;
  const protectedAssignmentIds = assignmentIds.filter((id) => id !== candidate?.assignmentId);
  let status: DurationRecompositionStatus;
  const reasonCodes: string[] = [];
  if (invalid) {
    status = "invalid_duration_recomposition_input";
    reasonCodes.push("ASSIGNMENT_OR_COMPILATION_IDENTITY_MISMATCH");
  } else if (overKnownBound && candidate) {
    status = "duration_over_capacity_recomposable";
    reasonCodes.push("CALCULATED_DURATION_EXCEEDS_AVAILABLE_BOUND",
      "REMOVE_SESSION_LOCAL_LOWER_PRIORITY_WORK_FIRST");
  } else if (capacityKnown && lower > availableSeconds) {
    status = "duration_over_capacity_required_work";
    reasonCodes.push("REQUIRED_OR_UPSTREAM_WORK_LOWER_BOUND_EXCEEDS_AVAILABLE_DURATION");
  } else if (capacityKnown && upper !== null && upper > availableSeconds) {
    status = "duration_over_capacity_required_work";
    reasonCodes.push("REQUIRED_OR_UPSTREAM_WORK_NOT_PROVEN_TO_FIT");
  } else if (upper === null || unknowns.length > 0) {
    status = "duration_unknown";
    reasonCodes.push("DURATION_REMAINS_EXPLICITLY_INDETERMINATE");
  } else {
    status = "duration_within_capacity";
    reasonCodes.push("CALCULATED_DURATION_WITHIN_AVAILABLE_BOUND");
  }
  return {
    status,
    sessionIntentId: input.intent.id,
    availableSeconds,
    calculatedLowerBoundSeconds: lower,
    calculatedUpperBoundSeconds: upper,
    calculatedDurationStatus: input.finalDuration?.status ?? input.prescription.sessionDurationInterval.status,
    calculatedDurationDistinctFromAvailable: true,
    accountedAssignmentIds: assignmentIds,
    accountedAssignmentIdsBySection: bySection,
    nextRemoval: status === "duration_over_capacity_recomposable" ? candidate : null,
    protectedAssignmentIds,
    unresolvedDurationComponents: unknowns,
    reasonCodes,
    noInventedTime: true,
  };
}

export function applyDurationRecompositionToIntent(input: {
  readonly intent: SessionIntent;
  readonly decision: DurationRecompositionDecision;
}): SessionIntent {
  const removal = input.decision.nextRemoval;
  if (input.decision.sessionIntentId !== input.intent.id || !removal) return input.intent;
  const removed = new Set(removal.removedNeedIds);
  return {
    ...input.intent,
    needs: input.intent.needs.filter((need) => !removed.has(need.id)),
    plannerSourceTrace: {
      ...input.intent.plannerSourceTrace,
      sourceRefs: unique([
        ...input.intent.plannerSourceTrace.sourceRefs,
        `duration-recomposition:${removal.assignmentId}`,
      ]),
    },
  };
}

/** Rebuilds through upstream authorities until duration fits or a typed terminal state is reached. */
export function executeBoundedDurationRecompositionLoop<TArtifact>(input: {
  readonly initialIntent: SessionIntent;
  readonly fingerprintIntent: (intent: SessionIntent) => string;
  readonly build: (intent: SessionIntent) => DurationRecompositionLoopBuild<TArtifact>;
}): DurationRecompositionLoopResult<TArtifact> {
  let currentIntent = input.initialIntent;
  let rebuildCount = 0;
  let structuralIterationBound: number | null = null;
  const intentStateFingerprints: string[] = [];
  const decisions: DurationRecompositionDecision[] = [];
  while (true) {
    const fingerprint = input.fingerprintIntent(currentIntent);
    if (intentStateFingerprints.includes(fingerprint)) {
      const finalBuild = input.build(currentIntent);
      return {
        status: "duration_recomposition_exhausted",
        finalIntent: currentIntent,
        finalBuild,
        rebuildCount,
        structuralIterationBound: structuralIterationBound ?? 0,
        intentStateFingerprints,
        decisions,
        reasonCodes: ["DURATION_RECOMPOSITION_REPEATED_INTENT_STATE"],
      };
    }
    intentStateFingerprints.push(fingerprint);
    const build = input.build(currentIntent);
    if (structuralIterationBound === null) {
      structuralIterationBound = durationRecompositionStructuralBound({
        intent: currentIntent,
        skeleton: build.skeleton,
      });
    }
    const decision = planDurationAwareRecomposition({
      intent: currentIntent,
      skeleton: build.skeleton,
      prescription: build.prescription,
      finalDuration: build.finalDuration,
    });
    decisions.push(decision);
    if (decision.status !== "duration_over_capacity_recomposable") {
      return {
        status: decision.status,
        finalIntent: currentIntent,
        finalBuild: build,
        rebuildCount,
        structuralIterationBound,
        intentStateFingerprints,
        decisions,
        reasonCodes: decision.reasonCodes,
      };
    }
    if (rebuildCount >= structuralIterationBound) {
      return {
        status: "duration_recomposition_exhausted",
        finalIntent: currentIntent,
        finalBuild: build,
        rebuildCount,
        structuralIterationBound,
        intentStateFingerprints,
        decisions,
        reasonCodes: ["DURATION_RECOMPOSITION_STRUCTURAL_BOUND_EXHAUSTED"],
      };
    }
    const recomposedIntent = applyDurationRecompositionToIntent({ intent: currentIntent, decision });
    const recomposedFingerprint = input.fingerprintIntent(recomposedIntent);
    if (recomposedFingerprint === fingerprint || intentStateFingerprints.includes(recomposedFingerprint)) {
      return {
        status: "duration_recomposition_exhausted",
        finalIntent: currentIntent,
        finalBuild: build,
        rebuildCount,
        structuralIterationBound,
        intentStateFingerprints,
        decisions,
        reasonCodes: ["DURATION_RECOMPOSITION_NON_MONOTONIC_OR_REPEATED_STATE"],
      };
    }
    currentIntent = recomposedIntent;
    rebuildCount += 1;
  }
}
