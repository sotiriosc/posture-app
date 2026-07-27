import type { Metadata } from "next";
import Link from "next/link";
import {
  onboardingGuides,
  onboardingPageOrder,
} from "@/components/onboarding/onboardingConfig";

export const metadata: Metadata = {
  title: "Help & FAQ — Praxis for Gyms",
  description: "How Praxis for Gyms works, screen by screen.",
};

/**
 * Phase 6c, Commit 3 — consolidates per-page onboarding guides into one
 * Help page. Card shells match the consumer FAQ readability treatment
 * (opaque panels, clearer hierarchy) while keeping the Gyms light theme.
 */
export default function FaqPage() {
  return (
    <div className="gym-b2b-page min-h-screen bg-[#F6F9FB] text-[#5F6B75]">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <header className="rounded-2xl border border-[#D7E3EA] bg-white px-4 py-5 shadow-[0_10px_30px_rgba(31,42,51,0.06)] sm:px-6 sm:py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B8FA8]">
            Help
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#1F2A33] sm:text-4xl">
            Help &amp; FAQ
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#5F6B75] sm:text-sm">
            How Praxis for Gyms works, screen by screen — the same guides that
            appear when you tap Guide in the app, gathered in one place.
          </p>
        </header>

        <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
          {onboardingPageOrder.map((key) => {
            const guide = onboardingGuides[key];
            return (
              <section
                key={key}
                className="rounded-2xl border border-[#D7E3EA] bg-white px-4 py-5 text-[15px] leading-relaxed text-[#5F6B75] shadow-[0_8px_24px_rgba(31,42,51,0.05)] sm:px-6 sm:py-6 sm:text-sm"
              >
                <h2 className="text-lg font-semibold text-[#1F2A33]">
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
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5B8FA8]">
                              {section.title}
                            </p>
                          ) : null}
                          <ul className="mt-2 list-disc space-y-1.5 pl-5">
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
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5B8FA8]">
                            {section.title}
                          </p>
                        ) : null}
                        <ol className="mt-2 list-decimal space-y-1.5 pl-5">
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

        <div className="mt-6 rounded-2xl border border-[#D7E3EA] bg-white p-5 shadow-[0_8px_24px_rgba(31,42,51,0.05)] sm:mt-8 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B8FA8]">
            Next step
          </p>
          <p className="mt-2 text-base font-semibold text-[#1F2A33]">
            Return to Praxis for Gyms when you&apos;re ready.
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-lg border border-[#5B8FA8]/35 bg-[#5B8FA8] px-5 text-sm font-semibold text-white transition hover:bg-[#4A7A92]"
            >
              ← Back to Praxis for Gyms
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
