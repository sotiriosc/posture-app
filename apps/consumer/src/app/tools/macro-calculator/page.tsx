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

      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 print:text-slate-600">
          Free tool
        </p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Macro Calculator for Lifters
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 print:text-slate-700">
          Enter your stats to get a daily calorie target and a macro split built
          for people who train — not a generic weight-loss calculator. Moderate
          fat, high carbs, high protein: enough fuel to lift hard and enough
          protein to actually keep the muscle you build.
        </p>

        <div className="mt-8 print:hidden">
          <MacroCalculatorClient />
        </div>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-slate-300 print:text-slate-800">
          <section>
            <h2 className="text-lg font-semibold text-white print:text-black">
              Why moderate fat, high carb, high protein for lifters
            </h2>
            <p className="mt-2">
              Most generic macro calculators split calories the same way
              whether you sit at a desk all day or squat three times a week.
              That&apos;s the wrong starting point if you train. A lifter&apos;s
              macro priorities are different, in a specific order: protein
              first, because it&apos;s the one macro you can&apos;t make up for
              later — miss it consistently and you leave muscle on the table no
              matter how well the rest of your training goes. Carbs second,
              because glycogen is what actually fuels a heavy set of five and a
              hard finisher at the end of a session; starve that and every
              session past the first gets worse, not better. Fat last, kept
              moderate rather than cut to the bone, because you need enough of
              it for hormone production and joint health, but every gram of fat
              you don&apos;t need is a gram of carbs you&apos;re not eating.
            </p>
            <p className="mt-2">
              Concretely, that&apos;s why this calculator sets protein directly
              from your bodyweight — about 0.8 grams per pound — instead of as
              a percentage of calories. A percentage-based protein target
              quietly shortchanges you the moment you&apos;re in a calorie
              deficit, which is exactly the situation where protein matters
              most for holding onto muscle. Fat is set at a flat, moderate 25%
              of your total calories — enough, not more. Whatever&apos;s left
              goes to carbs, and for almost anyone training seriously at these
              calorie levels, that ends up being your single largest macro by
              a wide margin. That&apos;s not an accident; it&apos;s the point.
              Carbs are the macro most people cut first when they decide to
              &quot;eat clean,&quot; and they&apos;re usually the macro that was
              actually driving their training performance.
            </p>
            <p className="mt-2">
              None of this is exotic. It&apos;s the same basic split I use with
              in-person clients before we get into anything more individualized
              — a sane, defensible starting point, not a finished plan. Track
              it for two weeks, see how your training and your bodyweight trend
              actually respond, and adjust from there. No calculator, mine
              included, knows your body better than two weeks of your own data
              does.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white print:text-black">
              Hydration, salt, and muscle performance
            </h2>
            <p className="mt-2">
              Most people training hard are quietly under-hydrated and
              under-salted at the same time, and both hurt performance in ways
              that get blamed on everything except the actual cause. A two
              percent drop in body water is enough to measurably reduce
              strength output and blow up your perceived effort on the same
              weight you moved easily last week. If a session that should feel
              like a 7 out of 10 suddenly feels like a 9, check your water
              intake before you touch your program.
            </p>
            <p className="mt-2">
              Salt matters just as much and gets a worse reputation than it
              deserves. Sodium is what actually lets you retain the water
              you&apos;re drinking and keeps nerve signaling — the thing that
              tells a muscle fiber to fire — working properly. If you sweat
              heavily, train in the heat, or you&apos;ve cut processed food
              hard enough to also cut most of your sodium along with it,
              plain water alone won&apos;t fix how flat you feel. A pinch of
              salt in your water, or simply not being afraid of salting your
              food around training days, is a bigger lever for most lifters
              than another supplement bottle.
            </p>
            <p className="mt-2">
              Simple targets: water intake in ounces at roughly half your
              bodyweight in pounds as a daily floor, more on training days and
              in heat, and don&apos;t treat electrolytes as an endurance-sport
              problem only — a hard 45-minute lifting session in a warm gym
              adds up.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white print:text-black">
              Creatine: what it does, how to use it
            </h2>
            <p className="mt-2">
              Creatine monohydrate is the most well-studied supplement in
              sports nutrition, and the evidence behind it isn&apos;t close to
              controversial: it works, it&apos;s safe for long-term use in
              healthy adults, and it&apos;s cheap. It tops up phosphocreatine
              stores in muscle, which is what your body uses to rapidly
              regenerate ATP during short, hard efforts — the exact energy
              system a heavy set of three to eight reps runs on. The practical
              result over weeks of consistent use is usually a small but real
              bump in strength and the ability to squeeze out another rep or
              two before failure, which compounds into more total training
              volume over a training block.
            </p>
            <p className="mt-2">
              How to actually use it: 3 to 5 grams of creatine monohydrate,
              every day, including rest days — consistency is what fills the
              tank, not timing it around your workout. You don&apos;t need a
              loading phase; it just gets you saturated a few days faster, and
              most people don&apos;t notice the difference either way. You
              don&apos;t need a fancy buffered or micronized version either —
              plain monohydrate is the form almost every study behind this is
              built on. Take it with water, at whatever time of day you&apos;ll
              actually remember to take it, and expect a small amount of water
              retention inside the muscle itself; that&apos;s the mechanism
              working, not bloating.
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
