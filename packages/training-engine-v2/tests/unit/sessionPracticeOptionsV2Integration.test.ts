import { describe, expect, it } from "vitest";
import {
  buildSessionPracticeLongitudinalObservation,
  buildSessionPracticeOutcomeSourceLink,
  buildSessionPracticeRemainingWeekHandoff,
  deriveSessionPracticeCompletionDisposition,
  realizeSessionPractice,
  receiveSessionPracticeAtGate13,
  sequenceSessionPracticeProjection,
  projectLighterSessionPractice,
  type SessionPracticeCompletionEvidence,
} from "../../src/sessionPractice";
import { makeSessionPracticeContext } from "../helpers/sessionPracticeFixtures";
import {
  CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V17,
  validateCagtEffectiveAuthorityRegistryV17,
} from "../cagt/effectiveAuthorityRegistryV17";

function evidenceFor(
  plan: ReturnType<typeof realizeSessionPractice>,
  performedSourceEventIds = plan.assignments.filter((entry) => entry.state !== "omitted")
    .map((entry) => entry.sourceExposureEventId),
): SessionPracticeCompletionEvidence {
  return {
    attemptId: plan.attemptId,
    realizationRevisionId: plan.realizationRevisionId,
    performedSourceEventIds,
    completedBlockIds: plan.assignments.filter((entry) => entry.state !== "omitted")
      .flatMap((entry) => entry.retainedBlockIds),
    partiallyCompletedBlockIds: [], abandoned: false, evidenceComplete: true,
    conflictingEvidence: false, completedAt: "2026-08-16T13:00:00.000Z",
  };
}

describe("Session Practice Options V2 evidence integration", () => {
  it("rebuilds transformed final Sequencing from retained assignments and revised prescriptions", () => {
    const context = makeSessionPracticeContext("lighter");
    const projection = projectLighterSessionPractice(context);
    const sequenced = sequenceSessionPracticeProjection({ context, projection });
    expect(sequenced.status).toBe("sequenced");
    expect(sequenced.sequence).toMatchObject({ recomputedFromExplicitFacts: true,
      dependencyOrderPreserved: true, blockOrderPreserved: true, noPairing: true });
    expect(sequenced.sequence?.steps.map((step) => step.assignmentId)).toEqual(["prep", "main"]);
    expect(sequenced.sequence?.duration.knownUpperBoundSeconds).toBeNull();
    expect(sequenced.sequence?.duration.noInventedTime).toBe(true);
  });

  it("carries an admitted dose revision into the rebuilt Sequence", () => {
    const plan = realizeSessionPractice(makeSessionPracticeContext("lighter", {
      includeOptional: false, includeRecovery: false, mainSets: "range",
    }));
    const revision = plan.prescriptionRevisions[0]!;
    expect(plan.status).toBe("realized");
    expect(plan.finalSequence?.finalPrescriptionRevisionIds).toContain(revision.revisedPrescriptionRevisionId);
    expect(plan.finalSequence?.steps.find((step) => step.assignmentId === "main")?.orderedDoseBlockIds)
      .toEqual(["block-main"]);
  });

  it("validates realized source events at Gate 13 without omitted or duplicate credit", () => {
    const context = makeSessionPracticeContext("lighter");
    const plan = realizeSessionPractice(context);
    const result = receiveSessionPracticeAtGate13({ source: context.source, plan });
    expect(result).toMatchObject({ status: "validated_realized_plan",
      requiredResponsibilitySatisfied: true, duplicateCreditCount: 0, omittedWorkCreditCount: 0,
      plannedAsCompletedClaimCount: 0, adaptationClaimCount: 0 });
    expect(result.omittedSourceEventIds).toEqual(["event-accessory", "event-cooldown"]);
  });

  it("keeps Recovery at zero developmental credit and leaves the original responsibility open", () => {
    const context = makeSessionPracticeContext("recovery");
    const plan = realizeSessionPractice(context);
    const gate13 = receiveSessionPracticeAtGate13({ source: context.source, plan });
    expect(gate13).toMatchObject({ status: "validated_realized_plan_pending_week_responsibility",
      requiredResponsibilitySatisfied: false, developmentalCreditAllowed: false });
    expect(plan.burdenDifference.realized.developmentalBlockCount).toBe(0);
  });

  it.each([
    ["full", "full_completed_as_prescribed"],
    ["lighter", "lighter_completed_required_responsibilities_satisfied"],
    ["recovery", "recovery_support_completed_original_responsibility_unfulfilled"],
  ] as const)("derives the %s completion disposition from performed realized evidence", (mode, expected) => {
    const context = makeSessionPracticeContext(mode);
    const plan = realizeSessionPractice(context);
    const gate13 = receiveSessionPracticeAtGate13({ source: context.source, plan });
    const completion = deriveSessionPracticeCompletionDisposition({ source: context.source, plan, gate13,
      evidence: evidenceFor(plan) });
    expect(completion.status).toBe(expected);
    expect(completion.automaticReallocationApplied).toBe(false);
    expect(completion.automaticDoublingApplied).toBe(false);
    expect(completion.adaptationActionApplied).toBe(false);
  });

  it("rejects Performance attached to an omitted assignment", () => {
    const context = makeSessionPracticeContext("lighter");
    const plan = realizeSessionPractice(context);
    const gate13 = receiveSessionPracticeAtGate13({ source: context.source, plan });
    const evidence = evidenceFor(plan, ["event-main", "event-accessory"]);
    const completion = deriveSessionPracticeCompletionDisposition({ source: context.source, plan, gate13, evidence });
    expect(completion.status).toBe("completion_conflict");
    expect(() => buildSessionPracticeOutcomeSourceLink({ plan, evidence, completion }))
      .toThrow("SESSION_PRACTICE_OMITTED_ASSIGNMENT_CANNOT_HAVE_PERFORMANCE");
  });

  it("links exact realized lineage into Outcome Source", () => {
    const context = makeSessionPracticeContext("lighter");
    const plan = realizeSessionPractice(context);
    const gate13 = receiveSessionPracticeAtGate13({ source: context.source, plan });
    const evidence = evidenceFor(plan);
    const completion = deriveSessionPracticeCompletionDisposition({ source: context.source, plan, gate13, evidence });
    const link = buildSessionPracticeOutcomeSourceLink({ plan, evidence, completion });
    expect(link.omittedAssignmentPerformanceCount).toBe(0);
    expect(link.selectedModeTreatedAsPerformance).toBe(false);
    expect(link.lineageByPerformedSourceEventId["event-main"]).toMatchObject({
      sourceExposureEventId: "event-main",
      sequenceRevisionId: plan.finalSequence?.sequenceRevisionId,
      prescriptionRevisionId: plan.finalSequence?.steps.find((step) => step.assignmentId === "main")
        ?.finalPrescriptionRevisionId,
    });
  });

  it("exposes completed evidence to Longitudinal as observation only", () => {
    const context = makeSessionPracticeContext("full");
    const plan = realizeSessionPractice(context);
    const gate13 = receiveSessionPracticeAtGate13({ source: context.source, plan });
    const evidence = evidenceFor(plan);
    const completion = deriveSessionPracticeCompletionDisposition({ source: context.source, plan, gate13, evidence });
    const link = buildSessionPracticeOutcomeSourceLink({ plan, evidence, completion });
    expect(buildSessionPracticeLongitudinalObservation({ source: context.source, plan, completion,
      outcomeLink: link })).toMatchObject({ observationOnly: true, automaticProgressionApplied: false,
      automaticRegressionApplied: false, automaticDeloadApplied: false, automaticReplacementApplied: false,
      repeatedCompletedEvidenceRequiredForAction: true });
  });

  it("creates a typed remaining-Week review handoff without applying or doubling work", () => {
    const context = makeSessionPracticeContext("recovery");
    const plan = realizeSessionPractice(context);
    const gate13 = receiveSessionPracticeAtGate13({ source: context.source, plan });
    const completion = deriveSessionPracticeCompletionDisposition({ source: context.source, plan, gate13,
      evidence: evidenceFor(plan) });
    expect(buildSessionPracticeRemainingWeekHandoff({ source: context.source, completion })).toMatchObject({
      completedHistoryPreserved: true, requestedAction: "remaining_week_reallocation_review",
      newOpportunityAdded: false, completedWorkMoved: false, originalReservationOverwritten: false,
      automaticReallocationApplied: false, automaticDoublingApplied: false, applicationOwnerRequired: true,
    });
  });

  it("publishes Registry V17 metadata without production imports or activation authority", () => {
    expect(validateCagtEffectiveAuthorityRegistryV17()).toEqual([]);
    expect(CAGT_EFFECTIVE_AUTHORITY_REGISTRY_V17).toMatchObject({
      sessionPracticeRequestAuthority: "ATHLETE_DAY_OF_REQUEST",
      sessionPracticeRealizerAuthority: "PRODUCTION_KERNEL_NOT_PRODUCT_RUNTIME",
      recommendationAuthority: "SUGGESTION_ONLY",
      Gate13PracticeReceiverAuthority: "PRODUCTION_KERNEL_NOT_PRODUCT_RUNTIME",
      ProductAdapterAuthority: "FUTURE_CONTROLLED_OWNER_DELIVERY_ONLY",
      ProductDecisionAuthority: "LEGACY_PRODUCT_OUTPUT_ONLY",
      ProductActivationAuthority: "NOT_AUTHORIZED",
      LongitudinalActionAuthority: "COMPLETED_REPEATED_EVIDENCE_REQUIRED",
      productionImportCount: 0,
    });
  });
});
