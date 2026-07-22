"use client";

import { useEffect, useState } from "react";
import {
  init,
  saveProgram,
  createSession,
  saveExerciseLog,
} from "@/lib/logStore";
import { saveAppState } from "@/lib/appState";
import { resetAllAppData } from "@/lib/resetAppData";
import type { ExerciseLog, Program } from "@/lib/types";
import {
  buildTwelveWeekClimberProgram,
  buildTwelveWeekClimberLogs,
} from "@praxis/engine-fixtures/personas";

/**
 * Phase 6 dev tool — operator-side "Seed persona".
 *
 * Ready personas seed a complete state from the SAME golden-anchor factories the
 * tests use (packages/engine/tests/fixtures/personas.ts), then open the operator
 * screen that renders it. Personas whose golden anchors don't build a complete
 * seedable state are disabled and point at docs/persona-fixture-gaps.md — we
 * never fabricate persona/roster state here.
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
    id: "member-drill-in",
    title: "Single member drill-in",
    description:
      "12-week climber viewed from the operator side (coach note + ladder-progress projection).",
    status: "ready",
  },
  {
    id: "populated-roster",
    title: "Populated roster (5 members)",
    description: "5 members with varied projections.",
    status: "gap",
    gap: "The roster is static app demo data (demoMemberRoster, 4 members), not a golden-anchor fixture; seeding 5 varied projections would mean inventing member data.",
  },
  {
    id: "empty-roster",
    title: "Empty roster",
    description: "New gym, no members yet.",
    status: "gap",
    gap: "The roster page renders the static demo roster unconditionally; there is no empty-state path (or golden anchor) to seed.",
  },
];

const GAP_DOC = "docs/persona-fixture-gaps.md";

/** Derive session records from the fixture logs so the app's session-based
 * loader surfaces them (persistence plumbing, not persona semantics). */
async function seedProgramWithLogs(program: Program, logs: ExerciseLog[]) {
  await resetAllAppData();
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
  if (id === "member-drill-in") {
    await seedProgramWithLogs(
      buildTwelveWeekClimberProgram(),
      buildTwelveWeekClimberLogs()
    );
    // Operator drill-in resolves the locally-seeded active program.
    return "/gym-admin/members/member-001";
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
    <div className="min-h-screen bg-[#0B0B0E] px-6 py-12 text-[#D1D5DB]">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          Dev tool — not shipped
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Seed persona</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Wipes local state and seeds an operator persona from the golden-anchor
          fixtures, then opens the screen that renders it. Disabled personas have
          no complete golden fixture yet — see{" "}
          <code className="text-[#9CA3AF]">{GAP_DOC}</code>.
        </p>

        {seeding && (
          <div className="mt-6 rounded-lg border border-[#1F2937] bg-[#111827] px-4 py-3 text-sm text-[#D1D5DB]">
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
                    ? "border-[#1F2937] bg-[#111827] hover:border-[#374151] disabled:opacity-60"
                    : "cursor-not-allowed border-[#1F2937] bg-[#111827]/40 opacity-50",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    {persona.title}
                  </span>
                  {!ready && (
                    <span className="rounded-full border border-[#1F2937] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#6B7280]">
                      gap
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#6B7280]">{persona.description}</p>
                {!ready && persona.gap && (
                  <p className="mt-2 text-xs italic text-[#4B5563]">{persona.gap}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
