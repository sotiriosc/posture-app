"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadAppState, saveAppState } from "@/lib/appState";
import { clearDraft, loadDraft } from "@/lib/sessionDraftStore";

export default function ResumeSessionBanner() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [dayIndex, setDayIndex] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const state = loadAppState();
      if (!state?.activeSessionId) {
        setReady(true);
        return;
      }
      const draft = await loadDraft(state.activeSessionId);
      if (!draft) {
        saveAppState({ activeSessionId: undefined });
        setReady(true);
        return;
      }
      setSessionId(draft.sessionId);
      setProgramId(draft.programId ?? state.programId ?? null);
      setDayIndex(
        Number.isFinite(draft.dayIndex)
          ? (draft.dayIndex as number)
          : state.selectedDay ?? null
      );
      setReady(true);
    };
    load();
  }, []);

  if (!ready || !sessionId) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,560px)] -translate-x-1/2 rounded-2xl border border-white/20 bg-slate-950/80 px-4 py-3 text-white shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Resume your last session?</p>
          <p className="text-xs text-slate-300">
            We saved your progress so you can keep going.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={async () => {
              await clearDraft(sessionId);
              saveAppState({ activeSessionId: undefined });
              setSessionId(null);
            }}
            className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/10"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams();
              if (programId) params.set("programId", programId);
              if (dayIndex !== null) params.set("dayIndex", String(dayIndex));
              params.set("resumeSessionId", sessionId);
              router.push(`/session?${params.toString()}`);
            }}
            className="rounded-full bg-white px-4 py-1 text-xs font-semibold text-slate-900"
          >
            Resume
          </button>
        </div>
      </div>
    </div>
  );
}
