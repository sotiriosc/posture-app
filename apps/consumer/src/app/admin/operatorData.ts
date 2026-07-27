import { createHash } from "crypto";
import {
  computeAcquisitionMetrics,
  computeActivationFunnel,
  computeEngagementMetrics,
  computeEngineHealthMetrics,
  computeRetentionCohorts,
  resolveMetricsWindow,
  type OperatorExerciseLogRecord,
  type OperatorProgramRecord,
  type OperatorSessionRecord,
  type OperatorUserRecord,
} from "@/lib/metrics/operatorMetrics";
import type { LogPrefs, Program, SessionRecord, ExerciseLog } from "@/lib/types";
import type { TrainingSnapshot } from "@/lib/trainingStateModel";
import { getUserRepository } from "@/lib/userRepository";
import {
  getConfiguredTrainingStoreDriver,
  isTrainingStoreDisabled,
} from "@/lib/trainingStoreConfig";
import { formatStripePriceLabel, getMonthlyPriceId } from "@/lib/stripeServer";

export type OperatorWindowPreset = "7d" | "30d" | "all";

export type OperatorDashboardPayload = {
  window: OperatorWindowPreset;
  asOfIso: string;
  smallSample: boolean;
  glance: {
    totalAccounts: number;
    proSubscribers: number;
    sessionsThisWeek: number;
    mrrUsd: number | null;
    mrrNote: string;
  };
  acquisition: ReturnType<typeof computeAcquisitionMetrics>;
  activationFunnel: ReturnType<typeof computeActivationFunnel>;
  engagement: ReturnType<typeof computeEngagementMetrics>;
  retentionCohorts: ReturnType<typeof computeRetentionCohorts>;
  engineHealth: ReturnType<typeof computeEngineHealthMetrics>;
  feedback: {
    submissionCount: number | null;
    sheetUrl: string | null;
    note: string;
  };
};

const MONTHLY_FALLBACK_USD = 19.99;
const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry = { expiresAt: number; payload: OperatorDashboardPayload };

const cache = new Map<string, CacheEntry>();

const opaqueAccountKey = (userId: string) =>
  createHash("sha256").update(`praxis-op:${userId}`).digest("hex").slice(0, 16);

const mapProgram = (
  accountKey: string,
  program: Program,
  prefs: LogPrefs | null | undefined
): OperatorProgramRecord => {
  const ladder = program.ladderState;
  const advancements = ladder?.rungAdvancementHistory?.length ?? 0;
  let regressions = 0;
  for (const rung of Object.values(ladder?.byPattern ?? {})) {
    if (/regress/i.test(rung.lastDecisionTrace ?? "")) regressions += 1;
  }

  const sacrificedExerciseIds: string[] = [];
  let testChoices = 0;
  let modifyChoices = 0;
  for (const [exerciseId, state] of Object.entries(
    prefs?.contractStateByExercise ?? {}
  )) {
    if (state.probation) testChoices += 1;
    if (state.deferred) {
      sacrificedExerciseIds.push(exerciseId);
      if (!state.autoSacrificed) {
        // Modify is the non-auto defer path that keeps the exercise adjustable;
        // count distinct from pure sacrifice when probation is absent.
        if (!state.probation && !state.sacrificedAt) modifyChoices += 1;
      }
    }
  }

  const activeFocusTags: string[] = [];
  const retiredFocusTags: string[] = [];
  for (const [tag, state] of Object.entries(program.focusTagLifecycle ?? {})) {
    if (state.retiredAt) retiredFocusTags.push(tag);
    else activeFocusTags.push(tag);
  }
  // Fall back to current week focus tags when lifecycle is empty.
  if (activeFocusTags.length === 0) {
    for (const day of program.week ?? []) {
      for (const tag of day.focusTags ?? []) {
        if (!activeFocusTags.includes(tag)) activeFocusTags.push(tag);
      }
    }
  }

  return {
    accountKey,
    createdAt: program.createdAt,
    phaseTransitionsEarned: program.phaseHistory?.length ?? 0,
    ladderAdvancements: advancements,
    ladderRegressions: regressions,
    activeFocusTags,
    retiredFocusTags,
    sacrificedExerciseIds,
    testChoices,
    modifyChoices,
  };
};

const mapSession = (
  accountKey: string,
  session: SessionRecord
): OperatorSessionRecord => ({
  accountKey,
  startedAt: session.startedAt,
  completedAt: session.completedAt,
  abandoned: session.abandoned === true,
  durationSec:
    typeof session.activeDurationSec === "number"
      ? session.activeDurationSec
      : session.durationSec,
  createdAt: session.createdAt,
});

const mapLog = (
  accountKey: string,
  log: ExerciseLog
): OperatorExerciseLogRecord => {
  const planned = log.setsPlanned ?? 0;
  const completed = log.setsCompleted;
  const skipped =
    completed === 0 || (planned > 0 && (completed === null || completed === undefined));
  return {
    accountKey,
    exerciseId: log.exerciseId,
    sessionId: log.sessionId,
    createdAt: log.createdAt,
    skipped,
  };
};

const loadTrainingByUserId = async (): Promise<
  Map<string, TrainingSnapshot>
> => {
  const map = new Map<string, TrainingSnapshot>();
  if (isTrainingStoreDisabled()) return map;
  if (getConfiguredTrainingStoreDriver() !== "db") return map;
  try {
    const { listAllUserTrainingSnapshots } = await import("@/lib/trainingStoreDb");
    const rows = await listAllUserTrainingSnapshots();
    for (const row of rows) map.set(row.userId, row.snapshot);
  } catch (error) {
    console.error("[admin/operator] training corpus load failed", error);
  }
  return map;
};

const resolveMrrUsd = async (proCount: number): Promise<{
  mrrUsd: number | null;
  mrrNote: string;
}> => {
  if (proCount === 0) {
    return { mrrUsd: 0, mrrNote: "No Pro subscribers." };
  }
  try {
    const priceId = getMonthlyPriceId();
    if (priceId && process.env.STRIPE_SECRET_KEY) {
      const res = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
        headers: {
          Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
        cache: "no-store",
      });
      if (res.ok) {
        const price = (await res.json()) as {
          unit_amount?: number | null;
          currency?: string;
          recurring?: { interval?: string };
        };
        if (
          typeof price.unit_amount === "number" &&
          price.recurring?.interval === "month"
        ) {
          const monthly = price.unit_amount / 100;
          const label = formatStripePriceLabel(price) ?? `$${monthly.toFixed(2)}/mo`;
          return {
            mrrUsd: Math.round(proCount * monthly * 100) / 100,
            mrrNote: `Pro × ${label}`,
          };
        }
      }
    }
  } catch {
    // fall through
  }
  return {
    mrrUsd: Math.round(proCount * MONTHLY_FALLBACK_USD * 100) / 100,
    mrrNote: `Estimated from Pro count × $${MONTHLY_FALLBACK_USD.toFixed(2)}/mo (Stripe price unavailable).`,
  };
};

export const buildOperatorDashboardPayload = async (
  window: OperatorWindowPreset,
  nowIso: string = new Date().toISOString()
): Promise<OperatorDashboardPayload> => {
  const cacheKey = `${window}:${nowIso.slice(0, 15)}`;
  // Cache key buckets by ~minute so "now" doesn't bust every request; TTL still applies.
  const hit = cache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now()) return hit.payload;

  // Also reuse any non-expired entry for the same window.
  for (const [key, entry] of cache.entries()) {
    if (key.startsWith(`${window}:`) && entry.expiresAt > Date.now()) {
      return entry.payload;
    }
  }

  const repo = getUserRepository();
  const users = await repo.listUsers();
  const trainingByUser = await loadTrainingByUserId();

  const operatorUsers: OperatorUserRecord[] = [];
  const programs: OperatorProgramRecord[] = [];
  const sessions: OperatorSessionRecord[] = [];
  const logs: OperatorExerciseLogRecord[] = [];

  for (const stored of users) {
    const accountKey = opaqueAccountKey(stored.id);
    const snap = trainingByUser.get(stored.id);
    const hasQuestionnaire = Boolean(snap?.questionnaire);
    const hasPhotos = Boolean(
      snap?.assessment ||
        snap?.programs?.some((p) => (p.assessmentHistory?.length ?? 0) > 0)
    );
    const hasProgram = (snap?.programs?.length ?? 0) > 0;
    operatorUsers.push({
      accountKey,
      createdAt: stored.createdAt,
      plan: stored.plan === "pro" ? "pro" : "free",
      hasQuestionnaire,
      hasPhotos,
      hasProfileOnlyPath: hasQuestionnaire && hasProgram && !hasPhotos,
    });

    for (const program of snap?.programs ?? []) {
      programs.push(mapProgram(accountKey, program, snap?.prefs));
    }
    for (const session of snap?.sessions ?? []) {
      sessions.push(mapSession(accountKey, session));
    }
    for (const log of snap?.exerciseLogs ?? []) {
      logs.push(mapLog(accountKey, log));
    }
  }

  const metricsWindow = resolveMetricsWindow(window, nowIso);
  const weekWindow = resolveMetricsWindow("7d", nowIso);
  const acquisition = computeAcquisitionMetrics(operatorUsers, metricsWindow);
  const activationFunnel = computeActivationFunnel(
    operatorUsers,
    programs,
    sessions
  );
  const engagement = computeEngagementMetrics(sessions, metricsWindow);
  const weekEngagement = computeEngagementMetrics(sessions, weekWindow);
  const engineHealth = computeEngineHealthMetrics(programs, logs, metricsWindow);
  const retentionCohorts = computeRetentionCohorts(operatorUsers, sessions, {
    asOfIso: nowIso,
  });
  const mrr = await resolveMrrUsd(acquisition.proCount);

  const feedbackFormId = process.env.NEXT_PUBLIC_GOOGLE_FEEDBACK_FORM_ID?.trim();
  const sheetUrl = process.env.NEXT_PUBLIC_GOOGLE_FEEDBACK_SHEET_URL?.trim() || null;

  const payload: OperatorDashboardPayload = {
    window,
    asOfIso: nowIso,
    smallSample: operatorUsers.length < 5,
    glance: {
      totalAccounts: acquisition.totalAccounts,
      proSubscribers: acquisition.proCount,
      sessionsThisWeek: weekEngagement.sessionsCompletedInWindow,
      mrrUsd: mrr.mrrUsd,
      mrrNote: mrr.mrrNote,
    },
    acquisition,
    activationFunnel,
    engagement,
    retentionCohorts,
    engineHealth,
    feedback: {
      submissionCount: null,
      sheetUrl:
        sheetUrl ||
        (feedbackFormId
          ? `https://docs.google.com/forms/d/${feedbackFormId}`
          : null),
      note: "Feedback submissions live in the Google Sheet — Praxis does not store them.",
    },
  };

  cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
  return payload;
};

/** Test helper — drop in-memory aggregate cache. */
export const clearOperatorDashboardCache = () => {
  cache.clear();
};

/** Assert aggregate payload has no PII-shaped fields (defense in depth). */
export const assertNoPiiInOperatorPayload = (payload: unknown): string[] => {
  const raw = JSON.stringify(payload);
  const violations: string[] = [];
  if (/"email"\s*:/i.test(raw)) violations.push("email field");
  if (/"name"\s*:/i.test(raw)) violations.push("name field");
  if (/"userId"\s*:/i.test(raw)) violations.push("userId field");
  if (/"accountKey"\s*:/i.test(raw)) violations.push("accountKey field");
  if (/"password/i.test(raw)) violations.push("password field");
  if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(raw)) {
    violations.push("email address literal");
  }
  return violations;
};
