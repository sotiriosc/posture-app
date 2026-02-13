import { Pool } from "pg";
import type {
  ExerciseLog,
  LogPrefs,
  Program,
  ProgramProgress,
  SessionRecord,
} from "@/lib/types";

export type TrainingSnapshot = {
  questionnaire?: Record<string, unknown> | null;
  assessment?: Record<string, unknown> | null;
  prefs?: LogPrefs | null;
  programs?: Program[];
  programProgress?: ProgramProgress[];
  sessions?: SessionRecord[];
  exerciseLogs?: ExerciseLog[];
};

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
      `SELECT questionnaire, assessment, prefs FROM app_user_state WHERE user_id = $1 LIMIT 1`,
      [userId]
    ),
    db.query(
      `SELECT payload FROM app_user_programs WHERE user_id = $1`,
      [userId]
    ),
    db.query(
      `SELECT payload FROM app_user_program_progress WHERE user_id = $1`,
      [userId]
    ),
    db.query(
      `SELECT payload FROM app_user_sessions WHERE user_id = $1`,
      [userId]
    ),
    db.query(
      `SELECT payload FROM app_user_exercise_logs WHERE user_id = $1`,
      [userId]
    ),
  ]);

  const stateRow = stateResult.rows[0] ?? null;
  return {
    questionnaire: stateRow?.questionnaire ?? null,
    assessment: stateRow?.assessment ?? null,
    prefs: (stateRow?.prefs ?? null) as LogPrefs | null,
    programs: programResult.rows.map((row) => row.payload as Program),
    programProgress: progressResult.rows.map((row) => row.payload as ProgramProgress),
    sessions: sessionResult.rows.map((row) => row.payload as SessionRecord),
    exerciseLogs: logsResult.rows.map((row) => row.payload as ExerciseLog),
  };
};

const upsertStateField = async (
  userId: string,
  column: "questionnaire" | "assessment" | "prefs",
  value: unknown
) => {
  await ensureDb();
  await getPool().query(
    `INSERT INTO app_user_state (user_id, ${column}, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET ${column} = EXCLUDED.${column}, updated_at = NOW()`,
    [userId, JSON.stringify(value ?? null)]
  );
};

export const patchTrainingSnapshot = async (userId: string, patch: TrainingSnapshot) => {
  await ensureDb();

  if (patch.questionnaire !== undefined) {
    await upsertStateField(userId, "questionnaire", patch.questionnaire);
  }
  if (patch.assessment !== undefined) {
    await upsertStateField(userId, "assessment", patch.assessment);
  }
  if (patch.prefs !== undefined) {
    await upsertStateField(userId, "prefs", patch.prefs);
  }

  if (patch.programs?.length) {
    await Promise.all(
      patch.programs.map((program) =>
        getPool().query(
          `INSERT INTO app_user_programs (user_id, program_id, payload, updated_at)
           VALUES ($1, $2, $3::jsonb, NOW())
           ON CONFLICT (user_id, program_id)
           DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
          [userId, program.id, JSON.stringify(program)]
        )
      )
    );
  }

  if (patch.programProgress?.length) {
    await Promise.all(
      patch.programProgress.map((progress) =>
        getPool().query(
          `INSERT INTO app_user_program_progress (user_id, program_id, payload, updated_at)
           VALUES ($1, $2, $3::jsonb, NOW())
           ON CONFLICT (user_id, program_id)
           DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
          [userId, progress.programId, JSON.stringify(progress)]
        )
      )
    );
  }

  if (patch.sessions?.length) {
    await Promise.all(
      patch.sessions.map((session) =>
        getPool().query(
          `INSERT INTO app_user_sessions (user_id, session_id, payload, updated_at)
           VALUES ($1, $2, $3::jsonb, NOW())
           ON CONFLICT (user_id, session_id)
           DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
          [userId, session.id, JSON.stringify(session)]
        )
      )
    );
  }

  if (patch.exerciseLogs?.length) {
    await Promise.all(
      patch.exerciseLogs.map((log) =>
        getPool().query(
          `INSERT INTO app_user_exercise_logs (user_id, log_id, payload, updated_at)
           VALUES ($1, $2, $3::jsonb, NOW())
           ON CONFLICT (user_id, log_id)
           DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
          [userId, log.id, JSON.stringify(log)]
        )
      )
    );
  }
};
