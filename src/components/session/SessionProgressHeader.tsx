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
    <header className="ui-card p-4 backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
          {phaseName}
        </p>
        <p className="text-xs font-semibold text-slate-500">{dayPositionLabel}</p>
      </div>
      <h1 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">{dayTitle}</h1>
      <p className="mt-1 text-sm font-medium text-slate-600">{exercisePositionLabel}</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-[linear-gradient(135deg,#3B82F6_0%,#2563EB_100%)] transition-[width] duration-300 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
        />
      </div>
    </header>
  );
}
