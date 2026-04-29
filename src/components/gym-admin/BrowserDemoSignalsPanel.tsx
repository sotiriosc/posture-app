"use client";

import { useEffect, useMemo, useState } from "react";
import B2BIcon from "@/components/gym-demo/B2BIcon";
import {
  deriveOperatorSignalsFromSessions,
  summarizeOperatorSignals,
  type OperatorSignal,
  type OperatorSignalCategory,
  type OperatorSignalInput,
  type OperatorSignalPriority,
} from "@/lib/gymSaas/operatorSignals";
import { operatorSignalInputsFromSessionRecords } from "@/lib/gymSaas/sessionSignalAdapter";
import { listSessions } from "@/lib/logStore";

const categoryLabels: Record<OperatorSignalCategory, string> = {
  discomfort_review: "Discomfort review",
  technique_confidence: "Technique confidence",
  completion_support: "Completion support",
  recovery_support: "Recovery support",
  progress_opportunity: "Progress opportunity",
};

const priorityClasses: Record<OperatorSignalPriority, string> = {
  high: "border-[#C86F5C]/35 bg-[#C86F5C]/10 text-[#8A3F32]",
  medium: "border-[#C99A4A]/35 bg-[#C99A4A]/10 text-[#7B5A22]",
  low: "border-[#5B8FA8]/30 bg-[#5B8FA8]/10 text-[#5B8FA8]",
};

type BrowserDemoSignalState = {
  status: "loading" | "ready" | "error";
  inputs: OperatorSignalInput[];
  signals: OperatorSignal[];
};

const initialState: BrowserDemoSignalState = {
  status: "loading",
  inputs: [],
  signals: [],
};

const sortSignalsByCompletedAt = (signals: OperatorSignal[]) =>
  [...signals].sort((left, right) =>
    right.completedAt.localeCompare(left.completedAt)
  );

export default function BrowserDemoSignalsPanel() {
  const [state, setState] = useState<BrowserDemoSignalState>(initialState);

  useEffect(() => {
    let active = true;

    const loadBrowserSignals = async () => {
      try {
        const sessions = await listSessions(25);
        if (!active) return;

        const localSessions = sessions.filter((session) => session.source === "local");
        const inputs = operatorSignalInputsFromSessionRecords(localSessions);
        const signals = deriveOperatorSignalsFromSessions(inputs);
        setState({ status: "ready", inputs, signals });
      } catch {
        if (!active) return;
        setState({ status: "error", inputs: [], signals: [] });
      }
    };

    void loadBrowserSignals();

    return () => {
      active = false;
    };
  }, []);

  const sortedSignals = useMemo(
    () => sortSignalsByCompletedAt(state.signals),
    [state.signals]
  );
  const summary = useMemo(
    () => summarizeOperatorSignals(state.signals),
    [state.signals]
  );
  const hasLocalCheckIns = state.inputs.length > 0;
  const hasSignals = sortedSignals.length > 0;

  return (
    <section className="mx-auto max-w-7xl px-6 pt-10 sm:px-8 lg:px-10 lg:pt-12">
      <div className="rounded-lg border border-[#5B8FA8]/25 bg-white p-5 shadow-[0_16px_45px_rgba(31,42,51,0.05)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#5B8FA8]/25 bg-[#F6F9FB] text-[#5B8FA8]">
              <B2BIcon name="system" className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-semibold uppercase text-[#5B8FA8]">
              Browser demo signals
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1F2A33]">
              Local member check-ins can now preview staff-facing support signals.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5F6B75]">
              These signals are derived from completed member demo sessions saved
              in this browser. Complete a member demo session and this panel
              shows how member feedback can become a staff-facing support
              signal. They are not live gym data and are not connected to server
              storage, reviewed status, notifications, email, SMS, or CRM.
            </p>
          </div>
          <div className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] px-4 py-3 text-sm">
            <span className="block font-semibold text-[#5B8FA8]">
              Local signal count
            </span>
            <span className="mt-1 block text-3xl font-semibold text-[#1F2A33]">
              {summary.totalSignals}
            </span>
          </div>
        </div>

        {state.status === "loading" ? (
          <p className="mt-5 rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] px-4 py-3 text-sm leading-6 text-[#5F6B75]">
            Checking this browser for completed member demo check-ins...
          </p>
        ) : null}

        {state.status === "error" ? (
          <p className="mt-5 rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] px-4 py-3 text-sm leading-6 text-[#5F6B75]">
            Browser-local demo signals could not be loaded in this browser. The
            fixture pilot signals below are still available for review.
          </p>
        ) : null}

        {state.status === "ready" && !hasLocalCheckIns ? (
          <p className="mt-5 rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] px-4 py-3 text-sm leading-6 text-[#5F6B75]">
            No browser-local member check-in signals yet. Complete a member demo
            session to preview this connection.
          </p>
        ) : null}

        {state.status === "ready" && hasLocalCheckIns && !hasSignals ? (
          <p className="mt-5 rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] px-4 py-3 text-sm leading-6 text-[#5F6B75]">
            Latest member check-in was steady and did not create a trainer
            attention signal. Fixture pilot signals below remain available for
            workflow review.
          </p>
        ) : null}

        {hasSignals ? (
          <div className="mt-6 grid gap-3">
            {sortedSignals.map((signal) => (
              <article
                key={signal.id}
                className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#1F2A33]">
                        {signal.memberName}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${priorityClasses[signal.priority]}`}
                      >
                        {signal.priority}
                      </span>
                      <span className="rounded-full border border-[#5B8FA8]/25 bg-white px-3 py-1 text-xs font-semibold text-[#5B8FA8]">
                        {categoryLabels[signal.category]}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-[#1F2A33]">
                      {signal.headline}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#5F6B75]">
                      {signal.suggestedNextStep}
                    </p>
                  </div>
                  <span className="w-fit rounded-lg border border-[#E3E9EE] bg-white px-3 py-2 text-xs font-semibold text-[#5B8FA8]">
                    Local demo session signal
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
