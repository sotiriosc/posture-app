"use client";

import type { PlanRevealDayNode } from "@/lib/program/presentation";
import { planRevealTransition } from "./planRevealStyles";

type DayPreviewProps = {
  day: PlanRevealDayNode | null;
};

export default function DayPreview({ day }: DayPreviewProps) {
  if (!day) return null;
  return (
    <div
      className={`mt-4 rounded-lg border border-slate-400/20 bg-slate-950/35 px-3 py-3 ${planRevealTransition}`}
      data-testid="plan-reveal-day-preview"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        First session preview
      </p>
      <p className="mt-1 text-base font-semibold text-white">{day.title}</p>
      <p className="mt-1 text-sm text-slate-300">{day.purpose}</p>
      <p className="mt-2 text-xs text-slate-400">
        {day.expectedDuration}
        {day.equipmentNeeded.length
          ? ` · ${day.equipmentNeeded.slice(0, 3).join(", ")}`
          : ""}
        {` · ${day.movementSummary}`}
      </p>
    </div>
  );
}
