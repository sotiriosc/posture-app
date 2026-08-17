import { uniqueSorted } from "../prescription/compiler/utilities";
import {
  SESSION_PRACTICE_GATE13_RECEIVER_CONTRACT_REFERENCE,
  type SessionPracticeRealizationPlan,
  type SessionPracticeSourceSnapshot,
} from "./contracts";

export interface SessionPracticeGate13ReceiverResult {
  readonly contractReference: typeof SESSION_PRACTICE_GATE13_RECEIVER_CONTRACT_REFERENCE;
  readonly status:
    | "validated_realized_plan"
    | "validated_realized_plan_pending_week_responsibility"
    | "failed_realized_plan";
  readonly mode: SessionPracticeRealizationPlan["mode"];
  readonly sourceValidationRevisionId: string;
  readonly realizationRevisionId: string;
  readonly realizedSourceEventIds: readonly string[];
  readonly omittedSourceEventIds: readonly string[];
  readonly revisedPrescriptionRevisionIds: readonly string[];
  readonly requiredResponsibilitySatisfied: boolean;
  readonly developmentalCreditAllowed: boolean;
  readonly plannedAsCompletedClaimCount: 0;
  readonly adaptationClaimCount: 0;
  readonly duplicateCreditCount: number;
  readonly omittedWorkCreditCount: number;
  readonly reasonCodes: readonly string[];
  readonly noDownstreamRescue: true;
}

export function receiveSessionPracticeAtGate13(input: {
  readonly source: SessionPracticeSourceSnapshot;
  readonly plan: SessionPracticeRealizationPlan;
}): SessionPracticeGate13ReceiverResult {
  const reasons: string[] = [];
  if (input.source.gate13.state !== "PASS") reasons.push("SOURCE_GATE_13_NOT_PASSED");
  if (input.plan.status !== "realized" || !input.plan.finalForExecution || !input.plan.finalSequence) {
    reasons.push("SESSION_PRACTICE_REALIZATION_NOT_EXECUTABLE");
  }
  if (!input.plan.purposePreserved) reasons.push("SESSION_PRACTICE_PURPOSE_NOT_PRESERVED");
  const retained = input.plan.assignments.filter((entry) => entry.state !== "omitted");
  const omitted = input.plan.assignments.filter((entry) => entry.state === "omitted");
  const realizedSourceEventIds = retained.map((entry) => entry.sourceExposureEventId);
  const duplicateCreditCount = realizedSourceEventIds.length - new Set(realizedSourceEventIds).size;
  const sequenceEventIds = input.plan.finalSequence?.steps.map((step) => step.sourceExposureEventId) ?? [];
  const omittedWorkCreditCount = omitted.filter((entry) => sequenceEventIds.includes(entry.sourceExposureEventId)).length;
  if (duplicateCreditCount) reasons.push("SESSION_PRACTICE_DUPLICATE_SOURCE_EVENT_CREDIT");
  if (omittedWorkCreditCount) reasons.push("SESSION_PRACTICE_OMITTED_WORK_CREDITED");
  if (realizedSourceEventIds.length !== sequenceEventIds.length ||
      realizedSourceEventIds.some((eventId) => !sequenceEventIds.includes(eventId))) {
    reasons.push("SESSION_PRACTICE_REALIZED_SOURCE_EVENT_SEQUENCE_MISMATCH");
  }
  const revisedPrescriptionRevisionIds = input.plan.prescriptionRevisions.map((revision) =>
    revision.revisedPrescriptionRevisionId);
  if (revisedPrescriptionRevisionIds.some((revisionId) =>
    !input.plan.finalSequence?.finalPrescriptionRevisionIds.includes(revisionId))) {
    reasons.push("SESSION_PRACTICE_REVISED_PRESCRIPTION_NOT_IN_FINAL_SEQUENCE");
  }
  const recoveryDevelopmentalCount = input.plan.mode === "recovery" ?
    input.plan.burdenDifference.realized.developmentalBlockCount : 0;
  if (recoveryDevelopmentalCount > 0) reasons.push("RECOVERY_DEVELOPMENTAL_CREDIT_PROHIBITED");
  const requiredResponsibilitySatisfied = input.plan.mode === "full" || input.plan.mode === "lighter" &&
    input.plan.needCoverage.filter((coverage) => coverage.priority === "required")
      .every((coverage) => coverage.state === "preserved");
  const failed = reasons.length > 0;
  return Object.freeze({
    contractReference: SESSION_PRACTICE_GATE13_RECEIVER_CONTRACT_REFERENCE,
    status: failed ? "failed_realized_plan" : requiredResponsibilitySatisfied ?
      "validated_realized_plan" : "validated_realized_plan_pending_week_responsibility",
    mode: input.plan.mode,
    sourceValidationRevisionId: input.source.gate13.validationRevisionId,
    realizationRevisionId: input.plan.realizationRevisionId,
    realizedSourceEventIds: Object.freeze(uniqueSorted(realizedSourceEventIds)),
    omittedSourceEventIds: Object.freeze(uniqueSorted(omitted.map((entry) => entry.sourceExposureEventId))),
    revisedPrescriptionRevisionIds: Object.freeze(uniqueSorted(revisedPrescriptionRevisionIds)),
    requiredResponsibilitySatisfied: !failed && requiredResponsibilitySatisfied,
    developmentalCreditAllowed: !failed && input.plan.mode !== "recovery",
    plannedAsCompletedClaimCount: 0,
    adaptationClaimCount: 0,
    duplicateCreditCount,
    omittedWorkCreditCount,
    reasonCodes: Object.freeze(failed ? uniqueSorted(reasons) : [requiredResponsibilitySatisfied ?
      "SESSION_PRACTICE_GATE_13_REALIZED_TRUTH_VALID" : "WEEK_RESPONSIBILITY_REMAINS_EXPLICIT"]),
    noDownstreamRescue: true,
  });
}
