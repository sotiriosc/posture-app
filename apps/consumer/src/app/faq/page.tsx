import type { Metadata } from "next";
import Link from "next/link";
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
 */
export default function FaqPage() {
  return (
    <div className="app-bg min-h-screen text-white">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Help
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Help &amp; FAQ</h1>
        <p className="mt-2 text-sm text-slate-400">
          How Praxis works, screen by screen.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-300">
          {onboardingPageOrder.map((key) => {
            const guide = onboardingGuides[key];
            return (
              <section key={key}>
                <h2 className="text-lg font-semibold text-white">
                  {guide.title}
                </h2>
                <div className="mt-2 space-y-3">
                  {guide.sections.map((section, index) => {
                    if (section.type === "text") {
                      return <p key={`text-${index}`}>{section.text}</p>;
                    }
                    if (section.type === "bullets") {
                      return (
                        <div key={`bullets-${index}`}>
                          {section.title ? (
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                              {section.title}
                            </p>
                          ) : null}
                          <ul className="mt-2 list-disc space-y-1 pl-5">
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
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {section.title}
                          </p>
                        ) : null}
                        <ol className="mt-2 list-decimal space-y-1 pl-5">
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

        <div className="mt-10">
          <Link
            href="/"
            className="text-sm font-semibold text-sky-300 hover:text-sky-200"
          >
            ← Back to Praxis
          </Link>
        </div>
      </main>
    </div>
  );
}
