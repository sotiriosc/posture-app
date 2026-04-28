import type { Metadata } from "next";
import Link from "next/link";
import GymDemoHeader from "@/components/gym-demo/GymDemoHeader";

export const metadata: Metadata = {
  title: "Member Demo | Praxis for Gyms",
  description:
    "See how a gym member moves through assessment, profile, plan, session guidance, feedback, and trainer pathways.",
};

const journeySteps = [
  {
    title: "1. Member starts with context",
    body: "A member enters goals, experience, schedule, equipment access, discomfort, and confidence signals before starting a plan.",
  },
  {
    title: "2. Optional movement baseline",
    body: "The assessment route can capture posture and movement inputs that help the coaching engine shape corrective focus.",
  },
  {
    title: "3. First-week plan",
    body: "Praxis generates a structured week that gives the member a clear starting point instead of leaving them to guess.",
  },
  {
    title: "4. Guided session",
    body: "The session flow shows movement cues, set tracking, timer support, feedback capture, and safer adjustment paths.",
  },
  {
    title: "5. Feedback creates support moments",
    body: "Difficulty, discomfort, and confidence feedback can inform the next recommendation and surface trainer consult opportunities.",
  },
  {
    title: "6. Trainer pathway",
    body: "Members can be guided toward a complimentary movement consultation when the context makes that handoff useful.",
  },
];

export default function GymDemoMemberPage() {
  return (
    <main className="min-h-screen bg-[#F6F9FB] text-[#5F6B75]">
      <section className="border-b border-[#E3E9EE] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <GymDemoHeader activeHref="/gym-demo/member" />

          <div className="max-w-4xl py-10 lg:py-14">
            <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
              Member-flow demo
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
                href="/assessment"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#5B8FA8] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(91,143,168,0.28)] transition hover:-translate-y-px hover:bg-[#4E7F96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2"
              >
                Launch member assessment
              </Link>
              <Link
                href="/questionnaire"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#E3E9EE] bg-white px-6 py-3 text-sm font-semibold text-[#1F2A33] transition hover:-translate-y-px hover:border-[#5B8FA8]/50 hover:text-[#5B8FA8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2"
              >
                Continue to member profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {journeySteps.map((step) => (
            <article
              key={step.title}
              className="rounded-lg border border-[#E3E9EE] bg-white p-6 shadow-[0_16px_45px_rgba(31,42,51,0.05)]"
            >
              <h2 className="text-xl font-semibold text-[#1F2A33]">
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
              The next click starts the existing Praxis member engine.
            </h2>
          </div>
          <Link
            href="/assessment"
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-lg bg-[#5B8FA8] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(91,143,168,0.24)] transition hover:-translate-y-px hover:bg-[#4E7F96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2"
          >
            Continue into the assessment
          </Link>
        </div>
      </section>
    </main>
  );
}
