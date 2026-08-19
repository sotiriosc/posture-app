import { describe, expect, it } from "vitest";
import {
  createSessionPracticeAttemptLifecycle,
  realizeSessionPractice,
  selectSessionPracticeMode,
} from "@praxis/training-engine-v2";
import { makeSessionPracticeContext } from "../../../training-engine-v2/tests/helpers/sessionPracticeFixtures";
import {
  DEFAULT_SESSION_PRACTICE_PRODUCT_ADAPTER_ROLLOUT,
  buildPersistedSessionPracticeRevision,
  buildSessionPracticeObservabilityEvent,
  buildSessionPracticeV2Draft,
  createDefaultOffSessionPracticeProductAdapter,
  createInMemorySessionPracticePersistenceRepository,
  loadSessionPracticeV2Migrations,
  replayExactSessionPracticeRevision,
  resumeSessionPracticeV2Draft,
  validateSessionPracticeObservabilityEvent,
} from "../../src/sessionPracticeV2";

const TIME = "2026-08-16T12:00:00.000Z";

function bundle(planFingerprint = "plan-fingerprint-1") {
  const context = makeSessionPracticeContext("lighter");
  const plan = realizeSessionPractice(context);
  const initial = createSessionPracticeAttemptLifecycle({ attemptId: plan.attemptId,
    sourceSessionRevisionId: plan.sourceSessionRevisionId });
  const selected = selectSessionPracticeMode({ lifecycle: initial, request: context.request,
    basedOnRevisionId: null, finalForExecution: true });
  if (selected.status !== "selected") throw new Error("fixture selection failed");
  const draft = buildSessionPracticeV2Draft({ plan, lifecycle: selected.lifecycle,
    currentPosition: { exerciseIndex: 1, blockIndex: 0, setIndex: 1 },
    actualPerformanceState: { "event-prep": { completed: true } },
    timers: [{ timerId: "timer-1", elapsedSeconds: 37, running: false }],
    substitutionReferences: [], updatedAt: TIME });
  return { context, plan, lifecycle: selected.lifecycle, draft,
    revision: buildPersistedSessionPracticeRevision({ basedOnPersistenceRevisionId: null,
      athleteId: context.source.intent.athleteId, lifecycle: selected.lifecycle, request: context.request,
      plan, completion: null, outcomeLink: null, draft, sourceFingerprint: context.source.sourceSessionFingerprint,
      planFingerprint, createdAt: TIME, evaluationTime: TIME }) };
}

describe("default-off V2 Session Practice bridge", () => {
  it("persists append-only revisions and returns exact retries without mutation", async () => {
    const { revision } = bundle();
    const repository = createInMemorySessionPracticePersistenceRepository();
    expect(await repository.appendRevision(revision)).toMatchObject({ status: "appended", mutationCount: 0,
      productWriteCount: 0 });
    expect(await repository.appendRevision(revision)).toMatchObject({ status: "exact_retry", mutationCount: 0,
      productWriteCount: 0 });
    expect(await repository.readExactRevision(revision.athleteId, revision.attemptId,
      revision.persistenceRevisionId)).toEqual(revision);
  });

  it("detects same-identity semantic conflict and missing based-on lineage", async () => {
    const first = bundle("plan-a").revision;
    const conflicting = bundle("plan-b").revision;
    expect(conflicting.persistenceRevisionId).toBe(first.persistenceRevisionId);
    expect(conflicting.semanticFingerprint).not.toBe(first.semanticFingerprint);
    const repository = createInMemorySessionPracticePersistenceRepository();
    await repository.appendRevision(first);
    expect(await repository.appendRevision(conflicting)).toMatchObject({ status: "idempotency_conflict" });
    const source = bundle("plan-c");
    const missingBasedOn = buildPersistedSessionPracticeRevision({ basedOnPersistenceRevisionId: "missing-revision",
      athleteId: source.context.source.intent.athleteId, lifecycle: source.lifecycle,
      request: source.context.request, plan: source.plan, completion: null, outcomeLink: null,
      draft: source.draft, sourceFingerprint: source.context.source.sourceSessionFingerprint,
      planFingerprint: "plan-c", createdAt: TIME, evaluationTime: TIME });
    expect(await repository.appendRevision(missingBasedOn)).toMatchObject({ status: "lineage_conflict",
      mutationCount: 0, productWriteCount: 0 });
  });

  it("replays only the requested exact contract version with no latest fallback", async () => {
    const { revision } = bundle();
    const repository = createInMemorySessionPracticePersistenceRepository();
    await repository.appendRevision(revision);
    expect(await replayExactSessionPracticeRevision({ repository, athleteId: revision.athleteId,
      attemptId: revision.attemptId, persistenceRevisionId: revision.persistenceRevisionId,
      expectedContractVersion: "1.0.0" })).toMatchObject({ status: "replayed_exact_version",
      latestFallbackApplied: false, productWriteApplied: false });
    expect(await replayExactSessionPracticeRevision({ repository, athleteId: revision.athleteId,
      attemptId: revision.attemptId, persistenceRevisionId: "missing", expectedContractVersion: "1.0.0" }))
      .toMatchObject({ status: "revision_not_found", latestFallbackApplied: false });
  });

  it("resumes the exact mode, position, performance, and timer state and rejects stale source", async () => {
    const { revision, draft } = bundle();
    const repository = createInMemorySessionPracticePersistenceRepository();
    await repository.appendRevision(revision);
    const resumed = await resumeSessionPracticeV2Draft({ repository, athleteId: revision.athleteId,
      attemptId: revision.attemptId, persistenceRevisionId: revision.persistenceRevisionId,
      currentSourceSessionRevisionId: revision.sourceSessionRevisionId });
    expect(resumed).toMatchObject({ status: "resumed_exact_revision", recomputedFromSource: false });
    expect(resumed.revision?.draft).toEqual(draft);
    expect(await resumeSessionPracticeV2Draft({ repository, athleteId: revision.athleteId,
      attemptId: revision.attemptId, persistenceRevisionId: revision.persistenceRevisionId,
      currentSourceSessionRevisionId: "stale-source" })).toMatchObject({
      status: "stale_source_conflict", recomputedFromSource: false,
    });
  });

  it("keeps the future Product adapter default-off with exact current copy", () => {
    const adapter = createDefaultOffSessionPracticeProductAdapter();
    expect(adapter.rollout).toEqual(DEFAULT_SESSION_PRACTICE_PRODUCT_ADAPTER_ROLLOUT);
    expect(adapter.mapDisplayMode("Full")).toBe("full");
    expect(adapter.mapDisplayMode("Lighter")).toBe("lighter");
    expect(adapter.mapDisplayMode("Recovery")).toBe("recovery");
    expect(adapter.attemptProductOutput()).toEqual({ status: "adapter_disabled", productOutput: null,
      persistenceWriteCount: 0, productShadowRunCount: 0 });
  });

  it("emits structured observability without prose, medical, photo, or hidden Product fields", () => {
    const { context, plan } = bundle();
    const event = buildSessionPracticeObservabilityEvent({ eventType: "mode_selected", plan,
      sourceSessionFingerprint: context.source.sourceSessionFingerprint, optionsEvaluated: ["full", "lighter", "recovery"],
      availabilityStates: { full: "available", lighter: "available",
        recovery: "available_with_pending_week_responsibility" }, suggestedMode: "full",
      executionLockEvent: false, completion: null, persistenceReplayStatus: null, occurredAt: TIME });
    expect(validateSessionPracticeObservabilityEvent(event)).toEqual([]);
    expect(event).toMatchObject({ productOutputApplied: false, productApplicationState: "NOT_ACTIVATED" });
    expect(event.sourceSessionFingerprint).toBe(context.source.sourceSessionFingerprint);
    expect(event.attemptId).toBe(plan.attemptId);
  });

  it("loads the isolated backward-compatible migration by locked checksum", () => {
    const migrations = loadSessionPracticeV2Migrations();
    expect(migrations).toHaveLength(1);
    expect(migrations[0]).toMatchObject({ migrationId: "001_session_practice_v2_attempt_revisions",
      checksum: "65e46f0d4dd0bd45ab3e90926f2c51af13a60099ac860e772104783ef7658886" });
    expect(migrations[0]?.sql).toContain("SESSION_PRACTICE_V2_REVISIONS_APPEND_ONLY");
  });
});
