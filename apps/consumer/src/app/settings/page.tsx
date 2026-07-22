"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadAppState } from "@/lib/appState";
import { exerciseById } from "@/lib/exercises";
import {
  init,
  listAllExerciseLogs,
  listAllPrograms,
  listSessions,
  loadPrefs,
  saveExerciseLog,
  updateSession,
  saveProgram,
  savePrefs,
  SCHEMA_VERSION,
} from "@/lib/logStore";
import type { ExerciseLog, LogPrefs, Program, SessionRecord } from "@/lib/types";
import { resetAllAppData } from "@/lib/resetAppData";
import {
  listSessionDropoffTelemetry,
  type SessionDropoffEvent,
} from "@/lib/telemetry";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";

type QaChecklistItem = {
  id: string;
  label: string;
  detail: string;
};

const QA_CHECKLIST_ITEMS: QaChecklistItem[] = [
  {
    id: "qa-flow-questionnaire",
    label: "Questionnaire flow",
    detail: "Complete questionnaire and confirm correct 3/4/5 day split output.",
  },
  {
    id: "qa-flow-session",
    label: "Session flow",
    detail: "Run full session, save data, and ensure progress advances to next day.",
  },
  {
    id: "qa-flow-history",
    label: "History correctness",
    detail: "Verify date • load • reps×sets • timer • feedback lines match last log.",
  },
  {
    id: "qa-mobile-touch",
    label: "Mobile touch/swipe",
    detail: "Check day/session history swipes and controls on phone and tablet.",
  },
  {
    id: "qa-resume-draft",
    label: "Resume + autosave",
    detail: "Exit during session and confirm resume draft restores exact state.",
  },
  {
    id: "qa-offline-recovery",
    label: "Offline recovery",
    detail: "Toggle offline/online and confirm data sync state is consistent.",
  },
];

const QA_STORAGE_KEY = "device_qa_checklist_v1";

const toCsv = (rows: Record<string, string | number | null>[]) => {
  const headers = Object.keys(rows[0] ?? {});
  const escape = (value: string | number | null) => {
    if (value === null || value === undefined) return "";
    const stringValue = String(value);
    if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
      return `"${stringValue.replace(/\"/g, "\"\"")}"`;
    }
    return stringValue;
  };
  const csvLines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(",")),
  ];
  return csvLines.join("\n");
};

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const loadQaChecklistState = () => {
  if (typeof window === "undefined") return {} as Record<string, boolean>;
  const raw = window.localStorage.getItem(QA_STORAGE_KEY);
  if (!raw) return {} as Record<string, boolean>;
  try {
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const saveQaChecklistState = (state: Record<string, boolean>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QA_STORAGE_KEY, JSON.stringify(state));
};

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [settingsPrefs, setSettingsPrefs] = useState<LogPrefs | null>(null);
  const [dropoffEvents, setDropoffEvents] = useState<SessionDropoffEvent[]>([]);
  const [qaChecklist, setQaChecklist] = useState<Record<string, boolean>>({});
  const [systemStatus, setSystemStatus] = useState<{
    activeProgramId: string;
    baselineDate: string;
    sessionsTracked: number;
  }>({
    activeProgramId: "--",
    baselineDate: "--",
    sessionsTracked: 0,
  });

  useEffect(() => {
    setDropoffEvents(listSessionDropoffTelemetry());
    setQaChecklist(loadQaChecklistState());
    void (async () => {
      await init();
      const prefs = await loadPrefs();
      setSettingsPrefs(prefs);
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadSystemStatus = async () => {
      await init();
      const sessions = await listSessions(1000);
      const appState = loadAppState();
      const baselineAt =
        typeof appState?.activeProgramBaselineAt === "number" &&
        Number.isFinite(appState.activeProgramBaselineAt)
          ? appState.activeProgramBaselineAt
          : 0;
      if (cancelled) return;
      setSystemStatus({
        activeProgramId: appState?.activeProgramId ?? "--",
        baselineDate: baselineAt > 0 ? new Date(baselineAt).toISOString().slice(0, 10) : "--",
        sessionsTracked: sessions.length,
      });
    };
    void loadSystemStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  const telemetrySummary = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const inLast24h = dropoffEvents.filter(
      (event) => new Date(event.at).getTime() >= oneDayAgo
    );
    const inLast7d = dropoffEvents.filter(
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

    return {
      inLast24h,
      inLast7d,
      reasonCounts,
      earlyDropoffPct,
      topDay,
      alerts,
    };
  }, [dropoffEvents]);

  const diagnostics = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        isTouchCapable: false,
        isStandalone: false,
        serviceWorkerReady: false,
        online: true,
      };
    }
    const nav = window.navigator as Navigator & { standalone?: boolean };
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches || Boolean(nav.standalone);
    return {
      isTouchCapable:
        "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0,
      isStandalone,
      serviceWorkerReady: Boolean(navigator.serviceWorker?.controller),
      online: navigator.onLine,
    };
  }, []);

  const qaProgress = useMemo(() => {
    const completed = QA_CHECKLIST_ITEMS.filter((item) => qaChecklist[item.id]).length;
    return { completed, total: QA_CHECKLIST_ITEMS.length };
  }, [qaChecklist]);

  const toggleQaItem = (id: string) => {
    setQaChecklist((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveQaChecklistState(next);
      return next;
    });
  };

  const handleLockAdmin = async () => {
    await fetch("/api/admin/access", { method: "DELETE" }).catch(() => null);
    router.replace("/");
    router.refresh();
  };

  const handleDownloadJson = async () => {
    setLoading(true);
    await init();
    const sessions = await listSessions(500);
    const exerciseLogs = await listAllExerciseLogs();
    const programs = await listAllPrograms();
    const prefs = await loadPrefs();
    const payload = {
      schemaVersion: prefs.schemaVersion ?? SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      sessions,
      exerciseLogs,
      programs,
      prefs,
    };
    downloadFile(
      JSON.stringify(payload, null, 2),
      `praxis-admin-export-${Date.now()}.json`,
      "application/json"
    );
    setLoading(false);
  };

  const handleDownloadCsv = async () => {
    setLoading(true);
    await init();
    const logs = await listAllExerciseLogs();
    const rows = logs.map((log) => ({
      id: log.id,
      sessionId: log.sessionId,
      exerciseId: log.exerciseId,
      originalExerciseId: log.originalExerciseId ?? null,
      substitutedExerciseId: log.substitutedExerciseId ?? null,
      programId: log.programId ?? null,
      dayIndex: log.dayIndex ?? null,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
      loadType: log.loadType,
      unit: log.unit,
      weight: log.weight,
      reps: log.reps,
      repsBySet: log.repsBySet ? log.repsBySet.join("|") : null,
      setsPlanned: log.setsPlanned,
      setsCompleted: log.setsCompleted,
      durationSec: log.durationSec,
      workSecondsUsed: log.workSecondsUsed ?? null,
      restSecondsUsed: log.restSecondsUsed ?? null,
      rpe: log.rpe,
      felt: log.felt,
      painLocation: log.painLocation ?? null,
      feedbackNotes: log.feedbackNotes ?? null,
      notes: log.notes,
      computedVolume: log.computedVolume,
      source: log.source,
      deletedAt: log.deletedAt,
    }));
    downloadFile(
      toCsv(rows),
      `praxis-admin-exercise-logs-${Date.now()}.csv`,
      "text/csv"
    );
    setLoading(false);
  };

  const isValidSession = (session: SessionRecord) =>
    Boolean(session.id && session.createdAt && session.updatedAt);

  const isValidLog = (log: ExerciseLog) =>
    Boolean(
      log.id &&
        log.sessionId &&
        log.exerciseId &&
        log.createdAt &&
        log.updatedAt
    );

  const isValidProgram = (program: Program) =>
    Boolean(program.id && program.createdAt && program.updatedAt);

  const handleRestoreJson = async (file: File) => {
    setLoading(true);
    setMessage(null);
    try {
      await init();
      const text = await file.text();
      const parsed = JSON.parse(text) as {
        schemaVersion: number;
        sessions: SessionRecord[];
        exerciseLogs: ExerciseLog[];
        programs?: Program[];
        prefs?: LogPrefs;
      };

      if (
        !parsed.schemaVersion ||
        !Array.isArray(parsed.sessions) ||
        !Array.isArray(parsed.exerciseLogs)
      ) {
        throw new Error("Invalid export file.");
      }

      if (parsed.schemaVersion !== SCHEMA_VERSION) {
        throw new Error("Unsupported schema version.");
      }

      const existingSessions = await listSessions(1000);
      const existingLogs = await listAllExerciseLogs();
      const existingPrograms = await listAllPrograms();
      const sessionsById = new Map(
        existingSessions.map((session) => [session.id, session])
      );
      const logsById = new Map(existingLogs.map((log) => [log.id, log]));
      const programsById = new Map(
        existingPrograms.map((program) => [program.id, program])
      );

      const sessionsToSave = parsed.sessions.filter(isValidSession);
      const logsToSave = parsed.exerciseLogs.filter(isValidLog);
      const programsToSave = (parsed.programs ?? []).filter(isValidProgram);

      await Promise.all(
        sessionsToSave.map((session) => {
          const existing = sessionsById.get(session.id);
          if (!existing || session.updatedAt > existing.updatedAt) {
            return updateSession(session);
          }
          return Promise.resolve(existing);
        })
      );

      await Promise.all(
        logsToSave.map((log) => {
          const existing = logsById.get(log.id);
          if (!existing || log.updatedAt > existing.updatedAt) {
            return saveExerciseLog(log);
          }
          return Promise.resolve(existing);
        })
      );

      await Promise.all(
        programsToSave.map((program) => {
          const existing = programsById.get(program.id);
          if (!existing || program.updatedAt > existing.updatedAt) {
            return saveProgram(program);
          }
          return Promise.resolve(existing);
        })
      );

      if (parsed.prefs) {
        await savePrefs(parsed.prefs);
      }

      setMessage("Restore complete. Your data has been merged.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Restore failed. Please try another file."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundShell>
      <div className="ui-shell flex max-w-5xl flex-col gap-6 py-8 sm:py-12">
        <OnImage>
          <header className="ui-page-heading flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="ui-kicker">
                Settings
              </p>
              <h1 className="text-3xl font-semibold text-white">
                Backup & restore
              </h1>
              <p className="text-sm text-slate-200">
                Export or restore your local Praxis plan data.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/results">
                <Button variant="secondary">Back</Button>
              </Link>
              <button
                type="button"
                onClick={handleLockAdmin}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15"
              >
                Lock Admin
              </button>
            </div>
          </header>
        </OnImage>

        <div className="ui-card ui-soft-surface-raised rounded-lg p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Corrective settings note
          </h2>
          <p className="mt-2 text-xs text-amber-700">
            Changing corrective emphasis reshapes focus areas — your movement history remains intact.
          </p>
        </div>

        <div className="ui-card ui-soft-surface-raised rounded-lg p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Download data
          </h2>
          <p className="mt-2 text-xs text-slate-600">
            JSON includes saved plans, sessions, exercise logs, and preferences.
            CSV exports exercise logs only.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownloadJson}
              disabled={loading}
              className="rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              Download JSON
            </button>
            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={loading}
              className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
            >
              Download CSV
            </button>
          </div>
        </div>

        <div className="ui-card ui-soft-surface-raised rounded-lg p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Restore from JSON
          </h2>
          <p className="mt-2 text-xs text-slate-600">
            Upload a previously exported JSON file to merge sessions and logs.
            Photos are not included.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700">
              Choose file
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    handleRestoreJson(file);
                    event.currentTarget.value = "";
                  }
                }}
              />
            </label>
            {loading ? (
              <span className="text-xs text-slate-500">Working...</span>
            ) : null}
          </div>
          {message ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              {message}
            </div>
          ) : null}
        </div>

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
              onClick={() => setDropoffEvents(listSessionDropoffTelemetry())}
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

        <div className="ui-card ui-soft-surface-raised rounded-lg p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Real-device QA pass
          </h2>
          <p className="mt-2 text-xs text-slate-600">
            Track actual device validation before release. Keep this checklist green.
          </p>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700">
            Completed {qaProgress.completed}/{qaProgress.total}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">Diagnostics</p>
              <p className="mt-1">Touch capable: {diagnostics.isTouchCapable ? "Yes" : "No"}</p>
              <p className="mt-1">Standalone mode: {diagnostics.isStandalone ? "Yes" : "No"}</p>
              <p className="mt-1">
                Service worker active: {diagnostics.serviceWorkerReady ? "Yes" : "No"}
              </p>
              <p className="mt-1">Online: {diagnostics.online ? "Yes" : "No"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">Recommended run order</p>
              <p className="mt-1">1. Phone (iOS + Android)</p>
              <p className="mt-1">2. Tablet (touch + rotation)</p>
              <p className="mt-1">3. Desktop (Chrome + Safari)</p>
              <p className="mt-1">4. Offline/online interruption test</p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {QA_CHECKLIST_ITEMS.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs"
              >
                <input
                  type="checkbox"
                  checked={Boolean(qaChecklist[item.id])}
                  onChange={() => toggleQaItem(item.id)}
                  className="mt-0.5 h-4 w-4 accent-slate-900"
                />
                <span>
                  <span className="font-semibold text-slate-900">{item.label}</span>
                  <span className="mt-0.5 block text-slate-600">{item.detail}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Phase 3.3 — Blocked exercises section */}
        {(() => {
          const blocked = settingsPrefs?.blockedExerciseIds ?? {};
          const blockedEntries = Object.entries(blocked);
          const hasBlocked = blockedEntries.length > 0;

          const handleUnblock = async (exerciseId: string) => {
            const currentPrefs = await loadPrefs();
            const next = { ...(currentPrefs.blockedExerciseIds ?? {}) };
            delete next[exerciseId];
            const nextPrefs: LogPrefs = { ...currentPrefs, blockedExerciseIds: next };
            await savePrefs(nextPrefs);
            setSettingsPrefs(nextPrefs);
          };

          const handleResetEquipmentBlocks = async () => {
            const currentPrefs = await loadPrefs();
            const next = Object.fromEntries(
              Object.entries(currentPrefs.blockedExerciseIds ?? {}).filter(
                ([, v]) => v.reason !== "no_equipment"
              )
            );
            const nextPrefs: LogPrefs = { ...currentPrefs, blockedExerciseIds: next };
            await savePrefs(nextPrefs);
            setSettingsPrefs(nextPrefs);
          };

          const handleResetAllBlocks = async () => {
            const currentPrefs = await loadPrefs();
            const nextPrefs: LogPrefs = { ...currentPrefs, blockedExerciseIds: {} };
            await savePrefs(nextPrefs);
            setSettingsPrefs(nextPrefs);
          };

          return (
            <div className="ui-card ui-soft-surface-raised rounded-lg p-6">
              <h2 className="text-sm font-semibold text-slate-100">Blocked exercises</h2>
              <p className="mt-1 text-xs text-slate-400">
                Exercises removed from your program. These are hard-filtered before any
                selection — they will not appear in workouts, swaps, or repair paths.
              </p>

              {hasBlocked && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { void handleResetEquipmentBlocks(); }}
                    className="rounded-lg border border-slate-600/40 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                  >
                    Reset equipment blocks
                  </button>
                  <button
                    type="button"
                    onClick={() => { void handleResetAllBlocks(); }}
                    className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-950/40"
                  >
                    Reset all blocks
                  </button>
                </div>
              )}

              {hasBlocked ? (
                <ul className="mt-4 space-y-2">
                  {blockedEntries.map(([exId, info]) => {
                    const ex = exerciseById(exId);
                    const name = ex?.name ?? exId;
                    const reasonLabel =
                      info.reason === "no_equipment"
                        ? "No equipment"
                        : "Personal preference";
                    const phaseLabel = info.blockedAt.phase.charAt(0).toUpperCase() +
                      info.blockedAt.phase.slice(1);
                    return (
                      <li
                        key={exId}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/40 bg-slate-900/50 px-3 py-2"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-200">{name}</p>
                          <p className="text-xs text-slate-500">
                            {reasonLabel} · blocked in {phaseLabel} phase
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { void handleUnblock(exId); }}
                          className="shrink-0 rounded-lg border border-sky-500/30 bg-sky-950/20 px-3 py-1 text-xs font-semibold text-sky-300 hover:bg-sky-950/40"
                        >
                          Unblock
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-slate-500">No exercises blocked.</p>
              )}
            </div>
          );
        })()}

        <div className="ui-card ui-soft-surface-raised rounded-lg border-rose-300/30 p-6">
          <h2 className="text-sm font-semibold text-rose-100">Danger zone</h2>
          <p className="mt-2 text-xs text-rose-100/80">
            Resetting removes all saved plans, logs, photos, and in-progress
            sessions from this device.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="rounded-full bg-rose-600 px-5 py-2 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Reset app data
            </button>
            <div className="mt-3 rounded-lg border border-rose-300/25 bg-rose-900/15 px-3 py-3 text-xs text-rose-100">
              <p>This does NOT affect your subscription.</p>
              <p className="mt-2">This removes:</p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>Local workout logs</li>
                <li>Photos</li>
                <li>In-progress drafts</li>
              </ul>
            </div>
          </div>

          {showResetConfirm ? (
            <div className="mt-4 rounded-lg border border-rose-300/25 bg-rose-900/15 px-4 py-3 text-xs text-rose-100">
              <p className="text-sm font-semibold text-rose-100">
                Delete all app data?
              </p>
              <p className="mt-1 text-xs text-rose-100/80">
                This will permanently delete your saved plans, logs, photos, and
                in-progress sessions from this device. This can’t be undone.
              </p>
              <label className="mt-3 block text-xs font-semibold text-rose-100">
                Type DELETE to confirm
                <input
                  type="text"
                  value={confirmText}
                  onChange={(event) => setConfirmText(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-rose-300/35 bg-slate-950/55 px-3 py-2 text-xs text-rose-50"
                />
              </label>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetConfirm(false);
                    setConfirmText("");
                  }}
                  className="rounded-lg border border-rose-300/35 px-4 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-900/25"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={confirmText.trim().toUpperCase() !== "DELETE"}
                  onClick={async () => {
                    await resetAllAppData();
                    setShowResetConfirm(false);
                    setConfirmText("");
                    router.replace("/");
                    window.location.reload();
                  }}
                  className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  Delete everything
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="ui-card ui-soft-surface-raised rounded-lg p-6">
          <h2 className="text-sm font-semibold text-slate-900">System status</h2>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700">
            <p>
              Active program ID:{" "}
              <span className="font-semibold text-slate-900">
                {systemStatus.activeProgramId}
              </span>
            </p>
            <p className="mt-1">
              Baseline start date:{" "}
              <span className="font-semibold text-slate-900">
                {systemStatus.baselineDate}
              </span>
            </p>
            <p className="mt-1">
              Sessions tracked:{" "}
              <span className="font-semibold text-slate-900">
                {systemStatus.sessionsTracked}
              </span>
            </p>
          </div>
        </div>
      </div>
    </BackgroundShell>
  );
}
