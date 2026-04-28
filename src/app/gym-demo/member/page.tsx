import Link from "next/link";
import { demoGym } from "@/lib/gymSaas/demoGym";

const profileInputs = [
  "Goal: build strength and confidence",
  "Experience: beginner to intermediate",
  "Schedule: 3 days per week",
  "Preference: machines and dumbbells",
  "Limitations: wants shoulder and lower-back friendly options",
];

const educationCards = [
  {
    title: "Why this starts with control",
    copy: "The first block helps the member feel rib, shoulder, and hip position before loading heavier patterns.",
  },
  {
    title: "Why substitutions matter",
    copy: "If a station is busy, the app can keep the same movement goal while swapping the tool.",
  },
  {
    title: "Why trainers still matter",
    copy: "The app builds consistency, then clearly shows when hands-on coaching would improve execution.",
  },
];

export default function GymMemberDemoPage() {
  return (
    <main className="min-h-screen bg-[#F6F9FB] text-[#1F2A33]">
      <section className="border-b border-[#E3E9EE] bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/gym-demo" className="text-sm font-semibold text-[#5B8FA8]">
            ← Back to gym demo
          </Link>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#5B8FA8]">
            Member experience preview
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl">
            A trial member gets a plan that matches this gym, not a random template.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5F6B75]">
            This is the member-facing wedge: quick onboarding, plan generation around the facility, clear cues, and education that builds trust.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-[1.5rem] border border-[#E3E9EE] bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5B8FA8]">Onboarding snapshot</p>
          <h2 className="mt-2 text-2xl font-semibold">Member profile</h2>
          <div className="mt-6 space-y-3">
            {profileInputs.map((input) => (
              <div key={input} className="rounded-[1.25rem] border border-[#E3E9EE] bg-[#F6F9FB] p-4 text-sm text-[#5F6B75]">
                {input}
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-[1.5rem] border border-[#E3E9EE] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5B8FA8]">Generated plan</p>
                <h2 className="mt-2 text-2xl font-semibold">{demoGym.name} starter week</h2>
              </div>
              <span className="rounded-full bg-[#F6F9FB] px-3 py-1 text-xs font-semibold text-[#5F6B75]">
                3 days · equipment aware
              </span>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {demoGym.sampleProgram.map((day) => (
                <article key={day.day} className="rounded-[1.25rem] border border-[#E3E9EE] bg-[#F6F9FB] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#5B8FA8]">{day.day}</span>
                    <span className="text-xs text-[#5F6B75]">{day.duration}</span>
                  </div>
                  <h3 className="mt-4 font-semibold">{day.focus}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#5F6B75]">Uses {day.equipment.join(", ")}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[#E3E9EE] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5B8FA8]">Education layer</p>
            <h2 className="mt-2 text-2xl font-semibold">The app explains the training instead of hiding it.</h2>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {educationCards.map((card) => (
                <div key={card.title} className="rounded-[1.25rem] border border-[#E3E9EE] bg-[#F6F9FB] p-4">
                  <h3 className="font-semibold">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#5F6B75]">{card.copy}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
