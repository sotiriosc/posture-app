import {
  SESSION_PRACTICE_ASSIGNMENT_DISPOSITION_CONTRACT_REFERENCE,
  SESSION_PRACTICE_FULL_POLICY_V1,
  SESSION_PRACTICE_OPTION_AVAILABILITY_CONTRACT_REFERENCE,
  type SessionPracticeNeedCoverage,
  type SessionPracticePolicyContext,
  type SessionPracticeStructuralProjection,
} from "./contracts";
import {
  deriveSessionPracticeAssignmentFacts,
  validateSessionPracticeRequestAgainstSource,
  validateSessionPracticeSourceSnapshot,
} from "./validation";

export function projectFullSessionPractice(
  context: SessionPracticePolicyContext,
): SessionPracticeStructuralProjection {
  const reasons = [...validateSessionPracticeSourceSnapshot(context.source),
    ...validateSessionPracticeRequestAgainstSource({ request: context.request, source: context.source })];
  const safetyBlocked = !context.source.trainingReadiness.downstreamTrainingAllowed;
  const sourceIncomplete = reasons.some((reason) => reason !== "SESSION_PRACTICE_BLOCKED_BY_TRAINING_SAFETY");
  const state = safetyBlocked ? "blocked_by_training_safety" :
    sourceIncomplete ? "blocked_by_source_session_incomplete" : "available";
  const facts = sourceIncomplete ? [] : deriveSessionPracticeAssignmentFacts(context.source);
  const assignments = facts.map((fact) => Object.freeze({
    contractReference: SESSION_PRACTICE_ASSIGNMENT_DISPOSITION_CONTRACT_REFERENCE,
    assignmentId: fact.assignmentId,
    exerciseId: fact.assignment.exerciseId,
    sourceExposureEventId: fact.prescription.sourceExposureEvent.sourceExposureEventId,
    state: "retained" as const,
    priority: fact.priority,
    productiveRequiredAnchor: fact.productiveRequiredAnchor,
    retainedBlockIds: Object.freeze(fact.prescription.doseBlocks.map((block) => block.blockId)),
    omittedBlockIds: Object.freeze([]),
    reasonCodes: Object.freeze(["FULL_EXACT_PASS_THROUGH"]),
    recoveryContributionLane: null,
    performanceCreated: false as const,
  }));
  const needCoverage = context.source.intent.needs.map((need): SessionPracticeNeedCoverage => {
    const sourceAssignmentIds = context.source.skeleton.assignments
      .filter((assignment) => assignment.satisfiedNeedIds.includes(need.id))
      .map((assignment) => assignment.routinePrescriptionHandoffId).sort();
    return Object.freeze({ needId: need.id, priority: need.priority,
      sourceAssignmentIds: Object.freeze(sourceAssignmentIds),
      retainedAssignmentIds: Object.freeze(sourceAssignmentIds), state: "preserved" });
  });
  return Object.freeze({
    mode: "full",
    availability: Object.freeze({
      contractReference: SESSION_PRACTICE_OPTION_AVAILABILITY_CONTRACT_REFERENCE,
      mode: "full",
      state,
      reasonCodes: Object.freeze(state === "available" ? ["FULL_SOURCE_EXECUTABLE"] : reasons),
      sourceEvidenceRefs: Object.freeze([context.source.sourceSessionRevisionId,
        context.source.finalSequence.sequenceRevisionId, context.source.gate13.validationRevisionId]),
      materiality: Object.freeze({ assignmentOmissionCount: 0, developmentalCountReduction: 0,
        explicitLowerVariantCount: 0, materialReduction: false,
        reasonCodes: Object.freeze(["FULL_REQUIRES_ZERO_SEMANTIC_DIFFERENCE"]) }),
      fallbackApplied: false,
    }),
    assignments: Object.freeze(assignments),
    dependencies: Object.freeze([]),
    prescriptionRevisions: Object.freeze([]),
    needCoverage: Object.freeze(needCoverage),
    purposePreserved: state === "available",
    requiredResponsibilitiesSatisfied: state === "available",
    sourceEventsPreserved: state === "available",
    developmentalCreditEligible: state === "available",
    unresolvedRequirements: Object.freeze(state === "available" ? [] : reasons),
    weekResponsibilityConsequences: Object.freeze(state === "available" ?
      ["NORMAL_GATE_13_AND_OUTCOME_SOURCE_TRUTH_APPLIES"] : ["NO_WEEK_CREDIT"]),
    noFallbackTrace: Object.freeze([SESSION_PRACTICE_FULL_POLICY_V1.policyId, "NO_FALLBACK"]),
  });
}
