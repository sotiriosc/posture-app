import type { Metadata } from "next";
import FeedbackForm from "@/components/feedback/FeedbackForm";

export const metadata: Metadata = {
  title: "Send feedback — Praxis",
  description: "Tell Sotirios what's working and what would make Praxis better.",
};

/**
 * Phase 6L Commit 2 — product feedback capture.
 * Submits to a Google Form / Sheet owned by Sotirios (no Praxis DB).
 */
export default function FeedbackPage() {
  return (
    <div className="app-bg min-h-screen text-white">
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Feedback
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Send feedback</h1>
        <p className="mt-2 text-sm text-slate-400">
          Optional fields — share whatever helps. I read every response.
        </p>
        <div className="mt-8">
          <FeedbackForm />
        </div>
      </main>
    </div>
  );
}
