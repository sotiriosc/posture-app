"use client";

import { useState } from "react";
import Link from "next/link";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import { resetAllAppData } from "@/lib/resetAppData";
import {
  init,
  listAllExerciseLogs,
  listAllPrograms,
  listSessions,
  loadPrefs,
  SCHEMA_VERSION,
} from "@/lib/logStore";

export default function AccountSettingsPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const toCsv = (rows: Record<string, string | number | null>[]) => {
    const headers = Object.keys(rows[0] ?? {});
    const escape = (value: string | number | null) => {
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      if (
        stringValue.includes(",") ||
        stringValue.includes("\"") ||
        stringValue.includes("\n")
      ) {
        return `"${stringValue.replace(/\"/g, "\"\"")}"`;
      }
      return stringValue;
    };
    const csvLines = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((header) => escape(row[header])).join(",")
      ),
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

  const handleDownloadCsv = async () => {
    setExporting(true);
    setMessage(null);
    try {
      await init();
      const logs = await listAllExerciseLogs();
      const rows = logs.map((log) => ({
        id: log.id,
        sessionId: log.sessionId,
        exerciseId: log.exerciseId,
        dayIndex: log.dayIndex ?? null,
        loadType: log.loadType,
        loadValue: log.loadValue ?? null,
        reps: log.reps ?? null,
        setsCompleted: log.setsCompleted ?? null,
        setsPlanned: log.setsPlanned ?? null,
        workSecondsUsed: log.workSecondsUsed ?? null,
        restSecondsUsed: log.restSecondsUsed ?? null,
        felt: log.felt ?? null,
        painLocation: log.painLocation ?? null,
        feedbackNotes: log.feedbackNotes ?? null,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
      }));
      downloadFile(
        toCsv(rows),
        `bodycoach-logs-${Date.now()}.csv`,
        "text/csv;charset=utf-8"
      );
      setMessage("CSV export downloaded.");
    } catch {
      setMessage("CSV export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadJson = async () => {
    setExporting(true);
    setMessage(null);
    try {
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
      setMessage("JSON export downloaded.");
    } catch {
      setMessage("JSON export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <BackgroundShell>
      <div className="ui-shell flex max-w-5xl flex-col gap-6 py-8 sm:py-12">
        <OnImage>
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="ui-kicker">
                Account
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Settings</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                Export training data or reset local app state on this device.
              </p>
            </div>
            <Link href="/results">
              <Button variant="secondary">Back</Button>
            </Link>
          </header>
        </OnImage>

        <div className="grid gap-4 lg:grid-cols-2">
        <div className="ui-card rounded-lg p-5 sm:p-6">
          <p className="ui-kicker">Exports</p>
          <h2 className="ui-title mt-1">Download your data</h2>
          <p className="mt-2 text-sm text-slate-600">
            Export logs and program history anytime.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="primary" disabled={exporting} onClick={handleDownloadCsv}>
              {exporting ? "Working..." : "Download CSV"}
            </Button>
            <Button variant="primary" disabled={exporting} onClick={handleDownloadJson}>
              {exporting ? "Working..." : "Download JSON"}
            </Button>
          </div>
        </div>

        <div className="ui-card rounded-lg p-5 sm:p-6">
          <p className="ui-kicker">Data controls</p>
          <h2 className="ui-title mt-1">Reset app data</h2>
          <p className="mt-2 text-sm text-slate-600">
            This removes local workout programs, logs, photos, and in-progress drafts on this device.
          </p>

          {!confirmOpen ? (
            <div className="mt-4">
              <Button variant="primary" onClick={() => setConfirmOpen(true)}>
                Reset my data
              </Button>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-rose-300/35 bg-rose-900/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-100">
                Confirm reset
              </p>
              <p className="mt-1 text-sm text-rose-100">
                Type <span className="font-semibold">RESET</span> to continue.
              </p>
              <input
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                className="ui-input mt-3 border-rose-300/45"
                placeholder="Type RESET"
              />
              <div className="mt-3 flex gap-2">
                <Button
                  variant="primary"
                  disabled={working || confirmText !== "RESET"}
                  onClick={async () => {
                    setWorking(true);
                    setMessage(null);
                    try {
                      await resetAllAppData();
                      setMessage("App data reset complete.");
                      setConfirmOpen(false);
                      setConfirmText("");
                    } catch {
                      setMessage("Reset failed. Please try again.");
                    } finally {
                      setWorking(false);
                    }
                  }}
                >
                  {working ? "Resetting..." : "Confirm reset"}
                </Button>
                <Button
                  variant="secondary"
                  disabled={working}
                  onClick={() => {
                    setConfirmOpen(false);
                    setConfirmText("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {message ? <p className="mt-3 text-sm text-slate-700">{message}</p> : null}
        </div>
        </div>
      </div>
    </BackgroundShell>
  );
}
