"use client";

import { useEffect, useMemo, useState } from "react";

type OnboardingInfoPage =
  | "home"
  | "assessment"
  | "questionnaire"
  | "results"
  | "session";

type OnboardingInfoButtonProps = {
  page: OnboardingInfoPage;
  autoOpen?: boolean;
};

type PageGuide = {
  heading: string;
  summary: string;
  pageSteps: string[];
};

const pageGuides: Record<OnboardingInfoPage, PageGuide> = {
  home: {
    heading: "Start here: what this system does",
    summary:
      "You are not getting a static template. The app analyzes inputs, builds a weekly structure, and updates your plan as you train.",
    pageSteps: [
      "Tap Start Assessment to begin posture + training baseline capture.",
      "Use Skip to questionnaire only if you already know your training inputs.",
      "Review How the system builds your program so you know what adapts over time.",
    ],
  },
  assessment: {
    heading: "Photo step: why it matters",
    summary:
      "Your photos help detect posture patterns and movement risks, so training emphasis and coaching cues can be more accurate.",
    pageSteps: [
      "Upload clear front/side photos in neutral posture.",
      "Continue to questionnaire to pair image signals with goals, experience, and equipment.",
      "You can move forward without photos, but recommendations are stronger with them.",
    ],
  },
  questionnaire: {
    heading: "Questionnaire step: decision inputs",
    summary:
      "This page sets your training constraints and capabilities. Those answers control weekly structure, exercise selection, and progression safety.",
    pageSteps: [
      "Complete goals, pain areas, experience level, equipment, and days per week.",
      "Generate your plan to produce the initial phase and schedule.",
      "If you change settings later, a new active plan is generated and progress restarts for that plan.",
    ],
  },
  results: {
    heading: "Results dashboard: your command center",
    summary:
      "This page shows today’s best action, your current phase status, and how the system is adapting from logs and feedback.",
    pageSteps: [
      "Use the primary session CTA first for today’s execution.",
      "Use Week View for day-by-day context and selected-day details.",
      "Review Coach Summary and System Adjustments to understand what changed and why.",
    ],
  },
  session: {
    heading: "Session flow: guided execution",
    summary:
      "This page is built to reduce friction. You always see where you are, what to do next, and how to log quickly with minimal taps.",
    pageSteps: [
      "Follow the sticky header for phase/day/exercise orientation.",
      "Use the timer + cues, complete sets, and log quality/pain signals.",
      "Finish session to update progress and feed adaptation into future plan updates.",
    ],
  },
};

const globalFeatures = [
  "Adaptive program generation from your inputs and ongoing logs",
  "Week/day structure with clear next action",
  "Session feedback and pain signals that influence safer substitutions",
  "Persistent draft resume so unfinished sessions can continue",
];

const automaticInputFlow = [
  "In session logging, Enter moves focus Weight → Reps → RPE → first incomplete set.",
  "Completing Set 1 auto-focuses the next incomplete set.",
  "When all sets are complete, focus shifts to workout feedback, then Next Exercise.",
  "On phones, the keyboard Next/Done action follows the same order for faster logging.",
];

const mobileTips = [
  "The help button stays compact in the corner so it never blocks the main CTA.",
  "The guide opens as a bottom sheet on mobile for thumb-friendly reading.",
  "Touch targets stay large, and you can dismiss by tapping outside or Close.",
];

const seenKey = (page: OnboardingInfoPage) => `onboarding_guide_seen_v1_${page}`;

export default function OnboardingInfoButton({
  page,
  autoOpen = true,
}: OnboardingInfoButtonProps) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const guide = useMemo(() => pageGuides[page], [page]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isAutomatedBrowser = Boolean((navigator as Navigator & { webdriver?: boolean }).webdriver);
    if (!autoOpen || isAutomatedBrowser) {
      setReady(true);
      return;
    }
    const hasSeen = localStorage.getItem(seenKey(page)) === "1";
    if (!hasSeen) {
      const timer = window.setTimeout(() => {
        setOpen(true);
        setReady(true);
      }, 450);
      return () => window.clearTimeout(timer);
    }
    setReady(true);
  }, [autoOpen, page]);

  const closeGuide = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(seenKey(page), "1");
    }
    setOpen(false);
  };

  if (!ready) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open onboarding guide"
        className="group fixed bottom-4 left-4 z-40 min-h-11 overflow-hidden rounded-full p-[1px] shadow-[0_10px_24px_rgba(2,132,199,0.26)] transition-transform duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 sm:left-auto sm:right-4"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full opacity-90 motion-safe:animate-spin"
          style={{
            animationDuration: "8s",
            background:
              "conic-gradient(from 180deg at 50% 50%, rgba(125,211,252,.65), rgba(56,189,248,.28), rgba(167,139,250,.38), rgba(125,211,252,.65))",
          }}
        />
        <span className="relative inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-950/80 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition group-hover:bg-slate-900/85">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-200/70 text-[11px]">
            i
          </span>
          <span className="hidden sm:inline">Guide</span>
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close onboarding guide"
            onClick={closeGuide}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px]"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Onboarding guide"
            className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-2xl p-[1px] shadow-[0_20px_50px_rgba(2,132,199,0.25)] sm:inset-x-auto sm:bottom-20 sm:right-6 sm:w-[min(92vw,560px)] sm:rounded-2xl"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-t-2xl opacity-85 motion-safe:animate-spin sm:rounded-2xl"
              style={{
                animationDuration: "14s",
                background:
                  "conic-gradient(from 180deg at 50% 50%, rgba(125,211,252,.65), rgba(56,189,248,.24), rgba(99,102,241,.28), rgba(167,139,250,.28), rgba(125,211,252,.65))",
              }}
            />
            <div className="relative h-full rounded-t-2xl border border-slate-300/25 bg-slate-950/95 text-white sm:rounded-2xl">
              <header className="border-b border-slate-700/60 px-4 py-3 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                      Onboarding Guide
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-white">
                      {guide.heading}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeGuide}
                    className="rounded-full border border-slate-500/60 px-3 py-1 text-xs font-semibold text-slate-100 hover:bg-slate-800/80"
                  >
                    Close
                  </button>
                </div>
              </header>

              <div className="space-y-5 overflow-y-auto px-4 py-4 text-sm text-slate-100 sm:max-h-[74vh] sm:px-5">
                <section className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">
                  <p>{guide.summary}</p>
                </section>

                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                    What To Do On This Page
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {guide.pageSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Full Feature Map
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {globalFeatures.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Automatic Input Flow
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {automaticInputFlow.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                    Mobile Usage Notes
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {mobileTips.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
