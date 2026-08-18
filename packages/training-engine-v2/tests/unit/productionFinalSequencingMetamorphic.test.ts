import { describe, expect, it } from "vitest";
import {
  PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
  SESSION_SEQUENCING_POLICY_V1,
  buildProductionSequencingAssignmentFacts,
  buildProductionSequencingTransitionFacts,
  sequenceFinalSession,
  type ProductionFinalSessionSequencingInput,
} from "../../src";
import { PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT } from "../cagt/prescriptionPolicyV1OwnerAdmission";
import { prepareSequencingCase } from "../helpers/sessionSequencingDesignLab";
import { prepareProductionFinalSequencingInput } from "../helpers/productionFinalSequencingLab";

const fixture = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.find((candidate) =>
  prepareSequencingCase(candidate).prescription.status === "compiled" && candidate.skeleton.assignments.length >= 2
)!;

function plan(input: ProductionFinalSessionSequencingInput) {
  const result = sequenceFinalSession(input);
  expect(result.status).toBe("sequenced_exact_optimal");
  return result.plan!;
}

describe("production Final Session Sequencing metamorphic behavior", () => {
  it("is byte-equivalent under nonsemantic input, policy-rule, and transition-fact ordering", () => {
    const base = prepareProductionFinalSequencingInput(fixture);
    const expected = plan(base);
    const reorderRealization = (realization: typeof base.equipmentRealizations[number]) => ({
      ...realization,
      requirementTraces: [...realization.requirementTraces].reverse().map((trace) => ({
        ...trace,
        requestedCapabilities: [...trace.requestedCapabilities].reverse(),
        availableCapabilities: [...trace.availableCapabilities].reverse(),
        checks: [...trace.checks].reverse(),
      })),
    });
    const reordered: ProductionFinalSessionSequencingInput = {
      ...base,
      policy: { ...SESSION_SEQUENCING_POLICY_V1, rules: [...SESSION_SEQUENCING_POLICY_V1.rules].reverse() },
      skeleton: { ...base.skeleton, assignments: [...base.skeleton.assignments].reverse() },
      sequencingHandoff: { ...base.sequencingHandoff, assignments: [...base.sequencingHandoff.assignments].reverse() },
      prescriptionSession: {
        ...base.prescriptionSession,
        assignmentResults: [...base.prescriptionSession.assignmentResults].reverse().map((result) => ({
          ...result,
          equipmentRealization: result.equipmentRealization
            ? reorderRealization(result.equipmentRealization)
            : null,
        })),
        plans: [...base.prescriptionSession.plans].reverse(),
        sourceExposureEvents: [...base.prescriptionSession.sourceExposureEvents].reverse(),
      },
      compositionFacts: [...base.compositionFacts].reverse(),
      equipmentRealizations: [...base.equipmentRealizations].reverse().map(reorderRealization),
      explicitTransitionFacts: [...base.explicitTransitionFacts].reverse(),
      currentEquipment: {
        ...base.currentEquipment,
        supportSurfaces: [...base.currentEquipment.supportSurfaces].reverse(),
        machines: {
          ...base.currentEquipment.machines,
          availableMachineIds: [...base.currentEquipment.machines.availableMachineIds].reverse(),
        },
      },
    };
    expect(plan(reordered)).toEqual(expected);
  });

  it("is byte-equivalent under Candidate-rank and explanatory prose mutations after selection", () => {
    const base = prepareProductionFinalSequencingInput(fixture);
    const mutated: ProductionFinalSessionSequencingInput = {
      ...base,
      intent: {
        ...base.intent,
        needs: base.intent.needs.map((need) => ({
          ...need,
          explanation: `mutated prose:${need.id}`,
        })),
      },
      skeleton: {
        ...base.skeleton,
        assignments: base.skeleton.assignments.map((assignment) => ({
          ...assignment,
          candidateEvidenceByNeed: assignment.candidateEvidenceByNeed.map((evidence, index) => ({
            ...evidence,
            candidateRank: 10_000 - index,
          })),
        })),
      },
    };
    expect(plan(mutated)).toEqual(plan(base));
  });

  it("is byte-equivalent under irrelevant context, labels, and evidence-reference changes", () => {
    const base = prepareProductionFinalSequencingInput(fixture);
    const mutated: ProductionFinalSessionSequencingInput = {
      ...base,
      intent: {
        ...base.intent,
        assessmentContextRefs: ["irrelevant-assessment-context"],
        painResponseContextRefs: ["irrelevant-pain-context"],
        unresolvedWeeklyContextRefs: ["irrelevant-history-context"],
        phaseIntent: {
          ...base.intent.phaseIntent,
          name: "Changed display label with no sequencing authority",
        },
        plannerSourceTrace: {
          ...base.intent.plannerSourceTrace,
          sourceRefs: ["z-evidence", ...base.intent.plannerSourceTrace.sourceRefs, "a-evidence"],
        },
        needs: base.intent.needs.map((need) => ({
          ...need,
          sourceEvidence: need.sourceEvidence.map((evidence) => ({
            ...evidence,
            evidenceRefs: ["z-ref", ...evidence.evidenceRefs, "a-ref"],
          })),
        })),
      },
    };
    expect(plan(mutated)).toEqual(plan(base));
  });

  it("preserves normalized semantics when every explicit assignment identity changes coherently", () => {
    const base = prepareProductionFinalSequencingInput(fixture);
    const remap = new Map(base.skeleton.assignments.map((assignment, index) => [
      assignment.routinePrescriptionHandoffId,
      `equivalent-assignment:${index}`,
    ]));
    const remapEvent = <T extends { readonly sessionAssignmentId: string }>(event: T): T => ({
      ...event,
      sessionAssignmentId: remap.get(event.sessionAssignmentId) ?? event.sessionAssignmentId,
    });
    const equivalent: ProductionFinalSessionSequencingInput = {
      ...base,
      skeleton: {
        ...base.skeleton,
        assignments: base.skeleton.assignments.map((assignment) => ({
          ...assignment,
          routinePrescriptionHandoffId: remap.get(assignment.routinePrescriptionHandoffId)!,
        })),
      },
      sequencingHandoff: {
        ...base.sequencingHandoff,
        assignments: base.sequencingHandoff.assignments.map((assignment) => ({
          ...assignment,
          routinePrescriptionHandoffId: remap.get(assignment.routinePrescriptionHandoffId)!,
        })),
      },
      prescriptionSession: {
        ...base.prescriptionSession,
        sourceExposureEvents: base.prescriptionSession.sourceExposureEvents.map(remapEvent),
        plans: base.prescriptionSession.plans.map((prescription) => ({
          ...prescription,
          sourceExposureEvent: remapEvent(prescription.sourceExposureEvent),
        })),
        assignmentResults: base.prescriptionSession.assignmentResults.map((result) => ({
          ...result,
          assignment: result.assignment ? {
            ...result.assignment,
            routinePrescriptionHandoffId: remap.get(result.assignment.routinePrescriptionHandoffId)!,
          } : null,
          handoffAssignment: result.handoffAssignment ? {
            ...result.handoffAssignment,
            handoffId: remap.get(result.handoffAssignment.handoffId)!,
          } : null,
          sourceExposureEvent: result.sourceExposureEvent ? remapEvent(result.sourceExposureEvent) : null,
          plan: result.plan ? {
            ...result.plan,
            sourceExposureEvent: remapEvent(result.plan.sourceExposureEvent),
          } : null,
        })),
      },
    };
    const expected = plan(base);
    const actual = plan(equivalent);
    expect({
      ...actual.compatibilityProjection,
      unresolvedTransitionFactIds: actual.compatibilityProjection.unresolvedTransitionFactIds.length,
    }).toEqual({
      ...expected.compatibilityProjection,
      unresolvedTransitionFactIds: expected.compatibilityProjection.unresolvedTransitionFactIds.length,
    });
    expect(actual.steps.map((step) => ({ exerciseId: step.exerciseId, section: step.section, role: step.role })))
      .toEqual(expected.steps.map((step) => ({ exerciseId: step.exerciseId, section: step.section, role: step.role })));
    expect(actual.integrity.hardFailureCount).toBe(0);
  });

  it("responds materially to an explicit reviewed setup duration without inventing order authority", () => {
    const base = prepareProductionFinalSequencingInput(fixture);
    const initial = plan(base);
    const [left, right] = initial.steps;
    const timed: ProductionFinalSessionSequencingInput = {
      ...base,
      explicitTransitionFacts: [{
        sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
        transitionFactId: "metamorphic:explicit-setup",
        fromAssignmentId: left.assignmentId,
        toAssignmentId: right.assignmentId,
        executionAttemptId: base.executionAttemptId,
        factType: "setup_duration",
        sourceOwner: "coach_review",
        sourceRef: "metamorphic:explicit-setup",
        reviewState: "reviewed",
        target: { kind: "timing", value: { kind: "exact", seconds: 37 } },
        provenance: { source: "coach_review", sourceRef: "metamorphic:explicit-setup" },
      }],
    };
    const revised = plan(timed);
    expect(revised.compatibilityProjection.orderedExerciseIds)
      .toEqual(initial.compatibilityProjection.orderedExerciseIds);
    expect(revised.duration.knownLowerBoundSeconds).toBe(initial.duration.knownLowerBoundSeconds + 37);
    expect(revised.sequenceRevisionId).not.toBe(initial.sequenceRevisionId);
    expect(revised.sequencePlanId).toBe(initial.sequencePlanId);
  });

  it("responds materially to recovery timing, available budget, and actual equipment realization", () => {
    const base = prepareProductionFinalSequencingInput(fixture);
    const initial = plan(base);
    const [left, right] = initial.steps;
    const recovery = plan({
      ...base,
      explicitTransitionFacts: [{
        sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
        transitionFactId: "metamorphic:explicit-recovery",
        fromAssignmentId: left.assignmentId,
        toAssignmentId: right.assignmentId,
        executionAttemptId: base.executionAttemptId,
        factType: "inter_exercise_recovery",
        sourceOwner: "coach_review",
        sourceRef: "metamorphic:explicit-recovery",
        reviewState: "reviewed",
        target: { kind: "timing", value: { kind: "exact", seconds: 23 } },
        provenance: { source: "coach_review", sourceRef: "metamorphic:explicit-recovery" },
      }],
    });
    expect(recovery.duration.knownLowerBoundSeconds).toBe(initial.duration.knownLowerBoundSeconds + 23);
    const overBudget = sequenceFinalSession({
      ...base,
      intent: { ...base.intent, availableMinutes: 1 },
      availableMinutes: 1,
    });
    expect(overBudget.status).toBe("required_work_duration_infeasible");
    expect(overBudget.plan).toBeNull();
    expect(overBudget.decisionTrace.duration).toContain("definitely_over_budget");

    const assignmentBuild = buildProductionSequencingAssignmentFacts(base);
    const originalTransitions = buildProductionSequencingTransitionFacts({
      sequencingInput: base,
      assignmentFacts: assignmentBuild.facts,
    });
    const [firstFact, secondFact] = assignmentBuild.facts;
    const changedTransitions = buildProductionSequencingTransitionFacts({
      sequencingInput: base,
      assignmentFacts: [
        firstFact,
        { ...secondFact, equipmentSignature: firstFact.equipmentSignature },
      ],
    });
    const pair = (facts: typeof originalTransitions.facts) => facts.find((transition) =>
      transition.fromAssignmentId === firstFact.assignmentId &&
      transition.toAssignmentId === secondFact.assignmentId
    )!;
    expect(pair(originalTransitions.facts).equipmentRelationship).toBe("changed");
    expect(pair(changedTransitions.facts).equipmentRelationship).toBe("same");
  });

  it("responds materially to a typed Planner priority and dominant-purpose change", () => {
    const base = prepareProductionFinalSequencingInput(fixture);
    const initial = plan(base);
    const reversedPriorities = new Map([...base.intent.needs]
      .sort((left, right) => left.priorityOrder - right.priorityOrder)
      .map((need, index, needs) => [need.id, needs.length - index - 1]));
    const changed = plan({
      ...base,
      intent: {
        ...base.intent,
        needs: base.intent.needs.map((need) => ({
          ...need,
          priorityOrder: reversedPriorities.get(need.id)!,
        })),
      },
    });
    expect(changed.sequencePlanId).toBe(initial.sequencePlanId);
    expect(changed.sequenceRevisionId).not.toBe(initial.sequenceRevisionId);
    expect(changed.steps.map((step) => step.assignmentId))
      .not.toEqual(initial.steps.map((step) => step.assignmentId));
    expect(changed.purposePreservationTrace.preserved).toBe(true);
  });
});
