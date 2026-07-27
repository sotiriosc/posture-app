import type { Metadata } from "next";
import Link from "next/link";
import Footer, { SUPPORT_EMAIL } from "@/components/Footer";
import {
  onboardingGuides,
  onboardingPageOrder,
} from "@/components/onboarding/onboardingConfig";

export const metadata: Metadata = {
  title: "Help & FAQ — Praxis",
  description: "How Praxis works, screen by screen.",
};

/**
 * Phase 6c, Commit 3 — no FAQ existed anywhere in the app, gated or
 * otherwise. Rather than inventing new copy, this consolidates the existing
 * per-page onboarding guides (the single source of truth for "how this
 * screen works") into one page reachable from the main nav without needing
 * to visit every screen first.
 *
 * Reading shell matches /tools/macro-calculator: body copy sits on opaque
 * panels so slate text stays legible over the app background photo wash.
 */
export default function FaqPage() {
  return (
    <div className="app-bg min-h-screen text-white">
      <main className="relative z-10 mx-auto max-w-3xl px-4 py-10 pb-[calc(1.25rem+120px+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-12 md:pb-12">
        <header className="rounded-2xl border border-slate-500/35 bg-slate-950/88 px-4 py-5 shadow-[0_18px_50px_rgba(2,8,23,0.45)] backdrop-blur-md sm:px-6 sm:py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/90">
            Help
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
            Help &amp; FAQ
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-100 sm:text-sm">
            How Praxis works, screen by screen — the same guides that appear
            when you tap Guide in the app, gathered in one place.
          </p>
        </header>

        <div className="mt-6 space-y-4 sm:mt-10 sm:space-y-5">
          {onboardingPageOrder.map((key) => {
            const guide = onboardingGuides[key];
            return (
              <section
                key={key}
                className="rounded-2xl border border-slate-500/35 bg-slate-950/90 px-4 py-5 text-[15px] leading-relaxed text-slate-100 shadow-[0_14px_40px_rgba(2,8,23,0.4)] backdrop-blur-md sm:px-6 sm:py-6 sm:text-sm"
              >
                <h2 className="text-lg font-semibold text-white">
                  {guide.title}
                </h2>
                <div className="mt-2.5 space-y-3">
                  {guide.sections.map((section, index) => {
                    if (section.type === "text") {
                      return <p key={`text-${index}`}>{section.text}</p>;
                    }
                    if (section.type === "bullets") {
                      return (
                        <div key={`bullets-${index}`}>
                          {section.title ? (
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200/80">
                              {section.title}
                            </p>
                          ) : null}
                          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-slate-100">
                            {section.items.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    }
                    return (
                      <div key={`steps-${index}`}>
                        {section.title ? (
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200/80">
                            {section.title}
                          </p>
                        ) : null}
                        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-slate-100">
                          {section.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ol>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="ui-card ui-soft-surface-raised mt-6 rounded-2xl border border-slate-500/35 bg-slate-950/90 p-5 sm:mt-10 sm:p-6">
          <p className="ui-kicker">Need something else?</p>
          <p className="mt-2 text-base font-semibold text-white">
            Back to Praxis, or open Support if you still have a question.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-blue-300/45 bg-[linear-gradient(135deg,#38BDF8_0%,#2563EB_100%)] px-6 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(37,99,235,0.32)] transition hover:-translate-y-px hover:brightness-105"
            >
              ← Back to Praxis
            </Link>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-400/35 bg-slate-900/45 px-6 text-sm font-semibold text-slate-200 transition hover:-translate-y-px hover:bg-slate-800/55"
            >
              Contact support
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
