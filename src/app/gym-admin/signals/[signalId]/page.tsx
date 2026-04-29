import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GymDemoHeader from "@/components/gym-demo/GymDemoHeader";
import { getActiveGymConfig } from "@/lib/gymSaas/gymConfig";
import { findPilotOperatorSignal } from "@/lib/gymSaas/operatorSignalFixtures";
import type {
  OperatorSignalCategory,
  OperatorSignalPriority,
} from "@/lib/gymSaas/operatorSignals";
import { buildTrainerHandoff } from "@/lib/gymSaas/trainerHandoff";

export const metadata: Metadata = {
  title: "Signal Detail | Praxis for Gyms",
  description:
    "Review a pilot signal handoff shell for trainer support workflows.",
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

type SignalDetailPageProps = {
  params: Promise<{ signalId: string }>;
};

export default async function SignalDetailPage({
  params,
}: SignalDetailPageProps) {
  const { signalId } = await params;
  const signal = findPilotOperatorSignal(decodeURIComponent(signalId));

  if (!signal) notFound();

  const gymConfig = getActiveGymConfig();
  const handoff = buildTrainerHandoff(signal, gymConfig);

  return (
    <main className="gym-b2b-page min-h-screen bg-[#F6F9FB] text-[#5F6B75]">
      <section className="border-b border-[#E3E9EE] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <GymDemoHeader badge="Signal detail" />

          <div className="rounded-lg border border-[#5B8FA8]/25 bg-[#F6F9FB] px-4 py-3 text-sm font-semibold text-[#5B8FA8]">
            Pilot signal detail. Notification, email, SMS, and CRM actions are
            coming next.
          </div>

          <div className="grid gap-8 pb-8 pt-2 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.62fr)] lg:items-end lg:pb-12">
            <div>
              <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
                Trainer handoff
              </span>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-[#1F2A33] sm:text-5xl lg:text-6xl">
                {handoff.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5F6B75]">
                Review the signal, suggested trainer action, and member-facing
                support copy before a future notification workflow is connected.
              </p>
            </div>

            <aside className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] p-5">
              <span className="block text-xs font-semibold uppercase text-[#5B8FA8]">
                Member
              </span>
              <h2 className="mt-3 text-2xl font-semibold text-[#1F2A33]">
                {signal.memberName}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${priorityClasses[signal.priority]}`}
                >
                  {handoff.priorityLabel}
                </span>
                <span className="rounded-full border border-[#E3E9EE] bg-white px-3 py-1 text-xs font-semibold text-[#5B8FA8]">
                  {categoryLabels[signal.category]}
                </span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-16">
        <section className="rounded-lg border border-[#E3E9EE] bg-white p-6 shadow-[0_16px_45px_rgba(31,42,51,0.05)]">
          <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
            Signal detail
          </span>
          <h2 className="mt-3 text-2xl font-semibold text-[#1F2A33]">
            {signal.headline}
          </h2>
          <div className="mt-5 grid gap-4 text-sm leading-6">
            <div>
              <p className="font-semibold text-[#1F2A33]">Coach summary</p>
              <p className="mt-1 text-[#5F6B75]">{signal.coachSummary}</p>
            </div>
            <div>
              <p className="font-semibold text-[#1F2A33]">Suggested next step</p>
              <p className="mt-1 text-[#5F6B75]">
                {signal.suggestedNextStep}
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#1F2A33]">Signal context</p>
              <p className="mt-1 text-[#5F6B75]">{signal.detail}</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#E3E9EE] bg-white p-6 shadow-[0_16px_45px_rgba(31,42,51,0.05)]">
          <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
            Trainer handoff
          </span>
          <div className="mt-5 grid gap-4">
            <article className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] p-4">
              <p className="font-semibold text-[#1F2A33]">Trainer action</p>
              <p className="mt-2 text-sm leading-6 text-[#5F6B75]">
                {handoff.trainerAction}
              </p>
            </article>
            <article className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] p-4">
              <p className="font-semibold text-[#1F2A33]">
                Member-facing message
              </p>
              <p className="mt-2 text-sm leading-6 text-[#5F6B75]">
                {handoff.memberFacingMessage}
              </p>
            </article>
            <article className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] p-4">
              <p className="font-semibold text-[#1F2A33]">Owner note</p>
              <p className="mt-2 text-sm leading-6 text-[#5F6B75]">
                {handoff.ownerNote}
              </p>
            </article>
          </div>
        </section>
      </section>

      <section className="border-y border-[#E3E9EE] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div>
            <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
              Actions
            </span>
            <h2 className="mt-2 text-2xl font-semibold text-[#1F2A33]">
              Workflow actions are coming next.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {["Mark reviewed", "Send trainer check-in", "Copy handoff note"].map(
              (label) => (
                <button
                  key={label}
                  type="button"
                  disabled
                  className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] px-4 py-3 text-sm font-semibold text-[#5F6B75] opacity-70"
                >
                  {label} - Coming next
                </button>
              )
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-10 sm:px-8 sm:flex-row lg:px-10">
        <Link
          href="/gym-admin/dashboard"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#5B8FA8] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(91,143,168,0.22)] transition hover:-translate-y-px hover:bg-[#4E7F96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2"
        >
          Back to signal dashboard
        </Link>
        <Link
          href="/gym-demo/admin"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#E3E9EE] bg-white px-5 py-3 text-sm font-semibold text-[#1F2A33] transition hover:-translate-y-px hover:border-[#5B8FA8]/50 hover:text-[#5B8FA8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2"
        >
          Back to Admin Dashboard demo
        </Link>
      </section>
    </main>
  );
}
