/**
 * Phase 9 — Operator Dashboard aggregation (SR-9).
 *
 * Pure functions: arrays of anonymized records in → aggregate objects out.
 * No Date.now(), no DB access, no PII in outputs.
 *
 * `accountKey` is an opaque join key used only server-side during aggregation.
 * It must never appear in API responses.
 */

export type MetricsWindow = {
  /** Inclusive start ISO, or null for all-time. */
  startIso: string | null;
  /** Exclusive end ISO (usually "now" passed by the caller). */
  endIso: string;
};

export type OperatorUserRecord = {
  accountKey: string;
  createdAt: string;
  plan: "free" | "pro";
  /** True when questionnaire JSON exists server-side. */
  hasQuestionnaire: boolean;
  /** Photo path proxy: assessment payload or assessmentHistory present. */
  hasPhotos: boolean;
  /** Profile-only path (questionnaire/program without photo proxy). */
  hasProfileOnlyPath: boolean;
};

export type OperatorProgramRecord = {
  accountKey: string;
  createdAt: string;
  phaseTransitionsEarned: number;
  ladderAdvancements: number;
  ladderRegressions: number;
  /** Active (non-retired) focus tags on this program. */
  activeFocusTags: string[];
  /** Focus tags with retiredAt set. */
  retiredFocusTags: string[];
  /** exerciseId → sacrifice count contribution from this program's prefs/ladder. */
  sacrificedExerciseIds: string[];
  testChoices: number;
  modifyChoices: number;
};

export type OperatorSessionRecord = {
  accountKey: string;
  startedAt: string | null;
  completedAt: string | null;
  abandoned: boolean;
  /** Prefer activeDurationSec; fall back to durationSec. */
  durationSec: number | null;
  createdAt: string;
};

export type OperatorExerciseLogRecord = {
  accountKey: string;
  exerciseId: string;
  sessionId: string;
  createdAt: string;
  /** Treated as skipped when setsCompleted is 0 (or null with setsPlanned > 0). */
  skipped: boolean;
};

export type PromoRedemptionRecord = {
  code: string;
  redeemedAt: string;
};

export type FunnelStep = {
  id: string;
  label: string;
  count: number;
  /** % of previous step (100 for first). */
  pctOfPrevious: number;
  /** % of total accounts (step 1 denominator). */
  pctOfTotal: number;
  dropOffFromPrevious: number;
};

export type AcquisitionMetrics = {
  totalAccounts: number;
  newAccountsInWindow: number;
  freeCount: number;
  proCount: number;
  promoRedemptionsByCode: Record<string, number>;
};

export type ActivationFunnelMetrics = {
  steps: FunnelStep[];
  largestDropOffStepId: string | null;
};

export type EngagementMetrics = {
  sessionsCompletedInWindow: number;
  averageSessionsPerActiveUser: number;
  sessionCompletionRate: number;
  medianSessionDurationSec: number | null;
  abandonmentRate: number;
  /** Bucket label → count of active users. */
  sessionsPerWeekDistribution: Record<string, number>;
};

export type EngineHealthMetrics = {
  ladderAdvancementsInWindow: number;
  regressionsInWindow: number;
  sacrificesLogged: number;
  topSacrificedExercises: Array<{ exerciseId: string; count: number }>;
  testChoices: number;
  modifyChoices: number;
  phaseTransitionsEarned: number;
  topSkippedExercises: Array<{ exerciseId: string; count: number }>;
  activeFocusTagDistribution: Record<string, number>;
  focusTagsRetiredInWindow: number;
};

export type RetentionCohortRow = {
  /** ISO date (UTC) of cohort week start (Monday). */
  cohortWeekStart: string;
  cohortSize: number;
  /** weekOffset 1..4 → % of cohort that completed ≥1 session that week. */
  retentionByWeek: Record<string, number>;
};

const inWindow = (iso: string | null | undefined, window: MetricsWindow) => {
  if (!iso) return false;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return false;
  const end = Date.parse(window.endIso);
  if (!Number.isFinite(end) || ms >= end) return false;
  if (window.startIso === null) return true;
  const start = Date.parse(window.startIso);
  return Number.isFinite(start) && ms >= start;
};

const pct = (part: number, whole: number) =>
  whole <= 0 ? 0 : Math.round((part / whole) * 1000) / 10;

const median = (values: number[]): number | null => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid]!;
  return (sorted[mid - 1]! + sorted[mid]!) / 2;
};

const topN = (
  counts: Map<string, number>,
  n: number
): Array<{ exerciseId: string; count: number }> =>
  [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([exerciseId, count]) => ({ exerciseId, count }));

/** UTC Monday 00:00 of the week containing `iso`. */
export const utcWeekStartIso = (iso: string): string => {
  const d = new Date(iso);
  const day = d.getUTCDay(); // 0 Sun .. 6 Sat
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff)
  );
  return monday.toISOString();
};

export const computeAcquisitionMetrics = (
  users: OperatorUserRecord[],
  window: MetricsWindow,
  redemptions: PromoRedemptionRecord[] = []
): AcquisitionMetrics => {
  const promoRedemptionsByCode: Record<string, number> = {};
  for (const entry of redemptions) {
    if (!inWindow(entry.redeemedAt, window)) continue;
    const code = entry.code.trim() || "unknown";
    promoRedemptionsByCode[code] = (promoRedemptionsByCode[code] ?? 0) + 1;
  }
  return {
    totalAccounts: users.length,
    newAccountsInWindow: users.filter((u) => inWindow(u.createdAt, window)).length,
    freeCount: users.filter((u) => u.plan === "free").length,
    proCount: users.filter((u) => u.plan === "pro").length,
    promoRedemptionsByCode,
  };
};

export const computeActivationFunnel = (
  users: OperatorUserRecord[],
  programs: OperatorProgramRecord[],
  sessions: OperatorSessionRecord[]
): ActivationFunnelMetrics => {
  const total = users.length;
  const programKeys = new Set(programs.map((p) => p.accountKey));
  const sessionsByUser = new Map<string, OperatorSessionRecord[]>();
  for (const session of sessions) {
    const list = sessionsByUser.get(session.accountKey) ?? [];
    list.push(session);
    sessionsByUser.set(session.accountKey, list);
  }

  const sortedSessions = (key: string) => {
    const list = sessionsByUser.get(key) ?? [];
    return [...list].sort((a, b) => {
      const aMs = Date.parse(a.startedAt ?? a.createdAt);
      const bMs = Date.parse(b.startedAt ?? b.createdAt);
      return aMs - bMs;
    });
  };

  const hasSessionNStarted = (key: string, n: number) =>
    sortedSessions(key).length >= n;
  const hasSessionNCompleted = (key: string, n: number) => {
    const ordered = sortedSessions(key);
    let completed = 0;
    for (const session of ordered) {
      if (session.completedAt) {
        completed += 1;
        if (completed >= n) return true;
      }
    }
    return false;
  };

  const stepDefs: Array<{ id: string; label: string; count: number }> = [
    { id: "account_created", label: "Account created", count: total },
    {
      id: "questionnaire_completed",
      label: "Questionnaire completed",
      count: users.filter((u) => u.hasQuestionnaire).length,
    },
    {
      id: "photos_uploaded",
      label: "Photos uploaded",
      count: users.filter((u) => u.hasPhotos).length,
    },
    {
      id: "profile_only_path",
      label: "Profile-only path (no photos)",
      count: users.filter((u) => u.hasProfileOnlyPath && !u.hasPhotos).length,
    },
    {
      id: "program_generated",
      label: "Program generated",
      count: users.filter((u) => programKeys.has(u.accountKey)).length,
    },
    {
      id: "session_1_started",
      label: "Session 1 started",
      count: users.filter((u) => hasSessionNStarted(u.accountKey, 1)).length,
    },
    {
      id: "session_1_completed",
      label: "Session 1 completed",
      count: users.filter((u) => hasSessionNCompleted(u.accountKey, 1)).length,
    },
    {
      id: "session_2_started",
      label: "Session 2 started",
      count: users.filter((u) => hasSessionNStarted(u.accountKey, 2)).length,
    },
    {
      id: "session_2_completed",
      label: "Session 2 completed",
      count: users.filter((u) => hasSessionNCompleted(u.accountKey, 2)).length,
    },
  ];

  // Spec funnel is 8 ordered steps; profile-only is tracked alongside photos
  // but drop-off highlighting uses the main chain (skip profile-only for chain %).
  const mainChainIds = new Set([
    "account_created",
    "questionnaire_completed",
    "photos_uploaded",
    "program_generated",
    "session_1_started",
    "session_1_completed",
    "session_2_started",
    "session_2_completed",
  ]);
  const mainSteps = stepDefs.filter((s) => mainChainIds.has(s.id));

  const steps: FunnelStep[] = stepDefs.map((step) => {
    const mainIndex = mainSteps.findIndex((s) => s.id === step.id);
    const previous =
      mainIndex > 0
        ? mainSteps[mainIndex - 1]!
        : mainIndex === 0
          ? null
          : null;
    const prevCount =
      step.id === "profile_only_path"
        ? users.filter((u) => u.hasQuestionnaire).length
        : previous
          ? previous.count
          : step.count;
    const dropOff =
      step.id === "profile_only_path"
        ? 0
        : previous
          ? Math.max(0, previous.count - step.count)
          : 0;
    return {
      id: step.id,
      label: step.label,
      count: step.count,
      pctOfPrevious: previous || step.id === "profile_only_path" ? pct(step.count, prevCount || 1) : 100,
      pctOfTotal: pct(step.count, total || 1),
      dropOffFromPrevious: dropOff,
    };
  });

  let largestDropOffStepId: string | null = null;
  let largestDrop = -1;
  for (const step of steps) {
    if (!mainChainIds.has(step.id)) continue;
    if (step.id === "account_created") continue;
    if (step.dropOffFromPrevious > largestDrop) {
      largestDrop = step.dropOffFromPrevious;
      largestDropOffStepId = step.id;
    }
  }

  return { steps, largestDropOffStepId };
};

export const computeEngagementMetrics = (
  sessions: OperatorSessionRecord[],
  window: MetricsWindow
): EngagementMetrics => {
  const windowSessions = sessions.filter((s) =>
    inWindow(s.startedAt ?? s.createdAt, window)
  );
  const started = windowSessions.length;
  const completed = windowSessions.filter((s) => Boolean(s.completedAt)).length;
  const abandoned = windowSessions.filter((s) => s.abandoned === true).length;

  const completedByUser = new Map<string, number>();
  for (const session of windowSessions) {
    if (!session.completedAt) continue;
    completedByUser.set(
      session.accountKey,
      (completedByUser.get(session.accountKey) ?? 0) + 1
    );
  }
  const activeUsers = completedByUser.size;
  const totalCompletedByActive = [...completedByUser.values()].reduce(
    (sum, n) => sum + n,
    0
  );

  const durations = windowSessions
    .map((s) => s.durationSec)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n) && n > 0);

  // sessions-per-week: approximate from window length.
  const windowMs =
    window.startIso === null
      ? Math.max(1, Date.parse(window.endIso) - Date.parse("1970-01-01T00:00:00.000Z"))
      : Math.max(1, Date.parse(window.endIso) - Date.parse(window.startIso));
  const windowWeeks = Math.max(1, windowMs / (7 * 24 * 60 * 60 * 1000));
  const distribution: Record<string, number> = {
    "0": 0,
    "1": 0,
    "2-3": 0,
    "4+": 0,
  };
  for (const count of completedByUser.values()) {
    const perWeek = count / windowWeeks;
    if (perWeek < 0.5) distribution["0"] = (distribution["0"] ?? 0) + 1;
    else if (perWeek < 1.5) distribution["1"] = (distribution["1"] ?? 0) + 1;
    else if (perWeek < 3.5) distribution["2-3"] = (distribution["2-3"] ?? 0) + 1;
    else distribution["4+"] = (distribution["4+"] ?? 0) + 1;
  }

  return {
    sessionsCompletedInWindow: completed,
    averageSessionsPerActiveUser:
      activeUsers === 0
        ? 0
        : Math.round((totalCompletedByActive / activeUsers) * 10) / 10,
    sessionCompletionRate: started === 0 ? 0 : pct(completed, started) / 100,
    medianSessionDurationSec: median(durations),
    abandonmentRate: started === 0 ? 0 : pct(abandoned, started) / 100,
    sessionsPerWeekDistribution: distribution,
  };
};

export const computeEngineHealthMetrics = (
  programs: OperatorProgramRecord[],
  logs: OperatorExerciseLogRecord[],
  window: MetricsWindow
): EngineHealthMetrics => {
  // Program-level ladder/phase/sacrifice signals are lifetime on the program
  // payload today (no per-event timestamps). Count them for all programs that
  // were created in-window when a window is set; all-time otherwise.
  const scopedPrograms = programs.filter((p) => inWindow(p.createdAt, window) || window.startIso === null);

  let ladderAdvancements = 0;
  let regressions = 0;
  let sacrifices = 0;
  let testChoices = 0;
  let modifyChoices = 0;
  let phaseTransitions = 0;
  let focusTagsRetired = 0;
  const sacrificedCounts = new Map<string, number>();
  const activeFocus = new Map<string, number>();

  for (const program of scopedPrograms) {
    ladderAdvancements += program.ladderAdvancements;
    regressions += program.ladderRegressions;
    testChoices += program.testChoices;
    modifyChoices += program.modifyChoices;
    phaseTransitions += program.phaseTransitionsEarned;
    focusTagsRetired += program.retiredFocusTags.length;
    for (const id of program.sacrificedExerciseIds) {
      sacrifices += 1;
      sacrificedCounts.set(id, (sacrificedCounts.get(id) ?? 0) + 1);
    }
    for (const tag of program.activeFocusTags) {
      activeFocus.set(tag, (activeFocus.get(tag) ?? 0) + 1);
    }
  }

  const skippedCounts = new Map<string, number>();
  for (const log of logs) {
    if (!log.skipped) continue;
    if (!inWindow(log.createdAt, window) && window.startIso !== null) continue;
    skippedCounts.set(log.exerciseId, (skippedCounts.get(log.exerciseId) ?? 0) + 1);
  }

  return {
    ladderAdvancementsInWindow: ladderAdvancements,
    regressionsInWindow: regressions,
    sacrificesLogged: sacrifices,
    topSacrificedExercises: topN(sacrificedCounts, 10),
    testChoices,
    modifyChoices,
    phaseTransitionsEarned: phaseTransitions,
    topSkippedExercises: topN(skippedCounts, 10),
    activeFocusTagDistribution: Object.fromEntries(activeFocus),
    focusTagsRetiredInWindow: focusTagsRetired,
  };
};

export const computeRetentionCohorts = (
  users: OperatorUserRecord[],
  sessions: OperatorSessionRecord[],
  opts: { asOfIso: string; maxCohorts?: number }
): RetentionCohortRow[] => {
  const completedByUser = new Map<string, string[]>();
  for (const session of sessions) {
    if (!session.completedAt) continue;
    const list = completedByUser.get(session.accountKey) ?? [];
    list.push(session.completedAt);
    completedByUser.set(session.accountKey, list);
  }

  const byCohort = new Map<string, OperatorUserRecord[]>();
  for (const user of users) {
    const week = utcWeekStartIso(user.createdAt);
    const list = byCohort.get(week) ?? [];
    list.push(user);
    byCohort.set(week, list);
  }

  const maxCohorts = opts.maxCohorts ?? 12;
  const cohortWeeks = [...byCohort.keys()].sort().slice(-maxCohorts);

  return cohortWeeks.map((cohortWeekStart) => {
    const cohort = byCohort.get(cohortWeekStart) ?? [];
    const cohortSize = cohort.length;
    const retentionByWeek: Record<string, number> = {};
    for (let weekOffset = 1; weekOffset <= 4; weekOffset += 1) {
      const weekStartMs =
        Date.parse(cohortWeekStart) + (weekOffset - 1) * 7 * 24 * 60 * 60 * 1000;
      const weekEndMs = weekStartMs + 7 * 24 * 60 * 60 * 1000;
      let retained = 0;
      for (const user of cohort) {
        const stamps = completedByUser.get(user.accountKey) ?? [];
        const hit = stamps.some((iso) => {
          const ms = Date.parse(iso);
          return ms >= weekStartMs && ms < weekEndMs;
        });
        if (hit) retained += 1;
      }
      retentionByWeek[String(weekOffset)] = pct(retained, cohortSize || 1);
    }
    return { cohortWeekStart, cohortSize, retentionByWeek };
  });
};

/** Resolve MetricsWindow for 7d / 30d / all from a fixed "now". */
export const resolveMetricsWindow = (
  preset: "7d" | "30d" | "all",
  nowIso: string
): MetricsWindow => {
  const end = Date.parse(nowIso);
  if (preset === "all") return { startIso: null, endIso: nowIso };
  const days = preset === "7d" ? 7 : 30;
  const start = new Date(end - days * 24 * 60 * 60 * 1000).toISOString();
  return { startIso: start, endIso: nowIso };
};
