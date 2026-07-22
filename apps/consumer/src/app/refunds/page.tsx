import type { Metadata } from "next";
import Link from "next/link";
import Footer, { SUPPORT_EMAIL } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Refund Policy — Praxis",
  description: "14-day full refund on any subscription, no questions asked.",
};

export default function RefundsPage() {
  return (
    <div className="app-bg min-h-screen text-white">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Refund Policy</h1>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="text-lg font-semibold text-white">
              14-day full refund, no questions asked
            </h2>
            <p className="mt-2">
              If Praxis isn&apos;t right for you, email us within 14 days of your
              purchase and we&apos;ll refund it in full. No forms, no friction,
              no explanation required.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">How to request</h2>
            <p className="mt-2">
              Send a note to{" "}
              <a
                className="underline hover:text-white"
                href={`mailto:${SUPPORT_EMAIL}`}
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              from the email on your account. Refunds are issued to your original
              payment method through Stripe, typically within 5–10 business days
              depending on your bank.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white">
              After the 14-day window
            </h2>
            <p className="mt-2">
              You can cancel your subscription at any time to stop future billing.
              Cancelling ends renewal at the close of your current billing period;
              you keep access until then.
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
