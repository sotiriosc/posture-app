import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin Demo | Praxis for Gyms",
  description:
    "Preview a mock gym operator dashboard for Praxis for Gyms pilot metrics and trainer pathway signals.",
};

const metricCards = [
  { label: "Assessments completed", value: "124", note: "Pilot member segment" },
  { label: "First workouts completed", value: "82", note: "Activation signal" },
  { label: "PT consult requests", value: "19", note: "Trainer pathway" },
  { label: "Member confidence feedback", value: "4.3/5", note: "Post-session average" },
  { label: "Trainer usefulness feedback", value: "91%", note: "Staff-reported helpful" },
];

const operatorSections = [
  {
    title: "Member activation",
    body: "Track whether members move from assessment to first plan and first workout.",
  },
  {
    title: "Support signals",
    body: "Identify uncertainty, discomfort, skipped sessions, and low-confidence feedback before members drift.",
  },
  {
    title: "Trainer handoffs",
    body: "Surface members who may benefit from a complimentary movement consultation or PT conversation.",
  },
  {
    title: "Coaching consistency",
    body: "Standardize exercise explanations, regressions, progressions, and common compensation cues.",
  },
];

export default function GymDemoAdminPage() {
  return (
    <main className="min-h-screen bg-[#F6F9FB] text-[#5F6B75]">
      <section className="border-b border-[#E3E9EE] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/gym-demo"
              className="text-sm font-semibold uppercase text-[#5B8FA8]"
            >
              Gym demo
            </Link>
            <Link
              href="/gym-demo/member"
              className="rounded-lg border border-[#E3E9EE] bg-white px-4 py-2 text-sm font-semibold text-[#1F2A33] transition hover:border-[#5B8FA8]/50 hover:text-[#5B8FA8]"
            >
              View member demo
            </Link>
          </header>

          <div className="grid gap-10 py-14 lg:grid-cols-[0.82fr_1fr] lg:items-end lg:py-20">
            <div>
              <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
                Mock operator dashboard
              </span>
              <h1 className="mt-5 text-4xl font-semibold leading-tight text-[#1F2A33] sm:text-5xl lg:text-6xl">
                Pilot metrics for club teams.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5F6B75]">
                This static dashboard shows the kinds of activation, confidence,
                and trainer-pathway signals a gym could review during a 30-day
                Praxis pilot.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {metricCards.map((metric) => (
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
        <div className="grid gap-4 md:grid-cols-2">
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
