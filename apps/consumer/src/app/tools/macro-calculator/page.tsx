import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import MacroCalculatorClient from "./MacroCalculatorClient";

/**
 * Phase 6f, Commit 9 — public marketing page at /tools/macro-calculator.
 *
 * Per SR-6f-nutrition-amendment (docs/engine-decisions.md): this is a
 * marketing tool, not an app feature. It is a public, unauthenticated route
 * (outside middleware.ts's matcher — see ED-6f.9), is not linked from any
 * authenticated in-app screen, and creates no user-tracked nutrition data —
 * the calculator is pure client-side math with no persistence and no API
 * calls. Its purpose is organic search traffic acquisition via long-tail
 * fitness-nutrition keywords, with a soft conversion path into the actual
 * product (the assessment).
 */

const PAGE_TITLE = "Free Macro Calculator for Lifters";
const PAGE_DESCRIPTION =
  "A free macro calculator built for people who train: daily calories plus a high-carb, high-protein, moderate-fat split. Includes coaching notes on hydration, salt, and creatine.";
const PAGE_PATH = "/tools/macro-calculator";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    type: "article",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_PATH,
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Praxis Macro Calculator",
  applicationCategory: "HealthApplication",
  operatingSystem: "Any (web browser)",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description: PAGE_DESCRIPTION,
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Macro Calculator for Lifters: Calories, Hydration, and Creatine",
  description: PAGE_DESCRIPTION,
  author: {
    "@type": "Person",
    name: "Sotirios",
  },
  publisher: {
    "@type": "Organization",
    name: "Praxis",
  },
};

export default function MacroCalculatorPage() {
  return (
    <div className="app-bg min-h-screen text-white print:bg-white print:text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <main className="mx-auto max-w-3xl px-6 py-12 pb-[calc(1.25rem+120px+env(safe-area-inset-bottom,0px))] md:pb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 print:text-slate-600">
          Free tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Macro Calculator for Lifters
        </h1>
        {/* Phase 6i Commit 2 — slate-200 clears AA against app-bg photo wash. */}
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200 print:text-slate-700">
          Enter your stats to get a daily calorie target and a macro split built
          for people who train — not a generic weight-loss calculator. Moderate
          fat, high carbs, high protein: enough fuel to lift hard and enough
          protein to actually keep the muscle you build.
        </p>

        <div className="mt-8 print:hidden">
          <MacroCalculatorClient />
        </div>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-slate-200 print:text-slate-800">
          <section>
            <h2 className="text-lg font-semibold text-white print:text-black">
              Why moderate fat, high carb, high protein for lifters
            </h2>
            <p className="mt-2">
              Lifters need a different split than desk workers: protein first
              (you can&apos;t make it up later), carbs second (they fuel hard
              sets), fat last and moderate (hormones and joints — not more).
            </p>
            <p className="mt-2">
              That&apos;s why protein is set from bodyweight (~0.8 g per lb),
              not as a percent of calories — percentages quietly underfeed
              protein in a deficit, when you need it most. Fat stays at 25%;
              the rest goes to carbs so training stays sharp. Don&apos;t cut
              carbs first when you &quot;eat clean.&quot;
            </p>
            <p className="mt-2">
              It&apos;s a sane starting point, not a finished plan. Run it two
              weeks, then adjust from your own training and weight data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white print:text-black">
              Hydration, salt, and muscle performance
            </h2>
            <p className="mt-2">
              Under-hydrated and under-salted is the quiet performance killer.
              A ~2% drop in body water makes the same weight feel harder — if a
              session jumps from a 7 to a 9, check water before you rewrite the
              program.
            </p>
            <p className="mt-2">
              Sodium keeps that water where it belongs and keeps nerves firing.
              Sweaty sessions, heat, or cutting processed food can wipe sodium
              too — plain water alone won&apos;t fix feeling flat. Salt food
              around training; it beats most supplement bottles.
            </p>
            <p className="mt-2">
              Floor: water ounces ≈ half your bodyweight in pounds, more on
              training days and in heat. Electrolytes aren&apos;t just for
              endurance sports.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white print:text-black">
              Creatine: what it does, how to use it
            </h2>
            <p className="mt-2">
              Creatine monohydrate is the most studied sports supplement for a
              reason: it works, it&apos;s safe for healthy adults, and it&apos;s
              cheap. It tops up phosphocreatine so short, hard sets regenerate
              ATP faster — usually a small real strength bump and an extra rep
              or two over weeks.
            </p>
            <p className="mt-2">
              Use 3–5 g every day, rest days included. No loading phase
              required, no fancy form required — plain monohydrate. Take it
              whenever you&apos;ll remember; mild muscle water retention means
              it&apos;s working, not bloating.
            </p>
          </section>
        </div>

        <div className="ui-card ui-soft-surface-raised mt-12 rounded-2xl p-6 print:hidden">
          <p className="ui-kicker">Next step</p>
          <p className="mt-2 text-base font-semibold text-white">
            Praxis builds a movement-and-strength plan around your body&apos;s
            actual patterns.
          </p>
          <div className="mt-4">
            <Link href="/assessment">
              <Button className="h-11 px-6 text-sm font-semibold">
                Try the assessment →
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
