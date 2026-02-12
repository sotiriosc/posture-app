"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { init } from "@/lib/logStore";
import { loadAppState } from "@/lib/appState";
import { loadDraft } from "@/lib/sessionDraftStore";
import { shouldShowContinueCTA } from "@/lib/continueCta";

export default function ContinueProgramCTA() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = async () => {
      await init();
      const state = loadAppState();
      const draft = await loadDraft(state?.activeSessionId ?? null);
      const show = shouldShowContinueCTA(state, draft);
      setVisible(show);
      setOpen(show);
      setMounted(true);
    };
    check();
  }, []);

  if (!visible || !open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/15 p-6 text-white shadow-xl backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold">Welcome back</p>
            <p className="text-sm text-slate-200">
              You have a saved program ready to continue.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-white/20 px-2.5 py-1 text-xs text-white/80 hover:bg-white/10"
            aria-label="Dismiss resume prompt"
          >
            ✕
          </button>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/results"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900"
          >
            ▶ Continue program
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
