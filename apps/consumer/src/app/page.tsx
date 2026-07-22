import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import OnboardingInfoButton from "@/components/onboarding/OnboardingInfoButton";
import Footer from "@/components/Footer";

export default async function Home() {
  const systemSteps = [
    "Analyze your posture and training inputs",
    "Build a weekly plan around your current capacity",
    "Adapt the plan as your execution improves",
  ];

  return (
    <div className="hero-bg min-h-screen text-white">
      <div className="ui-shell flex max-w-7xl flex-col py-8 sm:py-12 lg:py-16">
        <header className="flex flex-wrap items-center justify-center gap-4 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="flex items-center md:justify-self-start">
            <Image
              src="/icons/praxis-logo-full.png"
              alt="Praxis"
              width={440}
              height={132}
              className="h-12 w-[210px] object-cover object-center sm:h-14 sm:w-[260px] lg:h-16 lg:w-[320px]"
              priority
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:justify-self-center">
            <span className="hero-pill rounded-full px-3 py-1 text-slate-100">
              Praxis Movement System
            </span>
            <span className="hero-pill rounded-full px-3 py-1 text-slate-200">
              Structured. Adaptive. Focused.
            </span>
          </div>
          <div aria-hidden="true" className="hidden md:block" />
        </header>

        <main className="flex flex-1 items-center justify-center py-12 lg:py-16">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-9 sm:gap-11">
            <section
              className="w-full text-center"
              style={{
                animation: "slideUpIn 300ms cubic-bezier(0.2, 0.75, 0.2, 1) both",
              }}
            >
              <p className="text-xs font-semibold uppercase text-slate-200">
                Praxis Movement Performance
              </p>
              <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.25rem]">
                Train with intent. Move better every week.
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base text-slate-100 sm:text-lg">
                Build a posture-informed training plan that keeps the next session clear.
              </p>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
                Your plan evolves based on your execution, recovery, and movement quality.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
                <Link href="/assessment">
                  <Button className="h-12 min-w-[220px] px-7 text-sm font-semibold shadow-[0_12px_28px_rgba(14,165,233,0.28)]">
                    Start assessment →
                  </Button>
                </Link>
                <Link href="/questionnaire">
                  <Button
                    variant="secondary"
                    className="h-9 px-4 text-xs font-medium text-slate-200"
                  >
                    Answer profile instead
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-300">
                Start with photos or answer the profile questions first. Both paths lead to your plan.
              </p>
            </section>

            <section className="ui-soft-surface w-full rounded-lg px-5 py-6 sm:px-6 sm:py-7">
              <div className="flex flex-wrap items-end justify-center gap-3 text-center sm:justify-between sm:text-left">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-300">
                    Your first plan takes less than 60 seconds.
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    How Praxis builds your plan
                  </h2>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 items-stretch gap-3 text-sm text-slate-100 md:grid-cols-3">
                {systemSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex h-full min-h-[128px] flex-col justify-center rounded-lg border border-slate-400/18 bg-slate-950/42 px-5 py-5 text-center sm:text-left"
                    style={{
                      animation: "slideUpIn 300ms ease-out both",
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <p className="text-[10px] font-semibold uppercase text-slate-400">
                      Step {index + 1}
                    </p>
                    <p className="mt-3 text-base leading-6 text-slate-100">{step}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-center text-sm text-slate-200">
                A clear starting point today. A smarter plan as your history grows.
              </p>
            </section>
          </div>
        </main>
      </div>
      <OnboardingInfoButton onboardingKey="home" />
      <Footer />
    </div>
  );
}
