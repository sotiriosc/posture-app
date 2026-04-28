import Link from "next/link";
import { demoGym, gymSaasDemoCopy } from "@/lib/gymSaas/demoGym";

const valueCards = [
  {
    title: "Members",
    copy: demoGym.memberPromise,
    points: ["guided workouts", "smart substitutions", "clear progression"],
  },
  {
    title: "Owners",
    copy: demoGym.ownerPromise,
    points: ["retention", "trial conversion", "facility confidence"],
  },
  {
    title: "Trainers",
    copy: demoGym.trainerPromise,
    points: ["shared standards", "consistent cues", "education-first PT bridge"],
  },
];

export default function GymDemoPage() {
  return (
    <main className="min-h-screen bg-[#F6F9FB] text-[#1F2A33]">
      <section className="border-b border-[#E3E9EE] bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:py-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B8FA8]">
              Praxis for Gyms · Local SaaS Demo
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              {gymSaasDemoCopy.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5F6B75]">
              {gymSaasDemoCopy.subheadline}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex h-12 items-center justify-center rounded-full bg-[#5B8FA8] px-6 text-sm font-semibold text-white" href="/gym-demo/member">
                Preview member app
              </Link>
              <Link className="inline-flex h-12 items-center justify-center rounded-full border border-[#C9D6DD] bg-white px-6 text-sm font-semibold" href="/gym-demo/admin">
                Preview owner dashboard
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#5F6B75]">
              <a href="#member-preview" className="font-medium text-[#5B8FA8]">Sample plan</a>
              <a href="#owner-value" className="font-medium text-[#5B8FA8]">Value props</a>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-[#E3E9EE] bg-[#F6F9FB] p-5 shadow-sm">
            <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5B8FA8]">Demo gym</p>
              <h2 className="mt-3 text-2xl font-semibold">{demoGym.name}</h2>
              <p className="mt-2 text-sm text-[#5F6B75]">{demoGym.location}</p>
              <p className="mt-5 text-sm leading-6 text-[#5F6B75]">{demoGym.positioning}</p>
            </div>
          </aside>
        </div>
      </section>

      <section id="owner-value" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {valueCards.map((card) => (
            <article key={card.title} className="rounded-[1.5rem] border border-[#E3E9EE] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#5F6B75]">{card.copy}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {card.points.map((point) => (
                  <span key={point} className="rounded-full border border-[#E3E9EE] bg-[#F6F9FB] px-3 py-1 text-xs font-medium text-[#5F6B75]">
                    {point}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#E3E9EE] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:py-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5B8FA8]">Equipment inventory</p>
            <h2 className="mt-3 text-3xl font-semibold">Programs respect the actual floor.</h2>
            <p className="mt-4 text-base leading-7 text-[#5F6B75]">
              The gym adds its equipment map once. Praxis then builds plans that use what the member can actually access.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {demoGym.equipment.map((item) => (
              <div key={item.name} className="rounded-[1.25rem] border border-[#E3E9EE] bg-[#F6F9FB] p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold">{item.name}</h3>
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-[#5B8FA8]">{item.quantity}</span>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[#5F6B75]">{item.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="member-preview" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5B8FA8]">Member plan preview</p>
          <h2 className="mt-3 text-3xl font-semibold">A simple plan a gym could send to a trial member.</h2>
          <p className="mt-4 text-base leading-7 text-[#5F6B75]">
            This demo proves the wedge: onboarding, equipment-aware workouts, trainer-consistent education, and clear next steps.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {demoGym.sampleProgram.map((day) => (
            <article key={day.day} className="rounded-[1.5rem] border border-[#E3E9EE] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-[#F6F9FB] px-3 py-1 text-xs font-semibold text-[#5B8FA8]">{day.day}</span>
                <span className="text-sm text-[#5F6B75]">{day.duration}</span>
              </div>
              <h3 className="mt-5 text-xl font-semibold">{day.focus}</h3>
              <p className="mt-3 text-sm font-medium text-[#5F6B75]">Uses: {day.equipment.join(", ")}</p>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-[#5F6B75]">
                {day.blocks.map((block) => (
                  <li key={block}>• {block}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#1F2A33] px-5 py-12 text-white sm:px-8 lg:py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A9C8D7]">Enterprise direction later</p>
            <h2 className="mt-3 text-3xl font-semibold">The bigger version trains trainers, not just members.</h2>
            <p className="mt-4 text-base leading-7 text-slate-200">
              For larger gyms, Praxis can become a consistency layer: trainer education, shared coaching standards, client-facing lessons, and honest guidance toward personal training when a member needs more support.
            </p>
          </div>
          <Link href="/" className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#1F2A33]">
            Back to Praxis
          </Link>
        </div>
      </section>
    </main>
  );
}
