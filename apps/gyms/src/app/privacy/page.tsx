import type { Metadata } from "next";
import Link from "next/link";
import Footer, { SUPPORT_EMAIL } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Praxis for Gyms",
  description:
    "How Praxis for Gyms handles member and operator data: client-side pose analysis, hosted storage, and no third-party ad networks.",
};

export default function PrivacyPage() {
  return (
    <div className="gym-b2b-page min-h-screen bg-[#F6F9FB] text-[#5F6B75]">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B8FA8]">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#1F2A33]">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-[#5F6B75]">
          Last updated on launch. This policy describes how Praxis for Gyms
          actually behaves — not a template.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-[#5F6B75]">
          <section>
            <h2 className="text-lg font-semibold text-[#1F2A33]">
              Posture photos never leave the device
            </h2>
            <p className="mt-2">
              Praxis analyzes posture with a pose-detection model that runs
              entirely in the browser (TensorFlow.js). Assessment photos are
              processed on-device to extract keypoint measurements; the images
              themselves are not uploaded to our servers. Only derived
              measurements that are saved become part of a member&apos;s record.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1F2A33]">
              What we store, and where
            </h2>
            <p className="mt-2">
              Member accounts, training programs, session logs, and progress are
              stored in a hosted PostgreSQL database (operated on Neon). Operators
              see member progression through their existing gym-membership
              relationship — Praxis introduces no personal identifiers beyond what
              the gym already holds.
            </p>
            <p className="mt-2">
              {/* TODO(sotirios): SRD-6.2-a — ratify data retention window before launch. */}
              When a member or operator requests deletion, we remove the relevant
              personal data within 30 days of the request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1F2A33]">Payments</h2>
            <p className="mt-2">
              Subscriptions are processed by Stripe. Card details are handled by
              Stripe and are never stored on Praxis servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1F2A33]">
              No third-party ad networks
            </h2>
            <p className="mt-2">
              Praxis does not embed advertising SDKs and does not sell member or
              operator data. For product analytics we use Plausible, a
              privacy-respecting, cookieless service that reports aggregated usage
              statistics only.
            </p>
            <p className="mt-2">
              {/* TODO(sotirios): SRD-6.2-b — confirm EU/UK cookie-consent scope with counsel. */}
              Praxis uses a single first-party session cookie to keep users signed
              in. It is essential to the service and is not used for tracking.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1F2A33]">
              Decision logs are exportable
            </h2>
            <p className="mt-2">
              Every recommendation is logged with the reasoning behind it. A full
              export of a member&apos;s decision log can be requested at any time
              by emailing{" "}
              <a
                className="underline hover:text-[#1F2A33]"
                href={`mailto:${SUPPORT_EMAIL}`}
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1F2A33]">Contact</h2>
            <p className="mt-2">
              Questions? Reach us at{" "}
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
