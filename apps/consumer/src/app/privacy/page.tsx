import type { Metadata } from "next";
import Link from "next/link";
import Footer, { SUPPORT_EMAIL } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Praxis",
  description:
    "How Praxis handles your data: client-side pose analysis, hosted account storage, and no third-party ad networks.",
};

export default function PrivacyPage() {
  return (
    <div className="app-bg min-h-screen text-white">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-400">
          Last updated on launch. This policy describes how Praxis actually
          behaves — not a template.
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="text-lg font-semibold text-white">
              Posture photos never leave your device
            </h2>
            <p className="mt-2">
              Praxis analyzes posture with a pose-detection model that runs
              entirely in your browser (TensorFlow.js). The photos you capture
              for a posture assessment are processed on your device to extract
              keypoint measurements. The images themselves are not uploaded to
              our servers. Only the derived measurements and observations you
              choose to save become part of your account record.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">
              What we store, and where
            </h2>
            <p className="mt-2">
              Your account details, training program, session logs, and progress
              are stored in a hosted PostgreSQL database (operated on Neon). This
              lets your plan sync across devices and persist between sessions. We
              store only what the app needs to coach you.
            </p>
            <p className="mt-2">
              {/* TODO(sotirios): SRD-6.2-a — ratify data retention window before launch. */}
              When you request deletion of your account, we remove your personal
              data within 30 days of the request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Payments</h2>
            <p className="mt-2">
              Subscriptions are processed by Stripe. Your card details are handled
              by Stripe and are never stored on Praxis servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">
              No third-party ad networks
            </h2>
            <p className="mt-2">
              Praxis does not embed advertising SDKs and does not sell your data.
              For product analytics we use Plausible, a privacy-respecting,
              cookieless service that reports aggregated usage statistics only —
              no personal tracking, no cross-site profiles.
            </p>
            <p className="mt-2">
              {/* TODO(sotirios): SRD-6.2-b — confirm EU/UK cookie-consent scope with counsel. */}
              Praxis uses a single first-party session cookie to keep you signed
              in. It is essential to the service and is not used for tracking.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">
              Your decision log is yours
            </h2>
            <p className="mt-2">
              Every recommendation Praxis makes is logged with the reasoning
              behind it. You can request a full export of your decision log at any
              time by emailing{" "}
              <a
                className="underline hover:text-white"
                href={`mailto:${SUPPORT_EMAIL}`}
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">Contact</h2>
            <p className="mt-2">
              Questions about your privacy? Reach us at{" "}
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
