import Link from "next/link";
import Image from "next/image";
import AuthControls from "@/components/AuthControls";
import Button from "@/components/ui/Button";
import OnboardingInfoButton from "@/components/onboarding/OnboardingInfoButton";

export default async function Home() {
  const systemSteps = [
    "Analyze your posture and training inputs",
    "Generate your weekly plan automatically",
    "Adapt your program as you progress",
  ];
  const panelWidthClass = "w-full max-w-xl lg:max-w-3xl xl:max-w-4xl";

  return (
    <div className="hero-bg min-h-screen text-white">
      <div className="ui-shell flex max-w-7xl flex-col py-8 sm:py-12 lg:py-16">
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
              Praxis Movement System
            </span>
            <span className="hero-pill rounded-full px-3 py-1 text-slate-200">
              Structured. Adaptive. Clear.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AuthControls />
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center gap-6 sm:gap-8 lg:gap-10">
          <div
            className={`hero-glass home-neon-border ${panelWidthClass} rounded-[28px] p-6 sm:p-8 lg:p-9`}
            style={{
              animation: "slideUpIn 300ms cubic-bezier(0.2, 0.75, 0.2, 1) both",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
              Praxis Corrective Performance System
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl lg:text-[3.25rem]">
              Train with intent. Move better every week.
            </h1>
            <p className="mt-4 text-base text-slate-100 sm:text-lg">
              This system identifies movement imbalances and guides your progress with structured corrective logic.
            </p>
            <p className="mt-2 text-sm text-slate-200 sm:text-base">
              Your plan evolves based on your execution, recovery, and movement quality.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:items-start">
              <Link href="/assessment">
                <Button className="h-12 min-w-[220px] px-7 text-sm font-semibold shadow-[0_12px_28px_rgba(14,165,233,0.28)] transition-transform duration-150 hover:scale-[1.02]">
                  Start Assessment →
                </Button>
              </Link>
              <Link href="/questionnaire">
                <Button
                  variant="secondary"
                  className="h-9 px-4 text-xs font-medium text-slate-200"
                >
                  Skip to questionnaire
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-xs text-slate-300">
              Built to help you improve posture, movement quality, and strength patterns over time.
            </p>
          </div>
          <p className={`${panelWidthClass} text-xs text-slate-300`}>
            Program generation takes less than 60 seconds.
          </p>

          <section className={`hero-pill home-neon-border ${panelWidthClass} rounded-2xl p-4 sm:p-5`}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
              How the system builds your program
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2.5 text-sm text-slate-100 md:auto-rows-fr md:grid-cols-3">
              {systemSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex h-full min-h-16 flex-col items-center justify-center rounded-xl bg-slate-950/25 px-3 py-2 text-center md:min-h-[108px]"
                  style={{
                    animation: "slideUpIn 300ms ease-out both",
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                    Step {index + 1}
                  </p>
                  <p className="mt-1 text-sm text-slate-100">{step}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-sm text-slate-100">
              No static workouts. The plan evolves with you.
            </p>
          </section>
        </main>
      </div>
      <OnboardingInfoButton onboardingKey="home" />
    </div>
  );
}
