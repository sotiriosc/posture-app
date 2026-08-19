import { describe, expect, it, vi } from "vitest";
import {
  NOOP_OUTCOME_SOURCE_OBSERVABILITY,
  OUTCOME_SOURCE_MIGRATION_MANIFEST,
  checksumOutcomeSourceMigration,
  loadOutcomeSourceMigrations,
  planOutcomeSourceMigrations,
  runInOutcomeSourceRepositoryTransaction,
  sanitizeOutcomeSourceObservabilityEvent,
  validateOutcomeSourceMigrationSet,
} from "../../src/outcomeSourcePersistence";

describe("outcome source server-only persistence", () => {
  it("loads the locked migration without executing SQL", () => {
    const migrations = loadOutcomeSourceMigrations();
    expect(migrations).toHaveLength(1);
    expect(checksumOutcomeSourceMigration(migrations[0]!.sql)).toBe(migrations[0]!.checksum);
    expect(validateOutcomeSourceMigrationSet(migrations)).toEqual([]);
    expect(OUTCOME_SOURCE_MIGRATION_MANIFEST.automaticExecution).toBe(false);
    expect(OUTCOME_SOURCE_MIGRATION_MANIFEST.forwardFixOnly).toBe(true);
  });

  it("plans against an empty database without mutation", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ exists: false }], rowCount: 1 });
    const plan = await planOutcomeSourceMigrations({ client: { query },
      migrations: loadOutcomeSourceMigrations(), operationTime: "2026-08-14T20:00:00.000Z" });
    expect(plan).toMatchObject({ status: "ready", mutationCount: 0 });
    expect(plan.entries[0]?.state).toBe("pending");
    expect(query.mock.calls.every(([sql]) => String(sql).trimStart().startsWith("SELECT"))).toBe(true);
  });

  it("rejects checksum drift before database application", () => {
    const migration = loadOutcomeSourceMigrations()[0]!;
    expect(validateOutcomeSourceMigrationSet([{ ...migration, sql: `${migration.sql}\nSELECT 1;` }]))
      .toContain(`OUTCOME_SOURCE_MIGRATION_CHECKSUM_MISMATCH:${migration.migrationId}`);
  });

  it("keeps observability caller-supplied and excludes raw payloads", async () => {
    expect(NOOP_OUTCOME_SOURCE_OBSERVABILITY.emit({ name: "repository_failure",
      operationTime: "2026-08-14T20:00:00.000Z", status: "failed" })).toBeUndefined();
    const event = sanitizeOutcomeSourceObservabilityEvent({ name: "ingestion_rejected",
      operationTime: "2026-08-14T20:00:00.000Z", athleteId: "athlete-1", status: "invalid_payload",
      reasonCodes: ["OUTCOME_SOURCE_RAW_FIELD_PROHIBITED:notes"], metadata: { payloadLogged: false } });
    expect(JSON.stringify(event)).not.toContain("sensitive note");
    expect(event.metadata?.payloadLogged).toBe(false);
  });

  it("leaves transaction ownership with a caller-supplied client", async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ value: 7 }], rowCount: 1 });
    const release = vi.fn();
    const connect = vi.fn().mockRejectedValue(new Error("repository must not connect"));
    const value = await runInOutcomeSourceRepositoryTransaction({ connect, query }, async (client) => {
      const result = await client.query("SELECT 7 AS value");
      return result.rows[0]?.value;
    }, { query, release } as never);
    expect(value).toBe(7);
    expect(connect).not.toHaveBeenCalled();
    expect(release).not.toHaveBeenCalled();
    expect(query).toHaveBeenCalledTimes(1);
  });
});
