import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import manifestJson from "../../migrations/outcome-sources/orchestration-manifest.json";
import type { OutcomeSourceMigration } from "../outcomeSourcePersistence/migrations";

export interface AdaptationApplicationOrchestrationMigrationManifest {
  readonly contractId: "ADAPTATION_APPLICATION_ORCHESTRATION_PERSISTENCE";
  readonly contractVersion: "1.0.0";
  readonly manifestVersion: "1.0.0";
  readonly historyTable: "praxis_schema_migrations";
  readonly forwardFixOnly: true;
  readonly automaticExecution: false;
  readonly requiresContract: "PRODUCTION_OUTCOME_SOURCE_PERSISTENCE@1.0.0";
  readonly migrations: readonly Omit<OutcomeSourceMigration, "sql">[];
}

export const ADAPTATION_APPLICATION_ORCHESTRATION_MIGRATION_MANIFEST =
  Object.freeze(manifestJson) as AdaptationApplicationOrchestrationMigrationManifest;

export function loadAdaptationApplicationOrchestrationMigrations(
  migrationsDirectory = fileURLToPath(new URL("../../migrations/outcome-sources", import.meta.url)),
): readonly OutcomeSourceMigration[] {
  return Object.freeze(ADAPTATION_APPLICATION_ORCHESTRATION_MIGRATION_MANIFEST.migrations.map((descriptor) => {
    const sql = readFileSync(resolve(migrationsDirectory, descriptor.filename), "utf8");
    const checksum = createHash("sha256").update(sql, "utf8").digest("hex");
    if (checksum !== descriptor.checksum) {
      throw new Error(`ADAPTATION_APPLICATION_ORCHESTRATION_MIGRATION_CHECKSUM_MISMATCH:${descriptor.migrationId}`);
    }
    return Object.freeze({ ...descriptor, sql });
  }));
}
