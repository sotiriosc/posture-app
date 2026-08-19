import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SESSION_PRACTICE_V2_MIGRATION_MANIFEST = Object.freeze({
  contractId: "SESSION_PRACTICE_PERSISTENCE",
  contractVersion: "1.0.0",
  manifestVersion: "1.0.0",
  forwardFixOnly: true,
  automaticExecution: false,
  currentProductRowsMutated: false,
  migrations: Object.freeze([
    Object.freeze({
      migrationId: "001_session_practice_v2_attempt_revisions",
      version: "1.0.0",
      filename: "001_session_practice_v2_attempt_revisions.sql",
      checksum: "65e46f0d4dd0bd45ab3e90926f2c51af13a60099ac860e772104783ef7658886",
      description: "Add isolated append-only V2 session-practice attempt revisions.",
      dependency: null,
      transactional: true,
      provenance: Object.freeze(["Pre-G3:default-off-test-and-CI-only"]),
    }),
  ]),
} as const);

export function loadSessionPracticeV2Migrations(
  directory = fileURLToPath(new URL("../../migrations/session-practice-v2", import.meta.url)),
): readonly { readonly migrationId: string; readonly filename: string; readonly checksum: string;
  readonly sql: string }[] {
  return Object.freeze(SESSION_PRACTICE_V2_MIGRATION_MANIFEST.migrations.map((descriptor) => {
    const sql = readFileSync(resolve(directory, descriptor.filename), "utf8");
    const checksum = createHash("sha256").update(sql, "utf8").digest("hex");
    if (checksum !== descriptor.checksum) {
      throw new Error(`SESSION_PRACTICE_V2_MIGRATION_CHECKSUM_MISMATCH:${descriptor.migrationId}`);
    }
    return Object.freeze({ ...descriptor, sql });
  }));
}
