import type { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import type { OutcomeSourceMigration } from "./migrations";
import { validateOutcomeSourceMigrationSet } from "./migrations";
import { NOOP_OUTCOME_SOURCE_OBSERVABILITY, type OutcomeSourceObservability } from "./observability";

export interface OutcomeSourceQueryClient {
  readonly query: <R extends QueryResultRow = QueryResultRow>(text: string, values?: readonly unknown[]) => Promise<QueryResult<R>>;
}

export interface OutcomeSourceMigrationPlanEntry {
  readonly migrationId: string;
  readonly version: string;
  readonly checksum: string;
  readonly state: "pending" | "applied";
}

export interface OutcomeSourceMigrationPlan {
  readonly status: "ready" | "invalid";
  readonly entries: readonly OutcomeSourceMigrationPlanEntry[];
  readonly reasonCodes: readonly string[];
  readonly mutationCount: 0;
}

export interface OutcomeSourceMigrationRunResult {
  readonly status: "dry_run" | "applied" | "unchanged";
  readonly plannedCount: number;
  readonly appliedCount: number;
  readonly entries: readonly OutcomeSourceMigrationPlanEntry[];
  readonly advisoryLockUsed: true;
  readonly automaticExecution: false;
}

const HISTORY_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS praxis_schema_migrations (
  migration_id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  checksum TEXT NOT NULL,
  description TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  execution_details JSONB NOT NULL
)`;

async function historyExists(client: OutcomeSourceQueryClient): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(
    "SELECT to_regclass('public.praxis_schema_migrations') IS NOT NULL AS exists",
  );
  return Boolean(result.rows[0]?.exists);
}

async function appliedHistory(client: OutcomeSourceQueryClient): Promise<Map<string, string>> {
  if (!(await historyExists(client))) return new Map();
  const result = await client.query<{ migration_id: string; checksum: string }>(
    "SELECT migration_id, checksum FROM praxis_schema_migrations ORDER BY migration_id",
  );
  return new Map(result.rows.map((row) => [row.migration_id, row.checksum]));
}

export async function planOutcomeSourceMigrations(input: {
  readonly client: OutcomeSourceQueryClient;
  readonly migrations: readonly OutcomeSourceMigration[];
  readonly operationTime: string;
  readonly observability?: OutcomeSourceObservability;
}): Promise<OutcomeSourceMigrationPlan> {
  const reasons = [...validateOutcomeSourceMigrationSet(input.migrations)];
  const applied = await appliedHistory(input.client);
  for (const migration of input.migrations) {
    const prior = applied.get(migration.migrationId);
    if (prior !== undefined && prior !== migration.checksum) {
      reasons.push(`OUTCOME_SOURCE_MIGRATION_HISTORY_CHECKSUM_CONFLICT:${migration.migrationId}`);
    }
  }
  const entries = Object.freeze(input.migrations.map((migration) => Object.freeze({
    migrationId: migration.migrationId, version: migration.version, checksum: migration.checksum,
    state: applied.has(migration.migrationId) ? "applied" as const : "pending" as const,
  })));
  const result = Object.freeze({ status: reasons.length ? "invalid" as const : "ready" as const,
    entries, reasonCodes: Object.freeze([...new Set(reasons)].sort()), mutationCount: 0 as const });
  await (input.observability ?? NOOP_OUTCOME_SOURCE_OBSERVABILITY).emit({ name: "migration_planned",
    operationTime: input.operationTime, status: result.status,
    metadata: { pendingCount: entries.filter((entry) => entry.state === "pending").length } });
  return result;
}

async function applyOne(client: PoolClient, migration: OutcomeSourceMigration): Promise<void> {
  await client.query("BEGIN");
  try {
    await client.query(migration.sql);
    await client.query(
      `INSERT INTO praxis_schema_migrations
       (migration_id, version, checksum, description, execution_details)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [migration.migrationId, migration.version, migration.checksum, migration.description,
        JSON.stringify({ transactional: migration.transactional, provenance: migration.provenance })],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

export async function applyOutcomeSourceMigrations(input: {
  readonly pool: Pick<Pool, "connect">;
  readonly migrations: readonly OutcomeSourceMigration[];
  readonly operationTime: string;
  readonly dryRun?: boolean;
  readonly observability?: OutcomeSourceObservability;
}): Promise<OutcomeSourceMigrationRunResult> {
  const observability = input.observability ?? NOOP_OUTCOME_SOURCE_OBSERVABILITY;
  const client = await input.pool.connect();
  try {
    const initialPlan = await planOutcomeSourceMigrations({ client, migrations: input.migrations,
      operationTime: input.operationTime, observability });
    if (initialPlan.status === "invalid") throw new Error(initialPlan.reasonCodes.join(","));
    if (input.dryRun) return Object.freeze({ status: "dry_run", plannedCount: initialPlan.entries
      .filter((entry) => entry.state === "pending").length, appliedCount: 0, entries: initialPlan.entries,
      advisoryLockUsed: true, automaticExecution: false });
    await client.query("SELECT pg_advisory_lock(hashtext($1))", ["praxis:outcome-source-migrations"]);
    try {
      await client.query(HISTORY_TABLE_SQL);
      const lockedPlan = await planOutcomeSourceMigrations({ client, migrations: input.migrations,
        operationTime: input.operationTime, observability });
      if (lockedPlan.status === "invalid") throw new Error(lockedPlan.reasonCodes.join(","));
      let appliedCount = 0;
      for (const entry of lockedPlan.entries) {
        if (entry.state === "applied") continue;
        const migration = input.migrations.find((candidate) => candidate.migrationId === entry.migrationId)!;
        await applyOne(client, migration);
        appliedCount += 1;
        await observability.emit({ name: "migration_applied", operationTime: input.operationTime,
          entityId: migration.migrationId, status: "applied" });
      }
      return Object.freeze({ status: appliedCount ? "applied" : "unchanged",
        plannedCount: lockedPlan.entries.filter((entry) => entry.state === "pending").length,
        appliedCount, entries: lockedPlan.entries, advisoryLockUsed: true, automaticExecution: false });
    } finally {
      await client.query("SELECT pg_advisory_unlock(hashtext($1))", ["praxis:outcome-source-migrations"]);
    }
  } catch (error) {
    await observability.emit({ name: "migration_failed", operationTime: input.operationTime, status: "failed",
      reasonCodes: [error instanceof Error ? error.message : "UNKNOWN_MIGRATION_FAILURE"] });
    throw error;
  } finally {
    client.release();
  }
}
