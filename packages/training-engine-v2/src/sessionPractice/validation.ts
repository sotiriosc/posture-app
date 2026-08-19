import { uniqueSorted } from "../prescription/compiler/utilities";
import type { SessionNeed, SessionNeedPriority } from "../domain/session";
import type {
  SessionPracticeAssignmentFacts,
  SessionPracticeRequest,
  SessionPracticeSourceSnapshot,
} from "./contracts";
import { SESSION_PRACTICE_OPTIONS_V2_BRIDGE_CONTRACT_REFERENCE } from "./contracts";
import { validateSessionPracticeRequest } from "./request";

function duplicates(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  return uniqueSorted(values.filter((value) => seen.has(value) || (seen.add(value), false)));
}

function priorityForNeeds(needs: readonly SessionNeed[]): SessionNeedPriority | "unallocated" {
  if (needs.some((need) => need.priority === "required")) return "required";
  if (needs.some((need) => need.priority === "preferred")) return "preferred";
  if (needs.some((need) => need.priority === "optional")) return "optional";
  return "unallocated";
}

function independentlyActiveSupportNeed(need: SessionNeed): boolean {
  return need.sourceEvidence.some((source) => source.sourceKind === "recovery_requirement" ||
    source.sourceKind === "assessment_priority" || source.sourceKind === "session_primary_purpose") ||
    need.dependencies.length === 0 && need.sourceEvidence.some((source) =>
      source.sourceKind !== "explicit_preparation_dependency");
}

export function validateSessionPracticeSourceSnapshot(
  source: SessionPracticeSourceSnapshot,
): readonly string[] {
  const reasons: string[] = [];
  if (source.bridgeContractReference.contractId !== SESSION_PRACTICE_OPTIONS_V2_BRIDGE_CONTRACT_REFERENCE.contractId ||
      source.bridgeContractReference.contractVersion !== SESSION_PRACTICE_OPTIONS_V2_BRIDGE_CONTRACT_REFERENCE.contractVersion) {
    reasons.push("UNSUPPORTED_SESSION_PRACTICE_BRIDGE_VERSION");
  }
  const required = [source.sourceSessionId, source.sourceSessionRevisionId, source.sourceSessionFingerprint,
    source.finalPrescribedSessionId, source.finalPrescribedSessionRevisionId, source.intent.id,
    source.skeleton.sessionIntentId, source.finalSequence.sequencePlanId, source.finalSequence.sequenceRevisionId,
    source.week.programId, source.week.programRevisionId, source.week.weekPlanId,
    source.week.weekPlanRevisionId, source.week.reservationId, source.week.reservationRevisionId,
    source.week.opportunityId, source.gate13.validationId, source.gate13.validationRevisionId,
    source.currentEquipmentReference, source.capturedAt];
  if (required.some((value) => !value.trim())) reasons.push("SESSION_PRACTICE_SOURCE_FIELD_REQUIRED");
  if (source.intent.id !== source.skeleton.sessionIntentId ||
      source.finalSequence.sessionIntentId !== source.intent.id) {
    reasons.push("SESSION_PRACTICE_SOURCE_SESSION_IDENTITY_CONFLICT");
  }
  if (source.skeleton.compositionStatus !== "valid") reasons.push("SESSION_PRACTICE_SOURCE_SKELETON_NOT_VALID");
  if (source.finalSequence.status !== "sequenced_exact_optimal" || source.finalSequence.executable !== true) {
    reasons.push("SESSION_PRACTICE_SOURCE_SEQUENCE_NOT_EXECUTABLE");
  }
  if (source.gate13.state !== "PASS") reasons.push("SESSION_PRACTICE_SOURCE_GATE_13_NOT_PASSED");
  if (!source.trainingReadiness.downstreamTrainingAllowed) reasons.push("SESSION_PRACTICE_BLOCKED_BY_TRAINING_SAFETY");
  if (source.policyVersionRefs.length === 0) reasons.push("SESSION_PRACTICE_SOURCE_POLICY_VERSIONS_REQUIRED");

  const assignmentIds = source.skeleton.assignments.map((assignment) => assignment.routinePrescriptionHandoffId);
  const stepAssignmentIds = source.finalSequence.steps.map((step) => step.assignmentId);
  const prescriptionIds = source.prescriptions.map((plan) => plan.prescriptionId);
  const sourceEventIds = source.prescriptions.map((plan) => plan.sourceExposureEvent.sourceExposureEventId);
  if (duplicates(assignmentIds).length) reasons.push("SESSION_PRACTICE_DUPLICATE_ASSIGNMENT_ID");
  if (duplicates(stepAssignmentIds).length) reasons.push("SESSION_PRACTICE_DUPLICATE_SEQUENCE_ASSIGNMENT_ID");
  if (duplicates(prescriptionIds).length) reasons.push("SESSION_PRACTICE_DUPLICATE_PRESCRIPTION_ID");
  if (duplicates(sourceEventIds).length) reasons.push("SESSION_PRACTICE_DUPLICATE_SOURCE_EVENT_ID");
  if (assignmentIds.length === 0 || source.prescriptions.length !== assignmentIds.length ||
      source.finalSequence.steps.length !== assignmentIds.length) {
    reasons.push("SESSION_PRACTICE_SOURCE_ASSIGNMENT_COVERAGE_INCOMPLETE");
  }
  for (const step of source.finalSequence.steps) {
    const assignment = source.skeleton.assignments.find((candidate) =>
      candidate.routinePrescriptionHandoffId === step.assignmentId);
    const plan = source.prescriptions.find((candidate) => candidate.prescriptionId === step.prescriptionId);
    if (!assignment || !plan || assignment.exerciseId !== step.exerciseId ||
        plan.exerciseId !== step.exerciseId ||
        plan.sourceExposureEvent.sourceExposureEventId !== step.sourceExposureEventId ||
        plan.prescriptionRevisionId !== step.finalPrescriptionRevisionId) {
      reasons.push(`SESSION_PRACTICE_SOURCE_LINEAGE_INCOMPLETE:${step.assignmentId}`);
    }
  }
  if (source.gate13.sourceExposureEventIds.length !== sourceEventIds.length ||
      sourceEventIds.some((eventId) => !source.gate13.sourceExposureEventIds.includes(eventId))) {
    reasons.push("SESSION_PRACTICE_GATE_13_SOURCE_EVENT_COVERAGE_INCOMPLETE");
  }
  return Object.freeze(uniqueSorted(reasons));
}

export function validateSessionPracticeRequestAgainstSource(input: {
  readonly request: SessionPracticeRequest;
  readonly source: SessionPracticeSourceSnapshot;
}): readonly string[] {
  const reasons = [...validateSessionPracticeRequest(input.request)];
  if (input.request.athleteId !== input.source.intent.athleteId ||
      input.request.sourceSessionIntentId !== input.source.intent.id ||
      input.request.sourceSessionSkeletonId !== input.source.skeleton.sessionIntentId ||
      input.request.sourceSessionSkeletonFingerprint !== input.source.sourceSessionFingerprint ||
      input.request.sourceFinalPrescribedSessionId !== input.source.finalPrescribedSessionId ||
      input.request.sourceFinalPrescribedSessionRevisionId !== input.source.finalPrescribedSessionRevisionId ||
      input.request.sourceProgramRevisionId !== input.source.week.programRevisionId ||
      input.request.sourceWeekPlanRevisionId !== input.source.week.weekPlanRevisionId ||
      input.request.sourceReservationRevisionId !== input.source.week.reservationRevisionId) {
    reasons.push("SESSION_PRACTICE_STALE_OR_CONFLICTING_SOURCE_REVISION");
  }
  return Object.freeze(uniqueSorted(reasons));
}

export function deriveSessionPracticeAssignmentFacts(
  source: SessionPracticeSourceSnapshot,
): readonly SessionPracticeAssignmentFacts[] {
  const assignmentById = new Map(source.skeleton.assignments.map((assignment) =>
    [assignment.routinePrescriptionHandoffId, assignment]));
  const needById = new Map(source.intent.needs.map((need) => [need.id, need]));
  const coverageByNeed = new Map<string, string[]>();
  for (const assignment of source.skeleton.assignments) {
    for (const needId of assignment.satisfiedNeedIds) {
      coverageByNeed.set(needId, [...(coverageByNeed.get(needId) ?? []), assignment.routinePrescriptionHandoffId]);
    }
  }
  const dependentByDependency = new Map<string, string[]>();
  for (const step of source.finalSequence.steps) {
    for (const dependencyId of step.dependencyAssignmentIds) {
      dependentByDependency.set(dependencyId, [...(dependentByDependency.get(dependencyId) ?? []), step.assignmentId]);
    }
  }
  return Object.freeze(source.finalSequence.steps.map((step) => {
    const assignment = assignmentById.get(step.assignmentId)!;
    const prescription = source.prescriptions.find((plan) => plan.prescriptionId === step.prescriptionId)!;
    const needs = assignment.satisfiedNeedIds.map((needId) => needById.get(needId)).filter(
      (need): need is SessionNeed => Boolean(need));
    const uniqueActiveNeedIds = needs.filter((need) =>
      need.priority !== "optional" && (coverageByNeed.get(need.id)?.length ?? 0) === 1).map((need) => need.id);
    const priority = priorityForNeeds(needs);
    return Object.freeze({
      assignment,
      assignmentId: step.assignmentId,
      sourceStep: step,
      prescription,
      priority,
      productiveRequiredAnchor: priority === "required" &&
        assignment.continuityClassification === "anchor",
      uniqueActiveNeedIds: Object.freeze(uniqueActiveNeedIds.sort()),
      independentlyActiveSupport: needs.some(independentlyActiveSupportNeed),
      dependentAssignmentIds: Object.freeze(uniqueSorted(dependentByDependency.get(step.assignmentId) ?? [])),
      dependencyAssignmentIds: Object.freeze(uniqueSorted(step.dependencyAssignmentIds)),
    });
  }));
}
