"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listSessionDropoffTelemetry,
  type SessionDropoffEvent,
} from "@/lib/telemetry";

/**
 * Local telemetry dashboard (Phase 6b, Commit 5).
 *
 * Internal-facing drop-off visibility. Relocated out of user Settings into the
 * dev-only /dev-qa route — same category as the Real-device QA panel. No
 * functional change from the previous Settings implementation; this component
 * only renders inside a NODE_ENV === "development" gated page, so it is absent
 * from production builds.
 */

type TelemetrySummary = {
  inLast24h: SessionDropoffEvent[];
  inLast7d: SessionDropoffEvent[];
  reasonCounts: Record<string, number>;
  earlyDropoffPct: number;
  topDay: [string, number] | null;
  alerts: string[];
};

const EMPTY_SUMMARY: TelemetrySummary = {
  inLast24h: [],
  inLast7d: [],
  reasonCounts: {},
  earlyDropoffPct: 0,
  topDay: null,
  alerts: ["No telemetry events yet. Run sessions on real devices to populate data."],
};

// Pure: takes the reference time as an argument so it is never read during
// render (satisfies react-hooks/purity — the panel computes this in an event
// handler / effect callback, not in the render body).
const computeTelemetrySummary = (
  events: SessionDropoffEvent[],
  now: number
): TelemetrySummary => {
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const inLast24h = events.filter(
    (event) => new Date(event.at).getTime() >= oneDayAgo
  );
  const inLast7d = events.filter(
    (event) => new Date(event.at).getTime() >= sevenDaysAgo
  );
  const reasonCounts = inLast7d.reduce((acc, event) => {
    acc[event.reason] = (acc[event.reason] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const earlyDropoffCount = inLast7d.filter((event) => event.exerciseIndex <= 1).length;
  const earlyDropoffPct = inLast7d.length
    ? Math.round((earlyDropoffCount / inLast7d.length) * 100)
    : 0;
  const perDayDropoffs = inLast7d.reduce((acc, event) => {
    const key = event.dayIndex === null ? "unknown" : `Day ${event.dayIndex + 1}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topDay = Object.entries(perDayDropoffs).sort((a, b) => b[1] - a[1])[0] ?? null;

  const alerts: string[] = [];
  if (inLast7d.length >= 10 && earlyDropoffPct >= 45) {
    alerts.push(
      `High early drop-off: ${earlyDropoffPct}% of exits happen in the first two exercises.`
    );
  }
  if ((reasonCounts.exit_button ?? 0) >= 8) {
    alerts.push("Exit button is used frequently. Review session friction around first half.");
  }
  if ((reasonCounts.pagehide ?? 0) >= 8) {
    alerts.push("Many pagehide exits detected. Check interruptions/background behavior.");
  }
  if (!alerts.length && inLast7d.length > 0) {
    alerts.push("No major telemetry alert in the last 7 days.");
  }
  if (!inLast7d.length) {
    alerts.push("No telemetry events yet. Run sessions on real devices to populate data.");
  }

  return { inLast24h, inLast7d, reasonCounts, earlyDropoffPct, topDay, alerts };
};

export default function TelemetryPanel() {
  const [dropoffEvents, setDropoffEvents] = useState<SessionDropoffEvent[]>([]);
  const [telemetrySummary, setTelemetrySummary] =
    useState<TelemetrySummary>(EMPTY_SUMMARY);

  const refresh = useCallback(() => {
    const events = listSessionDropoffTelemetry();
    setDropoffEvents(events);
    setTelemetrySummary(computeTelemetrySummary(events, Date.now()));
  }, []);

  useEffect(() => {
    let active = true;
    // Read after mount (empty on the server); defer through a promise so state
    // is set from an async callback, never synchronously within the effect.
    void Promise.resolve().then(() => {
      if (active) refresh();
    });
    return () => {
      active = false;
    };
  }, [refresh]);

  return (
    <div className="ui-card ui-soft-surface-raised rounded-lg p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Telemetry dashboard (local)
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Drop-off visibility: where users leave sessions and which day is at risk.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700"
        >
          Refresh
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs">
          <p className="font-semibold text-slate-900">Last 24h</p>
          <p className="mt-1 text-slate-700">{telemetrySummary.inLast24h.length} exits</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs">
          <p className="font-semibold text-slate-900">Last 7d</p>
          <p className="mt-1 text-slate-700">{telemetrySummary.inLast7d.length} exits</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs">
          <p className="font-semibold text-slate-900">Early drop-off</p>
          <p className="mt-1 text-slate-700">{telemetrySummary.earlyDropoffPct}%</p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700">
        <p className="font-semibold text-slate-900">Reason mix (7d)</p>
        <p className="mt-1">
          exit_button: {telemetrySummary.reasonCounts.exit_button ?? 0} • pagehide:{" "}
          {telemetrySummary.reasonCounts.pagehide ?? 0} • route_change:{" "}
          {telemetrySummary.reasonCounts.route_change ?? 0} • hidden:{" "}
          {telemetrySummary.reasonCounts.visibility_hidden ?? 0}
        </p>
        <p className="mt-1">
          Top drop-off day: {telemetrySummary.topDay ? `${telemetrySummary.topDay[0]} (${telemetrySummary.topDay[1]})` : "--"}
        </p>
      </div>

      <div className="mt-3 space-y-2">
        {telemetrySummary.alerts.map((alert) => (
          <div
            key={alert}
            className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
          >
            {alert}
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-700">
        <p className="font-semibold text-slate-900">Recent exits</p>
        {dropoffEvents.length === 0 ? (
          <p className="mt-1 text-slate-500">No events logged yet.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {dropoffEvents.slice(0, 8).map((event) => (
              <li key={event.id} className="rounded-xl bg-slate-50 px-2 py-1">
                {event.at.slice(0, 16).replace("T", " ")} • {event.reason} •{" "}
                {event.dayIndex === null ? "Day ?" : `Day ${event.dayIndex + 1}`} •{" "}
                {event.exerciseId ?? "unknown"} • {event.progressPct}%
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
