import Link from "next/link";

export const SUPPORT_EMAIL = "support@praxis.app";

export default function Footer() {
  return (
    <footer className="border-t border-[#E3E9EE] bg-white px-6 py-8 text-xs text-[#5F6B75]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold uppercase tracking-[0.2em] text-[#5B8FA8]">
          Praxis for Gyms
        </p>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link className="transition hover:text-[#1F2A33]" href="/privacy">
            Privacy
          </Link>
          <Link className="transition hover:text-[#1F2A33]" href="/terms">
            Terms
          </Link>
          <Link className="transition hover:text-[#1F2A33]" href="/refunds">
            Refunds
          </Link>
          <a
            className="transition hover:text-[#1F2A33]"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            Support
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-4 max-w-7xl text-[11px] leading-relaxed text-[#5F6B75]">
        Praxis is not a medical device and does not diagnose, treat, or prevent
        injury. Consult a qualified professional for medical decisions.
      </p>
    </footer>
  );
}
