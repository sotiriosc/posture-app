"use client";

import { useState } from "react";

type ImprovementInsightsProps = {
  insights: string[];
};

export default function ImprovementInsights({ insights }: ImprovementInsightsProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="ui-card ui-soft-surface-raised p-6">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <h2 className="text-sm font-semibold text-white">Movement quality trends</h2>
        <span className="text-xs font-semibold uppercase text-slate-400">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open ? (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
          {insights.map((insight) => (
            <li key={insight}>{insight}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
