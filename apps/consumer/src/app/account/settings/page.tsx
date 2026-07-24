"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BackgroundShell from "@/components/BackgroundShell";
import OnImage from "@/components/OnImage";
import Button from "@/components/ui/Button";
import { eraseAllLocalData } from "@/lib/resetAppData";
import { loadAppState, saveAppState } from "@/lib/appState";
import { clearDraftsByProgramId } from "@/lib/sessionDraftStore";
import {
  getProgram,
  init,
  listAllExerciseLogs,
  listAllPrograms,
  listSessions,
  loadPrefs,
  savePrefs,
  SCHEMA_VERSION,
  saveProgramProgress,
} from "@/lib/logStore";
import type { LogPrefs } from "@/lib/types";
import {
  isSectionVisible,
  resetSectionVisibilityToDefaults,
  sectionsForScreen,
} from "@/lib/ui/sectionVisibility";
import type { SectionScreen } from "@/lib/ui/sectionVisibility";

const VISIBILITY_SCREENS: Array<{ id: SectionScreen; label: string }> = [
  { id: "results", label: "Results" },
  { id: "session", label: "Session" },
  { id: "day", label: "Day" },
];

export default function AccountSettingsPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetProgressConfirmOpen, setResetProgressConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  // Phase 6f, Commit 8 — shared prefs state backs both the Interface
  // (per-section visibility) toggles and the "incomplete" prompt
  // suppression toggle below (Commit 5.c), mirroring the admin settings
  // page's (apps/consumer/src/app/settings/page.tsx) existing pattern.
  const [prefs, setPrefs] = useState<LogPrefs | null>(null);

  useEffect(() => {
    let active = true;
    void loadPrefs().then((loaded) => {
      if (!active) return;
      setPrefs(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleToggleIncompletePrompts = async () => {
    const currentPrefs = await loadPrefs();
    const nextValue = !(currentPrefs.suppressIncompleteContractPrompts === true);
    const nextPrefs: LogPrefs = {
      ...currentPrefs,
      suppressIncompleteContractPrompts: nextValue,
    };
    await savePrefs(nextPrefs);
    setPrefs(nextPrefs);
  };

  // Phase 6f, Commit 8 — restore the Interface (per-section visibility)
  // section. Ported from the admin-only apps/consumer/src/app/settings/
  // page.tsx (Phase 6.3), whose mount regular users never see — its own
  // route is admin-gated by middleware.ts.
  const handleToggleSection = async (sectionId: string) => {
    const currentPrefs = await loadPrefs();
    const current = isSectionVisible(currentPrefs.sectionVisibility, sectionId);
    const nextVisibility = {
      ...(currentPrefs.sectionVisibility ?? {}),
      [sectionId]: !current,
    };
    const nextPrefs: LogPrefs = {
      ...currentPrefs,
      sectionVisibility: nextVisibility,
    };
    await savePrefs(nextPrefs);
    setPrefs(nextPrefs);
  };

  const handleResetSectionVisibility = async () => {
    const currentPrefs = await loadPrefs();
    const nextPrefs: LogPrefs = {
      ...currentPrefs,
      sectionVisibility: resetSectionVisibilityToDefaults(),
    };
    await savePrefs(nextPrefs);
    setPrefs(nextPrefs);
  };

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

  const handleResetCurrentProgress = async () => {
    setWorking(true);
    setMessage(null);
    try {
      const state = loadAppState();
      const activeProgramId = state?.activeProgramId ?? state?.programId ?? null;
      if (!activeProgramId) {
        setMessage("No active program found to reset.");
        return;
      }
      const activeProgram = await getProgram(activeProgramId);
      if (!activeProgram) {
        setMessage("No active program found to reset.");
        return;
      }
      const resetAt = Date.now();
      const resetAtIso = new Date(resetAt).toISOString();
      await saveProgramProgress({
        programId: activeProgram.id,
        lastCompletedDayIndex: null,
        nextDayIndex: 0,
        completedDayIndices: [],
        phaseIndex: activeProgram.phaseIndex ?? 1,
        phaseStartedAt: resetAtIso,
        cyclesCompletedInPhase: 0,
        workoutsCompletedInPhase: 0,
        daysPerWeek: activeProgram.daysPerWeek,
        weekIndex: Math.max(1, activeProgram.weekIndex ?? 1),
        countedWeekKeys: [],
        updatedAt: resetAtIso,
      });
      await clearDraftsByProgramId(activeProgram.id);
      saveAppState({
        programId: activeProgram.id,
        activeProgramId: activeProgram.id,
        activeProgramBaselineAt: resetAt,
        selectedDay: 0,
        activeSessionId: undefined,
        activePhaseIndex: activeProgram.phaseIndex ?? 1,
        activeCycleIndex: activeProgram.cycleIndex ?? 1,
        lastRoute: "/account/settings",
      });
      setResetProgressConfirmOpen(false);
      setMessage("Current progress reset. Workout history and logs were preserved.");
    } catch {
      setMessage("Current progress reset failed. Please try again.");
    } finally {
      setWorking(false);
    }
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
        `praxis-training-logs-${Date.now()}.csv`,
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
        `praxis-training-export-${Date.now()}.json`,
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
      <div className="ui-shell flex max-w-6xl flex-col gap-6 py-8 sm:py-12">
        <OnImage>
          <header className="ui-page-heading flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="ui-kicker">
                Account
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Settings</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                Export Praxis data, reset current progress, or erase local app data on this device.
              </p>
            </div>
            <Link href="/results">
              <Button variant="secondary">Back</Button>
            </Link>
          </header>
        </OnImage>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="ui-card ui-soft-surface-raised rounded-lg p-5 sm:p-6">
            <p className="ui-kicker">Exports</p>
            <h2 className="ui-title mt-1">Download your data</h2>
            <p className="mt-2 text-sm text-slate-300">
              Export your Praxis logs and plan history anytime.
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

          <div className="ui-card ui-soft-surface-raised rounded-lg p-5 sm:p-6">
            <p className="ui-kicker">Current progress</p>
            <h2 className="ui-title mt-1">Reset active plan progress</h2>
            <p className="mt-2 text-sm text-slate-300">
              Start the active plan from Day 1 again while preserving completed workout history and logs.
            </p>
            {!resetProgressConfirmOpen ? (
              <div className="mt-4">
                <Button
                  variant="secondary"
                  onClick={() => setResetProgressConfirmOpen(true)}
                  data-testid="settings-reset-current-progress-trigger"
                >
                  Reset current progress
                </Button>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-sky-300/25 bg-sky-400/10 p-4">
                <p className="text-xs font-semibold uppercase text-sky-100">
                  Confirm progress reset
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  This resets the current baseline and active day only. It keeps workout history, logs, programs, photos, and exports.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    disabled={working}
                    onClick={handleResetCurrentProgress}
                    data-testid="settings-reset-current-progress-confirm"
                  >
                    {working ? "Resetting..." : "Start fresh week"}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={working}
                    onClick={() => setResetProgressConfirmOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="ui-card ui-soft-surface-raised rounded-lg p-5 sm:p-6">
            <p className="ui-kicker">Session prompts</p>
            <h2 className="ui-title mt-1">&quot;Didn&apos;t fill in fields&quot; prompt</h2>
            <p className="mt-2 text-sm text-slate-300">
              When a session starts and an exercise from last time is missing
              its logged sets, Praxis asks about it. Turn this off if you&apos;d
              rather it just stay quiet.
            </p>
            <label className="mt-4 flex items-center gap-2 text-sm text-slate-200">
              <input
                type="checkbox"
                data-testid="settings-suppress-incomplete-prompts"
                checked={prefs?.suppressIncompleteContractPrompts === true}
                disabled={!prefs}
                onChange={() => {
                  void handleToggleIncompletePrompts();
                }}
                className="h-4 w-4 rounded border-slate-500 bg-slate-900 accent-sky-500"
              />
              Turn off this prompt
            </label>
          </div>

          <div
            className="ui-card ui-soft-surface-raised rounded-lg p-5 sm:p-6 lg:col-span-2"
            data-testid="settings-interface-section"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="ui-kicker">Interface</p>
                <h2 className="ui-title mt-1">Choose what appears on each screen</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-300">
                  Hidden sections can be brought back here anytime, or from the
                  &quot;sections hidden&quot; link on the screen itself.
                </p>
              </div>
              <Button
                variant="secondary"
                data-testid="settings-interface-reset"
                onClick={() => {
                  void handleResetSectionVisibility();
                }}
              >
                Reset to defaults
              </Button>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              {VISIBILITY_SCREENS.map((screen) => (
                <div key={screen.id}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {screen.label}
                  </p>
                  <ul className="mt-2 space-y-2">
                    {sectionsForScreen(screen.id).map((section) => {
                      const visible = isSectionVisible(
                        prefs?.sectionVisibility,
                        section.id
                      );
                      return (
                        <li
                          key={section.id}
                          className="flex items-start justify-between gap-3 rounded-lg border border-slate-700/40 bg-slate-900/50 px-3 py-2"
                        >
                          <div>
                            <p className="text-xs font-semibold text-slate-200">
                              {section.label}
                            </p>
                            <p className="text-xs text-slate-500">
                              {section.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={visible}
                            aria-label={`${visible ? "Hide" : "Show"} ${section.label}`}
                            data-testid={`settings-interface-toggle-${section.id}`}
                            onClick={() => {
                              void handleToggleSection(section.id);
                            }}
                            className={[
                              "relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition",
                              visible ? "bg-sky-500/70" : "bg-slate-700",
                            ].join(" ")}
                          >
                            <span
                              className={[
                                "inline-block h-4 w-4 transform rounded-full bg-white transition",
                                visible ? "translate-x-4" : "translate-x-0.5",
                              ].join(" ")}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="ui-card ui-soft-surface-raised rounded-lg border-rose-300/25 p-5 sm:p-6 lg:col-span-2">
            <p className="ui-kicker text-rose-100">Destructive reset</p>
            <h2 className="ui-title mt-1">Erase all local data</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              This deletes workout history and logs, saved programs, photos, and in-progress drafts from this device.
            </p>
            {!confirmOpen ? (
              <div className="mt-4">
                <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
                  Erase all local data
                </Button>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-rose-300/35 bg-rose-900/20 p-4">
                <p className="text-xs font-semibold uppercase text-rose-100">
                  Confirm destructive reset
                </p>
                <p className="mt-1 text-sm text-rose-100">
                  Type <span className="font-semibold">ERASE ALL DATA</span> to delete workout history/logs, programs, photos, and drafts.
                </p>
                <input
                  value={confirmText}
                  onChange={(event) => setConfirmText(event.target.value)}
                  className="ui-input mt-3 border-rose-300/45"
                  placeholder="Type ERASE ALL DATA"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="danger"
                    disabled={working || confirmText !== "ERASE ALL DATA"}
                    onClick={async () => {
                      setWorking(true);
                      setMessage(null);
                      try {
                        // Phase 6e, Commit 1 (SR-6e) — this button's copy
                        // promises a full device wipe; `resetAllAppData` only
                        // clears a hardcoded key subset, which left stray
                        // local data behind. `eraseAllLocalData` is the
                        // primitive that actually matches the copy.
                        await eraseAllLocalData();
                        setMessage("All local app data erased.");
                        setConfirmOpen(false);
                        setConfirmText("");
                      } catch {
                        setMessage("Erase failed. Please try again.");
                      } finally {
                        setWorking(false);
                      }
                    }}
                  >
                    {working ? "Erasing..." : "Erase all local data"}
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
          </div>
        </div>
        {message ? <p className="text-sm text-slate-300">{message}</p> : null}
      </div>
    </BackgroundShell>
  );
}
