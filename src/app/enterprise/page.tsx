import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Praxis for Gyms | Digital Coaching Infrastructure",
  description:
    "Praxis helps gyms support members with assessment-driven plans, guided sessions, and natural personal training pathways.",
};

const solutionCards = [
  {
    title: "Member assessment",
    body: "A structured entry point that captures goals, training context, discomfort, and confidence before a member starts guessing.",
  },
  {
    title: "Structured first-week plan",
    body: "A clear first week that turns intent into action with approachable sessions and sensible starting points.",
  },
  {
    title: "Guided sessions",
    body: "Members see what to do, why it matters, and how to complete each session without feeling stranded on the floor.",
  },
  {
    title: "Feedback-aware support",
    body: "Session feedback can shape the next recommendation so discomfort, difficulty, and uncertainty become usable signals.",
  },
  {
    title: "Personal training pathway",
    body: "Praxis can surface natural moments where a member would benefit from a trainer conversation or consultation.",
  },
  {
    title: "Trainer education layer",
    body: "Standardized cues, regressions, and movement notes help trainers and members work from the same coaching language.",
  },
];

const libraryItems = [
  "Exercise explanations",
  "Regressions",
  "Progressions",
  "Common compensations",
  "Trainer education",
  "Member guidance",
];

const memberFlowSteps = [
  "Assess",
  "Plan",
  "Coach",
  "Feedback",
  "Trainer path",
];

const pilotMetrics = [
  "Assessment completion",
  "First workout completion",
  "PT consult requests",
  "Member confidence feedback",
  "Trainer usefulness feedback",
];

export default function EnterprisePage() {
  return (
    <main className="min-h-screen bg-[#F6F9FB] text-[#5F6B75] [&_h1]:!text-[#1F2A33] [&_h2]:!text-[#1F2A33] [&_h3]:!text-[#1F2A33] [&_p]:!text-[#5F6B75]">
      <section className="relative overflow-hidden border-b border-[#E3E9EE] bg-white">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_10%,rgba(91,143,168,0.16),transparent_32%),radial-gradient(circle_at_88%_8%,rgba(31,42,51,0.08),transparent_30%)]" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col px-6 py-8 sm:px-8 lg:px-10">
          <header className="flex flex-wrap items-center justify-between gap-4 md:pr-28 lg:pr-32">
            <Link
              href="/"
              className="inline-flex h-9 w-[150px] items-center justify-center overflow-hidden rounded-lg border border-[#E3E9EE] bg-[#1F2A33] px-2 shadow-[0_12px_34px_rgba(31,42,51,0.12)] sm:h-10 sm:w-[180px] md:h-11 md:w-[210px] lg:h-12 lg:w-[240px] xl:h-14 xl:w-[270px]"
            >
              <Image
                src="/icons/praxis-logo-full.png"
                alt="Praxis"
                width={440}
                height={132}
                className="h-full w-full scale-[2.7] object-contain object-center sm:scale-[2.6] md:scale-[2.5] lg:scale-[2.4]"
                priority
              />
            </Link>
            <span className="rounded-full border border-[#E3E9EE] bg-[#F6F9FB] px-4 py-2 text-xs font-semibold uppercase text-[#5B8FA8]">
              Enterprise pilot
            </span>
          </header>

          <div className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.72fr)] lg:items-center lg:py-24">
            <div className="max-w-3xl">
              <span className="block text-sm font-semibold uppercase text-[#5B8FA8]">
                Praxis for Gyms
              </span>
              <h1 className="mt-5 text-4xl font-semibold leading-tight !text-[#1F2A33] sm:text-5xl lg:text-6xl">
                Digital coaching infrastructure for modern gyms.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 !text-[#5F6B75]">
                Praxis helps gyms turn unsure members into supported members with
                assessment-driven training plans, guided sessions, and natural
                personal training pathways.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/gym-demo/member"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#5B8FA8] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(91,143,168,0.28)] transition hover:-translate-y-px hover:bg-[#4E7F96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2"
                >
                  View member flow
                </Link>
                <Link
                  href="#pilot"
                  className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#E3E9EE] bg-white px-6 py-3 text-sm font-semibold text-[#1F2A33] transition hover:-translate-y-px hover:border-[#5B8FA8]/50 hover:text-[#5B8FA8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2"
                >
                  Explore pilot model
                </Link>
              </div>
            </div>

            <aside className="rounded-lg border border-[#E3E9EE] bg-white p-5 shadow-[0_22px_70px_rgba(31,42,51,0.08)] sm:p-6">
              <div className="rounded-lg bg-[#F6F9FB] p-5">
                <span className="block text-xs font-semibold uppercase text-[#5B8FA8]">
                  Member flow
                </span>
                <div className="mt-5 space-y-3">
                  {memberFlowSteps.map((step, index) => (
                    <div
                      key={step}
                      className="flex items-center gap-3 rounded-lg border border-[#E3E9EE] bg-white px-4 py-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5B8FA8]/10 text-xs font-semibold text-[#5B8FA8]">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-[#1F2A33]">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 !text-[#5F6B75]">
                A GoodLife-style pilot can start with a focused member segment,
                measure key conversion moments, and give teams practical insight
                before a broader rollout.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-b border-[#E3E9EE]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 sm:px-8 lg:grid-cols-[0.8fr_1fr] lg:px-10 lg:py-20">
          <span className="block text-sm font-semibold uppercase text-[#5B8FA8]">
            The member gap
          </span>
          <div>
            <h2 className="text-3xl font-semibold leading-tight !text-[#1F2A33] sm:text-4xl">
              Members do not only leave gyms because they lack access. They
              leave because they lack direction.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 !text-[#5F6B75]">
              Many members want to train consistently, but they do not know
              where to start, how to adjust around discomfort, or when to ask
              for help. A gym can have the right equipment, the right staff, and
              the right environment, yet still lose members in the moments where
              uncertainty quietly takes over.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="max-w-3xl">
            <span className="block text-sm font-semibold uppercase text-[#5B8FA8]">
              The coaching layer
            </span>
            <h2 className="mt-4 text-3xl font-semibold !text-[#1F2A33] sm:text-4xl">
              Structure for the moments before, during, and after a workout.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {solutionCards.map((card) => (
              <article
                key={card.title}
                className="rounded-lg border border-[#E3E9EE] bg-white p-6 shadow-[0_16px_45px_rgba(31,42,51,0.05)]"
              >
                <h3 className="text-lg font-semibold !text-[#1F2A33]">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-7 !text-[#5F6B75]">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#E3E9EE]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 sm:px-8 lg:grid-cols-[1fr_0.8fr] lg:px-10 lg:py-20">
          <div>
            <span className="block text-sm font-semibold uppercase text-[#5B8FA8]">
              Personal training pathway
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-tight !text-[#1F2A33] sm:text-4xl">
              Praxis does not replace trainers. It helps more members feel ready
              to meet them.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-8 !text-[#5F6B75]">
              The platform can identify moments where a member has enough
              context to understand why a trainer would help. That creates a
              warmer, more useful personal training pathway than a generic sales
              prompt.
            </p>
          </div>
          <div className="self-start rounded-lg border border-[#E3E9EE] bg-white p-6 shadow-[0_18px_55px_rgba(31,42,51,0.06)]">
            <span className="block text-xs font-semibold uppercase text-[#5B8FA8]">
              Example prompt
            </span>
            <blockquote className="mt-4 text-xl font-semibold leading-8 !text-[#1F2A33]">
              &quot;Based on your feedback, you may benefit from a
              complimentary movement consultation with a trainer.&quot;
            </blockquote>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[0.9fr_1fr] lg:px-10 lg:py-20">
          <div>
            <span className="block text-sm font-semibold uppercase text-[#5B8FA8]">
              Coaching library
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-tight !text-[#1F2A33] sm:text-4xl">
              A standardized coaching database owned by the gym.
            </h2>
            <p className="mt-6 text-base leading-8 !text-[#5F6B75]">
              Praxis can support a gym-owned video and cue library so members
              receive consistent guidance while trainers work from a shared
              education layer. The result is not just more content. It is a more
              coherent coaching system across clubs, trainers, and member
              experiences.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {libraryItems.map((item) => (
              <div
                key={item}
                className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] px-5 py-4 text-sm font-semibold text-[#1F2A33]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pilot" className="border-y border-[#E3E9EE]">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <span className="block text-sm font-semibold uppercase text-[#5B8FA8]">
                30-day pilot model
              </span>
              <h2 className="mt-4 text-3xl font-semibold leading-tight !text-[#1F2A33] sm:text-4xl">
                A focused GoodLife-style pilot before enterprise rollout.
              </h2>
              <p className="mt-6 text-base leading-8 !text-[#5F6B75]">
                Start with one club, one region, or one member segment. Keep the
                pilot narrow enough to learn quickly, but structured enough to
                measure whether digital coaching improves confidence, completion,
                and trainer engagement.
              </p>
            </div>
            <div className="rounded-lg border border-[#E3E9EE] bg-white p-6 shadow-[0_18px_55px_rgba(31,42,51,0.06)]">
              <h3 className="text-xl font-semibold !text-[#1F2A33]">
                What to measure
              </h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {pilotMetrics.map((metric) => (
                  <div
                    key={metric}
                    className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] px-4 py-4 text-sm font-semibold text-[#1F2A33]"
                  >
                    {metric}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#E3E9EE] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-16 sm:px-8 lg:flex-row lg:items-center lg:px-10 lg:py-20">
          <h2 className="max-w-4xl text-3xl font-semibold leading-tight !text-[#1F2A33] sm:text-4xl">
            Good gyms already have members, trainers, and facilities. Praxis
            connects them through structure.
          </h2>
          <Link
            href="/gym-demo/member"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-lg bg-[#5B8FA8] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(91,143,168,0.24)] transition hover:-translate-y-px hover:bg-[#4E7F96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2"
          >
            View member demo
          </Link>
        </div>
      </section>
    </main>
  );
}
