"use client";

import { useState } from "react";

type ImprovementInsightsProps = {
  insights: string[];
};

export default function ImprovementInsights({ insights }: ImprovementInsightsProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="ui-card p-6">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <h2 className="text-sm font-semibold text-slate-900">Movement quality trends</h2>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {open ? "Hide" : "Show"}
        </span>
      </button>
      {open ? (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
          {insights.map((insight) => (
            <li key={insight}>{insight}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
