"use client";

import type { PlanRevealDayNode } from "@/lib/program/presentation";
import { planRevealPillBase, planRevealTransition } from "./planRevealStyles";

type WeeklyPathProps = {
  days: PlanRevealDayNode[];
  selectedDayIndex: number;
  onSelectDay: (dayIndex: number) => void;
};

export default function WeeklyPath({
  days,
  selectedDayIndex,
  onSelectDay,
}: WeeklyPathProps) {
  const selected = days.find((d) => d.dayIndex === selectedDayIndex) ?? days[0];

  return (
    <section
      className={`mt-8 ${planRevealTransition}`}
      data-testid="plan-reveal-weekly-path"
      aria-labelledby="plan-reveal-weekly-heading"
    >
      <h2
        id="plan-reveal-weekly-heading"
        className="text-lg font-semibold text-white sm:text-xl"
      >
        Your weekly path
      </h2>
      <p className="mt-1 text-sm text-slate-300">
        Select a day for purpose, duration, and equipment — details stay compact.
      </p>

      <ol className="mt-4 flex flex-wrap gap-2" aria-label="Training days">
        {days.map((day) => {
          const active = day.dayIndex === selected?.dayIndex;
          return (
            <li key={day.dayIndex}>
              <button
                type="button"
                aria-pressed={active}
                aria-label={`${day.title}, ${day.status === "completed" ? "completed" : "not started"}`}
                onClick={() => onSelectDay(day.dayIndex)}
                className={`${planRevealPillBase} ${
                  active
                    ? "border-sky-300/45 bg-sky-400/15 text-sky-50"
                    : "border-slate-400/25 bg-slate-950/40 text-slate-200"
                }`}
                data-testid={`plan-reveal-day-${day.dayIndex}`}
              >
                <span className="font-semibold">Day {day.dayIndex + 1}</span>
                <span className="ml-2 hidden text-xs opacity-80 sm:inline">
                  {day.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {selected ? (
        <div
          className="mt-4 border-t border-slate-400/15 pt-4"
          data-testid="plan-reveal-day-detail"
        >
          <p className="text-base font-semibold text-white">{selected.title}</p>
          <p className="mt-1 text-sm text-slate-300">{selected.purpose}</p>
          <p className="mt-2 text-xs text-slate-400">
            {selected.expectedDuration}
            {selected.equipmentNeeded.length
              ? ` · ${selected.equipmentNeeded.slice(0, 3).join(", ")}`
              : ""}
            {` · ${selected.movementSummary}`}
            {` · ${selected.status === "completed" ? "Completed" : "Not started"}`}
          </p>
        </div>
      ) : null}
    </section>
  );
}
