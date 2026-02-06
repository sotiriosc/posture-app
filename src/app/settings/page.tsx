"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";

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

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

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
      `bodycoach-export-${Date.now()}.json`,
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
      `bodycoach-exercise-logs-${Date.now()}.csv`,
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
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
        <OnImage>
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                Settings
              </p>
              <h1 className="text-3xl font-semibold text-white">
                Backup & restore
              </h1>
              <p className="text-sm text-slate-200">
                Export or restore your local program data.
              </p>
            </div>
            <Link href="/results">
              <Button variant="secondary">Back</Button>
            </Link>
          </header>
        </OnImage>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Download data
          </h2>
          <p className="mt-2 text-xs text-slate-600">
            JSON includes programs, sessions, exercise logs, and preferences.
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

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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

        <div className="rounded-3xl border border-rose-200 bg-rose-50/40 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-rose-700">Danger zone</h2>
          <p className="mt-2 text-xs text-rose-700/80">
            Resetting removes all programs, logs, photos, and in-progress
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
          </div>

          {showResetConfirm ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-xs text-rose-900">
              <p className="text-sm font-semibold text-rose-700">
                Delete all app data?
              </p>
              <p className="mt-1 text-xs text-rose-700/80">
                This will permanently delete your programs, logs, photos, and
                in-progress sessions from this device. This can’t be undone.
              </p>
              <label className="mt-3 block text-xs font-semibold text-rose-700">
                Type DELETE to confirm
                <input
                  type="text"
                  value={confirmText}
                  onChange={(event) => setConfirmText(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-rose-200 px-3 py-2 text-xs text-rose-900"
                />
              </label>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetConfirm(false);
                    setConfirmText("");
                  }}
                  className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
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
      </div>
    </BackgroundShell>
  );
}
