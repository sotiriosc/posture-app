import type { Metadata } from "next";
import Link from "next/link";
import B2BIcon, { type B2BIconName } from "@/components/gym-demo/B2BIcon";
import GymDemoHeader from "@/components/gym-demo/GymDemoHeader";
import { memberJourneySteps } from "@/lib/gymSaas/demoData";
import {
  BUYER_DEMO_AUTOSTART_QUERY_PARAM,
  BUYER_DEMO_AUTOSTART_QUERY_VALUE,
} from "@/lib/gymSaas/demoMode";

export const metadata: Metadata = {
  title: "Member Demo | Praxis for Gyms",
  description:
    "See how a gym member moves through assessment, profile, plan, session guidance, feedback, and trainer pathways.",
};

const journeyIcons: B2BIconName[] = [
  "assessment",
  "metrics",
  "plan",
  "coach",
  "handoff",
  "system",
];

export default function GymDemoMemberPage() {
  return (
    <main className="gym-b2b-page min-h-screen bg-[#F6F9FB] text-[#5F6B75]">
      <section className="border-b border-[#E3E9EE] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <GymDemoHeader activeHref="/gym-demo/member" />

          <div className="max-w-4xl py-10 lg:py-14">
            <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
              Member Demo
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-[#1F2A33] sm:text-5xl lg:text-6xl">
              Follow the member journey before launching the live assessment.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5F6B75]">
              This buyer-facing walkthrough explains the member journey before
              continuing into the live Praxis assessment and coaching flow.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/gym-demo/start?${BUYER_DEMO_AUTOSTART_QUERY_PARAM}=${BUYER_DEMO_AUTOSTART_QUERY_VALUE}`}
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#5B8FA8] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(91,143,168,0.28)] transition hover:-translate-y-px hover:bg-[#4E7F96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2"
              >
                Start fresh member demo
              </Link>
              <Link
                href="/gym-demo/admin"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#E3E9EE] bg-white px-6 py-3 text-sm font-semibold text-[#1F2A33] transition hover:-translate-y-px hover:border-[#5B8FA8]/50 hover:text-[#5B8FA8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2"
              >
                View Admin Preview
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memberJourneySteps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-lg border border-[#E3E9EE] bg-white p-6 shadow-[0_16px_45px_rgba(31,42,51,0.05)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#5B8FA8]/25 bg-[#F6F9FB] text-[#5B8FA8]">
                  <B2BIcon
                    name={journeyIcons[index] ?? "system"}
                    className="h-5 w-5"
                  />
                </span>
                <span className="rounded-full border border-[#E3E9EE] bg-[#F6F9FB] px-3 py-1 text-xs font-semibold text-[#5B8FA8]">
                  Step {index + 1}
                </span>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-[#1F2A33]">
                {step.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#5F6B75]">
                {step.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-[#E3E9EE] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-16 sm:px-8 lg:flex-row lg:items-center lg:px-10">
          <div>
            <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
              Live demo entry
            </span>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-[#1F2A33]">
              The next click prepares a clean browser state and launches the
              existing Praxis member engine.
            </h2>
          </div>
          <Link
            href={`/gym-demo/start?${BUYER_DEMO_AUTOSTART_QUERY_PARAM}=${BUYER_DEMO_AUTOSTART_QUERY_VALUE}`}
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-lg bg-[#5B8FA8] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(91,143,168,0.24)] transition hover:-translate-y-px hover:bg-[#4E7F96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2"
          >
            Start fresh member demo
          </Link>
        </div>
      </section>
    </main>
  );
}
