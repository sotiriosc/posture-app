"use client";

type SessionProgressHeaderProps = {
  phaseName: string;
  dayPositionLabel: string;
  dayTitle: string;
  exercisePositionLabel: string;
  progressPercent: number;
};

export default function SessionProgressHeader({
  phaseName,
  dayPositionLabel,
  dayTitle,
  exercisePositionLabel,
  progressPercent,
}: SessionProgressHeaderProps) {
  return (
    <header className="ui-card border-sky-200/70 bg-[linear-gradient(135deg,rgba(239,246,255,0.96),rgba(250,245,255,0.94))] p-4 backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-700/90">
          {phaseName}
        </p>
        <p className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
          {dayPositionLabel}
        </p>
      </div>
      <h1 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">{dayTitle}</h1>
      <p className="mt-1 text-sm font-medium text-slate-700">{exercisePositionLabel}</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-sky-100">
        <div
          className="h-full rounded-full bg-[linear-gradient(135deg,#0284C7_0%,#2563EB_54%,#7C3AED_100%)] transition-[width] duration-300 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
        />
      </div>
    </header>
  );
}
