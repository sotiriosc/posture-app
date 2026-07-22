import type { Metadata } from "next";
import Link from "next/link";
import Footer, { SUPPORT_EMAIL } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — Praxis",
  description: "The terms that govern your use of Praxis.",
};

export default function TermsPage() {
  return (
    <div className="app-bg min-h-screen text-white">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-400">
          By using Praxis you agree to these terms.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-300">
          <section className="rounded-2xl border border-amber-300/30 bg-amber-500/10 p-5 text-amber-100">
            <h2 className="text-lg font-semibold text-amber-50">
              Not a medical device
            </h2>
            <p className="mt-2">
              Praxis is not a medical device and does not diagnose, treat, or
              prevent injury. Its posture observations and training
              recommendations are for general fitness and educational purposes.
              Consult a qualified professional for medical decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Your account</h2>
            <p className="mt-2">
              You are responsible for keeping your login credentials secure and
              for the activity that occurs under your account. Provide accurate
              information so the coaching engine can program appropriately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">
              Acceptable use
            </h2>
            <p className="mt-2">
              Train within your own capabilities. Stop any exercise that causes
              pain and seek professional guidance. Do not misuse, reverse
              engineer, or attempt to disrupt the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">
              Subscriptions and billing
            </h2>
            <p className="mt-2">
              Paid subscriptions are billed through Stripe on the cadence shown at
              checkout. You can manage or cancel your subscription at any time.
              Refunds are governed by our{" "}
              <Link className="underline hover:text-white" href="/refunds">
                refund policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">
              Governing law
            </h2>
            <p className="mt-2">
              {/* TODO(sotirios): SRD-6.2-d — confirm operating legal entity name. */}
              These terms are governed by the laws of the Province of Ontario,
              Canada, where Praxis (operated in partnership with Motion Care) is
              based.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Contact</h2>
            <p className="mt-2">
              Questions about these terms? Reach us at{" "}
              <a
                className="underline hover:text-white"
                href={`mailto:${SUPPORT_EMAIL}`}
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-10">
          <Link
            className="text-xs font-semibold text-slate-400 underline hover:text-white"
            href="/"
          >
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
