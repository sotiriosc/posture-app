import type { Metadata } from "next";
import Link from "next/link";
import Footer, { SUPPORT_EMAIL } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Refund Policy — Praxis for Gyms",
  description: "14-day full refund on any subscription, no questions asked.",
};

export default function RefundsPage() {
  return (
    <div className="gym-b2b-page min-h-screen bg-[#F6F9FB] text-[#5F6B75]">
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5B8FA8]">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[#1F2A33]">
          Refund Policy
        </h1>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-[#5F6B75]">
          <section>
            <h2 className="text-lg font-semibold text-[#1F2A33]">
              14-day full refund, no questions asked
            </h2>
            <p className="mt-2">
              If Praxis for Gyms isn&apos;t right for your facility, email us
              within 14 days of your purchase and we&apos;ll refund it in full. No
              forms, no friction, no explanation required.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1F2A33]">
              How to request
            </h2>
            <p className="mt-2">
              Send a note to{" "}
              <a
                className="underline hover:text-[#1F2A33]"
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
            <h2 className="text-lg font-semibold text-[#1F2A33]">
              After the 14-day window
            </h2>
            <p className="mt-2">
              You can cancel at any time to stop future billing. Cancelling ends
              renewal at the close of your current billing period; access
              continues until then.
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
