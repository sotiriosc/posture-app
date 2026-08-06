"use client";

import type { PlanRevealInfluencePoint } from "@/lib/program/presentation";
import { planRevealPillBase, planRevealTransition } from "./planRevealStyles";

type WhyPraxisSectionProps = {
  open: boolean;
  onToggle: () => void;
  influencePoints: PlanRevealInfluencePoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function WhyPraxisSection({
  open,
  onToggle,
  influencePoints,
  selectedId,
  onSelect,
}: WhyPraxisSectionProps) {
  const selected =
    influencePoints.find((p) => p.id === selectedId) ?? influencePoints[0] ?? null;

  return (
    <section
      className={`mt-6 ${planRevealTransition}`}
      data-testid="plan-reveal-why"
      aria-labelledby="plan-reveal-why-heading"
    >
      <button
        type="button"
        id="plan-reveal-why-heading"
        onClick={onToggle}
        aria-expanded={open}
        className={`${planRevealPillBase} w-full justify-between border-slate-400/30 bg-slate-900/40 text-left text-slate-100 sm:w-auto`}
        data-testid="plan-reveal-why-toggle"
      >
        <span>See why Praxis chose this</span>
        <span className="ml-3 text-slate-400" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>

      {open ? (
        <div className="mt-4 space-y-3" data-testid="plan-reveal-why-panel">
          <p className="text-sm text-slate-300">
            Up to three influences shaped this first phase. Select one for detail.
          </p>
          <div className="flex flex-wrap gap-2" role="list">
            {influencePoints.map((point) => {
              const selectedPoint = selected?.id === point.id;
              return (
                <button
                  key={point.id}
                  type="button"
                  role="listitem"
                  aria-pressed={selectedPoint}
                  onClick={() => onSelect(point.id)}
                  className={`${planRevealPillBase} ${
                    selectedPoint
                      ? "border-sky-300/45 bg-sky-400/15 text-sky-50"
                      : "border-slate-400/25 bg-slate-950/40 text-slate-200"
                  }`}
                >
                  {point.label}
                </button>
              );
            })}
          </div>
          {selected ? (
            <div
              className="rounded-lg border border-slate-400/20 bg-slate-950/35 px-3 py-3"
              data-testid="plan-reveal-why-detail"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {selected.label}
              </p>
              <p className="mt-1 text-sm text-slate-100">{selected.detail}</p>
              <p className="mt-2 text-xs text-slate-400">
                Noticed in your setup → shaped exercise choices → appears in Day 1 focus.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
