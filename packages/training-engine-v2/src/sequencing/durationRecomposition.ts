import type { SessionIntent, SessionNeed, SessionSection } from "../domain/session";
import type { PrescriptionSessionCompilationResult } from "../prescription/compiler/contracts";
import type { SessionExerciseAssignment, SessionSkeleton } from "../sessionComposer";
import type { FinalSequencedSessionDurationInterval } from "./contracts";

export const DURATION_RECOMPOSITION_STATUSES = [
  "duration_within_known_bound",
  "duration_indeterminate",
  "session_local_recomposition_required",
  "required_or_upstream_work_cannot_fit",
  "required_or_upstream_work_not_proven_to_fit",
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
  const overKnownBound = lower > availableSeconds || (upper !== null && upper > availableSeconds);
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
    status = "session_local_recomposition_required";
    reasonCodes.push("CALCULATED_DURATION_EXCEEDS_AVAILABLE_BOUND",
      "REMOVE_SESSION_LOCAL_LOWER_PRIORITY_WORK_FIRST");
  } else if (lower > availableSeconds) {
    status = "required_or_upstream_work_cannot_fit";
    reasonCodes.push("REQUIRED_OR_UPSTREAM_WORK_LOWER_BOUND_EXCEEDS_AVAILABLE_DURATION");
  } else if (upper !== null && upper > availableSeconds) {
    status = "required_or_upstream_work_not_proven_to_fit";
    reasonCodes.push("REQUIRED_OR_UPSTREAM_WORK_NOT_PROVEN_TO_FIT");
  } else if (upper === null || unknowns.length > 0) {
    status = "duration_indeterminate";
    reasonCodes.push("DURATION_REMAINS_EXPLICITLY_INDETERMINATE");
  } else {
    status = "duration_within_known_bound";
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
    nextRemoval: status === "session_local_recomposition_required" ? candidate : null,
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
