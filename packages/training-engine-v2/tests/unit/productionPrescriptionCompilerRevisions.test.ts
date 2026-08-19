import { describe, expect, it } from "vitest";
import {
  compileSessionPrescription,
  validatePrescriptionRevisionLedger,
} from "../../src";
import { PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT } from "../cagt/prescriptionPolicyV1OwnerAdmission";
import {
  buildExactPriorEvidence,
  buildProductionCompilerInputForOwnerScenario,
} from "../helpers/productionPrescriptionCompiler";

const fixture = PRESCRIPTION_POLICY_V1_OWNER_HOLDOUT.find((entry) =>
  entry.expectedResolution === "compile"
)!;

describe("production Prescription revision and identity ledger", () => {
  it("keeps source and Prescription identity stable while appending immutable revisions", () => {
    const base = buildProductionCompilerInputForOwnerScenario(fixture);
    const initial = compileSessionPrescription(base);
    const handoffId = base.handoff.assignments[0].handoffId;
    const initialAssignment = initial.assignmentResults.find((entry) =>
      entry.handoffAssignment?.handoffId === handoffId
    )!;
    const firstLedgerSnapshot = JSON.stringify(initialAssignment.revisionLedger);
    const revised = compileSessionPrescription({
      ...base,
      evaluationTime: "2026-08-13T18:05:00-04:00",
      revisionContextByHandoffId: {
        ...base.revisionContextByHandoffId,
        [handoffId]: {
          ledger: initialAssignment.revisionLedger!,
          reasonCode: "coach_review",
          changedFieldRefs: ["doseBlocks.0.range"],
        },
      },
    });
    const revisedAssignment = revised.assignmentResults.find((entry) =>
      entry.handoffAssignment?.handoffId === handoffId
    )!;
    expect(revisedAssignment.sourceExposureEvent?.sourceExposureEventId).toBe(
      initialAssignment.sourceExposureEvent?.sourceExposureEventId,
    );
    expect(revisedAssignment.plan?.prescriptionId).toBe(initialAssignment.plan?.prescriptionId);
    expect(revisedAssignment.plan?.prescriptionRevisionId).not.toBe(
      initialAssignment.plan?.prescriptionRevisionId,
    );
    expect(revisedAssignment.revisionLedger?.revisions).toHaveLength(2);
    expect(revisedAssignment.revisionLedger?.supersessions).toHaveLength(1);
    expect(validatePrescriptionRevisionLedger(revisedAssignment.revisionLedger!)).toEqual([]);
    expect(JSON.stringify(initialAssignment.revisionLedger)).toBe(firstLedgerSnapshot);
  });

  it("rejects completed-history rewrites and two-final mutations", () => {
    const base = buildProductionCompilerInputForOwnerScenario(fixture);
    const initial = compileSessionPrescription(base);
    const handoffId = base.handoff.assignments[0].handoffId;
    const assignment = initial.assignmentResults.find((entry) =>
      entry.handoffAssignment?.handoffId === handoffId
    )!;
    const completedLedger = {
      ...assignment.revisionLedger!,
      completedRevisionIds: [assignment.revisionLedger!.finalRevisionId],
    };
    const attemptedRewrite = compileSessionPrescription({
      ...base,
      evaluationTime: "2026-08-13T18:10:00-04:00",
      revisionContextByHandoffId: {
        ...base.revisionContextByHandoffId,
        [handoffId]: {
          ledger: completedLedger,
          reasonCode: "coach_review",
          changedFieldRefs: ["doseBlocks"],
        },
      },
    });
    expect(attemptedRewrite.assignmentResults.find((entry) =>
      entry.handoffAssignment?.handoffId === handoffId
    )?.status).toBe("invalid_revision_context");

    const duplicateFinal = {
      ...assignment.revisionLedger!,
      revisions: [
        ...assignment.revisionLedger!.revisions,
        {
          ...assignment.revisionLedger!.revisions[0],
          prescriptionRevisionId: "mutated-second-final",
          basedOnRevisionId: assignment.revisionLedger!.finalRevisionId,
        },
      ],
      finalRevisionId: "mutated-second-final",
      finalRevisionIds: [
        assignment.revisionLedger!.finalRevisionId,
        "mutated-second-final",
      ],
    };
    expect(validatePrescriptionRevisionLedger(duplicateFinal)).not.toEqual([]);
  });

  it("retains exact prior load only with complete equivalent evidence", () => {
    const base = buildProductionCompilerInputForOwnerScenario(fixture);
    const first = compileSessionPrescription(base);
    const loadAssignment = first.assignmentResults.find((entry) =>
      entry.plan?.doseBlocks.some((block) =>
        block.purpose === "developmental_work" && block.dose.load?.kind === "user_selected_by_effort"
      )
    );
    const handoffId = loadAssignment?.handoffAssignment?.handoffId;
    expect(handoffId).toBeDefined();
    if (!handoffId) throw new Error("Expected a load-bearing assignment");
    const exactEvidence = buildExactPriorEvidence({ result: first, handoffId });
    const retained = compileSessionPrescription({
      ...base,
      priorRealizationEvidenceByHandoffId: {
        ...base.priorRealizationEvidenceByHandoffId,
        [handoffId]: exactEvidence,
      },
    });
    const rejected = compileSessionPrescription({
      ...base,
      priorRealizationEvidenceByHandoffId: {
        ...base.priorRealizationEvidenceByHandoffId,
        [handoffId]: { ...exactEvidence, exactIncrementStillAvailable: false },
      },
    });
    const retainedTrace = retained.assignmentResults.find((entry) =>
      entry.handoffAssignment?.handoffId === handoffId
    )?.decisionTrace.loadTrace;
    const rejectedTrace = rejected.assignmentResults.find((entry) =>
      entry.handoffAssignment?.handoffId === handoffId
    )?.decisionTrace.loadTrace;
    expect(retainedTrace?.status).toBe("EXACT_PRIOR_LOAD_RETAINED");
    expect(retainedTrace?.selectedLoad.kind).toBe("external_load");
    expect(rejectedTrace?.status).toBe("USER_SELECTED_BY_EFFORT");
    expect(rejectedTrace?.exactPriorRejectionReasonCodes).toContain("EXACT_INCREMENT_UNAVAILABLE");
  });
});
