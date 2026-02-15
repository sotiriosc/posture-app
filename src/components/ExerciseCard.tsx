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

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Coaching cue
        </p>
        <p className="mt-1 text-sm text-slate-700">{cue}</p>
      </div>

      <div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Set tracking
        </p>
        {sets.map((completed, index) => (
          <label
            key={`set-${index}`}
            className={`flex min-h-11 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition ${
              completed
                ? "border-emerald-300 bg-emerald-50 text-emerald-900 opacity-80"
                : "border-slate-200 bg-slate-50 text-slate-800"
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
              className="h-4 w-4 accent-emerald-600"
            />
          </label>
        ))}
      </div>

      <div
        className={`mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition-[opacity,transform] duration-200 ${
          completionFlashVisible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        ✓ Exercise Complete
      </div>
    </section>
  );
}
