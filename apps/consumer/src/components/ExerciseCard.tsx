"use client";

type ExerciseCardProps = {
  name: string;
  targetMuscles: string[];
  cue: string;
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
  sets,
  onToggleSet,
  onSetEnter,
  setCheckboxRef,
  completionFlashVisible,
}: ExerciseCardProps) {
  // Phase 6d, Commit 1 — only the current set gets the full tappable row;
  // sets not yet reached are hidden entirely (nothing to do with them yet),
  // and finished sets collapse to a tiny check row so the list doesn't grow
  // taller as the user progresses through it.
  const firstIncompleteIndex = sets.findIndex((completed) => !completed);
  const activeSetIndex = firstIncompleteIndex === -1 ? sets.length - 1 : firstIncompleteIndex;

  return (
    <section className="ui-card rounded-lg p-5 sm:p-6">
      <div>
        <h2 className="text-xl font-semibold text-white">{name}</h2>
        <p className="mt-1 text-sm text-slate-300">
          Targets: {targetMuscles.length ? targetMuscles.join(", ") : "full body"}
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-sky-300/25 bg-sky-400/10 px-4 py-3">
        <p className="text-xs font-semibold uppercase text-sky-100">
          Focus for this exercise
        </p>
        <p className="mt-1 text-sm text-slate-100">{cue}</p>
      </div>

      <div className="mt-4 space-y-1.5 rounded-lg border border-slate-600/35 bg-slate-950/45 px-4 py-3">
        <p className="text-xs font-semibold uppercase text-slate-300">
          Set tracking
        </p>
        {sets.map((completed, index) => {
          if (index > activeSetIndex) return null;

          const checkbox = (
            <input
              key="checkbox"
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
          );

          if (index < activeSetIndex) {
            // Already-done set: tiny single-line row, not the big tappable
            // target — that belongs to whichever set is actually active.
            return (
              <label
                key={`set-${index}`}
                className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-xs text-sky-100/90"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <span aria-hidden="true">✓</span>
                  Set {index + 1} complete
                </span>
                {checkbox}
              </label>
            );
          }

          return (
            <label
              key={`set-${index}`}
              className={`flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                completed
                  ? "border-sky-300/55 bg-sky-400/15 text-sky-50"
                  : "border-amber-300/35 bg-amber-400/10 text-amber-50"
              }`}
            >
              <span className="flex items-center gap-2 font-medium">
                {completed ? <span aria-hidden="true">✓</span> : null}
                Set {index + 1}
              </span>
              <span className="text-xs font-semibold">
                {completed ? "Complete" : "Mark complete"}
              </span>
              {checkbox}
            </label>
          );
        })}
      </div>

      <div
        className={`mt-3 rounded-lg border border-sky-300/40 bg-sky-400/15 px-3 py-2 text-sm font-semibold text-sky-50 transition-[opacity,transform] duration-200 ${
          completionFlashVisible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        ✓ Movement Pattern Complete
      </div>
    </section>
  );
}
