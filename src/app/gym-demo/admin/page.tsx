import Link from "next/link";
import { demoGym } from "@/lib/gymSaas/demoGym";

const setupSteps = [
  "Create gym profile and location",
  "Add equipment inventory",
  "Choose brand colors and logo",
  "Generate member invite QR code",
  "Review member activity and PT opportunities",
];

const mockMetrics = [
  { label: "Trial members onboarded", value: "42" },
  { label: "Plans generated", value: "118" },
  { label: "Equipment substitutions", value: "31" },
  { label: "PT-ready member signals", value: "14" },
];

export default function GymAdminDemoPage() {
  return (
    <main className="min-h-screen bg-[#F6F9FB] text-[#1F2A33]">
      <section className="border-b border-[#E3E9EE] bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/gym-demo" className="text-sm font-semibold text-[#5B8FA8]">
            ← Back to gym demo
          </Link>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#5B8FA8]">
            Gym owner dashboard preview
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Build the app around one location first.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5F6B75]">
                This screen previews how a gym owner would set up their facility, equipment, branding, and member invite flow before the engine generates programs.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[#E3E9EE] bg-[#F6F9FB] p-5">
              <p className="text-sm font-semibold text-[#5B8FA8]">Active location</p>
              <h2 className="mt-2 text-2xl font-semibold">{demoGym.name}</h2>
              <p className="mt-2 text-sm text-[#5F6B75]">{demoGym.location}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-[1.5rem] border border-[#E3E9EE] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Setup checklist</h2>
          <div className="mt-6 space-y-4">
            {setupSteps.map((step, index) => (
              <div key={step} className="flex gap-3">
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[#5B8FA8] text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-6 text-[#5F6B75]">{step}</p>
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-[1.5rem] border border-[#E3E9EE] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5B8FA8]">Equipment map</p>
                <h2 className="mt-2 text-2xl font-semibold">What this gym can actually support</h2>
              </div>
              <span className="rounded-full bg-[#F6F9FB] px-3 py-1 text-xs font-semibold text-[#5F6B75]">
                {demoGym.equipment.length} categories
              </span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {demoGym.equipment.map((item) => (
                <div key={item.name} className="rounded-[1.25rem] border border-[#E3E9EE] bg-[#F6F9FB] p-4">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="mt-1 text-sm text-[#5F6B75]">{item.quantity}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[#5B8FA8]">{item.category}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[#E3E9EE] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5B8FA8]">Owner signals</p>
            <h2 className="mt-2 text-2xl font-semibold">Simple proof that the system is being used</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              {mockMetrics.map((metric) => (
                <div key={metric.label} className="rounded-[1.25rem] border border-[#E3E9EE] bg-[#F6F9FB] p-4">
                  <p className="text-3xl font-semibold">{metric.value}</p>
                  <p className="mt-2 text-xs leading-5 text-[#5F6B75]">{metric.label}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
