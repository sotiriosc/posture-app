import { describe, expect, it } from "vitest";
import {
  HISTORICAL_SESSION_PRACTICE_OPTIONS_V1,
  SESSION_PRACTICE_MODES,
  createSessionPracticeAttemptLifecycle,
  defaultSelectedSessionPracticeMode,
  deliberatelyRestartSessionPracticeAttempt,
  historicalPracticeModeForRecommendation,
  normalizeHistoricalSessionPracticeMode,
  projectFullSessionPractice,
  projectLighterSessionPractice,
  projectRecoverySessionPractice,
  realizeSessionPractice,
  recordSessionPracticeExecutionStart,
  replayHistoricalSessionPracticeSelection,
  selectSessionPracticeMode,
  validateSessionPracticeSourceSnapshot,
} from "../../src/sessionPractice";
import { makeSessionPracticeContext, makeSessionPracticeSource } from "../helpers/sessionPracticeFixtures";

describe("Session Practice Options V2 pure policies", () => {
  it("freezes exact historical V1 copy, aliases, and recommendation mapping", () => {
    expect(HISTORICAL_SESSION_PRACTICE_OPTIONS_V1.copy).toEqual({
      full: { label: "Full", description: "The whole session as planned." },
      lighter: { label: "Lighter", description: "Same movements, less work." },
      recovery: { label: "Recovery", description: "Mobility and easy movement only." },
    });
    expect(["steady", "full", "reduced", "simplified", "lighter", "recovery", "unknown"]
      .map(normalizeHistoricalSessionPracticeMode)).toEqual([
      "full", "full", "lighter", "lighter", "lighter", "recovery", "full",
    ]);
    expect(["normal", "repeat", "reduce", "simplify", "recover"]
      .map((mode) => historicalPracticeModeForRecommendation(mode as never)))
      .toEqual(["full", "full", "lighter", "lighter", "recovery"]);
  });

  it("replays the frozen V1 transformation without claiming V2 authority", () => {
    const items = [
      { id: "warmup", section: "warmup" as const },
      { id: "main", section: "main" as const, sets: "3" },
      { id: "accessory", section: "accessory" as const, recoverySearchText: "core control" },
      { id: "cooldown", section: "cooldown" as const },
    ];
    expect(replayHistoricalSessionPracticeSelection(items, "lighter").map((item) => [item.id, item.sets]))
      .toEqual([["warmup", undefined], ["main", "2"], ["cooldown", undefined]]);
    expect(replayHistoricalSessionPracticeSelection(items, "recovery").map((item) => item.id))
      .toEqual(["warmup", "accessory", "cooldown"]);
  });

  it("uses exactly three modes and defaults selection to Full independently of recommendation", () => {
    expect(SESSION_PRACTICE_MODES).toEqual(["full", "lighter", "recovery"]);
    expect(defaultSelectedSessionPracticeMode()).toBe("full");
  });

  it("validates a complete immutable source session", () => {
    expect(validateSessionPracticeSourceSnapshot(makeSessionPracticeSource())).toEqual([]);
  });

  it("makes Full an exact semantic pass-through", () => {
    const context = makeSessionPracticeContext("full");
    const projection = projectFullSessionPractice(context);
    const plan = realizeSessionPractice(context);
    expect(projection.availability.state).toBe("available");
    expect(projection.assignments.every((entry) => entry.state === "retained")).toBe(true);
    expect(projection.prescriptionRevisions).toEqual([]);
    expect(plan.finalSequence?.sequenceRevisionId).toBe(context.source.finalSequence.sequenceRevisionId);
    expect(plan.duration).toBe(context.source.finalSequence.duration);
    expect(plan.burdenDifference.source).toEqual(plan.burdenDifference.realized);
  });

  it("omits optional work while preserving required anchors and dependencies in Lighter", () => {
    const projection = projectLighterSessionPractice(makeSessionPracticeContext("lighter"));
    expect(projection.availability.state).toBe("available");
    expect(projection.assignments.find((entry) => entry.assignmentId === "accessory")?.state).toBe("omitted");
    expect(projection.assignments.find((entry) => entry.assignmentId === "main")?.state).toBe("retained");
    expect(projection.assignments.find((entry) => entry.assignmentId === "prep")?.state).toBe("retained");
    expect(projection.requiredResponsibilitiesSatisfied).toBe(true);
    expect(projection.availability.materiality.assignmentOmissionCount).toBeGreaterThan(0);
  });

  it("uses an admitted lower developmental bound only after structural omission is unavailable", () => {
    const projection = projectLighterSessionPractice(makeSessionPracticeContext("lighter", {
      includeOptional: false, includeRecovery: false, mainSets: "range",
    }));
    expect(projection.availability.state).toBe("available");
    expect(projection.prescriptionRevisions).toHaveLength(1);
    expect(projection.prescriptionRevisions[0]?.doseChanges[0]?.changedFieldRefs)
      .toEqual(["doseBlocks.block-main.dose.sets"]);
    expect(projection.prescriptionRevisions[0]?.doseChanges[0]?.newDose).toMatchObject({
      sets: { kind: "exact", value: 2 }, repetitions: { kind: "exact", value: 8 },
    });
  });

  it("fails Lighter closed when no material reduction exists", () => {
    const projection = projectLighterSessionPractice(makeSessionPracticeContext("lighter", {
      includeOptional: false, includeRecovery: false, mainSets: "exact-min",
    }));
    expect(projection.availability.state).toBe("unavailable_no_material_reduction");
    expect(projection.unresolvedRequirements).toContain("LIGHTER_REALIZATION_UNAVAILABLE");
  });

  it("builds Recovery only from explicit non-developmental ownership", () => {
    const projection = projectRecoverySessionPractice(makeSessionPracticeContext("recovery"));
    expect(projection.availability.state).toBe("available_with_pending_week_responsibility");
    expect(projection.developmentalCreditEligible).toBe(false);
    expect(projection.assignments.filter((entry) => entry.state !== "omitted").map((entry) => entry.assignmentId))
      .toEqual(["cooldown"]);
    expect(projection.assignments.find((entry) => entry.assignmentId === "cooldown")?.recoveryContributionLane)
      .toBe("recovery_support_only");
    expect(projection.assignments.find((entry) => entry.assignmentId === "main")?.state).toBe("omitted");
    expect(projection.noFallbackTrace).toContain("NO_KEYWORD_PARSING");
  });

  it("blocks every mode when TrainingSafety disallows ordinary training", () => {
    expect(["full", "lighter", "recovery"].map((mode) => {
      const context = makeSessionPracticeContext(mode as never, { safetyBlocked: true });
      return mode === "full" ? projectFullSessionPractice(context).availability.state : mode === "lighter" ?
        projectLighterSessionPractice(context).availability.state :
        projectRecoverySessionPractice(context).availability.state;
    })).toEqual(["blocked_by_training_safety", "blocked_by_training_safety", "blocked_by_training_safety"]);
  });

  it("allows pre-execution revisions and locks mode after the earliest execution event", () => {
    const full = makeSessionPracticeContext("full");
    const initial = createSessionPracticeAttemptLifecycle({ attemptId: full.request.attemptId,
      sourceSessionRevisionId: full.source.sourceSessionRevisionId });
    const selected = selectSessionPracticeMode({ lifecycle: initial, request: full.request,
      basedOnRevisionId: null, finalForExecution: true });
    expect(selected.status).toBe("selected");
    const started = recordSessionPracticeExecutionStart({ lifecycle: selected.lifecycle,
      event: "rpe_entry_committed", occurredAt: full.createdAt });
    const lighter = makeSessionPracticeContext("lighter");
    const locked = selectSessionPracticeMode({ lifecycle: started,
      request: { ...lighter.request, attemptId: full.request.attemptId },
      basedOnRevisionId: selected.realizationRevisionId, finalForExecution: true });
    expect(locked.status).toBe("locked");
    expect(locked.reasonCodes).toEqual(["SESSION_PRACTICE_MODE_LOCKED_AFTER_EXECUTION_START"]);
  });

  it("preserves an abandoned attempt when deliberate restart creates a new attempt", () => {
    const context = makeSessionPracticeContext("full");
    const lifecycle = createSessionPracticeAttemptLifecycle({ attemptId: context.request.attemptId,
      sourceSessionRevisionId: context.source.sourceSessionRevisionId });
    const restarted = deliberatelyRestartSessionPracticeAttempt({ lifecycle, newAttemptId: "attempt-2",
      occurredAt: context.createdAt });
    expect(restarted.abandoned).toMatchObject({ state: "abandoned", supersededByAttemptId: "attempt-2" });
    expect(restarted.replacement).toMatchObject({ state: "no_selection", attemptId: "attempt-2" });
  });
});
