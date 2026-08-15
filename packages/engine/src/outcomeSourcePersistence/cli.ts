import { Pool } from "pg";
import { applyOutcomeSourceMigrations, planOutcomeSourceMigrations } from "./migrationRunner";
import { loadOutcomeSourceMigrations } from "./migrations";

function normalizedConnectionString(raw: string): string {
  const parsed = new URL(raw);
  const sslmode = parsed.searchParams.get("sslmode")?.toLowerCase();
  if (["prefer", "require", "verify-ca"].includes(sslmode ?? "")) parsed.searchParams.set("sslmode", "verify-full");
  return parsed.toString();
}

async function main(): Promise<void> {
  const mode = process.argv[2];
  if (mode !== "plan" && mode !== "apply") throw new Error("Usage: cli.ts <plan|apply> <explicit-operation-time>");
  const operationTime = process.argv[3];
  if (!operationTime || Number.isNaN(Date.parse(operationTime))) throw new Error("Explicit ISO operation time is required.");
  const raw = process.env.TEST_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!raw) throw new Error("TEST_DATABASE_URL or DATABASE_URL is required for explicit migration invocation.");
  const pool = new Pool({ connectionString: normalizedConnectionString(raw), max: 2 });
  try {
    const migrations = loadOutcomeSourceMigrations();
    if (mode === "plan") {
      const client = await pool.connect();
      try { process.stdout.write(`${JSON.stringify(await planOutcomeSourceMigrations({ client, migrations,
        operationTime }), null, 2)}\n`); } finally { client.release(); }
      return;
    }
    process.stdout.write(`${JSON.stringify(await applyOutcomeSourceMigrations({ pool, migrations,
      operationTime }), null, 2)}\n`);
  } finally {
    await pool.end();
  }
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "OUTCOME_SOURCE_MIGRATION_CLI_FAILURE"}\n`);
  process.exitCode = 1;
});
