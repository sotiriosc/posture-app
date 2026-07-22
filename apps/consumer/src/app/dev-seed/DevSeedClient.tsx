"use client";

import { useEffect, useState } from "react";
import {
  init,
  saveProgram,
  createSession,
  saveExerciseLog,
} from "@/lib/logStore";
import { saveAppState } from "@/lib/appState";
import { eraseAllLocalData } from "@/lib/resetAppData";
import type { ExerciseLog, Program } from "@/lib/types";
import {
  buildTwelveWeekClimberProgram,
  buildTwelveWeekClimberLogs,
} from "@praxis/engine-fixtures/personas";

/**
 * Phase 6 dev tool — "Seed persona".
 *
 * Each ready persona seeds a complete state from the SAME golden-anchor
 * factories the tests use (packages/engine/tests/fixtures/personas.ts), then
 * lands on the screen that renders it. Personas whose golden anchors don't yet
 * build a complete seedable state are disabled and point at
 * docs/persona-fixture-gaps.md — we never fabricate persona state here.
 *
 * Seeding runs on a fresh page load (?seed=<id>) so the logStore's cached
 * IndexedDB connection is null and the wipe can't be blocked by an open handle.
 */

type Persona = {
  id: string;
  title: string;
  description: string;
  status: "ready" | "gap";
  gap?: string;
};

const PERSONAS: Persona[] = [
  {
    id: "climber",
    title: "12-week climber",
    description:
      "4 rung climbs across 2 patterns, 1 focus-tag retirement (forward-head cleared), 1 early phase transition. Lands on the results projection.",
    status: "ready",
  },
  {
    id: "maintainer",
    title: "60-year-old maintainer",
    description:
      "Maintain intent, criteria met but held, phase-transition prompt visible.",
    status: "gap",
    gap: "Golden anchors only build disjoint facets (ladder hold, maintain prompt, phase-gating), never one assembled seedable state.",
  },
  {
    id: "forward-head",
    title: "Forward-head assessment",
    description:
      "Active focus tag, corrective slots biased, primer picks visible.",
    status: "gap",
    gap: "Anchor asserts warmup injection (day view) only; no assessmentHistory / active focusTagLifecycle / logs for the results screen.",
  },
  {
    id: "sacrifice-retest",
    title: "Sacrifice pending retest",
    description: "2 exercises awaiting the retest-queue prompt.",
    status: "gap",
    gap: "Anchors assert single-exercise feedback-contract outputs, never a seedable two-exercise pending-retest program.",
  },
  {
    id: "cleared-forward-head",
    title: "Cleared-forward-head",
    description: "Retired tag with quiet celebration copy visible.",
    status: "gap",
    gap: "No standalone retired-tag-only program fixture; the retired-tag story is currently only shown by the 12-week climber.",
  },
  {
    id: "empty",
    title: "Empty new user",
    description: "Clean state, first-run experience.",
    status: "ready",
  },
];

const GAP_DOC = "docs/persona-fixture-gaps.md";

/** Derive session records from the fixture logs so the app's session-based
 * loader (listSessions → listExerciseLogsBySession) surfaces them. Sessions are
 * persistence plumbing, not persona semantics — hence derived here, not in the
 * golden fixture. */
async function seedProgramWithLogs(program: Program, logs: ExerciseLog[]) {
  await eraseAllLocalData();
  await init();
  await saveProgram(program);

  const sessionIds = Array.from(
    new Set(
      logs
        .map((log) => log.sessionId)
        .filter((id): id is string => Boolean(id))
    )
  );
  for (const sessionId of sessionIds) {
    const sessionLogs = logs.filter((log) => log.sessionId === sessionId);
    const createdAt = sessionLogs[0]?.createdAt ?? program.createdAt;
    await createSession({
      id: sessionId,
      userId: null,
      startedAt: createdAt,
      completedAt: createdAt,
      createdAt,
      updatedAt: createdAt,
      routineId: program.id,
      durationSec: null,
      notes: null,
      source: "local",
      deletedAt: null,
    });
  }
  for (const log of logs) {
    await saveExerciseLog(log);
  }
  saveAppState({ activeProgramId: program.id });
}

async function runSeed(id: string): Promise<string> {
  // Every seed starts from a fully wiped device so nothing leaks across persona
  // loads (spec 6.a). eraseAllLocalData() logs the wipe to the dev console.
  console.info(`[dev-seed] wiping all local state before seeding "${id}"`);
  if (id === "empty") {
    await eraseAllLocalData();
    return "/";
  }
  if (id === "climber") {
    await seedProgramWithLogs(
      buildTwelveWeekClimberProgram(),
      buildTwelveWeekClimberLogs()
    );
    return "/results/view";
  }
  throw new Error(`Unknown or non-seedable persona: ${id}`);
}

export default function DevSeedClient({ seed }: { seed: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const seedingPersona = seed ? PERSONAS.find((p) => p.id === seed) ?? null : null;
  const seeding = Boolean(seed) && !error;

  useEffect(() => {
    if (!seed) return;
    let cancelled = false;
    void (async () => {
      try {
        const dest = await runSeed(seed);
        if (!cancelled) window.location.assign(dest);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [seed]);

  const trigger = (persona: Persona) => {
    if (persona.status !== "ready") return;
    window.location.assign(`/dev-seed?seed=${persona.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-200">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          Dev tool — not shipped
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Seed persona</h1>
        <p className="mt-2 text-sm text-slate-400">
          Wipes local state and seeds a persona from the golden-anchor fixtures,
          then opens the screen that renders it. Disabled personas have no
          complete golden fixture yet — see{" "}
          <code className="text-slate-300">{GAP_DOC}</code>.
        </p>

        {seeding && (
          <div className="mt-6 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200">
            Seeding &quot;{seedingPersona?.title ?? seed}&quot;…
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-lg border border-rose-800 bg-rose-950/50 px-4 py-3 text-sm text-rose-200">
            Seed failed: {error}
          </div>
        )}

        <div className="mt-8 grid gap-3">
          {PERSONAS.map((persona) => {
            const ready = persona.status === "ready";
            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => trigger(persona)}
                disabled={!ready || seeding}
                title={
                  ready
                    ? undefined
                    : `Not seedable — see ${GAP_DOC}: ${persona.gap ?? ""}`
                }
                className={[
                  "rounded-xl border p-4 text-left transition",
                  ready
                    ? "border-slate-700 bg-slate-900 hover:border-slate-500 disabled:opacity-60"
                    : "cursor-not-allowed border-slate-800 bg-slate-900/40 opacity-50",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    {persona.title}
                  </span>
                  {!ready && (
                    <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-500">
                      gap
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-400">{persona.description}</p>
                {!ready && persona.gap && (
                  <p className="mt-2 text-xs italic text-slate-600">{persona.gap}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
