"use client";

import { useEffect, useState } from "react";

/**
 * Phase 6.6 — honest failure mode (gyms).
 *
 * Shared fallback rendered by every route-level error boundary
 * (results / session / assessment / operator member view). No white screen of
 * death: the user is told their data is safe and given two real actions.
 *
 * "Report this" captures the error stack to a log sink. There is no remote
 * endpoint yet, so the stub is `console.error` (per the ship-readiness spec) —
 * wired here so swapping in a real endpoint later is a one-line change.
 */
export default function RouteErrorFallback({
  error,
  reset,
  view,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  view: string;
}) {
  const [reported, setReported] = useState(false);

  useEffect(() => {
    console.error(`[${view}] render error:`, error);
  }, [error, view]);

  const handleReport = () => {
    console.error("[client-error-report]", {
      view,
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      at: new Date().toISOString(),
    });
    setReported(true);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#0B0B0E] px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-[#1F2937] bg-[#111827] p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#4B5563]">
          {view}
        </p>
        <h1 className="mt-3 text-lg font-semibold text-white">
          Something didn&apos;t render correctly
        </h1>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Your data is safe. This is a display problem, not a data loss.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0B0B0E] transition hover:bg-slate-200"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={handleReport}
            disabled={reported}
            className="rounded-lg border border-[#374151] px-4 py-2 text-sm font-medium text-[#E5E7EB] transition hover:border-[#5B8FA8] disabled:opacity-60"
          >
            {reported ? "Reported — thank you" : "Report this"}
          </button>
        </div>
      </div>
    </div>
  );
}
