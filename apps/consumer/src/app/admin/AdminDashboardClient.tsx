"use client";

import { useEffect, useState } from "react";
import type { OperatorDashboardPayload, OperatorWindowPreset } from "./operatorData";

const WINDOWS: Array<{ id: OperatorWindowPreset; label: string }> = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "all", label: "All time" },
];

const pctLabel = (rate: number) => `${Math.round(rate * 1000) / 10}%`;

export default function AdminDashboardClient({
  initial,
}: {
  initial: OperatorDashboardPayload;
}) {
  const [windowPreset, setWindowPreset] = useState<OperatorWindowPreset>(
    initial.window
  );
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (windowPreset === initial.window && data === initial) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetch(`/api/admin/metrics?window=${windowPreset}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (res) => {
        if (res.status === 404) throw new Error("Not found");
        if (!res.ok) throw new Error("Failed to load metrics");
        return (await res.json()) as OperatorDashboardPayload;
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // initial identity intentionally excluded — only refetch on window change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowPreset]);

  const maxFunnel = Math.max(
    ...data.activationFunnel.steps.map((s) => s.count),
    1
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 text-slate-100" data-testid="admin-dashboard">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Operator
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Praxis metrics</h1>
          <p className="mt-1 text-sm text-slate-400">
            Aggregates only · as of {new Date(data.asOfIso).toUTCString()}
          </p>
        </div>
        <div className="flex gap-2" data-testid="admin-window-selector">
          {WINDOWS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setWindowPreset(item.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                windowPreset === item.id
                  ? "bg-sky-600 text-white"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {data.smallSample ? (
        <p
          className="mb-6 text-sm text-amber-200/90"
          data-testid="admin-small-sample"
        >
          Small sample — these become meaningful around 20+ users.
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 text-sm text-rose-300">{error}</p>
      ) : null}
      {loading ? (
        <p className="mb-4 text-xs text-slate-500">Refreshing…</p>
      ) : null}

      {/* 1. At a glance */}
      <section className="mb-10" data-testid="admin-glance">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          At a glance
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Total accounts", String(data.glance.totalAccounts)],
            ["Pro subscribers", String(data.glance.proSubscribers)],
            ["Sessions this week", String(data.glance.sessionsThisWeek)],
            [
              "MRR",
              data.glance.mrrUsd === null
                ? "—"
                : `$${data.glance.mrrUsd.toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-white/5 px-4 py-4">
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-white">
                {value}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">{data.glance.mrrNote}</p>
      </section>

      {/* 2. Activation funnel */}
      <section className="mb-10" data-testid="admin-activation-funnel">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Activation funnel
        </h2>
        <div className="space-y-2">
          {data.activationFunnel.steps.map((step) => {
            const isLargest =
              step.id === data.activationFunnel.largestDropOffStepId;
            const width = Math.max(4, Math.round((step.count / maxFunnel) * 100));
            return (
              <div
                key={step.id}
                data-testid={`admin-funnel-step-${step.id}`}
                data-largest-dropoff={isLargest ? "1" : "0"}
                className={`rounded-md px-3 py-2 ${
                  isLargest ? "bg-amber-500/15 ring-1 ring-amber-400/40" : "bg-white/5"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium text-white">
                    {step.label}
                    {isLargest ? (
                      <span className="ml-2 text-xs font-normal text-amber-200">
                        largest drop-off
                      </span>
                    ) : null}
                  </span>
                  <span className="tabular-nums text-slate-300">
                    {step.count} · {step.pctOfPrevious}% of prev · {step.pctOfTotal}% of
                    total
                    {step.dropOffFromPrevious > 0
                      ? ` · −${step.dropOffFromPrevious}`
                      : ""}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded bg-black/30">
                  <div
                    className={`h-full ${isLargest ? "bg-amber-400" : "bg-sky-500"}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Engagement */}
      <section className="mb-10" data-testid="admin-engagement">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Engagement
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Sessions completed", String(data.engagement.sessionsCompletedInWindow)],
            [
              "Avg sessions / active user",
              String(data.engagement.averageSessionsPerActiveUser),
            ],
            ["Completion rate", pctLabel(data.engagement.sessionCompletionRate)],
            [
              "Median duration",
              data.engagement.medianSessionDurationSec == null
                ? "—"
                : `${Math.round(data.engagement.medianSessionDurationSec / 60)} min`,
            ],
            ["Abandonment rate", pctLabel(data.engagement.abandonmentRate)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-white/5 px-3 py-3 text-sm">
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-white">
                {value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg bg-white/5 px-3 py-3 text-sm">
          <p className="text-xs text-slate-400">Sessions/week distribution (active users)</p>
          <p className="mt-1 tabular-nums text-slate-200">
            {Object.entries(data.engagement.sessionsPerWeekDistribution)
              .map(([bucket, count]) => `${bucket}: ${count}`)
              .join(" · ")}
          </p>
        </div>
      </section>

      {/* 4. Retention */}
      <section className="mb-10" data-testid="admin-retention">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Retention cohorts
        </h2>
        <div className="overflow-x-auto rounded-lg bg-white/5">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-3 py-2 font-medium">Signup week</th>
                <th className="px-3 py-2 font-medium">Size</th>
                <th className="px-3 py-2 font-medium">W1</th>
                <th className="px-3 py-2 font-medium">W2</th>
                <th className="px-3 py-2 font-medium">W3</th>
                <th className="px-3 py-2 font-medium">W4</th>
              </tr>
            </thead>
            <tbody>
              {data.retentionCohorts.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-slate-400" colSpan={6}>
                    No cohorts yet.
                  </td>
                </tr>
              ) : (
                data.retentionCohorts.map((row) => (
                  <tr key={row.cohortWeekStart} className="border-t border-white/5">
                    <td className="px-3 py-2 tabular-nums">
                      {row.cohortWeekStart.slice(0, 10)}
                    </td>
                    <td className="px-3 py-2 tabular-nums">{row.cohortSize}</td>
                    {(["1", "2", "3", "4"] as const).map((w) => (
                      <td key={w} className="px-3 py-2 tabular-nums">
                        {row.retentionByWeek[w] ?? 0}%
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Engine health */}
      <section className="mb-10" data-testid="admin-engine-health">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Engine health
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Ladder advancements", data.engineHealth.ladderAdvancementsInWindow],
            ["Regressions", data.engineHealth.regressionsInWindow],
            ["Sacrifices", data.engineHealth.sacrificesLogged],
            ["Phase transitions", data.engineHealth.phaseTransitionsEarned],
            ["Test choices", data.engineHealth.testChoices],
            ["Modify choices", data.engineHealth.modifyChoices],
            ["Focus tags retired", data.engineHealth.focusTagsRetiredInWindow],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-lg bg-white/5 px-3 py-3 text-sm">
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-white">
                {value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TopList
            title="Most sacrificed exercises"
            rows={data.engineHealth.topSacrificedExercises}
            testId="admin-top-sacrificed"
          />
          <TopList
            title="Most skipped exercises"
            rows={data.engineHealth.topSkippedExercises}
            testId="admin-top-skipped"
          />
        </div>
      </section>

      {/* 6. Focus tags */}
      <section className="mb-10" data-testid="admin-focus-tags">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Focus tag distribution
        </h2>
        <div className="rounded-lg bg-white/5 px-3 py-3 text-sm">
          {Object.keys(data.engineHealth.activeFocusTagDistribution).length === 0 ? (
            <p className="text-slate-400">No active focus tags yet.</p>
          ) : (
            <ul className="space-y-1">
              {Object.entries(data.engineHealth.activeFocusTagDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([tag, count]) => (
                  <li key={tag} className="flex justify-between tabular-nums">
                    <span>{tag}</span>
                    <span className="text-slate-300">{count}</span>
                  </li>
                ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-slate-500">
            Retired in window: {data.engineHealth.focusTagsRetiredInWindow}
          </p>
        </div>
      </section>

      {/* 7. Feedback */}
      <section data-testid="admin-feedback">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Feedback
        </h2>
        <div className="rounded-lg bg-white/5 px-3 py-3 text-sm">
          <p className="text-slate-300">{data.feedback.note}</p>
          {data.feedback.sheetUrl ? (
            <a
              href={data.feedback.sheetUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sky-300 underline"
            >
              Open feedback form / sheet
            </a>
          ) : (
            <p className="mt-2 text-slate-500">No feedback URL configured.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function TopList({
  title,
  rows,
  testId,
}: {
  title: string;
  rows: Array<{ exerciseId: string; count: number }>;
  testId: string;
}) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-3 text-sm" data-testid={testId}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      {rows.length === 0 ? (
        <p className="mt-2 text-slate-500">None yet.</p>
      ) : (
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          {rows.map((row) => (
            <li key={row.exerciseId} className="flex justify-between gap-4">
              <span className="truncate font-mono text-xs">{row.exerciseId}</span>
              <span className="tabular-nums text-slate-300">{row.count}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
