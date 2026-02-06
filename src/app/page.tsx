import Link from "next/link";
import ContinueProgramCTA from "@/components/ContinueProgramCTA";

export default function Home() {
  return (
    <div className="hero-bg min-h-screen text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm font-semibold tracking-wide text-slate-100">
            Body Alignment Coach
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="hero-pill rounded-full px-3 py-1 text-slate-100">
              Strength • Mobility • Posture
            </span>
            <span className="hero-pill rounded-full px-3 py-1 text-slate-200">
              Private by design
            </span>
          </div>
          <Link
            href="/settings"
            className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
          >
            Settings
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center gap-10">
          <div className="hero-glass max-w-3xl rounded-[32px] p-8 sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
              Body alignment system
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Feel powerful, move clean, stand tall.
            </h1>
            <p className="mt-4 text-base text-slate-100 sm:text-lg">
              Build strength, restore balance, and refine posture with a plan
              tuned to your goals and photos — all processed on your device.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/assessment"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Start Assessment
              </Link>
              <Link
                href="/questionnaire"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white"
              >
                Skip to questionnaire
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              "Capture front, side, back photos",
              "Share strength, mobility, and pain goals",
              "Get a routine with cues and progression",
            ].map((text) => (
              <div
                key={text}
                className="hero-pill rounded-2xl p-4 text-sm text-slate-100"
              >
                {text}
              </div>
            ))}
          </div>
        </main>
      </div>
      <ContinueProgramCTA />
    </div>
  );
}
