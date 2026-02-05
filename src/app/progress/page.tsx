"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { exerciseById } from "@/lib/exercises";
import type { ExerciseLog, SessionRecord } from "@/lib/types";
import { init, listExerciseLogsBySession, listSessions } from "@/lib/logStore";

export default function ProgressPage() {
  const [logs, setLogs] = useState<ExerciseLog[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    const load = async () => {
      await init();
      const sessionList = await listSessions(50);
      setSessions(sessionList);
      const logsBySession = await Promise.all(
        sessionList.map((session) => listExerciseLogsBySession(session.id))
      );
      setLogs(logsBySession.flat());
    };
    load();
  }, []);

  const topExercises = useMemo(() => {
    const counts = logs.reduce<Record<string, number>>((acc, log) => {
      acc[log.exerciseId] = (acc[log.exerciseId] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ id, count, name: exerciseById(id)?.name }));
  }, [logs]);

  const recentPRs = useMemo(() => {
    const maxWeight: Record<string, number> = {};
    const maxVolume: Record<string, number> = {};

    logs.forEach((log) => {
      if (log.weight) {
        maxWeight[log.exerciseId] = Math.max(
          maxWeight[log.exerciseId] ?? 0,
          log.weight
        );
      }
      if (log.computedVolume) {
        maxVolume[log.exerciseId] = Math.max(
          maxVolume[log.exerciseId] ?? 0,
          log.computedVolume
        );
      }
    });

    const prs = logs.filter((log) => {
      const isWeightPR =
        log.weight && log.weight === maxWeight[log.exerciseId];
      const isVolumePR =
        log.computedVolume && log.computedVolume === maxVolume[log.exerciseId];
      return isWeightPR || isVolumePR;
    });

    return prs.slice(0, 5).map((log) => ({
      ...log,
      name: exerciseById(log.exerciseId)?.name ?? log.exerciseId,
    }));
  }, [logs]);

  const lastSessions = useMemo(() => sessions.slice(0, 7), [sessions]);
  const volumeByDate = useMemo(() => {
    return logs.reduce<Record<string, number>>((acc, log) => {
      const volume = log.computedVolume ?? 0;
      const date = log.createdAt.slice(0, 10);
      acc[date] = (acc[date] ?? 0) + volume;
      return acc;
    }, {});
  }, [logs]);

  return (
    <div className="min-h-screen page-shell">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-12">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Progress
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Training insights
          </h1>
          <p className="text-sm text-slate-600">
            Review your most trained movements and recent personal records.
          </p>
        </header>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Top exercises
          </h2>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            {topExercises.length ? (
              topExercises.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2"
                >
                  <span>{item.name ?? item.id}</span>
                  <span className="text-xs text-slate-500">
                    {item.count} sessions
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No logs yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Recent PRs</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {recentPRs.length ? (
              recentPRs.map((log, index) => (
                <div
                  key={`${log.exerciseId}-${log.createdAt}-${index}`}
                  className="rounded-2xl bg-slate-50 p-3"
                >
                  <p className="font-semibold text-slate-900">{log.name}</p>
                  <p className="text-xs text-slate-500">
                    {log.createdAt.slice(0, 10)} •{" "}
                    {log.weight ? `${log.weight}${log.unit ?? ""}` : "Bodyweight"} •
                    Volume {log.computedVolume ?? "--"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No PRs yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Last 7 sessions
          </h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {lastSessions.length ? (
              lastSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-wrap items-center justify-between rounded-2xl bg-slate-50 px-3 py-2"
                >
                  <span>{session.completedAt?.slice(0, 10) ?? "--"}</span>
                  <span className="text-xs text-slate-500">
                    {session.durationSec
                      ? `${Math.round(session.durationSec / 60)} min`
                      : "--"}{" "}
                    • Volume {volumeByDate[session.completedAt?.slice(0, 10) ?? ""] ?? 0}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No completed sessions yet.
              </p>
            )}
          </div>
        </div>

        <Link
          href="/results"
          className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-700"
        >
          Back to results
        </Link>
      </div>
    </div>
  );
}
