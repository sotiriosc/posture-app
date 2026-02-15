"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import {
  type OnboardingKey,
  type OnboardingGuide,
  onboardingGuides,
  markOnboardingPageSeen,
  shouldAutoOpenOnboarding,
} from "@/components/onboarding/onboardingConfig";

type OnboardingInfoButtonProps = {
  onboardingKey: OnboardingKey;
  autoOpen?: boolean;
};

const MOBILE_GUIDE_FOOTPRINT_PX = 72;

const isAutomationEnvironment = () => {
  if (process.env.NODE_ENV === "test") return true;
  if (typeof navigator === "undefined") return false;
  return Boolean((navigator as Navigator & { webdriver?: boolean }).webdriver);
};

export default function OnboardingInfoButton({
  onboardingKey,
  autoOpen = true,
}: OnboardingInfoButtonProps) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const panelSafeAreaStyle = useMemo(
    () =>
      ({
        "--guide-safe-inset": `${MOBILE_GUIDE_FOOTPRINT_PX}px`,
      }) as CSSProperties,
    []
  );
  const guide = useMemo<OnboardingGuide>(
    () => onboardingGuides[onboardingKey],
    [onboardingKey]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!autoOpen || isAutomationEnvironment()) {
      setReady(true);
      return;
    }
    const shouldAutoOpen = shouldAutoOpenOnboarding(onboardingKey);
    if (shouldAutoOpen) {
      const timer = window.setTimeout(() => {
        setOpen(true);
        setReady(true);
      }, 450);
      return () => window.clearTimeout(timer);
    }
    setReady(true);
  }, [autoOpen, onboardingKey]);

  const closeGuide = () => {
    markOnboardingPageSeen(onboardingKey);
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
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Onboarding guide"
            style={panelSafeAreaStyle}
            className="absolute inset-x-3 top-4 bottom-[calc(16px+var(--guide-safe-inset)+env(safe-area-inset-bottom,0px))] overflow-hidden rounded-2xl p-[2px] shadow-[0_22px_52px_rgba(2,132,199,0.3)] sm:inset-x-auto sm:top-auto sm:bottom-4 sm:right-4 sm:max-h-[calc(100vh-2rem)] sm:w-[min(92vw,560px)]"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-100 motion-safe:animate-spin"
              style={{
                animationDuration: "14s",
                background:
                  "conic-gradient(from 180deg at 50% 50%, rgba(125,211,252,.98), rgba(56,189,248,.52), rgba(59,130,246,.56), rgba(167,139,250,.56), rgba(125,211,252,.98))",
              }}
            />
            <div className="relative flex h-full min-h-0 flex-col rounded-2xl border border-slate-300/25 bg-slate-900/86 text-white sm:max-h-[calc(100vh-2rem)]">
              <header className="border-b border-slate-700/60 px-4 py-3 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                      Onboarding Guide
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-white">
                      {guide.title}
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

              <div
                className="min-h-0 flex-1 touch-pan-y space-y-5 overflow-y-auto overscroll-contain px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] text-sm text-slate-100 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-5 sm:pb-4"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {guide.sections.map((section, index) => {
                  if (section.type === "text") {
                    return (
                      <section
                        key={`text-${index}`}
                        className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3"
                      >
                        <p>{section.text}</p>
                      </section>
                    );
                  }
                  if (section.type === "bullets") {
                    return (
                      <section key={`bullets-${index}`}>
                        {section.title ? (
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                            {section.title}
                          </p>
                        ) : null}
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                          {section.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </section>
                    );
                  }
                  return (
                    <section key={`steps-${index}`}>
                      {section.title ? (
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                          {section.title}
                        </p>
                      ) : null}
                      <ol className="mt-2 list-decimal space-y-1 pl-5">
                        {section.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ol>
                    </section>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
