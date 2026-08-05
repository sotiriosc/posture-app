/**
 * Seed ~4 weeks of realistic training history for ONE demo user.
 *
 * Touches only user_id = DEMO_USER_ID (and seed-prefixed row ids).
 * Idempotent: deletes prior seed-demo-4wk-* sessions/logs for that user, then
 * upserts the seed program / progress / sessions / logs / assessmentHistory.
 *
 * Run from repo root:
 *   npm run seed:demo-user
 * or:
 *   node --import tsx packages/engine/src/__debug__/seedDemoUser4WeekHistory.ts
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { Pool } from "pg";
import type {
  AssessmentSnapshot,
  ExerciseLog,
  FocusTagLifecycleState,
  Program,
  ProgramProgress,
  SessionFeedback,
  SessionRecord,
} from "@/lib/types";

const DEMO_USER_ID = "b04c651e-24a3-4f6e-a41e-4dfc821e1f8c";
const SEED_PREFIX = "seed-demo-4wk";
const SEED_PROGRAM_ID = `${SEED_PREFIX}-${DEMO_USER_ID.slice(0, 8)}`;
const FORWARD_HEAD_THRESHOLD = 0.08;

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
      if (process.env[key] === undefined) process.env[key] = value;
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

/** Deterministic PRNG so re-runs produce identical seed bytes. */
const mulberry32 = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const round1 = (value: number) => Math.round(value * 10) / 10;
const round3 = (value: number) => Math.round(value * 1000) / 1000;

const atLocalHour = (date: Date, hour: number, minute: number) => {
  const next = new Date(date);
  next.setHours(hour, minute, 0, 0);
  return next;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/**
 * Uneven ~3×/week schedule over the last 28 days (not evenly spaced).
 * Offsets are days before "today" (local calendar).
 */
const SESSION_DAY_OFFSETS = [
  27, 25, 22, // week -4
  20, 17, 15, // week -3
  13, 10, 8, // week -2
  6, 3, 1, // week -1 (most recent yesterday-ish)
] as const;

const EXERCISES_BY_DAY = [
  ["chin-tucks", "wall-slides", "goblet-squat"],
  ["band-pull-aparts", "dumbbell-rows", "glute-bridges"],
  ["face-pull", "dumbbell-bench-press", "bird-dog"],
] as const;

const sessionFeedbackFromRpe = (
  rpe: number
): NonNullable<SessionRecord["sessionFeedback"]> => {
  if (rpe <= 4) return "easy";
  if (rpe <= 6) return "moderate";
  if (rpe <= 8) return "hard";
  return "pain";
};

const buildJaggedCheckIn = (
  index: number,
  total: number,
  rand: () => number
): SessionFeedback => {
  const t = index / Math.max(1, total - 1);
  // Positive trend with noise: pain down, energy/confidence up, RPE eases slightly.
  const painBefore = clamp(
    Math.round(4.6 - t * 2.8 + (rand() - 0.5) * 2.4),
    0,
    10
  );
  const painAfter = clamp(
    Math.round(painBefore - 0.6 + (rand() - 0.45) * 2.2),
    0,
    10
  );
  const energy = clamp(Math.round(2.2 + t * 2.4 + (rand() - 0.5) * 2.2), 1, 5);
  const techniqueConfidence = clamp(
    Math.round(2.1 + t * 2.5 + (rand() - 0.5) * 2.0),
    1,
    5
  );
  const difficultyRPE = clamp(
    Math.round(7.2 - t * 2.4 + (rand() - 0.5) * 2.6),
    1,
    10
  );
  return {
    completed: "yes",
    difficultyRPE,
    painBefore,
    painAfter,
    energy,
    techniqueConfidence,
    enjoyment: clamp(Math.round(2.5 + t * 1.8 + (rand() - 0.5) * 1.6), 1, 5),
  };
};

const buildForwardHeadHistory = (
  sessionDates: Date[],
  rand: () => number
): AssessmentSnapshot[] => {
  // ~5 checkpoints across the arc: 0.31 → 0.12 with jitter.
  const pickIndexes = [0, 2, 5, 8, sessionDates.length - 1];
  return pickIndexes.map((sessionIndex, i) => {
    const t = i / Math.max(1, pickIndexes.length - 1);
    const base = 0.31 - t * (0.31 - 0.12);
    const measuredValue = round3(clamp(base + (rand() - 0.5) * 0.035, 0.08, 0.4));
    const timestamp = atLocalHour(sessionDates[sessionIndex], 9, 15).toISOString();
    return {
      timestamp,
      phase: i < 2 ? 0 : 1,
      confidenceScore: round3(0.82 + t * 0.08 + (rand() - 0.5) * 0.04),
      observations: [
        {
          focusTag: "forward_head",
          measuredValue,
          threshold: FORWARD_HEAD_THRESHOLD,
          keypointConfidences: [
            round3(0.84 + rand() * 0.1),
            round3(0.86 + rand() * 0.1),
          ],
        },
      ],
      status: i === 0 ? "accepted" : "user_retook",
    };
  });
};

const buildSeedProgram = (params: {
  userId: string;
  programId: string;
  createdAt: string;
  updatedAt: string;
  assessmentHistory: AssessmentSnapshot[];
}): Program => {
  const firstSeenAt = params.assessmentHistory[0]?.timestamp ?? params.createdAt;
  const focusTagLifecycle: Record<string, FocusTagLifecycleState> = {
    forward_head: {
      focusTag: "forward_head",
      firstSeenAt,
      escalationBumps: 0,
    },
  };

  return {
    id: params.programId,
    userId: params.userId,
    createdAt: params.createdAt,
    updatedAt: params.updatedAt,
    goalTrack: "Improve posture",
    daysPerWeek: 3,
    estimatedSessionMinutesRange: { min: 45, max: 60 },
    phaseIndex: 1,
    phaseName: "skill",
    weekIndex: 4,
    totalWeekIndex: 4,
    cycleIndex: 1,
    phase: {
      name: "skill",
      phaseIndex: 1,
      cycleIndex: 1,
      weekIndex: 4,
      weekCount: 4,
      goal: "Skill development",
    },
    week: [
      {
        dayIndex: 0,
        title: "Day 1 — Posture + squat",
        focusTags: ["forward_head"],
        routine: [
          {
            exerciseId: "chin-tucks",
            section: "warmup",
            sets: 2,
            reps: "8",
            loadType: "bodyweight",
          },
          {
            exerciseId: "wall-slides",
            section: "activation",
            sets: 2,
            reps: "10",
            loadType: "bodyweight",
          },
          {
            exerciseId: "goblet-squat",
            section: "main",
            sets: 3,
            reps: "8",
            loadType: "weighted",
          },
        ],
      },
      {
        dayIndex: 1,
        title: "Day 2 — Pull + hinge",
        focusTags: ["forward_head"],
        routine: [
          {
            exerciseId: "band-pull-aparts",
            section: "warmup",
            sets: 2,
            reps: "12",
            loadType: "bodyweight",
          },
          {
            exerciseId: "dumbbell-rows",
            section: "main",
            sets: 3,
            reps: "8",
            loadType: "weighted",
          },
          {
            exerciseId: "glute-bridges",
            section: "accessory",
            sets: 3,
            reps: "10",
            loadType: "bodyweight",
          },
        ],
      },
      {
        dayIndex: 2,
        title: "Day 3 — Press + trunk",
        focusTags: ["forward_head"],
        routine: [
          {
            exerciseId: "face-pull",
            section: "warmup",
            sets: 2,
            reps: "12",
            loadType: "weighted",
          },
          {
            exerciseId: "dumbbell-bench-press",
            section: "main",
            sets: 3,
            reps: "8",
            loadType: "weighted",
          },
          {
            exerciseId: "bird-dog",
            section: "cooldown",
            sets: 2,
            reps: "8",
            loadType: "bodyweight",
          },
        ],
      },
    ],
    assessmentHistory: params.assessmentHistory,
    focusTagLifecycle,
    source: "cloud",
    deletedAt: null,
  };
};

const run = async () => {
  const envPath = loadEnvLocal();
  const connectionStringRaw = process.env.DATABASE_URL?.trim();
  if (!connectionStringRaw) {
    throw new Error(
      `DATABASE_URL is required. Loaded env from: ${envPath ?? "(none)"}`
    );
  }

  const pool = new Pool({
    connectionString: normalizeDatabaseUrlSslMode(connectionStringRaw),
  });
  const rand = mulberry32(0xb04c651e);

  try {
    const userResult = await pool.query(
      `SELECT id, email, plan FROM app_users WHERE id = $1 LIMIT 1`,
      [DEMO_USER_ID]
    );
    const user = userResult.rows[0] as
      | { id: string; email: string; plan: string }
      | undefined;
    if (!user) {
      throw new Error(
        `Demo user ${DEMO_USER_ID} not found in app_users. Aborting (no inserts).`
      );
    }

    console.log(
      `[seed:demo-user] target user id=${user.id} email=${user.email} plan=${user.plan}`
    );
    console.log(`[seed:demo-user] env=${envPath ?? "process.env"}`);
    console.log(
      `[seed:demo-user] scope: ONLY user_id=${DEMO_USER_ID} + ids LIKE '${SEED_PREFIX}-%'`
    );

    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const sessionDates = SESSION_DAY_OFFSETS.map((offset) =>
      addDays(today, -offset)
    );
    const assessmentHistory = buildForwardHeadHistory(sessionDates, rand);
    const programCreatedAt = atLocalHour(sessionDates[0], 8, 0).toISOString();
    const programUpdatedAt = new Date().toISOString();

    const program = buildSeedProgram({
      userId: DEMO_USER_ID,
      programId: SEED_PROGRAM_ID,
      createdAt: programCreatedAt,
      updatedAt: programUpdatedAt,
      assessmentHistory,
    });

    const sessions: SessionRecord[] = [];
    const logs: ExerciseLog[] = [];

    SESSION_DAY_OFFSETS.forEach((offset, index) => {
      const dayIndex = index % 3;
      const date = sessionDates[index];
      const started = atLocalHour(date, 17 + (index % 3), 10 + (index % 5) * 3);
      const durationSec = 38 * 60 + Math.round(rand() * 12 * 60);
      const completed = new Date(started.getTime() + durationSec * 1000);
      const isoStarted = started.toISOString();
      const isoCompleted = completed.toISOString();
      const sessionId = `${SEED_PREFIX}-s${String(index + 1).padStart(2, "0")}`;
      const feedback = buildJaggedCheckIn(index, SESSION_DAY_OFFSETS.length, rand);
      const sessionFeedback = sessionFeedbackFromRpe(feedback.difficultyRPE ?? 6);

      sessions.push({
        id: sessionId,
        userId: DEMO_USER_ID,
        startedAt: isoStarted,
        completedAt: isoCompleted,
        createdAt: isoStarted,
        updatedAt: isoCompleted,
        routineId: SEED_PROGRAM_ID,
        durationSec,
        activeDurationSec: durationSec - Math.round(120 + rand() * 180),
        abandoned: false,
        pausedDurationSec: Math.round(60 + rand() * 120),
        notes: `dayIndex:${dayIndex}`,
        sessionFeedback,
        sessionPainLocation: null,
        sessionFeedbackNotes: null,
        feedback,
        selectedPracticeMode: "full",
        source: "cloud",
        deletedAt: null,
      });

      const exerciseIds = EXERCISES_BY_DAY[dayIndex];
      exerciseIds.forEach((exerciseId, exerciseIndex) => {
        const weighted =
          exerciseId === "goblet-squat" ||
          exerciseId === "dumbbell-rows" ||
          exerciseId === "dumbbell-bench-press" ||
          exerciseId === "face-pull";
        const weekBoost = Math.floor(index / 3);
        const weight = weighted
          ? round1(20 + weekBoost * 2.5 + exerciseIndex * 2 + (rand() - 0.5) * 2)
          : null;
        const reps = 8 + Math.floor(rand() * 3);
        const logId = `${SEED_PREFIX}-l${String(index + 1).padStart(2, "0")}-e${exerciseIndex + 1}`;
        logs.push({
          id: logId,
          userId: DEMO_USER_ID,
          sessionId,
          exerciseId,
          section:
            exerciseIndex === 0
              ? "warmup"
              : exerciseIndex === 1
                ? "main"
                : "accessory",
          programId: SEED_PROGRAM_ID,
          dayIndex,
          createdAt: isoCompleted,
          updatedAt: isoCompleted,
          loadType: weighted ? "weighted" : "bodyweight",
          unit: weighted ? "lb" : null,
          weight,
          reps,
          repsBySet: [reps, reps, Math.max(5, reps - (rand() > 0.7 ? 1 : 0))],
          setsPlanned: 3,
          setsCompleted: 3,
          durationSec: null,
          workSecondsUsed: null,
          restSecondsUsed: 60,
          rpe: feedback.difficultyRPE ?? null,
          felt: sessionFeedback,
          painLevel:
            (feedback.painAfter ?? 0) >= 6
              ? "moderate"
              : (feedback.painAfter ?? 0) >= 3
                ? "mild"
                : "none",
          painLocation: null,
          notes: null,
          computedVolume: weight ? round1(weight * reps * 3) : null,
          source: "cloud",
          deletedAt: null,
        });
      });
    });

    const progress: ProgramProgress = {
      programId: SEED_PROGRAM_ID,
      lastCompletedDayIndex: (sessions.length - 1) % 3,
      nextDayIndex: sessions.length % 3,
      completedDayIndices: Array.from(
        { length: Math.min(sessions.length, 12) },
        (_, i) => i % 3
      ),
      phaseIndex: 1,
      phaseStartedAt: programCreatedAt,
      cyclesCompletedInPhase: 1,
      workoutsCompletedInPhase: sessions.length,
      daysPerWeek: 3,
      weekIndex: 4,
      updatedAt: programUpdatedAt,
    };

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Idempotent cleanup — ONLY this user's prior seed rows.
      const deletedLogs = await client.query(
        `DELETE FROM app_user_exercise_logs
         WHERE user_id = $1 AND log_id LIKE $2`,
        [DEMO_USER_ID, `${SEED_PREFIX}-%`]
      );
      const deletedSessions = await client.query(
        `DELETE FROM app_user_sessions
         WHERE user_id = $1 AND session_id LIKE $2`,
        [DEMO_USER_ID, `${SEED_PREFIX}-%`]
      );

      await client.query(
        `INSERT INTO app_user_programs (user_id, program_id, payload, updated_at)
         VALUES ($1, $2, $3::jsonb, NOW())
         ON CONFLICT (user_id, program_id)
         DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
        [DEMO_USER_ID, SEED_PROGRAM_ID, JSON.stringify(program)]
      );

      await client.query(
        `INSERT INTO app_user_program_progress (user_id, program_id, payload, updated_at)
         VALUES ($1, $2, $3::jsonb, NOW())
         ON CONFLICT (user_id, program_id)
         DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
        [DEMO_USER_ID, SEED_PROGRAM_ID, JSON.stringify(progress)]
      );

      for (const session of sessions) {
        await client.query(
          `INSERT INTO app_user_sessions (user_id, session_id, payload, updated_at)
           VALUES ($1, $2, $3::jsonb, NOW())
           ON CONFLICT (user_id, session_id)
           DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
          [DEMO_USER_ID, session.id, JSON.stringify(session)]
        );
      }

      for (const log of logs) {
        await client.query(
          `INSERT INTO app_user_exercise_logs (user_id, log_id, payload, updated_at)
           VALUES ($1, $2, $3::jsonb, NOW())
           ON CONFLICT (user_id, log_id)
           DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
          [DEMO_USER_ID, log.id, JSON.stringify(log)]
        );
      }

      await client.query("COMMIT");

      const firstFh =
        assessmentHistory[0]?.observations[0]?.measuredValue ?? null;
      const lastFh =
        assessmentHistory[assessmentHistory.length - 1]?.observations[0]
          ?.measuredValue ?? null;

      console.log(
        JSON.stringify(
          {
            ok: true,
            userId: DEMO_USER_ID,
            email: user.email,
            programId: SEED_PROGRAM_ID,
            deletedPriorSeedSessions: deletedSessions.rowCount ?? 0,
            deletedPriorSeedLogs: deletedLogs.rowCount ?? 0,
            insertedSessions: sessions.length,
            insertedLogs: logs.length,
            assessmentSnapshots: assessmentHistory.length,
            forwardHead: { first: firstFh, last: lastFh, threshold: FORWARD_HEAD_THRESHOLD },
            sampleCheckIn: sessions[0]?.feedback,
            latestCheckIn: sessions[sessions.length - 1]?.feedback,
            sessionDates: sessions.map((s) => ({
              id: s.id,
              completedAt: s.completedAt,
              feedback: s.feedback,
            })),
          },
          null,
          2
        )
      );
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
};

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
