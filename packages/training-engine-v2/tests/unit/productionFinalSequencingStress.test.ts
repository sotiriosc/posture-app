import { describe, expect, it } from "vitest";
import {
  PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
  buildProductionFinalSequenceRevision,
  buildProductionSequencingAssignmentFacts,
  buildProductionSequencingTransitionFacts,
  sequenceFinalSession,
  type ExplicitProductionSequencingTransitionFact,
  type FinalSequencingSearchResourcePolicy,
} from "../../src";
import { PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT } from "../cagt/prescriptionPolicyV1OwnerAdmission";
import { prepareSequencingCase } from "../helpers/sessionSequencingDesignLab";
import { prepareProductionFinalSequencingInput } from "../helpers/productionFinalSequencingLab";

const fixture = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.find((candidate) =>
  prepareSequencingCase(candidate).prescription.status === "compiled" && candidate.skeleton.assignments.length >= 2
)!;

describe("production Final Session Sequencing deterministic stress", () => {
  it("completes 1,000 exact searches, revision chains, and transition validations with 10,000 comparisons", () => {
    const input = prepareProductionFinalSequencingInput(fixture);
    const initial = sequenceFinalSession(input);
    const assignmentBuild = buildProductionSequencingAssignmentFacts(input);
    expect(initial.status).toBe("sequenced_exact_optimal");
    expect(assignmentBuild.findings).toEqual([]);
    const expectedOrder = JSON.stringify(initial.plan!.steps.map((step) => step.assignmentId));
    const [left, right] = initial.plan!.steps;
    let exactSearchCount = 0;
    let comparisonCount = 0;
    let revisionChainCount = 0;
    let transitionValidationCount = 0;
    for (let index = 0; index < 1_000; index += 1) {
      const repeated = sequenceFinalSession(input);
      expect(repeated.status).toBe("sequenced_exact_optimal");
      exactSearchCount += 1;
      for (let comparison = 0; comparison < 10; comparison += 1) {
        expect(JSON.stringify(repeated.plan!.steps.map((step) => step.assignmentId))).toBe(expectedOrder);
        comparisonCount += 1;
      }
      const transitionFact: ExplicitProductionSequencingTransitionFact = {
        sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
        transitionFactId: `stress:timing:${index}`,
        fromAssignmentId: left.assignmentId,
        toAssignmentId: right.assignmentId,
        executionAttemptId: input.executionAttemptId,
        factType: "setup_duration",
        sourceOwner: "coach_review",
        sourceRef: `stress:timing:${index}`,
        reviewState: "reviewed",
        target: { kind: "timing", value: { kind: "exact", seconds: index % 61 } },
        provenance: { source: "synthetic_contract_fixture", sourceRef: `stress:timing:${index}` },
      };
      const transitionBuild = buildProductionSequencingTransitionFacts({
        sequencingInput: { ...input, explicitTransitionFacts: [transitionFact] },
        assignmentFacts: assignmentBuild.facts,
      });
      expect(transitionBuild.findings).toEqual([]);
      transitionValidationCount += 1;
      const revisionBuild = buildProductionFinalSequenceRevision({
        sequencingContract: PRODUCTION_FINAL_SESSION_SEQUENCING_CONTRACT_REFERENCE,
        sequencePlanId: initial.sequencePlanId,
        executionAttemptId: input.executionAttemptId,
        policyRef: initial.policyRef!,
        assignments: assignmentBuild.facts,
        explicitTransitionFacts: [transitionFact],
        searchResourcePolicy: input.searchResourcePolicy as FinalSequencingSearchResourcePolicy,
        evaluationTime: new Date(Date.UTC(2026, 7, 14, 4, 0, index)).toISOString(),
        revisionContext: {
          ledger: initial.plan!.revisionLedger,
          reasonCode: "explicit_timing_fact_update",
          changedFieldRefs: [transitionFact.transitionFactId],
        },
      });
      expect(revisionBuild.errors).toEqual([]);
      expect(revisionBuild.ledger?.revisions).toHaveLength(2);
      revisionChainCount += 1;
    }
    expect({ exactSearchCount, comparisonCount, revisionChainCount, transitionValidationCount }).toEqual({
      exactSearchCount: 1_000,
      comparisonCount: 10_000,
      revisionChainCount: 1_000,
      transitionValidationCount: 1_000,
    });
  }, 30_000);
});
