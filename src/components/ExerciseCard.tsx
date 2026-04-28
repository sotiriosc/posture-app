"use client";

type ExerciseCardProps = {
  name: string;
  targetMuscles: string[];
  cue: string;
  sectionLabel: string;
  dayTitle: string;
  phaseLabel: string;
  doseParts: string[];
  setProgressLabel: string;
  setDetailLabel?: string | null;
  restGuidance: string;
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
  sectionLabel,
  dayTitle,
  phaseLabel,
  doseParts,
  setProgressLabel,
  setDetailLabel,
  restGuidance,
  sets,
  onToggleSet,
  onSetEnter,
  setCheckboxRef,
  completionFlashVisible,
}: ExerciseCardProps) {
  return (
    <section
      className="ui-card overflow-hidden rounded-lg border-sky-300/30 bg-slate-950/68 p-5 shadow-[0_22px_55px_rgba(8,47,73,0.22)] sm:p-6"
      data-testid="active-exercise-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border border-sky-300/35 bg-sky-400/12 px-2.5 py-1 text-[11px] font-semibold uppercase text-sky-100"
              data-testid="active-section-label"
            >
              {sectionLabel}
            </span>
            <span className="text-xs font-semibold text-slate-300">
              {dayTitle} • {phaseLabel}
            </span>
          </div>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
            {name}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Targets: {targetMuscles.length ? targetMuscles.join(", ") : "full body"}
          </p>
        </div>
        <div
          className="rounded-lg border border-emerald-300/35 bg-emerald-400/10 px-3 py-2 text-right"
          data-testid="set-progress"
        >
          <p className="text-[11px] font-semibold uppercase text-emerald-100">
            Current set
          </p>
          <p className="mt-1 text-sm font-semibold text-white">{setProgressLabel}</p>
        </div>
      </div>

      <div
        className="mt-5 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3"
        data-testid="active-prescription-row"
      >
        <p className="text-xs font-semibold uppercase text-slate-300">
          Prescription
        </p>
        <p className="mt-1 text-base font-semibold leading-7 text-white">
          {doseParts.length ? doseParts.join(" • ") : "Move with control"}
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.55fr)]">
        <div className="rounded-lg border border-sky-300/25 bg-sky-400/10 px-4 py-3">
          <p className="text-xs font-semibold uppercase text-sky-100">
            Coach cue
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-100">{cue}</p>
        </div>
        <div
          className="rounded-lg border border-amber-300/30 bg-amber-400/10 px-4 py-3"
          data-testid="rest-guidance"
        >
          <p className="text-xs font-semibold uppercase text-amber-100">
            Rest
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-white">
            {restGuidance}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-lg border border-slate-600/35 bg-slate-950/45 px-4 py-3">
        <p className="text-xs font-semibold uppercase text-slate-300">
          Set tracking
        </p>
        {sets.map((completed, index) => (
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
              {setDetailLabel ? (
                <span className="text-xs font-semibold text-slate-200">
                  • {setDetailLabel}
                </span>
              ) : null}
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
        className={`mt-3 rounded-lg border border-sky-300/40 bg-sky-400/15 px-3 py-2 text-sm font-semibold text-sky-50 transition-[opacity,transform] duration-200 ${
          completionFlashVisible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        ✓ Movement Pattern Complete
      </div>
    </section>
  );
}
