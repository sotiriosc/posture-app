"use client";

import { useEffect, useState } from "react";

/**
 * Phase 6.6 — honest failure mode.
 *
 * Shared fallback rendered by every route-level error boundary
 * (results / session / assessment). No white screen of death: the user is
 * told their data is safe and given two real actions.
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

  // Always surface the error to the console immediately so nothing is lost,
  // even if the user never clicks "Report this".
  useEffect(() => {
    console.error(`[${view}] render error:`, error);
  }, [error, view]);

  const handleReport = () => {
    // Stub log sink: swap `console.error` for a POST when the endpoint exists.
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
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {view}
        </p>
        <h1 className="mt-3 text-lg font-semibold text-white">
          Something didn&apos;t render correctly
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Your data is safe. This is a display problem, not a data loss.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={handleReport}
            disabled={reported}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 disabled:opacity-60"
          >
            {reported ? "Reported — thank you" : "Report this"}
          </button>
        </div>
      </div>
    </div>
  );
}
