import type { Metadata } from "next";
import Link from "next/link";
import Footer, { SUPPORT_EMAIL } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — Praxis for Gyms",
  description: "The terms that govern gym and operator use of Praxis.",
};

export default function TermsPage() {
  return (
    <div className="gym-b2b-page min-h-screen bg-[#F6F9FB] text-[#5F6B75]">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B8FA8]">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#1F2A33]">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-[#5F6B75]">
          By using Praxis for Gyms you agree to these terms.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-[#5F6B75]">
          <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-900">
            <h2 className="text-lg font-semibold text-amber-900">
              Not a medical device
            </h2>
            <p className="mt-2">
              Praxis is not a medical device and does not diagnose, treat, or
              prevent injury. Its posture observations and training
              recommendations are for general fitness and educational purposes.
              Operators and members should consult a qualified professional for
              medical decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1F2A33]">
              Operator responsibilities
            </h2>
            <p className="mt-2">
              Gym operators are responsible for the accounts they administer and
              for using member progression data solely to support coaching within
              their existing membership relationship. Do not export or repurpose
              member data outside that relationship.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1F2A33]">
              Acceptable use
            </h2>
            <p className="mt-2">
              Members should train within their capabilities and stop any exercise
              that causes pain. Do not misuse, reverse engineer, or attempt to
              disrupt the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1F2A33]">
              Subscriptions and billing
            </h2>
            <p className="mt-2">
              Paid plans are billed through Stripe on the cadence shown at
              checkout. Refunds are governed by our{" "}
              <Link className="underline hover:text-[#1F2A33]" href="/refunds">
                refund policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1F2A33]">
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
            <h2 className="text-lg font-semibold text-[#1F2A33]">Contact</h2>
            <p className="mt-2">
              Questions about these terms? Reach us at{" "}
              <a
                className="underline hover:text-[#1F2A33]"
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
            className="text-xs font-semibold text-[#5B8FA8] underline hover:text-[#1F2A33]"
            href="/pilot"
          >
            Back to Praxis for Gyms
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
