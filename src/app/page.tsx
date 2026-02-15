import Link from "next/link";
import Image from "next/image";
import AuthControls from "@/components/AuthControls";
import Button from "@/components/ui/Button";

export default async function Home() {
  return (
    <div className="hero-bg min-h-screen text-white">
      <div className="ui-shell flex max-w-6xl flex-col py-8 sm:py-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <Image
              src="/icons/praxis-logo-full.png"
              alt="Praxis"
              width={440}
              height={132}
              className="h-12 w-[210px] object-cover object-center sm:h-14 sm:w-[260px] lg:h-16 lg:w-[320px]"
              priority
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="hero-pill rounded-full px-3 py-1 text-slate-100">
              Praxis Personal Trainer App
            </span>
            <span className="hero-pill rounded-full px-3 py-1 text-slate-200">
              Structured. Adaptive. Clear.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AuthControls />
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center gap-10">
          <div className="hero-glass slide-up-in max-w-3xl rounded-[28px] p-7 sm:p-11">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
              Praxis Coaching System
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Train with intent. Move better every week.
            </h1>
            <p className="mt-4 text-base text-slate-100 sm:text-lg">
              A premium personal training flow focused on strength, posture, and
              performance. Built for clarity, progress, and consistent execution.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/assessment">
                <Button className="px-6 py-3">Start Assessment</Button>
              </Link>
              <Link href="/questionnaire">
                <Button variant="secondary" className="px-6 py-3">
                  Skip to questionnaire
                </Button>
              </Link>
            </div>
          </div>

          <section className="hero-pill slide-up-in w-full max-w-3xl rounded-2xl p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
              How it works
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-100 sm:grid-cols-3">
              {[
                "Assess: photos + questionnaire",
                "Generate: your weekly plan + phase",
                "Adapt: updates automatically as you progress",
              ].map((text) => (
                <p
                  key={text}
                  className="flex h-full min-h-11 items-center justify-center rounded-xl border border-slate-300/20 bg-slate-950/25 px-3 py-2 text-center"
                >
                  {text}
                </p>
              ))}
            </div>
            <p className="mt-3 text-center text-sm text-slate-100">
              Not static workouts — the plan evolves with you.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
