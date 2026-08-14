import { describe, expect, it } from "vitest";
import {
  FINAL_SESSION_SECTION_PRECEDENCE,
  FINAL_SESSION_SEQUENCING_DESIGN_CONTRACT,
} from "../../src/sequencing/designContracts";
import {
  SESSION_SEQUENCING_CAGT_PAIR_IDS,
  SESSION_SEQUENCING_HARD_FAILURE_CATEGORIES,
  SESSION_SEQUENCING_POLICY_CANDIDATES,
  SESSION_SEQUENCING_POLICY_V1,
} from "../cagt/sessionSequencingPolicyV1";
import { PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT } from "../cagt/prescriptionPolicyV1OwnerAdmission";
import {
  buildFinalSessionSequencingAdmissionReport,
  buildPossibleSequencingTransitionFacts,
  buildSequencingAssignmentFacts,
  prepareSequencingCase,
  sequenceSessionDesignOnly,
} from "../helpers/sessionSequencingDesignLab";

describe("Final Session Sequencing Policy V1 design admission", () => {
  it("records the owner-selected sequential-only contract without production activation", () => {
    expect(SESSION_SEQUENCING_POLICY_V1.policyId).toBe("SESSION_SEQUENCING_POLICY_V1_CAUSAL_SEQUENTIAL");
    expect(SESSION_SEQUENCING_POLICY_V1.version).toBe("1.0.0");
    expect(SESSION_SEQUENCING_POLICY_V1.executionMode).toBe("SEQUENTIAL_ASSIGNMENT_EXECUTION_ONLY");
    expect(SESSION_SEQUENCING_POLICY_V1.productionActivationAuthorized).toBe(false);
    expect(FINAL_SESSION_SEQUENCING_DESIGN_CONTRACT.productionKernelImplemented).toBe(false);
    expect(FINAL_SESSION_SECTION_PRECEDENCE).toEqual(["warmup", "activation", "main", "accessory", "cooldown"]);
    expect(SESSION_SEQUENCING_POLICY_CANDIDATES).toHaveLength(7);
  });

  it("admits all required CAGT pairs and hard-failure categories", () => {
    expect(SESSION_SEQUENCING_CAGT_PAIR_IDS).toHaveLength(32);
    expect(SESSION_SEQUENCING_HARD_FAILURE_CATEGORIES).toHaveLength(32);
    expect(new Set(SESSION_SEQUENCING_CAGT_PAIR_IDS).size).toBe(32);
    expect(new Set(SESSION_SEQUENCING_HARD_FAILURE_CATEGORIES).size).toBe(32);
  });

  it("preserves every upstream assignment, Prescription identity, revision, and block order exactly once", () => {
    const fixture = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.find((entry) =>
      entry.expectedResolution === "compile" && entry.skeleton.assignments.length > 1)!;
    const prepared = prepareSequencingCase(fixture);
    const result = sequenceSessionDesignOnly(prepared.input);
    expect(result.status).toMatch(/exact_optimal|incomplete_due_to_unresolved_prescription/);
    expect(result.assignmentPreservation).toEqual({ addedCount: 0, removedCount: 0, duplicateCount: 0 });
    expect(result.steps.map((step) => step.exerciseId).sort()).toEqual(
      fixture.skeleton.assignments.map((assignment) => assignment.exerciseId).sort(),
    );
    for (const step of result.steps) {
      const plan = prepared.prescription.plans.find((entry) => entry.exerciseId === step.exerciseId)!;
      expect(step.sourceExposureEventId).toBe(plan.sourceExposureEvent.sourceExposureEventId);
      expect(step.prescriptionId).toBe(plan.prescriptionId);
      expect(step.prescriptionRevisionId).toBe(plan.prescriptionRevisionId);
      expect(step.doseBlockIds).toEqual(plan.doseBlocks.map((block) => block.blockId));
    }
    expect(result.compatibilityProjection.groupedExecution).toBe(false);
    const facts = buildSequencingAssignmentFacts(prepared.input);
    expect(buildPossibleSequencingTransitionFacts(prepared.input, facts)).toHaveLength(facts.length * (facts.length - 1));
  });

  it("keeps Candidate rank and assignment serialization outside final order", () => {
    const fixture = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.find((entry) =>
      entry.expectedResolution === "compile" && entry.skeleton.assignments.length > 1)!;
    const prepared = prepareSequencingCase(fixture);
    const original = sequenceSessionDesignOnly(prepared.input);
    const assignments = [...prepared.input.skeleton.assignments].reverse().map((assignment) => ({
      ...assignment,
      candidateEvidenceByNeed: assignment.candidateEvidenceByNeed.map((evidence) => ({
        ...evidence,
        candidateRank: evidence.candidateRank + 1000,
      })),
    }));
    const mutatedInput = {
      ...prepared.input,
      skeleton: { ...prepared.input.skeleton, assignments },
      sequencingHandoff: { ...prepared.input.sequencingHandoff, assignments },
    };
    const mutated = sequenceSessionDesignOnly(mutatedInput);
    expect(mutated.steps.map((step) => step.exerciseId)).toEqual(original.steps.map((step) => step.exerciseId));
  });

  it("blocks safety, rejects cycles, and does not rescue missing Prescription plans", () => {
    const fixture = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.find((entry) =>
      entry.expectedResolution === "compile" && entry.skeleton.assignments.length > 1)!;
    const prepared = prepareSequencingCase(fixture);
    const blocked = sequenceSessionDesignOnly({
      ...prepared.input,
      trainingSafetyStatus: "blocked",
      unresolvedTrainingSafetyRefs: ["training-safety:block"],
    });
    const cyclic = sequenceSessionDesignOnly({
      ...prepared.input,
      sequencingHandoff: { ...prepared.input.sequencingHandoff, graphAcyclic: false },
    });
    const missing = sequenceSessionDesignOnly({
      ...prepared.input,
      prescriptionSession: {
        ...prepared.input.prescriptionSession,
        plans: prepared.input.prescriptionSession.plans.slice(1),
      },
    });
    expect(blocked.status).toBe("blocked_by_training_safety");
    expect(blocked.steps).toEqual([]);
    expect(cyclic.status).toBe("infeasible");
    expect(cyclic.steps).toEqual([]);
    expect(missing.status).toBe("incomplete_due_to_unresolved_prescription");
    expect(missing.steps).toEqual([]);
  });

  it("rejects source-event and Prescription block-order mutations", () => {
    const fixture = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.find((entry) => {
      if (entry.expectedResolution !== "compile") return false;
      const prepared = prepareSequencingCase(entry);
      return prepared.prescription.plans.some((plan) => plan.doseBlocks.length > 1);
    })!;
    const prepared = prepareSequencingCase(fixture);
    const blockIndex = prepared.input.prescriptionSession.plans.findIndex((plan) => plan.doseBlocks.length > 1);
    const reorderedPlans = prepared.input.prescriptionSession.plans.map((plan, index) => index === blockIndex
      ? { ...plan, doseBlocks: [...plan.doseBlocks].reverse() } : plan);
    const sourceMutatedPlans = prepared.input.prescriptionSession.plans.map((plan, index) => index === 0 ? {
      ...plan,
      sourceExposureEvent: {
        ...plan.sourceExposureEvent,
        sourceExposureEventId: `${plan.sourceExposureEvent.sourceExposureEventId}:mutated`,
      },
    } : plan);
    expect(sequenceSessionDesignOnly({
      ...prepared.input,
      prescriptionSession: { ...prepared.input.prescriptionSession, plans: reorderedPlans },
    }).status).toBe("infeasible");
    expect(sequenceSessionDesignOnly({
      ...prepared.input,
      prescriptionSession: { ...prepared.input.prescriptionSession, plans: sourceMutatedPlans },
    }).status).toBe("infeasible");
  });

  it("produces a ready admission only when every hard-zero condition passes", () => {
    const report = buildFinalSessionSequencingAdmissionReport();
    expect(report.classification).toBe(
      "SESSION_SEQUENCING_POLICY_V1_READY_FOR_PRODUCTION_KERNEL_IMPLEMENTATION_AUTHORIZATION",
    );
    expect(report.ontologyClassification).toBe("FINAL_SEQUENCING_ONTOLOGY_READY");
    expect(Object.values(report.cagt.hardFailureCounts).every((count) => count === 0)).toBe(true);
    expect(report.productionSequencingImplemented).toBe(false);
    expect(report.productionActivationStatus).toBe("NOT_ACTIVATED");
  });
});
