import type { Metadata } from "next";
import Link from "next/link";
import B2BIcon, { type B2BIconName } from "@/components/gym-demo/B2BIcon";
import GymDemoHeader from "@/components/gym-demo/GymDemoHeader";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Praxis for Gyms | Local Gym Pilot",
  description:
    "Praxis for Gyms is a pilot-ready coaching layer for member onboarding, guided first-week plans, trainer consultation pathways, and operator awareness signals.",
};

const journeySteps: Array<{
  title: string;
  body: string;
  label: string;
  icon: B2BIconName;
}> = [
  {
    title: "Assess",
    body: "Capture goals, experience, schedule, equipment access, discomfort, and confidence before the member starts guessing.",
    label: "Member onboarding",
    icon: "assessment",
  },
  {
    title: "Plan",
    body: "Create a guided first-week plan with approachable sessions and clear starting points.",
    label: "First week",
    icon: "plan",
  },
  {
    title: "Coach",
    body: "Show exercise intent, movement cues, substitutions, and feedback moments inside the workout flow.",
    label: "Guided session",
    icon: "coach",
  },
  {
    title: "Refer",
    body: "Surface a trainer consultation pathway when member context suggests a human coach would help.",
    label: "Trainer pathway",
    icon: "handoff",
  },
];

const needCards: Array<{
  title: string;
  body: string;
  icon: B2BIconName;
}> = [
  {
    title: "Members need direction early",
    body: "A gym can have the right staff and equipment while new members still feel unsure about what to do first.",
    icon: "assessment",
  },
  {
    title: "Trainers need useful context",
    body: "A consultation is warmer when it is based on goals, discomfort, confidence, and completion signals.",
    icon: "handoff",
  },
  {
    title: "Operators need readable member attention signals",
    body: "A focused pilot gives operators clearer context around activation, completion, confidence, and member attention signals before rollout decisions.",
    icon: "metrics",
  },
];


const signalLayerCards: Array<{
  title: string;
  body: string;
  icon: B2BIconName;
}> = [
  {
    title: "Listen",
    body: "Members share goals, schedule, experience, discomfort areas, and post-session feedback inside the guided flow.",
    icon: "assessment",
  },
  {
    title: "Interpret",
    body: "The Praxis engine turns those inputs into structured plans, readiness cues, and operator signals instead of leaving feedback scattered.",
    icon: "system",
  },
  {
    title: "Act",
    body: "Trainers and staff can see calm next steps: check in, offer a walkthrough, support a restart, or encourage the next session.",
    icon: "handoff",
  },
  {
    title: "Grow",
    body: "Every signal becomes context a gym can review as it learns what support members respond to during a pilot.",
    icon: "metrics",
  },
];
const dashboardMetrics: Array<{
  label: string;
  value: string;
  detail: string;
  progress: number;
  icon: B2BIconName;
}> = [
  {
    label: "Assessments completed",
    value: "124",
    detail: "Member onboarding",
    progress: 84,
    icon: "assessment",
  },
  {
    label: "First workouts completed",
    value: "91",
    detail: "Guided plan activation",
    progress: 73,
    icon: "plan",
  },
  {
    label: "Trainer consult requests",
    value: "18",
    detail: "Trainer pathway",
    progress: 46,
    icon: "handoff",
  },
  {
    label: "Confidence feedback",
    value: "4.3/5",
    detail: "Example score",
    progress: 68,
    icon: "metrics",
  },
];

const attentionRows = [
  {
    member: "Maya C.",
    signal: "Low confidence after first lower-body session",
    nextStep: "Coach check-in",
  },
  {
    member: "Jordan P.",
    signal: "Assessment complete and requested form review",
    nextStep: "Trainer consult",
  },
  {
    member: "Samira R.",
    signal: "Missed second guided workout",
    nextStep: "Guided restart",
  },
];

const pilotMeasures: Array<{
  title: string;
  body: string;
  icon: B2BIconName;
}> = [
  {
    title: "Member onboarding",
    body: "Assessment completion and first plan creation inside a defined member segment.",
    icon: "assessment",
  },
  {
    title: "Guided first-week plan",
    body: "First workout completion, session feedback, and confidence movement.",
    icon: "plan",
  },
  {
    title: "Trainer consultation pathway",
    body: "Consult requests, check-in prompts, and member context available for staff review.",
    icon: "handoff",
  },
  {
    title: "Operator dashboard",
    body: "Member attention signals and trainer handoff context presented as a weekly operating view.",
    icon: "dashboard",
  },
  {
    title: "Coaching library",
    body: "Reusable exercise cues, regressions, progressions, and coaching language for member guidance.",
    icon: "library",
  },
  {
    title: "Pilot readout",
    body: "A concise review of what changed, what did not, and what a gym operator may test next.",
    icon: "pilot",
  },
];

const demoRoutes: Array<{
  title: string;
  body: string;
  href: string;
  cta: string;
  icon: B2BIconName;
}> = [
  {
    title: "Demo Overview",
    body: "See how the member demo and Admin Preview connect inside the pilot walkthrough.",
    href: "/gym-demo",
    cta: "Open overview",
    icon: "system",
  },
  {
    title: "Member Demo",
    body: "Walk through member onboarding, the guided first-week plan, and the live member flow.",
    href: "/gym-demo/member",
    cta: "View member demo",
    icon: "coach",
  },
  {
    title: "Admin Preview",
    body: "Review example member attention signals, confidence feedback, and trainer handoff context.",
    href: "/gym-demo/admin",
    cta: "View admin preview",
    icon: "dashboard",
  },
];

function ConnectedSystemVisual() {
  const nodes: Array<{ title: string; detail: string; icon: B2BIconName }> = [
    {
      title: "Member App",
      detail: "Assessment, plan, guided workouts",
      icon: "assessment",
    },
    {
      title: "Trainer Pathway",
      detail: "Context, prompts, consultation",
      icon: "handoff",
    },
    {
      title: "Operator View",
      detail: "Pilot metrics, attention signals",
      icon: "dashboard",
    },
  ];

  return (
    <aside className="relative mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none">
      <div className="absolute -right-3 top-5 hidden h-full w-full rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] shadow-[0_24px_70px_rgba(31,42,51,0.08)] sm:block" />
      <div className="relative overflow-hidden rounded-lg border border-[#E3E9EE] bg-white p-4 shadow-[0_28px_80px_rgba(31,42,51,0.12)] sm:p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(91,143,168,0.14),transparent_34%),radial-gradient(circle_at_86%_10%,rgba(31,42,51,0.08),transparent_34%)]" />
        <div className="relative rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] p-4 sm:p-5">
          <span className="block text-xs font-semibold uppercase text-[#5B8FA8]">
            Connected coaching system
          </span>
          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_40px_1fr_40px_1fr] lg:items-center">
            {nodes.map((node, index) => (
              <div key={node.title} className="contents">
                <div className="rounded-lg border border-[#E3E9EE] bg-white p-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#5B8FA8]/25 bg-[#F6F9FB] text-[#5B8FA8]">
                    <B2BIcon name={node.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-[#1F2A33]">
                    {node.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#5F6B75]">
                    {node.detail}
                  </p>
                </div>
                {index < nodes.length - 1 ? (
                  <svg
                    viewBox="0 0 40 18"
                    className="mx-auto hidden h-6 w-10 text-[#5B8FA8] lg:block"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 9h29"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2"
                    />
                    <path
                      d="m27 4 7 5-7 5"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-[#E3E9EE] bg-white px-4 py-3 text-xs font-semibold uppercase text-[#5B8FA8]">
            Member App -&gt; Trainer Pathway -&gt; Operator View
          </div>
        </div>
      </div>
    </aside>
  );
}

function OperatorDashboardPreview() {
  return (
    <aside className="rounded-lg border border-[#E3E9EE] bg-white p-4 shadow-[0_18px_55px_rgba(31,42,51,0.07)] sm:p-5">
      <div className="flex flex-col gap-4 border-b border-[#E3E9EE] pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="block text-xs font-semibold uppercase text-[#5B8FA8]">
            Operator dashboard
          </span>
          <h3 className="mt-2 flex items-center gap-3 text-xl font-semibold text-[#1F2A33]">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#5B8FA8]/25 bg-[#F6F9FB] text-[#5B8FA8]">
              <B2BIcon name="dashboard" className="h-5 w-5" />
            </span>
            Pilot metrics snapshot
          </h3>
        </div>
        <span className="w-fit rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] px-3 py-2 text-xs font-semibold uppercase text-[#5B8FA8]">
          Demo data
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {dashboardMetrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#5B8FA8]/25 bg-white text-[#5B8FA8]">
                <B2BIcon name={metric.icon} className="h-4 w-4" />
              </span>
              <span className="text-right text-[0.68rem] font-semibold uppercase text-[#5B8FA8]">
                {metric.label}
              </span>
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <span className="text-3xl font-semibold text-[#1F2A33]">
                {metric.value}
              </span>
              <span className="text-right text-xs font-semibold text-[#5F6B75]">
                {metric.detail}
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E3E9EE]">
              <div
                className="h-full rounded-full bg-[#5B8FA8]"
                style={{ width: `${metric.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {attentionRows.map((row) => (
          <div
            key={row.member}
            className="rounded-lg border border-[#E3E9EE] bg-white p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-semibold text-[#1F2A33]">
                {row.member}
              </span>
              <span className="w-fit rounded-full border border-[#5B8FA8]/25 bg-[#F6F9FB] px-3 py-1 text-xs font-semibold text-[#5B8FA8]">
                {row.nextStep}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#5F6B75]">
              {row.signal}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-5 text-[#5F6B75]">
        Dashboard values and progress bars are mock demo data until connected to a live gym deployment.
      </p>
    </aside>
  );
}

export default function PilotPage() {
  return (
    <main className="gym-b2b-page min-h-screen bg-[#F6F9FB] text-[#5F6B75]">
      <section className="relative overflow-hidden border-b border-[#E3E9EE] bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(246,249,251,0.92)_0%,rgba(255,255,255,1)_54%,rgba(246,249,251,0.78)_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(91,143,168,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(91,143,168,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col px-5 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-8">
          <GymDemoHeader activeHref="/pilot" badge="Local gym pilot" />

          <div className="grid gap-8 pb-10 pt-8 sm:gap-10 sm:pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(390px,0.82fr)] lg:items-center lg:pb-16 lg:pt-14">
            <div className="max-w-3xl">
              <span className="block text-sm font-semibold uppercase text-[#5B8FA8]">
                Praxis for Gyms
              </span>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-[#1F2A33] sm:text-5xl lg:text-6xl">
                A digital coaching layer for local gym pilots.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#5F6B75] sm:text-lg sm:leading-8">
                Praxis for Gyms can help operators test better member
                onboarding, a guided first-week plan, a trainer consultation
                pathway, and an operator dashboard before scaling beyond a
                focused member segment.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/gym-demo"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#5B8FA8] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(91,143,168,0.28)] transition hover:-translate-y-px hover:bg-[#4E7F96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2 sm:w-auto"
                >
                  Start the demo
                </Link>
                <Link
                  href="/gym-demo/member"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-[#E3E9EE] bg-white px-6 py-3 text-sm font-semibold text-[#1F2A33] transition hover:-translate-y-px hover:border-[#5B8FA8]/50 hover:text-[#5B8FA8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2 sm:w-auto"
                >
                  View member journey
                </Link>
              </div>
            </div>

            <ConnectedSystemVisual />
          </div>
        </div>
      </section>

      <section className="bg-[#F6F9FB]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1fr] lg:items-start">
            <div>
              <span className="block text-sm font-semibold uppercase text-[#5B8FA8]">
                Why gyms need it
              </span>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#1F2A33] sm:text-4xl">
                The early member experience needs more than access.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#5F6B75]">
                A local gym pilot is designed to test whether clearer direction,
                shared coaching language, and timely trainer prompts can improve
                the first weeks of membership.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {needCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-lg border border-[#E3E9EE] bg-white p-5 shadow-[0_14px_40px_rgba(31,42,51,0.05)]"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#5B8FA8]/25 bg-[#F6F9FB] text-[#5B8FA8]">
                    <B2BIcon name={card.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-[#1F2A33]">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#5F6B75]">
                    {card.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#E3E9EE] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-start">
            <div>
              <span className="block text-sm font-semibold uppercase text-[#5B8FA8]">
                Signal layer
              </span>
              <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#1F2A33] sm:text-4xl">
                An operating nervous system for the member experience.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#5F6B75]">
                Praxis listens to member inputs and workout check-ins,
                translates them through a structured coaching engine, and gives
                gym staff clearer signals about where support, encouragement,
                or trainer review may help.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {signalLayerCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] p-5"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#5B8FA8]/25 bg-white text-[#5B8FA8]">
                    <B2BIcon name={card.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-[#1F2A33]">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#5F6B75]">
                    {card.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-[#E3E9EE] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
          <div className="max-w-3xl">
            <span className="block text-sm font-semibold uppercase text-[#5B8FA8]">
              Member journey
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#1F2A33] sm:text-4xl">
              From member onboarding to a trainer consultation pathway.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#5F6B75]">
              The demo shows how a member can move from intake to a guided
              first-week plan while the gym keeps coaching context visible.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {journeySteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#5B8FA8]/25 bg-white text-[#5B8FA8]">
                    <B2BIcon name={step.icon} className="h-5 w-5" />
                  </span>
                  <span className="rounded-full border border-[#E3E9EE] bg-white px-2.5 py-1 text-xs font-semibold text-[#5B8FA8]">
                    {index + 1}
                  </span>
                </div>
                <span className="mt-4 block text-xs font-semibold uppercase text-[#5B8FA8]">
                  {step.label}
                </span>
                <h3 className="mt-2 text-xl font-semibold text-[#1F2A33]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#5F6B75]">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F6F9FB]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-6 sm:py-14 lg:grid-cols-[0.78fr_1fr] lg:items-center lg:px-10 lg:py-16">
          <div>
            <span className="block text-sm font-semibold uppercase text-[#5B8FA8]">
              Operator dashboard
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#1F2A33] sm:text-4xl">
              A pilot view for operator awareness and member attention signals.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#5F6B75]">
              The operator dashboard is designed to show operator awareness,
              confidence feedback, trainer consult requests, and practical
              staff-facing support signals without pretending the demo is live
              data.
            </p>
          </div>
          <OperatorDashboardPreview />
        </div>
      </section>

      <section className="border-y border-[#E3E9EE] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
          <div className="max-w-3xl">
            <span className="block text-sm font-semibold uppercase text-[#5B8FA8]">
              What the pilot measures
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#1F2A33] sm:text-4xl">
              A focused readout before a regional pilot or broader rollout.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#5F6B75]">
              The pilot measures whether the coaching library, guided plan, and
              trainer pathway create enough useful signal for a gym operator to
              decide what to test next.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pilotMeasures.map((measure) => (
              <article
                key={measure.title}
                className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] p-5"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#5B8FA8]/25 bg-white text-[#5B8FA8]">
                  <B2BIcon name={measure.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[#1F2A33]">
                  {measure.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#5F6B75]">
                  {measure.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F6F9FB]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
          <div className="max-w-3xl">
            <span className="block text-sm font-semibold uppercase text-[#5B8FA8]">
              Start the demo
            </span>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#1F2A33] sm:text-4xl">
              Review the connected buyer experience.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#5F6B75]">
              Start with the overview, follow the member journey, or review the
              Admin Preview with example member attention signals.
            </p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {demoRoutes.map((route) => (
              <article
                key={route.title}
                className="flex min-h-[248px] flex-col justify-between rounded-lg border border-[#E3E9EE] bg-white p-6 shadow-[0_16px_45px_rgba(31,42,51,0.05)]"
              >
                <div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#5B8FA8]/25 bg-[#F6F9FB] text-[#5B8FA8]">
                    <B2BIcon name={route.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-[#1F2A33]">
                    {route.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#5F6B75]">
                    {route.body}
                  </p>
                </div>
                <Link
                  href={route.href}
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#5B8FA8] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(91,143,168,0.22)] transition hover:-translate-y-px hover:bg-[#4E7F96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8FA8] focus-visible:ring-offset-2"
                >
                  {route.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
