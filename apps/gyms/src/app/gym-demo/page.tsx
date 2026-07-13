import type { Metadata } from "next";
import Link from "next/link";
import B2BIcon, { type B2BIconName } from "@/components/gym-demo/B2BIcon";
import GymDemoHeader from "@/components/gym-demo/GymDemoHeader";
import {
  gymDemoCards,
  gymDemoPilotConcept,
} from "@/lib/gymSaas/demoData";

export const metadata: Metadata = {
  title: "Demo Overview | Praxis for Gyms",
  description:
    "Choose the member demo, Admin Preview, or Pilot page in the Praxis for Gyms buyer demo.",
};

const demoCardIcons: B2BIconName[] = ["coach", "dashboard", "pilot"];

export default function GymDemoPage() {
  return (
    <main className="gym-b2b-page min-h-screen bg-[#F6F9FB] text-[#5F6B75]">
      <section className="border-b border-[#E3E9EE] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <GymDemoHeader activeHref="/gym-demo" />

          <div className="grid gap-8 pb-8 pt-2 lg:grid-cols-[1fr_0.76fr] lg:items-end lg:pb-12 lg:pt-8">
            <div>
              <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
                Demo Overview
              </span>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-[#1F2A33] sm:text-5xl lg:text-6xl">
                Choose a path through the connected demo.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5F6B75]">
                Use this page to move quickly between the member journey, the
                Admin Preview, and the main Pilot page.
              </p>
            </div>
            <div className="rounded-lg border border-[#E3E9EE] bg-[#F6F9FB] p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#5B8FA8]/30 bg-white text-[#5B8FA8]">
                <B2BIcon name="pilot" className="h-5 w-5" />
              </span>
              <p className="mt-4 text-sm font-semibold text-[#1F2A33]">
                {gymDemoPilotConcept.title}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#5F6B75]">
                {gymDemoPilotConcept.body}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-4 lg:grid-cols-3">
          {gymDemoCards.map((card, index) => (
            <article
              key={card.title}
              className="flex min-h-[260px] flex-col justify-between rounded-lg border border-[#E3E9EE] bg-white p-6 shadow-[0_16px_45px_rgba(31,42,51,0.05)]"
            >
              <div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#5B8FA8]/25 bg-[#F6F9FB] text-[#5B8FA8]">
                  <B2BIcon
                    name={demoCardIcons[index] ?? "system"}
                    className="h-5 w-5"
                  />
                </span>
                <h2 className="mt-4 text-2xl font-semibold text-[#1F2A33]">
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

    </main>
  );
}
