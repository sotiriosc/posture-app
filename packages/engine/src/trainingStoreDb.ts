import { Pool } from "pg";
import type {
  ExerciseLog,
  LogPrefs,
  Program,
  ProgramProgress,
  SessionRecord,
} from "@/lib/types";
import type { TrainingSnapshot } from "@/lib/trainingStateModel";
import { logTrainingSync } from "@/lib/trainingSyncDebug";

export type { TrainingSnapshot } from "@/lib/trainingStateModel";

let pool: Pool | null = null;
let initialized = false;

const normalizeDatabaseUrlSslMode = (raw: string) => {
  try {
    const parsed = new URL(raw);
    const sslmode = parsed.searchParams.get("sslmode")?.toLowerCase();
    if (sslmode === "prefer" || sslmode === "require" || sslmode === "verify-ca") {
      parsed.searchParams.set("sslmode", "verify-full");
      return parsed.toString();
    }
    return raw;
  } catch {
    return raw;
  }
};

const getPool = () => {
  if (pool) return pool;
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    throw new Error("DATABASE_URL is required for training store.");
  }
  pool = new Pool({ connectionString: normalizeDatabaseUrlSslMode(raw) });
  return pool;
};

const ensureDb = async () => {
  if (initialized) return;
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_user_state (
        user_id TEXT PRIMARY KEY,
        questionnaire JSONB NULL,
        assessment JSONB NULL,
        prefs JSONB NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_user_programs (
        user_id TEXT NOT NULL,
        program_id TEXT NOT NULL,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, program_id)
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_user_program_progress (
        user_id TEXT NOT NULL,
        program_id TEXT NOT NULL,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, program_id)
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_user_sessions (
        user_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, session_id)
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_user_exercise_logs (
        user_id TEXT NOT NULL,
        log_id TEXT NOT NULL,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, log_id)
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_app_user_programs_user ON app_user_programs (user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_app_user_program_progress_user ON app_user_program_progress (user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_app_user_sessions_user ON app_user_sessions (user_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_app_user_exercise_logs_user ON app_user_exercise_logs (user_id);
    `);
    initialized = true;
  } finally {
    client.release();
  }
};

export const getTrainingSnapshot = async (userId: string): Promise<TrainingSnapshot> => {
  await ensureDb();
  const db = getPool();

  const [
    stateResult,
    programResult,
    progressResult,
    sessionResult,
    logsResult,
  ] = await Promise.all([
    db.query(
      `SELECT questionnaire, assessment, prefs, updated_at FROM app_user_state WHERE user_id = $1 LIMIT 1`,
      [userId]
    ),
    db.query(
      `SELECT payload, updated_at FROM app_user_programs WHERE user_id = $1`,
      [userId]
    ),
    db.query(
      `SELECT payload, updated_at FROM app_user_program_progress WHERE user_id = $1`,
      [userId]
    ),
    db.query(
      `SELECT payload, updated_at FROM app_user_sessions WHERE user_id = $1`,
      [userId]
    ),
    db.query(
      `SELECT payload, updated_at FROM app_user_exercise_logs WHERE user_id = $1`,
      [userId]
    ),
  ]);

  const stateRow = stateResult.rows[0] ?? null;
  const programRows = programResult.rows as Array<{
    payload: Program;
    updated_at: Date | string;
  }>;
  const progressRows = progressResult.rows as Array<{
    payload: ProgramProgress;
    updated_at: Date | string;
  }>;
  const sessionRows = sessionResult.rows as Array<{
    payload: SessionRecord;
    updated_at: Date | string;
  }>;
  const logsRows = logsResult.rows as Array<{
    payload: ExerciseLog;
    updated_at: Date | string;
  }>;
  const toIso = (value: Date | string | null | undefined) =>
    value instanceof Date ? value.toISOString() : value ?? undefined;

  return {
    questionnaire: stateRow?.questionnaire ?? null,
    assessment: stateRow?.assessment ?? null,
    prefs: (stateRow?.prefs ?? null) as LogPrefs | null,
    programs: programRows.map((row) => row.payload),
    programProgress: progressRows.map((row) => row.payload),
    sessions: sessionRows.map((row) => row.payload),
    exerciseLogs: logsRows.map((row) => row.payload),
    meta: {
      stateUpdatedAt: toIso(stateRow?.updated_at),
      programUpdatedAtById: Object.fromEntries(
        programRows.map((row) => [row.payload.id, toIso(row.updated_at) ?? ""])
      ),
      programProgressUpdatedAtByProgramId: Object.fromEntries(
        progressRows.map((row) => [
          row.payload.programId,
          toIso(row.updated_at) ?? "",
        ])
      ),
      sessionUpdatedAtById: Object.fromEntries(
        sessionRows.map((row) => [row.payload.id, toIso(row.updated_at) ?? ""])
      ),
      exerciseLogUpdatedAtById: Object.fromEntries(
        logsRows.map((row) => [row.payload.id, toIso(row.updated_at) ?? ""])
      ),
    },
  };
};

const upsertStateField = async (
  userId: string,
  column: "questionnaire" | "assessment" | "prefs",
  value: unknown
) => {
  await ensureDb();
  const result = await getPool().query(
    `INSERT INTO app_user_state (user_id, ${column}, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET ${column} = EXCLUDED.${column}, updated_at = NOW()
     WHERE app_user_state.${column} IS DISTINCT FROM EXCLUDED.${column}`,
    [userId, JSON.stringify(value ?? null)]
  );
  return Number(result.rowCount ?? 0) > 0;
};

export const patchTrainingSnapshot = async (userId: string, patch: TrainingSnapshot) => {
  await ensureDb();
  const summary = {
    state: {} as Record<string, "upserted" | "skipped">,
    programs: { attempted: patch.programs?.length ?? 0, upserted: 0, skipped: 0 },
    programProgress: {
      attempted: patch.programProgress?.length ?? 0,
      upserted: 0,
      skipped: 0,
    },
    sessions: { attempted: patch.sessions?.length ?? 0, upserted: 0, skipped: 0 },
    exerciseLogs: {
      attempted: patch.exerciseLogs?.length ?? 0,
      upserted: 0,
      skipped: 0,
    },
  };

  if (patch.questionnaire !== undefined) {
    const changed = await upsertStateField(userId, "questionnaire", patch.questionnaire);
    summary.state.questionnaire = changed ? "upserted" : "skipped";
  }
  if (patch.assessment !== undefined) {
    const changed = await upsertStateField(userId, "assessment", patch.assessment);
    summary.state.assessment = changed ? "upserted" : "skipped";
  }
  if (patch.prefs !== undefined) {
    const changed = await upsertStateField(userId, "prefs", patch.prefs);
    summary.state.prefs = changed ? "upserted" : "skipped";
  }

  if (patch.programs?.length) {
    const results = await Promise.all(
      patch.programs.map((program) =>
        getPool().query(
          `INSERT INTO app_user_programs (user_id, program_id, payload, updated_at)
           VALUES ($1, $2, $3::jsonb, NOW())
           ON CONFLICT (user_id, program_id)
           DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
           WHERE app_user_programs.payload - 'updatedAt'
             IS DISTINCT FROM EXCLUDED.payload - 'updatedAt'`,
          [userId, program.id, JSON.stringify(program)]
        )
      )
    );
    summary.programs.upserted = results.reduce(
      (count, result) => count + Number(result.rowCount ?? 0),
      0
    );
    summary.programs.skipped =
      summary.programs.attempted - summary.programs.upserted;
  }

  if (patch.programProgress?.length) {
    const results = await Promise.all(
      patch.programProgress.map((progress) =>
        getPool().query(
          `INSERT INTO app_user_program_progress (user_id, program_id, payload, updated_at)
           VALUES ($1, $2, $3::jsonb, NOW())
           ON CONFLICT (user_id, program_id)
           DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
           WHERE app_user_program_progress.payload - 'updatedAt'
             IS DISTINCT FROM EXCLUDED.payload - 'updatedAt'`,
          [userId, progress.programId, JSON.stringify(progress)]
        )
      )
    );
    summary.programProgress.upserted = results.reduce(
      (count, result) => count + Number(result.rowCount ?? 0),
      0
    );
    summary.programProgress.skipped =
      summary.programProgress.attempted - summary.programProgress.upserted;
  }

  if (patch.sessions?.length) {
    const results = await Promise.all(
      patch.sessions.map((session) =>
        getPool().query(
          `INSERT INTO app_user_sessions (user_id, session_id, payload, updated_at)
           VALUES ($1, $2, $3::jsonb, NOW())
           ON CONFLICT (user_id, session_id)
           DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
           WHERE app_user_sessions.payload - 'updatedAt'
             IS DISTINCT FROM EXCLUDED.payload - 'updatedAt'`,
          [userId, session.id, JSON.stringify(session)]
        )
      )
    );
    summary.sessions.upserted = results.reduce(
      (count, result) => count + Number(result.rowCount ?? 0),
      0
    );
    summary.sessions.skipped = summary.sessions.attempted - summary.sessions.upserted;
  }

  if (patch.exerciseLogs?.length) {
    const results = await Promise.all(
      patch.exerciseLogs.map((log) =>
        getPool().query(
          `INSERT INTO app_user_exercise_logs (user_id, log_id, payload, updated_at)
           VALUES ($1, $2, $3::jsonb, NOW())
           ON CONFLICT (user_id, log_id)
           DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
           WHERE app_user_exercise_logs.payload - 'updatedAt'
             IS DISTINCT FROM EXCLUDED.payload - 'updatedAt'`,
          [userId, log.id, JSON.stringify(log)]
        )
      )
    );
    summary.exerciseLogs.upserted = results.reduce(
      (count, result) => count + Number(result.rowCount ?? 0),
      0
    );
    summary.exerciseLogs.skipped =
      summary.exerciseLogs.attempted - summary.exerciseLogs.upserted;
  }

  logTrainingSync("training-store", "patch persisted", summary);
};
