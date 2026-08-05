/**
 * Read-only dump of one user's training data from Postgres.
 *
 * Uses only SELECT. Does not call ensureDb / CREATE / ALTER / INSERT / UPDATE.
 *
 * Run from repo root (loads DATABASE_URL from .env.local):
 *   npm run dump:user-data
 * or:
 *   node --import tsx packages/engine/src/__debug__/dumpUserTrainingData.ts
 *
 * Optional email override:
 *   DUMP_USER_EMAIL=someone@example.com npm run dump:user-data
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { Pool } from "pg";

const DEFAULT_EMAIL = "motioncareathome@gmail.com";

type JsonObject = Record<string, unknown>;

const loadEnvLocal = () => {
  const candidates = [
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), "apps/consumer/.env.local"),
  ];
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
    return path;
  }
  return null;
};

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

const asObject = (value: unknown): JsonObject | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;

const asString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : null;

const sessionSortKey = (payload: JsonObject) =>
  asString(payload.completedAt) ??
  asString(payload.startedAt) ??
  asString(payload.createdAt) ??
  asString(payload.updatedAt) ??
  "";

const section = (title: string) => {
  console.log("\n" + "=".repeat(72));
  console.log(title);
  console.log("=".repeat(72));
};

const run = async () => {
  const envPath = loadEnvLocal();
  const email = (
    process.env.DUMP_USER_EMAIL?.trim() || DEFAULT_EMAIL
  ).toLowerCase();
  const connectionStringRaw = process.env.DATABASE_URL?.trim();
  if (!connectionStringRaw) {
    throw new Error(
      `DATABASE_URL is required. Loaded env from: ${envPath ?? "(none)"}`
    );
  }

  const pool = new Pool({
    connectionString: normalizeDatabaseUrlSslMode(connectionStringRaw),
  });

  try {
    section(`USER LOOKUP: ${email}`);
    console.log(`env file: ${envPath ?? "(none — using process.env only)"}`);

    const userResult = await pool.query(
      `SELECT
         id,
         email,
         name,
         plan,
         email_opt_in,
         email_opt_in_at,
         onboarding_source,
         stripe_customer_id,
         stripe_subscription_id,
         stripe_price_id,
         stripe_subscription_status,
         stripe_current_period_end,
         stripe_cancel_at_period_end,
         created_at,
         updated_at
       FROM app_users
       WHERE email = $1
       LIMIT 1`,
      [email]
    );

    const user = userResult.rows[0] as
      | {
          id: string;
          email: string;
          name: string | null;
          plan: string;
          email_opt_in: boolean;
          email_opt_in_at: Date | string | null;
          onboarding_source: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          stripe_subscription_status: string | null;
          stripe_current_period_end: Date | string | null;
          stripe_cancel_at_period_end: boolean | null;
          created_at: Date | string;
          updated_at: Date | string;
        }
      | undefined;

    if (!user) {
      console.log(`No row in app_users for email=${email}`);
      return;
    }

    console.log(
      JSON.stringify(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          email_opt_in: user.email_opt_in,
          email_opt_in_at: user.email_opt_in_at,
          onboarding_source: user.onboarding_source,
          stripe_customer_id: user.stripe_customer_id,
          stripe_subscription_id: user.stripe_subscription_id,
          stripe_price_id: user.stripe_price_id,
          stripe_subscription_status: user.stripe_subscription_status,
          stripe_current_period_end: user.stripe_current_period_end,
          stripe_cancel_at_period_end: user.stripe_cancel_at_period_end,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        null,
        2
      )
    );

    const userId = user.id;

    section(`WORKOUT SESSIONS (app_user_sessions.payload) — user_id=${userId}`);
    const sessionsResult = await pool.query(
      `SELECT session_id, payload, updated_at
       FROM app_user_sessions
       WHERE user_id = $1`,
      [userId]
    );

    const sessions = sessionsResult.rows
      .map((row) => {
        const payload = asObject(row.payload) ?? {};
        return {
          session_id: row.session_id as string,
          table_updated_at: row.updated_at as Date | string,
          payload,
        };
      })
      .sort((a, b) =>
        sessionSortKey(a.payload).localeCompare(sessionSortKey(b.payload))
      );

    console.log(`count: ${sessions.length}`);
    for (const session of sessions) {
      const p = session.payload;
      console.log(
        JSON.stringify(
          {
            session_id: session.session_id,
            table_updated_at: session.table_updated_at,
            id: p.id ?? null,
            startedAt: p.startedAt ?? null,
            completedAt: p.completedAt ?? null,
            createdAt: p.createdAt ?? null,
            updatedAt: p.updatedAt ?? null,
            routineId: p.routineId ?? null,
            durationSec: p.durationSec ?? null,
            activeDurationSec: p.activeDurationSec ?? null,
            abandoned: p.abandoned ?? null,
            notes: p.notes ?? null,
            sessionFeedback: p.sessionFeedback ?? null,
            sessionPainLocation: p.sessionPainLocation ?? null,
            deletedAt: p.deletedAt ?? null,
            source: p.source ?? null,
          },
          null,
          2
        )
      );
    }

    section(
      `CHECK-INS (SessionRecord.feedback on app_user_sessions.payload) — difficulty / pain / energy / confidence`
    );
    const checkIns = sessions.map((session) => {
      const p = session.payload;
      const feedback = asObject(p.feedback);
      return {
        session_id: session.session_id,
        completedAt: p.completedAt ?? null,
        startedAt: p.startedAt ?? null,
        createdAt: p.createdAt ?? null,
        // Coarse end-of-session label (also used by Progress screen trends)
        sessionFeedback: p.sessionFeedback ?? null,
        sessionPainLocation: p.sessionPainLocation ?? null,
        sessionFeedbackNotes: p.sessionFeedbackNotes ?? null,
        // Per-workout check-in fields from SessionFeedback
        feedback: feedback
          ? {
              completed: feedback.completed ?? null,
              difficultyRPE: feedback.difficultyRPE ?? null,
              painBefore: feedback.painBefore ?? null,
              painAfter: feedback.painAfter ?? null,
              energy: feedback.energy ?? null,
              techniqueConfidence: feedback.techniqueConfidence ?? null,
              enjoyment: feedback.enjoyment ?? null,
              timeAvailableNextSession: feedback.timeAvailableNextSession ?? null,
              notes: feedback.notes ?? null,
            }
          : null,
      };
    });

    const withStructuredFeedback = checkIns.filter((row) => row.feedback);
    console.log(
      `sessions with payload.feedback: ${withStructuredFeedback.length} / ${checkIns.length}`
    );
    console.log(JSON.stringify(checkIns, null, 2));

    section(
      `POSTURE / MOVEMENT MEASUREMENTS — app_user_state.assessment + program.assessmentHistory`
    );

    const stateResult = await pool.query(
      `SELECT questionnaire, assessment, prefs, updated_at
       FROM app_user_state
       WHERE user_id = $1
       LIMIT 1`,
      [userId]
    );
    const stateRow = stateResult.rows[0] as
      | {
          questionnaire: unknown;
          assessment: unknown;
          prefs: unknown;
          updated_at: Date | string;
        }
      | undefined;

    console.log("\n--- app_user_state.assessment (current AssessmentReport) ---");
    if (!stateRow) {
      console.log("No app_user_state row for this user.");
    } else {
      console.log(
        JSON.stringify(
          {
            state_updated_at: stateRow.updated_at,
            assessment: stateRow.assessment ?? null,
          },
          null,
          2
        )
      );
    }

    const programsResult = await pool.query(
      `SELECT program_id, payload, updated_at
       FROM app_user_programs
       WHERE user_id = $1`,
      [userId]
    );

    type HistoryEntry = {
      program_id: string;
      program_updated_at: Date | string;
      timestamp: string;
      phase: unknown;
      confidenceScore: unknown;
      status: unknown;
      observations: unknown;
    };

    const historyEntries: HistoryEntry[] = [];
    console.log("\n--- app_user_programs.payload.assessmentHistory (date order) ---");
    console.log(`programs: ${programsResult.rows.length}`);

    for (const row of programsResult.rows) {
      const payload = asObject(row.payload) ?? {};
      const history = Array.isArray(payload.assessmentHistory)
        ? payload.assessmentHistory
        : [];
      console.log(
        `program_id=${row.program_id} assessmentHistory.length=${history.length}`
      );
      for (const snap of history) {
        const snapshot = asObject(snap);
        if (!snapshot) continue;
        historyEntries.push({
          program_id: row.program_id as string,
          program_updated_at: row.updated_at as Date | string,
          timestamp: asString(snapshot.timestamp) ?? "",
          phase: snapshot.phase ?? null,
          confidenceScore: snapshot.confidenceScore ?? null,
          status: snapshot.status ?? null,
          observations: snapshot.observations ?? null,
        });
      }
    }

    historyEntries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    console.log(`\nfull assessmentHistory across programs (n=${historyEntries.length}):`);
    console.log(JSON.stringify(historyEntries, null, 2));

    section("SUMMARY");
    console.log(
      JSON.stringify(
        {
          userId,
          email: user.email,
          sessionCount: sessions.length,
          checkInsWithFeedback: withStructuredFeedback.length,
          hasAssessmentReport: Boolean(stateRow?.assessment),
          assessmentHistoryCount: historyEntries.length,
        },
        null,
        2
      )
    );
  } finally {
    await pool.end();
  }
};

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
