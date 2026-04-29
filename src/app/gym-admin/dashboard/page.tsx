import type { Metadata } from "next";
import Link from "next/link";
import B2BIcon, { type B2BIconName } from "@/components/gym-demo/B2BIcon";
import GymDemoHeader from "@/components/gym-demo/GymDemoHeader";
import { getActiveGymConfig } from "@/lib/gymSaas/gymConfig";
import {
  pilotOperatorSignals,
  pilotOperatorSummary,
} from "@/lib/gymSaas/operatorSignalFixtures";
import type {
  OperatorSignal,
  OperatorSignalCategory,
  OperatorSignalPriority,
} from "@/lib/gymSaas/operatorSignals";

export const metadata: Metadata = {
  title: "Signal Dashboard | Praxis for Gyms",
  description:
    "Preview a Praxis for Gyms operator signal dashboard shell powered by demo pilot session feedback signals.",
};

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

const summaryCards: Array<{
  label: string;
  value: number;
  detail: string;
  icon: B2BIconName;
}> = [
  {
    label: "Members needing trainer review",
    value: new Set(
      pilotOperatorSignals
        .filter((signal) => signal.priority !== "low")
        .map((signal) => signal.memberId)
    ).size,
    detail: "Medium and high priority preview signals",
    icon: "coach",
  },
  {
    label: "Completion support",
    value: pilotOperatorSummary.byCategory.completion_support,
    detail: "Restart or simplify next-session support",
    icon: "plan",
  },
  {
    label: "Confidence support",
    value: pilotOperatorSummary.byCategory.technique_confidence,
    detail: "Form review or exercise walkthrough",
    icon: "handoff",
  },
  {
    label: "Progress opportunities",
    value: pilotOperatorSummary.byCategory.progress_opportunity,
    detail: "Steady completion ready to continue",
    icon: "metrics",
  },
];

const handoffSignals = pilotOperatorSignals.filter((signal) =>
  ["discomfort_review", "technique_confidence"].includes(signal.category)
);

const signalPath = (signal: OperatorSignal) =>
  `/gym-admin/signals/${encodeURIComponent(signal.id)}`;

export default function GymAdminDashboardPage() {
  const config = getActiveGymConfig();

  return (
    <main className="gym-b2b-page min-h-screen bg-[#F6F9FB] text-[#5F6B75]">
      <section className="border-b border-[#E3E9EE] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <GymDemoHeader badge="Signal dashboard shell" />

          <div className="rounded-lg border border-[#5B8FA8]/25 bg-[#F6F9FB] px-4 py-3 text-sm font-semibold text-[#5B8FA8]">
            Pilot signal preview. Live member data connection comes next.
          </div>

          <div className="grid gap-8 pb-8 pt-2 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.6fr)] lg:items-end lg:pb-12">
            <div>
              <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
                Operator Signal Dashboard
              </span>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-[#1F2A33] sm:text-5xl lg:text-6xl">
                Trainer attention signals for a pilot gym.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5F6B75]">
                This Signal Dashboard uses the operator signal layer to translate demo
                workout feedback into calm, useful review queues for gym owners,
                trainers, and PT staff.
              </p>
            </div>

            <aside className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] p-5">
              <span className="block text-xs font-semibold uppercase text-[#5B8FA8]">
                Gym identity
              </span>
              <h2 className="mt-3 text-2xl font-semibold text-[#1F2A33]">
                {config.gymName}
              </h2>
              <div className="mt-5 grid gap-3 text-sm">
                <div className="rounded-lg border border-[#E3E9EE] bg-white px-4 py-3">
                  <span className="block font-semibold text-[#5B8FA8]">
                    Location
                  </span>
                  <span className="mt-1 block text-[#1F2A33]">
                    {config.locationLabel}
                  </span>
                </div>
                <div className="rounded-lg border border-[#E3E9EE] bg-white px-4 py-3">
                  <span className="block font-semibold text-[#5B8FA8]">
                    Pilot status
                  </span>
                  <span className="mt-1 block text-[#1F2A33]">
                    {config.pilotSettings.dashboardConnected
                      ? "Connected"
                      : "Preview data only"}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <article
              key={card.label}
              className="rounded-lg border border-[#E3E9EE] bg-white p-5 shadow-[0_16px_45px_rgba(31,42,51,0.05)]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#5B8FA8]/25 bg-[#F6F9FB] text-[#5B8FA8]">
                <B2BIcon name={card.icon} className="h-5 w-5" />
              </span>
              <p className="mt-4 text-sm font-semibold text-[#5F6B75]">
                {card.label}
              </p>
              <p className="mt-2 text-4xl font-semibold text-[#1F2A33]">
                {card.value}
              </p>
              <p className="mt-2 text-xs leading-5 text-[#5F6B75]">
                {card.detail}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#E3E9EE] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
                Trainer attention queue
              </span>
              <h2 className="mt-3 text-3xl font-semibold text-[#1F2A33]">
                New pilot feedback signals
              </h2>
            </div>
            <span className="w-fit rounded-full border border-[#E3E9EE] bg-[#F6F9FB] px-3 py-1 text-xs font-semibold text-[#5B8FA8]">
              {pilotOperatorSummary.totalSignals} preview signals
            </span>
          </div>

          <div className="mt-8 overflow-hidden rounded-lg border border-[#E3E9EE]">
            <div className="hidden grid-cols-[0.72fr_0.58fr_0.8fr_1.25fr_1.35fr_0.52fr] gap-3 bg-[#F6F9FB] px-4 py-3 text-xs font-semibold uppercase text-[#5B8FA8] lg:grid">
              <span>Member</span>
              <span>Priority</span>
              <span>Category</span>
              <span>Headline</span>
              <span>Suggested next step</span>
              <span>Detail</span>
            </div>
            {pilotOperatorSignals.map((signal) => (
              <article
                key={signal.id}
                className="grid grid-cols-1 gap-3 border-t border-[#E3E9EE] px-4 py-4 text-sm lg:grid-cols-[0.72fr_0.58fr_0.8fr_1.25fr_1.35fr_0.52fr]"
              >
                <span className="font-semibold text-[#1F2A33]">
                  {signal.memberName}
                </span>
                <span
                  className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${priorityClasses[signal.priority]}`}
                >
                  {signal.priority}
                </span>
                <span className="font-semibold text-[#5B8FA8]">
                  {categoryLabels[signal.category]}
                </span>
                <span className="font-semibold text-[#1F2A33]">
                  {signal.headline}
                </span>
                <span className="text-[#5F6B75]">
                  {signal.suggestedNextStep}
                </span>
                <Link
                  href={signalPath(signal)}
                  className="font-semibold text-[#5B8FA8] transition hover:text-[#1F2A33]"
                >
                  Open
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-10 lg:py-16">
        <section className="rounded-lg border border-[#E3E9EE] bg-white p-6 shadow-[0_16px_45px_rgba(31,42,51,0.05)]">
          <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
            PT handoff opportunities
          </span>
          <h2 className="mt-3 text-2xl font-semibold text-[#1F2A33]">
            Trainer review moments
          </h2>
          <div className="mt-5 space-y-3">
            {handoffSignals.map((signal) => (
              <article
                key={signal.id}
                className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold text-[#1F2A33]">
                    {signal.memberName}
                  </span>
                  <span className="w-fit rounded-full border border-[#5B8FA8]/25 bg-white px-3 py-1 text-xs font-semibold text-[#5B8FA8]">
                    {categoryLabels[signal.category]}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#5F6B75]">
                  {signal.suggestedNextStep}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[#E3E9EE] bg-white p-6 shadow-[0_16px_45px_rgba(31,42,51,0.05)]">
          <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
            Gym awareness
          </span>
          <h2 className="mt-3 text-2xl font-semibold text-[#1F2A33]">
            What these signals mean
          </h2>
          <div className="mt-5 grid gap-3 text-sm leading-6 text-[#5F6B75]">
            <p>
              Signals are derived from saved member workout feedback and grouped
              for service follow-up. They are service cues for trainer
              conversations.
            </p>
            <p>
              High priority means a trainer review may be useful before the next
              session. Medium priority points to completion, confidence, or
              recovery support. Low priority highlights a steady next step.
            </p>
            <p>
              This shell currently uses pilot preview inputs. Signal detail pages
              are available for workflow review. Live member data storage,
              reviewed status, and notification workflows are intentionally
              separate next steps.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
