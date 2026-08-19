import { describe, expect, it } from "vitest";
import { evaluateProductionAdaptationApplicationPreconditions } from "../../src";
import { orchestrationInput } from "../helpers/applicationOrchestrationFixtures";

describe("adaptation application orchestration preconditions", () => {
  it("exposes every stale revision without silently rebasing", () => {
    const input = orchestrationInput();
    const actual = { ...input.preconditionSnapshot.actualCurrentRevisions,
      sourceSnapshotRevisionId: "new-source", programSnapshotRevisionId: "new-program",
      weekPlanRevisionId: "new-week", prescriptionRevisionId: "new-prescription",
      sequenceRevisionId: "new-sequence", phaseStateRevisionId: "new-phase" };
    const result = evaluateProductionAdaptationApplicationPreconditions({ request: input.request,
      snapshot: { ...input.preconditionSnapshot, actualCurrentRevisions: actual } });
    expect(result.state).toBe("blocked_stale");
    expect(result.reasonCodes).toEqual(expect.arrayContaining([
      "APPLICATION_SOURCE_SNAPSHOT_REVISION_STALE", "APPLICATION_PROGRAM_REVISION_STALE",
      "APPLICATION_WEEK_PLAN_REVISION_STALE", "APPLICATION_PRESCRIPTION_REVISION_STALE",
      "APPLICATION_SEQUENCE_REVISION_STALE", "APPLICATION_PHASE_STATE_REVISION_STALE",
    ]));
    expect(result.silentRebasePerformed).toBe(false);
  });

  it("gives Safety and conflict fail-stop precedence", () => {
    const input = orchestrationInput("progress_prescription_axis");
    const safety = evaluateProductionAdaptationApplicationPreconditions({ request: input.request,
      snapshot: { ...input.preconditionSnapshot, safetyAllowsMaterialOwnerCall: false,
        newerConflictingSourceRecordAbsent: false } });
    expect(safety.state).toBe("blocked_safety");
    expect(safety.failedPreconditions).toEqual(expect.arrayContaining([
      "safetyAllowsMaterialOwnerCall", "newerConflictingSourceRecordAbsent" ]));
  });
});
