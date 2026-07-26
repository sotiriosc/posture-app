"use client";

import Link from "next/link";

type FeedbackPromptCardProps = {
  onDismiss: () => void;
};

/**
 * Phase 6L Commit 2 — subtle one-time prompt after the 5th completed session.
 * Non-nagging; dismissed permanently via localStorage.
 */
export default function FeedbackPromptCard({ onDismiss }: FeedbackPromptCardProps) {
  return (
    <section
      className="ui-card order-2 border border-slate-500/30 bg-slate-950/50 px-4 py-3 text-slate-100 sm:px-5"
      data-testid="feedback-session-prompt"
      aria-live="polite"
    >
      <p className="text-sm text-slate-200">
        How&apos;s Praxis working for you?{" "}
        <Link
          href="/feedback"
          className="font-semibold text-sky-300 underline-offset-2 hover:text-sky-200 hover:underline"
          data-testid="feedback-session-prompt-link"
        >
          Send feedback →
        </Link>
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-2 text-xs text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline"
        data-testid="feedback-session-prompt-dismiss"
      >
        Dismiss
      </button>
    </section>
  );
}
