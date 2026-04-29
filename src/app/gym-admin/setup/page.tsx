import type { Metadata } from "next";
import Link from "next/link";
import B2BIcon, { type B2BIconName } from "@/components/gym-demo/B2BIcon";
import GymDemoHeader from "@/components/gym-demo/GymDemoHeader";
import { getActiveGymConfig } from "@/lib/gymSaas/gymConfig";

export const metadata: Metadata = {
  title: "Gym Setup | Praxis for Gyms",
  description:
    "Review the minimal Praxis for Gyms setup shell for gym identity, equipment profile, trainer handoff, and pilot reporting.",
};

const setupSections: Array<{
  title: string;
  status: "Ready for configuration" | "Not connected yet";
  body: string;
  details: string[];
  icon: B2BIconName;
}> = [
  {
    title: "Gym identity",
    status: "Ready for configuration",
    body: "Basic gym details that can later come from environment or database-backed configuration.",
    details: ["Gym name", "Location label", "Brand color"],
    icon: "system",
  },
  {
    title: "Equipment profile",
    status: "Ready for configuration",
    body: "A gym-floor profile for shaping member-facing guidance without changing the coaching engine.",
    details: ["Available equipment", "Floor profile", "Setup notes"],
    icon: "library",
  },
  {
    title: "Trainer handoff",
    status: "Ready for configuration",
    body: "Trainer contacts and consultation labels for routing member support moments.",
    details: ["Trainer contacts", "Consult label", "Support email"],
    icon: "handoff",
  },
  {
    title: "Pilot reporting",
    status: "Not connected yet",
    body: "Pilot settings for future dashboard reporting. The current page only reads static configuration.",
    details: ["Member segment", "Reporting cadence", "Dashboard connection"],
    icon: "metrics",
  },
];

export default function GymAdminSetupPage() {
  const config = getActiveGymConfig();

  return (
    <main className="gym-b2b-page min-h-screen bg-[#F6F9FB] text-[#5F6B75]">
      <section className="border-b border-[#E3E9EE] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <GymDemoHeader badge="Admin setup" />

          <div className="grid gap-8 pb-8 pt-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.58fr)] lg:items-end lg:pb-12">
            <div>
              <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
                Gym setup
              </span>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-[#1F2A33] sm:text-5xl lg:text-6xl">
                Configure the gym wrapper around the Praxis member engine.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5F6B75]">
                This setup shell defines the gym identity, equipment profile,
                trainer handoff, and pilot reporting contract without requiring
                a database or changing member program logic.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/gym-admin/dashboard"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#5B8FA8] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(91,143,168,0.24)] transition hover:-translate-y-px hover:bg-[#4E7F96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2"
                >
                  Go to Signal Dashboard
                </Link>
                <Link
                  href="/gym-demo"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#E3E9EE] bg-white px-6 py-3 text-sm font-semibold text-[#1F2A33] transition hover:-translate-y-px hover:border-[#5B8FA8]/50 hover:text-[#5B8FA8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2"
                >
                  Back to demo overview
                </Link>
              </div>
            </div>

            <aside className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] p-5">
              <span className="block text-xs font-semibold uppercase text-[#5B8FA8]">
                Active config
              </span>
              <h2 className="mt-3 text-2xl font-semibold text-[#1F2A33]">
                {config.gymName}
              </h2>
              <dl className="mt-5 grid gap-3 text-sm">
                <div className="rounded-lg border border-[#E3E9EE] bg-white px-4 py-3">
                  <dt className="font-semibold text-[#5B8FA8]">Location</dt>
                  <dd className="mt-1 text-[#1F2A33]">{config.locationLabel}</dd>
                </div>
                <div className="rounded-lg border border-[#E3E9EE] bg-white px-4 py-3">
                  <dt className="font-semibold text-[#5B8FA8]">Consult label</dt>
                  <dd className="mt-1 text-[#1F2A33]">{config.ptConsultLabel}</dd>
                </div>
                <div className="rounded-lg border border-[#E3E9EE] bg-white px-4 py-3">
                  <dt className="font-semibold text-[#5B8FA8]">Pilot</dt>
                  <dd className="mt-1 text-[#1F2A33]">
                    {config.pilotSettings.pilotLabel}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-4 md:grid-cols-2">
          {setupSections.map((section) => (
            <article
              key={section.title}
              className="rounded-lg border border-[#E3E9EE] bg-white p-6 shadow-[0_16px_45px_rgba(31,42,51,0.05)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#5B8FA8]/25 bg-[#F6F9FB] text-[#5B8FA8]">
                  <B2BIcon name={section.icon} className="h-5 w-5" />
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    section.status === "Ready for configuration"
                      ? "border-[#5B8FA8]/25 bg-[#5B8FA8]/10 text-[#5B8FA8]"
                      : "border-[#E3E9EE] bg-[#F6F9FB] text-[#5F6B75]"
                  }`}
                >
                  {section.status}
                </span>
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-[#1F2A33]">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#5F6B75]">
                {section.body}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {section.details.map((detail) => (
                  <span
                    key={detail}
                    className="rounded-full border border-[#E3E9EE] bg-[#F6F9FB] px-3 py-1 text-xs font-semibold text-[#1F2A33]"
                  >
                    {detail}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
