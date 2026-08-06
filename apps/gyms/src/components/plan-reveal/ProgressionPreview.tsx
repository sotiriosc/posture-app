"use client";

import type { PlanRevealProgressionPreview } from "@/lib/program/presentation";
import { planRevealTransition } from "./planRevealStyles";

type ProgressionPreviewProps = {
  preview: PlanRevealProgressionPreview;
};

/**
 * Progressive disclosure on first reveal — not gated by results.ladders.
 * Analytical ResultsView ladders remain controlled by results.ladders.
 */
export default function ProgressionPreview({ preview }: ProgressionPreviewProps) {
  return (
    <section
      className={`mt-8 ${planRevealTransition}`}
      data-testid="plan-reveal-progression"
      aria-labelledby="plan-reveal-progression-heading"
    >
      <h2
        id="plan-reveal-progression-heading"
        className="text-lg font-semibold text-white sm:text-xl"
      >
        {preview.headline}
      </h2>
      <p className="mt-2 text-sm text-slate-300">{preview.summary}</p>
      <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
        {preview.conditions.map((line) => (
          <li key={line} className="flex gap-2">
            <span aria-hidden="true" className="text-sky-300">
              ·
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
