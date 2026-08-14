import { describe, expect, it } from "vitest";
import { PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT } from "../cagt/prescriptionPolicyV1OwnerAdmission";
import { prepareSequencingCase } from "../helpers/sessionSequencingDesignLab";
import {
  normalizedGoldenSemantics,
  prepareCatalogProductionFinalSequencingInput,
  prepareProductionFinalSequencingInput,
  PRODUCTION_FINAL_SEQUENCING_TEST_SEARCH_POLICY,
  runProductionFinalSequencing,
} from "../helpers/productionFinalSequencingLab";
import {
  buildProductionSequencingAssignmentFacts,
  buildProductionSequencingDependencyGraph,
  buildProductionSequencingTransitionFacts,
  EXERCISE_DOSE_MODES,
  REFERENCE_EXERCISES,
  searchExactFinalSessionSequence,
  sequenceFinalSession,
} from "../../src";

const completeFixtures = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.filter((fixture) =>
  prepareSequencingCase(fixture).prescription.status === "compiled"
);

describe("production Final Session Sequencing golden equivalence", () => {
  it("preserves all 107 complete admitted holdout orders and normalized semantics", () => {
    expect(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT).toHaveLength(132);
    expect(completeFixtures).toHaveLength(107);
    for (const fixture of completeFixtures) {
      const normalized = normalizedGoldenSemantics(fixture);
      expect(normalized.production, fixture.scenarioId).not.toBeNull();
      expect(normalized.production, fixture.scenarioId).toEqual(normalized.design);
    }
  });

  it("keys assignment and every possible directed transition by assignment identity", () => {
    const input = prepareProductionFinalSequencingInput(completeFixtures[0]);
    const assignmentBuild = buildProductionSequencingAssignmentFacts(input);
    const transitionBuild = buildProductionSequencingTransitionFacts({
      sequencingInput: input,
      assignmentFacts: assignmentBuild.facts,
    });
    expect(assignmentBuild.findings).toEqual([]);
    expect(transitionBuild.findings).toEqual([]);
    expect(transitionBuild.facts).toHaveLength(
      assignmentBuild.facts.length * (assignmentBuild.facts.length - 1),
    );
    expect(transitionBuild.facts.every((fact) =>
      fact.fromAssignmentId !== fact.toAssignmentId &&
      assignmentBuild.facts.some((assignment) => assignment.assignmentId === fact.fromAssignmentId) &&
      assignmentBuild.facts.some((assignment) => assignment.assignmentId === fact.toAssignmentId)
    )).toBe(true);
  });

  it("lets an authoritative reviewed interference fact override one derived dimension", () => {
    const input = prepareProductionFinalSequencingInput(completeFixtures[0]);
    const assignmentBuild = buildProductionSequencingAssignmentFacts(input);
    const [left, right] = assignmentBuild.facts;
    const transitionBuild = buildProductionSequencingTransitionFacts({
      sequencingInput: {
        ...input,
        explicitTransitionFacts: [{
          sequencingContract: input.sequencingContract,
          transitionFactId: "reviewed-interference:fixture",
          fromAssignmentId: left.assignmentId,
          toAssignmentId: right.assignmentId,
          executionAttemptId: input.executionAttemptId,
          factType: "interference",
          sourceOwner: "coach_review",
          sourceRef: "reviewed-interference:fixture",
          reviewState: "reviewed",
          target: {
            kind: "interference",
            value: {
              dimension: "grip_loading",
              classification: "reviewed_interference",
              basis: ["coach-confirmed grip carryover"],
              affectedActiveNeedIds: right.satisfiedNeedIds,
            },
          },
          provenance: { source: "coach_review", sourceRef: "reviewed-interference:fixture" },
        }],
      },
      assignmentFacts: assignmentBuild.facts,
    });
    expect(transitionBuild.findings).toEqual([]);
    const transition = transitionBuild.facts.find((fact) =>
      fact.fromAssignmentId === left.assignmentId && fact.toAssignmentId === right.assignmentId
    )!;
    expect(transition.interferenceObservations.find((observation) =>
      observation.dimension === "grip_loading"
    )).toMatchObject({
      classification: "reviewed_interference",
      reviewState: "reviewed",
      basis: ["coach-confirmed grip carryover"],
    });
  });

  it("keeps same/compatible setup separate from duration and never copies Prescription rest", () => {
    const input = prepareProductionFinalSequencingInput(completeFixtures[0]);
    const result = runProductionFinalSequencing(completeFixtures[0]);
    expect(result.status).toBe("sequenced_exact_optimal");
    const plan = result.plan!;
    const restIds = new Set(input.prescriptionSession.plans.flatMap((prescription) =>
      prescription.restInstructions.map((rest) => rest.restInstructionId)
    ));
    const unreviewedSetup = plan.transitionInstructions.filter((instruction) =>
      instruction.type === "setup" && instruction.sourceTransitionFactId === null
    );
    expect(unreviewedSetup.length).toBeGreaterThan(0);
    expect(unreviewedSetup.every((instruction) => instruction.target.kind === "unknown")).toBe(true);
    expect(plan.transitionInstructions.every((instruction) =>
      !restIds.has(instruction.instructionId) && !restIds.has(instruction.sourceTransitionFactId ?? "")
    )).toBe(true);
    expect(plan.steps.every((step) => step.sideOrder === "SIDE_ORDER_NOT_PRESCRIBED")).toBe(true);
    expect(plan.integrity.hardFailureCount).toBe(0);
    expect(plan.assignmentPreservationTrace).toMatchObject({
      additionCount: 0,
      removalCount: 0,
      duplicateCount: 0,
    });
    expect(plan.dependencyTrace.violationCount).toBe(0);
    expect(plan.blockAtomicityTrace).toMatchObject({ reorderCount: 0, interleavingCount: 0 });
    expect(plan.purposePreservationTrace.preserved).toBe(true);
    expect(plan.supportingWorkTrace.preserved).toBe(true);
  });

  it("covers all sections, roles, dose modes, and 45 canonical exercise identities", () => {
    const catalogInputs = REFERENCE_EXERCISES.map(prepareCatalogProductionFinalSequencingInput);
    const catalogResults = catalogInputs.map(sequenceFinalSession);
    expect(catalogResults.every((result) => [
      "sequenced_exact_optimal",
      "incomplete_due_to_unresolved_prescription",
      "invalid_session_input",
    ].includes(result.status))).toBe(true);
    expect(new Set(REFERENCE_EXERCISES.map((exercise) => exercise.id)).size).toBe(45);
    expect(catalogResults.filter((result) => result.status === "sequenced_exact_optimal").length).toBeGreaterThan(0);
    expect(new Set(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.flatMap((fixture) =>
      fixture.skeleton.assignments.map((assignment) => assignment.section)
    )).size).toBe(5);
    expect(new Set(PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.flatMap((fixture) =>
      fixture.skeleton.assignments.map((assignment) => assignment.role)
    )).size).toBe(7);
    expect(new Set(EXERCISE_DOSE_MODES).size).toBe(7);

    for (const input of catalogInputs) {
      const assignmentBuild = buildProductionSequencingAssignmentFacts(input);
      expect(assignmentBuild.findings).toEqual([]);
      expect(assignmentBuild.facts).toHaveLength(1);
      const graph = buildProductionSequencingDependencyGraph(assignmentBuild.facts);
      const transitionBuild = buildProductionSequencingTransitionFacts({
        sequencingInput: input,
        assignmentFacts: assignmentBuild.facts,
      });
      const search = searchExactFinalSessionSequence({
        facts: assignmentBuild.facts,
        graph,
        possibleTransitions: transitionBuild.facts,
        resourcePolicy: PRODUCTION_FINAL_SEQUENCING_TEST_SEARCH_POLICY,
      });
      expect(search.status).toBe("exact_optimal");
      expect(search.order?.[0].exerciseId).toBe(input.skeleton.assignments[0].exerciseId);
    }
  });
});
