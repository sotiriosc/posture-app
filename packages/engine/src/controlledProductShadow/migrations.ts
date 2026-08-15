import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import manifestJson from "../../migrations/outcome-sources/product-shadow-manifest.json";

export interface ControlledProductShadowMigrationDescriptor {
  readonly migrationId: string;
  readonly version: string;
  readonly checksum: string;
  readonly description: string;
  readonly dependency: string | null;
  readonly transactional: true;
  readonly filename: string;
  readonly provenance: readonly string[];
}

export const CONTROLLED_PRODUCT_SHADOW_MIGRATION_MANIFEST = Object.freeze(manifestJson) as {
  readonly contractId: "CONTROLLED_PRODUCT_SHADOW_INTEGRATION";
  readonly contractVersion: "1.0.0";
  readonly automaticExecution: false;
  readonly migrations: readonly ControlledProductShadowMigrationDescriptor[];
};

export function checksumControlledProductShadowMigration(sql: string): string {
  return createHash("sha256").update(sql, "utf8").digest("hex");
}

export function loadControlledProductShadowMigrations(
  directory = fileURLToPath(new URL("../../migrations/outcome-sources", import.meta.url)),
) {
  return Object.freeze(CONTROLLED_PRODUCT_SHADOW_MIGRATION_MANIFEST.migrations.map((descriptor) => {
    const sql = readFileSync(resolve(directory, descriptor.filename), "utf8");
    if (checksumControlledProductShadowMigration(sql) !== descriptor.checksum) {
      throw new Error(`CONTROLLED_PRODUCT_SHADOW_MIGRATION_CHECKSUM_MISMATCH:${descriptor.migrationId}`);
    }
    return Object.freeze({ ...descriptor, sql });
  }));
}
