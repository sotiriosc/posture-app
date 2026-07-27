import { describe, expect, test } from "vitest";
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

const NOW = "2026-07-27T00:00:00.000Z";
const W7 = resolveMetricsWindow("7d", NOW);
const WALL = resolveMetricsWindow("all", NOW);

const user = (
  key: string,
  overrides: Partial<OperatorUserRecord> = {}
): OperatorUserRecord => ({
  accountKey: key,
  createdAt: "2026-07-20T00:00:00.000Z",
  plan: "free",
  hasQuestionnaire: false,
  hasPhotos: false,
  hasProfileOnlyPath: false,
  ...overrides,
});

describe("resolveMetricsWindow", () => {
  test("7d and 30d set start; all leaves start null", () => {
    expect(resolveMetricsWindow("all", NOW).startIso).toBeNull();
    expect(resolveMetricsWindow("7d", NOW).startIso).toBe(
      "2026-07-20T00:00:00.000Z"
    );
    expect(resolveMetricsWindow("30d", NOW).startIso).toBe(
      "2026-06-27T00:00:00.000Z"
    );
  });
});

describe("computeAcquisitionMetrics", () => {
  test("zero users", () => {
    const m = computeAcquisitionMetrics([], WALL);
    expect(m.totalAccounts).toBe(0);
    expect(m.proCount).toBe(0);
    expect(m.promoRedemptionsByCode).toEqual({});
  });

  test("counts free/pro and windowed signups + promo codes", () => {
    const users = [
      user("a", { plan: "pro", createdAt: "2026-07-25T00:00:00.000Z" }),
      user("b", { plan: "free", createdAt: "2026-06-01T00:00:00.000Z" }),
      user("c", { plan: "free", createdAt: "2026-07-22T00:00:00.000Z" }),
    ];
    const m = computeAcquisitionMetrics(users, W7, [
      { code: "FOUNDERS", redeemedAt: "2026-07-24T00:00:00.000Z" },
      { code: "FOUNDERS", redeemedAt: "2026-07-25T00:00:00.000Z" },
      { code: "OLD", redeemedAt: "2026-01-01T00:00:00.000Z" },
    ]);
    expect(m.totalAccounts).toBe(3);
    expect(m.proCount).toBe(1);
    expect(m.freeCount).toBe(2);
    expect(m.newAccountsInWindow).toBe(2);
    expect(m.promoRedemptionsByCode).toEqual({ FOUNDERS: 2 });
  });
});

describe("computeActivationFunnel", () => {
  test("one idle user sits only at account created", () => {
    const funnel = computeActivationFunnel([user("idle")], [], []);
    expect(funnel.steps[0]?.count).toBe(1);
    expect(funnel.steps.find((s) => s.id === "questionnaire_completed")?.count).toBe(
      0
    );
    expect(funnel.largestDropOffStepId).toBe("questionnaire_completed");
  });

  test("realistic mix surfaces the largest drop-off", () => {
    const users: OperatorUserRecord[] = [
      user("u1", {
        hasQuestionnaire: true,
        hasPhotos: true,
        hasProfileOnlyPath: false,
      }),
      user("u2", {
        hasQuestionnaire: true,
        hasPhotos: false,
        hasProfileOnlyPath: true,
      }),
      user("u3", { hasQuestionnaire: true, hasPhotos: true }),
      user("u4", { hasQuestionnaire: false }),
    ];
    const programs: OperatorProgramRecord[] = [
      {
        accountKey: "u1",
        createdAt: "2026-07-21T00:00:00.000Z",
        phaseTransitionsEarned: 1,
        ladderAdvancements: 2,
        ladderRegressions: 0,
        activeFocusTags: ["forward_head"],
        retiredFocusTags: [],
        sacrificedExerciseIds: ["ex_a"],
        testChoices: 1,
        modifyChoices: 0,
      },
    ];
    const sessions: OperatorSessionRecord[] = [
      {
        accountKey: "u1",
        startedAt: "2026-07-22T10:00:00.000Z",
        completedAt: "2026-07-22T10:40:00.000Z",
        abandoned: false,
        durationSec: 2400,
        createdAt: "2026-07-22T10:00:00.000Z",
      },
      {
        accountKey: "u1",
        startedAt: "2026-07-23T10:00:00.000Z",
        completedAt: "2026-07-23T10:35:00.000Z",
        abandoned: false,
        durationSec: 2100,
        createdAt: "2026-07-23T10:00:00.000Z",
      },
      {
        accountKey: "u3",
        startedAt: "2026-07-22T12:00:00.000Z",
        completedAt: null,
        abandoned: true,
        durationSec: 120,
        createdAt: "2026-07-22T12:00:00.000Z",
      },
    ];
    const funnel = computeActivationFunnel(users, programs, sessions);
    expect(funnel.steps.find((s) => s.id === "account_created")?.count).toBe(4);
    expect(funnel.steps.find((s) => s.id === "questionnaire_completed")?.count).toBe(
      3
    );
    expect(funnel.steps.find((s) => s.id === "photos_uploaded")?.count).toBe(2);
    expect(funnel.steps.find((s) => s.id === "program_generated")?.count).toBe(1);
    expect(funnel.steps.find((s) => s.id === "session_2_completed")?.count).toBe(1);
    expect(funnel.largestDropOffStepId).toBeTruthy();
    const dropStep = funnel.steps.find((s) => s.id === funnel.largestDropOffStepId);
    expect(dropStep?.dropOffFromPrevious).toBeGreaterThan(0);
  });
});

describe("computeEngagementMetrics", () => {
  test("completion, median duration, abandonment", () => {
    const sessions: OperatorSessionRecord[] = [
      {
        accountKey: "a",
        startedAt: "2026-07-25T00:00:00.000Z",
        completedAt: "2026-07-25T00:40:00.000Z",
        abandoned: false,
        durationSec: 2400,
        createdAt: "2026-07-25T00:00:00.000Z",
      },
      {
        accountKey: "a",
        startedAt: "2026-07-26T00:00:00.000Z",
        completedAt: "2026-07-26T00:30:00.000Z",
        abandoned: false,
        durationSec: 1800,
        createdAt: "2026-07-26T00:00:00.000Z",
      },
      {
        accountKey: "b",
        startedAt: "2026-07-26T01:00:00.000Z",
        completedAt: null,
        abandoned: true,
        durationSec: 60,
        createdAt: "2026-07-26T01:00:00.000Z",
      },
    ];
    const m = computeEngagementMetrics(sessions, W7);
    expect(m.sessionsCompletedInWindow).toBe(2);
    expect(m.averageSessionsPerActiveUser).toBe(2);
    expect(m.sessionCompletionRate).toBeCloseTo(0.667, 3);
    expect(m.medianSessionDurationSec).toBe(1800);
    expect(m.abandonmentRate).toBeCloseTo(0.333, 3);
  });
});

describe("computeEngineHealthMetrics", () => {
  test("aggregates sacrifices, skips, focus tags", () => {
    const programs: OperatorProgramRecord[] = [
      {
        accountKey: "a",
        createdAt: "2026-07-21T00:00:00.000Z",
        phaseTransitionsEarned: 2,
        ladderAdvancements: 3,
        ladderRegressions: 1,
        activeFocusTags: ["forward_head", "hip_stability"],
        retiredFocusTags: ["scapular_control"],
        sacrificedExerciseIds: ["ex_hard", "ex_hard", "ex_other"],
        testChoices: 2,
        modifyChoices: 1,
      },
    ];
    const logs: OperatorExerciseLogRecord[] = [
      {
        accountKey: "a",
        exerciseId: "ex_skip",
        sessionId: "s1",
        createdAt: "2026-07-25T00:00:00.000Z",
        skipped: true,
      },
      {
        accountKey: "a",
        exerciseId: "ex_skip",
        sessionId: "s2",
        createdAt: "2026-07-26T00:00:00.000Z",
        skipped: true,
      },
      {
        accountKey: "a",
        exerciseId: "ex_ok",
        sessionId: "s2",
        createdAt: "2026-07-26T00:00:00.000Z",
        skipped: false,
      },
    ];
    const m = computeEngineHealthMetrics(programs, logs, WALL);
    expect(m.ladderAdvancementsInWindow).toBe(3);
    expect(m.regressionsInWindow).toBe(1);
    expect(m.sacrificesLogged).toBe(3);
    expect(m.topSacrificedExercises[0]).toEqual({
      exerciseId: "ex_hard",
      count: 2,
    });
    expect(m.testChoices).toBe(2);
    expect(m.modifyChoices).toBe(1);
    expect(m.phaseTransitionsEarned).toBe(2);
    expect(m.topSkippedExercises[0]).toEqual({ exerciseId: "ex_skip", count: 2 });
    expect(m.activeFocusTagDistribution.forward_head).toBe(1);
    expect(m.focusTagsRetiredInWindow).toBe(1);
  });
});

describe("computeRetentionCohorts", () => {
  test("week-1 retention for a cohort", () => {
    const users = [
      user("a", { createdAt: "2026-07-06T12:00:00.000Z" }), // week of Jun 29? Jul 6 is Monday
      user("b", { createdAt: "2026-07-07T12:00:00.000Z" }),
    ];
    const sessions: OperatorSessionRecord[] = [
      {
        accountKey: "a",
        startedAt: "2026-07-08T00:00:00.000Z",
        completedAt: "2026-07-08T00:30:00.000Z",
        abandoned: false,
        durationSec: 1800,
        createdAt: "2026-07-08T00:00:00.000Z",
      },
    ];
    const rows = computeRetentionCohorts(users, sessions, { asOfIso: NOW });
    expect(rows.length).toBeGreaterThan(0);
    const cohort = rows.find((r) => r.cohortSize === 2);
    expect(cohort).toBeTruthy();
    expect(cohort!.retentionByWeek["1"]).toBe(50);
  });
});

describe("20-user mix smoke", () => {
  test("aggregates stay finite and PII-free shape", () => {
    const users = Array.from({ length: 20 }, (_, i) =>
      user(`u${i}`, {
        plan: i % 5 === 0 ? "pro" : "free",
        hasQuestionnaire: i > 2,
        hasPhotos: i > 8,
        hasProfileOnlyPath: i > 2 && i <= 8,
        createdAt: new Date(Date.parse("2026-06-01T00:00:00.000Z") + i * 86400000).toISOString(),
      })
    );
    const programs = users.slice(9).map((u) => ({
      accountKey: u.accountKey,
      createdAt: u.createdAt,
      phaseTransitionsEarned: 1,
      ladderAdvancements: 1,
      ladderRegressions: 0,
      activeFocusTags: ["forward_head"],
      retiredFocusTags: [] as string[],
      sacrificedExerciseIds: ["ex_x"],
      testChoices: 0,
      modifyChoices: 0,
    }));
    const sessions = users.slice(10).flatMap((u, idx) => {
      const base: OperatorSessionRecord[] = [
        {
          accountKey: u.accountKey,
          startedAt: u.createdAt,
          completedAt: u.createdAt,
          abandoned: false,
          durationSec: 1800 + idx,
          createdAt: u.createdAt,
        },
      ];
      if (idx % 2 === 0) {
        base.push({
          accountKey: u.accountKey,
          startedAt: u.createdAt,
          completedAt: u.createdAt,
          abandoned: false,
          durationSec: 2000,
          createdAt: u.createdAt,
        });
      }
      return base;
    });
    // Power user with 40 sessions
    for (let i = 0; i < 40; i += 1) {
      sessions.push({
        accountKey: "u19",
        startedAt: "2026-07-01T00:00:00.000Z",
        completedAt: "2026-07-01T00:30:00.000Z",
        abandoned: false,
        durationSec: 1800,
        createdAt: "2026-07-01T00:00:00.000Z",
      });
    }

    const acquisition = computeAcquisitionMetrics(users, WALL);
    const funnel = computeActivationFunnel(users, programs, sessions);
    const engagement = computeEngagementMetrics(sessions, WALL);
    const health = computeEngineHealthMetrics(programs, [], WALL);
    const retention = computeRetentionCohorts(users, sessions, { asOfIso: NOW });

    expect(acquisition.totalAccounts).toBe(20);
    expect(acquisition.proCount).toBe(4);
    expect(funnel.steps).toHaveLength(9);
    expect(engagement.sessionsCompletedInWindow).toBeGreaterThan(40);
    expect(health.sacrificesLogged).toBe(programs.length);
    expect(JSON.stringify({ acquisition, funnel, engagement, health, retention })).not.toMatch(
      /@|password|email/i
    );
  });
});
