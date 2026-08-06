"use client";

import { useEffect, useState } from "react";
import type { QuestionnaireData } from "@/components/QuestionnaireForm";
import type { ProgramPresentationModel } from "@/lib/program/presentation";
import {
  generateWeeklyProgram,
  resolveProgramPresentation,
} from "@/lib/program";
import PlanRevealExperience from "@/components/plan-reveal/PlanRevealExperience";

type ModeCase = {
  id: string;
  label: string;
  equipment: string[];
  bandSetup?: QuestionnaireData["bandSetup"];
};

const MODES: ModeCase[] = [
  { id: "gym", label: "Gym", equipment: ["gym"] },
  { id: "dumbbells", label: "Dumbbells", equipment: ["dumbbells"] },
  {
    id: "bands-anchor",
    label: "Anchored bands",
    equipment: ["bands"],
    bandSetup: "long_with_anchor",
  },
  {
    id: "bands-no-anchor",
    label: "No-anchor bands",
    equipment: ["bands"],
    bandSetup: "long_no_anchor",
  },
  {
    id: "bands-loop",
    label: "Loop-only bands",
    equipment: ["bands"],
    bandSetup: "loop_only",
  },
  { id: "bodyweight", label: "Bodyweight", equipment: ["none"] },
  {
    id: "mixed-home",
    label: "Mixed Home",
    equipment: ["dumbbells", "bands"],
    bandSetup: "long_with_anchor",
  },
];

/**
 * Phase 8 screenshot / QA fixture route — real engine presentation.
 * Generation runs after mount so mode controls remain interactive.
 */
export default function PlanRevealPreviewPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [model, setModel] = useState<ProgramPresentationModel | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mode = MODES.find((m) => m.id === modeId) ?? MODES[0];

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError(null);
    // Defer heavy generation off the first paint.
    const timer = window.setTimeout(() => {
      try {
        const questionnaire: QuestionnaireData = {
          goals: "Improve posture",
          painAreas: ["Shoulders"],
          experience: "Beginner",
          daysPerWeek: 3,
          equipment: mode.equipment,
          bandSetup: mode.bandSetup,
        };
        const program = generateWeeklyProgram(
          questionnaire,
          `p8-preview-${mode.id}`,
          { seed: `p8-preview-${mode.id}` }
        );
        const next = resolveProgramPresentation({ program, questionnaire });
        if (!cancelled) setModel(next);
      } catch (err) {
        if (!cancelled) {
          setModel(null);
          setError(err instanceof Error ? err.message : "Preview failed");
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [mode]);

  return (
    <main
      className="min-h-screen bg-slate-950 px-3 py-4 text-slate-100 sm:px-6"
      data-testid="plan-reveal-preview-page"
      data-mode={mode.id}
    >
      <div className="mx-auto max-w-3xl space-y-4">
        <header>
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
            Phase 8 screenshot fixture
          </p>
          <h1 className="mt-1 text-xl font-semibold text-white">
            Plan reveal preview — {mode.label}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2" role="list">
            {MODES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                role="listitem"
                data-testid={`plan-reveal-preview-mode-${entry.id}`}
                aria-pressed={entry.id === mode.id}
                onClick={() => setModeId(entry.id)}
                className={`min-h-11 rounded-lg border px-3 py-2 text-sm ${
                  entry.id === mode.id
                    ? "border-sky-300/50 bg-sky-400/15 text-sky-50"
                    : "border-slate-500/40 bg-slate-900/50 text-slate-200"
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </header>
        {busy ? (
          <p className="text-sm text-slate-300" role="status">
            Building presentation from the engine…
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-rose-200" role="alert">
            {error}
          </p>
        ) : null}
        {model ? (
          <PlanRevealExperience
            presentationModel={model}
            startHref="/session?dayIndex=0"
          />
        ) : null}
      </div>
    </main>
  );
}
