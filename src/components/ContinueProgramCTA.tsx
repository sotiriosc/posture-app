"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLatestProgram, init, listSessions } from "@/lib/logStore";

export default function ContinueProgramCTA() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const check = async () => {
      await init();
      const program = await getLatestProgram();
      const sessions = await listSessions(1);
      const hasLocal =
        typeof window !== "undefined" &&
        (localStorage.getItem("posture_questionnaire") ||
          localStorage.getItem("app_state_v1"));
      const hasData = Boolean(program || sessions.length || hasLocal);
      setVisible(hasData);
      setOpen(hasData);
      setMounted(true);
    };
    check();
  }, []);

  if (!visible || !open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center px-4 pb-6 sm:items-center sm:pb-0 transition ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-sm rounded-3xl border border-white/20 bg-white/15 p-5 text-white shadow-xl backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Welcome back</p>
            <p className="text-xs text-slate-200">
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
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/results"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-900"
          >
            ▶ Continue program
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-white/25 px-4 py-2 text-xs font-semibold text-white/90 hover:bg-white/10"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
