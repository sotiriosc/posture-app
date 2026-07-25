"use client";

import ClarifyTerm from "@/components/ui/ClarifyTerm";
import { CLARIFY } from "@/components/ui/clarifyTermCopy";

type ExerciseCardProps = {
  name: string;
  targetMuscles: string[];
  cue: string;
  /** Prescribed reps, e.g. "8-12" or "6-8 per side". */
  reps?: string | null;
  /** Classic tempo notation, e.g. "2-0-2-0". */
  tempoNotation?: string | null;
  sets: boolean[];
  onToggleSet: (index: number) => void;
  onSetEnter?: (index: number) => void;
  setCheckboxRef?: (index: number, element: HTMLInputElement | null) => void;
  completionFlashVisible: boolean;
};

export default function ExerciseCard({
  name,
  targetMuscles,
  cue,
  reps = null,
  tempoNotation = null,
  sets,
  onToggleSet,
  onSetEnter,
  setCheckboxRef,
  completionFlashVisible,
}: ExerciseCardProps) {
  const firstIncompleteIndex = sets.findIndex((completed) => !completed);
  const activeSetIndex =
    firstIncompleteIndex === -1 ? sets.length - 1 : firstIncompleteIndex;
  const hasReps = Boolean(reps?.trim());
  const notation = tempoNotation?.trim() || null;
  const isClassicTempo = Boolean(notation && /^\d-\d-\d-\d$/.test(notation));
  const plainTempoLabel = notation && !isClassicTempo ? notation : null;

  return (
    <section className="praxis-panel-strong rounded-lg p-5 sm:p-6">
      <div>
        <h2 className="text-xl font-semibold text-white">{name}</h2>
        <p className="mt-1 text-sm text-slate-300">
          Targets: {targetMuscles.length ? targetMuscles.join(", ") : "full body"}
        </p>
        {hasReps || isClassicTempo || plainTempoLabel ? (
          <p
            className="mt-2 text-sm font-semibold text-sky-100"
            data-testid="exercise-card-prescription"
          >
            {hasReps ? <>Reps {reps!.trim()}</> : null}
            {hasReps && (isClassicTempo || plainTempoLabel) ? " · " : null}
            {isClassicTempo ? (
              <>
                <ClarifyTerm term="Tempo" explanation={CLARIFY.Tempo}>
                  Tempo
                </ClarifyTerm>{" "}
                {notation}
              </>
            ) : plainTempoLabel ? (
              plainTempoLabel
            ) : null}
          </p>
        ) : null}
      </div>

      <div className="praxis-card mt-4 rounded-lg px-4 py-3">
        <p className="text-xs font-semibold uppercase text-sky-100">
          Focus for this exercise
        </p>
        <p className="mt-1 text-sm text-slate-100">{cue}</p>
      </div>

      <div className="praxis-card-muted mt-4 space-y-2 rounded-lg px-4 py-3">
        <p className="text-xs font-semibold uppercase text-slate-300">
          Set tracking
        </p>
        {sets.map((completed, index) => {
          if (index > activeSetIndex) return null;
          return (
            <label
              key={`set-${index}`}
              className={`flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                completed
                  ? "praxis-selected-surface text-white"
                  : "praxis-input-surface text-slate-300 hover:border-sky-300/35"
              }`}
            >
              <span className="flex items-center gap-2 font-medium">
                {completed ? <span aria-hidden="true">✓</span> : null}
                Set {index + 1}
              </span>
              <span className="text-xs font-semibold">
                {completed ? "Complete" : "Mark complete"}
              </span>
              <input
                type="checkbox"
                aria-label={`Set ${index + 1}`}
                checked={completed}
                onChange={() => onToggleSet(index)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  onSetEnter?.(index);
                }}
                ref={(node) => setCheckboxRef?.(index, node)}
                className="h-4 w-4 accent-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1"
              />
            </label>
          );
        })}
      </div>

      <div
        className={`mt-3 rounded-lg border border-sky-300/40 bg-sky-400/15 px-3 py-2 text-sm font-semibold text-sky-50 transition-[opacity,transform] duration-200 ${
          completionFlashVisible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        ✓ Movement Pattern Complete
      </div>
    </section>
  );
}
