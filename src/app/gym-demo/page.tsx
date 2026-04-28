import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gym Demo | Praxis for Gyms",
  description:
    "Explore the Praxis for Gyms pilot demo for member onboarding, operator metrics, and personal training pathways.",
};

const demoCards = [
  {
    title: "Member flow",
    body: "Walk through how a new or unsure member moves from assessment to profile, first plan, guided session, and feedback.",
    href: "/gym-demo/member",
    cta: "View member demo",
  },
  {
    title: "Operator view",
    body: "Review the pilot metrics a gym team would use to understand activation, completion, confidence, and trainer handoffs.",
    href: "/gym-demo/admin",
    cta: "View admin demo",
  },
  {
    title: "PT pathway",
    body: "See how member feedback can create warmer trainer consult moments without making trainers feel replaced.",
    href: "/enterprise#pilot",
    cta: "Explore pilot model",
  },
];

const proofPoints = [
  "Assessment-driven onboarding",
  "Structured first-week plan",
  "Guided session support",
  "Feedback-aware trainer prompts",
  "Pilot metrics for club teams",
  "Standardized coaching education",
];

export default function GymDemoPage() {
  return (
    <main className="min-h-screen bg-[#F6F9FB] text-[#5F6B75]">
      <section className="border-b border-[#E3E9EE] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-14 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/enterprise"
              className="text-sm font-semibold uppercase text-[#5B8FA8]"
            >
              Praxis for Gyms
            </Link>
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                href="/gym-demo/member"
                className="rounded-lg border border-[#E3E9EE] bg-white px-4 py-2 font-semibold text-[#1F2A33] transition hover:border-[#5B8FA8]/50 hover:text-[#5B8FA8]"
              >
                Member demo
              </Link>
              <Link
                href="/gym-demo/admin"
                className="rounded-lg border border-[#E3E9EE] bg-white px-4 py-2 font-semibold text-[#1F2A33] transition hover:border-[#5B8FA8]/50 hover:text-[#5B8FA8]"
              >
                Admin demo
              </Link>
            </nav>
          </header>

          <div className="grid gap-10 pb-10 pt-6 lg:grid-cols-[1fr_0.76fr] lg:items-end lg:pb-16 lg:pt-12">
            <div>
              <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
                Demo hub
              </span>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-[#1F2A33] sm:text-5xl lg:text-6xl">
                A working pilot view of Praxis for Gyms.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5F6B75]">
                Explore how the Praxis coaching engine can support member
                onboarding, guided training, personal training pathways, and
                standardized coaching education inside a gym SaaS product.
              </p>
            </div>
            <div className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] p-6">
              <p className="text-sm font-semibold text-[#1F2A33]">
                Pilot concept
              </p>
              <p className="mt-3 text-sm leading-7 text-[#5F6B75]">
                Start with one club, one region, or one member segment. Measure
                member activation, first-workout completion, trainer consult
                requests, and coaching usefulness before expanding rollout.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-4 lg:grid-cols-3">
          {demoCards.map((card) => (
            <article
              key={card.title}
              className="flex min-h-[260px] flex-col justify-between rounded-lg border border-[#E3E9EE] bg-white p-6 shadow-[0_16px_45px_rgba(31,42,51,0.05)]"
            >
              <div>
                <h2 className="text-2xl font-semibold text-[#1F2A33]">
                  {card.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#5F6B75]">
                  {card.body}
                </p>
              </div>
              <Link
                href={card.href}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#5B8FA8] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(91,143,168,0.22)] transition hover:-translate-y-px hover:bg-[#4E7F96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2"
              >
                {card.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#E3E9EE] bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[0.8fr_1fr] lg:px-10 lg:py-20">
          <div>
            <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
              What this demo proves
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#1F2A33] sm:text-4xl">
              The member experience and club operating model can be shown
              together.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#5F6B75]">
              The member flow remains the working Praxis engine. The gym demo
              wraps that engine with buyer-facing context so clubs can evaluate
              the product as infrastructure, not just a consumer app.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {proofPoints.map((point) => (
              <div
                key={point}
                className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] px-5 py-4 text-sm font-semibold text-[#1F2A33]"
              >
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
