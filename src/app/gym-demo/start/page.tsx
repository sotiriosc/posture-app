import type { Metadata } from "next";
import GymDemoHeader from "@/components/gym-demo/GymDemoHeader";
import DemoStartClient from "./DemoStartClient";

export const metadata: Metadata = {
  title: "Start Buyer Demo | Praxis for Gyms",
  description:
    "Start a fresh Praxis for Gyms buyer demo before entering the live member assessment flow.",
};

export default function GymDemoStartPage() {
  return (
    <main className="min-h-screen bg-[#F6F9FB] text-[#5F6B75]">
      <section className="border-b border-[#E3E9EE] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <GymDemoHeader activeHref="/gym-demo/member" />

          <div className="grid gap-8 py-10 lg:grid-cols-[0.9fr_0.72fr] lg:items-center lg:py-14">
            <div>
              <span className="text-sm font-semibold uppercase text-[#5B8FA8]">
                Fresh buyer demo
              </span>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-[#1F2A33] sm:text-5xl lg:text-6xl">
                Start the member flow with clean demo data.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5F6B75]">
                This resets only the known local Praxis demo state in this
                browser, enables buyer demo access, and sends you into the live
                member assessment flow.
              </p>
            </div>

            <DemoStartClient />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-12 sm:px-8 md:grid-cols-3 lg:px-10">
        {[
          "Clears prior profile answers",
          "Clears local photo status",
          "Clears saved local demo programs",
        ].map((item) => (
          <div
            key={item}
            className="rounded-lg border border-[#E3E9EE] bg-white px-5 py-4 text-sm font-semibold text-[#1F2A33] shadow-[0_16px_45px_rgba(31,42,51,0.05)]"
          >
            {item}
          </div>
        ))}
      </section>
    </main>
  );
}
