import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const CONTROLLED_OWNER_DELIVERY_MIGRATION_MANIFEST = Object.freeze({
  contractId: "CONTROLLED_OWNER_DELIVERY_PERSISTENCE",
  contractVersion: "1.0.0",
  manifestVersion: "1.0.0",
  automaticExecution: false,
  liveRowsInserted: 0,
  emailColumns: 0,
  migrations: Object.freeze([
    Object.freeze({
      migrationId: "001_owner_v2_enrollment_profile",
      filename: "001_owner_v2_enrollment_profile.sql",
      checksum: "40479d0a27dbe0c706608b15b9d4d7624fc0daba609cc4fdd5f4adf9ab8d953a",
      transactional: true,
      dependency: null,
    }),
  ]),
});

export function loadControlledOwnerDeliveryMigrations(
  directory = fileURLToPath(new URL("../../migrations/controlled-owner-delivery", import.meta.url)),
) {
  return Object.freeze(CONTROLLED_OWNER_DELIVERY_MIGRATION_MANIFEST.migrations.map((descriptor) => {
    const sql = readFileSync(resolve(directory, descriptor.filename), "utf8");
    const checksum = createHash("sha256").update(sql, "utf8").digest("hex");
    if (checksum !== descriptor.checksum) {
      throw new Error(`CONTROLLED_OWNER_DELIVERY_MIGRATION_CHECKSUM_MISMATCH:${descriptor.migrationId}`);
    }
    return Object.freeze({ ...descriptor, checksum, sql });
  }));
}
