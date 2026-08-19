import { describe, expect, it, vi } from "vitest";
import { orchestrationDependencies, orchestrationInput } from
  "../../../training-engine-v2/tests/helpers/applicationOrchestrationFixtures";
import { ADAPTATION_APPLICATION_ORCHESTRATION_MIGRATION_MANIFEST,
  createAdaptationApplicationOrchestrationService,
  loadAdaptationApplicationOrchestrationMigrations,
  NOOP_ADAPTATION_APPLICATION_ORCHESTRATION_OBSERVABILITY,
  replayAdaptationApplicationOrchestration,
  sanitizeAdaptationApplicationOrchestrationObservabilityEvent,
  type AdaptationApplicationOrchestrationPersistencePort,
  type PersistedAdaptationApplicationOrchestrationRun } from
  "../../src/adaptationApplicationOrchestration";

function memoryRepository() {
  let run: PersistedAdaptationApplicationOrchestrationRun | null = null;
  const calls: string[] = [];
  const repository: AdaptationApplicationOrchestrationPersistencePort = {
    transaction: async (work) => work({ transaction: true }),
    lockIdempotencyKey: async () => { calls.push("lock"); },
    getOrchestrationByIdempotencyKey: async () => run,
    persistOrchestrationRequestRevision: async (value) => { calls.push("request"); run = value; },
    persistPreconditionSnapshot: async () => { calls.push("preconditions"); },
    persistOwnerResult: async () => { calls.push("owner"); },
    persistShadowCandidate: async () => { calls.push("shadow"); },
    persistValidationResult: async () => { calls.push("validation"); },
    persistOrchestrationRevision: async () => { calls.push("revision"); },
    persistApplicationAttempt: async () => { calls.push("attempt"); },
    appendAuditEvent: async () => { calls.push("audit"); },
    readOrchestrationRun: async () => run,
    replayOrchestrationRun: async () => run,
  };
  return { repository, calls, getRun: () => run };
}

describe("adaptation application orchestration server service", () => {
  it("loads one explicit forward-only migration without automatic execution", () => {
    const migrations = loadAdaptationApplicationOrchestrationMigrations();
    expect(migrations).toHaveLength(1);
    expect(migrations[0]?.migrationId).toBe("002_adaptation_application_orchestration_v1");
    expect(ADAPTATION_APPLICATION_ORCHESTRATION_MIGRATION_MANIFEST).toMatchObject({
      automaticExecution: false, forwardFixOnly: true,
      requiresContract: "PRODUCTION_OUTCOME_SOURCE_PERSISTENCE@1.0.0",
    });
  });

  it("persists the complete unapplied bundle in one explicit transaction", async () => {
    const memory = memoryRepository();
    const service = createAdaptationApplicationOrchestrationService({ repository: memory.repository,
      pureDependencies: orchestrationDependencies(),
      observability: NOOP_ADAPTATION_APPLICATION_ORCHESTRATION_OBSERVABILITY,
      recheckCurrentRevisions: async () => true });
    const result = await service.orchestrateAdaptationApplication(
      orchestrationInput("keep_current", "build_and_persist_shadow_result"));
    expect(result.status).toBe("no_change_shadow_validated");
    expect(result.orchestrationRevision.persistenceState).toBe("persisted");
    expect(result.applicationApplied).toBe(false);
    expect(memory.calls).toEqual(["lock", "request", "preconditions", "owner", "shadow", "validation",
      "revision", "attempt", "audit"]);
    expect(memory.getRun()?.result.shadowCandidate?.applicationApplied).toBe(false);
  });

  it("returns an exact retry and rejects same-key semantic conflict", async () => {
    const memory = memoryRepository();
    const service = createAdaptationApplicationOrchestrationService({ repository: memory.repository,
      pureDependencies: orchestrationDependencies(),
      observability: NOOP_ADAPTATION_APPLICATION_ORCHESTRATION_OBSERVABILITY,
      recheckCurrentRevisions: async () => true });
    const input = orchestrationInput("keep_current", "build_and_persist_shadow_result");
    await service.orchestrateAdaptationApplication(input);
    expect((await service.orchestrateAdaptationApplication(input)).status).toBe("idempotent_prior_result");
    await expect(service.orchestrateAdaptationApplication({ ...input, request: { ...input.request,
      requestRevisionId: "different-semantic-revision" } })).rejects.toMatchObject({ code: "idempotency_conflict" });
  });

  it("rolls back on a stale recheck before any persistence call", async () => {
    const memory = memoryRepository();
    const service = createAdaptationApplicationOrchestrationService({ repository: memory.repository,
      pureDependencies: orchestrationDependencies(),
      observability: NOOP_ADAPTATION_APPLICATION_ORCHESTRATION_OBSERVABILITY,
      recheckCurrentRevisions: async () => false });
    await expect(service.orchestrateAdaptationApplication(
      orchestrationInput("keep_current", "build_and_persist_shadow_result")))
      .rejects.toMatchObject({ code: "stale_before_persistence" });
    expect(memory.calls).toEqual(["lock"]);
  });

  it("replays historical versions without owner invocation or writes", async () => {
    const memory = memoryRepository();
    const service = createAdaptationApplicationOrchestrationService({ repository: memory.repository,
      pureDependencies: orchestrationDependencies(),
      observability: NOOP_ADAPTATION_APPLICATION_ORCHESTRATION_OBSERVABILITY,
      recheckCurrentRevisions: async () => true });
    const result = await service.orchestrateAdaptationApplication(
      orchestrationInput("keep_current", "build_and_persist_shadow_result"));
    const replay = await replayAdaptationApplicationOrchestration({ repository: memory.repository,
      athleteId: "athlete-1", orchestrationRevisionId: result.orchestrationRevision.orchestrationRevisionId,
      mode: "full_orchestration_compare", availableOwnerPortReferences: [orchestrationInput().request.ownerPortReference] });
    expect(replay).toMatchObject({ status: "exact_historical_match", ownerInvocationCount: 0,
      applicationCount: 0, persistenceWriteCount: 0 });
  });

  it("sanitizes observability to references and status only", () => {
    const event = sanitizeAdaptationApplicationOrchestrationObservabilityEvent({ name: "request_received",
      operationTime: "2026-08-15T12:00:00.000-04:00", athleteId: "athlete-1", requestId: "request-1",
      status: "received", reasonCodes: ["B", "A"] });
    expect(event.reasonCodes).toEqual(["A", "B"]);
    expect(JSON.stringify(event)).not.toContain("payload");
    expect(vi.fn()).not.toHaveBeenCalled();
  });
});
