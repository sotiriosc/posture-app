import type { Metadata } from "next";
import Link from "next/link";
import GymDemoHeader from "@/components/gym-demo/GymDemoHeader";
import {
  adminMetrics,
  membersNeedingAttention,
  operatorSections,
} from "@/lib/gymSaas/demoData";

export const metadata: Metadata = {
  title: "Admin Demo | Praxis for Gyms",
  description:
    "Preview a mock gym operator dashboard for Praxis for Gyms pilot metrics and trainer pathway signals.",
};

export default function GymDemoAdminPage() {
  return (
    <main className="min-h-screen bg-[#F6F9FB] text-[#5F6B75]">
      <section className="border-b border-[#E3E9EE] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <GymDemoHeader activeHref="/gym-demo/admin" />

          <div className="grid gap-8 py-10 lg:grid-cols-[0.82fr_1fr] lg:items-end lg:py-14">
            <div>
              <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
                Mock operator dashboard
              </span>
              <h1 className="mt-5 text-4xl font-semibold leading-tight text-[#1F2A33] sm:text-5xl lg:text-6xl">
                Review the operator view for a 30-day gym pilot.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5F6B75]">
                This static dashboard shows the activation, confidence, and
                trainer-pathway signals a gym team could review during a Praxis
                pilot.
              </p>
              <p className="mt-4 max-w-2xl rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] px-4 py-3 text-sm font-semibold text-[#5B8FA8]">
                All values shown here are mock demo data.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {adminMetrics.map((metric) => (
                <article
                  key={metric.label}
                  className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] p-5"
                >
                  <p className="text-sm font-semibold text-[#5F6B75]">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-[#1F2A33]">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase text-[#5B8FA8]">
                    {metric.note}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {operatorSections.map((section) => (
              <article
                key={section.title}
                className="rounded-lg border border-[#E3E9EE] bg-white p-6 shadow-[0_16px_45px_rgba(31,42,51,0.05)]"
              >
                <h2 className="text-xl font-semibold text-[#1F2A33]">
                  {section.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#5F6B75]">
                  {section.body}
                </p>
              </article>
            ))}
          </div>

          <section className="rounded-lg border border-[#E3E9EE] bg-white p-6 shadow-[0_18px_55px_rgba(31,42,51,0.06)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
                  Mock demo data
                </span>
                <h2 className="mt-3 text-2xl font-semibold text-[#1F2A33]">
                  Members needing attention
                </h2>
              </div>
              <span className="rounded-full border border-[#E3E9EE] bg-[#F6F9FB] px-3 py-1 text-xs font-semibold text-[#5B8FA8]">
                Pilot week
              </span>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border border-[#E3E9EE]">
              <div className="hidden gap-3 bg-[#F6F9FB] px-4 py-3 text-xs font-semibold uppercase text-[#5B8FA8] sm:grid sm:grid-cols-[0.8fr_1.1fr_1fr]">
                <span>Member</span>
                <span>Signal</span>
                <span>Suggested next step</span>
              </div>
              {membersNeedingAttention.map((row) => (
                <div
                  key={`${row.member}-${row.signal}`}
                  className="grid grid-cols-1 gap-2 border-t border-[#E3E9EE] px-4 py-4 text-sm sm:grid-cols-[0.8fr_1.1fr_1fr] sm:gap-3"
                >
                  <span className="font-semibold text-[#1F2A33]">
                    {row.member}
                  </span>
                  <span className="text-[#5F6B75]">{row.signal}</span>
                  <span className="font-semibold text-[#1F2A33]">
                    {row.nextStep}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-[#5F6B75]">
              Example-only operator data. This page is not connected to storage,
              APIs, or live member records.
            </p>
          </section>
        </div>
      </section>

      <section className="border-t border-[#E3E9EE] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-16 sm:px-8 lg:flex-row lg:items-center lg:px-10">
          <div>
            <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
              Connect the views
            </span>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-[#1F2A33]">
              The admin view is a product wrapper around the live member engine.
            </h2>
          </div>
          <Link
            href="/gym-demo/member"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-lg bg-[#5B8FA8] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(91,143,168,0.24)] transition hover:-translate-y-px hover:bg-[#4E7F96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2"
          >
            Follow member journey
          </Link>
        </div>
      </section>
    </main>
  );
}
