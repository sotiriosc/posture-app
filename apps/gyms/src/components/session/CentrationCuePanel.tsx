"use client";

import type { ReactNode } from "react";
import type { CentrationCues } from "@/lib/centrationCues";

type CentrationCuePanelProps = {
  cues: CentrationCues;
  /** Optional common-mistake line from the catalog (legacy). */
  mistake?: string | null;
};

const Section = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-200/90">
      {label}
    </p>
    <div className="mt-1.5 space-y-1.5 text-sm leading-5 text-slate-100">
      {children}
    </div>
  </div>
);

/**
 * Mobile-first labeled centration coaching for warmup / activation.
 * Replaces the flat "Cues" bullet wall when structured data exists.
 */
export default function CentrationCuePanel({
  cues,
  mistake,
}: CentrationCuePanelProps) {
  const showMistake =
    Boolean(mistake) && mistake !== "Keep form controlled";

  return (
    <div
      className="flex h-full min-h-[220px] flex-col justify-center rounded-lg border border-sky-300/25 bg-sky-400/10 px-4 py-4 text-sm text-slate-100 sm:px-5 sm:py-5"
      data-testid="centration-cue-panel"
    >
      <div className="space-y-4">
        {cues.setup.length > 0 ? (
          <Section label="Set up">
            <ul className="list-disc space-y-1.5 pl-4">
              {cues.setup.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Section>
        ) : null}

        {cues.during.length > 0 ? (
          <Section label="During">
            <ul className="list-disc space-y-1.5 pl-4">
              {cues.during.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Section>
        ) : null}

        {cues.pattern ? (
          <Section label="Pattern">
            <p>{cues.pattern}</p>
          </Section>
        ) : null}

        {cues.watchFor.length > 0 ? (
          <Section label="Watch for">
            <ul className="list-disc space-y-1.5 pl-4">
              {cues.watchFor.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Section>
        ) : null}

        {showMistake ? (
          <p className="border-t border-sky-200/15 pt-3 text-xs leading-5 text-slate-300">
            Common mistake: {mistake}
          </p>
        ) : null}
      </div>
    </div>
  );
}
