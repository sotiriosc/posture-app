import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import manifestJson from "../../migrations/outcome-sources/manifest.json";

export interface OutcomeSourceMigrationDescriptor {
  readonly migrationId: string;
  readonly version: string;
  readonly checksum: string;
  readonly description: string;
  readonly dependency: string | null;
  readonly transactional: boolean;
  readonly filename: string;
  readonly provenance: readonly string[];
}

export interface OutcomeSourceMigration extends OutcomeSourceMigrationDescriptor {
  readonly sql: string;
}

export interface OutcomeSourceMigrationManifest {
  readonly contractId: "PRODUCTION_OUTCOME_SOURCE_PERSISTENCE";
  readonly contractVersion: "1.0.0";
  readonly manifestVersion: "1.0.0";
  readonly historyTable: "praxis_schema_migrations";
  readonly forwardFixOnly: true;
  readonly automaticExecution: false;
  readonly migrations: readonly OutcomeSourceMigrationDescriptor[];
}

export const OUTCOME_SOURCE_MIGRATION_MANIFEST = Object.freeze(manifestJson) as OutcomeSourceMigrationManifest;

export function checksumOutcomeSourceMigration(sql: string): string {
  return createHash("sha256").update(sql, "utf8").digest("hex");
}

export function loadOutcomeSourceMigrations(
  migrationsDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../../migrations/outcome-sources"),
): readonly OutcomeSourceMigration[] {
  return Object.freeze(OUTCOME_SOURCE_MIGRATION_MANIFEST.migrations.map((descriptor) => {
    const sql = readFileSync(resolve(migrationsDirectory, descriptor.filename), "utf8");
    const actual = checksumOutcomeSourceMigration(sql);
    if (actual !== descriptor.checksum) {
      throw new Error(`OUTCOME_SOURCE_MIGRATION_CHECKSUM_MISMATCH:${descriptor.migrationId}`);
    }
    return Object.freeze({ ...descriptor, sql });
  }));
}

export function validateOutcomeSourceMigrationSet(migrations: readonly OutcomeSourceMigration[]): readonly string[] {
  const reasons: string[] = [];
  const ids = new Set(migrations.map((migration) => migration.migrationId));
  if (ids.size !== migrations.length) reasons.push("OUTCOME_SOURCE_MIGRATION_ID_DUPLICATE");
  migrations.forEach((migration, index) => {
    if (checksumOutcomeSourceMigration(migration.sql) !== migration.checksum) {
      reasons.push(`OUTCOME_SOURCE_MIGRATION_CHECKSUM_MISMATCH:${migration.migrationId}`);
    }
    if (migration.dependency !== null && !ids.has(migration.dependency)) {
      reasons.push(`OUTCOME_SOURCE_MIGRATION_DEPENDENCY_MISSING:${migration.migrationId}`);
    }
    if (migration.dependency !== null && migrations.findIndex((entry) => entry.migrationId === migration.dependency) >= index) {
      reasons.push(`OUTCOME_SOURCE_MIGRATION_DEPENDENCY_ORDER_INVALID:${migration.migrationId}`);
    }
    if (!migration.transactional) reasons.push(`OUTCOME_SOURCE_NONTRANSACTIONAL_MIGRATION_REQUIRES_REVIEW:${migration.migrationId}`);
  });
  return Object.freeze([...new Set(reasons)].sort());
}
