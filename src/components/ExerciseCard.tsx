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
  return (
    <section className="ui-card p-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{name}</h2>
        <p className="mt-1 text-sm text-slate-600">
          Targets: {targetMuscles.length ? targetMuscles.join(", ") : "full body"}
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-sky-200/80 bg-sky-50/75 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700/80">
          Corrective guidance cue
        </p>
        <p className="mt-1 text-sm text-slate-800">{cue}</p>
      </div>

      <div className="mt-4 space-y-2 rounded-xl border border-indigo-200/75 bg-white px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700/85">
          Set tracking
        </p>
        {sets.map((completed, index) => (
          <label
            key={`set-${index}`}
            className={`flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition ${
              completed
                ? "border-sky-300 bg-sky-50 text-slate-900"
                : "border-amber-200 bg-amber-50/75 text-amber-900"
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
        ))}
      </div>

      <div
        className={`mt-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-800 transition-[opacity,transform] duration-200 ${
          completionFlashVisible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        ✓ Movement Pattern Complete
      </div>
    </section>
  );
}
