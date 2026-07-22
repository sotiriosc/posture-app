import Link from "next/link";

export const SUPPORT_EMAIL = "support@praxis.app";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-8 text-xs text-slate-400">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold uppercase tracking-[0.2em] text-slate-500">
          Praxis
        </p>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link className="transition hover:text-slate-200" href="/privacy">
            Privacy
          </Link>
          <Link className="transition hover:text-slate-200" href="/terms">
            Terms
          </Link>
          <Link className="transition hover:text-slate-200" href="/refunds">
            Refunds
          </Link>
          <a
            className="transition hover:text-slate-200"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            Support
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-4 max-w-4xl text-[11px] leading-relaxed text-slate-500">
        Praxis is not a medical device and does not diagnose, treat, or prevent
        injury. Consult a qualified professional for medical decisions.
      </p>
    </footer>
  );
}
