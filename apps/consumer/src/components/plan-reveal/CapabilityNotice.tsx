"use client";

import type { PresentationMessage } from "@/lib/program/presentation";
import { planRevealTransition } from "./planRevealStyles";

type CapabilityNoticeProps = {
  notes: PresentationMessage[];
};

export default function CapabilityNotice({ notes }: CapabilityNoticeProps) {
  if (!notes.length) return null;
  return (
    <div
      className={`mt-4 space-y-2 ${planRevealTransition}`}
      data-testid="plan-reveal-capability"
      role="status"
    >
      {notes.map((note) => (
        <p
          key={note.id}
          className={`rounded-lg border px-3 py-2 text-sm ${
            note.severity === "safety"
              ? "border-rose-300/35 bg-rose-400/10 text-rose-50"
              : note.severity === "caution"
              ? "border-amber-300/35 bg-amber-400/10 text-amber-50"
              : "border-slate-400/25 bg-slate-900/45 text-slate-200"
          }`}
        >
          {note.text}
        </p>
      ))}
    </div>
  );
}
